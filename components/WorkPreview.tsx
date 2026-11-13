"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PreviewNote, { END, TOP, buildNotes } from "@/components/PreviewNote";
import PreviewPopup, { type PopupView } from "@/components/PreviewPopup";
import { Lang, preview as t, profile } from "@/data/content";
import type { Work } from "@/data/works";
import { currentAnchor, findAnchor } from "@/lib/siteFrame";

/** How long the client stays on a part of the site before its note comes up, so a fast scroll doesn't flash them. */
const SETTLE_MS = 450;
/** The first note waits until the site has been seen for a moment. */
const FIRST_MS = 2500;
/** The closing note waits a little at the end of the site, so the last chapter's note can be read. */
const END_MS = 1500;
/** After the client steps to a note, the site scrolls there: the notes it passes on the way are skipped. */
const STEP_QUIET_MS = 1200;

/*
 * A client's site concept inside the portfolio. The site is the page: it fills the whole window, with no bar or
 * frame around it. What Ivan has to say comes as small notes in the bottom-right corner, beside his photo, one at
 * a time: the note about the part of the site in view, changing as the client scrolls. The photo opens a short
 * menu: the notes again, feedback and pricing, each in a small card over the corner.
 */
export default function WorkPreview({ work }: { work: Work }) {
  const [lang, setLang] = useState<Lang>("ru");
  const [open, setOpen] = useState<PopupView | "menu" | null>(null);
  const [place, setPlace] = useState<{ anchor: string | null; end: boolean }>({ anchor: null, end: false });
  const [shown, setShown] = useState<string | null>(null); // the note in the corner
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set()); // notes the client closed
  // notes folded into one line: the client's choice, kept from note to note; on a phone they start folded
  const [folded, setFolded] = useState(false);

  const frame = useRef<HTMLIFrameElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const firstNote = useRef(true);
  const quietUntil = useRef(0);

  const notes = useMemo(() => buildNotes(work, lang), [work, lang]);
  const anchors = useMemo(() => notes.map((n) => n.anchor).filter((a): a is string => !!a), [notes]);
  const src = `/previews/${work.id}/index.html`;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("lang") === "en") setLang("en");
    setFolded(window.matchMedia("(max-width: 639px)").matches);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const openRef = useRef(open);
  openRef.current = open;

  const close = useCallback(() => {
    setOpen(null);
    launcher.current?.focus({ preventScroll: true });
  }, []);

  // Esc closes the menu or card, wherever the focus is: on this page or inside the site
  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && openRef.current) close();
  }, [close]);
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  // a click anywhere else, the site included, closes the menu (never the feedback card: a half-written note stays)
  useEffect(() => {
    if (open !== "menu") return;
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menu.current?.contains(target) && !launcher.current?.contains(target)) setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // follow the site's scroll: which part of it is in view, and whether the client has reached the end
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    let detach = () => {};
    const attach = () => {
      detach();
      let win: Window, doc: Document;
      try {
        win = el.contentWindow!;
        doc = el.contentDocument!;
        if (!doc?.body || win.location.href === "about:blank") return;
      } catch {
        return; // not our own page: no notes that follow it
      }
      let raf = 0;
      const measure = () => {
        raf = 0;
        const max = doc.documentElement.scrollHeight - win.innerHeight;
        const end = max > 0 && win.scrollY >= max - 4;
        const anchor = anchors.length ? currentAnchor(win, doc, anchors) : null;
        setPlace((p) => (p.end === end && p.anchor === anchor ? p : { anchor, end }));
      };
      const onScroll = () => {
        if (!raf) raf = win.requestAnimationFrame(measure);
      };
      const onDown = () => openRef.current === "menu" && setOpen(null);
      win.addEventListener("scroll", onScroll, { passive: true });
      win.addEventListener("resize", onScroll);
      win.addEventListener("pointerdown", onDown);
      win.addEventListener("keydown", onKey);
      measure();
      detach = () => {
        win.removeEventListener("scroll", onScroll);
        win.removeEventListener("resize", onScroll);
        win.removeEventListener("pointerdown", onDown);
        win.removeEventListener("keydown", onKey);
        if (raf) win.cancelAnimationFrame(raf);
      };
    };
    el.addEventListener("load", attach);
    attach();
    return () => {
      el.removeEventListener("load", attach);
      detach();
    };
  }, [anchors, onKey]);

  // the note the site's position calls for: the closing one at the end, a chapter's in its part, else the lead
  const placed = useMemo(() => {
    if (place.end) return "end";
    const chapter = place.anchor ? notes.find((n) => n.anchor === place.anchor) : undefined;
    if (chapter) return chapter.key;
    return notes[0].key === "lead" ? "lead" : null;
  }, [place, notes]);

  useEffect(() => {
    const wait = firstNote.current ? FIRST_MS : placed === "end" ? END_MS : SETTLE_MS;
    const timer = setTimeout(
      () => {
        if (Date.now() < quietUntil.current) return; // the site is still scrolling to a note the client chose
        firstNote.current = false;
        setShown(placed);
      },
      Math.max(wait, quietUntil.current - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [placed]);

  const scrollSite = useCallback((to: string) => {
    try {
      const win = frame.current?.contentWindow;
      const doc = frame.current?.contentDocument;
      if (!win || !doc) return;
      const behavior: ScrollBehavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      if (to === TOP) win.scrollTo({ top: 0, behavior });
      else if (to === END) win.scrollTo({ top: doc.documentElement.scrollHeight, behavior });
      else findAnchor(doc, to)?.scrollIntoView({ behavior, block: "start" });
    } catch {
      /* not our own page */
    }
  }, []);

  const step = (index: number) => {
    const note = notes[index];
    if (!note) return;
    quietUntil.current = Date.now() + STEP_QUIET_MS;
    firstNote.current = false;
    setShown(note.key);
    setHidden((h) => {
      if (!h.has(note.key)) return h;
      const rest = new Set(h);
      rest.delete(note.key);
      return rest;
    });
    if (note.to) scrollSite(note.to);
  };

  const hide = (key: string) => setHidden((h) => new Set(h).add(key));

  const showNotes = () => {
    setOpen(null);
    setHidden(new Set());
    setFolded(false);
    firstNote.current = false;
    setShown((s) => s ?? placed ?? notes[0].key);
  };

  const index = shown ? notes.findIndex((n) => n.key === shown) : -1;
  const note = index >= 0 && !hidden.has(notes[index].key) && !open ? notes[index] : null;

  const menuItem =
    "block w-full rounded-lg px-3 py-2.5 text-left text-[15px] text-ink transition-colors hover:bg-paper focus-visible:bg-paper";

  return (
    <div className="fixed inset-0 bg-white">
      <iframe
        ref={frame}
        src={src}
        title={`${t.frameTitle[lang]}: ${work.title[lang]}`}
        className="block h-full w-full border-0 bg-white"
      />

      {/* the corner: the note in view and Ivan's photo; everything else on the screen is the site */}
      <div className="pointer-events-none fixed inset-x-3 bottom-3 z-20 flex items-end justify-end gap-2.5 sm:inset-x-auto sm:bottom-5 sm:right-5">
        {/* stays in place while notes come and go, so a screen reader reads each new one */}
        <div aria-live="polite" className="flex min-w-0 flex-1 justify-end sm:flex-none">
          {note && (
            <PreviewNote
              key={note.key}
              note={note}
              index={index}
              count={notes.length}
              lang={lang}
              collapsed={folded}
              onToggle={() => setFolded((f) => !f)}
              onStep={step}
              onHide={() => hide(note.key)}
              onFeedback={() => setOpen("feedback")}
              onPricing={() => setOpen("pricing")}
            />
          )}
        </div>

        <button
          ref={launcher}
          type="button"
          onClick={() => setOpen((o) => (o ? null : "menu"))}
          aria-label={t.menu.open[lang]}
          title={t.menu.open[lang]}
          aria-expanded={open !== null}
          className="pointer-events-auto relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-paper shadow-[0_6px_20px_rgba(21,23,26,0.25)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ivan_bogush_avatar.jpg" alt="" width={48} height={48} className="h-full w-full object-cover" />
          {open && (
            <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-ink/70 text-[16px] text-white">
              ✕
            </span>
          )}
        </button>
      </div>

      {open === "menu" && (
        <div
          ref={menu}
          role="group"
          aria-label={t.menu.open[lang]}
          className="note-in fixed bottom-[72px] right-3 z-30 w-[min(300px,calc(100vw-24px))] rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_40px_rgba(21,23,26,0.2)] sm:bottom-[84px] sm:right-5"
        >
          <div className="px-3 pb-2 pt-2">
            <p className="text-[15px] font-semibold leading-snug text-ink">{profile.name[lang]}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-muted">{work.title[lang]}</p>
          </div>
          {work.story && (
            <button type="button" autoFocus onClick={showNotes} className={menuItem}>
              {t.menu.notes[lang]}
            </button>
          )}
          <button type="button" autoFocus={!work.story} onClick={() => setOpen("feedback")} className={menuItem}>
            {t.menu.feedback[lang]}
          </button>
          <button type="button" onClick={() => setOpen("pricing")} className={menuItem}>
            {t.menu.pricing[lang]}
          </button>
          <a href="/" target="_blank" rel="noopener" className={`${menuItem} text-muted`}>
            {t.menu.home[lang]} ↗
          </a>
          {work.placeholders && (
            <p className="mx-3 mb-1.5 mt-1 border-t border-line pt-2.5 text-[12.5px] leading-[1.45] text-muted">
              {t.placeholders[lang]}
            </p>
          )}
        </div>
      )}

      {(open === "feedback" || open === "pricing") && <PreviewPopup work={work} lang={lang} view={open} onClose={close} />}
    </div>
  );
}
