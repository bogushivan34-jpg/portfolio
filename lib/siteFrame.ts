/*
 * Reading the client's site inside the preview's iframe. It's served from this same domain (/previews/<id>/),
 * so the page around it may look inside: find the part a story chapter is about, and scroll to it.
 */

/** A story anchor is a CSS selector ("#contact", ".hero") or, failing that, text found in a heading. */
export function findAnchor(doc: Document, anchor: string): Element | null {
  try {
    if (/^[#.[]/.test(anchor)) return doc.querySelector(anchor);
    const needle = anchor.replace(/\s+/g, " ").trim().toLowerCase();
    for (const h of Array.from(doc.querySelectorAll("h1, h2, h3"))) {
      if ((h.textContent ?? "").replace(/\s+/g, " ").toLowerCase().includes(needle)) return h;
    }
  } catch {
    /* a bad selector: no anchor */
  }
  return null;
}

/** The anchor the visitor is looking at: the last one whose top has passed the middle of the site's window. */
export function currentAnchor(win: Window, doc: Document, anchors: string[]): string | null {
  const line = win.innerHeight * 0.5;
  let best: string | null = null;
  let bestTop = -Infinity;
  for (const a of anchors) {
    const top = findAnchor(doc, a)?.getBoundingClientRect().top;
    if (top !== undefined && top <= line && top > bestTop) {
      best = a;
      bestTop = top;
    }
  }
  return best;
}
