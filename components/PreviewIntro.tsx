"use client";

import { useEffect, useRef, type CSSProperties, type TransitionEvent } from "react";
import { Lang, preview as t } from "@/data/content";
import type { Intro } from "@/data/works";
import "./preview-intro.css";

/** "wait": the page hasn't decided yet whether to show it (blank white) · "shown" · "leaving": fading off the site */
export type IntroState = "wait" | "shown" | "leaving";

/** when the first word comes in, and the pace after it (seconds) */
const START = 0.35;
const WORD = 0.13;
const BREATH = 0.24;
const STOP = 0.4;

/*
 * The first thing a client sees at their preview link: one centred line on a white page, greeting on its own
 * line, which opens a question the site answers, and the button as its last words. The site is already loading
 * underneath; the button takes the page off it (preview-intro.css).
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

  // the one thing to do here is press the button: Enter or Space does it straight away. Without the focus ring:
  // a browser draws it for focus given by a script, and around a button set inside the line it cut through the
  // letters above. It still shows once the visitor presses Tab.
  useEffect(() => {
    if (state === "shown") button.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
  }, [state]);

  // the screen's own fade, not a child's
  const onEnd = (e: TransitionEvent<HTMLElement>) => {
    if (state === "leaving" && e.target === e.currentTarget && e.propertyName === "opacity") onGone();
  };

  // "Диляра, я придумал…": the name it opens with is the greeting, set on a line of its own
  const [, hello, rest] = intro.text.match(/^([^\s,]{2,24},)\s+([\s\S]+)$/) ?? [];

  /*
   * Said, not shown: each word comes in on its own, at an easy speaking pace, with a breath after a comma and a
   * longer one after a full stop. The button comes in last, once the line has been said.
   */
  let at = START;
  const say = (text: string) =>
    text.split(/\s+/).filter(Boolean).flatMap((word, i) => {
      const delay = at;
      at += WORD + (/[.!?…]$/.test(word) ? STOP : /[,;:—–]$/.test(word) ? BREATH : 0);
      return [i ? " " : null, <span key={i} className="intro-word" style={{ animationDelay: `${delay.toFixed(2)}s` }}>{word}</span>];
    });
  const line = hello ? (
    <>
      <span className="intro-hello">{say(hello)}</span> {say(rest)}
    </>
  ) : (
    say(intro.text)
  );
  const buttonDelay = at + BREATH;

  return (
    <section className="intro" data-state={state} aria-labelledby="intro-text" onTransitionEnd={onEnd}>
      {/* without scripts the button can't work: show the site instead */}
      <noscript>
        <style>{".intro{display:none}"}</style>
      </noscript>

      <div className="intro-body">
        {/* the button is the last words of the line: same type, set right after the full stop */}
        <div className="intro-text">
          <h1 id="intro-text">{line}</h1>{" "}
          <button
            ref={button}
            type="button"
            disabled={state !== "shown"}
            onClick={onShow}
            className="intro-go"
            style={{ "--at": `${buttonDelay.toFixed(2)}s` } as CSSProperties}
          >
            {intro.button ?? t.intro.show[lang]}
            <span className="intro-go-mark">
              <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
