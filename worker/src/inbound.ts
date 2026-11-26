/*
 * Forwards mail that arrives at pr@ivanbogush.ru to Ivan's own mailbox.
 *
 * ivanbogush.ru's MX points at Resend, which keeps incoming mail and calls a webhook (`email.received`) with its
 * metadata only. Resend posts that to POST /inbound here; the Worker checks the signature, fetches the message and
 * its attachments from Resend, and sends it again to FORWARD_TO.
 *
 * The copy goes out from FORWARD_FROM (on ivanbogush.ru, so it passes SPF/DKIM at mail.ru), with the sender's name
 * in the From name and Reply-To set to the sender: pressing Reply answers them. Sending it "as" the sender would fail
 * their domain's DMARC and land in spam or be refused.
 *
 * Answers: 200 when forwarded or deliberately skipped (not for FORWARD_FOR, a loop), 401 on a bad signature,
 * 503 when not configured, 502 when Resend fails, so Resend retries the webhook later. The send carries an
 * Idempotency-Key from the email's id, so a retry after a send that did go through doesn't make a second copy.
 */

export interface InboundEnv {
	RESEND_API_KEY?: string;
	/** the webhook's signing secret from Resend (whsec_…) */
	RESEND_WEBHOOK_SECRET?: string;
	/** where the copies go (a secret: it's a personal address and this repo is public) */
	FORWARD_TO?: string;
	/** the addresses on ivanbogush.ru whose mail is forwarded, comma-separated; empty = everything the domain gets */
	FORWARD_FOR?: string;
	/** the sending address, on the verified domain */
	FORWARD_FROM?: string;
}

const API = "https://api.resend.com";
const TOLERANCE_S = 5 * 60;
const MAX_ATTACHMENTS_BYTES = 30 * 1024 * 1024; // Resend takes 40 MB a message, base64 included

const EMAIL_IN = /<?([^\s<>"]+@[^\s<>"]+)>?\s*$/;
const bare = (addr: string) => (addr.match(EMAIL_IN)?.[1] ?? addr).trim().toLowerCase();

function b64(bytes: Uint8Array): string {
	let s = "";
	for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
	return btoa(s);
}

function sameKey(a: string, b: string): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}

/**
 * Resend signs webhooks the Svix way: base64(HMAC-SHA256(key, `${svix-id}.${svix-timestamp}.${body}`)), where the
 * key is the secret after "whsec_", base64-decoded. svix-signature holds one or more "v1,<sig>" separated by spaces.
 */
export async function verifySignature(secret: string, headers: Headers, body: string, now = Date.now()): Promise<boolean> {
	const id = headers.get("svix-id");
	const ts = headers.get("svix-timestamp");
	const sigs = headers.get("svix-signature");
	if (!id || !ts || !sigs) return false;
	if (Math.abs(now / 1000 - Number(ts)) > TOLERANCE_S) return false;
	const raw = Uint8Array.from(atob(secret.replace(/^whsec_/, "")), (c) => c.charCodeAt(0));
	const key = await crypto.subtle.importKey("raw", raw, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
	const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`)));
	const expected = b64(mac);
	return sigs.split(" ").some((s) => {
		const [version, sig] = s.split(",");
		return version === "v1" && !!sig && sameKey(sig, expected);
	});
}

interface Received {
	id: string;
	from: string;
	to?: string[];
	cc?: string[];
	subject?: string;
	html?: string | null;
	text?: string | null;
	headers?: Record<string, string>;
	reply_to?: string[] | string | null;
}

interface AttachmentInfo {
	filename?: string;
	content_type?: string;
	content_disposition?: string;
	content_id?: string;
	size?: number;
	download_url?: string;
}

const escapeHtml = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The name to show in From: the sender's own display name, or their address. Quotes and brackets stripped. */
function senderLabel(fromHeader: string): string {
	const name = fromHeader.replace(/<[^>]*>/g, "").replace(/["<>\\]/g, "").trim();
	return (name || bare(fromHeader)).slice(0, 80);
}

async function api(env: InboundEnv, path: string): Promise<Response> {
	return fetch(`${API}${path}`, { headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` } });
}

