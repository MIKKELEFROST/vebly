// GEO showcase: a customer asks an AI assistant, and the answer is you (scripts/services/showcase/geo.html).
// A scroll story on a pinned stage: 01 the question is typed and sent, 02 the assistant reads its sources,
// 03 the answer streams in word by word with your business first. "Før GEO / Efter GEO" swaps the answer.
// The visitor's trade, town and name (sessionStorage 'wl-egen', shared with /services/hjemmesider) go
// into the question and the answer. Nothing that is typed leaves the browser.
import { track } from '/assets/js/analytics.js';

const sec = document.querySelector('.show--geo');
if (sec) geo(sec);

function geo(sec) {
  const motion = document.documentElement.classList.contains('motion');
  const $ = s => sec.querySelector(s), $$ = (s, r = sec) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const lc = s => s.toLocaleLowerCase('da-DK');
  const cap = s => s.charAt(0).toLocaleUpperCase('da-DK') + s.slice(1);
  const clean = s => String(s || '').replace(/\s+/g, ' ').trim();
  const tell = action => track('showcase_interact', { showcase: 'geo', action });

  /* ---------- The visitor's business ---------- */
  const KEY = 'wl-egen', DEF = { fag: 'Tømrer', by: 'København', navn: 'Nordvik' };
  // How a trade reads in a sentence: [noun, en/et, the other firms in the answer]
  const FAG = {
    'tømrer': ['tømrer', 'en', 'Tømrerfirma'], 'frisør': ['frisør', 'en', 'Frisørsalon'], 'maler': ['maler', 'en', 'Malerfirma'],
    'elektriker': ['elektriker', 'en', 'Elfirma'], 'vvs': ['VVS’er', 'en', 'VVS-firma'], 'rengøring': ['rengøringsfirma', 'et', 'Rengøringsfirma'],
    'klinik og massage': ['massageklinik', 'en', 'Klinik'], 'klinik': ['klinik', 'en', 'Klinik'], 'massage': ['massør', 'en', 'Massør'],
    'fysioterapeut': ['fysioterapeut', 'en', 'Fysioklinik'], 'fysioterapi': ['fysioterapeut', 'en', 'Fysioklinik'],
    'personlig træner': ['personlig træner', 'en', 'Træner'], 'revisor': ['revisor', 'en', 'Revisor']
  };
  const phrase = fag => {
    const l = lc(fag), k = FAG[l];
    if (k) return { noun: k[0], art: k[1], firm: k[2] };
    // Anything else: "en bager", "et bilværksted", "god til hundepasning"
    const art = /(ing|else|hjælp|pleje|service|arbejde|massage|terapi|pasning)$/.test(l) ? ''
      : /(firma|bureau|værksted|studie|studio|center|hus|bageri|galleri|hotel|apotek|selskab|renseri|institut|akademi|kontor)$/.test(l) ? 'et' : 'en';
    return { noun: /^[A-ZÆØÅ]{2}/.test(fag) ? fag : l, art, firm: cap(fag) };
  };
  // "på Frederiksberg", "på Bornholm", but "i Aarhus" (the same list as on /services/hjemmesider)
  const PAA = new Set(['frederiksberg', 'amager', 'nørrebro', 'østerbro', 'vesterbro', 'christianshavn', 'islands brygge', 'bornholm', 'fanø', 'mors', 'als', 'ærø', 'samsø', 'langeland', 'lolland', 'falster', 'møn', 'fyn', 'sjælland', 'djursland', 'læsø', 'anholt', 'tåsinge', 'thurø', 'rømø', 'femø', 'fejø', 'orø', 'omø', 'fur', 'venø', 'endelave', 'tunø', 'manø', 'mandø']);
  const inBy = by => `${PAA.has(lc(by).replace(/\s+(c|k|n|s|v|ø|nv|nø|sv|sø)$/, '')) ? 'på' : 'i'} ${by}`;
  // "Jensen & Søn ApS" → jensen-og-soen.dk
  const domain = n => {
    let d = lc(n).replace(/\s+(aps|a\/s|ivs|i\/s|k\/s|p\/s)\.?$/, '').replace(/&/g, ' og ').replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (d.length > 30) d = d.slice(0, 30).replace(/-[^-]*$/, '') || d.slice(0, 30);
    return (d || 'nordvik') + '.dk';
  };
  const values = r => {
    const fag = cap(r.fag || DEF.fag), by = cap(r.by || DEF.by), navn = r.navn || DEF.navn, ph = phrase(fag), at = inBy(by);
    return {
      navn, domain: domain(navn), firm: ph.firm, egen: !!(r.fag || r.by || r.navn),
      q: ph.art ? `Hvem er ${ph.art === 'et' ? 'et godt' : 'en god'} ${ph.noun} ${at}?` : `Hvem er god til ${ph.noun} ${at}?`,
      intro: `Her er tre gode bud på ${ph.art ? ph.art + ' ' : ''}${ph.noun} ${at}:`
    };
  };
  // The answer before and after GEO. With the visitor's own business: no reviews or results, only what
  // their own page says. The other firms are placeholders, never real businesses.
  const answer = (m, v) => {
    const a = [`${v.firm} A`, 'Har mange års erfaring i området.'], b = [`${v.firm} B`, 'Bliver ofte nævnt på lokale portaler.'];
    return m === 'efter' ? {
      src: [[v.domain, v.domain], ['Google-profil', 'Google-profilen'], ['Anmeldelser', 'anmeldelser'], ['Lokale portaler', 'lokale portaler']], mine: true,
      found: `Fandt flere kilder om ${v.navn}`,
      items: [[v.navn, v.egen ? `Skriver tydeligt om priser og område på ${v.domain}.` : 'Svarer samme dag og har mange gode anmeldelser.', 1], a, b]
    } : {
      src: [['Andres hjemmesider', 'andres hjemmesider'], ['Lokale portaler', 'lokale portaler'], ['Anmeldelser', 'anmeldelser']], mine: false,
      found: 'Læste 3 kilder',
      items: [a, b, [`${v.firm} C`, 'Har en klar prisliste på sin side.']], miss: `${v.navn} bliver ikke nævnt`
    };
  };

  /* ---------- Elements ---------- */
  const story = $('[data-geo-story]'), stage = $('[data-geo-stage]'), chat = $('[data-geo-chat]'), body = $('[data-geo-body]'), inner = $('[data-geo-in]');
  const qEl = $('[data-geo-q]'), status = $('[data-geo-status]'), srcEl = $('[data-geo-src]'), ansEl = $('[data-geo-ans]'), typed = $('[data-geo-typed]'), sendEl = $('[data-geo-send]');
  const steps = $$('[data-geo-step]'), modes = $$('[data-geo-mode]'), seg = $('.geo-seg'), sr = $('[data-geo-sr]');
  // Step 03 says what the chat shows: you after GEO, the others before
  const h3 = $('[data-geo-h]'), p3 = $('[data-geo-p]');
  const S3 = { efter: [h3.innerHTML, p3.innerHTML], foer: ['Andre bliver anbefalet', 'Uden GEO finder AI’en for lidt om dig, så den <b>nævner andre</b>.'] };
  const box = $('[data-geo-egen]'), F = Object.fromEntries($$('[data-geo-f]').map(x => [x.dataset.geoF, x]));

  let mode = 'efter', V, A, W = [], items = [], chips = [], miss = null, last = {};
  let wb = [], qb = 0, sb = 0, mb = 0, bodyH = 0;

  // The bottom of an element inside the chat's scrolling content (transforms ignored)
  const bottom = e => { let y = e.offsetHeight; for (let n = e; n && n !== inner; n = n.offsetParent) y += n.offsetTop; return y; };
  const measure = () => { wb = W.map(bottom); qb = bottom(qEl); sb = bottom(srcEl); mb = miss ? bottom(miss) : 0; bodyH = body.clientHeight; };
  const words = s => esc(s).split(' ').map(w => `<span class="gw">${w}</span>`).join(' ');

  function build() {
    A = answer(mode, V);
    qEl.textContent = V.q;
    srcEl.innerHTML = A.src.map(([c]) => `<span class="geo-chip${A.mine ? ' is-mine' : ''}"><i></i>${esc(c)}</span>`).join('');
    ansEl.innerHTML = `<p>${words(V.intro)}</p><ol>${A.items.map(([n, r, you], k) => `<li class="geo-it${you ? ' is-you' : ''}"><b class="geo-it__n">${k + 1}</b><div><b class="geo-it__name">${words(n)}</b>${you ? ' <span class="geo-it__you">Det er dig</span>' : ''}<p>${words(r)}</p></div></li>`).join('')}</ol>${A.miss ? `<div class="geo-miss"><b aria-hidden="true">✕</b>${esc(A.miss)}</div>` : ''}`;
    W = $$('.gw', ansEl); chips = $$('.geo-chip', srcEl); miss = ansEl.querySelector('.geo-miss');
    items = $$('.geo-it', ansEl).map(li => { const w = $$('.gw', li); return [li, W.indexOf(w[0]), W.indexOf(w[w.length - 1]) + 1]; });
    sr.textContent = mode === 'efter'
      ? `Eksempel: En kunde spørger en AI-assistent: »${V.q}« Assistenten anbefaler tre, med ${V.navn} først.`
      : `Eksempel før GEO: En kunde spørger en AI-assistent: »${V.q}« Assistenten anbefaler tre andre, og ${V.navn} bliver ikke nævnt.`;
    last = {};
    measure();
  }

  /* ---------- Painting a moment of the story ---------- */
  let hinted = false, switched = false;
  function paint(s) {
    const L = last;
    if (s.sent !== L.sent) {
      chat.classList.toggle('is-sent', s.sent);
      if (s.sent && L.sent === false) { sendEl.classList.add('is-press'); setTimeout(() => sendEl.classList.remove('is-press'), 170); }
    }
    if (s.chars !== L.chars || s.sent !== L.sent) {
      const t = s.sent ? '' : V.q.slice(0, s.chars);
      if (typed.textContent !== t) typed.textContent = t;
      chat.classList.toggle('is-typing', !s.sent && s.chars > 0);
    }
    if (s.think !== L.think) chat.classList.toggle('is-think', s.think);
    if (s.found !== L.found) chat.classList.toggle('is-found', s.found);
    if (s.lit !== L.lit || s.found !== L.found) {
      chips.forEach((c, k) => c.classList.toggle('is-lit', k < s.lit));
      status.textContent = s.found ? A.found : s.lit ? 'Læser ' + A.src[s.lit - 1][1] : 'Leder efter svar';
    }
    if (s.words !== L.words) {
      const a = L.words || 0;
      for (let k = Math.min(a, s.words); k < Math.max(a, s.words); k++) W[k].classList.toggle('is-on', k < s.words);
      items.forEach(([li, x, y]) => { li.classList.toggle('is-on', s.words > x); li.classList.toggle('is-done', s.words >= y); });
      if (miss) miss.classList.toggle('is-on', s.words >= W.length);
      // The first time the answer is done: point at the switch
      if (motion && !hinted && !switched && s.words >= W.length) { hinted = true; seg.classList.add('is-hint'); }
    }
    if (s.step !== L.step) steps.forEach((el, k) => el.classList.toggle('is-on', !motion || k === s.step));
    last = s;
  }
  const full = () => ({ sent: true, think: true, found: true, lit: A.src.length, chars: V.q.length, words: W.length, step: 2 });

  /* ---------- Scroll story ---------- */
  // Where each beat sits on the way through the pinned stage (0 = pinned, 1 = released)
  const T = { t0: .05, t1: .2, send: .23, think: .27, c0: .3, c1: .49, found: .52, a0: .55, a1: .84 };
  let pv = 0, chars = 0, wn = 0, ty = 0, tyShown = 0, raf = 0, near = false, tp = 0, fresh = true;
  const reached = [];
  const progress = () => { const r = story.getBoundingClientRect(), d = r.height - stage.offsetHeight; return d > 0 ? clamp(-r.top / d) : 1; };

  function frame(t) {
    raf = 0;
    const dt = Math.min(0.05, (t - tp) / 1000 || 0); tp = t;
    const p = progress(), first = fresh;
    // The first look starts where the visitor is (coming back from below, or a reload half-way)
    if (first) { fresh = false; pv = p; }
    // The story follows the scroll, but never faster than it can be read (a jump plays it fast-forward)
    pv += clamp((p - pv) * Math.min(1, dt * 6), -1.6 * dt, 0.45 * dt);
    if (Math.abs(p - pv) < 0.0004) pv = p;
    const n = A.src.length, q = V.q.length, wq = q * clamp((pv - T.t0) / (T.t1 - T.t0));
    chars = first ? wq : chars + clamp(wq - chars, -200 * dt, 55 * dt);
    // Each beat waits for the one before it: typed, then sent, then read, then answered
    const sent = pv >= T.send && chars >= q - 0.5, think = sent && pv >= T.think;
    const lit = think && pv >= T.c0 ? Math.min(n, 1 + Math.floor((pv - T.c0) / ((T.c1 - T.c0) / n))) : 0;
    const found = think && lit === n && pv >= T.found;
    const want = found ? W.length * clamp((pv - T.a0) / (T.a1 - T.a0)) : 0;
    wn = first ? want : wn + clamp(want - wn, -240 * dt, 34 * dt);
    const s = { sent, think, found, lit, chars: Math.round(chars), words: Math.round(wn), step: pv < T.think ? 0 : pv < T.a0 ? 1 : 2 };
    paint(s);
    // Steps reached, once each
    if (p > 0.004) for (let k = 0; k <= s.step; k++) if (!reached[k]) { reached[k] = 1; track('showcase_step', { showcase: 'geo', step: k + 1 }); }
    if ((p < T.t0) !== box.classList.contains('is-start')) box.classList.toggle('is-start', p < T.t0);
    // Keep the newest line in view, like a real chat
    const f = s.words ? Math.max(wb[s.words - 1] || 0, s.words >= W.length ? mb : 0) : s.think ? sb : s.sent ? qb : 0;
    ty += (Math.max(0, f + 18 - bodyH) - ty) * Math.min(1, dt * 7);
    if (Math.abs(ty - tyShown) > 0.25) { tyShown = ty; inner.style.transform = ty > 0.5 ? `translateY(${(-ty).toFixed(1)}px)` : ''; }
    if (near) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (motion && !raf) { tp = performance.now(); raf = requestAnimationFrame(frame); } };

  /* ---------- Før / Efter GEO ---------- */
  modes.forEach(b => b.addEventListener('click', () => {
    switched = true; seg.classList.remove('is-hint');
    const m = b.dataset.geoMode;
    if (m === mode) return;
    mode = m;
    modes.forEach(x => { const on = x.dataset.geoMode === m; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    build();
    [h3.innerHTML, p3.innerHTML] = S3[m];
    // The assistant thinks again and writes the other answer
    if (motion) { pv = Math.min(pv, T.think); wn = 0; kick(); } else paint(full());
    tell(m === 'foer' ? 'foer-geo' : 'efter-geo');
  }));
  const cta = $('[data-geo-cta]');
  if (cta) cta.addEventListener('click', () => tell('cta'));

  /* ---------- "Prøv med din egen virksomhed" ---------- */
  const raw = () => ({ fag: clean(F.fag.value), by: clean(F.by.value), navn: clean(F.navn.value) });
  try { const r = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (r) Object.keys(F).forEach(k => { if (typeof r[k] === 'string') F[k].value = r[k].slice(0, 60); }); } catch (x) { /* fine */ }
  let tm = 0;
  box.addEventListener('input', () => {
    clearTimeout(tm);
    tm = setTimeout(() => {
      const r = raw();
      try { sessionStorage.setItem(KEY, JSON.stringify(r)); } catch (x) { /* fine */ }
      const k = W.length ? wn / W.length : 0;
      V = values(r); box.classList.toggle('is-filled', V.egen);
      build();
      wn = k * W.length; chars = Math.min(chars, V.q.length);
      if (motion) kick(); else paint(full());
    }, 120);
  });
  // Which fields are used (once each), never what is typed
  const told = new Set();
  box.addEventListener('change', e => { const k = e.target.dataset.geoF; if (k && !told.has(k) && clean(e.target.value)) { told.add(k); tell('egen-' + k); } });
  // Enter moves on to the next field, and closes the keyboard after the last one
  box.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || !e.target.dataset.geoF) return;
    e.preventDefault();
    const order = ['fag', 'by', 'navn'], next = F[order[order.indexOf(e.target.dataset.geoF) + 1]];
    if (next) next.focus(); else e.target.blur();
  });
  // Phones: the box sits above the pinned stage, so the chat gets the whole screen
  const slot = $('[data-geo-slot]'), fit = $('[data-geo-fit]'), small = matchMedia('(max-width: 699px)');
  const place = () => { if (small.matches) { if (box.parentElement !== slot) slot.append(box); } else if (box.parentElement !== fit) fit.prepend(box); };
  place();
  if (small.addEventListener) small.addEventListener('change', place);

  /* ---------- Start ---------- */
  V = values(raw()); box.classList.toggle('is-filled', V.egen);
  sec.classList.add('is-js');
  build();
  new ResizeObserver(() => { measure(); kick(); }).observe(body);
  if (document.fonts) document.fonts.ready.then(measure);
  if (motion) new IntersectionObserver(es => { near = es[es.length - 1].isIntersecting; if (near) kick(); }, { rootMargin: '300px 0px' }).observe(story);
  else paint(full());
}
