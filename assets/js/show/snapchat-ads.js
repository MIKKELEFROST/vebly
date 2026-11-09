// Snapchat Ads showcase (/services/snapchat-ads, scripts/services/showcase/snapchat-ads.html): a geofence map.
// A neighbourhood of our own drawing with Kragen, an example menswear shop, in the middle. When the map comes
// into view the radius grows out of the shop and people walking around light up as they come inside it. Drag the
// handle on the circle, tap the map or use the slider to change the area. Beside it Ida's phone: her friends'
// stories tick by, and while Ida is inside the radius our full-screen story ad plays between them, with
// "Swipe op" that opens the shop's page. Kragen, Ida, her friends and all numbers are examples.
// Without motion (no html.motion): nobody walks and nothing plays by itself; the radius, slider and taps still work.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--snapchat-ads');
if (root) init(root);

function init(root) {
  const SC = 'snapchat-ads', NS = 'http://www.w3.org/2000/svg';
  const motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const told = new Set();
  const act = a => { root.classList.add('is-used'); if (!told.has(a)) { told.add(a); track('showcase_interact', { showcase: SC, action: a }); } };
  let reached = 0;
  const step = n => { if (n > reached) { reached = n; track('showcase_step', { showcase: SC, step: n }); } };
  const fmt = n => n.toLocaleString('da-DK');

  /* ---------------- The map ---------------- */
  const svg = $('[data-sn-svg]'), map = $('[data-sn-map]');
  const cFill = $('[data-sn-c]'), cEdge = $('[data-sn-e]'), rl = $('[data-sn-rl]'), hd = $('[data-sn-hd]');
  const rvg = $('[data-sn-rvg]'), rvt = $('[data-sn-rvt]'), range = $('[data-sn-r]'), rv = $('[data-sn-rv]');
  const nowEl = $('[data-sn-now]'), seenEl = $('[data-sn-seen]'), idaEl = $('[data-sn-ida]'), crowd = $('[data-sn-people]');
  const capEl = $('[data-sn-cap]'), capT = $('[data-sn-capt]');
  // Map units: the SVG is 720 × 460; PX map units per metre
  const SHOP = { x: 381, y: 196 }, IDA = { x: 282, y: 268 }, PX = .24, MIN = 200, MAX = 1200, PREF = -40 * Math.PI / 180;
  const idaD = Math.hypot(IDA.x - SHOP.x, IDA.y - SHOP.y) / PX, idaM = Math.round(idaD / 10) * 10;
  $$('[data-sn-dist]').forEach(e => { e.textContent = idaM + ' m'; });

  // The people: walkers on the streets, and people staying on the square, at the school, the station, the park
  let seed = 11;
  const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const ST = [[66, 71, 740, 71], [66, 191, 740, 191], [66, 331, 466, 331], [141, -20, 141, 480], [301, -20, 301, 480], [461, -20, 461, 480], [611, -20, 611, 331]];
  const ZONES = [[322, 212, 120, 70, 11], [162, 118, 118, 56, 8], [634, 118, 72, 56, 5], [492, 356, 216, 92, 9], [160, 282, 104, 34, 3], [480, 210, 112, 100, 3], [630, 210, 84, 100, 3], [80, 210, 44, 100, 2]];
  const people = [];
  const add = p => {
    const g = document.createElementNS(NS, 'g'), ring = document.createElementNS(NS, 'circle'), d = document.createElementNS(NS, 'circle');
    g.setAttribute('class', 'sn-p'); ring.setAttribute('class', 'sn-p__g'); d.setAttribute('class', 'sn-p__d');
    ring.setAttribute('r', '4.4'); d.setAttribute('r', '4.4');
    g.append(ring, d); crowd.append(g);
    people.push(Object.assign(p, { el: g, in: false, x: 0, y: 0 }));
  };
  ST.forEach(s => {
    const len = Math.hypot(s[2] - s[0], s[3] - s[1]);
    for (let i = Math.round(len / 75); i--;) add({ s, len, d: rnd() * len, dir: rnd() < .5 ? -1 : 1, v: 7 + rnd() * 10, o: (rnd() < .5 ? -1 : 1) * (2.4 + rnd() * 1.6) });
  });
  ZONES.forEach(([x, y, w, h, n]) => { while (n--) add({ bx: x + rnd() * w, by: y + rnd() * h, ax: 2 + rnd() * 7, ay: 2 + rnd() * 5, ph: rnd() * 6.3, w: .25 + rnd() * .5 }); });

  let T = 0;
  const move = dt => {
    T += dt;
    for (const p of people) {
      if (p.s) {
        p.d += p.dir * p.v * dt;
        if (p.d < 0) { p.d = -p.d; p.dir = 1; } else if (p.d > p.len) { p.d = 2 * p.len - p.d; p.dir = -1; }
        const [x1, y1, , y2] = p.s;
        if (y1 === y2) { p.x = x1 + p.d; p.y = y1 + p.o; } else { p.x = x1 + p.o; p.y = y1 + p.d; }
      } else { p.x = p.bx + p.ax * Math.sin(T * p.w + p.ph); p.y = p.by + p.ay * Math.sin(T * p.w * .7 + p.ph * 1.3); }
      p.el.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
    }
    idaEl.setAttribute('transform', `translate(${(IDA.x + 1.6 * Math.sin(T * .8)).toFixed(1)} ${(IDA.y + Math.sin(T * .6)).toFixed(1)})`);
  };

  // Who is inside. Only people who walk in count as new views (not the circle growing over them)
  let R = 0, live = false, seen = 1240, shownN = -1, shownSeen = seen, bumpAt = 0;
  const paint = walked => {
    const rr = (R * PX) ** 2;
    let n = 0;
    for (const p of people) {
      const dx = p.x - SHOP.x, dy = p.y - SHOP.y, inn = dx * dx + dy * dy <= rr;
      if (inn) n++;
      if (inn !== p.in) { p.in = inn; p.el.classList.toggle('is-in', inn); if (inn && walked && live) seen += 1 + (rnd() * 3 | 0); }
    }
    if (idaIn) n++;
    if (n !== shownN) { shownN = n; nowEl.textContent = n; }
    if (seen !== shownSeen) {
      shownSeen = seen; seenEl.textContent = fmt(seen);
      const t = performance.now();
      if (t - bumpAt > 500) { bumpAt = t; seenEl.classList.remove('is-bump'); void seenEl.offsetWidth; seenEl.classList.add('is-bump'); }
    }
  };

  /* ---------------- The radius ---------------- */
  // The handle stays where it was put; if it would leave the visible map (phones crop it), it moves round the circle
  let th = PREF;
  const view = () => {
    const w = map.clientWidth || 720, h = map.clientHeight || 460, k = Math.max(w / 720, h / 460), vw = w / k, vh = h / k;
    return [(720 - vw) / 2, (460 - vh) / 2, vw, vh];
  };
  const fits = (a, r, [x0, y0, vw, vh]) => { const x = SHOP.x + r * Math.cos(a), y = SHOP.y + r * Math.sin(a); return x > x0 + 20 && x < x0 + vw - 20 && y > y0 + 20 && y < y0 + vh - 20; };
  const aim = r => {
    const v = view();
    if (fits(th, r, v)) return;
    for (let i = 0; i <= 18; i++) for (const s of [-1, 1]) { const a = PREF + s * i * Math.PI / 18; if (fits(a, r, v)) { th = a; return; } }
  };
  const label = m => m >= 1000 ? (m / 1000).toLocaleString('da-DK', { maximumFractionDigits: 2 }) + ' km' : m + ' m';
  const setR = (m, keepAim) => {
    R = Math.min(MAX, m);
    const r = R * PX, shown = Math.max(MIN, Math.round(R / 10) * 10), t = label(shown);
    if (!keepAim) aim(r);
    const c = Math.cos(th), s = Math.sin(th), lr = r < 120 ? r + 40 : r * .72;
    cFill.setAttribute('r', r.toFixed(1)); cEdge.setAttribute('r', r.toFixed(1));
    rl.setAttribute('x2', (r * c).toFixed(1)); rl.setAttribute('y2', (r * s).toFixed(1));
    hd.setAttribute('transform', `translate(${(SHOP.x + r * c).toFixed(1)} ${(SHOP.y + r * s).toFixed(1)}) rotate(${(th * 180 / Math.PI).toFixed(1)})`);
    rvg.setAttribute('transform', `translate(${(SHOP.x + lr * c).toFixed(1)} ${(SHOP.y + lr * s).toFixed(1)})`);
    rvt.textContent = t; rv.textContent = t;
    if (document.activeElement !== range) range.value = shown;
    range.style.setProperty('--p', ((shown - MIN) / (MAX - MIN) * 100).toFixed(1) + '%');
    range.setAttribute('aria-valuetext', `${t} omkring Kragen`);
    setIda(R >= idaD);
    paint(false);
  };
  let tw = 0;
  const tweenR = (to, dur, done) => {
    cancelAnimationFrame(tw);
    if (!motion) { setR(to); if (done) done(); return; }
    const from = R, t0 = performance.now();
    const f = now => { const k = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - (1 - k) ** 3; setR(from + (to - from) * e, true); if (k < 1) tw = requestAnimationFrame(f); else if (done) done(); };
    tw = requestAnimationFrame(f);
  };

  range.addEventListener('input', () => { cancelAnimationFrame(tw); act('radius'); setR(+range.value); });
  range.addEventListener('change', () => setR(+range.value));

  const toMap = e => { const m = svg.getScreenCTM(); return m && new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()); };
  const toward = (p, snap) => { th = Math.atan2(p.y - SHOP.y, p.x - SHOP.x); const m = Math.max(MIN, Math.min(MAX, Math.hypot(p.x - SHOP.x, p.y - SHOP.y) / PX)); return snap ? Math.round(m / 10) * 10 : m; };
  let dragging = false;
  hd.addEventListener('pointerdown', e => {
    e.preventDefault(); cancelAnimationFrame(tw);
    dragging = true; root.classList.add('is-drag'); act('traek');
    try { hd.setPointerCapture(e.pointerId); } catch (x) { /* fine without */ }
  });
  hd.addEventListener('pointermove', e => { if (!dragging) return; const p = toMap(e); if (p) setR(toward(p, true), true); });
  const drop = () => { if (!dragging) return; dragging = false; root.classList.remove('is-drag'); setR(R); };
  hd.addEventListener('pointerup', drop); hd.addEventListener('pointercancel', drop); hd.addEventListener('lostpointercapture', drop);
  // A tap on the map moves the edge of the circle there
  map.addEventListener('click', e => {
    if (e.target.closest('[data-sn-hd]')) return;
    const p = toMap(e); if (!p) return;
    act('kort'); tweenR(toward(p, true), 450);
  });

  /* ---------------- Ida's phone ---------------- */
  const scr = $('[data-sn-scr]'), barsEl = $('[data-sn-bars]'), vid = $('[data-sn-vid]'), upWrap = $('[data-sn-upwrap]');
  const sheet = $('[data-sn-sheet]'), upBtn = $('[data-sn-up]'), okEl = $('[data-sn-ok]');
  const SL = {};
  $$('[data-sn-sl]').forEach(e => { SL[e.dataset.snSl] = e; });
  const DUR = { f1: 3600, f2: 3200, ad: 7500, f3: 3600 };
  let idaIn = false, cur = 'f1', el = 0, bars = [], sheetOpen = false, inView = false, started = false, playing = false;
  const order = () => idaIn ? ['f1', 'f2', 'ad', 'f3'] : ['f1', 'f2', 'f3'];
  const paintBars = () => {
    const o = order(), ci = o.indexOf(cur);
    bars.forEach((b, i) => b.style.setProperty('--p', i < ci ? 1 : i > ci ? 0 : Math.min(1, el / DUR[cur]).toFixed(3)));
  };
  const renderBars = () => {
    barsEl.textContent = '';
    bars = order().map(k => { const i = document.createElement('i'), b = document.createElement('b'); if (k === 'ad') i.className = 'is-ad'; i.append(b); barsEl.append(i); return b; });
    paintBars();
  };
  const syncVid = () => {
    if (!vid) return;
    if (motion && inView && cur === 'ad' && !sheetOpen) { if (vid.preload === 'none') vid.preload = 'auto'; const p = vid.play(); if (p) p.catch(() => {}); } else vid.pause();
  };
  const show = k => {
    if (k === 'ad' && cur !== 'ad' && vid) { try { vid.currentTime = 0; } catch (x) { /* not loaded yet */ } }
    cur = k; el = 0;
    for (const n in SL) SL[n].classList.toggle('is-on', n === k);
    const ad = k === 'ad';
    scr.classList.toggle('is-ad', ad); idaEl.classList.toggle('is-ad', ad); upWrap.inert = !ad;
    if (ad && started) step(2);
    syncVid(); paintBars();
  };
  const next = () => { const o = order(), i = o.indexOf(cur); if (i >= o.length - 1) { if (started) step(3); show(o[0]); } else show(o[i + 1]); };
  const prev = () => { const o = order(), i = o.indexOf(cur); if (el > 900 || i <= 0) { el = 0; if (cur === 'ad' && vid) { try { vid.currentTime = 0; } catch (x) { /* not loaded yet */ } } paintBars(); } else show(o[i - 1]); };

  function setIda(inn) {
    if (inn === idaIn) return;
    idaIn = inn;
    idaEl.classList.toggle('is-in', inn);
    capEl.classList.toggle('is-out', !inn);
    capT.textContent = inn ? 'Hun er inden for området, så din annonce kommer mellem vennernes stories.' : 'Hun er uden for området, så hun ser kun vennernes stories.';
    if (!inn && cur === 'ad') { if (sheetOpen) closeSheet(true); show('f3'); }
    renderBars();
  }

  let swallow = false;
  $('[data-sn-next]').addEventListener('click', () => { if (swallow) return; act('naeste'); next(); });
  $('[data-sn-prev]').addEventListener('click', () => { if (swallow) return; act('forrige'); prev(); });

  // Swipe op: the button, or a drag upwards on the ad with a mouse
  const openSheet = how => {
    if (sheetOpen || cur !== 'ad') return;
    sheetOpen = true; act(how);
    okEl.textContent = '';
    sheet.inert = false; sheet.classList.add('is-open');
    syncVid();
    setTimeout(() => { if (sheetOpen) $('[data-sn-close]').focus({ preventScroll: true }); }, motion ? 380 : 0);
  };
  function closeSheet(quiet) {
    if (!sheetOpen) return;
    sheetOpen = false;
    sheet.classList.remove('is-open'); sheet.inert = true;
    if (!quiet) { act('luk'); if (cur === 'ad') upBtn.focus({ preventScroll: true }); }
    syncVid();
  }
  upBtn.addEventListener('click', () => openSheet('swipe-op'));
  $('[data-sn-close]').addEventListener('click', () => closeSheet());
  sheet.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
  $('[data-sn-route]').addEventListener('click', () => { act('vis-vej'); okEl.textContent = `Ruten åbner i kortet: ${idaM} m, cirka ${Math.max(1, Math.round(idaM / 80))} minutter til fods.`; });
  let sy = null;
  scr.addEventListener('pointerdown', e => { sy = e.pointerType === 'mouse' && cur === 'ad' && !sheetOpen ? e.clientY : null; });
  scr.addEventListener('pointerup', e => {
    if (sy !== null && sy - e.clientY > 40) { swallow = true; setTimeout(() => { swallow = false; }, 300); openSheet('swipe-op-traek'); }
    sy = null;
  });

  /* ---------------- Running ---------------- */
  let raf = 0, last = 0;
  const loop = now => {
    raf = 0;
    const dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
    move(dt); paint(true);
    if (playing && !sheetOpen) { el += dt * 1000; if (el >= DUR[cur]) next(); else paintBars(); }
    if (inView) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (motion && inView && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };

  const start = () => {
    if (started) return;
    started = true;
    root.classList.add('is-in');
    step(1);
    // The radius grows out of the shop, then the stories start
    setTimeout(() => tweenR(600, 1500, () => { live = true; root.classList.add('is-live'); }), 450);
    setTimeout(() => { playing = true; }, 900);
  };

  move(0);
  if (motion) {
    setR(0, true);
    renderBars(); show('f1');
    // Starts when a good part of the map is visible; walks and plays only while the section is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.intersectionRatio >= .3) start(); }), { threshold: [0, .3] }).observe(map);
      new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; if (inView) kick(); syncVid(); }).observe(root);
    } else { inView = true; start(); kick(); }
  } else {
    // The finished state: 600 m, Ida inside, the ad on her phone
    live = true;
    setR(600); renderBars(); show('ad');
    el = DUR.ad * .45; paintBars();
    started = true;
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); step(1); } });
      io.observe(map);
    } else step(1);
  }
  addEventListener('resize', () => { if (R >= MIN) setR(R); });
}
