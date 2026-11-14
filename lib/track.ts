import { submitForm } from "@/lib/submit";

/*
 * The one thing the previews report: a client pressed «Показать» on the first screen. It goes to the contact-form
 * Worker like a form would, and from there to Ivan's Telegram bot (worker/src/index.ts), which counts unique
 * visitors per preview. Nothing is stored in the visitor's browser for it, and no cookie is set.
 *
 * Ivan's own browsers are never counted: one that has opened the /works list (it keeps the token), or one that has
 * opened a preview from the bot's own links, which carry ?me.
 */

/** where the /works list keeps its token (components/WorksIndex.tsx) */
export const WORKS_TOKEN_KEY = "works-token";
/** set by ?me, or by opening the /works list: this browser is Ivan's */
const OWN_KEY = "works-me";

export function ownBrowser(): boolean {
  try {
    return Boolean(localStorage.getItem(WORKS_TOKEN_KEY) || localStorage.getItem(OWN_KEY));
  } catch {
    return false;
  }
}

export function markOwnBrowser(): void {
  try {
    localStorage.setItem(OWN_KEY, "1");
  } catch {
    /* no storage: this browser can't be told apart */
  }
}

/** Fire and forget: the reveal never waits on it, and a failure is nobody's business. */
export function trackShow(work: { id: string; title: string }): void {
  if (ownBrowser()) return;
  submitForm({ kind: "event", event: "show", work }, { keepalive: true, priority: "low" }).catch(() => {});
}
