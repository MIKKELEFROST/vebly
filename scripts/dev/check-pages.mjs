// Goes through every page on desktop (1440×900), phone (iPhone 13) and with reduced motion, and reports
// JS errors, console errors, failed requests, horizontal overflow and menu links (#…) without a target.
// With --click it also presses every button and input in each page's showcase (#eksempel) on desktop and
// phone and saves a screenshot of it.
//
//   node scripts/dev/server.mjs 8790 &                       (or any server with the built site)
//   node scripts/dev/check-pages.mjs [--click] [--base http://127.0.0.1:8790] [--out /tmp/webleads-check]
//
// Needs Playwright with Chromium (preinstalled in the cloud sessions). Google Fonts are fetched once and
// served from memory, /api/ is answered with 204, and the cookie box is hidden.
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { services } from '../services/data.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://127.0.0.1:8790'), OUT = arg('--out', join(tmpdir(), 'webleads-check')), CLICK = process.argv.includes('--click');
mkdirSync(OUT, { recursive: true });
const pw = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));
const { chromium, devices } = pw.default || pw;

const PAGES = ['/', '/resultater', ...services.map(s => '/services/' + s.slug)];
const fonts = new Map();
const b = await chromium.launch(), rep = [];
let bad = 0;
for (const mode of ['desktop', 'phone', 'reduce']) {
  const ctx = await b.newContext(mode === 'phone' ? { ...devices['iPhone 13'], deviceScaleFactor: 1 } : { viewport: { width: 1440, height: 900 }, reducedMotion: mode === 'reduce' ? 'reduce' : 'no-preference' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, async r => {
    const u = r.request().url();
    try { if (!fonts.has(u)) fonts.set(u, execFileSync('curl', ['-sSL', '-A', 'Mozilla/5.0 Chrome/120', u])); r.fulfill({ body: fonts.get(u), contentType: u.includes('gstatic') ? 'font/woff2' : 'text/css' }); }
    catch { r.fulfill({ status: 204, body: '' }); }
  });
  await ctx.route(/\/api\//, r => r.fulfill({ status: 204, body: '' }));
  for (const path of PAGES) {
    const p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push('JS ' + e.message.slice(0, 120)));
    p.on('console', m => { if (m.type() === 'error' && !/fonts|favicon/.test(m.text())) errs.push('console ' + m.text().slice(0, 120)); });
    p.on('requestfailed', r => { if (!/\/api\/|fonts\./.test(r.url())) errs.push('failed ' + r.url()); });
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: '.cc{display:none!important}' });
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 700) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(120); }
    const missing = await p.evaluate(() => [...document.querySelectorAll('header a[href^="#"], nav a[href^="#"]')].map(a => a.getAttribute('href')).filter(h => h.length > 1 && !document.querySelector(h)));
    if (missing.length) errs.push('anchors ' + missing.join(','));
    let note = '';
    if (CLICK && mode !== 'reduce' && await p.$('#eksempel')) {
      const sec = p.locator('#eksempel'); await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(3000);
      await sec.screenshot({ path: join(OUT, `${mode}-${path.split('/').pop() || 'forside'}.png`) });
      let n = 0;
      for (const el of await p.$$('#eksempel button:not([disabled]), #eksempel [role=tab], #eksempel input')) {
        try { if (!(await el.isVisible())) continue; await el.scrollIntoViewIfNeeded({ timeout: 3000 }); await el.click({ timeout: 1500, force: true }); n++; await p.waitForTimeout(200); } catch { /* the element moved or was replaced by the previous click */ }
      }
      note = ` (${n} klik)`;
    }
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (ov > 1) errs.push('overflow ' + ov + 'px');
    if (errs.length) bad++;
    rep.push(`${mode.padEnd(7)} ${path.padEnd(32)} ${errs.length ? errs.join(' | ') : 'ok'}${note}`);
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(rep.join('\n'));
if (CLICK) console.log('\nScreenshots: ' + OUT);
process.exit(bad ? 1 : 0);
