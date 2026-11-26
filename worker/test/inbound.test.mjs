// The pr@ivanbogush.ru forwarder (src/inbound.ts), with Resend's API faked. Run with `npm test`.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import worker from "../src/index.ts";
import { verifySignature } from "../src/inbound.ts";

const SECRET_BYTES = Buffer.from("a-test-signing-key-32-bytes-long!");
const SECRET = `whsec_${SECRET_BYTES.toString("base64")}`;
const env = {
	RESEND_API_KEY: "re_test",
	RESEND_WEBHOOK_SECRET: SECRET,
	FORWARD_TO: "me@example.org",
	FORWARD_FOR: "pr@ivanbogush.ru",
	FORWARD_FROM: "pr@ivanbogush.ru",
	MAIL_TO: "pr@ivanbogush.ru",
	MAIL_FROM: "Site <form@ivanbogush.ru>",
	ALLOWED_ORIGINS: "https://ivanbogush.ru",
};

const sign = (id, ts, body, key = SECRET_BYTES) =>
	"v1," + createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");

const event = (data = {}) => ({
	type: "email.received",
	created_at: "2026-11-26T10:00:00.000Z",
	data: { email_id: "em_1", from: "anna@example.com", to: ["pr@ivanbogush.ru"], cc: [], received_for: [], subject: "Сайт", ...data },
});

function deliver(payload, { secret, ts = Math.floor(Date.now() / 1000) } = {}) {
	const body = JSON.stringify(payload);
	return worker.fetch(
		new Request("https://w.example/inbound", {
			method: "POST",
			headers: { "svix-id": "msg_1", "svix-timestamp": String(ts), "svix-signature": sign("msg_1", ts, body, secret) },
			body,
		}),
		env,
	);
}

let calls;
let sendStatus;
beforeEach(() => {
	calls = [];
	sendStatus = 200;
	globalThis.fetch = async (url, init = {}) => {
		calls.push({ url: String(url), init });
		const u = String(url);
		if (u.endsWith("/emails/receiving/em_1?html_format=cid"))
			return Response.json({
				id: "em_1",
				from: "anna@example.com",
				to: ["pr@ivanbogush.ru"],
				subject: "Сайт",
				text: "Здравствуйте",
				html: "<p>Здравствуйте</p>",
				headers: { from: '"Анна Петрова" <anna@example.com>' },
				reply_to: null,
			});
		if (u.endsWith("/emails/receiving/em_1/attachments?limit=100"))
			return Response.json({
				object: "list",
				data: [{ filename: "brief.pdf", content_type: "application/pdf", size: 3, download_url: "https://cdn.example/brief.pdf" }],
			});
		if (u === "https://cdn.example/brief.pdf") return new Response(new Uint8Array([1, 2, 3]));
		if (u === "https://api.resend.com/emails") return Response.json({ id: "sent" }, { status: sendStatus });
		return new Response("not found", { status: 404 });
	};
});

const sentMail = () => {
	const c = calls.find((c) => c.url === "https://api.resend.com/emails");
	return c && { headers: c.init.headers, body: JSON.parse(c.init.body) };
};

test("forwards mail for pr@ to FORWARD_TO, replying to the sender", async () => {
	const res = await deliver(event());
	assert.equal(res.status, 200);
	const { headers, body } = sentMail();
	assert.equal(headers["Idempotency-Key"], "forward-em_1");
	assert.deepEqual(body.to, ["me@example.org"]);
	assert.equal(body.from, "Анна Петрова <pr@ivanbogush.ru>");
	assert.equal(body.reply_to, "anna@example.com");
	assert.equal(body.subject, "Сайт");
	assert.match(body.text, /^От: "Анна Петрова" <anna@example\.com>\nКому: pr@ivanbogush\.ru\n\nЗдравствуйте$/);
	assert.match(body.html, /<p>Здравствуйте<\/p>$/);
	assert.deepEqual(body.attachments, [{ filename: "brief.pdf", content: "AQID", content_type: "application/pdf" }]);
});

test("refuses a bad or stale signature", async () => {
	assert.equal((await deliver(event(), { secret: Buffer.from("wrong") })).status, 401);
	assert.equal((await deliver(event(), { ts: Math.floor(Date.now() / 1000) - 3600 })).status, 401);
	assert.equal(calls.length, 0);
});

test("skips mail for other addresses and its own copies", async () => {
	assert.equal((await deliver(event({ to: ["info@ivanbogush.ru"] }))).status, 200);
	assert.equal((await deliver(event({ from: "pr@ivanbogush.ru" }))).status, 200);
	assert.equal((await deliver({ type: "email.sent", data: { email_id: "x" } })).status, 200);
	assert.equal(calls.length, 0);
});

test("502 when Resend refuses the send, so the webhook is retried", async () => {
	sendStatus = 500;
	assert.equal((await deliver(event())).status, 502);
});

test("503 when not configured", async () => {
	const { FORWARD_TO, ...rest } = env;
	const res = await worker.fetch(new Request("https://w.example/inbound", { method: "POST", body: "{}" }), rest);
	assert.equal(res.status, 503);
});

test("accepts any of several signatures", async () => {
	const ts = String(Math.floor(Date.now() / 1000));
	const headers = new Headers({ "svix-id": "m", "svix-timestamp": ts, "svix-signature": `v1,AAAA ${sign("m", ts, "{}")}` });
	assert.equal(await verifySignature(SECRET, headers, "{}"), true);
});
