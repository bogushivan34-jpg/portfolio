"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from "react";
import { FeatureText } from "@/components/Hint";
import { Lang, formatPrice, prices, quoted, type FeatureIcon, type Tier } from "@/data/content";
import "./plans.css";

/** "static": no motion · "armed": further down the card, hidden, waiting · "in": play */
export type View = "static" | "armed" | "in";

/** on the server there is no layout to read: fall back to a plain effect there */
const useLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

export const cssVars = (vars: Record<string, string | number>) => vars as CSSProperties;

/*
 * A block's entrance (plans.css), decided as the pricing card opens, before anything is painted:
 *  - in sight: it plays at once;
 *  - further down the card's scroll: it is hidden and plays when it's scrolled to (`late` says so, so that it
 *    doesn't also wait for its turn among blocks that came in long ago).
 * Under reduced motion nothing plays and nothing is ever hidden.
 */
export function useEntrance<T extends HTMLElement>(): [RefObject<T>, View, boolean] {
  const ref = useRef<T>(null);
  const [state, setState] = useState<{ view: View; late: boolean }>({ view: "static", late: false });

  useLayout(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // measured against the box that scrolls: the card's body (PreviewPopup.tsx)
    const box = el.closest<HTMLElement>("[data-scroll-box]");
    const top = el.getBoundingClientRect().top - (box ? box.getBoundingClientRect().top : 0);
    const room = box ? box.clientHeight : window.innerHeight;
    if (top < room - 40 || !("IntersectionObserver" in window)) {
      setState({ view: "in", late: false });
      return;
    }
    setState({ view: "armed", late: true });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState({ view: "in", late: true });
        io.disconnect();
      },
      { root: box, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, state.view, state.late];
}

/* The small line icons beside the features. Each stroke is a path of its own, so that it can draw itself. */
const ICONS: Record<FeatureIcon | "check" | "plus", string[]> = {
  check: ["M4.5 10.5l3.5 3.5 7.5-8.5"],
  plus: ["M10 4.5v11", "M4.5 10h11"],
  // domain and hosting: a globe
  host: [
    "M10 2.75a7.25 7.25 0 1 0 0 14.5a7.25 7.25 0 0 0 0-14.5z",
    "M2.75 10h14.5",
    "M10 2.75c2.2 2 3.25 4.4 3.25 7.25S12.2 15.25 10 17.25C7.8 15.25 6.75 12.85 6.75 10S7.8 4.75 10 2.75z",
  ],
  // the admin page: a window with lines of content
  admin: [
    "M3 5.5A1.75 1.75 0 0 1 4.75 3.75h10.5A1.75 1.75 0 0 1 17 5.5v9a1.75 1.75 0 0 1-1.75 1.75H4.75A1.75 1.75 0 0 1 3 14.5z",
    "M3 7.5h14",
    "M6 10.5h5",
    "M6 13h8",
  ],
  // analytics: a chart
  chart: ["M3.5 3.5v13h13", "M6.5 12.5l3-3.5 2.5 2 4-5.5"],
  // access without a VPN: a shield with a tick
  access: ["M10 2.75l6 2.25v4.6c0 3.7-2.5 6.3-6 7.65c-3.5-1.35-6-3.95-6-7.65V5z", "M7.3 9.9l1.9 1.9l3.5-3.9"],
  // sign-in: a user
  login: ["M10 3.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6z", "M4 16.5c.7-3 3-4.5 6-4.5s5.3 1.5 6 4.5"],
  // generative search: a spark
  geo: [
    "M9 3.5c.65 3.9 2.6 5.85 6.5 6.5c-3.9.65-5.85 2.6-6.5 6.5c-.65-3.9-2.6-5.85-6.5-6.5c3.9-.65 5.85-2.6 6.5-6.5z",
    "M15.5 2.75v3.5",
    "M13.75 4.5h3.5",
  ],
  // the Telegram bot: a paper plane
  telegram: ["M17 3.25L2.75 8.6l5.1 1.9l1.9 5.75z", "M17 3.25L7.85 10.5"],
  // online payment: a card
  pay: [
    "M2.5 6.25A1.75 1.75 0 0 1 4.25 4.5h11.5a1.75 1.75 0 0 1 1.75 1.75v7.5a1.75 1.75 0 0 1-1.75 1.75H4.25A1.75 1.75 0 0 1 2.5 13.75z",
    "M2.5 8.25h15",
    "M5.5 12.25h3",
  ],
  // booking: a calendar with a day ticked
  booking: [
    "M3 6A1.75 1.75 0 0 1 4.75 4.25h10.5A1.75 1.75 0 0 1 17 6v9a1.75 1.75 0 0 1-1.75 1.75H4.75A1.75 1.75 0 0 1 3 15z",
    "M6.75 2.75v3",
    "M13.25 2.75v3",
    "M7 11.6l2.1 2.1l3.9-4.4",
  ],
  // brand identity: two shapes
  identity: ["M8 3.5a4.25 4.25 0 1 0 0 8.5a4.25 4.25 0 0 0 0-8.5z", "M9.5 9.5h7v7h-7z"],
  // a second language
  lang: ["M3 5.5h8", "M7 3.5v2", "M4.75 5.5c.4 2.9 2.2 4.9 5 5.75", "M9.25 5.5c-.5 2.9-2.6 4.9-6 5.75", "M10.5 17l3-7.25l3 7.25", "M11.6 14.5h3.8"],
};

