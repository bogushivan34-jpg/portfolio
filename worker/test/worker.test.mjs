// Runs the Worker's fetch handler directly in Node (no workerd needed), with Resend's API faked.
//   npm test
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.ts";

const ORIGIN = "https://ivanbogush.ru";
const baseEnv = {
	RESEND_API_KEY: "re_test",
	MAIL_TO: "owner@example.com",
	MAIL_FROM: "Site <form@ivanbogush.ru>",
	ALLOWED_ORIGINS: "https://ivanbogush.ru,http://localhost:3210",
};
const good = { name: "Анна", contact: "anna@example.com", profession: "психолог", needs: ["Сайт"], message: "Нет сайта", consent: true, lang: "ru", website: "" };

let sent;
let resendStatus;
beforeEach(() => {
	sent = [];
	resendStatus = 200;
	globalThis.fetch = async (url, init) => {
		sent.push({ url, headers: init.headers, body: JSON.parse(init.body) });
		return new Response(JSON.stringify({ id: "x" }), { status: resendStatus });
	};
});

const post = (body, { origin = ORIGIN, env = baseEnv } = {}) =>
	worker.fetch(
		new Request("https://w.example/", {
			method: "POST",
			headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}), "CF-Connecting-IP": "1.2.3.4" },
			body: typeof body === "string" ? body : JSON.stringify(body),
		}),
		env,
	);

test("sends a valid enquiry through Resend", async () => {
	const res = await post(good);
	assert.equal(res.status, 200);
	assert.equal(res.headers.get("Access-Control-Allow-Origin"), ORIGIN);
	assert.equal(sent.length, 1);
	const { url, headers, body } = sent[0];
	assert.equal(url, "https://api.resend.com/emails");
	assert.equal(headers.Authorization, "Bearer re_test");
	assert.deepEqual(body.to, ["owner@example.com"]);
	assert.equal(body.from, "Site <form@ivanbogush.ru>");
	assert.equal(body.reply_to, "anna@example.com");
	assert.equal(body.subject, "Заявка с сайта: Анна");
	assert.match(body.text, /Контакт: anna@example\.com/);
	assert.match(body.text, /Что нужно: Сайт/);
	assert.match(body.text, /Согласие на обработку персональных данных получено/);
});

test("no reply_to when the contact isn't an email", async () => {
	await post({ ...good, contact: "@anna_tg" });
	assert.equal(sent[0].body.reply_to, undefined);
});

test("escapes HTML in the email", async () => {
	await post({ ...good, name: "<b>x</b>", message: "<script>alert(1)</script>" });
	assert.ok(!sent[0].body.html.includes("<script>"));
	assert.ok(sent[0].body.html.includes("&lt;script&gt;"));
});

test("rejects missing fields and missing consent", async () => {
	assert.equal((await post({ ...good, name: "  " })).status, 400);
	assert.equal((await post({ ...good, consent: false })).status, 400);
	assert.equal((await post("not json")).status, 400);
	assert.equal(sent.length, 0);
});

test("honeypot: answers ok, sends nothing", async () => {
	const res = await post({ ...good, website: "http://spam" });
	assert.equal(res.status, 200);
	assert.equal(sent.length, 0);
});

test("refuses other origins", async () => {
	assert.equal((await post(good, { origin: "https://evil.example" })).status, 403);
	assert.equal((await post(good, { origin: null })).status, 403);
	assert.equal(sent.length, 0);
});

test("CORS preflight from an allowed page", async () => {
	const res = await worker.fetch(
		new Request("https://w.example/", { method: "OPTIONS", headers: { Origin: "http://localhost:3210" } }),
		baseEnv,
	);
	assert.equal(res.status, 204);
	assert.equal(res.headers.get("Access-Control-Allow-Origin"), "http://localhost:3210");
	assert.match(res.headers.get("Access-Control-Allow-Methods"), /POST/);
});

test("503 without a Resend key, 502 when Resend refuses", async () => {
	const { RESEND_API_KEY, ...noKey } = baseEnv;
	assert.equal((await post(good, { env: noKey })).status, 503);
	resendStatus = 422;
	assert.equal((await post(good)).status, 502);
});

test("rate limit", async () => {
	const env = { ...baseEnv, LIMITER: { limit: async () => ({ success: false }) } };
	assert.equal((await post(good, { env })).status, 429);
	assert.equal(sent.length, 0);
});

const KEY = "k".repeat(64);
const relayed = (headers) =>
	new Request("https://w.example/", {
		method: "POST",
		headers: { "Content-Type": "application/json", Origin: ORIGIN, "CF-Connecting-IP": "45.136.228.66", ...headers },
		body: JSON.stringify(good),
	});

test("through the relay, the rate limit counts the visitor's address", async () => {
	const keys = [];
	const env = { ...baseEnv, RELAY_KEY: KEY, LIMITER: { limit: async ({ key }) => (keys.push(key), { success: true }) } };
	await worker.fetch(relayed({ "X-Relay-Key": KEY, "X-Relay-IP": "203.0.113.7" }), env);
	// a wrong key, or no key: X-Relay-IP is ignored and the relay's own address counts
	await worker.fetch(relayed({ "X-Relay-Key": "x".repeat(64), "X-Relay-IP": "203.0.113.8" }), env);
	await worker.fetch(relayed({ "X-Relay-IP": "203.0.113.9" }), env);
	// no RELAY_KEY on the worker: nobody is trusted
	await worker.fetch(relayed({ "X-Relay-Key": KEY, "X-Relay-IP": "203.0.113.10" }), { ...env, RELAY_KEY: undefined });
	assert.deepEqual(keys, ["203.0.113.7", "45.136.228.66", "45.136.228.66", "45.136.228.66"]);
});

test("health says whether the relay key is right", async () => {
	const env = { ...baseEnv, RELAY_KEY: KEY };
	const health = (headers = {}) =>
		worker.fetch(new Request("https://w.example/health", { headers }), env).then((r) => r.json());
	assert.deepEqual(await health(), { ok: true, relay: false });
	assert.deepEqual(await health({ "X-Relay-Key": KEY }), { ok: true, relay: true });
	assert.deepEqual(await health({ "X-Relay-Key": "nope" }), { ok: true, relay: false });
});
