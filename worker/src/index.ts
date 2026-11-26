/*
 * ivanbogush.ru as a Cloudflare Worker: the site itself and its contact form.
 *
 * The site is the static export of the Next.js app (`next build` → ../out), served as the Worker's static assets
 * (wrangler.jsonc "assets"); every path below that isn't one of the Worker's own goes to them (env.ASSETS).
 *
 * POST /api/form with JSON { name, contact, profession?, needs?, message?, consent, lang?, website? }
 *   → checks it, then emails it to MAIL_TO through Resend (resend.com) from MAIL_FROM.
 * POST /api/form with JSON { kind: "feedback", work: { id, title }, message, name?, contact?, consent, website? }
 *   → feedback from a client on a site preview at ivanbogush.ru/works/<id>: the message is required, name and
 *     contact are optional (the preview already says who it's for).
 * POST /api/form with JSON { kind: "event", event: "show", work: { id, title } }
 *   → a client pressed «Показать» on their preview's first screen. Nothing is emailed; it only goes to the bot.
 * POST / is the same: the form posted there while the site was on GitHub Pages, and pages already open in a browser
 * still do.
 *
 * Ivan's Telegram bot (Desktop/Bots/portfolio-leads-bot, @portfolioleads2bot) gets every message and every
 * «Показать», with the visitor's address: it notifies him and counts unique visitors per preview. The Worker posts
 * them to LEADS_URL with the LEADS_KEY secret, after answering (waitUntil), so the form never waits on the bot. With
 * either unset nothing goes to the bot. A message reaches the bot even when Resend fails, marked `mailed: false`.
 *
 * Answers:
 *   200 { ok: true }                 sent (or a bot filled the hidden `website` field: we pretend and send nothing)
 *   400 { error: "invalid" | ... }   missing name/contact, no consent, bad JSON
 *   403 { error: "origin" }          posted from a page that isn't in ALLOWED_ORIGINS
 *   429 { error: "rate_limited" }    more than 3 tries a minute from one address
 *   503 { error: "not_configured" }  RESEND_API_KEY isn't set
 *   502 { error: "send_failed" }     Resend refused or didn't answer
 * The form treats anything but 200 as "couldn't send" and offers Telegram / email with the text filled in.
 *
 * POST /inbound → Resend's `email.received` webhook: forwards mail sent to pr@ivanbogush.ru to FORWARD_TO (inbound.ts).
 *
 * GET /health → { ok: true, relay } for checks; `relay` is true when the request came through the relay with its key.
 *
 * Russian ISPs slow Cloudflare down, so ivanbogush.ru points at a relay outside Cloudflare (relay/setup.sh), which
 * passes every request on to this Worker's workers.dev address. Cloudflare then sees only the relay's address, so the
 * relay sends the visitor's along as X-Relay-IP, signed with X-Relay-Key. With the right key (the RELAY_KEY secret)
 * the rate limit counts that address instead.
 *
 * The Worker stores nothing: the message goes to the mailbox and the bot; the bot keeps the click counts.
 */

import { handleInbound, type InboundEnv } from "./inbound.ts";

export interface Env extends InboundEnv {
	RESEND_API_KEY?: string;
	RELAY_KEY?: string;
	MAIL_TO: string;
	MAIL_FROM: string;
	ALLOWED_ORIGINS: string;
	LIMITER?: RateLimit;
	/** the leads bot's endpoint, e.g. https://ivanbogush.ru/bot/event (the relay hands /bot/* to the bot) */
	LEADS_URL?: string;
	/** its key (a secret; the bot has the same one in /etc/portfolio-leads-bot/env) */
	LEADS_KEY?: string;
	/** the site: ../out, the static export (wrangler.jsonc "assets"). Tests run without it. */
	ASSETS?: Fetcher;
}

/** Where the site's forms post (lib/submit.ts). */
const FORM_PATH = "/api/form";

/** The part of the runtime's context the Worker uses: work that may finish after the answer has gone. */
type Later = Pick<ExecutionContext, "waitUntil">;

interface Enquiry {
	kind: "enquiry" | "feedback";
	/** the preview the feedback is about */
	work?: { id: string; title: string };
	name: string;
	contact: string;
	profession: string;
	needs: string[];
	message: string;
	lang: "ru" | "en";
}

const LIMITS = { name: 120, contact: 120, profession: 120, need: 60, needs: 8, message: 3000, workTitle: 160 };
// a preview id is the client's name: "dilyara-soley" (scripts/add-work.mjs)
const WORK_ID = /^(?=.{4,40}$)[a-z0-9]+(?:-[a-z0-9]+)*$/;

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
// The message keeps its line breaks.
const clipText = (v: unknown, max: number) =>
	typeof v === "string" ? v.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, max) : "";

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

