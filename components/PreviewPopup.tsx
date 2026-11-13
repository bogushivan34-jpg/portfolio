"use client";

import { useEffect, useRef, useState } from "react";
import { Lang, form, formatPrice, legalLinks, preview as t, prices, profile } from "@/data/content";
import type { Work } from "@/data/works";
import { submitForm } from "@/lib/submit";

export type PopupView = "feedback" | "pricing";
type Status = "idle" | "sending" | "sent" | "failed";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-[16px] text-ink placeholder:text-muted/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

/*
 * Feedback or pricing, in a card that opens above Ivan's photo in the corner only when the client asks for it.
 * The site stays the page behind it: on a computer it can be scrolled while the card is open, so the client can
 * write as they look. It closes with ✕, Esc or the photo, never on a stray click, so a half-written note isn't lost.
 */
export default function PreviewPopup({
  work,
  lang,
  view,
  onClose,
}: {
  work: Work;
  lang: Lang;
  view: PopupView;
  onClose: () => void;
}) {
  const card = useRef<HTMLElement>(null);

  useEffect(() => {
    card.current?.focus({ preventScroll: true });
  }, [view]);

  const title = { feedback: t.feedback.title, pricing: t.pricing.title }[view][lang];

  return (
    <aside
      ref={card}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      className="note-in fixed inset-x-3 bottom-[72px] z-30 flex max-h-[calc(100dvh-84px)] flex-col rounded-2xl border border-line bg-white shadow-[0_12px_40px_rgba(21,23,26,0.2)] outline-none sm:inset-x-auto sm:bottom-[84px] sm:right-5 sm:max-h-[min(720px,calc(100dvh-104px))] sm:w-[400px]"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-line py-2 pl-5 pr-2">
        <p className="flex-1 text-[16px] font-semibold text-ink">{title}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label={t.close[lang]}
          title={t.close[lang]}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[15px] text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          ✕
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4">
        {view === "pricing" ? <PricingInfo work={work} lang={lang} /> : <Feedback work={work} lang={lang} />}
      </div>
    </aside>
  );
}

