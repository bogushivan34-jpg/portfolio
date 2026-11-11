import { Lang, formatPrice, legalLinks, prices } from "@/data/content";

/* The price list. "Order" opens the enquiry form with that option attached; payment follows by invoice. */
export default function Prices({ lang, onOrder }: { lang: Lang; onOrder: (tierId: string) => void }) {
  return (
    <section id="prices" className="wrap pt-16 md:pt-24">
      <h2 className="h2">{prices.title[lang]}</h2>
      <p className="mt-4 max-w-[640px] text-[18px] leading-[1.55]">{prices.lead[lang]}</p>

      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {prices.tiers.map((tier) => (
          <li key={tier.id} className="flex flex-col rounded-xl border border-line p-6">
            <h3 className="text-[19px] font-semibold leading-snug text-ink">{tier.name[lang]}</h3>
            <p className="mt-1 text-[15px] leading-[1.5] text-muted">{tier.summary[lang]}</p>
            <p className="num mt-5 text-[34px] leading-none">{formatPrice(tier.price, lang)}</p>

            <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
              {tier.includes.map((line, idx) => (
                <li key={idx} className="flex gap-3 text-[16px] leading-[1.5]">
                  <span aria-hidden="true" className="mt-[11px] h-px w-3 shrink-0 bg-muted" />
                  <span>{line[lang]}</span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-6">
              <button type="button" onClick={() => onOrder(tier.id)} className="btn w-full">
                {prices.order[lang]}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-x-10 gap-y-6 rounded-xl bg-paper p-5 md:grid-cols-2 md:p-6">
        <div>
          <p className="label">{prices.otherLabel[lang]}</p>
          <p className="mt-2">{prices.other[lang]}</p>
        </div>
        <div>
          <p className="label">{prices.paymentLabel[lang]}</p>
          <p className="mt-2">{prices.payment[lang]}</p>
          <p className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
            {legalLinks.slice(0, 2).map((item) => (
              <a key={item.href} href={item.href} className="link">
                {item.label[lang]}
              </a>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
