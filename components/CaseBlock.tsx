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
          {item.funnel && (
            <div className="mt-5 border-t border-accent/15 pt-5">
              <p className="num text-[30px] leading-none text-accent md:text-[36px]">{item.funnel.headline.value[lang]}</p>
              <p className="mt-2 text-[16px] leading-[1.5] text-ink">{item.funnel.headline.label[lang]}</p>
            </div>
          )}
        </div>

        {item.funnel && <Funnel funnel={item.funnel} lang={lang} />}
      </div>

      <div className="lg:col-span-5">
        <Figure shot={item.shot} lang={lang} href={item.link?.url} />
      </div>
    </article>
  );
}

/* Visit to booking as horizontal bars: each bar is a share of all visitors, the right column the step-to-step rate. */
function Funnel({ funnel, lang }: { funnel: NonNullable<CaseItem["funnel"]>; lang: Lang }) {
  return (
    <div className="mt-8">
      <p className="label">{funnel.title[lang]}</p>
      <ol className="mt-4 space-y-4">
        {funnel.steps.map((step, idx) => {
          const prev = funnel.steps[idx - 1];
          return (
            <li key={idx}>
              <p className="text-[15px] leading-[1.4] text-ink">{step.label[lang]}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="num w-11 shrink-0 text-right text-[15px]">{step.pct}%</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${step.pct}%` }} />
                </span>
                <span className="w-12 shrink-0 text-right text-[14px] font-medium text-accent">
                  {prev ? `→ ${Math.round((step.pct / prev.pct) * 100)}%` : ""}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-[14px] leading-[1.55] text-muted">{funnel.note[lang]}</p>
    </div>
  );
}
