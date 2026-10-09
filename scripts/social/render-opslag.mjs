// Renders feed posts (1080 × 1350) from HTML templates to PNG and rebuilds the grid preview.
// Usage: node scripts/social/render-opslag.mjs scripts/social/opslag/13-noget.html [flere.html …]
// Output: brand/social/posts/<same name>.png and brand/social/posts/grid-preview.png (12 newest).
// Exits with code 1 if a post overflows its frame, so the text must be shortened.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const out = `${root}/brand/social/posts`;
const files = process.argv.slice(2).map(f => resolve(f));
if (!files.length) { console.error('Angiv mindst én HTML-fil'); process.exit(2); }

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
// Google Fonts is fetched with curl, because the browser can't reach it through the proxy
await p.route(/fonts\.(googleapis|gstatic)\.com/, async r => r.fulfill({
  body: execFileSync('curl', ['-sSL', '-A', 'Mozilla/5.0 Chrome/120', r.request().url()]),
  contentType: r.request().url().includes('gstatic') ? 'font/woff2' : 'text/css'
}));

let failed = false;
for (const f of files) {
  await p.goto('file://' + f, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const over = await p.evaluate(() => { const el = document.querySelector('.p'); return el.scrollHeight > el.clientHeight; });
  await p.screenshot({ path: `${out}/${basename(f, '.html')}.png` });
  console.log(basename(f), over ? 'OVERFLOW' : 'ok');
  if (over) failed = true;
}

// Grid preview: newest post top left, like on the profile
const pngs = readdirSync(out).filter(f => /^\d\d+-.*\.png$/.test(f)).sort((a, z) => parseInt(z) - parseInt(a)).slice(0, 12);
await p.setViewportSize({ width: 1080, height: Math.ceil(pngs.length / 3) * 480 });
const imgs = pngs.map(f => `<img src="data:image/png;base64,${readFileSync(`${out}/${f}`).toString('base64')}" style="width:357px;height:476px;object-fit:cover">`).join('');
await p.setContent(`<body style="margin:0;background:#fff;display:grid;grid-template-columns:repeat(3,357px);gap:4px">${imgs}</body>`);
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/grid-preview.png` });
await b.close();
process.exit(failed ? 1 : 0);
