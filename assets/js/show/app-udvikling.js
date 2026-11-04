// App-udvikling showcase (scripts/services/showcase/app-udvikling.html): the same example app for Klinik Fryd on an
// iPhone-like and an Android-like phone. When the phones come into view the app installs itself on both home screens
// (a progress ring) and opens. A tap on either phone plays the booking on both: pick a time, booked, a push
// notification, a stamp on the klippekort. The chips switch parts of the app on and off on both phones at once
// (the rest slides into place with transform only). Without motion the finished booking is shown, still.
import { track } from '/assets/js/analytics.js';

const sec = document.querySelector('.show--app-udvikling');
if (sec) app(sec);

function app(sec) {
  const anim = document.documentElement.classList.contains('motion');
  const $ = (s, r = sec) => r.querySelector(s), $$ = (s, r = sec) => [...r.querySelectorAll(s)];
  const st = $('[data-au-stage]'), live = $('[data-au-live]'), again = $('[data-au-again]'), sync = $('.au-sync i');
  const has = c => st.classList.contains(c), set = (c, v = true) => st.classList.toggle(c, v);
  const view = v => { st.dataset.v = v; };
  const wait = ms => new Promise(r => setTimeout(r, anim ? ms : 0));
  const ease = 'cubic-bezier(.2,.8,.2,1)';
  const P = $$('[data-au-dev]').map(d => ({ d, os: d.dataset.auDev, scr: $('.au-scr', d), tap: $('.au-tap', d), ring: $('.au-ring .p', d), ib: $('.au-ib', d), appv: $('.au-appv', d) }));
  const F = { book: true, card: true, push: true, login: true };
  const NAME = { book: 'Booking', card: 'Klippekort', push: 'Push-beskeder', login: 'Login' };
  let run = 0, playing = 0, opened = !anim, queued = false, touched = false, inView = false, started = false, idleT = 0;
  const seen = new Set(), step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: 'app-udvikling', step: n }); } };
  const tell = action => track('showcase_interact', { showcase: 'app-udvikling', action });
  const say = t => { live.textContent = t; };

  /* Dates: next week, Monday to Friday; the booking is on the Thursday */
  const now = new Date(), mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((8 - now.getDay()) % 7 || 7));
  const day = n => new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + n);
  try {
    $$('[data-au-day]').forEach(b => { b.textContent = day(+b.dataset.auDay).getDate(); });
    const tor = day(3).toLocaleDateString('da-DK', { day: 'numeric', month: 'short' });
    $$('[data-au-date]').forEach(e => { e.textContent = tor; });
    const td = now.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' }).replace(' den ', ' ');
    $$('[data-au-today]').forEach(e => { e.textContent = td[0].toUpperCase() + td.slice(1); });
  } catch (e) { /* the dates in the HTML stay */ }

  /* Where something sits on a phone's screen, in the screen's own pixels (the phones are scaled) */
  const kOf = p => p.scr.getBoundingClientRect().width / p.scr.offsetWidth || 1;
  const at = (p, el) => {
    const s = p.scr.getBoundingClientRect(), r = el.getBoundingClientRect(), k = kOf(p);
    return [(r.left + r.width / 2 - s.left) / k, (r.top + r.height / 2 - s.top) / k];
  };
  // A finger dot, like in a screen recording
  const dot = (p, x, y) => {
    const t = s => `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${s})`;
    p.tap.animate([{ opacity: 0, transform: t(1.5) }, { opacity: 1, transform: t(1), offset: .35 }, { opacity: 1, transform: t(.82), offset: .55 }, { opacity: 0, transform: t(1.25) }], { duration: 640, easing: 'ease-out' });
  };
  // The same tap on both phones; true while the run it belongs to is still the current one
  async function tapAt(key, my) {
    P.forEach(p => {
      const t = $$(`[data-au-t="${key}"]`, p.scr).find(e => e.offsetParent);
      if (!t) return;
      if (anim) dot(p, ...at(p, t));
      t.classList.add('is-press');
      setTimeout(() => t.classList.remove('is-press'), 380);
    });
    await wait(440);
    return my === run;
  }
  const go = async (ms, my) => { await wait(ms); return my === run; };
  const reset = () => ['is-day', 'is-slot', 'is-busy', 'is-push', 'is-stamp'].forEach(c => set(c, false));

  /* The install: both rings fill, a little out of step, like two real downloads */
  const prog = (p, v) => { p.ring.style.strokeDashoffset = (100 - v * 100).toFixed(1); };
  const load = my => new Promise(res => {
    const t0 = performance.now(), T = [[0, 1500], [160, 1400]];
    const f = t => {
      if (my !== run) return res();
      let done = true;
      P.forEach((p, i) => {
        const x = Math.min(1, Math.max(0, (t - t0 - T[i][0]) / T[i][1]));
        if (x < 1) done = false;
        prog(p, x - Math.sin(x * Math.PI * 2) * .08);
      });
      if (done) res(); else requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });

  async function install() {
    const my = ++run;
    playing = 0; opened = false; clearTimeout(idleT);
    reset(); view('home');
    ['is-open', 'is-ready', 'is-inst', 'is-end', 'is-hint', 'is-dl'].forEach(c => set(c, false));
    P.forEach(p => prog(p, 0));
    if (!await go(500, my)) return;
    set('is-dl');
    if (anim) await load(my);
    if (my !== run) return;
    set('is-dl', false); set('is-inst'); step(1);
    if (!await go(750, my) || !await tapAt('ico', my)) return;
    // The app grows out of its icon
    P.forEach(p => { const [x, y] = at(p, p.ib); p.appv.style.transformOrigin = `${x}px ${y}px`; });
    set('is-open'); step(2);
    if (!await go(950, my)) return;
    set('is-ready'); opened = true;
    if (queued) { queued = false; book(); return; }
    if (!await go(1100, my) || touched || !anim) return;
    // Nobody has tapped yet: point at the button, and play it once if they keep watching
    set('is-hint');
    idleT = setTimeout(() => { if (inView && !touched && my === run) book(); }, 3800);
  }

  /* The booking, played on both phones */
  async function book() {
    if (!opened) { queued = true; return; }
    if (!anim && st.dataset.v === 'done') { run++; playing = 0; reset(); view('home'); set('is-end'); return; }
    const my = ++run;
    playing = my; clearTimeout(idleT); set('is-hint', false); set('is-end', false);
    if (st.dataset.v !== 'home' || has('is-push') || has('is-stamp')) {
      reset(); view('home');
      if (!await go(560, my)) return;
    }
    if (!F.book) {
      await tapAt('call', my);
      const c = $('[data-au-f="book"]');
      c.classList.remove('is-nudge'); void c.offsetWidth; c.classList.add('is-nudge');
      say('Slå Booking til for at booke i appen.');
      if (my === run) { playing = 0; set('is-end'); }
      return;
    }
    if (!await go(300, my) || !await tapAt('book', my)) return;
    view('pick');
    if (!await go(760, my) || !await tapAt('day', my)) return;
    set('is-day');
    if (!await go(560, my) || !await tapAt('slot', my)) return;
    set('is-slot'); step(3);
    if (!await go(480, my) || !await tapAt('ok', my)) return;
    set('is-busy');
    if (!await go(700, my)) return;
    set('is-busy', false); view('done'); step(4);
    say('Eksempel: Tiden torsdag kl. 10.30 er booket, på begge telefoner.');
    if (!await go(1000, my)) return;
    if (F.push) { set('is-push'); step(5); if (!await go(1500, my)) return; }
    if (F.card) { set('is-stamp'); step(6); if (!await go(1000, my)) return; }
    playing = 0; set('is-end');
  }

  /* Tapping a phone: the tap shows on both, then the booking plays */
  const pulse = p => {
    if (!sync.offsetParent) return;
    const d = p.os === 'iphone' ? 1 : -1;
    sync.animate([{ opacity: 0, transform: `translateX(${-48 * d}px)` }, { opacity: 1, offset: .2 }, { opacity: 1, offset: .8 }, { opacity: 0, transform: `translateX(${48 * d}px)` }], { duration: 560, easing: ease });
  };
  P.forEach(p => $('.au-hit', p.d).addEventListener('click', e => {
    touched = true; clearTimeout(idleT); set('is-hint', false);
    tell('tap-' + p.os);
    P.forEach(q => q.d.classList.toggle('is-front', q === p));
    if (anim) {
      const s = p.scr.getBoundingClientRect(), c = v => Math.min(.95, Math.max(.05, v));
      const fx = e.detail ? c((e.clientX - s.left) / s.width) : .5, fy = e.detail ? c((e.clientY - s.top) / s.height) : .5;
      P.forEach(q => dot(q, fx * q.scr.offsetWidth, fy * q.scr.offsetHeight));
      pulse(p);
    }
    if (playing && playing === run) return;
    book();
  }));

  again.addEventListener('click', () => {
    tell('replay'); touched = true;
    if (anim) { queued = true; install(); } else book();
  });

  /* The chips: a part leaves (or joins) the app on both phones, and the rest slides into place */
  const moving = () => $$('.au-v > *, .au-tabs > *, .au-hd__i > *', st);
  async function toggle(f, v) {
    const out = $$(v ? `.au-nf-${f}` : `.au-f-${f}`, st).filter(e => e.offsetParent);
    const fades = anim ? out.map(e => e.animate({ opacity: 0, transform: 'scale(.92)' }, { duration: 180, easing: 'ease-in', fill: 'forwards' })) : [];
    if (fades.length) await new Promise(r => setTimeout(r, 170));
    const els = moving(), ks = new Map(P.map(p => [p.scr, kOf(p)]));
    const a = els.map(e => e.getBoundingClientRect());
    set('no-' + f, !F[f]);
    fades.forEach(x => x.cancel());
    if (anim) els.forEach((e, i) => {
      const b = e.getBoundingClientRect(), r = a[i];
      if (!b.width) return;
      if (!r.width) return e.animate([{ opacity: 0, transform: 'scale(.9)', offset: 0 }], { duration: 380, easing: ease });
      const k = ks.get(e.closest('.au-scr')) || 1, dx = (r.left - b.left) / k, dy = (r.top - b.top) / k;
      if (Math.abs(dx) + Math.abs(dy) > .5) e.animate([{ transform: `translate(${dx}px,${dy}px)`, offset: 0 }], { duration: 440, easing: ease });
    });
    // Booking off in the middle of a booking: back to the app's front page
    if (f === 'book' && !v && st.dataset.v !== 'home') { run++; playing = 0; reset(); view('home'); set('is-end'); }
    // Switched on after the booking: it shows up at once
    if (v && !playing && st.dataset.v === 'done') { if (f === 'push') set('is-push'); if (f === 'card') set('is-stamp'); }
  }
  $$('[data-au-f]').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.auF, v = !F[f];
    F[f] = v;
    b.classList.toggle('is-on', v); b.classList.remove('is-nudge');
    b.setAttribute('aria-pressed', String(v));
    tell(`${f}-${v ? 'on' : 'off'}`);
    say(`${NAME[f]} er slået ${v ? 'til' : 'fra'} i eksemplet.`);
    toggle(f, v);
  }));
  $('[data-au-cta]').addEventListener('click', () => tell('cta'));

  /* Start: the home screens wait, and the install plays once most of the phones are on screen */
  if (!anim) return;
  sec.classList.add('is-anim');
  reset(); view('home');
  ['is-open', 'is-ready', 'is-inst', 'is-end'].forEach(c => set(c, false));
  const io = new IntersectionObserver(es => {
    const e = es[es.length - 1];
    inView = e.isIntersecting && e.intersectionRatio > .5;
    if (inView && !started) { started = true; install(); }
  }, { threshold: [0, .3, .5, .7, .9] });
  io.observe($('.au-pair'));
}
