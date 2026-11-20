/*
 * Writes the Lottie animations of the services store (/services) to public/lottie/<id>.json.
 *   node scripts/build-lottie.mjs
 *
 * Each animation is the white glyph that sits on a service's coloured tile (the tile itself is CSS, in
 * components/store/store.css). The comp is 200×200 at 60 fps, 180 frames long:
 *   0–10    the built glyph folds away (so a replay on hover runs on from the resting state),
 *   10–170  it builds up again and does its little action,
 *   170–180 it rests, built. Frame 179 is the still picture.
 * components/store/StoreIcon.tsx plays 10→180 when a tile comes into view and 0→180 on hover or tap.
 *
 * Layers carry a depth class, `d1` (far) to `d5` (near). The store moves them apart when a tile is tilted or
 * dragged, so the glyph has parallax inside its tile. A Lottie downloaded from elsewhere works in its place; it
 * just won't have the depth.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "lottie");
const OP = 180;

/* ---------- helpers ---------- */

const v = (k) => ({ a: 0, k });
const isAnim = (x) => x && typeof x === "object" && "a" in x && "k" in x;
const w = (x) => (isAnim(x) ? x : v(x));

/* cubic-bezier(x1, y1, x2, y2) as Lottie's out (first) and in (second) handles */
const EASE = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.5, 0, 0.75, 0],
  back: [0.34, 1.56, 0.64, 1],
  soft: [0.33, 0, 0.2, 1],
  lin: [0.5, 0.5, 0.5, 0.5],
};

/** keyframes: [[frame, value, ease?], ...]; the ease is the curve from that key to the next one */
function kf(keys) {
  return {
    a: 1,
    k: keys.map(([t, s, ease], i) => {
      const val = Array.isArray(s) ? s : [s];
      const key = { t, s: val };
      if (i < keys.length - 1) {
        if (ease === "hold") {
          key.h = 1;
        } else {
          const [x1, y1, x2, y2] = EASE[ease || "inOut"];
          const n = val.length;
          key.o = { x: Array(n).fill(x1), y: Array(n).fill(y1) };
          key.i = { x: Array(n).fill(x2), y: Array(n).fill(y2) };
        }
      }
      return key;
    }),
  };
}

const rect = (cx, cy, wd, ht, r = 0) => ({ ty: "rc", d: 1, s: w([wd, ht]), p: w([cx, cy]), r: w(r) });
const ellipse = (cx, cy, wd, ht = wd) => ({ ty: "el", d: 1, s: w([wd, ht]), p: w([cx, cy]) });
function path(verts, closed = false, ins, outs) {
  return {
    ty: "sh",
    d: 1,
    ks: v({ v: verts, i: ins || verts.map(() => [0, 0]), o: outs || verts.map(() => [0, 0]), c: closed }),
  };
}
const fill = (rgb, o = 100) => ({ ty: "fl", c: w([...rgb, 1]), o: w(o), r: 1 });
const stroke = (rgb, width, o = 100, lc = 2) => ({ ty: "st", c: w([...rgb, 1]), o: w(o), w: w(width), lc, lj: 2, ml: 4 });
/** a gradient fill: stops [[offset 0–1, [r, g, b]], ...]; linear from `start` to `end`, or radial around `start` */
function gradFill(stops, start, end, radial = false) {
  return {
    ty: "gf",
    o: v(100),
    r: 1,
    g: { p: stops.length, k: v(stops.flatMap(([at, rgb]) => [at, ...rgb])) },
    s: v(start),
    e: v(end),
    t: radial ? 2 : 1,
    h: v(0),
    a: v(0),
  };
}
const trim = (e, s = 0) => ({ ty: "tm", s: w(s), e: w(e), o: v(0), m: 1 });

/** a group transform; to scale or turn a part around a point, pass `at` (anchor and position both there) */
function tr({ at, p, a, s = [100, 100], r = 0, o = 100 } = {}) {
  return {
    ty: "tr",
    p: w(p ?? at ?? [0, 0]),
    a: w(a ?? at ?? [0, 0]),
    s: w(s),
    r: w(r),
    o: w(o),
    sk: v(0),
    sa: v(0),
  };
}
const group = (nm, items, t = {}) => ({ ty: "gr", nm, it: [...items, tr(t)] });
/* A group's fill also paints the shapes of the subgroups listed before it, so a part with details keeps its own
   shapes and fill in a `body` subgroup, listed last (= drawn underneath). */
const body = (...items) => group("body", items);

function layer(ind, nm, cl, shapes, { at, p, s, r, o, parent } = {}) {
  const anchor = at ?? [0, 0];
  const L = {
    ddd: 0,
    ind,
    ty: 4,
    nm,
    cl,
    sr: 1,
    ks: {
      o: w(o ?? 100),
      r: w(r ?? 0),
      p: w(p ?? [...anchor, 0]),
      a: v([...anchor, 0]),
      s: w(s ?? [100, 100, 100]),
    },
    ao: 0,
    shapes,
    ip: 0,
    op: OP,
    st: 0,
    bm: 0,
  };
  if (parent) L.parent = parent;
  return L;
}

/** a rounded rectangle as a path, each corner with its own radius [tl, tr, br, bl] */
function roundRect(x0, y0, x1, y1, [tl, trr, br, bl]) {
  const k = 0.5523;
  const verts = [
    [x0 + tl, y0],
    [x1 - trr, y0],
    [x1, y0 + trr],
    [x1, y1 - br],
    [x1 - br, y1],
    [x0 + bl, y1],
    [x0, y1 - bl],
    [x0, y0 + tl],
  ];
  const ins = [
    [-tl * k, 0],
    [0, 0],
    [0, -trr * k],
    [0, 0],
    [br * k, 0],
    [0, 0],
    [0, bl * k],
    [0, 0],
  ];
  const outs = [
    [0, 0],
    [trr * k, 0],
    [0, 0],
    [0, br * k],
    [0, 0],
    [-bl * k, 0],
    [0, 0],
    [0, -tl * k],
  ];
  return path(verts, true, ins, outs);
}

/** a four-pointed sparkle centred on (cx, cy) */
function sparkle(cx, cy, r) {
  const c = 0.62 * r;
  const verts = [
    [cx, cy - r],
    [cx + r, cy],
    [cx, cy + r],
    [cx - r, cy],
  ];
  const ins = [
    [0, c],
    [-c, 0],
    [0, -c],
    [c, 0],
  ];
  return path(verts, true, ins, ins);
}

/**
 * An SVG path (M, L, H, V, C, S, Z, absolute or relative) as a Lottie shape, moved so the point `from` lands on `to`
 * and scaled by `scale` around it.
 */
function svgPath(d, { from = [0, 0], to = [0, 0], scale = 1 } = {}) {
  const tok = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)/g);
  const pts = [];
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  let lastC2 = null;
  let closed = false;
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    if (C === "Z") {
      closed = true;
      lastC2 = null;
      continue;
    }
    if (C === "M" || C === "L" || C === "H" || C === "V") {
      if (C !== "V") {
        const nx = num();
        x = rel ? x + nx : nx;
      }
      if (C !== "H") {
        const ny = num();
        y = rel ? y + ny : ny;
      }
      pts.push({ p: [x, y], in: [x, y], out: [x, y] });
      if (C === "M") cmd = rel ? "l" : "L";
      lastC2 = null;
    } else if (C === "C" || C === "S") {
      let c1;
      if (C === "C") {
        const x1 = num();
        const y1 = num();
        c1 = rel ? [x + x1, y + y1] : [x1, y1];
      } else {
        c1 = lastC2 ? [2 * x - lastC2[0], 2 * y - lastC2[1]] : [x, y];
      }
      const x2 = num();
      const y2 = num();
      const ex = num();
      const ey = num();
      const c2 = rel ? [x + x2, y + y2] : [x2, y2];
      const end = rel ? [x + ex, y + ey] : [ex, ey];
      pts[pts.length - 1].out = c1;
      pts.push({ p: end, in: c2, out: end });
      [x, y] = end;
      lastC2 = c2;
    } else {
      throw new Error(`svgPath: unsupported command ${cmd}`);
    }
  }
  // a closing curve that ends on the first point: merge the two
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (closed && pts.length > 1 && Math.hypot(first.p[0] - last.p[0], first.p[1] - last.p[1]) < 0.01) {
    first.in = last.in;
    pts.pop();
  }
  const f = ([px, py]) => [(px - from[0]) * scale + to[0], (py - from[1]) * scale + to[1]];
  const r = (n) => Math.round(n * 100) / 100;
  const verts = pts.map((pt) => f(pt.p).map(r));
  const ins = pts.map((pt, k) => f(pt.in).map((c, j) => r(c - verts[k][j])));
  const outs = pts.map((pt, k) => f(pt.out).map((c, j) => r(c - verts[k][j])));
  return path(verts, closed, ins, outs);
}

/** scale 100 → 0 over the fold (0–10), then 0 → 100 with an overshoot from `from` to `to` */
const popIn = (from, to, ease = "back") =>
  kf([
    [0, [100, 100]],
    [8, [0, 0], "hold"],
    [from, [0, 0], ease],
    [to, [100, 100]],
  ]);
/** the same, stretching along x only (for lines and bars growing from their left end) */
const growX = (from, to) =>
  kf([
    [0, [100, 100]],
    [8, [0, 100], "hold"],
    [from, [0, 100], "out"],
    [to, [100, 100]],
  ]);
const growY = (from, to) =>
  kf([
    [0, [100, 100]],
    [8, [100, 0], "hold"],
    [from, [100, 0], "back"],
    [to, [100, 100]],
  ]);

const WHITE = [1, 1, 1];
const INK = [0.08, 0.09, 0.11];

function comp(nm, layers) {
  return { v: "5.7.4", fr: 60, ip: 0, op: OP, w: 200, h: 200, nm, ddd: 0, assets: [], layers };
}

/* ---------- 1. Сайт под ключ: a browser window that lays itself out, gets clicked and is ready ---------- */

