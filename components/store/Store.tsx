"use client";

import { useEffect, useRef, useState } from "react";
import { Lang, ServiceId, services as t } from "@/data/content";
import Cart, { type CartHandle } from "./Cart";
import StoreCard from "./StoreCard";
import "./store.css";

/* The visitor's set is kept in this browser only, so it survives a reload. */
const KEY = "services-cart";
const known = (id: unknown): id is ServiceId => t.items.some((i) => i.id === id);

export default function Store({ lang }: { lang: Lang }) {
  const [cart, setCart] = useState<ServiceId[]>([]);
  const [dragging, setDragging] = useState(0);
  const [over, setOver] = useState(false);
  const [note, setNote] = useState("");
  const cartRef = useRef<CartHandle>(null);
  const noteTimer = useRef(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (Array.isArray(saved)) setCart(saved.filter(known));
    } catch {
      /* no storage: start empty */
    }
    return () => window.clearTimeout(noteTimer.current);
  }, []);

  const update = (next: (c: ServiceId[]) => ServiceId[]) =>
    setCart((c) => {
      const n = next(c);
      try {
        localStorage.setItem(KEY, JSON.stringify(n));
      } catch {
        /* not kept, fine */
      }
      return n;
    });

  // a short message for screen readers, cleared once it has been read out
  const announce = (id: ServiceId, text: string) => {
    const item = t.items.find((i) => i.id === id);
    setNote(`${item?.title[lang]}: ${text}`);
    window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(""), 1500);
  };

  const add = (id: ServiceId) => {
    update((c) => (c.includes(id) ? c : [...c, id]));
    cartRef.current?.bump();
    announce(id, t.cart.addedNote[lang]);
  };
  const remove = (id: ServiceId) => {
    update((c) => c.filter((x) => x !== id));
    announce(id, t.cart.removedNote[lang]);
  };

  const items = cart.map((id) => t.items.find((i) => i.id === id)!).filter(Boolean);

  return (
    <>
      <ul className="store-grid">
        {t.items.map((item, i) => (
          <StoreCard
            key={item.id}
            item={item}
            lang={lang}
            index={i}
            inCart={cart.includes(item.id)}
            cartRect={() => cartRef.current?.rect() ?? null}
            onDrag={(d) => setDragging((n) => Math.max(0, n + (d ? 1 : -1)))}
            onOver={setOver}
            onLand={add}
            onRemove={remove}
          />
        ))}
      </ul>

      <Cart ref={cartRef} lang={lang} items={items} armed={dragging > 0} over={over} onRemove={remove} />

      <p className="sr-only" aria-live="polite">
        {note}
      </p>
    </>
  );
}
