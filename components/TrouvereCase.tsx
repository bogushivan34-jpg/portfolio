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

      {/* How */}
      <h4 className="mt-12 text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">
        {t.channelsTitle[lang]}
      </h4>
      <ol className="mt-7 grid gap-x-12 gap-y-8 md:grid-cols-2">
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

      {/* Community */}
      <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <h4 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">
            {t.community.title[lang]}
          </h4>
          <p className="mt-3">{t.community.lead[lang]}</p>
          <ul className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {t.community.points.map((p, idx) => (
              <li key={idx} className="border-t border-line pt-4">
                <p className="font-semibold text-ink">{p.title[lang]}</p>
                <p className="mt-1 text-[16px] leading-[1.55]">{p.text[lang]}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <Figure shot={t.community.shot} lang={lang} />
        </div>
      </div>

      {/* Brand and media */}
      <h4 className="mt-12 text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">
        {t.brandTitle[lang]}
      </h4>
      <p className="mt-3 max-w-[760px]">{t.brand[lang]}</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-3">
        {t.shots.map((shot) => (
          <Figure key={shot.src} shot={shot} lang={lang} crop />
        ))}
      </div>
    </article>
  );
}
