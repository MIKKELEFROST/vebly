// Organisk Instagram showcase (/services/organisk-instagram): "Comment to DM". An example post for Kravlezoo (a
// made-up shop for children's costumes, never a real business). When the stage comes into view the comments pop
// in one by one; each one with the keyword sends a paper plane to the inbox, where the automatic reply lands
// within a second and the counter of new contacts ticks. The picker swaps the campaign (GUIDE, PRIS, BOOK): post,
// comments and reply change and the flow runs again. "Prøv selv" adds the visitor's own comment and reply.
// Without motion: the finished state of each campaign, no flights, no autoplay.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--organisk-instagram');
if (root) {
  try { init(root); } catch (e) { root.classList.remove('is-fade'); throw e; }
}

function init(root) {
  const S = 'organisk-instagram', NS = 'http://www.w3.org/2000/svg';
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const stage = $('[data-ig-stage]'), list = $('[data-ig-list]'), threads = $('[data-ig-threads]'), open = $('[data-ig-open]');
  const ctx = $('.ig-open__ctx'), bub = $('[data-ig-bub]'), card = $('[data-ig-card]'), sec = $('[data-ig-sec]');
  const nEl = $('[data-ig-n]'), plus = $('[data-ig-plus]'), likesEl = $('[data-ig-likes]'), cap = $('[data-ig-cap]');
  const fly = $('[data-ig-fly]'), tryB = $('[data-ig-try]'), live = $('[data-ig-live]'), sr = $('[data-ig-sr]');
  const picks = $$('[data-ig-camp]'), media = $$('[data-ig-media]'), mediaBox = $('.ig-media');
  const seen = new Set();
  const step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: S, step: n }); } };
  const ev = action => track('showcase_interact', { showcase: S, action });
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = n => n.toLocaleString('da-DK');
  const SEC = ['0,8', '0,7', '0,9', '0,6', '0,8', '0,7', '0,9', '0,6'];
  const hi = n => n ? ' ' + n : '';

  // The three campaigns. Names, prices and numbers are examples. cm: [handle, first name, comment, hue]
  const CAMP = {
    guide: {
      kw: 'GUIDE', likes: 1204, base: 31,
      cap: 'Ræv eller enhjørning? Kommentér GUIDE, så sender vi vores størrelsesguide i en besked.',
      msg: n => `Hej${hi(n)}! Her er vores størrelsesguide. Mål fra skulder til fod, så finder du den rigtige dragt.`,
      card: '<span class="ig-card__ic"><svg><use href="#ig-i-doc"/></svg></span><span class="ig-card__t"><b>Størrelsesguide</b><small>Fra 1 til 6 år</small></span><span class="ig-card__go">Åbn guiden</span>',
      cm: [['sofie.mor', 'Sofie', 'GUIDE', 270], ['jonas.far', 'Jonas', 'Guide tak', 24], ['line_og_ida', 'Line', 'Så søde!', 150], ['mette.bk', 'Mette', 'GUIDE til min datter', 330], ['anna.lund', 'Anna', 'guide', 200], ['kasper.h', 'Kasper', 'GUIDE', 95], ['frederikke.t', 'Frederikke', 'Hvor er de fine. Guide!', 300], ['nanna.jo', 'Nanna', 'GUIDE', 45]],
      sr: 'Opslaget er en video af to børn i ræve- og enhjørningsdragt med teksten: Kommentér GUIDE, så sender vi vores størrelsesguide i en besked. Hver gang nogen kommenterer GUIDE, får de automatisk en besked med guiden inden for et sekund, og tælleren over nye kontakter stiger.'
    },
    pris: {
      kw: 'PRIS', likes: 892, base: 24,
      cap: 'Dinodragten er tilbage på lager. Kommentér PRIS, så får du prisen og en rabatkode i en besked.',
      msg: n => `Hej${hi(n)}! Dinodragten koster 299 kr. Brug koden DINO10, så får du 10 % i dag.`,
      card: '<img class="ig-card__img" src="/assets/media/ugc-nuttetbaby-dino.jpg" alt="" width="540" height="960" loading="lazy" decoding="async"><span class="ig-card__t"><b>Dinodragt</b><small>299 kr.</small></span><span class="ig-card__go">Se dragten</span>',
      cm: [['camilla.k', 'Camilla', 'PRIS', 15], ['mads_o', 'Mads', 'pris tak', 210], ['ida.marie', 'Ida', 'Findes den i str. 92? PRIS', 320], ['peter.sk', 'Peter', 'Haha, han er sød', 120], ['louise.h', 'Louise', 'PRIS', 260], ['emil.b', 'Emil', 'Pris!', 60], ['julie.ka', 'Julie', 'PRIS på dino', 180], ['sara.n', 'Sara', 'pris', 340]],
      sr: 'Opslaget er en video af et barn i dinosaurdragt med teksten: Kommentér PRIS, så får du prisen og en rabatkode i en besked. Hver gang nogen kommenterer PRIS, får de automatisk en besked med prisen, 299 kroner, og koden DINO10 inden for et sekund.'
    },
    book: {
      kw: 'BOOK', likes: 641, base: 12,
      cap: 'Fotodag i butikken lørdag. Kom i dragt, og få et billede med hjem. Kommentér BOOK, så får du en tid.',
      msg: n => `Hej${hi(n)}! Vælg en tid til fotodagen på lørdag. Det tager 10 minutter.`,
      card: '<span class="ig-slots"><i class="is-x">10.00</i><i>10.20</i><i>10.40</i><i>11.00</i></span>',
      cm: [['maria.th', 'Maria', 'BOOK', 340], ['rasmus.l', 'Rasmus', 'Book os to', 200], ['katrine_j', 'Katrine', 'Hvor ligger butikken?', 30], ['amalie.r', 'Amalie', 'BOOK', 280], ['thomas.v', 'Thomas', 'book', 110], ['signe.p', 'Signe', 'BOOK tak', 0], ['ditte.m', 'Ditte', 'Book!', 230], ['laura.e', 'Laura', 'BOOK', 160]],
      sr: 'Opslaget er et billede af et barn i dragedragt med teksten: Fotodag i butikken lørdag. Kommentér BOOK, så får du en tid. Hver gang nogen kommenterer BOOK, får de automatisk en besked med de ledige tider inden for et sekund.'
    }
  };
  const SR0 = 'Eksempel på en organisk kampagne på Instagram for Kravlezoo, en butik med udklædning til børn i Aalborg. ';

  let cur = 'guide', count = 0, likes = 0, token = 0, timers = [], lastOpen = null, started = false, inView = false;
  const later = (fn, ms) => { const t = token; timers.push(setTimeout(() => { if (t === token) fn(); }, ms)); };
  const kwRe = c => new RegExp(`\\b(${c.kw})\\b`, 'i');
  const mark = (c, t) => esc(t).replace(kwRe(c), '<mark>$1</mark>');
  const av = (h, ch) => `<i class="ig-av" style="--h:${h}">${ch}</i>`;
  const YOU = { h: 'dig', n: '', av: '<i class="ig-av ig-av--you">D</i>' };

  /* ---------------- Building blocks ---------------- */
  const shift = (els, dy) => { if (motion) els.forEach(o => o.animate && o.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 460, easing: 'cubic-bezier(.2,.8,.2,1)' })); };
  const comment = (c, x, you) => {
    const li = document.createElement('li');
    li.className = 'ig-c' + (you ? ' is-you' : '');
    li.innerHTML = `${you ? YOU.av : av(x[3], x[1][0])}<div class="ig-c__b"><p><b>${you ? 'dig' : x[0]}</b> ${mark(c, x[2])}</p><small><span>nu</span><span class="ig-c__r">Svar</span><span class="ig-c__dm"><svg><use href="#ig-i-ok"/></svg>Besked sendt · <span></span> sek.</span></small></div><svg class="ig-c__h"><use href="#ig-i-heart"/></svg>`;
    return li;
  };
  // The newest reply on top of the inbox; the one before it moves down into the list of conversations
  const toThreads = (c, who) => {
    const li = document.createElement('li');
    li.className = 'ig-th';
    li.innerHTML = `${who.av}<span class="ig-th__t"><b>${who.h}</b><small><span>Du: ${esc(c.msg(who.n))}</span><i></i></small></span><i class="ig-th__dot"></i>`;
    const old = [...threads.children];
    threads.prepend(li);
    while (threads.children.length > 6) threads.lastElementChild.remove();
    [...threads.children].forEach((r, k) => { r.querySelector('.ig-th__t i').textContent = ' · ' + (k < 2 ? 'nu' : k < 4 ? '1 min.' : '2 min.'); });
    if (motion) { shift(old, -li.offsetHeight); li.classList.add('is-new'); }
  };
  const setOpen = (c, who, s) => {
    if (lastOpen) toThreads(c, lastOpen);
    lastOpen = who;
    open.classList.remove('is-wait');
    ctx.innerHTML = `${who.av}<span><b>${who.h}</b><small>Kommenterede »${c.kw}« på dit opslag</small></span>`;
    bub.textContent = c.msg(who.n);
    sec.textContent = s;
    if (motion) { open.classList.remove('is-land'); void open.offsetWidth; open.classList.add('is-land'); }
  };
  const setCount = n => {
    count = n; nEl.textContent = n;
    if (!motion) return;
    for (const e of [nEl, plus]) e.classList.remove(e === nEl ? 'is-bump' : 'is-go');
    void nEl.offsetWidth;
    nEl.classList.add('is-bump'); plus.classList.add('is-go');
  };

  /* ---------------- The paper plane: from the comment to the inbox, along a curve ---------------- */
  let trails = null;
  const flyTo = (from, done) => {
    if (!motion || !from.isConnected || !Element.prototype.animate) return done();
    if (!trails) { trails = document.createElementNS(NS, 'svg'); trails.setAttribute('class', 'ig-trail'); fly.append(trails); }
    const o = stage.getBoundingClientRect(), a = from.getBoundingClientRect(), b = open.getBoundingClientRect();
    const side = b.left > a.right - 40;
    const x0 = side ? a.right - o.left - 30 : a.left - o.left + a.width * .7, y0 = (side ? a.top + 20 : a.bottom - 6) - o.top;
    const x1 = side ? b.left - o.left + 30 : b.left - o.left + b.width * .5, y1 = b.top - o.top + (side ? 40 : 30);
    const cx = side ? (x0 + x1) / 2 : Math.min(o.width - 24, Math.max(x0, x1) + 90), cy = side ? Math.min(y0, y1) - 90 : (y0 + y1) / 2;
    const q = (t, p, c, r) => (1 - t) * (1 - t) * p + 2 * (1 - t) * t * c + t * t * r;
    const fr = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx), dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
      const r = Math.atan2(dy, dx) * 180 / Math.PI + 45, sc = t < .2 ? .55 + t * 2.25 : t > .82 ? 1 - (t - .82) * 2.2 : 1;
      fr.push({ transform: `translate(${q(t, x0, cx, x1).toFixed(1)}px,${q(t, y0, cy, y1).toFixed(1)}px) rotate(${r.toFixed(1)}deg) scale(${sc.toFixed(2)})`, opacity: t < .1 ? t * 10 : t > .9 ? (1 - t) * 10 : 1 });
    }
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', `M${x0.toFixed(1)} ${y0.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`);
    p.setAttribute('pathLength', '1');
    trails.append(p);
    const pl = document.createElement('span');
    pl.className = 'ig-plane';
    pl.innerHTML = '<svg><use href="#ig-i-send"/></svg>';
    fly.append(pl);
    const D = 760, E = 'cubic-bezier(.5,0,.3,1)';
    p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: D, easing: E, fill: 'forwards' });
    pl.animate(fr, { duration: D, easing: E, fill: 'forwards' }).onfinish = () => {
      pl.remove();
      p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).onfinish = () => p.remove();
      done();
    };
  };

  /* ---------------- A comment, and the reply it gets ---------------- */
  const addComment = (c, x, i, you) => {
    const li = comment(c, x, you), old = [...list.children];
    list.append(li);
    while (list.children.length > 9) list.firstElementChild.remove();
    if (motion) { shift(old, li.offsetHeight); li.classList.add('is-pop'); }
    likes += you ? 1 : 1 + (i % 3);
    likesEl.textContent = num(likes);
    if (!kwRe(c).test(x[2])) return;
    const s = SEC[i % SEC.length], who = you ? YOU : { h: x[0], n: x[1], av: av(x[3], x[1][0]) }, t = token;
    const deliver = () => {
      if (t !== token) return;
      li.querySelector('.ig-c__dm span').textContent = s;
      li.classList.add('is-sent');
      setOpen(c, who, s);
      setCount(count + 1);
      if (you) live.textContent = `Du kommenterede ${c.kw} og fik svaret i en besked efter ${s} sekund.`;
      if (started) step(2);
    };
    if (motion) later(() => flyTo(li, deliver), 240); else deliver();
  };

  /* ---------------- A campaign: reset, then the stream ---------------- */
  const reset = final => {
    token++; timers.forEach(clearTimeout); timers = [];
    fly.querySelectorAll('.ig-plane').forEach(e => e.remove());
    if (trails) trails.textContent = '';
    const c = CAMP[cur];
    list.textContent = ''; threads.textContent = ''; lastOpen = null;
    likes = c.likes; count = c.base;
    cap.innerHTML = mark(c, c.cap);
    card.innerHTML = c.card;
    tryB.removeAttribute('aria-disabled');
    tryB.classList.remove('is-nudge');
    tryB.innerHTML = `Prøv selv: kommentér <b data-ig-kw>${c.kw}</b>`;
    $$('[data-ig-kw]').forEach(e => { e.textContent = c.kw; });
    sr.textContent = SR0 + c.sr;
    live.textContent = '';
    open.classList.toggle('is-wait', !final);
    if (final) c.cm.forEach((x, i) => addComment(c, x, i));
    nEl.textContent = count;
    likesEl.textContent = num(likes);
  };
  const run = () => {
    const c = CAMP[cur];
    c.cm.forEach((x, i) => later(() => addComment(c, x, i), 650 + i * 1750));
    later(() => { step(3); tryB.classList.add('is-nudge'); }, 650 + c.cm.length * 1750 + 600);
  };

  /* ---------------- Media: only the current one, and videos only while in view ---------------- */
  const showMedia = () => {
    root.classList.toggle('is-photo', cur === 'book');
    media.forEach(m => {
      const on = m.dataset.igMedia === cur;
      m.classList.toggle('is-on', on);
      if (m.tagName !== 'VIDEO') return;
      if (on && motion && inView) { const pr = m.play(); if (pr && pr.catch) pr.catch(() => {}); } else if (!m.paused) m.pause();
    });
  };

  /* ---------------- Controls ---------------- */
  const start = () => {
    if (started) return;
    started = true;
    step(1);
    reset(false);
    run();
  };
  picks.forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.igCamp;
    if (k === cur) return;
    ev('kampagne-' + k);
    cur = k;
    picks.forEach(p => { const on = p === b; p.classList.toggle('is-on', on); p.setAttribute('aria-pressed', String(on)); });
    if (!motion) { reset(true); showMedia(); return; }
    token++; timers.forEach(clearTimeout); timers = [];
    root.classList.add('is-fade');
    setTimeout(() => {
      root.classList.remove('is-fade');
      showMedia();
      if (!started) { started = true; step(1); }
      reset(false);
      run();
    }, 240);
  }));
  tryB.addEventListener('click', () => {
    if (tryB.getAttribute('aria-disabled') === 'true') return;
    ev('proev-selv');
    if (motion && !started) start();
    const c = CAMP[cur];
    tryB.setAttribute('aria-disabled', 'true');
    tryB.classList.remove('is-nudge');
    tryB.textContent = 'Besked sendt til dig';
    addComment(c, ['dig', '', c.kw, 0], 2, true);
  });

  if (!motion) reset(true);
  if (!('IntersectionObserver' in window)) { inView = true; if (motion) { showMedia(); start(); } else step(1); return; }
  // The video plays while a quarter of it shows; the stream starts when the comments are in view
  const io = new IntersectionObserver(es => es.forEach(e => {
    const on = e.isIntersecting && e.intersectionRatio >= (e.target === list ? .6 : .25);
    if (e.target === mediaBox) { inView = on; if (motion) showMedia(); return; }
    if (!on) return;
    io.unobserve(list);
    if (motion) start(); else step(1);
  }), { threshold: [0, .25, .6] });
  io.observe(mediaBox); io.observe(list);
}
