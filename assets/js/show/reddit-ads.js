// Reddit Ads showcase (/services/reddit-ads): a community thread. A forum of our own drawing with three communities
// (kaffe, halvmaraton, selvbyg). In each, a promoted post from a made-up brand sits among the members' posts.
// In view, the comments arrive one by one, the votes tick up, and "Svar" lights up beside the critical comment:
// a tap types our answer in the brand's name, it lands, and the critic answers back. The tabs (and the side menu)
// switch community. Brands, users and numbers are examples. Without motion: every thread finished, answer included.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--reddit-ads');
if (root) init(root);

function init(root) {
  const SC = 'reddit-ads', motion = document.documentElement.classList.contains('motion');
  const $ = (s, el = root) => el.querySelector(s), $$ = (s, el = root) => [...el.querySelectorAll(s)];
  const ev = action => track('showcase_interact', { showcase: SC, action });
  const done = new Set(), step = n => { if (!done.has(n)) { done.add(n); track('showcase_step', { showcase: SC, step: n }); } };
  const bump = el => { if (!motion) return; el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); };

  const tabs = $$('[data-rd-tab]'), tones = $$('[data-rd-tone]'), name = $('[data-rd-name]'), q = $('[data-rd-q]'), win = $('[data-rd-win]');
  const S = {};
  $$('[data-rd-com]').forEach(el => {
    const k = el.dataset.rdCom, mine = $('[data-rd-mine]', el);
    const s = S[k] = {
      k, el, mine, rep: $('[data-rd-rep]', el), back: $('[data-rd-back]', el), reply: $('[data-rd-reply]', el),
      cs: $$('[data-rd-c]', el), votes: $('[data-rd-votes]', el), cn: $('[data-rd-cn]', el), up: $('[data-rd-up]', el),
      type: $('[data-rd-type]', el), text: $('[data-rd-text]', mine).textContent, scroll: $('[data-rd-scroll]', el),
      mv: $('[data-rd-mv]', mine), to: 0, v: 0, n: 0, mine0: 0, state: 0 // 0 waiting, 1 arriving, 2 arrived, 3 answering, 4 answered
    };
    s.to = +s.votes.textContent; s.mine0 = +s.mv.dataset.to;
  });
  let cur = (tabs.find(t => t.classList.contains('is-on')) || tabs[0]).dataset.rdTab, inView = false, started = false;

  /* ---------------- Numbers ---------------- */
  const show = s => { s.votes.textContent = s.v + (s.up.getAttribute('aria-pressed') === 'true' ? 1 : 0); };
  const count = s => { s.cn.textContent = s.n; bump(s.cn); };

  /* ---------------- The comments arrive ---------------- */
  const arrive = s => {
    if (s.state) return;
    s.state = 1;
    s.cs.forEach((c, i) => setTimeout(() => {
      c.classList.remove('is-out'); c.inert = false;
      s.n++; count(s);
      if (i === s.cs.length - 1 && s.state === 1) { s.state = 2; s.el.classList.add('is-hint'); step(2); }
    }, 700 + i * 950));
  };

  /* ---------------- Svar: our answer, typed in the brand's name ---------------- */
  const answer = s => {
    if (s.state === 4) { s.mine.focus({ preventScroll: true }); flash(s.mine); return; }
    if (s.state === 3) return;
    s.state = 3;
    s.el.classList.remove('is-hint');
    s.rep.hidden = false;
    s.rep.classList.add('is-typing');
    const t0 = performance.now(), D = Math.min(2600, s.text.length * 16);
    const tick = now => {
      const k = Math.min(1, (now - t0) / D);
      s.type.textContent = s.text.slice(0, Math.round(s.text.length * k));
      if (k < 1) return requestAnimationFrame(tick);
      const go = $('.rd-cmp__go', s.el);
      setTimeout(() => go.classList.add('is-press'), 250);
      setTimeout(() => post(s), 650);
    };
    requestAnimationFrame(tick);
    keepInView(s);
  };
  const post = s => {
    s.rep.classList.remove('is-typing');
    s.mine.classList.add('is-new');
    s.n++; count(s);
    // Our answer gets voted up, then the critic answers back
    let m = 1;
    s.mv.textContent = m;
    const climb = () => { if (m >= s.mine0) return; m++; s.mv.textContent = m; bump(s.mv); setTimeout(climb, 90 + Math.random() * 160); };
    setTimeout(climb, 700);
    setTimeout(() => { s.back.classList.remove('is-out'); s.back.inert = false; s.n++; count(s); s.state = 4; keepInView(s); step(3); }, 1700);
    keepInView(s);
  };
  // In the wide layout the thread scrolls on its own: keep the newest part in view
  const keepInView = s => {
    const box = s.scroll;
    if (box.scrollHeight - box.clientHeight < 2) return;
    requestAnimationFrame(() => box.scrollTo({ top: box.scrollHeight, behavior: motion ? 'smooth' : 'auto' }));
  };
  let ft = 0;
  const flash = el => { el.classList.add('is-flash'); clearTimeout(ft); ft = setTimeout(() => el.classList.remove('is-flash'), 1600); };
  Object.values(S).forEach(s => s.reply.addEventListener('click', () => { ev('svar'); answer(s); }));

  /* ---------------- Votes: tick while in view; the visitor can vote too ---------------- */
  let vt = 0;
  const tickVotes = () => {
    clearTimeout(vt);
    if (!inView || !motion) return;
    const s = S[cur];
    if (s.v < s.to) { s.v++; show(s); bump(s.votes); }
    vt = setTimeout(tickVotes, s.v < s.to ? 380 + Math.random() * 700 : 2500 + Math.random() * 3000);
  };
  Object.values(S).forEach(s => s.up.addEventListener('click', () => {
    const on = s.up.getAttribute('aria-pressed') !== 'true';
    s.up.setAttribute('aria-pressed', String(on));
    s.up.parentElement.classList.toggle('is-up', on);
    show(s); bump(s.votes);
    ev('stem-op');
  }));

  /* ---------------- Communities ---------------- */
  const playVideo = () => Object.values(S).forEach(s => {
    const v = $('video', s.el);
    if (!v) return;
    if (motion && inView && s.k === cur) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
  });
  const pick = k => {
    if (k === cur || !S[k]) return;
    cur = k;
    tabs.forEach(t => { const on = t.dataset.rdTab === k; t.classList.toggle('is-on', on); if (!t.hasAttribute('tabindex')) t.setAttribute('aria-pressed', String(on)); });
    Object.values(S).forEach(s => { s.el.hidden = s.k !== k; s.el.classList.remove('is-enter'); });
    tones.forEach(l => { l.hidden = l.dataset.rdTone !== k; l.classList.remove('is-enter'); });
    name.textContent = 'r/' + k;
    q.textContent = 'Søg i r/' + k;
    if (motion) {
      void root.offsetWidth;
      S[k].el.classList.add('is-enter');
      $(`[data-rd-tone="${k}"]`).classList.add('is-enter');
    }
    if (started) arrive(S[k]);
    playVideo();
    tickVotes();
  };
  tabs.forEach(t => t.addEventListener('click', () => { if (t.dataset.rdTab !== cur) ev('faellesskab-' + t.dataset.rdTab); pick(t.dataset.rdTab); }));

  /* ---------------- Start ---------------- */
  if (motion && 'IntersectionObserver' in window) {
    // The static HTML is the finished thread: hide what is to come
    Object.values(S).forEach(s => {
      // Not yet arrived: invisible, and out of reach for the keyboard too
      s.cs.forEach(c => { c.classList.add('is-out'); c.inert = true; });
      s.back.classList.add('is-out'); s.back.inert = true;
      s.rep.hidden = true;
      s.v = s.to - 30 - Math.round(Math.random() * 8); show(s);
      s.n = 0; s.cn.textContent = 0;
    });
    const io = new IntersectionObserver(es => es.forEach(e => {
      inView = e.isIntersecting && e.intersectionRatio >= .25;
      if (inView && !started) { started = true; step(1); arrive(S[cur]); }
      playVideo();
      tickVotes();
    }), { threshold: [0, .25] });
    io.observe(win);
  } else {
    // Everything finished; Svar brings the answer into focus
    Object.values(S).forEach(s => { s.v = s.to; s.n = s.cs.length + 2; s.state = 4; });
    step(1);
  }
}
