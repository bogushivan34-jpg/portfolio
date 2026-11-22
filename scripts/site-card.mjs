/*
 * Draws the main page's link card, public/images/site_card.jpg: the 1200x630 picture ivanbogush.ru and /services
 * unfurl with in Telegram, WhatsApp and VK (og:image, lib/cards.ts). Run it again when the headline or the photo changes:
 *
 *     node scripts/site-card.mjs
 *
 * The words come from data/content.ts by hand, below. Uses puppeteer-core and sharp from ../Pitches, as add-work.mjs
 * does, and the installed Chrome or Edge (or CHROME_PATH).
 */
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(root, "..", "Pitches", "package.json"));
const out = path.join(root, "public", "images", "site_card.jpg");

const dataUrl = (file, type) => `data:${type};base64,${readFileSync(path.join(root, file)).toString("base64")}`;
const inter = (part) => dataUrl(`node_modules/@fontsource-variable/inter/files/inter-${part}-wght-normal.woff2`, "font/woff2");

// the site's own colours (tailwind.config) and type
const html = `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: Inter; font-weight: 100 900; src: url(${inter("cyrillic")}) format("woff2");
    unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116; }
  @font-face { font-family: Inter; font-weight: 100 900; src: url(${inter("latin")}) format("woff2"); }
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #f6f5f1; font-family: Inter, sans-serif; color: #15171a;
    display: grid; grid-template-columns: 1fr 360px; gap: 64px; padding: 64px 72px; }
  .text { display: flex; flex-direction: column; }
  .eyebrow { font-size: 21px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #1d5a43; }
  h1 { margin-top: 26px; font-size: 54px; line-height: 1.12; font-weight: 650; letter-spacing: -0.025em; }
  .proof { margin-top: 34px; font-size: 24px; line-height: 1.4; color: #676d76; }
  .proof b { color: #1d5a43; font-weight: 650; }
  .who { margin-top: auto; display: flex; align-items: baseline; gap: 18px; font-size: 26px; }
  .who b { font-weight: 650; }
  .who span { color: #676d76; }
  .photo { border-radius: 20px; background: url(${dataUrl("public/images/ivan_bogush.jpg", "image/jpeg")}) center 22% / cover;
    border: 1px solid #e3e1dc; }
</style>
<div class="text">
  <p class="eyebrow">Сайты · контент · привлечение клиентов</p>
  <h1>Помогаю небольшим проектам находить клиентов — и&nbsp;считаю, что сработало</h1>
  <p class="proof"><b>100+</b> платящих подписчиков у&nbsp;Trouvère<br>без&nbsp;платной рекламы</p>
  <p class="who"><b>Иван Богуш</b><span>ivanbogush.ru</span></p>
</div>
<div class="photo"></div>`;

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

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ["--hide-scrollbars"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await sharp(png).resize(1200, 630).jpeg({ quality: 86, mozjpeg: true }).toFile(out);
  console.log(`link card: ${path.relative(root, out)}`);
} finally {
  await browser.close();
}
