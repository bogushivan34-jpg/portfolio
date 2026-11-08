"use client";

import React, { useState, useEffect } from "react";
import CaseVisual from "@/components/CaseVisual";
import { portfolioData } from "@/data/portfolioData";
import { Language } from "@/types";

interface HeroProps {
  lang: Language;
  onOpenInquiry: () => void;
}

export default function Hero({ lang, onOpenInquiry }: HeroProps) {
  const { profile } = portfolioData;
  const caseStudies = portfolioData.caseStudies.filter((c) => c.inHero !== false);
  const [slideIndex, setSlideIndex] = useState(0);
  const ru = lang === "ru";

  useEffect(() => {
    const t = setInterval(() => {
      setSlideIndex((i) => (i === caseStudies.length - 1 ? 0 : i + 1));
    }, 5000);
    return () => clearInterval(t);
  }, [caseStudies.length]);

  const cs = caseStudies[slideIndex];

  return (
    <section id="top" className="scroll-mt-20 lg:scroll-mt-0">
      {/* ----- Landing slide: full-height image, offset right of the rail ----- */}
      <div className="lg:h-screen lg:flex lg:flex-col lg:justify-center pt-20 lg:pt-0">
        <div className="relative w-full lg:w-[calc(100vw-305px)] lg:ml-auto h-[62vh] md:h-[72vh] lg:h-[calc(100vh-135px)] overflow-hidden dc-frame bg-white">
          {caseStudies.map((c, idx) => (
            <div
              key={c.id}
              className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
              style={{ opacity: slideIndex === idx ? 1 : 0 }}
              aria-hidden={slideIndex !== idx}
            >
              <CaseVisual
                caseStudy={c}
                alt={ru ? c.title : c.titleEn ?? c.title}
                priority={idx === 0}
                sizes="(max-width: 1024px) 100vw, calc(100vw - 305px)"
              />
            </div>
          ))}
        </div>

        {/* Caption, right-aligned beneath the slide */}
        <div className="flex items-start justify-between gap-6 pt-4 px-5 md:px-8 lg:px-0 lg:w-[calc(100vw-305px)] lg:ml-auto lg:pr-16">
          <span className="dc-label dc-label-muted">
            {ru ? cs.client : cs.clientEn ?? cs.client} · {cs.period}
          </span>
          <span className="text-[10px] uppercase tracking-[0.14em] text-[#9c9c9c] text-right leading-[16px]">
            {ru ? (
              <>
                Открыт к проектам
                <br />
                Москва / Удаленно
              </>
            ) : (
              <>
                Open to projects
                <br />
                Moscow / Remote
              </>
            )}
          </span>
        </div>
      </div>

      {/* ----- Statement: large editorial text block + proof metrics ----- */}
      <div className="mt-20 lg:mt-28 px-5 md:px-8 lg:pr-16 lg:pl-[305px] max-w-[1800px]">
        <span className="dc-label dc-label-muted block mb-8">{ru ? profile.roleRu : profile.roleEn}</span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          <h2 className="lg:col-span-8 dc-display text-[34px] sm:text-[44px] md:text-[56px] lg:text-[64px] xl:text-[72px]">
            {ru ? (
              <>
                Сайт и соцсети <br className="hidden md:block" />
                для тех, кто <br className="hidden md:block" />
                работает на себя
              </>
            ) : (
              <>
                Website and social <br className="hidden md:block" />
                for people who <br className="hidden md:block" />
                work for themselves
              </>
            )}
          </h2>

          <div className="lg:col-span-4 flex flex-col justify-end space-y-7 animate-rise">
            <p className="text-[13px] leading-[20px] text-[#6f6d68] max-w-sm">
              {ru ? profile.heroLeadRu : profile.heroLeadEn}
            </p>
            <div className="flex items-center gap-7">
              <a
                href="https://t.me/myfeelinzz"
                target="_blank"
                rel="noopener noreferrer"
                className="dc-link dc-link-accent text-[11px] uppercase tracking-[0.16em]"
              >
                Telegram · @myfeelinzz
              </a>
              <button
                onClick={onOpenInquiry}
                className="dc-link text-[11px] uppercase tracking-[0.16em] text-[#3e3d3a]"
              >
                {ru ? "Контакты" : "Contacts"}
              </button>
            </div>
          </div>
        </div>

        {/* Proof metrics: hairline table row */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 dc-hairline-t">
          {profile.heroMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="py-7 pr-6 dc-hairline-soft-b lg:border-b-0 lg:border-r lg:last:border-r-0 lg:border-[rgba(0,0,0,0.15)]"
            >
              <div className="text-[30px] md:text-[38px] leading-none font-normal tracking-[-0.01em] text-[#3e3d3a] mb-3">
                {ru ? metric.value : metric.valueEn ?? metric.value}
              </div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-[#9c9c9c] leading-[15px]">
                {ru ? metric.labelRu : metric.labelEn ?? metric.labelRu}
                <br />
                {ru ? metric.subtextRu : metric.subtextEn ?? metric.subtextRu}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
