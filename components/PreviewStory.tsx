"use client";

import { useEffect, useRef } from "react";
import { Lang, preview as t } from "@/data/content";
import type { Story } from "@/data/works";
import type { PanelTab } from "@/components/PreviewPanel";

/*
 * The story tab: why this client needs this site, in chapters. Each chapter can point at a part of the site:
 * as the client scrolls the site, the chapter about what they're looking at is marked and brought into view,
 * and "show on the site" scrolls the site to it.
 */
export default function PreviewStory({
  story,
  lang,
  active,
  onShow,
  onTab,
}: {
  story: Story;
  lang: Lang;
  /** the anchor of the part of the site in view */
  active: string | null;
  onShow: (anchor: string) => void;
  onTab: (tab: PanelTab) => void;
}) {
  const s = t.story;
  const list = useRef<HTMLOListElement>(null);
  // after "show on the site" the site scrolls past other chapters' parts: don't chase them
  const quietUntil = useRef(0);

  useEffect(() => {
    if (!active || Date.now() < quietUntil.current) return;
    const el = Array.from(list.current?.children ?? []).find((li) => (li as HTMLElement).dataset.anchor === active);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [active]);

  const words = [story.title, ...story.lead, ...story.chapters.flatMap((c) => [c.title, ...c.text, c.seen ?? ""]), ...(story.closing?.text ?? [])]
    .join(" ")
    .split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 170));

  return (
    <article>
      <p className="label">
        {s.label[lang]} · {minutes} {s.minutes[lang]}
      </p>
      <h2 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.01em] text-ink">{story.title}</h2>
      <div className="mt-4 space-y-3 text-[17px] leading-[1.6] text-ink">
        {story.lead.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <ol ref={list} className="mt-9 space-y-9">
        {story.chapters.map((c, i) => {
          const on = !!c.anchor && c.anchor === active;
          return (
            <li
              key={i}
              data-anchor={c.anchor}
              className={`scroll-my-4 border-l-2 pl-4 transition-colors duration-300 ${on ? "border-accent" : "border-line"}`}
            >
              <p className="num text-[13px] text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 text-[19px] font-semibold leading-snug text-ink">{c.title}</h3>
              <div className="mt-2 space-y-3 text-[16px] leading-[1.6]">
                {c.text.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
              {c.seen && (
                <p className="mt-4 rounded-lg bg-paper px-3.5 py-3 text-[14px] leading-[1.5] text-body">
                  <span className="label mb-1 block">{s.seen[lang]}</span>
                  {c.seen}
                </p>
              )}
              {c.anchor && (
                <button
                  type="button"
                  className="link mt-3 text-[15px]"
                  onClick={() => {
                    quietUntil.current = Date.now() + 1800;
                    onShow(c.anchor!);
                  }}
                >
                  {s.show[lang]} ↗
                </button>
              )}
            </li>
          );
        })}
      </ol>

      {story.closing && (
        <div className="mt-10 border-t border-line pt-7">
          <h3 className="text-[19px] font-semibold leading-snug text-ink">{story.closing.title}</h3>
          <div className="mt-2 space-y-3 text-[16px] leading-[1.6]">
            {story.closing.text.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" className="btn" onClick={() => onTab("feedback")}>
          {s.toFeedback[lang]}
        </button>
        <button type="button" className="link" onClick={() => onTab("pricing")}>
          {s.toPricing[lang]}
        </button>
      </div>

      {story.sources && story.sources.length > 0 && (
        <div className="mt-10 text-[13px] leading-[1.5] text-muted">
          <p className="label">{s.sources[lang]}</p>
          <ul className="mt-2 space-y-1">
            {story.sources.map((src, i) => (
              <li key={i}>{src}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
