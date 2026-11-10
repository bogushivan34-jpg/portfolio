import { Lang, approach } from "@/data/content";

export default function Approach({ lang }: { lang: Lang }) {
  return (
    <section id="approach" className="wrap pt-16 md:pt-24">
      <h2 className="h2">{approach.title[lang]}</h2>
      <p className="mt-4 max-w-[640px] text-[18px] leading-[1.55]">{approach.lead[lang]}</p>

      <ol className="mt-10 grid gap-x-14 gap-y-10 md:grid-cols-2">
        {approach.items.map((item, idx) => (
          <li key={idx} className="border-t border-line pt-6">
            <p className="num text-[15px] text-accent">0{idx + 1}</p>
            <h3 className="mt-3 text-[21px] font-semibold leading-snug tracking-[-0.01em] text-ink">
              {item.title[lang]}
            </h3>
            <p className="mt-2">{item.text[lang]}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
