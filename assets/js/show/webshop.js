// /services/webshop (udkast): the price calculator for a webshop on Shopify, with a live example shop.
// The markup comes from scripts/services/pages/webshop.mjs; this module makes it work: the product slider,
// the choices, the price lines and totals, the tips, the example shop, and the summary that goes into the
// contact form. Analytics: only calc_change (which field and which choice, never typed text) and calc_cta.
import { track } from '/assets/js/analytics.js';
import { KANAL } from '/assets/js/content.js';

// PRICES:start (scripts/services/pages/webshop.mjs reads this block, so the copy on the page says the same)
// Our proposal, in kroner ex. VAT. Change a number here, then run: node scripts/services/build.mjs webshop
const PRICES = {
  base: 12995,        // Webshop på Shopify, one-off: up to `included` products, a theme in the brand, payment
                      // (card, MobilePay, Apple Pay), shipping, terms, cookies and GDPR, Google Analytics and
                      // Search Console, front page, about, contact and FAQ
  included: 25,       // products in the base price
  perProduct: 35,     // each product above `included` that we create from the customer's photos and texts
  import: 2995,       // import from a file or the old webshop, whatever the number
  variants: 1995,     // sizes, colours …
  texts: 79,          // product texts written by us, per product
  unique: 9995,       // a unique design instead of the adapted theme
  language: 2995,     // each extra language and currency
  languages: 3,       // at most
  integration: 1995,  // each integration
  b2b: 4995,          // B2B and dealer prices
  subscriptions: 2995,
  migration: 4995,    // customers, orders and redirects from another platform
  service: 699,       // Webshop-service, a month
  channel: KANAL      // advertising a month, { first, extra }: the same as on the rest of the site (content.js)
};
// The product slider: [position 0–1000, products]. Most shops have a few hundred, so they get most of the track
const SCALE = [[0, 1], [120, 25], [400, 100], [600, 250], [750, 500], [880, 1000], [1000, 2000]];
// PRICES:end
export { PRICES, SCALE };

const root = document.querySelector('.show--webshop');
if (root) init(root);

