// Organisk TikTok showcase (/services/organisk-tiktok): a series profile for Kragen (an example menswear shop in
// København, never a real business), with the series "Én tee, ti måder" made from our own film and photo. When the phone comes into view the counters run up and the profile
// scrolls to the series. At 17.30 Del 10 publishes itself: its row in the plan turns green and the part drops into the
// grid after the pinned Del 1. Then a message comes in, and the chat beside the phone answers it automatically.
// View counters keep ticking while the section is on screen. A tap on a part plays it in the phone (videos muted, photo
// posts show the photo as a card), with a series bar to go to the next part. The covers of the video parts are drawn
// from the film itself at each part's start. Without motion: the finished state, nothing moves by itself.
// All numbers are an example.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--organisk-tiktok');
if (root) {
  try { init(root); } catch (e) { root.classList.remove('is-pre', 'is-top'); root.querySelectorAll('.sp-m').forEach(m => m.classList.add('is-in')); throw e; }
}

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const ev = action => track('showcase_interact', { showcase: 'organisk-tiktok', action });
  const step = n => track('showcase_step', { showcase: 'organisk-tiktok', step: n });
  const comma = n => n.toFixed(1).replace('.', ',');
  const fmt = n => n >= 1000 ? comma(n / 1000).replace(/,0$/, '') + 'k' : String(Math.round(n));
  const dots = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const scr = $('[data-sp-scr]'), page = $('[data-sp-page]'), grid = $('[data-sp-grid]'), newLi = $('[data-sp-new]'), q = $('[data-sp-q]');
  const clock = $('[data-sp-clock]'), sbTime = $('.sp-sb span'), count = $('[data-sp-count]');
  const msgs = $$('[data-sp-m]'), typing = $('[data-sp-typing]'), chat = $('[data-sp-chat]');
  const views = $$('[data-sp-v]').map(el => ({ el, v: +el.dataset.spV, isNew: !!el.closest('[data-sp-new]') }));
  const stats = [[$('[data-sp-fol]'), 18600], [$('[data-sp-likes]'), 241000]];
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const setTime = t => { clock.textContent = t; sbTime.textContent = t; };
  const tween = (ms, fn) => { const t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / ms); fn(1 - Math.pow(1 - k, 3)); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); };

  // Focus must never scroll the screen itself (overflow: clip does this where it is supported)
  scr.addEventListener('scroll', () => { scr.scrollTop = 0; scr.scrollLeft = 0; });

  /* ---------------- The player ---------------- */
  const play = $('[data-sp-play]'), vid = $('[data-sp-vid]'), prog = $('[data-sp-prog]'), closeBtn = $('[data-sp-close]');
  const img = document.createElement('img');
  img.className = 'sp-play__img'; img.alt = ''; img.setAttribute('aria-hidden', 'true'); img.decoding = 'async';
  vid.after(img);
  const total = () => (root.classList.contains('is-pre') ? 9 : 10);
  const tileOf = n => grid.querySelector(`.sp-t[data-del="${n}"]`);
  let cur = null, back = null, inView = false, raf = 0;
  const open = (t, from) => {
    const k = t.dataset.kind, del = +t.dataset.del, s = scr.getBoundingClientRect(), r = t.getBoundingClientRect();
    if (!root.classList.contains('is-open')) { play.style.setProperty('--ox', (r.left + r.width / 2 - s.left).toFixed(0) + 'px'); play.style.setProperty('--oy', (r.top + r.height / 2 - s.top).toFixed(0) + 'px'); }
    cur = t;
    play.classList.toggle('is-wide', k === 'wide');
    play.classList.toggle('is-photo', k === 'photo');
    $('[data-sp-ptx]').textContent = `Del ${del}: ${t.dataset.name}`;
    $('[data-sp-pcap]').textContent = 'Del ' + del;
    $('[data-sp-of]').textContent = `Del ${del} af ${total()}`;
    const v = views.find(x => t.contains(x.el));
    $('[data-sp-plikes]').textContent = dots(Math.max(12, v.v * .085));
    prog.style.transform = 'scaleX(0)';
    if (k === 'photo') {
      vid.pause();
      img.src = t.dataset.src;
      play.style.setProperty('--pc', t.dataset.bg || '#1d2a44');
    } else {
      if (vid.getAttribute('src') !== t.dataset.src) { vid.poster = t.dataset.poster || t.querySelector('img').getAttribute('src'); vid.src = t.dataset.src; }
      const at = +(t.dataset.start || 0);
      try { vid.currentTime = at; } catch (e) { /* not loaded yet */ }
      if (at) vid.addEventListener('loadedmetadata', () => { vid.currentTime = at; }, { once: true });
      if (inView) { const p = vid.play(); if (p) p.catch(() => {}); }
    }
    root.classList.add('is-open');
    play.inert = false; page.inert = true;
    if (from !== 'next') { back = t; setTimeout(() => closeBtn.focus({ preventScroll: true }), 80); }
  };
  const close = () => {
    if (!root.classList.contains('is-open')) return;
    root.classList.remove('is-open');
    play.inert = true; page.inert = false;
    vid.pause();
    if (back) back.focus({ preventScroll: true });
  };
  grid.addEventListener('click', e => { const t = e.target.closest('.sp-t'); if (t) { open(t); ev('afspil-del-' + t.dataset.del); } });
  closeBtn.addEventListener('click', () => { close(); ev('luk'); });
  $('[data-sp-next]').addEventListener('click', () => {
    let n = +cur.dataset.del % total() + 1;
    open(tileOf(n), 'next'); ev('naeste');
  });
  play.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); ev('luk'); } });
  const frame = () => { const d = vid.duration || 15; prog.style.transform = `scaleX(${((vid.currentTime || 0) / d).toFixed(4)})`; if (!vid.paused) raf = requestAnimationFrame(frame); };
  vid.addEventListener('playing', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); });

  // Parts pushed below the bottom of the screen cannot be reached with Tab (the series bar still goes there)
  const fence = () => {
    const b = scr.getBoundingClientRect().bottom - 8;
    grid.querySelectorAll('.sp-t').forEach(t => { const r = t.getBoundingClientRect(); if (r.height && r.top > b - r.height * .4) t.tabIndex = -1; else t.removeAttribute('tabindex'); });
  };

  /* ---------------- Covers from the film ---------------- */
  // The video parts all come from one film, each from its own shot, but the film's poster is only its first shot.
  // So when the section comes near, each cover is drawn from the film at the part's start (the crop stays as fallback)
  const capTiles = $$('.sp-t[data-cap]');
  const draw = (v, t) => {
    const c = document.createElement('canvas'), W = 270, H = 360, vw = v.videoWidth, vh = v.videoHeight;
    let sw = vw, sh = vw * H / W;
    if (sh > vh) { sh = vh; sw = vh * W / H; }
    c.width = W; c.height = H; c.setAttribute('aria-hidden', 'true');
    c.getContext('2d').drawImage(v, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H);
    t.dataset.poster = c.toDataURL('image/jpeg', .8);
    const shots = [[t.querySelector('img'), c]];
    if (t.closest('[data-sp-new]')) { const c2 = c.cloneNode(); c2.getContext('2d').drawImage(c, 0, 0); shots.push([$('[data-sp-qcap] img'), c2]); }
    shots.forEach(([img, cv]) => { img.after(cv); requestAnimationFrame(() => requestAnimationFrame(() => cv.classList.add('is-on'))); });
  };
  const capture = () => {
    if (!capTiles.length) return;
    const v = document.createElement('video'), list = capTiles.slice();
    let t = null;
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    const next = () => { t = list.shift(); if (t) v.currentTime = +t.dataset.start; else v.pause(); };
    // Only a frame from the right shot: a host without range requests cannot seek, and then the crop stays
    v.addEventListener('seeked', () => { try { if (Math.abs(v.currentTime - t.dataset.start) < .4) draw(v, t); } catch (e) { /* keep the fallback crop */ } next(); });
    v.addEventListener('loadeddata', next, { once: true });
    v.src = capTiles[0].dataset.src;
  };
  const cio = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { cio.disconnect(); capture(); } }, { rootMargin: '300px 0px' });
  cio.observe(scr);

  /* ---------------- Follow ---------------- */
  const follow = $('[data-sp-follow]');
  follow.addEventListener('click', () => {
    const on = follow.getAttribute('aria-pressed') !== 'true';
    follow.setAttribute('aria-pressed', String(on));
    ev(on ? 'foelg' : 'stop-foelg');
  });

  /* ---------------- Views that keep ticking ---------------- */
  let tickT = 0, counting = false;
  const tick = () => {
    if (counting) return;
    const live = views.filter(x => !(x.isNew && root.classList.contains('is-pre')));
    for (let i = 0; i < 2; i++) {
      const x = live[Math.floor(Math.random() * live.length)];
      x.v += x.isNew ? 40 + Math.random() * 120 : 60 + Math.random() * x.v * .002;
      const s = fmt(x.v);
      if (s !== x.el.textContent) { x.el.textContent = s; const p = x.el.parentElement; p.classList.remove('is-tick'); void p.offsetWidth; p.classList.add('is-tick'); }
    }
  };
  const ticking = on => { clearInterval(tickT); if (on && motion) tickT = setInterval(tick, 650); };

  /* ---------------- The chat ---------------- */
  let dmReady = false, dmSeen = false, chatRan = false;
  const typeAt = m => { typing.style.top = m.offsetTop + 'px'; typing.classList.add('is-on'); };
  const runChat = () => {
    chatRan = true;
    msgs.forEach(m => m.classList.remove('is-in'));
    later(() => msgs[0].classList.add('is-in'), 100);
    later(() => typeAt(msgs[1]), 700);
    later(() => { typing.classList.remove('is-on'); msgs[1].classList.add('is-in'); step(3); }, 2100);
    later(() => msgs[2].classList.add('is-in'), 3600);
    later(() => typeAt(msgs[3]), 4100);
    later(() => { typing.classList.remove('is-on'); msgs[3].classList.add('is-in'); }, 5200);
  };
  const maybeChat = () => { if (!chatRan && dmReady && dmSeen) runChat(); };

  /* ---------------- The week: Del 10 publishes itself ---------------- */
  const publish = () => {
    setTime('17.30');
    const lis = [...grid.children].filter(li => li !== newLi), before = lis.map(li => li.getBoundingClientRect());
    root.classList.remove('is-pre');
    count.textContent = '10';
    if (newLi.animate) {
      lis.forEach((li, i) => {
        const a = before[i], b = li.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top;
        if (dx || dy) li.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 700, delay: i * 25, easing: 'cubic-bezier(.3,.1,.2,1)', fill: 'backwards' });
      });
      newLi.animate([{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: .65 }, { transform: 'none', opacity: 1 }], { duration: 750, delay: 180, easing: 'ease-out', fill: 'backwards' });
    }
    newLi.classList.add('is-drop');
    q.classList.remove('is-flash'); void q.offsetWidth; q.classList.add('is-flash');
    root.classList.add('is-toast');
    later(() => root.classList.remove('is-toast'), 2600);
    later(fence, 1000);
    step(2);
  };
  const run = first => {
    timers.forEach(clearTimeout); timers = [];
    close();
    root.classList.add('is-pre', 'is-top');
    root.classList.remove('is-note', 'is-toast');
    newLi.classList.remove('is-drop');
    typing.classList.remove('is-on');
    msgs.forEach(m => m.classList.remove('is-in'));
    chatRan = false; dmReady = false;
    count.textContent = '9';
    setTime('17.28');
    const nv = views.find(x => x.isNew); nv.v = 0; nv.el.textContent = '0';
    if (first) {
      counting = true; later(() => { counting = false; }, 2400);
      views.forEach((x, i) => { if (x.isNew) return; const to = x.v; later(() => tween(1500, k => { x.el.textContent = fmt(to * k); }), 200 + i * 60); });
      stats.forEach(([el, to]) => tween(1700, k => { el.textContent = fmt(to * k); }));
    }
    step(1);
    later(() => root.classList.remove('is-top'), 1500);
    later(fence, 2900);
    later(() => setTime('17.29'), 1900);
    later(publish, 3500);
    later(() => root.classList.add('is-note'), 5800);
    later(() => { root.classList.remove('is-note'); }, 9200);
    later(() => { dmReady = true; maybeChat(); }, 6200);
  };
  $('[data-sp-again]').addEventListener('click', () => { ev('igen'); run(false); });

  /* ---------------- Start ---------------- */
  // While the phone is on screen: the views tick and a playing part plays; otherwise everything rests
  new IntersectionObserver(es => es.forEach(e => {
    inView = e.isIntersecting;
    ticking(inView);
    if (!inView) vid.pause();
    else if (root.classList.contains('is-open') && cur && cur.dataset.kind !== 'photo') { const p = vid.play(); if (p) p.catch(() => {}); }
  }), { threshold: .3 }).observe(scr);
  if (!motion) { msgs.forEach(m => m.classList.add('is-in')); fence(); addEventListener('resize', fence); return; }
  addEventListener('resize', fence);

  root.classList.add('is-pre', 'is-top');
  msgs.forEach(m => m.classList.remove('is-in'));
  views.forEach(x => { x.el.textContent = '0'; });
  stats.forEach(([el]) => { el.textContent = '0'; });
  count.textContent = '9';
  setTime('17.28');
  const ph = $('.sp-ph');
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    if (e.target === ph) { sio.unobserve(ph); root.classList.add('is-in'); run(true); }
    if (e.target === chat) { dmSeen = true; sio.unobserve(chat); maybeChat(); }
  }), { threshold: .35 });
  sio.observe(ph); sio.observe(chat);
}
