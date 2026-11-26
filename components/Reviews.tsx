import Image from "next/image";
import { Lang, reviews } from "@/data/content";

/* Clients' reviews as they sent them on Telegram: one screenshot each, three columns on a wide screen, one below. */
export default function Reviews({ lang }: { lang: Lang }) {
  const ru = lang === "ru";

  return (
    <section id="reviews" className="wrap pt-16 md:pt-24">
      <h2 className="h2">{reviews.title[lang]}</h2>
      <p className="mt-4 max-w-[640px] text-[18px] leading-[1.55]">{reviews.lead[lang]}</p>

      <div className="mt-10 gap-6 lg:columns-3">
        {reviews.items.map((item) => (
          <Image
            key={item.src}
            src={item.src}
            alt={
              ru
                ? `Отзыв в Telegram, ${item.name.ru}: «${item.text}»`
                : `Telegram review from ${item.name.en}, in Russian: “${item.text}”`
            }
            width={item.width}
            height={item.height}
            className="mb-6 block h-auto w-full max-w-[420px] break-inside-avoid rounded-xl border border-line"
          />
        ))}
      </div>
    </section>
  );
}
