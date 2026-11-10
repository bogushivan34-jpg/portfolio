import CaseBlock from "@/components/CaseBlock";
import TrouvereCase from "@/components/TrouvereCase";
import { Lang, cases, workIntro } from "@/data/content";

export default function Work({ lang }: { lang: Lang }) {
  return (
    <section id="work" className="wrap pt-16 md:pt-24">
      <h2 className="h2">{workIntro.title[lang]}</h2>
      <p className="mt-4 max-w-[640px] text-[18px] leading-[1.55]">{workIntro.lead[lang]}</p>

      <div className="mt-10">
        <TrouvereCase lang={lang} />
      </div>

      <div className="mt-6 border-b border-line">
        {cases.map((item, idx) => (
          <div key={item.id} className={idx === 0 ? "[&>article]:border-t-0" : ""}>
            <CaseBlock item={item} lang={lang} />
          </div>
        ))}
      </div>
    </section>
  );
}
