"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Lang, ServiceId, StoreItem, profile, services as t } from "@/data/content";
import Glyph from "./glyphs";

export interface CartHandle {
  /** the drop target, in viewport coordinates */
  rect(): DOMRect | null;
  /** the cart takes a hit: a squash and a bounce */
  bump(): void;
}

/* Where the chips of added services sit in the basket (percent of the cart's box) and how they lean. */
const SLOTS = [
  { x: 36, y: 33, r: -14 },
  { x: 56, y: 29, r: 9 },
  { x: 73, y: 34, r: -6 },
  { x: 46, y: 20, r: 16 },
  { x: 65, y: 18, r: -10 },
  { x: 28, y: 22, r: 6 },
  { x: 81, y: 22, r: 12 },
  { x: 55, y: 12, r: -4 },
];

/*
 * The cart, fixed in the bottom right corner. While a tile is being dragged it grows into a drop target; a
 * tile that lands drops in as a chip and the cart bounces. Clicking it opens the set: what's in it, and a
 * message to Ivan with the set filled in. No prices.
 */
const Cart = forwardRef<
  CartHandle,
  { lang: Lang; items: StoreItem[]; armed: boolean; over: boolean; onRemove: (id: ServiceId) => void }
>(function Cart({ lang, items, armed, over, onRemove }, ref) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => ({
    rect: () => buttonRef.current?.getBoundingClientRect() ?? null,
    bump: () => {
      const art = artRef.current;
      if (!art || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      art.animate(
        [
          { transform: "scale(1)" },
          { transform: "translateY(3px) scale(1.12, 0.84)", offset: 0.22 },
          { transform: "translateY(-5px) scale(0.94, 1.08)", offset: 0.48 },
          { transform: "translateY(1px) scale(1.03, 0.97)", offset: 0.72 },
          { transform: "scale(1)" },
        ],
        { duration: 560, easing: "ease-out" },
      );
    },
  }));

  // light dismiss: Escape or a press outside closes the set
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  // a drag closes the set, so the basket is free to catch
  useEffect(() => {
    if (armed) setOpen(false);
  }, [armed]);

  const message = `${t.cart.message[lang]}${items.map((i) => i.title[lang]).join(", ")}.`;
  const count = items.length;

  return (
    <div
      ref={boxRef}
      className="cart"
      data-armed={armed ? "" : undefined}
      data-over={over ? "" : undefined}
      data-open={open ? "" : undefined}
    >
      <p className="cart-label" aria-hidden="true">
        {t.cart.drop[lang]}
      </p>

      <button
        ref={buttonRef}
        type="button"
        className="cart-btn"
        aria-expanded={open}
        aria-controls="cart-panel"
        aria-label={`${t.cart.name[lang]}: ${count}`}
        onClick={() => setOpen((o) => !o)}
      >
        <div ref={artRef} className="cart-art">
          <svg className="cart-svg" viewBox="0 0 96 96" aria-hidden="true">
            <path d="M6 27h10l7 13" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {items.map((item, i) => {
            const slot = SLOTS[i % SLOTS.length];
            const lap = Math.floor(i / SLOTS.length);
            return (
              <span
                key={item.id}
                className="cart-chip"
                style={
                  {
                    "--c1": item.colors[0],
                    "--c2": item.colors[1],
                    ...(item.face && { "--face": item.face }),
                    left: `${slot.x + lap * 4}%`,
                    top: `${slot.y - lap * 6}%`,
                    rotate: `${slot.r}deg`,
                  } as React.CSSProperties
                }
              >
                <Glyph id={item.id} />
              </span>
            );
          })}
          <svg className="cart-svg" viewBox="0 0 96 96" aria-hidden="true">
            <path d="M20 40h68l-8 28H29z" fill="currentColor" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            <path d="M36 45v18M50 45v18M64 45v18M76 45v14M25 54h59" stroke="#fff" strokeOpacity=".22" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 40h75" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path d="M29 68l-3 8h56" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="33" cy="83" r="6" fill="currentColor" />
            <circle cx="76" cy="83" r="6" fill="currentColor" />
            <circle cx="33" cy="83" r="2" fill="#fff" />
            <circle cx="76" cy="83" r="2" fill="#fff" />
          </svg>
        </div>
        {count > 0 && (
          <span key={count} className="cart-count" aria-hidden="true">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div id="cart-panel" className="cart-panel" role="dialog" aria-label={t.cart.title[lang]}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[18px] font-semibold text-ink">{t.cart.title[lang]}</p>
            <button
              ref={closeRef}
              type="button"
              className="cart-close"
              aria-label={t.cart.close[lang]}
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {count === 0 ? (
            <p className="mt-3 text-[15px] text-muted">{t.cart.empty[lang]}</p>
          ) : (
            <>
              <ul className="mt-3 divide-y divide-line">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className="cart-chip cart-chip--row"
                      style={{ "--c1": item.colors[0], "--c2": item.colors[1], ...(item.face && { "--face": item.face }) } as React.CSSProperties}
                    >
                      <Glyph id={item.id} />
                    </span>
                    <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug text-ink">{item.title[lang]}</span>
                    <button
                      type="button"
                      className="text-[14px] text-muted transition-colors hover:text-ink"
                      onClick={() => onRemove(item.id)}
                      aria-label={`${t.cart.remove[lang]}: ${item.title[lang]}`}
                    >
                      {t.cart.remove[lang]}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[14px] leading-[1.5] text-muted">{t.cart.note[lang]}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                <a
                  href={`${profile.telegramUrl}?text=${encodeURIComponent(message)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn px-4 py-2.5 text-[15px]"
                >
                  {t.cart.discuss[lang]}
                </a>
                <a href="#contact" className="link text-[15px]" onClick={() => setOpen(false)}>
                  {t.cart.form[lang]}
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default Cart;
