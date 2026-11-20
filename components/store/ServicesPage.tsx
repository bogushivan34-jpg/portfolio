"use client";

import Contact from "@/components/Contact";
import Header from "@/components/Header";
import { services } from "@/data/content";
import { useLang } from "@/lib/useLang";
import Store from "./Store";

/* /services: the «Услуги» tab. The store, who it's for, and the contact footer the cart's enquiry link leads to. */
export default function ServicesPage() {
  const [lang, toggleLang] = useLang();

  return (
    <>
      <Header lang={lang} onToggleLang={toggleLang} page="services" />
      <main className="wrap pt-12 md:pt-16">
        <h1 className="text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[44px] md:text-[52px]">
          {services.title[lang]}
        </h1>
        <p className="mt-4 max-w-[640px] text-[18px] leading-[1.55]">{services.lead[lang]}</p>
        <p className="mt-5 flex items-center gap-2 text-[14px] font-medium text-muted">
          <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden="true">
            <path
              d="M7 9V4.5a1.5 1.5 0 0 1 3 0V9m0-1.5a1.5 1.5 0 0 1 3 0V9m0-.5a1.5 1.5 0 0 1 3 0v3.5a6 6 0 0 1-6 6h-.6a5 5 0 0 1-3.9-1.9L2.8 13a1.5 1.5 0 0 1 2.3-1.9L7 13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {services.hint[lang]}
        </p>

        <div className="mt-8 md:mt-10">
          <Store lang={lang} />
        </div>

        <div className="mt-10 rounded-xl bg-paper p-5 md:mt-14 md:p-6">
          <p className="label">{services.audienceLabel[lang]}</p>
          <p className="mt-2 max-w-[820px]">{services.audience[lang]}</p>
        </div>
      </main>
      <Contact lang={lang} />
    </>
  );
}
