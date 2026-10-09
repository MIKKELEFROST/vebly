// Renders a CSS-animated 9:16 page frame by frame (no dropped frames) to an MP4 that the
// Instagram Reels API accepts: H.264, 30 fps, yuv420p, faststart and a silent AAC track.
// Usage: node scripts/social/render-reel.mjs scripts/social/reels/story-13-noget.html 9
// Output: brand/social/stories/<same name>.mp4
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const [arg, secs = '9'] = process.argv.slice(2);
const src = resolve(arg), out = `${root}/brand/social/stories/${basename(src, '.html')}.mp4`;
const fps = 30, n = Math.round(+secs * fps), dir = `/tmp/reel-frames-${process.pid}`;
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.route(/fonts\.(googleapis|gstatic)\.com/, async r => r.fulfill({
  body: execFileSync('curl', ['-sSL', '-A', 'Mozilla/5.0 Chrome/120', r.request().url()]),
  contentType: r.request().url().includes('gstatic') ? 'font/woff2' : 'text/css'
}));
await p.goto('file://' + src, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => document.getAnimations().forEach(a => a.pause()));
for (let f = 0; f < n; f++) {
  await p.evaluate(t => document.getAnimations().forEach(a => { a.currentTime = t; }), f * 1000 / fps);
  await p.screenshot({ path: `${dir}/${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
}
await b.close();

execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${dir}/%04d.jpg`,
  '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
  '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-maxrate', '4M', '-bufsize', '8M',
  '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out]);
rmSync(dir, { recursive: true, force: true });
console.log('ok', out);
