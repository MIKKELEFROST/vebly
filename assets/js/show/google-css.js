// Google CSS showcase (/services/google-css): a calculator. The same Shopping ad with and without a CSS
// partner: the small "Af Google" on the card turns over to "Af Webleads", the click price rolls down and
// a −20% sticker lands on it, and a budget slider shows what that means in clicks or kroner.
// With motion it starts on "Uden CSS" and flips by itself once when the price and the card are in view,
// unless the visitor has already chosen. Without motion it shows the finished state and switches instantly.
// Click prices in øre on [data-gcss]: data-p0 without, data-p1 with a CSS partner.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--google-css');
if (root) init(root);

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const box = $('[data-gcss]');
  const P0 = +box.dataset.p0 || 500, P1 = +box.dataset.p1 || 400;
  const dot = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const kr = ore => `${Math.floor(ore / 100)},${String(ore % 100).padStart(2, '0')}`;
  const ev = action => track('showcase_interact', { showcase: 'google-css', action });
  const eo = t => 1 - (1 - t) ** 3;
  const eb = t => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2;

  /* ---------- The click price: one rolling column per digit ---------- */
  // Rest positions: "med" shows the new digit; "uden" sits whole turns higher, so going down the right-hand
  // digits spin (the last twice, the one before once) while the first digit rolls one step, all landing together
  const odo = $('[data-gcss-odo]'), A = kr(P0), B = kr(P1), cols = [];
  if (A.length === B.length) {
    const digits = [...B].filter(c => /\d/.test(c)).length;
    let j = 0;
    odo.innerHTML = [...B].map((c, i) => {
      if (!/\d/.test(c)) return `<span class="gcss-odo__sep">${c}</span>`;
      const right = digits - 1 - j++, a = +A[i], b = +c, rev = Math.max(0, 2 - right);
      let up = a + 10 * rev;
      if (a !== b && up <= b) up += 10;
      cols.push({ up, down: b, cur: b, ms: 900 + 160 * right, ease: right === digits - 1 ? eb : eo });
      return `<span class="gcss-odo__win"><span class="gcss-odo__col">${'0123456789'.repeat(4).replace(/\d/g, d => `<span>${d}</span>`)}</span></span>`;
    }).join('');
    $$('.gcss-odo__col').forEach((el, i) => { cols[i].el = el; });
  }
  const LAND = cols.length ? Math.max(...cols.map(c => c.ms)) - 120 : 0;
  let raf = 0;
  const place = () => cols.forEach(c => { c.el.style.transform = `translateY(${(-c.cur * 1.04).toFixed(4)}em)`; });
  const roll = (med, animate) => {
    cancelAnimationFrame(raf);
    cols.forEach(c => { c.from = c.cur; c.to = med ? c.down : c.up; });
    if (!animate || !cols.length) { cols.forEach(c => { c.cur = c.to; }); place(); if (!cols.length) odo.textContent = med ? B : A; return; }
    const t0 = performance.now();
    const tick = t => {
      let busy = false;
      cols.forEach(c => { const k = Math.min(1, (t - t0) / c.ms); c.cur = c.from + (c.to - c.from) * c.ease(k); if (k < 1) busy = true; });
      place();
      if (busy) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  };

  /* ---------- Budget and what it means ---------- */
  // Round steps, finer at the low end. All multiples of 500 kr., so the clicks come out whole
  const STEPS = [];
  for (let v = 2000; v <= 10000; v += 500) STEPS.push(v);
  for (let v = 11000; v <= 20000; v += 1000) STEPS.push(v);
  for (let v = 22500; v <= 50000; v += 2500) STEPS.push(v);
  for (let v = 55000; v <= 100000; v += 5000) STEPS.push(v);
  const range = $('[data-gcss-range]'), bv = $('[data-gcss-bv]');
  const out = { c0: $('[data-gcss-c0]'), c1: $('[data-gcss-c1]'), save: $('[data-gcss-save]') };
  range.max = STEPS.length - 1;
  range.value = Math.max(0, STEPS.indexOf(10000));
  const calc = () => {
    const b = STEPS[+range.value] || 10000;
    return { b, k0: Math.floor(b * 100 / P0), k1: Math.floor(b * 100 / P1), s: Math.round(b * (P0 - P1) / P0) };
  };
  const put = (el, t) => { if (el.textContent !== t) el.textContent = t; };
  const paint = () => {
    const r = calc();
    put(bv, `${dot(r.b)} kr.`);
    range.setAttribute('aria-valuetext', `${dot(r.b)} kr. om måneden`);
    range.style.setProperty('--p', (+range.value / +range.max).toFixed(4));
    put(out.c0, dot(r.k0)); put(out.c1, dot(r.k1)); put(out.save, `${dot(r.s)} kr.`);
  };

  // One sentence for screen readers (the drawing, the price and the numbers are hidden from them).
  // It only becomes a live region once the visitor has done something, so the automatic flip is silent
  const liveEl = $('[data-gcss-live]');
  let liveT = 0;
  const say = () => {
    clearTimeout(liveT);
    liveT = setTimeout(() => {
      const r = calc();
      put(liveEl, med
        ? `Med Webleads som CSS: ${kr(P1)} kr. pr. klik i stedet for ${kr(P0)} kr. Med et budget på ${dot(r.b)} kr. om måneden giver det op til ${dot(r.k1)} klik i stedet for ${dot(r.k0)}, eller op til ${dot(r.s)} kr. sparet om måneden for de samme klik.`
        : `Med Googles egen CSS: ${kr(P0)} kr. pr. klik. Med et budget på ${dot(r.b)} kr. om måneden giver det ${dot(r.k0)} klik. Med Webleads som CSS kunne det blive op til ${dot(r.k1)} klik, eller op til ${dot(r.s)} kr. sparet om måneden.`);
    }, 450);
  };
  const heard = () => liveEl.setAttribute('aria-live', 'polite');

  /* ---------- Uden CSS / Med Webleads ---------- */
  const btns = $$('[data-gcss-mode]'), seg = $('[data-gcss-seg]'), sticker = $('[data-gcss-sticker]'), num = $('[data-gcss-num]');
  let med = true, landT = 0, bumpT = 0, flipT = 0;
  // chose: the visitor has touched the switch, so the automatic flip never happens; done: it has happened
  let chose = false, done = false, dragging = false, waiting = false, autoT = 0, budT = 0;
  const show = animate => {
    box.classList.toggle('is-med', med);
    btns.forEach(b => { const on = (b.dataset.gcssMode === 'med') === med; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
    roll(med, animate);
    clearTimeout(landT); clearTimeout(bumpT); clearTimeout(flipT);
    // The label on the card gives a small ping as it lands on "Af Webleads"
    box.classList.remove('is-flip');
    if (med && animate) { void box.offsetWidth; box.classList.add('is-flip'); flipT = setTimeout(() => box.classList.remove('is-flip'), 1600); }
    sticker.classList.remove('is-land');
    num.classList.remove('is-bump');
    if (!med) sticker.classList.remove('is-stuck');
    else if (!animate) sticker.classList.add('is-stuck');
    else landT = setTimeout(() => {
      sticker.classList.add('is-stuck', 'is-land');
      num.classList.add('is-bump');
      box.classList.add('is-noted');
      bumpT = setTimeout(() => { sticker.classList.remove('is-land'); num.classList.remove('is-bump'); }, 800);
    }, LAND);
    say();
  };
  const set = (on, user) => {
    if (user) { chose = true; heard(); }
    if (on === med) return;
    med = on;
    show(motion);
    if (user) ev('toggle-css');
  };
  btns.forEach(b => b.addEventListener('click', () => set(b.dataset.gcssMode === 'med', true)));
  seg.addEventListener('pointerdown', () => { chose = true; });
  // A radio group: the arrow keys move the choice, Home and End go to the ends
  seg.addEventListener('keydown', e => {
    const k = e.key;
    if (!/^(Arrow(Left|Right|Up|Down)|Home|End)$/.test(k)) return;
    e.preventDefault();
    set(k === 'Home' ? false : k === 'End' ? true : !med, true);
    btns[med ? 1 : 0].focus();
  });

  // The slider: numbers follow live; analytics hears once per drag (or per burst of key presses), no values
  range.addEventListener('input', () => { paint(); say(); });
  range.addEventListener('change', () => { heard(); say(); clearTimeout(budT); budT = setTimeout(() => ev('budget'), 700); });
  range.addEventListener('pointerdown', () => { dragging = true; range.classList.add('is-drag'); });
  const release = () => { if (!dragging) return; dragging = false; range.classList.remove('is-drag'); if (waiting) { waiting = false; setTimeout(auto, 350); } };
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
  range.addEventListener('blur', release);
  // Touch screens (the slider itself takes no pointer there, see the CSS): drag sideways anywhere on it, tap
  // to jump, and a swipe up or down only scrolls the page, so the budget never changes by accident
  const rail = $('[data-gcss-rail]'), coarse = matchMedia('(pointer: coarse)');
  const idxAt = x => { const r = range.getBoundingClientRect(), t = 17; return Math.round(Math.min(1, Math.max(0, (x - r.left - t) / (r.width - 2 * t))) * +range.max); };
  const go = i => { if (+range.value === i) return; range.value = i; range.dispatchEvent(new Event('input', { bubbles: true })); };
  let tp = null;
  const grab = e => { tp.on = true; dragging = true; range.classList.add('is-drag'); try { rail.setPointerCapture(e.pointerId); } catch (x) { /* fine */ } go(idxAt(e.clientX)); };
  rail.addEventListener('pointerdown', e => {
    if (!coarse.matches || e.button > 0) return;
    tp = { id: e.pointerId, x: e.clientX, y: e.clientY, from: +range.value, on: false };
    if (e.pointerType === 'mouse') grab(e);
  });
  rail.addEventListener('pointermove', e => {
    if (!tp || e.pointerId !== tp.id) return;
    if (tp.on) return go(idxAt(e.clientX));
    const dx = Math.abs(e.clientX - tp.x), dy = Math.abs(e.clientY - tp.y);
    if (dx > 6 && dx > dy) grab(e); else if (dy > 10) tp = null;
  });
  const lift = e => {
    if (!tp || e.pointerId !== tp.id) return;
    if (e.type === 'pointerup' && !tp.on) go(idxAt(e.clientX));
    const changed = +range.value !== tp.from;
    tp = null;
    if (changed) range.dispatchEvent(new Event('change', { bubbles: true }));
    release();
  };
  rail.addEventListener('pointerup', lift); rail.addEventListener('pointercancel', lift);

  paint();

  /* ---------- The automatic flip: once, when the price and the card are on screen ---------- */
  const auto = () => {
    if (done || chose) return;
    if (dragging) { waiting = true; return; }
    done = true;
    set(true, false);
    track('showcase_step', { showcase: 'google-css', step: 1 });
  };
  if (!motion || !('IntersectionObserver' in window)) {
    box.classList.add('is-noted');
    show(false);
    return;
  }
  med = false;
  show(false);
  // Best with the card and the price on screen together; on a phone, the price alone flips it a bit later
  const byEl = $('[data-gcss-by]'), seen = new Map();
  const io = new IntersectionObserver(es => {
    es.forEach(e => seen.set(e.target, e.isIntersecting && e.intersectionRatio >= 0.55));
    clearTimeout(autoT);
    if (done || chose) return io.disconnect();
    if (seen.get(num)) autoT = setTimeout(() => { auto(); if (done || chose) io.disconnect(); }, seen.get(byEl) ? 1700 : 2800);
  }, { threshold: [0, 0.55, 1] });
  io.observe(num);
  io.observe(byEl);
}
