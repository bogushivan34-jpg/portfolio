import Image from "next/image";
import { Lang, reviews } from "@/data/content";

/*
 * Clients' reviews as they sent them on Telegram: one screenshot each, all in one row. A wide screen fits the row;
 * a narrower one scrolls it sideways.
 */
export default function Reviews({ lang }: { lang: Lang }) {
  const ru = lang === "ru";

  return (
    <section id="reviews" className="wrap pt-16 md:pt-24">
      <h2 className="h2">{reviews.title[lang]}</h2>

      <div className="-mx-5 mt-8 flex snap-x items-start gap-8 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0">
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
            className="block h-auto w-[260px] shrink-0 snap-start rounded-xl border border-line lg:w-auto lg:min-w-0 lg:flex-1"
          />
        ))}
      </div>
    </section>
  );
}
