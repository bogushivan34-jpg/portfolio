"use client";

import React, { useState } from "react";
import Image from "next/image";
import { portfolioData } from "@/data/portfolioData";
import { Language } from "@/types";

export default function ServicesSection({ lang, onOpenInquiry }: { lang: Language; onOpenInquiry: () => void }) {
  const { services } = portfolioData;
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = services[activeStepIndex];
  const ru = lang === "ru";
  const t = (r: string, e?: string) => (lang === "en" && e ? e : r);

  return (
    <section id="services" className="scroll-mt-20 lg:scroll-mt-0 mt-24 lg:mt-36 px-5 md:px-8 lg:pr-16 lg:pl-[305px] max-w-[1800px]">
      {/* Section header */}
      <div className="dc-hairline-t pt-6 mb-14 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <h2 className="dc-display text-[28px] md:text-[36px] lg:text-[42px]">
          {ru ? "Услуги · сайт и продвижение" : "Services · website and promotion"}
        </h2>
        <span className="dc-label dc-label-muted">
          {ru
            ? "Целиком или по частям · 5 этапов"
            : "As a package or in parts · 5 stages"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: numbered process index (click to activate) */}
        <div className="lg:col-span-5">
          {services.map((step, idx) => (
            <button
              key={step.step}
              onClick={() => setActiveStepIndex(idx)}
              className={`w-full text-left py-6 dc-hairline-t group ${
                idx === services.length - 1 ? "dc-hairline-b" : ""
              }`}
            >
              <div className="flex items-baseline justify-between gap-6">
                <div className="flex items-baseline gap-5">
                  <span
                    className={`text-[10px] tracking-[0.1em] transition-colors ${
                      activeStepIndex === idx ? "text-[#ff7e22]" : "text-[#9c9c9c]"
                    }`}
                  >
                    {step.step}
                  </span>
                  <span
                    className={`text-[16px] md:text-[18px] uppercase tracking-[0.02em] leading-snug decoration-[1px] underline-offset-[5px] transition-[text-decoration-color] duration-200 ${
                      activeStepIndex === idx
                        ? "text-[#3e3d3a] decoration-[#3e3d3a]"
                        : "text-[#6f6d68] decoration-transparent group-hover:decoration-[#3e3d3a]"
                    }`}
                  >
                    {t(step.title, step.titleEn)}
                  </span>
                </div>
                <span className="text-[9px] uppercase tracking-[0.1em] text-[#9c9c9c] whitespace-nowrap hidden md:block">
                  {ru ? "Этап" : "Stage"}
                </span>
              </div>
            </button>
          ))}

          <p className="mt-10 text-[13px] leading-[20px] text-[#6f6d68] max-w-md">
            {ru
              ? "Сайт и соцсети работают как одна система: каждый пост ведёт туда, где можно записаться, а аналитика показывает, что приносит заявки. Можно взять всё сразу или только нужную часть – например, только сайт или только ведение."
              : "The site and social pages work as one system: every post leads to a place to book, and analytics show what brings enquiries. Take the whole package or just the part you need, such as only the site or only account management."}
          </p>

          <button
            onClick={onOpenInquiry}
            className="dc-link dc-link-accent text-[11px] uppercase tracking-[0.16em] mt-8"
          >
            {ru ? "Обсудить задачу" : "Discuss your project"}
          </button>
        </div>

        {/* Right: active step detail */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[16/10] w-full overflow-hidden dc-frame bg-white mb-3">
            <Image
              src={activeStep.image}
              alt={t(activeStep.title, activeStep.titleEn)}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 58vw"
            />
          </div>
          <div className="mb-8 text-[10px] uppercase tracking-[0.12em] text-[#9c9c9c]">
            {ru ? "Пример" : "Example"} · {t(activeStep.example, activeStep.exampleEn)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 dc-hairline-t pt-6">
            <div>
              <span className="dc-label dc-label-muted block mb-4">
                {ru ? "Что входит" : "What's included"}
              </span>
              <p className="text-[13px] leading-[20px] text-[#3e3d3a]">
                {t(activeStep.includes, activeStep.includesEn)}
              </p>
            </div>
            <div>
              <span className="dc-label dc-label-muted block mb-4">
                {ru ? "Что вы получаете" : "What you get"}
              </span>
              <p className="text-[13px] leading-[20px] text-[#3e3d3a]">
                {t(activeStep.result, activeStep.resultEn)}
              </p>
            </div>
          </div>

          <div className="mt-8">
            <span className="dc-label block mb-4">
              {ru ? "Этап" : "Stage"} {activeStep.step} · {t(activeStep.title, activeStep.titleEn)}
            </span>
            <p className="text-[15px] md:text-[17px] leading-[26px] text-[#6f6d68] max-w-xl">
              {t(activeStep.description, activeStep.descriptionEn)}
            </p>
          </div>

          <div className="mt-10 dc-hairline-t pt-6 flex flex-wrap gap-7">
            {services.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setActiveStepIndex(idx)}
                className={`dc-link text-[10px] uppercase tracking-[0.14em] ${
                  activeStepIndex === idx ? "text-[#9c9c9c]" : "text-[#3e3d3a]"
                }`}
                aria-label={t(s.title, s.titleEn)}
              >
                {s.step}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