const escapeHtml = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function allowedOrigin(request: Request, env: Env): string | null {
	const origin = request.headers.get("Origin");
	if (!origin) return null;
	const list = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()).filter(Boolean);
	return list.includes(origin) ? origin : null;
}

/** Constant-time string comparison, so the key can't be guessed from response times. */
function sameKey(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

/** True when the request came through our relay: it carries the relay key. */
export function viaRelay(request: Request, env: Env): boolean {
	const key = request.headers.get("X-Relay-Key");
	return Boolean(env.RELAY_KEY && key && sameKey(key, env.RELAY_KEY));
}

/** The visitor's address: the relay's X-Relay-IP when the request carries its key, otherwise Cloudflare's own. */
export function visitorIp(request: Request, env: Env): string {
	const relayed = viaRelay(request, env) ? request.headers.get("X-Relay-IP")?.trim() : "";
	return relayed || request.headers.get("CF-Connecting-IP") || "unknown";
}

function json(body: unknown, status: number, origin: string | null): Response {
	const headers: Record<string, string> = { "Content-Type": "application/json; charset=utf-8", Vary: "Origin" };
	if (origin) headers["Access-Control-Allow-Origin"] = origin;
	return new Response(JSON.stringify(body), { status, headers });
}

export function parseEnquiry(body: Record<string, unknown>): Enquiry | { error: string } {
	const name = clip(body.name, LIMITS.name);
	const contact = clip(body.contact, LIMITS.contact);
	const message = clipText(body.message, LIMITS.message);
	const lang = body.lang === "en" ? "en" : "ru";

	if (body.kind === "feedback") {
		const w = (body.work ?? {}) as Record<string, unknown>;
		const id = clip(w.id, 40);
		if (!WORK_ID.test(id)) return { error: "bad_work" };
		if (!message) return { error: "missing_fields" };
		if (body.consent !== true) return { error: "no_consent" };
		return { kind: "feedback", work: { id, title: clip(w.title, LIMITS.workTitle) || id }, name, contact, profession: "", needs: [], message, lang };
	}

	if (!name || !contact) return { error: "missing_fields" };
	// 152-ФЗ: nothing is processed without the visitor's explicit consent from the form's checkbox.
	if (body.consent !== true) return { error: "no_consent" };
	const needs = Array.isArray(body.needs)
		? body.needs.map((n) => clip(n, LIMITS.need)).filter(Boolean).slice(0, LIMITS.needs)
		: [];
	return { kind: "enquiry", name, contact, profession: clip(body.profession, LIMITS.profession), needs, message, lang };
}

/** { kind: "event", event: "show", work: { id, title } }: the only event there is so far. */
export function parseEvent(body: Record<string, unknown>): { work: { id: string; title: string } } | { error: string } {
	if (body.event !== "show") return { error: "bad_event" };
	const w = (body.work ?? {}) as Record<string, unknown>;
	const id = clip(w.id, 40);
	if (!WORK_ID.test(id)) return { error: "bad_work" };
	return { work: { id, title: clip(w.title, LIMITS.workTitle) || id } };
}

/** Hands an event to the leads bot. Never throws: the bot is a convenience, the form must not depend on it. */
export async function tellBot(env: Env, event: Record<string, unknown>): Promise<void> {
	if (!env.LEADS_URL || !env.LEADS_KEY) return;
	try {
		const res = await fetch(env.LEADS_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json", "X-Leads-Key": env.LEADS_KEY },
			body: JSON.stringify(event),
		});
		if (!res.ok) console.error("leads bot refused", res.status);
	} catch (err) {
		console.error("leads bot unreachable", err);
	}
}

