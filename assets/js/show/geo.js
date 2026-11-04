// GEO showcase (scripts/services/showcase/geo.html): an AI chat with question chips. When the chat comes into
// view the first question types itself into the composer and is sent; after "Tænker …" the answer streams in
// word by word, each source it uses lights up in "Det, AI læser", and the source chips pop in under it. A chip
// asks its question the same way, also in the middle of an answer (that answer is then finished at once).
// Without motion every answer is shown finished. Nothing is personalised: the example is always Nordvik.
import { track } from '/assets/js/analytics.js';

const sec = document.querySelector('.show--geo');
if (sec) geo(sec);

function geo(sec) {
  const anim = document.documentElement.classList.contains('motion');
  const $ = (s, r = sec) => r.querySelector(s), $$ = (s, r = sec) => [...r.querySelectorAll(s)];
  const on = (el, c, v = true) => el.classList.toggle(c, v);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const chat = $('[data-geo-chat]'), body = $('[data-geo-body]'), thread = $('[data-geo-thread]');
  const typed = $('[data-geo-typed]'), line = $('[data-geo-line]'), field = $('[data-geo-field]'), send = $('[data-geo-send]');
  const row = $('[data-geo-qs]'), qs = $$('[data-geo-q]'), panel = $('[data-geo-panel]'), live = $('[data-geo-live]');
  const rows = Object.fromEntries($$('[data-geo-row]').map(r => [r.dataset.geoRow, r]));
  const first = $('[data-geo-first]'), st = $('[data-geo-st]');
  // A source number stays on the line of the word before it
  const glue = root => $$('.geo-cite', root).forEach(c => {
    const t = c.previousSibling, m = t && t.nodeType === 3 && t.nodeValue.match(/\S+$/);
    if (!m) return;
    t.nodeValue = t.nodeValue.slice(0, -m[0].length);
    const s = document.createElement('span');
    s.className = 'geo-nb'; c.before(s); s.append(m[0], c);
  });
  // The answers: the finished first one in the thread, then the templates
  const src = [first, ...$$('template[data-geo-a]').map(t => t.content)];
  src.forEach(glue);
  const frag = i => { const f = document.createDocumentFragment(); src[i].childNodes.forEach(n => f.append(n.cloneNode(true))); return f; };
  const tell = action => track('showcase_interact', { showcase: 'geo', action });
  const seen = new Set(), step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: 'geo', step: n }); } };

  /* The panel: which sources the answer used */
  const light = (k, n, pop) => {
    const r = rows[k]; if (!r) return;
    on(r, 'is-lit'); $('.geo-n', r).textContent = n;
    if (pop) { r.classList.remove('is-pop'); void r.offsetWidth; r.classList.add('is-pop'); }
  };
  const dark = () => Object.values(rows).forEach(r => { r.classList.remove('is-lit', 'is-pop'); });
  const status = (t, read) => { st.textContent = t; on(st, 'is-read', !!read); };
  const used = c => `${$$('.geo-cite', c).length} af ${Object.keys(rows).length} brugt`;
  const lightAll = c => { dark(); $$('.geo-cite', c).forEach(e => light(e.dataset.src, e.textContent)); status(used(c)); };

  /* Following the newest line, like a real chat. The thread moves with transform only */
  let ty = 0, raf = 0, tp = 0, focus = null, pin = null;
  const bottom = (el, top) => { let y = top ? 0 : el.offsetHeight; for (let n = el; n && n !== thread; n = n.offsetParent) y += n.offsetTop; return y; };
  const goal = () => {
    if (!focus || !thread.contains(focus)) return ty;
    let g = bottom(focus) + 30 - body.clientHeight;
    // Without motion the new question stays in view, even when its answer is long
    if (pin && thread.contains(pin)) g = Math.min(g, bottom(pin, true) - 14);
    return Math.max(0, g);
  };
  // At most two answers are kept; an older one goes once it has scrolled out of view
  const prune = () => {
    const ex = thread.children;
    while (ex.length > 2 && bottom(ex[0]) < ty) { const h = ex[1].offsetTop - ex[0].offsetTop; ex[0].remove(); ty -= h; }
  };
  const tick = t => {
    raf = 0;
    const dt = Math.min(.05, (t - tp) / 1000 || .016), g = goal();
    tp = t;
    ty = anim ? ty + (g - ty) * Math.min(1, dt * 8) : g;
    if (Math.abs(g - ty) < .4) ty = g; else raf = requestAnimationFrame(tick);
    prune();
    thread.style.transform = ty > .2 ? `translateY(${(-ty).toFixed(1)}px)` : '';
  };
  const kick = () => { if (!raf) { tp = performance.now(); raf = requestAnimationFrame(tick); } };
  const aim = el => { focus = el; kick(); };

  /* One question and its answer */
  function build(i) {
    const ex = document.createElement('div');
    ex.className = 'geo-ex';
    ex.innerHTML = '<p class="geo-u"></p><div class="geo-a"><span class="geo-av"></span><div class="geo-a__c"><div class="geo-think"><span></span><i></i><i></i><i></i></div></div></div>';
    $('.geo-u', ex).textContent = qs[i].textContent;
    const c = $('.geo-a__c', ex);
    c.append(frag(i));
    return { i, ex, c, a: $('.geo-a', ex), say: $('.geo-think span', ex), toks: anim ? words(c) : [], srcs: $$('.geo-srcs li', c), list: $('.geo-srcs', c), done: false };
  }
  // Words, source numbers and table rows, in the order they appear
  function words(root) {
    const out = [];
    (function walk(el) {
      [...el.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          if (!n.nodeValue.trim()) return;
          const f = document.createDocumentFragment();
          n.nodeValue.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s/.test(w)) return f.append(' ');
            const s = document.createElement('span');
            s.className = 'gw'; s.textContent = w; f.append(s); out.push(s);
          });
          n.replaceWith(f);
        } else if (n.nodeType === 1 && !n.matches('.geo-think, .geo-srcs')) {
          if (n.matches('.geo-cite, .geo-tr')) out.push(n); else walk(n);
        }
      });
    })(root);
    return out;
  }
  // What a screen reader hears after a question is chosen
  const said = i => {
    const d = document.createElement('div');
    d.append(frag(i));
    $$('.geo-cite', d).forEach(e => e.remove());
    const s = $$('.geo-srcs li', d).map(li => li.lastChild.textContent);
    $$('.geo-srcs', d).forEach(e => e.remove());
    return `Eksempel. ${qs[i].textContent} Svar: ${d.textContent.replace(/\s+/g, ' ').trim()} Kilder: ${s.join(', ')}.`;
  };
  // Shown at once: a cut-short answer, or every answer without motion
  function finish(x) {
    x.toks.forEach(t => { t.classList.add('is-on'); t.classList.remove('is-last'); });
    $$('.geo-ul li, .geo-tbl', x.c).concat(x.srcs, $$('strong', x.c)).forEach(e => on(e, e.tagName === 'STRONG' ? 'is-hl' : 'is-on'));
    on(x.ex, 'is-sent'); on(x.ex, 'is-think'); on(x.a, 'is-think', false); on(panel, 'is-scan', false);
    lightAll(x.c);
    x.done = true;
    aim(x.list || x.c);
  }

  /* Asking */
  let run = 0, cur = null, active = -1, user = false, hintT = 0;
  function press(i) {
    active = i;
    qs.forEach((b, k) => { on(b, 'is-on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
    show(qs[i]);
  }
  // Phones: the chosen question slides into view in its row
  const show = b => { if (row.scrollWidth > row.clientWidth + 2) row.scrollTo({ left: Math.max(0, b.offsetLeft - 14), behavior: anim ? 'smooth' : 'auto' }); };
  const fit = () => { const o = line.offsetWidth - field.clientWidth; line.style.transform = o > 0 ? `translateX(${-o - 2}px)` : ''; };
  const type = t => { typed.textContent = t; on(chat, 'is-typing', !!t); fit(); };

  async function ask(i, auto) {
    const my = ++run, fast = !auto;
    clearTimeout(hintT); qs.forEach(b => on(b, 'is-hint', false));
    if (cur && !cur.done) finish(cur);
    press(i);
    if (!auto) { user = true; tell('q-' + qs[i].dataset.geoId); }
    if (!anim) {
      const x = cur = build(i);
      thread.append(x.ex); x.done = true; lightAll(x.c);
      pin = $('.geo-u', x.ex); aim(x.ex);
      live.textContent = said(i);
      return;
    }
    // A click answers a little faster than the first, automatic question
    const q = qs[i].textContent, gone = () => my !== run, k = fast ? .75 : 1;
    if (fast) { on(qs[i], 'is-tap', false); void qs[i].offsetWidth; on(qs[i], 'is-tap'); }
    // The question is typed into the composer
    type(''); on(chat, 'is-focus');
    await wait(fast ? 100 : 350); if (gone()) return;
    for (let k = 1; k <= q.length; k++) {
      type(q.slice(0, k));
      await wait(fast ? 7 + Math.random() * 8 : 26 + Math.random() * 24); if (gone()) return;
    }
    await wait(fast ? 140 : 320); if (gone()) return;
    // … and sent
    send.classList.add('is-press'); setTimeout(() => send.classList.remove('is-press'), 180);
    type(''); on(chat, 'is-focus', false);
    if (!chat.classList.contains('is-leaving')) { on(chat, 'is-leaving'); setTimeout(() => on(chat, 'is-started'), 650); }
    const x = cur = build(i);
    thread.append(x.ex);
    fly($('.geo-u', x.ex));
    on(x.ex, 'is-sent');
    aim($('.geo-u', x.ex));
    dark(); status(''); step(1);
    await wait(fast ? 200 : 260); if (gone()) return;
    // Thinking, then reading the sources
    x.say.textContent = 'Tænker';
    on(x.ex, 'is-think'); on(x.a, 'is-think'); aim(x.say);
    await wait(fast ? 380 : 600); if (gone()) return;
    x.say.textContent = 'Læser kilder'; status('Læser …', 1);
    on(panel, 'is-scan', false); void panel.offsetWidth; on(panel, 'is-scan');
    await wait(fast ? 560 : 900); if (gone()) return;
    on(x.a, 'is-think', false); on(panel, 'is-scan', false); status('');
    // The answer, word by word; a source lights up where it is used
    let last = null;
    for (const t of x.toks) {
      on(t, 'is-on');
      const li = t.closest('li, .geo-tbl'); if (li) on(li, 'is-on');
      if (last) last.classList.remove('is-last');
      last = t.classList.contains('gw') ? t : null;
      if (last) on(last, 'is-last');
      if (t.dataset.src) light(t.dataset.src, t.textContent, true);
      aim(t);
      const w = t.textContent;
      await wait(k * (t.dataset.src ? 210 : t.matches('.geo-tr') ? 250 : 20 + Math.random() * 28 + (/[.:!?]$/.test(w) ? 140 : /,$/.test(w) ? 70 : 0)));
      if (gone()) return;
    }
    if (last) last.classList.remove('is-last');
    step(2);
    // The sources pop in, and the name gets its marker
    aim(x.list || x.c);
    for (const li of x.srcs) { on(li, 'is-on'); await wait(90); if (gone()) return; }
    $$('strong', x.c).forEach(s => on(s, 'is-hl'));
    x.done = true; status(used(x.c));
    step(3);
    if (user) live.textContent = said(i);
    // The first time: point at the next question
    else hintT = setTimeout(() => {
      if (gone()) return;
      const b = qs[(i + 1) % qs.length];
      on(b, 'is-hint'); show(b);
      hintT = setTimeout(() => on(b, 'is-hint', false), 4300);
    }, 900);
  }
  // The question leaves the composer and lands as a bubble
  function fly(u) {
    if (!u.animate) return;
    const d = field.getBoundingClientRect().top - u.getBoundingClientRect().top;
    u.animate([{ transform: `translateY(${Math.max(0, d)}px) scale(.88)`, opacity: 0 }, { opacity: 1, offset: .3 }, { transform: 'none', opacity: 1 }], { duration: 640, easing: 'cubic-bezier(.2,1,.3,1.12)' });
  }

  qs.forEach((b, i) => b.addEventListener('click', () => { if (i !== active) ask(i, false); }));
  // Phones: the row of questions fades only where there is more to swipe to
  const edges = () => { const l = row.scrollLeft; on(row, 'is-l', l < 4); on(row, 'is-r', l > row.scrollWidth - row.clientWidth - 4); };
  row.addEventListener('scroll', edges, { passive: true });
  new ResizeObserver(edges).observe(row);
  $('[data-geo-cta]').addEventListener('click', () => tell('cta'));

  /* Start */
  new ResizeObserver(kick).observe(thread);
  new ResizeObserver(kick).observe(body);
  if (!anim) { active = 0; cur = { done: true }; pin = $('.geo-u', thread); aim(thread.firstElementChild); return; }
  sec.classList.add('is-anim');
  thread.textContent = '';
  qs.forEach(b => { on(b, 'is-on', false); b.setAttribute('aria-pressed', 'false'); });
  dark(); status('');
  // Plays once, when most of the chat is on screen
  const io = new IntersectionObserver(es => {
    const e = es[es.length - 1];
    if (!e.isIntersecting || (e.intersectionRatio < .7 && e.intersectionRect.height < innerHeight * .55)) return;
    io.disconnect();
    if (active < 0) ask(0, true);
  }, { threshold: [0, .2, .4, .55, .7, .85, 1] });
  io.observe(chat);
}
