#!/usr/bin/env node
/*
 * Publishes a client site concept as a preview on the portfolio: ivanbogush.ru/works/<id>.
 *
 *   node scripts/add-work.mjs <client>                 e.g. disoley.ru  (the folder in ../Pitches)
 *   node scripts/add-work.mjs <client> --id anna-ivanova-2   pick the id yourself (two clients with one name)
 *   node scripts/add-work.mjs <client> --placeholders  stand-in pictures for missing images (local testing only)
 *   node scripts/add-work.mjs <client> --full          allow the long story (a client already talking to Ivan)
 *   node scripts/add-work.mjs <client> --keep-build    don't rebuild the site: only work.json changed (or the name)
 *
 * It builds ../Pitches/<client>/app with that site's own Vite config, except as normal files instead of one
 * inlined HTML (vite-plugin-singlefile is left out): pictures stay separate files, so git keeps each one once however
 * often the site is republished. The build goes to public/previews/<id>/, marked noindex, a screenshot of its first
 * screen to public/cards/<id>.jpg (the picture the link unfurls with), and the work is added to data/works.json (or
 * its date updated). The id is the professional's name from work.json ("Dilyara Soley" → /works/dilyara-soley):
 * run it again after changing the site and the id stays; change the name and the old link is removed.
 *
 * The work's title, pricing, intro (the line on the first screen) and story (why this client needs this site) are
 * read from the client's own file, ../Pitches/<client>/work.json, on every run: edit them there, not in
 * data/works.json.
 *
 * The client sites share one node_modules in ../Pitches (npm workspaces): `npm install` there once.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, rmSync, renameSync, mkdirSync, createReadStream } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worksFile = path.join(root, "data", "works.json");

const args = process.argv.slice(2);
const client = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--id");
const wantedId = args.includes("--id") ? args[args.indexOf("--id") + 1] : undefined;
const placeholders = args.includes("--placeholders");
const full = args.includes("--full");
const keepBuild = args.includes("--keep-build");
const fail = (msg) => {
  console.error(`\n!! ${msg}`);
  process.exit(1);
};

if (!client) fail("Which client? node scripts/add-work.mjs <folder in ../Pitches>");
const appDir = path.resolve(root, "..", "Pitches", client, "app");
if (!existsSync(path.join(appDir, "package.json"))) fail(`No site at ${appDir}`);

// ─── the audit: nothing missing, nothing misconfigured (Pitches/tools/check.mjs, AGENTS.md) ───
const checker = path.resolve(root, "..", "Pitches", "tools", "check.mjs");
if (existsSync(checker)) {
  // --fix: fonts the builder left out are downloaded from Fontsource (check.mjs explains)
  const audit = spawnSync(process.execPath, [checker, client, "--fix"], { stdio: "inherit" });
  if (audit.status !== 0 && !placeholders) {
    fail(`The audit above found missing assets or setup problems. Fix them first (Pitches/AGENTS.md), or publish a draft with --placeholders.`);
  }
}

// The client's own file, ../Pitches/<client>/work.json: read here for the name the link is made of, and
// checked and copied into data/works.json after the build.
const about = path.resolve(appDir, "..", "work.json");
let own;
if (existsSync(about)) {
  try {
    own = JSON.parse(readFileSync(about, "utf8"));
  } catch (e) {
    fail(`${client}/work.json isn't valid JSON: ${e.message}`);
  }
}

// ─── the id: the professional's name ───
// The link is sent to someone who has never heard of Ivan: /works/dilyara-soley reads as made for them, where a
// random /works/xrukpk looked like a phishing link (Ivan, 17 November 2026). The name comes from work.json's
// "name", in Latin letters as the client writes it ("Dilyara Soley"); --id overrides it, e.g. for two clients
// with the same name.
const works = existsSync(worksFile) ? JSON.parse(readFileSync(worksFile, "utf8")) : [];
let work = works.find((w) => w.client === client);
const slug = (s) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
if (own?.name !== undefined && (typeof own.name !== "string" || !slug(own.name))) {
  fail(`${client}/work.json: "name" is the professional's name in Latin letters, e.g. "Dilyara Soley"`);
}
const id = wantedId ?? (own?.name ? slug(own.name) : work?.id);
if (!id) fail(`${client}/work.json needs "name": the professional's name in Latin letters ("Dilyara Soley"). The link is made of it.`);
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) || id.length < 4 || id.length > 40) {
  fail(`An id is 4–40 lowercase Latin letters and digits, words joined by "-", not "${id}"`);
}
if (works.some((w) => w.id === id && w.client !== client)) {
  fail(`The id ${id} already belongs to ${works.find((w) => w.id === id).client}: pick another with --id`);
}
const oldId = work && work.id !== id ? work.id : undefined;

// ─── the build ───
const require = createRequire(path.join(appDir, "package.json"));
const outDir = path.join(root, "public", "previews", id);
if (keepBuild) {
  // the site as it was last built, moved to the new name if the name changed
  const built = path.join(root, "public", "previews", work?.id ?? id);
  if (!work || !existsSync(path.join(built, "index.html"))) fail(`--keep-build: ${client} has no build yet. Run it without the flag.`);
  if (oldId) {
    if (existsSync(outDir)) fail(`--keep-build: public/previews/${id}/ is in the way`);
    renameSync(built, outDir);
  }
  console.log(`Keeping the built site in public/previews/${id}/`);
} else {
  await build();
}

async function build() {
let vitePath;
try {
  vitePath = require.resolve("vite");
} catch {
  fail(`Vite isn't installed for ${client}: run npm install in ../Pitches`);
}
const vite = await import(pathToFileURL(vitePath).href);
const loaded = await vite.loadConfigFromFile({ command: "build", mode: "production" }, undefined, appDir);
if (!loaded) fail(`No vite.config in ${appDir}`);
const config = loaded.config;

const plugins = [config.plugins ?? []].flat(Infinity).filter((p) => p && !String(p.name ?? "").includes("singlefile"));

if (placeholders) {
  const exts = /\.(webp|png|jpe?g|gif|avif|svg)$/i;
  plugins.unshift({
    name: "portfolio:missing-image-placeholders",
    enforce: "pre",
    async resolveId(source, importer) {
      if (!importer || !exts.test(source)) return null;
      const resolved = await this.resolve(source, importer, { skipSelf: true });
      if (resolved && existsSync(resolved.id.split("?")[0])) return null;
      return `\0placeholder:${source}`;
    },
    load(idLoaded) {
      if (!idLoaded.startsWith("\0placeholder:")) return null;
      const name = path.basename(idLoaded.slice("\0placeholder:".length));
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500"><rect width="1200" height="1500" fill="#d8d3c8"/><text x="600" y="760" font-family="sans-serif" font-size="44" fill="#8a8478" text-anchor="middle">${name}</text></svg>`;
      return `export default ${JSON.stringify("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg))};`;
    },
  });
}

console.log(`Building ${client} → public/previews/${id}/ …`);
// On Windows esbuild passes a chunk over 1 MB (before minifying) through a temp file and deletes it afterwards, and
// Defender's real-time scan holds that fresh file every time: "remove …\Temp\esbuild-…: Access is denied" (Mikhail
// Khors's site, 21 November 2026). So each npm package goes in a chunk of its own, and no file gets near 1 MB.
const vendorChunk = (moduleId) => {
  const m = moduleId.split(path.sep).join("/").match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  return m ? "vendor-" + m[1].replace(/[@/]+/g, "-").replace(/^-/, "") : undefined;
};
const rollupOptions = config.build?.rollupOptions ?? {};
const output = Array.isArray(rollupOptions.output) || rollupOptions.output?.manualChunks ? rollupOptions.output : { ...(rollupOptions.output ?? {}), manualChunks: vendorChunk };
// Still locked (the site's own code over 1 MB, or a slow scan): build again, and the last time without minifying.
// Vite then skips esbuild on the output (target "esnext", minify off), so there's no temp file to lock; the
// scripts are larger, the site the same.
const locked = (e) => /Access is denied|EPERM|EBUSY|resource busy or locked/i.test(String(e?.message ?? e));
for (let attempt = 1; ; attempt++) {
  const plain = attempt === 3;
  try {
    await vite.build({
      ...config,
      configFile: false,
      root: appDir,
      base: "./",
      plugins,
      logLevel: "warn",
      build: {
        ...(config.build ?? {}),
        outDir,
        emptyOutDir: true,
        reportCompressedSize: false,
        rollupOptions: { ...rollupOptions, output },
        ...(plain ? { minify: false, target: "esnext" } : {}),
      },
    });
    if (plain) console.warn("··  Built without minifying the scripts: it works the same, the files are larger.");
    break;
  } catch (e) {
    if (!locked(e) || plain) throw e;
    console.warn(`\n··  A temporary file was locked (Windows Defender scanning it?). Building again${attempt === 2 ? ", without minifying" : ""}…`);
    await new Promise((r) => setTimeout(r, 2000));
  }
}

// Vite leaves a url() in the CSS it couldn't find as written, so it 404s in the preview (fonts the builder never
// shipped). The audit should have caught it; this catches whatever it didn't.
const unresolved = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith(".css")) {
      for (const m of readFileSync(p, "utf8").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
        const spec = m[1].trim();
        // not a file: data, another server, the page's own root, or an SVG reference like url(#n) / url(%23n)
        if (/^(data:|https?:|\/\/|#|%23|\/)/i.test(spec)) continue;
        if (!existsSync(path.resolve(path.dirname(p), decodeURIComponent(spec.split(/[?#]/)[0])))) unresolved.push(`${path.relative(outDir, p).replace(/\\/g, "/")}: ${spec}`);
      }
    }
  }
})(outDir);
// A missing font only costs the typeface (the browser falls back to the next font in the stack): a warning.
// Anything else (a background picture) is a hole in the page: no publish.
const lostFonts = [...new Set(unresolved.filter((u) => /\.(woff2?|ttf|otf)$/i.test(u.split(/[?#]/)[0])))];
const lostFiles = [...new Set(unresolved.filter((u) => !lostFonts.includes(u)))];
if (lostFonts.length) console.warn(`\n!!  Fonts missing from the build, the site shows its fallback font there (the audit above says why):\n   ${lostFonts.join("\n   ")}`);
if (lostFiles.length && !placeholders) {
  fail(`The built site links files that aren't in it, so they'd 404 in the preview:\n   ${lostFiles.join("\n   ")}\n   Add them to the site in ../Pitches/${client}/app.`);
}
}

// ─── the page: never indexed ───
const indexFile = path.join(outDir, "index.html");
let html = readFileSync(indexFile, "utf8");
if (!/name="robots"/.test(html)) html = html.replace(/<head>/i, `<head>\n    <meta name="robots" content="noindex, nofollow" />`);
writeFileSync(indexFile, html);
const pageTitle = (html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? client).trim();

// ─── the card: the site's first screen, for the link's preview in a messenger ───
// /works/<id> tells Telegram, WhatsApp and the like to show this picture under the client's name
// (app/works/[id]/page.tsx). It lives in public/cards/, not beside the site: robots.txt shuts /previews/ to bots,
// and TelegramBot obeys robots.txt for the picture too.
const cardFile = path.join(root, "public", "cards", `${id}.jpg`);
let carded = false;
try {
  await shootCard(outDir, cardFile);
  carded = true;
} catch (e) {
  console.warn(`\n!!  No link card: ${e.message}. The link will unfurl with the portfolio's own picture.`);
}

// ─── a new name: the old link goes ───
if (oldId) {
  rmSync(path.join(root, "public", "previews", oldId), { recursive: true, force: true });
  rmSync(path.join(root, "public", "cards", `${oldId}.jpg`), { force: true });
}

// ─── the register ───
const today = new Date().toISOString().slice(0, 10);
if (work) {
  work.id = id;
  work.updated = today;
} else {
  work = { id, client, title: { ru: pageTitle, en: pageTitle }, published: today, updated: today };
  works.push(work);
}
if (placeholders) work.placeholders = true;
else delete work.placeholders;

// The client's own file, ../Pitches/<client>/work.json, holds what the preview says about this work:
// its title, its pricing, the intro (the first screen's line to the client) and the story (why this client needs
// this site). It replaces those four here.
let told = "no work.json yet: the title is the page's, there is no story";
if (own) {
  const problems = [];
  if (own.title && !(own.title.ru && own.title.en)) problems.push('"title" needs both "ru" and "en"');
  if (own.story) {
    const s = own.story;
    if (!s.title || !Array.isArray(s.lead) || !s.lead.length) problems.push('"story" needs a "title" and a "lead" (a list of paragraphs)');
    if (!Array.isArray(s.chapters) || !s.chapters.length) problems.push('"story" needs "chapters"');
    for (const [i, c] of (s.chapters ?? []).entries()) {
      if (!c.title || !Array.isArray(c.text) || !c.text.length) problems.push(`story chapter ${i + 1} needs a "title" and "text" (a list of paragraphs)`);
    }
    // A first note to someone who hasn't asked for anything is short: a long, detailed story reads as a
    // machine's sales pitch (Pitches/AGENTS.md, step 7). --full is for a client already talking to Ivan.
    if (!full && !problems.length) {
      const words = [s.title, ...s.lead, ...s.chapters.flatMap((c) => [c.title, ...c.text]), s.closing?.title ?? "", ...(s.closing?.text ?? [])]
        .join(" ")
        .split(/\s+/)
        .filter(Boolean).length;
      if (words > 150) problems.push(`the story is ${words} words: keep it under 120 (150 at most)`);
      if (s.chapters.length > 3) problems.push(`the story has ${s.chapters.length} chapters: keep two or three`);
      if (s.sources?.length || s.chapters.some((c) => c.seen)) problems.push('drop "seen" and "sources": the short story shows no statistics');
      if (problems.length) problems.push("(the full version is published with --full, only when Ivan asks for it)");
    }
  }
  // The intro is one large line on an otherwise empty screen: a sentence, not a paragraph.
  if (own.intro) {
    if (typeof own.intro.text !== "string" || !own.intro.text.trim()) problems.push('"intro" needs a "text" (one sentence to the client)');
    else if (own.intro.text.length > 100) problems.push(`the intro is ${own.intro.text.length} characters: keep it under 80 (100 at most)`);
  }
  if (problems.length) fail(`${client}/work.json: ${problems.join("; ")}`);
  for (const key of ["title", "pricing", "intro", "story"]) {
    if (own[key]) work[key] = own[key];
    else if (key !== "title") delete work[key];
  }
  told = `from ${client}/work.json: title${own.pricing ? ", pricing" : ""}${own.intro ? ", intro" : ", no intro"}${own.story ? `, story (${own.story.chapters.length} chapters)` : ", no story"}`;
}
writeFileSync(worksFile, JSON.stringify(works, null, 2) + "\n");

// ─── report ───
const sizeOf = (dir) =>
  readdirSync(dir).reduce((sum, f) => {
    const p = path.join(dir, f);
    return sum + (statSync(p).isDirectory() ? sizeOf(p) : statSync(p).size);
  }, 0);
const mb = (sizeOf(outDir) / 1024 / 1024).toFixed(2);
console.log(`\nok  ${client}: ${mb} MB in public/previews/${id}/`);
console.log(`    preview: /works/${id}/   (all previews: /works/)`);
console.log(`    ${told}`);
console.log(carded ? `    link card: public/cards/${id}.jpg` : "    no link card");
if (oldId) console.log(`    renamed from /works/${oldId}/: that link no longer opens`);
if (placeholders) console.log("\n!!  Built with stand-in pictures for missing images. Don't publish this: add the images and run it again.");

/*
 * A 1200x630 JPEG of the built site's first screen, the size Telegram, WhatsApp and VK show large. Shot at
 * 1280x672 (a laptop's width, the same shape) at twice the pixels, then scaled down so the text stays sharp.
 * Uses puppeteer-core and sharp from ../Pitches (tools/shoot.mjs uses them too) and the installed Chrome or
 * Edge (or CHROME_PATH).
 */