function site() {
  const BLUE = [0.27, 0.38, 0.98];
  const TINT = [0.86, 0.9, 1];
  const PALE = [0.93, 0.95, 1];

  // the window: x 30–170, y 46–162, top bar down to y 68
  const plate = layer(5, "plate", "d1", [group("plate", [rect(110, 114, 140, 116, 16), fill(WHITE, 28)])]);

  const windowLayer = layer(
    4,
    "window",
    "d2",
    [
      group("dots", [
        group("green", [ellipse(70, 57, 8), fill([0.3, 0.82, 0.45])]),
        group("amber", [ellipse(58, 57, 8), fill([1, 0.74, 0.22])]),
        group("red", [ellipse(46, 57, 8), fill([1, 0.4, 0.38])]),
      ]),
      group("address", [rect(126, 57, 70, 10, 5), fill(PALE)]),
      group("divider", [rect(100, 68.5, 140, 1.5), fill([0.88, 0.9, 0.97])]),
      group("frame", [rect(100, 104, 140, 116, 16), fill(WHITE)]),
    ],
    {
      at: [100, 104],
      s: kf([
        [0, [100, 100, 100]],
        [10, [95, 95, 100], "back"],
        [28, [100, 100, 100]],
      ]),
    },
  );

  const blocks = layer(
    3,
    "blocks",
    "d3",
    [
      group("button", [group("label", [rect(66, 147.5, 22, 4, 2), fill(WHITE)]), body(rect(66, 147.5, 48, 13, 6.5), fill(BLUE))], {
        at: [66, 147.5],
        s: kf([
          [0, [100, 100]],
          [8, [0, 0], "hold"],
          [58, [0, 0], "back"],
          [78, [100, 100], "hold"],
          [104, [100, 100], "inOut"],
          [110, [86, 86], "back"],
          [126, [100, 100]],
        ]),
      }),
      group(
        "card 2",
        [
          group("line", [rect(138, 121, 26, 5, 2.5), fill([0.72, 0.78, 0.95])]),
          group("dot", [ellipse(117, 121, 10), fill([0.3, 0.8, 0.6])]),
          body(rect(131, 121, 54, 26, 7), fill(PALE)),
        ],
        { at: [131, 121], s: popIn(46, 66) },
      ),
      group(
        "card 1",
        [
          group("line", [rect(76, 121, 26, 5, 2.5), fill([0.72, 0.78, 0.95])]),
          group("dot", [ellipse(55, 121, 10), fill([1, 0.55, 0.35])]),
          body(rect(69, 121, 54, 26, 7), fill(PALE)),
        ],
        { at: [69, 121], s: popIn(38, 58) },
      ),
      group("hero title", [rect(80, 84, 60, 6, 3), fill(BLUE)], { at: [50, 84], s: growX(26, 46) }),
      group("hero sub", [rect(70, 95, 40, 5, 2.5), fill([0.6, 0.68, 1])], { at: [50, 95], s: growX(32, 50) }),
      group("hero", [rect(100, 89, 116, 26, 7), fill(TINT)], { at: [42, 89], s: growX(14, 36) }),
    ],
    { parent: 4 },
  );

  const ripple = layer(
    6,
    "ripple",
    "d3",
    [
      group("ring", [ellipse(66, 147.5, 24), stroke(BLUE, 2.5)], {
        at: [66, 147.5],
        s: kf([
          [0, [0, 0], "hold"],
          [106, [0, 0], "out"],
          [134, [260, 260]],
        ]),
        o: kf([
          [0, 0, "hold"],
          [106, 90, "lin"],
          [134, 0],
        ]),
      }),
    ],
  );

  const badge = layer(
    2,
    "badge",
    "d4",
    [
      group(
        "badge",
        [
          group("check", [path([[155, 50], [161, 56], [172, 44]]), trim(kf([[0, 100], [8, 0, "hold"], [132, 0, "out"], [148, 100]])), stroke(WHITE, 4.5)]),
          body(ellipse(163, 50, 34), fill([0.2, 0.78, 0.44]), stroke(WHITE, 4)),
        ],
        { at: [163, 50], s: popIn(124, 142) },
      ),
    ],
  );

  // the arrow pointer, tip at its own (0, 0), moved by the layer position
  const arrow = path(
    [
      [0, 0],
      [0, 30],
      [8, 23],
      [13.5, 34],
      [19, 31.5],
      [13.5, 21],
      [24, 21],
    ],
    true,
  );
  const cursor = layer(
    1,
    "cursor",
    "d5",
    [group("arrow", [arrow, stroke(WHITE, 3), fill(INK)], { s: kf([[0, [100, 100], "hold"], [104, [100, 100], "inOut"], [110, [82, 82], "back"], [124, [100, 100]]]) })],
    {
      p: kf([
        [0, [72, 150, 0], "hold"],
        [72, [168, 182, 0], "inOut"],
        [104, [72, 150, 0], "hold"],
        [148, [72, 150, 0], "inOut"],
        [172, [92, 176, 0]],
      ]),
      o: kf([
        [0, 0, "hold"],
        [72, 0, "lin"],
        [82, 100, "hold"],
        [150, 100, "lin"],
        [170, 0],
      ]),
    },
  );

  return comp("site", [cursor, badge, blocks, ripple, windowLayer, plate]);
}

/* ---------- 2. Бренд для соцсетей и контент-план: a profile filling with posts for Instagram, VK and YouTube, a plan being ticked off ---------- */

function brand() {
  const PINK = [0.95, 0.3, 0.45];
  const posts = [
    [59, 100, [1, 0.76, 0.42]],
    [91, 100, [0.98, 0.47, 0.55]],
    [123, 100, [0.55, 0.5, 0.95]],
    [59, 132, [0.36, 0.78, 0.74]],
    [91, 132, [1, 0.6, 0.38]],
    [123, 132, [0.99, 0.84, 0.66]],
  ];

  const card = layer(6, "card", "d2", [group("card", [rect(91, 103, 102, 126, 16), fill(WHITE)])]);
  const back = layer(7, "back card", "d1", [group("back", [rect(99, 109, 102, 126, 16), fill(WHITE, 30)], { r: 6, at: [99, 109] })]);

  const profile = layer(5, "profile", "d3", [
    group("handle", [rect(93, 71, 26, 5, 2.5), fill([0.82, 0.83, 0.88])], { at: [80, 71], s: growX(20, 40) }),
    group("name", [rect(99, 60, 38, 6, 3), fill([0.2, 0.21, 0.26])], { at: [80, 60], s: growX(14, 34) }),
    group("ring", [ellipse(62, 64, 30), trim(kf([[0, 100], [8, 0, "hold"], [12, 0, "out"], [44, 100]])), stroke([1, 0.66, 0.2], 3)], {
      at: [62, 64],
      r: kf([[0, -90, "hold"], [12, -90, "out"], [44, 90]]),
    }),
    group("avatar", [ellipse(62, 64, 22), fill([1, 0.5, 0.42])], { at: [62, 64], s: popIn(10, 28) }),
  ]);

  const grid = layer(
    4,
    "posts",
    "d3",
    posts.map(([x, y, c], i) => {
      const items = [body(rect(x, y, 28, 28, 6), fill(c))];
      if (i === 1) items.unshift(group("play", [path([[87, 94], [87, 106], [97, 100]], true), fill(WHITE)]));
      if (i === 3) items.unshift(group("sun", [ellipse(x + 5, y - 5, 7), fill(WHITE, 90)]));
      return group(`post ${i + 1}`, items, { at: [x, y], s: popIn(16 + i * 7, 34 + i * 7) });
    }),
  );

  // the plan: a little calendar, x 122–172, y 26–74, its cells filling in one by one
  const cells = [];
  [50, 63].forEach((y, row) =>
    [134, 147, 160].forEach((x, col) => {
      const n = row * 3 + col;
      cells.push(group(`done ${n + 1}`, [ellipse(x, y, 8), fill(PINK)], { at: [x, y], s: popIn(56 + n * 7, 70 + n * 7) }));
      cells.push(group(`cell ${n + 1}`, [ellipse(x, y, 8), fill([0.9, 0.9, 0.93])]));
    }),
  );
  const calendar = layer(
    3,
    "plan",
    "d4",
    [
      group("cells", cells),
      group("rings", [ellipse(135, 26, 5), ellipse(159, 26, 5), fill(WHITE)]),
      group("header", [roundRect(122, 26, 172, 39, [11, 11, 0, 0]), fill([0.96, 0.33, 0.42])]),
      group("sheet", [rect(147, 50, 50, 48, 11), fill(WHITE)]),
      group("shadow", [rect(149, 54, 50, 48, 11), fill([0.6, 0.1, 0.25], 22)]),
    ],
    {
      at: [147, 50],
      r: kf([
        [0, 0],
        [10, -8, "back"],
        [30, 0, "hold"],
      ]),
      s: kf([
        [0, [100, 100, 100]],
        [10, [80, 80, 100], "back"],
        [30, [100, 100, 100]],
      ]),
    },
  );

  // a like: heart in a white bubble at the card's lower right
  const heart = path(
    [
      [150, 150],
      [140, 140],
      [145, 132],
      [150, 135],
      [155, 132],
      [160, 140],
    ],
    true,
    [
      [3, 3],
      [0, 3],
      [-3, 0],
      [-1, -2],
      [-3, 0],
      [0, -3],
    ],
    [
      [-3, -3],
      [0, -3],
      [3, 0],
      [1, -2],
      [3, 0],
      [0, 3],
    ],
  );
  const like = layer(
    2,
    "like",
    "d5",
    [
      group(
        "bubble",
        [
          group("heart", [heart, fill(PINK)], {
            at: [150, 141],
            s: kf([
              [0, [100, 100], "hold"],
              [114, [100, 100], "out"],
              [122, [128, 128], "inOut"],
              [132, [94, 94], "out"],
              [142, [100, 100]],
            ]),
          }),
          body(ellipse(150, 141, 38), fill(WHITE)),
        ],
        { at: [150, 141], s: popIn(94, 112) },
      ),
    ],
  );

  // three small hearts floating up after the like
  const floaters = layer(
    1,
    "hearts",
    "d5",
    [
      [138, 0.75, 118],
      [162, 0.6, 124],
      [150, 0.5, 130],
    ].map(([x, sc, t0], i) =>
      group(`float ${i + 1}`, [heart, fill(WHITE)], {
        a: [150, 141],
        p: kf([
          [0, [x, 132], "hold"],
          [t0, [x, 132], "out"],
          [t0 + 34, [x + (i - 1) * 6, 100]],
        ]),
        s: [sc * 100, sc * 100],
        o: kf([
          [0, 0, "hold"],
          [t0, 0, "lin"],
          [t0 + 6, 100, "hold"],
          [t0 + 20, 100, "lin"],
          [t0 + 34, 0],
        ]),
      }),
    ),
  );

  // where the posts go: Instagram, VK and YouTube, tucked against the card's left edge
  const chip = (name, at, tilt, t0, items) =>
    group(name, items, {
      at,
      s: popIn(t0, t0 + 18),
      r: tilt,
      p: kf([
        [0, at, "hold"],
        [118 + (t0 - 60), at, "out"],
        [126 + (t0 - 60), [at[0], at[1] - 5], "inOut"],
        [138 + (t0 - 60), at],
      ]),
    });
  const [ix, iy] = [30, 100];
  const instagram = chip("instagram", [ix, iy], -8, 60, [
    group("dot", [ellipse(ix + 4.6, iy - 4.6, 2.4), fill(WHITE)]),
    group("lens", [ellipse(ix, iy, 7.6), stroke(WHITE, 2.1)]),
    group("frame", [rect(ix, iy, 15.5, 15.5, 4.8), stroke(WHITE, 2.1)]),
    group("tile", [
      rect(ix, iy, 24, 24, 7.5),
      gradFill(
        [
          [0, [1, 0.84, 0.36]],
          [0.3, [0.98, 0.45, 0.16]],
          [0.62, [0.85, 0.16, 0.47]],
          [1, [0.47, 0.23, 0.85]],
        ],
        [ix - 9, iy + 13],
        [ix + 16, iy - 16],
        true,
      ),
      stroke(WHITE, 2.5),
    ]),
  ]);
  const [vx, vy] = [27, 129];
  const vk = chip("vk", [vx, vy], 6, 68, [
    group("letters", [
      // VK's logo (a 48×48 drawing; its middle is at about 24, 24.6)
      svgPath(
        "M25.54 34.58c-10.94 0-17.18-7.5-17.44-19.98h5.48c.18 9.16 4.22 13.04 7.42 13.84V14.6h5.16v7.9c3.16-.34 6.48-3.94 7.6-7.9h5.16c-.86 4.88-4.46 8.48-7.02 9.96 2.56 1.2 6.66 4.34 8.22 10.02h-5.68c-1.22-3.8-4.26-6.74-8.28-7.14v7.14h-.62z",
        { from: [24, 24.6], to: [vx, vy], scale: 0.5 },
      ),
      fill(WHITE),
    ]),
    group("tile", [rect(vx, vy, 24, 24, 7.5), fill([0, 0.47, 1]), stroke(WHITE, 2.5)]),
  ]);
  const [yx, yy] = [31, 158];
  const youtube = chip("youtube", [yx, yy], -5, 76, [
    group("play", [path([[yx - 3.6, yy - 5], [yx - 3.6, yy + 5], [yx + 5.4, yy]], true), fill(WHITE)]),
    group("tile", [rect(yx, yy, 28, 20, 6.5), fill([1, 0.05, 0.1]), stroke(WHITE, 2.5)]),
  ]);
  const platforms = layer(8, "platforms", "d4", [youtube, vk, instagram]);

  return comp("brand", [floaters, like, calendar, platforms, profile, grid, card, back]);
}

