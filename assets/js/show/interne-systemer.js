// Showcase: Interne systemer, a drag pipeline (scripts/services/showcase/interne-systemer.html).
// A CRM of our own drawing: tiles on top, a pipeline of three columns below. A card is dragged with the mouse
// at once or with a finger after a short hold (a swipe still scrolls the board), or moved on with its button.
// Cards fly with FLIP (Web Animations, transform only), land with a squash, and the tiles count up. When the
// board comes into view a drawn cursor drags one card, once. Kalender shows the week, with the won jobs.
// Without html.motion: no intro and no demo (its result is shown), every move is instant.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--interne-systemer');
if (root) init(root);

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const app = $('[data-crm]'), board = $('[data-crm-board]'), cols = $$('[data-crm-col]'), cards = $$('[data-lead]');
  const lists = cols.map(c => c.querySelector('ul')), hand = $('[data-crm-hand]'), live = $('[data-crm-live]');
  const resetB = $('[data-crm-reset]'), badge = $('[data-crm-badge]'), cal = $('[data-crm-cal]'), calN = $('[data-crm-n]');
  const path = $('[data-crm-path]'), bar = $('[data-crm-bar]'), delta = $('[data-crm-delta]'), lastEl = $('[data-crm-last]');
  const views = $$('[data-crm-view]'), panes = $$('[data-crm-pane]');
  const NAMES = ['Ny henvendelse', 'Tilbud sendt', 'Vundet'], DAYS = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag'];
  const EZ = 'cubic-bezier(.2,.8,.2,1)', none = { transform: 'none' };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'), kr = n => fmt(n) + ' kr.';
  const who = c => c.querySelector('b').textContent, colOf = el => lists.indexOf(el.parentElement);
  const inCol = i => [...lists[i].children].filter(x => x.hasAttribute('data-lead'));
  const sum = a => a.reduce((s, c) => s + +c.dataset.kr, 0), slotOf = c => c.dataset.slot.split(',').map(Number);
  const act = a => track('showcase_interact', { showcase: 'interne-systemer', action: a });
  let maxStep = 0;
  const step = n => { while (maxStep < n) track('showcase_step', { showcase: 'interne-systemer', step: ++maxStep }); };
  const anim = (el, k, o) => motion ? el.animate(k, o) : null;
  const bump = (el, s = 1.03) => anim(el, [none, { transform: `translateY(-2px) scale(${s})`, offset: .3 }, none], { duration: 520, easing: EZ });
  const stop = el => el.getAnimations().forEach(a => a.cancel());

  // A card's line and button follow its column
  const meta = (c, i) => {
    const [d, s] = slotOf(c), b = c.querySelector('[data-mv]');
    c.querySelector('[data-meta]').textContent = i === 2 ? `Booket ${DAYS[d].slice(0, 3).toLowerCase()}. kl. ${s}` : c.dataset['m' + i] || (i ? 'Tilbud sendt i dag' : 'Fra hjemmesiden');
    c.classList.toggle('is-won', i === 2);
    b.hidden = i === 2;
    b.firstChild.textContent = i ? 'Vundet' : 'Send tilbud';
    if (i < 2) b.setAttribute('aria-label', `Flyt ${who(c)} til ${NAMES[i + 1]}`);
  };

  // The tiles: each number counts from what it shows to its new value
  const T = {}, F = { open: fmt, openKr: v => kr(v) + ' i spil', won: fmt, wonKr: kr };
  $$('[data-t]').forEach(el => { T[el.dataset.t] = { el, v: null, cur: 0 }; });
  const tween = (k, to, quiet) => {
    const t = T[k];
    if (t.v === to) return;
    const first = t.v === null, t0 = performance.now(), a = t.cur;
    t.v = to; cancelAnimationFrame(t.raf);
    if (!motion || quiet || first) { t.cur = to; t.el.textContent = F[k](to); return; }
    const tick = now => {
      const p = Math.min(1, (now - t0) / 950);
      t.cur = a + (to - a) * (1 - (1 - p) ** 3); t.el.textContent = F[k](t.cur);
      if (p < 1) t.raf = requestAnimationFrame(tick);
    };
    t.raf = requestAnimationFrame(tick);
    bump(t.el.closest('li'));
  };
  let wonWas = null;
  const stats = quiet => {
    const by = [0, 1, 2].map(inCol), w = sum(by[2]);
    cols.forEach((col, i) => {
      const n = col.querySelector('[data-c]'), was = +n.textContent;
      n.textContent = by[i].length; col.querySelector('[data-s]').textContent = kr(sum(by[i]));
      if (!quiet && was !== by[i].length) bump(n, 1.3);
    });
    tween('open', by[1].length, quiet); tween('openKr', sum(by[1]), quiet); tween('won', by[2].length, quiet); tween('wonKr', w, quiet);
    lastEl.textContent = by[2].length ? 'Senest: ' + who(by[2][0]) : 'Ingen endnu';
    bar.style.transform = `scaleY(${Math.min(1, w / 320000).toFixed(3)})`;
    if (!quiet && wonWas !== null && w !== wonWas) {
      delta.textContent = (w > wonWas ? '+' : '−') + kr(Math.abs(w - wonWas)); delta.classList.toggle('is-neg', w < wonWas);
      anim(delta, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none', offset: .15 }, { opacity: 1, transform: 'none', offset: .8 }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 2000, easing: EZ });
    }
    wonWas = w;
    return { by, w };
  };

  // FLIP: measure, change the DOM, let each element glide from where it was
  const flip = (els, mutate) => {
    const b = els.map(el => el.getBoundingClientRect());
    if (motion) els.forEach(stop);
    mutate();
    if (motion) els.forEach((el, i) => {
      const a = el.getBoundingClientRect(), dx = b[i].left - a.left, dy = b[i].top - a.top;
      if (Math.abs(dx) + Math.abs(dy) > .5) el.animate([{ transform: `translate(${dx}px,${dy}px)` }, none], { duration: 420, easing: EZ });
    });
  };

  // Won jobs not seen in the calendar yet
  const fresh = new Set();
  const badgeUp = () => { badge.hidden = !fresh.size; badge.textContent = fresh.size; };

  // Move a card: the others make room, the card flies (from where it is held, or in an arc) and lands with a
  // squash; the tiles count as it lands
  const commit = (c, to, place, lift) => {
    clearTimeout(c._land); stop(c); c.style.transform = '';
    const r0 = c.getBoundingClientRect(), fx = r0.left + (lift ? lift.tx : 0), fy = r0.top + (lift ? lift.ty : 0);
    flip(cards.filter(x => x !== c), () => { place(); meta(c, to); });
    const r1 = c.getBoundingClientRect(), dx = fx - r1.left, dy = fy - r1.top, quiet = demo;
    if (to === 2) fresh.add(c); else fresh.delete(c);
    badgeUp();
    const land = () => {
      c.classList.remove('is-lift');
      const s = stats();
      if (to === 2 && motion) { c.classList.remove('is-ping'); void c.offsetWidth; c.classList.add('is-ping'); }
      if (!quiet) live.textContent = `${who(c)} er flyttet til ${NAMES[to]}. ` + (to === 2 ? `Omsætning denne måned: ${kr(s.w)} Opgaven er booket i kalenderen.` : `Åbne tilbud: ${s.by[1].length}.`);
    };
    if (!motion) return land();
    c.classList.add('is-lift');
    const dur = lift ? 560 : 860, head = lift ? [{ transform: `translate(${dx}px,${dy}px) rotate(${lift.rot}deg) scale(1.04)`, easing: 'cubic-bezier(.25,.7,.35,1)' }]
      : [{ transform: `translate(${dx}px,${dy}px)`, easing: 'ease-out' }, { transform: `translate(${dx * .45}px,${dy * .45 - 34}px) rotate(${dx < 0 ? -4 : 4}deg) scale(1.05)`, offset: .3, easing: 'ease-in-out' }];
    c.animate(head.concat([{ transform: 'translateY(-2px) scale(1.02)', offset: .6, easing: 'ease-in' }, { transform: 'translateY(3px) scale(1.035,.95)', offset: .74, easing: 'ease-out' }, { transform: 'translateY(-1px) scale(.985,1.02)', offset: .88, easing: 'ease-in-out' }, none]), { duration: dur });
    c._land = setTimeout(land, dur * .64);
  };
  const shown = () => { resetB.hidden = false; };

  // Dragging: the card follows the pointer with a little swing, a dashed slot shows where it will land
  const slotEl = document.createElement('li');
  slotEl.className = 'crm__slot'; slotEl.setAttribute('aria-hidden', 'true');
  let P = null, D = null, raf = 0, demo = false, touched = false, view = 'pipeline';
  const placeSlot = (over, at) => {
    const ls = [slotEl.parentElement, lists[over]].filter((l, i, a) => l && a.indexOf(l) === i);
    flip(ls.flatMap(l => [...l.children].filter(x => x !== slotEl)), () => { if (over < 0) slotEl.remove(); else lists[over].insertBefore(slotEl, inCol(over)[at] || null); });
    cols.forEach((col, i) => col.classList.toggle('is-over', i === over));
    D.over = over; D.at = at;
  };
  const begin = virt => {
    const c = P.card, br = board.getBoundingClientRect();
    clearTimeout(P.hold); c.classList.remove('is-press'); stop(c);
    D = { c, from: colOf(c), sx: P.sx, sy: P.sy, px: P.sx, py: P.sy, lx: P.sx, ss: board.scrollLeft, max: board.scrollWidth - board.clientWidth, bl: br.left, bt: br.top, over: -1, at: -1, tx: 0, ty: 0, rot: 0, virt };
    slotEl.style.height = c.offsetHeight + 'px';
    c.classList.add('is-lift'); app.classList.add('is-drag');
    if (!virt) { touched = true; try { c.setPointerCapture(P.id); } catch (e) { /* the pointer is gone */ } }
    raf = requestAnimationFrame(frame);
  };
  const frame = () => {
    const d = D, br = board.getBoundingClientRect();
    // Near the sides of a board that scrolls, it scrolls along (only as far as before: the card widens it)
    if (!d.virt && d.max > 1) {
      const v = d.px < br.left + 44 ? d.px - br.left - 44 : d.px > br.right - 44 ? d.px - br.right + 44 : 0;
      if (v) board.scrollLeft = clamp(board.scrollLeft + clamp(v / 2.5, -14, 14), 0, d.max);
    }
    d.tx = d.px - d.sx + board.scrollLeft - d.ss - (br.left - d.bl); d.ty = d.py - d.sy - (br.top - d.bt);
    d.rot += (clamp((d.px - d.lx) * .5, -7, 7) + 1.5 - d.rot) * .18; d.lx = d.px;
    d.c.style.transform = `translate(${d.tx.toFixed(1)}px,${d.ty.toFixed(1)}px) rotate(${d.rot.toFixed(2)}deg) scale(1.04)`;
    // The column nearest the pointer (not its own) and the place in it
    let over = -1, at = -1, best = 1e9;
    if (d.py > br.top - 70 && d.py < br.bottom + 70 && d.px > br.left - 40 && d.px < br.right + 40) cols.forEach((col, i) => {
      const r = col.getBoundingClientRect(), m = Math.abs(d.px - r.left - r.width / 2);
      if (m < best) { best = m; over = i; }
    });
    if (over === d.from) over = -1;
    if (over >= 0) { const it = inCol(over); at = it.findIndex(x => { const r = x.getBoundingClientRect(); return d.py < r.top + r.height / 2; }); if (at < 0) at = it.length; }
    if (over !== d.over || at !== d.at) placeSlot(over, at);
    raf = requestAnimationFrame(frame);
  };
  const drop = cancel => {
    cancelAnimationFrame(raf);
    const d = D, c = d.c, to = cancel ? -1 : d.over;
    D = P = null;
    app.classList.remove('is-drag'); cols.forEach(col => col.classList.remove('is-over'));
    if (to >= 0) return commit(c, to, () => { lists[to].insertBefore(c, slotEl); slotEl.remove(); }, d), true;
    const sl = slotEl.parentElement;
    flip(sl ? [...sl.children].filter(x => x !== slotEl) : [], () => slotEl.remove());
    c.style.transform = ''; c.classList.remove('is-lift');
    anim(c, [{ transform: `translate(${d.tx}px,${d.ty}px) rotate(${d.rot}deg) scale(1.04)` }, none], { duration: 480, easing: 'cubic-bezier(.3,1.3,.5,1)' });
    return false;
  };
  const release = () => { clearTimeout(P.hold); P.card.classList.remove('is-press'); P = null; };

  board.addEventListener('pointerdown', e => {
    const c = e.target.closest('[data-lead]');
    if (!c || P || demo || e.button > 0 || e.target.closest('button')) return;
    P = { card: c, id: e.pointerId, sx: e.clientX, sy: e.clientY, touch: e.pointerType === 'touch' };
    if (P.touch) { c.classList.add('is-press'); P.hold = setTimeout(() => { if (P && !D) begin(); }, 230); }
    else e.preventDefault();
  });
  board.addEventListener('pointermove', e => {
    if (!P || e.pointerId !== P.id) return;
    if (D) { D.px = e.clientX; D.py = e.clientY; return; }
    const m = Math.hypot(e.clientX - P.sx, e.clientY - P.sy);
    if (P.touch) { if (m > 10) release(); } else if (m > 4) { begin(); D.px = e.clientX; D.py = e.clientY; }
  });
  const up = cancel => e => {
    if (!P || e.pointerId !== P.id) return;
    if (!D) return release();
    if (drop(cancel)) { act('traek'); shown(); }
  };
  board.addEventListener('pointerup', up(false));
  board.addEventListener('pointercancel', up(true));
  // While a finger drags, the page and the board stay put
  board.addEventListener('touchmove', e => { if (D && e.cancelable) e.preventDefault(); }, { passive: false });
  board.addEventListener('contextmenu', e => { if (P) e.preventDefault(); });

  // The buttons; on phones the board scrolls to the column the card went to
  board.addEventListener('click', e => {
    const b = e.target.closest('[data-mv]');
    if (!b || demo || D) return;
    const c = b.closest('[data-lead]'), to = colOf(c) + 1, max = board.scrollWidth - board.clientWidth;
    if (to > 2) return;
    touched = true; act(to === 1 ? 'send-tilbud' : 'vundet');
    commit(c, to, () => lists[to].prepend(c));
    (to < 2 ? b : c).focus({ preventScroll: true });
    if (max > 1) board.scrollTo({ left: clamp(cols[to].offsetLeft - (board.clientWidth - cols[to].offsetWidth) / 2, 0, max), behavior: motion ? 'smooth' : 'auto' });
    shown();
  });

  // Back to the start
  const home = [0, 1, 2].map(inCol);
  resetB.addEventListener('click', () => {
    if (demo || D) return;
    act('nulstil');
    flip(cards, () => home.forEach((a, i) => a.forEach(c => { lists[i].append(c); meta(c, i); })));
    fresh.clear(); badgeUp(); stats();
    board.scrollTo({ left: 0, behavior: motion ? 'smooth' : 'auto' });
    resetB.hidden = true;
    home[0][0].querySelector('[data-mv]').focus({ preventScroll: true });
    live.textContent = 'Eksemplet er nulstillet.';
  });

  // The calendar: the week's other bookings, and every won job on its slot
  const OTHER = [[1, 13, 1, 'Levering af træ', 'Fra trælasten', 'lev'], [2, 13, 1, 'Besigtigelse', 'Sara Lund', 'bes']], today = new Date().getDay() - 1;
  const renderCal = () => {
    const ev = OTHER.map(([d, s, h, a, b, k]) => ({ d, s, h, a, b, k })).concat(inCol(2).map(c => { const [d, s, h] = slotOf(c); return { d, s, h, a: who(c), b: c.dataset.cal, k: 'job', n: fresh.has(c) }; }));
    cal.innerHTML = '<span class="crm__c0"></span>' + DAYS.map((n, i) => `<b class="crm__dh${i === today ? ' is-today' : ''}" aria-hidden="true">${n.slice(0, 3)}</b>`).join('')
      + `<div class="crm__hrs" aria-hidden="true">${[7, 8, 9, 10, 11, 12, 13, 14].map(h => `<span>${h}</span>`).join('')}</div>`
      + DAYS.map((n, i) => `<ul class="crm__day" aria-label="${n}">${ev.filter(e => e.d === i).sort((x, y) => x.s - y.s).map(e =>
        `<li class="crm__ev is-${e.k}${e.n ? ' is-new' : ''}" style="--s:${e.s - 7};--h:${e.h}"><b>${e.a}</b><span>${e.b} · kl. ${e.s}–${e.s + e.h}</span>${e.n ? '<i>Ny</i>' : ''}</li>`).join('')}</ul>`).join('');
    calN.textContent = ev.length + ' aftaler';
  };
  views.forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.crmView;
    if (v === view || D || demo) return;
    view = v; act(v);
    views.forEach(x => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b); });
    if (v === 'kalender') renderCal();
    panes.forEach(p => { p.hidden = p.dataset.crmPane !== v; });
    path.textContent = app.dataset.view = v;
    anim(panes.find(p => !p.hidden), [{ opacity: 0, transform: 'translateY(12px)' }, none], { duration: 420, easing: EZ });
    if (v === 'kalender') { fresh.clear(); badgeUp(); }
  }));

  // The demo: a drawn cursor grabs the first offer and drags it on; on phones the board pans along
  let done = false;
  const runDemo = () => {
    const c = inCol(1)[0] || inCol(0)[0];
    if (done || touched || P || view !== 'pipeline' || !c) return;
    done = demo = true; app.classList.add('is-demo');
    const to = colOf(c) + 1, r = c.getBoundingClientRect(), br = board.getBoundingClientRect(), s0 = board.scrollLeft, tl = lists[to].getBoundingClientRect();
    const ox = r.width * .4, oy = r.height * .38, x0 = r.left - br.left + s0 + ox, y0 = r.top - br.top + oy, x1 = tl.left - br.left + s0 + ox, y1 = tl.top - br.top + oy + 4;
    const max = board.scrollWidth - board.clientWidth, cam = x => clamp(x - ox + r.width / 2 - board.clientWidth / 2, 0, max), sA = cam(x0);
    const io = p => p < .5 ? 2 * p * p : 1 - (2 - 2 * p) ** 2 / 2;
    // Puts the cursor on a point of the board's content, returns where that is on screen
    const at = (x, y, sc, s, o) => {
      if (max > 1) board.scrollLeft = sc;
      const b = board.getBoundingClientRect(), a = app.getBoundingClientRect(), px = b.left + x - board.scrollLeft, py = b.top + y;
      hand.style.transform = `translate(${(px - a.left).toFixed(1)}px,${(py - a.top).toFixed(1)}px) scale(${s})`; hand.style.opacity = o;
      return [px, py];
    };
    let t0 = 0;
    const tick = now => {
      const t = now - (t0 ||= now);
      if (t < 700) { const p = io(t / 700); at(x0 + 80 * (1 - p), y0 + 64 * (1 - p), s0 + (sA - s0) * p, 1, Math.min(1, t / 240)); }
      else if (t < 950) { const [px, py] = at(x0, y0, sA, 1 - .14 * Math.min(1, (t - 700) / 120), 1); if (!D) { P = { card: c, sx: px, sy: py }; begin(true); } }
      else if (t < 2050) { const p = io((t - 950) / 1100), x = x0 + (x1 - x0) * p; [D.px, D.py] = at(x, y0 + (y1 - y0) * p - Math.sin(Math.PI * p) * 30, cam(x), .86, 1); }
      else { if (D) { drop(); step(2); } const p = Math.min(1, (t - 2050) / 450); at(x1 + 26 * p, y1 + 30 * p, board.scrollLeft, .86 + .14 * p, 1 - p); }
      if (t < 2500) requestAnimationFrame(tick); else { demo = false; app.classList.remove('is-demo'); }
    };
    requestAnimationFrame(tick);
  };

  // Start: lines and tiles from the cards; without motion the demo's move is already made
  cards.forEach(c => meta(c, colOf(c)));
  if (!motion) { const c = inCol(1)[0]; lists[2].prepend(c); meta(c, 2); fresh.add(c); badgeUp(); }
  stats(true);
  let timer = 0;
  new IntersectionObserver(es => {
    const e = es[es.length - 1];
    if (e.intersectionRatio >= .2 && !app.classList.contains('is-in')) {
      app.classList.add('is-in'); step(1);
      if (motion) [...$$('.crm__tile'), ...cards].forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(14px) scale(.97)' }, none], { duration: 600, delay: 80 + i * 55, easing: 'cubic-bezier(.3,1.35,.5,1)', fill: 'backwards' }));
    }
    clearTimeout(timer);
    if (motion && e.intersectionRatio >= .5) timer = setTimeout(runDemo, 1200);
  }, { threshold: [0, .2, .5] }).observe(board);
}
