"use client";

import About from "@/components/About";
import Approach from "@/components/Approach";
import Contact from "@/components/Contact";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Reviews from "@/components/Reviews";
import Work from "@/components/Work";
import { useLang } from "@/lib/useLang";

export default function Home() {
  const [lang, toggleLang] = useLang();

  // Services have a page of their own, /services (app/services)
  return (
    <>
      <Header lang={lang} onToggleLang={toggleLang} />
      <main>
        <Hero lang={lang} />
        <Work lang={lang} />
        <Reviews lang={lang} />
        <Approach lang={lang} />
        <About lang={lang} />
      </main>
      <Contact lang={lang} />
    </>
  );
}
