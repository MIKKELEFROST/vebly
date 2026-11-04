// Showcase: Video, an editing timeline (scripts/services/showcase/video.html). A preview plays a short example
// video for Nordvik above a timeline with video, text and music tracks; the playhead runs and loops while the
// editor is in view. Tabs switch the kind of video, chips reframe it (9:16, 1:1, 16:9), the timeline can be
// scrubbed. Elements of the video carry their own keyframes (data-k) and on/off times (data-on).
// No motion: a still frame of each video, tabs and formats switch without animation.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--video');
if (root) init(root);

function init(root) {
  const q = s => root.querySelector(s), qa = (s, r = root) => [...r.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const ved = q('[data-ved]'), stage = q('[data-ved-stage]'), frame = q('[data-ved-frame]'), pic = q('[data-ved-pic]');
  const lanes = q('[data-ved-lanes]'), ruler = q('[data-ved-ruler]'), nums = q('[data-ved-nums]'), ph = q('[data-ved-ph]');
  const playBtn = q('[data-ved-play]'), tcEl = q('[data-ved-tc]'), durEl = q('[data-ved-dur]'), glabel = q('[data-ved-glabel]');
  const cap = q('.ved-cap'), capH = q('[data-ved-caph]'), capP = q('[data-ved-cap]'), vu = qa('[data-ved-vu]');
  const tabBtns = qa('[data-ved-tab]'), fmtBtns = qa('[data-ved-fmt]');
  const I = Object.fromEntries(qa('[data-ved-i]').map(e => [e.dataset.vedI, e]));
  const act = a => track('showcase_interact', { showcase: 'video', action: a });
  const TABS = {
    r: { d: 10, still: 1.4, id: 'reklame', kind: 'Reklamevideo', x: [['Hook', 'De første 2 sek.'], ['Undertekster', 'Brændt ind']], bps: 2,
      h: 'Fanger på de første sekunder.', p: 'En stærk start og store undertekster, så budskabet når frem uden lyd.' },
    e: { d: 15, still: 1.6, id: 'explainer', kind: 'Explainer', x: [['Scener', '5 med ikoner'], ['Speak', 'Dansk']], bps: 1.5,
      h: 'Din ydelse forklaret enkelt.', p: 'Ikoner og korte linjer, der viser, hvordan det foregår. Til forsiden eller salget.' },
    m: { d: 8, still: 7.4, id: 'motion', kind: 'Motion graphics', x: [['Logo', 'Animeret'], ['Keyframes', '13']], bps: 2.4,
      h: 'Dit logo i bevægelse.', p: 'Animeret logo, tekst og grafik til intro, slutkort og annoncer.' }
  };
  const FMT = { 916: [9, 16, '1080 × 1920', 'Reels, Stories og TikTok'], 11: [1, 1, '1080 × 1080', 'Feedet på Facebook og Instagram'], 169: [16, 9, '1920 × 1080', 'YouTube og din hjemmeside'] };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), r3 = v => Math.round(v * 1000) / 1000;
  const back = (t, c = 1.7) => 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
  const EASE = { o: t => 1 - (1 - t) ** 3, l: t => t, i: t => t < .5 ? 4 * t ** 3 : 1 - (2 - 2 * t) ** 3 / 2, b: t => back(t) };
  const two = n => String(n).padStart(2, '0'), tcode = fr => `00:${two(Math.floor(fr / 1500))}:${two(Math.floor(fr / 25) % 60)}:${two(fr % 25)}`;

  /* Keyframes: "sek prop… ; …", props carry over, the easing (~x) is for the way into that keyframe */
  const DEF = { o: 1, x: 0, y: 0, s: 1, w: 1, h: 1, r: 0 };
  const parse = str => { let p = DEF; return str.split(';').map(seg => { const [t, ...tk] = seg.trim().split(/\s+/), k = { ...p, t: +t, e: 'o' }; for (const x of tk) if (x[0] === '~') k.e = x[1]; else k[x[0]] = +x.slice(1); return p = k; }); };
  const val = (kf, t) => {
    if (t <= kf[0].t) return kf[0];
    for (let i = 1; i < kf.length; i++) {
      const b = kf[i]; if (t >= b.t) continue;
      const a = kf[i - 1], p = EASE[b.e]((t - a.t) / (b.t - a.t)), o = {};
      for (const n in DEF) o[n] = a[n] + (b[n] - a[n]) * p;
      return o;
    }
    return kf[kf.length - 1];
  };
  const span = el => [+el.style.getPropertyValue('--s'), +el.style.getPropertyValue('--e')];

  /* Per kind of video: its animated elements, its clips, a waveform for its music */
  const G = {}, WN = 110, seed = s => () => (s = s * 16807 % 2147483647) / 2147483647;
  for (const k in TABS) {
    const T = TABS[k], g = q(`.vs[data-tab="${k}"]`), els = qa(`[data-tab="${k}"]`);
    G[k] = { els, k: qa('[data-k]', g).map(el => ({ el, kf: parse(el.dataset.k) })),
      on: qa('[data-on]', g).map(el => { const [a, b] = el.dataset.on.split(' ').map(Number); return { el, a, b }; }),
      clips: qa(`.ved__lane .ved__clip[data-tab="${k}"]:not(.ved__clip--a)`).map(el => { const [a, b] = span(el); return { el, a, b }; }) };
    els.filter(e => e.classList.contains('ved__clip')).forEach((e, i) => e.style.setProperty('--i', i));
    const rnd = seed(k.charCodeAt(0) * 977), w = [];
    for (let i = 0; i < WN; i++) {
      const sec = (i + .5) / WN * T.d, beat = sec * T.bps % 1, env = Math.min(1, sec / .5, (T.d - sec) / 1.2);
      w.push(clamp(env * (.26 + .38 * rnd() + .4 * Math.max(0, 1 - beat * 3.5))));
    }
    T.wave = w;
    const svg = q(`.ved__clip--a[data-tab="${k}"] svg`);
    svg.setAttribute('viewBox', `0 0 ${WN * 4} 40`);
    svg.innerHTML = `<path vector-effect="non-scaling-stroke" d="${w.map((v, i) => `M${i * 4 + 2} ${r3(20 - v * 18)}V${r3(20 + v * 18)}`).join('')}"/>`;
  }
  // Keyframe diamonds on the motion graphics clips
  for (const el of qa('[data-kf]')) {
    const [s, e] = span(el);
    el.insertAdjacentHTML('afterbegin', el.dataset.kf.split(' ').map(v => `<i class="ved__kf" style="left:${r3(v / (e - s) * 100)}%"></i>`).join(''));
  }

  // Phones start square, it fills their preview best
  let tab = ved.dataset.cur, fmt = matchMedia('(max-width: 699px)').matches ? '11' : ved.dataset.fmt, t = 0, size = [0, 0], laneW = 0, lastTc = '';
  const render = () => {
    const E = G[tab], T = TABS[tab];
    for (const o of E.on) { const v = t >= o.a && t < o.b; if (v !== o.v) { o.v = v; o.el.classList.toggle('is-on', v); } }
    for (const o of E.k) {
      const v = val(o.kf, t), tr = `translate(${r3(v.x)}%,${r3(v.y)}%) rotate(${r3(v.r)}deg) scale(${r3(v.s * v.w)},${r3(v.s * v.h)})`, op = String(r3(v.o));
      if (tr !== o.tr) o.el.style.transform = o.tr = tr;
      if (op !== o.op) o.el.style.opacity = o.op = op;
    }
    for (const c of E.clips) { const v = t >= c.a && t < c.b; if (v !== c.v) { c.v = v; c.el.classList.toggle('is-live', v); } }
    ph.style.transform = `translateX(${r3(t / T.d * laneW)}px)`;
    const tc = tcode(Math.floor(t * 25));
    if (tc !== lastTc) tcEl.textContent = lastTc = tc;
    const a = motion ? T.wave[Math.min(WN - 1, Math.floor(t / T.d * WN))] : .5;
    vu[0].style.transform = `scaleY(${r3(.12 + a * .88)})`; vu[1].style.transform = `scaleY(${r3(.1 + a * .72)})`;
  };

  /* Formats: the frame gets its new size at once; with motion it is scaled back to the old size and eases
     to the new one, the picture inside scaled the other way so it never stretches */
  let flip = null, flashT = 0;
  const fit = f => {
    const pad = stage.clientWidth < 520 ? 14 : 24, sw = stage.clientWidth - pad * 2, sh = stage.clientHeight - pad * 2, [a, b] = FMT[f];
    let h = sh, w = h * a / b;
    if (w > sw) { w = sw; h = w * b / a; }
    return [Math.round(w), Math.round(h)];
  };
  const place = () => { size = fit(fmt); Object.assign(frame.style, { width: size[0] + 'px', height: size[1] + 'px', aspectRatio: 'auto' }); };
  const setFmt = (f, anim) => {
    const [ow, oh] = size, F = FMT[f];
    fmt = f; ved.dataset.fmt = f; place();
    for (const b of fmtBtns) { const on = b.dataset.vedFmt === f; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); }
    I.fmt.textContent = `${F[0]}:${F[1]} · ${F[2]}`; I.to.textContent = F[3]; glabel.textContent = `${F[0]}:${F[1]}`;
    if (anim && motion && ow) {
      flip = { sx: ow / size[0], sy: oh / size[1], t0: performance.now() };
      ved.classList.add('is-flash'); clearTimeout(flashT); flashT = setTimeout(() => ved.classList.remove('is-flash'), 800);
      kick();
    }
  };
  const doFlip = now => {
    const p = clamp((now - flip.t0) / 620);
    if (p >= 1) { frame.style.transform = pic.style.transform = ''; flip = null; return; }
    const e = back(p, 1.1), sx = flip.sx + (1 - flip.sx) * e, sy = flip.sy + (1 - flip.sy) * e;
    frame.style.transform = `scale(${r3(sx)},${r3(sy)})`; pic.style.transform = `scale(${r3(1 / sx)},${r3(1 / sy)})`;
  };

  /* Kinds of video: new preview, new clips, new ruler, from the start */
  let swapT = 0;
  const setTab = k => {
    const T = TABS[k];
    tab = k; ved.dataset.cur = k;
    for (const n in G) for (const el of G[n].els) el.classList.toggle('is-tab', n === k);
    for (const b of tabBtns) { const on = b.dataset.vedTab === k; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); }
    t = motion ? 0 : T.still;
    durEl.textContent = tcode(T.d * 25);
    ruler.style.setProperty('--n', T.d * 2);
    const st = T.d > 12 ? 3 : 2, ls = [];
    for (let s = 0; s < T.d; s += st) ls.push(`<span style="left:${r3(s / T.d * 100)}%">0:${two(s)}</span>`);
    nums.innerHTML = ls.join('');
    I.kind.textContent = T.kind; I.len.textContent = `0:${two(T.d)}`;
    [I.k1.textContent, I.v1.textContent] = T.x[0]; [I.k2.textContent, I.v2.textContent] = T.x[1];
    const text = () => { capH.textContent = T.h; capP.textContent = T.p; cap.classList.remove('is-swap'); };
    clearTimeout(swapT);
    if (motion) { cap.classList.add('is-swap'); swapT = setTimeout(text, 260); } else text();
    render();
  };

  /* Playback: runs while in view and not paused, loops */
  let playing = motion, inView = false, raf = 0, last = 0, drag = false, scrubbed = false;
  const seen = new Set(), step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: 'video', step: n }); } };
  const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(loop); } };
  const loop = now => {
    raf = 0;
    const run = playing && inView && !drag && motion;
    if (run) {
      step(1);
      const T = TABS[tab];
      if (last) t += Math.min(.1, (now - last) / 1000);
      if (t >= T.d / 2) step(2);
      if (t >= T.d) { t %= T.d; step(3); }
      last = now;
    }
    if (flip) doFlip(now);
    render();
    if (run || flip) raf = requestAnimationFrame(loop);
  };

  for (const b of tabBtns) b.addEventListener('click', () => { const k = b.dataset.vedTab; if (k !== tab) { setTab(k); act('tab-' + TABS[k].id); kick(); } });
  for (const b of fmtBtns) b.addEventListener('click', () => { const f = b.dataset.vedFmt; if (f !== fmt) { setFmt(f, true); render(); act('fmt-' + FMT[f].slice(0, 2).join('x')); } });
  playBtn.addEventListener('click', () => {
    playing = !playing;
    ved.classList.toggle('is-paused', !playing);
    playBtn.setAttribute('aria-label', playing ? 'Sæt videoen på pause' : 'Afspil videoen');
    act(playing ? 'play' : 'pause');
    if (playing) kick();
  });

  // Scrub: click or drag along the timeline (on touch only a sideways drag or a tap, so the page still scrolls)
  const seek = e => { const r = lanes.getBoundingClientRect(); t = clamp((e.clientX - r.left) / r.width, 0, .999) * TABS[tab].d; render(); };
  lanes.addEventListener('pointerdown', e => {
    if (e.button) return;
    drag = true; lanes.setPointerCapture(e.pointerId);
    if (e.pointerType !== 'touch') seek(e);
    if (!scrubbed) { scrubbed = true; act('scrub'); }
  });
  lanes.addEventListener('pointermove', e => { if (drag) seek(e); });
  lanes.addEventListener('pointerup', e => { if (!drag) return; if (e.pointerType === 'touch') seek(e); drag = false; kick(); });
  lanes.addEventListener('pointercancel', () => { drag = false; kick(); });

  let mq = 0;
  const measure = () => { mq = 0; laneW = lanes.clientWidth; place(); render(); };
  const ro = new ResizeObserver(() => { if (!mq) mq = requestAnimationFrame(measure); });
  ro.observe(stage); ro.observe(lanes);

  setFmt(fmt, false); setTab(tab); measure();
  new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { ved.classList.add('is-near'); o.disconnect(); } }, { rootMargin: '600px 0px' }).observe(ved);
  new IntersectionObserver(es => { inView = es[es.length - 1].intersectionRatio >= .2; if (inView) kick(); }, { threshold: [0, .2, .5] }).observe(ved);
}
