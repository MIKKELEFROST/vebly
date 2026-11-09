// Showcase: Tracking (/services/tracking). A browser window with a made-up webshop (Mølleværk, the hand grinder at
// 899 kr.) and a devtools-like panel. A cursor shops by itself; every action fires an event that flies into the
// panel with its parameters, and chips show where it lands: GA4, Google Ads and Meta, arrived, stopped by the
// visitor's adblocker, or sent as a ping without cookies (Consent Mode). Visit 1 runs "Kun browser", visit 2
// "Server-side" (via the shop's own domain). Consent "Nej tak": Google gets cookieless pings, Meta nothing, also
// server-side. The three tool panels below receive the events, and the dashboard counts which ad and page gave the
// sales in a second browser tab that opens after each purchase. All examples. Without html.motion: one finished
// visit (server-side) with the dashboard tab open, no cursor, nothing moves.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--tracking');
if (root) {
  try { init(root); } catch (e) { root.classList.add('is-done'); throw e; }
}

function init(root) {
  const SC = 'tracking', motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const act = action => track('showcase_interact', { showcase: SC, action });
  let reached = 0;
  const step = n => { while (reached < n) track('showcase_step', { showcase: SC, step: ++reached }); };
  const sleep = ms => new Promise(r => setTimeout(r, motion ? ms : 0));
  const again = (el, c) => { if (!motion || !el) return; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); };
  const dot = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const kr = n => dot(n) + ' kr.';
  const pad = n => String(n).padStart(2, '0');
  const rectOf = s => s instanceof Element ? s.getBoundingClientRect() : s;

  const win = $('[data-trk-win]'), fx = $('[data-trk-fx]'), shop = $('[data-trk-shop]'), pgs = $('[data-trk-pgs]');
  const pages = $$('[data-trk-pg]'), drawer = $('[data-trk-drawer]'), cc = $('[data-trk-cc]'), cur = $('[data-trk-cur]');
  const log = $('[data-trk-log]'), url = $('[data-trk-url]'), ab = $('[data-trk-ab]'), abn = $('[data-trk-abn]');
  const addB = $('[data-trk-act="add"]'), coB = $('[data-trk-act="checkout"]'), payB = $('[data-trk-act="pay"]');
  const cart = $('[data-trk-cart]'), vid = $('[data-trk-vid]'), title = $('[data-trk-title]'), thanks = $('[data-trk-thanks]');
  const modeB = $$('[data-trk-mode]'), consB = $$('[data-trk-cons]'), ccB = $$('[data-trk-ccb]'), route = $('[data-trk-route]');
  const cap = $('[data-trk-cap]'), say = $('[data-trk-say]'), dv = $('[data-trk-dv]'), lostEl = $('[data-trk-lost]');
  const tabs = $$('[data-trk-tab]'), tabDot = $('[data-trk-tabdot]'), urlT = $('[data-trk-urlt]');

  /* ---------------- The events: GA4 name, Meta standard event, parameters ---------------- */
  const shopP = [['value', 899], ['currency', 'DKK'], ['items', 0]];
  const EV = {
    pv: { n: 'page_view', m: 'PageView', p: () => [['page_location', '…/haandkvaern?utm_source=google&utm_medium=cpc'], ['page_title', 'Håndkværn til kaffe']] },
    vi: { n: 'view_item', m: 'ViewContent', p: () => shopP },
    atc: { n: 'add_to_cart', m: 'AddToCart', p: () => shopP },
    bc: { n: 'begin_checkout', m: 'InitiateCheckout', p: () => shopP },
    pur: { n: 'purchase', m: 'Purchase', ads: 1, p: () => [['value', 899], ['currency', 'DKK'], ['transaction_id', oid()], ['items', 0]] }
  };
  const S = { mode: 'browser', cons: 'ja', ab: true };
  // What happens to a signal right now: to GA4 / Google Ads ('g') or to Meta ('m')
  const fate = to => {
    if (to === 'm') {
      if (S.cons !== 'ja') return ['off', 'ikke sendt'];
      if (S.mode === 'browser') return S.ab ? ['no', 'blokeret'] : ['ok', '', 'b'];
      return S.ab ? ['ok', 'server', 's'] : ['ok', 'browser + server', 'bs'];
    }
    if (S.mode === 'browser' && S.ab) return ['no', 'blokeret'];
    return S.cons === 'ja' ? ['ok', ''] : ['ck', 'uden cookies'];
  };

  let gen = 0, tok = 0, visit = 0, seq = 0, t0 = 0, stage = '', busy = false, inView = !motion, ccOn = false, drOn = false;
  const N = { ok: 0, no: 0, ck: 0 };
  const oid = () => 'MV-' + (10481 + visit);
  const clock = () => { const s = 50527 + visit * 131 + (motion ? Math.round((performance.now() - t0) / 1000) : seq * 2); return [s / 3600 | 0, (s / 60 | 0) % 60, s % 60].map(pad).join('.'); };

  /* ---------------- Motion helpers: an arc across the window, the cursor ---------------- */
  const arc = (el, a, b, T) => new Promise(res => {
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    let nx = dy / L, ny = -dx / L;
    if (ny > 0 || (Math.abs(ny) < .2 && nx < 0)) { nx = -nx; ny = -ny; }
    const k = Math.min(130, L * .3), cx = (a.x + b.x) / 2 + nx * k, cy = Math.max(12, (a.y + b.y) / 2 + ny * k), s = performance.now();
    const f = now => {
      const t = Math.min(1, (now - s) / T), e = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2, u = 1 - e;
      const x = u * u * a.x + 2 * u * e * cx + e * e * b.x, y = u * u * a.y + 2 * u * e * cy + e * e * b.y;
      el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${(.72 + .28 * Math.min(1, t * 3)).toFixed(3)})`;
      el.style.opacity = t > .86 ? (1 - t) / .14 : 1;
      if (t < 1) requestAnimationFrame(f); else { el.remove(); res(); }
    };
    fx.append(el); f(s);
  });
  const inWin = (r, ax = .5, ay = .5) => { const w = win.getBoundingClientRect(); return { x: r.left + r.width * ax - w.left, y: r.top + r.height * ay - w.top }; };
  // The event flies from what was clicked to the top of the list
  const fly = (src, label) => {
    if (!motion || !inView || !src) return Promise.resolve();
    const el = document.createElement('span');
    el.className = 'trk-pill'; el.textContent = label; fx.append(el);
    const w = el.offsetWidth, h = el.offsetHeight, a = inWin(rectOf(src)), l = inWin(log.getBoundingClientRect(), 0, 0);
    return arc(el, { x: a.x - w / 2, y: a.y - h / 2 }, { x: l.x + 42, y: l.y + 12 }, 720);
  };
  // A blocked signal is caught by the adblocker in the toolbar
  let caught = 0;
  const catchIt = async chip => {
    if (motion && inView) {
      const el = document.createElement('i'); el.className = 'trk-spark';
      await arc(el, inWin(chip.getBoundingClientRect(), .15), inWin(ab.getBoundingClientRect(), .3), 620);
    }
    abn.textContent = ++caught; abn.classList.add('is-on'); again(abn, 'is-bump'); again(ab, 'is-hit');
  };
  const curTo = async el => {
    const s = shop.getBoundingClientRect(), r = el.getBoundingClientRect();
    cur.style.transform = `translate(${(r.left - s.left + r.width * .62).toFixed(1)}px,${(r.top - s.top + r.height * .62).toFixed(1)}px)`;
    await sleep(820);
  };
  const curHome = () => {
    cur.style.transition = 'none';
    cur.style.transform = `translate(${shop.clientWidth * .78}px,${shop.clientHeight * .82}px)`;
    void cur.offsetWidth; cur.style.transition = '';
  };

  /* ---------------- The event list ---------------- */
  const params = p => '{ ' + p.map(([k, v]) => `<span class="k">${k}</span>: ` + (k === 'items' ? '<span class="v">[{…}]</span>' : typeof v === 'number' ? `<span class="v">${v}</span>` : `<span class="s">"${v}"</span>`)).join(', ') + ' }';
  const chip = (to, name, cls = '') => `<span class="trk-to is-wait ${cls}" data-to="${to}"><i></i><b>${name}</b><em></em></span>`;
  const row = (name, sub, p, chips) => {
    const li = document.createElement('li');
    li.className = 'trk-ev';
    li.innerHTML = `<div class="trk-ev__in"><div class="trk-ev__box"><span class="trk-ev__i">${pad(++seq)}</span><span class="trk-ev__n">${name}${sub ? ` <small>${sub}</small>` : ''}</span><span class="trk-ev__tm">${clock()}</span><span class="trk-ev__p">${params(p)}</span><span class="trk-ev__to">${chips}</span></div></div>`;
    log.prepend(li);
    while (log.children.length > 9) log.lastElementChild.remove();
    return li;
  };
  const open = li => { li.classList.add('is-in', 'is-new'); setTimeout(() => li.classList.remove('is-new'), 1300); };
  const setChip = (c, st, em) => { c.classList.remove('is-wait'); c.classList.add('is-' + st, 'is-in'); c.querySelector('em').textContent = em; };
  const nEls = {}; $$('[data-trk-n]').forEach(b => { nEls[b.dataset.trkN] = b; });
  const paintN = k => { for (const n in N) nEls[n].textContent = N[n]; if (k) again(nEls[k], 'is-bump'); };

  const emit = async (k, src) => {
    const g = gen, E = EV[k], srv = S.mode === 'server';
    const li = row(E.n, '', E.p(), (srv ? chip('via', 'via din server', 'trk-to--via') : '') + chip('ga', 'GA4') + (E.ads ? chip('ads', 'Google Ads') : '') + chip('m', `Meta<span class="trk-to__m"> ${E.m}</span>`));
    await fly(src, E.n); if (g !== gen) return;
    open(li);
    await sleep(380);
    for (const c of li.querySelectorAll('.trk-to')) {
      if (g !== gen) return;
      const to = c.dataset.to, r = to === 'via' ? ['ok', ''] : fate(to === 'm' ? 'm' : 'g');
      setChip(c, r[0], r[1]);
      if (to !== 'via') {
        N[r[0] === 'off' ? 'ck' : r[0]]++; paintN(r[0] === 'off' ? 'ck' : r[0]);
        land(E, to, r);
        if (r[0] === 'no') catchIt(c);
      }
      await sleep(240);
    }
  };
  const emitConsent = async src => {
    const g = gen, y = S.cons === 'ja', v = y ? 'granted' : 'denied';
    const li = row('consent', 'update', [['ad_storage', v], ['analytics_storage', v], ['ad_user_data', v], ['ad_personalization', v]], chip('cc', 'Samtykke'));
    await fly(src, 'consent'); if (g !== gen) return;
    open(li); await sleep(320); if (g !== gen) return;
    setChip(li.querySelector('.trk-to'), y ? 'ok' : 'ck', y ? 'ja til alt' : 'kun nødvendige');
  };

  /* ---------------- The three tools receive the events ---------------- */
  const pf = {}, pst = {};
  $$('[data-trk-pf]').forEach(e => { pf[e.dataset.trkPf] = e; pst[e.dataset.trkPf] = e.querySelector('[data-trk-pfs]'); });
  const status = (k, st, t, hit) => { pst[k].className = 'trk-pf__st' + (st ? ' is-' + st : ''); pst[k].textContent = t; if (hit) again(pf[k], hit); };
  const gab = $('[data-trk-gab]'), gaU = $('[data-trk-gau]'), adR = $('[data-trk-adr="s"]'), adK = $('[data-trk-adk]'), adC = $('[data-trk-adc]'), adV = $('[data-trk-adv]'), adT = $('[data-trk-adt]'), adTV = $('[data-trk-adtv]');
  let gaUsers = 14, gaGot = false, adClicks = 1240, adConv = 24, adVal = 21576;
  const MSG = { b: 'fra Pixel i browseren.', s: 'fra serveren (Conversions API).', bs: 'fra browser og server. Dubletten fjernes via event_id.' };
  const land = (E, to, r) => {
    const [st, , path] = r;
    if (to === 'ga') {
      if (st === 'ok') {
        const li = $(`[data-ga="${E.n}"]`), b = li.querySelector('b');
        b.textContent = +b.textContent + 1; again(li, 'is-flash');
        if (!gaGot) { gaGot = true; gaU.textContent = ++gaUsers; }
        const bar = gab.lastElementChild; bar.style.setProperty('--h', Math.min(1, (parseFloat(bar.style.getPropertyValue('--h')) || .1) + .13)); bar.classList.add('is-hot');
        status('ga', 'ok', `Lige nu: ${E.n}${E.ads ? ' · 899 kr.' : ''}`, 'is-hit');
      } else if (st === 'no') status('ga', 'no', 'Intet fra dette besøg. Adblockeren stoppede det.', 'is-miss');
      else status('ga', 'ck', 'Kun pings uden cookies. Google kan bruge dem til beregnede tal.');
      if (E.ads) sale(st);
    } else if (to === 'ads') {
      if (st === 'ok') {
        adC.textContent = ++adConv; adV.textContent = kr(adVal += 899); again(adR, 'is-flash');
        adT.textContent = adConv + 11; adTV.textContent = kr(adVal + 9889); again(adT, 'is-bump'); again(adTV, 'is-bump');
        status('ads', 'ok', 'Ny konvertering: Køb · 899 kr.', 'is-hit');
      } else if (st === 'no') status('ads', 'no', 'Klikket kom med. Købet gjorde ikke.', 'is-miss');
      else status('ads', 'ck', 'Kun et ping uden cookies. Google kan bruge det til beregnede tal.');
    } else {
      const li = $(`[data-mt="${E.m}"]`);
      li.className = st === 'ok' ? path.split('').join(' ') : st === 'no' ? 'x' : 'o'; again(li, 'is-flash');
      if (st === 'ok') status('meta', 'ok', `Lige nu: ${E.m} ${MSG[path]}`, 'is-hit');
      else if (st === 'no') status('meta', 'no', `${E.m} blev stoppet i browseren.`, 'is-miss');
      else status('meta', 'ck', 'Intet sendt. Den besøgende sagde nej tak.');
    }
  };

  /* ---------------- The dashboard: count up, then +1 for each sale that is measured ---------------- */
  const D = { kob: 61, oms: 54839, ann: 52, gs: 24, mr: 17, sh: 11, nl: 5, or: 4, p: 38, g: 14, f: 9 };
  const dEls = $$('[data-trk-d]'), bars = $$('[data-trk-bar]');
  let shown = motion ? 0 : 1, lost = 0, counted = false;
  const paintNums = () => dEls.forEach(el => { const k = el.dataset.trkD, v = Math.round(D[k] * shown); el.textContent = k === 'oms' ? kr(v) : dot(v); });
  const paintBars = () => bars.forEach(li => { const k = li.dataset.trkBar; li.style.setProperty('--v', (D[k] / (li.closest('.trk-bars--pg') ? 44 : 28)).toFixed(3)); });
  const countUp = () => {
    if (counted) return; counted = true; paintBars();
    if (!motion) { shown = 1; paintNums(); return; }
    const s = performance.now();
    const f = now => { const t = Math.min(1, (now - s) / 1600); shown = 1 - (1 - t) ** 3; paintNums(); if (t < 1) requestAnimationFrame(f); else step(5); };
    requestAnimationFrame(f);
  };
  const live = (k, st, t) => { const e = $(`[data-trk-live="${k}"]`); e.className = 'trk-live is-' + st; e.textContent = t; };
  const sale = st => {
    if (st === 'ok') {
      ['kob', 'ann', 'gs', 'p'].forEach(k => D[k]++); D.oms += 899;
      paintNums(); if (counted || !motion) paintBars();
      ['kob', 'oms', 'ann', 'gs', 'p'].forEach(k => again($(`[data-trk-d="${k}"]`), 'is-bump'));
      live('gs', 'ok', '+1 lige nu'); live('p', 'ok', '+1 lige nu');
    } else if (st === 'no') {
      lostEl.hidden = false; lostEl.textContent = `${++lost} køb kom ikke med i tallene`;
      live('gs', 'no', 'Købet mangler');
    } else live('gs', 'ck', 'Uden samtykke');
  };

  /* ---------------- The shop ---------------- */
  let vidOn = false;
  const syncVid = () => {
    const on = motion && inView && tab === 'shop' && (stage === '' || stage === 'cc' || stage === 'p') && !document.hidden;
    if (on === vidOn) return; vidOn = on;
    if (on) { if (vid.preload === 'none') vid.preload = 'auto'; const p = vid.play(); if (p) p.catch(() => {}); } else vid.pause();
  };
  const URLS = { p: ['/haandkvaern', '?utm_source=google&amp;utm_medium=cpc'], k: ['/kassen', ''], t: ['/tak', '?ordre='], dash: ['/dashboard', '?periode=oktober'] };
  let tab = 'shop', pg = 'p';
  const paintUrl = () => { const [a, q] = URLS[tab === 'dash' ? 'dash' : pg]; urlT.innerHTML = `<b>moellevaerk.dk</b>${a}<span class="trk-url__q">${q}${pg === 't' && tab !== 'dash' ? oid() : ''}</span>`; };
  const showPg = k => { pg = k; pages.forEach(p => { const on = p.dataset.trkPg === k; p.classList.toggle('is-on', on); p.inert = !on; }); paintUrl(); };
  const setTab = k => {
    tab = k; tabs.forEach(b => { const on = b.dataset.trkTab === k; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
    dv.classList.toggle('is-on', k === 'dash'); dv.inert = k !== 'dash'; shop.inert = k === 'dash';
    if (k === 'dash') { tabDot.classList.remove('is-on'); countUp(); }
    paintUrl(); syncVid();
  };
  const overlay = () => {
    cc.classList.toggle('is-on', ccOn); cc.inert = !ccOn;
    drawer.classList.toggle('is-on', drOn); drawer.inert = !drOn;
    shop.classList.toggle('is-dim', ccOn || drOn); pgs.inert = ccOn || drOn;
  };

  // A new visitor: the shop, the list and the tools start over (the numbers in the tools keep counting)
  const reset = () => {
    gen++; visit++; seq = 0; caught = 0; t0 = performance.now(); stage = 'cc'; busy = true;
    N.ok = N.no = N.ck = 0; paintN(); abn.textContent = '0'; abn.classList.remove('is-on');
    log.textContent = '';
    $('[data-trk-visit]').textContent = visit; $('[data-trk-oid]').textContent = oid();
    setTab('shop'); showPg('p'); cart.classList.remove('is-full'); $('[data-trk-cartn]').textContent = '0';
    addB.classList.remove('is-done'); $('[data-trk-addw]').textContent = 'Læg i kurv'; payB.classList.remove('is-load');
    ccB.forEach(b => b.classList.remove('is-press'));
    ccOn = true; drOn = false; overlay(); syncVid();
    gaGot = false;
    if (visit > 1) { gab.firstElementChild.remove(); const i = document.createElement('i'); i.style.setProperty('--h', '.1'); gab.append(i); }
    gab.querySelectorAll('.is-hot').forEach(i => i.classList.remove('is-hot'));
    adK.textContent = dot(++adClicks); again(adR, 'is-flash');
    status('ga', '', 'Venter på hændelser fra besøget.');
    status('ads', '', 'Klikket på annoncen er talt med. Venter på et køb.');
    status('meta', '', 'Venter på hændelser fra besøget.');
    $$('[data-mt]').forEach(li => { li.className = ''; });
    $$('[data-trk-live]').forEach(e => { e.className = 'trk-live'; e.textContent = ''; });
    again(url, 'is-hit');
  };
  // The visitor answers the cookie banner; the page then reports itself
  const choose = async (c, src) => {
    if (stage !== 'cc') return;
    const g = gen; stage = 'p';
    setCons(c); again(src, 'is-press');
    await sleep(240); if (g !== gen) return;
    ccOn = false; overlay();
    emitConsent(src);
    await sleep(520); if (g !== gen) return;
    emit('pv', url);
    await sleep(560); if (g !== gen) return;
    await emit('vi', title);
  };
  const add = async () => {
    if (stage !== 'p') return;
    const g = gen; stage = 'cart';
    again(addB, 'is-press'); addB.classList.add('is-done'); $('[data-trk-addw]').textContent = 'Lagt i kurv ✓';
    cart.classList.add('is-full'); $('[data-trk-cartn]').textContent = '1'; again(cart, 'is-bump');
    emit('atc', addB);
    await sleep(700); if (g !== gen) return;
    drOn = true; overlay(); syncVid();
  };
  const checkout = async () => {
    if (stage !== 'cart') return;
    const g = gen, r = coB.getBoundingClientRect(); stage = 'k';
    again(coB, 'is-press'); await sleep(220); if (g !== gen) return;
    drOn = false; overlay(); showPg('k'); syncVid();
    await emit('bc', r);
  };
  const pay = async () => {
    if (stage !== 'k') return;
    const g = gen; stage = 'pay';
    again(payB, 'is-press'); payB.classList.add('is-load');
    await sleep(750); if (g !== gen) return;
    payB.classList.remove('is-load'); showPg('t'); stage = 't';
    await sleep(380); if (g !== gen) return;
    await emit('pur', thanks); if (g !== gen) return;
    busy = false; tabDot.classList.add('is-on');
    await sleep(1100); if (g === gen && stage === 't') setTab('dash');
    const [ga] = fate('g'), [m] = fate('m');
    say.textContent = ga === 'ok' && m === 'ok' ? 'Købet nåede frem til Google Analytics 4, Google Ads og Meta.' : ga === 'no' ? 'Adblockeren stoppede købet. Hverken Google eller Meta fik det.' : ga === 'ck' ? 'Uden samtykke fik Google kun et signal uden cookies, og Meta fik intet.' : 'Købet nåede frem til Google, men ikke til Meta.';
  };

  /* ---------------- Autoplay: the cursor shops by itself ---------------- */
  const visible = async () => { while (motion && !inView) await new Promise(r => setTimeout(r, 250)); };
  const visitor = async () => {
    const my = ++tok, ok = () => my === tok;
    reset();
    if (motion) { curHome(); cur.classList.add('is-on'); }
    const tap = async el => { await visible(); if (!ok()) return false; await curTo(el); if (!ok()) return false; again(cur, 'is-click'); return true; };
    await sleep(900);
    let b = $(`[data-trk-ccb="${S.cons}"]`);
    if (!await tap(b)) return false;
    await choose(S.cons, b); if (!ok()) return false;
    await sleep(350);
    if (!await tap(addB)) return false;
    await add(); if (!ok()) return false;
    await sleep(450);
    if (!await tap(coB)) return false;
    await checkout(); if (!ok()) return false;
    await sleep(300);
    if (!await tap(payB)) return false;
    await pay();
    cur.classList.remove('is-on');
    return ok();
  };
  // The visitor takes over: the cursor steps aside
  const takeOver = () => { tok++; cur.classList.remove('is-on'); };
  const play = async () => {
    step(1);
    if (!await visitor()) return;
    step(2);
    const my = tok, srvB = modeB.find(b => b.dataset.trkMode === 'server'), noB = consB.find(b => b.dataset.trkCons === 'nej');
    if (S.mode === 'browser') {
      // The same purchase again, now server-side
      await sleep(1800); srvB.classList.add('is-hint');
      await sleep(2600); await visible(); srvB.classList.remove('is-hint');
      if (my !== tok || busy || S.mode !== 'browser') return;
      setMode('server'); step(3);
      if (!await visitor()) return;
      step(4);
    }
    noB.classList.add('is-hint');
  };
  const nextVisit = () => { if (!busy) visitor(); };

  /* ---------------- Controls ---------------- */
  const paintCap = () => {
    let t = S.mode === 'server'
      ? '<b>Server-side.</b> Browseren sender hændelserne til data.moellevaerk.dk, butikkens eget domæne. Serveren sender dem videre til Google og Meta.'
      : '<b>Kun browser.</b> Browseren sender selv hændelserne til Google og Meta. ' + (S.ab ? 'Den besøgende her har en adblocker, og den kan stoppe dem.' : 'Uden adblocker kommer de frem.');
    if (S.cons !== 'ja') t += ' Uden samtykke sender Google-tags kun et signal uden cookies, og Meta får intet. Det gælder også server-side.';
    cap.innerHTML = t;
  };
  const press = (list, attr, v) => list.forEach(b => { const on = b.dataset[attr] === v; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); if (on) b.classList.remove('is-hint'); });
  const setMode = m => {
    S.mode = m; press(modeB, 'trkMode', m); paintCap();
    route.classList.toggle('is-srv', m === 'server');
    route.innerHTML = m === 'server' ? '<span>Sendes via</span> <b>data.moellevaerk.dk</b> <span>til Google og Meta</span>' : '<span>Sendes fra</span> <b>browseren direkte</b> <span>til Google og Meta</span>';
  };
  function setCons(c) { S.cons = c; press(consB, 'trkCons', c); paintCap(); }

  modeB.forEach(b => b.addEventListener('click', () => {
    const m = b.dataset.trkMode; if (m === S.mode) return;
    act('mode-' + m); setMode(m); nextVisit();
  }));
  consB.forEach(b => b.addEventListener('click', () => {
    const c = b.dataset.trkCons; if (c === S.cons) return;
    act('consent-' + c); setCons(c);
    if (stage === 'cc') return; // the banner is still up: the visitor answers it
    if (busy) emitConsent(null); else nextVisit();
  }));
  ab.addEventListener('click', () => {
    S.ab = !S.ab; ab.classList.toggle('is-on', S.ab); ab.setAttribute('aria-pressed', S.ab);
    act(S.ab ? 'adblock-on' : 'adblock-off'); paintCap(); nextVisit();
  });
  $('[data-trk-again]').addEventListener('click', () => { act('again'); visitor(); });
  tabs.forEach(b => b.addEventListener('click', () => { const k = b.dataset.trkTab; if (k === tab) return; act('tab-' + k); setTab(k); }));
  ccB.forEach(b => b.addEventListener('click', () => { takeOver(); act('banner-' + b.dataset.trkCcb); choose(b.dataset.trkCcb, b); }));
  addB.addEventListener('click', () => { takeOver(); act('shop-add'); add(); });
  coB.addEventListener('click', () => { takeOver(); act('shop-checkout'); checkout(); });
  payB.addEventListener('click', () => { takeOver(); act('shop-pay'); pay(); });
  document.addEventListener('visibilitychange', syncVid);

  /* ---------------- Start ---------------- */
  paintNums();
  if (motion && 'IntersectionObserver' in window) {
    new IntersectionObserver(es => { inView = es[es.length - 1].isIntersecting; syncVid(); }, { rootMargin: '-12% 0px' }).observe(win);
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); if (!visit) play(); } }, { threshold: .35 });
    io.observe(win);
  } else {
    // The finished state: one visit, server-side, everything arrived
    inView = true;
    setMode('server'); visitor();
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); step(1); } });
      io.observe(win);
    }
  }
}
