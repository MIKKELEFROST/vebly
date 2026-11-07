// Bing Ads showcase (/services/bing-ads): import and mirror. Klarvask (a made-up cleaning company) has four search
// campaigns in a Google Ads-like account; the Microsoft Advertising-like account beside it is empty. "Importér"
// copies them: each row flies across on an arc (requestAnimationFrame, transform only) and lands, the budgets are
// fitted to Bing and the campaigns go live. Then the Bing-like results page below shows the same ad for the same
// search; a click on a campaign shows its ad. If the visitor has not pressed Importér a while after the section
// came into view, a pointer does it. Without motion: imported and live from the start, and the button still works.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--bing-ads');
if (root) {
  try { init(root); } catch (e) { const im = root.querySelector('[data-im]'); if (im) im.classList.add('is-done'); throw e; }
}

function init(root) {
  const SC = 'bing-ads', motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  let ADS;
  try { ADS = JSON.parse($('[data-im-data]').textContent); } catch (x) { return; }
  const im = $('[data-im]'), go = $('[data-im-go]'), gol = $('[data-im-gol]'), st = $('[data-im-st]');
  const serp = $('[data-im-serp]'), ad = $('[data-im-ad]'), cur = $('[data-im-cur]');
  const gRows = $$('[data-im-g]'), slots = $$('[data-im-slot]'), mRows = slots.map(s => s.firstElementChild);
  const field = { q: $('[data-im-q]'), u: $('[data-im-u]'), h: $('[data-im-h]'), t: $('[data-im-t]'), sl: $('[data-im-sl]') };
  const N = gRows.length;
  const ev = action => track('showcase_interact', { showcase: SC, action });
  const steps = new Set(), step = n => { if (!steps.has(n)) { steps.add(n); track('showcase_step', { showcase: SC, step: n }); } };
  let state = 'idle', sel = -1, landed = 0, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const label = () => {
    gol.textContent = state === 'done' ? 'Importér igen' : state === 'run' ? 'Importerer …' : 'Importér';
    go.setAttribute('aria-disabled', String(state === 'run'));
  };

  /* ---------------- A campaign's ad on Bing ---------------- */
  const pick = (i, swap) => {
    sel = i;
    mRows.forEach((b, j) => b.setAttribute('aria-pressed', String(j === i)));
    gRows.forEach((r, j) => r.classList.toggle('is-twin', j === i));
    const a = ADS[i];
    field.q.textContent = a.q; field.u.textContent = a.u; field.h.textContent = a.h; field.t.textContent = a.t;
    field.sl.replaceChildren(...a.s.map(s => { const e = document.createElement('span'); e.textContent = s; return e; }));
    if (swap && motion) { ad.classList.remove('is-swap'); void ad.offsetWidth; ad.classList.add('is-swap'); }
  };
  mRows.forEach((b, i) => b.addEventListener('click', () => {
    if (state !== 'done' || i === sel) return;
    pick(i, true);
    ev('kampagne');
  }));

  /* ---------------- The flight: a copy of the row on an arc, from its place to its slot ---------------- */
  const flights = new Set(), DUR = 940;
  let raf = 0;
  const frame = now => {
    raf = 0;
    flights.forEach(o => {
      const t = Math.min(1, Math.max(0, (now - o.t0) / DUR)), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(2 - 2 * t, 3) / 2;
      const u = 1 - e, k = Math.sin(Math.PI * e), x = 2 * u * e * o.cx + e * e * o.dx, y = 2 * u * e * o.cy + e * e * o.dy;
      o.c.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(o.rot * k).toFixed(2)}deg) scale(${((1 + (o.sx - 1) * e) * (1 - .1 * k)).toFixed(3)},${((1 + (o.sy - 1) * e) * (1 - .1 * k)).toFixed(3)})`;
      if (t >= 1) { flights.delete(o); o.c.remove(); land(o.i); }
    });
    if (flights.size) raf = requestAnimationFrame(frame);
  };
  const fly = i => {
    const src = gRows[i], b = im.getBoundingClientRect(), s = src.getBoundingClientRect(), d = slots[i].getBoundingClientRect();
    const c = src.cloneNode(true);
    c.removeAttribute('data-im-g');
    c.classList.remove('is-twin');
    c.classList.add('im-fly', 'is-sent');
    c.setAttribute('aria-hidden', 'true');
    c.style.cssText = `left:${s.left - b.left}px;top:${s.top - b.top}px;width:${s.width}px;height:${s.height}px`;
    im.append(c);
    src.classList.add('is-sent');
    st.textContent = `Importerer ${i + 1} af ${N}`;
    // Centre to centre; across: a high arc over the button, down (phones): a soft bend to the side
    const dx = d.left + d.width / 2 - s.left - s.width / 2, dy = d.top + d.height / 2 - s.top - s.height / 2, across = Math.abs(dx) > Math.abs(dy);
    flights.add({ c, i, t0: performance.now(), dx, dy, sx: d.width / s.width, sy: d.height / s.height,
      cx: across ? dx / 2 : 34, cy: across ? dy / 2 - 120 + i * 14 : dy / 2, rot: across ? -4 : 3 });
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const land = i => {
    slots[i].classList.add('is-in', 'is-land');
    if (++landed < N) return;
    step(3);
    st.textContent = 'Tilpasser budgetter til Bing …';
    slots.forEach((s, j) => later(() => s.classList.add('is-live'), 380 + j * 220));
    later(live, 380 + N * 220 + 420);
  };

  /* ---------------- Import, finish and start over ---------------- */
  const live = () => {
    im.classList.remove('is-run', 'is-wait');
    im.classList.add('is-done');
    gRows.forEach(r => r.classList.add('is-sent'));
    slots.forEach(s => s.classList.add('is-in', 'is-live'));
    st.textContent = `${N} kampagner · tilpasset til Bing`;
    serp.classList.add('is-live');
    pick(0);
    if (state === 'run') step(4);
    state = 'done';
    label();
  };
  const reset = () => {
    timers.forEach(clearTimeout); timers = [];
    flights.forEach(o => o.c.remove()); flights.clear();
    landed = 0; sel = -1;
    im.classList.remove('is-run', 'is-done');
    gRows.forEach(r => r.classList.remove('is-sent', 'is-twin'));
    slots.forEach(s => s.classList.remove('is-in', 'is-land', 'is-live'));
    mRows.forEach(b => b.setAttribute('aria-pressed', 'false'));
    serp.classList.remove('is-live');
    st.textContent = 'Ingen kampagner endnu';
  };
  const run = () => {
    if (state === 'run') return;
    clearTimeout(auto); clearTimeout(skip);
    reset();
    state = 'run'; label();
    im.classList.remove('is-wait');
    im.classList.add('is-run');
    st.textContent = 'Henter fra Google Ads …';
    step(2);
    if (!motion) { later(live, 700); return; }
    gRows.forEach((r, i) => later(() => fly(i), 520 + i * 300));
  };
  go.addEventListener('click', () => {
    if (state === 'run') return;
    touched = true;
    ev(state === 'done' ? 'igen' : 'importer');
    run();
  });

  /* ---------------- The pointer that presses Importér when nobody does ---------------- */
  let auto = 0, skip = 0, touched = false;
  const hand = () => {
    if (state !== 'idle' || touched) return;
    const b = im.getBoundingClientRect(), r = go.getBoundingClientRect();
    const x = r.left - b.left + r.width * .62, y = r.top - b.top + r.height * .55;
    cur.style.transition = 'none';
    cur.style.transform = `translate(${x + 130}px,${y + 110}px)`;
    void cur.offsetWidth;
    cur.style.transition = '';
    cur.classList.add('is-on');
    cur.style.transform = `translate(${x}px,${y}px)`;
    later(() => {
      if (state !== 'idle' || touched) { cur.classList.remove('is-on'); return; }
      go.classList.add('is-press');
      later(() => go.classList.remove('is-press'), 200);
      run();
      later(() => cur.classList.remove('is-on'), 500);
    }, 1100);
  };
  const wait = () => { clearTimeout(auto); if (motion && state === 'idle' && !touched) auto = setTimeout(hand, 5200); };
  const own = () => { touched = true; clearTimeout(auto); };
  go.addEventListener('pointerenter', own);
  go.addEventListener('focus', own);

  /* ---------------- Start ---------------- */
  label();
  if (!motion) live();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && e.intersectionRatio >= .35) {
        step(1);
        if (state === 'idle') { im.classList.add('is-wait'); wait(); }
      } else clearTimeout(auto);
    }), { threshold: [0, .35] }).observe($('.im-win--m'));
    // Straight down to the results page without stopping at the accounts: import, so the ad shows up there
    new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting || e.intersectionRatio < .5 || state !== 'idle' || touched) return;
      if ($('.im-win--m').getBoundingClientRect().bottom < innerHeight * .25) { clearTimeout(skip); skip = setTimeout(run, 900); }
    }), { threshold: [0, .5] }).observe(serp);
  } else step(1);
}
