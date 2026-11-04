// Showcase: CRO, an A/B test on a landing page (scripts/services/showcase/cro.html).
// In view, visitor dots run from "Dine besøgende" along the split into A and B; each looks around and
// leaves, or clicks the call button (a henvendelse). Counters tick (Konvertering = henvendelser / besøg
// as shown) and after 14 example days B wins. "Vis heatmap" shows where the dots looked and clicked, also
// mid-run; "Kør testen igen" starts over. Phones show one version at a time. Without html.motion: the
// finished test, static. All numbers are an example.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--cro');
if (root) init(root);

function init(root) {
  const q = s => root.querySelector(s), qa = (s, r = root) => [...r.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const ab = q('[data-ab]'), wins = q('[data-ab-wins]'), fx = q('[data-ab-fx]'), g = fx.getContext('2d');
  const wires = q('[data-ab-wires]'), split = q('.ab__split'), src = q('[data-ab-src]'), badge = q('.ab__badge');
  const heatBtn = q('[data-ab-heatbtn]'), stateEl = q('[data-ab-state]'), dayEl = q('[data-ab-day]');
  const FIN = { a: [1238, 30], b: [1231, 67] }; // the example after 14 days: besøg, henvendelser
  const N = 110, RUN = 7.4, D1 = .75, DAYS = 14, MAXR = 7, SIDES = ['a', 'b'], TAU = 6.2832;
  const act = a => track('showcase_interact', { showcase: 'cro', action: a });
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - (1 - t) ** 3, inout = t => t < .5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2;
  const num = n => n.toLocaleString('da-DK');
  const pct = (c, v) => (v ? c / v * 100 : 0).toLocaleString('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
  const rng = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const S = {};
  for (const s of SIDES) {
    const pick = k => q(`[data-ab-${k}="${s}"]`), n = k => q(`[data-ab-n="${s}${k}"]`), page = pick('page'), zones = qa('[data-z]', page);
    S[s] = { win: pick('win'), page, heat: pick('heat'), url: pick('url'), seg: pick('show'), pct: pick('pct'), bar: pick('bar'), nv: n('v'), nc: n('c'), nr: n('r'),
      zones, wz: zones.map(e => +e.dataset.z), ctas: qa('[data-ab-cta]', page), v: 0, c: 0, r: -1, pts: [], plus: -9 };
  }

  /* Layout, in px from the top left of the test (.ab) */
  let L = null, one = false, shown = 'b', dpr = 1;
  const rect = el => el.getBoundingClientRect();
  const rel = (r, o) => ({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height });
  const mid = r => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
  const f1 = n => Math.round(n * 10) / 10;
  const ctrl = E => { const k = (E.y - L.src.y) * .6; return [L.src.x, L.src.y + k, E.x, E.y - k]; };
  const b3 = (a, b, c, d, t) => { const m = 1 - t; return m * m * m * a + 3 * m * t * (m * b + t * c) + t * t * t * d; };
  const onWire = (E, t) => { const [x1, y1, x2, y2] = ctrl(E); return { x: b3(L.src.x, x1, x2, E.x, t), y: b3(L.src.y, y1, y2, E.y, t) }; };
  const measure = () => {
    const o = rect(ab); if (!o.width) return;
    one = matchMedia('(max-width: 699px)').matches;
    dpr = Math.min(2, devicePixelRatio || 1);
    const fw = Math.round(o.width * dpr), fh = Math.round(o.height * dpr);
    if (fx.width !== fw || fx.height !== fh) { fx.width = fw; fx.height = fh; }
    const sr = rel(rect(src), o), wo = rel(rect(wins), o);
    L = { w: o.width, h: o.height, src: { x: sr.x + sr.w / 2, y: sr.y + sr.h } };
    for (const s of SIDES) {
      // Against the window itself, so its slide on phones moves nothing
      const d = S[s], wr = rect(d.win), pr = rect(d.page), bx = wo.x + d.win.offsetLeft, by = wo.y + d.win.offsetTop;
      const inW = el => { const r = rect(el); return { x: bx + r.left - wr.left, y: by + r.top - wr.top, w: r.width, h: r.height }; };
      const inP = el => rel(rect(el), pr), cta = d.ctas.find(e => rect(e).width) || d.ctas[0];
      d.W = { x: bx, y: by, w: wr.width, h: wr.height };
      d.E = mid(one ? rel(rect(d.seg), o) : inW(d.url));
      d.Z = d.zones.map(inW); d.C = inW(cta); d.HZ = d.zones.map(inP); d.HC = inP(cta);
      const hw = Math.round(pr.width), hh = Math.round(pr.height);
      if (d.heat.width !== hw || d.heat.height !== hh) { d.heat.width = hw; d.heat.height = hh; }
    }
    wires.setAttribute('viewBox', `0 0 ${f1(o.width)} ${f1(o.height)}`);
    wires.innerHTML = SIDES.map(s => { const E = S[s].E; return `<path d="M${f1(L.src.x)} ${f1(L.src.y)}C${ctrl(E).map(f1).join(' ')} ${f1(E.x)} ${f1(E.y)}"/>`; }).join('');
    const so = rel(rect(split), o);
    for (const s of SIDES) { const p = onWire(S[s].E, .5), st = S[s].pct.style; st.left = `${f1(p.x - so.x)}px`; st.top = `${f1(p.y - so.y)}px`; }
    heatDirty = true;
  };

  /* One run: N dots per side over the 14 days, the henvendelser spread evenly (A ends on 30, B on 67);
     each other dot goes to a place on the page (data-z weights) */
  let P = [], seed = 5;
  const plan = () => {
    const r = rng(seed++), out = [];
    for (const s of SIDES) {
      const K = FIN[s][1], wz = S[s].wz, tot = wz.reduce((a, b) => a + b), conv = new Set();
      for (let k = 0; k < K; k++) conv.add(Math.floor((k + .5) * N / K));
      for (let i = 0; i < N; i++) {
        let z = -1;
        if (!conv.has(i)) { let x = r() * tot; z = 0; while ((x -= wz[z]) > 0 && z < wz.length - 1) z++; }
        out.push({ s, z, t0: (i + r() * .9) * RUN / N, d2: .8 + r() * .45, u: (r() + r() + r()) / 3, v: (r() + r() + r()) / 3, j: r() - .5 });
      }
    }
    return out.sort((a, b) => a.t0 - b.t0);
  };
  const tgt = (d, p) => { const r = p.z < 0 ? d.C : d.Z[p.z]; return { x: r.x + r.w * p.u, y: r.y + r.h * p.v }; };

  /* Heatmap of every place a dot looked or clicked: the page dimmed (ink at VA), yellow where few, red where many */
  const sprite = document.createElement('canvas'); sprite.width = sprite.height = 64;
  { const x = sprite.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, '#000'); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); }
  const STOPS = [[0, 255, 221, 87, 0], [.08, 255, 221, 87, 0], [.2, 255, 221, 87, .5], [.45, 250, 168, 60, .74], [.72, 238, 100, 44, .86], [1, 222, 46, 32, .93]], VA = .32;
  const LUT = new Uint8ClampedArray(1024);
  for (let i = 0; i < 256; i++) {
    const x = i / 255; let k = 1;
    while (k < STOPS.length - 1 && STOPS[k][0] < x) k++;
    const A = STOPS[k - 1], B = STOPS[k], f = (x - A[0]) / (B[0] - A[0]), c = n => A[n] + (B[n] - A[n]) * f, a = c(4), oa = a + VA * (1 - a);
    for (let n = 0; n < 3; n++) LUT[i * 4 + n] = (c(n + 1) * a + 17 * VA * (1 - a)) / oa;
    LUT[i * 4 + 3] = oa * 255;
  }
  let heatOn = false, heatDirty = true, heatAt = 0;
  const renderHeat = () => {
    heatDirty = false;
    for (const s of SIDES) {
      const d = S[s], cv = d.heat, w = cv.width, h = cv.height; if (!w || !h || !d.HZ || !vis(s)) continue;
      const c = d.hc || (d.hc = cv.getContext('2d', { willReadFrequently: true })), R = w * .095;
      c.clearRect(0, 0, w, h); c.globalAlpha = .14;
      for (const p of d.pts) { const r = p.z < 0 ? d.HC : d.HZ[p.z], rr = p.z < 0 ? R * .8 : R; c.drawImage(sprite, r.x + r.w * p.u - rr, r.y + r.h * p.v - rr, rr * 2, rr * 2); }
      c.globalAlpha = 1;
      const img = c.getImageData(0, 0, w, h), px = img.data;
      for (let i = 0; i < px.length; i += 4) { const j = px[i + 3] * 4; px[i] = LUT[j]; px[i + 1] = LUT[j + 1]; px[i + 2] = LUT[j + 2]; px[i + 3] = LUT[j + 3]; }
      c.putImageData(img, 0, 0);
    }
  };

  /* One version at a time on phones */
  let segTouched = false;
  const vis = s => !one || shown === s;
  const show = s => { shown = s; ab.dataset.show = s; for (const x of SIDES) { S[x].seg.classList.toggle('is-on', x === s); S[x].seg.setAttribute('aria-pressed', x === s); } if (heatOn) renderHeat(); };
  for (const s of SIDES) S[s].seg.addEventListener('click', () => { segTouched = true; if (shown !== s) { show(s); act('vis-' + s); } });
  heatBtn.addEventListener('click', () => {
    heatOn = !heatOn; heatBtn.setAttribute('aria-pressed', heatOn); ab.classList.toggle('is-heat', heatOn);
    if (heatOn) renderHeat();
    act(heatOn ? 'heatmap-on' : 'heatmap-off');
  });

  let mq = 0, raf = 0;
  const remeasure = () => { if (!mq) mq = requestAnimationFrame(() => { mq = 0; measure(); if (heatOn) renderHeat(); if (motion && L && !raf) draw(); }); };
  new ResizeObserver(remeasure).observe(ab);
  addEventListener('resize', remeasure);
  if (document.fonts) document.fonts.ready.then(remeasure);
  measure();

  // Reduced motion: the finished test from the HTML, with the heat of all the visitors
  if (!motion) { for (const p of plan()) S[p.s].pts.push(p); show('b'); return; }

  /* The run */
  let T = 0, last = 0, running = false, started = false, inView = false, next = 0, half = false, day = 0, spin = 0;
  const live = [], fxs = [], seen = new Set();
  const step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: 'cro', step: n }); } };
  const kick = () => { if (!raf && inView) { last = 0; raf = requestAnimationFrame(loop); } };
  const count = () => {
    const F = clamp((T - D1) / RUN);
    for (const s of SIDES) {
      const d = S[s], v = Math.round(FIN[s][0] * F);
      if (v !== d.v) { d.v = v; d.nv.textContent = num(v); }
      const r = d.v ? d.c / d.v : 0;
      if (r !== d.r) { d.r = r; d.nr.textContent = pct(d.c, d.v); d.bar.style.transform = `scaleX(${clamp(r * 100 / MAXR).toFixed(4)})`; }
    }
    const dd = Math.min(DAYS, 1 + Math.floor(F * DAYS));
    if (dd !== day) dayEl.textContent = day = dd;
    if (F >= .5 && !half) { half = true; step(2); if (one && !segTouched) show('b'); }
  };
  const land = p => {
    const d = S[p.s];
    p.done = T; d.pts.push(p); heatDirty = true;
    if (p.z >= 0) return;
    d.c++; d.nc.textContent = num(d.c);
    if (!vis(p.s)) return;
    const t = tgt(d, p);
    fxs.push({ k: 0, s: p.s, x: t.x, y: t.y, t: T, life: .6 });
    if (T - d.plus > .42) { d.plus = T; fxs.push({ k: 1, s: p.s, x: t.x, y: t.y, t: T, life: .9 }); }
  };
  const finish = () => {
    running = false;
    ab.classList.remove('is-run'); ab.classList.add('is-done');
    stateEl.textContent = 'Testen er færdig';
    step(3);
    if (one && !segTouched) show('b');
    // A little confetti from the badge once it has popped up
    setTimeout(() => {
      if (running || !inView || !vis('b')) return;
      const o = rect(ab), r = rect(badge), x = r.left - o.left + r.width / 2, y = r.top - o.top + r.height / 2;
      for (let i = 0; i < 22; i++) { const an = -Math.PI / 2 + (Math.random() - .5) * 2.8, sp = 120 + Math.random() * 170; fxs.push({ k: 2, x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, c: ['#e0552b', '#111', '#f2c14e', '#2f9e5b'][i % 4], z: 4 + Math.random() * 4, t: T, life: 1.1 }); }
      kick();
    }, 280);
  };
  const reset = () => {
    P = plan(); next = 0; T = 0; live.length = 0; fxs.length = 0; half = false; day = 0;
    for (const s of SIDES) { const d = S[s]; d.v = -1; d.c = 0; d.r = -1; d.pts = []; d.plus = -9; d.nc.textContent = '0'; }
    ab.classList.remove('is-done', 'is-run');
    heatDirty = true;
    count();
  };
  const start = () => {
    reset(); running = true;
    ab.classList.add('is-run'); stateEl.textContent = 'Testen kører';
    if (one && !segTouched) show('a');
    if (heatOn) renderHeat();
    step(1); kick();
  };

  const dot = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.stroke(); };
  const draw = () => {
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, L.w, L.h);
    const r0 = one ? 4 : 4.6;
    g.fillStyle = '#e0552b'; g.strokeStyle = '#fff'; g.lineWidth = 1.6;
    // Along the split (on phones a dot for the version not shown fades into its button)
    for (const p of live) {
      const a = T - p.t0; if (a >= D1) continue;
      const k = inout(a / D1), pt = onWire(S[p.s].E, k);
      g.globalAlpha = vis(p.s) ? 1 : 1 - clamp((k - .8) / .2);
      dot(pt.x + p.j * 6 * Math.sin(k * Math.PI) + (one ? 0 : clamp((k - .7) / .3) * p.j * 70), pt.y, r0);
    }
    // On the page: from the address bar to where the visitor looks, or to the button
    for (const s of SIDES) {
      if (!vis(s)) continue;
      const d = S[s], W = d.W, E = d.E, top = Math.min(W.y, E.y - 12);
      g.save(); g.beginPath();
      if (g.roundRect) g.roundRect(W.x, top, W.w, W.y + W.h - top, 18); else g.rect(W.x, top, W.w, W.y + W.h - top);
      g.clip();
      for (const p of live) {
        const a = T - p.t0; if (p.s !== s || a < D1 || (p.done && p.z < 0)) continue;
        const e = ease(clamp((a - D1) / p.d2)), m = 1 - e, t = tgt(d, p), ex = E.x + (one ? 0 : p.j * 70), cx = ex + p.j * 60, cy = t.y - (t.y - E.y) * .15;
        const f = p.done ? clamp((T - p.done - .25) / .4) : 0;
        g.globalAlpha = 1 - f;
        dot(m * m * ex + 2 * m * e * cx + e * e * t.x, m * m * E.y + 2 * m * e * cy + e * e * t.y, r0 * (1 - .45 * f));
      }
      g.restore();
    }
    // A ring and "+1" where a henvendelse lands, confetti when B wins
    g.font = '700 13px "DM Sans", sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round';
    for (const o of fxs) {
      if (o.s && !vis(o.s)) continue;
      const tt = T - o.t, a = tt / o.life;
      if (o.k === 0) { g.globalAlpha = .85 * (1 - a); g.strokeStyle = '#2f9e5b'; g.lineWidth = 1.8; g.beginPath(); g.arc(o.x, o.y, 4 + 15 * ease(a), 0, TAU); g.stroke(); }
      else if (o.k === 1) { const y = o.y - 16 - 22 * ease(a); g.globalAlpha = a < .55 ? 1 : (1 - a) / .45; g.strokeStyle = '#fff'; g.lineWidth = 3.5; g.strokeText('+1', o.x, y); g.fillStyle = '#2f9e5b'; g.fillText('+1', o.x, y); }
      else { g.globalAlpha = a < .6 ? 1 : (1 - a) / .4; g.fillStyle = o.c; g.fillRect(o.x + o.vx * tt - o.z / 2, o.y + o.vy * tt + 430 * tt * tt - o.z / 2, o.z, o.z); }
    }
    g.globalAlpha = 1;
  };

  const loop = now => {
    raf = 0;
    T += last ? Math.min(.25, (now - last) / 1000) : 0; last = now;
    if (running) {
      while (next < P.length && P[next].t0 <= T) live.push({ ...P[next++], done: 0 });
      for (const p of live) if (!p.done && T >= p.t0 + D1 + p.d2) land(p);
      count();
      if (next >= P.length && live.every(p => p.done)) finish();
    }
    for (let i = live.length; i--;) if (live[i].done && T - live[i].done > .7) live.splice(i, 1);
    for (let i = fxs.length; i--;) if (T - fxs[i].t > fxs[i].life) fxs.splice(i, 1);
    if (heatOn && heatDirty && now - heatAt > 120) { heatAt = now; renderHeat(); }
    draw();
    if ((running || live.length || fxs.length) && inView) raf = requestAnimationFrame(loop);
  };

  q('[data-ab-again]').addEventListener('click', () => {
    q('.ab__ico').style.transform = `rotate(${spin += 360}deg)`;
    started = true; start(); act('replay');
  });

  // Counters at zero until the numbers are in view, then the test runs; it pauses out of view
  reset(); stateEl.textContent = 'Venter på besøgende'; show('a');
  new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; if (inView) kick(); }).observe(wins);
  const go = new IntersectionObserver(es => {
    if (started || !es.some(e => e.intersectionRatio >= .5)) return;
    started = true; go.disconnect(); setTimeout(start, 350);
  }, { threshold: [0, .5, 1] });
  go.observe(q('[data-ab-stats]'));
}
