// Showcase: e-mail marketing (scripts/services/showcase/email-marketing.html). Lock screen and inbox.
// When the phone comes into view, two mails from Nordvik land on the lock screen with a buzz, and after a moment the
// newest opens by itself, zooming out of its notification. A tap on a notification opens that mail; "Tilbage" zooms
// back to the lock screen. The envelopes are the automatic flow: a click flies that mail into the phone, where it
// lands as a notification (or as a banner over the mail that is open) and opens.
// Every action cancels whatever is still pending, so a tap in the middle of a transition simply takes over; the zoom
// and the stacking are CSS transitions, which carry on from wherever they are.
// Without html.motion it all works too, just at once: no intro, no flight, no zoom.
import { track } from '/assets/js/analytics.js';

const sec = document.querySelector('.show--email-marketing');
if (sec) init(sec);

function init(sec) {
  const SC = 'email-marketing', motion = document.documentElement.classList.contains('motion');
  const $ = s => sec.querySelector(s), $$ = s => Array.from(sec.querySelectorAll(s));
  const wrap = $('[data-em-wrap]'), ph = $('.em-ph'), scr = $('[data-em-scr]'), lock = $('[data-em-lock]'), app = $('[data-em-app]');
  const stack = $('[data-em-stack]'), list = $('[data-em-mails]'), banner = $('[data-em-banner]'), toast = $('[data-em-toast]');
  const back = $('[data-em-back]'), bz = $('[data-em-bz]'), envs = $$('[data-em-env]');
  const mails = {}, notes = {}, chips = {};
  $$('[data-mail]').forEach(m => { mails[m.dataset.mail] = m; });
  $$('[data-em-note]').forEach(n => { notes[n.dataset.emNote] = n; });
  $$('[data-em-chip]').forEach(c => { chips[c.dataset.emChip] = c; });
  const FLOW = envs.map(e => e.dataset.emEnv), NEWS = ['gulv', 'terrasse']; // the newsletters land in this order, so the last is on top

  let order = motion ? [] : Object.keys(notes); // the lock screen, newest first
  let view = 'lock', cur = '', run = 0, timers = [], ghost = null, introDone = !motion, opened = false, sent = false, vis = false, pend = null, started = false, seen = 0, tt = 0;
  const act = action => track('showcase_interact', { showcase: SC, action });
  const step = n => { while (seen < n) track('showcase_step', { showcase: SC, step: ++seen }); };
  const later = (ms, fn) => { const my = run; timers.push(setTimeout(() => { if (my === run) fn(); }, motion ? ms : 0)); };
  const restart = (el, c) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };
  const hintOn = () => { if (!opened) sec.classList.add('is-hint'); };

  // Whatever is still pending gives way to what the visitor does now (an unfinished intro is completed at once)
  const stop = () => {
    run++; timers.forEach(clearTimeout); timers = []; pend = null;
    if (ghost) { ghost.cancel(); ghost = null; }
    sec.classList.remove('is-banner'); banner.inert = true; list.classList.remove('is-swap');
    if (!introDone) { introDone = true; NEWS.forEach(id => { if (!order.includes(id)) land(id, true); }); hintOn(); }
  };

  // The lock screen: notifications stacked newest first; from the fourth on they slip away
  const restack = () => order.forEach((id, i) => {
    const n = notes[id], out = i > 2;
    n.style.setProperty('--i', Math.min(i, 3));
    n.classList.toggle('is-out', out); n.tabIndex = out ? -1 : 0;
  });
  const fill = (n, id) => {
    n.querySelector('.em-note__s').textContent = mails[id].dataset.subj;
    n.querySelector('.em-note__p').textContent = mails[id].dataset.pre;
  };
  const make = id => { const n = notes.terrasse.cloneNode(true); n.className = 'em-note'; n.dataset.emNote = id; fill(n, id); return (notes[id] = n); };
  const buzz = () => {
    if (!motion) return;
    restart(ph, 'is-buzz');
    if (!bz.dataset.done) { bz.dataset.done = '1'; bz.classList.add('is-buzz'); }
  };
  const land = (id, quiet) => {
    const n = notes[id] || make(id);
    order = [id, ...order.filter(x => x !== id)];
    stack.prepend(n); n.classList.remove('is-wait');
    restack();
    if (motion && !quiet) {
      n.animate([{ opacity: 0, transform: 'translateY(2.4em) scale(.9)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 620, easing: 'cubic-bezier(.3,1.35,.5,1)' });
      buzz();
    }
    return n;
  };

  // Where a notification (or the banner) sits in the screen, from the layout, so the zoom on the lock screen does not matter
  const at = el => {
    const fs = parseFloat(getComputedStyle(scr).fontSize), b = el === banner;
    const y = b ? banner.offsetTop : stack.offsetTop + Math.min(order.indexOf(el.dataset.emNote), 3) * 5.75 * fs;
    return [stack.offsetLeft + el.offsetWidth / 2, y + el.offsetHeight / 2];
  };
  const origin = el => { const p = el && at(el); app.style.transformOrigin = lock.style.transformOrigin = p ? `${p[0].toFixed(0)}px ${p[1].toFixed(0)}px` : '50% 45%'; };
  const tap = el => {
    if (!motion || !el) return;
    const p = at(el), r = document.createElement('i');
    r.className = 'em-rip'; r.style.left = p[0] + 'px'; r.style.top = p[1] + 'px';
    scr.append(r);
    r.animate([{ transform: 'scale(.3)', opacity: 0.8 }, { transform: 'scale(2.4)', opacity: 0 }], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => r.remove();
    el.classList.add('is-press'); setTimeout(() => el.classList.remove('is-press'), 170);
  };
  const hit = (...ks) => { if (motion) ks.forEach((k, i) => setTimeout(() => restart(chips[k], 'is-hit'), 260 + i * 150)); };

  // The mail app: one e-mail at a time; showing one restarts its parts' entrance
  const show = id => {
    Object.values(mails).forEach(m => m.classList.remove('is-cur'));
    $$('.em-btn.is-done').forEach(b => { b.classList.remove('is-done'); b.firstChild.textContent = b.dataset.t; });
    void list.offsetWidth;
    mails[id].classList.add('is-cur'); cur = id; opened = true;
    sec.classList.remove('is-hint'); sec.classList.toggle('is-cue2', !sent);
    envs.forEach(e => { const on = e.dataset.emEnv === id; e.classList.remove('is-send'); e.classList.toggle('is-on', on); e.setAttribute('aria-pressed', String(on)); });
    const flow = FLOW.includes(id);
    hit(...(flow ? ['flow', 'design', 'tekst'] : ['design', 'tekst']));
    step(flow ? 3 : 2);
  };
  const swap = id => {
    if (!motion) return show(id);
    list.classList.add('is-swap');
    later(170, () => { show(id); list.classList.remove('is-swap'); });
  };
  const open = (id, from) => {
    if (view === 'mail') { if (cur !== id) swap(id); return; }
    origin(from); show(id);
    view = 'mail'; sec.classList.add('is-mail');
    lock.inert = true; app.inert = false;
  };
  const toLock = () => {
    stop();
    if (view === 'lock') return;
    const n = notes[cur], i = order.indexOf(cur), ok = i > -1 && i < 3, had = app.contains(document.activeElement);
    origin(ok ? n : null);
    view = 'lock'; sec.classList.remove('is-mail');
    lock.inert = false; app.inert = true;
    envs.forEach(e => { e.classList.remove('is-on', 'is-send'); e.setAttribute('aria-pressed', 'false'); });
    if (had) (ok ? n : notes[order[0]]).focus({ preventScroll: true });
    act('tilbage');
  };

  // An envelope from the flow flies into the phone and lands: on the lock screen, or as a banner over an open mail
  const fly = (env, done) => {
    const g = document.createElement('i'), w = wrap.getBoundingClientRect(), a = env.getBoundingClientRect(), s = scr.getBoundingClientRect();
    g.className = 'em-ghost'; wrap.append(g);
    const x0 = a.left + a.width / 2 - w.left, y0 = a.top + a.height * 0.25 - w.top;
    const x1 = s.left + s.width / 2 - w.left, y1 = s.top + s.height * (view === 'mail' ? 0.12 : 0.47) - w.top;
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 110;
    const k = [0, 0.2, 0.4, 0.6, 0.8, 1].map(t => {
      const u = 1 - t, x = u * u * x0 + 2 * u * t * cx + t * t * x1, y = u * u * y0 + 2 * u * t * cy + t * t * y1;
      return { transform: `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${(-14 * u + 8 * t).toFixed(1)}deg) scale(${(1.1 - 0.7 * t * t).toFixed(3)})`, opacity: t < 0.85 ? 1 : 0 };
    });
    const an = ghost = g.animate(k, { duration: 720, easing: 'cubic-bezier(.45,.05,.3,1)' });
    an.oncancel = () => g.remove();
    an.onfinish = () => { g.remove(); if (ghost === an) ghost = null; done(); };
  };
  const send = env => {
    const id = env.dataset.emEnv;
    stop(); act('flow-' + id);
    sent = true; sec.classList.remove('is-cue2');
    envs.forEach(e => e.classList.toggle('is-send', e === env));
    const go = () => {
      const n = land(id);
      if (view === 'lock') return later(560, () => { tap(n); later(130, () => open(id, n)); });
      if (!motion) return show(id);
      fill(banner, id); banner.dataset.id = id;
      sec.classList.add('is-banner'); banner.inert = false;
      later(1000, () => { sec.classList.remove('is-banner'); banner.inert = true; swap(id); });
    };
    if (!motion) return go();
    const my = run;
    fly(env, () => { if (my === run) go(); });
  };

  // The first time the phone is in view: the newsletters land, the hint shows, the newest opens by itself
  const whenVis = fn => { if (vis) fn(); else { const my = run; pend = () => { if (my === run) fn(); }; } };
  const auto = () => {
    tap(notes.terrasse);
    later(130, () => open('terrasse', notes.terrasse));
    later(1900, () => restart(envs[0], 'is-nudge'));
  };
  const play = () => {
    later(450, () => { land('gulv'); step(1); });
    later(1550, () => land('terrasse'));
    later(2150, () => { introDone = true; hintOn(); });
    later(4300, () => whenVis(auto));
  };
  new IntersectionObserver(([e]) => {
    vis = e.isIntersecting;
    if (!vis) return;
    if (!started) { started = true; if (motion) play(); else step(1); }
    if (pend) { const f = pend; pend = null; f(); }
  }, { threshold: 0.6 }).observe(scr);
  // The photos load when the section is near, not with the page
  const near = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    near.disconnect(); $$('.em-pic img').forEach(i => { i.loading = 'eager'; });
  }, { rootMargin: '700px 0px' });
  near.observe(wrap);

  // Taps and clicks
  stack.addEventListener('click', e => {
    const n = e.target.closest('[data-em-note]');
    if (!n) return;
    const had = n === document.activeElement;
    stop(); tap(n); act('notifikation');
    later(130, () => { open(n.dataset.emNote, n); if (had) back.focus({ preventScroll: true }); });
  });
  banner.addEventListener('click', () => { const id = banner.dataset.id; stop(); act('banner'); if (id) swap(id); });
  back.addEventListener('click', toLock);
  sec.addEventListener('keydown', e => { if (e.key === 'Escape' && view === 'mail') toLock(); });
  envs.forEach(env => env.addEventListener('click', () => send(env)));
  list.addEventListener('click', e => {
    const b = e.target.closest('[data-em-book]'), u = e.target.closest('[data-em-unsub]');
    if (b && !b.classList.contains('is-done')) { b.dataset.t = b.firstChild.textContent; b.firstChild.textContent = b.dataset.ok; b.classList.add('is-done'); act('book'); }
    if (u) {
      toast.textContent = 'Du er afmeldt. Med ét klik, som reglerne siger.';
      sec.classList.add('is-toast'); clearTimeout(tt); tt = setTimeout(() => sec.classList.remove('is-toast'), 2800);
      hit('regler'); act('afmeld');
    }
  });

  $$('.em-nl').forEach(nl => Array.from(nl.children).forEach((c, i) => c.style.setProperty('--d', i)));
  restack();
  if (!motion) hintOn();
}
