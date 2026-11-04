// Behaviour of the section library on the service pages (markup: scripts/services/lib.mjs, styles:
// assets/css/sections.css). Each part does nothing unless its section is on the page. main.js keeps
// doing what it always does here: reveals, the rolling price (data-odo), counting numbers (data-count),
// the FAQ, the add-on buttons (data-toggle) and the contact form.
// Without html.motion (reduced motion) nothing moves: every section is shown finished.

const motion = document.documentElement.classList.contains('motion');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const phone = () => matchMedia('(max-width: 699px)').matches;

// Runs fn once, when el is far enough into view (at once without motion)
const inView = (el, fn, threshold = 0.3) => {
  if (!motion || !('IntersectionObserver' in window)) return fn();
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold });
  io.observe(el);
};

/* ---------- statement: the words light up, the pill types or clicks ---------- */
$$('[data-stm]').forEach(sec => {
  const typed = $('[data-stm-type]', sec), cta = $('.sx-pill--cursor', sec);
  const full = typed ? typed.textContent : '';
  if (typed && motion) typed.textContent = '';
  inView(sec, () => {
    sec.classList.add('is-on');
    if (!motion) return;
    const at = el => (+getComputedStyle(el.closest('.sx-w')).getPropertyValue('--i') || 0) * 70 + 380;
    if (typed) {
      const pill = typed.closest('.sx-pill');
      setTimeout(() => {
        pill.classList.add('is-typing');
        let k = 0;
        const tick = () => { typed.textContent = full.slice(0, ++k); if (k < full.length) setTimeout(tick, 45 + Math.random() * 50); else setTimeout(() => pill.classList.remove('is-typing'), 1400); };
        tick();
      }, at(typed));
    }
    if (cta) setTimeout(() => cta.classList.add('is-click'), at(cta) + 700);
  }, 0.35);
});

/* ---------- compare: uden / med (a switch on phones) ---------- */
$$('[data-vs]').forEach(sec => {
  const board = $('[data-vs-board]', sec), btns = $$('[data-vs-go]', sec);
  let touched = false;
  const show = v => {
    if (board.dataset.show === v) return;
    board.dataset.show = v;
    btns.forEach(b => { const on = b.dataset.vsGo === v; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    if (motion) { board.classList.remove('is-swap'); void board.offsetWidth; board.classList.add('is-swap'); }
  };
  btns.forEach(b => b.addEventListener('click', () => { touched = true; show(b.dataset.vsGo); }));
  // On a phone the story starts without, and turns to with by itself (once, unless someone taps first)
  if (motion && phone()) show('uden');
  inView(sec, () => {
    sec.classList.add('is-on');
    if (motion && phone()) setTimeout(() => { if (!touched) show('med'); }, 2800);
  }, 0.25);
});

/* ---------- facts, band: in when seen ---------- */
$$('[data-facts]').forEach(sec => inView(sec, () => sec.classList.add('is-on'), 0.35));
$$('[data-band]').forEach(sec => {
  inView(sec, () => sec.classList.add('is-on'), 0.3);
  const more = $('[data-band-more]', sec), all = $('[data-band-all]', sec);
  if (more) more.addEventListener('click', () => {
    const open = more.getAttribute('aria-expanded') !== 'true';
    more.setAttribute('aria-expanded', String(open));
    all.classList.toggle('is-open', open);
    more.firstChild.textContent = open ? 'Vis mindre ' : 'Se alt, der er med ';
  });
});

/* ---------- receipt: prints when seen ---------- */
$$('[data-rcpt]').forEach(sec => inView(sec, () => sec.classList.add('is-on'), 0.3));

/* ---------- timeline: the line draws itself, the steps light up as it passes ---------- */
$$('[data-tl]').forEach(sec => {
  const fill = $('[data-tl-fill]', sec), rail = fill.parentElement, steps = $$('.sx-tl__step', sec);
  const done = () => { steps.forEach(s => s.classList.add('is-lit')); sec.classList.add('is-done'); };
  if (!motion) return done();
  inView(sec, () => {
    // Where each node sits along the line, from 0 to 1
    const vert = phone(), r = rail.getBoundingClientRect();
    const at = steps.map(s => { const n = $('.sx-tl__node', s).getBoundingClientRect(); return clamp(vert ? (n.top + n.height / 2 - r.top) / r.height : (n.left + n.width / 2 - r.left) / r.width); });
    const t0 = performance.now(), dur = 2200;
    const frame = t => {
      const k = clamp((t - t0) / dur), p = ease(k);
      fill.style.transform = vert ? `scaleY(${p})` : `scaleX(${p})`;
      steps.forEach((s, i) => { if (p >= at[i] - 0.01) s.classList.add('is-lit'); });
      if (k < 1) requestAnimationFrame(frame); else sec.classList.add('is-done');
    };
    requestAnimationFrame(frame);
  }, 0.35);
});

/* ---------- marquee: two bands of words, opposite ways; faster while scrolling, slow under the mouse ---------- */
$$('[data-mq]').forEach(sec => {
  if (!motion) return;
  const rows = $$('[data-mq-row]', sec).map(row => {
    const set = row.firstElementChild;
    // Enough copies to cover twice the screen, so the loop never shows a gap
    const n = Math.max(2, Math.ceil((innerWidth * 2) / Math.max(1, set.scrollWidth)) + 1);
    for (let i = 1; i < n; i++) { const c = set.cloneNode(true); c.setAttribute('aria-hidden', 'true'); row.appendChild(c); }
    return { row, set, dir: +row.dataset.dir || -1, x: 0, slow: 1 };
  });
  let on = false, last = scrollY, vel = 0, hover = false;
  new IntersectionObserver(es => { on = es.some(e => e.isIntersecting); if (on) requestAnimationFrame(step); }).observe(sec);
  sec.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
  sec.addEventListener('pointerleave', () => { hover = false; });
  function step() {
    if (!on) return;
    vel += ((scrollY - last) - vel) * 0.12; last = scrollY;
    rows.forEach(r => {
      r.slow += ((hover ? 0.18 : 1) - r.slow) * 0.06;
      const w = r.set.offsetWidth;
      r.x += r.dir * (0.55 + Math.min(6, Math.abs(vel) * 0.25)) * r.slow;
      if (w) { if (r.x <= -w) r.x += w; if (r.x > 0) r.x -= w; }
      r.row.style.transform = `translate3d(${r.x}px,0,0)`;
    });
    requestAnimationFrame(step);
  }
  // The right-moving band starts one set to the left
  rows.forEach(r => { if (r.dir > 0) r.x = -r.set.offsetWidth; });
});

/* ---------- grid: a small summary of what has been added (main.js keeps the real state) ---------- */
$$('[data-grid]').forEach(sec => {
  const sum = $('[data-grid-sum]', sec), txt = $('[data-grid-sum-txt]', sec), form = $('[data-form]');
  const base = form ? form.dataset.base || '' : '';
  let lastTxt = '';
  const sync = () => {
    const added = [...new Set($$('[data-addon].is-added').map(el => el.dataset.addon))];
    sum.hidden = !added.length;
    const t = [base, ...added].filter(Boolean).join(' + ');
    if (t === lastTxt) return;
    txt.textContent = t;
    if (motion && added.length && lastTxt) { sum.classList.remove('is-pop'); void sum.offsetWidth; sum.classList.add('is-pop'); }
    lastTxt = t;
  };
  const mo = new MutationObserver(sync);
  $$('[data-addon]').forEach(el => mo.observe(el, { attributes: true, attributeFilter: ['class'] }));
  sync();
});
