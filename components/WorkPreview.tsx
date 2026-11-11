"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PreviewPanel, { type PanelTab } from "@/components/PreviewPanel";
import { Lang, preview as t, profile } from "@/data/content";
import type { Work } from "@/data/works";
import { currentAnchor, findAnchor } from "@/lib/siteFrame";

type Device = "desktop" | "phone";

/** Beside the docked panel the site keeps the layout it had, up to this width, and is scaled down to fit. */
const SITE_WIDTH = 1280;

/*
 * A client's site concept inside the portfolio. The site comes first: it fills the page the moment the link
 * opens, with nothing in front of it. Above it sits a slim bar; the story, feedback and pricing wait in a side
 * panel the client opens when they want it. On a computer the panel docks beside the site, so the story can be
 * read along with it: the page follows which part of the site is in view.
 */
export default function WorkPreview({ work }: { work: Work }) {
  const [lang, setLang] = useState<Lang>("ru");
  const [device, setDevice] = useState<Device>("desktop");
  const [panel, setPanel] = useState<PanelTab | null>(null);
  const [wide, setWide] = useState(false); // ≥ 1024px: the panel docks beside the site
  const [area, setArea] = useState({ w: 0, h: 0, full: 0 });
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [nudge, setNudge] = useState<"waiting" | "shown" | "gone">("waiting");

  const frame = useRef<HTMLIFrameElement>(null);
  const siteArea = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const scrollMemory = useRef<Partial<Record<PanelTab, number>>>({});

  const story = work.story;
  const anchors = useMemo(() => (story?.chapters ?? []).map((c) => c.anchor).filter((a): a is string => !!a), [story]);
  const src = `/previews/${work.id}/index.html`;
  const nudgeKey = `work-story-${work.id}`;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("lang") === "en") setLang("en");
    try {
      if (sessionStorage.getItem(nudgeKey)) setNudge("gone");
    } catch {
      /* private mode: the invitation just shows again next time */
    }
  }, [nudgeKey]);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // the room the site has
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => setWide(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    const el = siteArea.current!;
    const ro = new ResizeObserver(() => setArea({ w: el.clientWidth, h: el.clientHeight, full: window.innerWidth }));
    ro.observe(el);
    return () => {
      mq.removeEventListener("change", onMq);
      ro.disconnect();
    };
  }, []);

  // follow the site's scroll: which story chapter it's at, and whether the client has looked around
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
        return; // not our own page: no read-along
      }
      let raf = 0;
      const measure = () => {
        raf = 0;
        const max = doc.documentElement.scrollHeight - win.innerHeight;
        if (max > 0 && win.scrollY / max > 0.3) setNudge((n) => (n === "waiting" ? "shown" : n));
        if (anchors.length) setActiveAnchor(currentAnchor(win, doc, anchors));
      };
      const onScroll = () => {
        if (!raf) raf = win.requestAnimationFrame(measure);
      };
      win.addEventListener("scroll", onScroll, { passive: true });
      measure();
      detach = () => {
        win.removeEventListener("scroll", onScroll);
        if (raf) win.cancelAnimationFrame(raf);
      };
    };
    el.addEventListener("load", attach);
    attach();
    return () => {
      el.removeEventListener("load", attach);
      detach();
    };
  }, [anchors]);

  // the invitation to the story also appears after a while, for those who read slowly at the top
  useEffect(() => {
    const timer = setTimeout(() => setNudge((n) => (n === "waiting" ? "shown" : n)), 40_000);
    return () => clearTimeout(timer);
  }, []);
  const dismissNudge = useCallback(() => {
    setNudge("gone");
    try {
      sessionStorage.setItem(nudgeKey, "1");
    } catch {
      /* ignore */
    }
  }, [nudgeKey]);

  const openPanel = (tab: PanelTab) => (e: React.MouseEvent<HTMLButtonElement>) => {
    opener.current = e.currentTarget;
    if (tab === "story") dismissNudge();
    setPanel((p) => (p === tab ? null : tab));
  };
  const closePanel = useCallback(() => {
    setPanel(null);
    opener.current?.focus();
  }, []);
  const showOnSite = useCallback(
    (anchor: string) => {
      try {
        const doc = frame.current?.contentDocument;
        if (doc) findAnchor(doc, anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        /* ignore */
      }
      if (!wide) setPanel(null); // the panel covers the site on a small screen: step aside
    },
    [wide],
  );

  // Docked beside the panel, the site keeps its desktop layout and is scaled down to fit.
  const docked = wide && panel !== null;
  const scaled = useMemo(() => {
    if (!docked || device !== "desktop" || !area.w) return null;
    const layout = Math.min(area.full, SITE_WIDTH);
    if (area.w >= layout) return null;
    const scale = area.w / layout;
    return { width: layout, height: area.h / scale, transform: `scale(${scale})`, transformOrigin: "0 0" } as const;
  }, [docked, device, area]);

  const barButton = (tab: PanelTab, long: string, short: string, primary = false) => (
    <button
      type="button"
      onClick={openPanel(tab)}
      aria-expanded={panel === tab}
      className={
        primary
          ? "rounded-lg bg-ink px-3 py-2 text-[14px] font-medium text-white transition-colors hover:bg-accent"
          : `rounded-lg border px-3 py-2 text-[14px] font-medium transition-colors ${
              panel === tab ? "border-accent bg-accentSoft text-accent" : "border-line text-ink hover:border-muted"
            }`
      }
    >
      <span className="hidden md:inline">{long}</span>
      <span className="md:hidden">{short}</span>
    </button>
  );

  return (
    <div className="flex h-[100dvh] flex-col bg-paper">
      <header className="relative z-20 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-3 sm:px-5">
        <a href="/" className="shrink-0 text-[15px] font-semibold text-ink">
          {profile.name[lang]}
        </a>
        <span aria-hidden="true" className="hidden text-line lg:inline">
          /
        </span>
        <p className="hidden min-w-0 truncate text-[15px] text-muted lg:block" title={work.title[lang]}>
          {work.title[lang]}
        </p>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div
            role="group"
            aria-label={`${t.desktop[lang]} / ${t.phone[lang]}`}
            className="hidden rounded-lg border border-line p-0.5 xl:flex"
          >
            {(["desktop", "phone"] as Device[]).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={device === d}
                onClick={() => setDevice(d)}
                className={`rounded-md px-3 py-1.5 text-[14px] transition-colors ${
                  device === d ? "bg-paper font-medium text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {d === "desktop" ? t.desktop[lang] : t.phone[lang]}
              </button>
            ))}
          </div>

          <a
            href={src}
            target="_blank"
            rel="noopener"
            className="hidden px-2 text-[14px] text-muted transition-colors hover:text-ink 2xl:inline"
          >
            {t.openSeparately[lang]} ↗
          </a>

          {story && barButton("story", t.storyButton[lang], t.storyShort[lang])}
          {barButton("feedback", t.feedbackButton[lang], t.feedbackShort[lang])}
          {barButton("pricing", t.pricingButton[lang], t.pricingShort[lang], true)}
        </div>
      </header>

      {work.placeholders && (
        <p className="shrink-0 border-b border-line bg-accentSoft px-4 py-1.5 text-center text-[13px] text-accent">
          {t.placeholders[lang]}
        </p>
      )}

      <main className="relative flex min-h-0 flex-1">
        <div ref={siteArea} className="relative flex min-w-0 flex-1 justify-center overflow-hidden">
          <iframe
            ref={frame}
            src={src}
            title={`${t.frameTitle[lang]}: ${work.title[lang]}`}
            style={scaled ?? undefined}
            className={
              device === "phone"
                ? "my-5 h-[calc(100%-40px)] max-h-[860px] w-[390px] rounded-[28px] border-[6px] border-ink bg-white shadow-[0_20px_60px_rgba(21,23,26,0.18)]"
                : scaled
                  ? "absolute left-0 top-0 max-w-none bg-white"
                  : "h-full w-full bg-white"
            }
          />

          {/* The invitation to the story: after they've looked around, never in front of the site */}
          {story && nudge === "shown" && panel === null && (
            <div className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-3 rounded-xl border border-line bg-white py-2.5 pl-4 pr-2 shadow-[0_10px_30px_rgba(21,23,26,0.16)] sm:inset-x-auto sm:left-4 sm:bottom-4 sm:max-w-[420px]">
              <p className="min-w-0 flex-1 text-[15px] leading-snug text-ink">{story.nudge ?? t.story.nudge[lang]}</p>
              <button
                type="button"
                onClick={openPanel("story")}
                className="shrink-0 rounded-lg bg-ink px-3 py-2 text-[14px] font-medium text-white transition-colors hover:bg-accent"
              >
                {t.story.nudgeRead[lang]}
              </button>
              <button
                type="button"
                onClick={dismissNudge}
                aria-label={t.story.nudgeClose[lang]}
                className="shrink-0 rounded-md px-2 py-2 text-[14px] text-muted transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {panel && (
          <PreviewPanel
            work={work}
            lang={lang}
            tab={panel}
            onTab={setPanel}
            onClose={closePanel}
            activeAnchor={activeAnchor}
            onShow={showOnSite}
            scrollMemory={scrollMemory}
          />
        )}
      </main>
    </div>
  );
}
