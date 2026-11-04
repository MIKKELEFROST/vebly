// Showcase: Automations, a flow that runs by itself (scripts/services/showcase/automations.html).
// Scroll drives the pinned stage: 01 each task shows the minutes it takes by hand, 02 the wires are drawn,
// 03 a customer writes: the first three steps fall like dominoes, then scrolling moves the clock on through
// the days to the offer, the invoice and the review. The dot has its own speed, so it runs on a moment
// after you stop. Without html.motion the finished flow is shown, static.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--automations');
if (root) init(root);

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => 1 - Math.pow(1 - t, 3);
  const sec = $('[data-aut]'), fit = $('[data-aut-fit]'), pin = fit.parentElement, win = $('[data-aut-win]'), flow = $('[data-aut-flow]');
  const svg = $('[data-aut-wires]'), dot = $('[data-aut-dot]'), cv = $('[data-aut-grid]'), cx = cv.getContext('2d');
  const nodes = $$('[data-aut-node]'), steps = $$('[data-aut-step]'), lines = $$('[data-aut-lines] > li'), list = $('[data-aut-lines]');
  const lw = $('[data-aut-lw]'), ph = $('[data-aut-ph]'), live = $('[data-aut-live]'), state = $('[data-aut-state]'), clock = $('[data-aut-clock]');
  const saved = $('[data-aut-saved]'), payoff = $('[data-aut-payoff]'), cta = $('[data-aut-cta]'), hint = $('[data-aut-hint]');
  const N = nodes.length, MIN = nodes.map(n => +n.dataset.min || 0);
  // The example's clock, in seconds from a Monday 00:00: 09:14:02, +1 s, +2 s, Thursday 14:30,
  // Friday the week after 15:00 and three days later
  const TS = [33242, 33243, 33244, 311400, 1004400, 1263600];
  const DAY = ['Man.', 'Tir.', 'Ons.', 'Tor.', 'Fre.', 'Lør.', 'Søn.'];
  const pad = n => String(Math.floor(n)).padStart(2, '0');
  const fmt = (t, s) => `${DAY[Math.floor(t / 86400) % 7]} ${pad(t % 86400 / 3600)}:${pad(t % 3600 / 60)}${s ? ':' + pad(t % 60) : ''}`;
  // Scroll map, 0–1 through the pinned stage
  const MAP = 0.1, BUILD = 0.12, LEG = 0.028, RUN = 0.26, FIRE = 0.3, DONE = 0.9;
  const LEGS = [[0.38, 0.52], [0.56, 0.7], [0.74, 0.88]];
  const VL = 40; // the dot's hidden way through a card

  let G = null, gw = 0, gh = 0, first = true;
  const sizeGrid = (W, H) => {
    const d = Math.min(2, devicePixelRatio || 1);
    gw = W; gh = H; cv.width = Math.round(W * d); cv.height = Math.round(H * d); cx.setTransform(d, 0, 0, d, 0, 0);
  };

  // Scale the stage down on short screens, so nothing is cut off (the room under the menu is padding)
  const fitNow = () => {
    fit.style.transform = '';
    if (!motion) return;
    const cs = getComputedStyle(pin), pt = parseFloat(cs.paddingTop), room = pin.clientHeight - pt - parseFloat(cs.paddingBottom);
    // Layout sizes, not scrollHeight: the reveal effect keeps the log moved down until it is seen
    const h = Math.max(...[...fit.children].map(c => c.offsetTop + c.offsetHeight)) - fit.offsetTop, s = Math.min(1, room / h);
    if (s < 0.995) fit.style.transform = `scale(${s.toFixed(3)})`;
    // Until it pins, the stage sits right under the headline: the room above it slides up behind it
    sec.style.marginTop = `${-Math.max(0, pt + Math.max(0, (room - h * s) / 2) - 24)}px`;
  };

  // Wires between the cards (side to side on the same row, else bottom to top) and the dot's path
  const layout = () => {
    const W = flow.offsetWidth, H = flow.offsetHeight;
    if (!W) return;
    const R = nodes.map(n => ({ x: n.offsetLeft, y: n.offsetTop, w: n.offsetWidth, h: n.offsetHeight }));
    const ws = [];
    for (let i = 0; i < N - 1; i++) {
      const a = R[i], b = R[i + 1], side = b.x >= a.x + a.w - 1 && Math.abs(b.y - a.y) < a.h;
      let p0, p1, d;
      if (side) {
        p0 = [a.x + a.w, a.y + a.h / 2]; p1 = [b.x, b.y + b.h / 2];
        const k = (p1[0] - p0[0]) * 0.55;
        d = `M${p0}C${p0[0] + k},${p0[1]} ${p1[0] - k},${p1[1]} ${p1}`;
      } else {
        p0 = [a.x + a.w / 2, a.y + a.h]; p1 = [b.x + b.w / 2, b.y];
        const k = Math.max(18, (p1[1] - p0[1]) * 0.62);
        d = `M${p0}C${p0[0]},${p0[1] + k} ${p1[0]},${p1[1] - k} ${p1}`;
      }
      ws.push({ p0, p1, d });
    }
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.innerHTML = ws.map(w => `<path class="w-sk" d="${w.d}"/><path class="w-bd" d="${w.d}"/><path class="w-gl" d="${w.d}"/><path class="w-pr" d="${w.d}"/><circle cx="${w.p0[0]}" cy="${w.p0[1]}" r="3.6"/><circle cx="${w.p1[0]}" cy="${w.p1[1]}" r="3.6"/>`).join('');
    const ps = svg.querySelectorAll('path'), cs = svg.querySelectorAll('circle');
    const segs = [], I = [], O = [], mid = r => [r.x + r.w / 2, r.y + r.h / 2];
    let s = 0;
    ws.forEach((w, i) => {
      w.el = [ps[i * 4 + 1], ps[i * 4 + 2], ps[i * 4 + 3]]; w.port = [cs[i * 2], cs[i * 2 + 1]];
      w.len = w.el[2].getTotalLength(); w.off = [-1, -1, -1];
      w.el.forEach(e => { e.style.strokeDasharray = `${w.len} ${w.len + 4}`; e.style.strokeDashoffset = w.len; });
    });
    for (let k = 0; k < N; k++) {
      I[k] = s; segs.push({ s, len: VL, a: k ? ws[k - 1].p1 : mid(R[k]), b: k < N - 1 ? ws[k].p0 : mid(R[k]) }); s += VL; O[k] = s;
      if (k < N - 1) { ws[k].s0 = s; segs.push({ s, len: ws[k].len, w: ws[k] }); s += ws[k].len; }
    }
    const wh = win.clientHeight, lh = parseFloat(getComputedStyle(lw).getPropertyValue('--lh')) || 25;
    G = { W, H, R, ws, segs, I, O, END: s, wh, cam: motion && wh < H - 2, lh, rows: Math.round(lw.clientHeight / lh) || 6 };
    if (!G.cam) flow.style.transform = '';
    sizeGrid(W, H);
    fitNow();
    if (!motion) finished(); else first = true;
  };
  let rq = 0;
  const relayout = () => { cancelAnimationFrame(rq); rq = requestAnimationFrame(layout); };

  // Dot grid like the hero's: the dots near the running dot glow orange, and a green wave runs out of
  // each card as it fires
  let ripples = [];
  const drawGrid = (now, at) => {
    cx.clearRect(0, 0, gw, gh);
    const g = 24, hot = [];
    cx.fillStyle = 'rgba(17,17,17,0.12)'; cx.beginPath();
    for (let y = g / 2; y < gh; y += g) for (let x = g / 2; x < gw; x += g) {
      let ox = 0, oy = motion ? Math.sin(now * 0.0018 + x * 0.02 + y * 0.015) * 1.3 : 0, h = 0, c = 0;
      if (at) { const d = Math.hypot(x - at[0], y - at[1]); if (d < 96) h = (1 - d / 96) ** 2; }
      for (const r of ripples) {
        const age = (now - r.t) / 900; if (age < 0 || age >= 1) continue;
        const d = Math.hypot(x - r.x, y - r.y) || 1, q = 1 - Math.abs(d - age * 280) / 36;
        if (q > 0) { const k = q * (1 - age); if (k > h) { h = k; c = 1; } ox += (x - r.x) / d * k * 5; oy += (y - r.y) / d * k * 5; }
      }
      if (h > 0.04) hot.push([x + ox, y + oy, h, c]);
      else { cx.moveTo(x + ox + 1.3, y + oy); cx.arc(x + ox, y + oy, 1.3, 0, 6.283); }
    }
    cx.fill();
    for (const [x, y, h, c] of hot) {
      cx.fillStyle = c ? `rgba(47,158,91,${(0.16 + h * 0.6).toFixed(3)})` : `rgba(224,85,43,${(0.16 + h * 0.6).toFixed(3)})`;
      cx.beginPath(); cx.arc(x, y, 1.3 + h * 1.3, 0, 6.283); cx.fill();
    }
    ripples = ripples.filter(r => now - r.t < 900);
  };

  // A card fires: it bumps, gets its check, shows the minutes saved and sends a wave through the dots
  const pop = k => {
    const n = nodes[k];
    n.classList.remove('is-pop'); void n.offsetWidth; n.classList.add('is-pop');
    clearTimeout(n.popT); n.popT = setTimeout(() => n.classList.remove('is-pop'), 1300);
    if (G) { const r = G.R[k]; ripples.push({ x: r.x + r.w / 2, y: r.y + r.h / 2, t: performance.now() }); }
  };

  const flash = (n, c, ms) => { n.classList.add(c); clearTimeout(n[c]); n[c] = setTimeout(() => n.classList.remove(c), ms); };
  // All six done: one more domino wave down the flow
  const wave = () => nodes.forEach((n, k) => setTimeout(() => {
    flash(n, 'is-wave', 600);
    if (G) { const r = G.R[k]; ripples.push({ x: r.x + r.w / 2, y: r.y + r.h / 2, t: performance.now() }); }
  }, 120 + k * 90));

  // Hover, focus or tap a card for a short line on what it does
  let tipOpen = null, tipP = 0, ptr = 'mouse', p = 0;
  const dir = n => { const a = n.getBoundingClientRect(), b = win.getBoundingClientRect(); n.dataset.tip = a.top + a.height / 2 - b.top > b.height * 0.52 ? 'up' : 'down'; };
  const closeTip = () => { if (tipOpen) tipOpen.classList.remove('is-tip'); tipOpen = null; };
  nodes.forEach((n, k) => {
    const b = n.querySelector('button');
    n.addEventListener('pointerenter', () => dir(n));
    b.addEventListener('focus', () => dir(n));
    b.addEventListener('pointerdown', e => { ptr = e.pointerType; });
    b.addEventListener('click', e => {
      dir(n);
      if (ptr !== 'mouse' || e.detail === 0) { const on = tipOpen !== n; closeTip(); if (on) { n.classList.add('is-tip'); tipOpen = n; tipP = p; } }
      if (n.classList.contains('is-done') && motion) pop(k);
      track('showcase_interact', { showcase: 'automations', action: 'trin-' + n.dataset.autNode });
      ptr = 'mouse';
    });
  });
  document.addEventListener('pointerdown', e => { if (tipOpen && !tipOpen.contains(e.target)) closeTip(); }, { passive: true });
  cta.addEventListener('click', () => track('showcase_interact', { showcase: 'automations', action: 'fast-pris' }));

  // Reduced motion: the finished flow
  const finished = () => {
    G.ws.forEach(w => { w.el.forEach(e => { e.style.strokeDashoffset = 0; }); w.port.forEach(c => c.classList.add('is-b', 'is-on')); });
    drawGrid(0, null);
  };

  new ResizeObserver(relayout).observe(flow);
  if (motion) { new ResizeObserver(relayout).observe(win); new ResizeObserver(relayout).observe(pin); }
  addEventListener('load', relayout);
  if (document.fonts) document.fonts.ready.then(relayout);
  layout();
  if (!motion) return;

  // Start state: the tasks as they are today, nothing connected yet
  root.classList.add('is-init');
  nodes.forEach(n => { n.classList.remove('is-built', 'is-done'); n.dataset.m = '0'; });
  lines.forEach(l => l.classList.remove('is-on'));
  steps.forEach((s, i) => s.classList.toggle('is-on', i === 0));
  [payoff, live, cta].forEach(e => e.classList.remove('is-on'));
  saved.textContent = '0'; clock.textContent = '';
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-init')));

  const set = (el, c, on) => { if (el.classList.contains(c) !== on) el.classList.toggle(c, on); };
  const text = (el, t) => { if (el.textContent !== t) el.textContent = t; };
  const target = q => {
    const { I, O, END } = G, rest = k => O[k] + 10;
    if (q < FIRE) return 0;
    let t = rest(2);
    for (let j = 0; j < LEGS.length; j++) {
      const [a, b] = LEGS[j], k = 2 + j;
      if (q < a) return t;
      if (q < b) return lerp(rest(k), I[k + 1], (q - a) / (b - a));
      t = k + 1 < N - 1 ? rest(k + 1) : END;
    }
    return t;
  };
  const at = s => {
    const sg = G.segs;
    let i = 0; while (i < sg.length - 1 && s > sg[i].s + sg[i].len) i++;
    const q = sg[i], t = clamp((s - q.s) / q.len);
    if (q.w) { const pt = q.w.el[2].getPointAtLength(t * q.w.len); return [pt.x, pt.y]; }
    return [lerp(q.a[0], q.b[0], t), lerp(q.a[1], q.b[1], t)];
  };
  const timeAt = s => {
    const { I, O } = G;
    let k = 0; while (k < N - 1 && s >= I[k + 1]) k++;
    if (k === N - 1) return TS[k];
    const r0 = O[k] + 10;
    return lerp(TS[k], TS[k + 1], clamp((s - r0) / (I[k + 1] - r0)));
  };

  let sD = 0, lastT = 0, vis = false, running = false, maxStep = 0, camY = 0, lastStep = -1, lastCount = -1;
  let sNow = 0, sFrom = 0, sTo = 0, sT0 = 0;
  const fired = Array(N).fill(false);
  const PH = ['Kobler dine apps sammen …', 'Venter på næste henvendelse …'];
  const STATE = ['Ikke sat op', 'Sættes op', 'Kører'];

  const frame = now => {
    if (!vis) { running = false; return; }
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    if (!G) return;
    const r = sec.getBoundingClientRect(), vh = innerHeight;
    p = clamp(-r.top / Math.max(1, r.height - vh));
    const step = p < MAP ? 0 : p < RUN ? 1 : 2;
    if (step !== lastStep) {
      lastStep = step;
      steps.forEach((s, i) => set(s, 'is-on', i === step));
      text(state, STATE[step]); set(live, 'is-on', step === 2);
    }
    if (tipOpen && Math.abs(p - tipP) > 0.03) closeTip();
    set(hint, 'is-on', p < 0.02);

    // The dot: the first three steps at domino speed, then it follows the scroll with a little lag
    const tg = target(p), d = tg - sD;
    if (first || Math.abs(d) > 1400) sD = tg;
    else if (d > 0 && sD < G.O[2] + 10) sD += Math.min(d, 340 * dt);
    else { sD += clamp(d * (1 - Math.pow(d > 0 ? 0.84 : 0.75, dt * 60)), -2400 * dt, 1800 * dt); if (Math.abs(tg - sD) < 0.3) sD = tg; }
    const going = (p >= FIRE || sD > 1) && sD < G.END - 1, pos = at(sD);
    set(dot, 'is-on', going);
    dot.style.transform = `translate3d(${pos[0].toFixed(1)}px,${pos[1].toFixed(1)}px,0)`;

    // Wires: drawn in 02, filled orange behind the dot in 03
    G.ws.forEach((w, i) => {
      const bf = clamp((p - BUILD - i * LEG) / LEG), f = clamp((sD - w.s0) / w.len);
      const o = [w.len * (1 - bf), w.len * (1 - f), w.len * (1 - f)];
      o.forEach((v, j) => { if (Math.abs(v - w.off[j]) > 0.4) { w.off[j] = v; w.el[j].style.strokeDashoffset = v.toFixed(1); } });
      set(w.port[0], 'is-b', bf > 0); set(w.port[1], 'is-b', bf >= 1);
      set(w.port[0], 'is-on', f > 0); set(w.port[1], 'is-on', f >= 1);
    });

    // Cards: mapped (01), built (02), running and done (03)
    let count = 0, want = 0, hand = 0;
    nodes.forEach((n, k) => {
      const built = k ? p >= BUILD + k * LEG : p >= BUILD - 0.01, mapped = p >= 0.012 + k * 0.014;
      const done = k ? sD >= G.I[k] - 0.5 : p >= FIRE || sD > 1;
      const m = String(done ? 3 : built ? 2 : mapped ? 1 : 0);
      if (n.dataset.m !== m) { if (m === '1' && n.dataset.m === '0' && !first) flash(n, 'is-mark', 700); n.dataset.m = m; }
      if (mapped) hand += MIN[k];
      set(n, 'is-built', built);
      set(n, 'is-run', going && sD > G.I[k] + 0.5 && sD < G.O[k] + 2);
      if (done !== fired[k]) { fired[k] = done; set(n, 'is-done', done); if (done && !first) pop(k); }
      if (done) { count++; want += MIN[k]; }
    });

    // The log: one line per step that ran, the newest on top of the clock
    if (count !== lastCount || first) {
      lastCount = count;
      lines.forEach((l, k) => { set(l, 'is-on', k < count); set(l, 'is-new', k === count - 1); });
      list.style.transform = count > G.rows ? `translateY(${-(count - G.rows) * G.lh}px)` : '';
    }
    text(ph, count ? '' : step ? PH[step - 1] : hand ? `Du bruger ${hand} min pr. opgave` : 'Kortlægger dine opgaver …');
    set(lw, 'is-ph', !count);
    text(clock, step < 2 ? '' : fired[0] ? fmt(timeAt(sD), timeAt(sD) < TS[2] + 60) : 'Man. 09:14');
    if (want !== sTo) { sFrom = sNow; sTo = want; sT0 = now; }
    sNow = lerp(sFrom, sTo, ease(clamp((now - sT0) / 700)));
    text(saved, String(Math.round(sNow)));
    const end = fired[N - 1] && p >= DONE;
    if (end && !payoff.classList.contains('is-on') && !first) wave();
    set(payoff, 'is-on', end); set(cta, 'is-on', end);

    // Phones: the camera follows the wires being drawn (02), goes back up and follows the dot (03)
    if (G.cam) {
      const kf = clamp((p - BUILD) / LEG - 0.5, 0, N - 1), a = G.R[Math.floor(kf)], c = G.R[Math.ceil(kf)];
      const fy = going || sD > 1 ? pos[1] : step === 1 ? lerp(a.y + a.h / 2, c.y + c.h / 2, kf % 1) : 0;
      const ty = clamp(G.wh * 0.46 - fy, G.wh - G.H, 0);
      camY = first ? ty : camY + (ty - camY) * (1 - Math.pow(0.88, dt * 60));
      flow.style.transform = `translate3d(0,${camY.toFixed(1)}px,0)`;
    }
    drawGrid(now, going ? pos : null);

    // How far people follow it: 1 the tasks, 2 connected, 3 running, 4 all six done
    const reached = end ? 4 : step + 1;
    if (reached > maxStep && r.top < vh * 0.5) while (maxStep < reached) track('showcase_step', { showcase: 'automations', step: ++maxStep });
    first = false;
  };

  new IntersectionObserver(es => {
    vis = es[es.length - 1].isIntersecting;
    if (vis && !running) { running = true; lastT = 0; requestAnimationFrame(frame); }
  }, { rootMargin: '120px 0px' }).observe(sec);
}
