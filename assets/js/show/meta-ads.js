// Showcase on /services/meta-ads (scripts/services/showcase/meta-ads.html): a story ad for Nordvik, an example
// carpenter in København, on a phone. It plays while it is in view, about four seconds a frame: tap right or left
// to go forward or back, hold to pause, replay at the end. Story / Feed / Reels shows the same ad in the three
// placements, every "Book tid" opens Nordvik's booking page in the app, and the panel sets who sees it (area,
// age, interests) with an example reach that rolls like an odometer.
// Without motion (no html.motion): no autoplay and nothing moves by itself; tapping and the panel still work.
import { track } from '/assets/js/analytics.js';

const sec = document.querySelector('.show--meta-ads');
if (sec) init(sec);

function init(sec) {
  const $ = (s, r = sec) => r.querySelector(s), $$ = (s, r = sec) => [...r.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const on = b => b.getAttribute('aria-pressed') === 'true';
  const press = (b, v) => { b.setAttribute('aria-pressed', String(v)); b.classList.toggle('is-on', v); };
  const told = new Set();
  const act = a => { if (!told.has(a)) { told.add(a); track('showcase_interact', { showcase: 'meta-ads', action: a }); } };
  let reached = 0;
  const step = n => { if (n > reached) { reached = n; track('showcase_step', { showcase: 'meta-ads', step: n }); } };

  /* ---------- The story ---------- */
  const story = $('[data-ma-story]'), frs = $$('.ma-fr', story), bars = $$('.ma-bars i', story);
  const pauseBtn = $('[data-ma-pause]'), nextBtn = $('[data-ma-next]'), again = $('[data-ma-replay]'), N = frs.length;
  let cur = 0, ended = false;
  // What holds the story still: io (out of view), view (another placement), hold, btn (pause), sheet, tab
  const why = new Set(['io']);
  const sync = () => {
    story.classList.toggle('is-paused', !motion || why.size > 0);
    story.classList.toggle('is-btn', why.has('btn'));
    pauseBtn.setAttribute('aria-label', why.has('btn') ? 'Afspil' : 'Pause');
  };
  const hold = (k, v) => { if (v) why.add(k); else why.delete(k); sync(); };
  const restart = e => { e.classList.remove('is-on'); void e.offsetWidth; e.classList.add('is-on'); };
  const show = i => {
    cur = i; ended = false; story.classList.remove('is-end');
    frs.forEach((f, k) => f.classList.toggle('is-on', k === i));
    bars.forEach((b, k) => { b.classList.toggle('is-done', k < i); b.classList.toggle('is-on', k === i); });
    restart(frs[i]); restart(bars[i]);
    story.classList.toggle('is-last', i === N - 1);
    step(i + 1);
  };
  const end = () => {
    ended = true; story.classList.add('is-end');
    bars.forEach(b => { b.classList.remove('is-on'); b.classList.add('is-done'); });
    step(N + 1);
    if (document.activeElement === nextBtn) again.focus();
  };
  const go = d => {
    if (d > 0) { if (!ended) { if (cur < N - 1) show(cur + 1); else end(); } }
    else show(ended ? N - 1 : Math.max(0, cur - 1));
  };
  bars.forEach((b, k) => b.addEventListener('animationend', e => { if (e.animationName === 'showMetaFill' && k === cur && !ended) go(1); }));

  // Tap: forward or back. Press and hold: pause while held (the click after a hold does nothing)
  let held = false, ht = 0;
  const release = () => { clearTimeout(ht); if (story.classList.contains('is-hold')) { story.classList.remove('is-hold'); hold('hold', false); } };
  $$('.ma-zone', story).forEach(z => {
    const d = z.hasAttribute('data-ma-next') ? 1 : -1;
    z.addEventListener('pointerdown', e => {
      if (e.button) return;
      held = false; clearTimeout(ht);
      if (motion) ht = setTimeout(() => { held = true; story.classList.add('is-hold'); hold('hold', true); act('hold'); }, 220);
    });
    z.addEventListener('pointerup', release);
    z.addEventListener('pointerleave', release);
    z.addEventListener('pointercancel', () => { release(); held = true; });
    z.addEventListener('click', e => {
      if (held && e.detail) { held = false; return; }
      held = false; go(d); act(d > 0 ? 'naeste' : 'forrige');
    });
    z.addEventListener('contextmenu', e => e.preventDefault());
  });
  pauseBtn.addEventListener('click', () => { hold('btn', !why.has('btn')); act('pause'); });
  again.addEventListener('click', e => { act('igen'); hold('btn', false); show(0); if (!e.detail) nextBtn.focus(); });
  story.addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault(); go(e.key === 'ArrowRight' ? 1 : -1);
  });

  // Plays only while the phone is in view (and the tab is open)
  new IntersectionObserver(([e]) => {
    const vis = e.isIntersecting && e.intersectionRect.height >= Math.min(e.boundingClientRect.height, innerHeight) * .55;
    sec.classList.toggle('is-out', !vis);
    if (vis) step(1);
    hold('io', !vis);
  }, { threshold: [0, .2, .4, .55, .7, .85, 1] }).observe($('.ma-phone'));
  document.addEventListener('visibilitychange', () => hold('tab', document.hidden));
  sync();

  /* ---------- Story / Feed / Reels ---------- */
  const scr = $('[data-ma-scr]'), cap = $('[data-ma-cap]'), views = {};
  $$('[data-v]').forEach(v => { views[v.dataset.v] = v; });
  const CAP = { story: 'Story · fuld skærm, cirka fire sekunder pr. billede', feed: 'Feed · mellem opslag fra venner og familie', reels: 'Reels · mellem korte videoer, i fuld højde' };
  const feed = $('[data-ma-feed]'), ad = $('[data-ma-ad]');
  let view = 'story', ft = 0;
  // The feed flicks up and stops on the ad, like a thumb did it
  const place = flick => {
    const y = `translateY(${-ad.offsetTop}px)`;
    feed.style.transition = 'none';
    if (!flick || !motion) { feed.style.transform = y; return; }
    feed.style.transform = 'none'; void feed.offsetHeight;
    feed.style.transition = ''; feed.style.transform = y;
  };
  const setView = v => {
    if (v === view) return;
    closeSheet(); view = v; act(v);
    $$('[data-ma-view]').forEach(b => press(b, b.dataset.maView === v));
    for (const k in views) { views[k].classList.toggle('is-on', k === v); views[k].inert = k !== v; }
    scr.dataset.view = v; cap.textContent = CAP[v];
    hold('view', v !== 'story');
    clearTimeout(ft); views.feed.classList.remove('is-cta');
    if (v === 'feed') { place(true); ft = setTimeout(() => views.feed.classList.add('is-cta'), motion ? 1700 : 0); }
  };
  $$('[data-ma-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.maView)));
  new ResizeObserver(() => { if (view === 'feed') place(false); }).observe(scr);

  // Likes: a heart on the photo, the count rolls one up
  const HEART = [{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1.2)', offset: .16 }, { transform: 'scale(.94)', offset: .3 }, { opacity: 1, transform: 'scale(1)', offset: .66 }, { opacity: 0, transform: 'translateY(-20%) scale(.7)' }];
  $$('[data-ma-like]').forEach(b => b.addEventListener('click', () => {
    b.closest('[data-v]').classList.add('is-liked'); act('like');
    if (!motion) return;
    const h = $('.ma-pop', b);
    if (h) h.animate(HEART, { duration: 1000, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
    else $('.ma-i', b).animate([{ transform: 'none' }, { transform: 'scale(1.35)' }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.2,.9,.3,1.4)' });
  }));

  /* ---------- Book tid: Nordvik's booking page opens in the app ---------- */
  const sheet = $('[data-ma-sheet]'), when = $('[data-ma-when]'), slots = $$('[data-ma-slot]');
  let from = null;
  const focus = (el, kb) => { if (kb) setTimeout(() => el.focus({ preventScroll: true }), 80); };
  function closeSheet() {
    if (!sheet.classList.contains('is-open')) return;
    const back = sheet.contains(document.activeElement);
    sheet.classList.remove('is-open'); sheet.inert = true; scr.classList.remove('is-sheet');
    hold('sheet', false);
    if (back && from && !from.closest('[inert]')) from.focus({ preventScroll: true });
  }
  $$('[data-ma-book]').forEach(b => b.addEventListener('click', e => {
    from = b; act('book');
    sheet.classList.remove('is-sent'); sheet.inert = false; sheet.classList.add('is-open'); scr.classList.add('is-sheet');
    hold('sheet', true);
    focus($('.ma-slots .is-on', sheet), !e.detail);
  }));
  $$('[data-ma-close]', sheet).forEach(b => b.addEventListener('click', closeSheet));
  sheet.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
  slots.forEach(b => b.addEventListener('click', () => slots.forEach(s => press(s, s === b))));
  $('[data-ma-send]', sheet).addEventListener('click', e => {
    when.textContent = `Vi ses ${$('.ma-slots .is-on', sheet).dataset.maSlot}. Nordvik sender en bekræftelse på sms.`;
    sheet.classList.add('is-sent'); act('booket');
    focus($('.ma-sh__back', sheet), !e.detail);
  });

  /* ---------- Who sees it ---------- */
  // Example figures only: people (thousands) within r km of København on the Danish side, the share of each age
  // group, and how many like each interest (interests add up: anyone with one of them)
  const PEOPLE = [[0, 0], [5, 520], [10, 900], [15, 1160], [20, 1340], [25, 1480], [30, 1620], [35, 1800], [40, 2000]];
  const AGE = [.105, .18, .135, .125, .105, .155], INT = [.26, .18, .14, .08];
  const range = $('[data-ma-r]'), rv = $('[data-ma-rv]'), map = $('.ma-map svg'), km = $('[data-ma-km]'), towns = $$('.ma-tw');
  const ages = $$('[data-ma-age] button'), ints = $$('[data-ma-int] button');
  const odo = $('[data-ma-odo]'), sum = $('[data-ma-sum]'), live = $('[data-ma-live]');
  const people = r => { for (let i = 1; i < PEOPLE.length; i++) { const [r0, p0] = PEOPLE[i - 1], [r1, p1] = PEOPLE[i]; if (r <= r1) return (p0 + (p1 - p0) * (r - r0) / (r1 - r0)) * 1e3; } return 2e6; };
  const reach = () => {
    const a = ages.reduce((s, b, i) => s + (on(b) ? AGE[i] : 0), 0);
    const u = 1 - ints.reduce((p, b, i) => p * (on(b) ? 1 - INT[i] : 1), 1);
    const n = people(+range.value) * a * (ints.some(on) ? u : 1);
    return n >= 1e4 ? Math.round(n / 1e3) * 1e3 : Math.round(n / 100) * 100;
  };
  const join = (a, w) => a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} ${w} ${a[a.length - 1]}`;
  const ageText = () => {
    const g = [];
    ages.forEach((b, i) => { if (!on(b)) return; const l = g[g.length - 1]; if (l && l[1] === i - 1) l[1] = i; else g.push([i, i]); });
    const lo = i => ages[i].textContent.split('–')[0].replace('+', ''), hi = i => ages[i].textContent.split('–')[1];
    return join(g.map(([a, b]) => hi(b) ? `${lo(a)}–${hi(b)}` : `${lo(a)}+`), 'og') + ' år';
  };
  const intText = () => { const a = ints.filter(on).map(b => b.textContent.toLocaleLowerCase('da-DK')); return a.length ? `med interesse for ${join(a, 'eller')}` : 'uanset interesser'; };

  // Labels the edge of the map would cut (it zooms, and phones show less of the sides) fade out
  const marks = $$('.ma-m__c:not(.ma-m__pin)', map).map(g => {
    const [x, y] = g.style.getPropertyValue('--o').trim().split(/\s+/).map(parseFloat), t = $('text', g) || g;
    return { g, x, y, t, end: t.getAttribute('text-anchor') === 'end', w: 0 };
  });
  const fit = () => {
    const b = map.getBoundingClientRect(), a = b.width / b.height, z = +map.style.getPropertyValue('--z') || 1;
    if (!b.width) return;
    const vw = a >= 1.6 ? 240 : 150 * a, vh = a >= 1.6 ? 240 / a : 150;
    marks.forEach(m => {
      if (!m.w) { try { m.w = m.t.getComputedTextLength(); } catch (x) { m.w = 60; } }
      const X = (m.x - 240) * z, Y = (m.y - 150) * z, l = m.end ? X - 8 - m.w : X - 5, r = m.end ? X + 5 : X + 8 + m.w;
      m.g.classList.toggle('is-off', l < 4 - vw || r > vw - 4 || Math.abs(Y) > vh - 10);
    });
  };
  new ResizeObserver(() => fit()).observe(map);

  // The number rolls digit by digit, like the price further down the page. Each digit's window takes the width
  // of the digit it lands on, so a 1 sits as tight as in plain text
  const COL = `<span>${[...'0123456789'].map(d => `<b>${d}</b>`).join('')}</span>`;
  let shown = '', W = null;
  const widths = () => {
    const t = document.createElement('b'), fs = parseFloat(getComputedStyle(odo).fontSize) || 1;
    t.style.cssText = 'position:absolute;visibility:hidden';
    odo.append(t);
    W = [...'0123456789'].map(d => { t.textContent = d; return t.getBoundingClientRect().width / fs; });
    odo.removeChild(t);
  };
  const cells = () => [...odo.children];
  const fitDigits = () => cells().forEach((c, k) => { if (c.firstElementChild) c.style.width = `${W ? W[shown[k]].toFixed(3) : .62}em`; });
  const roll = s => {
    if (!motion) { odo.textContent = s; return; }
    if (s.length !== shown.length) {
      const was = [...shown].reverse();
      odo.innerHTML = [...s].map(c => /\d/.test(c) ? `<i>${COL}</i>` : `<i>${c}</i>`).join('');
      // each column starts on the digit that stood in its place (counted from the right)
      cells().reverse().forEach((c, k) => { const col = c.firstElementChild; if (col) { col.style.transition = 'none'; col.style.transform = `translate(-50%, ${-(/\d/.test(was[k]) ? was[k] : 0)}em)`; } });
      void odo.offsetWidth;
      cells().forEach(c => { if (c.firstElementChild) c.firstElementChild.style.transition = ''; });
    }
    cells().forEach((c, k) => { if (c.firstElementChild) c.firstElementChild.style.transform = `translate(-50%, ${-s[k]}em)`; });
    shown = s; fitDigits();
  };
  let ready = !motion, lt = 0, first = true;
  const update = () => {
    const r = +range.value, s = reach().toLocaleString('da-DK');
    rv.textContent = `${r} km omkring København`;
    range.setAttribute('aria-valuetext', `${r} kilometer omkring København`);
    range.style.setProperty('--p', `${((r - 5) / 35 * 100).toFixed(1)}%`);
    // the circle grows on the map while the map zooms out, so it always fills a good part of it
    const R = 46 + 66 * Math.sqrt((r - 5) / 35);
    map.style.setProperty('--s', (r / 40).toFixed(4)); map.style.setProperty('--z', (R / (3.4 * r)).toFixed(4)); km.textContent = `${r} km`;
    // towns inside the circle light up, nearest first
    towns.forEach(t => {
      const d = +t.dataset.d, v = d <= r;
      if (v !== t.classList.contains('is-in')) { t.style.setProperty('--dl', v ? `${(d / r * .3).toFixed(2)}s` : '0s'); t.classList.toggle('is-in', v); }
    });
    fit();
    sum.textContent = `${ageText()}, inden for ${r} km af København, ${intText()}.`;
    if (ready) roll(s);
    if (!first) { clearTimeout(lt); lt = setTimeout(() => { live.textContent = `Eksempel: cirka ${s} personer kan se annoncen.`; }, 700); }
    first = false;
  };
  range.addEventListener('input', update);
  range.addEventListener('change', () => act('radius'));
  ages.forEach(b => b.addEventListener('click', () => {
    // at least one age group: the last one shakes its head
    if (on(b) && ages.filter(on).length === 1) { b.classList.remove('is-no'); void b.offsetWidth; b.classList.add('is-no'); return; }
    press(b, !on(b)); update(); act('alder');
  }));
  ints.forEach(b => b.addEventListener('click', () => { press(b, !on(b)); update(); act('interesse'); }));
  if (document.fonts) document.fonts.ready.then(() => { marks.forEach(m => { m.w = 0; }); fit(); if (motion) { widths(); fitDigits(); } });
  if (motion) {
    widths();
    roll(reach().toLocaleString('da-DK').replace(/\d/g, '0'));
    new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect(); ready = true; setTimeout(() => roll(reach().toLocaleString('da-DK')), 300); }, { threshold: .6 }).observe(odo);
  }
  update();

  // The hints beside the phone drift a little with the mouse, like the badges in the hero
  if (motion) {
    const pills = $$('.ma-pill'), depth = [22, 34];
    sec.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      pills.forEach((p, i) => { p.style.translate = `${(x * depth[i]).toFixed(1)}px ${(y * depth[i]).toFixed(1)}px`; });
    }, { passive: true });
  }
}
