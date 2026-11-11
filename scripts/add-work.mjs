#!/usr/bin/env node
/*
 * Publishes a client site concept as a preview on the portfolio: ivanbogush.ru/works/<id>.
 *
 *   node scripts/add-work.mjs <client>                 e.g. disoley.ru  (the folder in ../peoplebrands)
 *   node scripts/add-work.mjs <client> --id k7m2qx     pick the id yourself
 *   node scripts/add-work.mjs <client> --placeholders  stand-in pictures for missing images (local testing only)
 *
 * It builds ../peoplebrands/<client>/app with that site's own Vite config, except as normal files instead of one
 * inlined HTML (vite-plugin-singlefile is left out): pictures stay separate files, so git keeps each one once however
 * often the site is republished. The build goes to public/previews/<id>/, marked noindex, and the work is added to
 * data/works.json (or its date updated). Run it again after changing the site: the id stays the same.
 *
 * The work's title, pricing and story (why this client needs this site) are read from the client's own file,
 * ../peoplebrands/<client>/work.json, on every run: edit them there, not in data/works.json.
 *
 * The client sites share one node_modules in ../peoplebrands (npm workspaces): `npm install` there once.
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomInt } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worksFile = path.join(root, "data", "works.json");

const args = process.argv.slice(2);
const client = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--id");
const wantedId = args.includes("--id") ? args[args.indexOf("--id") + 1] : undefined;
const placeholders = args.includes("--placeholders");
const fail = (msg) => {
  console.error(`\n!! ${msg}`);
  process.exit(1);
};

if (!client) fail("Which client? node scripts/add-work.mjs <folder in ../peoplebrands>");
const appDir = path.resolve(root, "..", "peoplebrands", client, "app");
if (!existsSync(path.join(appDir, "package.json"))) fail(`No site at ${appDir}`);

// ─── the audit: nothing missing, nothing misconfigured (peoplebrands/tools/check.mjs, AGENTS.md) ───
const checker = path.resolve(root, "..", "peoplebrands", "tools", "check.mjs");
if (existsSync(checker)) {
  const audit = spawnSync(process.execPath, [checker, client], { stdio: "inherit" });
  if (audit.status !== 0 && !placeholders) {
    fail(`The audit above found missing assets or setup problems. Fix them first (peoplebrands/AGENTS.md), or publish a draft with --placeholders.`);
  }
}

// ─── the id ───
const works = existsSync(worksFile) ? JSON.parse(readFileSync(worksFile, "utf8")) : [];
let work = works.find((w) => w.client === client);
// 31 letters and digits that can't be misread (no 0/o, 1/l/i): 6 of them make about 887 million ids
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const newId = () => Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
let id = wantedId ?? work?.id ?? newId();
while (!work && !wantedId && works.some((w) => w.id === id)) id = newId();
if (!/^[a-z0-9]{4,16}$/.test(id)) fail(`An id is 4–16 lowercase letters and digits, not "${id}"`);
if (works.some((w) => w.id === id && w.client !== client)) fail(`The id ${id} already belongs to ${works.find((w) => w.id === id).client}`);

// ─── the build ───
const require = createRequire(path.join(appDir, "package.json"));
let vitePath;
try {
  vitePath = require.resolve("vite");
} catch {
  fail(`Vite isn't installed for ${client}: run npm install in ../peoplebrands`);
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

const outDir = path.join(root, "public", "previews", id);
console.log(`Building ${client} → public/previews/${id}/ …`);
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
  },
});

// ─── the page: never indexed ───
const indexFile = path.join(outDir, "index.html");
let html = readFileSync(indexFile, "utf8");
if (!/name="robots"/.test(html)) html = html.replace(/<head>/i, `<head>\n    <meta name="robots" content="noindex, nofollow" />`);
writeFileSync(indexFile, html);
const pageTitle = (html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? client).trim();

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

// The client's own file, ../peoplebrands/<client>/work.json, holds what the preview says about this work:
// its title, its pricing and the story (why this client needs this site). It replaces those three here.
const about = path.resolve(appDir, "..", "work.json");
let told = "no work.json yet: the title is the page's, there is no story";
if (existsSync(about)) {
  let own;
  try {
    own = JSON.parse(readFileSync(about, "utf8"));
  } catch (e) {
    fail(`${client}/work.json isn't valid JSON: ${e.message}`);
  }
  const problems = [];
  if (own.title && !(own.title.ru && own.title.en)) problems.push('"title" needs both "ru" and "en"');
  if (own.story) {
    const s = own.story;
    if (!s.title || !Array.isArray(s.lead) || !s.lead.length) problems.push('"story" needs a "title" and a "lead" (a list of paragraphs)');
    if (!Array.isArray(s.chapters) || !s.chapters.length) problems.push('"story" needs "chapters"');
    for (const [i, c] of (s.chapters ?? []).entries()) {
      if (!c.title || !Array.isArray(c.text) || !c.text.length) problems.push(`story chapter ${i + 1} needs a "title" and "text" (a list of paragraphs)`);
    }
  }
  if (problems.length) fail(`${client}/work.json: ${problems.join("; ")}`);
  for (const key of ["title", "pricing", "story"]) {
    if (own[key]) work[key] = own[key];
    else if (key !== "title") delete work[key];
  }
  told = `from ${client}/work.json: title${own.pricing ? ", pricing" : ""}${own.story ? `, story (${own.story.chapters.length} chapters)` : ", no story"}`;
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
console.log(`    preview: /works/${id}`);
console.log(`    ${told}`);
if (placeholders) console.log("\n!!  Built with stand-in pictures for missing images. Don't publish this: add the images and run it again.");
