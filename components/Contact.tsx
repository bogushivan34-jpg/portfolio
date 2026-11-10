import ContactForm from "@/components/ContactForm";
import { Lang, contact, profile } from "@/data/content";

export default function Contact({ lang }: { lang: Lang }) {
  return (
    <footer id="contact" className="mt-16 bg-ink text-white md:mt-24">
      <div className="wrap py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-14">
          <div>
            <h2 className="text-[30px] font-semibold leading-[1.15] tracking-[-0.02em] md:text-[40px]">
              {contact.title[lang]}
            </h2>
            <p className="mt-4 max-w-[520px] text-[18px] leading-[1.55] text-white/75">{contact.lead[lang]}</p>

            <p className="mt-10 text-[12px] font-semibold uppercase tracking-[0.08em] text-white/60">
              {contact.orDirect[lang]}
            </p>
            <div className="mt-4 space-y-6">
              <div className="border-t border-white/20 pt-4">
                <p className="text-[13px] text-white/60">{contact.telegramLabel[lang]}</p>
                <a
                  href={profile.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-[22px] font-semibold underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-white md:text-[24px]"
                >
                  {profile.telegram}
                </a>
              </div>
              <div className="border-t border-white/20 pt-4">
                <p className="text-[13px] text-white/60">{contact.emailLabel[lang]}</p>
                <a
                  href={`mailto:${profile.email}`}
                  className="mt-1 inline-block text-[22px] font-semibold underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-white md:text-[24px]"
                >
                  {profile.email}
                </a>
              </div>
            </div>
          </div>

          <ContactForm lang={lang} />
        </div>

        <div className="mt-14 border-t border-white/20 pt-6 text-[13px] leading-[1.5] text-white/60">
          <p>
            © {new Date().getFullYear()} {profile.name[lang]} · {profile.location[lang]} ·{" "}
            <a href="/privacy" className="underline underline-offset-2 hover:text-white">
              {lang === "ru" ? "Политика обработки данных" : "Privacy policy"}
            </a>
          </p>
          <p className="mt-2 max-w-[720px]">{contact.disclaimer[lang]}</p>
        </div>
      </div>
    </footer>
  );
}
