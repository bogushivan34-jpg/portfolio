"use client";

import React from "react";
import Image from "next/image";
import { portfolioData } from "@/data/portfolioData";
import { CaseStudy, Language } from "@/types";

interface SelectedWorksProps {
  lang: Language;
  onSelectCase: (caseStudy: CaseStudy) => void;
}

export default function SelectedWorks({ lang, onSelectCase }: SelectedWorksProps) {
  const { caseStudies } = portfolioData;
  const ru = lang === "ru";
  const t = (r: string, e?: string) => (lang === "en" && e ? e : r);

  return (
    <section id="works" className="scroll-mt-20 lg:scroll-mt-0 mt-24 lg:mt-36 px-5 md:px-8 lg:pr-16 lg:pl-[305px] max-w-[1800px]">
      {/* Section header */}
      <div className="dc-hairline-t pt-6 mb-14 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <h2 className="dc-display text-[28px] md:text-[36px] lg:text-[42px]">
          {caseStudies.length.toString().padStart(2, "0")} · {ru ? "Избранные работы" : "Selected Works"}
        </h2>
        <span className="dc-label dc-label-muted">
          {ru ? "Кейсы 2022–2026 · реальные проекты и цифры" : "Cases 2022–2026 · real projects, real numbers"}
        </span>
      </div>

      {/* Gallery index: one editorial row per case */}
      <div className="flex flex-col">
        {caseStudies.map((cs, idx) => (
          <article
            key={cs.id}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 py-12 lg:py-16 dc-hairline-t ${
              idx === caseStudies.length - 1 ? "dc-hairline-b" : ""
            }`}
          >
            {/* Visual plate */}
            <div
              className={`lg:col-span-7 group cursor-pointer ${
                idx % 2 === 1 ? "lg:order-2" : ""
              }`}
              onClick={() => onSelectCase(cs)}
            >
              <div className="relative aspect-[650/460] w-full overflow-hidden dc-frame bg-white">
                <Image
                  src={cs.image}
                  alt={ru ? cs.title : cs.titleEn ?? cs.title}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              </div>
              <div className="pt-3 text-[10px] uppercase tracking-[0.12em] text-[#9c9c9c] flex justify-between">
                <span>{t(cs.visualStyle.name, cs.visualStyle.nameEn)}</span>
                <span>{t(cs.location, cs.locationEn)}</span>
              </div>
            </div>

            {/* Index card: number, title, meta, proof metrics */}
            <div className={`lg:col-span-5 flex flex-col ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
              <span className="text-[10px] uppercase tracking-[0.14em] text-[#9c9c9c] mb-4">
                {cs.number} / {cs.period}
              </span>

              <button onClick={() => onSelectCase(cs)} className="text-left group">
                <h3 className="dc-display text-[26px] md:text-[32px] lg:text-[34px] mb-2 decoration-[1px] underline-offset-[6px] decoration-transparent group-hover:decoration-[#ff7e22] transition-[text-decoration-color] duration-200">
                  {t(cs.title, cs.titleEn)}
                </h3>
              </button>

              <p className="text-[10px] uppercase tracking-[0.12em] text-[#9c9c9c] mb-6">
                {t(cs.client, cs.clientEn)} · {t(cs.role, cs.roleEn)}
              </p>

              <p className="text-[13px] leading-[20px] text-[#6f6d68] max-w-md mb-8">
                {t(cs.tagline, cs.taglineEn)}
              </p>

              {/* Proof metrics: hairline table */}
              <div className="grid grid-cols-2 gap-x-8">
                {cs.results.heroMetrics.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between gap-4 py-3 dc-hairline-soft-b"
                  >
                    <span className="text-[9px] uppercase tracking-[0.1em] text-[#9c9c9c] leading-[13px] flex-1">
                      {t(m.label, m.labelEn)}
                    </span>
                    <span className="text-[14px] text-[#3e3d3a] whitespace-nowrap">{t(m.value, m.valueEn)}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectCase(cs)}
                className="dc-link dc-link-accent text-[11px] uppercase tracking-[0.16em] mt-8 self-start"
              >
                {ru
                  ? "Открыть кейс · задача, решение, материалы"
                  : "Open case · brief, solution, materials"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
