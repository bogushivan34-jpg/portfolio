import Image from "next/image";
import Figure from "@/components/Figure";
import { Lang, trouvere } from "@/data/content";

/* The lead case, shown in full: the numbers, then how they were reached with no ad spend. */
export default function TrouvereCase({ lang }: { lang: Lang }) {
  const t = trouvere;

  return (
    <article id="trouvere" className="rounded-2xl bg-paper p-6 sm:p-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-14">
        <div>
          <p className="label">{t.meta[lang]}</p>
          <h3 className="mt-3 text-[34px] font-semibold leading-[1.1] tracking-[-0.02em] text-ink md:text-[44px]">
            {t.title}
          </h3>
          <p className="mt-5 text-[18px] leading-[1.55] text-ink md:text-[19px]">{t.summary[lang]}</p>

          <p className="label mt-8">{t.taskLabel[lang]}</p>
          <p className="mt-2">{t.task[lang]}</p>

          <a href={t.link.url} target="_blank" rel="noopener noreferrer" className="link mt-6 inline-block">
            {t.link.label} ↗
          </a>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {t.phones.map((shot) => (
            <Image
              key={shot.src}
              src={shot.src}
              alt={shot.alt[lang]}
              width={shot.width}
              height={shot.height}
              className="h-auto w-full rounded-[14px] border border-line"
            />
          ))}
        </div>
      </div>

      {/* Result */}
      <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
        {t.metrics.map((m, idx) => (
          <li key={idx} className="bg-white p-4 sm:p-5 md:p-6">
            <p className="num whitespace-nowrap text-[26px] leading-none sm:text-[30px] md:text-[36px]">{m.value[lang]}</p>
            <p className="mt-3 text-[14px] leading-[1.45] text-muted">{m.label[lang]}</p>
          </li>
        ))}
      </ul>
      <p className="mt-6 max-w-[760px] text-[18px] leading-[1.55] text-ink">{t.insight[lang]}</p>

      {/* Channels, six months: the rows add up to the total */}
      <h4 className="mt-12 text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">
        {t.funnel.title[lang]}
      </h4>
      <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full text-left text-[14px] leading-[1.4] sm:text-[15px]">
          <thead>
            <tr className="text-[13px] text-muted">
              <th scope="col" className="px-3 py-3 font-medium sm:px-5">{t.funnel.columns.channel[lang]}</th>
              {/* visits are the least telling column, so a phone drops them and keeps the payments in view */}
              <th scope="col" className="hidden px-3 py-3 text-right font-medium sm:table-cell">
                {t.funnel.columns.visits[lang]}
              </th>
              <th scope="col" className="px-2 py-3 text-right font-medium sm:px-3">{t.funnel.columns.paid[lang]}</th>
              <th scope="col" className="px-3 py-3 text-right font-medium sm:px-5">{t.funnel.columns.revenue[lang]}</th>
            </tr>
          </thead>
          <tbody>
            {t.funnel.rows.map((r, idx) => (
              <tr key={idx} className="border-t border-line">
                <th scope="row" className="px-3 py-3 font-normal text-ink sm:px-5">{r.channel[lang]}</th>
                <td className="num hidden whitespace-nowrap px-3 py-3 text-right font-normal sm:table-cell">{r.visits[lang]}</td>
                <td className="num px-2 py-3 text-right sm:px-3">{r.paid}</td>
                <td className="num px-3 py-3 text-right sm:px-5">{r.revenue}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line font-semibold text-ink">
              <th scope="row" className="px-3 py-3 font-semibold sm:px-5">{t.funnel.total.channel[lang]}</th>
              <td className="num hidden whitespace-nowrap px-3 py-3 text-right sm:table-cell">{t.funnel.total.visits[lang]}</td>
              <td className="num px-2 py-3 text-right sm:px-3">{t.funnel.total.paid}</td>
              <td className="num px-3 py-3 text-right sm:px-5">{t.funnel.total.revenue}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="mt-3 max-w-[760px] text-[15px] leading-[1.55] text-muted">{t.funnel.note[lang]}</p>

      {/* How */}
      <h4 className="mt-12 text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">
        {t.channelsTitle[lang]}
      </h4>
      <ol className="mt-7 grid gap-x-10 gap-y-6 md:grid-cols-3">
        {t.channels.map((c, idx) => (
          <li key={idx} className="flex gap-4">
            <span className="num mt-[2px] w-5 shrink-0 text-[15px] text-accent">{idx + 1}</span>
            <div>
              <p className="font-semibold text-ink">{c.title[lang]}</p>
              <p className="mt-1 text-[16px] leading-[1.55]">{c.text[lang]}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-9 rounded-xl border border-line bg-white p-5 text-[16px] leading-[1.55] text-ink">
        {t.next[lang]}
      </p>

      {/* Community, brand and media: two short texts over one row of pictures */}
      <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-12">
        <div>
          <h4 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">
            {t.community.title[lang]}
          </h4>
          <p className="mt-3">{t.community.lead[lang]}</p>
        </div>
        <div>
          <h4 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">{t.brandTitle[lang]}</h4>
          <p className="mt-3">{t.brand[lang]}</p>
        </div>
      </div>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {/* a phone gives the Discord banner the whole row and the two brand pictures half each */}
        <div className="col-span-2 lg:col-span-1">
          <Figure shot={t.community.shot} lang={lang} crop />
        </div>
        {t.shots.map((shot) => (
          <Figure key={shot.src} shot={shot} lang={lang} crop />
        ))}
      </div>
    </article>
  );
}
