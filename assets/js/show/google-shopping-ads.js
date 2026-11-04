// Showcase: Google Shopping Ads (/services/google-shopping-ads). A search page with the "Sponsoreret ·
// Shopping" carousel, and above it your product as one row of a product feed. Three switches in the feed
// (Bedre titel, Tilbudspris, Gratis fragt) rewrite your card in the carousel, live.
// The carousel is real: drag it with the mouse (momentum, snap, a rubber band at the ends), swipe it on a
// phone (native scroll-snap), use the arrows, and click a card to open the product like on Google.
// With motion: when the section comes into view the query types itself, the cards cascade in and the three
// fixes switch on one by one. Without: the finished state from the HTML, and everything still works.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--google-shopping-ads');
if (root) run(root);

function run(root) {
  const SC = 'google-shopping-ads', motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - (1 - t) ** 3;
  const act = action => track('showcase_interact', { showcase: SC, action });
  let reached = 0;
  const stage = n => { while (reached < n) track('showcase_step', { showcase: SC, step: ++reached }); };

  const box = $('[data-gsa]'), row = $('[data-gsa-row]'), trk = $('[data-gsa-trk]');
  const cards = $$('[data-gsa-card]'), you = $('[data-gsa-you]'), arrows = $$('[data-gsa-arr]');
  const qEl = $('[data-gsa-q]'), url = $('[data-gsa-url]'), dot = $('[data-gsa-dot]');
  const pan = $('[data-gsa-pan]'), body = $('[data-gsa-pbody]'), go = $('[data-gsa-go]'), toast = $('[data-gsa-toast]');
  const P = k => $(`[data-gsa-p="${k}"]`), btn = k => $(`[data-gsa-fix="${k}"]`), cell = k => $(`[data-gsa-cell="${k}"] > span`), yEl = k => $(`[data-gsa-y="${k}"]`);
  const Q = 'keramik krus', QURL = 'google.dk/search?q=keramik+krus', KEYS = ['titel', 'tilbud', 'fragt'];

  /* ---------------- The feed and your card ---------------- */
  // What each fix writes in the feed cell [off, on], and what your card shows [off, on]
  const FEED = { titel: ['Krus grøn', 'Keramik krus 35 cl i stentøj, salviegrøn – håndlavet i Danmark'], tilbud: ['', '249,00 kr.'], fragt: ['39,00 kr.', '0,00 kr.'] };
  const CARD = {
    titel: ['Krus grøn', '<mark>Keramik krus</mark> 35 cl i stentøj, salviegrøn – håndlavet i Danmark'],
    tilbud: ['<b>329,00 kr.</b>', '<b class="is-sale">249,00 kr.</b><s>329,00 kr.</s>'],
    fragt: ['+ 39,00 kr. i fragt', 'Gratis fragt']
  };
  // on = what the switches say, shown = what your card shows (it follows once the change has arrived)
  const on = { titel: true, tilbud: true, fragt: true }, shown = { ...on }, tok = { titel: 0, tilbud: 0, fragt: 0 };
  const paint = k => {
    yEl(k).innerHTML = CARD[k][+shown[k]];
    if (k === 'tilbud') you.classList.toggle('is-tilbud', shown.tilbud);
    if (open === you) fill(you);
  };
  const again = (el, c) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };
  // Your card is scrolled into view before it changes
  const seeYou = async () => {
    const r = row.getBoundingClientRect(), c = you.getBoundingClientRect();
    if (c.left >= r.left - 1 && c.right <= r.right + 1) return;
    glide(snapOf(you)); await wait(520);
  };
  // A dot carries the change from the feed down to your card, on a small arc
  const fly = (a, b) => new Promise(res => {
    const o = box.getBoundingClientRect(), A = a.getBoundingClientRect(), B = b.getBoundingClientRect();
    const x0 = A.left + Math.min(A.width / 2, 70) - o.left, y0 = A.top + A.height / 2 - o.top;
    const x1 = B.left + Math.min(B.width / 2, 46) - o.left, y1 = B.top + B.height / 2 - o.top;
    const cx = (x0 + x1) / 2 - (y1 - y0) * .22, cy = (y0 + y1) / 2 + (x1 - x0) * .22, d = dot.cloneNode(), f = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, u = 1 - t, x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      f.push({ transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${(.5 + Math.sin(Math.PI * t) * .6).toFixed(3)})`, opacity: t < .1 ? t * 10 : t > .92 ? (1 - t) * 12 : 1 });
    }
    box.append(d);
    d.animate(f, { duration: 640, easing: 'cubic-bezier(.45,.05,.3,1)' }).onfinish = () => { d.remove(); res(); };
  });
  const bump = () => you.animate([{ transform: 'none' }, { transform: 'translateY(-7px) scale(1.035)', offset: .35 }, { transform: 'none' }], { duration: 620, easing: 'cubic-bezier(.3,.7,.3,1)' });

  // Switch a fix on or off: the cell is typed anew, then the dot flies, then your card changes
  const set = async (k, v) => {
    on[k] = v; btn(k).setAttribute('aria-pressed', v);
    const t = ++tok[k], live = () => t === tok[k], c = cell(k), txt = FEED[k][+v], td = c.parentNode;
    if (!motion) { c.textContent = txt; shown[k] = v; paint(k); return; }
    $$('.gsa-cell.is-sel').forEach(x => x !== td && x.classList.remove('is-sel'));
    const sheet = td.offsetParent !== null;
    if (sheet) {
      td.classList.add('is-sel', 'is-typing'); c.textContent = '';
      await wait(160);
      for (let i = 1; i <= txt.length; i++) { if (!live()) return; c.textContent = txt.slice(0, i); await wait(9 + Math.random() * 14); }
      if (!live()) return;
      td.classList.remove('is-typing'); again(td, 'is-flash');
    } else c.textContent = txt;
    await seeYou(); if (!live()) return;
    await fly(sheet ? td : btn(k), yEl(k)); if (!live()) return;
    shown[k] = v; paint(k); again(yEl(k), 'is-hl'); bump();
    setTimeout(() => { if (live()) td.classList.remove('is-sel'); }, 1100);
  };

  /* ---------------- The carousel ---------------- */
  const max = () => row.scrollWidth - row.clientWidth;
  const snaps = () => { const o = trk.getBoundingClientRect().left + parseFloat(getComputedStyle(trk).paddingLeft); return cards.map(c => clamp(Math.round(c.getBoundingClientRect().left - o), 0, max())); };
  const nearest = x => snaps().reduce((a, b) => Math.abs(b - x) < Math.abs(a - x) ? b : a);
  const snapOf = c => snaps()[cards.indexOf(c)];
  let gl = 0;
  // Move the row to a snap point ourselves (arrows, drag release, your card): ease out, snapping off meanwhile
  const glide = (to, v = 0) => {
    cancelAnimationFrame(gl); gl = 0;
    const from = row.scrollLeft, d = clamp(to, 0, max()) - from;
    if (!motion || Math.abs(d) < 1) { row.scrollLeft = from + d; row.classList.remove('is-free'); return; }
    row.classList.add('is-free');
    const dur = v ? clamp(3 * Math.abs(d / v), 260, 900) : clamp(320 + Math.abs(d) * .5, 380, 760), t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / dur); row.scrollLeft = from + d * ease(k); if (k < 1) gl = requestAnimationFrame(step); else { gl = 0; row.classList.remove('is-free'); } };
    gl = requestAnimationFrame(step);
  };
  const upd = () => { const s = row.scrollLeft, m = max(); arrows[0].classList.toggle('is-off', s < 4); arrows[1].classList.toggle('is-off', s > m - 4); };
  let uq = 0;
  row.addEventListener('scroll', () => { if (!uq) uq = requestAnimationFrame(() => { uq = 0; upd(); }); }, { passive: true });
  addEventListener('resize', upd);
  // An arrow moves half a screen of cards, like the real one
  arrows.forEach(a => a.addEventListener('click', () => {
    const dir = +a.dataset.gsaArr, s = row.scrollLeft, list = snaps(), pitch = cards[1].offsetLeft - cards[0].offsetLeft;
    const n = Math.max(1, Math.round(row.clientWidth / pitch / 2));
    let i = list.findIndex(x => x >= s - 2);
    if (i < 0) i = list.length - 1;
    glide(list[clamp(i + dir * n, 0, list.length - 1)]);
    // An arrow that disappears hands the focus to the other one
    setTimeout(() => { if (document.activeElement === a && a.classList.contains('is-off')) arrows[dir > 0 ? 0 : 1].focus({ preventScroll: true }); }, 820);
    act(dir > 0 ? 'pil-frem' : 'pil-tilbage');
  }));

  // Dragging with the mouse; fingers and trackpads scroll the row natively
  const rub = o => Math.sign(o) * 84 * (1 - Math.exp(-Math.abs(o) / 170));
  let drag = null, eat = 0, drags = 0;
  row.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || e.button) return;
    cancelAnimationFrame(gl); gl = 0;
    drag = { x: e.clientX, s: row.scrollLeft, id: e.pointerId, on: false, over: 0, pts: [[e.timeStamp, e.clientX]] };
  });
  row.addEventListener('pointermove', e => {
    const d = drag;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    if (!d.on) { if (Math.abs(dx) < 6) return; d.on = true; row.setPointerCapture(e.pointerId); row.classList.add('is-drag', 'is-free'); }
    const m = max(), s = d.s - dx;
    d.over = s < 0 ? -s : s > m ? m - s : 0;
    row.scrollLeft = clamp(s, 0, m);
    trk.style.transform = d.over && motion ? `translate3d(${rub(d.over).toFixed(1)}px,0,0)` : '';
    d.pts.push([e.timeStamp, e.clientX]);
    while (d.pts.length > 2 && e.timeStamp - d.pts[0][0] > 100) d.pts.shift();
  });
  const drop = e => {
    const d = drag;
    if (!d || e.pointerId !== d.id) return;
    drag = null;
    if (!d.on) return;
    eat = performance.now() + 120;
    row.classList.remove('is-drag');
    const tf = trk.style.transform;
    if (tf) { trk.style.transform = ''; trk.animate([{ transform: tf }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,1.5,.4,1)' }); }
    // Momentum: the speed of the last 100 ms carries the row on, then it settles on the nearest card
    const [a, b] = [d.pts[0], d.pts[d.pts.length - 1]];
    let v = e.timeStamp - b[0] > 80 || b[0] <= a[0] ? 0 : clamp((b[1] - a[1]) / (b[0] - a[0]), -4, 4);
    if (Math.abs(v) < .25) v = 0;
    glide(nearest(row.scrollLeft - v * 320), -v);
    if (drags++ < 3) act('traek');
  };
  row.addEventListener('pointerup', drop);
  row.addEventListener('pointercancel', drop);
  // The click that ends a drag is not a click on a card
  addEventListener('click', e => { if (performance.now() < eat) { eat = 0; e.stopPropagation(); e.preventDefault(); } }, true);

  /* ---------------- The product panel ---------------- */
  let open = null, tt = 0, nt = 0;
  const fill = c => {
    const mine = c === you, r = c.querySelector('.gsa-card__r');
    // The photo without its square backdrop: the panel draws the backdrop across its whole width
    const img = c.querySelector('.gsa-img svg').cloneNode(true);
    img.firstElementChild.remove();
    P('img').replaceChildren(img);
    P('s').innerHTML = c.querySelector('.gsa-card__s').innerHTML + (mine ? '<span>lervaerk.dk</span>' : '');
    P('t').textContent = c.querySelector('.gsa-card__t').textContent;
    P('p').innerHTML = c.querySelector('.gsa-card__p').innerHTML;
    P('d').textContent = c.querySelector('.gsa-card__d').textContent;
    P('r').innerHTML = r ? r.innerHTML : '';
    pan.classList.toggle('is-you', mine);
    go.toggleAttribute('data-burst', mine && !go.classList.contains('is-done'));
    go.lastElementChild.textContent = mine ? 'Købt ✓' : 'Kun et eksempel';
  };
  const show = c => {
    open = c; go.classList.remove('is-done', 'is-nope'); clearTimeout(nt); fill(c);
    pan.inert = false; root.classList.add('is-pan');
  };
  const openPan = c => {
    show(c);
    $('[data-gsa-close]').focus({ preventScroll: true });
    act(c === you ? 'kort-dit' : 'kort-andet');
  };
  const closePan = () => {
    if (!open) return;
    const c = open; open = null;
    root.classList.remove('is-pan'); pan.inert = true;
    c.focus({ preventScroll: true });
  };
  cards.forEach(c => c.addEventListener('click', () => openPan(c)));
  // Tabbing into the cards before the entrance: show them at once
  row.addEventListener('focusin', () => { if (pre) reveal(true); });
  $('[data-gsa-close]').addEventListener('click', closePan);
  $('[data-gsa-dim]').addEventListener('click', closePan);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && open) closePan(); });
  $('[data-gsa-mine]').addEventListener('click', () => {
    show(you); glide(snapOf(you)); go.focus({ preventScroll: true });
    if (motion) body.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    act('vis-dit');
  });
  // "Gå til butik": on your card it ends in a sale (confetti from data-burst), on the others it is only an example
  go.addEventListener('click', () => {
    if (go.classList.contains('is-done')) return;
    if (open !== you) { go.classList.add('is-nope'); clearTimeout(nt); nt = setTimeout(() => go.classList.remove('is-nope'), 1700); act('butik-andet'); return; }
    go.classList.add('is-done'); setTimeout(() => go.removeAttribute('data-burst'));
    $('[data-gsa-sum]').textContent = on.tilbud ? '249,00 kr.' : '329,00 kr.';
    again(toast, 'is-on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('is-on'), 3400);
    act('koeb');
  });

  /* ---------------- The switches ---------------- */
  let auto = motion, pre = motion, started = false, vis = false, wake = null;
  const seen = () => vis ? Promise.resolve() : new Promise(r => { wake = r; });
  $$('[data-gsa-fix]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.gsaFix;
    auto = false;
    if (pre) reveal(true);
    set(k, !on[k]);
    act(k + (on[k] ? '-til' : '-fra'));
  }));

  /* ---------------- The entrance ---------------- */
  // The results appear (the cards one by one, unless the visitor is already busy)
  const reveal = fast => {
    pre = false; qEl.textContent = Q; url.textContent = QURL;
    root.classList.remove('is-pre', 'is-typing'); root.classList.add('is-done');
    if (!fast) cards.forEach((c, i) => c.animate([{ opacity: 0, transform: 'translate3d(56px,12px,0) scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 90 + i * 80, easing: 'cubic-bezier(.2,.9,.25,1.12)', fill: 'backwards' }));
    upd();
  };
  const start = async () => {
    started = true;
    await wait(420);
    if (pre) {
      root.classList.add('is-typing');
      for (let i = 1; i <= Q.length; i++) { if (!pre) break; qEl.textContent = Q.slice(0, i); await wait(55 + Math.random() * 65); }
      if (pre) { await wait(280); url.textContent = QURL; stage(1); }
      if (pre) { reveal(false); stage(2); await wait(90 + cards.length * 80 + 650); }
    }
    for (const [i, k] of KEYS.entries()) {
      await seen(); if (!auto) return;
      again(btn(k), 'is-press'); await set(k, true);
      if (!auto) return;
      stage(3 + i); await wait(650);
    }
    $('.gsa-you').animate([{ transform: 'translateX(-50%)' }, { transform: 'translate(-50%,-7px) scale(1.1)', offset: .4 }, { transform: 'translateX(-50%)' }], { duration: 700, easing: 'cubic-bezier(.3,.7,.3,1)' });
    if (!arrows[1].classList.contains('is-off')) arrows[1].animate([{ transform: 'none' }, { transform: 'translateX(6px)', offset: .25 }, { transform: 'none', offset: .5 }, { transform: 'translateX(6px)', offset: .75 }, { transform: 'none' }], { duration: 1100, delay: 300 });
  };

  if (motion) {
    // Before the entrance: an empty search, and your product as it is today
    root.classList.add('is-pre'); qEl.textContent = ''; url.textContent = 'google.dk';
    KEYS.forEach(k => { on[k] = shown[k] = false; btn(k).setAttribute('aria-pressed', 'false'); cell(k).textContent = FEED[k][0]; paint(k); });
    new IntersectionObserver(es => {
      vis = es[es.length - 1].isIntersecting;
      if (vis && wake) { wake(); wake = null; }
      if (vis && !started) start();
    }, { threshold: .5 }).observe($('.gsa-car'));
  }
  upd();
}