/* ---------- 3. Telegram-боты: Telegram's paper plane flies in, and a bot clips onto its tail ---------- */

/* Telegram's paper plane, from its logo (a 240×240 drawing; the plane's middle is at about 110, 126) */
const TELEGRAM_PLANE =
  "M54.3 118.8c35-15.2 58.3-25.3 70-30.2 33.3-13.9 40.3-16.3 44.8-16.4 1 0 3.2.2 4.7 1.4 1.2 1 1.5 2.3 1.7 3.3s.4 3.1.2 4.7c-1.8 19-9.6 65.1-13.6 86.3-1.7 9-5 12-8.2 12.3-7 .6-12.3-4.6-19-9-10.6-6.9-16.5-11.2-26.8-18-11.9-7.8-4.2-12.1 2.6-19.1 1.8-1.8 32.5-29.8 33.1-32.3.1-.3.1-1.5-.6-2.1-.7-.6-1.7-.4-2.5-.2-1.1.2-17.9 11.4-50.6 33.5-4.8 3.3-9.1 4.9-13 4.8-4.3-.1-12.5-2.4-18.7-4.4-7.5-2.4-13.5-3.7-13-7.9.3-2.2 3.3-4.4 8.9-6.7z";

function bots() {
  const BOT = [0.47, 0.33, 0.98];
  const SCREEN = [0.24, 0.14, 0.56];
  const GLOW = [0.48, 1, 0.86];
  const AMBER = [1, 0.8, 0.3];
  const PLANE_AT = [86, 84];
  const BADGE_AT = [149, 149];

  const plane = layer(
    3,
    "plane",
    "d3",
    [group("plane", [svgPath(TELEGRAM_PLANE, { from: [110.5, 126.2], to: PLANE_AT, scale: 0.9 }), fill(WHITE)])],
    {
      at: PLANE_AT,
      // flies off over the fold, back in from the lower left, then a little "send" nudge
      p: kf([
        [0, [86, 84, 0], "in"],
        [9, [122, 48, 0], "hold"],
        [12, [20, 146, 0], "out"],
        [44, [90, 80, 0], "inOut"],
        [58, [86, 84, 0], "hold"],
        [104, [86, 84, 0], "inOut"],
        [114, [93, 77, 0], "inOut"],
        [130, [86, 84, 0]],
      ]),
      r: kf([
        [0, 0, "hold"],
        [12, 14, "out"],
        [44, -3, "inOut"],
        [58, 0, "hold"],
        [104, 0, "inOut"],
        [114, -5, "inOut"],
        [130, 0],
      ]),
      s: kf([
        [0, [100, 100, 100], "in"],
        [9, [55, 55, 100], "hold"],
        [12, [60, 60, 100], "out"],
        [44, [100, 100, 100]],
      ]),
      o: kf([
        [0, 100, "lin"],
        [9, 0, "hold"],
        [12, 0, "lin"],
        [22, 100],
      ]),
    },
  );

  // speed lines behind the plane while it flies in, and again as it sends
  const streak = (x0, y0, len, t0, i) =>
    group(`streak ${i + 1}`, [
      path([
        [x0, y0],
        [x0 - len * 0.8, y0 + len * 0.6],
      ]),
      trim(
        kf([
          [0, 0, "hold"],
          [t0, 0, "out"],
          [t0 + 16, 100, "hold"],
          [104 + i * 3, 0, "out"],
          [116 + i * 3, 100, "hold"],
          [180, 100],
        ]),
        kf([
          [0, 0, "hold"],
          [t0 + 10, 0, "inOut"],
          [t0 + 28, 100, "hold"],
          [104 + i * 3, 0, "hold"],
          [110 + i * 3, 0, "inOut"],
          [128 + i * 3, 100, "hold"],
          [180, 100],
        ]),
      ),
      stroke(WHITE, 5, 60),
    ]);
  const streaks = layer(4, "streaks", "d1", [streak(44, 130, 30, 22, 0), streak(62, 146, 24, 26, 1), streak(30, 112, 20, 30, 2)]);

  // the bot: a violet badge with a robot, clipped onto the plane's tail
  const blink = (t) => [
    [t, [100, 100], "inOut"],
    [t + 5, [100, 10], "inOut"],
    [t + 10, [100, 100], "hold"],
  ];
  const eyes = kf([
    [0, [100, 100], "hold"],
    [70, [100, 10], "hold"],
    [78, [100, 10], "back"],
    [90, [100, 100], "hold"],
    ...blink(146),
    [180, [100, 100]],
  ]);
  const [bx, by] = BADGE_AT;
  const badge = layer(
    1,
    "bot",
    "d5",
    [
      group("ball", [ellipse(bx, by - 20, 8), fill(AMBER)]),
      group("glow", [ellipse(bx, by - 20, 16), fill(AMBER, 40)], {
        at: [bx, by - 20],
        s: kf([
          [0, [100, 100], "hold"],
          [86, [100, 100], "out"],
          [100, [190, 190], "out"],
          [118, [100, 100], "hold"],
          [150, [100, 100], "out"],
          [162, [170, 170], "out"],
          [176, [100, 100]],
        ]),
      }),
      group("antenna", [path([[bx, by - 16], [bx, by - 9]]), stroke(WHITE, 3.5)]),
      group("eye r", [rect(bx + 6.5, by + 3.5, 5.2, 8, 2.6), fill(GLOW)], { at: [bx + 6.5, by + 3.5], s: eyes }),
      group("eye l", [rect(bx - 6.5, by + 3.5, 5.2, 8, 2.6), fill(GLOW)], { at: [bx - 6.5, by + 3.5], s: eyes }),
      group("screen", [rect(bx, by + 3.5, 27, 16, 6), fill(SCREEN)]),
      group("ears", [rect(bx - 19.5, by + 3.5, 4.5, 9, 2.2), rect(bx + 19.5, by + 3.5, 4.5, 9, 2.2), fill(WHITE, 85)]),
      group("head", [rect(bx, by + 3.5, 36, 25, 9), fill(WHITE)]),
      group("disc", [ellipse(bx, by, 62), fill(BOT), stroke(WHITE, 5)]),
    ],
    {
      at: BADGE_AT,
      s: kf([
        [0, [100, 100, 100], "inOut"],
        [8, [0, 0, 100], "hold"],
        [52, [0, 0, 100], "back"],
        [70, [100, 100, 100], "hold"],
        [114, [100, 100, 100], "inOut"],
        [120, [90, 90, 100], "back"],
        [134, [100, 100, 100]],
      ]),
      r: kf([
        [0, 0, "hold"],
        [52, -25, "back"],
        [72, 0],
      ]),
    },
  );

  return comp("bots", [badge, plane, streaks]);
}

/* ---------- 4. SEO + GEO: a lens over rising bars, and the sparkles of an AI answer ---------- */