async function attachments(env: InboundEnv, id: string) {
	const out: { filename: string; content: string; content_type?: string; content_id?: string }[] = [];
	const skipped: string[] = [];
	const res = await api(env, `/emails/receiving/${id}/attachments?limit=100`);
	if (!res.ok) throw new Error(`attachments list ${res.status}`);
	const list = ((await res.json()) as { data?: AttachmentInfo[] }).data ?? [];
	let total = 0;
	for (const a of list) {
		const filename = a.filename || "attachment";
		if (!a.download_url || total + (a.size ?? 0) > MAX_ATTACHMENTS_BYTES) {
			skipped.push(filename);
			continue;
		}
		const file = await fetch(a.download_url);
		if (!file.ok) throw new Error(`attachment ${file.status}`);
		const bytes = new Uint8Array(await file.arrayBuffer());
		total += bytes.length;
		out.push({
			filename,
			content: b64(bytes),
			content_type: a.content_type,
			content_id: a.content_id ? a.content_id.replace(/^<|>$/g, "") : undefined,
		});
	}
	return { out, skipped };
}

export async function handleInbound(request: Request, env: InboundEnv): Promise<Response> {
	const reply = (body: unknown, status: number) =>
		new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

	if (!env.RESEND_API_KEY || !env.RESEND_WEBHOOK_SECRET || !env.FORWARD_TO || !env.FORWARD_FROM) {
		return reply({ error: "not_configured" }, 503);
	}
	const raw = await request.text();
	if (!(await verifySignature(env.RESEND_WEBHOOK_SECRET, request.headers, raw))) return reply({ error: "signature" }, 401);

	let event: { type?: string; data?: { email_id?: string; from?: string; to?: string[]; cc?: string[]; received_for?: string[] } };
	try {
		event = JSON.parse(raw);
	} catch {
		return reply({ error: "bad_json" }, 400);
	}
	if (event.type !== "email.received" || !event.data?.email_id) return reply({ ok: true, skipped: "event" }, 200);
	const d = event.data;
	const id = event.data.email_id;

	const fromAddr = bare(env.FORWARD_FROM);
	if (d.from && bare(d.from) === fromAddr) return reply({ ok: true, skipped: "loop" }, 200);

	const wanted = (env.FORWARD_FOR ?? "").split(",").map((a) => a.trim().toLowerCase()).filter(Boolean);
	if (wanted.length) {
		const rcpts = [...(d.to ?? []), ...(d.cc ?? []), ...(d.received_for ?? [])].map(bare);
		if (!rcpts.some((r) => wanted.includes(r))) return reply({ ok: true, skipped: "recipient" }, 200);
	}

	try {
		const res = await api(env, `/emails/receiving/${id}?html_format=cid`);
		if (!res.ok) throw new Error(`get ${res.status}`);
		const mail = (await res.json()) as Received;
		const { out: files, skipped } = await attachments(env, id);

		const fromHeader = mail.headers?.from || mail.from;
		const sender = bare(mail.from);
		const replyTo = (Array.isArray(mail.reply_to) ? mail.reply_to[0] : mail.reply_to) || "";
		const toLine = (mail.to ?? d.to ?? []).join(", ");
		const note = skipped.length ? `Не приложены (слишком большие): ${skipped.join(", ")}` : "";

		const textHead = [`От: ${fromHeader}`, `Кому: ${toLine}`, ...(note ? [note] : []), "", ""].join("\n");
		const htmlHead =
			`<div style="font:13px/1.5 Arial,sans-serif;color:#676d76;margin:0 0 16px;padding:0 0 8px;border-bottom:1px solid #e3e5e8">` +
			`От: ${escapeHtml(fromHeader)}<br>Кому: ${escapeHtml(toLine)}${note ? `<br>${escapeHtml(note)}` : ""}</div>`;

		const send = await fetch(`${API}/emails`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${env.RESEND_API_KEY}`,
				"Content-Type": "application/json",
				"Idempotency-Key": `forward-${id}`,
			},
			body: JSON.stringify({
				from: `${senderLabel(fromHeader)} <${fromAddr}>`,
				to: [env.FORWARD_TO],
				reply_to: bare(replyTo || sender),
				subject: mail.subject || "(без темы)",
				text: textHead + (mail.text || ""),
				...(mail.html ? { html: htmlHead + mail.html } : {}),
				...(files.length ? { attachments: files } : {}),
			}),
		});
		if (!send.ok) throw new Error(`send ${send.status} ${await send.text().catch(() => "")}`);
		return reply({ ok: true }, 200);
	} catch (err) {
		console.error("forward failed", id, err);
		return reply({ error: "forward_failed" }, 502);
	}
}
