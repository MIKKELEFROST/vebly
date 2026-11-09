// Linkbuilding showcase (/services/linkbuilding): a link map on a dark stage. An example website (Kobolt Maler, a painter
// in Odense: made up) glows in the middle, six made-up Danish sources float around it as small page cards (a gentle bob,
// and on desktop a little parallax with the mouse). When the map comes into view the months run: each link draws itself
// in an orange glow, lands (the site pulses, a ring ripples out, "+1 link" pops), then keeps streaming particles into
// the site. The big numbers count up, the gauge sweeps and the site climbs place by place on an example search.
// "Vis linkfarme" brings in red, glitchy cards whose links snap with a spark and are cut off. A click on a source or a
// report row shows its article. One rAF loop draws everything while the map is on screen. Without html.motion the
// finished map is shown, static.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--linkbuilding');
if (root) {
  try { init(root); } catch (e) { const lk = root.querySelector('[data-lk]'); if (lk) lk.classList.add('is-in', 'is-ready'); throw e; }
}

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const lk = $('[data-lk]'), map = $('[data-lk-map]'), svg = $('[data-lk-svg]'), hub = $('[data-lk-hub]'), site = $('[data-lk-site]');
  const farmBtn = $('[data-lk-farm]'), artBox = $('[data-lk-art]'), aura = $('[data-lk-aura]');
  const linksEl = $('[data-lk-links]'), lchip = $('[data-lk-lchip]'), scoreEl = $('[data-lk-score]'), plusEl = $('[data-lk-plus]');
  const arc = $('[data-lk-arc]'), knob = $('[data-lk-knob]'), rankEl = $('[data-lk-rank]'), upEl = $('[data-lk-up]');
  const serp = $('[data-lk-serp]'), me = $('[data-lk-me]'), sup = $('[data-lk-sup]');
  const phone = matchMedia('(max-width: 700px)'), mouse = matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
  const ev = action => track('showcase_interact', { showcase: 'linkbuilding', action });
  const seen = new Set(), step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: 'linkbuilding', step: n }); } };
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (n, c, a = {}) => { const e = document.createElementNS(NS, n); if (c) e.setAttribute('class', c); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const f = v => v.toFixed(1);
  // The example's numbers: authority before the first link, and the place on »maler odense« after 0 to 6 links
  const BASE = 9, PLACES = [14, 13, 12, 10, 9, 8, 7];

  const ticks = $('[data-lk-ticks]');
  for (let i = 0; i <= 10; i++) { const a = Math.PI * i / 10, c = Math.cos(a), s = Math.sin(a); ticks.append(mk('line', '', { x1: f(100 - 92 * c), y1: f(100 - 92 * s), x2: f(100 - 98 * c), y2: f(100 - 98 * s) })); }

  /* ---------------- The map: one card and one link per source ---------------- */
  const defs = mk('defs'), plan = mk('g'), glow = mk('g'), core = mk('g'), farmG = mk('g'), fx = mk('g');
  svg.append(defs, plan, glow, core, farmG, fx);
  const nodes = $$('[data-lk-n]').map((btn, i) => {
    const li = btn.parentNode;
    const n = { k: btn.dataset.lkN, btn, li, farm: btn.hasAttribute('data-farm'), m: +btn.dataset.m || 0, pts: +btn.dataset.pts || 0, t: 0, on: false,
      d: parseFloat(li.style.getPropertyValue('--d')) || 1, ph: i * 1.37, per: 5200 + i * 470, ox: 0, oy: 0 };
    li.style.setProperty('--i', i);
    if (n.farm) {
      n.path = mk('path', 'lk-farm');
      n.cut = mk('g', 'lk-cut');
      const g = mk('g', 'lk-cut__in');
      g.append(mk('circle', '', { r: 10 }), mk('path', '', { d: 'M-3.5-3.5l7 7M3.5-3.5l-7 7' }));
      n.cut.append(g); farmG.append(n.path, n.cut);
    } else {
      // A gradient from the source (faint) to the site (bright), so the authority looks like it flows in
      n.grad = mk('linearGradient', '', { id: 'lk-g-' + n.k, gradientUnits: 'userSpaceOnUse' });
      n.grad.append(mk('stop', '', { offset: '0', 'stop-color': '#e0552b', 'stop-opacity': '.3' }), mk('stop', '', { offset: '.6', 'stop-color': '#ff7a45' }), mk('stop', '', { offset: '1', 'stop-color': '#ffd2bf' }));
      defs.append(n.grad);
      n.plan = mk('path', 'lk-plan'); plan.append(n.plan);
      n.glow = mk('path', 'lk-glow', { stroke: `url(#lk-g-${n.k})` }); glow.append(n.glow);
      n.core = mk('path', 'lk-core', { stroke: `url(#lk-g-${n.k})` }); core.append(n.core);
      n.dots = [0, 1, 2, 3].map(j => { const c = mk('circle', 'lk-dot', { r: j % 2 ? 1.7 : 2.5 }); c.style.opacity = 0; fx.append(c); return c; });
    }
    return n;
  });
  const good = nodes.filter(n => !n.farm), farms = nodes.filter(n => n.farm);
  farms.forEach((n, i) => n.li.style.setProperty('--fd', (i * .12).toFixed(2) + 's'));
  const byK = Object.fromEntries(nodes.map(n => [n.k, n]));
  const arts = $$('[data-lk-a]'), rows = $$('[data-lk-row]'), months = $$('[data-lk-mo]');

  /* ---------------- Geometry ---------------- */
  let H = { x: 0, y: 0, hw: 1, hh: 1 }, hubOff = { x: 0, y: 0 }, cut = .5;
  const geo = () => {
    svg.setAttribute('viewBox', `0 0 ${map.clientWidth} ${map.clientHeight}`);
    cut = phone.matches ? .34 : .5;
    H = { x: hub.offsetLeft, y: hub.offsetTop, hw: site.offsetWidth / 2 + 8, hh: site.offsetHeight / 2 + 8 };
    nodes.forEach(n => { n.ax = n.li.offsetLeft; n.ay = n.li.offsetTop; n.hw = n.btn.offsetWidth / 2 + 5; n.hh = n.btn.offsetHeight / 2 + 5; });
  };
  const lerp = (p, q, t) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
  // Where the line from a box's centre toward a point leaves the box
  const edge = (cx, cy, hw, hh, tx, ty) => { const dx = tx - cx, dy = ty - cy, s = Math.min(1, hw / (Math.abs(dx) || 1e-6), hh / (Math.abs(dy) || 1e-6)); return { x: cx + dx * s, y: cy + dy * s }; };
  // One quadratic curve per link, bent the same way for every source, so the links swirl into the site
  const curve = n => {
    const ax = n.ax + n.ox, ay = n.ay + n.oy, bx = H.x + hubOff.x, by = H.y + hubOff.y;
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1, bend = n.farm ? 0 : len * .14;
    n.c = { x: ax + dx / 2 - dy / len * bend, y: ay + dy / 2 + dx / len * bend };
    n.a = edge(ax, ay, n.hw, n.hh, n.c.x, n.c.y); n.b = edge(bx, by, H.hw, H.hh, n.c.x, n.c.y);
  };
  const at = (n, t) => lerp(lerp(n.a, n.c, t), lerp(n.c, n.b, t), t);
  const part = (n, t) => { const q = lerp(n.a, n.c, t), p = lerp(q, lerp(n.c, n.b, t), t); return { d: `M${f(n.a.x)} ${f(n.a.y)}Q${f(q.x)} ${f(q.y)} ${f(p.x)} ${f(p.y)}`, p }; };
  const draw = n => {
    curve(n);
    if (n.farm) {
      const t = n.t * cut;
      if (t <= 0) return n.path.removeAttribute('d');
      const s = part(n, t);
      n.path.setAttribute('d', s.d); n.cut.setAttribute('transform', `translate(${f(s.p.x)} ${f(s.p.y)})`); n.tip = s.p;
      return;
    }
    if (n.on || n.t > 0) n.plan.removeAttribute('d'); else n.plan.setAttribute('d', part(n, 1).d);
    n.grad.setAttribute('x1', f(n.a.x)); n.grad.setAttribute('y1', f(n.a.y)); n.grad.setAttribute('x2', f(n.b.x)); n.grad.setAttribute('y2', f(n.b.y));
    if (n.t <= 0) { n.glow.removeAttribute('d'); n.core.removeAttribute('d'); return; }
    const s = part(n, n.t);
    n.glow.setAttribute('d', s.d); n.core.setAttribute('d', s.d); n.tip = s.p;
    if (n.head) for (const c of n.head) { c.setAttribute('cx', f(s.p.x)); c.setAttribute('cy', f(s.p.y)); }
  };
  // Authority streaming in: four particles a link, faster as they near the site
  const stream = (n, now) => n.dots.forEach((c, j) => {
    if (!n.on) { c.style.opacity = 0; return; }
    const t = ((now / 1900 + j / 4 + n.ph) % 1), e = Math.pow(t, 1.35), p = at(n, e);
    c.setAttribute('cx', f(p.x)); c.setAttribute('cy', f(p.y));
    c.style.opacity = Math.min(1, t * 6, (1 - t) * 8).toFixed(2);
  });
  const still = () => {
    nodes.forEach(n => { n.ox = n.oy = 0; n.btn.style.translate = ''; });
    hubOff = { x: 0, y: 0 }; site.style.translate = '';
    nodes.forEach(draw);
    good.forEach(n => n.dots.forEach((c, j) => { if (!n.on || j > 2) { c.style.opacity = 0; return; } const p = at(n, .3 + j * .25); c.setAttribute('cx', f(p.x)); c.setAttribute('cy', f(p.y)); c.style.opacity = .85; }));
  };

  /* ---------------- The loop: floating cards, parallax, links, particles, sparks ---------------- */
  let raf = 0, inView = false, mx = 0, my = 0, tx = 0, ty = 0;
  const sparks = [];
  const scene = now => {
    raf = requestAnimationFrame(scene);
    mx += (tx - mx) * .06; my += (ty - my) * .06;
    const amp = phone.matches ? 2.5 : 4.5;
    hubOff = { x: mx * 4, y: my * 3 + Math.sin(now / 2600) * 2 };
    site.style.translate = `${f(hubOff.x)}px ${f(hubOff.y)}px`;
    nodes.forEach(n => {
      const a = (now / n.per + n.ph) * Math.PI * 2;
      n.ox = Math.sin(a) * amp * .6 + mx * n.d * 8; n.oy = Math.cos(a * .8) * amp + my * n.d * 6;
      n.btn.style.translate = `${f(n.ox)}px ${f(n.oy)}px`;
      draw(n);
    });
    good.forEach(n => stream(n, now));
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i], age = (now - s.born) / 520;
      if (age >= 1) { s.el.remove(); sparks.splice(i, 1); continue; }
      s.el.setAttribute('cx', f(s.x + s.vx * age)); s.el.setAttribute('cy', f(s.y + s.vy * age + 14 * age * age));
      s.el.style.opacity = (1 - age).toFixed(2);
    }
  };
  const loop = on => { if (on && motion && !raf) raf = requestAnimationFrame(scene); if (!on && raf) { cancelAnimationFrame(raf); raf = 0; } };
  map.addEventListener('mousemove', e => { if (!mouse.matches) return; const r = map.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2; });
  map.addEventListener('mouseleave', () => { tx = ty = 0; });

  /* ---------------- Tweens, cancelled together when the map starts over ---------------- */
  let run = { alive: false }, timers = [];
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const tween = (dur, fn, done, tok = run) => {
    const t0 = performance.now();
    const tick = now => { if (!tok.alive) return; const t = Math.min(1, (now - t0) / dur); fn(ease(t)); if (t < 1) requestAnimationFrame(tick); else if (done) done(); };
    requestAnimationFrame(tick);
  };
  const later = (ms, fn, tok = run) => timers.push(setTimeout(() => { if (tok.alive) fn(); }, ms));

  /* ---------------- The big numbers, the gauge and the search ---------------- */
  let links = 0, score = BASE, shown = BASE;
  const gauge = v => {
    shown = v;
    arc.style.strokeDashoffset = f(100 - v);
    const a = Math.PI * v / 100;
    knob.setAttribute('cx', f(100 - 80 * Math.cos(a))); knob.setAttribute('cy', f(100 - 80 * Math.sin(a)));
    scoreEl.textContent = Math.round(v);
    const k = Math.max(0, (v - BASE) / 24).toFixed(2);
    aura.style.setProperty('--a', k); site.style.setProperty('--a', k);
  };
  const toScore = v => { score = v; if (!motion) return gauge(v); const from = shown; tween(900, e => gauge(from + (v - from) * e)); };
  const pop = (el, txt, bad) => { el.textContent = txt; el.classList.toggle('is-bad', !!bad); el.classList.remove('is-on'); void el.offsetWidth; el.classList.add('is-on'); };
  const bump = el => { if (motion && el.animate) el.animate([{ transform: 'translateY(40%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }); };
  const setLinks = v => { links = v; linksEl.textContent = v; };
  const place = () => [...serp.children].indexOf(me) + 1;
  const showPlace = () => {
    const p = place(), up = PLACES[0] - p;
    rankEl.textContent = p;
    upEl.textContent = up ? up + (up > 1 ? ' pladser op' : ' plads op') : 'før de nye links';
    sup.textContent = up ? '↑ ' + up : '';
    const max = serp.children.length - 5;
    serp.style.transform = `translateY(${-Math.min(max, Math.max(0, p - 3)) * me.offsetHeight}px)`;
  };
  const setPlace = p => {
    serp.style.transition = 'none';
    me.remove(); serp.insertBefore(me, serp.children[p - 1] || null);
    showPlace(); void serp.offsetWidth; serp.style.transition = '';
  };
  // One place at a time: the row slides up past the one above it, and the list scrolls along
  const climb = (to, tok) => {
    const prev = me.previousElementSibling;
    if (place() <= to || !prev) return;
    const a = me.offsetTop, b = prev.offsetTop;
    serp.insertBefore(me, prev);
    if (motion) {
      const o = { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)' };
      me.animate([{ transform: `translateY(${a - me.offsetTop}px)` }, { transform: 'none' }], o);
      prev.animate([{ transform: `translateY(${b - prev.offsetTop}px)` }, { transform: 'none' }], o);
    }
    showPlace(); bump(rankEl);
    if (place() > to) later(420, () => climb(to, tok), tok);
  };
  const setMonth = m => months.forEach((li, i) => {
    const mo = i + 1, n = good.filter(x => x.m === mo), got = n.filter(x => x.on).length;
    li.classList.toggle('is-now', mo === m && got < n.length);
    li.classList.toggle('is-done', got === n.length);
    li.style.setProperty('--f', (got / n.length).toFixed(2));
  });

  /* ---------------- The article for a source ---------------- */
  let sel = null, picked = false;
  const select = k => {
    if (k === sel) return;
    sel = k;
    nodes.forEach(n => {
      const on = n.k === k;
      n.btn.setAttribute('aria-pressed', String(on));
      if (n.farm) return;
      n.glow.classList.toggle('is-sel', on); n.core.classList.toggle('is-sel', on);
      if (on) { glow.append(n.glow); core.append(n.core); }
    });
    rows.forEach(r => r.classList.toggle('is-sel', r.dataset.lkRow === k));
    arts.forEach(a => { const on = a.dataset.lkA === k; a.hidden = !on; a.classList.remove('is-show'); if (on) { void a.offsetWidth; a.classList.add('is-show'); } });
  };
  const show = (k, from) => {
    if (!picked) { picked = true; artBox.setAttribute('aria-live', 'polite'); }
    select(k);
    // Phones and tablets: the article sits under the map, so bring it up when it is out of sight
    const r = arts.find(x => x.dataset.lkA === k).getBoundingClientRect();
    if (from === 'row' ? (r.top < 70 || r.top > innerHeight - 160) : r.top > innerHeight - 120) {
      scrollTo({ top: scrollY + r.top - Math.max(80, (innerHeight - r.height) / 2), behavior: motion ? 'smooth' : 'auto' });
    }
  };

  /* ---------------- One link: it draws itself in, lands, and starts streaming ---------------- */
  const land = n => {
    n.on = true; n.t = 1;
    if (n.head) { n.head.forEach(c => c.remove()); n.head = null; }
    n.li.classList.add('is-on');
    rows.find(r => r.dataset.lkRow === n.k).classList.add('is-on');
    setMonth(n.m);
    setLinks(links + 1);
    toScore(score + n.pts);
    if (!motion) return;
    bump(linksEl); pop(lchip, '+1'); pop(plusEl, '+' + n.pts);
    site.classList.remove('is-pulse'); void site.offsetWidth; site.classList.add('is-pulse');
    const ring = document.createElement('span'); ring.className = 'lk-ring'; ring.addEventListener('animationend', () => ring.remove());
    const chip = document.createElement('span'); chip.className = 'lk-chip'; chip.textContent = '+1 link'; chip.addEventListener('animationend', () => chip.remove());
    hub.append(ring, chip);
    if (!picked) select(n.k);
    later(450, () => climb(PLACES[links], run));
  };
  const linkIn = (n, tok) => {
    n.head = [mk('circle', 'lk-halo', { r: 13 }), mk('circle', 'lk-head', { r: 4.5 })];
    fx.append(...n.head);
    tween(1100, e => { n.t = e; if (!raf) draw(n); }, () => land(n), tok);
  };

  /* ---------------- The run: three months, two links a month ---------------- */
  let state = 'idle';
  const reset = () => {
    good.forEach(n => { n.on = false; n.t = 0; n.li.classList.remove('is-on'); if (n.head) { n.head.forEach(c => c.remove()); n.head = null; } });
    rows.forEach(r => r.classList.remove('is-on'));
    setMonth(1); months.forEach(li => li.classList.remove('is-now', 'is-done'));
    setLinks(0); score = BASE; gauge(BASE); setPlace(PLACES[0]);
    if (!picked) select(good[0].k);
    nodes.forEach(draw);
  };
  const finish = () => {
    good.forEach(n => { n.on = true; n.t = 1; n.li.classList.add('is-on'); });
    rows.forEach(r => r.classList.add('is-on'));
    setMonth(4);
    setLinks(good.length); score = BASE + good.reduce((s, n) => s + n.pts, 0); gauge(score); setPlace(PLACES[PLACES.length - 1]);
    lk.classList.add('is-in', 'is-ready'); state = 'done';
    if (!sel) select(good[0].k);
    still();
  };
  const play = () => {
    run.alive = false; timers.forEach(clearTimeout); timers = [];
    run = { alive: true }; const tok = run;
    state = 'run'; lk.classList.remove('is-ready');
    reset(); lk.classList.add('is-in');
    // A farm link still drawing when the map starts over is finished at once
    if (farm) farms.forEach(n => { n.t = .78; n.cut.classList.add('is-on'); });
    step(1);
    let t = 1300;
    [1, 2, 3].forEach(m => {
      later(t, () => months[m - 1].classList.add('is-now'));
      good.filter(n => n.m === m).forEach(n => { later(t + 150, () => linkIn(n, tok)); t += 1750; });
      later(t + 600, () => step(m + 1));
      t += 500;
    });
    later(t + 400, () => { lk.classList.add('is-ready'); state = 'done'; });
  };

  /* ---------------- Link farms: in with a glitch, the link snaps with a spark ---------------- */
  let farm = false, ftok = { alive: false }, lastGood = null;
  const snap = n => {
    const p = n.tip;
    if (p && raf) for (let i = 0; i < 10; i++) {
      const a = Math.random() * Math.PI * 2, v = 14 + Math.random() * 26, el = mk('circle', 'lk-spark', { r: (1 + Math.random() * 1.6).toFixed(1), cx: f(p.x), cy: f(p.y) });
      fx.append(el); sparks.push({ el, x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, born: performance.now() });
    }
    tween(260, e => { n.t = 1 - .22 * e; }, null, ftok);
    n.cut.classList.add('is-on');
  };
  const setFarm = on => {
    farm = on; ftok.alive = false; ftok = { alive: true };
    lk.classList.toggle('is-farm', on);
    farmBtn.setAttribute('aria-pressed', String(on));
    farms.forEach((n, i) => {
      n.btn.tabIndex = on ? 0 : -1;
      if (!on) { n.cut.classList.remove('is-on'); return; }
      if (!motion || !raf) { n.t = .78; n.cut.classList.add('is-on'); draw(n); return; }
      n.t = 0; n.cut.classList.remove('is-on');
      later(480 + i * 150, () => tween(650, e => { n.t = e; }, () => snap(n), ftok), ftok);
    });
    if (on) {
      pop(plusEl, '+0', true);
      if (sel && !byK[sel].farm) lastGood = sel;
      select(farms[0].k);
    } else {
      plusEl.classList.remove('is-on');
      if (sel && byK[sel].farm) select(lastGood || good[0].k);
    }
  };
  farmBtn.addEventListener('click', () => { ev(farm ? 'linkfarm-fra' : 'linkfarm-til'); setFarm(!farm); });

  nodes.forEach(n => n.btn.addEventListener('click', () => { ev('kilde-' + n.k); show(n.k, 'map'); }));
  $$('[data-lk-pick]').forEach(b => b.addEventListener('click', () => { ev('rapport-' + b.dataset.lkPick); show(b.dataset.lkPick, 'row'); }));
  $('[data-lk-again]').addEventListener('click', () => { ev('afspil-igen'); play(); });

  /* ---------------- Start ---------------- */
  geo();
  new ResizeObserver(() => { geo(); if (!raf) still(); }).observe(map);
  if (document.fonts) document.fonts.ready.then(() => { geo(); if (!raf) still(); });
  if (motion && 'IntersectionObserver' in window) {
    reset();
    new IntersectionObserver(es => es.forEach(e => {
      inView = e.isIntersecting;
      loop(inView);
      if (inView && state === 'idle' && e.intersectionRatio >= .3) play();
    }), { threshold: [0, .3] }).observe(map);
    document.addEventListener('visibilitychange', () => loop(inView && !document.hidden));
  } else {
    finish();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { step(1); step(4); io.disconnect(); } });
      io.observe(map);
    }
  }
}
