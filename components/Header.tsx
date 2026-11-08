"use client";

import React, { useState } from "react";
import { Language } from "@/types";

interface HeaderProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenInquiry: () => void;
  activeSection: string;
}

export default function Header({ lang, setLang, onOpenInquiry, activeSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainNav = [
    { id: "works", label: lang === "ru" ? "Работы" : "Works" },
    { id: "services", label: lang === "ru" ? "Услуги" : "Services" },
    { id: "brief", label: lang === "ru" ? "Для кого" : "Who it's for" },
    { id: "skills", label: lang === "ru" ? "Навыки" : "Skills" },
  ];

  const secondaryNav = [
    { id: "about", label: lang === "ru" ? "О себе" : "About" },
  ];

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* ----- Fixed left rail (ref: HEADER 275px, top + bottom navs) ----- */}
      <header className="hidden lg:flex fixed top-0 left-0 z-50 h-screen w-[275px] shrink-0 flex-col justify-between py-12 pl-14 pr-8 bg-white">
        {/* Top: brand + primary navigation */}
        <div>
          <h1 className="mb-10">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollTo("top");
              }}
              className="text-[15px] uppercase tracking-[0.06em] leading-tight text-[#3e3d3a] hover:text-[#ff7e22] transition-colors"
            >
              {lang === "ru" ? "Иван Богуш" : "Ivan Bogush"}
            </a>
          </h1>

          <span className="dc-label dc-label-muted block mb-8">
            {lang === "ru" ? "SMM · PR · Сайты" : "SMM · PR · Websites"}
          </span>

          <nav>
            <ul className="space-y-4">
              {mainNav.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={`dc-nav-link ${activeSection === item.id ? "is-active" : ""}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom: secondary navigation, contacts, language (ref: About / Book / Press / Contact) */}
        <div>
          <nav className="mb-8">
            <ul className="space-y-4">
              {secondaryNav.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={`dc-nav-link ${activeSection === item.id ? "is-active" : ""}`}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button onClick={onOpenInquiry} className="dc-nav-link">
                  {lang === "ru" ? "Контакты" : "Contacts"}
                </button>
              </li>
            </ul>
          </nav>

          <div className="dc-hairline-t pt-5 space-y-2 text-[10px] leading-[16px] text-[#9c9c9c]">
            <a
              href="https://t.me/myfeelinzz"
              target="_blank"
              rel="noopener noreferrer"
              className="block uppercase tracking-[0.1em] hover:text-[#3e3d3a] transition-colors"
            >
              Telegram · @myfeelinzz
            </a>
            <a
              href="mailto:bogushiv@mail.ru"
              className="block uppercase tracking-[0.1em] hover:text-[#3e3d3a] transition-colors"
            >
              bogushiv@mail.ru
            </a>
            <button
              onClick={() => setLang(lang === "ru" ? "en" : "ru")}
              className="block uppercase tracking-[0.1em] hover:text-[#3e3d3a] transition-colors"
            >
              {lang === "ru" ? "English" : "Русский"}
            </button>
          </div>
        </div>
      </header>

      {/* ----- Mobile top bar + drawer (ref: .burger / .drawer) ----- */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-5 bg-white/95 backdrop-blur-sm dc-hairline-b">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              scrollTo("top");
            }}
            className="text-[13px] uppercase tracking-[0.06em] text-[#3e3d3a]"
          >
            {lang === "ru" ? "Иван Богуш" : "Ivan Bogush"}
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[11px] uppercase tracking-[0.18em] text-[#3e3d3a]"
          >
            {mobileMenuOpen ? (lang === "ru" ? "Закрыть" : "Close") : lang === "ru" ? "Меню" : "Menu"}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white pt-24 pb-10 px-6 flex flex-col justify-between animate-fade-in">
            <nav>
              <ul className="space-y-5">
                {[...mainNav, ...secondaryNav].map((item, idx) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollTo(item.id)}
                      className="dc-nav-link text-[16px]"
                    >
                      <span className="text-[10px] text-[#9c9c9c] mr-3">0{idx + 1}</span>
                      {item.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={onOpenInquiry} className="dc-nav-link text-[16px]">
                    <span className="text-[10px] text-[#9c9c9c] mr-3">06</span>
                    {lang === "ru" ? "Контакты" : "Contacts"}
                  </button>
                </li>
              </ul>
            </nav>

            <div className="dc-hairline-t pt-5 space-y-2 text-[10px] uppercase tracking-[0.1em] text-[#9c9c9c]">
              <a href="https://t.me/myfeelinzz" target="_blank" rel="noopener noreferrer" className="block">
                Telegram · @myfeelinzz
              </a>
              <a href="mailto:bogushiv@mail.ru" className="block">
                bogushiv@mail.ru
              </a>
              <button onClick={() => setLang(lang === "ru" ? "en" : "ru")}>
                {lang === "ru" ? "English" : "Русский"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
