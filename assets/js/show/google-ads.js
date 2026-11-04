// Google Ads showcase (/services/google-ads): a big search field types local searches in a loop; the results reload
// with a shimmer and the sponsored text ad on top rewrites itself to each one. Now and then a click lands on the ad:
// that is when you pay. The visitor can type their own search; the ad uses their words (no stars, numbers or
// results). Starts in view, pauses on hover, focus and typing, resumes after a while. Typed text never leaves the
// browser. Without motion: the first example, finished and still, and the field still works.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--google-ads');
if (root) init(root);

function init(root) {
  const SC = 'google-ads', motion = document.documentElement.classList.contains('motion');
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const lc = s => s.toLocaleLowerCase('da-DK'), cap = s => s.charAt(0).toLocaleUpperCase('da-DK') + s.slice(1);
  const now = () => performance.now(), STOP = Symbol('stop');

  // The searches and their ads: data in the section (script[data-ga-ex]); the first is also the static HTML
  let EX;
  try { EX = JSON.parse($('[data-ga-ex]').textContent); } catch (x) { return; }

  /* ---------------- The visitor's own search ---------------- */
  // What people type → one of our trades, for sitelinks that fit
  const WHICH = [[/tømr|snedker|bygge|carport|terrasse/, 'toemrer'], [/elektr|^el$|el-/, 'elektriker'], [/vvs|blikken|rør|varme|kloak/, 'vvs'], [/maler|tapet/, 'maler'], [/fris|barber|hår/, 'frisoer'], [/fysio|kiropr|osteo/, 'fysioterapeut'], [/klinik|massage|kosmet|negl|spa\b|skønhed|vipper/, 'klinik'], [/træn|fitness|yoga|pilates|^pt$/, 'personlig-traener'], [/rengør|vinduespud/, 'rengoering'], [/revis|bogf|bogholder|regnskab/, 'revisor']];
  const LINKS = { toemrer: 'Terrasse|Tilbygning|Få et tilbud', elektriker: 'Ladestander|El-tavle|Få et tilbud', vvs: 'Badeværelse|Akut hjælp|Få et tilbud', maler: 'Indvendig maling|Facade|Få et tilbud', frisoer: 'Book tid|Priser|Om os', klinik: 'Book tid|Behandlinger|Priser', fysioterapeut: 'Book tid|Behandlinger|Priser', 'personlig-traener': 'Første træning|Forløb|Priser', rengoering: 'Fast rengøring|Flytterengøring|Få et tilbud', revisor: 'Årsregnskab|Bogføring|Book et møde' };
  const tradeOf = f => (WHICH.find(([re]) => re.test(f)) || [])[1] || '';
  const TOWNS = new Set('københavn,kbh,frederiksberg,amager,nørrebro,østerbro,vesterbro,valby,vanløse,brønshøj,christianshavn,islands brygge,nordhavn,sydhavn,ørestad,aarhus,århus,odense,aalborg,esbjerg,randers,kolding,horsens,vejle,roskilde,herning,silkeborg,næstved,fredericia,viborg,køge,holstebro,taastrup,høje-taastrup,slagelse,hillerød,sønderborg,svendborg,hjørring,holbæk,frederikshavn,ringsted,haderslev,skive,solrød,birkerød,farum,lyngby,kongens lyngby,gentofte,hellerup,charlottenlund,glostrup,albertslund,ballerup,herlev,rødovre,hvidovre,brøndby,ishøj,greve,dragør,kastrup,hørsholm,rungsted,helsingør,humlebæk,espergærde,fredensborg,allerød,værløse,frederikssund,kalundborg,korsør,sorø,vordingborg,faxe,nakskov,nykøbing,rønne,bornholm,fyn,sjælland,jylland,middelfart,nyborg,faaborg,assens,kerteminde,vejen,varde,ribe,tønder,aabenraa,billund,ikast,ringkøbing,lemvig,struer,thisted,skagen,brønderslev,hobro,grenaa,ebeltoft,skanderborg,odder,viby,risskov,højbjerg,brabrand'.split(','));
  const SUF = /^(k|n|s|v|ø|c|nv|sv|nø|sø)$/; // "København Ø", "Aarhus C"
  const PAA = /^(frederiksberg|amager|nørrebro|østerbro|vesterbro|christianshavn|islands brygge|bornholm|fyn|sjælland|als|ærø|samsø|langeland|lolland|falster|møn|mors|fanø|djursland|læsø)$/;
  const prep = by => PAA.test(lc(by).replace(/ \S{1,2}$/, '')) ? 'på' : 'i'; // "på Frederiksberg", "i Aarhus"
  // Never a town at the end ("akut vvs nu"); chatty words at the start ("jeg søger en …")
  const FILL = new Set('i på og nu akut billig billigt billigste bedste god gode hurtig hurtigt lokal lokale tilbud pris priser firma hjælp idag døgnvagt weekend aften'.split(' '));
  const LEAD = new Set('jeg vi søger leder efter find finde har brug for skal bruge mig gerne vil en et hvor kan man'.split(' '));
  const town = by => by === 'kbh' ? 'København' : by.split(' ').map(w => SUF.test(w) ? w.toUpperCase() : w.split('-').map(cap).join('-')).join(' ');
  const nice = f => cap(f).replace(/(^|[\s-])vvs(?=$|[\s-])/gi, '$1VVS');
  const slug = s => lc(s).replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24).replace(/-+$/, '');
  // "frisør i odense", "Tømrer Høje-Taastrup", "kbh frisør", "maler i nærheden", "odense" → { fag, by, near }
  function parse(raw) {
    let s = ` ${lc(raw).normalize('NFC').replace(/[^\p{L}\p{N}&' -]+/gu, ' ').replace(/\s+/g, ' ').trim()} `, near = false, by = '';
    s = s.replace(/ (i nærheden( af mig)?|nær mig|tæt på mig|nærmeste|nærheden) /g, () => { near = true; return ' '; });
    // Words with letters (no postcodes), single letters only as "i" or after a town, no endless words
    let w = s.trim().split(' ').filter((x, i, a) => /\p{L}/u.test(x) && (x.length > 1 || x === 'i' || TOWNS.has(a[i - 1]))).map(x => x.slice(0, 24));
    while (w.length > 1 && LEAD.has(w[0])) w.shift();
    const at = Math.max(w.lastIndexOf('i'), w.lastIndexOf('på')), end = w[w.length - 1];
    if (at > -1 && at < w.length - 1 && w.length - at <= 4) by = w.splice(at).slice(1).join(' ');
    else if (w.length > 1 && (TOWNS.has(w.slice(-2).join(' ')) || SUF.test(end) && TOWNS.has(w[w.length - 2]))) by = w.splice(-2).join(' ');
    else if (TOWNS.has(end)) by = w.pop();
    else if (w.length > 1 && TOWNS.has(w.slice(0, 2).join(' '))) by = w.splice(0, 2).join(' ');
    else if (w.length > 1 && TOWNS.has(w[0])) by = w.shift();
    else if (w.length > 1 && tradeOf(w.slice(0, -1).join(' ')) && !tradeOf(end) && !FILL.has(end)) by = w.pop();
    while (w.length > 1 && w.join(' ').length > 40) w.pop();
    while (w.length && /^(i|på|og|af|til|for|med|en|et)$/.test(w[w.length - 1])) w.pop();
    const fag = w.join(' ');
    return fag || by || near ? { fag, by: by && town(by), near: near && !by } : null;
  }
  // From the hjemmesider page: { fag, by, navn } in sessionStorage 'wl-egen' (read only, never sent)
  let EGEN = {};
  try { EGEN = JSON.parse(sessionStorage.getItem('wl-egen') || 'null') || {}; } catch (x) { /* fine */ }
  const ownName = () => (typeof EGEN.navn === 'string' && EGEN.navn.replace(/\s+/g, ' ').trim().slice(0, 40)) || 'Dit firma';
  // Their words in an ad: no stars, no numbers, no results
  function own(raw) {
    const p = parse(raw); if (!p) return null;
    const n = ownName(), id = tradeOf(p.fag), where = p.by ? `${prep(p.by)} ${p.by}` : p.near || !FILL.has(p.fag.split(' ').pop()) ? 'i nærheden' : '';
    const bare = n.replace(/\s+(aps|a\/s|ivs|i\/s)\.?$/i, ''), what = p.fag ? nice(p.fag) : bare, h1 = where ? `${what} ${where}` : what, path = id || slug(p.fag);
    const dom = n === 'Dit firma' ? 'ditfirma.dk' : (slug(bare.replace(/&/g, ' og ')) || 'ditfirma') + '.dk';
    return {
      own: 1, key: h1, n, c: '#e0552b #fff', k: 'h', q: [p.fag, p.near ? 'i nærheden' : lc(p.by)].filter(Boolean).join(' '),
      u: `${dom} › ${path || 'kontakt'}`, h: h1.length > 30 ? h1 : `${h1} | ${/(^| )(akut|nu)( |$)/.test(p.fag) ? 'Ring nu' : 'Ring i dag'}`,
      t: `${p.by ? `${what} ${where} og omegn.` : 'Lokalt og tæt på dig.'} Ring, eller skriv til os, og fortæl, hvad du har brug for.`,
      s: (LINKS[id] || 'Priser|Om os|Kontakt').split('|'),
      o: ['Fagguiden', `fagguiden.dk › ${path || 'lokalt'}`, `${h1}: sådan finder du den rigtige`, `Spørg til pris, tid og erfaring, før du vælger. Og læs, hvad andre kunder siger om ${p.fag || 'dem'}${p.by ? ' ' + where : ''}.`]
    };
  }

  /* ---------------- Drawing an ad ---------------- */
  const E = Object.fromEntries($$('[data-ga]').map(x => [x.dataset.ga, x]));
  const stage = $('[data-ga-stage]'), form = $('[data-ga-form]'), input = $('[data-ga-in]'), qt = $('[data-ga-qt]'), go = $('[data-ga-go]');
  const res = $('[data-ga-res]'), pane = $('.ga-pane'), body = $('[data-ga-body]'), ad = $('.ga-ad'), cur = $('[data-ga-cur]'), rip = $('[data-ga-rip]'), you = $('[data-ga-you]'), live = $('[data-ga-live]');
  const el = (tag, text, cls) => { const x = document.createElement(tag); if (text) x.textContent = text; if (cls) x.className = cls; return x; };
  const bare = w => lc(w).replace(/[^\p{L}\p{N}-]/gu, ''), toks = q => lc(q).split(/[^\p{L}\p{N}-]+/u).filter(x => x.length > 1);
  // The headline in word masks, so it rewrites itself word by word; the searched words get the highlighter
  const words = (box, text, q) => { const t = toks(q); box.replaceChildren(...text.split(' ').map((w, i, a) => { const k = bare(w), o = el('span', '', k && t.some(x => k.startsWith(x)) ? 'ga-w is-hit' : 'ga-w'); o.style.setProperty('--i', i); o.append(el('span', i < a.length - 1 ? w + ' ' : w)); return o; })); };
  // The searched words in bold in the organic snippet, as on a real results page
  const bold = (box, text, q) => { const t = new Set(toks(q).filter(x => x.length > 2)); box.replaceChildren(...text.split(/(\s+)/).map(p => t.has(bare(p)) ? el('b', p) : document.createTextNode(p))); };
  let shown = EX[0];
  function fill(a) {
    shown = a;
    const [c1, c2] = a.c.split(' ');
    E.ini.style.setProperty('--c1', c1); E.ini.style.setProperty('--c2', c2); E.ini.textContent = cap(a.n.charAt(0));
    E.navn.textContent = a.n; E.url.textContent = a.u; E.t.textContent = a.t; E.callt.textContent = 'Ring';
    words(E.h, a.h, a.q);
    E.links.replaceChildren(...a.s.map(x => el('span', x)));
    [E.oi.textContent, E.on.textContent, E.ou.textContent, E.oh.textContent] = [a.o[0].charAt(0), ...a.o.slice(0, 3)];
    bold(E.ot, a.o[3], a.q);
    root.classList.toggle('is-own', !!a.own);
  }
  words(E.h, E.h.textContent, EX[0].q);
  // One height whatever the ad says: the tallest example sets it (per width, and once the fonts are in)
  let w0 = 0, rz = 0;
  const measure = force => {
    if (!pane.clientWidth || (!force && pane.clientWidth === w0)) return;
    w0 = pane.clientWidth;
    const was = shown; let max = 0;
    body.classList.remove('is-new'); pane.style.minHeight = '';
    for (const a of EX) { fill(a); max = Math.max(max, body.offsetHeight); }
    fill(was); pane.style.minHeight = max + 'px';
  };
  measure();
  if (document.fonts) document.fonts.ready.then(() => measure(true));
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(measure, 200); });
  const restart = (x, c) => { x.classList.remove(c); void x.offsetWidth; x.classList.add(c); };
  const fresh = () => restart(body, 'is-new'), ping = k => restart($(`[data-ga-chip="${k}"]`), 'is-ping');

  /* ---------------- Analytics: never what is typed ---------------- */
  const steps = new Set(), told = new Map();
  const step = n => { if (!steps.has(n)) { steps.add(n); track('showcase_step', { showcase: SC, step: n }); } };
  const act = (a, max = 1) => { const c = told.get(a) || 0; if (c < max) { told.set(a, c + 1); track('showcase_interact', { showcase: SC, action: a }); } };

  /* ---------------- The click: the moment you pay ---------------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let undo = 0;
  function boom(x, y, k) {
    rip.style.left = x + 'px'; rip.style.top = y + 'px'; restart(rip, 'is-go');
    calm(true); you.classList.add('is-paid'); ping('klik');
    if (k === 'c') { E.call.classList.add('is-press'); E.callt.textContent = 'Ringer op …'; }
    else if (typeof k === 'number') E.links.children[k].classList.add('is-press');
    else E.h.classList.add('is-hover');
    clearTimeout(undo); undo = setTimeout(() => calm(), 1750);
  }
  // Back to rest: nothing pressed, "Din annonce" again (keep: the cursor stays)
  function calm(keep) {
    E.call.classList.remove('is-press'); E.callt.textContent = 'Ring'; E.h.classList.remove('is-hover');
    for (const s of E.links.children) s.classList.remove('is-press');
    if (!keep) { you.classList.remove('is-paid'); cur.classList.remove('is-on', 'is-press'); }
  }
  // Where a click lands: the call button, a sitelink, or the headline's third word (always on its first line)
  const boxOf = k => (k === 'c' ? E.call : (typeof k === 'number' && E.links.children[k]) || E.h.children[Math.min(2, E.h.children.length - 1)]).getBoundingClientRect();
  // The visitor clicks the ad themselves
  ad.addEventListener('click', e => {
    const r = res.getBoundingClientRect(), hit = x => { const b = x.getBoundingClientRect(); return e.clientX >= b.left - 6 && e.clientX <= b.right + 6 && e.clientY >= b.top - 6 && e.clientY <= b.bottom + 6; };
    const li = [...E.links.children].findIndex(hit);
    boom(e.clientX - r.left, e.clientY - r.top, hit(E.call) ? 'c' : li > -1 ? li : 'h');
    act('klik-annonce', 5);
  });

  /* ---------------- Typing their own search (with or without motion) ---------------- */
  let deb = 0, lastKey = '', seq = 0, holdUntil = 0;
  function searchOwn(force) {
    if (!input.value.trim()) { if (!motion && lastKey) { lastKey = ''; fill(EX[0]); } return false; }
    const a = own(input.value);
    if (!a) return false;
    holdUntil = now() + 12000;
    if (a.key === lastKey && !force) return true;
    lastKey = a.key; act('egen-soegning'); live.textContent = `Annoncen viser nu: ${a.h}`;
    if (!motion) { fill(a); return true; }
    const my = ++seq;
    res.classList.remove('is-blank'); res.classList.add('is-loading');
    setTimeout(() => { if (my !== seq) return; fill(a); res.classList.remove('is-loading'); fresh(); ping('soeg'); }, 520);
    return true;
  }
  input.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(searchOwn, 650); });
  form.addEventListener('submit', e => {
    e.preventDefault(); clearTimeout(deb);
    // Nothing usable: the button hands them the field, Enter in an empty field gives a little shake
    const had = document.activeElement === input;
    if (!searchOwn(true)) { if (had) restart(form, 'is-nudge'); input.focus(); return; }
    act('soeg');
    if (!fine.matches) input.blur(); // phones: close the keyboard so the ad is in view
  });
  if (!motion) return;

  /* ---------------- The loop ---------------- */
  root.classList.add('is-m');
  // The visitor's trade and town from the hjemmesider page (if any) go first, then the four examples
  const LIST = [...EX];
  {
    const f = typeof EGEN.fag === 'string' ? EGEN.fag.trim() : '', b = typeof EGEN.by === 'string' ? EGEN.by.trim() : '';
    const mine = (f || b) && own(`${/klinik/i.test(f) ? 'massage' : f} ${b}`.slice(0, 60));
    if (mine) LIST.unshift(mine);
  }
  let token = 0, idx = 0, seen = 0, started = false, inView = false, focus = false, hoverIn = false, lastMove = 0, cx = null, cy = null;
  const wait = (ms, t) => new Promise((ok, no) => setTimeout(() => t === token ? ok() : no(STOP), ms));
  // Paused: out of view, focus, hidden tab, their own ad being read, or a mouse moving on the mockup (6 s; 20 s on theirs)
  const busy = () => !inView || focus || document.hidden || now() < holdUntil || (hoverIn && now() - lastMove < (root.classList.contains('is-own') ? 20000 : 6000));
  const gate = async t => { while (busy()) await wait(250, t); };
  const setQ = s => { qt.textContent = s; };
  async function erase(t) {
    form.classList.add('is-typing');
    for (let s = qt.textContent; s; ) { s = s.slice(0, -1); setQ(s); await wait(s.length > 10 ? 20 : 34, t); }
  }
  async function type(q, t) {
    form.classList.add('is-typing');
    for (let i = 1; i <= q.length; i++) { setQ(q.slice(0, i)); await wait(46 + Math.random() * 64 + (q[i - 1] === ' ' ? 80 : 0), t); }
    form.classList.remove('is-typing');
  }
  async function load(a, t) {
    go.classList.add('is-press'); setTimeout(() => go.classList.remove('is-press'), 220);
    res.classList.remove('is-blank'); res.classList.add('is-loading');
    try { await wait(560, t); } finally { res.classList.remove('is-loading'); }
    fill(a); fresh();
  }
  const place = (x, y) => { cx = x; cy = y; cur.style.transform = `translate3d(${x}px,${y}px,0)`; };
  // A gentle curve from the bottom right to the target
  const glide = (x1, y1, ms, t) => new Promise((ok, no) => {
    const x0 = cx, y0 = cy, t0 = now(), mx = (x0 + x1) / 2 + (y0 - y1) * .25, my = (y0 + y1) / 2 + Math.abs(x1 - x0) * .08;
    const tick = n => {
      if (t !== token) return no(STOP);
      const k = Math.min(1, (n - t0) / ms), e = k < .5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2, u = 1 - e;
      place(u * u * x0 + 2 * u * e * mx + e * e * x1, u * u * y0 + 2 * u * e * my + e * e * y1);
      if (k < 1) requestAnimationFrame(tick); else ok();
    };
    requestAnimationFrame(tick);
  });
  async function click(a, t) {
    const r = res.getBoundingClientRect();
    let k = a.k, b = boxOf(k);
    if (!b.width || b.right > r.right - 24) b = boxOf(k = 'h'); // a sitelink out of sight: the headline
    const x = b.left - r.left + Math.min(b.width / 2, 56), y = b.top - r.top + b.height * .62;
    if (fine.matches) {
      cur.classList.remove('is-tap'); place(res.clientWidth * .82, res.clientHeight - 30); cur.classList.add('is-on');
      await glide(x, y, 900, t);
      if (k === 'h') E.h.classList.add('is-hover');
      await wait(260, t);
    } else {
      cur.classList.add('is-tap'); place(x, y); cur.classList.add('is-on');
      await wait(380, t);
    }
    cur.classList.add('is-press'); boom(x, y, k); step(2);
    await wait(200, t); cur.classList.remove('is-press');
    await wait(1100, t); cur.classList.remove('is-on');
  }
  async function loop() {
    const t = ++token;
    try {
      for (;;) {
        await gate(t);
        if (input.value) { setQ(input.value); input.value = ''; lastKey = ''; } // their words are erased like the rest
        const a = LIST[idx % LIST.length];
        if (qt.textContent) { await erase(t); await wait(200, t); }
        await type(a.q, t);
        await wait(320, t);
        await load(a, t);
        idx++; seen++; step(1); if (seen === 2) step(3); if (seen === LIST.length) step(4);
        await wait(700, t); ping('soeg');
        await wait(900, t);
        if (!busy() && !hoverIn) await click(a, t);
        await wait(1500, t);
      }
    } catch (x) { if (x !== STOP) throw x; }
  }
  // The visitor takes over: everything stops at once and the field is theirs
  input.addEventListener('focus', () => { focus = true; token++; calm(); res.classList.remove('is-loading'); form.classList.remove('is-typing'); act('felt'); });
  input.addEventListener('blur', () => {
    focus = false;
    if (input.value.trim()) { clearTimeout(deb); searchOwn(); holdUntil = Math.max(holdUntil, now() + 10000); }
    else { if (root.classList.contains('is-own')) setQ(''); holdUntil = now() + 1500; }
    if (started) loop();
  });
  stage.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { hoverIn = true; lastMove = now(); } });
  stage.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hoverIn = false; holdUntil = Math.max(holdUntil, now() + 1200); } });
  // Start when the section comes into view: an empty field with a blinking caret, then the first search
  res.classList.add('is-blank'); setQ('');
  new IntersectionObserver(es => es.forEach(e => {
    inView = e.isIntersecting;
    if (inView && !started) { started = true; holdUntil = now() + 450; loop(); }
  }), { rootMargin: '0px 0px -18% 0px' }).observe(res);
}
