// Influencer marketing showcase (/services/influencer-marketing): a creator match deck. Six example creators (made-up
// people, never real) for Kravlezoo, a made-up webshop with animal costumes for children, each with a match score: how
// much the followers look like the shop's customers. The visitor approves or skips the top card with the buttons, by
// dragging it (mouse or finger) or with the arrow keys. An approved creator becomes a chip on the campaign board, the
// deal ticks off (Pris, Rettigheder til annoncer, Markeret som "Reklame", Deadline) and is signed, the post appears on
// a phone with a clear "Reklame" label, and a small report counts up. When the section comes into view the deck plays
// itself once (Rikke approved, Sara skipped), then it is the visitor's turn. Without motion the board starts finished.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--influencer-marketing');
if (root) {
  try { init(root); } catch (e) { root.classList.add('is-in'); throw e; }
}

function init(root) {
  const $ = (s, el = root) => el.querySelector(s), $$ = (s, el = root) => [...el.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const S = 'influencer-marketing';
  const ev = action => track('showcase_interact', { showcase: S, action });
  const seen = new Set();
  const step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: S, step: n }); } };

  // The deal, the post and the report for each creator, in the order of the cards (all made up)
  const D = [
    { pris: '4.500 kr. + 2 dragter', ret: '6 måneder', dl: 'Ude senest 31. januar', kode: 'RIKKE15', media: 'ugc-nuttetbaby-mor', likes: '2.481', kom: '96', cap: 'Fastelavn er reddet. Ungerne vil ikke af med dem igen.', rep: [26480, 1214, 87] },
    { pris: '9.000 kr.', ret: '3 måneder', dl: 'Ude senest 31. januar', kode: 'SARA10', img: 'foto-nuttetbaby-flok', likes: '3.902', kom: '41', cap: 'Min niece og hendes venner til fastelavn. Så søde!', rep: [64100, 402, 6] },
    { pris: '6.000 kr. + 2 dragter', ret: '6 måneder', dl: 'Ude senest 30. januar', kode: 'JONAS15', media: 'ugc-nuttetbaby-far', likes: '4.117', kom: '182', cap: 'Barsel med to små drager. Ja, de sover også i dem.', rep: [41900, 1560, 96] },
    { pris: '3.000 kr. + 2 dragter', ret: '6 måneder', dl: 'Ude senest 29. januar', kode: 'MAJA15', media: 'ugc-nuttetbaby-raev', likes: '1.874', kom: '63', cap: 'Ræven og enhjørningen er klar til tøndeslagning.', rep: [15300, 940, 71] },
    { pris: '7.500 kr.', ret: '3 måneder', dl: 'Ude senest 31. januar', kode: 'LINE10', img: 'foto-nuttetbaby-dino', likes: '2.206', kom: '28', cap: 'Ingen løbetur i dag. Men se lige min nevø!', rep: [38700, 290, 4] },
    { pris: '3.500 kr. + 1 dragt', ret: '6 måneder', dl: 'Ude senest 30. januar', kode: 'EMIL15', media: 'ugc-nuttetbaby-dino', likes: '1.392', kom: '57', cap: 'Viggo har fundet sin indre dinosaur. Den er grøn.', rep: [18200, 830, 52] }
  ];

  const deck = $('[data-im-deck]'), cards = $$('[data-im-c]'), end = $('[data-im-end]'), left = $('[data-im-left]');
  const acts = $$('[data-im-act]'), board = $('[data-im-board]'), chips = $('[data-im-chips]'), none = $('.im-chips__none');
  const rows = $$('[data-im-row]'), pill = $('[data-im-pill]'), kpis = $$('[data-im-k]'), scr = $('[data-im-scr]');
  const vid = $('[data-im-vid]'), img = $('[data-im-img]'), pp = $('[data-im-pp]'), live = $('[data-im-live]');
  const toast = $('[data-im-toast]'), toastT = $('[data-im-toast-t]'), ph = $('.im-ph');
  const name = i => $('.im-nm', cards[i]).textContent, ini = i => $('.im-av', cards[i]).textContent;
  const hue = cards.map(c => c.getAttribute('style')); // each creator's colours, before any drag adds to the style
  const fmt = n => Math.round(n).toLocaleString('da-DK');
  const say = t => { live.textContent = t; };

  let order = cards.map((c, i) => i), busy = false, started = false, active = -1;
  let tq = [], auto = [], autoOn = motion, paused = !motion, inView = false, tt = 0;
  const later = (fn, ms) => tq.push(setTimeout(fn, ms));
  const stopAuto = () => {
    if (autoOn && auto.length && order.length && !busy) { const c = cards[order[0]]; c.style.transform = ''; c.style.removeProperty('--sy'); c.style.removeProperty('--sn'); }
    autoOn = false; auto.forEach(clearTimeout); auto = []; root.classList.remove('is-hint');
  };

  /* ---------------- The deck ---------------- */
  const place = () => {
    order.forEach((i, p) => {
      const c = cards[i], q = Math.min(p, 3);
      c.style.setProperty('--p', q); c.dataset.p = q;
      c.classList.toggle('is-top', p === 0);
      c.inert = p !== 0;
    });
    const n = order.length;
    left.textContent = n === cards.length ? `${n} forslag` : n ? `${n} tilbage` : 'Alle set';
    end.hidden = !!n;
    acts.forEach(b => { b.disabled = !n; });
    if (!n) step(4);
  };

  const decide = (yes, how, isAuto) => {
    if (busy || !order.length) return;
    if (!isAuto) { stopAuto(); ev((yes ? 'godkend' : 'spring-over') + (how ? '-' + how : '')); }
    const i = order.shift(), c = cards[i];
    if (motion) {
      busy = true;
      const w = c.offsetWidth, s = yes ? 1 : -1, dy = parseFloat(c.dataset.dy || 20);
      c.classList.remove('is-drag', 'is-wiggle');
      c.classList.add('is-out');
      c.style.setProperty('--sy', yes ? 1 : 0); c.style.setProperty('--sn', yes ? 0 : 1);
      c.style.transform = `translate(${s * (w * .95 + 40)}px, ${dy + 30}px) rotate(${s * 18}deg) scale(.9)`;
      c.style.opacity = '0';
      setTimeout(() => { c.classList.add('is-gone'); c.classList.remove('is-top'); busy = false; }, 480);
    } else { c.classList.add('is-gone'); c.classList.remove('is-top'); }
    place();
    if (yes) approve(i, c, isAuto);
    else say(`${name(i)} er sprunget over.`);
    if (!isAuto && !order.length) $('[data-im-again]').focus({ preventScroll: true });
  };

  acts.forEach(b => b.addEventListener('click', () => decide(b.dataset.imAct === 'ja')));
  deck.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); decide(e.key === 'ArrowRight', 'tast'); }
  });

  // Drag the top card: past 110 px (or a quick flick) it goes, otherwise it springs back
  let drag = null;
  const clamp = v => Math.max(0, Math.min(1, v)).toFixed(2);
  deck.addEventListener('pointerdown', e => {
    const c = cards[order[0]];
    if (!c || busy || e.button > 0 || !c.contains(e.target)) return;
    stopAuto();
    drag = { c, id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0, vx: 0, lx: e.clientX, lt: performance.now(), on: false };
  });
  deck.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    d.dx = e.clientX - d.x; d.dy = e.clientY - d.y;
    if (!d.on) {
      if (Math.abs(d.dx) < 6) return;
      d.on = true;
      d.c.classList.add('is-drag');
      d.c.classList.remove('is-wiggle');
      try { d.c.setPointerCapture(d.id); } catch (x) { /* fine */ }
    }
    const t = performance.now();
    d.vx = (e.clientX - d.lx) / Math.max(1, t - d.lt); d.lx = e.clientX; d.lt = t;
    d.c.style.transform = `translate(${d.dx}px, ${d.dy * .3}px) rotate(${d.dx * .055}deg)`;
    d.c.style.setProperty('--sy', clamp(d.dx / 110)); d.c.style.setProperty('--sn', clamp(-d.dx / 110));
  });
  const up = e => {
    if (!drag || e.pointerId !== drag.id) return;
    const { c, dx, dy, vx, on } = drag;
    drag = null;
    if (!on) return;
    c.classList.remove('is-drag');
    if (e.type === 'pointerup' && (Math.abs(dx) > 110 || (Math.abs(vx) > .55 && Math.abs(dx) > 40))) { c.dataset.dy = dy * .3; decide(dx > 0, 'swipe'); }
    else { c.style.transform = ''; c.style.removeProperty('--sy'); c.style.removeProperty('--sn'); }
  };
  deck.addEventListener('pointerup', up);
  deck.addEventListener('pointercancel', up);

  $('[data-im-again]').addEventListener('click', () => {
    ev('forfra');
    tq.forEach(clearTimeout); tq = [];
    order = cards.map((c, i) => i);
    cards.forEach(c => { c.classList.remove('is-gone', 'is-out', 'is-top'); c.style.transform = ''; c.style.opacity = ''; c.style.removeProperty('--sy'); c.style.removeProperty('--sn'); delete c.dataset.dy; });
    $$('.im-chip', chips).forEach(b => b.remove());
    none.hidden = false;
    blank();
    requestAnimationFrame(() => { place(); deck.focus({ preventScroll: true }); });
  });

  /* ---------------- The board ---------------- */
  // Empty until someone is approved
  const blank = () => {
    active = -1;
    board.classList.remove('is-on', 'is-signed', 'is-live', 'is-rep');
    rows.forEach(r => r.classList.remove('is-ok'));
    pill.textContent = 'Venter';
    kpis.forEach(k => { k.textContent = '0'; });
    vid.pause();
  };

  const chipFor = (i, c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'im-chip'; b.dataset.i = i;
    b.setAttribute('style', hue[i]);
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<i class="im-av" aria-hidden="true">${ini(i)}</i>${name(i)}`;
    b.addEventListener('click', () => { if (active !== i) { ev('vis-skaber'); show(i, false); } });
    none.hidden = true;
    chips.append(b);
    return b;
  };

  // The initial flies from the card to its chip (only when the chip is on screen)
  const fly = (from, chip) => {
    const a = from.getBoundingClientRect(), b = chip.firstElementChild.getBoundingClientRect(), r = root.getBoundingClientRect();
    if (!motion || !chip.animate || b.bottom < 0 || b.top > innerHeight) return;
    const t = document.createElement('i');
    t.className = 'im-av im-tok'; t.textContent = from.textContent; t.setAttribute('aria-hidden', 'true');
    t.setAttribute('style', hue[+from.closest('[data-im-c]').dataset.imC]);
    Object.assign(t.style, { left: a.left - r.left + 'px', top: a.top - r.top + 'px', width: a.width + 'px', height: a.height + 'px', fontSize: '34px', border: '4px solid #fff' });
    root.append(t);
    chip.style.opacity = '0';
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2), k = b.width / a.width;
    t.animate([{ transform: 'none' }, { transform: `translate(${dx * .5}px, ${dy * .5 - 70}px) scale(${(1 + k) / 2})`, offset: .5 }, { transform: `translate(${dx}px, ${dy}px) scale(${k})` }],
      { duration: 720, easing: 'cubic-bezier(.45,.05,.3,1)' }).onfinish = () => { t.remove(); chip.style.opacity = ''; chip.classList.add('is-new'); };
  };

  const approve = (i, c, isAuto) => {
    const from = $('.im-av', c), chip = chipFor(i, c);
    fly(from, chip);
    if (!motion) chip.classList.add('is-new');
    show(i, motion);
    say(`${name(i)} er godkendt. Aftalen er på skrift, og opslaget er markeret som reklame.`);
    // Phones: the board is further down, so a toast points to it
    const bt = board.getBoundingClientRect().top;
    if (!isAuto && bt > innerHeight - 120) {
      toastT.textContent = `${name(i)} er godkendt.`;
      toast.hidden = false;
      clearTimeout(tt); tt = setTimeout(() => { toast.hidden = true; }, 4500);
    }
  };
  toast.addEventListener('click', () => {
    ev('se-aftale'); toast.hidden = true;
    scrollTo({ top: scrollY + board.getBoundingClientRect().top - 100, behavior: motion ? 'smooth' : 'auto' });
  });

  const fill = i => {
    const d = D[i], n = name(i), a = ini(i);
    board.setAttribute('style', hue[i]);
    $$('[data-im-n]').forEach(e => { e.textContent = n; });
    $('[data-im-sn]').textContent = n;
    $$('[data-im-av]').forEach(e => { e.textContent = a; });
    $$('[data-im-f]').forEach(e => { const k = e.dataset.imF; if (d[k] != null) e.textContent = d[k]; });
    $$('.im-chip', chips).forEach(b => { const on = +b.dataset.i === i; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    if (d.media) {
      img.hidden = true; vid.hidden = false; pp.hidden = false;
      if (vid.dataset.m !== d.media) { vid.pause(); vid.poster = `/assets/media/${d.media}.jpg`; vid.src = `/assets/media/${d.media}.mp4`; vid.dataset.m = d.media; }
    } else {
      vid.pause(); vid.hidden = true; pp.hidden = true; img.hidden = false;
      img.src = `/assets/media/${d.img}.webp`;
    }
  };
  const count = (i, ms) => {
    const to = D[i].rep, t0 = performance.now();
    if (!ms) return kpis.forEach((k, j) => { k.textContent = fmt(to[j]); });
    const tick = t => {
      const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3);
      kpis.forEach((k, j) => { k.textContent = fmt(to[j] * e); });
      if (p < 1 && active === i) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  // Show one creator's deal, post and report: step by step after an approval, at once from a chip
  const show = (i, anim) => {
    tq.forEach(clearTimeout); tq = [];
    active = i;
    fill(i);
    board.classList.add('is-on');
    if (!anim) {
      rows.forEach(r => r.classList.add('is-ok'));
      board.classList.add('is-signed', 'is-live', 'is-rep');
      pill.textContent = 'Underskrevet';
      count(i, 0); play();
      return;
    }
    board.classList.remove('is-signed', 'is-live', 'is-rep');
    rows.forEach(r => r.classList.remove('is-ok'));
    pill.textContent = 'Udkast';
    kpis.forEach(k => { k.textContent = '0'; });
    vid.pause();
    rows.forEach((r, j) => later(() => r.classList.add('is-ok'), 560 + j * 340));
    later(() => { board.classList.add('is-signed'); pill.textContent = 'Underskrevet'; step(2); }, 1980);
    later(() => { board.classList.add('is-live'); play(); step(3); }, 3100);
    later(() => { board.classList.add('is-rep'); count(i, 1100); }, 3700);
  };

  // Hovering the "Reklame" point of the deal rings the label in the post
  const hl = $('[data-im-hl]');
  hl.addEventListener('mouseenter', () => board.classList.add('is-hl'));
  hl.addEventListener('mouseleave', () => board.classList.remove('is-hl'));

  /* ---------------- The video: only while on screen, never without motion unless asked ---------------- */
  const play = () => {
    scr.classList.toggle('is-paused', paused);
    pp.setAttribute('aria-label', paused ? 'Afspil videoen' : 'Sæt videoen på pause');
    if (!vid.hidden && board.classList.contains('is-live') && inView && !paused) { const p = vid.play(); if (p) p.catch(() => {}); } else vid.pause();
  };
  pp.addEventListener('click', () => { paused = !paused; ev(paused ? 'pause' : 'afspil'); play(); });

  /* ---------------- Start ---------------- */
  // The deck plays itself once: a nudge, Rikke approved, Sara skipped, then the buttons breathe
  const ghost = yes => {
    if (!autoOn || busy || !order.length) return;
    const c = cards[order[0]];
    c.classList.remove('is-wiggle');
    c.style.setProperty('--sy', yes ? .9 : 0); c.style.setProperty('--sn', yes ? 0 : .9);
    c.style.transform = `translate(${yes ? 96 : -96}px, 6px) rotate(${yes ? 5 : -5}deg)`;
    auto.push(setTimeout(() => { if (autoOn) decide(yes, '', true); }, 520));
  };
  const start = () => {
    if (started) return;
    started = true;
    root.classList.add('is-in');
    step(1);
    if (!autoOn) return;
    auto.push(setTimeout(() => { if (autoOn && order.length) cards[order[0]].classList.add('is-wiggle'); }, 700));
    auto.push(setTimeout(() => ghost(true), 1700));
    auto.push(setTimeout(() => ghost(false), 6000));
    auto.push(setTimeout(() => { if (autoOn) root.classList.add('is-hint'); }, 6900));
  };

  place();
  if (motion) {
    blank();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { start(); io.disconnect(); } }), { threshold: .35 });
      io.observe(deck);
    } else start();
  } else {
    // The finished state: Rikke approved with her deal, post and report, Sara skipped
    order = order.slice(2);
    cards[0].classList.add('is-gone'); cards[1].classList.add('is-gone'); cards[0].classList.remove('is-top');
    place();
    chipFor(0, cards[0]);
    show(0, false);
    root.classList.add('is-in');
    step(1);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { inView = es[0].isIntersecting; play(); }, { threshold: .25 }).observe(ph);
  }
}