function seo() {
  const AMBER = [1, 0.84, 0.32];

  const lens = layer(
    3,
    "lens",
    "d2",
    [
      group("handle", [path([[125, 125], [158, 158]]), stroke(WHITE, 17)]),
      group("ring", [ellipse(90, 90, 92), stroke(WHITE, 12)]),
      group("glass", [ellipse(90, 90, 92), fill(WHITE, 18)]),
    ],
    {
      at: [140, 140],
      r: kf([
        [0, 0, "inOut"],
        [10, -10, "inOut"],
        [30, 6, "inOut"],
        [48, -3, "inOut"],
        [62, 0, "hold"],
      ]),
      p: kf([
        [0, [140, 140, 0], "inOut"],
        [10, [146, 146, 0], "inOut"],
        [36, [136, 138, 0], "inOut"],
        [60, [140, 140, 0]],
      ]),
    },
  );

  const bars = layer(
    2,
    "bars",
    "d3",
    [
      group("bar 3", [rect(108, 87, 13, 44, 4), fill(AMBER)], { at: [108, 109], s: growY(48, 70) }),
      group("bar 2", [rect(90, 94, 13, 30, 4), fill(WHITE, 92)], { at: [90, 109], s: growY(38, 60) }),
      group("bar 1", [rect(72, 100, 13, 18, 4), fill(WHITE, 75)], { at: [72, 109], s: growY(28, 50) }),
    ],
    { parent: 3 },
  );

  const twinkle = (t0, c) =>
    kf([
      [0, [100, 100]],
      [8, [0, 0], "hold"],
      [t0, [0, 0], "back"],
      [t0 + 18, [100, 100], "inOut"],
      [t0 + 50, [72, 72], "inOut"],
      [t0 + 70, [100, 100], "hold"],
      [180, [100, 100]],
    ].map(([t, s, e]) => [t, s.map((x) => x * c), e]));
  const spin = (t0) =>
    kf([
      [0, 0, "hold"],
      [t0, -45, "out"],
      [t0 + 30, 0],
    ]);

  const sparkles = layer(1, "sparkles", "d5", [
    group("small", [sparkle(134, 32, 9), fill(WHITE)], { at: [134, 32], s: twinkle(92, 1), r: spin(92) }),
    group("mid", [sparkle(174, 84, 11), fill(WHITE)], { at: [174, 84], s: twinkle(84, 1), r: spin(84) }),
    group("big", [sparkle(156, 54, 20), fill(AMBER)], { at: [156, 54], s: twinkle(74, 1), r: spin(74) }),
  ]);

  return comp("seo", [sparkles, bars, lens]);
}

/* ---------- shared bits of the later icons ---------- */

/** a circular arc around (cx, cy) from angle a0 to a1, in degrees (0 = right, 90 = down) */
function arc(cx, cy, r, a0, a1) {
  const rad = (a) => (a * Math.PI) / 180;
  const n = Math.max(1, Math.ceil(Math.abs(a1 - a0) / 90));
  const step = (a1 - a0) / n;
  const k = (4 / 3) * Math.tan(rad(step) / 4) * r;
  const verts = [];
  const ins = [];
  const outs = [];
  for (let i = 0; i <= n; i++) {
    const a = rad(a0 + step * i);
    const t = [-Math.sin(a), Math.cos(a)];
    verts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    ins.push([-t[0] * k, -t[1] * k]);
    outs.push([t[0] * k, t[1] * k]);
  }
  return path(verts, false, ins, outs);
}

/** the arrowhead at angle `a` of an arc around (cx, cy) that runs toward growing angles */
function arcHead(cx, cy, r, a, size = 11) {
  const rad = (d) => (d * Math.PI) / 180;
  const tip = [cx + r * Math.cos(rad(a)), cy + r * Math.sin(rad(a))];
  const back = [Math.sin(rad(a)), -Math.cos(rad(a))];
  const wing = (turn) => {
    const c = Math.cos(rad(turn));
    const sn = Math.sin(rad(turn));
    return [tip[0] + (back[0] * c - back[1] * sn) * size, tip[1] + (back[0] * sn + back[1] * c) * size];
  };
  return path([wing(38), tip, wing(-38)]);
}

/** the letter Я in strokes, h tall, centred on (cx, cy) */
function letterYa(cx, cy, h) {
  const u = h / 28;
  return [
    path([
      [cx + 7 * u, cy - 14 * u],
      [cx + 7 * u, cy + 14 * u],
    ]),
    path(
      [
        [cx + 7 * u, cy - 14 * u],
        [cx - 1 * u, cy - 14 * u],
        [cx - 1 * u, cy + 1 * u],
        [cx + 7 * u, cy + 1 * u],
      ],
      false,
      [
        [0, 0],
        [0, 0],
        [-8 * u, 0],
        [0, 0],
      ],
      [
        [0, 0],
        [-8 * u, 0],
        [0, 0],
        [0, 0],
      ],
    ),
    path([
      [cx + 2 * u, cy + 1 * u],
      [cx - 8 * u, cy + 14 * u],
    ]),
  ];
}

/** the letter A in strokes, h tall, centred on (cx, cy) */
function letterA(cx, cy, h) {
  const u = h / 28;
  return [
    path([
      [cx - 11 * u, cy + 14 * u],
      [cx, cy - 14 * u],
      [cx + 11 * u, cy + 14 * u],
    ]),
    path([
      [cx - 6.5 * u, cy + 5 * u],
      [cx + 6.5 * u, cy + 5 * u],
    ]),
  ];
}

/** the rouble sign in strokes, h tall, centred on (cx, cy) */
function ruble(cx, cy, h) {
  const u = h / 20;
  const x = cx + 1.5 * u;
  return [
    path([
      [x - 3 * u, cy - 10 * u],
      [x - 3 * u, cy + 10 * u],
    ]),
    path(
      [
        [x - 3 * u, cy - 10 * u],
        [x + 2 * u, cy - 10 * u],
        [x + 2 * u, cy],
        [x - 7 * u, cy],
      ],
      false,
      [
        [0, 0],
        [0, 0],
        [6 * u, 0],
        [0, 0],
      ],
      [
        [0, 0],
        [6 * u, 0],
        [0, 0],
        [0, 0],
      ],
    ),
    path([
      [x - 7 * u, cy + 5 * u],
      [x + 3 * u, cy + 5 * u],
    ]),
  ];
}

/* VK's logo (a 48×48 drawing; its middle is at about 24, 24.6) */
const VK_LOGO =
  "M25.54 34.58c-10.94 0-17.18-7.5-17.44-19.98h5.48c.18 9.16 4.22 13.04 7.42 13.84V14.6h5.16v7.9c3.16-.34 6.48-3.94 7.6-7.9h5.16c-.86 4.88-4.46 8.48-7.02 9.96 2.56 1.2 6.66 4.34 8.22 10.02h-5.68c-1.22-3.8-4.26-6.74-8.28-7.14v7.14h-.62z";

/** a white tick drawn over `from`–`to` on a green disc, popping in over `pop` */
function tickBadge(cx, cy, d, pop, draw) {
  const k = d / 30;
  return group(
    "tick",
    [
      group("mark", [
        path([
          [cx - 7 * k, cy + 0.5 * k],
          [cx - 2 * k, cy + 5.5 * k],
          [cx + 7.5 * k, cy - 5 * k],
        ]),
        trim(
          kf([
            [0, 100],
            [8, 0, "hold"],
            [draw[0], 0, "out"],
            [draw[1], 100],
          ]),
        ),
        stroke(WHITE, 4 * k),
      ]),
      body(ellipse(cx, cy, d), fill([0.2, 0.78, 0.44]), stroke(WHITE, 3.5 * k)),
    ],
    { at: [cx, cy], s: popIn(pop[0], pop[1]) },
  );
}

/* ---------- 5. Доступ без VPN: a globe, routes from Russia out to the world, and a shield that says it's fine ---------- */

function access() {
  const GLOW = [0.38, 0.98, 0.84];
  const AMBER = [1, 0.8, 0.3];
  const [cx, cy] = [92, 96];
  const R = 50;
  const H = [76, 76]; // home

  const globe = layer(
    4,
    "globe",
    "d2",
    [
      group("meridian", [
        {
          ty: "el",
          d: 1,
          s: kf([
            [0, [58, 100], "hold"],
            [14, [58, 100], "inOut"],
            [56, [0, 100], "inOut"],
            [100, [58, 100]],
          ]),
          p: v([cx, cy]),
        },
        stroke(WHITE, 4, 70),
      ]),
      group("axis", [path([[cx, cy - R], [cx, cy + R]]), stroke(WHITE, 4, 70)]),
      group("parallels", [
        path([[cx - 42.7, cy - 26], [cx + 42.7, cy - 26]]),
        path([[cx - 42.7, cy + 26], [cx + 42.7, cy + 26]]),
        stroke(WHITE, 3.5, 55),
      ]),
      group("equator", [path([[cx - R, cy], [cx + R, cy]]), stroke(WHITE, 4, 70)]),
      group("outline", [ellipse(cx, cy, R * 2), stroke(WHITE, 6)]),
      group("glass", [ellipse(cx, cy, R * 2), fill(WHITE, 8)]),
    ],
    {
      at: [cx, cy],
      s: kf([
        [0, [100, 100, 100]],
        [10, [92, 92, 100], "back"],
        [30, [100, 100, 100]],
      ]),
    },
  );

  const draw = (from, to) =>
    trim(
      kf([
        [0, 100],
        [8, 0, "hold"],
        [from, 0, "inOut"],
        [to, 100],
      ]),
    );
  const routes = layer(3, "routes", "d3", [
    group("route out", [
      path(
        [H, [164, 44]],
        false,
        [
          [0, 0],
          [-34, -6],
        ],
        [
          [22, -40],
          [0, 0],
        ],
      ),
      draw(30, 54),
      stroke(GLOW, 4),
    ]),
    group("route west", [
      path(
        [H, [32, 150]],
        false,
        [
          [0, 0],
          [-6, -32],
        ],
        [
          [-38, 8],
          [0, 0],
        ],
      ),
      draw(38, 62),
      stroke(GLOW, 4),
    ]),
  ]);

  const dot = (name, at, d, rgb, t0) => group(name, [ellipse(at[0], at[1], d), fill(rgb), stroke(WHITE, 2.5)], { at, s: popIn(t0, t0 + 14) });
  const pulse = (t0) =>
    group(`pulse ${t0}`, [ellipse(H[0], H[1], 12), stroke(AMBER, 2.5)], {
      at: H,
      s: kf([
        [0, [0, 0], "hold"],
        [t0, [0, 0], "out"],
        [t0 + 30, [340, 340], "hold"],
        [180, [340, 340]],
      ]),
      o: kf([
        [0, 0, "hold"],
        [t0, 90, "lin"],
        [t0 + 30, 0, "hold"],
        [180, 0],
      ]),
    });
  const dots = layer(2, "places", "d4", [
    dot("there 2", [32, 150], 10, GLOW, 60),
    dot("there 1", [164, 44], 10, GLOW, 52),
    dot("home", H, 13, AMBER, 18),
    pulse(66),
    pulse(132),
  ]);

  const [sx, sy] = [150, 146];
  const shield = layer(1, "shield", "d5", [
    group(
      "shield",
      [
        group("mark", [
          path([
            [sx - 8, sy + 1],
            [sx - 2, sy + 7],
            [sx + 9, sy - 6],
          ]),
          trim(
            kf([
              [0, 100],
              [8, 0, "hold"],
              [104, 0, "out"],
              [120, 100],
            ]),
          ),
          stroke(WHITE, 4.5),
        ]),
        body(
          path(
            [
              [sx, sy - 24],
              [sx + 20, sy - 17],
              [sx + 18, sy + 5],
              [sx, sy + 24],
              [sx - 18, sy + 5],
              [sx - 20, sy - 17],
            ],
            true,
            [
              [0, 0],
              [0, 0],
              [1, -8],
              [10, -6],
              [3, 9],
              [0, 8],
            ],
            [
              [0, 0],
              [0, 8],
              [-3, 9],
              [-10, -6],
              [-1, -8],
              [0, 0],
            ],
          ),
          fill([0.2, 0.78, 0.44]),
          stroke(WHITE, 4),
        ),
      ],
      { at: [sx, sy], s: popIn(90, 108) },
    ),
  ]);

  return comp("access", [shield, dots, routes, globe]);
}

