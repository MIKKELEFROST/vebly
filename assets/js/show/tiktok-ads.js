// TikTok Ads showcase (/services/tiktok-ads): a hook lab for Lufteturen (an example webshop with dog gear, never a real
// business). A phone plays one of our own vertical videos as an ad with the chosen hook text on top. Beside it three
// hooks for the same video: when the lab comes into view the test runs, each hook's retention curve draws itself while
// the phone shows it, hook B wins, and the budget slider glides its share up, so the same budget gives more sales.
// A tap on a hook shows it on the phone, a tap on the video pauses it, and the slider can be dragged. Without motion:
// the finished test, nothing plays by itself. All numbers are an example.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--tiktok-ads');
if (root) {
  try { init(root); } catch (e) { root.classList.add('is-done'); throw e; }
}

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const ev = action => track('showcase_interact', { showcase: 'tiktok-ads', action });
  const step = n => track('showcase_step', { showcase: 'tiktok-ads', step: n });
  const HOOKS = [
    { tx: 'Sådan fik vi stoppet trækket i snoren', st: 'plain' },
    { tx: 'Vi prøvede 5 seler, så du ikke skal', st: 'box' },
    { tx: 'POV: din hund ser selen for første gang', st: 'dark' }
  ];
  const CPA = [186, 72, 129], WEEK = 3600, WIN = 1, MIN = 33, GOAL = 70, PH = 2800, LEN = 15;
  const cards = $$('[data-hl-k]'), vid = $('[data-hl-vid]'), hook = $('[data-hl-hook]'), hookP = hook.parentElement;
  const cta = $('[data-hl-cta]'), prog = $('[data-hl-prog]'), ring = $('[data-hl-ring]'), clock = $('.hl-clock');
  const phase = $('[data-hl-phase]'), sec = $('[data-hl-sec]'), tap = $('[data-hl-pause]');
  const range = $('[data-hl-range]'), pct = $('[data-hl-pct]'), buy = $('[data-hl-buy]'), segs = $$('[data-hl-seg]');
  const state = $('[data-hl-state]'), day = $('[data-hl-day]');
  const nums = cards.map(c => c.querySelector('[data-hl-n]'));
  const comma = (n, d = 1) => n.toFixed(d).replace('.', ',');

  // A table of points along each curve, so the playhead can follow it by x
  const curves = cards.map(c => {
    const ln = c.querySelector('[data-hl-ln]'), ph = c.querySelector('[data-hl-ph]');
    const L = ln.getTotalLength(), pts = [];
    for (let i = 0; i <= 80; i++) { const p = ln.getPointAtLength(L * i / 80); pts.push([p.x, p.y]); }
    return { pts, line: ph.querySelector('line'), dot: ph.querySelector('circle') };
  });
  const yAt = (pts, x) => { let i = 1; while (i < pts.length - 1 && pts[i][0] < x) i++; const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + (y1 - y0) * ((x - x0) / ((x1 - x0) || 1)); };

  /* ---------------- The phone ---------------- */
  let cur = WIN, inView = false, userPaused = !motion, ctaHot = false;
  const playing = () => !vid.paused && !vid.ended;
  const syncPlay = () => {
    const want = inView && !userPaused;
    if (want && vid.paused) { const p = vid.play(); if (p) p.catch(() => {}); }
    if (!want && !vid.paused) vid.pause();
  };
  const restart = () => { try { vid.currentTime = 0; } catch (e) { /* not loaded yet */ } ctaHot = false; cta.classList.remove('is-hot'); ring.style.strokeDashoffset = 1; };
  const setHook = (i, from) => {
    const same = i === cur;
    cur = i;
    cards.forEach((c, j) => { const on = j === i; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', String(on)); });
    hook.textContent = HOOKS[i].tx;
    hook.className = 'hl-tx hl-tx--' + HOOKS[i].st;
    if (motion) { hookP.classList.remove('is-pop'); void hookP.offsetWidth; hookP.classList.add('is-pop'); }
    if (!same || from === 'user') restart();
    if (from === 'user' && userPaused && motion) { userPaused = false; setPausedUi(); }
    syncPlay();
  };
  const setPausedUi = () => {
    root.classList.toggle('is-paused', userPaused);
    tap.setAttribute('aria-label', userPaused ? 'Afspil videoen' : 'Pause videoen');
  };
  tap.addEventListener('click', () => {
    userPaused = !userPaused;
    setPausedUi(); syncPlay();
    ev(userPaused ? 'pause' : 'afspil');
  });
  vid.addEventListener('play', () => root.classList.add('is-play'));
  vid.addEventListener('pause', () => root.classList.remove('is-play'));

  // Every frame while it plays: the progress bar, the hook clock, the button, the playhead on the curve
  const frame = () => {
    const t = vid.currentTime || 0, d = vid.duration || LEN;
    prog.style.transform = `scaleX(${(t / d).toFixed(4)})`;
    const past = t >= 3;
    ring.style.strokeDashoffset = past ? 0 : (1 - t / 3).toFixed(3);
    clock.classList.toggle('is-past', past);
    phase.textContent = past ? 'Blev hængende' : 'Hook';
    sec.textContent = past ? comma(Math.min(t, LEN)) : comma(t) + ' af 3';
    if (past && !ctaHot) { ctaHot = true; cta.classList.add('is-hot'); }
    const c = curves[cur], x = 4 + Math.min(t, LEN) / LEN * 292, y = yAt(c.pts, x);
    c.line.setAttribute('x1', x.toFixed(1)); c.line.setAttribute('x2', x.toFixed(1));
    c.dot.setAttribute('cx', x.toFixed(1)); c.dot.setAttribute('cy', y.toFixed(1));
    if (playing()) raf = requestAnimationFrame(frame);
  };
  let raf = 0;
  vid.addEventListener('playing', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); });
  vid.addEventListener('seeked', () => { if (!playing()) frame(); });
  vid.addEventListener('loadedmetadata', () => { if (!playing()) frame(); });

  /* ---------------- The budget ---------------- */
  const buysAt = p => Math.round(WEEK * (p / 100 / CPA[1] + (100 - p) / 200 / CPA[0] + (100 - p) / 200 / CPA[2]));
  let shown = null;
  const setShare = p => {
    p = Math.max(MIN, Math.min(90, p));
    const b = Math.round(p), a = Math.floor((100 - b) / 2), w3 = [a, b, 100 - b - a];
    range.value = Math.round(p);
    range.style.setProperty('--p', ((p - MIN) / (90 - MIN) * 100).toFixed(1) + '%');
    range.setAttribute('aria-valuetext', Math.round(p) + ' procent');
    pct.textContent = Math.round(p) + ' %';
    segs.forEach((s, j) => { s.style.setProperty('--w', j === WIN ? p.toFixed(1) : ((100 - p) / 2).toFixed(1)); s.firstChild.textContent = 'ABC'[j] + (w3[j] >= 9 ? ' ' + w3[j] + ' %' : ''); });
    const n = buysAt(p);
    if (n !== shown) {
      shown = n; buy.textContent = n;
      if (motion) { buy.classList.remove('is-bump'); void buy.offsetWidth; buy.classList.add('is-bump'); }
    }
  };
  let glideRaf = 0;
  const glide = (from, to, ms) => {
    cancelAnimationFrame(glideRaf);
    const t0 = performance.now();
    const tick = now => { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3); setShare(from + (to - from) * e); if (k < 1) glideRaf = requestAnimationFrame(tick); };
    glideRaf = requestAnimationFrame(tick);
  };
  range.addEventListener('input', () => { cancelAnimationFrame(glideRaf); setShare(+range.value); });
  range.addEventListener('change', () => ev('budget'));
  setShare(GOAL);

  /* ---------------- The test ---------------- */
  let timers = [], userPicked = false, ran = false;
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const count = (el, to, ms) => {
    const t0 = performance.now();
    const tick = now => { const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 2.4); el.textContent = Math.round(to * e) + ' %'; if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const runTest = () => {
    timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(glideRaf);
    ran = true; userPicked = false;
    root.classList.add('is-reset'); root.classList.remove('is-done');
    cards.forEach((c, j) => { c.classList.remove('is-drawn'); nums[j].textContent = '0 %'; });
    state.textContent = 'Testen kører'; day.textContent = '1';
    setShare(MIN);
    void root.offsetWidth;
    root.classList.remove('is-reset');
    step(1);
    for (let d = 2; d <= 7; d++) later(() => { day.textContent = d; }, (d - 1) * (PH * 3 / 7));
    cards.forEach((c, j) => later(() => {
      if (!userPicked) setHook(j, 'auto');
      c.classList.add('is-drawn');
      count(nums[j], +nums[j].dataset.hlN, 2300);
    }, 120 + j * PH));
    later(() => {
      root.classList.add('is-done');
      state.textContent = 'Testen er færdig: B vinder';
      if (!userPicked) setHook(WIN, 'auto');
      step(2);
    }, 3 * PH + 300);
    later(() => { glide(MIN, GOAL, 1500); step(3); }, 3 * PH + 1200);
  };
  cards.forEach((c, j) => c.addEventListener('click', () => {
    userPicked = true;
    setHook(j, 'user');
    ev('hook-' + 'abc'[j]);
  }));
  $('[data-hl-again]').addEventListener('click', () => { ev('igen'); runTest(); });

  /* ---------------- Start ---------------- */
  setPausedUi();
  // The video only plays while a good part of it is on screen (and, without motion, only after a tap)
  new IntersectionObserver(es => es.forEach(e => {
    inView = e.isIntersecting;
    if (inView && !userPaused && vid.preload === 'none') vid.preload = 'auto';
    syncPlay();
  }), { threshold: .35 }).observe(vid);
  if (!motion) {
    // The finished test: hook B on the phone, nothing moves by itself
    root.classList.add('is-done');
    cards.forEach(c => c.classList.add('is-drawn'));
    state.textContent = 'Testen er færdig: B vinder';
    return;
  }
  root.classList.remove('is-done');
  cards.forEach(c => c.classList.remove('is-drawn'));
  nums.forEach(n => { n.textContent = '0 %'; });
  state.textContent = 'Klar til test';
  day.textContent = '1';
  setShare(MIN);
  setHook(0, 'auto');
  userPaused = false; setPausedUi();

  // The phone rises when it shows; the test starts when the cards do
  const ph = $('.hl-ph'), list = $('.hl-cards');
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    if (e.target === ph) { root.classList.add('is-in'); sio.unobserve(ph); }
    if (e.target === list) { sio.unobserve(list); if (!ran) runTest(); }
  }), { threshold: .3 });
  sio.observe(ph); sio.observe(list);
}
