import { NextResponse } from "next/server";

/*
 * Sends a site enquiry to Telegram.
 * Needs two environment variables on the host (see .env.example):
 *   TELEGRAM_BOT_TOKEN - token of a bot made with @BotFather
 *   TELEGRAM_CHAT_ID   - your chat id with that bot (message the bot once, then read it from getUpdates)
 * Without them the route answers 503 and the form shows a "send via Telegram / email" fallback.
 */

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Honeypot filled in: pretend success, send nothing.
  if (clip(body.website, 200)) return NextResponse.json({ ok: true });

  const name = clip(body.name, 120);
  const contact = clip(body.contact, 120);
  if (!name || !contact) return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  // 152-ФЗ: no processing without the visitor's explicit consent from the form checkbox.
  if (body.consent !== true) return NextResponse.json({ error: "no_consent" }, { status: 400 });

  const profession = clip(body.profession, 120);
  const message = clip(body.message, 2000);
  const needs = Array.isArray(body.needs) ? body.needs.map((n) => clip(n, 40)).filter(Boolean).slice(0, 6) : [];

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const details = [
    `Имя: ${name}`,
    `Контакт: ${contact}`,
    profession && `Сфера: ${profession}`,
    needs.length > 0 && `Нужно: ${needs.join(", ")}`,
    message && `Задача: ${message}`,
    `Согласие на обработку ПД: получено ${new Date().toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} (МСК)`,
  ].filter(Boolean);
  const text = `Новая заявка с сайта-портфолио\n\n${details.join("\n")}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!res.ok) return NextResponse.json({ error: "send_failed" }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