/* ---------- 6. Пользовательская база: a sign-in card, Google, Яндекс and VK clipped to it, a tick for the new user ---------- */

function auth() {
  const VIOLET = [0.48, 0.32, 0.95];
  const PALE = [0.94, 0.93, 0.99];

  const back = layer(6, "back card", "d1", [group("back", [rect(101, 103, 94, 110, 16), fill(WHITE, 30)], { at: [101, 103], r: 7 })]);
  const card = layer(5, "card", "d2", [group("card", [rect(93, 95, 94, 110, 16), fill(WHITE)])]);

  const passwordDots = [69, 76, 83, 90].map((x, i) =>
    group(`dot ${i + 1}`, [ellipse(x, 113, 4.5), fill([0.55, 0.5, 0.78])], { at: [x, 113], s: popIn(50 + i * 4, 60 + i * 4) }),
  );
  const form = layer(4, "form", "d3", [
    tickBadge(107, 53, 16, [122, 138], [130, 144]),
    group("button", [group("label", [rect(93, 132, 24, 4, 2), fill(WHITE)]), body(rect(93, 132, 64, 13, 6.5), fill(VIOLET))], {
      at: [93, 132],
      s: kf([
        [0, [100, 100]],
        [8, [0, 0], "hold"],
        [34, [0, 0], "back"],
        [50, [100, 100], "hold"],
        [108, [100, 100], "inOut"],
        [114, [90, 90], "back"],
        [126, [100, 100]],
      ]),
    }),
    ...passwordDots,
    group("field 2", [rect(93, 113, 64, 11, 5.5), fill(PALE)], { at: [61, 113], s: growX(26, 42) }),
    group("login", [rect(82, 96, 32, 4.5, 2.25), fill([0.7, 0.66, 0.88])], { at: [66, 96], s: growX(40, 56) }),
    group("field 1", [rect(93, 96, 64, 11, 5.5), fill(PALE)], { at: [61, 96], s: growX(20, 36) }),
    group(
      "person",
      [
        ellipse(93, 61, 11),
        path(
          [
            [82, 79],
            [104, 79],
          ],
          true,
          [
            [0, 0],
            [0, -12],
          ],
          [
            [0, -12],
            [0, 0],
          ],
        ),
        fill(VIOLET),
      ],
      { at: [93, 70], s: popIn(18, 34) },
    ),
    group("avatar", [ellipse(93, 66, 32), fill([0.9, 0.87, 1])], { at: [93, 66], s: popIn(12, 28) }),
  ]);

  // the ways in: Google's G, Яндекс's Я, VK's logo
  const [gx, gy] = [147, 64];
  const gSeg = (a0, a1, rgb) => group(`g ${a0}`, [arc(gx, gy, 6.6, a0, a1), stroke(rgb, 3.3, 100, 1)]);
  const google = group(
    "google",
    [
      group("bar", [path([[gx + 0.8, gy], [gx + 8.2, gy]]), stroke([0.26, 0.52, 0.96], 3.3, 100, 1)]),
      gSeg(0, 48, [0.26, 0.52, 0.96]),
      gSeg(48, 150, [0.2, 0.66, 0.33]),
      gSeg(150, 205, [0.98, 0.74, 0.02]),
      gSeg(205, 318, [0.92, 0.26, 0.21]),
      body(ellipse(gx, gy, 28), fill(WHITE)),
    ],
    {
      at: [gx, gy],
      s: kf([
        [0, [100, 100]],
        [8, [0, 0], "hold"],
        [58, [0, 0], "back"],
        [74, [100, 100], "hold"],
        [96, [100, 100], "inOut"],
        [102, [82, 82], "back"],
        [116, [100, 100]],
      ]),
    },
  );
  const ripple = group("ripple", [ellipse(gx, gy, 28), stroke(WHITE, 3)], {
    at: [gx, gy],
    s: kf([
      [0, [100, 100], "hold"],
      [100, [100, 100], "out"],
      [128, [230, 230], "hold"],
      [180, [230, 230]],
    ]),
    o: kf([
      [0, 0, "hold"],
      [100, 90, "lin"],
      [128, 0, "hold"],
      [180, 0],
    ]),
  });
  const [yx, yy] = [151, 95];
  const yandex = group("yandex", [group("Я", [...letterYa(yx, yy, 15), stroke(WHITE, 2.6)]), body(ellipse(yx, yy, 28), fill([0.99, 0.25, 0.11]), stroke(WHITE, 3))], {
    at: [yx, yy],
    s: popIn(66, 82),
  });
  const [vx, vy] = [147, 126];
  const vk = group(
    "vk",
    [
      group("letters", [svgPath(VK_LOGO, { from: [24, 24.6], to: [vx, vy], scale: 0.52 }), fill(WHITE)]),
      body(rect(vx, vy, 26, 26, 8), fill([0, 0.47, 1]), stroke(WHITE, 3)),
    ],
    { at: [vx, vy], s: popIn(74, 90) },
  );
  const ways = layer(3, "ways in", "d5", [vk, yandex, google, ripple]);

  return comp("auth", [ways, form, card, back]);
}

/* ---------- 7. Онлайн-оплата: a card slides in, a rouble coin drops, and it's paid ---------- */

function pay() {
  const GOLD = [1, 0.83, 0.28];
  const DEEP = [0.93, 0.6, 0.04];

  const card = layer(5, "card", "d2", [group("card", [rect(90, 92, 116, 76, 13), fill(WHITE)])], {
    at: [90, 92],
    p: kf([
      [0, [90, 92, 0], "in"],
      [8, [150, 70, 0], "hold"],
      [12, [20, 120, 0], "out"],
      [40, [90, 92, 0]],
    ]),
    r: kf([
      [0, -10, "in"],
      [8, 10, "hold"],
      [12, -32, "out"],
      [40, -10, "hold"],
      [104, -10, "inOut"],
      [112, -15, "inOut"],
      [126, -10],
    ]),
    o: kf([
      [0, 100, "lin"],
      [8, 0, "hold"],
      [12, 0, "lin"],
      [20, 100],
    ]),
  });

  const wave = (r, t0) =>
    group(`wave ${r}`, [arc(80, 82, r, -50, 50), stroke([0.86, 0.64, 0.2], 2.4)], {
      o: kf([
        [0, 100, "hold"],
        [t0, 100, "lin"],
        [t0 + 4, 20, "lin"],
        [t0 + 12, 100, "hold"],
        [180, 100],
      ]),
    });
  const face = layer(
    4,
    "face",
    "d3",
    [
      group("name", [rect(60, 118, 34, 4.5, 2.25), fill([0.84, 0.81, 0.77])], { at: [43, 118], s: growX(42, 56) }),
      ...[0, 1, 2, 3].map((i) =>
        group(`digits ${i + 1}`, [rect(51 + i * 26, 105, 18, 5, 2.5), fill([0.55, 0.5, 0.44])], { at: [42 + i * 26, 105], s: growX(28 + i * 4, 42 + i * 4) }),
      ),
      wave(5, 64),
      wave(9, 68),
      wave(13, 72),
      group("chip", [
        group("lines", [path([[51, 82], [69, 82]]), path([[60, 75], [60, 89]]), stroke([0.84, 0.58, 0.12], 1.5)]),
        body(rect(60, 82, 20, 15, 4), fill(GOLD)),
      ]),
    ],
    { parent: 5 },
  );

  const coin = layer(
    3,
    "coin",
    "d4",
    [
      group("₽", [...ruble(146, 140, 19), stroke(WHITE, 3.6)]),
      group("rim", [ellipse(146, 140, 34), stroke(DEEP, 2.5)]),
      group("coin", [ellipse(146, 140, 46), fill(GOLD), stroke(WHITE, 3.5)]),
    ],
    {
      at: [146, 140],
      p: kf([
        [0, [146, 140, 0], "hold"],
        [40, [146, -10, 0], "in"],
        [58, [146, 140, 0], "out"],
        [66, [146, 127, 0], "in"],
        [74, [146, 140, 0], "out"],
        [79, [146, 135, 0], "in"],
        [84, [146, 140, 0]],
      ]),
      s: kf([
        [0, [100, 100, 100]],
        [8, [0, 0, 100], "hold"],
        [40, [100, 100, 100], "inOut"],
        [47, [14, 100, 100], "inOut"],
        [54, [100, 100, 100], "inOut"],
        [58, [115, 86, 100], "out"],
        [66, [100, 100, 100]],
      ]),
    },
  );

  const twinkle = (x, y, r, t0) =>
    group(`twinkle ${x}`, [sparkle(x, y, r), fill(WHITE)], {
      at: [x, y],
      s: kf([
        [0, [0, 0], "hold"],
        [t0, [0, 0], "back"],
        [t0 + 10, [100, 100], "inOut"],
        [t0 + 26, [0, 0], "hold"],
        [180, [0, 0]],
      ]),
    });
  const paid = layer(1, "paid", "d5", [
    tickBadge(152, 50, 30, [94, 110], [102, 118]),
    twinkle(118, 116, 7, 58),
    twinkle(176, 118, 6, 62),
    twinkle(172, 166, 5, 66),
  ]);

  return comp("pay", [paid, coin, face, card]);
}

