// Pinterest Ads showcase (/services/pinterest-ads, scripts/services/showcase/pinterest-ads.html): an idea board of our
// own drawing. The search field types idea searches one after another; the pins fade out and new ones rise in
// (a masonry laid out here), while the promoted pin for Mølleværk, an example coffee-gear webshop, glides to its
// place on every new board. There it is saved again and again: "Gemt" bursts and a counter that climbs. The chips
// pick a search, "Gem" saves it yourself, and the white dot opens the product from the shop's catalogue with price
// and "Til shoppen". Mølleværk, the price and all numbers are examples.
// Without motion (no html.motion): the first board, still; the chips, Gem, the dot and Til shoppen still work.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--pinterest-ads');
if (root) init(root);

function init(root) {
  const SC = 'pinterest-ads', motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const told = new Set();
  const act = a => { if (!told.has(a)) { told.add(a); track('showcase_interact', { showcase: SC, action: a }); } };
  let reached = 0;
  const step = n => { if (n > reached) { reached = n; track('showcase_step', { showcase: SC, step: n }); } };
  const fmt = n => n.toLocaleString('da-DK');
  const rnd = (a, b) => a + Math.random() * (b - a);

  // The searches: where the promoted pin goes (slot) and the other pins (photo:ratio:title)
  const Q = [
    ['nordisk køkken', 1, 'rengoering/projekt-1:1:Lyst køkken med ø|rengoering/hero-1:.75|vvs/projekt-3:1.15|toemrer/projekt-5:.9:Fronter i lys eg|klinik/om-2:1|maler/projekt-2:1.2:Stue i hvidt og træ|klinik/projekt-1:1|rengoering/hero-2:.8|revisor/projekt-3:1.1|maler/projekt-5:.9:Salviegrøn væg|rengoering/om-2:1.25'],
    ['gaveidéer til hende', 3, 'klinik/hero-2:.75:Spa-dag i gave|frisoer/projekt-3:1|klinik/om-2:.9:Små ting i glas|frisoer/hero-1:.8|klinik/projekt-1:1.15|klinik/hero-1:.7|klinik/projekt-3:1:Varme tæpper og ro|frisoer/projekt-1:.9|maler/projekt-6:1.2|frisoer/om-1:1|personlig-traener/projekt-2:1.1:Yoga for to'],
    ['kaffebar derhjemme', 0, 'revisor/hero-1:.75:Kaffe ved skrivebordet|toemrer/projekt-5:1|vvs/projekt-3:.9:Mat sort armatur|revisor/projekt-3:1.15|rengoering/projekt-1:1|klinik/projekt-1:1.2|rengoering/hero-1:.8|revisor/om-1:1|maler/projekt-2:.9:Morgenlys i stuen|toemrer/om-1:1.1|rengoering/projekt-3:1.2'],
    ['morgenrutine', 4, 'personlig-traener/hero-2:.75:Løb før arbejde|personlig-traener/projekt-3:1|revisor/projekt-3:1.15:Kaffe og kalender|fysioterapeut/hero-2:.8|maler/projekt-6:1|personlig-traener/projekt-2:1.2|klinik/projekt-3:.9|revisor/hero-1:.8|rengoering/om-2:1.1:Rolige morgener|fysioterapeut/projekt-1:1|vvs/projekt-1:.9'],
    ['julegaver til ham', 2, 'toemrer/hero-1:.75:Til ham, der bygger selv|personlig-traener/om-2:1|elektriker/om-1:1.15|frisoer/projekt-2:.9:Klassisk klip|personlig-traener/hero-1:.8|vvs/om-1:1.1|toemrer/projekt-1:1|personlig-traener/projekt-1:1.2:Hjemmetræning|revisor/om-2:1|elektriker/hero-2:.8|toemrer/om-1:1.1']
  ].map(([q, slot, p]) => ({ q, slot, pins: p.split('|').map(x => { const [src, r, t = ''] = x.split(':'); return { src: `/udkast/_faelles/billeder/${src}-480.webp`, h: src.includes('/hero') ? 600 : 362, r, t }; }) }));

  const grid = $('[data-pn-grid]'), board = $('[data-pn-board]'), ad = $('[data-pn-ad]'), others = $$('[data-pin]');
  const qEl = $('[data-pn-q]'), chips = $$('[data-pn-chip]'), vid = $('[data-pn-vid]');
  const gem = $('[data-pn-gem]'), dot = $('[data-pn-dot]'), bursts = $('[data-pn-bursts]');
  const prod = $('[data-pn-prod]'), okEl = $('[data-pn-ok]');
  const viewsEl = $('[data-pn-views]'), savesEl = $('[data-pn-saves]'), clicksEl = $('[data-pn-clicks]');
  let cur = 0, views = 18240, saves = 1284, clicks = 96;
  const seenQ = new Set([0]);

  /* ---------------- The board: content and masonry ---------------- */
  const fill = qi => Q[qi].pins.forEach((p, i) => {
    const el = others[i]; if (!el) return;
    const img = el.querySelector('img'), box = el.querySelector('.pn-pin__img');
    img.src = p.src; img.height = p.h; box.style.setProperty('--r', p.r);
    el.querySelector('.pn-pin__t').textContent = p.t;
  });
  const preload = qi => Q[qi].pins.forEach(p => { const im = new Image(); im.decoding = 'async'; im.src = p.src; });
  let cols = 0, cw = 0;
  const layout = () => {
    const W = grid.clientWidth, g = W < 470 ? 10 : 14;
    cols = W >= 960 ? 5 : W >= 680 ? 4 : W >= 470 ? 3 : 2;
    cw = (W - g * (cols - 1)) / cols;
    grid.classList.add('is-js');
    grid.style.setProperty('--cw', cw.toFixed(2) + 'px');
    const list = others.slice();
    // The promoted pin stays in the first row on small boards, and changes column from search to search
    list.splice(cols <= 2 ? (cur + 1) % 2 : cols === 3 ? Q[cur].slot % 3 : Q[cur].slot, 0, ad);
    const hs = new Array(cols).fill(0);
    list.forEach(el => {
      const c = hs.indexOf(Math.min(...hs));
      el.style.setProperty('--x', (c * (cw + g)).toFixed(1) + 'px');
      el.style.setProperty('--y', hs[c].toFixed(1) + 'px');
      el._y = hs[c]; el._x = c * (cw + g);
      hs[c] += el.offsetHeight + g;
    });
    grid.style.height = Math.max(...hs) + 'px';
    if (prod.classList.contains('is-open')) place();
  };

  /* ---------------- Typing and reshuffling ---------------- */
  // A small clock that only runs while the board is on screen and the product card is closed
  let clock = 0, events = [], inView = false, raf = 0, last = 0, started = false;
  const at = (ms, fn) => { events.push({ t: clock + ms, fn }); };
  const loop = now => {
    raf = 0;
    const dt = Math.min(50, Math.max(0, now - last)); last = now;
    if (!prod.classList.contains('is-open')) {
      clock += dt;
      const due = events.filter(e => e.t <= clock);
      if (due.length) { events = events.filter(e => e.t > clock); due.forEach(e => e.fn()); }
    }
    if (inView) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (motion && inView && !raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };

  const chipRow = chips[0].parentElement;
  const setChip = qi => {
    chips.forEach((b, i) => { const on = i === qi; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    // Phones: the row of chips scrolls sideways (only the row, never the page) so the chosen one shows
    const b = chips[qi];
    if (chipRow.scrollWidth > chipRow.clientWidth) chipRow.scrollTo({ left: Math.max(0, b.offsetLeft - chipRow.offsetLeft - 40), behavior: motion ? 'smooth' : 'auto' });
  };
  const reshuffle = qi => {
    others.forEach(el => el.classList.add('is-out'));
    ad.classList.add('is-move');
    at(320, () => {
      others.forEach(el => el.classList.add('is-hold'));
      cur = qi; fill(qi); layout();
      // The new pins rise in from the top down, and from left to right
      [...others].sort((a, b) => a._y - b._y || a._x - b._x).forEach((el, i) => el.style.setProperty('--dl', (i * 45) + 'ms'));
      void grid.offsetWidth;
      others.forEach(el => el.classList.remove('is-hold'));
      requestAnimationFrame(() => others.forEach(el => el.classList.remove('is-out')));
    });
    at(1250, () => { ad.classList.remove('is-move'); others.forEach(el => el.style.removeProperty('--dl')); });
    seenQ.add(qi);
    if (seenQ.size >= 2) step(2);
    if (seenQ.size >= Q.length) step(3);
  };
  // Erase the search, type the next, then show its board; saves come in while it is on screen; then the next search
  const run = (qi, dwell = 7200) => {
    events = [];
    closeProd(true);
    setChip(qi);
    const from = qEl.textContent, to = Q[qi].q;
    let t = 0;
    root.classList.add('is-typing');
    for (let i = from.length - 1; i >= 0; i--) { const s = from.slice(0, i); at(t += 26, () => { qEl.textContent = s; }); }
    t += 160;
    for (let i = 1; i <= to.length; i++) { const s = to.slice(0, i); at(t += 58, () => { qEl.textContent = s; }); }
    at(t += 220, () => { root.classList.remove('is-typing'); reshuffle(qi); preload((qi + 1) % Q.length); });
    for (let k = 0, s = t + 1300; s < t + dwell - 900; s += rnd(650, 1300), k++) at(s, () => burst(false));
    at(t + dwell, () => run((qi + 1) % Q.length));
  };

  /* ---------------- Saves ---------------- */
  const NAMES = [['S', '#cfe3d4'], ['L', '#f2d48a'], ['A', '#c9d6f2'], ['M', '#f3c6b5'], ['J', '#e1d3f0'], ['K', '#d4ecef'], ['E', '#f6dfc4']];
  let bumpAt = 0;
  const bump = el => { const t = performance.now(); if (t - bumpAt < 350) return; bumpAt = t; el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); };
  const show = () => { viewsEl.textContent = fmt(views); savesEl.textContent = fmt(saves); clicksEl.textContent = fmt(clicks); };
  function burst(me) {
    saves += me ? 1 : 1 + (Math.random() * 2 | 0);
    views += 9 + (Math.random() * 30 | 0);
    if (!me && Math.random() < .3) clicks += 1;
    show(); bump(savesEl);
    if (!motion) return;
    const n = NAMES[Math.random() * NAMES.length | 0], b = document.createElement('span');
    b.className = 'pn-burst' + (me ? ' pn-burst--me' : '');
    b.style.setProperty('--bx', rnd(-14, 4).toFixed(1) + 'px');
    const i = document.createElement('i');
    i.textContent = me ? 'Du' : n[0]; i.style.setProperty('--c', me ? '#fff' : n[1]);
    if (me) i.style.fontSize = '7.5px';
    b.append(i, me ? 'Gemt på din tavle' : 'Gemt');
    bursts.append(b);
    setTimeout(() => b.remove(), 1600);
    gem.classList.remove('is-pop'); void gem.offsetWidth; gem.classList.add('is-pop');
  }
  gem.addEventListener('click', () => {
    if (gem.getAttribute('aria-pressed') === 'true') { gem.setAttribute('aria-pressed', 'false'); gem.textContent = 'Gem'; saves -= 1; show(); return; }
    act('gem');
    gem.setAttribute('aria-pressed', 'true'); gem.textContent = 'Gemt';
    burst(true);
  });

  /* ---------------- The product from the catalogue ---------------- */
  const place = () => {
    const sheet = cols <= 2;
    prod.classList.toggle('is-sheet', sheet);
    if (sheet) return;
    // Beside the pin, level with the dot; on the left of it when there is no room on the right
    const B = board.clientWidth, H = board.clientHeight, w = prod.offsetWidth, h = prod.offsetHeight;
    const dy = grid.offsetTop + ad._y + ad.querySelector('.pn-pin__img').offsetHeight * .5;
    let x = grid.offsetLeft + ad._x + cw + 14, side = 'left';
    if (x + w > B - 10) { x = grid.offsetLeft + ad._x - w - 14; side = 'right'; }
    const y = Math.max(10, Math.min(H - h - 10, dy - h * .4));
    prod.style.setProperty('--px', x.toFixed(1) + 'px');
    prod.style.setProperty('--py', y.toFixed(1) + 'px');
    prod.style.setProperty('--po', `${side} ${(dy - y).toFixed(0)}px`);
  };
  const openProd = () => {
    if (prod.classList.contains('is-open')) return closeProd();
    act('produkt');
    okEl.textContent = '';
    place();
    prod.inert = false; prod.classList.add('is-open');
    dot.setAttribute('aria-expanded', 'true');
    syncVid();
    setTimeout(() => { if (prod.classList.contains('is-open')) $('[data-pn-go]').focus({ preventScroll: true }); }, motion ? 300 : 0);
  };
  function closeProd(quiet) {
    if (!prod.classList.contains('is-open')) return;
    prod.classList.remove('is-open'); prod.inert = true;
    dot.setAttribute('aria-expanded', 'false');
    if (!quiet) { act('luk'); dot.focus({ preventScroll: true }); }
    syncVid();
  }
  dot.addEventListener('click', openProd);
  $('[data-pn-x]').addEventListener('click', () => closeProd());
  prod.addEventListener('keydown', e => { if (e.key === 'Escape') closeProd(); });
  board.addEventListener('click', e => { if (prod.classList.contains('is-open') && !prod.contains(e.target) && !dot.contains(e.target)) closeProd(true); });
  $('[data-pn-go]').addEventListener('click', () => {
    act('til-shoppen');
    clicks += 1; show(); bump(clicksEl);
    okEl.textContent = 'Her lander kunden: på varen i din webshop.';
  });

  /* ---------------- Chips ---------------- */
  chips.forEach((b, i) => b.addEventListener('click', () => {
    act('soegning');
    if (!motion) { cur = i; setChip(i); closeProd(true); qEl.textContent = Q[i].q; fill(i); layout(); seenQ.add(i); return; }
    if (!started) start();
    if (i === cur && !events.length) return;
    run(i, 11000);
  }));

  /* ---------------- Video and start ---------------- */
  function syncVid() {
    if (!vid) return;
    if (motion && inView && !prod.classList.contains('is-open')) { if (vid.preload === 'none') vid.preload = 'auto'; const p = vid.play(); if (p) p.catch(() => {}); } else vid.pause();
  }
  const start = () => {
    if (started) return;
    started = true;
    step(1);
    // The first board is already there: the saves begin, then the next search types itself
    for (let s = 900; s < 6200; s += rnd(650, 1200)) at(s, () => burst(false));
    at(6800, () => run(1));
    preload(1);
  };

  layout();
  show();
  if (motion && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && e.intersectionRatio >= .25) start(); }), { threshold: [0, .25] }).observe(board);
    new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; kick(); syncVid(); }).observe(root);
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); step(1); } });
    io.observe(board);
  }
  // Lay out again when the width changes (layout sets the height itself)
  let rt = 0, lw = grid.clientWidth;
  const relayout = () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(layout); };
  new ResizeObserver(() => { if (grid.clientWidth !== lw) { lw = grid.clientWidth; relayout(); } }).observe(grid);
  // Images keep their box from the ratio, so only fonts can change the heights
  if (document.fonts) document.fonts.ready.then(relayout);
}
