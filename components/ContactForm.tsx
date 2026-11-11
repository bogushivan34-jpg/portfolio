"use client";

import { useEffect, useState } from "react";
import { Lang, form as t, formatPrice, prices, profile } from "@/data/content";
import { submitForm } from "@/lib/submit";

type Status = "idle" | "sending" | "sent" | "failed" | "limited";

const empty = { name: "", contact: "", profession: "", message: "", website: "" };

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

export default function ContactForm({
  lang,
  order,
  onClearOrder,
}: {
  lang: Lang;
  /** the id of the price option chosen with "Order" (data/content.ts, prices) */
  order?: string | null;
  onClearOrder?: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [values, setValues] = useState(empty);
  const [needs, setNeeds] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  /** whether the enquiry that was just sent carried an order: decides the thank-you text */
  const [sentOrder, setSentOrder] = useState(false);

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const toggleNeed = (id: string) => setNeeds((n) => (n.includes(id) ? n.filter((x) => x !== id) : [...n, id]));

  const tier = prices.tiers.find((x) => x.id === order);
  const orderText = tier ? `«${tier.name[lang]}» — ${formatPrice(tier.price, lang)}` : "";

  /* Choosing an option after an enquiry was sent brings the form back for the order. */
  useEffect(() => {
    if (order) setStatus((s) => (s === "sent" ? "idle" : s));
  }, [order]);

  const needLabels = t.needs.filter((n) => needs.includes(n.id)).map((n) => n.label[lang]);
  const plainText = [
    tier && `${t.orderLabel[lang]}: ${orderText}`,
    `${t.name[lang]}: ${values.name}`,
    `${t.contact[lang]}: ${values.contact}`,
    values.profession && `${t.profession[lang]}: ${values.profession}`,
    needLabels.length > 0 && `${t.needsLabel[lang]}: ${needLabels.join(", ")}`,
    values.message && `${t.message[lang]}: ${values.message}`,
  ]
    .filter(Boolean)
    .join("\n");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      /* The order travels as the first "need": the Worker's email lists it under "Что нужно". */
      const sentNeeds = tier ? [`${t.orderLabel[lang]}: ${orderText}`, ...needLabels] : needLabels;
      const res = await submitForm({ ...values, needs: sentNeeds, consent, lang });
      if (res.ok) {
        setSentOrder(Boolean(tier));
        onClearOrder?.();
      }
      setStatus(res.ok ? "sent" : res.status === 429 ? "limited" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl bg-white p-6 text-body sm:p-8" role="status">
        <p className="text-[22px] font-semibold text-ink">{t.sentTitle[lang]}</p>
        <p className="mt-3">{sentOrder ? t.orderSentText[lang] : t.sentText[lang]}</p>
        <button
          type="button"
          className="link mt-6"
          onClick={() => {
            setValues(empty);
            setNeeds([]);
            setConsent(false);
            setStatus("idle");
          }}
        >
          {t.sendAnother[lang]}
        </button>
      </div>
    );
  }

  if (status === "failed" || status === "limited") {
    return (
      <div className="rounded-2xl bg-white p-6 text-body sm:p-8" role="alert">
        <p className="text-[22px] font-semibold text-ink">{t.failTitle[lang]}</p>
        <p className="mt-3">{status === "limited" ? t.rateLimited[lang] : t.failText[lang]}</p>
        <pre className="mt-5 whitespace-pre-wrap rounded-lg bg-paper p-4 font-sans text-[15px] leading-[1.55] text-ink">
          {plainText}
        </pre>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={`${profile.telegramUrl}?text=${encodeURIComponent(plainText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
          >
            {t.viaTelegram[lang]}
          </a>
          <a
            href={`mailto:${profile.email}?subject=${encodeURIComponent(t.mailSubject[lang])}&body=${encodeURIComponent(plainText)}`}
            className="link"
          >
            {t.viaEmail[lang]}
          </a>
          <button type="button" onClick={() => setStatus("idle")} className="text-[15px] text-muted hover:text-ink">
            {t.back[lang]}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-white p-6 text-body sm:p-8">
      <p className="text-[22px] font-semibold text-ink">{tier ? t.orderTitle[lang] : t.title[lang]}</p>

      {tier && (
        <div className="mt-5 rounded-lg bg-accentSoft px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[16px] font-medium leading-[1.4] text-ink">
              <span className="label mb-1 block text-accent">{t.orderLabel[lang]}</span>
              {orderText}
            </p>
            <button type="button" onClick={onClearOrder} className="shrink-0 text-[14px] text-muted hover:text-ink">
              {t.orderRemove[lang]} ✕
            </button>
          </div>
          <p className="mt-2 text-[14px] leading-[1.5]">{t.orderNote[lang]}</p>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block text-[15px] font-medium text-ink">
          {t.name[lang]} <span className="text-accent" aria-hidden="true">*</span>
          <input required maxLength={120} autoComplete="name" value={values.name} onChange={set("name")} className={fieldClass} />
        </label>
        <label className="block text-[15px] font-medium text-ink">
          {t.contact[lang]} <span className="text-accent" aria-hidden="true">*</span>
          <input required maxLength={120} value={values.contact} onChange={set("contact")} className={fieldClass} />
        </label>
      </div>

      <label className="mt-5 block text-[15px] font-medium text-ink">
        {t.profession[lang]}
        <input
          maxLength={120}
          placeholder={t.professionHint[lang]}
          value={values.profession}
          onChange={set("profession")}
          className={fieldClass}
        />
      </label>

      <fieldset className="mt-5">
        <legend className="text-[15px] font-medium text-ink">{t.needsLabel[lang]}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {t.needs.map((n) => {
            const on = needs.includes(n.id);
            return (
              <button
                key={n.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleNeed(n.id)}
                className={`rounded-full border px-3.5 py-1.5 text-[15px] transition-colors ${
                  on ? "border-accent bg-accentSoft text-accent" : "border-line text-body hover:border-muted"
                }`}
              >
                {n.label[lang]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="mt-5 block text-[15px] font-medium text-ink">
        {t.message[lang]}
        <textarea
          rows={4}
          maxLength={3000}
          placeholder={t.messageHint[lang]}
          value={values.message}
          onChange={set("message")}
          className={`${fieldClass} resize-y`}
        />
      </label>

      {/* Honeypot: hidden from people, bots fill it in */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={values.website}
        onChange={set("website")}
        className="hidden"
        aria-hidden="true"
      />

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-[14px] leading-[1.5]">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-[3px] h-4 w-4 shrink-0 accent-[#1d5a43]"
        />
        <span>
          {t.consentBefore[lang]}
          <a href="/consent" target="_blank" className="underline underline-offset-2 hover:text-ink">
            {t.consentLink[lang]}
          </a>
          {t.consentMiddle[lang]}
          <a href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-ink">
            {t.privacyLink[lang]}
          </a>
          {t.consentAfter[lang]}
        </span>
      </label>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" disabled={status === "sending"} className="btn disabled:opacity-60">
          {status === "sending" ? t.sending[lang] : t.submit[lang]}
        </button>
        <span className="text-[14px] text-muted">{t.replyNote[lang]} · <span className="text-accent">*</span> {t.required[lang]}</span>
      </div>
    </form>
  );
}
