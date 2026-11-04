// /services/webshop (udkast): the webshop price calculator. Markup: scripts/services/pages/webshop.mjs.
// The product slider fills an example shop with products; every paid choice flies into the cart (the price box).
// Tracks only calc_change (field and choice, never typed text) and calc_cta.
import { track } from '/assets/js/analytics.js';
import { KANAL } from '/assets/js/content.js';

// PRICES:start (scripts/services/pages/webshop.mjs reads this block, so the copy on the page says the same)
// Our proposal, in kroner ex. VAT. Change a number here, then run: node scripts/services/build.mjs webshop
const PRICES = {
  base: 12995,        // Webshop på Shopify, one-off: up to `included` products, a theme in the brand, payment (card,
                      // MobilePay, Apple Pay), shipping, terms of trade, cookies and GDPR, Google Analytics and
                      // Search Console, front page, about, contact and FAQ
  included: 25,       // products in the base price
  perProduct: 35,     // each product above `included` that we create from the customer's photos and texts
  import: 2995,       // import from a file or the old webshop, in total, whatever the number
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

const root = document.querySelector('#beregner.show--webshop');
if (root) init();

function init() {
  const P = PRICES, motion = document.documentElement.classList.contains('motion');
  const $ = (s, r = root) => r.querySelector(s), $$ = (s, r = root) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const fmt = n => Math.round(n).toLocaleString('da-DK'), kr = n => fmt(n) + ' kr.';
  const stk = n => fmt(n) + (n === 1 ? ' produkt' : ' produkter');
  const esc = s => String(s).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`);
  const and = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' og ' + a[a.length - 1] : a.join('');
  const MAX = SCALE[SCALE.length - 1][1], MARKS = SCALE.map(x => x[1]);

  // Slider position ↔ products: whole products, then steps of 5, 10 and 25 as the numbers grow
  const stepOf = n => n < 100 ? 1 : n < 500 ? 5 : n < 1000 ? 10 : 25;
  const seg = (k, v) => { let i = 1; while (i < SCALE.length - 1 && v > SCALE[i][k]) i++; return [SCALE[i - 1], SCALE[i]]; };
  const toN = s => { const [[s0, n0], [s1, n1]] = seg(0, s), n = n0 + (n1 - n0) * (s - s0) / (s1 - s0), q = stepOf(n); return clamp(Math.round(n / q) * q, 1, MAX); };
  const toS = n => { const [[s0, n0], [s1, n1]] = seg(1, n); return s0 + (s1 - s0) * (n - n0) / (n1 - n0); };

  const range = $('[data-ws-range]'), num = $('[data-ws-n]'), sum = $('[data-ws-sum]'), opts = $('.calc__opts'), bar = $('[data-ws-bar]');
  const lines = $('[data-ws-lines]'), tip = $('[data-ws-tip]'), flies = $('[data-ws-flies]');
  const T = { once: $('[data-ws-once]'), md: $('[data-ws-md]'), b1: $('[data-ws-b1]'), b2: $('[data-ws-b2]') };
  const S = { n: P.included, sprog: 0, ads: [] };
  const ins = n => $$(`input[name="${n}"]`), on = n => ins(n).filter(i => i.checked);
  const val = n => (on(n)[0] || {}).value, title = i => i.closest('label').querySelector('b').textContent;
  const form = document.querySelector('[data-form]'), thanks = document.querySelector('[data-thanks]');

  // Everything chosen, as lines: k key, t text, once / md price, s short (for "Du har valgt"), c compact (for the e-mail)
  const calc = () => {
    const n = S.n, extra = Math.max(0, n - P.included), imp = val('metode') === 'import', L = [];
    const add = (k, t, once, md, s, c = s, sub = '') => L.push({ k, t, once, md, s, c, sub });
    add('base', 'Webshop på Shopify', P.base, 0, 'Webshop på Shopify');
    add('prod', stk(n), imp ? P.import : extra * P.perProduct, 0, stk(n) + (imp ? ' (import)' : ''),
      stk(n) + (imp ? ', import' : extra ? `, ${fmt(extra)} oprettes` : ' (med)'),
      imp ? 'Import fra fil eller gammel webshop' : extra ? `${P.included} med i prisen, ${fmt(extra)} oprettes ekstra` : `Op til ${P.included} er med i prisen`);
    if (on('varianter').length) add('var', 'Varianter', P.variants, 0, 'varianter', 'Varianter');
    if (on('tekster').length) add('txt', `Produkttekster til ${stk(n)}`, n * P.texts, 0, 'produkttekster', 'Tekster');
    if (val('design') === 'unikt') add('design', 'Unikt design', P.unique, 0, 'unikt design', 'Unikt design');
    if (S.sprog) add('sprog', `${S.sprog} ekstra sprog og ${S.sprog > 1 ? 'valutaer' : 'valuta'}`, S.sprog * P.language, 0, `${S.sprog} ekstra sprog`, `${S.sprog} sprog`);
    const ig = on('integ'), many = ig.length > 1;
    if (ig.length) add('integ', many ? `${ig.length} integrationer` : title(ig[0]), ig.length * P.integration, 0,
      many ? `${ig.length} integrationer` : ig[0].dataset.s, ig.map(i => i.dataset.c).join('+'), many ? and(ig.map(title)) : '');
    on('fn').forEach(i => add(i.value, title(i), P[i.value], 0, i.dataset.s, i.dataset.c));
    if (on('service').length) add('service', 'Webshop-service', 0, P.service, 'Webshop-service', 'Service');
    S.ads.forEach((v, k) => { const t = title(ins('ads').find(i => i.value === v)); add('ad-' + v, t, 0, k ? P.channel.extra : P.channel.first, t); });
    return { L, n, extra, imp, once: L.reduce((a, l) => a + l.once, 0), md: L.reduce((a, l) => a + l.md, 0) };
  };
  const lv = l => l.md ? kr(l.md) + '/md.' : l.once ? kr(l.once) : 'Med i prisen';
  const total = r => kr(r.once) + (r.md ? ` + ${kr(r.md)}/md.` : '');
  // A channel costs the first price or the extra one, by the order they are picked
  const adP = v => { const i = S.ads.indexOf(v); return (i < 0 ? (S.ads.length ? '+' + kr(P.channel.extra) : kr(P.channel.first)) : kr(i ? P.channel.extra : P.channel.first)) + '/md.'; };

  // Numbers roll to their new value, like the website calculator (after a delay while a price chip is in the air)
  const ease = t => 1 - Math.pow(1 - t, 3), tw = new Set();
  let raf = 0, prev = null, keys = null, liveT = 0;
  const wake = () => { if (!raf) raf = requestAnimationFrame(frame); };
  function frame(now) {
    raf = 0;
    tw.forEach(t => { const k = clamp((now - t.t0) / 600, 0, 1); t.cur = t.from + (t.to - t.from) * ease(k); t.el.textContent = fmt(t.cur) + t.sfx; if (k >= 1) tw.delete(t); });
    if (tw.size) wake();
  }
  const roll = (el, to, sfx, delay) => {
    const t = el._t || (el._t = { el, cur: to, to });
    t.sfx = sfx;
    if (!motion || !prev) { t.cur = t.to = to; tw.delete(t); el.textContent = fmt(to) + sfx; return; }
    if (t.to === to) return;
    t.from = t.cur; t.to = to; t.t0 = performance.now() + delay; tw.add(t); wake();
  };
  const replay = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  // Price chips: "+1.995 kr." flies from the choice into the cart; a lower price floats up out of it
  const shown = el => { const r = el && el.getBoundingClientRect(); return r && r.width && r.bottom > 64 && r.top < innerHeight - 8 ? r : null; };
  const cart = md => [bar.classList.contains('is-on') && $('.ws-bag', bar), $('.ws-bag', sum), md ? T.md : T.once].find(e => e && shown(e));
  const chip = (text, x0, y0, x1, y1, arc, D, neg, done) => {
    const el = document.createElement('span'), cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - arc, t0 = performance.now();
    el.className = 'ws-fly' + (neg ? ' is-neg' : ''); el.textContent = text; flies.appendChild(el);
    const step = now => {
      const k = clamp((now - t0) / D, 0, 1), e = k < .5 ? 2 * k * k : 1 - (2 - 2 * k) ** 2 / 2, u = 1 - e;
      el.style.transform = `translate(${u * u * x0 + 2 * u * e * cx + e * e * x1}px,${u * u * y0 + 2 * u * e * cy + e * e * y1}px) translate(-50%,-50%) scale(${neg ? 1 : 1 - .45 * e})`;
      if (neg) el.style.opacity = 1 - k * k;
      if (k < 1) requestAnimationFrame(step); else { el.remove(); if (done) done(); }
    };
    step(t0);
  };
  const fly = (src, d, md) => {
    const to = cart(md), a = shown(src), b = shown(to), txt = (d > 0 ? '+' : '−') + fmt(Math.abs(d)) + (md ? ' kr./md.' : ' kr.');
    if (!motion || !b) return 0;
    if (d < 0) { chip(txt, b.left + b.width / 2, b.top, b.left + b.width / 2, b.top - 44, 0, 950, 1); return 0; }
    if (!a) return 0;
    chip(txt, a.left + a.width / 2, a.top + a.height / 2, b.left + b.width / 2, b.top + b.height / 2, 80 + Math.abs(b.left - a.left) * .08, 640, 0, () => replay(to, 'is-bump'));
    return 560;
  };

  // The contact form: totals first, then the monthly items, then the one-off items by price, so the 300
  // characters /api/contact keeps never lose more than the smallest items
  const writeForm = (r, user) => {
    const ci = document.querySelector('[data-chosen-input]'), cv = document.querySelector('[data-chosen-val]'), cb = document.querySelector('[data-chosen]');
    if (!ci) return;
    const md = r.L.filter(l => l.md), once = r.L.filter(l => !l.md && l.k !== 'base').sort((a, b) => (b.k === 'prod') - (a.k === 'prod') || b.once - a.once);
    const text = short => [`Webshop: ${total(r)}${short ? '' : ' ekskl. moms'}`, md.length && 'Md.: ' + md.map(l => `${short ? l.c.replace(/^Google (S)/, '$1') : l.c} ${fmt(l.md)}`).join(', '),
      ...once.map(l => l.once ? `${short && l.k === 'integ' ? on('integ').length + ' integrationer' : l.c} ${fmt(l.once)}` : l.c)].filter(Boolean).join(' · ');
    ci.value = text(false).length > 300 ? text(true) : text(false);
    if (cv) cv.textContent = `Webshop på Shopify med ${and(r.L.slice(1).map(l => l.s))} · ${total(r)}`;
    if (cb) cb.hidden = false;
    // A new choice after a sent message opens the form again (as on /services/hjemmesider)
    if (user && form && thanks && !thanks.hidden) { form.hidden = false; thanks.hidden = true; }
  };

  // how: '' first draw · 'slide' the slider is dragged · 'type' the number or the keys · 'user' a choice (src: what was clicked)
  const sync = (how = '', src = null) => {
    const r = calc(), cost = r.extra * P.perProduct, k = S.ads.length;
    $$('.calc__opt, .ws-seg label').forEach(l => l.classList.toggle('is-on', $('input', l).checked));
    $$('[data-ws-seg]').forEach(g => { const i = ins($('input', g).name).findIndex(x => x.checked); g.dataset.on = i; g.nextElementSibling.textContent = ins($('input', g).name)[i].dataset.cap; });
    const dyn = { opret: r.extra ? '+' + kr(cost) : 'Med i prisen', tekster: '+' + kr(r.n * P.texts), sprog: S.sprog ? '+' + kr(S.sprog * P.language) : 'Kun dansk' };
    $$('[data-ws-p]').forEach(e => { const p = e.dataset.wsP, t = p.startsWith('ad:') ? adP(p.slice(3)) : dyn[p]; if (t && e.textContent !== t) e.textContent = t; });
    // Products: the slider (left alone while it is dragged), the number, the marks and the example shop
    if (how !== 'slide') range.value = toS(r.n);
    range.style.setProperty('--s', (range.value / 1000).toFixed(4));
    range.setAttribute('aria-valuetext', stk(r.n));
    if (document.activeElement !== num) num.value = fmt(r.n);
    $('[data-ws-m]').textContent = num.value || ' ';
    $('[data-ws-u]').textContent = r.n === 1 ? 'produkt' : 'produkter';
    const inc = $('[data-ws-inc]');
    inc.textContent = r.imp ? 'Import: samme pris for alle' : r.extra ? `${P.included} med i prisen + ${fmt(r.extra)} ekstra` : `Op til ${P.included} er med i prisen`;
    inc.classList.toggle('is-extra', !r.imp && r.extra > 0);
    $$('[data-ws-tick]').forEach(b => b.classList.toggle('is-on', +b.dataset.wsTick === r.n));
    $('[data-ws-wn]').textContent = fmt(r.n);
    wall.set(r.n, on('varianter').length > 0);
    // Languages: the stepper and the language switcher of the example shop
    $('[data-ws-sprog]').textContent = S.sprog;
    $$('[data-ws-step]').forEach(b => { const s = S.sprog + +b.dataset.wsStep; b.disabled = s < 0 || s > P.languages; });
    $$('[data-ws-lang]').forEach(g => [...g.children].forEach((p, i) => p.classList.toggle('is-on', i <= S.sprog)));
    // Tips: the cheaper way to get the products in, and the advertising channels
    const pick = !r.imp && cost > P.import ? 'import' : r.imp && cost < P.import ? 'opret' : '';
    tip.hidden = !pick;
    if (pick) {
      tip.firstChild.innerHTML = pick === 'import' ? `Har du produkterne i en fil eller en gammel webshop? Så er import <b>${kr(cost - P.import)}</b> billigere.`
        : r.extra ? `Med ${stk(r.n)} er det <b>${kr(P.import - cost)}</b> billigere, at vi opretter dem.` : `Op til ${P.included} produkter opretter vi uden ekstra pris.`;
      tip.lastChild.dataset.wsPick = pick; tip.lastChild.textContent = pick === 'import' ? 'Skift til import' : 'Lad os oprette dem';
    }
    $('[data-ws-adtip]').innerHTML = k === 0 ? `Første kanal ${kr(P.channel.first)}/md. Hver ekstra kanal kun ${kr(P.channel.extra)}/md.`
      : k === 1 ? `Tag en kanal mere for kun <b>${kr(P.channel.extra)}/md.</b>` : `Du sparer <b>${kr((P.channel.first - P.channel.extra) * (k - 1))}/md.</b> ved at samle ${k} kanaler hos os.`;
    // The cart: a chip flies in first, then the new line slides in and the totals roll
    const d1 = prev ? r.once - prev.once : 0, d2 = prev ? r.md - prev.md : 0;
    const delay = how === 'user' && (d1 || d2) ? fly(src, d1 || d2, !d1) : 0;
    lines.style.setProperty('--ws-d', delay + 'ms');
    lines.innerHTML = r.L.map(l => `<div class="calc__line${keys && motion && !keys.has(l.k) ? ' is-new' : ''}"><span>${esc(l.t)}${l.sub ? `<small>${esc(l.sub)}</small>` : ''}</span><span>${esc(lv(l))}</span></div>`).join('');
    keys = new Set(r.L.map(l => l.k));
    roll(T.once, r.once, ' kr.', delay); roll(T.md, r.md, ' kr.', delay); roll(T.b1, r.once, ' kr.', delay); roll(T.b2, r.md, ' kr./md.', delay);
    T.b2.parentNode.hidden = !r.md;
    $$('[data-ws-count]').forEach(e => { e.textContent = r.L.length; });
    writeForm(r, !!how);
    if (how) { clearTimeout(liveT); liveT = setTimeout(() => { $('[data-ws-live]').textContent = `Engangsbeløb ${kr(r.once)}. Pr. måned ${kr(r.md)}.`; }, 800); }
    prev = r;
    fit();
  };

  // The products: the end of a drag, of typing or of a key is tracked once
  let nT = 0;
  const trackN = () => { clearTimeout(nT); nT = setTimeout(() => track('calc_change', { field: 'produkter', value: S.n }), 1200); };
  const setN = (n, how, src) => { S.n = clamp(Math.round(n) || 1, 1, MAX); sync(how, src); };
  range.addEventListener('input', () => setN(toN(+range.value), 'slide'));
  range.addEventListener('change', trackN);
  // Keys step the products themselves (1, 5, 10 or 25 at a time); Page Up/Down jump between the marks
  range.addEventListener('keydown', e => {
    const n = S.n, d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key], q = stepOf(d > 0 ? n : n - 1);
    const to = d ? Math.round((n + d * q * (e.shiftKey ? 10 : 1)) / q) * q : { PageUp: MARKS.find(m => m > n) || MAX, PageDown: [...MARKS].reverse().find(m => m < n) || 1, Home: 1, End: MAX }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    if (clamp(to, 1, MAX) !== n) { setN(to, 'type'); trackN(); }
  });
  // The number field: focus selects it, so typing replaces it (the click's mouseup would drop the selection)
  let picked = false;
  num.addEventListener('focus', () => { num.value = String(S.n); num.select(); picked = true; });
  num.addEventListener('mouseup', e => { if (picked) e.preventDefault(); picked = false; });
  num.addEventListener('input', () => { const v = parseInt(num.value.replace(/\D/g, ''), 10); $('[data-ws-m]').textContent = num.value || ' '; if (v > 0) setN(v, 'type'); });
  num.addEventListener('blur', () => { num.value = fmt(S.n); $('[data-ws-m]').textContent = num.value; trackN(); });
  num.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); num.blur(); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); setN(S.n + (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1), 'type'); num.value = String(S.n); }
  });

  const goTo = (el, off) => scrollTo({ top: el.getBoundingClientRect().top + scrollY - off, behavior: motion ? 'smooth' : 'auto' });
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-ws-tick], [data-ws-step], [data-ws-pick], [data-ws-go], [data-ws-bar]');
    if (!t) return;
    const d = t.dataset;
    if (d.wsTick) { if (+d.wsTick !== S.n) { setN(+d.wsTick, 'user', t); trackN(); } }
    else if (d.wsStep) {
      const s = clamp(S.sprog + +d.wsStep, 0, P.languages); if (s === S.sprog) return;
      S.sprog = s; sync('user', t);
      if (motion && +d.wsStep > 0) $$('[data-ws-lang]').forEach(g => replay(g.children[s], 'is-pop'));
      track('calc_change', { field: 'sprog', value: s });
    } else if (d.wsPick) {
      const i = ins('metode').find(x => x.value === d.wsPick);
      i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true }));
    } else if ('wsGo' in d) {
      const r = calc(); writeForm(r, false);
      track('calc_cta', { package: 'webshop', addons_total: r.L.length - 2, value: r.once + r.md, currency: 'DKK' });
      goTo(document.getElementById('kontakt'), 80);
    } else goTo(sum, 90);
  });
  const FIELD = { metode: 'metode', varianter: 'varianter', tekster: 'tekster', design: 'design', integ: 'integration', fn: 'funktion', service: 'service', ads: 'annoncering' };
  root.addEventListener('change', e => {
    const i = e.target; if (!FIELD[i.name]) return;
    if (i.name === 'ads') S.ads = i.checked ? [...S.ads.filter(v => v !== i.value), i.value] : S.ads.filter(v => v !== i.value);
    sync('user', i.closest('label'));
    track('calc_change', { field: FIELD[i.name], value: i.value, ...(i.type === 'checkbox' ? { selected: i.checked ? 'ja' : 'nej' } : {}) });
  });

  // The cart stays in view beside the choices; when it is taller than the screen, its bottom (the totals and the
  // button) is the part that stays. Phones and tablets: a cart bar shows while the choices are on screen
  function fit() { if (innerWidth > 900) sum.style.setProperty('--ws-top', Math.min(96, innerHeight - sum.offsetHeight - 16) + 'px'); }
  const barTick = () => bar.classList.toggle('is-on', innerWidth <= 900 && opts.getBoundingClientRect().top < innerHeight * .55 && sum.getBoundingClientRect().top > innerHeight - 30);
  addEventListener('scroll', barTick, { passive: true });
  addEventListener('resize', () => { fit(); barTick(); });

  const wall = makeWall($('[data-ws-wall]'), motion);
  sync('');
  barTick();
  // main.js writes the form's "Du har valgt" when it loads; ours replaces it, also once everything has loaded
  addEventListener('load', () => writeForm(calc(), false));
  addEventListener('pageshow', e => { if (e.persisted) writeForm(calc(), false); });
}

// The example shop's product page, drawn on a canvas: one tile per product. New ones pop in, the grid reflows
// as it fills, and from a few hundred on the tiles become a mosaic
function makeWall(cv, motion) {
  const x = cv.getContext('2d'), T = [], BG = ['#f1e8da', '#ebe6dc', '#efe4d6', '#e9ece5', '#f2eadf', '#ece8e1', '#f0e6da'], MOS = ['#e3cba1', '#d9bf93', '#d4a574', '#c9955e', '#a46c43'];
  // The products, drawn in wood: [shape, x, y, w (or radius), h, colour, corner], in a unit square; 'b' = the tile's own colour
  const G = [
    [['r', .3, .16, .4, .68, '#d4a574', .1], ['c', .5, .27, .045, 0, 'b']],
    [['r', .14, .4, .72, .2, '#8b5a3a', .06], ['r', .2, .47, .07, .06, 'b', .03], ['r', .73, .47, .07, .06, 'b', .03]],
    [['r', .4, .38, .2, .44, '#6e4a2e', .05], ['r', .455, .25, .09, .14, '#2f2219', .02], ['r', .43, .52, .14, .14, '#f3ead9', .02]],
    [['r', .34, .72, .32, .1, '#d9bf93', .04], ['r', .44, .36, .12, .36, '#fffaf0', .02], ['c', .5, .29, .04, 0, '#e0552b']],
    [['r', .22, .34, .56, .42, '#d6ab77', .04], ['r', .22, .47, .56, .03, '#b98a56', 0], ['r', .22, .6, .56, .03, '#b98a56', 0]],
    [['e', .5, .5, .3, .24, '#a46c43'], ['r', .18, .44, .64, .08, '#c58c5d', .04]],
    [['r', .12, .36, .76, .1, '#c9955e', .04], ['c', .3, .58, .045, 0, '#6f4a30'], ['c', .5, .58, .045, 0, '#6f4a30'], ['c', .7, .58, .045, 0, '#6f4a30']]
  ];
  let W = 0, H = 0, R = 1, n = 0, dots = false, live = !motion, raf = 0, last = 0;
  const hash = i => Math.imul(i + 7, 2654435761) >>> 0;
  const back = p => 1 + 2.7 * (p - 1) ** 3 + 1.7 * (p - 1) ** 2;
  const rr = (X, Y, w, h, r, c) => { x.fillStyle = c; x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, r); else x.rect(X, Y, w, h); x.fill(); };
  // The biggest tile that fits k of them in the frame; the rows fill from the top left like a real shop
  const layout = k => {
    const p = 14, w = W - 2 * p, h = H - 2 * p;
    let c = Math.min(h, Math.sqrt(w * h / k));
    while (Math.floor(w / c) * Math.floor(h / c) < k) c *= .97;
    const cols = Math.floor(w / c);
    return { p, cols, c: Math.min(w / cols, h / Math.ceil(k / cols)) };
  };
  const place = snap => {
    const now = performance.now(), L = layout(Math.max(1, n)), start = T.length, g = Math.min(26, 640 / Math.max(1, n - start));
    T.forEach((t, i) => {
      if (i >= n) { if (!t.d) t.d = now; return; }
      if (t.d) { t.d = 0; t.b = now - 190; }
      t.tx = L.p + (i % L.cols) * L.c; t.ty = L.p + Math.floor(i / L.cols) * L.c; t.tc = L.c;
      if (snap || !motion) { t.x = t.tx; t.y = t.ty; t.c = t.tc; }
    });
    for (let i = start; i < n; i++) { const tx = L.p + (i % L.cols) * L.c, ty = L.p + Math.floor(i / L.cols) * L.c; T.push({ x: tx, y: ty, c: L.c, tx, ty, tc: L.c, b: now + (i - start) * g, d: 0 }); }
    if (!motion) { T.length = n; T.forEach(t => { t.b = 0; }); }
  };
  // The first seven are the shop's own range, in order; after that the shop mixes them
  const tile = (i, t, a) => {
    const h = hash(i), g = G[i < 7 ? i : h % 7], bg = BG[(i < 7 ? i : h >>> 5) % 7], c = t.c - Math.max(1, t.c * .14), s = c * a, X = t.x + (c - s) / 2, Y = t.y + (c - s) / 2;
    if (s < 9) { x.fillStyle = (h >>> 9) % 5 > 1 ? bg : MOS[(h >>> 13) % 5]; x.fillRect(X, Y, s, s); return; }
    rr(X, Y, s, s, s * .14, bg);
    if (s < 15) { rr(X + s * .25, Y + s * .25, s * .5, s * .5, s * .12, MOS[(h >>> 13) % 5]); return; }
    for (const [f, a1, b1, w1, h1, col, r1] of g) {
      const fill = col === 'b' ? bg : col;
      if (f === 'r') rr(X + a1 * s, Y + b1 * s, w1 * s, h1 * s, r1 * s, fill);
      else { x.fillStyle = fill; x.beginPath(); if (f === 'c') x.arc(X + a1 * s, Y + b1 * s, w1 * s, 0, 7); else x.ellipse(X + a1 * s, Y + b1 * s, w1 * s, h1 * s, 0, 0, Math.PI); x.fill(); }
    }
    if (dots && s > 33) ['#c9955e', '#6f452b', '#ead7b6'].forEach((col, j) => { x.fillStyle = col; x.beginPath(); x.arc(X + s * (.17 + j * .11), Y + s * .89, s * .04, 0, 7); x.fill(); });
  };
  function frame(now) {
    raf = 0;
    const k = 1 - Math.exp(-(last ? Math.min(48, now - last) : 16) / 85);
    let busy = false;
    last = now;
    x.setTransform(R, 0, 0, R, 0, 0); x.clearRect(0, 0, W, H);
    for (let i = 0; i < T.length; i++) {
      const t = T[i];
      if (Math.abs(t.tx - t.x) + Math.abs(t.ty - t.y) + Math.abs(t.tc - t.c) > .08) { t.x += (t.tx - t.x) * k; t.y += (t.ty - t.y) * k; t.c += (t.tc - t.c) * k; busy = true; }
      else { t.x = t.tx; t.y = t.ty; t.c = t.tc; }
      let a = 1;
      if (t.d) { a = 1 - (now - t.d) / 200; busy = true; if (a <= 0) { T.length = i; break; } }
      else if (now < t.b + 380) { busy = true; a = now < t.b ? 0 : back((now - t.b) / 380); }
      if (a > .02) tile(i, t, a);
    }
    if (busy && motion) raf = requestAnimationFrame(frame); else last = 0;
  }
  const kick = () => { if (live && W && !raf) raf = requestAnimationFrame(frame); };
  const size = () => {
    const r = cv.getBoundingClientRect(); if (!r.width) return;
    R = Math.min(2, devicePixelRatio || 1); W = r.width; H = r.height;
    cv.width = Math.round(W * R); cv.height = Math.round(H * R);
    place(true); kick();
  };
  new ResizeObserver(size).observe(cv);
  // The shop fills up when it comes into view
  if (motion) new IntersectionObserver((es, io) => {
    if (!es[0].isIntersecting) return;
    io.disconnect(); live = true;
    const now = performance.now(), g = Math.min(34, 900 / Math.max(1, T.length));
    T.forEach((t, i) => { t.b = now + 120 + i * g; });
    kick();
  }, { threshold: .35 }).observe(cv);
  return { set(k, d) { n = k; dots = d; if (W) { place(false); kick(); } } };
}
