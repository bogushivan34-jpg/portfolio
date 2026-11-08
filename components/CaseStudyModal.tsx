"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CaseStudy, Language } from "@/types";

interface CaseStudyModalProps {
  caseStudy: CaseStudy;
  lang: Language;
  onClose: () => void;
  onOpenInquiry: () => void;
}

type TabId = "overview" | "result" | "visuals";

export default function CaseStudyModal({ caseStudy, lang, onClose, onOpenInquiry }: CaseStudyModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const ru = lang === "ru";
  const t = (r: string, e?: string) => (lang === "en" && e ? e : r);
  const { results, visualStyle } = caseStudy;
  const hasResult = Boolean(results.funnel?.length || results.summary);

  const TABS: { id: TabId; label: string }[] = [
    { id: "overview", label: ru ? "Задача и решение" : "Brief & solution" },
    ...(hasResult ? [{ id: "result" as TabId, label: ru ? "Каналы и результат" : "Channels & outcome" }] : []),
    ...(caseStudy.keyArtifacts.length ? [{ id: "visuals" as TabId, label: ru ? "Материалы" : "Materials" }] : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-[#3e3d3a]/25 backdrop-blur-[2px] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-white dc-hairline-t dc-hairline-b flex flex-col shadow-[0_30px_80px_rgba(0,0,0,0.18)] animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-6 px-6 md:px-10 pt-8 pb-6 dc-hairline-b">
          <div>
            <span className="dc-label dc-label-muted block mb-3">
              {ru
                ? `Кейс ${caseStudy.number} · ${caseStudy.period}`
                : `Case ${caseStudy.number} · ${caseStudy.period}`}
            </span>
            <h2 className="dc-display text-[24px] md:text-[32px]">
              {t(caseStudy.client, caseStudy.clientEn)}
            </h2>
            <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#9c9c9c]">
              {t(caseStudy.role, caseStudy.roleEn)} · {t(caseStudy.location, caseStudy.locationEn)}
              {caseStudy.link && (
                <>
                  {" · "}
                  <a
                    href={caseStudy.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dc-link dc-link-accent"
                  >
                    {caseStudy.link.label}
                  </a>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="dc-link text-[10px] uppercase tracking-[0.18em] text-[#3e3d3a] shrink-0 pt-1"
          >
            {ru ? "Закрыть" : "Close"}
          </button>
        </div>

        {/* Tabs: underline navigation */}
        <nav className="px-6 md:px-10 dc-hairline-b overflow-x-auto">
          <ul className="flex gap-7">
            {TABS.map((tab, i) => (
              <li key={tab.id} className="shrink-0">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-4 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                    activeTab === tab.id ? "text-[#3e3d3a]" : "text-[#9c9c9c] hover:text-[#3e3d3a]"
                  }`}
                >
                  <span className="text-[#c1bfb9] mr-2">0{i + 1}</span>
                  {tab.label}
                  <span
                    className={`absolute left-0 bottom-[-1px] w-full h-px bg-[#3e3d3a] transition-opacity ${
                      activeTab === tab.id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Body */}
        <div className="px-6 md:px-10 py-8 overflow-y-auto grow space-y-10">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-10 animate-fade-in">
              {/* Metrics row */}
              <div className="grid grid-cols-2 md:grid-cols-4 dc-hairline-t">
                {results.heroMetrics.map((m, i) => (
                  <div key={i} className="py-6 pr-5 md:border-r md:last:border-r-0 md:border-[rgba(0,0,0,0.15)] md:[&:not(:first-child)]:pl-5">
                    <div className="text-[22px] md:text-[26px] leading-none text-[#3e3d3a] mb-2">
                      {t(m.value, m.valueEn)}
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.1em] text-[#9c9c9c] leading-[13px] block">
                      {t(m.label, m.labelEn)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Challenge & strategy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <span className="dc-label block mb-5">{ru ? "Задача" : "The brief"}</span>
                  <p className="text-[13px] leading-[21px] text-[#6f6d68] mb-5">
                    {t(caseStudy.challenge, caseStudy.challengeEn)}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#9c9c9c] leading-[16px]">
                    {t(caseStudy.niche, caseStudy.nicheEn)}
                  </p>
                </div>
                <div>
                  <span className="dc-label block mb-5">{ru ? "Что сделано" : "What was done"}</span>
                  <ul className="space-y-4">
                    {(ru ? caseStudy.strategy : caseStudy.strategyEn ?? caseStudy.strategy).map((item, idx) => (
                      <li key={idx} className="flex gap-4">
                        <span className="text-[10px] text-[#ff7e22] shrink-0 pt-[3px]">0{idx + 1}</span>
                        <span className="text-[12px] leading-[19px] text-[#6f6d68]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Visual code */}
              <div className="dc-hairline-t pt-7">
                <span className="dc-label block mb-5">
                  {ru ? "Визуальный код" : "Visual code"} · {t(visualStyle.name, visualStyle.nameEn)}
                </span>
                <p className="text-[13px] leading-[21px] text-[#6f6d68] max-w-2xl mb-6">
                  {t(visualStyle.description, visualStyle.descriptionEn)}
                </p>
                {(visualStyle.palette?.length || visualStyle.typography) && (
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    {visualStyle.palette?.length ? (
                      <div className="flex items-center gap-3">
                        {visualStyle.palette.map((color, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 inline-block dc-frame"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    ) : null}
                    {visualStyle.typography && (
                      <span className="text-[10px] uppercase tracking-[0.1em] text-[#9c9c9c]">
                        {ru ? "Типографика" : "Typography"} · {visualStyle.typography}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHANNELS & OUTCOME */}
          {activeTab === "result" && (
            <div className="animate-fade-in space-y-10">
              {results.funnel?.length ? (
                <div>
                  <span className="dc-label dc-label-muted block mb-6">
                    {t(results.funnelTitle ?? "Путь клиента", results.funnelTitleEn ?? "The client's path")}
                  </span>
                  {results.funnel.map((step, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[30px_1fr_auto] md:grid-cols-[40px_1fr_130px_130px] items-baseline gap-4 py-5 dc-hairline-t"
                    >
                      <span className="text-[10px] text-[#9c9c9c]">0{idx + 1}</span>
                      <div>
                        <div className="text-[13px] text-[#3e3d3a] uppercase tracking-[0.04em]">
                          {t(step.stage, step.stageEn)}
                        </div>
                        <div className="text-[11px] leading-[16px] text-[#9c9c9c] mt-1">
                          {t(step.description, step.descriptionEn)}
                        </div>
                      </div>
                      <span className="text-[13px] text-[#3e3d3a] text-right">{t(step.count, step.countEn)}</span>
                      <span className="text-[13px] text-[#3e3d3a] text-right hidden md:block">
                        {step.conversion ? t(step.conversion, step.conversionEn) : ""}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {results.summary && (
                <div className={results.funnel?.length ? "dc-hairline-t pt-7" : ""}>
                  {!results.funnel?.length && (
                    <span className="dc-label dc-label-muted block mb-6">
                      {t(results.funnelTitle ?? "Результат", results.funnelTitleEn ?? "Outcome")}
                    </span>
                  )}
                  <p className="text-[15px] md:text-[17px] leading-[26px] text-[#6f6d68] max-w-2xl">
                    {t(results.summary, results.summaryEn)}
                  </p>
                </div>
              )}

              {results.source && (
                <div className="dc-hairline-t pt-5 text-[10px] uppercase tracking-[0.1em] text-[#9c9c9c]">
                  {t(results.source, results.sourceEn)}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MATERIALS */}
          {activeTab === "visuals" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fade-in">
              {caseStudy.keyArtifacts.map((art, idx) => (
                <div key={idx}>
                  <span className="dc-label dc-label-muted block mb-4">
                    0{idx + 1} · {t(art.title, art.titleEn)}
                  </span>
                  <div className="relative aspect-[16/10] w-full overflow-hidden dc-frame bg-white mb-4">
                    <Image
                      src={art.assetUrl}
                      alt={t(art.title, art.titleEn)}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  </div>
                  <p className="text-[12px] leading-[19px] text-[#9c9c9c]">
                    {t(art.description, art.descriptionEn)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 md:px-10 py-5 dc-hairline-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-[0.12em] text-[#9c9c9c]">
            {ru ? "Нужно так же для вас? Обсудим" : "Want the same for you? Let's talk"}
          </span>
          <div className="flex items-center gap-6">
            <a
              href="https://t.me/myfeelinzz"
              target="_blank"
              rel="noreferrer"
              className="dc-link dc-link-accent text-[10px] uppercase tracking-[0.16em]"
            >
              Telegram
            </a>
            <button
              onClick={() => {
                onClose();
                onOpenInquiry();
              }}
              className="dc-link text-[10px] uppercase tracking-[0.16em] text-[#3e3d3a]"
            >
              {ru ? "Контакты" : "Contacts"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
