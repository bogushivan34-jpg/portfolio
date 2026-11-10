"use client";

import { useEffect, useState } from "react";
import About from "@/components/About";
import Approach from "@/components/Approach";
import Contact from "@/components/Contact";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Work from "@/components/Work";
import { Lang } from "@/data/content";

export default function Home() {
  const [lang, setLang] = useState<Lang>("ru");

  /* The page is built in Russian; `?lang=en` opens it in English, so either version can be sent as a link. */
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

  return (
    <>
      <Header lang={lang} onToggleLang={toggleLang} />
      <main>
        <Hero lang={lang} />
        <Work lang={lang} />
        <Approach lang={lang} />
        <Services lang={lang} />
        <About lang={lang} />
      </main>
      <Contact lang={lang} />
    </>
  );
}
