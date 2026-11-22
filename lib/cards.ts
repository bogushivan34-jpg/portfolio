/*
 * The pictures a link to this site unfurls with in Telegram, WhatsApp, VK and the like (og:image).
 * Server (build) only: cardFor looks on disk.
 */
import { existsSync } from "node:fs";
import path from "node:path";

/** the main page's and /services': Ivan, what he does and his headline result, drawn by scripts/site-card.mjs */
export const siteCard = {
  url: "/images/site_card.jpg",
  width: 1200,
  height: 630,
  alt: "Иван Богуш · сайты, контент и привлечение клиентов",
};

/** A preview's: its site's first screen, shot by scripts/add-work.mjs into public/cards/<id>.jpg. */
export function cardFor(id: string, alt: string) {
  if (!existsSync(path.join(process.cwd(), "public", "cards", `${id}.jpg`))) return undefined;
  return { url: `/cards/${id}.jpg`, width: 1200, height: 630, alt };
}
