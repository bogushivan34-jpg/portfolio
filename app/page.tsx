"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SelectedWorks from "@/components/SelectedWorks";
import ServicesSection from "@/components/ServicesSection";
import BriefSection from "@/components/BriefSection";
import SkillsMatrix from "@/components/SkillsMatrix";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
import CaseStudyModal from "@/components/CaseStudyModal";
import InquiryModal from "@/components/InquiryModal";
import { CaseStudy, Language } from "@/types";

export default function Home() {
  const [lang, setLang] = useState<Language>("ru");
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["top", "works", "services", "brief", "skills", "about"];
      const scrollPos = window.scrollY + 200;

      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(s);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#3e3d3a] flex flex-col justify-between">
      {/* Fixed left architectural rail */}
      <Header
        lang={lang}
        setLang={setLang}
        onOpenInquiry={() => setInquiryOpen(true)}
        activeSection={activeSection}
      />

      {/* Main Exhibition Content */}
      <div className="flex-1 w-full">
        {/* Section 00: Hero & Statement */}
        <Hero lang={lang} onOpenInquiry={() => setInquiryOpen(true)} />

        {/* Section 01: Selected Works Exhibition */}
        <SelectedWorks lang={lang} onSelectCase={(cs) => setSelectedCase(cs)} />

        {/* Section 02: Services - site, social setup, management, analytics */}
        <ServicesSection lang={lang} onOpenInquiry={() => setInquiryOpen(true)} />

        {/* Section 03: Who it's for + contacts */}
        <BriefSection lang={lang} />

        {/* Section 04: Skills & tools */}
        <SkillsMatrix lang={lang} />

        {/* Section 05: About, education, award, principles */}
        <AboutSection lang={lang} onOpenInquiry={() => setInquiryOpen(true)} />
      </div>

      {/* Fixed Architectural Footer */}
      <Footer lang={lang} onOpenInquiry={() => setInquiryOpen(true)} />

      {/* Case Study Deep-Dive Dossier Modal */}
      {selectedCase && (
        <CaseStudyModal
          caseStudy={selectedCase}
          lang={lang}
          onClose={() => setSelectedCase(null)}
          onOpenInquiry={() => setInquiryOpen(true)}
        />
      )}

      {/* Slide-over Enquiry Drawer */}
      <InquiryModal
        isOpen={inquiryOpen}
        lang={lang}
        onClose={() => setInquiryOpen(false)}
      />
    </main>
  );
}
