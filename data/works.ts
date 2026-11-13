import list from "./works.json";
import type { L, Pricing } from "./content";

/*
 * The site concepts published as previews at /works/<id>. scripts/add-work.mjs adds and updates entries;
 * each one's title, pricing and story come from the client's own file, ../peoplebrands/<client>/work.json.
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

export interface Work {
  id: string;
  /** the client's folder in ../peoplebrands */
  client: string;
  title: L;
  published: string;
  updated: string;
  /** a price agreed for this client; without it the pricing window shows the three options from data/content.ts (prices) */
  pricing?: Pricing;
  story?: Story;
  /** built with stand-in pictures: shows a "draft" note */
  placeholders?: boolean;
}

export const works = list as Work[];
