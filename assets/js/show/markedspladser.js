// Showcase: Salg på markedspladser (/services/markedspladser). A sync hub: one product from your webshop in the
// middle, ten real marketplaces around it (plain names, no logos). Pick Tøj, Køkken or Håndlavet: the marketplaces
// that fit light up, and the product, the price and the stock run out to them along the lines. Orders ping in from
// the live marketplaces (and the webshop), the stock drops in the hub and on every marketplace at once, and the dark
// panel collects all orders in one list. "Tilbud" pushes a new price out; a click on a live card sends an order.
// Shops, products, prices, stock and orders are examples. Without html.motion: the finished state, no automatic orders.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--markedspladser');
if (root) {
  try { init(root); } catch (e) { root.classList.add('is-in', 'is-done'); throw e; }
}

function init(root) {
  const SC = 'markedspladser', motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const act = action => track('showcase_interact', { showcase: SC, action });
  let reached = 0;
  const step = n => { while (reached < n) track('showcase_step', { showcase: SC, step: ++reached }); };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const again = (el, c) => { el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };
  const kr = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' kr.';
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const f = n => n.toFixed(1);

  /* ---------------- The examples ---------------- */
  const KIND = {
    toej: { shop: 'Strøg & Søm', t: 'Langærmet raglan <span class="mp-nw">T-shirt</span>', sub: 'Hvid og navy · S til XXL', short: 'Raglan T-shirt', price: 299, stock: 148, w: 'tøj', fit: ['amazon', 'miinto', 'zalando', 'cdon'] },
    koekken: { shop: 'Mølleværk', t: 'Håndkværn til kaffe', sub: 'Sort stål · træhåndtag', short: 'Kaffekværn', price: 899, stock: 86, w: 'køkken', fit: ['amazon', 'allegro', 'fruugo', 'cdon', 'bol', 'kaufland'] },
    haand: { shop: 'Lerlund', t: 'Vase i stentøj, drejet i hånden', sub: 'Salviegrøn glasur · 22 cm', short: 'Vase i stentøj', price: 395, stock: 6, w: 'håndlavet', fit: ['etsy', 'ebay'] }
  };
  // Shown on a card that is not picked: what the marketplace is for, else just "Ikke valgt"
  const WHY = { zalando: 'Mode og sko', miinto: 'Mode', etsy: 'Håndlavet og vintage' };
  // Marketplaces with their own ads (sponsored products): only their orders can come "via annonce"
  const ADS = ['amazon', 'ebay', 'etsy', 'bol', 'allegro', 'kaufland'];
  const CN = { dk: 'Danmark', se: 'Sverige', no: 'Norge', fi: 'Finland', de: 'Tyskland', nl: 'Holland', be: 'Belgien', pl: 'Polen', cz: 'Tjekkiet', hu: 'Ungarn', at: 'Østrig' };

  const board = $('[data-mp-board]'), svg = $('[data-mp-svg]'), fx = $('[data-mp-fx]'), hub = $('[data-mp-hub]');
  const segs = $$('[data-mp-kind]'), saleB = $('[data-mp-sale]'), refill = $('[data-mp-refill]'), pics = $$('[data-mp-pic]');
  const stockEl = $('[data-mp-stock]'), syncEl = $('[data-mp-sync]'), syncW = $('[data-mp-syncw]'), priceEl = $('[data-mp-price]');
  const delta = $('[data-mp-delta]'), list = $('[data-mp-list]'), say = $('[data-mp-say]'), nEl = $('[data-mp-n]'), krEl = $('[data-mp-kr]'), adEl = $('[data-mp-ad]');
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
  const gl = svgEl('g', {}), gp = svgEl('g', {});
  svg.append(gl, gp);

  // One entry per marketplace card: its line (drawn), its flow line (dots running out, also used to place packets)
  const M = $$('[data-mp-m]').map(el => {
    const m = { k: el.dataset.mpM, el, name: el.querySelector('.mp-m__n').textContent, side: el.closest('.mp-col--l') ? -1 : 1, cs: el.querySelector('[data-mp-c]').dataset.mpC.split(' '), cp: el.querySelector('[data-mp-cp]'), ck: el.querySelector('[data-mp-cs]'), no: el.querySelector('.mp-m__no'), state: '', len: 0 };
    m.ln = svgEl('path', { class: 'mp-ln', pathLength: 1 });
    m.fl = svgEl('path', { class: 'mp-fl' });
    gl.append(m.ln, m.fl);
    return m;
  });
  const ports = [0, 1].map(() => { const h = svgEl('circle', { class: 'mp-porth', r: 6 }), c = svgEl('circle', { class: 'mp-port', r: 4.5 }); gp.append(h, c); return [h, c]; });

  /* ---------------- Layout: lines from the hub out to each card ---------------- */
  // Where an element sits in the board, from the layout (entrance transforms are ignored)
  const pos = e => { const w = e.offsetWidth, h = e.offsetHeight; let x = 0, y = 0; for (; e && e !== board; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; } return { x, y, w, h }; };
  const narrow = matchMedia('(max-width: 759px)');
  const layout = () => {
    // Large screens: a fan from a port on each side of the hub. Phones: one spine down between the two columns
    const spine = narrow.matches, h = pos(hub);
    svg.setAttribute('viewBox', `0 0 ${board.clientWidth} ${board.clientHeight}`);
    const P = spine ? [{ x: h.x + h.w / 2, y: h.y + h.h }] : [{ x: h.x, y: h.y + h.h / 2 }, { x: h.x + h.w, y: h.y + h.h / 2 }];
    ports.forEach((cs, i) => cs.forEach(c => { const p = P[i]; c.style.display = p ? '' : 'none'; if (p) { c.setAttribute('cx', f(p.x)); c.setAttribute('cy', f(p.y)); } }));
    M.forEach(m => {
      const r = pos(m.el), ey = r.y + r.h / 2, ex = m.side < 0 ? r.x + r.w : r.x;
      let d;
      if (spine) {
        const s = P[0], dir = Math.sign(ex - s.x), R = Math.min(12, Math.abs(ex - s.x), Math.max(0, ey - s.y));
        d = `M${f(s.x)} ${f(s.y)}V${f(ey - R)}Q${f(s.x)} ${f(ey)} ${f(s.x + dir * R)} ${f(ey)}H${f(ex)}`;
      } else {
        const s = P[m.side < 0 ? 0 : 1], k = Math.abs(ex - s.x) * .55;
        d = `M${f(s.x)} ${f(s.y)}C${f(s.x + m.side * k)} ${f(s.y)} ${f(ex - m.side * k)} ${f(ey)} ${f(ex)} ${f(ey)}`;
      }
      m.ln.setAttribute('d', d); m.fl.setAttribute('d', d);
      m.len = m.fl.getTotalLength();
    });
  };

  /* ---------------- Packets: dots that travel a line, out to a card or back to the hub ---------------- */
  const flying = new Set();
  let raf = 0;
  const ease = t => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
  const place = p => {
    const t = Math.min(1, (performance.now() - p.t0) / p.dur), e = ease(t), pt = p.m.fl.getPointAtLength((p.out ? e : 1 - e) * p.m.len);
    p.el.style.transform = `translate(${f(pt.x)}px,${f(pt.y)}px)`;
    p.el.style.opacity = t < .08 ? t / .08 : t > .94 ? (1 - t) / .06 : 1;
    return t;
  };
  const tick = () => {
    for (const p of flying) if (place(p) >= 1) { p.el.remove(); flying.delete(p); p.res(); }
    raf = flying.size ? requestAnimationFrame(tick) : 0;
  };
  const fly = (m, out, cls, dur) => new Promise(res => {
    if (!motion || !m.len) return res();
    const el = document.createElement('i'), p = { m, out, el, dur, res, t0: performance.now() };
    el.className = 'mp-pk ' + cls;
    fx.append(el); place(p); flying.add(p);
    if (!raf) raf = requestAnimationFrame(tick);
  });

  /* ---------------- State ---------------- */
  let kind = 'toej', sale = false, gen = 0, started = false, done = 0, lt = 0, inView = false;
  const stock = { toej: 148, koekken: 86, haand: 6 };
  const price = () => { const p = KIND[kind].price; return sale ? Math.round(p * .8) : p; };
  const setState = (m, s) => {
    m.state = s;
    m.el.classList.remove('is-live', 'is-send', 'is-off', 's1', 's2', 's3');
    if (s) m.el.classList.add('is-' + s);
    m.ln.classList.toggle('is-on', s === 'live' || s === 'send');
    m.fl.classList.toggle('is-on', s === 'live');
  };
  // What a card shows once it is live: the price and the stock it got from the hub
  const chips = (m, flash) => {
    const n = stock[kind];
    m.cp.textContent = kr(price()); m.cp.classList.toggle('is-sale', sale);
    m.ck.textContent = n > 0 ? n + ' stk.' : 'Udsolgt'; m.ck.classList.toggle('is-zero', n <= 0);
    if (flash && motion) again(flash === 'p' ? m.cp : m.ck, 'is-flash');
  };
  const paintPrice = () => {
    priceEl.innerHTML = sale ? `<b>${kr(price())}</b><s>${kr(KIND[kind].price)}</s>` : `<b>${kr(price())}</b>`;
    priceEl.classList.toggle('is-sale', sale);
  };
  const setStock = dir => {
    const n = stock[kind], zero = n <= 0;
    stockEl.textContent = n;
    if (motion && dir) stockEl.animate([{ transform: `translateY(${dir * 100}%)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, easing: 'cubic-bezier(.2,.8,.2,1)' });
    syncEl.classList.toggle('is-zero', zero);
    syncW.textContent = zero ? 'Udsolgt overalt' : 'Lager i sync';
    refill.hidden = !zero;
  };
  const paintHub = () => {
    const K = KIND[kind];
    $('[data-mp-shop]').textContent = K.shop; $('[data-mp-title]').innerHTML = K.t; $('[data-mp-sub]').textContent = K.sub;
    pics.forEach(p => { const on = p.dataset.mpPic === kind; p.classList.toggle('is-on', on); if (on) p.removeAttribute('aria-hidden'); else p.setAttribute('aria-hidden', 'true'); });
    paintPrice(); setStock(0);
  };
  // The hub sends the change out: every live card gets it at the same moment
  const wave = async what => {
    const live = M.filter(m => m.state === 'live');
    if (motion) again(hub, 'is-wave');
    await Promise.all(live.map(m => fly(m, true, 'mp-pk--s', 560).then(() => { if (m.state === 'live') chips(m, what); })));
    if (motion) again(syncEl, 'is-pulse');
  };

  /* ---------------- The product goes out to the marketplaces that fit ---------------- */
  const push = async () => {
    const g = ++gen, K = KIND[kind];
    $('[data-mp-fitn]').textContent = K.fit.length; $('[data-mp-fitw]').textContent = K.w;
    M.forEach(m => {
      if (K.fit.includes(m.k)) { setState(m, motion ? 'send' : 'live'); if (!motion) chips(m); }
      else { m.no.textContent = WHY[m.k] || 'Ikke valgt'; setState(m, 'off'); }
    });
    if (!motion) { if (started) step(2); return; }
    // Three packets per card: the product, the price, the stock. Each ticks off its step on the card
    await Promise.all(M.filter(m => m.state === 'send').map((m, j) => new Promise(res => {
      [0, 1, 2].forEach(s => setTimeout(() => {
        if (g !== gen) return res();
        fly(m, true, 'mp-pk', 620).then(() => {
          if (g !== gen || m.state !== 'send') return res();
          m.el.classList.add('s' + (s + 1));
          if (s === 2) setTimeout(() => { if (g === gen && m.state === 'send') { chips(m); setState(m, 'live'); } res(); }, 280);
        });
      }, 120 + j * 110 + s * 170));
    })));
    if (g !== gen) return;
    step(2);
    loop(1300);
  };
  const setKind = async k => {
    if (k === kind) return;
    kind = k;
    segs.forEach(b => { const on = b.dataset.mpKind === k; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    const K = KIND[k];
    say.textContent = `${K.fit.length} af 10 markedspladser passer til ${K.w}: ${M.filter(m => K.fit.includes(m.k)).map(m => m.name).join(', ')}.`;
    clearTimeout(lt);
    if (motion) { hub.classList.add('is-swap'); await wait(220); if (kind !== k) return; }
    paintHub();
    hub.classList.remove('is-swap');
    push();
  };

  /* ---------------- Orders: from a marketplace (or the webshop) into one list ---------------- */
  let clock = 10 * 60 + 41, nOrders = +nEl.textContent, sum = 8146, nAds = +adEl.textContent;
  const hhmm = () => Math.floor(clock / 60) % 24 + '.' + String(clock % 60).padStart(2, '0');
  const addRow = (src, c, item, qty, total, ad) => {
    const li = document.createElement('li'), old = [...list.children];
    li.className = 'mp-o' + (motion ? ' is-new' : '');
    li.innerHTML = `<span class="mp-o__a"><b>${src}</b><i class="mp-f mp-f--${c}" title="${CN[c]}"></i>${ad ? '<em>Annonce</em>' : ''}</span><span class="mp-o__kr">${kr(total)}</span><span class="mp-o__b">${item} · ${qty} stk.</span><span class="mp-o__t">${hhmm()}</span>`;
    list.prepend(li);
    if (motion) { const dy = li.offsetHeight + 6; old.forEach(r => r.animate([{ transform: `translateY(${-dy}px)` }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.2,.8,.2,1)' })); }
    while (list.children.length > 7) list.lastElementChild.remove();
  };
  const order = async (m, user) => {
    if (stock[kind] <= 0) { if (m) again(m.el, 'is-nope'); if (user) say.textContent = 'Udsolgt overalt. Fyld lageret op for at sælge igen.'; return; }
    if (m && m.state !== 'live') return;
    const k = kind;
    if (m) { again(m.el, 'is-ping'); await fly(m, false, 'mp-pk--o', 720); }
    if (kind !== k || stock[k] <= 0) return;
    const qty = Math.min(stock[k], Math.random() < .14 ? 2 : 1), p = price(), ad = !!m && ADS.includes(m.k) && Math.random() < .35;
    stock[k] -= qty; setStock(1);
    if (motion) { delta.textContent = '−' + qty; again(delta, 'is-go'); }
    clock += 1 + Math.floor(Math.random() * 3);
    addRow(m ? m.name : 'Webshop', m ? pick(m.cs) : 'dk', KIND[k].short, qty, p * qty, ad);
    nOrders++; sum += p * qty; if (ad) nAds++;
    nEl.textContent = nOrders; krEl.textContent = kr(sum); adEl.textContent = nAds;
    if (motion) { again(nEl, 'is-tick'); again(krEl, 'is-tick'); if (ad) again(adEl, 'is-tick'); }
    if (user) say.textContent = `Ny ordre fra ${m.name}. Lageret er nu ${stock[k]}, også på de andre markedspladser.`;
    step(3); if (++done >= 5 || !stock[k]) step(4);
    await wave('s');
  };
  // With motion, orders keep coming while the section is on screen (every 2.4 to 4.2 seconds)
  const loop = (first = 2400) => {
    clearTimeout(lt);
    if (!motion) return;
    lt = setTimeout(() => {
      const live = M.filter(m => m.state === 'live');
      if (inView && !document.hidden && stock[kind] > 0 && live.length) order(Math.random() < .18 ? null : pick(live));
      loop(2400 + Math.random() * 1800);
    }, first);
  };

  /* ---------------- Controls ---------------- */
  segs.forEach(b => b.addEventListener('click', () => { const k = b.dataset.mpKind; if (k !== kind) { act('vare-' + k); setKind(k); } }));
  saleB.addEventListener('click', () => {
    sale = !sale;
    saleB.setAttribute('aria-pressed', String(sale));
    act(sale ? 'tilbud-til' : 'tilbud-fra');
    paintPrice();
    say.textContent = `Ny pris: ${kr(price())}. Den er sendt ud til alle markedspladserne.`;
    wave('p');
  });
  refill.addEventListener('click', () => {
    act('fyld-op');
    stock[kind] = KIND[kind].stock; setStock(-1);
    say.textContent = `Lageret er fyldt op til ${stock[kind]}, på alle markedspladserne.`;
    wave('s').then(() => loop(1600));
  });
  // A card in focus lights up its line
  M.forEach(m => { const hot = on => () => m.ln.classList.toggle('is-hot', on); for (const [e, on] of [['mouseenter', 1], ['mouseleave', 0], ['focus', 1], ['blur', 0]]) m.el.addEventListener(e, hot(!!on)); });
  M.forEach(m => m.el.addEventListener('click', () => {
    if (m.state === 'live') { act(stock[kind] > 0 ? 'ordre-' + m.k : 'udsolgt'); order(m, true); }
    else if (m.state === 'off') { act('ikke-valgt'); again(m.el, 'is-nope'); say.textContent = `${m.name} er ikke valgt til ${KIND[kind].w}.`; }
  }));

  /* ---------------- Start ---------------- */
  M.forEach((m, j) => m.ln.style.setProperty('--d', (.4 + (j % 5) * .08).toFixed(2) + 's'));
  layout();
  if (motion) M.forEach(m => setState(m, ''));
  else { paintHub(); push(); }
  const start = () => {
    if (started) return;
    started = true;
    step(1);
    if (!motion) return step(2);
    root.classList.add('is-in');
    setTimeout(() => root.classList.add('is-done'), 1500);
    setTimeout(push, 1000);
  };
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => es.forEach(e => {
      inView = e.isIntersecting;
      if (e.intersectionRatio >= (narrow.matches ? .12 : .3)) start();
    }), { threshold: [0, .12, .3] }).observe(board);
  } else { inView = true; start(); }

  let rt = 0;
  const relayout = () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(layout); };
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(board);
  addEventListener('resize', relayout);
  if (document.fonts) document.fonts.ready.then(relayout);
}
