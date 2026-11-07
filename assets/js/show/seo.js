// SEO showcase (/services/seo): a ranking climb. A results page of our own drawing for "løbesko herre" and a month
// scrubber. Kvikfod (a made-up webshop) climbs from 18th place on page 2 to the top: the rows move with transform,
// the view follows the card, and the result gets a better title, text, address and, from the product pages'
// structured data, price, stars and "På lager". The dark report beside it shows the position, draws the climb and
// says what we did that month. Plays itself once when it comes into view (pauses out of view); the scrubber, the
// month names and the play button take over. Without motion: December, finished and still; the scrubber still works.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--seo');
if (root) {
  try { init(root); } catch (e) { root.classList.add('is-end'); throw e; }
}

function init(root) {
  const SC = 'seo', motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  let D;
  try { D = JSON.parse($('[data-rc-data]').textContent); } catch (x) { return; }
  const list = $('[data-rc-list]'), vp = $('[data-rc-vp]'), kv = $('[data-rc-k]'), pg = $('[data-rc-pg]');
  const comps = $$('.rc-r:not(.rc-r--k)');
  const range = $('[data-rc-m]'), play = $('[data-rc-play]'), ticks = $$('[data-rc-ticks] span');
  const field = { t: $('[data-rc-t]'), s: $('[data-rc-s]'), u: $('[data-rc-u]') };
  const extra = { sd: $('[data-rc-x="sd"]'), sl: $('[data-rc-x="sl"]') };
  const nEl = $('[data-rc-n]'), pgl = $('[data-rc-pgl]'), vEl = $('[data-rc-v]'), mn = $('[data-rc-mn]');
  const task = $('.rc-task'), cEl = $('[data-rc-c]'), dEl = $('[data-rc-d]'), bEl = $('[data-rc-b]'), ch = $('[data-rc-ch]');
  const ev = action => track('showcase_interact', { showcase: SC, action });
  const steps = new Set(), step = n => { if (!steps.has(n)) { steps.add(n); track('showcase_step', { showcase: SC, step: n }); } };
  const nf = n => n.toLocaleString('da-DK'), f = n => n.toFixed(1);
  const LAST = D.p.length - 1;
  // Changes that should not glide: the first layout, a resize
  const still = fn => { root.classList.add('rc-still'); fn(); void root.offsetWidth; requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('rc-still'))); };

  /* ---------------- The chart: rank 1 at the top, page 2 shaded ---------------- */
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (n, a, txt) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (txt) e.textContent = txt; return e; };
  const W = 320, X0 = 8, X1 = 312, Y0 = 10, Y1 = 138, MY = 164;
  const px = i => X0 + i * (X1 - X0) / LAST, py = r => Y0 + (r - 1) * (Y1 - Y0) / 19;
  const pts = D.p.map((r, i) => [px(i), py(r)]), brk = py(10.5);
  // A soft curve through the months (Catmull-Rom as cubic Béziers)
  const seg = i => {
    const a = pts[Math.max(0, i - 1)], b = pts[i], c = pts[i + 1], d = pts[Math.min(LAST, i + 2)], t = .18;
    return `C${f(b[0] + (c[0] - a[0]) * t)} ${f(b[1] + (c[1] - a[1]) * t)} ${f(c[0] - (d[0] - b[0]) * t)} ${f(c[1] - (d[1] - b[1]) * t)} ${f(c[0])} ${f(c[1])}`;
  };
  const path = n => `M${f(pts[0][0])} ${f(pts[0][1])}` + Array.from({ length: n }, (_, i) => seg(i)).join('');
  ch.append(
    mk('rect', { class: 'rc-ch__p2', x: 0, y: f(brk), width: W, height: f(Y1 + 10 - brk), rx: 8 }),
    mk('line', { class: 'rc-ch__brk', x1: 0, x2: W, y1: f(brk), y2: f(brk) }),
    mk('text', { class: 'rc-ch__lbl', x: W, y: f(brk - 7), 'text-anchor': 'end' }, 'SIDE 1'),
    mk('text', { class: 'rc-ch__lbl', x: W, y: f(brk + 15), 'text-anchor': 'end' }, 'SIDE 2')
  );
  const mons = pts.map((p, i) => ch.appendChild(mk('text', { class: 'rc-ch__m', x: f(p[0]), y: MY, 'text-anchor': 'middle' }, D.months[i][0])));
  const dots = pts.map(p => ch.appendChild(mk('circle', { class: 'rc-ch__dot', cx: f(p[0]), cy: f(p[1]), r: 2.6 })));
  const ln = ch.appendChild(mk('path', { class: 'rc-ch__ln', d: path(LAST) }));
  const lens = pts.map((_, i) => { if (!i) return 0; const t = mk('path', { d: path(i) }); ch.append(t); const l = t.getTotalLength(); t.remove(); return l; });
  const total = lens[LAST] || 1;
  ln.style.strokeDasharray = `${total} ${total + 20}`;
  const mv = ch.appendChild(mk('g', { class: 'rc-ch__mv' }));
  mv.append(mk('circle', { class: 'rc-ch__halo', r: 7 }), mk('circle', { class: 'rc-ch__now', r: 5.5 }));
  const chart = n => {
    ln.style.strokeDashoffset = f(total - lens[n]);
    mv.style.transform = `translate(${f(pts[n][0])}px, ${f(pts[n][1])}px)`;
    dots.forEach((d, i) => d.classList.toggle('is-on', i < n));
    mons.forEach((t, i) => t.classList.toggle('is-on', i === n));
  };

  /* ---------------- The results: placed one under the other, the view follows Kvikfod ---------------- */
  const TOP = 14, KG = 6;
  list.classList.add('is-js');
  const layout = () => {
    const seq = comps.slice();
    seq.splice(D.p[m] - 1, 0, kv);
    seq.splice(10, 0, pg);
    let y = 0, n = 0, ky = 0;
    seq.forEach(e => {
      if (e === kv) { y += KG; ky = y; }
      e.style.transform = `translate3d(0,${y}px,0)`;
      if (e !== pg) e.firstElementChild.textContent = ++n;
      y += e.offsetHeight + (e === kv ? KG : 0);
    });
    const vh = vp.clientHeight, kh = kv.offsetHeight, end = y + TOP + 24;
    list.style.height = end + 'px';
    const cam = Math.round(Math.max(0, Math.min(ky + TOP - Math.max(16, (vh - kh) * .4), end - vh)));
    list.style.transform = `translate3d(0,${-cam}px,0)`;
    vp.classList.toggle('is-down', cam > 2);
  };

  /* ---------------- One month ---------------- */
  let m = -1, vNow = 0, vRaf = 0, lift = 0;
  const count = to => {
    cancelAnimationFrame(vRaf);
    if (!motion || m < 0) { vNow = to; vEl.textContent = nf(to); return; }
    const from = vNow, t0 = performance.now();
    const tick = now => { const k = Math.min(1, (now - t0) / 800), e = 1 - Math.pow(1 - k, 3); vNow = Math.round(from + (to - from) * e); vEl.textContent = nf(vNow); if (k < 1) vRaf = requestAnimationFrame(tick); };
    vRaf = requestAnimationFrame(tick);
  };
  const setM = n => {
    n = Math.max(0, Math.min(LAST, n));
    if (n === m) return;
    const prev = m, p = D.p[n], moved = prev >= 0 && D.p[prev] !== p;
    // Kvikfod's title, text and address: before or after the month we changed them
    for (const k in field) {
      const [a, b, w] = D[k], on = n >= w, e = field[k];
      if (e.dataset.on === String(on)) continue;
      e.dataset.on = on;
      e.innerHTML = `<span>${on ? b : a}</span>`;
      if (on && prev >= 0 && prev < w && motion) e.firstChild.classList.add('is-new');
    }
    for (const k in extra) {
      const on = n >= D[k], x = extra[k];
      if (x.classList.contains('is-on') === on) continue;
      x.classList.toggle('is-on', on);
      x.classList.remove('is-pop');
      if (on && prev >= 0 && motion) { void x.offsetWidth; x.classList.add('is-pop'); }
    }
    m = n;
    layout();
    if (moved && motion) { kv.classList.add('is-lift'); clearTimeout(lift); lift = setTimeout(() => kv.classList.remove('is-lift'), 1000); }

    // The report
    if (nEl.textContent !== String(p)) {
      nEl.textContent = p;
      if (motion && prev >= 0 && nEl.animate) nEl.animate([{ transform: 'translateY(.3em)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    }
    pgl.textContent = p === 1 ? 'Øverst' : p <= 10 ? 'Side 1' : 'Side 2';
    pgl.classList.toggle('is-p1', p > 1 && p <= 10);
    pgl.classList.toggle('is-top', p === 1);
    count(D.v[n]);
    mn.textContent = D.months[n];
    cEl.textContent = D.c[n];
    dEl.textContent = D.d[n];
    bEl.textContent = D.b[n] || '';
    bEl.hidden = !D.b[n];
    if (motion && prev >= 0) { task.classList.remove('is-swap'); void task.offsetWidth; task.classList.add('is-swap'); }
    chart(n);

    // The scrubber
    range.value = n;
    range.style.setProperty('--p', (n / LAST * 100).toFixed(2) + '%');
    range.setAttribute('aria-valuetext', `${D.months[n]}: placering ${p}`);
    ticks.forEach((t, i) => { t.classList.toggle('is-on', i === n); t.classList.toggle('is-past', i < n); });
    root.classList.toggle('is-end', n === LAST);

    if (started) {
      if (p <= 10) step(2);
      if (n >= D.sd) step(3);
      if (n === LAST) step(4);
    }
  };

  /* ---------------- Play, pause and the scrubber ---------------- */
  const DUR = 1500;
  let timer = 0, playing = false, held = false, started = false, seen = false;
  const label = () => play.setAttribute('aria-pressed', String(playing));
  const stop = () => { clearTimeout(timer); playing = held = false; root.classList.remove('is-play'); label(); };
  const next = () => { setM(m + 1); if (m >= LAST) stop(); else timer = setTimeout(next, DUR); };
  const go = from => {
    clearTimeout(timer);
    if (from != null) setM(from);
    playing = true; held = false;
    root.classList.add('is-play'); label();
    if (seen) timer = setTimeout(next, from === 0 ? DUR + 400 : 700); else held = true;
  };
  play.addEventListener('click', () => {
    if (playing) { stop(); ev('pause'); return; }
    ev(m === LAST ? 'igen' : 'afspil');
    go(m === LAST ? 0 : null);
  });
  range.addEventListener('input', () => { stop(); setM(+range.value); });
  range.addEventListener('change', () => ev('scrub'));
  ticks.forEach((t, i) => t.addEventListener('click', () => { stop(); setM(i); range.focus({ preventScroll: true }); ev('maaned'); }));

  /* ---------------- Start ---------------- */
  still(() => setM(motion ? 0 : LAST));
  const begin = () => {
    if (started) return;
    started = true;
    step(1);
    if (D.p[m] <= 10) step(2);
    if (motion) go(m);
  };
  // In view: start once; out of view the autoplay waits, and goes on when it is back
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => {
      seen = e.isIntersecting && e.intersectionRatio >= .3;
      if (seen) { begin(); if (playing && held) { held = false; timer = setTimeout(next, m === 0 ? DUR + 400 : 700); } }
      else if (playing) { clearTimeout(timer); held = true; }
    }), { threshold: [0, .3] }).observe($('.rc-win'));
  } else { seen = true; begin(); }

  let rt = 0;
  const relayout = () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(() => still(layout)); };
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(vp);
  if (document.fonts) document.fonts.ready.then(relayout);
}
