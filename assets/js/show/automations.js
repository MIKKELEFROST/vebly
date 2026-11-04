// Showcase: Automations, a flow machine (scripts/services/showcase/automations.html).
// Each example is a small graph: nodes on a grid (columns and rows across the width, or rows and lanes
// top to bottom when that does not fit) and wires between their ports. When the canvas comes into view
// the nodes pop in, the wires plug in and a glowing pulse runs through: each node lights up, pops a toast
// with its result and keeps it. The .seg control re-routes the machine (unplug, move, plug in, run) and
// "Kør igen" runs it again. Every state is derived from the run's clock, so a run can be restarted or
// re-routed at any moment. Without html.motion the finished run is shown, static.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--automations');
if (root) init(root);

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const fm = $('[data-fm]'), cv = $('[data-fm-cv]'), svg = $('[data-fm-wires]'), hot = $('[data-fm-hot]');
  const WS = $$('[data-fm-wait]'), LS = $$('[data-fm-lbl]'), PS = $$('[data-fm-pulse]'), segs = $$('[data-fm-go]');
  const ttl = $('[data-fm-title]'), sr = $('[data-fm-sr]'), endT = $('[data-fm-end]'), runBtn = $('[data-fm-run]');
  const NS = $$('[data-fm-node]').map(el => ({ el, use: el.querySelector('use'), b: el.querySelector('b'), s: el.querySelectorAll('.fm__sub span'), toast: el.querySelector('.fm__toast') }));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // The examples, in the order of the .seg buttons (their names, what they do and the end line are there).
  // n: [icon, name, what it does, its result, 'if' for a question]
  // e: [from, to, { w: a wait on the wire, l: a branch label, skip: the branch not taken,
  //     dp / mp: ports across / top to bottom (r l t b), by default right→left / bottom→top }]
  // d: [column 0–4, row −1–1] across the width; the waits get more room, as distance is time
  // m: [row, lane] top to bottom: lane ±1 is two nodes side by side, less is a small step to the side
  const F = [
    { n: [['book', 'Ny booking', 'Fra din hjemmeside', 'Mette, tir. kl. 10'], ['sms', 'SMS-bekræftelse', 'Til kunden', 'SMS sendt'], ['cal', 'I kalenderen', 'Din kalender', 'Tid lagt ind'], ['bill', 'Faktura', 'Sendes på mail', 'Faktura sendt'], ['star', 'Anmeldelse', 'Spørg kunden', 'Mail sendt']],
      e: [[0, 1], [1, 2], [2, 3, { w: 'Dagen efter' }], [3, 4, { w: '3 dage efter' }]],
      d: [[0, 0], [.9, 0], [1.8, 0], [2.9, 0], [4, 0]], m: [[0, -.2], [1, .2], [2, -.2], [3, .2], [4, -.2]] },
    { n: [['done', 'Jobbet er slut', 'Fra din kalender', 'Opgave hos Mette'], ['bill', 'Faktura', 'Med det samme', 'Faktura sendt'], ['fork', 'Betalt?', 'Tjekker banken', 'Ikke betalt endnu', 'if'], ['bell', 'Venlig rykker', 'Mail til kunden', 'Rykker sendt'], ['ledger', 'Bogført', 'I dit regnskab', 'Betalt og bogført']],
      e: [[0, 1], [1, 2, { w: '8 dage efter' }], [2, 4, { l: 'Ja', skip: 1, mp: 'rr' }], [2, 3, { l: 'Nej', dp: 'bl' }], [3, 4, { dp: 'rb' }]],
      d: [[0, 0], [.9, 0], [2, 0], [3, 1], [4, 0]], m: [[0, -.2], [1, -.2], [2, -.2], [3, -.2], [4, -.2]] },
    { n: [['inbox', 'Ny henvendelse', 'Fra din hjemmeside', 'Jonas, kl. 21:47'], ['sms', 'SMS til kunden', 'Med det samme', 'SMS sendt'], ['phone', 'Besked til dig', 'På din telefon', 'Sendt til dig'], ['user', 'I kundelisten', 'Dit kundesystem', 'Kunde oprettet'], ['mail', 'Opfølgning', 'Hvis intet svar', 'Mail sendt']],
      e: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4, { w: '2 dage efter' }]],
      d: [[0, 0], [1.15, -1], [1.15, 1], [2.3, 0], [4, 0]], m: [[0, 0], [1, -1], [1, 1], [2, 0], [3, 0]] }
  ];
  const ACT = ['booking', 'faktura', 'leads'];

  // Layout: the positions [x, y, width] of the node centres and the canvas height, for every example
  const SAG = 64, RH = 96, J = [2, -12, 6, -8, 4], T = 58, PROC = .4;
  let W = 0, H = 0, V = false, nh = 64, fw = 0, L = [], R = [], E = [], cur = 0;
  const horiz = f => {
    const A = Math.min(1320, W - 64), w = A < 1290 ? 186 : 200, st = (A - w) / 4, x0 = (W - A + w) / 2;
    const p = f.d.map(([c, r], i) => [x0 + c * st, r * RH + (r ? 0 : J[i]), w]);
    let t = 1e4, b = -1e4, g = 1e4;
    p.forEach(([, y]) => { t = Math.min(t, y - nh / 2 - 44); b = Math.max(b, y + nh / 2); });
    f.e.forEach(([a, z, o = {}]) => {
      if (o.w) b = Math.max(b, (p[a][1] + p[z][1]) / 2 + SAG + 16);
      if (f.d[a][1] === f.d[z][1]) g = Math.min(g, Math.abs(p[z][0] - p[a][0]) - w);
    });
    fw = A;
    return { p, t, b, g };
  };
  const vert = f => {
    const A = Math.min(440, W - 40), ws = (A - 12) / 2, wm = Math.min(264, A - 84), rows = f.m[4][0] + 1, gap = Array(rows).fill(38), ys = [0];
    const side = l => Math.abs(l) === 1;
    f.e.forEach(([a, z, o = {}]) => { const r = f.m[a][0]; if (f.m[z][0] === r + 1) gap[r] = Math.max(gap[r], o.w ? 86 : o.l || side(f.m[a][1]) !== side(f.m[z][1]) ? 50 : 38); });
    for (let r = 1; r < rows; r++) ys[r] = ys[r - 1] + nh + gap[r - 1];
    fw = A;
    return { p: f.m.map(([r, l]) => [W / 2 + (side(l) ? l * (ws / 2 + 6) : l * 80), ys[r], side(l) ? ws : wm]), t: -nh / 2 - 38, b: ys[rows - 1] + nh / 2 };
  };
  // Across the width when every pair of neighbours keeps at least 40px between them, else top to bottom
  const layout = () => {
    W = cv.clientWidth; nh = 64; L = F.map(horiz);
    V = L.some(q => q.g < 40);
    if (V) { nh = 54; L = F.map(vert); }
    fm.classList.toggle('is-v', V); fm.classList.toggle('is-c', !V && fw < 1290);
    cv.style.setProperty('--nh', nh + 'px'); fm.style.setProperty('--fw', fw + 'px');
    L.forEach(q => { q.h = Math.round(q.b - q.t + (V ? 10 : 20)); q.p.forEach(a => { a[1] += (V ? 4 : 6) - q.t; }); });
    size();
  };
  const size = () => { H = L[cur].h; cv.style.height = H + 'px'; };
  // Placed with the translate property, so the pop-in's scale works around each node's own centre
  const put = (n, [x, y, w]) => { n.el.style.width = w.toFixed(1) + 'px'; n.el.style.translate = `${(x - w / 2).toFixed(1)}px ${(y - nh / 2).toFixed(1)}px`; };
  const snap = () => L[cur].p.forEach((a, i) => { R[i] = a.slice(); put(NS[i], a); });
  const fill = () => F[cur].n.forEach(([ic, a, b, r, k], i) => {
    const n = NS[i];
    n.use.setAttribute('href', '#fm-i-' + ic); n.b.textContent = a; n.s[0].textContent = b; n.s[1].textContent = r; n.toast.textContent = r;
    n.el.classList.toggle('is-if', k === 'if'); n.el.style.setProperty('--i', i);
  });

  // Wires: a curve between two ports that leaves and enters along the ports' sides. Across the width a
  // wait hangs down under the row, with its clock at the bottom
  const port = ([x, y, w], s) => s === 'r' ? [x + w / 2, y, 1, 0] : s === 'l' ? [x - w / 2, y, -1, 0] : s === 't' ? [x, y - nh / 2, 0, -1] : [x, y + nh / 2, 0, 1];
  const curve = (a, b, o) => {
    const dx = b[0] - a[0];
    if (o.w && !V) { const c = (a[1] + b[1]) / 2 + SAG * 4 / 3, k = dx * .3; return [a, [a[0] + k, c], [b[0] - k, c], b]; }
    const k = a[2] === b[2] && a[3] === b[3] ? 44 : clamp(Math.hypot(dx, b[1] - a[1]) * .45, 20, 130);
    return [a, [a[0] + a[2] * k, a[1] + a[3] * k], [b[0] + b[2] * k, b[1] + b[3] * k], b];
  };
  const at = (el, p) => { el.style.translate = `calc(${p.x.toFixed(1)}px - 50%) calc(${p.y.toFixed(1)}px - 50%)`; };
  const draw = (plug, d = 0) => {
    const f = F[cur], q = L[cur].p, fx = v => v.toFixed(1);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.classList.toggle('is-plug', !!plug); svg.style.setProperty('--d', d + 's');
    svg.innerHTML = f.e.map(([a, z, o = {}], i) => {
      const ps = (V ? o.mp : o.dp) || (V ? 'bt' : 'rl'), A = port(q[a], ps[0]), B = port(q[z], ps[1]);
      const p = 'M' + curve(A, B, o).map(c => fx(c[0]) + ',' + fx(c[1])).join(' ').replace(' ', 'C');
      return `<g style="--i:${i}"${o.skip ? ' class="is-skip"' : ''}><path class="w-b" d="${p}"/>${o.skip ? '' : `<path class="w-t" d="${p}"/><path class="w-g" d="${p}"/><path class="w-c" d="${p}"/>`}<circle cx="${fx(A[0])}" cy="${fx(A[1])}" r="4"/><circle cx="${fx(B[0])}" cy="${fx(B[1])}" r="4"/></g>`;
    }).join('');
    let wi = 0, li = 0;
    E = [...svg.children].map((g, i) => {
      const [a, z, o = {}] = f.e[i], [b, t, gl, c] = g.querySelectorAll('path'), len = b.getTotalLength();
      const x = { g, b, t, gl, c, dots: g.querySelectorAll('circle'), len, a, z, o, p: -1 };
      if (t) { t.style.strokeDasharray = `${len} ${len}`; gl.style.strokeDasharray = c.style.strokeDasharray = `${T} ${len + T}`; }
      if (plug && t) { b.style.strokeDasharray = len; b.style.setProperty('--l', len + 'px'); }
      // Top to bottom the clock sits a little higher, clear of the next node's toast
      if (o.w) { x.wait = WS[wi++]; at(x.wait, b.getPointAtLength(len * (V ? .4 : .5))); x.wait.lastChild.textContent = o.w; }
      if (o.l) { x.lbl = LS[li++]; at(x.lbl, b.getPointAtLength(Math.min(len / 2, 46))); x.lbl.textContent = o.l; }
      return x;
    });
    WS.forEach((el, j) => el.classList.toggle('is-off', j >= wi));
    LS.forEach((el, j) => el.classList.toggle('is-off', j >= li));
  };

  // The run: when each node fires and when the pulse is on each wire (a wait takes longer)
  let FI = [], S = [], U = [], END = 0, last = -1, maxStep = 0;
  const plan = () => {
    FI = [.3];
    for (let n = 1; n < 5; n++) {
      FI[n] = 0;
      E.forEach((x, i) => { if (x.z === n && !x.o.skip) { S[i] = FI[x.a] + PROC; U[i] = x.o.w ? 2.1 : clamp(x.len / 520, .45, .9); FI[n] = Math.max(FI[n], S[i] + U[i]); } });
    }
    END = FI[4] + PROC + .4;
  };
  const set = (el, c, on) => { if (el.classList.contains(c) !== on) el.classList.toggle(c, on); };
  const step = n => { while (maxStep < n) track('showcase_step', { showcase: 'automations', step: ++maxStep }); };
  const tick = t => {
    let np = 0;
    last = t;
    E.forEach((x, i) => {
      if (x.o.skip) return;
      // Ease in and out; on a wait the pulse slows down inside the clock (time passes)
      const k = clamp((t - S[i]) / U[i], 0, 1), p = x.o.w ? k + .86 * Math.sin(6.2832 * k) / 6.2832 : k * k * (3 - 2 * k), go = k > 0 && k < 1;
      if (p !== x.p) { x.p = p; x.t.style.strokeDashoffset = x.len * (1 - p); x.gl.style.strokeDashoffset = x.c.style.strokeDashoffset = T - p * x.len; }
      set(x.g, 'is-go', go); set(x.dots[0], 'is-on', k > 0); set(x.dots[1], 'is-on', k >= 1);
      if (x.wait) { set(x.wait, 'is-on', k > .2 && k < .8); set(x.wait, 'is-done', k >= .8); }
      if (x.lbl) set(x.lbl, 'is-on', k > 0);
      if (go && np < 2) {
        const q = x.b.getPointAtLength(p * x.len), X = q.x.toFixed(1), Y = q.y.toFixed(1);
        PS[np].style.transform = `translate3d(${X}px,${Y}px,0)`;
        hot.style.setProperty(np ? '--bx' : '--ax', X + 'px'); hot.style.setProperty(np ? '--by' : '--ay', Y + 'px');
        np++;
      }
    });
    PS.forEach((el, j) => set(el, 'is-on', j < np));
    if (np < 2) hot.style.setProperty('--bx', '-999px');
    if (!np) hot.style.setProperty('--ax', '-999px');
    NS.forEach((n, i) => {
      const a = t - FI[i];
      set(n.el, 'is-run', a >= 0 && a < PROC); set(n.el, 'is-done', a >= PROC);
      set(n.el, 'is-toast', a >= PROC * .7 && a < 2.2); set(n.el, 'is-land', a >= 2.2 && a < 2.8); set(n.el, 'is-res', a >= 2.3);
    });
    set(fm, 'is-end', t >= END);
    if (motion && t > 0) step(t >= END ? 3 : t >= FI[2] ? 2 : 1);
  };

  // One loop for the glide and the run; it sleeps when nothing moves or the canvas is out of view
  let raf = 0, vis = false, live = false, running = false, t0 = 0, G = null, off = 0, swT = 0;
  const loop = now => {
    raf = 0;
    if (G) glide(now);
    if (running) { const t = (now - t0) / 1000; tick(t); if (t > END + 3.5) running = false; }
    if (vis && (G || running)) raf = requestAnimationFrame(loop);
  };
  const kick = () => { if (!raf && vis) raf = requestAnimationFrame(loop); };
  const start = ms => { plan(); t0 = performance.now() + ms; running = true; kick(); };
  // Re-route: unplug (the wires and the results go), move (the nodes glide to their new places and change
  // what they are), plug in (the new wires draw themselves) and run
  const glide = now => {
    const to = L[cur].p;
    let done = true;
    NS.forEach((n, j) => {
      const k = clamp((now - G.t - 140 - j * 50) / 620, 0, 1), e = k < .5 ? 4 * k * k * k : 1 - (2 - 2 * k) ** 3 / 2;
      if (k < 1) done = false;
      R[j] = G.from[j].map((v, m) => v + (to[j][m] - v) * e); put(n, R[j]);
    });
    if (done) { G = null; fm.style.setProperty('--pd', '.4s'); fm.classList.remove('is-swap'); draw(true); start(1000); }
  };
  const go = i => {
    if (i === cur) return;
    cur = i;
    segs.forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-pressed', String(j === i)); });
    ttl.textContent = segs[i].textContent; sr.textContent = segs[i].dataset.sr; endT.textContent = segs[i].dataset.end;
    if (!motion || !live) { size(); fill(); snap(); draw(false); plan(); tick(motion ? -1 : 1e4); return; }
    ttl.animate([{ opacity: 0, transform: 'translateY(40%)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
    running = false; tick(-1);
    fm.classList.add('is-swap', 'is-blank'); size();
    clearTimeout(swT); swT = setTimeout(() => { fill(); fm.classList.remove('is-blank'); }, 190);
    G = { t: performance.now(), from: R.map(r => r.slice()) };
    kick();
  };
  const enter = () => { live = true; fm.style.setProperty('--pd', '.95s'); fm.classList.add('is-live'); draw(true, .45); start(1500); };

  segs.forEach((b, i) => b.addEventListener('click', () => {
    if (i !== cur) track('showcase_interact', { showcase: 'automations', action: 'flow-' + ACT[i] });
    go(i);
  }));
  runBtn.addEventListener('click', () => {
    track('showcase_interact', { showcase: 'automations', action: 'koer-igen' });
    if (!motion) return;
    if (!live) enter(); else if (!G) start(380);
  });

  // The visitor's own business from "Prøv med din egen virksomhed" on /services/hjemmesider, if typed there
  try {
    const v = JSON.parse(sessionStorage.getItem('wl-egen') || 'null');
    const c = (s, d) => { s = typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, 40) : ''; return s ? s.charAt(0).toLocaleUpperCase('da-DK') + s.slice(1) : d; };
    if (v) $('[data-fm-who]').textContent = [c(v.navn, 'Nordvik'), c(v.fag, 'Tømrer'), c(v.by, 'København')].join(' · ');
  } catch (x) { /* fine */ }

  layout(); fill(); snap(); fm.classList.add('is-ready');
  if (!motion) { fm.classList.add('is-static'); draw(false); plan(); tick(1e4); }

  // A new width: lay out again and redraw; a run keeps going, its wires stay on the nodes
  new ResizeObserver(() => {
    if (!cv.clientWidth || cv.clientWidth === W) return;
    layout(); snap();
    const g = G;
    G = null;
    if (g) { clearTimeout(swT); fill(); fm.classList.remove('is-swap', 'is-blank'); }
    if (live || !motion) { draw(false); if (g) start(500); else tick(motion ? last : 1e4); }
  }).observe(cv);

  if (!motion) return;
  new IntersectionObserver(es => {
    const e = es[es.length - 1], now = performance.now();
    if (e.isIntersecting && !vis && off) { t0 += now - off; if (G) G.t += now - off; off = 0; }
    if (!e.isIntersecting && vis) off = now;
    vis = e.isIntersecting;
    if (vis && !live && e.intersectionRatio >= .4) enter();
    kick();
  }, { threshold: [0, .4] }).observe(cv);
}
