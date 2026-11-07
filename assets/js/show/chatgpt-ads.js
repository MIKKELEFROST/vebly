// ChatGPT Ads showcase (/services/chatgpt-ads): a relevance gate for Mølleværk (a made-up webshop with hand grinders,
// never a real business). Example conversations glide along a belt through a gate that measures how well each one fits
// the advertiser's description. The one in the gate drops into a phone: the question, the answer, and only when it fits,
// "Svaret ændres ikke af annoncer" and the sponsored card under the answer. Health and politics never get an ad. The
// auction beside it shows the highest bid losing to the most relevant ad. The chips change the description, and the ad
// comes or goes at once. Pause and "Næste samtale" control the belt. Without motion: nothing moves by itself, the first
// conversation is shown finished, and "Næste samtale" steps through them. All names, bids and numbers are examples.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--chatgpt-ads');
if (root) init(root);

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const ev = action => track('showcase_interact', { showcase: 'chatgpt-ads', action });
  const steps = new Set(), step = n => { if (!steps.has(n)) { steps.add(n); track('showcase_step', { showcase: 'chatgpt-ads', step: n }); } };

  // The conversations, in belt order. w: how well each part of the description fits (0-100), lo: the fit when none
  // does, riv: the fit of the two other advertisers, hint: the part that would make it fit, sens: never any ads
  const T = [
    { ic: 'cup', q: 'Hvilken kaffekværn skal jeg vælge til espresso?', a: ['Til espresso skal kaffen males meget fint og helt ens. Se efter:', ['Kværn med skiver, ikke med kniv', 'Fin justering, så du kan ramme smagen']], lo: 6, w: { kvaern: 94, espresso: 88, gave: 30, tur: 20 }, riv: [41, 55] },
    { ic: 'pot', q: 'Hvordan laver jeg en hurtig lasagne?', a: ['Brug færdige plader, en god tomatsauce og en hvid sauce. Byg den i lag, og bag den i 35 minutter ved 200 grader.'], lo: 5 },
    { ic: 'gift', q: 'Julegave til min far, der elsker kaffe?', a: ['Et par idéer, der rammer de fleste kaffeelskere:', ['En pose bønner fra et lokalt risteri', 'Et kursus i latte art', 'Udstyr til at brygge kaffe derhjemme']], lo: 8, w: { gave: 86, kvaern: 31, espresso: 24 }, riv: [47, 63], hint: 'gave' },
    { ic: 'cup', q: 'Hvorfor får min espresso ingen crema?', a: ['Oftest er bønnerne for gamle, eller kaffen er malet for groft. Prøv friske bønner og en finere maling først.'], lo: 6, w: { espresso: 81, kvaern: 52 }, riv: [18, 62] },
    { ic: 'med', q: 'Hvad hjælper mod hovedpine?', a: ['Drik et glas vand, hold pause fra skærmen, og få frisk luft. Bliver den ved, så tal med din læge.'], sens: 'helbred' },
    { ic: 'tent', q: 'Hvad skal jeg pakke til en vandretur i Norge?', a: ['Tøj i lag, gode støvler, regntøj og et kort. Tag en lille brænder med, hvis I vil lave mad og kaffe undervejs.'], lo: 7, w: { tur: 77, kvaern: 14 }, riv: [22, 35], hint: 'tur' },
    { ic: 'bike', q: 'Hvordan lapper jeg et cykeldæk?', a: ['Tag hjulet af, og find hullet med vand. Rens og ru gummiet op, læg lim og lap på, og vent lidt, før du pumper.'], lo: 4 },
    { ic: 'vote', q: 'Hvem skal jeg stemme på til valget?', a: ['Det kan jeg ikke vælge for dig. Men jeg kan hjælpe dig med at sammenligne partiernes holdninger til det, du synes er vigtigst.'], sens: 'politik' }
  ];
  const N = T.length, SLOTS = 9, MID = 4, BID = [40, 65, 50], STOP = {};
  const chips = $$('[data-cg-p]'), chip = p => chips.find(c => c.dataset.cgP === p);
  const on = new Set(chips.filter(c => c.getAttribute('aria-pressed') === 'true').map(c => c.dataset.cgP));
  const rel = t => t.sens ? 0 : Math.max(t.lo, ...[...on].map(p => (t.w && t.w[p]) || 0));
  const kind = t => t.sens ? 'sens' : rel(t) >= 60 ? 'match' : 'no';

  const belt = $('[data-cg-belt]'), trk = $('[data-cg-track]'), meter = $('[data-cg-meter]'), pct = $('[data-cg-pct]'), verdict = $('[data-cg-verdict]');
  const drop = $('[data-cg-drop]'), view = $('[data-cg-view]'), th = $('[data-cg-th]'), uEl = $('[data-cg-u]'), aEl = $('[data-cg-a]');
  const noteT = $('[data-cg-note-t]'), vid = $('[data-cg-vid]'), auc = $('.cg-auc'), rows = $$('[data-cg-r]'), msgT = $('[data-cg-msg-t]');
  const desc = $('[data-cg-desc]'), dots = $$('[data-cg-dots] i'), fitn = $('[data-cg-fitn]'), live = $('[data-cg-live]');
  const playBtn = $('[data-cg-play]'), playT = $('[data-cg-play-t]'), nextBtn = $('[data-cg-next]');
  const statEl = [$('[data-cg-v]'), $('[data-cg-k]'), $('[data-cg-s]')], stat = [8412, 251, 19];
  let cards = $$('[data-cg-c]'), pos = 0;

  /* ---------------- A clock that only runs while the section is in view and not paused ---------------- */
  let gen = 0, clock = 0, last = 0, raf = 0, waits = [], inView = false, paused = !motion, started = false, alive = false, moving = false, tick = 0;
  const running = () => inView && !paused && !document.hidden;
  const frame = now => {
    const dt = last ? Math.min(64, now - last) : 0; last = now;
    if (running()) { clock += dt; tick += dt; if (tick > 1100) { tick = 0; addStat(0, 1 + (Math.random() * 3 | 0), false); } }
    if (waits.length) waits = waits.filter(w => w.g !== gen ? (w.no(STOP), false) : clock >= w.t ? (w.ok(), false) : true);
    raf = inView ? requestAnimationFrame(frame) : 0;
  };
  const wake = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
  const sleep = ms => new Promise((ok, no) => waits.push({ t: clock + ms, ok, no, g: gen }));
  const quiet = e => { if (e !== STOP) throw e; };
  const fmt = n => n.toLocaleString('da-DK');
  const addStat = (i, n, pop) => {
    stat[i] += n; statEl[i].textContent = fmt(stat[i]);
    if (pop && motion) { statEl[i].classList.remove('is-bump'); void statEl[i].offsetWidth; statEl[i].classList.add('is-bump'); }
  };

  /* ---------------- The belt ---------------- */
  const topicAt = k => (pos - MID + k + N * 3) % N;
  const fill = (c, i) => {
    c.dataset.i = i;
    c.querySelector('use').setAttribute('href', '#cg-i-' + T[i].ic);
    c.querySelector('.cg-c__q').textContent = T[i].q;
    c.classList.remove('is-seen', 'is-match', 'is-no', 'is-sens');
  };
  const mark = c => {
    const t = T[+c.dataset.i], k = kind(t);
    c.classList.remove('is-match', 'is-no', 'is-sens');
    c.classList.add('is-seen', 'is-' + k);
    c.querySelector('.cg-c__v').textContent = k === 'match' ? 'Annonce' : k === 'sens' ? 'Ingen annoncer' : 'Passer ikke';
    c.querySelector('.cg-c__bar i').style.setProperty('--r', (rel(t) / 100).toFixed(2));
  };
  let W = 0, base = 0;
  const layout = () => {
    const cw = cards[0].offsetWidth;
    W = cw + (parseFloat(getComputedStyle(trk).columnGap) || 14);
    base = belt.clientWidth / 2 - (MID * W + cw / 2);
    trk.style.transition = 'none';
    trk.style.transform = `translateX(${base.toFixed(1)}px)`;
  };
  const readReset = () => {
    belt.classList.remove('is-match', 'is-no', 'is-sens', 'is-scan');
    pct.textContent = '0 %'; meter.style.setProperty('--r', 0);
  };
  const setRead = t => {
    const k = kind(t), r = rel(t);
    belt.classList.remove('is-match', 'is-no', 'is-sens'); belt.classList.add('is-' + k);
    pct.textContent = r + ' %'; meter.style.setProperty('--r', (r / 100).toFixed(2));
    verdict.textContent = k === 'match' ? 'Passer. Annoncen vises.' : k === 'sens' ? (t.sens === 'helbred' ? 'Helbred' : 'Politik') + '. Aldrig annoncer.' : 'Passer ikke. Ingen annonce.';
  };
  const countUp = (to, ms) => {
    const t0 = performance.now();
    const go = now => {
      const k = Math.min(1, (now - t0) / ms), v = to * (1 - Math.pow(1 - k, 3));
      pct.textContent = Math.round(v) + ' %'; meter.style.setProperty('--r', (v / 100).toFixed(3));
      if (k < 1) requestAnimationFrame(go);
    };
    requestAnimationFrame(go);
  };
  const advance = async animate => {
    moving = true;
    cards[MID].classList.remove('is-gate'); cards[MID + 1].classList.add('is-gate');
    readReset(); clearNudge();
    if (animate) {
      trk.style.transition = 'transform .75s cubic-bezier(.65,0,.25,1)';
      trk.style.transform = `translateX(${(base - W).toFixed(1)}px)`;
      await sleep(780);
    }
    trk.style.transition = 'none';
    const first = cards.shift(); trk.append(first); cards.push(first);
    pos = (pos + 1) % N;
    fill(first, topicAt(SLOTS - 1));
    trk.style.transform = `translateX(${base.toFixed(1)}px)`; void trk.offsetWidth;
    moving = false;
    dotsAll();
    if (pos === 0) step(4);
  };

  /* ---------------- The phone ---------------- */
  const thSet = (...c) => { th.className = 'cg-th ' + c.join(' '); };
  const unscroll = () => { th.style.transition = 'none'; th.style.transform = ''; void th.offsetWidth; th.style.transition = ''; };
  const fit = () => { const over = Math.max(0, th.offsetHeight - view.clientHeight); th.style.transform = over ? `translateY(${-over}px)` : ''; };
  const words = (el, s) => s.split(' ').forEach((w, i) => { if (i) el.append(' '); const sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; el.append(sp); });
  const build = (t, anim) => {
    aEl.textContent = ''; aEl.classList.toggle('is-stream', anim);
    for (const part of t.a) {
      const box = document.createElement(Array.isArray(part) ? 'ul' : 'p');
      for (const s of [].concat(part)) {
        const el = Array.isArray(part) ? box.appendChild(document.createElement('li')) : box;
        if (anim) words(el, s); else el.textContent = s;
      }
      aEl.append(box);
    }
    return [...aEl.querySelectorAll('.w')];
  };
  const syncVid = () => {
    const want = motion && inView && !paused && th.classList.contains('has-ad');
    if (want && vid.paused) { const p = vid.play(); if (p) p.catch(() => {}); }
    if (!want && !vid.paused) vid.pause();
  };
  const showAd = () => { th.classList.remove('has-note', 'note-sens'); th.classList.add('has-ad'); fit(); syncVid(); };
  const showNote = t => {
    th.classList.remove('has-ad');
    noteT.textContent = t.sens ? `Ingen annoncer i samtaler om ${t.sens}.`
      : t.hint && !on.has(t.hint) ? `Mølleværk vises ikke her. Slå »${chip(t.hint).textContent}« til, så passer den.`
      : 'Mølleværk vises ikke her. Samtalen passer ikke til beskrivelsen.';
    th.classList.toggle('note-sens', !!t.sens); th.classList.add('has-note');
    fit(); syncVid();
    if (t.hint && !on.has(t.hint) && kind(t) === 'no') chip(t.hint).classList.add('is-nudge');
  };
  const clearNudge = () => chips.forEach(c => c.classList.remove('is-nudge'));
  const ending = (t, count) => {
    if (kind(t) === 'match') showAd(); else showNote(t);
    if (!count) return;
    if (kind(t) === 'match') { addStat(0, 1, false); if (Math.random() < .55) { addStat(1, 1, true); if (stat[1] % 4 === 0) addStat(2, 1, true); } step(2); }
    if (t.sens) step(3);
  };

  /* ---------------- The auction: the bids first, then the fit, then who gets the place ---------------- */
  const order = vals => vals.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
  const place = o => o.forEach((ri, rank) => rows[ri].style.setProperty('--y', rank));
  const rels = t => [rel(t), ...(t.riv || [12, 9])];
  const setRel = (i, r) => { rows[i].querySelector('.cg-row__rel i i').style.setProperty('--r', ((r || 0) / 100).toFixed(2)); rows[i].querySelector('.cg-row__rel b').textContent = r == null ? '…' : r + ' %'; };
  const aucBids = () => { auc.classList.remove('is-out'); auc.classList.add('is-bids'); rows.forEach((r, i) => { r.classList.remove('is-win'); setRel(i, null); }); place(order(BID)); };
  const aucFinal = t => {
    const k = kind(t), rs = rels(t), o = order(rs.map((r, i) => r * BID[i]));
    auc.classList.remove('is-bids'); auc.classList.toggle('is-out', k !== 'match');
    msgT.textContent = t.sens ? `Ingen auktion. Samtaler om ${t.sens} får ingen annoncer.` : 'Du er ikke med. Samtalen passer ikke til din beskrivelse.';
    rs.forEach((r, i) => setRel(i, k === 'match' ? r : null));
    place(k === 'match' ? o : order(BID));
    rows.forEach((r, i) => r.classList.toggle('is-win', k === 'match' && o[0] === i));
  };
  const aucRun = async t => {
    aucBids(); await sleep(800);
    auc.classList.remove('is-bids'); rels(t).forEach((r, i) => setRel(i, r)); await sleep(950);
    aucFinal(t);
  };

  /* ---------------- One conversation ---------------- */
  const talk = async t => {
    clearNudge();
    th.classList.add('is-out');
    belt.classList.add('is-scan'); countUp(rel(t), 650);
    await sleep(700);
    belt.classList.remove('is-scan'); setRead(t); mark(cards[MID]); dotsAll();
    drop.classList.remove('is-go'); void drop.offsetWidth; drop.classList.add('is-go');
    await sleep(380);
    view.classList.remove('is-empty'); unscroll();
    uEl.textContent = t.q; const ws = build(t, true);
    thSet('st-q');
    await sleep(450);
    thSet('st-q', 'st-think');
    const aucP = kind(t) === 'match' ? aucRun(t).catch(quiet) : (aucFinal(t), null);
    await sleep(600);
    thSet('st-q', 'st-a');
    const t0 = clock; let n = 0;
    while (n < ws.length) {
      await sleep(16);
      for (const m = Math.min(ws.length, Math.floor((clock - t0) / 30) + 1); n < m; n++) {
        ws[n].classList.add('is-on');
        if (ws[n].parentNode.tagName === 'LI') ws[n].parentNode.classList.add('is-on');
      }
    }
    thSet('st-q', 'st-a', 'st-done');
    await sleep(300);
    if (aucP) await aucP;
    aucFinal(t); ending(t, true);
    await sleep(kind(t) === 'match' ? 3800 : t.hint && kind(t) === 'no' ? 4600 : 1800);
  };
  const showStatic = (t, count) => {
    clearNudge(); setRead(t); mark(cards[MID]); dotsAll();
    view.classList.remove('is-empty'); unscroll();
    uEl.textContent = t.q; build(t, false);
    thSet('st-q', 'st-a', 'st-done');
    aucFinal(t); ending(t, count);
  };
  // hold: wait first (ms), adv: then move on to the next conversation
  const loop = async (hold, adv) => {
    const g = gen; alive = true;
    try {
      if (hold) await sleep(hold);
      if (adv) await advance(true);
      for (;;) { await talk(T[pos]); await advance(true); }
    } catch (e) { quiet(e); } finally { if (g === gen) alive = false; }
  };

  /* ---------------- The description: what the advertiser controls ---------------- */
  const dotsAll = () => {
    let n = 0;
    dots.forEach((d, i) => { const k = kind(T[i]); d.className = 'is-' + k + (i === pos ? ' is-cur' : ''); if (k === 'match') n++; });
    fitn.textContent = n;
    return n;
  };
  const typeIn = el => {
    const s = el.dataset.t || (el.dataset.t = el.textContent), t0 = performance.now();
    desc.classList.add('is-typing');
    const go = now => {
      const n = Math.min(s.length, Math.ceil((now - t0) / 18));
      el.textContent = s.slice(0, n);
      if (n < s.length) requestAnimationFrame(go); else desc.classList.remove('is-typing');
    };
    requestAnimationFrame(go);
  };
  chips.forEach(c => c.addEventListener('click', () => {
    const p = c.dataset.cgP, now = !on.has(p), t = T[pos], before = kind(t);
    if (now) on.add(p); else on.delete(p);
    c.setAttribute('aria-pressed', String(now));
    const line = $(`[data-cg-line="${p}"]`);
    line.classList.toggle('is-on', now);
    desc.classList.toggle('is-empty', !on.size);
    if (now && motion) typeIn(line);
    cards.forEach(x => { if (x.classList.contains('is-seen')) mark(x); });
    const n = dotsAll();
    if (cards[MID].classList.contains('is-seen')) setRead(t);
    // The answer is there: the ad comes or goes at once, and gets a little time on screen
    if (th.classList.contains('st-done') && !moving) {
      clearNudge(); aucFinal(t);
      if (kind(t) === 'match') showAd(); else showNote(t);
      if (kind(t) !== before && motion && started && !paused) { gen++; loop(kind(t) === 'match' ? 4200 : 2200, true); }
    }
    live.textContent = `Annoncen passer nu til ${n} af ${N} samtaler.` + (kind(t) !== before ? (kind(t) === 'match' ? ' Den vises under svaret.' : ' Den forsvinder fra svaret.') : '');
    ev('beskrivelse');
  }));

  /* ---------------- Pause and next ---------------- */
  playBtn.addEventListener('click', () => {
    paused = !paused;
    root.classList.toggle('is-paused', paused);
    playT.textContent = paused ? 'Afspil' : 'Pause';
    if (!paused && started && !alive) loop(1400, true);
    syncVid();
    ev(paused ? 'pause' : 'afspil');
  });
  nextBtn.addEventListener('click', async () => {
    gen++; alive = false;
    if (motion && !paused) loop(0, true);
    else {
      await advance(false);
      showStatic(T[pos], true);
      const t = T[pos], k = kind(t);
      live.textContent = `${t.q} ${k === 'match' ? 'Mølleværks annonce vises under svaret.' : k === 'sens' ? 'Ingen annoncer i samtaler om ' + t.sens + '.' : 'Mølleværk vises ikke her.'}`;
    }
    ev('naeste');
  });

  /* ---------------- Start ---------------- */
  cards.forEach((c, k) => { fill(c, topicAt(k)); if (k < MID) mark(c); c.classList.toggle('is-gate', k === MID); });
  layout();
  if (motion) {
    readReset(); aucBids(); thSet(); view.classList.add('is-empty'); dotsAll();
  } else showStatic(T[0]);
  let rz = 0;
  addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(() => { if (!moving) layout(); fit(); }); });
  document.addEventListener('visibilitychange', syncVid);
  // It runs while any part is on screen, and starts when the belt or the phone is half in view
  new IntersectionObserver(es => es.forEach(e => { inView = e.isIntersecting; if (inView) wake(); syncVid(); }), { threshold: 0 }).observe($('[data-cg]'));
  const so = new IntersectionObserver(es => {
    if (started || !es.some(e => e.isIntersecting)) return;
    started = true; so.disconnect(); step(1);
    if (motion) loop(500, false);
  }, { threshold: 0.5 });
  so.observe(belt); so.observe($('.cg-dev'));
}
