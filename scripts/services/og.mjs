// Share images (1200 × 630) for the front page and each service page, in the style of assets/og.png.
//   node scripts/services/og.mjs          → assets/og/forside.png and assets/og/<slug>.png
//   node scripts/services/og.mjs <slug>   → only that one
// Needs Playwright with Chromium. Fonts come from Google Fonts.
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { services, pages, front } from './data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'assets', 'og');
mkdirSync(OUT, { recursive: true });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ICON = (size, stroke = 6) => `<svg viewBox="0 0 64 64" width="${size}" height="${size}"><g fill="none" stroke="#fff" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"><polyline points="12,24 20.5,45 31,29 41.5,45 51,18"/><polyline points="42.2,24.4 51,18 53.5,28.6"/></g></svg>`;

const html = ({ kicker, black, orange, pills }) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=DM+Sans:wght@500;700&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: #fbfaf8; color: #111; font-family: 'DM Sans', sans-serif; }
  .big { position: absolute; left: 870px; top: -90px; width: 420px; height: 420px; border-radius: 64px; background: #e0552b; display: flex; align-items: center; justify-content: center; }
  .big svg { margin: 70px 0 0 -40px; }
  .logo { position: absolute; left: 72px; top: 64px; display: flex; align-items: center; gap: 14px; font-family: 'Bricolage Grotesque'; font-weight: 800; font-size: 40px; letter-spacing: -0.045em; }
  .logo i { width: 46px; height: 46px; border-radius: 12px; background: #e0552b; display: flex; align-items: center; justify-content: center; }
  .logo b { color: #e0552b; }
  .kicker { position: absolute; left: 74px; top: 150px; font-weight: 700; font-size: 20px; letter-spacing: 0.08em; text-transform: uppercase; color: #e0552b; }
  .h { position: absolute; left: 70px; top: 186px; width: 780px; font-family: 'Bricolage Grotesque'; font-weight: 800; letter-spacing: -0.045em; line-height: 0.98; }
  .h div { white-space: nowrap; }
  .h .o { color: #e0552b; }
  .pills { position: absolute; left: 72px; bottom: 64px; display: flex; gap: 12px; }
  .pills span { display: flex; align-items: center; gap: 10px; padding: 16px 26px; border-radius: 999px; background: #fff; border: 1px solid #ecebe7; font-weight: 700; font-size: 24px; white-space: nowrap; }
  .pills span::before { content: '✓'; color: #e0552b; font-weight: 700; }
</style></head><body>
  <div class="big">${ICON(380, 6)}</div>
  <div class="logo"><i>${ICON(38, 7)}</i><span>webleads<b>.</b></span></div>
  ${kicker ? `<div class="kicker">${esc(kicker)}</div>` : ''}
  <div class="h" data-h>${black.map(l => `<div>${esc(l)}</div>`).join('')}<div class="o">${esc(orange)}</div></div>
  <div class="pills" data-pills>${pills.map(p => `<span>${esc(p)}</span>`).join('')}</div>
</body></html>`;

// Headline lines: line one of the h1 in black, then the price (or line two of the h1) in orange
const line1 = h => [...h.a, h.hot].join(' ');
const line2 = h => `${h.dim} ${h.mark}`;
const jobs = [
  { file: 'forside', kicker: '', black: [line1(front.h1)], orange: line2(front.h1), pills: ['Hjemmesider', 'Annoncer', 'SEO og AI'] },
  // /services/hjemmesider (and assets/og.png, the default for /bestil and /privatliv)
  { file: 'hjemmesider', also: '../og.png', kicker: '', black: ['Hjemmesider', 'til servicefag.'], orange: 'Fra 2.995 kr.', pills: ['Alt det vigtige er med', 'Tre pakker', 'Ingen binding'] },
  ...pages.map(p => {
    const s = services.find(x => x.slug === p.slug);
    const price = p.price ? `${p.price.pre} ${p.price.amount} ${p.price.post}`.trim().replace(/^./, c => c.toUpperCase()) : null;
    return { file: p.slug, kicker: p.name, black: price ? [line1(p.h1), line2(p.h1)] : [line1(p.h1)], orange: price || line2(p.h1), pills: s.ex };
  })
];

const { chromium } = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
// Behind a proxy (cloud sessions) the browser cannot fetch Google Fonts itself: curl fetches them
if (process.env.HTTPS_PROXY) await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({
  body: execFileSync('curl', ['-sSL', '-A', 'Mozilla/5.0 Chrome/120', r.request().url()]),
  contentType: r.request().url().includes('gstatic') ? 'font/woff2' : 'text/css'
}));
const only = process.argv[2];  // node scripts/services/og.mjs <slug> makes just that one
for (const j of jobs) {
  if (only && j.file !== only) continue;
  await page.setContent(html(j), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Largest headline that fits beside the big icon and above the pills; pills shrink to one row
  await page.evaluate(() => {
    const h = document.querySelector('[data-h]'), pills = document.querySelector('[data-pills]');
    const room = 630 - 64 - pills.offsetHeight - 36 - h.offsetTop;
    for (let fs = 112; fs >= 56; fs -= 2) {
      h.style.fontSize = fs + 'px';
      const wide = Math.max(...[...h.children].map(c => c.scrollWidth));
      if (wide <= 740 && h.offsetHeight <= room) break;
    }
    for (let fs = 24; fs >= 16 && pills.scrollWidth > 1060; fs--) pills.querySelectorAll('span').forEach(s => { s.style.fontSize = fs + 'px'; s.style.padding = `${fs * 0.66}px ${fs * 1.05}px`; });
  });
  await page.screenshot({ path: join(OUT, `${j.file}.png`) });
  console.log('skrev assets/og/' + j.file + '.png');
  if (j.also) { await page.screenshot({ path: join(OUT, j.also) }); console.log('skrev assets/og/' + j.also); }
}
await b.close();
