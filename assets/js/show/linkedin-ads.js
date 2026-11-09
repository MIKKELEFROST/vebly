// LinkedIn Ads showcase (/services/linkedin-ads): an audience builder. A sponsored post for Ferrolund Stål (a made-up
// steel supplier, an example) in a feed of our own drawing, beside a targeting panel. Each chip narrows the funnel
// (example numbers), and the post's first line rewrites itself to the people chosen ("Til indkøbschefer i
// byggeriet"). "Få tilbud" opens a lead form, prefilled with a made-up person who fits the targeting, and the lead
// lands under the funnel. In view it builds the audience itself, then sends one lead; any tap takes over.
// Without motion: the finished audience and one lead, still, and every control still works.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--linkedin-ads');
if (root) init(root);

function init(root) {
  const SC = 'linkedin-ads', motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const ev = action => track('showcase_interact', { showcase: SC, action });
  const done = new Set(), step = n => { if (!done.has(n)) { done.add(n); track('showcase_step', { showcase: SC, step: n }); } };

  // Example data: the shares are made up, only to show how each choice narrows the audience
  const BASE = 2e6;
  const G = {
    role: { indkob: ['Indkøbschef', 'indkøbschefer', .02, 'Mette', 'Holm'], proj: ['Projektleder', 'projektledere', .035, 'Jonas', 'Dahl'], dir: ['Direktør', 'direktører', .025, 'Anders', 'Bech'] },
    ind: { bygg: ['Byggeri', 'byggeriet', .1, 'Søvang Byg A/S', 'soevangbyg.dk'], prod: ['Produktion', 'produktionen', .12, 'Lindå Maskinfabrik', 'lindaamaskin.dk'], energi: ['Energi', 'energibranchen', .03, 'Kystvind Service ApS', 'kystvindservice.dk'] },
    size: { s1: ['1–10', .25], s2: ['11–50', .2], s3: ['51–200', .2], s4: ['201–500', .12], s5: ['500+', .23] },
    area: { hov: ['Hovedstaden', .45], sj: ['Sjælland', .13], fyn: ['Fyn', .09], jyl: ['Jylland', .33] }
  };
  const KEYS = ['role', 'ind', 'size', 'area'], SHARE = { role: 2, ind: 2, size: 1, area: 1 };
  const chips = $$('[data-li-c]'), chip = (g, v) => chips.find(b => b.dataset.liC === g && b.dataset.v === v);
  const sel = {};
  KEYS.forEach(g => { sel[g] = new Set(chips.filter(b => b.dataset.liC === g && b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.v)); });
  const picked = g => chips.filter(b => b.dataset.liC === g && sel[g].has(b.dataset.v)).map(b => G[g][b.dataset.v]);

  const rows = $$('[data-li-row]'), hl = $('[data-li-hl]'), kick = $('[data-li-kick]'), echo = $('[data-li-echo]');
  const big = $('[data-li-n]'), note = $('[data-li-note]'), live = $('[data-li-live]');
  const post = $('[data-li-post]'), sheet = $('[data-li-sheet]'), cta = $('[data-li-open]'), send = $('[data-li-send]');
  const flds = $$('.li-fld'), leads = $('[data-li-leads]');

  /* ---------------- Numbers and words ---------------- */
  const round = n => n >= 1e4 ? Math.round(n / 1e3) * 1e3 : n >= 1e3 ? Math.round(n / 100) * 100 : Math.round(n / 10) * 10;
  const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.', ',') + ' mio.' : round(n).toLocaleString('da-DK');
  const width = n => Math.max(.05, Math.min(1, (Math.log10(Math.max(n, 1)) - 2) / (Math.log10(BASE) - 2)));
  const join = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' og ' + a[a.length - 1];
  const counts = () => {
    const out = [BASE];
    KEYS.forEach(g => { const p = picked(g); out.push(out[out.length - 1] * (p.length ? p.reduce((s, x) => s + x[SHARE[g]], 0) : 1)); });
    return out;
  };
  const headline = () => {
    const r = picked('role').map(x => x[1]), i = picked('ind').map(x => x[1]);
    return 'Til ' + (r.length ? join(r) : 'beslutningstagere') + (i.length ? ' i ' + join(i) : '');
  };
  // The person who fills in the form: made up, but fits what is chosen
  const person = () => {
    const first = (g, d) => (picked(g)[0] || G[g][d]);
    const r = first('role', 'indkob'), i = first('ind', 'bygg'), s = first('size', 's3'), a = first('area', 'hov');
    return { fn: r[3], ln: r[4], ti: r[0], co: i[3], em: (r[3][0] + r[4][0]).toLowerCase() + '@' + i[4], size: s[0] + ' ansatte', area: a[0] };
  };

  /* ---------------- Draw the state ---------------- */
  let shown = null, last = '', liveT = 0, rollT = 0;
  const roll = (from, to) => {
    cancelAnimationFrame(rollT);
    if (!motion || from === null || from === to) { big.textContent = fmt(to); return; }
    const t0 = performance.now(), D = 750, lf = Math.log(from), lt = Math.log(to);
    const tick = now => {
      const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      big.textContent = fmt(k < 1 ? Math.exp(lf + (lt - lf) * e) : to);
      if (k < 1) rollT = requestAnimationFrame(tick);
    };
    rollT = requestAnimationFrame(tick);
  };
  const update = anim => {
    const c = counts(), n = c[c.length - 1];
    rows.forEach((r, j) => {
      r.querySelector('i').style.setProperty('--w', width(c[j]).toFixed(3));
      r.querySelector('.li-row__n').textContent = fmt(c[j]);
      r.classList.toggle('is-flat', j > 0 && !sel[KEYS[j - 1]].size);
    });
    roll(anim ? shown : null, n);
    shown = n;
    const warn = n < 300;
    note.classList.toggle('is-warn', warn || n > 1e5);
    note.textContent = warn ? 'For smal. Vælg en stilling eller et område mere.' : n < 5e3 ? 'Smal og præcis. Det er dem, der træffer beslutningen.' : n < 1e5 ? 'God størrelse. Her kan vi teste flere annoncer.' : 'Meget bred. Vi ville snævre den ind.';
    const h = headline();
    if (h !== last) {
      last = h;
      const s = document.createElement('span');
      s.className = 'li-hl__in' + (anim && motion ? ' is-new' : '');
      s.textContent = h + ':';
      hl.replaceChildren(s);
      echo.textContent = h;
      const ind = picked('ind').map(x => x[1]);
      kick.textContent = 'Stål til ' + (ind.length ? join(ind) : 'erhverv');
      if (anim && motion) { kick.classList.remove('is-new'); void kick.offsetWidth; kick.classList.add('is-new'); }
    }
    clearTimeout(liveT);
    liveT = setTimeout(() => { live.textContent = `${fmt(n)} personer i målgruppen. Annoncen starter: ${h}.`; }, 600);
  };
  const press = b => { if (!motion || !b) return; b.classList.remove('is-press'); void b.offsetWidth; b.classList.add('is-press'); };
  const toggle = (g, v, on) => {
    const b = chip(g, v), s = sel[g];
    on = on === undefined ? !s.has(v) : on;
    if (on) s.add(v); else s.delete(v);
    b.setAttribute('aria-pressed', String(on));
  };

  /* ---------------- The lead form ---------------- */
  const P = { fn: 'fn', ln: 'ln', em: 'em', co: 'co', ti: 'ti' };
  let fillT = [], leadsN = 0, opener = false;
  const fill = () => {
    const p = person();
    for (const k in P) $(`[data-li-f="${k}"]`).textContent = p[k];
    $('[data-li-thx]').textContent = `Tak, ${p.fn}!`;
    return p;
  };
  const openSheet = user => {
    fill();
    fillT.forEach(clearTimeout); fillT = [];
    sheet.classList.remove('is-sent');
    flds.forEach(f => f.classList.remove('is-on'));
    sheet.classList.toggle('is-fill', motion);
    if (motion) flds.forEach((f, i) => fillT.push(setTimeout(() => f.classList.add('is-on'), 420 + i * 150)));
    sheet.inert = false; post.inert = true;
    sheet.classList.add('is-open');
    opener = user;
    if (user) setTimeout(() => send.focus({ preventScroll: true }), motion ? 450 : 0);
    step(3);
  };
  const closeSheet = user => {
    if (!sheet.classList.contains('is-open')) return;
    const back = sheet.contains(document.activeElement);
    sheet.classList.remove('is-open');
    sheet.inert = true; post.inert = false;
    if (user || back) cta.focus({ preventScroll: true });
  };
  const addLead = (p, anim) => {
    leadsN++;
    const el = document.createElement('div');
    el.className = 'li-lead' + (anim && motion ? ' is-new' : '');
    el.innerHTML = '<i class="li-lead__av" aria-hidden="true"></i><span class="li-lead__t"><b></b><span></span><span class="li-lead__tags"><small></small><small></small></span></span><span class="li-lead__new"></span>';
    el.querySelector('i').textContent = p.fn[0] + p.ln[0];
    el.querySelector('b').textContent = `${p.fn} ${p.ln}`;
    el.querySelector('.li-lead__t > span').textContent = `${p.ti} · ${p.co}`;
    const t = el.querySelectorAll('small'); t[0].textContent = p.size; t[1].textContent = p.area;
    el.querySelector('.li-lead__new').textContent = leadsN > 1 ? `Nyt lead · ${leadsN} i alt` : 'Nyt lead';
    el.setAttribute('role', 'status');
    leads.replaceChildren(el);
  };
  const sendLead = user => {
    const p = fill();
    sheet.classList.add('is-sent');
    addLead(p, true);
    if (user) setTimeout(() => { const b = $('.li-back'); if (sheet.classList.contains('is-open')) b.focus({ preventScroll: true }); }, 60);
    step(4);
  };

  /* ---------------- The visitor takes over ---------------- */
  let timers = [], auto = false;
  const later = (ms, f) => timers.push(setTimeout(f, ms));
  const stopAuto = () => { timers.forEach(clearTimeout); timers = []; auto = false; cta.classList.remove('is-nudge'); };
  chips.forEach(b => b.addEventListener('click', () => {
    stopAuto();
    toggle(b.dataset.liC, b.dataset.v);
    press(b);
    update(true);
    ev('chip-' + b.dataset.liC);
  }));
  $('[data-li-clear]').addEventListener('click', () => {
    stopAuto();
    KEYS.forEach(g => [...sel[g]].forEach(v => toggle(g, v, false)));
    update(true);
    ev('ryd');
  });
  cta.addEventListener('click', () => { stopAuto(); press(cta); openSheet(true); ev('faa-tilbud'); });
  send.addEventListener('click', () => { stopAuto(); sendLead(true); ev('send'); });
  $$('[data-li-close]').forEach(b => b.addEventListener('click', () => { stopAuto(); closeSheet(true); ev('luk'); }));
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) { stopAuto(); closeSheet(true); } });

  /* ---------------- By itself, once in view ---------------- */
  const AUTO = [['role', 'indkob', 700], ['ind', 'bygg', 1900], ['size', 's3', 3000], ['size', 's4', 3350], ['area', 'hov', 4400], ['area', 'sj', 4750]];
  let phase = 0, postIn = false; // 0 waiting, 1 building the audience, 2 ready for the form, 3 done
  const runForm = () => {
    if (phase !== 2 || !postIn || !auto) return;
    phase = 3;
    later(500, () => { cta.classList.remove('is-nudge'); press(cta); openSheet(false); });
    later(2900, () => press(send));
    later(3150, () => sendLead(false));
    later(5900, () => { closeSheet(false); auto = false; });
  };
  const start = () => {
    if (phase) return;
    phase = 1; auto = true;
    step(1);
    AUTO.forEach(([g, v, ms]) => later(ms, () => { toggle(g, v, true); press(chip(g, v)); update(true); }));
    later(5500, () => { step(2); cta.classList.add('is-nudge'); phase = 2; runForm(); });
  };

  if (motion && 'IntersectionObserver' in window) {
    // Start from an empty audience: the static HTML is the finished one
    KEYS.forEach(g => [...sel[g]].forEach(v => toggle(g, v, false)));
    update(false);
    const wide = matchMedia('(min-width: 900px)');
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.target === post) { postIn = e.intersectionRatio >= .45; if (postIn) runForm(); return; }
      if (e.isIntersecting && e.intersectionRatio >= .3) start();
    }), { threshold: [0, .3, .45, .6] });
    // Wide: the whole stage; one column: the panel, which comes first there
    io.observe(wide.matches ? $('[data-li]') : $('.li-aud'));
    io.observe(post);
  } else {
    update(false);
    addLead(person(), false);
    step(1); step(2);
  }
}
