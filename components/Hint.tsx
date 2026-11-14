"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Feature, Lang } from "@/data/content";
import "./hint.css";

/*
 * A term with a dashed underline and a short explanation that opens on hover, keyboard focus or tap.
 *
 * The explanation is a native popover (`popover="hint"`): it sits in the browser's top layer, so a card's rounded
 * corners never cut it off, and it closes with Esc or a tap elsewhere. The term is a button that both shows
 * interest (`interestfor`: hover, focus, long-press) and opens it on activation (`popovertarget`), so it works on
 * a phone and with a keyboard. Where the browser lacks a piece, this component fills it in itself, with no library:
 *  - no interest invokers: hover and focus open it here, with short delays, and the pointer may move onto the hint;
 *  - no "hint" popover type (it would act as "manual" and never close on a tap elsewhere): it opens as "auto";
 *  - no CSS anchor positioning: the hint is placed beside the term from its measured position;
 *  - no popover at all: a plain block above the term, shown and hidden by the same state.
 */
export default function Hint({ term, title, children }: { term: ReactNode; title?: string; children: ReactNode }) {
  const id = `hint-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const trigger = useRef<HTMLButtonElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const native = useRef(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const btn = trigger.current;
    const pop = tip.current as (HTMLSpanElement & { popover?: string | null }) | null;
    if (!btn || !pop) return;
    if (typeof pop.showPopover !== "function") {
      native.current = false; // shown and hidden by `open` alone (hint.css, "no popover")
      return;
    }

    const isOpen = () => pop.matches(":popover-open");
    const probe = document.createElement("div") as HTMLDivElement & { popover?: string | null };
    probe.setAttribute("popover", "hint");
    const hintType = probe.popover === "hint";
    const anchored = CSS.supports("anchor-name: --a") && CSS.supports("position-area: block-start");

    // without anchor positioning: above the term (below when there's no room), kept inside the window
    const place = () => {
      const r = btn.getBoundingClientRect();
      const width = Math.min(300, window.innerWidth - 16);
      const left = Math.min(Math.max(8, r.left + r.width / 2 - width / 2), window.innerWidth - width - 8);
      pop.style.left = `${left}px`;
      if (r.top > 170) {
        pop.style.top = "auto";
        pop.style.bottom = `${window.innerHeight - r.top + 8}px`;
      } else {
        pop.style.bottom = "auto";
        pop.style.top = `${r.bottom + 8}px`;
      }
    };
    const onBeforeToggle = (e: Event) => {
      if ((e as ToggleEvent).newState !== "open") return;
      if (!hintType) pop.popover = "auto"; // must change here: the browser reads the type after this event
      if (!anchored) place();
    };
    // the popover is the source of truth: Esc, a tap elsewhere or another hint can close it
    const onToggle = (e: Event) => setOpen((e as ToggleEvent).newState === "open");
    const onScroll = () => !anchored && isOpen() && pop.hidePopover();
    pop.addEventListener("beforetoggle", onBeforeToggle);
    pop.addEventListener("toggle", onToggle);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);

    // hover and focus, where the browser has no interest invokers
    let timer = 0;
    const show = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => !isOpen() && pop.showPopover(), 150);
    };
    const hide = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => isOpen() && pop.hidePopover(), 220);
    };
    const onEnter = (e: PointerEvent) => e.pointerType === "mouse" && show();
    const onLeave = (e: PointerEvent) => e.pointerType === "mouse" && hide();
    const onFocus = () => btn.matches(":focus-visible") && show();
    const manualInterest = !("interestForElement" in HTMLButtonElement.prototype);
    if (manualInterest) {
      btn.addEventListener("pointerenter", onEnter);
      btn.addEventListener("pointerleave", onLeave);
      pop.addEventListener("pointerenter", onEnter);
      pop.addEventListener("pointerleave", onLeave);
      btn.addEventListener("focus", onFocus);
      btn.addEventListener("blur", hide);
    }

    return () => {
      clearTimeout(timer);
      pop.removeEventListener("beforetoggle", onBeforeToggle);
      pop.removeEventListener("toggle", onToggle);
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
      if (manualInterest) {
        btn.removeEventListener("pointerenter", onEnter);
        btn.removeEventListener("pointerleave", onLeave);
        pop.removeEventListener("pointerenter", onEnter);
        pop.removeEventListener("pointerleave", onLeave);
        btn.removeEventListener("focus", onFocus);
        btn.removeEventListener("blur", hide);
      }
    };
  }, []);

  // attributes newer than React's types; a browser that doesn't know one ignores it
  const invoker = { interestfor: id, popovertarget: id, popovertargetaction: "show" } as Record<string, string>;
  const popover = { popover: "hint" } as Record<string, string>;
  const anchor = `--${id}`;

  return (
    <span className="hint-wrap">
      <button
        ref={trigger}
        type="button"
        className="hint-term"
        aria-expanded={open}
        style={{ anchorName: anchor } as React.CSSProperties}
        // no popover in this browser: the same button opens and closes the plain block
        onClick={() => !native.current && setOpen((o) => !o)}
        onBlur={() => !native.current && setOpen(false)}
        {...invoker}
      >
        {term}
      </button>
      {/* right after the term, so a screen reader reaches it in order once it's open */}
      <span
        ref={tip}
        id={id}
        role="tooltip"
        className="hint-pop"
        data-open={open}
        style={{ positionAnchor: anchor } as React.CSSProperties}
        {...popover}
      >
        {title && <span className="hint-title">{title}</span>}
        {children}
      </span>
    </span>
  );
}

/** A plan's feature line, with its term (if it has one) underlined and explained. */
export function FeatureText({ feature, lang }: { feature: Feature; lang: Lang }) {
  const text = feature.text[lang];
  const at = feature.term ? text.indexOf(feature.term.word) : -1;
  if (!feature.term || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <Hint term={feature.term.word} title={feature.term.title}>
        {feature.term.hint[lang]}
      </Hint>
      {text.slice(at + feature.term.word.length)}
    </>
  );
}
