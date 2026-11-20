"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import { Lang, ServiceId, StoreItem, services as t } from "@/data/content";
import { loadLottie } from "@/lib/lottie";

/*
 * One service in the store, laid out like an app in a catalogue: the icon, its name and a line about it, and the
 * button. The icon is a tile with its Lottie animation that can be picked up and thrown into the cart. The motion is a small spring simulation run on requestAnimationFrame while something moves:
 *  - hover: the tile tilts toward the pointer and its layers part (parallax);
 *  - drag: the tile follows the pointer 1:1, swings with the speed and its layers lag behind like jelly;
 *  - release over the cart, or a throw toward it: the tile homes in on the cart, shrinks and drops in;
 *    any other release springs it back to its place;
 *  - after it lands, a fresh tile pops up in the slot.
 * Under reduced motion the tile still follows a drag, but everything else happens at once, and the animation
 * shows its still picture.
 */

/** how far each Lottie depth class moves for one unit of tilt or lag (scripts/build-lottie.mjs sets the classes) */
const DEPTH: Record<string, number> = { d1: -0.4, d2: 0.2, d3: 0.55, d4: 0.95, d5: 1.35 };
const INTRO: [number, number] = [10, 180];
const REPLAY: [number, number] = [0, 180];
const REST = 179;

type Mode = "idle" | "drag" | "fly" | "back" | "gone" | "spawn";

