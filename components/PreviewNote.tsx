"use client";

import { Lang, preview as t } from "@/data/content";
import type { Work } from "@/data/works";

/** Where a note takes the site when the client steps to it: the top, the very end, or a story anchor. */
export const TOP = "@top";
export const END = "@end";

export interface Note {
  key: string;
  title: string;
  /** the one line a phone shows before the note is opened (the lead's `nudge`) */
  teaser?: string;
  text: string[];
  seen?: string;
  sources?: string[];
  /** the part of the site this note is about: it pops up when that part is in view */
  anchor?: string;
  /** where stepping to this note scrolls the site */
  to?: string;
  /** the closing note, which carries the feedback and pricing buttons */
  end?: boolean;
  /** the site still has stand-in pictures: said small on the first note */
  draft?: boolean;
}

/**
 * The story as a row of short notes: the lead, one per chapter, and a closing one with the way to answer.
 * A work without a story still gets the closing note, so the client is asked what they think.
 */
export function buildNotes(work: Work, lang: Lang): Note[] {
  const s = work.story;
  const notes: Note[] = [];
  if (s) {
    notes.push({ key: "lead", title: s.title, teaser: s.nudge, text: s.lead, to: TOP });
    s.chapters.forEach((c, i) =>
      notes.push({ key: `c${i}`, title: c.title, text: c.text, seen: c.seen, anchor: c.anchor, to: c.anchor }),
    );
  }
  notes.push({
    key: "end",
    end: true,
    title: s?.closing?.title ?? t.notes.endTitle[lang],
    text: s?.closing?.text ?? [t.notes.endText[lang]],
    sources: s?.sources,
    to: END,
  });
  if (work.placeholders) notes[0].draft = true;
  return notes;
}

const iconButton =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[15px] text-muted transition-colors hover:bg-paper hover:text-ink disabled:pointer-events-none disabled:opacity-30";

/** Small line icons for the note's buttons, drawn in the text colour */
function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
const LEFT = "M10 3.5 5.5 8l4.5 4.5";
const RIGHT = "M6 3.5 10.5 8 6 12.5";
const DOWN = "M3.5 6 8 10.5 12.5 6";
const UP = "M3.5 10 8 5.5l4.5 4.5";
const CROSS = "M4 4l8 8M12 4l-8 8";

/*
 * One note in the corner of the site, beside Ivan's photo: small, so the site stays in view. It folds into a
 * single line whenever the client wants more of the site (on a phone it starts that way), and the next notes
 * keep the way the client left the last one.
 */
export default function PreviewNote({
  note,
  index,
  count,
  lang,
  collapsed,
  onToggle,
  onStep,
  onHide,
  onFeedback,
  onPricing,
}: {
  note: Note;
  index: number;
  count: number;
  lang: Lang;
  /** folded into one line */
  collapsed: boolean;
  onToggle: () => void;
  onStep: (index: number) => void;
  onHide: () => void;
  onFeedback: () => void;
  onPricing: () => void;
}) {
  const n = t.notes;
  const counter = `${index + 1} ${n.of[lang]} ${count}`;

  const hide = (
    <button type="button" onClick={onHide} aria-label={n.hide[lang]} title={n.hide[lang]} className={iconButton}>
      <Icon d={CROSS} />
    </button>
  );

  if (collapsed) {
    return (
      <div className="note-in pointer-events-auto flex min-w-0 flex-1 items-center gap-0.5 rounded-2xl border border-line bg-white py-1.5 pl-3.5 pr-1.5 shadow-[0_8px_28px_rgba(21,23,26,0.16)] sm:max-w-[320px] sm:flex-none">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={false}
          title={n.unfold[lang]}
          className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-[14px] font-medium text-ink"
        >
          <span className="num shrink-0 text-[12px] text-accent">
            {index + 1}/{count}
          </span>
          <span className="line-clamp-2 min-w-0 flex-1 leading-snug">{note.teaser ?? note.title}</span>
          <span className="shrink-0 text-muted">
            <Icon d={UP} />
          </span>
        </button>
        {hide}
      </div>
    );
  }

  return (
    <section
      aria-label={`${n.note[lang]} ${counter}`}
      className="note-in pointer-events-auto flex max-h-[min(440px,calc(100dvh-96px))] min-w-0 flex-1 flex-col rounded-2xl border border-line bg-white shadow-[0_8px_28px_rgba(21,23,26,0.16)] sm:w-[320px] sm:flex-none"
    >
      <div className="flex shrink-0 items-center gap-0.5 pl-4 pr-1.5 pt-1.5">
        <p className="label flex-1 py-1 text-[11px]">
          {n.note[lang]} {counter}
        </p>
        <button
          type="button"
          onClick={() => onStep(index - 1)}
          disabled={index === 0}
          aria-label={n.prev[lang]}
          title={n.prev[lang]}
          className={iconButton}
        >
          <Icon d={LEFT} />
        </button>
        <button
          type="button"
          onClick={() => onStep(index + 1)}
          disabled={index === count - 1}
          aria-label={n.next[lang]}
          title={n.next[lang]}
          className={iconButton}
        >
          <Icon d={RIGHT} />
        </button>
        <button type="button" onClick={onToggle} aria-expanded={true} aria-label={n.fold[lang]} title={n.fold[lang]} className={iconButton}>
          <Icon d={DOWN} />
        </button>
        {hide}
      </div>

      <div className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-3.5">
        <p className="text-[15px] font-semibold leading-snug text-ink">{note.title}</p>
        {note.text.map((p, i) => (
          <p key={i} className="mt-1 text-[14px] leading-[1.5] text-body">
            {p}
          </p>
        ))}

        {note.seen && (
          <p className="mt-3 rounded-lg bg-paper px-3 py-2.5 text-[13px] leading-[1.5] text-body">
            <span className="label mb-0.5 block text-[11px]">{n.seen[lang]}</span>
            {note.seen}
          </p>
        )}

        {note.draft && <p className="mt-3 text-[13px] leading-[1.45] text-muted">{t.placeholders[lang]}</p>}

        {note.end && (
          <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={onFeedback}
              className="rounded-lg bg-ink px-3.5 py-2 text-[14px] font-medium text-white transition-colors hover:bg-accent"
            >
              {n.toFeedback[lang]}
            </button>
            <button type="button" onClick={onPricing} className="link text-[14px]">
              {n.toPricing[lang]}
            </button>
          </div>
        )}

        {note.sources && note.sources.length > 0 && (
          <details className="mt-4 text-[12.5px] leading-[1.5] text-muted">
            <summary className="cursor-pointer hover:text-ink">{n.sources[lang]}</summary>
            <ul className="mt-1.5 space-y-1">
              {note.sources.map((src, i) => (
                <li key={i}>{src}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
