"use client";

import React from "react";
import { portfolioData } from "@/data/portfolioData";
import { Language } from "@/types";
import ContactLinks from "@/components/ContactLinks";

export default function BriefSection({ lang }: { lang: Language }) {
  const { audiences } = portfolioData;
  const ru = lang === "ru";
  const t = (r: string, e?: string) => (lang === "en" && e ? e : r);

  return (
    <section id="brief" className="scroll-mt-20 lg:scroll-mt-0 mt-24 lg:mt-36 px-5 md:px-8 lg:pr-16 lg:pl-[305px] max-w-[1800px]">
      {/* Section header */}
      <div className="dc-hairline-t pt-6 mb-14 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <h2 className="dc-display text-[28px] md:text-[36px] lg:text-[42px]">
          {ru ? "Для кого · контакты" : "Who it's for · contacts"}
        </h2>
        <span className="dc-label dc-label-muted">
          {ru ? "Ответ в течение дня" : "Reply within a day"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: who it's for */}
        <div className="lg:col-span-5">
          <p className="text-[15px] md:text-[17px] leading-[26px] text-[#6f6d68] max-w-md mb-10">
            {ru
              ? "Для тех, кто работает на себя, хорошо делает своё дело, но в интернете этого пока не видно: нет сайта, а соцсети ведутся от случая к случаю."
              : "For people who work for themselves and do their job well, but it doesn't show online yet: no website, and social pages updated now and then."}
          </p>

          <div className="dc-hairline-t">
            {audiences.map((a) => (
              <div key={a.who} className="flex items-baseline justify-between gap-6 py-4 dc-hairline-soft-b">
                <span className="text-[12px] leading-[18px] text-[#3e3d3a]">{t(a.who, a.whoEn)}</span>
                <span className="text-[11px] leading-[16px] text-[#9c9c9c] text-right max-w-[55%]">
                  {t(a.need, a.needEn)}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-[11px] leading-[17px] text-[#9c9c9c] max-w-md">
            {ru
              ? "Стоимость зависит от объёма: назову её после короткого разговора о задаче."
              : "The price depends on scope: I'll quote it after a short talk about your task."}
          </p>
        </div>

        {/* Right: contacts */}
        <div className="lg:col-span-7">
          <span className="dc-label block mb-8">{ru ? "Связаться" : "Get in touch"}</span>
          <p className="text-[13px] leading-[21px] text-[#6f6d68] max-w-md mb-8">
            {ru
              ? "Напишите, чем занимаетесь и что нужно: сайт, соцсети или всё сразу."
              : "Tell me what you do and what you need: a site, social pages or both."}
          </p>
          <ContactLinks lang={lang} />
        </div>
      </div>
    </section>
  );
}
