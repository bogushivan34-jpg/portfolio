import type { Metadata } from "next";
import WorkPreview from "@/components/WorkPreview";
import { works } from "@/data/works";
import { cardFor, siteCard } from "@/lib/cards";

// Only the works in data/works.json are built (a static export has no other pages), so any other id is a 404.
// No `dynamicParams = false` here: with output: "export", Next 14's dev server then refuses every id.
export function generateStaticParams() {
  return works.map((w) => ({ id: w.id }));
}

/*
 * The link is sent to the client in a message, where it unfurls into a card: "Иван Богуш" (whose site it is), the
 * work's title with the client's name, the intro's line to them, and their site's first screen. A bare link with
 * a random id looked like phishing (Ivan, 17 November 2026); the id is their name too (scripts/add-work.mjs).
 */
export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const work = works.find((w) => w.id === params.id);
  if (!work) return { title: "Превью", robots: { index: false, follow: false } };
  const title = work.title.ru;
  const description = work.intro?.text ?? "Набросок сайта от Ивана Богуша";
  const card = cardFor(work.id, title) ?? siteCard;
  return {
    title: `${title} · превью`,
    description,
    // client previews are private, and the sample with its prices is reached only from the legal documents:
    // never indexed, never followed. Bots that only fetch the card are let in (public/robots.txt).
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "ru_RU",
      siteName: "Иван Богуш",
      url: `/works/${work.id}/`,
      title,
      description,
      images: [card],
    },
    twitter: { card: "summary_large_image", title, description, images: [card.url] },
  };
}

export default function WorkPage({ params }: { params: { id: string } }) {
  const work = works.find((w) => w.id === params.id)!;
  return <WorkPreview work={work} />;
}
