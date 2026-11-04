// Showcase: Google Shopping Ads (/services/google-shopping-ads). A customer searches, the shopping ads
// slide in, your product moves to the front and lights up, then a click, the cart and a sale.
// With motion: a pinned stage driven by scroll. Without: the finished state, static (HTML and CSS).
// "Prøv med din egen vare": the product and shop name go into your ad. They stay in this browser
// (sessionStorage 'wl-shop') and are never sent anywhere; analytics only hears which field was used.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--google-shopping-ads');
if (root) run(root);

function run(root) {
  const SC = 'google-shopping-ads', motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (v, a, b) => clamp((v - a) / (b - a));
  const ease = t => 1 - (1 - t) ** 3;
  const inout = t => t < .5 ? 4 * t ** 3 : 1 - (2 - 2 * t) ** 3 / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  const pin = $('[data-gsa-pin]'), sticky = $('[data-gsa-sticky]'), fit = $('[data-gsa-fit]'), scr = $('[data-gsa-scr]');
  const qbox = $('[data-gsa-qbox]'), ac = $('[data-gsa-ac]'), acRows = [...ac.children], qEl = $('[data-gsa-q]'), url = $('[data-gsa-url]'), res = $('[data-gsa-res]'), ads = $('[data-gsa-ads]'), next = $('[data-gsa-next]');
  const dim = $('[data-gsa-dim]'), sheet = $('[data-gsa-sheet]'), buy = $('[data-gsa-buy]'), cur = $('[data-gsa-cur]'), rip = $('[data-gsa-rip]'), fx = $('[data-gsa-fx]');
  const row = $('[data-gsa-row]'), cards = $$('[data-gsa-card]'), steps = $$('[data-gsa-step]'), box = $('[data-gsa-egen]');
  const small = matchMedia('(max-width: 699px)');
  let Q = 'keramik krus', SHOP = 'lervaerk.dk/produkt/keramik-krus-salviegroen', dirty = true, L = null, S0 = [];
  const searchUrl = () => 'google.dk/search?q=' + Q.replace(/\s+/g, '+');

  /* ---------------- Prøv med din egen vare ---------------- */
  // "Lerværk" → lervaerk.dk, "Krus & Kande" → krus-og-kande.dk
  const slug = (n, max) => n.toLocaleLowerCase('da-DK').replace(/\s+(aps|a\/s|ivs)\.?$/, '').replace(/&/g, ' og ').replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, max).replace(/-+$/, '');
  const domain = n => (slug(n, 30) || 'lervaerk') + '.dk';
  const f = { vare: $('[data-gsa-in="vare"]'), butik: $('[data-gsa-in="butik"]') }, DEF = $('[data-gsa-title]').textContent;
  try {
    const v = JSON.parse(sessionStorage.getItem('wl-shop') || 'null') || {}, e = JSON.parse(sessionStorage.getItem('wl-egen') || 'null') || {};
    if (typeof v.vare === 'string') f.vare.value = v.vare.slice(0, 60);
    // Nothing typed here yet: the company name from "Prøv med din egen virksomhed" on /services/hjemmesider
    f.butik.value = (typeof v.butik === 'string' ? v.butik : typeof e.navn === 'string' ? e.navn : '').slice(0, 40);
  } catch (x) { /* fine */ }
  const clean = el => el.value.replace(/\s+/g, ' ').trim();
  const put = (sel, t) => $$(sel).forEach(el => { el.textContent = t; });
  const first = t => t.charAt(0).toLocaleUpperCase('da-DK');
  const apply = () => {
    const vare = clean(f.vare), butik = clean(f.butik), shop = butik || 'Lerværk';
    // The customer searches for what you sell
    Q = vare ? vare.toLocaleLowerCase('da-DK').slice(0, 32).trim() : 'keramik krus';
    put('[data-gsa-title]', vare || DEF); put('[data-gsa-shop]', shop); put('[data-gsa-ini]', first(shop)); put('[data-gsa-pi]', first(vare) || 'V');
    put('[data-gsa-qt]', Q); put('[data-gsa-dom]', domain(shop));
    // Where the click lands: the product in your webshop
    SHOP = `${domain(shop)}/produkt/${slug(vare, 40) || 'keramik-krus-salviegroen'}`;
    // Their own product gets a placeholder instead of our mug, and their shop no stars
    root.classList.toggle('is-own', !!vare);
    root.classList.toggle('is-egen', !!(vare || butik));
    box.classList.toggle('is-filled', !!(vare || butik));
    if (motion) measure(); else { qEl.textContent = Q; url.textContent = searchUrl(); }
  };
  let tm = 0;
  box.addEventListener('input', () => {
    clearTimeout(tm);
    tm = setTimeout(() => { apply(); try { sessionStorage.setItem('wl-shop', JSON.stringify({ vare: clean(f.vare), butik: clean(f.butik) })); } catch (x) { /* fine */ } }, 120);
  });
  const told = new Set();
  box.addEventListener('change', e => { const k = e.target.dataset.gsaIn; if (k && !told.has(k) && clean(e.target)) { told.add(k); track('showcase_interact', { showcase: SC, action: 'egen-' + k }); } });
  // Enter moves on to the shop name, and closes the keyboard after it
  box.addEventListener('keydown', e => { if (e.key !== 'Enter' || !e.target.dataset.gsaIn) return; e.preventDefault(); if (e.target === f.vare) f.butik.focus(); else e.target.blur(); });
  $('[data-gsa-cta]').addEventListener('click', () => track('showcase_interact', { showcase: SC, action: 'cta' }));

  if (!motion) { apply(); return; }

  /* ---------------- Layout ---------------- */
  // Phones: the box sits above the pinned stage, so the phone gets the whole screen
  const place = () => {
    const out = small.matches;
    if (out === box.classList.contains('is-out') || box.contains(document.activeElement)) return;
    box.classList.toggle('is-out', out);
    if (out) pin.before(box); else fit.prepend(box);
  };
  // Layout positions inside the search page (transforms do not count)
  const off = el => { let x = 0, y = 0; for (let e = el; e && e !== scr; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; } return { x, y }; };
  function measure() {
    place();
    fit.style.transform = '';
    const phone = small.matches;
    // Short screens: scale the stage down, so nothing is cut off (the room under the menu stays)
    if (!phone) { const k = Math.min(1, (innerHeight - parseFloat(getComputedStyle(sticky).paddingTop)) / fit.offsetHeight); if (k < 1) fit.style.transform = `scale(${k})`; }
    // Your card starts in place 4 (3 on a phone) and moves to the front
    const Y = phone ? 2 : 3, c = off(cards[0]), b = off(buy), q = off(qbox), w = scr.clientWidth, h = scr.clientHeight;
    S0 = cards.map((x, i) => !i ? Y : i <= Y ? i - 1 : i);
    L = {
      Y, pitch: cards[1].offsetLeft - cards[0].offsetLeft, sh: sheet.offsetHeight + 30,
      t0: { x: w * .8, y: h + 30 }, t1: { x: c.x + cards[0].offsetWidth / 2, y: c.y + cards[0].offsetWidth * .5 },
      t2: { x: b.x + buy.offsetWidth / 2, y: b.y + buy.offsetHeight / 2 },
      qx: w / 2 - (q.x + qbox.offsetWidth / 2), qy: h * .4 - (q.y + qbox.offsetHeight / 2)
    };
    dirty = true;
  }

  /* ---------------- Confetti from "Købt" ---------------- */
  const COLS = ['#e0552b', '#111', '#f2c14e', '#2f9e5b', '#f6b8a2'];
  const confetti = () => {
    if (!fx.animate) return;
    const r = fx.getBoundingClientRect(), bb = buy.getBoundingClientRect(), x0 = bb.left + bb.width / 2 - r.left, y0 = bb.top + bb.height / 2 - r.top;
    for (let i = 0; i < 32; i++) {
      const d = document.createElement('i'), w = 6 + Math.random() * 6, a = -Math.PI / 2 + (Math.random() - .5) * 2.6, sp = 90 + Math.random() * 140, rot = (Math.random() - .5) * 900;
      d.style.cssText = `left:${x0 - w / 2}px;top:${y0 - w / 2}px;width:${w}px;height:${Math.random() < .5 ? w : w * .45}px;background:${COLS[i % 5]};border-radius:${Math.random() < .4 ? '50%' : '2px'}`;
      fx.appendChild(d);
      const dx = Math.cos(a) * sp, dy = Math.sin(a) * sp;
      d.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx}px,${dy}px) rotate(${rot / 2}deg)`, opacity: 1, offset: .4 },
        { transform: `translate(${dx * 1.4}px,${dy + 170}px) rotate(${rot}deg)`, opacity: 0 }
      ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => d.remove();
    }
  };

  /* ---------------- The story, driven by scroll ---------------- */
  let s = 0, last = -1, step = -1, reached = 0, you = null, bought = null, sold = null, typing = null, start = null, armed = true, snap = true;
  const render = v => {
    const a = v < .2 ? 0 : v < .44 ? 1 : v < .66 ? 2 : 3;
    if (a !== step) {
      step = a; steps.forEach((el, i) => el.classList.toggle('is-on', i === a));
      // Phones can swipe the row until your card moves to the front
      row.classList.toggle('is-lock', a > 1);
      if (a > 1 && row.scrollLeft) row.scrollTo({ left: 0, behavior: 'smooth' });
    }
    // 01 The query is typed, then the box glides up and the results appear
    const n = Math.round(Q.length * seg(v, .02, .13)), qt = Q.slice(0, n);
    if (qEl.textContent !== qt) {
      qEl.textContent = qt;
      // Suggestions under the box: what is typed, and the rest in bold
      const sug = [Q, ...(Q === 'keramik krus' ? [' håndlavet', ' tilbud'] : [' tilbud', ' pris']).map(t => Q + t)];
      acRows.forEach((r, i) => { r.children[1].textContent = qt; r.children[2].textContent = sug[i].slice(qt.length); });
    }
    ac.style.opacity = n > 1 ? 1 - seg(v, .132, .148) : 0;
    const ty = n > 0 && n < Q.length;
    if (ty !== typing) { typing = ty; root.classList.toggle('is-typing', ty); }
    const u = v > .79 ? SHOP : v > .145 ? searchUrl() : 'google.dk';
    if (url.textContent !== u) url.textContent = u;
    const up = 1 - inout(seg(v, .14, .19));
    qbox.style.transform = up ? `translate3d(${(L.qx * up).toFixed(1)}px,${(L.qy * up).toFixed(1)}px,0) scale(${(1 + .06 * up).toFixed(4)})` : '';
    const rk = seg(v, .165, .2);
    res.style.opacity = rk; res.style.transform = rk < 1 ? `translate3d(0,${((1 - rk) * 14).toFixed(1)}px,0)` : '';
    // 02 The cards slide in one by one. 03 Yours lifts, moves to the front and lights up; the rest dim
    const hl = seg(v, .56, .61), p1 = seg(v, .745, .77);
    cards.forEach((c, i) => {
      const j = S0[i], k = ease(seg(v, .19 + j * .027, .27 + j * .027));
      const m = i ? inout(seg(v, .47 + (L.Y - i) * .01, .56 + (L.Y - i) * .01)) : inout(seg(v, .46, .58));
      let x = (j + (i - j) * m - i) * L.pitch + (1 - k) * 80, y = 0, sc = .94 + .06 * k, o = k;
      if (!i) { const lift = Math.sin(Math.PI * m); y = -18 * lift - 3 * hl; sc *= (1 + .05 * lift) * (1 - .035 * Math.sin(Math.PI * p1)); }
      else o *= 1 - .45 * hl;
      c.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${sc.toFixed(4)})`;
      c.style.opacity = o.toFixed(3);
    });
    const isYou = hl > .4;
    if (isYou !== you) { you = isYou; root.classList.toggle('is-you', isYou); }
    next.style.opacity = seg(v, .36, .42);
    // 04 A click on your ad, your product in your webshop, a click on "Læg i kurv" and the sale
    const c1 = inout(seg(v, .67, .745)), shk = inout(seg(v, .77, .83)), c2 = inout(seg(v, .83, .87)), p2 = seg(v, .87, .89);
    const T1 = { x: L.t1.x - row.scrollLeft, y: L.t1.y }, A = c2 ? T1 : L.t0, B = c2 ? L.t2 : T1, ck = c2 || c1, pr = p2 || p1, R = p2 ? L.t2 : T1;
    const gone = ease(seg(v, .9, .97)), cx = lerp(A.x, B.x, ck) + 46 * gone, cy = lerp(A.y, B.y, ck) - 34 * Math.sin(Math.PI * ck) + 30 * gone;
    cur.style.opacity = seg(v, .66, .69) * (1 - seg(v, .93, .97));
    cur.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0) scale(${(1 - .2 * Math.sin(Math.PI * pr)).toFixed(4)})`;
    rip.style.opacity = pr > 0 && pr < 1 ? (.7 * (1 - pr)).toFixed(3) : 0;
    rip.style.transform = `translate3d(${R.x.toFixed(1)}px,${R.y.toFixed(1)}px,0) scale(${(.3 + 1.6 * pr).toFixed(3)})`;
    sheet.style.transform = `translate3d(0,${((1 - shk) * L.sh).toFixed(1)}px,0)`;
    dim.style.opacity = shk.toFixed(3);
    const isB = v >= .89;
    if (isB !== bought) { bought = isB; root.classList.toggle('is-bought', isB); if (isB && armed) { armed = false; confetti(); } }
    if (v < .85) armed = true;
    const isS = v >= .905;
    if (isS !== sold) { sold = isS; root.classList.toggle('is-sold', isS); }
    // A nudge to scroll once something is typed, until the story starts
    const st = v < .06;
    if (st !== start) { start = st; box.classList.toggle('is-start', st); }
  };
  const frame = () => {
    const r = pin.getBoundingClientRect(), H = pin.offsetHeight - sticky.offsetHeight, p = H > 0 ? clamp(-r.top / H) : 0;
    // A little inertia, so wheel steps glide; no catching up after a jump
    s = snap ? p : s + (p - s) * .16; snap = false;
    if (Math.abs(p - s) < .0005) s = p;
    if (s !== last || dirty) { last = s; dirty = false; render(s); }
    if (p > .003 || s > .2) { const a = s < .2 ? 1 : s < .44 ? 2 : s < .66 ? 3 : 4; while (reached < a) track('showcase_step', { showcase: SC, step: ++reached }); }
  };
  // The loop only runs while the stage is near the screen
  let on = false, raf = 0;
  const loop = () => { frame(); raf = on ? requestAnimationFrame(loop) : 0; };
  new IntersectionObserver(es => {
    const was = on; on = es[es.length - 1].isIntersecting;
    if (on && !was) { snap = true; if (!raf) raf = requestAnimationFrame(loop); }
  }, { rootMargin: '120px 0px' }).observe(pin);

  apply();
  addEventListener('resize', measure); addEventListener('load', measure);
  if (small.addEventListener) small.addEventListener('change', measure);
  if (window.ResizeObserver) new ResizeObserver(() => measure()).observe(scr);
  if (document.fonts) document.fonts.ready.then(measure);
  frame();
}
