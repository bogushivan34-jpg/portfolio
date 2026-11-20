"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/data/content";

/* The pages are built in Russian; `?lang=en` opens them in English, so either version can be sent as a link. */
export function useLang() {
  const [lang, setLang] = useState<Lang>("ru");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("lang") === "en") setLang("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = () => {
    const next: Lang = lang === "ru" ? "en" : "ru";
    setLang(next);
    const url = new URL(window.location.href);
    if (next === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);
  };

  return [lang, toggleLang] as const;
}
