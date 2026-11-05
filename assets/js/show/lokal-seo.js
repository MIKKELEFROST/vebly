// Local SEO showcase (/services/lokal-seo): an annotated anatomy of an example business profile on Google Maps
// (Nordvik, a carpenter in København: an example, never a real business). Seven labels sit beside the
// phone with thin leader lines to their parts. When the phone comes into view the search types itself,
// the lines draw out from the profile and the labels pop in one by one (time-based, never tied to the
// scroll). Hover or focus on a label rings its part, and hovering a part lights up its label. "Kortet"
// swaps the profile for the local pack, and the lines draw again to Nordvik's place in it.
// Below 1024px the labels are a list: a tap scrolls the part into view and pulses it.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--lokal-seo');
if (root) {
  try { init(root); } catch (e) { root.classList.add('is-in', 'is-lin', 'is-done'); throw e; }
}

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const stage = $('[data-an-stage]'), svg = $('[data-an-svg]'), ph = $('.an-ph'), dev = $('[data-an-dev]');
  const row = $('[data-an-row]'), q = $('[data-an-q]'), list = $('.an__list'), segs = $$('[data-an-view]');
  const wide = matchMedia('(min-width: 1024px)');
  const ev = action => track('showcase_interact', { showcase: 'lokal-seo', action });
  const svgEl = (n, c, a = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', n); e.setAttribute('class', c); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const f = n => n.toFixed(1), GAP = 4;
  const parts = $$('[data-an-p]'), keysOf = p => p.dataset.anP.split(' ');
  const lines = svgEl('g', 'an-lns'), dots = svgEl('g', 'an-dots');
  svg.append(lines, dots);

  // One entry per label: its button, the parts it rings, its line and the dot on the part
  const items = $$('[data-an-k]').map(btn => {
    const k = btn.dataset.anK, a = $(`[data-an-a="${k}"]`);
    const it = { k, btn, a, side: btn.dataset.side === 'l' ? -1 : 1, ps: parts.filter(p => keysOf(p).includes(k)), main: a.closest('[data-an-p]'), m: 0 };
    it.ln = svgEl('path', 'an-ln', { pathLength: 1 });
    it.halo = svgEl('circle', 'an-halo', { r: 9 });
    it.dot = svgEl('circle', 'an-dot', { r: 3.2 });
    lines.append(it.ln); dots.append(it.halo, it.dot);
    return it;
  });

  // Where an element sits in the stage, from the layout: the entrance and the sheets' slides are ignored
  const pos = e => { const w = e.offsetWidth, h = e.offsetHeight; let x = 0, y = 0; for (; e && e !== stage; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; } return { x, y, w, h }; };

  /* ---------------- Layout: labels at the height of their part, then the lines ---------------- */
  let isW = false, view = 0, started = false;
  const layout = () => {
    isW = wide.matches;
    root.classList.toggle('is-wide', isW);
    const H = stage.offsetHeight, P = pos(ph);
    svg.setAttribute('viewBox', `0 0 ${stage.offsetWidth} ${H}`);
    items.forEach(it => { const p = pos(it.a); it.A = { x: it.side < 0 ? p.x - 10 : p.x + p.w + 10, y: p.y + p.h / 2 }; });
    if (isW) for (const s of [-1, 1]) {
      // Each label level with its part. Labels that would overlap move apart as a group, around the
      // average of where they want to be, so the lines stay as straight as they can
      const col = items.filter(it => it.side === s).sort((a, b) => a.A.y - b.A.y), cl = [];
      col.forEach(it => {
        const t = it.btn.firstElementChild;
        it.o = t.offsetTop + t.offsetHeight / 2; it.h = it.btn.offsetHeight;
        cl.push({ list: [it], h: it.h, top: it.A.y - it.o });
        for (let p, n; cl.length > 1 && (p = cl[cl.length - 2]).top + p.h + GAP > (n = cl[cl.length - 1]).top;) {
          const list = p.list.concat(n.list);
          let off = 0, sum = 0;
          list.forEach(x => { sum += x.A.y - x.o - off; off += x.h + GAP; });
          cl.splice(-2, 2, { list, h: off - GAP, top: sum / list.length });
        }
      });
      cl.forEach(c => { let y = Math.max(0, Math.min(c.top, H - c.h)); c.list.forEach(it => { it.t = y; y += it.h + GAP; }); });
      col.forEach(it => it.btn.style.setProperty('--t', f(it.t) + 'px'));
    }
    items.forEach(it => {
      const b = pos(it.btn);
      it.L = { x: it.side < 0 ? b.x + b.w + 2 : b.x - 2, y: b.y + (it.o || 0) };
      it.kx = it.side < 0 ? P.x - 16 : P.x + P.w + 16;
    });
    // Kortet: every line on a side meets at the middle of that side of Nordvik's row
    const r = pos(row);
    items.forEach(it => { it.R = { x: it.side < 0 ? r.x - 7 : r.x + r.w + 7, y: r.y + r.h / 2 }; });
    if (started && isW) root.classList.add('is-lin');
    draw();
  };
  // Profilen: from the part straight out past the phone, a soft bend, then on to the label.
  // Kortet (it.m = 1): from Nordvik's row, one straight ray to each label, a fan on each side
  const draw = () => items.forEach(it => {
    const t = it.m, ax = it.A.x + (it.R.x - it.A.x) * t, ay = it.A.y + (it.R.y - it.A.y) * t;
    for (const c of [it.dot, it.halo]) { c.setAttribute('cx', f(ax)); c.setAttribute('cy', f(ay)); }
    if (!isW) return it.ln.removeAttribute('d');
    const { L, kx, side } = it, b = side * Math.min(44, Math.abs(kx - L.x) * .55), u = 1 - t;
    const mix = (p, q) => p * u + q * t, dx = L.x - kx, dy = L.y - ay;
    const c1x = mix(kx + b / 2, kx + dx / 3), c1y = mix(ay, ay + dy / 3), c2x = mix(kx + b / 2, kx + dx * 2 / 3), c2y = mix(L.y, ay + dy * 2 / 3), ex = mix(kx + b, L.x);
    it.ln.setAttribute('d', `M${f(ax)} ${f(ay)}H${f(kx)}C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(ex)} ${f(L.y)}H${f(L.x)}`);
  });

  /* ---------------- Profilen / Kortet ---------------- */
  // The lines fade while the sheets slide, then draw themselves again from their new ends, one by one
  let swap = 0;
  const redraw = () => {
    items.forEach(it => { it.m = view; });
    draw();
    root.classList.remove('is-swap');
    if (!started) return;
    [...items].sort((a, b) => a.L.y - b.L.y).forEach((it, j) => {
      const o = { delay: j * 55, fill: 'backwards' };
      it.ln.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { ...o, duration: 520, easing: 'cubic-bezier(.4,.1,.2,1)' });
      it.dot.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { ...o, duration: 420, easing: 'cubic-bezier(.2,1.7,.4,1)' });
    });
  };
  const setView = v => {
    if (v === view) return;
    view = v;
    root.classList.toggle('is-map', !!v);
    segs.forEach(b => { const on = (b.dataset.anView === 'kort') === !!v; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    setHot(hot, true);
    clearTimeout(swap);
    if (motion && isW && lines.animate) { root.classList.add('is-swap'); swap = setTimeout(redraw, 640); } else { items.forEach(it => { it.m = v; }); draw(); }
  };
  segs.forEach(b => b.addEventListener('click', () => { const v = b.dataset.anView === 'kort' ? 1 : 0; if (v !== view) { ev(v ? 'vis-kort' : 'vis-profil'); setView(v); } }));

  /* ---------------- A part in focus ---------------- */
  let hot = null, tap = null, pt = 0, ut = 0;
  const setHot = (k, force) => {
    if (k === hot && !force) return;
    hot = k;
    root.classList.toggle('is-focus', !!k);
    root.classList.toggle('is-kat', k === 'kat' && !view);
    items.forEach(it => { const on = it.k === k; for (const e of [it.btn, it.ln, it.dot, it.halo]) e.classList.toggle('is-hot', on); if (on) lines.append(it.ln); });
    parts.forEach(p => p.classList.toggle('is-hot', !view && !!k && keysOf(p).includes(k)));
  };
  const back = () => setHot((document.activeElement && root.contains(document.activeElement) && document.activeElement.dataset.anK) || tap);
  const pulse = (it, wait) => {
    clearTimeout(pt);
    pt = setTimeout(() => it.ps.forEach(p => { p.classList.remove('is-pulse'); void p.offsetWidth; p.classList.add('is-pulse'); }), wait);
  };
  const pick = (it, from) => {
    let wait = 0;
    if (view) { setView(0); wait = 650; }
    tap = it.k; setHot(it.k);
    clearTimeout(ut); ut = setTimeout(() => { tap = null; back(); }, 5000);
    // Phones and tablets: bring the part into view first
    if (!isW && from === 'list') {
      const r = it.main.getBoundingClientRect();
      if (r.top < 90 || r.bottom > innerHeight - 20) { scrollTo({ top: scrollY + r.top + r.height / 2 - innerHeight * .42, behavior: motion ? 'smooth' : 'auto' }); wait = Math.max(wait, motion ? 480 : 0); }
    }
    pulse(it, wait);
  };
  items.forEach(it => {
    it.btn.addEventListener('mouseenter', () => setHot(it.k));
    it.btn.addEventListener('mouseleave', back);
    it.btn.addEventListener('focus', () => setHot(it.k));
    it.btn.addEventListener('blur', () => setTimeout(back));
    it.btn.addEventListener('click', () => { ev('del-' + it.k); pick(it, 'list'); });
  });
  const partAt = e => { const p = e.target.closest && e.target.closest('[data-an-p]'); return p && items.find(it => it.k === keysOf(p)[0]); };
  dev.addEventListener('mouseover', e => { const it = partAt(e); if (it) setHot(it.k); else back(); });
  dev.addEventListener('mouseleave', back);
  dev.addEventListener('click', e => { const it = partAt(e); if (it) pick(it, 'part'); });

  /* ---------------- Entrance ---------------- */
  const words = [...q.children], full = words.map(w => w.textContent);
  let typing = false;
  const typeQ = (wait = 250) => {
    if (typing || !motion) return;
    typing = true;
    const n = full.join('').length, t0 = performance.now() + wait;
    words.forEach(w => { w.textContent = ''; });
    root.classList.add('is-typing');
    const tick = now => {
      const c = Math.floor((now - t0) / 52);
      let o = 0;
      words.forEach((w, i) => { const s = full[i].slice(0, Math.max(0, c - o)); o += full[i].length; if (w.textContent !== s) w.textContent = s; });
      if (c < n) requestAnimationFrame(tick); else { typing = false; setTimeout(() => { if (!typing) root.classList.remove('is-typing'); }, 1400); }
    };
    requestAnimationFrame(tick);
  };
  // The search looks like a field, so a click searches again: it types itself and the results show
  $('.an__q').addEventListener('click', () => { ev('soeg'); typeQ(0); setView(1); });
  const listIn = () => root.classList.add('is-lin');
  const start = () => {
    if (started) return;
    started = true;
    root.classList.add('is-in');
    if (isW || list.getBoundingClientRect().top < innerHeight) listIn();
    track('showcase_step', { showcase: 'lokal-seo', step: 1 });
    typeQ();
    setTimeout(() => { root.classList.add('is-done'); track('showcase_step', { showcase: 'lokal-seo', step: 2 }); }, motion ? 2200 + items.length * 130 : 0);
  };

  layout();
  // The cascade runs down the profile, part by part
  [...items].sort((a, b) => a.A.y - b.A.y).forEach((it, j) => {
    const d = .7 + j * .13;
    for (const e of [it.ln, it.dot]) e.style.setProperty('--d', d.toFixed(2) + 's');
    it.btn.style.setProperty('--dl', (isW ? d + .42 : j * .07).toFixed(2) + 's');
  });
  // Large screens start when a third of the phone shows; phones (a tall phone over a list) sooner,
  // and there the list pops in on its own as soon as it scrolls into view
  if (motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      if (e.target === ph && e.intersectionRatio >= (isW ? .3 : .12)) { start(); io.unobserve(ph); }
      if (e.target === list && !isW) { listIn(); io.unobserve(list); }
    }), { threshold: [0, .12, .3] });
    io.observe(ph); io.observe(list);
  } else start();

  let lt = 0;
  const relayout = () => { cancelAnimationFrame(lt); lt = requestAnimationFrame(layout); };
  // The stage, and the window too: the gap beside the phone follows the window width even when the stage keeps its size
  new ResizeObserver(relayout).observe(stage);
  addEventListener('resize', relayout);
  if (wide.addEventListener) wide.addEventListener('change', relayout);
  if (document.fonts) document.fonts.ready.then(relayout);
}