function init(root) {
  const P = PRICES, motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('da-DK'), kr = n => fmt(n) + ' kr.';
  const stk = n => `${fmt(n)} ${n === 1 ? 'produkt' : 'produkter'}`;
  const list = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' og ' + a[a.length - 1] : a.join('');
  const MAX = SCALE[SCALE.length - 1][1];

  // Slider position ↔ products (whole products, then steps of 5, 10 and 25 as the numbers grow)
  const toN = s => {
    for (let i = 1; i < SCALE.length; i++) {
      const [s0, n0] = SCALE[i - 1], [s1, n1] = SCALE[i];
      if (s <= s1) { const n = n0 + (n1 - n0) * (s - s0) / (s1 - s0), q = n < 100 ? 1 : n < 500 ? 5 : n < 1000 ? 10 : 25; return clamp(Math.round(n / q) * q, 1, MAX); }
    }
    return MAX;
  };
  const toS = n => {
    for (let i = 1; i < SCALE.length; i++) { const [s0, n0] = SCALE[i - 1], [s1, n1] = SCALE[i]; if (n <= n1) return s0 + (s1 - s0) * (n - n0) / (n1 - n0); }
    return 1000;
  };

  const range = $('[data-ws-range]'), num = $('[data-ws-n]'), side = $('[data-ws-side]'), sum = $('[data-ws-sum]'), opts = $('.calc__opts');
  const shop = $('[data-ws-shop]'), bar = $('[data-ws-bar]'), lines = $('[data-ws-lines]'), stepbox = $('[data-ws-stepbox]');
  const tip = $('[data-ws-tip]'), toastEl = $('[data-ws-toast]'), live = $('[data-ws-live]');
  const T = { once: $('[data-ws-once]'), md: $('[data-ws-md]'), b1: $('[data-ws-bar1]'), b2: $('[data-ws-bar2]'), n: $('[data-ws-shopn]') };
  const D = { once: $('[data-ws-d1]'), md: $('[data-ws-d2]'), bar: $('[data-ws-d3]') };
  const S = { n: P.included, sprog: 0, ads: [] };
  const inputs = name => $$(`input[name="${name}"]`), on = name => inputs(name).filter(i => i.checked);
  const val = name => (on(name)[0] || {}).value, has = name => on(name).length > 0;
  const nameOf = i => i.closest('label').querySelector('b').textContent;

  // Everything chosen, as lines: { key, t (label), once, md, s (short, for the form), sub }
  const calc = () => {
    const n = S.n, extra = Math.max(0, n - P.included), imp = val('metode') === 'import', L = [];
    const add = (key, t, once, md, s, sub = '') => L.push({ key, t, once: once || 0, md: md || 0, s, sub });
    add('base', 'Webshop på Shopify', P.base, 0, 'Webshop på Shopify');
    add('prod', stk(n) + (imp ? ', import' : extra ? `, ${fmt(extra)} oprettet ekstra` : ''), imp ? P.import : extra * P.perProduct, 0, stk(n) + (imp ? ' med import' : ''));
    if (has('varianter')) add('var', 'Varianter', P.variants, 0, 'varianter');
    if (has('tekster')) add('txt', `Produkttekster til ${stk(n)}`, n * P.texts, 0, 'produkttekster');
    if (val('design') === 'unikt') add('design', 'Unikt design', P.unique, 0, 'unikt design');
    if (S.sprog) add('sprog', `${S.sprog} ekstra sprog og ${S.sprog > 1 ? 'valutaer' : 'valuta'}`, S.sprog * P.language, 0, `${S.sprog} ekstra sprog`);
    const ig = on('integ');
    if (ig.length) add('integ', ig.length > 1 ? `${ig.length} integrationer` : nameOf(ig[0]), ig.length * P.integration, 0,
      ig.length > 1 ? `${ig.length} integrationer` : nameOf(ig[0]).toLocaleLowerCase('da-DK'), ig.length > 1 ? ig.map(nameOf).join(', ') : '');
    on('fn').forEach(i => add('fn-' + i.value, nameOf(i), P[i.value], 0, i.dataset.s || nameOf(i)));
    if (has('service')) add('service', 'Webshop-service', 0, P.service, 'Webshop-service');
    S.ads.forEach((v, k) => { const t = nameOf(inputs('ads').find(i => i.value === v)); add('ad-' + v, t, 0, k ? P.channel.extra : P.channel.first, t); });
    return { L, n, extra, imp, once: L.reduce((a, l) => a + l.once, 0), md: L.reduce((a, l) => a + l.md, 0) };
  };
  const lineVal = l => l.md ? kr(l.md) + '/md.' : l.once ? kr(l.once) : 'Med i prisen';
  const total = r => kr(r.once) + (r.md ? ` + ${kr(r.md)}/md.` : '');
  const extras = () => ['varianter', 'tekster', 'integ', 'fn', 'service'].reduce((a, n) => a + on(n).length, 0) + S.ads.length + S.sprog + (val('design') === 'unikt' ? 1 : 0);

  // The price on each choice, live
  const adPrice = v => { const k = S.ads.indexOf(v); return (k < 0 ? (S.ads.length ? '+' + kr(P.channel.extra) : kr(P.channel.first)) : kr(k ? P.channel.extra : P.channel.first)) + '/md.'; };
  const optPrice = (k, r) => k.startsWith('ad:') ? adPrice(k.slice(3)) : {
    opret: r.extra ? '+' + kr(r.extra * P.perProduct) : 'Med i prisen', import: '+' + kr(P.import), varianter: '+' + kr(P.variants),
    tekster: '+' + kr(r.n * P.texts), tema: 'Med i prisen', unikt: '+' + kr(P.unique), sprog: S.sprog ? '+' + kr(S.sprog * P.language) : 'Kun dansk',
    integ: '+' + kr(P.integration), b2b: '+' + kr(P.b2b), subscriptions: '+' + kr(P.subscriptions), migration: '+' + kr(P.migration), service: kr(P.service) + '/md.'
  }[k];

  // Numbers roll to their new value (a quick count, like the website calculator)
  const tweens = new Set();
  const roll = (el, to, sfx = ' kr.', now) => {
    if (!el) return;
    const t = el._ws || (el._ws = { el, cur: to, to: null });
    t.sfx = sfx;
    if (t.to === to) return;
    t.to = to;
    if (!motion || now) { t.cur = to; tweens.delete(t); el.textContent = fmt(to) + sfx; return; }
    t.from = t.cur; t.t0 = performance.now(); tweens.add(t); wake();
  };
  // "+1.995 kr." floats up from a total when it changes
  const delta = (el, d, sfx = ' kr.') => {
    if (!motion || !el || !d) return;
    el.textContent = (d > 0 ? '+' : '−') + kr(Math.abs(d)) + sfx;
    el.classList.toggle('is-neg', d < 0);
    el.classList.remove('is-go'); void el.offsetWidth; el.classList.add('is-go');
  };
  // A small message in the example shop when something is switched on (only where it can be seen)
  const TOAST = {
    import: n => `${stk(n)} importeret`, varianter: 'Varianter: eg, valnød og ask', tekster: n => `Tekster skrevet til ${stk(n)}`, unikt: 'Dit eget design er klar',
    fragt: 'Fragtlabel klar til ordre #1043', regnskab: 'Ordre #1043 er bogført', nyhedsbrev: 'Ny tilmelding til nyhedsbrevet', feed: n => `${stk(n)} sendt til Google og Meta`,
    anmeldelser: 'Ny anmeldelse fra en kunde', b2b: 'Forhandler logget ind med egne priser', subscriptions: 'Nyt abonnement på træolie', migration: 'Kunder, ordrer og links er flyttet med',
    service: 'Webshoppen er opdateret', sprog: k => `Shoppen findes nu på ${k + 1} sprog`, gsa: 'Dine varer vises på Google Shopping', gads: 'Din annonce vises på Google', meta: 'Din annonce vises på Facebook og Instagram'
  };
  const toast = (key, arg) => {
    const m = TOAST[key]; if (!motion || !toastEl || !m) return;
    const r = shop.getBoundingClientRect(); if (r.bottom < 90 || r.top > innerHeight - 60) return;
    toastEl.querySelector('span').textContent = typeof m === 'function' ? m(arg) : m;
    toastEl.classList.remove('is-on'); void toastEl.offsetWidth; toastEl.classList.add('is-on');
  };

  // Write the choice into the contact form: the full summary (totals first, /api/contact keeps 300 characters)
  const form = document.querySelector('[data-form]'), thanks = document.querySelector('[data-thanks]');
  const writeForm = (r, user) => {
    const ci = document.querySelector('[data-chosen-input]'), cv = document.querySelector('[data-chosen-val]'), cb = document.querySelector('[data-chosen]');
    if (!ci) return;
    ci.value = `Webshop: ${total(r)}, ekskl. moms · ` + r.L.map(l => `${l.t}: ${lineVal(l)}`).join(' · ');
    if (cv) cv.textContent = `${r.L[0].s} med ${list(r.L.slice(1).map(l => l.s))} · ${total(r)}`;
    if (cb) cb.hidden = false;
    // Changing the choice after a sent message opens the form again (as on /services/hjemmesider)
    if (user && form && thanks && !thanks.hidden) { form.hidden = false; thanks.hidden = true; }
  };

  let prev = null, keys = null, liveT = 0;
  // how: '' first draw · 'slide' the slider · 'type' the number field · 'user' a discrete choice
  const sync = (how = '') => {
    const r = calc();
    $$('.calc__opt').forEach(l => { const i = l.querySelector('input'); if (i) l.classList.toggle('is-on', i.checked); });
    $$('[data-ws-p]').forEach(e => { const t = optPrice(e.dataset.wsP, r); if (t != null && e.textContent !== t) e.textContent = t; });
    // Products: slider (left alone while it is dragged), number, marks
    if (how !== 'slide') range.value = toS(r.n);
    range.style.setProperty('--s', (+range.value / 1000).toFixed(4));
    range.setAttribute('aria-valuetext', stk(r.n));
    if (document.activeElement !== num) num.value = fmt(r.n);
    $$('[data-ws-tick]').forEach(b => b.classList.toggle('is-on', +b.dataset.wsTick === r.n));
    // Languages
    $('[data-ws-sprog]').textContent = S.sprog;
    stepbox.classList.toggle('is-on', S.sprog > 0);
    $$('[data-ws-step]').forEach(b => { const k = S.sprog + +b.dataset.wsStep; b.disabled = k < 0 || k > P.languages; });
    // Tips: the cheaper way to get the products in, and the advertising channels
    const c = r.extra * P.perProduct;
    let html = '', pick = '';
    if (!r.imp && c > P.import) { html = `Har du produkterne i en fil eller en gammel webshop? Så er import <b>${kr(c - P.import)}</b> billigere.`; pick = 'import'; }
    else if (r.imp && c < P.import) { html = r.extra ? `Med ${stk(r.n)} er det <b>${kr(P.import - c)}</b> billigere, at vi opretter dem.` : `Op til ${P.included} produkter opretter vi uden ekstra pris.`; pick = 'opret'; }
    tip.hidden = !html;
    if (html) {
      const b = tip.querySelector('button');
      tip.querySelector('span').innerHTML = html;
      b.dataset.wsPick = pick; b.textContent = pick === 'import' ? 'Skift til import' : 'Lad os oprette dem';
    }
    const k = S.ads.length;
    $('[data-ws-adtip]').innerHTML = k === 0 ? `Første kanal ${kr(P.channel.first)}/md. Hver ekstra kanal kun ${kr(P.channel.extra)}/md.`
      : k === 1 ? `Tag en kanal mere for kun <b>${kr(P.channel.extra)}/md.</b>` : `Du sparer <b>${kr((P.channel.first - P.channel.extra) * (k - 1))}/md.</b> ved at samle ${k} kanaler hos os.`;
    // Price lines (a new one slides in) and totals
    const nk = new Set(r.L.map(l => l.key));
    lines.innerHTML = r.L.map(l => `<div class="calc__line${keys && motion && !keys.has(l.key) ? ' is-new' : ''}"><span>${esc(l.t)}${l.sub ? `<small>${esc(l.sub)}</small>` : ''}</span><span>${esc(lineVal(l))}</span></div>`).join('');
    keys = nk;
    roll(T.once, r.once, ' kr.', !how); roll(T.md, r.md, ' kr.', !how);
    roll(T.b1, r.once, ' kr.', !how); roll(T.b2, r.md, ' kr./md.', !how);
    T.b2.parentNode.hidden = !r.md;
    if (how === 'user' && prev) { delta(D.once, r.once - prev.once); delta(D.bar, r.once - prev.once); delta(D.md, r.md - prev.md, ' kr./md.'); }
    // The example shop
    if (shop) {
      const fn = on('fn').map(i => i.value);
      shop.classList.toggle('is-var', has('varianter')); shop.classList.toggle('is-txt', has('tekster'));
      shop.classList.toggle('is-unikt', val('design') === 'unikt');
      shop.classList.toggle('is-b2b', fn.includes('b2b')); shop.classList.toggle('is-abo', fn.includes('subscriptions'));
      $$('[data-ws-tile]').forEach((t, i) => t.classList.toggle('is-off', i >= r.n));
      $$('[data-ws-lang]').forEach((l, i) => l.classList.toggle('is-off', i > S.sprog));
      roll(T.n, r.n, '', !how);
    }
    writeForm(r, !!how);
    if (how) { clearTimeout(liveT); liveT = setTimeout(() => { live.textContent = `Engangsbeløb ${kr(r.once)}. Pr. måned ${kr(r.md)}.`; }, 700); }
    prev = r;
    fit();
    return r;
  };

  // Tracking: which field, and which choice (ids and counts, never typed text)
  const FIELD = { metode: 'metode', varianter: 'varianter', tekster: 'tekster', design: 'design', integ: 'integration', fn: 'funktion', service: 'service', ads: 'annoncering' };
  let nT = 0, from = null;
  const trackN = () => { clearTimeout(nT); nT = setTimeout(() => track('calc_change', { field: 'produkter', value: S.n }), 1200); };
  // The products: the end of a drag, or of typing, shows the change once and is tracked once
  const setN = (n, how) => { if (from === null && prev) from = prev.once; S.n = clamp(Math.round(n) || 1, 1, MAX); sync(how); };
  const commitN = () => { if (from === null || !prev) return; delta(D.once, prev.once - from); delta(D.bar, prev.once - from); from = null; trackN(); };

  range.addEventListener('input', () => setN(toN(+range.value), 'slide'));
  range.addEventListener('change', commitN);
  num.addEventListener('focus', () => { num.value = String(S.n); requestAnimationFrame(() => num.select()); });
  num.addEventListener('input', () => { const v = parseInt(num.value.replace(/\D/g, ''), 10); if (v > 0) setN(v, 'type'); });
  num.addEventListener('blur', () => { num.value = fmt(S.n); commitN(); });
  num.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); num.blur(); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setN(S.n + (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1), 'type'); num.value = String(S.n); }
  });

  const goTo = (el, off) => { if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - off, behavior: motion ? 'smooth' : 'auto' }); };
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-ws-tick], [data-ws-step], [data-ws-pick], [data-ws-go], [data-ws-bar]');
    if (!t) return;
    if (t.dataset.wsTick) { const n = +t.dataset.wsTick; if (n === S.n) return; S.n = n; sync('user'); trackN(); }
    else if (t.dataset.wsStep) {
      const k = clamp(S.sprog + +t.dataset.wsStep, 0, P.languages); if (k === S.sprog) return;
      const up = k > S.sprog; S.sprog = k; sync('user');
      if (up) toast('sprog', k);
      track('calc_change', { field: 'sprog', value: k });
    } else if (t.dataset.wsPick) {
      const i = inputs('metode').find(x => x.value === t.dataset.wsPick);
      if (i) { i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); }
    } else if (t.hasAttribute('data-ws-go')) {
      const r = calc(); writeForm(r, false);
      track('calc_cta', { package: 'webshop', addons_total: extras(), value: r.once + r.md, currency: 'DKK' });
      goTo(document.getElementById('kontakt'), 80);
    } else goTo(sum, 90);
  });
  root.addEventListener('change', e => {
    const i = e.target; if (!i.name || !FIELD[i.name]) return;
    if (i.name === 'ads') S.ads = i.checked ? [...S.ads.filter(v => v !== i.value), i.value] : S.ads.filter(v => v !== i.value);
    const r = sync('user');
    if (i.checked) toast(i.value, r.n);
    track('calc_change', { field: FIELD[i.name], value: i.value, ...(i.type === 'checkbox' ? { selected: i.checked ? 'ja' : 'nej' } : {}) });
  });

  // The column with the shop and the price stays in view; when it is taller than the screen, its bottom
  // (the totals and the button) is the part that stays
  function fit() {
    if (!side || !side.offsetHeight) return;
    side.style.setProperty('--ws-top', Math.min(96, innerHeight - side.offsetHeight - 16) + 'px');
  }
  // Phones and tablets: a small bar with the price while the choices are on screen
  const barTick = () => {
    if (!bar) return;
    const o = opts.getBoundingClientRect(), s = sum.getBoundingClientRect();
    bar.classList.toggle('is-on', innerWidth <= 900 && o.top < innerHeight * 0.5 && s.top > innerHeight - 24);
  };

  // Frame loop: rolling numbers, and the example shop building itself as it scrolls into view
  const parts = shop ? [...shop.querySelectorAll('[data-wb]')] : [];
  let raf = 0, near = false, primed = false;
  function wake() { if (!raf) raf = requestAnimationFrame(frame); }
  function frame(now) {
    raf = 0;
    let busy = false;
    tweens.forEach(t => {
      const k = Math.min(1, (now - t.t0) / 600);
      t.cur = t.from + (t.to - t.from) * ease(k);
      t.el.textContent = fmt(t.cur) + t.sfx;
      if (k >= 1) tweens.delete(t); else busy = true;
    });
    if (motion && near && parts.length) {
      const b = clamp((innerHeight * 0.92 - shop.getBoundingClientRect().top) / (innerHeight * 0.42), 0, 1);
      parts.forEach((p, i) => {
        const t = clamp((b - i * 0.06) / 0.3, 0, 1);
        p._c = primed ? p._c + (t - p._c) * 0.16 : t;
        if (Math.abs(t - p._c) < 0.002) p._c = t; else busy = true;
        p.style.opacity = p._c;
        p.style.transform = p._c < 1 ? `translateY(${((1 - p._c) * 22).toFixed(1)}px) scale(${(0.92 + 0.08 * p._c).toFixed(3)})` : '';
      });
      primed = true;
    }
    if (busy) wake();
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { near = es[0].isIntersecting; if (near) wake(); }, { rootMargin: '200px 0px' }).observe(root);
  addEventListener('scroll', () => { if (near) wake(); barTick(); }, { passive: true });
  addEventListener('resize', () => { fit(); barTick(); });
  if (side && 'ResizeObserver' in window) new ResizeObserver(fit).observe(side);

  sync('');
  barTick();
  // main.js writes the form's "Du har valgt" when it loads; ours replaces it, also once everything has loaded
  addEventListener('load', () => writeForm(calc(), false));
}
