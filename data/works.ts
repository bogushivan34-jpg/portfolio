import list from "./works.json";
import type { L, Pricing } from "./content";

/*
 * The site concepts published as previews at /works/<id>. scripts/add-work.mjs adds and updates entries;
 * each one's title, pricing and story come from the client's own file, ../peoplebrands/<client>/work.json.
 *
 * One entry is not a client's: "sample" (/works/sample), a public example of a preview with Ivan's own site
 * inside. It is where the plans and prices can be seen without being a client: the offer (/oferta) and the
 * payment page (/payment) link to it, and nothing else on the site does. Ivan, 14 November 2026: a visitor should
 * assume prices are worked out individually unless they dig into those documents.
 * Its notes are impersonal ("так выглядит превью…"), never "я" speaking to "клиент": beside Ivan's photo, on his
 * own site, that reads as him talking to himself (his correction, same day).
 */

/*
 * A short note to the client on what the site was built to do for them, in their own language: told in small
 * notes in the corner of the site, each popping up as the client scrolls to the part it's about. For a first contact it is two or three points and under 120 words, with no `seen` facts or
 * `sources`: those belong to the full version, written only for a client already talking to Ivan
 * (peoplebrands/AGENTS.md, "The story"; scripts/add-work.mjs enforces the length).
 */
export interface Story {
  /** the one line a phone shows for the first note before it's opened; the title is shown without it */
  nudge?: string;
  title: string;
  lead: string[];
  chapters: StoryChapter[];
  closing?: { title: string; text: string[] };
  /** what the story is based on, shown small at the end */
  sources?: string[];
}

export interface StoryChapter {
  title: string;
  text: string[];
  /** one checkable observation from the client's own site or channels */
  seen?: string;
  /**
   * The part of the site this chapter is about: a CSS selector ("#contact"), or a heading's text ("Что говорят").
   * The chapter's note pops up in the corner when this part scrolls into view, and stepping to the note scrolls
   * the site to it.
   */
  anchor?: string;
}

/*
 * The first screen of a preview: a white page with one short line to the client by name, which opens a question
 * the site answers ("Диляра, я придумал, как…"), and a button that reveals the site. In the client's own language.
 * Shown on the first visit from a browser; without it the preview opens straight on the site.
 */
export interface Intro {
  /** one sentence, large on the screen: keep it under about 80 characters */
  text: string;
  /** the button; «Показать» / "Show me" when left out */
  button?: string;
}

export interface Work {
  id: string;
  /** the client's folder in ../peoplebrands */
  client: string;
  /**
   * A page of this site shown inside the preview, instead of a concept built into public/previews/<id>/.
   * Only the sample has it (/works/sample shows the main page): written by hand in works.json, not by add-work.mjs.
   */
  site?: string;
  title: L;
  published: string;
  updated: string;
  /** a price agreed for this client; without it the pricing window shows the three options from data/content.ts (prices) */
  pricing?: Pricing;
  intro?: Intro;
  story?: Story;
  /** built with stand-in pictures: shows a "draft" note */
  placeholders?: boolean;
}

export const works = list as Work[];
