import type { Metadata } from "next";
import WorkPreview from "@/components/WorkPreview";
import { works } from "@/data/works";

// Only the works in data/works.json are built (a static export has no other pages), so any other id is a 404.
// No `dynamicParams = false` here: with output: "export", Next 14's dev server then refuses every id.
export function generateStaticParams() {
  return works.map((w) => ({ id: w.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const work = works.find((w) => w.id === params.id);
  return {
    title: work ? `${work.title.ru} · превью` : "Превью",
    // client previews are private, and the sample with its prices is reached only from the legal documents:
    // never indexed, never followed
    robots: { index: false, follow: false },
  };
}

export default function WorkPage({ params }: { params: { id: string } }) {
  const work = works.find((w) => w.id === params.id)!;
  return <WorkPreview work={work} />;
}
