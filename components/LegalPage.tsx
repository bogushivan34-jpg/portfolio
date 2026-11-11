import type { ReactNode } from "react";
import { legalLinks, profile } from "@/data/content";

export interface LegalSection {
  title: string;
  paragraphs: ReactNode[];
}

/* Who the customer deals with, as the offer and the payment page list it. */
export const requisites: string[] = [
  `${profile.legalName.ru}, ${profile.taxStatus.ru}`,
  `ИНН ${profile.inn}`,
  `Телефон: ${profile.phone}`,
  `E-mail: ${profile.email} · Telegram: ${profile.telegram}`,
  "Сайт: ivanbogush.ru",
];

/* A plain document page: the offer, payment terms, privacy policy and consent text, in Russian only. */
export default function LegalPage({
  title,
  edition,
  intro,
  sections,
}: {
  title: string;
  edition: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="wrap flex h-[60px] items-center justify-between">
          <a href="/" className="text-[16px] font-semibold text-ink">
            {profile.name.ru}
          </a>
          <a href="/" className="link text-[15px]">
            На главную
          </a>
        </div>
      </header>

      <main className="wrap max-w-[820px] py-12 md:py-16">
        <h1 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] text-ink md:text-[40px]">{title}</h1>
        <p className="mt-3 text-[14px] text-muted">{edition}</p>
        <p className="mt-6 text-[18px] leading-[1.6]">{intro}</p>

        <div className="mt-10">
          {sections.map((s, i) => (
            <section key={s.title} className="border-t border-line py-6">
              <h2 className="text-[19px] font-semibold text-ink">
                <span className="num mr-3 text-[15px] text-accent">{i + 1}</span>
                {s.title}
              </h2>
              <div className="mt-3 space-y-3 text-[16px] leading-[1.6]">
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-7 gap-y-3 border-t border-line pt-6 text-[15px]">
          {legalLinks.map((item) => (
            <a key={item.href} href={item.href} className="link">
              {item.label.ru}
            </a>
          ))}
          <a href="/consent" className="link">
            Согласие на обработку
          </a>
        </div>
        <p className="mt-5 text-[14px] leading-[1.6] text-muted">
          {profile.legalName.ru}, {profile.taxStatus.ru} · ИНН {profile.inn} ·{" "}
          <a href={profile.phoneHref} className="whitespace-nowrap hover:text-ink">
            {profile.phone}
          </a>{" "}
          ·{" "}
          <a href={`mailto:${profile.email}`} className="hover:text-ink">
            {profile.email}
          </a>
        </p>
      </main>
    </>
  );
}
