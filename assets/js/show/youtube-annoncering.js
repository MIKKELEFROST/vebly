// Showcase: YouTube-annoncering, "Spring over om 5" (scripts/services/showcase/youtube-annoncering.html). Our commercial
// for Nuttet Baby plays as an ad in a video page of our own drawing, with the countdown to "Spring over". Under it the
// storyboard: as each second passes, that second's frame is drawn from the video into its cell. Modes: Før videoen
// (skip after 5 s, ends in the video they came for), Shorts (vertical, the down arrow swipes on at any time), Bumper
// (6 s, no skip). Plays while in view. No motion: nothing plays by itself; the moment the skip button appears, with
// the five frames taken from a copy of the video that plays out of sight; play on a tap.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--youtube-annoncering');
if (root) init(root);

function init(root) {
  const q = s => root.querySelector(s), qa = s => [...root.querySelectorAll(s)], $ = n => q(`[data-yt-${n}]`);
  const motion = document.documentElement.classList.contains('motion');
  const yt = q('[data-yt]'), list = $('cells'), cells = qa('.yt__cell');
  const cv = cells.map(c => c.querySelector('canvas')), cts = cells.map(c => c.querySelector('.yt__ct'));
  const E = {}; for (const n of ['note', 'q', 'left', 'cd', 'prog', 'time', 'sbt', 'sum', 'flag', 'nowt', 'now', 'title', 'chan', 'subs', 'cav', 'ht', 'hch']) E[n] = $(n);
  const skipBtn = $('skip'), playBtn = $('play'), sndBtn = $('snd'), nextBtn = $('next'), prevBtn = $('prev'), modeBtns = qa('[data-yt-mode]');
  const act = a => track('showcase_interact', { showcase: 'youtube-annoncering', action: a });
  const seen = new Set(), step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: 'youtube-annoncering', step: n }); } };
  // d: length of the ad here, n: storyboard frames, skip: seconds before the skip button (0 at once, -1 never)
  // fy: which part of a tall frame goes into a wide cell; host: title, channel, subscribers, letter, length, short title
  const M = {
    for: { id: 'foer', d: 25, n: 5, skip: 5, fy: .5, q: 'lege til regnvejrsdage', note: 'Før og under videoer. Kan springes over efter 5 sekunder.',
      sbt: 'De første fem sekunder', flag: 'Spring over', sum: 'Før de kan springe over, har de set dragten, legen og spændingen.',
      caps: ['Tigerdragten fra første billede', 'En leg, alle kender', 'Hvor skal han hen?', 'Ind under tæppet', 'Hvad gemmer sig?'],
      host: ['12 lege til regnvejrsdage, der ikke kræver noget', 'Legetid med Liv', '48.000 abonnenter', 'L', 684, '12 lege til regnvejrsdage'] },
    shorts: { id: 'shorts', d: 15, n: 5, skip: 0, fy: .5, q: 'sjove børn', note: 'Lodret, mellem Shorts. Kan swipes væk med det samme.',
      sbt: 'De første fem sekunder', flag: 'Swipe væk', sum: 'Ingen nedtælling i Shorts. Det første sekund skal fange.',
      caps: ['Et ansigt, der ser på dig', 'Psst, en hemmelighed', 'Et smil, og så …', 'Kameraet vender', 'Løven og tigeren'] },
    bumper: { id: 'bumper', d: 6, n: 6, skip: -1, fy: .5, q: 'godnathistorier', note: 'Seks sekunder. Kan ikke springes over.',
      sbt: 'Hele annoncen på seks sekunder', flag: 'Slut', sum: 'Seks sekunder og ét budskab. Alle ser det hele.',
      caps: ['Fem børn, fem dragter', 'Produktet i midten', 'Leg i stuen', 'Stuen bliver …', '… til en savanne', 'Slut. Ingen sprang over'],
      host: ['Godnathistorie: Tigeren, der ikke ville sove', 'Historier til sengetid', '21.000 abonnenter', 'H', 468, 'Tigeren, der ikke ville sove'] }
  };
  for (const k in M) { const v = M[k].v = q(`[data-yt-v="${k}"]`); v.muted = true; }
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  let mode = 'for', phase = 'ad', t = 0, reach = 0, playing = motion, inView = false, near = false, sound = false;
  let hostT = 0, raf = 0, last = 0, lastCd = -1, canSkip = null, tipT = 0, gen = 0, swapT = 0;
  const cur = () => M[mode];

  /* A frame of the video, cropped to cover the 16:9 cell */
  const grab = (i, src, hold) => {
    const c = cv[i], vw = src.videoWidth, vh = src.videoHeight;
    if (!vw) return;
    const W = c.width, H = c.height, s = Math.max(W / vw, H / vh), sw = W / s, sh = H / s;
    try { c.getContext('2d').drawImage(src, (vw - sw) / 2, (vh - sh) * cur().fy, sw, sh, 0, 0, W, H); cells[i].shot = 1; if (!hold) cells[i].classList.add('is-shot'); } catch (e) { /* the poster stays */ }
  };
  const setCell = (c, st) => { if (c.st !== st) { c.st = st; c.classList.toggle('is-act', st === 1); c.classList.toggle('is-done', st === 2); } };

  const render = () => {
    const m = cur();
    if (phase === 'ad') {
      reach = Math.max(reach, t);
      E.prog.style.transform = `scaleX(${(t / m.d).toFixed(4)})`;
      E.left.textContent = fmt(Math.max(1, Math.ceil(m.d - t - .01)));
      E.time.textContent = `${fmt(t)} / ${fmt(m.d)}`;
      if (m.skip > 0) {
        const r = Math.ceil(m.skip - t - .001), can = r <= 0;
        if (!can && r !== lastCd) { lastCd = r; E.cd.textContent = r; if (motion) { E.cd.classList.remove('is-flip'); void E.cd.offsetWidth; E.cd.classList.add('is-flip'); } }
        if (can !== canSkip) {
          canSkip = can; yt.classList.toggle('is-skip', can); skipBtn.disabled = !can;
          if (can) { step(2); if (motion && playing) { yt.classList.add('is-tip'); clearTimeout(tipT); tipT = setTimeout(() => yt.classList.remove('is-tip'), 2800); } }
        }
      }
      const v = m.v, ok = !v.paused && !v.seeking && v.readyState >= 2;
      for (let i = 0; i < m.n; i++) {
        const c = cells[i];
        if (!c.shot && ok && t >= i + .45 && t < i + 1) grab(i, v);
        setCell(c, reach >= i + 1 ? 2 : t >= i && t < i + 1 ? 1 : 0);
        if (c.st === 1) c.style.setProperty('--f', (t - i).toFixed(3));
      }
      const k = Math.min(m.n - 1, Math.floor(t));
      E.nowt.textContent = fmt(k + 1); E.now.textContent = m.caps[k];
    } else {
      const len = m.host ? m.host[4] : 30;
      E.prog.style.transform = `scaleX(${Math.min(1, hostT / len).toFixed(4)})`;
      if (m.host) E.time.textContent = `${fmt(hostT)} / ${fmt(len)}`;
    }
    yt.classList.toggle('is-sum', reach >= m.n || phase === 'host');
    yt.classList.toggle('is-flag', m.skip === 0 || reach >= (m.skip > 0 ? m.skip : m.n));
  };

  /* The ad is over: skipped, swiped or played to the end */
  const endAd = how => {
    if (phase !== 'ad') return;
    const m = cur();
    phase = yt.dataset.phase = 'host'; hostT = 0;
    yt.classList.remove('is-tip');
    for (const c of cells) if (c.st === 1) setCell(c, c.shot ? 2 : 0);
    if (mode === 'shorts' && reach < m.n) E.sum.textContent = `Swipet væk ${reach < .3 ? 'med det samme' : `efter ${reach.toFixed(1).replace('.', ',')} sek`}. Derfor skal det første sekund sidde.`;
    setTimeout(() => { if (phase === 'host') m.v.pause(); }, mode === 'shorts' ? 650 : 0);
    nextBtn.disabled = true; prevBtn.disabled = false;
    step(3); render(); kick();
    if (how !== 'end') q('[data-yt-again]').focus({ preventScroll: true });
  };

  /* From the start of the ad */
  const clear = () => { for (const c of cells) { c.shot = 0; c.classList.remove('is-shot'); setCell(c, 0); c.style.setProperty('--f', 0); } for (const c of cv) c.getContext('2d').clearRect(0, 0, c.width, c.height); };
  const begin = () => {
    gen++;
    const m = cur();
    phase = yt.dataset.phase = 'ad'; t = reach = 0; lastCd = -1; canSkip = null;
    E.sum.textContent = m.sum; nextBtn.disabled = false; prevBtn.disabled = true;
    clear();
    if (m.v.readyState >= 1) m.v.currentTime = 0;
    sync(); render();
  };
  // No motion: the moment the skip button appears (or the end), the frames taken from a copy of the video
  const still = () => {
    const m = cur();
    gen++; phase = yt.dataset.phase = 'ad'; reach = m.n; t = m.n >= m.d ? m.d - .01 : m.n; lastCd = -1; canSkip = null;
    E.sum.textContent = m.sum; nextBtn.disabled = false; prevBtn.disabled = true;
    clear(); render();
    if (near) fill();
  };
  // (a paused, seeked video does not hand its new frame to a canvas everywhere, so the copy plays fast, unseen)
  const fill = () => {
    const m = cur(), tok = gen, o = document.createElement('video');
    let i = 0, rf = 0;
    const stop = () => { cancelAnimationFrame(rf); o.pause(); o.removeAttribute('src'); o.load(); };
    const tick = () => {
      if (tok !== gen) return stop();
      while (i < m.n && o.currentTime >= i + .5) grab(i++, o, 1);
      if (i < m.n && !o.ended) { rf = requestAnimationFrame(tick); return; }
      stop(); for (const c of cells) if (c.shot) c.classList.add('is-shot');
    };
    o.muted = true; o.playsInline = true; o.preload = 'auto'; o.src = m.v.getAttribute('src'); o.playbackRate = 4;
    o.play().then(() => { o.playbackRate = 4; rf = requestAnimationFrame(tick); }, stop);
  };

  /* Playback: the ad plays while the player is in view and not paused */
  const sync = () => {
    const v = cur().v, run = playing && inView;
    if (phase === 'ad' && run) {
      if (v.paused) {
        if (v.preload === 'none') v.preload = 'auto';
        const p = v.play();
        if (p) p.catch(() => { if (!v.muted) { v.muted = true; sound = false; paintSnd(); v.play().catch(() => {}); } });
      }
    } else if (phase === 'ad' && !v.paused) v.pause();
    yt.classList.toggle('is-paused', !playing);
    playBtn.setAttribute('aria-label', playing ? 'Sæt på pause' : 'Afspil');
    kick();
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const loop = now => {
    raf = 0;
    const m = cur(), v = m.v, run = playing && inView, dt = last ? Math.min(.1, (now - last) / 1000) : 0;
    last = now;
    if (phase === 'ad') {
      if (!v.paused && v.readyState >= 1) {
        t = Math.min(v.currentTime, m.d);
        if (t > .05) step(1);
        if (m.skip < 0 && t >= m.d - .02) { t = m.d; render(); endAd('end'); }
      }
    } else if (run) hostT += dt;
    render();
    if (run && !(phase === 'ad' && v.paused && v.readyState >= 2)) raf = requestAnimationFrame(loop); else last = 0;
  };
  for (const k in M) {
    const v = M[k].v;
    v.addEventListener('playing', () => { if (k === mode) kick(); });
    v.addEventListener('seeked', () => { if (k === mode) kick(); });
    v.addEventListener('ended', () => { if (k === mode) { t = M[k].d; render(); endAd('end'); } });
  }

  /* Modes */
  const setMode = k => {
    const old = cur(), m = M[k];
    old.v.pause();
    mode = yt.dataset.mode = k;
    for (const b of modeBtns) { const on = b.dataset.ytMode === k; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); }
    list.style.setProperty('--n', m.n); list.dataset.at = m.skip === 0 ? 0 : 1;
    list.style.setProperty('--pst', `url("${m.v.getAttribute('poster')}")`);
    cells.forEach((c, i) => { c.hidden = i >= m.n; if (cts[i] && m.caps[i]) cts[i].textContent = m.caps[i]; });
    E.sbt.textContent = m.sbt; E.flag.textContent = m.flag; E.q.textContent = m.q;
    if (m.host) {
      const [ti, ch, su, av, , sh] = m.host;
      E.title.textContent = ti; E.chan.textContent = E.hch.textContent = ch; E.subs.textContent = su; E.cav.textContent = av; E.ht.textContent = sh;
    }
    const note = () => { E.note.textContent = m.note; yt.classList.remove('is-swap'); };
    clearTimeout(swapT);
    if (motion) { yt.classList.add('is-swap'); swapT = setTimeout(note, 220); } else note();
    m.v.muted = !sound;
    if (motion || playing) begin(); else still();
  };

  for (const b of modeBtns) b.addEventListener('click', () => { const k = b.dataset.ytMode; if (k !== mode) { setMode(k); act('mode-' + M[k].id); } });
  skipBtn.addEventListener('click', () => { act('skip'); endAd('skip'); });
  nextBtn.addEventListener('click', () => { act('swipe'); endAd('swipe'); });
  const again = () => { playing = true; begin(); };
  prevBtn.addEventListener('click', () => { act('swipe-back'); again(); });
  q('[data-yt-again]').addEventListener('click', () => { act('replay'); again(); });
  playBtn.addEventListener('click', () => {
    playing = !playing; act(playing ? 'play' : 'pause');
    if (playing && phase === 'ad' && !motion && reach >= cur().n && t >= cur().n - .02) begin(); else sync();
  });
  const paintSnd = () => { sndBtn.setAttribute('aria-pressed', sound); yt.classList.toggle('is-sound', sound); };
  sndBtn.addEventListener('click', () => {
    sound = !sound; paintSnd(); cur().v.muted = !sound; act(sound ? 'sound-on' : 'sound-off');
    if (sound && !playing) { playing = true; sync(); }
  });

  setMode('for');
  new IntersectionObserver((es, o) => { if (es.some(e => e.isIntersecting)) { o.disconnect(); near = true; if (!motion && !playing) fill(); } }, { rootMargin: '400px 0px' }).observe(yt);
  new IntersectionObserver(es => { inView = es[es.length - 1].intersectionRatio >= .3; sync(); }, { threshold: [0, .3, .6] }).observe(q('.yt__area'));
}
