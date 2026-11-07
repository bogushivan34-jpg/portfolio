"use client";

import React from "react";
import Image from "next/image";
import { portfolioData } from "@/data/portfolioData";
import { Language } from "@/types";

export default function AboutSection({ lang, onOpenInquiry }: { lang: Language; onOpenInquiry: () => void }) {
  const { profile } = portfolioData;
  const ru = lang === "ru";

  return (
    <section id="about" className="scroll-mt-20 lg:scroll-mt-0 mt-24 lg:mt-36 px-5 md:px-8 lg:pr-16 lg:pl-[305px] max-w-[1800px]">
      {/* Section header */}
      <div className="dc-hairline-t pt-6 mb-14 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <h2 className="dc-display text-[28px] md:text-[36px] lg:text-[42px]">
          {ru ? "О себе" : "About"}
        </h2>
        <span className="dc-label dc-label-muted">
          {ru
            ? "Москва / удалённо · беру новые проекты"
            : "Moscow / remote · taking new projects"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Portrait */}
        <div className="lg:col-span-5">
          <div className="relative aspect-[1200/1300] w-full overflow-hidden dc-frame bg-white">
            <Image
              src={profile.portrait}
              alt={ru ? profile.portraitCaptionRu : profile.portraitCaptionEn}
              fill
              className="object-cover object-[50%_30%]"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          <div className="pt-3 text-[10px] uppercase tracking-[0.12em] text-[#9c9c9c] flex justify-between">
            <span>{ru ? "Иван Богуш" : "Ivan Bogush"}</span>
            <span>{ru ? profile.portraitCaptionRu : profile.portraitCaptionEn}</span>
          </div>
        </div>

        {/* Bio + credentials */}
        <div className="lg:col-span-7 flex flex-col">
          <p className="text-[22px] md:text-[28px] lg:text-[30px] leading-[1.25] text-[#3e3d3a] max-w-2xl mb-8">
            {ru ? profile.statementRu : profile.statementEn}
          </p>

          <p className="text-[13px] leading-[21px] text-[#6f6d68] max-w-xl mb-12">
            {ru ? profile.bioRu : profile.bioEn}
          </p>

          {/* Credentials: hairline definition tables */}
          <div className="dc-hairline-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <div className="py-5 md:border-r md:border-[rgba(0,0,0,0.15)] md:pr-12">
                <span className="dc-label dc-label-muted block mb-3">
                  {ru ? "Образование" : "Education"}
                </span>
                <p className="text-[12px] leading-[18px] text-[#3e3d3a]">
                  {ru
                    ? "МГИК – магистратура «Реклама и связи с общественностью», программа «Креатив в коммуникациях»."
                    : "MGIK (Moscow State Institute of Culture) – Master's in Advertising & PR, Creative Communications programme."}
                </p>
                <p className="text-[10px] uppercase tracking-[0.1em] text-[#ff7e22] mt-2">
                  {ru ? "2026–2028" : "2026–2028"}
                </p>
              </div>
              <div className="py-5">
                <span className="dc-label dc-label-muted block mb-3">
                  {ru ? "Языки" : "Languages"}
                </span>
                <p className="text-[12px] leading-[18px] text-[#3e3d3a]">
                  {ru
                    ? "Английский – C1, французский – B1. Англоязычную версию Trouvère и её Instagram* веду сам."
                    : "English – C1, French – B1. I run Trouvère's English version and its Instagram* myself."}
                </p>
              </div>
            </div>
          </div>

          <div className="dc-hairline-t">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
              <div className="py-5 md:border-r md:border-[rgba(0,0,0,0.15)] md:pr-12">
                <span className="dc-label dc-label-muted block mb-3">
                  {ru ? "Форматы работы" : "Work formats"}
                </span>
                <p className="text-[12px] leading-[18px] text-[#3e3d3a]">
                  {ru
                    ? "Удалённо или в Москве. Проект целиком или часть: только сайт, только соцсети, только ведение."
                    : "Remote or in Moscow. The whole project or one part: just the site, just social pages, just management."}
                </p>
              </div>
              <div className="py-5">
                <span className="dc-label dc-label-muted block mb-3">
                  {ru ? "Награда" : "Award"}
                </span>
                <p className="text-[12px] leading-[18px] text-[#3e3d3a]">
                  {ru
                    ? "3 место – IX Открытый фестиваль-конкурс социальной рекламы «Выбери жизнь», номинация «Мы вместе», Москва, 2024."
                    : "3rd place – 9th Open Social Advertising Festival “Choose Life”, “We Are Together” category, Moscow, 2024."}
                </p>
              </div>
            </div>
          </div>

          {/* Principles: numbered lines */}
          <div className="dc-hairline-t py-6">
            <span className="dc-label dc-label-muted block mb-5">
              {ru ? "Четыре принципа работы" : "Four working principles"}
            </span>
            <ul className="space-y-4">
              {(ru
                ? [
                    ["Честные цифры", "Показываю реальную статистику – без накруток и красивых процентов из головы."],
                    ["Сайт и соцсети – одна система", "Каждый пост ведёт туда, где можно записаться."],
                    ["Стиль из сути", "Визуал вырастает из того, кто вы, а не из шаблона."],
                    ["Отчёт каждый месяц", "Откуда пришли заявки и что менять дальше."],
                  ]
                : [
                    ["Honest numbers", "Real statistics, no inflated followers or made-up percentages."],
                    ["Site and social as one system", "Every post leads to a place where people can book."],
                    ["Style from substance", "The visuals grow out of who you are, not a template."],
                    ["A report every month", "Where enquiries came from and what to change next."],
                  ]
              ).map(([title, note], idx) => (
                <li key={idx} className="flex items-baseline gap-5">
                  <span className="text-[10px] text-[#9c9c9c] shrink-0">0{idx + 1}</span>
                  <span className="text-[12px] leading-[18px] text-[#3e3d3a]">
                    {title}
                    <span className="text-[#9c9c9c]"> · {note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-7">
            <button
              onClick={onOpenInquiry}
              className="dc-link dc-link-accent text-[11px] uppercase tracking-[0.16em]"
            >
              {ru ? "Обсудить задачу" : "Discuss your project"}
            </button>
            <a
              href="https://t.me/myfeelinzz"
              target="_blank"
              rel="noopener noreferrer"
              className="dc-link text-[11px] uppercase tracking-[0.16em] text-[#3e3d3a]"
            >
              Telegram · @myfeelinzz
            </a>
            <a
              href="mailto:bogushiv@mail.ru"
              className="dc-link text-[11px] uppercase tracking-[0.16em] text-[#3e3d3a]"
            >
              bogushiv@mail.ru
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
