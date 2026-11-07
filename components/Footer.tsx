"use client";

import React from "react";
import { Language } from "@/types";

export default function Footer({ lang, onOpenInquiry }: { lang: Language; onOpenInquiry: () => void }) {
  const ru = lang === "ru";
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-24 lg:mt-36 lg:pl-[305px] max-w-[1800px]">
      <div className="px-5 md:px-8 lg:pr-16">
        {/* Large wordmark closing the page */}
        <div className="dc-hairline-t pt-14 lg:pt-20 pb-14 lg:pb-20">
          <button
            onClick={scrollToTop}
            className="dc-display text-[40px] md:text-[64px] lg:text-[80px] leading-none text-left hover:text-[#ff7e22] transition-colors duration-300"
          >
            {ru ? "Иван Богуш" : "Ivan Bogush"}
          </button>
          <p className="mt-6 text-[10px] uppercase tracking-[0.14em] text-[#9c9c9c]">
            {ru ? "SMM и PR · сайты и продвижение для частных специалистов" : "SMM & PR · websites and promotion for independent professionals"}
          </p>
        </div>

        {/* Horizontal links */}
        <div className="dc-hairline-t py-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <nav>
            <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
              <li>
                <a
                  href="https://t.me/myfeelinzz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dc-link text-[11px] uppercase tracking-[0.14em] text-[#3e3d3a]"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="mailto:bogushiv@mail.ru"
                  className="dc-link text-[11px] uppercase tracking-[0.14em] text-[#3e3d3a]"
                >
                  Email
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenInquiry}
                  className="dc-link dc-link-accent text-[11px] uppercase tracking-[0.14em]"
                >
                  {ru ? "Оставить заявку" : "Enquiry"}
                </button>
              </li>
              <li>
                <button
                  onClick={scrollToTop}
                  className="dc-link text-[11px] uppercase tracking-[0.14em] text-[#3e3d3a]"
                >
                  {ru ? "Наверх" : "Back to top"}
                </button>
              </li>
            </ul>
          </nav>

          <p className="text-[9px] uppercase tracking-[0.1em] text-[#9c9c9c]">
            © {new Date().getFullYear()} {ru ? "Иван Богуш" : "Ivan Bogush"} ·{" "}
            {ru ? "Москва / удалённо" : "Moscow / remote"}
          </p>
        </div>

        <div className="pb-4 flex flex-wrap gap-x-7 gap-y-2 text-[9px] uppercase tracking-[0.1em]">
          <a href="/privacy" className="dc-link text-[#9c9c9c]">
            {ru ? "Политика обработки персональных данных" : "Privacy policy (RU)"}
          </a>
          <a href="/consent" className="dc-link text-[#9c9c9c]">
            {ru ? "Согласие на обработку данных" : "Data processing consent (RU)"}
          </a>
        </div>

        <p className="pb-8 text-[9px] leading-[14px] text-[#c1bfb9] max-w-2xl">
          {ru
            ? "* Instagram принадлежит компании Meta, признанной экстремистской организацией и запрещённой на территории РФ."
            : "* Instagram is owned by Meta, which is designated an extremist organisation and banned in Russia."}
        </p>
      </div>
    </footer>
  );
}
