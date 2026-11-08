"use client";

import React from "react";
import { Language } from "@/types";
import ContactLinks from "@/components/ContactLinks";

interface InquiryModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
}

export default function InquiryModal({ isOpen, lang, onClose }: InquiryModalProps) {
  const ru = lang === "ru";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#3e3d3a]/25 backdrop-blur-[2px] animate-fade-in" onClick={onClose}>
      {/* Slide-over window (ref: .inquire-window) */}
      <div
        className="w-full max-w-xl h-full bg-white flex flex-col p-8 md:p-12 overflow-y-auto animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-8 dc-hairline-b mb-10">
          <div>
            <span className="dc-label dc-label-muted block mb-3">
              {ru ? "Контакты" : "Contacts"}
            </span>
            <h3 className="dc-display text-[24px] md:text-[30px]">
              {ru ? "Сайт, соцсети, продвижение" : "Website, social, promotion"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="dc-link text-[10px] uppercase tracking-[0.18em] text-[#3e3d3a] pt-1"
          >
            {ru ? "Закрыть" : "Close"}
          </button>
        </div>

        <div className="grow">
          <p className="text-[13px] leading-[21px] text-[#6f6d68] max-w-sm mb-10">
            {ru
              ? "Напишите, чем занимаетесь и что нужно: сайт, соцсети или всё сразу. Отвечу в течение дня."
              : "Tell me what you do and what you need: a site, social pages or both. I'll reply within a day."}
          </p>
          <ContactLinks lang={lang} />
        </div>

        {/* Footer note */}
        <div className="pt-8 mt-8 dc-hairline-t text-[9px] uppercase tracking-[0.12em] text-[#9c9c9c] flex items-center justify-between">
          <span>{ru ? "Москва / удалённо" : "Moscow / remote"}</span>
          <span>{ru ? "Беру новые проекты" : "Taking new projects"}</span>
        </div>
      </div>
    </div>
  );
}
