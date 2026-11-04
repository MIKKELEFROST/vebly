// /services/webshop (udkast): the webshop price calculator and its live example shop. The markup is written by
// scripts/services/pages/webshop.mjs. Tracks only calc_change (field and choice, never typed text) and calc_cta.
import { track } from '/assets/js/analytics.js';
import { KANAL } from '/assets/js/content.js';

// PRICES:start (scripts/services/pages/webshop.mjs reads this block, so the copy on the page says the same)
// Our proposal, in kroner ex. VAT. Change a number here, then run: node scripts/services/build.mjs webshop
const PRICES = {
  base: 12995,        // Webshop på Shopify, one-off: up to `included` products, a theme in the brand, payment (card,
                      // MobilePay, Apple Pay), shipping, terms, cookies and GDPR, Google Analytics and Search Console,
                      // front page, about, contact and FAQ
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

const root = document.querySelector('.show--webshop');
if (root) init(root);

function init(root) {
  const P = PRICES, motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('da-DK'), kr = n => fmt(n) + ' kr.';
  const stk = n => `${fmt(n)} ${n === 1 ? 'produkt' : 'produkter'}`;
  const list = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' og ' + a[a.length - 1] : a.join('');
  const MAX = SCALE[SCALE.length - 1][1], MARKS = SCALE.map(([, n]) => n);

  // Slider position ↔ products: whole products, then steps of 5, 10 and 25 as the numbers grow
  const stepOf = n => n < 100 ? 1 : n < 500 ? 5 : n < 1000 ? 10 : 25;
  const seg = (k, v) => { for (let i = 1; i < SCALE.length; i++) if (v <= SCALE[i][k]) return [SCALE[i - 1], SCALE[i]]; return [SCALE[SCALE.length - 2], SCALE[SCALE.length - 1]]; };
  const toN = s => { const [[s0, n0], [s1, n1]] = seg(0, s), n = n0 + (n1 - n0) * (s - s0) / (s1 - s0), q = stepOf(n); return clamp(Math.round(n / q) * q, 1, MAX); };
  const toS = n => { const [[s0, n0], [s1, n1]] = seg(1, n); return s0 + (s1 - s0) * (n - n0) / (n1 - n0); };

  const range = $('[data-ws-range]'), num = $('[data-ws-n]'), side = $('[data-ws-side]'), sum = $('[data-ws-sum]'), opts = $('.calc__opts');
  const shop = $('[data-ws-shop]'), bar = $('[data-ws-bar]'), lines = $('[data-ws-lines]'), tip = $('[data-ws-tip]'), toastEl = $('[data-ws-toast]');
  const T = { once: $('[data-ws-once]'), md: $('[data-ws-md]'), b1: $('[data-ws-bar1]'), b2: $('[data-ws-bar2]'), n: $('[data-ws-shopn]') };
  const S = { n: P.included, sprog: 0, ads: [] };
  const inputs = name => $$(`input[name="${name}"]`), on = name => inputs(name).filter(i => i.checked);
  const val = name => (on(name)[0] || {}).value, has = name => on(name).length > 0;
  const nameOf = i => i.closest('label').querySelector('b').textContent;

  // Everything chosen, as lines: t (label), once, md, s (short, for "Du har valgt"), c (compact, for the e-mail), sub
  const calc = () => {
    const n = S.n, extra = Math.max(0, n - P.included), imp = val('metode') === 'import', L = [];
    const add = (key, t, once, md, s, c = s, sub = '') => L.push({ key, t, once: once || 0, md: md || 0, s, c, sub });
    add('base', 'Webshop på Shopify', P.base, 0, 'Webshop på Shopify');
    add('prod', stk(n) + (imp ? ', import' : extra ? `, ${fmt(extra)} oprettet ekstra` : ''), imp ? P.import : extra * P.perProduct, 0,
      stk(n) + (imp ? ' med import' : ''), stk(n) + (imp ? ' (import)' : extra ? ` (${fmt(extra)} oprettes)` : ''));
    if (has('varianter')) add('var', 'Varianter', P.variants, 0, 'varianter', 'Varianter');
    if (has('tekster')) add('txt', `Produkttekster til ${stk(n)}`, n * P.texts, 0, 'produkttekster', 'Tekster');
    if (val('design') === 'unikt') add('design', 'Unikt design', P.unique, 0, 'unikt design', 'Unikt design');
    if (S.sprog) add('sprog', `${S.sprog} ekstra sprog og ${S.sprog > 1 ? 'valutaer' : 'valuta'}`, S.sprog * P.language, 0, `${S.sprog} ekstra sprog`, `${S.sprog} sprog`);
    const ig = on('integ'), many = ig.length > 1;
    if (ig.length) add('integ', many ? `${ig.length} integrationer` : nameOf(ig[0]), ig.length * P.integration, 0,
      many ? `${ig.length} integrationer` : ig[0].dataset.s, ig.map(i => i.dataset.c).join(' + '), many ? ig.map(nameOf).join(', ') : '');
    on('fn').forEach(i => add('fn-' + i.value, nameOf(i), P[i.value], 0, i.dataset.s, i.dataset.c));
    if (has('service')) add('service', 'Webshop-service', 0, P.service, 'Webshop-service');
    S.ads.forEach((v, k) => { const t = nameOf(inputs('ads').find(i => i.value === v)); add('ad-' + v, t, 0, k ? P.channel.extra : P.channel.first, t); });
    return { L, n, extra, imp, once: L.reduce((a, l) => a + l.once, 0), md: L.reduce((a, l) => a + l.md, 0) };
  };
  const lineVal = l => l.md ? kr(l.md) + '/md.' : l.once ? kr(l.once) : 'Med i prisen';
  const total = r => kr(r.once) + (r.md ? ` + ${kr(r.md)}/md.` : '');
  const extras = () => ['varianter', 'tekster', 'integ', 'fn', 'service'].reduce((a, n) => a + on(n).length, 0) + S.ads.length + S.sprog + (val('design') === 'unikt' ? 1 : 0);

  // The price on each choice, live (a channel costs the first price or the extra one, by the order they are picked)
  const adPrice = v => { const k = S.ads.indexOf(v); return (k < 0 ? (S.ads.length ? '+' + kr(P.channel.extra) : kr(P.channel.first)) : kr(k ? P.channel.extra : P.channel.first)) + '/md.'; };
  const optPrice = (k, r) => k.startsWith('ad:') ? adPrice(k.slice(3)) : {
    opret: r.extra ? '+' + kr(r.extra * P.perProduct) : 'Med i prisen', import: '+' + kr(P.import), varianter: '+' + kr(P.variants),
    tekster: '+' + kr(r.n * P.texts), tema: 'Med i prisen', unikt: '+' + kr(P.unique), sprog: S.sprog ? '+' + kr(S.sprog * P.language) : 'Kun dansk',
    integ: '+' + kr(P.integration), b2b: '+' + kr(P.b2b), subscriptions: '+' + kr(P.subscriptions), migration: '+' + kr(P.migration), service: kr(P.service) + '/md.'
  }[k];

  // Numbers roll to their new value, like the website calculator
  const tweens = new Set();
  const roll = (el, to, sfx = ' kr.', now) => {
    const t = el._ws || (el._ws = { el, cur: to, to: null });
    t.sfx = sfx;
    if (t.to === to) return;
    t.to = to;
    if (!motion || now) { t.cur = to; tweens.delete(t); el.textContent = fmt(to) + sfx; return; }
    t.from = t.cur; t.t0 = performance.now(); tweens.add(t); wake();
  };
  // A changed total bumps; on the phones' price bar the change ("+1.995 kr.") floats up
  const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const dBar = $('[data-ws-d3]');
  const changed = (d1, d2) => {
    if (!motion) return;
    if (d1) replay(T.once, 'is-bump');
    if (d2) replay(T.md, 'is-bump');
    const d = d1 || d2;
    if (d) { dBar.textContent = (d > 0 ? '+' : '−') + fmt(Math.abs(d)) + (d1 ? ' kr.' : ' kr./md.'); dBar.classList.toggle('is-neg', d < 0); replay(dBar, 'is-go'); }
  };
  // A small message in the example shop when something is switched on (only where it can be seen)
  const TOAST = {
    import: n => `${stk(n)} importeret`, varianter: 'Varianter: eg, valnød og ask', tekster: n => `Tekster skrevet til ${stk(n)}`, unikt: 'Dit eget design er klar',
    fragt: 'Fragtlabel klar til ordre #1043', regnskab: 'Ordre #1043 er bogført', nyhedsbrev: 'Ny tilmelding til nyhedsbrevet', feed: n => `${stk(n)} sendt til Google og Meta`,
    anmeldelser: 'Ny anmeldelse fra en kunde', b2b: 'Forhandler logget ind med egne priser', subscriptions: 'Nyt abonnement på træolie', migration: 'Kunder, ordrer og links er flyttet med',
    service: 'Webshoppen er opdateret', sprog: k => `Shoppen findes nu på ${k + 1} sprog`, gsa: 'Dine varer vises på Google Shopping', gads: 'Din annonce vises på Google', meta: 'Din annonce vises på Facebook og Instagram'
  };
  const toast = (key, arg) => {
    const m = TOAST[key], r = shop.getBoundingClientRect();
    if (!motion || !m || r.bottom < 90 || r.top > innerHeight - 60) return;
    toastEl.lastChild.textContent = typeof m === 'function' ? m(arg) : m;
    replay(toastEl, 'is-on');
  };

  // The choice in the contact form: totals first, then the monthly items, then the one-off items by price, so the
  // 300 characters /api/contact keeps never lose more than the smallest items
  const form = document.querySelector('[data-form]'), thanks = document.querySelector('[data-thanks]');
  const writeForm = (r, user) => {
    const ci = document.querySelector('[data-chosen-input]'), cv = document.querySelector('[data-chosen-val]'), cb = document.querySelector('[data-chosen]');
    if (!ci) return;
    const md = r.L.filter(l => l.md), once = r.L.filter(l => !l.md && l.key !== 'base');
    once.push(...once.splice(1).sort((a, b) => b.once - a.once));
    ci.value = `Webshop: ${total(r)} ekskl. moms` + (md.length ? ` · Pr. md.: ${md.map(l => `${l.c} ${fmt(l.md)}`).join(', ')}` : '')
      + ` · Engang: ${once.map(l => `${l.c} ${l.once ? fmt(l.once) : '(med)'}`).join(', ')}`;
    if (cv) cv.textContent = `${r.L[0].s} med ${list(r.L.slice(1).map(l => l.s))} · ${total(r)}`;
    if (cb) cb.hidden = false;
    // The lead's value (one-off + first month), for when main.js reads it at submit time
    if (form) form.dataset.value = r.once + r.md;
    // A new choice after a sent message opens the form again (as on /services/hjemmesider)
    if (user && form && thanks && !thanks.hidden) { form.hidden = false; thanks.hidden = true; }
  };

  let prev = null, keys = null, liveT = 0;
  // how: '' first draw · 'slide' the slider is dragged · 'type' the number or the keys · 'user' a choice
  const sync = (how = '') => {
    const r = calc(), c = r.extra * P.perProduct, k = S.ads.length;
    $$('.calc__opt').forEach(l => l.classList.toggle('is-on', l.firstChild.checked));
    $$('[data-ws-p]').forEach(e => { const t = optPrice(e.dataset.wsP, r); if (t && e.textContent !== t) e.textContent = t; });
    // Products: the slider (left alone while it is dragged), the number, the marks, what is included
    if (how !== 'slide') range.value = toS(r.n);
    range.style.setProperty('--s', (+range.value / 1000).toFixed(4));
    range.setAttribute('aria-valuetext', stk(r.n));
    if (document.activeElement !== num) num.value = fmt(r.n);
    $('[data-ws-m]').textContent = num.value || ' ';
    const inc = $('[data-ws-inc]');
    inc.textContent = r.extra ? `${P.included} med i prisen + ${fmt(r.extra)} ekstra` : `Op til ${P.included} er med i prisen`;
    inc.classList.toggle('is-extra', r.extra > 0);
    $$('[data-ws-tick]').forEach(b => b.classList.toggle('is-on', +b.dataset.wsTick === r.n));
    // Languages
    $('[data-ws-sprog]').textContent = S.sprog;
    $('[data-ws-stepbox]').classList.toggle('is-on', S.sprog > 0);
    $$('[data-ws-step]').forEach(b => { const k = S.sprog + +b.dataset.wsStep; b.disabled = k < 0 || k > P.languages; });
    // Tips: the cheaper way to get the products in, and the advertising channels
    const pick = !r.imp && c > P.import ? 'import' : r.imp && c < P.import ? 'opret' : '';
    tip.hidden = !pick;
    if (pick) {
      tip.firstChild.innerHTML = pick === 'import' ? `Har du produkterne i en fil eller en gammel webshop? Så er import <b>${kr(c - P.import)}</b> billigere.`
        : r.extra ? `Med ${stk(r.n)} er det <b>${kr(P.import - c)}</b> billigere, at vi opretter dem.` : `Op til ${P.included} produkter opretter vi uden ekstra pris.`;
      tip.lastChild.dataset.wsPick = pick; tip.lastChild.textContent = pick === 'import' ? 'Skift til import' : 'Lad os oprette dem';
    }
    $('[data-ws-adtip]').innerHTML = k === 0 ? `Første kanal ${kr(P.channel.first)}/md. Hver ekstra kanal kun ${kr(P.channel.extra)}/md.`
      : k === 1 ? `Tag en kanal mere for kun <b>${kr(P.channel.extra)}/md.</b>` : `Du sparer <b>${kr((P.channel.first - P.channel.extra) * (k - 1))}/md.</b> ved at samle ${k} kanaler hos os.`;
    // Price lines (a new one slides in), totals and the price bar
    lines.innerHTML = r.L.map(l => `<div class="calc__line${keys && motion && !keys.has(l.key) ? ' is-new' : ''}"><span>${esc(l.t)}${l.sub ? `<small>${esc(l.sub)}</small>` : ''}</span><span>${esc(lineVal(l))}</span></div>`).join('');
    keys = new Set(r.L.map(l => l.key));
    roll(T.once, r.once, ' kr.', !how); roll(T.md, r.md, ' kr.', !how);
    roll(T.b1, r.once, ' kr.', !how); roll(T.b2, r.md, ' kr./md.', !how);
    T.b2.parentNode.hidden = !r.md;
    if (how === 'user' && prev) changed(r.once - prev.once, r.md - prev.md);
    // The example shop
    const fn = on('fn').map(i => i.value);
    shop.classList.toggle('is-var', has('varianter')); shop.classList.toggle('is-txt', has('tekster'));
    shop.classList.toggle('is-unikt', val('design') === 'unikt');
    shop.classList.toggle('is-b2b', fn.includes('b2b')); shop.classList.toggle('is-abo', fn.includes('subscriptions'));
    $$('[data-ws-tile]').forEach((t, i) => t.classList.toggle('is-off', i >= r.n));
    $$('[data-ws-lang]').forEach((l, i) => l.classList.toggle('is-off', i > S.sprog));
    roll(T.n, r.n, '', !how);
    writeForm(r, !!how);
    if (how) { clearTimeout(liveT); liveT = setTimeout(() => { $('[data-ws-live]').textContent = `Engangsbeløb ${kr(r.once)}. Pr. måned ${kr(r.md)}.`; }, 700); }
    prev = r;
    fit();
    return r;
  };

  // The products: the end of a drag, of typing or of a key shows the change once and is tracked once
  let nT = 0, from = null;
  const trackN = () => { clearTimeout(nT); nT = setTimeout(() => track('calc_change', { field: 'produkter', value: S.n }), 1200); };
  const setN = (n, how) => { if (from === null && prev) from = prev.once; S.n = clamp(Math.round(n) || 1, 1, MAX); sync(how); };
  const commitN = () => { if (from === null || !prev) return; changed(prev.once - from, 0); from = null; trackN(); };
  range.addEventListener('input', () => setN(toN(+range.value), 'slide'));
  range.addEventListener('change', commitN);
  // Keys step the products themselves (1, 5, 10 or 25 at a time); Page Up/Down jump between the marks
  range.addEventListener('keydown', e => {
    const n = S.n, k = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key], q = stepOf(k > 0 ? n : n - 1);
    const to = k ? Math.round((n + k * q * (e.shiftKey ? 10 : 1)) / q) * q : { PageUp: MARKS.find(m => m > n) || MAX, PageDown: [...MARKS].reverse().find(m => m < n) || 1, Home: 1, End: MAX }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    if (clamp(to, 1, MAX) !== n) { setN(to, 'type'); commitN(); }
  });
  // The number field: focus selects it, so typing replaces it (the click's mouseup would drop the selection)
  let picked = false;
  num.addEventListener('focus', () => { num.value = String(S.n); num.select(); picked = true; });
  num.addEventListener('mouseup', e => { if (picked) e.preventDefault(); picked = false; });
  num.addEventListener('input', () => { const v = parseInt(num.value.replace(/\D/g, ''), 10); $('[data-ws-m]').textContent = num.value || ' '; if (v > 0) setN(v, 'type'); });
  num.addEventListener('blur', () => { num.value = fmt(S.n); $('[data-ws-m]').textContent = num.value; commitN(); });
  num.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); num.blur(); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setN(S.n + (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1), 'type'); num.value = String(S.n); }
  });

  // Scroll to an element by its place in the layout (a box that is still fading in is moved by its transform)
  const goTo = (el, off) => { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; scrollTo({ top: y - off, behavior: motion ? 'smooth' : 'auto' }); };
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-ws-tick], [data-ws-step], [data-ws-pick], [data-ws-go], [data-ws-bar]');
    if (!t) return;
    const d = t.dataset;
    if (d.wsTick) { if (+d.wsTick !== S.n) { S.n = +d.wsTick; sync('user'); trackN(); } }
    else if (d.wsStep) {
      const k = clamp(S.sprog + +d.wsStep, 0, P.languages); if (k === S.sprog) return;
      const up = k > S.sprog; S.sprog = k; sync('user');
      if (up) toast('sprog', k);
      track('calc_change', { field: 'sprog', value: k });
    } else if (d.wsPick) {
      const i = inputs('metode').find(x => x.value === d.wsPick);
      i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true }));
    } else if ('wsGo' in d) {
      const r = calc(); writeForm(r, false);
      track('calc_cta', { package: 'webshop', addons_total: extras(), value: r.once + r.md, currency: 'DKK' });
      goTo(document.getElementById('kontakt'), 80);
    } else goTo(sum, 90);
  });
  const FIELD = { metode: 'metode', varianter: 'varianter', tekster: 'tekster', design: 'design', integ: 'integration', fn: 'funktion', service: 'service', ads: 'annoncering' };
  root.addEventListener('change', e => {
    const i = e.target; if (!FIELD[i.name]) return;
    if (i.name === 'ads') S.ads = i.checked ? [...S.ads.filter(v => v !== i.value), i.value] : S.ads.filter(v => v !== i.value);
    const r = sync('user');
    if (i.checked) toast(i.value, r.n);
    track('calc_change', { field: FIELD[i.name], value: i.value, ...(i.type === 'checkbox' ? { selected: i.checked ? 'ja' : 'nej' } : {}) });
  });

  // The column with the shop and the price stays in view; when it is taller than the screen, its bottom
  // (the totals and the button) is the part that stays
  function fit() { if (side.offsetHeight) side.style.setProperty('--ws-top', Math.min(96, innerHeight - side.offsetHeight - 16) + 'px'); }
  // Phones and tablets: the price bar shows while the choices are on screen
  const barTick = () => bar.classList.toggle('is-on', innerWidth <= 900 && opts.getBoundingClientRect().top < innerHeight * 0.5 && sum.getBoundingClientRect().top > innerHeight - 24);

  // Frame loop: the rolling numbers, and the example shop building itself as it scrolls into view
  const parts = [...shop.querySelectorAll('[data-wb]')], ease = t => 1 - Math.pow(1 - t, 3);
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
    if (motion && near) {
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
  new IntersectionObserver(es => { near = es[0].isIntersecting; if (near) wake(); }, { rootMargin: '200px 0px' }).observe(root);
  addEventListener('scroll', () => { if (near) wake(); barTick(); }, { passive: true });
  addEventListener('resize', () => { fit(); barTick(); });
  new ResizeObserver(fit).observe(side);

  sync('');
  barTick();
  // main.js writes the form's "Du har valgt" when it loads; ours replaces it, also once everything has loaded
  addEventListener('load', () => writeForm(calc(), false));
}
