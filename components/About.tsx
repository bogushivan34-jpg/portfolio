import Image from "next/image";
import { Lang, about, profile } from "@/data/content";

export default function About({ lang }: { lang: Lang }) {
  return (
    <section id="about" className="wrap pt-16 md:pt-24">
      <h2 className="h2">{about.title[lang]}</h2>

      <div className="mt-10 grid gap-10 md:grid-cols-[280px_minmax(0,1fr)] md:gap-14">
        <Image
          src={profile.portrait}
          alt={profile.name[lang]}
          width={912}
          height={1164}
          className="h-auto w-full max-w-[280px] rounded-xl border border-line"
        />

        <div>
          <div className="max-w-[680px] space-y-4 text-[18px] leading-[1.6]">
            {about.bio.map((p, idx) => (
              <p key={idx}>{p[lang]}</p>
            ))}
          </div>

          <dl className="mt-9 border-t border-line">
            {about.facts.map((fact, idx) => (
              <div key={idx} className="grid gap-x-8 gap-y-1 border-b border-line py-4 sm:grid-cols-[150px_minmax(0,1fr)]">
                <dt className="label pt-[5px]">{fact.label[lang]}</dt>
                <dd className="text-[16px] leading-[1.55] text-ink">{fact.value[lang]}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