async function shootCard(siteDir, file) {
  const chrome = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((p) => p && existsSync(p));
  if (!chrome) throw new Error("no Chrome or Edge found (set CHROME_PATH)");
  const { default: puppeteer } = await import(pathToFileURL(require.resolve("puppeteer-core")).href);
  const { default: sharp } = await import(pathToFileURL(require.resolve("sharp")).href);

  // the site's modules don't load from file://: a tiny server for the built folder
  const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".mp4": "video/mp4" };
  const server = http.createServer((req, res) => {
    let p = path.join(siteDir, decodeURIComponent(req.url.split("?")[0]));
    if (existsSync(p) && statSync(p).isDirectory()) p = path.join(p, "index.html");
    if (!p.startsWith(siteDir) || !existsSync(p)) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { "Content-Type": types[path.extname(p)] ?? "application/octet-stream" });
    createReadStream(p).pipe(res);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 672, deviceScaleFactor: 2 });
    await page.goto(`http://127.0.0.1:${server.address().port}/index.html`, { waitUntil: "networkidle0", timeout: 60_000 });
    await page.evaluate(() => document.fonts.ready);
    // let the first screen's entrance animations finish
    await new Promise((r) => setTimeout(r, 2500));
    const png = await page.screenshot({ type: "png" });
    mkdirSync(path.dirname(file), { recursive: true });
    await sharp(png).resize(1200, 630).jpeg({ quality: 84, mozjpeg: true }).toFile(file);
  } finally {
    await browser.close();
    server.close();
  }
}