/* ---------- 8. Вторая языковая версия: a Я card and an A card trade places, with arrows going round ---------- */

function lang() {
  const DARK = [0.03, 0.33, 0.36];
  const TEAL = [0.02, 0.48, 0.5];
  const B = [78, 80];
  const F = [122, 122];
  const up = [108, 66];
  const down = [92, 136];
  const at3 = ([x, y]) => [x, y, 0];

  const back = layer(
    3,
    "Я card",
    "d2",
    [group("Я", [...letterYa(B[0], B[1], 30), stroke(WHITE, 5.5)]), group("card", [rect(B[0], B[1], 72, 72, 16), fill(DARK)])],
    {
      at: B,
      p: kf([
        [0, at3(B), "hold"],
        [100, at3(B), "inOut"],
        [112, at3(up), "inOut"],
        [124, at3(F), "hold"],
        [140, at3(F), "inOut"],
        [152, at3(down), "inOut"],
        [164, at3(B)],
      ]),
      r: kf([
        [0, -8, "hold"],
        [12, -26, "back"],
        [32, -8, "hold"],
        [100, -8, "inOut"],
        [124, 6, "hold"],
        [140, 6, "inOut"],
        [164, -8],
      ]),
      s: kf([
        [0, [100, 100, 100]],
        [8, [0, 0, 100], "hold"],
        [12, [0, 0, 100], "back"],
        [32, [100, 100, 100]],
      ]),
    },
  );

  const front = layer(
    2,
    "A card",
    "d4",
    [group("A", [...letterA(F[0], F[1], 30), stroke(TEAL, 5.5)]), group("card", [rect(F[0], F[1], 72, 72, 16), fill(WHITE)])],
    {
      at: F,
      p: kf([
        [0, at3(F), "hold"],
        [100, at3(F), "inOut"],
        [112, at3(down), "inOut"],
        [124, at3(B), "hold"],
        [140, at3(B), "inOut"],
        [152, at3(up), "inOut"],
        [164, at3(F)],
      ]),
      r: kf([
        [0, 6, "hold"],
        [26, 24, "back"],
        [46, 6, "hold"],
        [100, 6, "inOut"],
        [124, -8, "hold"],
        [140, -8, "inOut"],
        [164, 6],
      ]),
      s: kf([
        [0, [100, 100, 100]],
        [8, [0, 0, 100], "hold"],
        [26, [0, 0, 100], "back"],
        [46, [100, 100, 100]],
      ]),
    },
  );

  const drawArc = (a0, a1, t0) =>
    group(`arc ${a0}`, [
      arc(100, 100, 62, a0, a1),
      trim(
        kf([
          [0, 100],
          [8, 0, "hold"],
          [t0, 0, "inOut"],
          [t0 + 22, 100],
        ]),
      ),
      stroke(WHITE, 6),
    ]);
  const head = (a, t0) => {
    const tip = [100 + 62 * Math.cos((a * Math.PI) / 180), 100 + 62 * Math.sin((a * Math.PI) / 180)];
    return group(`head ${a}`, [arcHead(100, 100, 62, a, 12), stroke(WHITE, 6)], { at: tip, s: popIn(t0 + 18, t0 + 30) });
  };
  const arrows = layer(1, "arrows", "d5", [
    group("arrows", [head(-18, 50), drawArc(-62, -18, 50), head(162, 56), drawArc(118, 162, 56)], {
      at: [100, 100],
      r: kf([
        [0, 0, "hold"],
        [100, 0, "inOut"],
        [124, 180, "hold"],
        [140, 180, "inOut"],
        [164, 360],
      ]),
    }),
  ]);

  return comp("lang", [arrows, front, back]);
}

/** a small heart centred on (cx, cy), about 20·k wide */
function heartAt(cx, cy, k = 1) {
  const v0 = [
    [0, 9],
    [-10, -1],
    [-5, -9],
    [0, -6],
    [5, -9],
    [10, -1],
  ];
  const ins = [
    [3, 3],
    [0, 3],
    [-3, 0],
    [-1, -2],
    [-3, 0],
    [0, -3],
  ];
  const outs = [
    [-3, -3],
    [0, -3],
    [3, 0],
    [1, -2],
    [3, 0],
    [0, 3],
  ];
  const sc = (pt) => [pt[0] * k, pt[1] * k];
  return path(
    v0.map(([x, y]) => [cx + x * k, cy + y * k]),
    true,
    ins.map(sc),
    outs.map(sc),
  );
}

/** a layer-sized pop: scale 100 → 0 over the fold, back with an overshoot from `from` to `to` (3D, for layers) */
const popIn3 = (from, to) =>
  kf([
    [0, [100, 100, 100]],
    [8, [0, 0, 100], "hold"],
    [from, [0, 0, 100], "back"],
    [to, [100, 100, 100]],
  ]);

/* ---------- 9. Аналитика и отчёт: a report whose line climbs, and a pie of where enquiries came from ---------- */

function analytics() {
  const INDIGO = [0.3, 0.36, 1];
  const CYAN = [0.2, 0.78, 0.95];
  const PINK = [1, 0.42, 0.62];
  const AMBER = [1, 0.75, 0.25];
  const LINE = [0.9, 0.91, 0.96];

  const card = layer(5, "report", "d2", [group("sheet", [rect(88, 92, 104, 108, 16), fill(WHITE)])], {
    at: [88, 92],
    s: kf([
      [0, [100, 100, 100]],
      [10, [92, 92, 100], "back"],
      [28, [100, 100, 100]],
    ]),
  });

  const pts = [
    [48, 122],
    [64, 108],
    [80, 114],
    [98, 92],
    [114, 98],
    [130, 74],
  ];
  const chart = layer(
    4,
    "chart",
    "d3",
    [
      group("last point", [ellipse(130, 74, 10), fill(WHITE), stroke(INDIGO, 3)], { at: [130, 74], s: popIn(60, 74) }),
      group("line", [
        path(pts),
        trim(
          kf([
            [0, 100],
            [8, 0, "hold"],
            [24, 0, "inOut"],
            [62, 100],
          ]),
        ),
        stroke(INDIGO, 4),
      ]),
      group("area", [path([...pts, [130, 128], [48, 128]], true), fill(INDIGO, 14)], {
        o: kf([
          [0, 100],
          [8, 0, "hold"],
          [48, 0, "lin"],
          [70, 100],
        ]),
      }),
      group("grid", [path([[46, 86], [132, 86]]), path([[46, 107], [132, 107]]), path([[46, 128], [132, 128]]), stroke(LINE, 2)]),
      group("sub", [rect(57, 66, 22, 4, 2), fill([0.78, 0.8, 0.88])], { at: [46, 66], s: growX(18, 32) }),
      group("title", [rect(63, 55, 34, 6, 3), fill([0.12, 0.14, 0.3])], { at: [46, 55], s: growX(14, 30) }),
    ],
    { parent: 5 },
  );

  // the line is going up
  const [ux, uy] = [140, 44];
  const growth = layer(2, "up", "d4", [
    group(
      "up",
      [
        group("arrow", [path([[ux - 6, uy + 1], [ux, uy - 5.5], [ux + 6, uy + 1]]), path([[ux, uy - 5.5], [ux, uy + 7]]), stroke(WHITE, 3.2)]),
        body(ellipse(ux, uy, 26), fill([0.2, 0.78, 0.44]), stroke(WHITE, 3)),
      ],
      { at: [ux, uy], s: popIn(108, 122) },
    ),
  ]);

  // where the enquiries came from
  const [dx, dy] = [150, 146];
  const slice = (a0, a1, rgb, t0) =>
    group(`slice ${a0}`, [
      arc(dx, dy, 15, a0, a1),
      trim(
        kf([
          [0, 100],
          [8, 0, "hold"],
          [t0, 0, "out"],
          [t0 + 12, 100],
        ]),
      ),
      stroke(rgb, 8, 100, 1),
    ]);
  const donut = layer(1, "sources", "d5", [
    group(
      "donut",
      [slice(-90, 60, INDIGO, 80), slice(60, 160, CYAN, 90), slice(160, 230, PINK, 98), slice(230, 270, AMBER, 104), body(ellipse(dx, dy, 54), fill(WHITE))],
      {
        at: [dx, dy],
        s: popIn(66, 82),
        r: kf([
          [0, 0, "hold"],
          [66, -50, "out"],
          [116, 0],
        ]),
      },
    ),
  ]);

  return comp("analytics", [donut, growth, chart, card]);
}

/* ---------- 10. Reels под ключ: a phone playing a video, and a clapperboard that claps ---------- */

