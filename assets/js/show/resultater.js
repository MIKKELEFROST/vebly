// /resultater (scripts/services/pages/resultater.mjs). The review scores roll in like the price odometer, the
// featured case opens like a magazine spread (the pages swing open from the fold, the new site lands on top
// of the old one, the result counts up while the arrow from the logo draws itself, and the numbers count
// from before to after), the cases filter by service (the cards glide to their new places) and count up
// their results, and the cards in "Skal du være den næste?" fan out. Does nothing unless .show--resultater
// is on the page. Without motion the HTML already shows the finished state; only the filter and the
// visitor's own name on the empty card are used then.
import { track } from '/assets/js/analytics.js';

if (document.querySelector('.show--resultater')) init();

function init() {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const eo = t => 1 - (1 - t) ** 3;
  const pad = n => String(n).padStart(2, '0');
  const ev = action => track('showcase_interact', { showcase: 'resultater', action });
  const seen = (el, fn, threshold = .25) => {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold });
    io.observe(el);
  };
  // "6,8 sek." → { a: '', n: 6.8, d: 1, z: ' sek.' }. Null when it does not start with a number (or a sign)
  const num = s => {
    const m = String(s || '').trim().match(/^([+−×-]?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(.*)$/);
    return m && { a: m[1], n: parseFloat(m[2].replace(/\./g, '') + '.' + (m[3] || '0')), d: m[3] ? m[3].length : 0, z: m[4] };
  };
  const show = (f, n) => f.a + n.toLocaleString('da-DK', { minimumFractionDigits: f.d, maximumFractionDigits: f.d }) + f.z;
  // Counts the text of el from one value to its own; it always ends on the exact text from the page
  const runs = new WeakMap();
  const count = (el, f, from, ms, delay, done) => {
    const id = {}, end = el.rsEnd || (el.rsEnd = el.textContent), t0 = performance.now() + delay;
    runs.set(el, id);
    el.textContent = show(f, from);
    const step = t => {
      if (runs.get(el) !== id) return;
      const k = clamp((t - t0) / ms);
      el.textContent = k < 1 ? show(f, from + (f.n - from) * eo(k)) : end;
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    };
    requestAnimationFrame(step);
  };

  /* ---------------- The real review scores ---------------- */
  const rev = $('[data-rs-rev]');
  if (rev && motion) {
    // Each digit rolls into place like the price odometer: 30 digits in a column, landing on the third round
    $$('[data-rs-odo]', rev).forEach((el, k) => {
      el.innerHTML = [...el.textContent.trim()].map((c, i) => /\d/.test(c)
        ? `<span class="rs-odo"><span data-d="${c}" style="transition-delay:${(k * .18 + i * .12).toFixed(2)}s">${'012345678901234567890123456789'.replace(/\d/g, '<span>$&</span>')}</span></span>`
        : `<span>${c}</span>`).join('');
    });
    const cnt = $$('[data-rs-cnt]', rev).map(el => [el, num(el.textContent)]).filter(([, f]) => f);
    cnt.forEach(([el, f]) => { el.rsEnd = el.textContent; el.textContent = show(f, 0); });
    rev.classList.add('rs-on');
    seen(rev, () => {
      $$('[data-d]', rev).forEach(c => { c.style.transform = `translateY(-${+c.dataset.d + 20}em)`; });
      cnt.forEach(([el, f], i) => count(el, f, 0, 1700, 250 + i * 180));
      setTimeout(() => rev.classList.add('is-lit'), 1000);
    }, .35);
  }

  /* ---------------- The featured case: a magazine spread ---------------- */
  const sp = $('[data-rs-spread]');
  if (sp && motion) {
    const sec = sp.closest('.show--resultater'), replay = $('[data-rs-replay]', sec);
    const big = $('[data-rs-big]', sp), bigF = big && num(big.textContent);
    const tiles = $$('[data-rs-tile]', sp).map(el => {
      const v = $('.rs-tile__v', el), f = num(v.textContent), from = num(v.dataset.fra);
      // Only when before and after are written the same way ("6,8 sek." → "0,9 sek."); else it simply lands
      return { el, v, f, from: f && from && from.a === f.a && from.z === f.z && from.d === f.d ? from.n : null };
    });
    // The three acts and when they start after the first, so a fast scroll still plays them in order
    const acts = [
      [$('.rs-pg--l', sp), 0, () => sp.classList.add('is-a1')],
      [$('.rs-pg--r', sp), 0, () => {
        sp.classList.add('is-a2');
        if (bigF) count(big, bigF, 0, 1500, 1000);
      }],
      [$('.rs-tiles', sp), 1050, () => {
        sp.classList.add('is-a3');
        tiles.forEach((t, i) => {
          const land = () => t.el.classList.add('is-done');
          if (t.from !== null) count(t.v, t.f, t.from, 1500, 250 + i * 160, land); else setTimeout(land, 900 + i * 160);
        });
        timers.push(setTimeout(() => { if (replay) replay.hidden = false; }, 2600));
      }]
    ];
    let t0 = 0, done = 0, best = 0, timers = [];
    const play = upto => {
      const now = performance.now();
      if (!done) t0 = now;
      for (; done <= upto; done++) {
        const [, at, fn] = acts[done], n = done + 1;
        timers.push(setTimeout(() => { fn(); while (best < n) track('showcase_step', { showcase: 'resultater', step: ++best }); }, Math.max(0, t0 + at - now)));
      }
    };
    // The start: before-values on the tiles, 0 on the result
    const reset = () => {
      timers.forEach(clearTimeout); timers = []; done = 0;
      sp.classList.add('rs-snap');
      sp.classList.remove('is-a1', 'is-a2', 'is-a3');
      tiles.forEach(t => { t.el.classList.remove('is-done'); runs.delete(t.v); if (t.from !== null) { t.v.rsEnd = t.v.rsEnd || t.v.textContent; t.v.textContent = show(t.f, t.from); } });
      if (bigF) { runs.delete(big); big.rsEnd = big.rsEnd || big.textContent; big.textContent = show(bigF, 0); }
      void sp.offsetWidth;
      sp.classList.remove('rs-snap');
    };
    sp.classList.add('rs-go');
    reset();
    acts.forEach(([el], i) => new IntersectionObserver((es, io) => {
      if (es.some(e => e.isIntersecting)) { io.disconnect(); if (done <= i) play(i); }
    }, { threshold: .2 }).observe(el));
    if (replay) replay.addEventListener('click', () => {
      replay.hidden = true;
      reset();
      requestAnimationFrame(() => play(2));
      ev('case-igen');
    });
    const cta = $('.rs-after__cta', sec);
    if (cta) cta.addEventListener('click', () => ev('case-cta'));
  }

  /* ---------------- The cases: filter by service ---------------- */
  const grid = $('[data-rs-grid]');
  if (grid) {
    const sec = grid.closest('.show--resultater'), cards = $$('[data-rs-card]', grid), chips = $$('[data-rs-f]', sec), live = $('[data-rs-live]', sec);
    const mn = $('[data-rs-mn]', sec), mb = $('[data-rs-mb]', sec), mt = $('[data-rs-mt]', sec);
    // The results count up the first time a card is seen (from 0, or from the value before)
    const nums = cards.map(c => $$('[data-rs-n]', c).map(b => {
      const f = num(b.textContent), from = b.dataset.fra ? num(b.dataset.fra) : null;
      return f && (from || f.n >= 3) ? { b, f, from: from ? from.n : 0 } : null;
    }).filter(Boolean));
    const up = c => {
      if (c.classList.contains('is-in')) return;
      c.classList.add('is-in');
      if (motion) (nums[cards.indexOf(c)] || []).forEach((x, i) => count(x.b, x.f, x.from, 1400, 350 + i * 140));
    };
    if (motion) {
      grid.classList.add('rs-on');
      cards.forEach((c, i) => { nums[i].forEach(x => { x.b.rsEnd = x.b.textContent; x.b.textContent = show(x.f, x.from); }); seen(c, () => up(c), .2); });
    }

    // Phones swipe the cases; the meter follows
    let swiped = false;
    const meter = () => {
      const n = cards.filter(c => !c.hidden).length, w = grid.scrollWidth - grid.clientWidth, k = w > 0 ? clamp(grid.scrollLeft / w) : 0;
      const at = Math.min(n, 1 + Math.round(k * (n - 1)));
      mn.textContent = pad(at); mt.textContent = pad(n); mb.style.setProperty('--m', (at / Math.max(1, n)).toFixed(3));
    };
    grid.addEventListener('scroll', () => { meter(); if (!swiped && grid.scrollLeft > 40) { swiped = true; ev('swipe'); } }, { passive: true });
    meter();

    // The cards that stay glide to their new place, the others fade out and in. A card that was on the page
    // but not seen yet (still waiting for its reveal) comes in like a new one
    let run = 0, cur = '';
    const ez = 'cubic-bezier(.2,.8,.2,1)';
    const flip = want => {
      const me = ++run;
      cards.forEach(c => c.getAnimations().forEach(a => a.cancel()));
      const shown = cards.filter(c => !c.hidden);
      const before = new Map(shown.filter(c => c.classList.contains('is-in')).map(c => [c, c.getBoundingClientRect()]));
      const out = shown.filter(c => !want(c));
      Promise.all(out.map(c => c.animate({ opacity: [getComputedStyle(c).opacity, 0], transform: ['none', 'scale(.94)'] }, { duration: 200, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {}))).then(() => {
        if (me !== run) return;
        cards.forEach(c => { c.hidden = !want(c); c.getAnimations().forEach(a => a.cancel()); });
        if (grid.scrollLeft) grid.scrollLeft = 0;
        let j = 0;
        cards.filter(c => !c.hidden).forEach(c => {
          const a = before.get(c), b = c.getBoundingClientRect();
          if (a) {
            const dx = a.left - b.left, dy = a.top - b.top;
            if (Math.abs(dx) + Math.abs(dy) > 1) c.animate({ transform: [`translate(${dx}px,${dy}px)`, 'none'] }, { duration: 620, easing: ez });
          } else {
            // Straight to its revealed state, so the reveal's own transition does not run on top
            c.style.transition = 'none'; up(c); void getComputedStyle(c).opacity; c.style.transition = '';
            c.animate({ opacity: [0, 1], transform: ['translateY(36px) scale(.95)', 'none'] }, { duration: 620, delay: 60 + j++ * 70, easing: ez, fill: 'backwards' });
          }
        });
        meter();
      });
    };
    chips.forEach(ch => ch.addEventListener('click', () => {
      const f = ch.dataset.rsF;
      if (f === cur) return;
      cur = f;
      chips.forEach(c => { const on = c === ch; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
      const want = c => !f || c.dataset.s.split(' ').includes(f), n = cards.filter(want).length;
      live.textContent = f ? `Viser ${n} ${n === 1 ? 'case' : 'cases'} med ${ch.dataset.label}.` : `Viser alle ${n} cases.`;
      ev('filter-' + (f || 'alle'));
      if (motion && cards[0].animate) flip(want);
      else { cards.forEach(c => { c.hidden = !want(c); c.classList.add('is-in'); }); grid.scrollLeft = 0; meter(); }
    }));
  }

  /* ---------------- Skal du være den næste? ---------------- */
  const fan = $('[data-rs-fan]');
  if (fan) {
    // The visitor's own business on the empty card, when typed on another page (kept in this browser only)
    try {
      const v = JSON.parse(sessionStorage.getItem('wl-egen') || 'null') || {};
      const t = k => typeof v[k] === 'string' ? v[k].replace(/\s+/g, ' ').trim().slice(0, 40) : '';
      const cap = s => s.charAt(0).toLocaleUpperCase('da-DK') + s.slice(1);
      if (t('navn')) $('[data-rs-you="navn"]', fan).textContent = t('navn');
      if (t('fag') || t('by')) $('[data-rs-you="sted"]', fan).textContent = [cap(t('fag')) || 'Dit fag', cap(t('by')) || 'Din by'].join(' · ');
    } catch (e) { /* fine */ }
    // The cards fan out when the box comes into view
    if (motion) { fan.classList.add('rs-on'); seen(fan, () => fan.classList.add('is-in'), .45); }
  }
}
