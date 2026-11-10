import { Lang, nav, profile } from "@/data/content";

export default function Header({ lang, onToggleLang }: { lang: Lang; onToggleLang: () => void }) {
  const ru = lang === "ru";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="wrap flex h-[60px] items-center justify-between gap-4">
        <a href="#top" className="text-[16px] font-semibold text-ink">
          {profile.name[lang]}
        </a>

        <nav className="hidden md:block" aria-label={ru ? "Разделы" : "Sections"}>
          <ul className="flex gap-8 text-[15px]">
            {nav.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="text-muted transition-colors hover:text-ink">
                  {item.label[lang]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
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
