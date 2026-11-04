// Showcase: e-mail marketing (scripts/services/showcase/email-marketing.html).
// While the stage is pinned, scroll plays the story: the newsletter lands at the top of the inbox (01), the
// customer opens it (02) and books (03), the next mail in the flow lands by itself (04) and the numbers count
// up (05). Springs give the arrivals their bounce; only transform and opacity move.
// Without html.motion the HTML already shows the finished state, and this script only counts the click.
import { track } from '/assets/js/analytics.js';

const sec = document.querySelector('.show--email-marketing');
if (sec) init(sec);

function init(sec) {
  const SC = 'email-marketing';
  const $ = s => sec.querySelector(s), $$ = s => Array.from(sec.querySelectorAll(s));
  const cta = $('[data-em-cta]');
  if (cta) cta.addEventListener('click', () => track('showcase_interact', { showcase: SC, action: 'cta' }));
  if (!document.documentElement.classList.contains('motion')) return;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const seg = (p, a, b) => clamp((p - a) / (b - a));

  const trackEl = $('[data-em-track]'), sticky = $('[data-em-sticky]'), fit = $('[data-em-fit]'), stage = $('[data-em-stage]');
  const steps = $$('[data-em-step]'), pills = $$('[data-em-pill]');
  const rowsEl = $('[data-em-rows]'), auto = $('[data-em-auto]'), nl = $('[data-em-nl]'), others = $$('[data-em-o]'), count = $('[data-em-count]');
  const read = $('[data-em-read]'), empty = $('[data-em-empty]'), open = $('[data-em-open]'), view = $('[data-em-view]'), mail = $('[data-em-mail]');
  const parts = $$('[data-em-part]'), img = $('[data-em-part] img'), txt = $('.em-mail p'), btn = $('[data-em-btn]'), ok = $('[data-em-ok]'), cur = $('[data-em-cursor]');
  const flow = $('[data-em-flow]'), line = $('[data-em-line]'), fdot = $('[data-em-fdot]'), nodes = $$('[data-em-node]');
  const stats = $('[data-em-stats]'), nums = $$('[data-em-n]');

  // Where each step starts, and when things happen, from 0 to 1 through the pinned stretch
  const STEP = [0, 0.19, 0.4, 0.6, 0.8], JUMP = [0.1, 0.32, 0.56, 0.74, 0.92];
  const LAND = 0.045, OPEN = 0.26, PRESS = 0.52, FLOW = 0.615, AUTO = 0.7, NUMS = 0.815;

  // Damped springs (k: stiffness, d: damping per frame at 60 Hz)
  const sp = (k, d) => ({ x: 0, v: 0, t: 0, k, d });
  const S = {
    drop: sp(0.12, 0.74), push: sp(0.14, 0.66), drop2: sp(0.12, 0.74), push2: sp(0.14, 0.66),
    slide: sp(0.2, 0.56), open: sp(0.06, 0.72), scroll: sp(0.14, 0.62), ok: sp(0.12, 0.72), flow: sp(0.12, 0.72), stats: sp(0.12, 0.72),
    cx: sp(0.09, 0.74), cy: sp(0.09, 0.74), co: sp(0.16, 0.6)
  };
  const go = (s, f) => {
    s.v += (s.t - s.x) * s.k * f; s.v *= Math.pow(s.d, f); s.x += s.v * f;
    if (Math.abs(s.v) < 1e-4 && Math.abs(s.t - s.x) < 1e-4) { s.x = s.t; s.v = 0; }
    return s.x;
  };
  // Style and class writes only when something changed
  const set = (el, k, v) => { const c = el._em || (el._em = {}); if (c[k] !== v) { c[k] = v; el.style[k] = v; } };
  const cls = (el, c, on) => { if (el.classList.contains(c) !== on) el.classList.toggle(c, on); };
  const ring = () => { cur.classList.remove('is-click'); void cur.offsetWidth; cur.classList.add('is-click'); };
  const flash = el => { el.classList.add('is-new'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('is-new'), 900); };

  // Positions inside the stage (layout only, so the fit scale and the moving parts do not matter)
  let L = null, phone = false;
  const off = el => {
    let x = 0, y = 0;
    for (let e = el; e && e !== stage; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; const p = e.offsetParent; if (p && p !== stage) { x += p.clientLeft; y += p.clientTop; } }
    return { x, y };
  };
  const measure = () => {
    phone = innerWidth < 700;
    const R = nl.offsetHeight, rows = off(rowsEl), b = off(btn), v = off(view), r = off(read), bh = btn.offsetHeight;
    // The e-mail scrolls on: on computers until the button sits above the confirmation, on phones until
    // the text starts at the top, under the confirmation banner
    const scroll = Math.max(0, Math.round(phone ? off(txt).y - v.y - 4 : b.y + bh - (v.y + view.clientHeight - ok.offsetHeight - 30)));
    const ln = line.parentElement;
    L = {
      R, scroll, lineW: ln.offsetWidth,
      row: { x: rows.x + (phone ? nl.offsetWidth * 0.55 : Math.min(186, nl.offsetWidth * 0.72)), y: rows.y + R * 0.5 },
      btn: { x: b.x + btn.offsetWidth * (phone ? 0.45 : 0.4), y: b.y + bh * 0.55 - scroll },
      rest: { x: r.x + read.offsetWidth * 0.64, y: r.y + read.offsetHeight * 0.3 },
      start: { x: stage.offsetWidth - 40, y: stage.offsetHeight - 10 }
    };
  };
  const fitNow = () => {
    fit.style.transform = '';
    const pad = parseFloat(getComputedStyle(sticky).paddingTop) || 0;
    const s = Math.min(1, (sticky.clientHeight - pad - 12) / fit.offsetHeight);
    if (s < 0.995) fit.style.transform = `scale(${s.toFixed(4)})`;
    L = null;
  };
  fitNow();
  addEventListener('resize', fitNow);
  new ResizeObserver(fitNow).observe(fit);
  if (document.fonts) document.fonts.ready.then(fitNow);

  // Phones and tablets: the step numbers jump to their step
  pills.forEach((b, i) => b.addEventListener('click', () => {
    const r = trackEl.getBoundingClientRect(), range = r.height - sticky.offsetHeight;
    scrollTo({ top: scrollY + r.top + range * JUMP[i], behavior: 'smooth' });
    track('showcase_interact', { showcase: SC, action: 'trin-' + (i + 1) });
  }));

  let last = performance.now(), on = -1, seen = 0, dwell = -1, dwellT = 0, was = {}, t0 = 0, kn = 0;
  const frame = now => {
    requestAnimationFrame(frame);
    const f = Math.min(3, (now - last) / 16.667); last = now;
    const r = trackEl.getBoundingClientRect(), vh = innerHeight;
    if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) return;
    if (!L) measure();
    const range = r.height - sticky.offsetHeight, raw = range > 0 ? -r.top / range : 0, p = clamp(raw);
    const st = { landed: p >= LAND, opened: p >= OPEN, pressed: p >= PRESS, flow: p >= FLOW, auto: p >= AUTO, nums: p >= NUMS };

    // Steps beside the stage, and how far people follow the story
    const idx = STEP.reduce((n, s, i) => (p >= s ? i : n), 0);
    if (idx !== on) {
      on = idx;
      steps.forEach((s, i) => cls(s, 'is-on', i === idx));
      pills.forEach((b, i) => { cls(b, 'is-on', i === idx); if (i === idx) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    }
    // (a step counts once it has been on screen for a moment, so gliding past with the menu does not)
    if (raw < 0 || raw > 1) dwell = -1;
    else if (idx !== dwell) { dwell = idx; dwellT = now; }
    else if (now - dwellT > 350) while (seen <= idx) track('showcase_step', { showcase: SC, step: ++seen });

    // 01 The newsletter lands at the top and pushes the list down; 04 the automatic mail does the same
    S.drop.t = S.push.t = st.landed ? 1 : 0;
    S.drop2.t = S.push2.t = st.auto ? 1 : 0;
    const R = L.R, a = go(S.drop, f), b = go(S.push, f), a2 = go(S.drop2, f), b2 = go(S.push2, f);
    set(auto, 'transform', `translateY(${(-R * (1 - a2)).toFixed(1)}px)`);
    set(nl, 'transform', `translateY(${(-R * (2 - a - b2)).toFixed(1)}px)`);
    const ty = `translateY(${(-R * (2 - b - b2)).toFixed(1)}px)`;
    others.forEach(o => set(o, 'transform', ty));
    if (st.landed && !was.landed) flash(nl);
    if (st.auto && !was.auto) flash(auto);
    cls(nl, 'is-unread', st.landed && !st.opened); cls(nl, 'is-yours', st.landed && !st.opened);
    cls(nl, 'is-hover', p >= STEP[1] && !st.opened && !phone); cls(nl, 'is-sel', st.opened && !phone);
    cls(auto, 'is-unread', st.auto); cls(auto, 'is-yours', st.auto);
    cls(count, 'is-off', !((st.landed && !st.opened) || st.auto));

    // 02 It opens: in the reading pane on computers, as its own screen on phones
    // (a spring, so the parts come in one after another however fast the page is scrolled)
    S.slide.t = phone && st.opened && p < STEP[3] ? 1 : 0;
    S.open.t = st.opened ? 1 : 0;
    const sl = go(S.slide, f), op = go(S.open, f), ko = phone ? 1 : clamp(op * 3);
    set(read, 'transform', phone ? `translateX(${((1 - sl) * 100).toFixed(2)}%)` : '');
    set(open, 'opacity', ko.toFixed(3)); set(empty, 'opacity', (1 - ko).toFixed(3));
    parts.forEach((el, i) => {
      const k = ease(clamp((op - i * 0.1) / 0.45));
      set(el, 'opacity', k.toFixed(3)); set(el, 'transform', k < 1 ? `translateY(${((1 - k) * 18).toFixed(1)}px)` : '');
      if (i === 1 && img) set(img, 'transform', `scale(${(1.14 - 0.14 * k).toFixed(4)})`);
    });
    // … and is read down to the button (scroll sets where, a spring smooths the way there)
    S.scroll.t = L.scroll * ease(seg(p, STEP[2] - 0.055, STEP[2] + 0.05));
    set(mail, 'transform', `translateY(${(-go(S.scroll, f)).toFixed(1)}px)`);

    // 03 The button is pressed and the booking is confirmed
    cls(btn, 'is-done', st.pressed);
    if (st.pressed && !was.pressed) { btn.classList.add('is-press'); setTimeout(() => btn.classList.remove('is-press'), 150); }
    S.ok.t = st.pressed && (phone || !st.flow) ? 1 : 0;
    const o = go(S.ok, f);
    set(ok, 'opacity', clamp(o * 1.4).toFixed(3));
    set(ok, 'transform', phone ? `translateY(${((o - 1) * 105).toFixed(1)}%)` : `translateY(${((1 - o) * 26).toFixed(1)}px) scale(${(0.9 + 0.1 * o).toFixed(3)})`);

    // The pointer on computers, a tap on phones
    let T = null, vis = false;
    if (phone) {
      if (p >= OPEN - 0.03 && p < OPEN + 0.012) { T = L.row; vis = true; }
      else if (p >= PRESS - 0.03 && p < PRESS + 0.012) { T = L.btn; vis = true; }
      if (T) { S.cx.x = S.cx.t = T.x; S.cy.x = S.cy.t = T.y; S.cx.v = S.cy.v = 0; }
    } else {
      vis = p >= STEP[1] - 0.04 && p < FLOW;
      T = p < OPEN ? L.row : p < STEP[2] + 0.035 ? L.rest : L.btn;
      if (p >= PRESS + 0.035) T = { x: T.x + 150, y: T.y - 6 };
      if (S.co.x < 0.02 && !vis) { S.cx.x = L.start.x; S.cy.x = L.start.y; S.cx.v = S.cy.v = 0; }
      S.cx.t = T.x; S.cy.t = T.y;
    }
    S.co.t = vis ? 1 : 0;
    const cx = go(S.cx, f), cy = go(S.cy, f), co = go(S.co, f);
    set(cur, 'transform', `translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px)`); set(cur, 'opacity', clamp(co).toFixed(3));
    if ((st.opened && !was.opened) || (st.pressed && !was.pressed)) ring();

    // 04 The flow: the dot travels on from this mail to the reminder, which then lands in the inbox
    S.flow.t = st.flow && !(phone && st.nums) ? 1 : 0;
    const fo = go(S.flow, f), kl = ease(seg(p, FLOW + 0.02, AUTO));
    set(flow, 'opacity', clamp(fo * 1.5).toFixed(3));
    set(flow, 'transform', `translateY(${((1 - fo) * 34).toFixed(1)}px) scale(${(0.9 + 0.1 * fo).toFixed(3)}) rotate(${((1 - fo) * -3).toFixed(2)}deg)`);
    set(line, 'transform', `scaleX(${(1 / 3 + kl / 3).toFixed(4)})`);
    set(fdot, 'transform', `translateX(${(L.lineW * (1 / 3 + kl / 3)).toFixed(1)}px)`);
    set(fdot, 'opacity', kl > 0 && kl < 1 ? '1' : '0');
    nodes.forEach((n, i) => { cls(n, 'is-done', i < 2); cls(n, 'is-now', i === 2 && st.auto); });

    // 05 The numbers count up
    S.stats.t = st.nums ? 1 : 0;
    const so = go(S.stats, f);
    set(stats, 'opacity', clamp(so * 1.5).toFixed(3));
    set(stats, 'transform', `translateY(${((1 - so) * 44).toFixed(1)}px) scale(${(0.9 + 0.1 * so).toFixed(3)}) rotate(${((1 - so) * 4).toFixed(2)}deg)`);
    if (st.nums && !was.nums) t0 = now;
    if (st.nums) kn = ease(clamp((now - t0) / 1400)); else if (so < 0.05) kn = 0;
    nums.forEach(n => { const v = String(Math.round(+n.dataset.emN * kn)); if (n.textContent !== v) n.textContent = v; });

    was = st;
  };
  requestAnimationFrame(frame);
}
