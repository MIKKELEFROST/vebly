// Renders the Instagram highlight covers (1080 × 1920, orange with a white icon) and a preview row.
// Usage: node scripts/social/render-highlights.mjs
// Output: brand/social/highlights/hl-<name>.png and highlights-preview.png
// To add a highlight: add an icon (64 × 64 viewBox, white stroke) and a label below.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const out = resolve(import.meta.dirname, '../../brand/social/highlights');
const S = 'fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"';
const highlights = [
  ['saadan', 'Sådan', `<g ${S}><path d="M10 32h40"/><path d="M38 20l12 12-12 12"/></g>`],
  ['pris', 'Pris', '<text x="32" y="42" text-anchor="middle" font-family="Bricolage Grotesque" font-weight="800" font-size="30" letter-spacing="-1.4" fill="#fff">kr.</text>'],
  ['foer-efter', 'Før/efter', `<g ${S}><path d="M12 22h36"/><path d="M40 14l8 8-8 8"/><path d="M52 42H16"/><path d="M24 34l-8 8 8 8"/></g>`],
  ['tilvalg', 'Tilvalg', `<g ${S}><path d="M32 12v40M12 32h40"/></g>`],
  ['content', 'Content', `<g ${S}><path d="M10 24a6 6 0 0 1 6-6h6l4-6h12l4 6h6a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H16a6 6 0 0 1-6-6z"/><circle cx="32" cy="34" r="8"/></g>`],
  ['teamet', 'Teamet', `<g ${S}><circle cx="32" cy="22" r="9"/><path d="M14 52c2-10 9-15 18-15s16 5 18 15"/></g>`],
  ['kontakt', 'Kontakt', `<g ${S}><rect x="10" y="16" width="44" height="32" rx="6"/><path d="M12 20l20 15 20-15"/></g>`]
];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.route(/fonts\.(googleapis|gstatic)\.com/, async r => r.fulfill({
  body: execFileSync('curl', ['-sSL', '-A', 'Mozilla/5.0 Chrome/120', r.request().url()]),
  contentType: r.request().url().includes('gstatic') ? 'font/woff2' : 'text/css'
}));
const font = '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=swap" rel="stylesheet">';
for (const [name, , icon] of highlights) {
  await p.setContent(`<!doctype html><html><head><meta charset="utf-8">${font}<style>*{margin:0}body{width:1080px;height:1920px;background:#e0552b;display:flex;align-items:center;justify-content:center}</style></head><body><svg viewBox="0 0 64 64" width="400" height="400">${icon}</svg></body></html>`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.screenshot({ path: `${out}/hl-${name}.png` });
}

// Preview: the covers as they look as round highlights on the profile
await p.setViewportSize({ width: 1180, height: 260 });
await p.setContent(`<body style="margin:0;background:#fff;display:flex;gap:36px;justify-content:center;align-items:center;height:260px;font:500 22px sans-serif">${highlights.map(([name, label]) => `<div style="text-align:center"><div style="width:130px;height:130px;border-radius:50%;padding:5px;border:2px solid #ddd;box-sizing:border-box"><img src="data:image/png;base64,${readFileSync(`${out}/hl-${name}.png`).toString('base64')}" style="width:116px;height:116px;border-radius:50%;object-fit:cover"></div><div style="margin-top:12px">${label}</div></div>`).join('')}</body>`);
await p.waitForTimeout(400);
await p.screenshot({ path: `${out}/highlights-preview.png` });
await b.close();
console.log('ok', highlights.length, 'covers');
