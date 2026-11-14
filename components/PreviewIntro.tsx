"use client";

import { useEffect, useRef, type TransitionEvent } from "react";
import { Lang, preview as t, profile } from "@/data/content";
import type { Intro } from "@/data/works";
import "./preview-intro.css";

/** "wait": the page hasn't decided yet whether to show it (blank white) · "shown" · "leaving": fading off the site */
export type IntroState = "wait" | "shown" | "leaving";

/*
 * The first thing a client sees at their preview link: a white page with one large line to them by name, which
 * opens a question the site answers, and one button. The site is already loading underneath; the button takes
 * the white off it (preview-intro.css). Like a slide of a set-up screen: nothing else on it but who is speaking.
 *
 * WorkPreview.tsx decides when it shows (first visit only) and makes the site behind it inert meanwhile. Until it
 * has decided, the page as it arrives from the server is blank white: a returning client never glimpses the line.
 */
export default function PreviewIntro({
  intro,
  lang,
  state,
  onShow,
  onGone,
}: {
  intro: Intro;
  lang: Lang;
  state: IntroState;
  onShow: () => void;
  /** it has faded out */
  onGone: () => void;
}) {
  const button = useRef<HTMLButtonElement>(null);

  // the one thing to do here is press the button: Enter or Space does it straight away
  useEffect(() => {
    if (state === "shown") button.current?.focus({ preventScroll: true });
  }, [state]);

  // the screen's own fade, not a child's
  const onEnd = (e: TransitionEvent<HTMLElement>) => {
    if (state === "leaving" && e.target === e.currentTarget && e.propertyName === "opacity") onGone();
  };

  return (
    <section className="intro" data-state={state} aria-labelledby="intro-text" onTransitionEnd={onEnd}>
      {/* without scripts the button can't work: show the site instead */}
      <noscript>
        <style>{".intro{display:none}"}</style>
      </noscript>

      <div className="intro-body">
        <h1 id="intro-text" className="intro-text">
          {intro.text}
        </h1>
        <button ref={button} type="button" disabled={state !== "shown"} onClick={onShow} className="intro-go btn gap-2 px-7 py-3.5 text-[17px]">
          {intro.button ?? t.intro.show[lang]}
          <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </button>
      </div>

      <p className="intro-sign">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/ivan_bogush_avatar.jpg" alt="" width={28} height={28} />
        {profile.name[lang]}
      </p>
    </section>
  );
}
