import Image from "next/image";
import { Lang, Shot } from "@/data/content";

/* A screenshot in a plain frame. Clicking opens `href` (the live site) or else the full-size picture, in a new tab. */
export default function Figure({ shot, lang, crop, href }: { shot: Shot; lang: Lang; crop?: boolean; href?: string }) {
  return (
    <figure>
      <a
        href={href ?? shot.src}
        target="_blank"
        rel="noopener noreferrer"
        className={`block overflow-hidden rounded-xl border border-line bg-paper ${crop ? "aspect-[16/10]" : ""}`}
      >
        <Image
          src={shot.src}
          alt={shot.alt[lang]}
          width={shot.width}
          height={shot.height}
          className={crop ? "h-full w-full object-cover" : "h-auto w-full"}
        />
      </a>
      {shot.caption && <figcaption className="mt-2 text-[14px] text-muted">{shot.caption[lang]}</figcaption>}
    </figure>
  );
}
