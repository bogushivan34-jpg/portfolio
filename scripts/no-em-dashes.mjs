#!/usr/bin/env node
/*
 * Em dashes (—) become hyphens (-) in what a preview says to the client: the title, the intro (the line on the first
 * screen) and the story (the notes in the corner). Ivan wants hyphens there, not em dashes (26 November 2026).
 * Story anchors and sources are left alone, and so is everything else: the prompts in ../Clients, the agents'
 * instructions, campaign.md.
 *
 *   node scripts/no-em-dashes.mjs                 every ../Pitches/<client>/work.json, and data/works.json
 *   node scripts/no-em-dashes.mjs <client> ...    those clients' work.json, and their entries in data/works.json
 *   node scripts/no-em-dashes.mjs --check         only list what would change; exits 1 if anything would
 *
 * scripts/add-work.mjs runs it on the client's work.json before publishing, so a published story never has one.
 *
 * "слово — слово" → "слово - слово" (the spaces stay as they were, a non-breaking one too), "слово—слово" →
 * "слово - слово" (a bare hyphen would join the words into one), "10—20" → "10-20", "— Да" → "- Да".
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EM = "—";

export function hyphenate(text) {
  return text.replace(/([\s ]*)—([\s ]*)/g, (match, before, after, at, all) => {
    const prev = all[at - 1];
    const next = all[at + match.length];
    if (prev === undefined || next === undefined) return before + "-" + after; // at the start or end of the text
    if (!before && !after && /\d/.test(prev) && /\d/.test(next)) return "-"; // a range: 10—20
    return (before || " ") + "-" + (after || " ");
  });
}

// The fields that are read by the client. Returns what changed: [{ where, before, after }].
const NOTES = ["title", "intro", "story"];
const SKIP = new Set(["anchor", "sources"]);
export function fixNotes(work, label = "") {
  const changes = [];
  const walk = (value, where) => {
    if (typeof value === "string") {
      if (!value.includes(EM)) return value;
      const after = hyphenate(value);
      changes.push({ where, before: value, after });
      return after;
    }
    if (Array.isArray(value)) return value.map((v, i) => walk(v, `${where}[${i}]`));
    if (value && typeof value === "object") {
      for (const key of Object.keys(value)) if (!SKIP.has(key)) value[key] = walk(value[key], `${where}.${key}`);
    }
    return value;
  };
  for (const key of NOTES) if (work && work[key] !== undefined) work[key] = walk(work[key], `${label}${key}`);
  return changes;
}

// Fixes one JSON file in place (a work.json, or data/works.json with a list of works). Writes only if something
// changed, in the format both are kept in (two spaces, a newline at the end).
export function fixFile(file, { check = false, clients } = {}) {
  const data = JSON.parse(readFileSync(file, "utf8"));
  const changes = Array.isArray(data)
    ? data.filter((w) => !clients || clients.includes(w.client)).flatMap((w) => fixNotes(w, `${w.id}: `))
    : fixNotes(data);
  if (changes.length && !check) writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  return changes;
}

// ─── run from the command line ───
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const pitches = path.resolve(root, "..", "Pitches");
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const named = args.filter((a) => !a.startsWith("--"));
  const clients = named.length ? named : readdirSync(pitches).filter((d) => existsSync(path.join(pitches, d, "work.json")));

  const files = clients.map((c) => [path.join(pitches, c, "work.json"), `${c}/work.json`]);
  for (const [file, name] of files) if (!existsSync(file)) {
    console.error(`!! No ${name} in ../Pitches`);
    process.exit(1);
  }
  files.push([path.join(root, "data", "works.json"), "data/works.json"]);

  let total = 0;
  for (const [file, name] of files) {
    const changes = fixFile(file, { check, clients: named.length ? named : undefined });
    total += changes.length;
    if (!changes.length) continue;
    console.log(`\n${name}: ${changes.length} ${check ? "to change" : "changed"}`);
    for (const c of changes) console.log(`  ${c.where}\n    ${c.before}\n  → ${c.after}`);
  }
  console.log(total ? `\n${check ? "Would change" : "Changed"} ${total} line${total === 1 ? "" : "s"}.` : "No em dashes in the notes.");
  if (check && total) process.exit(1);
}
