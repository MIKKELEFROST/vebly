// Affiliate showcase (/services/affiliate-marketing): a partner leaderboard and the payout for Lufteturen, a made-up
// webshop with dog gear (the same example shop as on /services/tiktok-ads), and its four made-up partners. When the
// board comes into view a day runs from 09:00: each tracked sale pops into the live lane with the code or link that brought it, its partner's row lights up and climbs
// past the others (FLIP), and the payout counts commission from sales only (clicks cost 0 kr.). The day's clock only
// runs while the board is on screen. Visitors change the commission, add a partner (0 kr. until their first sale) and
// open a row to see its tracked orders (the creator's row plays her video). Without html.motion the day is shown done.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--affiliate-marketing');
if (root) init(root);

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const af = $('[data-af]'), board = $('[data-af-board]'), lane = $('[data-af-lane]'), payList = $('[data-af-pay]');
  const clockEl = $('[data-af-clock]'), stateEl = $('[data-af-state]'), totalEl = $('[data-af-total]'), salesEl = $('[data-af-sales]');
  const pctEl = $('[data-af-pctv]'), pctX = $('[data-af-pctx]'), clicksEl = $('[data-af-clicks]'), addBtn = $('[data-af-add]'), tpl = $('[data-af-tpl]');
  const steps = $$('[data-af-pct]');
  const nf = new Intl.NumberFormat('da-DK'), kr = v => nf.format(Math.round(v)) + '\u00a0kr.';
  const ev = action => track('showcase_interact', { showcase: 'affiliate-marketing', action });
  const seen = new Set(), step = n => { if (!seen.has(n)) { seen.add(n); track('showcase_step', { showcase: 'affiliate-marketing', step: n }); } };

  // The example: products, each partner's month before today and two older orders, today's sales in order
  const PROD = { tur: ['Turselen Komfort', 449], snus: ['Snuseteppe', 299], seng: ['Hundeseng Ø80', 899], god: ['Godbidder, 3 poser', 129], vest: ['Refleksvest', 199], line: ['Line, 3 m', 249] };
  const BASE = {
    bamse: { av: '#e0552b', n: 14, rev: 6286, old: [['10398', 'tur', 'i går'], ['10377', 'snus', 'i går']] },
    logren: { av: '#fff', n: 11, rev: 4611, old: [['10401', 'seng', 'i går'], ['10366', 'line', '3. nov.']] },
    ugen: { av: '#f2ede4', n: 9, rev: 3141, old: [['10392', 'vest', 'i går'], ['10351', 'tur', '2. nov.']] },
    snuden: { av: '#2f7d6d', n: 6, rev: 2394, old: [['10385', 'tur', 'i går'], ['10340', 'god', '1. nov.']] }
  };
  const DAY = [['ugen', 'snus', 554], ['snuden', 'tur', 602], ['snuden', 'seng', 647], ['logren', 'seng', 691], ['bamse', 'god', 725], ['logren', 'tur', 778], ['logren', 'seng', 820],
    ['ugen', 'tur', 862], ['bamse', 'tur', 909], ['snuden', 'line', 975], ['bamse', 'snus', 1056], ['ugen', 'vest', 1128], ['logren', 'line', 1211], ['bamse', 'seng', 1287]];
  const CLICKS = 3120, CLK = [61, 48, 55, 72, 39, 66, 58, 44, 70, 52, 63, 47, 59, 58];
  // Partners a visitor can add, and the sales they bring when the day is replayed (or while it runs)
  const EXTRA = [
    { k: 'kroelle', name: 'Salon Krølle', ini: 'K', type: 'Hundefrisør', via: 'KROELLE', av: '#f2c14e', avc: '#111', note: 'Sporet via koden <b>KROELLE</b> på salonens visitkort.', sales: ['god', 'tur'] },
    { k: 'gaaturen', name: 'Gåturen', ini: 'G', type: 'Podcast', via: 'GAATUR', av: '#d9e1f7', avc: '#1f45b0', note: 'Sporet via koden <b>GAATUR</b>, som værterne nævner i hvert afsnit.', sales: ['line', 'seng'] }
  ];
  const T0 = 1400, GAP = 1750, TEND = T0 + DAY.length * GAP, START = 540, END = 1320; // ms of the day, minutes on the clock
  const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(Math.round(m) % 60).padStart(2, '0');
  // The clock: 09:00 at the start, each sale at its own time, 22:00 at the end
  const KEYS = [[0, START], ...DAY.map((d, i) => [T0 + i * GAP, d[2]]), [TEND, END]];
  const clockAt = t => { for (let i = 1; i < KEYS.length; i++) { const [a, ma] = KEYS[i - 1], [b, mb] = KEYS[i]; if (t <= b) return ma + (mb - ma) * Math.max(0, t - a) / (b - a); } return END; };

  /* ---------------- Partners ---------------- */
  const part = (el, d) => {
    const p = { k: el.dataset.afP, el, btn: el.querySelector('.af-row__b'), more: el.querySelector('.af-row__more'), d };
    p.rankEl = el.querySelector('[data-af-rank]'); p.nEl = el.querySelector('[data-af-n]'); p.krEl = el.querySelector('[data-af-kr]'); p.prEl = el.querySelector('[data-af-pr]');
    p.ordEl = el.querySelector('[data-af-ord]'); p.via = el.querySelector('.af-via').textContent.trim(); p.name = el.querySelector('.af-row__who b').textContent;
    p.av = el.querySelector('.af-av');
    p.pl = payList.querySelector(`[data-af-pl="${p.k}"]`);
    p.btn.addEventListener('click', () => toggle(p));
    return p;
  };
  const parts = $$('[data-af-p]').map(el => part(el, BASE[el.dataset.afP]));
  let pct = 10, clicks = CLICKS, orderNo = 10431, added = 0;

  const prov = p => Math.round(p.rev * pct / 100);
  const reset = () => {
    parts.forEach(p => { p.n = p.d.n || 0; p.rev = p.d.rev || 0; p.orders = (p.d.old || []).map(([no, pr, when]) => ['#' + no, PROD[pr][0], PROD[pr][1], when]); p.shown = prov(p); });
    clicks = CLICKS; orderNo = 10431;
  };

  /* ---------------- Drawing the numbers ---------------- */
  const roll = (el, from, to, fmt) => {
    if (!motion || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const tick = now => { const t = Math.min(1, (now - t0) / 520), e = 1 - Math.pow(1 - t, 3); el.textContent = fmt(from + (to - from) * e); if (t < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  let shownTotal = 0;
  const paint = (bump) => {
    const max = Math.max(1, ...parts.map(p => p.rev));
    let total = 0, sales = 0;
    parts.forEach(p => {
      const v = prov(p);
      p.nEl.textContent = p.n; p.krEl.textContent = kr(p.rev);
      roll(p.prEl, p.shown, v, kr); p.shown = v;
      p.el.style.setProperty('--s', (p.rev / max).toFixed(3));
      p.el.classList.toggle('is-zero', !p.n);
      p.pl.classList.toggle('is-zero', !p.n);
      p.pl.querySelector('[data-af-pn]').textContent = p.n + ' salg';
      p.pl.querySelector('[data-af-pa]').textContent = kr(v);
      total += v; sales += p.rev;
      if (!p.more.hidden) orders(p);
    });
    roll(totalEl, shownTotal, total, kr);
    if (bump && motion && shownTotal !== total) { totalEl.classList.remove('is-bump'); void totalEl.offsetWidth; totalEl.classList.add('is-bump'); }
    shownTotal = total;
    salesEl.textContent = kr(sales);
    pctEl.textContent = pctX.textContent = pct + ' %';
    clicksEl.textContent = nf.format(clicks);
  };
  const orders = p => {
    p.ordEl.innerHTML = p.orders.length ? p.orders.slice(0, 3).map(([no, name, price, when]) => `<li><span>${no}</span><span>${name}</span><b>${kr(price)}</b><em>${when}</em></li>`).join('')
      : '<li class="is-none">Ingen salg endnu. Indtil da koster partneren 0\u00a0kr.</li>';
  };

  // Highest sales first. When a partner climbs, the rows slide to their new places
  const reorder = () => {
    const list = parts.slice().sort((a, b) => b.rev - a.rev || a.rank - b.rank);
    const moved = list.some((p, i) => board.children[i] !== p.el);
    const tops = moved && motion ? new Map(list.map(p => [p, p.el.getBoundingClientRect().top])) : null;
    const focus = root.contains(document.activeElement) && board.contains(document.activeElement) ? document.activeElement : null;
    if (moved) list.forEach((p, i) => { if (board.children[i] !== p.el) board.insertBefore(p.el, board.children[i]); });
    if (focus) focus.focus({ preventScroll: true });
    list.forEach((p, i) => {
      const up = p.rank && i + 1 < p.rank;
      p.rank = i + 1; p.rankEl.textContent = i + 1;
      if (!tops) return;
      const dy = tops.get(p) - p.el.getBoundingClientRect().top;
      if (dy) p.el.animate([{ transform: `translateY(${dy}px)`, zIndex: up ? 2 : 1 }, { transform: 'none', zIndex: up ? 2 : 1 }], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' });
      if (up) p.rankEl.animate([{ transform: 'translateY(60%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 450, delay: 250, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    });
    return moved;
  };

  /* ---------------- Live lane ---------------- */
  const avHTML = p => p.k === 'bamse' ? '<img src="/assets/media/ugc-hundesele.jpg" alt="">' : p.av.textContent;
  const toLane = (html, cls = '') => {
    const li = document.createElement('li');
    li.className = 'af-ping ' + cls; li.innerHTML = html;
    const lefts = motion ? new Map([...lane.children].map(c => [c, c.offsetLeft])) : null;
    lane.prepend(li);
    if (motion) {
      li.classList.add('is-in');
      [...lane.children].forEach(c => { if (c === li) return; const dx = lefts.get(c) - c.offsetLeft; if (dx) c.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration: 550, easing: 'cubic-bezier(.2,.8,.2,1)' }); });
    }
    while (lane.children.length > 5) lane.lastElementChild.remove();
  };
  const ping = (p, pr, when) => toLane(
    `<span class="af-av" style="--av:${p.av.style.getPropertyValue('--av') || '#eee'};--avc:${p.av.style.getPropertyValue('--avc') || '#111'}" aria-hidden="true">${avHTML(p)}</span>` +
    `<span class="af-ping__t"><b>${kr(PROD[pr][1])}</b><small>${when} · ${PROD[pr][0]}</small></span><span class="af-ping__via">${p.via}</span>`);

  /* ---------------- One sale ---------------- */
  let first = true;
  const sale = (k, pr, when, i) => {
    const p = parts.find(x => x.k === k);
    if (!p) return;
    p.n++; p.rev += PROD[pr][1];
    orderNo += 2 + (orderNo % 3);
    p.orders.unshift(['#' + orderNo, PROD[pr][0], PROD[pr][1], when]);
    clicks += CLK[i % CLK.length];
    paint(true);
    const moved = reorder();
    if (!motion) return;
    ping(p, pr, when);
    p.el.classList.remove('is-hit'); void p.el.offsetWidth; p.el.classList.add('is-hit');
    p.el.onanimationend = e => { if (e.target === p.el) p.el.classList.remove('is-hit'); };
    const plus = document.createElement('span');
    plus.className = 'af-plus'; plus.textContent = '+' + kr(PROD[pr][1] * pct / 100);
    plus.addEventListener('animationend', () => plus.remove());
    p.prEl.parentNode.append(plus);
    if (first) { first = false; step(2); }
    if (moved) step(3);
  };

  /* ---------------- The day: a clock that runs only while the board is on screen ---------------- */
  let t = 0, queue = [], running = false, inView = false, raf = 0, last = 0;
  const build = () => {
    queue = DAY.map(([k, pr], i) => ({ at: T0 + i * GAP, k, pr, i }));
    // Added partners get their sales at fixed places in the day
    parts.filter(p => p.extra).forEach((p, j) => p.extra.sales.forEach((pr, s) => queue.push({ at: T0 + (2 + j * 3 + s * 6) * GAP + GAP / 2, k: p.k, pr, i: s })));
    queue.sort((a, b) => a.at - b.at);
  };
  const frame = now => {
    raf = 0;
    if (!running || !inView || document.hidden) return;
    t += Math.min(100, now - last); last = now;
    while (queue.length && queue[0].at <= t) { const e = queue.shift(); sale(e.k, e.pr, 'kl. ' + hhmm(clockAt(e.at)), e.i); }
    clockEl.textContent = hhmm(clockAt(t));
    if (t >= TEND && !queue.length) return over();
    raf = requestAnimationFrame(frame);
  };
  const go = () => { if (!raf && running && inView) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const over = quiet => { running = false; af.classList.add('is-over'); stateEl.textContent = 'Dagen er gået'; clockEl.textContent = hhmm(END); if (!quiet) step(4); };
  const play = () => {
    cancelAnimationFrame(raf); raf = 0;
    reset(); lane.textContent = ''; first = true;
    parts.forEach(p => { p.rank = 0; });
    shownTotal = 0; paint(false); reorder();
    t = 0; build(); running = true;
    af.classList.remove('is-over'); stateEl.textContent = 'Live'; clockEl.textContent = hhmm(START);
    step(1); go();
  };
  // Reduced motion: the whole day at once
  const finish = () => {
    reset(); build();
    queue.forEach(e => sale(e.k, e.pr, 'kl. ' + hhmm(clockAt(e.at)), e.i));
    queue = []; over(true);
    [...DAY].reverse().slice(0, 4).reverse().forEach(([k, pr, m]) => ping(parts.find(x => x.k === k), pr, 'kl. ' + hhmm(m)));
  };

  /* ---------------- Visitor controls ---------------- */
  const setPct = d => {
    pct = Math.max(5, Math.min(20, pct + d));
    steps.forEach(b => { b.disabled = (+b.dataset.afPct < 0 && pct <= 5) || (+b.dataset.afPct > 0 && pct >= 20); });
    paint(true);
  };
  steps.forEach(b => b.addEventListener('click', () => { ev(+b.dataset.afPct > 0 ? 'provision-op' : 'provision-ned'); setPct(+b.dataset.afPct); }));

  addBtn.addEventListener('click', () => {
    const x = EXTRA[added];
    if (!x) return;
    ev('tilfoej-partner'); added++;
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.dataset.afP = x.k;
    const av = el.querySelector('.af-av');
    av.textContent = x.ini; av.style.setProperty('--av', x.av); av.style.setProperty('--avc', x.avc);
    el.querySelector('.af-row__who b').textContent = x.name;
    el.querySelector('.af-row__who small').textContent = x.type;
    el.querySelector('.af-via span').textContent = x.via;
    el.querySelector('.af-more__in p').innerHTML = x.note;
    board.append(el);
    const li = document.createElement('li');
    li.dataset.afPl = x.k; li.className = 'is-in';
    li.innerHTML = `<span class="af-pay__who"><i style="--av:${x.av}"></i></span><small data-af-pn></small><b data-af-pa></b>`;
    li.firstElementChild.append(x.name);
    payList.append(li);
    const p = part(el, { n: 0, rev: 0, old: [] });
    p.extra = x; p.n = 0; p.rev = 0; p.orders = []; p.shown = 0; p.rank = parts.length + 1;
    parts.push(p);
    paint(false); reorder();
    toLane(`<span><b>${x.name}</b> er med. Første salg giver provision.</span>`, 'af-ping--note');
    // While the day runs, the new partner's first sales come later today
    if (running) x.sales.forEach((pr, s) => { const at = Math.min(TEND - 300, t + 2600 + s * 5200); if (at > t) queue.push({ at, k: x.k, pr, i: s }); });
    queue.sort((a, b) => a.at - b.at);
    if (added >= EXTRA.length) { addBtn.disabled = true; addBtn.textContent = 'Alle partnere er med'; }
  });

  /* ---------------- Open a row: its tracked orders (and the creator's video) ---------------- */
  const vids = 'IntersectionObserver' in window && new IntersectionObserver(es => es.forEach(e => { const v = e.target; if (e.isIntersecting && motion && v.closest('.af-row__more:not([hidden])')) v.play().catch(() => {}); else v.pause(); }), { threshold: .25 });
  $$('video').forEach(v => { if (!motion) v.controls = true; if (vids) vids.observe(v); });
  const toggle = p => {
    const open = p.more.hidden;
    ev('partner-' + p.k + (open ? '-aaben' : '-luk'));
    p.more.hidden = !open; p.btn.setAttribute('aria-expanded', String(open)); p.el.classList.toggle('is-open', open);
    if (open) orders(p);
    const v = p.more.querySelector('video');
    if (v) { if (open && motion) v.play().catch(() => {}); else v.pause(); }
  };

  $('[data-af-again]').addEventListener('click', () => { ev('afspil-igen'); play(); });

  /* ---------------- Start ---------------- */
  steps.forEach(b => { b.disabled = false; });
  if (motion && 'IntersectionObserver' in window) {
    let started = false;
    reset(); parts.forEach((p, i) => { p.rank = i + 1; }); shownTotal = 0; paint(false); clockEl.textContent = hhmm(START);
    // The day starts when a quarter of the card shows, and its clock runs as long as any of it does
    new IntersectionObserver(es => es.forEach(e => {
      inView = e.isIntersecting;
      if (inView && !started && e.intersectionRatio >= .25) { started = true; play(); }
      if (inView) go();
    }), { threshold: [0, .25] }).observe(af);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) go(); });
  } else {
    parts.forEach((p, i) => { p.rank = i + 1; });
    finish();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { step(1); step(4); io.disconnect(); } });
      io.observe(board);
    }
  }
}
