"use client";

import React from "react";
import { portfolioData } from "@/data/portfolioData";
import { Language } from "@/types";

export default function SkillsMatrix({ lang }: { lang: Language }) {
  const { skillsMatrix } = portfolioData;
  const ru = lang === "ru";
  const t = (r: string, e?: string) => (lang === "en" && e ? e : r);

  return (
    <section id="skills" className="scroll-mt-20 lg:scroll-mt-0 mt-24 lg:mt-36 px-5 md:px-8 lg:pr-16 lg:pl-[305px] max-w-[1800px]">
      {/* Section header */}
      <div className="dc-hairline-t pt-6 mb-14 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <h2 className="dc-display text-[28px] md:text-[36px] lg:text-[42px]">
          {ru ? "Навыки и инструменты" : "Skills and tools"}
        </h2>
        <span className="dc-label dc-label-muted">
          {ru
            ? "Рядом с каждым – где я это применял"
            : "Next to each – where I've used it"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 dc-hairline-t dc-hairline-b">
        {skillsMatrix.map((cat, idx) => (
          <div
            key={idx}
            className={`py-10 md:px-8 md:first:pl-0 lg:px-10 lg:first:pl-0 md:border-[rgba(0,0,0,0.15)] ${
              idx !== 0 ? "md:border-l" : ""
            } md:[&:nth-child(-n+2)]:border-b lg:[&:nth-child(-n+2)]:border-b-0`}
          >
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#9c9c9c] block mb-3">
              0{idx + 1}
            </span>
            <h3 className="text-[15px] uppercase tracking-[0.02em] leading-snug text-[#3e3d3a] mb-2">
              {t(cat.title, cat.titleEn)}
            </h3>
            <p className="text-[11px] leading-[16px] text-[#9c9c9c] mb-8">
              {t(cat.subtitle, cat.subtitleEn)}
            </p>

            <div className="space-y-5">
              {cat.skills.map((skill, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <span className="text-[11px] leading-[16px] text-[#3e3d3a] block">
                    {t(skill.name, skill.nameEn)}
                  </span>
                  <div className="h-px w-full bg-[rgba(0,0,0,0.12)]" />
                  <span className="text-[9px] leading-[13px] text-[#9c9c9c] block">
                    {t(skill.note, skill.noteEn)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
