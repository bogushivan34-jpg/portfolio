/*
 * The portfolio's contact form, as a Cloudflare Worker.
 *
 * POST / with JSON { name, contact, profession?, needs?, message?, consent, lang?, website? }
 *   → checks it, then emails it to MAIL_TO through Resend (resend.com) from MAIL_FROM.
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
 * GET /health → { ok: true, relay } for checks; `relay` is true when the request came through the relay with its key.
 *
 * Visitors in Russia reach this through the relay at form.ivanbogush.ru (relay/setup.sh), because Russian ISPs slow
 * Cloudflare down. Cloudflare then sees only the relay's address, so the relay sends the visitor's along as X-Relay-IP,
 * signed with X-Relay-Key. With the right key (the RELAY_KEY secret) the rate limit counts that address instead.
 *
 * Nothing is stored: the message goes straight to the mailbox.
 */

export interface Env {
	RESEND_API_KEY?: string;
	RELAY_KEY?: string;
	MAIL_TO: string;
	MAIL_FROM: string;
	ALLOWED_ORIGINS: string;
	LIMITER?: RateLimit;
}

interface Enquiry {
	name: string;
	contact: string;
	profession: string;
	needs: string[];
	message: string;
	lang: "ru" | "en";
}

const LIMITS = { name: 120, contact: 120, profession: 120, need: 60, needs: 8, message: 3000 };

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
	if (!name || !contact) return { error: "missing_fields" };
	// 152-ФЗ: nothing is processed without the visitor's explicit consent from the form's checkbox.
	if (body.consent !== true) return { error: "no_consent" };
	const needs = Array.isArray(body.needs)
		? body.needs.map((n) => clip(n, LIMITS.need)).filter(Boolean).slice(0, LIMITS.needs)
		: [];
	return {
		name,
		contact,
		profession: clip(body.profession, LIMITS.profession),
		needs,
		message: clipText(body.message, LIMITS.message),
		lang: body.lang === "en" ? "en" : "ru",
	};
}

export function buildEmail(e: Enquiry, now = new Date()) {
	const when = now.toLocaleString("ru-RU", { timeZone: "Europe/Moscow", dateStyle: "long", timeStyle: "short" });
	const rows: [string, string][] = [
		["Имя", e.name],
		["Контакт", e.contact],
		...(e.profession ? [["Чем занимается", e.profession] as [string, string]] : []),
		...(e.needs.length ? [["Что нужно", e.needs.join(", ")] as [string, string]] : []),
		["Язык сайта", e.lang === "en" ? "английский" : "русский"],
	];
	const consent = `Согласие на обработку персональных данных получено ${when} (МСК).`;

	const text = [
		"Новая заявка с сайта ivanbogush.ru",
		"",
		...rows.map(([k, v]) => `${k}: ${v}`),
		...(e.message ? ["", "Задача:", e.message] : []),
		"",
		consent,
	].join("\n");

	const html = `<!doctype html><html><body style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.5;color:#15171a">
<p style="margin:0 0 16px;font-size:17px;font-weight:600">Новая заявка с сайта ivanbogush.ru</p>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${rows
	.map(
		([k, v]) =>
			`<tr><td style="padding:4px 16px 4px 0;color:#676d76;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
	)
	.join("\n")}
</table>
${e.message ? `<p style="margin:20px 0 6px;color:#676d76">Задача</p><p style="margin:0;white-space:pre-wrap">${escapeHtml(e.message)}</p>` : ""}
<p style="margin:24px 0 0;font-size:13px;color:#676d76">${escapeHtml(consent)}</p>
</body></html>`;

	return {
		subject: `Заявка с сайта: ${e.name}`,
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

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
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
		if (request.method === "GET" && new URL(request.url).pathname === "/health") {
			return json({ ok: true, relay: viaRelay(request, env) }, 200, origin);
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

		const enquiry = parseEnquiry(body);
		if ("error" in enquiry) return json(enquiry, 400, origin);

		if (!env.RESEND_API_KEY) return json({ error: "not_configured" }, 503, origin);

		try {
			const sent = await sendWithResend(env, buildEmail(enquiry));
			return sent ? json({ ok: true }, 200, origin) : json({ error: "send_failed" }, 502, origin);
		} catch (err) {
			console.error("resend unreachable", err);
			return json({ error: "send_failed" }, 502, origin);
		}
	},
} satisfies ExportedHandler<Env>;
