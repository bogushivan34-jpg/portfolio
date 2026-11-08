"use client";

import React from "react";
import { Language } from "@/types";

/* Direct contact channels: used in the contacts drawer and the "Who it's for" section. */
export default function ContactLinks({ lang }: { lang: Language }) {
  const ru = lang === "ru";

  return (
    <div className="dc-hairline-t">
      <div className="py-6 dc-hairline-soft-b">
        <span className="text-[9px] uppercase tracking-[0.14em] text-[#9c9c9c] block mb-2">
          {ru ? "Telegram · быстрее всего" : "Telegram · fastest"}
        </span>
        <a
          href="https://t.me/myfeelinzz"
          target="_blank"
          rel="noopener noreferrer"
          className="dc-link dc-link-accent text-[18px] md:text-[22px]"
        >
          @myfeelinzz
        </a>
      </div>
      <div className="py-6 dc-hairline-soft-b">
        <span className="text-[9px] uppercase tracking-[0.14em] text-[#9c9c9c] block mb-2">
          {ru ? "Почта" : "Email"}
        </span>
        <a href="mailto:bogushiv@mail.ru" className="dc-link text-[18px] md:text-[22px] text-[#3e3d3a]">
          bogushiv@mail.ru
        </a>
      </div>
    </div>
  );
}
