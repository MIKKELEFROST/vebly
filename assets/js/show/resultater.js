// /resultater (scripts/services/pages/resultater.mjs). The review scores roll in like the price on the other
// pages, the featured case plays as a scroll story on a pinned stage like "Sådan virker det", the cases
// filter by service (the cards glide to their new places) and count up their results, and the cards in
// "Skal du være den næste?" fan out. Does nothing unless .show--resultater is on the page. Without motion
// the HTML already shows the finished state, and only the filter and the empty card's name are used.
// Elements with data-k="from to" get --k from 0 to 1 over that part of the story's scroll; resultater.css
// turns it into transforms and opacity.
import { track } from '/assets/js/analytics.js';

if (document.querySelector('.show--resultater')) init();

function init() {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const eo = t => 1 - (1 - t) ** 3;
  const pad = n => String(n).padStart(2, '0');
  const ev = action => track('showcase_interact', { showcase: 'resultater', action });
  const once = (el, fn, threshold = .2) => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } }), { threshold });
    io.observe(el);
  };
  // "6,8 sek." → { a: '', n: 6.8, d: 1, z: ' sek.' }. Null when it does not start with a number (or a sign)
  const num = s => {
    const m = String(s).trim().match(/^([+−×-]?)(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?(.*)$/);
    return m && { a: m[1], n: parseFloat(m[2].replace(/\./g, '') + '.' + (m[3] || '0')), d: m[3] ? m[3].length : 0, z: m[4] };
  };
  const show = (f, n) => f.a + n.toLocaleString('da-DK', { minimumFractionDigits: f.d, maximumFractionDigits: f.d }) + f.z;
  const count = (el, f, from, ms, delay) => {
    let t0 = 0;
    const step = t => { t0 = t0 || t; const k = clamp((t - t0) / ms); el.textContent = show(f, from + (f.n - from) * eo(k)); if (k < 1) requestAnimationFrame(step); };
    setTimeout(() => requestAnimationFrame(step), delay);
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
    cnt.forEach(([el, f]) => { el.textContent = show(f, 0); });
    once(rev, () => {
      $$('[data-d]', rev).forEach(c => { c.style.transform = `translateY(-${+c.dataset.d + 20}em)`; });
      cnt.forEach(([el, f], i) => count(el, f, 0, 1700, 250 + i * 180));
      setTimeout(() => rev.classList.add('is-lit'), 1100);
    }, .35);
  }

  /* ---------------- The case as a scroll story ---------------- */
  const pin = $('[data-rs-pin]');
  if (pin && motion) {
    const sticky = $('[data-rs-sticky]', pin), fit = $('[data-rs-fit]', pin), br = $('[data-rs-br]', pin);
    const steps = $$('[data-rs-step]', pin), resEl = $('[data-rs-res]', pin), card = resEl && resEl.parentElement;
    const anim = $$('[data-k]', pin).map(el => { const [a, b] = el.dataset.k.split(' ').map(Number); return el.rsA = { el, a, b, v: -1 }; });
    const tal = $$('[data-rs-tal]', pin).map(el => ({ el, b: $('b', el), f: num(el.dataset.fra), t: num(el.dataset.til), fra: el.dataset.fra, til: el.dataset.til, on: null }));
    const rf = resEl && num(resEl.textContent);
    pin.closest('.show--resultater').classList.add('rs-go');
    let cur = -1, last = -1, step = -1, best = 0, raf = 0, near = false, isNew = null;

    // Short windows: the stage is scaled down until it fits under the menu
    const measure = () => {
      fit.style.transform = '';
      const cs = getComputedStyle(sticky), room = sticky.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const s = Math.min(1, room / fit.offsetHeight);
      if (s < 1) fit.style.transform = `scale(${s.toFixed(3)})`;
      last = -1;
    };
    const draw = p => {
      const st = p < .2 ? 0 : p < .45 ? 1 : p < .7 ? 2 : 3;
      if (st !== step) { step = st; steps.forEach((s, j) => s.classList.toggle('is-on', j === st)); }
      // Each step once, when the visitor has scrolled into it
      const reached = p > .003 ? st + 1 : 0;
      while (best < reached) track('showcase_step', { showcase: 'resultater', step: ++best });
      for (const a of anim) { const v = Math.round(eo(seg(p, a.a, a.b)) * 1000) / 1000; if (v !== a.v) { a.v = v; a.el.style.setProperty('--k', v); } }
      // The address and the status follow the new site in
      const n = p > .27;
      if (n !== isNew) { isNew = n; br.classList.toggle('is-new', n); }
      // The browser steps back behind the result
      if (card) br.style.setProperty('--b', card.rsA.v);
      // The numbers count from before to after
      tal.forEach(x => {
        const k = x.el.rsA.v, on = k > .01;
        if (on !== x.on) { x.on = on; x.el.classList.toggle('is-on', on); }
        const txt = x.f && x.t && x.f.d === x.t.d && x.f.a === x.t.a && x.f.z === x.t.z ? show(x.t, x.f.n + (x.t.n - x.f.n) * k) : k < .5 ? x.fra : x.til;
        if (x.b.textContent !== txt) x.b.textContent = txt;
      });
      if (rf) { const txt = show(rf, rf.n * resEl.rsA.v); if (resEl.textContent !== txt) resEl.textContent = txt; }
    };
    const frame = () => {
      raf = 0;
      const r = pin.getBoundingClientRect(), span = r.height - innerHeight;
      const target = span > 0 ? clamp(-r.top / span) : 0;
      // A little inertia, so wheel steps glide instead of jump
      cur = cur < 0 ? target : cur + (target - cur) * .18;
      if (Math.abs(target - cur) < .0004) cur = target;
      if (cur !== last) { last = cur; draw(cur); }
      if (near || cur !== target) raf = requestAnimationFrame(frame);
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(frame); };
    new IntersectionObserver(([e]) => { near = e.isIntersecting; if (near) go(); }, { rootMargin: '200px 0px' }).observe(pin);
    addEventListener('resize', () => { measure(); go(); });
    if (document.fonts) document.fonts.ready.then(() => { measure(); go(); });
    measure(); draw(0);

    // The step numbers jump to their step
    const AT = [.1, .38, .62, .93];
    steps.forEach((s, j) => s.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      const r = pin.getBoundingClientRect();
      scrollTo({ top: scrollY + r.top + (r.height - innerHeight) * AT[j], behavior: 'smooth' });
      ev('trin-' + (j + 1));
    }));
    const cta = $('[data-rs-cta]', pin);
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
      (nums[cards.indexOf(c)] || []).forEach((x, i) => count(x.b, x.f, x.from, 1400, 350 + i * 140));
    };
    if (motion) cards.forEach((c, i) => { nums[i].forEach(x => { x.b.textContent = show(x.f, x.from); }); once(c, up, .25); });

    // Phones swipe the cases; the meter follows
    let swiped = false;
    const meter = () => {
      const n = cards.filter(c => !c.hidden).length, w = grid.scrollWidth - grid.clientWidth, k = w > 0 ? clamp(grid.scrollLeft / w) : 0;
      const at = Math.min(n, 1 + Math.round(k * (n - 1)));
      mn.textContent = pad(at); mt.textContent = pad(n); mb.style.setProperty('--m', (at / Math.max(1, n)).toFixed(3));
    };
    grid.addEventListener('scroll', () => { meter(); if (!swiped && grid.scrollLeft > 40) { swiped = true; ev('swipe'); } }, { passive: true });
    meter();

    // The cards that stay glide to their new place, the others fade out and in
    let run = 0, cur = '';
    const flip = want => {
      const me = ++run;
      cards.forEach(c => c.getAnimations().forEach(a => a.cancel()));
      const before = new Map(cards.filter(c => !c.hidden).map(c => [c, c.getBoundingClientRect()]));
      const out = [...before.keys()].filter(c => !want(c));
      Promise.all(out.map(c => c.animate({ opacity: [1, 0], transform: ['none', 'scale(.94)'] }, { duration: 200, easing: 'ease-in', fill: 'forwards' }).finished.catch(() => {}))).then(() => {
        if (me !== run) return;
        cards.forEach(c => { c.hidden = !want(c); c.getAnimations().forEach(a => a.cancel()); });
        if (grid.scrollLeft) grid.scrollLeft = 0;
        let j = 0;
        cards.filter(c => !c.hidden).forEach(c => {
          const a = before.get(c), b = c.getBoundingClientRect();
          if (a) {
            const dx = a.left - b.left, dy = a.top - b.top;
            if (Math.abs(dx) + Math.abs(dy) > 1) c.animate({ transform: [`translate(${dx}px,${dy}px)`, 'none'] }, { duration: 620, easing: 'cubic-bezier(.2,.8,.2,1)' });
          } else {
            up(c);
            c.animate({ opacity: [0, 1], transform: ['translateY(36px) scale(.95)', 'none'] }, { duration: 620, delay: 60 + j++ * 70, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
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
    if (motion) {
      // The cards spread out as the box comes up the screen
      let raf = 0, near = false, lastP = -1;
      const tick = () => {
        raf = 0;
        const r = fan.getBoundingClientRect(), p = Math.round(eo(seg((innerHeight - r.top) / innerHeight, .15, .75)) * 1000) / 1000;
        if (p !== lastP) { lastP = p; fan.style.setProperty('--p', p); }
        if (near) raf = requestAnimationFrame(tick);
      };
      fan.style.setProperty('--p', 0);
      new IntersectionObserver(([e]) => { near = e.isIntersecting; if (near && !raf) raf = requestAnimationFrame(tick); }, { rootMargin: '100px 0px' }).observe(fan);
    }
  }
}
