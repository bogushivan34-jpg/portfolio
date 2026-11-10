import { Lang, services } from "@/data/content";

export default function Services({ lang }: { lang: Lang }) {
  const cols = services.columns;

  return (
    <section id="services" className="wrap pt-16 md:pt-24">
      <h2 className="h2">{services.title[lang]}</h2>
      <p className="mt-4 max-w-[640px] text-[18px] leading-[1.55]">{services.lead[lang]}</p>

      <div className="mt-10">
        {/* Column headings, desktop only: on a phone each row carries its own labels */}
        <div className="hidden gap-10 border-b border-line pb-3 md:grid md:grid-cols-[1fr_1.4fr_1.4fr]">
          <p className="label">{cols.what[lang]}</p>
          <p className="label">{cols.includes[lang]}</p>
          <p className="label">{cols.get[lang]}</p>
        </div>

        <ul>
          {services.items.map((item, idx) => (
            <li
              key={idx}
              className="grid gap-x-10 gap-y-3 border-b border-line py-6 first:border-t md:grid-cols-[1fr_1.4fr_1.4fr] md:first:border-t-0"
            >
              <h3 className="text-[19px] font-semibold leading-snug text-ink">{item.title[lang]}</h3>
              <p>
                <span className="label mb-1 block md:hidden">{cols.includes[lang]}</span>
                {item.includes[lang]}
              </p>
              <p className="text-ink">
                <span className="label mb-1 block md:hidden">{cols.get[lang]}</span>
                {item.get[lang]}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 rounded-xl bg-paper p-5 md:p-6">
        <p className="label">{services.audienceLabel[lang]}</p>
        <p className="mt-2 max-w-[820px]">{services.audience[lang]}</p>
      </div>
    </section>
  );
}