/** An icon on its tile, at the start of a line. Decoration: the line says the same in words. */
export function LineIcon({ name = "check", tone }: { name?: keyof typeof ICONS; tone?: "ink" }) {
  return (
    <span aria-hidden="true" className="pl-tile" data-tone={tone}>
      <svg viewBox="0 0 20 20" className="pl-icon" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {ICONS[name].map((d, k) => (
          <path key={k} d={d} pathLength={1} style={cssVars({ "--k": k })} />
        ))}
      </svg>
    </span>
  );
}

/*
 * The three plans, each building on the one before, as compact cards for the pricing card of a client's preview
 * (PreviewPopup.tsx). That card is the only place prices are shown: the main page has none.
 *
 * The one place with staged motion, at Ivan's request (13 November 2026), made for the size of that card: a plan
 * comes up, its level bars grow, the price rolls in, and its lines follow one by one with their icons drawing
 * themselves. No pictures or banners: he asked for motion in the plans as they sit in the card (14 November).
 */
export default function Plans({
  lang,
  cta,
  hrefFor,
  delay = 0,
}: {
  lang: Lang;
  /** the link under each plan */
  cta: string;
  /** where that link leads for a plan */
  hrefFor: (tier: Tier) => string;
  /** ms before the first plan starts: the card is still arriving */
  delay?: number;
}) {
  return (
    <ul className="plans">
      {prices.tiers.map((tier, index) => (
        <Plan key={tier.id} tier={tier} index={index} lang={lang} cta={cta} href={hrefFor(tier)} delay={delay} />
      ))}
    </ul>
  );
}

function Plan({
  tier,
  index,
  lang,
  cta,
  href,
  delay,
}: {
  tier: Tier;
  index: number;
  lang: Lang;
  cta: string;
  href: string;
  delay: number;
}) {
  const [card, view, late] = useEntrance<HTMLLIElement>();
  const frame = useRef(0);

  const base = prices.tiers.find((t) => t.id === tier.extends);
  const price = formatPrice(tier.price, lang);
  const lines = tier.features.length + (base ? 1 : 0);
  // a plan scrolled to starts at once; one that opens with the card waits for the card and for its turn
  const wait = late ? 0 : delay + index * 110;

  // the green edge follows the pointer
  const onMove = (e: PointerEvent<HTMLLIElement>) => {
    if (e.pointerType !== "mouse" || frame.current) return;
    const el = e.currentTarget;
    const { clientX, clientY } = e;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${clientX - rect.left}px`);
      el.style.setProperty("--my", `${clientY - rect.top}px`);
    });
  };
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <li ref={card} data-view={view} className="plan pr-rise" style={cssVars({ "--t": `${wait}ms` })} onPointerMove={onMove}>
      <span aria-hidden="true" className="plan-glow" />

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="flex items-baseline gap-2.5 text-[18px] font-semibold leading-snug text-ink">
          <span aria-hidden="true" className="pl-meter" data-level={index + 1}>
            {[0, 1, 2].map((k) => (
              <i key={k} style={cssVars({ "--k": k })} />
            ))}
          </span>
          {tier.name[lang]}
        </h3>
        <p className="num whitespace-nowrap text-[22px] leading-tight">
          <span className="sr-only">{price}</span>
          <span aria-hidden="true">
            {Array.from(price).map((ch, c) => (
              <span key={c} className="pr-char">
                <span style={cssVars({ "--c": c })}>{ch}</span>
              </span>
            ))}
          </span>
        </p>
      </div>
      <p className="mt-1 text-[15px] leading-[1.5] text-muted">{tier.summary[lang]}</p>

      <span aria-hidden="true" className="pl-rule mt-4" />

      <ul className="mt-4 space-y-3">
        {base && (
          <li className="pr-line flex gap-3 text-[15px] font-medium leading-[1.5] text-ink" style={cssVars({ "--j": 0 })}>
            <LineIcon name="plus" tone="ink" />
            <span>
              {prices.everythingIn[lang]} {quoted(base.name[lang], lang)}, {prices.plus[lang]}:
            </span>
          </li>
        )}
        {tier.features.map((feature, j) => (
          <li key={j} className="pr-line flex gap-3 text-[15px] leading-[1.5]" style={cssVars({ "--j": j + (base ? 1 : 0) })}>
            <LineIcon name={feature.icon} />
            <span>
              <FeatureText feature={feature} lang={lang} />
              {feature.optional && (
                <span className="ml-2 whitespace-nowrap rounded-md bg-paper px-1.5 py-0.5 align-[1px] text-[12px] text-muted">
                  {prices.optional[lang]}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="plan-cta link mt-4 inline-flex items-center gap-1.5 text-[15px]"
        style={cssVars({ "--j": lines })}
      >
        {cta}
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </a>
    </li>
  );
}
