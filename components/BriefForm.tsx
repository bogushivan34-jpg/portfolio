"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Language } from "@/types";

const NEEDS = [
  { id: "site", ru: "Сайт", en: "Website" },
  { id: "social", ru: "Оформление соцсетей", en: "Social page setup" },
  { id: "management", ru: "Ведение аккаунта", en: "Account management" },
  { id: "analytics", ru: "Аналитика", en: "Analytics" },
] as const;

type Status = "idle" | "sending" | "sent" | "fallback";

export default function BriefForm({ lang }: { lang: Language }) {
  const ru = lang === "ru";
  const [status, setStatus] = useState<Status>("idle");
  const [needs, setNeeds] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", profession: "", message: "", website: "" });

  const toggleNeed = (id: string) =>
    setNeeds((prev) => (prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]));

  const needLabels = NEEDS.filter((n) => needs.includes(n.id)).map((n) => (ru ? n.ru : n.en));

  const plainText = [
    `${ru ? "Имя" : "Name"}: ${form.name}`,
    `${ru ? "Контакт" : "Contact"}: ${form.contact}`,
    form.profession && `${ru ? "Сфера" : "Field"}: ${form.profession}`,
    needLabels.length > 0 && `${ru ? "Нужно" : "Needs"}: ${needLabels.join(", ")}`,
    form.message && `${ru ? "Задача" : "Task"}: ${form.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, needs: needLabels, lang, consent }),
      });
      setStatus(res.ok ? "sent" : "fallback");
    } catch {
      setStatus("fallback");
    }
  };

  if (status === "sent") {
    return (
      <div className="py-16 text-center animate-fade-in">
        <span className="dc-label block mb-5">{ru ? "Заявка отправлена" : "Enquiry sent"}</span>
        <p className="text-[13px] leading-[21px] text-[#6f6d68] max-w-xs mx-auto">
          {ru
            ? "Спасибо! Отвечу в течение дня по указанному контакту. Если срочно – напишите в Telegram @myfeelinzz."
            : "Thank you! I'll reply within a day using the contact you left. If it's urgent, message me on Telegram – @myfeelinzz."}
        </p>
      </div>
    );
  }

  if (status === "fallback") {
    return (
      <div className="py-10 animate-fade-in">
        <span className="dc-label block mb-5">{ru ? "Не получилось отправить" : "Couldn't send"}</span>
        <p className="text-[13px] leading-[21px] text-[#6f6d68] mb-6">
          {ru
            ? "Форма сейчас не отвечает. Ваша заявка ниже – отправьте её одним из способов, ничего не придётся набирать заново."
            : "The form isn't responding right now. Your enquiry is below: send it one of these ways without retyping it."}
        </p>
        <pre className="whitespace-pre-wrap text-[12px] leading-[19px] text-[#3e3d3a] dc-hairline-t dc-hairline-b py-5 mb-6 font-sans">
          {plainText}
        </pre>
        <div className="flex flex-wrap items-center gap-7">
          <a
            href={`https://t.me/myfeelinzz?text=${encodeURIComponent(plainText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="dc-link dc-link-accent text-[11px] uppercase tracking-[0.16em]"
          >
            {ru ? "Отправить в Telegram" : "Send via Telegram"}
          </a>
          <a
            href={`mailto:bogushiv@mail.ru?subject=${encodeURIComponent(ru ? "Заявка с сайта" : "Website enquiry")}&body=${encodeURIComponent(plainText)}`}
            className="dc-link text-[11px] uppercase tracking-[0.16em] text-[#3e3d3a]"
          >
            {ru ? "Отправить письмом" : "Send by email"}
          </a>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="dc-link text-[11px] uppercase tracking-[0.16em] text-[#9c9c9c]"
          >
            {ru ? "Назад к форме" : "Back to the form"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
        <input
          type="text"
          required
          maxLength={120}
          placeholder={ru ? "Как вас зовут *" : "Your name *"}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="dc-input"
        />
        <input
          type="text"
          required
          maxLength={120}
          placeholder={ru ? "Telegram, телефон или почта *" : "Telegram, phone or email *"}
          value={form.contact}
          onChange={(e) => setForm({ ...form, contact: e.target.value })}
          className="dc-input"
        />
      </div>
      <input
        type="text"
        maxLength={120}
        placeholder={ru ? "Чем вы занимаетесь – психолог, репетитор, школа…" : "What you do – psychologist, tutor, school…"}
        value={form.profession}
        onChange={(e) => setForm({ ...form, profession: e.target.value })}
        className="dc-input"
      />

      <fieldset>
        <legend className="text-[9px] uppercase tracking-[0.14em] text-[#9c9c9c] mb-4">
          {ru ? "Что нужно" : "What you need"}
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {NEEDS.map((n) => {
            const on = needs.includes(n.id);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => toggleNeed(n.id)}
                aria-pressed={on}
                className={`text-[11px] uppercase tracking-[0.12em] pb-1 border-b transition-colors ${
                  on
                    ? "text-[#ff7e22] border-[#ff7e22]"
                    : "text-[#6f6d68] border-[rgba(0,0,0,0.15)] hover:text-[#3e3d3a]"
                }`}
              >
                {ru ? n.ru : n.en}
              </button>
            );
          })}
        </div>
      </fieldset>

      <textarea
        rows={3}
        maxLength={2000}
        placeholder={
          ru
            ? "Коротко о задаче – например, «нет сайта, Instagram ведётся от случая к случаю»"
            : "Your task in a line – e.g. “no website, Instagram posted now and then”"
        }
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="dc-input resize-none"
      />

      {/* Honeypot: hidden from people, bots fill it in */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        className="hidden"
        aria-hidden="true"
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-[3px] h-3 w-3 shrink-0 accent-[#ff7e22]"
        />
        <span className="text-[11px] leading-[17px] text-[#6f6d68]">
          {ru ? "Даю " : "I give my "}
          <Link href="/consent" target="_blank" className="underline underline-offset-2 hover:text-[#3e3d3a]">
            {ru ? "согласие на обработку персональных данных" : "consent to the processing of my personal data"}
          </Link>
          {ru ? " и принимаю " : " and accept the "}
          <Link href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-[#3e3d3a]">
            {ru ? "политику обработки данных" : "privacy policy"}
          </Link>
          {ru ? "." : " (in Russian)."}
        </span>
      </label>

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <button
          type="submit"
          disabled={status === "sending" || !consent}
          className="dc-link dc-link-accent text-[11px] uppercase tracking-[0.18em] disabled:opacity-50"
        >
          {status === "sending" ? (ru ? "Отправляю…" : "Sending…") : ru ? "Отправить заявку" : "Send enquiry"}
        </button>
        <span className="text-[9px] uppercase tracking-[0.1em] text-[#c1bfb9]">
          {ru ? "Ответ в течение дня" : "Reply within a day"}
        </span>
      </div>
    </form>
  );
}