function reels() {
  const INK = [0.13, 0.12, 0.16];
  const MAGENTA = [0.85, 0.2, 0.55];
  const [px, py] = [108, 98];

  const phone = layer(
    4,
    "phone",
    "d2",
    [
      group("screen", [
        rect(px, py, 66, 118, 10),
        gradFill(
          [
            [0, [1, 0.68, 0.42]],
            [0.55, [0.98, 0.34, 0.56]],
            [1, [0.58, 0.16, 0.7]],
          ],
          [px, py - 59],
          [px, py + 59],
        ),
      ]),
      group("body", [rect(px, py, 78, 132, 18), fill(WHITE)]),
    ],
    { at: [px, py], s: popIn3(12, 32) },
  );

  const ui = layer(
    3,
    "video",
    "d3",
    [
      group("progress", [rect(px, 148, 52, 4, 2), fill(WHITE)], {
        at: [px - 26, 148],
        s: kf([
          [0, [70, 100]],
          [8, [0, 100], "hold"],
          [40, [0, 100], "lin"],
          [150, [70, 100]],
        ]),
      }),
      group("track", [rect(px, 148, 52, 4, 2), fill(WHITE, 40)]),
      group("comment", [ellipse(134, 128, 8), fill(WHITE, 90)], { at: [134, 128], s: popIn(40, 52) }),
      group("like", [heartAt(134, 113, 0.55), fill(WHITE)], {
        at: [134, 113],
        s: kf([
          [0, [100, 100]],
          [8, [0, 0], "hold"],
          [36, [0, 0], "back"],
          [48, [100, 100], "hold"],
          [100, [100, 100], "out"],
          [106, [135, 135], "inOut"],
          [116, [100, 100]],
        ]),
      }),
      group("play", [path([[px - 5, py - 10], [px - 5, py + 6], [px + 9, py - 2]], true), fill(MAGENTA)]),
      group("play button", [ellipse(px, py - 2, 32), fill(WHITE, 92)], { at: [px, py - 2], s: popIn(22, 38) }),
    ],
    { parent: 4 },
  );

  // hearts floating up from the like
  const floater = (t0, dxx, k) =>
    group(`float ${t0}`, [heartAt(134, 113, k), fill(WHITE)], {
      a: [134, 113],
      p: kf([
        [0, [134, 113], "hold"],
        [t0, [134, 113], "out"],
        [t0 + 30, [134 + dxx, 78]],
      ]),
      o: kf([
        [0, 0, "hold"],
        [t0, 100, "hold"],
        [t0 + 16, 100, "lin"],
        [t0 + 30, 0],
      ]),
    });
  const hearts = layer(2, "hearts", "d4", [floater(104, -6, 0.5), floater(114, 8, 0.4)]);

  // the clapperboard: its arm opens and claps shut
  const [kx, ky] = [56, 146];
  const stripes = [0, 1, 2, 3].map((i) => {
    const x0 = kx - 21 + i * 13;
    return path(
      [
        [x0, ky - 27.5],
        [x0 + 6, ky - 27.5],
        [x0 + 1, ky - 17.5],
        [x0 - 5, ky - 17.5],
      ],
      true,
    );
  });
  const clapper = layer(1, "clapper", "d5", [
    group(
      "clapper",
      [
        group("arm", [group("stripes", [...stripes, fill(WHITE)]), body(rect(kx, ky - 22.5, 52, 10, 3), fill(INK))], {
          a: [kx - 26, ky - 17.5],
          p: [kx - 26, ky - 17.5],
          r: kf([
            [0, 0, "hold"],
            [40, 0, "out"],
            [50, -34, "in"],
            [56, 0, "hold"],
            [100, 0, "out"],
            [108, -24, "in"],
            [113, 0],
          ]),
        }),
        group("lines", [rect(kx - 6, ky + 1, 30, 3, 1.5), rect(kx - 10, ky + 8, 22, 3, 1.5), fill(WHITE, 55)]),
        group("board", [rect(kx, ky + 1, 52, 30, 5), fill(INK)]),
      ],
      {
        at: [kx, ky],
        s: popIn(26, 42),
        r: kf([
          [0, -10, "hold"],
          [56, -10, "out"],
          [60, -13, "out"],
          [66, -10, "hold"],
          [113, -10, "out"],
          [117, -12, "out"],
          [122, -10],
        ]),
      },
    ),
  ]);

  return comp("reels", [clapper, hearts, ui, phone]);
}

/* ---------- 11. Печатные материалы с QR-кодом: a flyer with a QR code, scanned, and the site opens on a phone ---------- */

function print() {
  const INK = [0.1, 0.11, 0.14];
  const LIME = [0.72, 0.95, 0.25];
  const DEEP = [0.33, 0.6, 0.05];
  const [fx, fy] = [84, 96];

  const flyer = layer(5, "flyer", "d2", [group("sheet", [rect(fx, fy, 92, 116, 10), fill(WHITE)])], {
    at: [fx, fy],
    r: kf([
      [0, -6, "hold"],
      [12, -18, "back"],
      [32, -6],
    ]),
    s: popIn3(12, 32),
  });

  // the code: 9 by 9 cells, three finder squares and a scatter of modules
  const cell = 5.4;
  const [qx, qy] = [84, 104];
  const x0 = qx - (cell * 9) / 2;
  const y0 = qy - (cell * 9) / 2;
  const c = (i) => x0 + cell * (i + 0.5);
  const r = (j) => y0 + cell * (j + 0.5);
  const finder = (i, j, t0) => {
    const [cx, cy] = [c(i + 1), r(j + 1)];
    return group(
      `finder ${i}${j}`,
      [
        group("eye", [rect(cx, cy, cell, cell, 1), fill(INK)]),
        group("gap", [rect(cx, cy, cell * 2, cell * 2, 1.5), fill(WHITE)]),
        group("ring", [rect(cx, cy, cell * 3, cell * 3, 2.5), fill(INK)]),
      ],
      { at: [cx, cy], s: popIn(t0, t0 + 12) },
    );
  };
  const MODULES = [
    [4, 0], [3, 1], [5, 1], [4, 2], [1, 3], [2, 3], [3, 3], [5, 3], [7, 3], [0, 4], [2, 4], [4, 4], [6, 4], [8, 4],
    [1, 5], [3, 5], [5, 5], [6, 5], [7, 5], [4, 6], [6, 6], [8, 6], [3, 7], [5, 7], [7, 7], [4, 8], [6, 8], [8, 8],
  ];
  const rows = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    .map((j) => {
      const cells = MODULES.filter(([, jj]) => jj === j);
      if (!cells.length) return null;
      return group(`row ${j}`, [...cells.map(([i]) => rect(c(i), r(j), cell + 0.3, cell + 0.3, 0.8)), fill(INK)], {
        at: [qx, r(j)],
        s: kf([
          [0, [100, 100]],
          [8, [100, 0], "hold"],
          [26 + j * 3, [100, 0], "back"],
          [36 + j * 3, [100, 100]],
        ]),
      });
    })
    .filter(Boolean);
  const bracket = (sx, sy) => {
    const [bx, by] = [qx + sx * 30, qy + sy * 30];
    return path([
      [bx, by - sy * 9],
      [bx, by],
      [bx - sx * 9, by],
    ]);
  };
  const scanLine = group(
    "scan",
    [group("glow", [rect(qx, qy, 60, 10, 5), fill(LIME, 30)]), group("line", [rect(qx, qy, 60, 3, 1.5), fill(LIME)])],
    {
      p: kf([
        [0, [0, 0], "hold"],
        [56, [0, -26], "inOut"],
        [76, [0, 26], "inOut"],
        [96, [0, -26], "inOut"],
        [108, [0, 0]],
      ]),
      o: kf([
        [0, 0, "hold"],
        [56, 100, "hold"],
        [102, 100, "lin"],
        [108, 0],
      ]),
    },
  );
  const code = layer(
    4,
    "code",
    "d3",
    [
      scanLine,
      group("brackets", [bracket(-1, -1), bracket(1, -1), bracket(1, 1), bracket(-1, 1), stroke(DEEP, 3)], { at: [qx, qy], s: popIn(46, 58) }),
      finder(0, 0, 20),
      finder(6, 0, 24),
      finder(0, 6, 28),
      ...rows,
      group("hint", [rect(fx, 145, 40, 4, 2), fill([0.78, 0.8, 0.84])], { at: [fx - 20, 145], s: growX(40, 54) }),
      group("sub", [rect(fx, 62, 34, 4, 2), fill([0.72, 0.74, 0.78])], { at: [fx - 17, 62], s: growX(22, 36) }),
      group("title", [rect(fx, 51, 52, 7, 3.5), fill(INK)], { at: [fx - 26, 51], s: growX(16, 32) }),
    ],
    { parent: 5 },
  );

  // the phone it was scanned with: the site opens on it
  const [hx, hy] = [150, 140];
  const phone = layer(1, "phone", "d5", [
    group(
      "phone",
      [
        group(
          "site",
          [
            group("button", [rect(hx, hy + 22, 20, 6, 3), fill(LIME)]),
            group("line", [rect(hx - 6, hy + 11, 18, 4, 2), fill(WHITE, 60)]),
            group("block", [rect(hx, hy - 4, 30, 16, 4), fill(WHITE, 90)]),
            group("header", [rect(hx, hy - 20, 30, 7, 3), fill(LIME)]),
          ],
          { at: [hx, hy], s: popIn(104, 120) },
        ),
        group("screen", [rect(hx, hy, 38, 66, 7), fill([0.16, 0.17, 0.21])]),
        group("body", [rect(hx, hy, 46, 78, 11), fill(INK), stroke(WHITE, 2.5)]),
      ],
      { at: [hx, hy], r: 10, s: popIn(62, 78) },
    ),
  ]);

  return comp("print", [phone, code, flyer]);
}

/* ---------- 12. Онлайн-запись: a calendar, a day and a time picked, and a reminder rings ---------- */

function booking() {
  const RED = [0.9, 0.2, 0.22];
  const GREY = [0.86, 0.86, 0.9];
  const PALE = [0.95, 0.95, 0.97];
  const [cx, cy] = [90, 96];

  const card = layer(
    5,
    "calendar",
    "d2",
    [
      group("rings", [ellipse(64, 41, 7), ellipse(116, 41, 7), fill(WHITE)]),
      group("header", [roundRect(38, 41, 142, 61, [16, 16, 0, 0]), fill(RED)]),
      group("sheet", [rect(cx, cy, 104, 110, 16), fill(WHITE)]),
    ],
    { at: [cx, cy], s: popIn3(12, 30) },
  );

  const days = [];
  [74, 88].forEach((y, row) =>
    [54, 72, 90, 108, 126].forEach((x, col) => {
      const k = row * 5 + col;
      days.push(group(`day ${k + 1}`, [ellipse(x, y, 6), fill(GREY)], { at: [x, y], s: popIn(18 + k * 2, 28 + k * 2) }));
    }),
  );
  const slot = (y, i) => group(`slot ${i + 1}`, [rect(cx, y, 80, 10, 5), fill(PALE)], { at: [cx - 40, y], s: growX(30 + i * 4, 46 + i * 4) });
  const picked = layer(
    4,
    "picked",
    "d3",
    [
      group("tick", [path([[118, 122], [121.5, 125.5], [127, 119]]), trim(kf([[0, 100], [8, 0, "hold"], [84, 0, "out"], [96, 100]])), stroke(WHITE, 2.4)]),
      group("time", [rect(cx, 122, 80, 10, 5), fill(RED)], { at: [cx - 40, 122], s: growX(70, 84) }),
      group("day", [ellipse(90, 88, 13), fill(RED)], { at: [90, 88], s: popIn(48, 60) }),
      slot(108, 0),
      slot(122, 1),
      slot(136, 2),
      ...days,
    ],
    { parent: 5 },
  );

  // the reminder
  const [bx, by] = [148, 50];
  const bell = layer(1, "reminder", "d5", [
    group(
      "reminder",
      [
        group("dot", [ellipse(bx + 12, by - 12, 10), fill([1, 0.75, 0.2]), stroke(WHITE, 2.5)], { at: [bx + 12, by - 12], s: popIn(116, 128) }),
        group(
          "bell",
          [ellipse(bx, by + 10.5, 5), rect(bx, by + 6.5, 24, 4, 2), rect(bx, by + 1, 17, 9, 0), ellipse(bx, by - 3, 17, 20), fill(WHITE)],
          {
            a: [bx, by - 12],
            p: [bx, by - 12],
            r: kf([
              [0, 0, "hold"],
              [112, 0, "inOut"],
              [118, 18, "inOut"],
              [124, -15, "inOut"],
              [130, 10, "inOut"],
              [136, -6, "inOut"],
              [142, 0],
            ]),
          },
        ),
        body(ellipse(bx, by, 40), fill([0.78, 0.07, 0.15]), stroke(WHITE, 3.5)),
      ],
      { at: [bx, by], s: popIn(96, 110) },
    ),
  ]);

  return comp("booking", [bell, picked, card]);
}

