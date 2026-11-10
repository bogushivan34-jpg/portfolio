import { Lang, hero, profile, proof } from "@/data/content";

export default function Hero({ lang }: { lang: Lang }) {
  return (
    <section id="top">
      <div className="wrap pb-12 pt-12 md:pb-16 md:pt-20">
        <div className="flex items-center gap-3">
          {/* The portrait, cropped to the face */}
          <span
            role="img"
            aria-label={profile.name[lang]}
            className="h-12 w-12 shrink-0 rounded-full bg-paper bg-no-repeat"
            style={{
              backgroundImage: `url(${profile.portrait})`,
              backgroundSize: "240%",
              backgroundPosition: "62% 38%",
            }}
          />
          <p className="text-[15px] leading-snug text-muted">
            <span className="block font-semibold text-ink">{profile.name[lang]}</span>
            {profile.location[lang]}
          </p>
        </div>

        <p className="label mt-10">{hero.eyebrow[lang]}</p>
        <h1 className="mt-4 max-w-[900px] text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[44px] md:text-[56px]">
          {hero.title[lang]}
        </h1>
        <p className="mt-6 max-w-[680px] text-[18px] leading-[1.55] md:text-[20px]">{hero.lead[lang]}</p>

        <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
          <a href={profile.telegramUrl} target="_blank" rel="noopener noreferrer" className="btn">
            {hero.primaryCta[lang]}
          </a>
          <a href="#work" className="link">
            {hero.secondaryCta[lang]}
          </a>
        </div>
      </div>

      {/* Proof: four numbers, each with its source in the cases below */}
      <div className="border-y border-line">
        <ul className="wrap grid grid-cols-2 lg:grid-cols-4">
          {proof.map((item, idx) => (
            <li
              key={idx}
              className={`py-7 pr-5 lg:py-9 ${idx > 0 ? "lg:border-l lg:border-line lg:pl-7" : ""} ${
                idx % 2 === 1 ? "border-l border-line pl-5" : ""
              } ${idx > 1 ? "border-t border-line lg:border-t-0" : ""}`}
            >
              <p className="num whitespace-nowrap text-[27px] leading-none sm:text-[30px] md:text-[38px]">{item.value[lang]}</p>
              <p className="mt-3 text-[14px] leading-[1.45] text-muted">{item.label[lang]}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