export function buildEmail(e: Enquiry, now = new Date()) {
	const when = now.toLocaleString("ru-RU", { timeZone: "Europe/Moscow", dateStyle: "long", timeStyle: "short" });
	const feedback = e.kind === "feedback";
	const heading = feedback ? `Отзыв на превью: ${e.work?.title}` : "Новая заявка с сайта ivanbogush.ru";
	const rows = (
		[
			...(feedback ? [["Превью", `ivanbogush.ru/works/${e.work?.id}`]] : []),
			["Имя", e.name],
			["Контакт", e.contact],
			["Чем занимается", e.profession],
			["Что нужно", e.needs.join(", ")],
			["Язык сайта", e.lang === "en" ? "английский" : "русский"],
		] as [string, string][]
	).filter(([, v]) => v);
	const consent = `Согласие на обработку персональных данных получено ${when} (МСК).`;
	const messageLabel = feedback ? "Отзыв" : "Задача";

	const text = [
		heading,
		"",
		...rows.map(([k, v]) => `${k}: ${v}`),
		...(e.message ? ["", `${messageLabel}:`, e.message] : []),
		"",
		consent,
	].join("\n");

	const html = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.5;color:#15171a">
<p style="margin:0 0 16px;font-size:17px;font-weight:600">${escapeHtml(heading)}</p>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${rows
	.map(
		([k, v]) =>
			`<tr><td style="padding:4px 16px 4px 0;color:#676d76;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
	)
	.join("\n")}
</table>
${e.message ? `<p style="margin:20px 0 6px;color:#676d76">${messageLabel}</p><p style="margin:0;white-space:pre-wrap">${escapeHtml(e.message)}</p>` : ""}
<p style="margin:24px 0 0;font-size:13px;color:#676d76">${escapeHtml(consent)}</p>
</body></html>`;

	return {
		subject: feedback ? `Отзыв на превью: ${e.work?.title}` : `Заявка с сайта: ${e.name}`,
		text,
		html,
		// Replying goes straight to the visitor when they left an email address.
		replyTo: EMAIL_RE.test(e.contact) ? e.contact : undefined,
	};
}

async function sendWithResend(env: Env, mail: ReturnType<typeof buildEmail>): Promise<boolean> {
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			from: env.MAIL_FROM,
			to: [env.MAIL_TO],
			subject: mail.subject,
			text: mail.text,
			html: mail.html,
			...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
		}),
	});
	if (!res.ok) console.error("resend refused", res.status, await res.text().catch(() => ""));
	return res.ok;
}

/** The contact form, the feedback on previews and the «Показать» events: POST /api/form (and POST /). */
async function handleForm(request: Request, env: Env, ctx?: Later): Promise<Response> {
	// after the answer when the runtime allows it (tests call without a context: then it just runs)
	const later = (work: Promise<void>) => (ctx ? ctx.waitUntil(work) : void work);
	const origin = allowedOrigin(request, env);

	if (request.method === "OPTIONS") {
		if (!origin) return new Response(null, { status: 403 });
		return new Response(null, {
			status: 204,
			headers: {
				"Access-Control-Allow-Origin": origin,
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type",
				"Access-Control-Max-Age": "86400",
				Vary: "Origin",
			},
		});
	}
	if (request.method !== "POST") return json({ error: "method" }, 405, origin);
	if (!origin) return json({ error: "origin" }, 403, null);

	if (env.LIMITER) {
		const { success } = await env.LIMITER.limit({ key: visitorIp(request, env) });
		if (!success) return json({ error: "rate_limited" }, 429, origin);
	}

	let body: Record<string, unknown>;
	try {
		const raw = await request.text();
		if (raw.length > 20_000) return json({ error: "too_large" }, 413, origin);
		body = JSON.parse(raw);
		if (!body || typeof body !== "object") throw new Error("not an object");
	} catch {
		return json({ error: "bad_json" }, 400, origin);
	}

	// Honeypot: people never see the `website` field, bots fill it in. Pretend it worked.
	if (clip(body.website, 200)) return json({ ok: true }, 200, origin);

	const ip = visitorIp(request, env);

	if (body.kind === "event") {
		const event = parseEvent(body);
		if ("error" in event) return json(event, 400, origin);
		later(tellBot(env, { type: "show", ip, work: event.work }));
		return json({ ok: true }, 200, origin);
	}

	const enquiry = parseEnquiry(body);
	if ("error" in enquiry) return json(enquiry, 400, origin);

	let sent = false;
	if (env.RESEND_API_KEY) {
		try {
			sent = await sendWithResend(env, buildEmail(enquiry));
		} catch (err) {
			console.error("resend unreachable", err);
		}
	}
	const { kind, ...fields } = enquiry;
	later(tellBot(env, { type: kind, ip, ...fields, mailed: sent }));

	if (!env.RESEND_API_KEY) return json({ error: "not_configured" }, 503, origin);
	return sent ? json({ ok: true }, 200, origin) : json({ error: "send_failed" }, 502, origin);
}

export default {
	async fetch(request: Request, env: Env, ctx?: Later): Promise<Response> {
		const { pathname } = new URL(request.url);
		const read = request.method === "GET" || request.method === "HEAD";

		if (pathname === "/health" && read) {
			return json({ ok: true, relay: viaRelay(request, env) }, 200, allowedOrigin(request, env));
		}
		// Resend's webhook for mail arriving at pr@ivanbogush.ru (inbound.ts): signed, no Origin, no rate limit.
		if (pathname === "/inbound" && request.method === "POST") return handleInbound(request, env);
		if (pathname === FORM_PATH || (pathname === "/" && !read)) return handleForm(request, env, ctx);

		// everything else is the site; a path it doesn't have gets its 404 page
		return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
