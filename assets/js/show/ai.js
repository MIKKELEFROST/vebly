// AI showcase (/services/ai): a night on the website of Studio Lys, an example hair salon in Aarhus, as a
// time-lapse. When the scene is on the screen, a clock runs from 18:00 to 07:00 (about 13 seconds), the moon
// crosses the sky and the site's chatbot answers three customers: it books Saturday 10.30, tells what a men's
// cut costs (from the site's own price list) and moves a Thursday time to next Tuesday. Booked times fly into
// the calendar, and at 07:00 the night is summed up. Everything is drawn from one playhead (T, in seconds), so
// the clock and the chat always agree, the night pauses while it is off the screen, and "Se natten igen"
// rewinds it and plays it again. Without motion the finished morning is shown, and the chat can be scrolled
// back through the night.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--ai');
const scene = root && root.querySelector('[data-ai]');
if (scene) init(root, scene);

function init(root, scene) {
  const $ = (s, r = scene) => r.querySelector(s), $$ = (s, r = scene) => [...r.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  if (motion) root.classList.add('is-m');
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const sm = t => t * t * (3 - 2 * t);
  const inout = t => t < .5 ? 4 * t * t * t : 1 - (2 - 2 * t) ** 3 / 2;
  const step = (v, a, w) => sm(clamp((v - a) / w));
  const hhmm = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

  /* ---------------- The night's script ---------------- */
  // The clock: [T, minutes since midnight (18:00 = 1080, 07:00 the next morning = 1860), 1 = ticks in real
  // time while a customer writes]. Between those the time-lapse races (ease in and out).
  const K = [[0, 1080, 1], [.4, 1080], [1.6, 1274, 1], [4.5, 1275.9], [5.5, 1427, 1], [7.5, 1428.3], [8.7, 1802, 1], [11.7, 1803.9], [12.7, 1860]];
  const END = 12.7;
  const MK = [[1274, 1.6, 3.75], [1427, 5.5, 6.35], [1802, 8.7, 10.9]]; // a customer on the dial: time, writes, solved
  const ANS = [2.5, 6.35, 9.6], BOOK = [4.45, 11.65]; // answered; booked (the time lands in the calendar)
  const STEPS = [3.75, 6.35, 10.9, END];
  const clockAt = T => {
    if (T <= 0) return 1080;
    for (let i = 0; i < K.length - 1; i++) {
      const [t0, v0, hold] = K[i], [t1, v1] = K[i + 1];
      if (T < t1) { const k = (T - t0) / (t1 - t0); return v0 + (v1 - v0) * (hold ? k : inout(k)); }
    }
    return 1860;
  };

  /* ---------------- The clock: four rolling digits ---------------- */
  const clock = $('[data-ai-clock]'), COLS = ['120', '89012301234567', '0123450', '01234567890'];
  clock.innerHTML = COLS.map((c, i) => (i === 2 ? '<span class="ai-colon">:</span>' : '') + `<span class="ai-w"><span class="ai-c">${[...c].map(d => `<span>${d}</span>`).join('')}</span></span>`).join('');
  const cols = $$('.ai-c', clock), TENS = [0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2], lastP = [];
  const setClock = v => {
    const u = v - 1080, h = Math.min(13, Math.floor(u / 60)), m = Math.floor(u) % 60, f = u - Math.floor(u);
    const ro = step(f, .8, .2), rt = m % 10 === 9 ? step(f, .5, .5) : 0, rh = h < 13 && m >= 54 ? step(u % 60, 54, 6) : 0;
    const p = [TENS[h] + (h === 1 || h === 5 ? rh : 0), h + rh, Math.floor(m / 10) + rt, m % 10 + ro];
    p.forEach((x, i) => { x = Math.round(x * 1000) / 1000; if (x !== lastP[i]) { lastP[i] = x; cols[i].style.transform = `translateY(${-x}em)`; } });
  };

  /* ---------------- The sky ---------------- */
  const sky = $$('[data-ai-sky]'), stars = $('[data-ai-stars]');
  let seed = 11;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  stars.innerHTML = Array.from({ length: 28 }, () => `<b style="left:${(rnd() * 100).toFixed(1)}%;top:${(rnd() * 60).toFixed(1)}%;animation-delay:-${(rnd() * 2.4).toFixed(2)}s${rnd() < .25 ? ';width:3px;height:3px' : ''}"></b>`).join('');
  const fade = (el, o) => { o = Math.round(o * 100) / 100; if (el._o !== o) { el._o = o; el.style.opacity = o; } };
  const setSky = v => {
    const dusk = 1 - step(v, 1080, 100), dawn = step(v, 1755, 105), night = (1 - dusk) * (1 - dawn);
    fade(sky[0], dusk); fade(sky[1], night); fade(sky[2], dawn); fade(stars, night);
  };

  /* ---------------- The dial: the night's path, with the moon on it ---------------- */
  const dial = $('[data-ai-dial]'), svg = $('[data-ai-svg]');
  let L = 0, W = 0, H = 0, p1, ph, moon, sun, mks = [], lastF = -1;
  const build = () => {
    const w = dial.clientWidth, h = dial.clientHeight;
    if (!w || !h || (w === W && h === H)) return;
    W = w; H = h;
    const sm2 = h < 160, b = sm2 ? 15 : 22, mg = sm2 ? 12 : 17, cx = w / 2, cy = h - b, rx = cx - mg, ry = Math.min(cy - (sm2 ? 31 : mg), rx), r = sm2 ? 8 : 10;
    const d = `M${cx - rx} ${cy}A${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = `<defs><radialGradient id="aiGlow"><stop offset="0" stop-color="#f2ede4" stop-opacity=".42"/><stop offset="1" stop-color="#f2ede4" stop-opacity="0"/></radialGradient><mask id="aiCres"><circle r="${r}" fill="#fff"/><circle cx="${r * .46}" cy="${-r * .36}" r="${r * .8}" fill="#000"/></mask><clipPath id="aiUp"><rect x="-40" y="-40" width="${w + 80}" height="${cy + 40}"/></clipPath></defs>`
      + `<line class="ai-hz" x1="0" y1="${cy}" x2="${w}" y2="${cy}"/><path class="ai-p0" d="${d}"/><path class="ai-p1" d="${d}"/>`
      + `<text x="${cx - rx}" y="${cy + b - 5}" text-anchor="middle">18:00</text><text x="${cx + rx}" y="${cy + b - 5}" text-anchor="middle">07:00</text>`
      + `<g clip-path="url(#aiUp)"><g class="ai-ph"><circle r="${r * 2.6}" fill="url(#aiGlow)"/><g class="ai-moon"><circle r="${r}" fill="#f2ede4" mask="url(#aiCres)"/></g>`
      + `<g class="ai-sun"><g class="ai-rays">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M0 ${-r * 1.45}v${-r * .45}" transform="rotate(${a})"/>`).join('')}</g><circle r="${r * .95}" fill="#f2c14e"/></g></g></g>`
      + MK.map(() => `<g class="ai-mk"><g class="ai-mk__in"><circle r="${sm2 ? 6 : 7}"/><path d="M-3 .2l2 2 4-4.2"/></g><text class="ai-tl"></text></g>`).join('');
    p1 = $('.ai-p1', svg); L = p1.getTotalLength(); p1.style.strokeDasharray = `${L} ${L}`;
    mks = $$('.ai-mk', svg).map((g, i) => {
      const pt = p1.getPointAtLength((MK[i][0] - 1080) / 780 * L), nx = pt.x - cx, ny = (pt.y - cy) * rx / ry, n = Math.hypot(nx, ny) || 1, t = $('text', g);
      g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      t.textContent = hhmm(MK[i][0]);
      t.setAttribute('x', (nx / n * 17).toFixed(1)); t.setAttribute('y', (ny / n * 17 + 4).toFixed(1));
      t.setAttribute('text-anchor', nx / n > .4 ? 'start' : nx / n < -.4 ? 'end' : 'middle');
      return g;
    });
    ph = $('.ai-ph', svg); moon = $('.ai-moon', svg); sun = $('.ai-sun', svg); lastF = -1;
  };
  const setDial = (v, T) => {
    if (!L) return;
    const f = Math.round(clamp((v - 1080) / 780) * 2000) / 2000;
    if (f !== lastF) {
      lastF = f;
      const pt = p1.getPointAtLength(f * L), s = Math.max(1 - step(f, 0, .045), step(f, .93, .06)); // the sun sets and rises at the ends, the moon is out between
      p1.style.strokeDashoffset = (L * (1 - f)).toFixed(1);
      ph.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
      moon.style.opacity = (1 - s).toFixed(2); sun.style.opacity = s.toFixed(2); sun.style.transform = `scale(${(.55 + .45 * s).toFixed(2)})`;
    }
    mks.forEach((g, i) => { g.classList.toggle('is-ask', T >= MK[i][1] && T < MK[i][2]); g.classList.toggle('is-on', T >= MK[i][2]); });
  };

  /* ---------------- The chat: messages appear at their time and push the rest up ---------------- */
  const msgs = $('[data-ai-msgs]'), list = $('[data-ai-list]'), greet = list.firstElementChild;
  const items = $$('[data-at]', list).map(el => ({ el, at: +el.dataset.at, to: +(el.dataset.to || 1e9) }));
  let off = 0;
  const slide = () => { list.style.transform = off ? `translateY(${off.toFixed(1)}px)` : ''; };
  const setChat = (T, live) => {
    const ch = items.filter(it => (T >= it.at && T < it.to) === it.el.hidden);
    if (!ch.length) return;
    const y0 = greet.getBoundingClientRect().top;
    ch.forEach(it => { it.el.hidden = !it.el.hidden; });
    msgs.scrollTop = msgs.scrollHeight;
    off = live ? off + y0 - greet.getBoundingClientRect().top : 0; // what moved up slides up instead of jumping
    slide();
  };

  /* ---------------- Calendar, tally and the website's price list ---------------- */
  const old = $('[data-ai-old]'), slots = $$('[data-ai-slot]'), price = $('[data-ai-price]'), nums = $$('[data-ai-n]'), tid = $('[data-ai-tid]');
  const setRest = (T, live) => {
    slots[0].classList.toggle('is-in', T >= BOOK[0]);
    slots[1].classList.toggle('is-in', T >= BOOK[1]);
    old.classList.toggle('is-ping', T >= ANS[2] && T < 11);
    old.classList.toggle('is-gone', T >= 11);
    price.classList.toggle('is-hl', T >= ANS[1] && T < 8.3);
    [ANS, BOOK].forEach((ts, i) => {
      const n = String(ts.filter(t => T >= t).length), el = nums[i];
      if (el.textContent === n) return;
      el.textContent = n;
      if (live && el.animate) el.animate([{ transform: 'scale(1.8)' }, { transform: 'none' }], { duration: 500, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    });
    tid.textContent = nums[1].textContent === '1' ? 'tid' : 'tider';
  };

  // A booked time flies from the chat (or from Thursday) into its day, on an arc
  const FL = [{ t0: 3.85, t1: 4.45, a: $('[data-ai-rc] .ai-ok'), b: slots[0], txt: ['10.30'], lift: 130 }, { t0: 11, t1: 11.65, a: old, b: slots[1], txt: ['15.00', '16.00'], lift: 46 }];
  const flights = T => FL.forEach(fl => {
    const k = (T - fl.t0) / (fl.t1 - fl.t0);
    if (!(k > 0 && k < 1)) { if (fl.el) { fl.el.remove(); fl.el = null; } return; }
    if (!fl.el) { fl.el = document.createElement('span'); fl.el.className = 'ai-fly'; fl.el.setAttribute('aria-hidden', 'true'); scene.append(fl.el); }
    const S = scene.getBoundingClientRect(), A = fl.a.getBoundingClientRect(), B = fl.b.getBoundingClientRect(), e = inout(k);
    const ax = A.left + A.width / 2 - S.left, ay = A.top + A.height / 2 - S.top, bx = B.left + B.width / 2 - S.left, by = B.top + B.height / 2 - S.top;
    const lift = Math.min(fl.lift, Math.hypot(bx - ax, by - ay) * .35), arc = Math.sin(Math.PI * e), t = fl.txt[k < .5 ? 0 : fl.txt.length - 1];
    if (fl.el.textContent !== t) fl.el.textContent = t;
    fl.el.classList.toggle('is-old', t !== fl.txt[fl.txt.length - 1]);
    fl.el.style.transform = `translate(${(ax + (bx - ax) * e).toFixed(1)}px,${(ay + (by - ay) * e - arc * lift).toFixed(1)}px) translate(-50%,-50%) scale(${(1 + .3 * arc).toFixed(3)}) rotate(${(Math.sin(Math.PI * 2 * e) * -9).toFixed(1)}deg)`;
  });

  const sent = [];
  const render = (T, live) => {
    const v = clockAt(T);
    setClock(v); setSky(v); setDial(v, T); setChat(T, live); setRest(T, live); flights(T);
    scene.classList.toggle('is-done', T >= END);
    if (live) STEPS.forEach((t, i) => { if (T >= t && !sent[i]) { sent[i] = 1; track('showcase_step', { showcase: 'ai', step: i + 1 }); } });
  };

  /* ---------------- The cards under the night ---------------- */
  const more = root.querySelector('[data-ai-more]');

  build();
  const again = $('[data-ai-again]');
  if (!motion) {
    render(END, false);
    msgs.scrollTop = msgs.scrollHeight;
    if (more) more.classList.add('is-go');
    new ResizeObserver(() => { build(); render(END, false); }).observe(dial);
    return;
  }

  /* ---------------- Playing: forward while it is on the screen, rewinding on replay ---------------- */
  let T = 0, mode = 'idle', vis = false, raf = 0, prev = 0, rw = 12;
  const frame = now => {
    raf = 0;
    const dt = Math.min(.1, Math.max(0, (now - prev) / 1000)); prev = now;
    let live = false;
    if (mode === 'play' && vis) { T += dt; live = T > 0; if (T >= END) { T = END; mode = 'done'; finish(); } }
    else if (mode === 'rewind') { T -= dt * rw; if (T <= 0) { T = -.35; mode = 'play'; } }
    if (off) { off *= Math.exp(-dt * 11); if (Math.abs(off) < .5) off = 0; slide(); }
    render(T, live);
    if ((mode === 'play' && vis) || mode === 'rewind' || off) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) { prev = performance.now(); raf = requestAnimationFrame(frame); } };
  const finish = () => {
    scene.classList.add('is-stop', 'has-again');
    if (again.hidden) { again.hidden = false; again.classList.add('is-new'); }
  };
  render(0, false);

  // Start once most of the night is on the screen; pause when it leaves, carry on when it is back
  new IntersectionObserver(es => {
    const e = es[es.length - 1], fill = e.intersectionRect.height / Math.max(1, Math.min(innerHeight, e.boundingClientRect.height));
    if (fill > .62 && !vis) {
      vis = true;
      if (mode === 'idle') { mode = 'wait'; setTimeout(() => { mode = 'play'; kick(); }, 700); } else kick();
    } else if (fill < .3 && vis) vis = false;
  }, { threshold: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1] }).observe(scene);

  again.addEventListener('click', () => {
    track('showcase_interact', { showcase: 'ai', action: 'replay' });
    scene.classList.remove('is-stop');
    again.classList.remove('is-new');
    vis = true;
    if (T > 0) { rw = Math.max(12, T / .75); mode = 'rewind'; } else mode = 'play';
    kick();
  });

  new ResizeObserver(() => { build(); render(T, false); }).observe(dial);
  if (document.fonts) document.fonts.ready.then(() => { msgs.scrollTop = msgs.scrollHeight; });

  if (more) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); setTimeout(() => more.classList.add('is-go'), 350); } }, { threshold: .5 });
    io.observe(more);
  }
}
