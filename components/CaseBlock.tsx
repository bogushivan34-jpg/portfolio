import Figure from "@/components/Figure";
import { CaseItem, Lang, caseLabels } from "@/data/content";

/* One client case, readable in place: task, what was done, result. */
export default function CaseBlock({ item, lang }: { item: CaseItem; lang: Lang }) {
  return (
    <article id={item.id} className="grid gap-8 border-t border-line py-12 lg:grid-cols-12 lg:gap-14 lg:py-16">
      <div className="lg:col-span-7">
        <p className="label">{item.meta[lang]}</p>
        <h3 className="h3 mt-3">{item.title[lang]}</h3>
        <p className="mt-2 text-[15px] text-muted">
          {caseLabels.role[lang]}: {item.role[lang].toLowerCase()}
        </p>
        {item.link && (
          <a href={item.link.url} target="_blank" rel="noopener noreferrer" className="link mt-3 inline-block text-[16px]">
            {item.link.label} ↗
          </a>
        )}

        <p className="label mt-8">{caseLabels.task[lang]}</p>
        <p className="mt-2">{item.task[lang]}</p>

        <p className="label mt-7">{caseLabels.did[lang]}</p>
        <ul className="mt-2 space-y-2">
          {item.did.map((line, idx) => (
            <li key={idx} className="flex gap-3">
              <span aria-hidden="true" className="mt-[13px] h-px w-3 shrink-0 bg-muted" />
              <span>{line[lang]}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 rounded-xl bg-accentSoft p-5 md:p-6">
          <p className="label !text-accent">{caseLabels.result[lang]}</p>
          <p className="mt-2 font-medium text-ink">{item.result[lang]}</p>
          {item.note && <p className="mt-2 text-[15px] leading-[1.5]">{item.note[lang]}</p>}
        </div>
      </div>

      <div className="lg:col-span-5">
        {item.shot && <Figure shot={item.shot} lang={lang} href={item.link?.url} />}
        {item.panel && (
          <div className="rounded-xl border border-line p-5 md:p-6">
            <p className="font-semibold text-ink">{item.panel.title[lang]}</p>
            <ul className="mt-4 space-y-3 text-[16px] leading-[1.5]">
              {item.panel.items.map((line, idx) => (
                <li key={idx} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[12px] h-px w-3 shrink-0 bg-muted" />
                  <span>{line[lang]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
