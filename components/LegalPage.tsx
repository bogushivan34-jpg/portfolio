import { profile } from "@/data/content";

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

/* A plain document page: the privacy policy and the consent text, in Russian only. */
export default function LegalPage({
  title,
  edition,
  intro,
  sections,
}: {
  title: string;
  edition: string;
  intro: string;
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
          <a href="/privacy" className="link">
            Политика обработки данных
          </a>
          <a href="/consent" className="link">
            Согласие на обработку
          </a>
          <a href={`mailto:${profile.email}`} className="link">
            {profile.email}
          </a>
        </div>
      </main>
    </>
  );
}
