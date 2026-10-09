// Renders a carousel (several 1080 × 1350 slides in one HTML file, each a `.p`) to JPG.
// Instagram only accepts JPG in carousels, so slides are JPG; the first slide is also saved as PNG
// in brand/social/posts/ so it shows in the grid preview like the other posts.
// Usage: node scripts/social/render-karrusel.mjs scripts/social/opslag/17-navn.html
// Output: brand/social/karruseller/17-navn/01.jpg, 02.jpg … and brand/social/posts/17-navn.png
// Exits with code 1 if a slide overflows its frame.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const src = resolve(process.argv[2] || '');
const name = basename(src, '.html');
const dir = `${root}/brand/social/karruseller/${name}`;
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
await p.route(/fonts\.(googleapis|gstatic)\.com/, async r => r.fulfill({
  body: execFileSync('curl', ['-sSL', '-A', 'Mozilla/5.0 Chrome/120', r.request().url()]),
  contentType: r.request().url().includes('gstatic') ? 'font/woff2' : 'text/css'
}));
await p.goto('file://' + src, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);

const slides = p.locator('.p');
const n = await slides.count();
let failed = false;
for (let i = 0; i < n; i++) {
  const s = slides.nth(i);
  const over = await s.evaluate(el => el.scrollHeight > el.clientHeight);
  const file = `${dir}/${String(i + 1).padStart(2, '0')}.jpg`;
  await s.screenshot({ path: file, type: 'jpeg', quality: 92 });
  if (i === 0) await s.screenshot({ path: `${root}/brand/social/posts/${name}.png` });
  console.log(basename(file), over ? 'OVERFLOW' : 'ok');
  if (over) failed = true;
}
await b.close();
if (n < 2 || n > 10) { console.error(`Instagram kræver 2–10 slides, fandt ${n}`); failed = true; }
process.exit(failed ? 1 : 0);