function Feedback({ work, lang }: { work: Work; lang: Lang }) {
  const f = t.feedback;
  const [status, setStatus] = useState<Status>("idle");
  const [values, setValues] = useState({ message: "", name: "", contact: "", website: "" });
  const [consent, setConsent] = useState(false);
  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  const plainText = [
    `${work.title[lang]} — ivanbogush.ru/works/${work.id}`,
    "",
    values.message,
    ...(values.name ? ["", `${f.name[lang]}: ${values.name}`] : []),
    ...(values.contact ? [`${f.contact[lang]}: ${values.contact}`] : []),
  ]
    .join("\n")
    .trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await submitForm({
        kind: "feedback",
        work: { id: work.id, title: work.title.ru },
        ...values,
        consent,
        lang,
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  };

  if (status === "sent") {
    return (
      <div role="status">
        <p className="text-[22px] font-semibold text-ink">{f.sentTitle[lang]}</p>
        <p className="mt-3">{f.sentText[lang]}</p>
        <button
          type="button"
          className="link mt-6"
          onClick={() => {
            setValues({ message: "", name: values.name, contact: values.contact, website: "" });
            setStatus("idle");
          }}
        >
          {f.another[lang]}
        </button>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div role="alert">
        <p className="text-[22px] font-semibold text-ink">{f.failTitle[lang]}</p>
        <p className="mt-3">{f.failText[lang]}</p>
        <pre className="mt-5 whitespace-pre-wrap rounded-lg bg-paper p-4 font-sans text-[15px] leading-[1.55] text-ink">
          {plainText}
        </pre>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a href={`${profile.telegramUrl}?text=${encodeURIComponent(plainText)}`} target="_blank" rel="noopener noreferrer" className="btn">
            {form.viaTelegram[lang]}
          </a>
          <a
            href={`mailto:${profile.email}?subject=${encodeURIComponent(f.mailSubject[lang])}&body=${encodeURIComponent(plainText)}`}
            className="link"
          >
            {form.viaEmail[lang]}
          </a>
          <button type="button" onClick={() => setStatus("idle")} className="text-[15px] text-muted hover:text-ink">
            {form.back[lang]}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <p className="text-[16px] leading-[1.55]">{f.lead[lang]}</p>

      <label className="mt-6 block text-[15px] font-medium text-ink">
        {f.message[lang]} <span className="text-accent" aria-hidden="true">*</span>
        <textarea
          required
          rows={6}
          maxLength={3000}
          placeholder={f.messageHint[lang]}
          value={values.message}
          onChange={set("message")}
          className={`${fieldClass} resize-y`}
        />
      </label>

      <label className="mt-5 block text-[15px] font-medium text-ink">
        {f.name[lang]} <span className="font-normal text-muted">· {f.optional[lang]}</span>
        <input maxLength={120} autoComplete="name" value={values.name} onChange={set("name")} className={fieldClass} />
      </label>
      <label className="mt-5 block text-[15px] font-medium text-ink">
        {f.contact[lang]} <span className="font-normal text-muted">· {f.optional[lang]}</span>
        <input
          maxLength={120}
          placeholder={f.contactHint[lang]}
          value={values.contact}
          onChange={set("contact")}
          className={fieldClass}
        />
      </label>

      {/* Honeypot: hidden from people, bots fill it in */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} className="hidden" aria-hidden="true" />

      <label className="mt-5 flex cursor-pointer items-start gap-3 text-[14px] leading-[1.5]">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-[3px] h-4 w-4 shrink-0 accent-[#1d5a43]"
        />
        <span>
          {form.consentBefore[lang]}
          <a href="/consent" target="_blank" className="underline underline-offset-2 hover:text-ink">
            {form.consentLink[lang]}
          </a>
          {form.consentMiddle[lang]}
          <a href="/privacy" target="_blank" className="underline underline-offset-2 hover:text-ink">
            {form.privacyLink[lang]}
          </a>
          {form.consentAfter[lang]}
        </span>
      </label>

      <button type="submit" disabled={status === "sending"} className="btn mt-6 disabled:opacity-60">
        {status === "sending" ? f.sending[lang] : f.submit[lang]}
      </button>
    </form>
  );
}

function PricingInfo({ work, lang }: { work: Work; lang: Lang }) {
  const p = t.pricing;
  /* a price agreed for this client; without it, the three standard options */
  const pricing = work.pricing;
  const telegramText = `${p.telegramText[lang]}${work.title[lang]} (ivanbogush.ru/works/${work.id})`;
  const telegram = (text: string) => `${profile.telegramUrl}?text=${encodeURIComponent(text)}`;
  const includes = (lines: { ru: string; en: string }[]) => (
    <ul className="mt-3 space-y-2">
      {lines.map((line, idx) => (
        <li key={idx} className="flex gap-3 text-[16px] leading-[1.5]">
          <span aria-hidden="true" className="mt-[11px] h-px w-3 shrink-0 bg-muted" />
          <span>{line[lang]}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      {pricing ? (
        <>
          <div className="rounded-xl bg-paper p-5">
            <p className="label">{p.priceLabel[lang]}</p>
            {pricing.price ? (
              <p className="num mt-2 text-[28px] leading-tight">{pricing.price[lang]}</p>
            ) : (
              <p className="mt-2 text-[16px] leading-[1.55] text-ink">{p.priceOnCall[lang]}</p>
            )}
            {pricing.timeline && (
              <>
                <p className="label mt-5">{p.timelineLabel[lang]}</p>
                <p className="mt-2 text-ink">{pricing.timeline[lang]}</p>
              </>
            )}
          </div>

          <p className="label mt-7">{p.includesLabel[lang]}</p>
          {includes(pricing.includes)}
        </>
      ) : (
        <>
          <p className="label">{p.optionsLabel[lang]}</p>
          <ul className="mt-3 space-y-3">
            {prices.tiers.map((tier) => (
              <li key={tier.id} className="rounded-xl border border-line p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="text-[18px] font-semibold leading-snug text-ink">{tier.name[lang]}</p>
                  <p className="num whitespace-nowrap text-[22px] leading-tight">{formatPrice(tier.price, lang)}</p>
                </div>
                <p className="mt-1 text-[15px] leading-[1.5] text-muted">{tier.summary[lang]}</p>
                {includes(tier.includes)}
                <a
                  href={telegram(`${telegramText}. ${p.chooseText[lang]} «${tier.name[lang]}» — ${formatPrice(tier.price, lang)}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link mt-4 inline-block text-[15px]"
                >
                  {p.choose[lang]}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="label mt-7">{p.stepsLabel[lang]}</p>
      <ol className="mt-3 space-y-3">
        {p.steps.map((step, idx) => (
          <li key={idx} className="flex gap-3 text-[16px] leading-[1.5]">
            <span className="num w-4 shrink-0 text-[15px] text-accent">{idx + 1}</span>
            <span>{step[lang]}</span>
          </li>
        ))}
      </ol>

      <p className="label mt-8">{p.contactLabel[lang]}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a href={telegram(telegramText)} target="_blank" rel="noopener noreferrer" className="btn">
          {p.telegramCta[lang]}
        </a>
        <a href={`mailto:${profile.email}`} className="link">
          {profile.email}
        </a>
        <a href={profile.phoneHref} className="link whitespace-nowrap">
          {profile.phone}
        </a>
      </div>

      <p className="mt-8 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-5 text-[14px] text-muted">
        {legalLinks.slice(0, 2).map((item) => (
          <a key={item.href} href={item.href} target="_blank" className="underline underline-offset-2 hover:text-ink">
            {item.label[lang]}
          </a>
        ))}
      </p>
    </div>
  );
}
