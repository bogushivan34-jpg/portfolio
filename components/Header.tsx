import { Lang, nav, profile } from "@/data/content";

/*
 * The site header. The main page's sections are anchors; «Услуги» is a tab with a page of its own (/services).
 * On that page the anchors lead back to the main page, and every link keeps `?lang=en` when the page is in English.
 */
export default function Header({
  lang,
  onToggleLang,
  page = "home",
}: {
  lang: Lang;
  onToggleLang: () => void;
  page?: "home" | "services";
}) {
  const ru = lang === "ru";
  const q = ru ? "" : "?lang=en";
  const home = page === "home";
  const hrefFor = (item: (typeof nav)[number]) => (item.page ? `${item.page}${q}` : home ? `#${item.id}` : `/${q}#${item.id}`);
  const services = nav.find((item) => item.page);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="wrap flex h-[60px] items-center justify-between gap-4">
        <a href={home ? "#top" : `/${q}`} className="text-[16px] font-semibold text-ink">
          {profile.name[lang]}
        </a>

        <nav className="hidden md:block" aria-label={ru ? "Разделы" : "Sections"}>
          <ul className="flex gap-5 text-[15px] lg:gap-8">
            {nav.map((item) => {
              const current = item.page !== undefined && page === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={hrefFor(item)}
                    aria-current={current ? "page" : undefined}
                    className={`relative transition-colors hover:text-ink ${
                      current
                        ? "font-medium text-ink after:absolute after:inset-x-0 after:-bottom-[19px] after:h-[2px] after:rounded-full after:bg-ink"
                        : "text-muted"
                    }`}
                  >
                    {item.label[lang]}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          {/* On a phone the section links are hidden, but the services tab is a separate page, so it stays */}
          {services && page !== "services" && (
            <a href={hrefFor(services)} className="text-[14px] font-medium text-muted transition-colors hover:text-ink md:hidden">
              {services.label[lang]}
            </a>
          )}
          <button
            type="button"
            onClick={onToggleLang}
            className="text-[14px] font-medium text-muted transition-colors hover:text-ink"
            aria-label={ru ? "Switch to English" : "Переключить на русский"}
          >
            {ru ? "EN" : "RU"}
          </button>
          <a
            href={profile.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-ink px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-accent"
          >
            {ru ? "Написать" : "Contact"}
          </a>
        </div>
      </div>
    </header>
  );
}