/* ---------- 13. ИИ-помощник: a chat on the site, the assistant thinks and answers ---------- */

function ai() {
  const VIO = [0.48, 0.36, 1];
  const PALE = [0.95, 0.94, 1];
  const [cx, cy] = [96, 102];

  const card = layer(4, "chat", "d2", [group("chat", [rect(cx, cy, 112, 100, 18), fill(WHITE)])], { at: [cx, cy], s: popIn3(12, 30) });

  const dot = (x, i) =>
    group(`dot ${i + 1}`, [ellipse(x, 103, 7), fill(VIO)], {
      p: kf([
        [0, [0, 0], "hold"],
        [58 + i * 5, [0, 0], "inOut"],
        [65 + i * 5, [0, -5], "inOut"],
        [72 + i * 5, [0, 0], "inOut"],
        [79 + i * 5, [0, -5], "inOut"],
        [86 + i * 5, [0, 0], "hold"],
      ]),
      o: kf([
        [0, 0, "hold"],
        [52, 100, "hold"],
        [92, 100, "lin"],
        [98, 0],
      ]),
    });
  const line = (y, wd, rgb, i) => group(`line ${i + 1}`, [rect(56 + wd / 2, y, wd, 5, 2.5), fill(rgb)], { at: [56, y], s: growX(96 + i * 6, 112 + i * 6) });
  const chat = layer(
    3,
    "messages",
    "d3",
    [
      group("send", [path([[133, 138], [139, 138]]), path([[136.5, 135.5], [139, 138], [136.5, 140.5]]), stroke(WHITE, 1.8), body(ellipse(136, 138, 12), fill(VIO))], {
        at: [136, 138],
        s: popIn(30, 42),
      }),
      group("input", [rect(cx, 138, 96, 14, 7), stroke([0.87, 0.87, 0.92], 2)], { at: [cx, 138], s: growX(26, 42) }),
      group(
        "answer",
        [
          line(95, 56, VIO, 0),
          line(104, 46, [0.68, 0.6, 1], 1),
          line(113, 30, [0.68, 0.6, 1], 2),
          dot(70, 0),
          dot(82, 1),
          dot(94, 2),
          body(rect(86, 104, 76, 36, 12), fill(PALE)),
        ],
        { a: [48, 122], p: [48, 122], s: popIn(44, 58) },
      ),
      group("question", [group("text", [rect(119, 72, 26, 4, 2), fill(WHITE, 85)]), body(rect(122, 72, 48, 15, 7.5), fill([0.2, 0.22, 0.3]))], {
        a: [146, 79],
        p: [146, 79],
        s: popIn(22, 36),
      }),
    ],
    { parent: 4 },
  );

  // the assistant's sparkle: iridescent, it turns while thinking
  const sparkles = layer(1, "sparkles", "d5", [
    group(
      "small",
      [sparkle(73, 30, 8), fill(WHITE)],
      {
        at: [73, 30],
        s: kf([
          [0, [100, 100]],
          [8, [0, 0], "hold"],
          [22, [0, 0], "back"],
          [36, [100, 100], "hold"],
          [120, [100, 100], "inOut"],
          [130, [60, 60], "inOut"],
          [140, [100, 100]],
        ]),
      },
    ),
    group(
      "big",
      [
        sparkle(46, 52, 20),
        gradFill(
          [
            [0, [0.36, 0.78, 1]],
            [0.5, [0.48, 0.36, 1]],
            [1, [1, 0.37, 0.66]],
          ],
          [30, 36],
          [62, 68],
        ),
        stroke(WHITE, 3),
      ],
      {
        at: [46, 52],
        s: kf([
          [0, [100, 100]],
          [8, [0, 0], "hold"],
          [14, [0, 0], "back"],
          [30, [100, 100], "hold"],
          [60, [100, 100], "inOut"],
          [76, [82, 82], "inOut"],
          [92, [100, 100]],
        ]),
        r: kf([
          [0, 0, "hold"],
          [14, -45, "back"],
          [30, 0, "hold"],
          [60, 0, "inOut"],
          [92, 90, "hold"],
          [180, 90],
        ]),
      },
    ),
  ]);

  return comp("ai", [sparkles, chat, card]);
}

/* ---------- 14. Почта на домене: an envelope opens, a letter with @ comes out; mail goes both ways ---------- */

function mail() {
  const ORANGE = [0.93, 0.4, 0.08];
  const INSIDE = [0.93, 0.9, 0.87];
  const [ex, ey] = [94, 112];

  const back = layer(
    4,
    "envelope back",
    "d1",
    [
      group("flap", [path([[39, 80], [ex, 44], [149, 80]], true), fill(INSIDE)], {
        a: [ex, 80],
        p: [ex, 80],
        s: kf([
          [0, [100, 100]],
          [8, [100, 0], "hold"],
          [24, [100, 0], "back"],
          [38, [100, 100]],
        ]),
      }),
      group("inside", [rect(ex, ey, 110, 70, 12), fill(INSIDE)]),
    ],
    { at: [ex, ey], s: popIn3(12, 28) },
  );

  // the @, drawn: a ring, the stem on its right, and the outer stroke wrapping round
  const [ax, ay] = [ex, 86];
  const at = [
    ellipse(ax, ay, 11),
    path([[ax + 5.5, ay - 6], [ax + 5.5, ay + 2]], false, [[0, 0], [0, 0]], [[0, 0], [0, 0]]),
    path(
      [
        [ax + 5.5, ay + 2],
        [ax + 12.2, ay + 4.4],
      ],
      false,
      [
        [0, 0],
        [-3, 2],
      ],
      [
        [0, 3.5],
        [0, 0],
      ],
    ),
    arc(ax, ay, 13, 20, -250),
  ];
  const letter = layer(
    3,
    "letter",
    "d3",
    [
      group("line", [rect(ex, 106, 44, 4, 2), fill([0.86, 0.84, 0.82])]),
      group("@", [...at, stroke(ORANGE, 3.4)], { at: [ax, ay], s: popIn(50, 64) }),
      group("paper", [rect(ex, 98, 84, 64, 8), fill(WHITE)]),
    ],
    {
      at: [ex, 98],
      p: kf([
        [0, [ex, 98, 0], "inOut"],
        [8, [ex, 124, 0], "hold"],
        [34, [ex, 124, 0], "out"],
        [52, [ex, 94, 0], "inOut"],
        [62, [ex, 98, 0], "hold"],
        [112, [ex, 98, 0], "inOut"],
        [120, [ex, 92, 0], "inOut"],
        [130, [ex, 98, 0]],
      ]),
    },
  );

  // the front of the envelope, the pocket the letter sits in
  const front = layer(2, "envelope front", "d4", [
    group("pocket", [
      path(
        [
          [39, 84],
          [ex, 118],
          [149, 84],
          [149, 135],
          [137, 147],
          [51, 147],
          [39, 135],
        ],
        true,
        [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 0],
          [6.6, 0],
          [0, 0],
          [0, 6.6],
        ],
        [
          [0, 0],
          [0, 0],
          [0, 0],
          [0, 6.6],
          [0, 0],
          [-6.6, 0],
          [0, 0],
        ],
      ),
      fill(WHITE),
    ]),
  ]);
  front.ks.a = v([ex, ey, 0]);
  front.ks.p = v([ex, ey, 0]);
  front.ks.s = popIn3(12, 28);

  // sending and receiving: an arrow out and an arrow in
  const [sx, sy] = [152, 146];
  const arrow = (dx, dir, t0) =>
    group(`arrow ${dir < 0 ? "out" : "in"}`, [
      path([[sx + dx, sy - 7 * dir], [sx + dx, sy + 7 * dir]]),
      path([[sx + dx - 4.5, sy + 2.5 * dir], [sx + dx, sy + 7 * dir], [sx + dx + 4.5, sy + 2.5 * dir]]),
      stroke(WHITE, 3),
    ], {
      p: kf([
        [0, [0, 0], "hold"],
        [t0, [0, 0], "inOut"],
        [t0 + 8, [0, 4 * dir], "inOut"],
        [t0 + 16, [0, 0]],
      ]),
    });
  const twoWay = layer(1, "send and receive", "d5", [
    group("two-way", [arrow(-5.5, -1, 118), arrow(5.5, 1, 126), body(ellipse(sx, sy, 34), fill([0.2, 0.55, 1]), stroke(WHITE, 3.5))], {
      at: [sx, sy],
      s: popIn(92, 108),
    }),
  ]);

  return comp("mail", [twoWay, front, letter, back]);
}

mkdirSync(OUT, { recursive: true });
for (const [id, make] of Object.entries({ site, brand, bots, seo, access, auth, pay, lang, analytics, reels, print, booking, ai, mail })) {
  const file = join(OUT, `${id}.json`);
  writeFileSync(file, JSON.stringify(make()));
  console.log("wrote", file);
}
