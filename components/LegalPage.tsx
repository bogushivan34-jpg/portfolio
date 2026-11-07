import React from "react";
import Link from "next/link";

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

/* Plain document page in the site's typography: used for the privacy policy and the consent text. */
export default function LegalPage({
  label,
  title,
  edition,
  intro,
  sections,
}: {
  label: string;
  title: string;
  edition: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-white text-[#3e3d3a] px-5 md:px-8 lg:px-16 py-12 lg:py-16">
      <div className="max-w-[820px]">
        <div className="flex items-baseline justify-between gap-6 mb-16">
          <Link
            href="/"
            className="text-[13px] uppercase tracking-[0.06em] text-[#3e3d3a] hover:text-[#ff7e22] transition-colors"
          >
            Иван Богуш
          </Link>
          <Link href="/" className="dc-link text-[10px] uppercase tracking-[0.16em] text-[#3e3d3a]">
            На главную
          </Link>
        </div>

        <span className="dc-label dc-label-muted block mb-6">{label}</span>
        <h1 className="dc-display text-[28px] md:text-[36px] lg:text-[42px] mb-6">{title}</h1>
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#9c9c9c] mb-10">{edition}</p>
        <p className="text-[15px] md:text-[17px] leading-[26px] text-[#6f6d68] mb-12">{intro}</p>

        {sections.map((s, i) => (
          <section key={s.title} className="dc-hairline-t py-7">
            <h2 className="text-[13px] uppercase tracking-[0.04em] text-[#3e3d3a] mb-4">
              <span className="text-[10px] text-[#ff7e22] mr-4">{String(i + 1).padStart(2, "0")}</span>
              {s.title}
            </h2>
            <div className="space-y-3">
              {s.paragraphs.map((p, j) => (
                <p key={j} className="text-[13px] leading-[21px] text-[#6f6d68]">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}

        <div className="dc-hairline-t pt-6 mt-4 flex flex-wrap gap-7">
          <Link href="/privacy" className="dc-link text-[10px] uppercase tracking-[0.16em] text-[#3e3d3a]">
            Политика обработки данных
          </Link>
          <Link href="/consent" className="dc-link text-[10px] uppercase tracking-[0.16em] text-[#3e3d3a]">
            Согласие на обработку
          </Link>
          <a href="mailto:bogushiv@mail.ru" className="dc-link text-[10px] uppercase tracking-[0.16em] text-[#3e3d3a]">
            bogushiv@mail.ru
          </a>
        </div>
      </div>
    </main>
  );
}
