// Showcase: Video, "Klippebordet" (scripts/services/showcase/video.html). The preview plays three real videos we made
// above a timeline with video, text and sound tracks. Everything follows the video's currentTime: playhead, live
// clips, titles (data-k keyframes, data-on times), waveform and VU meter. The format chips reframe the video: a crop
// window over the dimmed full frame that follows the subject (focus keyframes per video). The timeline can be
// scrubbed, the sound turned on. Clip thumbnails are taken from the video itself as the playhead passes.
// No motion: nothing plays by itself; the poster and a still of the titles, formats switch at once, play on a tap.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--video');
if (root) init(root);

function init(root) {
  const q = s => root.querySelector(s), qa = (s, r = root) => [...r.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const ved = q('[data-ved]'), stage = q('[data-ved-stage]'), win = q('[data-ved-win]');
  const lanes = q('[data-ved-lanes]'), ruler = q('[data-ved-ruler]'), nums = q('[data-ved-nums]'), ph = q('[data-ved-ph]');
  const playBtn = q('[data-ved-play]'), sndBtn = q('[data-ved-snd]'), tcEl = q('[data-ved-tc]'), durEl = q('[data-ved-dur]');
  const glabel = q('[data-ved-glabel]'), gcrop = q('[data-ved-gcrop]'), fileEl = q('[data-ved-file]');
  const cap = q('.ved-cap'), capH = q('[data-ved-caph]'), capP = q('[data-ved-cap]'), vu = qa('[data-ved-vu]');
  const tabBtns = qa('[data-ved-tab]'), fmtBtns = qa('[data-ved-fmt]');
  const I = Object.fromEntries(qa('[data-ved-i]').map(e => [e.dataset.vedI, e]));
  const act = a => track('showcase_interact', { showcase: 'video', action: a });
  // fx/fy: where the subject is in the video (0..1), as [sek, x] keyframes; two keyframes close together make a cut
  const TABS = {
    r: { d: 30, still: 1.6, ar: 16 / 9, id: 'reklame', file: 'Nuttet Baby · Reklamefilm', kunde: 'Nuttet Baby', x: ['Klip', '8 scener'], crop: 'Følger børnene', snd: 1,
      fx: [[0, .3], [2.99, .62], [3, .5], [6.16, .62], [6.17, .36], [9.79, .5], [9.8, .32], [11.8, .6], [13.86, .6], [13.87, .4], [18.02, .56], [18.03, .3], [21.92, .42], [21.93, .45], [24.8, .45], [26.09, .38], [26.1, .38], [30, .56]], fy: .55,
      h: 'En reklamefilm, der fanger.', p: 'Reklamefilmen, vi lavede til Nuttet Baby. Teksten ligger på sit eget spor, og udsnittet følger børnene, når du skifter format.' },
    e: { d: 20, still: 2.4, ar: 9 / 16, id: 'explainer', file: 'Webleads · Annonce', kunde: 'Webleads', x: ['Optagelse', 'Én tagning'], crop: 'Tæt på', snd: 1, fx: .5, fy: .36,
      h: 'Forklaret på 20 sekunder.', p: 'Vores egen annonce. En person, der taler direkte til kameraet, og korte linjer med ikoner, der viser, hvordan det foregår.' },
    m: { d: 10, still: 8.6, ar: 16 / 9, id: 'motion', file: 'GoBlender · Produktfilm', kunde: 'GoBlender', x: ['3D', 'Frugt, is og vand'], crop: 'Følger produktet', snd: 0,
      fx: [[0, .3], [.69, .36], [.7, .5], [1.76, .5], [1.77, .45], [3.49, .5], [3.5, .55], [4.89, .55], [4.9, .42], [6.09, .5], [6.1, .62], [7.39, .64], [7.4, .62], [10, .62]], fy: .5,
      h: 'Frugt, is og bevægelse i 3D.', p: 'Produktfilmen til GoBlender, lavet til toppen af en hjemmeside. Tekst og grafik er sat på sekund for sekund.' }
  };
  const FMT = { 916: [9, 16, '1080 × 1920', 'Reels, Stories og TikTok'], 11: [1, 1, '1080 × 1080', 'Feedet på Facebook og Instagram'], 169: [16, 9, '1920 × 1080', 'YouTube og din hjemmeside'] };
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), r3 = v => Math.round(v * 1000) / 1000;
  const back = (t, c = 1.7) => 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
  const EASE = { o: t => 1 - (1 - t) ** 3, l: t => t, i: t => t < .5 ? 4 * t ** 3 : 1 - (2 - 2 * t) ** 3 / 2, b: t => back(t) };
  const two = n => String(n).padStart(2, '0'), tcode = fr => `00:${two(Math.floor(fr / 1800))}:${two(Math.floor(fr / 30) % 60)}:${two(fr % 30)}`;
  const lerpK = (k, t) => { if (typeof k === 'number') return k; if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t < k[i][0]) { const [a, va] = k[i - 1], [b, vb] = k[i]; return va + (vb - va) * (t - a) / (b - a); } return k[k.length - 1][1]; };

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

  /* Per video: its element, titles, clips and the waveform of its real sound (data-wave, 0-z per bin) */
  const G = {};
  for (const k in TABS) {
    const T = TABS[k], g = q(`.vs[data-tab="${k}"]`), els = qa(`[data-tab="${k}"]`);
    T.v = q(`video[data-tab="${k}"]`);
    T.v.muted = true;
    G[k] = { els, k: qa('[data-k]', g).map(el => ({ el, kf: parse(el.dataset.k) })),
      on: qa('[data-on]', g).map(el => { const [a, b] = el.dataset.on.split(' ').map(Number); return { el, a, b }; }),
      clips: qa(`.ved__lane .ved__clip[data-tab="${k}"]:not(.ved__clip--a)`).map(el => { const [a, b] = span(el); return { el, a, b, cap: a + Math.min(1.6, (b - a) * .5), shot: el.classList.contains('ved__clip--p') ? 0 : 1 }; }) };
    els.filter(e => e.classList.contains('ved__clip')).forEach((e, i) => e.style.setProperty('--i', i));
    const ac = q(`.ved__clip--a[data-tab="${k}"]`);
    T.ac = ac;
    if (ac.dataset.wave) {
      const w = [...ac.dataset.wave].map(c => parseInt(c, 36) / 35), n = w.length;
      T.wave = w;
      const d = w.map((v, i) => `M${i * 4 + 2} ${r3(20 - Math.max(.06, v) * 18)}V${r3(20 + Math.max(.06, v) * 18)}`).join('');
      for (const svg of qa('svg', ac)) { svg.setAttribute('viewBox', `0 0 ${n * 4} 40`); svg.innerHTML = `<path vector-effect="non-scaling-stroke" d="${d}"/>`; }
    }
  }
  // Keyframe diamonds on the motion graphics titles
  for (const el of qa('[data-kf]')) {
    const [s, e] = span(el);
    el.insertAdjacentHTML('afterbegin', el.dataset.kf.split(' ').map(v => `<i class="ved__kf" style="left:${r3(v / (e - s) * 100)}%"></i>`).join(''));
  }

  // Phones start square, it fills their preview best
  let tab = ved.dataset.cur, fmt = matchMedia('(max-width: 699px)').matches ? '11' : ved.dataset.fmt;
  let t = motion ? 0 : TABS[tab].still, laneW = 0, lastTc = '', sound = false, pend = false;
  const cur = () => TABS[tab];

  /* Reframing: the window has the format's shape and fits the stage; the video covers it. Along an axis where the
     whole video fits, it stays centred and the window moves over it; where it does not, the window stays centred
     and the video moves behind it. Either way the subject (fx, fy) is kept inside the window. */
  const axis = (S, wl, bl, f) => {
    if (bl <= S + .5) { const b = (S - bl) / 2; return [b + clamp(f * bl - wl / 2, 0, bl - wl), b]; }
    const w = (S - wl) / 2; return [w, clamp(w + wl / 2 - f * bl, w + wl - bl, w)];
  };
  const layout = (f, T, at) => {
    const sw = stage.clientWidth, sh = stage.clientHeight, pad = sw < 520 ? 14 : 24, [a, b] = FMT[f], ar = a / b;
    let wh = sh - pad * 2, ww = wh * ar;
    if (ww > sw - pad * 2) { ww = sw - pad * 2; wh = ww / ar; }
    const [bw, bh] = T.ar >= ar ? [wh * T.ar, wh] : [ww, ww / T.ar];
    const [wx, bx] = axis(sw, ww, bw, lerpK(T.fx, at)), [wy, by] = axis(sh, wh, bh, lerpK(T.fy, at));
    return [wx, wy, ww, wh, bx, by, bw, bh];
  };
  let tween = null, flashT = 0;
  const lastL = {};
  const place = now => {
    const T = cur();
    let L = layout(fmt, T, t);
    if (tween) {
      const p = clamp((now - tween.t0) / 640);
      if (p >= 1) tween = null;
      else { const e = back(p, 1.2); L = L.map((v, i) => tween.from[i] + (v - tween.from[i]) * e); }
    }
    L = L.map(v => Math.round(v * 10) / 10);
    const key = L.join();
    if (key === lastL.key) return;
    lastL.key = key; lastL.L = L;
    Object.assign(win.style, { transform: `translate(${L[0]}px,${L[1]}px)`, width: L[2] + 'px', height: L[3] + 'px' });
    Object.assign(T.v.style, { transform: `translate(${L[4]}px,${L[5]}px)`, width: L[6] + 'px', height: L[7] + 'px' });
  };

  const render = (now = performance.now()) => {
    const E = G[tab], T = cur();
    for (const o of E.on) { const v = t >= o.a && t < o.b; if (v !== o.v) { o.v = v; o.el.classList.toggle('is-on', v); } }
    for (const o of E.k) {
      const v = val(o.kf, t), tr = `translate(${r3(v.x)}%,${r3(v.y)}%) rotate(${r3(v.r)}deg) scale(${r3(v.s * v.w)},${r3(v.s * v.h)})`, op = String(r3(v.o));
      if (tr !== o.tr) o.el.style.transform = o.tr = tr;
      if (op !== o.op) o.el.style.opacity = o.op = op;
    }
    for (const c of E.clips) {
      const v = t >= c.a && t < c.b; if (v !== c.v) { c.v = v; c.el.classList.toggle('is-live', v); }
      if (!c.shot && v && t >= c.cap && playingNow()) shoot(c, T.v);
    }
    ph.style.transform = `translateX(${r3(t / T.d * laneW)}px)`;
    T.ac.style.setProperty('--p', r3(t / T.d));
    const tc = tcode(Math.floor(t * 30));
    if (tc !== lastTc) tcEl.textContent = lastTc = tc;
    const a = T.wave && playingNow() ? T.wave[Math.min(T.wave.length - 1, Math.floor(t / T.d * T.wave.length))] : .05;
    vu[0].style.transform = `scaleY(${r3(.1 + a * .9)})`; vu[1].style.transform = `scaleY(${r3(.08 + a * .74)})`;
    place(now);
  };

  /* Thumbnails: when the playhead is well into a clip, its frame becomes the clip's filmstrip */
  const cv = document.createElement('canvas');
  const shoot = (c, v) => {
    c.shot = 1;
    try {
      const h = 84, w = Math.round(h * v.videoWidth / v.videoHeight);
      cv.width = w; cv.height = h;
      cv.getContext('2d').drawImage(v, 0, 0, w, h);
      c.el.style.backgroundImage = `url(${cv.toDataURL('image/jpeg', .72)})`;
      c.el.classList.add('is-shot');
    } catch (e) { /* the poster stays */ }
  };

  /* Formats: the window and the video glide to their new places (with motion) */
  const setFmt = (f, anim) => {
    const F = FMT[f];
    if (anim && motion && lastL.L) { tween = { from: lastL.L.slice(), t0: performance.now() }; }
    fmt = f; ved.dataset.fmt = f;
    for (const b of fmtBtns) { const on = b.dataset.vedFmt === f; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); }
    I.fmt.textContent = `${F[0]}:${F[1]} · ${F[2]}`; I.to.textContent = F[3]; glabel.textContent = `${F[0]}:${F[1]}`;
    cropLabel();
    if (anim) { ved.classList.add('is-flash'); clearTimeout(flashT); flashT = setTimeout(() => ved.classList.remove('is-flash'), 900); }
    kick();
  };
  const cropLabel = () => { const T = cur(), [a, b] = FMT[fmt], native = Math.abs(a / b - T.ar) < .01; I.crop.textContent = native ? 'Hele billedet' : T.crop; gcrop.textContent = native ? '' : T.crop; ved.classList.toggle('is-crop', !native); };

  /* Kinds of video: new video, new clips, new ruler, from the start */
  let swapT = 0;
  const setTab = (k, first) => {
    const old = cur(), T = TABS[k];
    if (!first && old.v !== T.v) { old.v.pause(); old.v.muted = true; }
    tab = k; ved.dataset.cur = k;
    for (const n in G) for (const el of G[n].els) el.classList.toggle('is-tab', n === k);
    for (const b of tabBtns) { const on = b.dataset.vedTab === k; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); }
    t = motion ? 0 : T.still; pend = false;
    if (T.v.readyState >= 1 && motion) T.v.currentTime = 0;
    T.v.muted = !sound || !T.snd;
    sndBtn.disabled = !T.snd;
    sndBtn.setAttribute('aria-label', T.snd ? 'Lyd' : 'Lyd (filmen har ingen lyd)');
    durEl.textContent = tcode(T.d * 30);
    ruler.style.setProperty('--n', T.d * 2);
    const st = T.d > 20 ? 5 : T.d > 10 ? 4 : 2, ls = [];
    for (let s = 0; s < T.d; s += st) ls.push(`<span style="left:${r3(s / T.d * 100)}%">0:${two(s)}</span>`);
    nums.innerHTML = ls.join('');
    fileEl.textContent = T.file; I.kunde.textContent = T.kunde; I.len.textContent = `0:${two(T.d)}`;
    [I.k1.textContent, I.v1.textContent] = T.x;
    cropLabel();
    const text = () => { capH.textContent = T.h; capP.textContent = T.p; cap.classList.remove('is-swap'); };
    clearTimeout(swapT);
    if (motion && !first) { cap.classList.add('is-swap'); swapT = setTimeout(text, 260); } else text();
    lastL.key = '';
    sync(); render();
  };

  /* Playback: the active video plays while the editor is in view and not paused; the timeline reads its time */
  let playing = motion, inView = false, raf = 0, drag = false, scrubbed = false, lastT = 0;
  const seen = new Set(), step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: 'video', step: n }); } };
  const playingNow = () => { const v = cur().v; return !v.paused && !v.seeking && v.readyState >= 2; };
  const sync = () => {
    const v = cur().v, run = playing && inView && !drag;
    if (run && v.paused) {
      if (v.preload === 'none') v.preload = 'auto';
      const p = v.play();
      if (p) p.catch(() => { if (!v.muted) { v.muted = true; sound = false; paintSnd(); v.play().catch(() => {}); } });
    } else if (!run && !v.paused) v.pause();
    ved.classList.toggle('is-paused', !playing);
    playBtn.setAttribute('aria-label', playing ? 'Sæt videoen på pause' : 'Afspil videoen');
    kick();
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const loop = now => {
    raf = 0;
    const T = cur(), v = T.v, live = !v.paused;
    if (live && !drag && !pend && v.readyState >= 1) {
      t = Math.min(v.currentTime, T.d);
      if (t >= T.d / 2) step(2);
      if (t < lastT - 1) step(3);
      lastT = t;
    }
    render(now);
    if (live || tween || drag) raf = requestAnimationFrame(loop);
  };
  for (const k in TABS) {
    const v = TABS[k].v;
    v.addEventListener('playing', () => { if (k === tab) { step(1); kick(); } });
    v.addEventListener('loadedmetadata', () => { if (k === tab && pend) { pend = false; v.currentTime = t; } });
    for (const ev of ['seeked', 'loadeddata', 'pause']) v.addEventListener(ev, () => { if (k === tab) kick(); });
  }

  for (const b of tabBtns) b.addEventListener('click', () => { const k = b.dataset.vedTab; if (k !== tab) { setTab(k); act('tab-' + TABS[k].id); } });
  for (const b of fmtBtns) b.addEventListener('click', () => { const f = b.dataset.vedFmt; if (f !== fmt) { setFmt(f, true); act('fmt-' + FMT[f].slice(0, 2).join('x')); } });
  playBtn.addEventListener('click', () => { playing = !playing; act(playing ? 'play' : 'pause'); sync(); });
  const paintSnd = () => { sndBtn.setAttribute('aria-pressed', sound); ved.classList.toggle('is-sound', sound); };
  sndBtn.addEventListener('click', () => {
    sound = !sound; paintSnd();
    const T = cur(); T.v.muted = !sound || !T.snd;
    if (sound && !playing) { playing = true; sync(); }
    act(sound ? 'sound-on' : 'sound-off');
  });

  // Scrub: click or drag along the timeline (on touch only a sideways drag or a tap, so the page still scrolls)
  const seek = e => {
    const r = lanes.getBoundingClientRect(), T = cur(), v = T.v;
    t = clamp((e.clientX - r.left) / r.width, 0, .999) * T.d; lastT = t;
    if (v.readyState >= 1) v.currentTime = t;
    else { pend = true; if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); } }
    render();
  };
  lanes.addEventListener('pointerdown', e => {
    if (e.button) return;
    drag = true; lanes.setPointerCapture(e.pointerId); sync();
    if (e.pointerType !== 'touch') seek(e);
    if (!scrubbed) { scrubbed = true; act('scrub'); }
  });
  lanes.addEventListener('pointermove', e => { if (drag) seek(e); });
  lanes.addEventListener('pointerup', e => { if (!drag) return; if (e.pointerType === 'touch') seek(e); drag = false; sync(); });
  lanes.addEventListener('pointercancel', () => { drag = false; sync(); });

  let mq = 0;
  const measure = () => { mq = 0; laneW = lanes.clientWidth; lastL.key = ''; render(); };
  const ro = new ResizeObserver(() => { if (!mq) mq = requestAnimationFrame(measure); });
  ro.observe(stage); ro.observe(lanes);

  setFmt(fmt, false); setTab(tab, true); measure();
  // Posters as filmstrips until the clips get their own frames
  new IntersectionObserver((es, o) => {
    if (!es.some(e => e.isIntersecting)) return;
    o.disconnect();
    for (const k in G) for (const c of G[k].clips) if (!c.shot) c.el.style.backgroundImage = `url(${TABS[k].v.poster})`;
  }, { rootMargin: '600px 0px' }).observe(ved);
  new IntersectionObserver(es => { inView = es[es.length - 1].intersectionRatio >= .25; sync(); }, { threshold: [0, .25, .5] }).observe(ved);
}
