import type { Metadata } from "next";
import WorksIndex, { type IndexEntry } from "@/components/WorksIndex";
import { works } from "@/data/works";
import { lock } from "@/lib/worksLock";

export const metadata: Metadata = {
  title: "Превью · список",
  // the list is private: never indexed, never followed
  robots: { index: false, follow: false },
};

/*
 * ivanbogush.ru/works: every client preview in one list, for Ivan. The list is encrypted with WORKS_TOKEN when the
 * site is built (lib/worksLock.ts) and opens in the browser once the token is entered; the browser keeps the token.
 * WORKS_TOKEN is in .env.local here and in the repo's Actions secrets for the deploy.
 */
export default function WorksPage() {
  const token = process.env.WORKS_TOKEN?.trim();
  const entries: IndexEntry[] = works.map((w) => ({
    id: w.id,
    client: w.client,
    title: w.title.ru,
    published: w.published,
    updated: w.updated,
    story: !!w.story,
    pricing: !!w.pricing,
    placeholders: !!w.placeholders,
  }));
  return <WorksIndex locked={token ? lock(entries, token) : null} />;
}
