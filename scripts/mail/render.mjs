// Renders the images for the e-mail signatures to brand/mail/ (served from https://webleads.dk/brand/mail/):
//   webleads-logo.gif   the full logo, animated. The first frame is the finished logo, so Outlook,
//                       which only shows the first frame, still shows the whole logo
//   webleads-logo.png   the same logo without animation
//   ikon-*.png          small icons for the review and channel badges (shown at 14 × 14)
// The images are drawn at 2× and 3× so they are sharp on retina screens. Needs ffmpeg.
// Usage: node scripts/mail/render.mjs
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const out = `${root}/brand/mail`;
mkdirSync(out, { recursive: true });

const FPS = 25, SECONDS = 5.6;

// The logo as in brand/logo.html. Every letter is its own box, so the letters can move one at a time
const LOGO = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&display=swap" rel="stylesheet">
<style>
  html, body { margin: 0; background: #fff; }
  .box { display: inline-block; padding: 10px 6px 5px 3px; background: #fff; }
  .wl { display: inline-flex; align-items: center; gap: .32em; font: 800 26px/1 'Bricolage Grotesque', sans-serif; letter-spacing: -0.045em; color: #111; }
  .wl__icon { width: 1.12em; height: 1.12em; display: block; overflow: visible; }
  .wl__word span { display: inline-block; }
  .dot { color: #e0552b; transform-origin: 50% 100%; }
</style></head><body><div class="box"><span class="wl">
  <svg class="wl__icon" viewBox="0 0 64 64" aria-hidden="true"><g id="sq"><rect width="64" height="64" rx="16" fill="#e0552b"/>
    <g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <polyline id="line" points="12,24 20.5,45 31,29 41.5,45 51,18"/>
      <polyline id="head" points="42.2,24.4 51,18 53.5,28.6"/>
    </g></g></svg>
  <span class="wl__word">${[...'webleads'].map(c => `<span class="l">${c}</span>`).join('')}<span class="dot">.</span></span>
</span></div></body></html>`;

// t in seconds → the logo at that moment. Rest, the stroke runs out through the arrow and draws itself
// again, the letters ripple, the arrow pops and the dot bounces, rest. Ends exactly where it started
const FRAME = t => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const p = (a, b) => clamp((t - a) / (b - a));
  const inOut = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const back = x => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2);
  const line = document.getElementById('line'), head = document.getElementById('head');
  const L = line.getTotalLength();
  line.style.strokeDasharray = `${L} ${L}`;
  // Out through the arrow (2.40–2.62 s), then drawn again from the left (2.62–3.10 s)
  const off = t < 2.62 ? -L * inOut(p(2.40, 2.62)) : L * (1 - inOut(p(2.62, 3.10)));
  line.style.strokeDashoffset = off;
  // The arrow tip shrinks away with the stroke and pops back with a small overshoot
  const hs = t < 2.62 ? 1 - p(2.48, 2.62) : (t < 3.0 ? 0 : back(p(3.0, 3.28)));
  head.setAttribute('transform', `translate(51 18) scale(${hs}) translate(-51 -18)`);
  // The square gives a small nudge up and to the right when the arrow lands
  const n = Math.sin(Math.PI * p(3.02, 3.42));
  document.getElementById('sq').setAttribute('transform', `translate(${1.6 * n} ${-2.4 * n})`);
  // The letters ripple from left to right while the stroke is drawn
  document.querySelectorAll('.l').forEach((el, i) => {
    const q = p(2.66 + i * 0.05, 2.66 + i * 0.05 + 0.34);
    el.style.transform = `translateY(${-3.2 * Math.sin(Math.PI * q)}px)`;
  });
  // The dot jumps, lands with a squash and settles (3.18–3.86 s)
  const d = p(3.18, 3.86), dot = document.querySelector('.dot');
  let y = 0, sx = 1, sy = 1;
  if (d > 0 && d < .38) y = -9 * Math.sin((Math.PI / 2) * (d / .38));
  else if (d >= .38 && d < .7) y = -9 * Math.cos((Math.PI / 2) * ((d - .38) / .32));
  else if (d >= .7 && d < 1) { const s = Math.sin(Math.PI * (d - .7) / .3); sx = 1 + .28 * s; sy = 1 - .24 * s; }
  dot.style.transform = `translateY(${y}px) scale(${sx}, ${sy})`;
};

// Icons for the badges: Google and Trustpilot for the reviews, Google Ads, Meta and Shopify for the channels.
// Google's G is the same as on webleads.dk; the others are from Simple Icons (simpleicons.org)
const ICONS = {
  google: `<svg viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`,
  trustpilot: `<svg viewBox="0 0 24 24"><path fill="#00B67A" d="M17.227 16.67l2.19 6.742-7.413-5.388 5.223-1.354zM24 9.31h-9.165L12.005.589l-2.84 8.723L0 9.3l7.422 5.397-2.84 8.714 7.422-5.388 4.583-3.326L24 9.311z"/></svg>`,
  'google-ads': `<svg viewBox="0 0 24 24"><path fill="#FBBC04" d="M7.5137 4.8438L1.5645 15.1484A4.5 4.5 0 0 1 4 14.4297c2.5597-.0075 4.6248 2.1585 4.4941 4.7148l3.2168-5.5723-3.6094-6.25c-.4499-.7793-.6322-1.6394-.5878-2.4784z"/><path fill="#4285F4" d="M23.4641 16.9287L15.4632 3.072C14.3586 1.1587 11.9121.5028 9.9988 1.6074S7.4295 5.1585 8.5341 7.0718l8.0009 13.8567c1.1046 1.9133 3.5511 2.5679 5.4644 1.4646 1.9134-1.1046 2.568-3.5511 1.4647-5.4644z"/><path fill="#34A853" d="M3.9998 22.9291C1.7908 22.9291 0 21.1383 0 18.9293s1.7908-3.9998 3.9998-3.9998 3.9998 1.7908 3.9998 3.9998-1.7908 3.9998-3.9998 3.9998z"/></svg>`,
  meta: `<svg viewBox="0 0 24 24"><path fill="#0081FB" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></svg>`,
  shopify: `<svg viewBox="0 0 24 24"><path fill="#5E8E3E" d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.018-.116-.114-.192-.211-.192s-1.929-.136-1.929-.136-1.275-1.274-1.439-1.411c-.045-.037-.075-.057-.121-.074l-.914 21.104h.023z"/><path fill="#95BF47" d="M11.71 11.305s-.81-.424-1.774-.424c-1.447 0-1.504.906-1.504 1.141 0 1.232 3.24 1.715 3.24 4.629 0 2.295-1.44 3.76-3.406 3.76-2.354 0-3.54-1.465-3.54-1.465l.646-2.086s1.245 1.066 2.28 1.066c.675 0 .975-.545.975-.932 0-1.619-2.654-1.694-2.654-4.359-.034-2.237 1.571-4.416 4.827-4.416 1.257 0 1.875.361 1.875.361l-.945 2.715-.02.01zM11.17.83c.136 0 .271.038.405.135-.984.465-2.064 1.639-2.508 3.992-.656.213-1.293.405-1.889.578C7.697 3.75 8.951.84 11.17.84V.83zm1.235 2.949v.135c-.754.232-1.583.484-2.394.736.466-1.777 1.333-2.645 2.085-2.971.193.501.309 1.176.309 2.1zm.539-2.234c.694.074 1.141.867 1.429 1.755-.349.114-.735.231-1.158.366v-.252c0-.752-.096-1.371-.271-1.871v.002zm2.992 1.289c-.02 0-.06.021-.078.021s-.289.075-.714.21c-.423-1.233-1.176-2.37-2.508-2.37h-.115C12.135.209 11.669 0 11.265 0 8.159 0 6.675 3.877 6.21 5.846c-1.194.365-2.063.636-2.16.674-.675.213-.694.232-.772.87-.075.462-1.83 14.063-1.83 14.063L15.009 24l.927-21.166z"/></svg>`
};

const b = await chromium.launch();
const tmp = mkdtempSync(join(tmpdir(), 'mailsignatur-'));
try {
  const p = await b.newPage({ deviceScaleFactor: 2, viewport: { width: 400, height: 120 } });
  // Google Fonts is fetched with curl, because the browser can't reach it through the proxy
  await p.route(/fonts\.(googleapis|gstatic)\.com/, async r => r.fulfill({
    body: execFileSync('curl', ['-sSL', '-A', 'Mozilla/5.0 Chrome/120', r.request().url()]),
    contentType: r.request().url().includes('gstatic') ? 'font/woff2' : 'text/css'
  }));
  await p.setContent(LOGO, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  if (!(await p.evaluate(() => document.fonts.check("800 26px 'Bricolage Grotesque'")))) throw new Error('Bricolage Grotesque did not load');
  const box = await p.locator('.box').boundingBox();
  const clip = { x: box.x, y: box.y, width: Math.ceil(box.width), height: Math.ceil(box.height) };
  await p.addScriptTag({ content: `window.frame = ${FRAME.toString()};` });

  const n = Math.round(FPS * SECONDS);
  for (let i = 0; i < n; i++) {
    await p.evaluate(t => window.frame(t), i / FPS);
    await p.screenshot({ path: join(tmp, `f${String(i).padStart(4, '0')}.png`), clip });
  }
  execFileSync('cp', [join(tmp, 'f0000.png'), `${out}/webleads-logo.png`]);
  // One palette for all frames, no dithering, and only the changed area stored per frame
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'),
    '-vf', 'split[a][b];[a]palettegen=max_colors=64:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle',
    '-loop', '0', `${out}/webleads-logo.gif`]);
  console.log(`webleads-logo.gif ${clip.width * 2}×${clip.height * 2} px (shown at ${clip.width}×${clip.height}), ${n} frames`);

  const q = await b.newPage({ deviceScaleFactor: 3, viewport: { width: 14, height: 14 } });
  for (const [name, svg] of Object.entries(ICONS)) {
    await q.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:14px;height:14px}</style>${svg}`);
    await q.screenshot({ path: `${out}/ikon-${name}.png`, omitBackground: true });
  }
  console.log('ikoner:', Object.keys(ICONS).join(', '));
} finally {
  await b.close();
  rmSync(tmp, { recursive: true, force: true });
}