function makeState() {
  return {
    mode: "idle" as Mode,
    // the tile's offset from its slot (px), velocity (px/s), turn (deg), scale, lift (0–1)
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rot: 0,
    vr: 0,
    sc: 1,
    vs: 0,
    lift: 0,
    vl: 0,
    // tilt toward the pointer (deg) and the inner layers' offset (Lottie units, at depth 1)
    tx: 0,
    ty: 0,
    vtx: 0,
    vty: 0,
    lx: 0,
    ly: 0,
    vlx: 0,
    vly: 0,
    hx: 0,
    hy: 0,
    hovering: false,
    // the pointer
    id: -1,
    downX: 0,
    downY: 0,
    grabX: 0,
    grabY: 0,
    moved: false,
    samples: [] as { t: number; x: number; y: number }[],
    pvx: 0,
    pvy: 0,
    over: false,
    // the flight to the cart
    ft: 0,
    fdist: 1,
    sink: false,
    raf: 0,
    last: 0,
    timer: 0,
  };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function spring(x: number, v: number, target: number, k: number, c: number, dt: number): [number, number] {
  const nv = v + (-k * (x - target) - c * v) * dt;
  return [x + nv * dt, nv];
}

export default function StoreCard({
  item,
  lang,
  index,
  inCart,
  cartRect,
  onDrag,
  onOver,
  onLand,
  onRemove,
}: {
  item: StoreItem;
  lang: Lang;
  index: number;
  inCart: boolean;
  cartRect: () => DOMRect | null;
  onDrag: (dragging: boolean) => void;
  onOver: (over: boolean) => void;
  onLand: (id: ServiceId) => void;
  onRemove: (id: ServiceId) => void;
}) {
  const cardRef = useRef<HTMLLIElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);
  const glyphRef = useRef<HTMLDivElement>(null);
  const qRef = useRef<HTMLButtonElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);
  const noteId = `note-${item.id}`;

  /*
   * The «?» note is a popover that store.css places under its button with anchor positioning. A browser without
   * anchor positioning would show it in the middle of the screen: there it is placed from here, and closed on
   * scroll, since it can't follow the button.
   */
  useEffect(() => {
    const note = noteRef.current;
    if (!note || CSS.supports("position-area: block-end")) return;
    const close = () => (note as HTMLElement & { hidePopover?: () => void }).hidePopover?.();
    const stopFollowing = () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
    };
    const onToggle = (e: Event) => {
      if ((e as Event & { newState?: string }).newState !== "open") return stopFollowing();
      const b = qRef.current!.getBoundingClientRect();
      const w = note.offsetWidth;
      const h = note.offsetHeight;
      const left = Math.max(16, Math.min(b.left + b.width / 2 - w / 2, window.innerWidth - 16 - w));
      const below = b.bottom + 8 + h <= window.innerHeight - 8;
      Object.assign(note.style, {
        inset: "auto",
        margin: "0",
        left: `${left}px`,
        top: `${below ? b.bottom + 8 : b.top - 8 - h}px`,
      });
      window.addEventListener("scroll", close, { passive: true });
      window.addEventListener("resize", close);
    };
    note.addEventListener("toggle", onToggle);
    return () => {
      note.removeEventListener("toggle", onToggle);
      stopFollowing();
    };
  }, [item.note]);
  const anim = useRef<AnimationItem | null>(null);
  const playing = useRef(false);
  const layers = useRef<{ el: SVGGElement; depth: number }[]>([]);
  const reduce = useRef(false);
  const state = useRef<ReturnType<typeof makeState> | null>(null);
  state.current ??= makeState();
  const P = state.current;

  // the latest callbacks, for the animation loop
  const cb = useRef({ cartRect, onDrag, onOver, onLand });
  cb.current = { cartRect, onDrag, onOver, onLand };

  /* ---------- the Lottie animation ---------- */

  const play = (segment: [number, number], speed = 1) => {
    const a = anim.current;
    if (!a || reduce.current) return;
    a.setSpeed(speed);
    if (playing.current) return;
    playing.current = true;
    a.playSegments(segment, true);
  };

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    let io: IntersectionObserver | null = null;
    let timer = 0;

    loadLottie().then((lottie) => {
      const box = glyphRef.current;
      if (!alive || !box) return;
      const a = lottie.loadAnimation({
        container: box,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: `/lottie/${item.id}.json`,
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      anim.current = a;
      a.addEventListener("complete", () => {
        playing.current = false;
      });
      a.addEventListener("DOMLoaded", () => {
        layers.current = Object.entries(DEPTH).flatMap(([cls, depth]) =>
          Array.from(box.querySelectorAll<SVGGElement>(`g.${cls}`)).map((el) => ({ el, depth })),
        );
        if (reduce.current) {
          a.goToAndStop(REST, true);
          return;
        }
        a.goToAndStop(INTRO[0], true);
        io = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            io?.disconnect();
            // staggered along the row, so a row further down starts as soon as it comes into view
            timer = window.setTimeout(() => play(INTRO), 120 + (index % 3) * 170);
          },
          { threshold: 0.5 },
        );
        if (slotRef.current) io.observe(slotRef.current);
      });
    });

    return () => {
      alive = false;
      io?.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(P.timer);
      cancelAnimationFrame(P.raf);
      P.raf = 0;
      anim.current?.destroy();
      anim.current = null;
      playing.current = false;
    };
  }, [item.id, index]);

  /* ---------- geometry ---------- */

  const slotCenter = () => {
    const r = slotRef.current!.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const cartCenter = () => {
    const r = cb.current.cartRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  };
  const setFlag = (name: "moving" | "drag" | "sink", on: boolean) => {
    const card = cardRef.current;
    if (!card) return;
    if (on) card.dataset[name] = "";
    else delete card.dataset[name];
  };

  /* ---------- the simulation ---------- */

  const render = () => {
    const tile = tileRef.current;
    const slot = slotRef.current;
    if (!tile || !slot) return;
    tile.style.transform =
      `translate3d(${P.x.toFixed(2)}px, ${P.y.toFixed(2)}px, 0) perspective(640px) ` +
      `rotateX(${P.tx.toFixed(2)}deg) rotateY(${P.ty.toFixed(2)}deg) rotate(${P.rot.toFixed(2)}deg) scale(${P.sc.toFixed(4)})`;
    slot.style.setProperty("--lift", P.lift.toFixed(3));
    tile.style.setProperty("--gx", `${(50 + P.ty * 3.2 - P.lx * 2).toFixed(1)}%`);
    tile.style.setProperty("--gy", `${(28 - P.tx * 3.2 - P.ly * 2).toFixed(1)}%`);
    for (const { el, depth } of layers.current) {
      el.style.translate = `${(P.lx * depth).toFixed(2)}px ${(P.ly * depth).toFixed(2)}px`;
    }
  };

  const settled = () =>
    Math.abs(P.x) + Math.abs(P.y) + Math.abs(P.rot) + Math.abs(P.sc - 1) * 100 + P.lift * 10 < 0.3 &&
    Math.abs(P.vx) + Math.abs(P.vy) + Math.abs(P.vr) + Math.abs(P.vs) * 100 < 2 &&
    Math.abs(P.tx) + Math.abs(P.ty) + Math.abs(P.lx) + Math.abs(P.ly) < 0.05 &&
    Math.abs(P.vtx) + Math.abs(P.vty) + Math.abs(P.vlx) + Math.abs(P.vly) < 0.5;

  const land = () => {
    P.mode = "gone";
    P.vx = P.vy = 0;
    if (tileRef.current) tileRef.current.style.opacity = "0";
    cb.current.onLand(item.id);
    window.clearTimeout(P.timer);
    P.timer = window.setTimeout(
      () => {
        Object.assign(P, { x: 0, y: 0, rot: 0, vr: 0, lift: 0, vl: 0, lx: 0, ly: 0, vlx: 0, vly: 0, tx: 0, ty: 0 });
        P.sc = reduce.current ? 1 : 0.2;
        P.vs = 0;
        P.mode = reduce.current ? "idle" : "spawn";
        P.sink = false;
        setFlag("sink", false);
        setFlag("moving", false);
        if (tileRef.current) tileRef.current.style.opacity = "";
        anim.current?.setSpeed(1);
        render();
        kick();
      },
      reduce.current ? 0 : 420,
    );
  };

  const integrate = (dt: number, goal: { x: number; y: number } | null) => {
    switch (P.mode) {
      case "drag": {
        [P.rot, P.vr] = spring(P.rot, P.vr, clamp(P.pvx * 0.018, -20, 20), 220, 15, dt);
        [P.lx, P.vlx] = spring(P.lx, P.vlx, clamp(-P.pvx * 0.011, -12, 12), 320, 9, dt);
        [P.ly, P.vly] = spring(P.ly, P.vly, clamp(-P.pvy * 0.011, -12, 12), 320, 9, dt);
        [P.sc, P.vs] = spring(P.sc, P.vs, 1.1, 320, 20, dt);
        [P.lift, P.vl] = spring(P.lift, P.vl, 1, 260, 26, dt);
        [P.tx, P.vtx] = spring(P.tx, P.vtx, 0, 200, 20, dt);
        [P.ty, P.vty] = spring(P.ty, P.vty, 0, 200, 20, dt);
        break;
      }
      case "fly": {
        if (!goal) {
          P.mode = "back";
          break;
        }
        const dx = goal.x - P.x;
        const dy = goal.y - P.y;
        const dist = Math.hypot(dx, dy) || 1;
        P.ft += dt;
        // home in: the pull grows with time, so any throw that set off toward the cart gets there
        const want = clamp(dist * 9, 700, 2600);
        const pull = Math.min(1, (2.5 + P.ft * 42) * dt);
        P.vx += ((dx / dist) * want - P.vx) * pull;
        P.vy += ((dy / dist) * want - P.vy) * pull;
        P.x += P.vx * dt;
        P.y += P.vy * dt;
        P.rot += P.vr * dt;
        P.vr *= 1 - Math.min(1, 1.2 * dt);
        P.sc += (0.3 + 0.7 * clamp(dist / P.fdist, 0, 1) - P.sc) * Math.min(1, 14 * dt);
        [P.lx, P.vlx] = spring(P.lx, P.vlx, clamp(-P.vx * 0.006, -12, 12), 320, 9, dt);
        [P.ly, P.vly] = spring(P.ly, P.vly, clamp(-P.vy * 0.006, -12, 12), 320, 9, dt);
        if (dist < 110 && !P.sink) {
          // from here the tile passes behind the cart's front, as if falling in
          P.sink = true;
          setFlag("sink", true);
        }
        if (dist < 16 || P.ft > 1.6) land();
        break;
      }
      case "back":
      case "spawn":
      case "idle": {
        const k = P.mode === "spawn" ? 420 : 170;
        const c = P.mode === "spawn" ? 16 : 15;
        [P.x, P.vx] = spring(P.x, P.vx, 0, 170, 15, dt);
        [P.y, P.vy] = spring(P.y, P.vy, 0, 170, 15, dt);
        [P.rot, P.vr] = spring(P.rot, P.vr, 0, 200, 13, dt);
        [P.sc, P.vs] = spring(P.sc, P.vs, P.hovering ? 1.04 : 1, k, c, dt);
        [P.lift, P.vl] = spring(P.lift, P.vl, P.hovering ? 0.35 : 0, 200, 24, dt);
        const tilt = P.hovering && !reduce.current ? 11 : 0;
        [P.tx, P.vtx] = spring(P.tx, P.vtx, -P.hy * tilt, 180, 17, dt);
        [P.ty, P.vty] = spring(P.ty, P.vty, P.hx * tilt, 180, 17, dt);
        const part = P.hovering && !reduce.current ? 6 : 0;
        [P.lx, P.vlx] = spring(P.lx, P.vlx, P.hx * part, 260, 12, dt);
        [P.ly, P.vly] = spring(P.ly, P.vly, P.hy * part, 260, 12, dt);
        break;
      }
    }
  };

  const frame = (now: number) => {
    const elapsed = clamp((now - P.last) / 1000, 0.001, 0.05);
    P.last = now;

    if (P.mode === "drag") {
      // smoothed, for the swing and the jelly; a throw is measured from the samples themselves (release)
      const v = pointerVelocity(now);
      const blend = Math.min(1, elapsed * 16);
      P.pvx += (v.x - P.pvx) * blend;
      P.pvy += (v.y - P.pvy) * blend;
    }

    let goal: { x: number; y: number } | null = null;
    if (P.mode === "fly") {
      const s = slotCenter();
      const c = cartCenter();
      goal = c ? { x: c.x - s.x, y: c.y - s.y } : null;
    }

    const steps = Math.ceil(elapsed / (1 / 240));
    for (let i = 0; i < steps && P.mode !== "gone"; i++) integrate(elapsed / steps, goal);
    render();

    const keepGoing = P.mode === "drag" || P.mode === "fly" || (P.mode !== "gone" && (P.hovering || !settled()));
    if (keepGoing) {
      P.raf = requestAnimationFrame(frame);
    } else {
      P.raf = 0;
      if (P.mode === "back" || P.mode === "spawn") {
        P.mode = "idle";
        setFlag("moving", false);
      }
    }
  };

  /** the pointer's speed (px/s) over the last ~90 ms; nothing once it has stopped */
  const pointerVelocity = (now: number) => {
    const recent = P.samples.filter((s) => now - s.t < 90);
    if (recent.length < 2) return { x: 0, y: 0 };
    const a = recent[0];
    const b = recent[recent.length - 1];
    const span = (b.t - a.t) / 1000;
    return span > 0.008 ? { x: (b.x - a.x) / span, y: (b.y - a.y) / span } : { x: 0, y: 0 };
  };

  const kick = () => {
    if (P.raf) return;
    P.last = performance.now();
    P.raf = requestAnimationFrame(frame);
  };

  /* ---------- moves ---------- */

  const fly = (vx: number, vy: number) => {
    const c = cartCenter();
    if (!c) return goBack();
    const s = slotCenter();
    P.mode = "fly";
    P.vx = vx;
    P.vy = vy;
    P.ft = 0;
    P.vr = clamp(vx * 0.35, -540, 540);
    P.fdist = Math.max(1, Math.hypot(c.x - s.x - P.x, c.y - s.y - P.y));
    P.hovering = false;
    setFlag("moving", true);
    play(REPLAY, 1.6);
    if (reduce.current) land();
    else kick();
  };

  const goBack = () => {
    P.mode = "back";
    anim.current?.setSpeed(1);
    if (reduce.current) {
      Object.assign(P, { x: 0, y: 0, rot: 0, sc: 1, lift: 0, vx: 0, vy: 0, vr: 0, vs: 0 });
      render();
    }
    kick();
  };

  /** the button: toss the tile up and into the cart */
  const toss = () => {
    if (P.mode === "fly" || P.mode === "gone" || P.mode === "drag") return;
    const c = cartCenter();
    if (!c) return;
    const s = slotCenter();
    const dx = c.x - s.x;
    const dy = c.y - s.y;
    const d = Math.hypot(dx, dy) || 1;
    fly((dx / d) * 520, (dy / d) * 520 - 950);
  };

  /* ---------- pointer ---------- */

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || P.mode === "fly" || P.mode === "gone") return;
    const s = slotCenter();
    P.id = e.pointerId;
    P.downX = e.clientX;
    P.downY = e.clientY;
    P.grabX = e.clientX - (s.x + P.x);
    P.grabY = e.clientY - (s.y + P.y);
    P.moved = false;
    P.samples = [{ t: performance.now(), x: e.clientX, y: e.clientY }];
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* the pointer is already gone */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== P.id) {
      if (e.pointerType === "mouse" && P.hovering) {
        const r = slotRef.current!.getBoundingClientRect();
        P.hx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
        P.hy = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        kick();
      }
      return;
    }
    if (!P.moved) {
      if (Math.hypot(e.clientX - P.downX, e.clientY - P.downY) < 5) return;
      P.moved = true;
      P.mode = "drag";
      P.hovering = false;
      P.pvx = P.pvy = 0;
      setFlag("moving", true);
      setFlag("drag", true);
      cb.current.onDrag(true);
      play(REPLAY, 1.4);
      kick();
    }
    const s = slotCenter();
    P.x = e.clientX - P.grabX - s.x;
    P.y = e.clientY - P.grabY - s.y;
    const now = performance.now();
    P.samples.push({ t: now, x: e.clientX, y: e.clientY });
    if (P.samples.length > 12) P.samples.splice(0, P.samples.length - 12);

    const c = cb.current.cartRect();
    const over =
      !!c && e.clientX > c.left - 28 && e.clientX < c.right + 28 && e.clientY > c.top - 28 && e.clientY < c.bottom + 28;
    if (over !== P.over) {
      P.over = over;
      cb.current.onOver(over);
    }
  };

  const release = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (e.pointerId !== P.id) return;
    P.id = -1;
    if (!P.moved) return;
    setFlag("drag", false);
    cb.current.onDrag(false);
    const wasOver = P.over;
    if (P.over) {
      P.over = false;
      cb.current.onOver(false);
    }
    if (cancelled) return goBack();

    // the speed at the moment of letting go; a pointer that stopped first throws nothing
    const now = performance.now();
    P.samples.push({ t: now, x: e.clientX, y: e.clientY });
    const { x: vx, y: vy } = pointerVelocity(now);
    const c = cartCenter();
    if (!c) return goBack();
    const s = slotCenter();
    const tx = c.x - (s.x + P.x);
    const ty = c.y - (s.y + P.y);
    const speed = Math.hypot(vx, vy);
    const aim = speed > 0 ? (vx * tx + vy * ty) / (speed * (Math.hypot(tx, ty) || 1)) : 0;
    if (wasOver) fly(vx * 0.3, vy * 0.3);
    else if ((speed > 600 && aim > 0.8) || (speed > 1500 && aim > 0.6)) fly(vx, vy);
    else goBack();
  };

  return (
    <li
      ref={cardRef}
      className="store-item"
      style={
        {
          "--c1": item.colors[0],
          "--c2": item.colors[1],
          ...(item.face && { "--face": item.face }),
          ...(item.note && { "--anchor": `--q-${item.id}` }),
        } as React.CSSProperties
      }
    >
      <div ref={slotRef} className="store-slot">
        <div
          ref={tileRef}
          className="store-tile"
          aria-hidden="true"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => release(e, false)}
          onPointerCancel={(e) => release(e, true)}
          onPointerEnter={(e) => {
            if (e.pointerType !== "mouse" || P.mode === "fly" || P.mode === "gone") return;
            P.hovering = true;
            play(REPLAY);
            kick();
          }}
          onPointerLeave={(e) => {
            if (e.pointerType !== "mouse") return;
            P.hovering = false;
            P.hx = P.hy = 0;
            kick();
          }}
          onClick={() => {
            // a tap (no drag) plays the animation, for phones that have no hover
            if (!P.moved) play(REPLAY);
          }}
          onDragStart={(e) => e.preventDefault()}
        >
          <div className="store-tile-bg" />
          <div ref={glyphRef} className="store-tile-glyph" />
          <div className="store-tile-shine" />
        </div>
      </div>

      <div className="store-info">
        {item.note ? (
          <>
            <div className="store-head">
              <h3 className="store-title">{item.title[lang]}</h3>
              <button
                ref={qRef}
                type="button"
                className="store-q"
                aria-label={`${t.more[lang]}: ${item.title[lang]}`}
                {...({ popovertarget: noteId } as object)}
              >
                ?
              </button>
            </div>
            <div ref={noteRef} id={noteId} className="store-note" {...({ popover: "auto" } as object)}>
              {item.note[lang]}
            </div>
          </>
        ) : (
          <h3 className="store-title">{item.title[lang]}</h3>
        )}
        <p className="store-sub">{item.subtitle[lang]}</p>
        <button
          type="button"
          className="store-get"
          data-added={inCart ? "" : undefined}
          aria-label={`${inCart ? t.added[lang] : t.add[lang]}: ${item.title[lang]}`}
          title={inCart ? t.cart.remove[lang] : undefined}
          onClick={() => (inCart ? onRemove(item.id) : toss())}
        >
          {inCart && (
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {inCart ? t.added[lang] : t.add[lang]}
        </button>
      </div>
    </li>
  );
}
