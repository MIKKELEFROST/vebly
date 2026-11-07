// Branding showcase (/services/branding): a brand board for Kvist, a made-up landscaper in Roskilde. When the board comes
// into view the logo draws itself (pencil sketch with construction lines, then the clean outlines, the fill, the
// wordmark letter by letter and the tagline), the colour chips rise and the type specimen appears. "Skitse", "Logo" and
// "Frizone" show the logo's stages, "Tegn igen" replays the drawing. Under it, tabs put the brand on a business card, a
// van, an Instagram profile and a website (our own SVG drawings); they step through once by themselves when the tile
// comes into view. The four round buttons swap the whole palette at once. Without motion everything is in place at once.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--branding');
if (root) {
  try { init(root); } catch (e) { root.querySelector('[data-bb-logo]')?.classList.add('is-sk', 'is-ln', 'is-fill', 'is-wm', 'is-tag'); throw e; }
}

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const S = 'branding';
  const ev = action => track('showcase_interact', { showcase: S, action });
  const seen = new Set();
  const step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: S, step: n }); } };

  const bb = $('[data-bb]'), logo = $('[data-bb-logo]'), st = $('[data-bb-st]');

  /* ---------------- Palettes ---------------- */
  const P = [
    ['Skov', ['Mos', '#1F3D2B'], ['Salvie', '#8FAE8B'], ['Havre', '#F1E8D6'], ['Ler', '#D0683F']],
    ['Fjord', ['Fjord', '#16324F'], ['Dis', '#9CC0D6'], ['Sand', '#F3ECE0'], ['Koral', '#E36F55']],
    ['Lyng', ['Lyng', '#3A2240'], ['Syren', '#B79AC8'], ['Rosa', '#F6E7E4'], ['Honning', '#E0A630']],
    ['Kul', ['Kul', '#22231F'], ['Oliven', '#8A9562'], ['Kalk', '#F2EFE7'], ['Gul', '#E9C23A']]
  ];
  const pbs = $$('[data-bb-pal]'), names = $$('[data-bb-sn]'), hexes = $$('[data-bb-sh]'), pn = $('[data-bb-pn]');
  let pal = 0;
  const setPal = i => {
    pal = i;
    const [n, ...c] = P[i];
    c.forEach(([nm, hex], j) => { bb.style.setProperty(`--b${j + 1}`, hex); names[j].textContent = nm; hexes[j].textContent = hex; });
    pn.textContent = n;
    pbs.forEach((b, j) => { b.classList.toggle('is-on', j === i); b.setAttribute('aria-pressed', String(j === i)); });
  };
  pbs.forEach((b, i) => b.addEventListener('click', () => {
    bb.classList.remove('is-hint');
    if (i === pal) return;
    ev('palet-' + P[i][0].toLowerCase());
    setPal(i);
  }));

  /* ---------------- The logo: sketch, outlines, fill, wordmark, tagline ---------------- */
  const STEPS = ['is-sk', 'is-ln', 'is-fill', 'is-wm', 'is-tag'];
  const lvs = $$('[data-bb-lv]');
  let lt = [], view = 'logo';
  const say = t => { st.textContent = t; };
  const setLv = v => {
    view = v;
    lvs.forEach(b => { const on = b.dataset.bbLv === v; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
  };
  const clear = () => { lt.forEach(clearTimeout); lt = []; };
  const at = (fn, ms) => lt.push(setTimeout(fn, ms));
  const set = (...cls) => { STEPS.concat('is-zone').forEach(c => logo.classList.toggle(c, cls.includes(c))); };
  const done = () => { set(...STEPS); say('Færdigt logo'); step(2); };
  // From the sketch (or from nothing) to the final logo, one stage at a time
  const draw = fromSketch => {
    clear();
    if (!motion) return done();
    let t = 0;
    if (!fromSketch) {
      set(); void logo.offsetWidth;
      say('Skitse');
      set('is-sk');
      t = 1700;
    }
    at(() => { logo.classList.add('is-ln'); say('Rentegning'); }, t);
    at(() => logo.classList.add('is-fill'), t + 1050);
    at(() => logo.classList.add('is-wm'), t + 1300);
    at(() => { logo.classList.add('is-tag'); say('Færdigt logo'); step(2); }, t + 2500);
  };
  lvs.forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.bbLv;
    if (v === view) return;
    ev('logo-' + v);
    const was = view;
    setLv(v);
    clear();
    if (v === 'skitse') { set('is-sk'); say('Skitse'); }
    else if (v === 'logo') { if (was === 'skitse') { set('is-sk'); draw(true); } else done(); }
    else { set(...STEPS, 'is-zone'); say('Frizone'); }
  }));
  $('[data-bb-again]').addEventListener('click', () => { ev('tegn-igen'); setLv('logo'); draw(false); });

  /* ---------------- Mockups ---------------- */
  const tabs = $$('[data-bb-tab]'), panels = $$('[data-bb-m]'), use = $('[data-bb-use]');
  const shown = new Set(['visitkort']);
  let tab = 'visitkort', auto = [], autoOn = motion;
  const stopAuto = () => { autoOn = false; auto.forEach(clearTimeout); auto = []; };
  const show = k => {
    tab = k;
    tabs.forEach(b => { const on = b.dataset.bbTab === k; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    panels.forEach(p => {
      const on = p.dataset.bbM === k;
      if (on) {
        // Photos load only when their mockup is shown
        p.querySelectorAll('image[data-href]').forEach(im => { im.setAttribute('href', im.dataset.href); im.removeAttribute('data-href'); });
        p.classList.remove('is-on'); void p.offsetWidth;
      }
      p.classList.toggle('is-on', on);
    });
    fit();
    shown.add(k);
    if (shown.size === tabs.length) step(4);
  };
  tabs.forEach(b => b.addEventListener('click', () => { stopAuto(); if (b.dataset.bbTab !== tab) { ev('brug-' + b.dataset.bbTab); show(b.dataset.bbTab); } }));
  // Once, by themselves: Bil, Instagram, Hjemmeside
  const tour = () => {
    step(3);
    if (!autoOn) return;
    tabs.slice(1).forEach((b, j) => auto.push(setTimeout(() => { if (autoOn) show(b.dataset.bbTab); if (j === tabs.length - 2) autoOn = false; }, 3400 * (j + 1))));
  };

  // Phones: the logo and each mockup have their own crop, and the stage takes the height of the mockup shown
  const narrow = matchMedia('(max-width: 640px)'), stage = $('.bb-stage');
  const fit = () => {
    if (!narrow.matches) { stage.style.height = ''; return; }
    const v = $('.bb-m.is-on .bb-sv').getAttribute('viewBox').split(' ').map(Number);
    stage.style.height = Math.round(Math.max(250, Math.min(470, stage.offsetWidth * v[3] / v[2]))) + 'px';
  };
  const crop = () => {
    $$('[data-vbn]').forEach(s => {
      if (!s.dataset.vb) s.dataset.vb = s.getAttribute('viewBox');
      s.setAttribute('viewBox', narrow.matches ? s.dataset.vbn : s.dataset.vb);
    });
    fit();
  };
  crop();
  if (narrow.addEventListener) narrow.addEventListener('change', crop);
  addEventListener('resize', fit);

  /* ---------------- Start ---------------- */
  setPal(0);
  if (!motion) {
    done();
    bb.classList.add('is-in');
    step(1); step(3);
    return;
  }
  set();
  say('Skitse');
  let started = false;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    if (e.target === logo && !started) {
      started = true; io.unobserve(logo);
      bb.classList.add('is-in');
      step(1);
      draw(false);
      // After the drawing: a small nudge on the palettes
      setTimeout(() => { if (pal === 0) bb.classList.add('is-hint'); }, 5200);
    }
    if (e.target === use) { io.unobserve(use); show('visitkort'); tour(); }
  }), { threshold: .35 });
  io.observe(logo);
  io.observe(use);
}
