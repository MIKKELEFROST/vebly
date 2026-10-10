// "Bestil en hjemmeside": five short steps, then a free first sketch of the visitor's own website.
// Opens as a full-screen layer from any [data-bestil] link (and on #bestil), and on its own at /bestil.
// The answers go to /api/bestil, which e-mails them to us and returns the link to the draft
// (/mit-udkast?d=…, rendered by api/udkast.js from the same templates as hand-made drafts).
// On the result the visitor can try other colours and designs, ask for a new suggestion, keep
// favourites and send us their wishes (/api/oensker).
import { track, DESIGN_NAMES } from './analytics.js';
import { metaTrack, metaLeadFields } from './meta-pixel.js';
import { THEMES, TEMA_IDS, TONER, temaerFor, preview, palette } from './temaer.js';

// [template in api/_lib/udkast/brancher, label]
const FAG = [
  ['frisoer', 'Frisør'], ['toemrer', 'Tømrer'], ['maler', 'Maler'],
  ['elektriker', 'Elektriker'], ['vvs', 'VVS'], ['rengoering', 'Rengøring'],
  ['klinik', 'Klinik og massage'], ['fysioterapeut', 'Fysioterapeut'],
  ['personlig-traener', 'Personlig træner'], ['revisor', 'Revisor'], ['generisk', 'Andet']
];
const FUNKTIONER = [
  ['booking', 'Online booking', 'Kunderne booker selv en tid'],
  ['priser', 'Priser', 'Vis priserne på jeres ydelser'],
  ['galleri', 'Billeder', 'Vis jeres arbejde'],
  ['anmeldelser', 'Anmeldelser', 'Vis, hvad kunderne siger'],
  ['webshop', 'Webshop eller gavekort', 'Sælg direkte fra siden']
];
const ANTAL = [['1', 'Kun mig'], ['2-5', '2–5'], ['6-10', '6–10'], ['11+', 'Over 10']];
const DESIGNS = [[1, 'Klassisk', 'Tydelig og tryg'], [4, 'Mosaik', 'Bløde felter og luft'], [5, 'Minimal', 'Rene linjer']];
const KANALER = [['ring', 'Ring til mig'], ['sms', 'Send en sms'], ['mail', 'Skriv en mail']];
const TIDER = [['hurtigst', 'Hurtigst muligt'], ['formiddag', 'Formiddag'], ['eftermiddag', 'Eftermiddag'], ['aften', 'Aften']];
// "Hvad skal være anderledes?": each steers the next suggestion
const RETNINGER = [['mere-farve', 'Mere farve'], ['mere-enkel', 'Mere enkel'], ['mere-moderne', 'Mere moderne'], ['mere-klassisk', 'Mere klassisk'], ['anden-tekst', 'Anden tekst']];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEY = 'wl-bestil';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
// t colour theme ("eget" = own colours c and ac), g background tone, o headline (0–2)
const blank = () => ({ step: 0, svar: { b: '', f: '', n: '', by: '', a: '', m: '', x: [], s: 1, t: '', c: '', ac: '', g: '', o: 0 }, kontakt: { navn: '', email: '', tlf: '', besked: '', side: '', url: '', kanal: '', tid: '' } });

let S = blank();
try {
  const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
  if (saved && saved.svar) { const b = blank(); S = { ...b, ...saved, svar: { ...b.svar, ...saved.svar }, kontakt: { ...b.kontakt, ...saved.kontakt }, result: null }; }
} catch (x) { /* start fresh */ }
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ step: S.step, svar: S.svar, kontakt: S.kontakt })); } catch (x) { /* fine */ } };

const fagRow = () => FAG.find(f => f[0] === S.svar.b);
const fagLabel = () => (S.svar.b === 'generisk' ? S.svar.f.trim() : (fagRow() || [])[1]) || '';
const rec = () => temaerFor(S.svar.b);
const tema = () => S.svar.t || rec()[0];
const tone = () => S.svar.g || (THEMES[tema()] ? THEMES[tema()].g : 'lys');
const temaNavn = id => (id === 'eget' ? 'Egne farver' : THEMES[id].navn);
// The answers as they go in the link: the theme shown (or the trade's first), own colours only with "eget"
const answers = (f = {}) => {
  const v = { ...S.svar, ...f };
  const t = v.t || rec()[0];
  return { ...v, f: v.b === 'generisk' ? v.f.trim() : '', t, c: t === 'eget' ? v.c : '', ac: t === 'eget' ? v.ac : '' };
};
const b64url = o => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const draftLink = f => '/mit-udkast?d=' + b64url(answers(f));
const needsPhone = () => S.kontakt.kanal === 'ring' || S.kontakt.kanal === 'sms';

const STEPS = [
  { name: 'fag', ok: () => S.svar.b && (S.svar.b !== 'generisk' || S.svar.f.trim().length > 1) },
  { name: 'virksomhed', ok: () => S.svar.n.trim() && S.svar.by.trim() && (!S.svar.a || /^(19[5-9]\d|20[0-2]\d)$/.test(S.svar.a)) },
  { name: 'behov', ok: () => true },
  { name: 'stil', ok: () => true },
  { name: 'kontakt', ok: () => S.kontakt.navn.trim() && EMAIL.test(S.kontakt.email.trim()) && (!needsPhone() || S.kontakt.tlf.replace(/\D/g, '').length >= 8) }
];

/* -------- Tracking (README.md → Tracking) -------- */

// What each step chose, for its own event (never names, e-mails or other text the visitor typed)
const DETAILS = [
  () => ({ fag: S.svar.b === 'generisk' ? 'andet' : S.svar.b }),
  () => ({ has_year: S.svar.a ? 'ja' : 'nej', team_size: S.svar.m || 'ikke-valgt' }),
  () => ({ functions: S.svar.x.join(',') || 'ingen', functions_count: S.svar.x.length, has_site: S.kontakt.side || 'ikke-valgt' }),
  () => ({ design: DESIGN_NAMES[S.svar.s], theme: tema(), theme_changed: tema() !== rec()[0] ? 'ja' : 'nej' }),
  () => ({ has_phone: S.kontakt.tlf.trim() ? 'ja' : 'nej', has_message: S.kontakt.besked.trim() ? 'ja' : 'nej', contact_method: S.kontakt.kanal || 'ikke-valgt', contact_time: S.kontakt.tid || 'ikke-valgt' })
];
const CHOICE_GROUPS = { fag: 'fag', antal: 'antal', funk: 'funktion', side: 'hjemmeside', design: 'design', tema: 'farvetema', kanal: 'kontaktform', tid: 'kontakttid' };
const FIELD_NAMES = { 'svar.n': 'firmanavn', 'svar.by': 'by', 'svar.a': 'startaar', 'svar.f': 'andet_fag', 'kontakt.navn': 'navn', 'kontakt.email': 'email', 'kontakt.tlf': 'telefon', 'kontakt.besked': 'besked', 'kontakt.url': 'nuvaerende_side' };
const filledFields = new Set();
let tOpen = 0, tStep = 0;
const secs = t => Math.round((performance.now() - t) / 1000);
const stepView = dir => {
  tStep = performance.now();
  track('bestil_step_view', { step: S.step + 1, step_name: STEPS[S.step].name, direction: dir > 0 ? 'frem' : dir < 0 ? 'tilbage' : 'start' });
};

/* -------- Steps -------- */

const chip = (val, label, on, act, extra = '') => `<button type="button" class="bx__chip${on ? ' is-on' : ''}" data-act="${act}" data-v="${esc(val)}" aria-pressed="${on}"${extra}>${esc(label)}</button>`;
const field = (key, label, attrs = '', opt = false, area = false) => {
  const [grp, k] = key.split('.');
  const v = esc(S[grp][k]);
  const input = area ? `<textarea class="bx__in" data-f="${key}" ${attrs}>${v}</textarea>` : `<input class="bx__in" data-f="${key}" value="${v}" enterkeyhint="next" ${attrs}>`;
  return `<label class="bx__field"><span>${label}${opt ? ` <em>${opt === true ? '(valgfri)' : opt}</em>` : ''}</span>${input}</label>`;
};
const head = (n, h, sub) => `<div class="bx__k">Trin ${n} af 5</div><h2 class="bx__h" id="bx-h" tabindex="-1">${h}</h2><p class="bx__sub">${sub}</p>`;
const phoneHint = () => (S.kontakt.kanal === 'ring' ? '(så vi kan ringe)' : S.kontakt.kanal === 'sms' ? '(så vi kan sende en sms)' : '(valgfri)');

// Colours: themes with a main colour, an accent and a background tone, or the visitor's own two colours.
// The own colours start from the theme shown until the visitor changes them.
const ownColours = () => {
  if (S.svar.c && S.svar.ac) return { c: S.svar.c, ac: S.svar.ac, g: S.svar.g };
  const p = palette({ t: tema() === 'eget' ? rec()[0] : tema() });
  return { c: p.c, ac: p.a, g: S.svar.g };
};
const swatchStyle = id => preview(id, id === 'eget' ? ownColours() : { g: S.svar.g });
const temaKort = (id, act) => {
  const on = tema() === id;
  return `<button type="button" class="bx__tema${on ? ' is-on' : ''}" data-act="${act}" data-v="${id}" aria-pressed="${on}"><span class="bx__tema-prev" style="${swatchStyle(id)}"><i></i><i></i></span><b>${esc(temaNavn(id))}</b></button>`;
};
// where: 'trin' (step 4) or 'resultat' (the panel on the result, with background tones too)
function farveVaelger(where) {
  const act = where === 'trin' ? 'tema' : 'rtema';
  const r = rec(), more = TEMA_IDS.filter(id => !r.includes(id)), own = ownColours();
  const egne = `<div class="bx__egne" data-egne${where === 'trin' && !S.egne ? ' hidden' : ''}>${temaKort('eget', act)}
      <label class="bx__pick"><input type="color" data-own="c" value="${own.c}"><span>Hovedfarve</span></label>
      <label class="bx__pick"><input type="color" data-own="ac" value="${own.ac}"><span>Accentfarve</span></label>
    </div>`;
  if (where === 'trin') {
    return `<div class="bx__temaer" role="group" aria-label="Farver">${r.map(id => temaKort(id, act)).join('')}</div>
      <div class="bx__temaer bx__temaer--more" data-flere${S.flere ? '' : ' hidden'} role="group" aria-label="Flere farver">${more.map(id => temaKort(id, act)).join('')}</div>
      <div class="bx__more-row"><button type="button" class="bx__more" data-act="flere" aria-expanded="${!!S.flere}">${S.flere ? 'Færre farver' : 'Flere farver'}</button><button type="button" class="bx__more" data-act="egne" aria-expanded="${!!S.egne}">Lav dine egne farver</button></div>
      ${egne}`;
  }
  return `<div class="bx__temaer bx__temaer--all" role="group" aria-label="Farver">${[...r, ...more].map(id => temaKort(id, act)).join('')}</div>
    <div class="bx__panel-row"><div><span class="bx__lbl bx__lbl--sm">Dine egne farver</span>${egne}</div>
    <div><span class="bx__lbl bx__lbl--sm">Baggrund</span><div class="bx__chips bx__chips--sm" role="group" aria-label="Baggrund">${Object.entries(TONER).map(([v, l]) => chip(v, l, tone() === v, 'rtone')).join('')}</div></div></div>`;
}
// Choosing "Egne farver" keeps the colours made before, or starts from the theme shown
const chooseTheme = v => {
  if (v === 'eget' && !(S.svar.c && S.svar.ac)) { const o = ownColours(); S.svar.c = o.c; S.svar.ac = o.ac; }
  S.svar.t = v;
};

const VIEWS = [
  () => head(1, 'Hvad laver du?', 'Vælg det, der passer bedst. Så skriver vi teksterne til dit fag.')
    + `<div class="bx__chips bx__chips--big" role="group" aria-label="Fag">${FAG.map(([v, l]) => chip(v, l, S.svar.b === v, 'fag')).join('')}</div>`
    + `<div class="bx__other" data-other${S.svar.b === 'generisk' ? '' : ' hidden'}>${field('svar.f', 'Hvad laver du?', 'placeholder="Fx murer, dyrlæge eller hundefrisør" maxlength="40" autocomplete="off"')}</div>`,

  () => head(2, 'Fortæl lidt om virksomheden.', 'Navn og by kommer med på dit udkast.')
    + `<div class="bx__row">${field('svar.n', 'Virksomhedens navn', 'placeholder="Fx Holms Maler ApS" maxlength="60" autocomplete="organization" autocapitalize="words"')}${field('svar.by', 'By', 'placeholder="Fx Roskilde" maxlength="40" autocomplete="address-level2" autocapitalize="words"')}</div>`
    + `<div class="bx__row">${field('svar.a', 'Startet i år', 'placeholder="Fx 2015" inputmode="numeric" maxlength="4"', true)}<div></div></div>`
    + `<span class="bx__lbl">Hvor mange er I? <em>(valgfri)</em></span><div class="bx__chips" role="group" aria-label="Antal">${ANTAL.map(([v, l]) => chip(v, l, S.svar.m === v, 'antal')).join('')}</div>`,

  () => head(3, 'Hvad skal siden kunne?', 'Vælg gerne flere.')
    + `<div class="bx__tiles" role="group" aria-label="Funktioner">${FUNKTIONER.map(([v, l, d]) => { const on = S.svar.x.includes(v); return `<button type="button" class="bx__tile${on ? ' is-on' : ''}" data-act="funk" data-v="${v}" aria-pressed="${on}"><b>${l}</b><span>${d}</span></button>`; }).join('')}</div>`
    + `<p class="bx__always">Altid med: <b>kontaktformular, Google-optimering, mobilvenligt design og SSL.</b></p>`
    + `<span class="bx__lbl">Har du en hjemmeside i dag?</span><div class="bx__chips" role="group" aria-label="Har du en hjemmeside i dag?">${chip('nej', 'Nej', S.kontakt.side === 'nej', 'side')}${chip('ja', 'Ja', S.kontakt.side === 'ja', 'side')}</div>`
    + `<div class="bx__other" data-url-field${S.kontakt.side === 'ja' ? '' : ' hidden'}>${field('kontakt.url', 'Adressen på din nuværende side', 'placeholder="Fx minside.dk" maxlength="200" inputmode="url" autocomplete="url" autocapitalize="off" spellcheck="false"', true)}<p class="bx__note">Vi flytter den gerne for dig.</p></div>`,

  () => head(4, 'Vælg et udtryk.', 'Det er kun et udgangspunkt. Du kan prøve andre farver og design, når du ser din skitse.')
    + `<div class="bx__designs" role="group" aria-label="Design">${DESIGNS.map(([v, l, d]) => { const on = S.svar.s === v; return `<button type="button" class="bx__design${on ? ' is-on' : ''}" data-act="design" data-v="${v}" aria-pressed="${on}"><img src="/assets/bestil/design-${v}.jpg?v=2" alt="" width="640" height="400" loading="lazy"><b>${l}</b><span>${d}</span></button>`; }).join('')}</div>`
    + `<span class="bx__lbl">Vælg farver</span>${farveVaelger('trin')}`,

  () => head(5, 'Hvor skal vi sende din skitse?', 'Du ser den med det samme. Bagefter kontakter vi dig og gør den færdig sammen med dig.')
    + `<div class="bx__row">${field('kontakt.navn', 'Dit navn', 'maxlength="100" autocomplete="name" autocapitalize="words"')}${field('kontakt.email', 'Din e-mail', 'type="email" maxlength="200" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false"')}</div>`
    + `<span class="bx__lbl bx__lbl--first">Hvordan vil du helst kontaktes?</span><div class="bx__chips" role="group" aria-label="Hvordan vil du helst kontaktes?">${KANALER.map(([v, l]) => chip(v, l, S.kontakt.kanal === v, 'kanal')).join('')}</div>`
    + `<div class="bx__gap"></div>${field('kontakt.tlf', 'Telefon', 'type="tel" maxlength="30" autocomplete="tel"', phoneHint())}`
    + `<span class="bx__lbl bx__lbl--first">Hvornår passer det bedst? <em>(valgfri)</em></span><div class="bx__chips bx__chips--sm" role="group" aria-label="Hvornår passer det bedst?">${TIDER.map(([v, l]) => chip(v, l, S.kontakt.tid === v, 'tid')).join('')}</div>`
    + `<div class="bx__gap"></div>${field('kontakt.besked', 'Noget, vi skal vide?', 'rows="3" maxlength="2000" placeholder="Fx hvad du særligt gerne vil have med"', true, true)}`
    + `<input class="bx__hp" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">`
    + `<p class="bx__note">Skitsen er gratis og uforpligtende. Vi bruger dine oplysninger til at lave den og kontakte dig. Læs vores <a href="/privatliv" target="_blank">privatlivspolitik</a>.</p>`
    + (S.error ? `<p class="bx__err" role="alert">${S.error}</p>` : '')
];

/* -------- Layer -------- */

let root = null, body = null, standalone = false, opened = false;

function ensure() {
  if (root) return;
  root = document.createElement('div');
  root.className = 'bx';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-labelledby', 'bx-h');
  root.innerHTML = `<div class="bx__top">
      ${standalone ? '<a class="bx__logo" href="/">' : '<span class="bx__logo">'}<img src="/assets/logo-icon.svg" alt="" width="24" height="24"><span>webleads<b>.</b></span>${standalone ? '</a>' : '</span>'}
      <div class="bx__prog" aria-hidden="true">${'<i></i>'.repeat(5)}</div>
      <button type="button" class="bx__x" data-act="close" aria-label="Luk">✕</button>
    </div>
    <div class="bx__body"></div>
    <div class="bx__bar"><div class="bx__bar-in"><button type="button" class="bx__back" data-act="back" aria-label="Tilbage"><span aria-hidden="true">←</span><span class="bx__back-t">Tilbage</span></button><button type="button" class="bx__next" data-act="next">Næste →</button></div></div>`;
  body = root.querySelector('.bx__body');
  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  root.addEventListener('change', onChange);
  // A field filled in (once per field; what was written is not sent)
  root.addEventListener('focusout', e => {
    const f = e.target.dataset && e.target.dataset.f;
    if (!f || !e.target.value.trim() || filledFields.has(f)) return;
    filledFields.add(f);
    track('bestil_field', { step: S.step + 1, field_name: FIELD_NAMES[f] || f });
  });
  root.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || !e.target.matches('input.bx__in') || S.step >= 5) return;
    e.preventDefault();
    if (STEPS[S.step].ok()) return next();
    // Not done yet: the keyboard's "Næste" key moves on to the next field
    const fields = [...body.querySelectorAll('input.bx__in')].filter(f => f.offsetParent);
    fields[fields.indexOf(e.target) + 1]?.focus();
  });
  document.addEventListener('keydown', e => { if (opened && e.key === 'Escape' && !document.querySelector('.cc')) close(); });
  addEventListener('resize', fit);
  document.body.appendChild(root);
}

function render(dir = 1) {
  const res = S.step >= 5;
  root.querySelectorAll('.bx__prog i').forEach((el, i) => el.classList.toggle('is-done', res || i < S.step || (i === S.step && STEPS[i].ok())));
  const bar = root.querySelector('.bx__bar');
  bar.hidden = res;
  if (!res) {
    body.innerHTML = `<div class="bx__step${dir < 0 ? ' is-back' : ''}">${VIEWS[S.step]()}</div>`;
    root.querySelector('.bx__back').style.visibility = S.step ? 'visible' : 'hidden';
    updateNext();
  }
  body.scrollTop = 0;
}

function updateNext() {
  const b = root.querySelector('.bx__next');
  const last = S.step === 4;
  b.disabled = !STEPS[S.step].ok();
  b.textContent = last ? 'Lav min gratis skitse →' : 'Næste →';
  b.classList.toggle('bx__next--hot', last);
  root.querySelectorAll('.bx__prog i').forEach((el, i) => el.classList.toggle('is-done', i < S.step || (i === S.step && STEPS[i].ok())));
}

function focusStep() {
  const first = body.querySelector('input.bx__in, textarea.bx__in');
  if (first && (S.step === 1 || S.step === 4) && matchMedia('(pointer: fine)').matches) first.focus();
  else body.querySelector('#bx-h')?.focus({ preventScroll: true });
}

function go(step, dir) {
  S.step = step; S.error = ''; save(); render(dir); focusStep(); stepView(dir);
}

function next() {
  if (!STEPS[S.step].ok()) return;
  const n = S.step + 1, name = STEPS[S.step].name, seconds = secs(tStep);
  track('bestil_step', { step: n, name, seconds });
  // One event per step (bestil_1_fag … bestil_5_kontakt), so each step can be read on its own
  track(`bestil_${n}_${name}`, { seconds, ...DETAILS[S.step]() });
  if (S.step < 4) go(S.step + 1, 1);
  else submit();
}

// Whether a choice button is on, for re-marking a group after a click
const isOn = (a, val) => (a === 'funk' ? S.svar.x.includes(val) : a === 'antal' ? S.svar.m === val : a === 'fag' ? S.svar.b === val : a === 'side' ? S.kontakt.side === val
  : a === 'design' ? String(S.svar.s) === val : a === 'tema' || a === 'rtema' ? tema() === val : a === 'kanal' ? S.kontakt.kanal === val : a === 'tid' ? S.kontakt.tid === val
  : a === 'rtone' ? tone() === val : false);
const mark = a => body.querySelectorAll(`[data-act="${a}"]`).forEach(el => { const on = isOn(a, el.dataset.v); el.classList.toggle('is-on', on); el.setAttribute('aria-pressed', on); });

function onClick(e) {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const v = t.dataset.v;
  switch (t.dataset.act) {
    case 'close': return close();
    case 'back':
      if (S.step > 0) { track('bestil_back', { step: S.step + 1, step_name: STEPS[S.step].name, seconds: secs(tStep) }); go(S.step - 1, -1); }
      return;
    case 'next': return next();
    case 'fag': {
      // A new trade starts from its own colours and headline
      Object.assign(S.svar, { b: v, t: '', c: '', ac: '', g: '', o: 0 });
      const other = body.querySelector('[data-other]');
      other.hidden = v !== 'generisk';
      if (v !== 'generisk') { S.svar.f = ''; other.querySelector('input').value = ''; }
      break;
    }
    case 'antal': S.svar.m = S.svar.m === v ? '' : v; break;
    case 'funk': S.svar.x = S.svar.x.includes(v) ? S.svar.x.filter(x => x !== v) : [...S.svar.x, v]; break;
    case 'side': {
      S.kontakt.side = v;
      const box = body.querySelector('[data-url-field]');
      box.hidden = v !== 'ja';
      if (v === 'nej') { S.kontakt.url = ''; box.querySelector('input').value = ''; }
      break;
    }
    case 'design': S.svar.s = Number(v); break;
    case 'tema': chooseTheme(v); syncFarver(); break;
    case 'flere': case 'egne': {
      const k = t.dataset.act;
      S[k] = !S[k];
      body.querySelector(`[data-${k}]`).hidden = !S[k];
      t.setAttribute('aria-expanded', S[k]);
      if (k === 'flere') t.textContent = S.flere ? 'Færre farver' : 'Flere farver';
      return;
    }
    case 'kanal': {
      S.kontakt.kanal = S.kontakt.kanal === v ? '' : v;
      const em = body.querySelector('[data-f="kontakt.tlf"]').closest('label').querySelector('em');
      if (em) em.textContent = phoneHint();
      if (needsPhone() && !S.kontakt.tlf.trim()) setTimeout(() => body.querySelector('[data-f="kontakt.tlf"]').focus(), 60);
      break;
    }
    case 'tid': S.kontakt.tid = S.kontakt.tid === v ? '' : v; break;
    // The result
    case 'device':
      track('bestil_result_change', { change_type: 'visning', choice: v === 'mobile' ? 'mobil' : 'computer' });
      return setDevice(v);
    case 'rdesign':
      S.svar.s = Number(v); keep();
      track('bestil_result_change', { change_type: 'design', choice: DESIGN_NAMES[v] });
      return refreshDraft();
    case 'rtema':
      chooseTheme(v); keep();
      track('bestil_result_change', { change_type: 'farvetema', choice: v });
      return refreshDraft();
    case 'rtone':
      S.svar.g = v; keep();
      track('bestil_result_change', { change_type: 'baggrund', choice: v });
      return refreshDraft();
    case 'rflere': {
      const p = body.querySelector('[data-panel]');
      p.hidden = !p.hidden;
      t.setAttribute('aria-expanded', !p.hidden);
      t.textContent = p.hidden ? 'Flere farver' : 'Luk farver';
      return;
    }
    case 'nyt': return newSuggestion(v || 'knap');
    case 'fprev': case 'fnext': {
      const i = S.fi + (t.dataset.act === 'fnext' ? 1 : -1);
      if (i < 0 || i >= S.forslag.length) return;
      S.fi = i; Object.assign(S.svar, S.forslag[i]);
      track('bestil_forslag_nav', { direction: t.dataset.act === 'fnext' ? 'frem' : 'tilbage', number: i + 1 });
      return refreshDraft();
    }
    case 'fav': {
      const on = !S.fav.includes(S.fi);
      S.fav = on ? [...S.fav, S.fi] : S.fav.filter(i => i !== S.fi);
      track('bestil_favorit', { action: on ? 'gemt' : 'fjernet', number: S.fi + 1, design: DESIGN_NAMES[S.svar.s], theme: tema() });
      return refreshDraft();
    }
    case 'send': return sendWishes(t);
    case 'copy': return copyLink(t);
    case 'restart': S = blank(); save(); return go(0, -1);
    default: return;
  }
  save();
  {
    // Every choice, also the ones taken back again
    const a = t.dataset.act;
    track('bestil_choice', { step: S.step + 1, choice_group: CHOICE_GROUPS[a], choice: a === 'design' ? DESIGN_NAMES[v] : v === 'generisk' ? 'andet' : v, choice_action: isOn(a, v) ? 'valgt' : 'fravalgt' });
  }
  // Re-mark only the choices of this kind, so the step does not animate again
  mark(t.dataset.act);
  updateNext();
  if (t.dataset.act === 'fag') {
    if (v === 'generisk') body.querySelector('[data-f="svar.f"]').focus();
    else setTimeout(next, 280);
  }
  if (t.dataset.act === 'side' && v === 'ja') body.querySelector('[data-f="kontakt.url"]').focus();
}

function onInput(e) {
  const own = e.target.dataset.own;
  if (own) return ownColour(own, e.target.value, false);
  const f = e.target.dataset.f;
  if (!f) return;
  const [grp, k] = f.split('.');
  S[grp][k] = e.target.value;
  save(); updateNext();
}
function onChange(e) {
  const own = e.target.dataset.own;
  if (own) ownColour(own, e.target.value, true);
}

// The visitor's own two colours. Starts from the colours shown, so changing one keeps the other.
let ownTimer = null, ownTracked = false;
function ownColour(key, value, done) {
  chooseTheme('eget');
  S.svar[key] = value.toLowerCase();
  save(); syncFarver();
  if (!ownTracked) {
    ownTracked = true;
    if (S.step === 3) track('bestil_choice', { step: 4, choice_group: CHOICE_GROUPS.tema, choice: 'eget', choice_action: 'valgt' });
    else track('bestil_result_change', { change_type: 'egne_farver', choice: 'eget' });
  }
  if (S.step < 5) return;
  keep();
  // The draft is reloaded when the colour is chosen, not for every step of dragging the picker
  clearTimeout(ownTimer);
  ownTimer = setTimeout(refreshDraft, done ? 0 : 450);
}

// Marks the chosen colours everywhere they are shown
function syncFarver() {
  const minis = body.querySelector('[data-minis]');
  if (minis) {
    // Rebuilt only when another theme joins the row, so the pressed swatch keeps the focus
    const ids = [...new Set([...rec(), tema()])].join(',');
    if (minis.dataset.ids !== ids) { minis.innerHTML = miniSwatches(); minis.dataset.ids = ids; }
  }
  mark('tema'); mark('rtema'); mark('rtone');
  body.querySelectorAll('.bx__tema-prev, .bx__mini').forEach(el => { el.style.cssText = swatchStyle(el.dataset.v || el.closest('[data-v]').dataset.v); });
  // The colour pickers show the own colours (or the theme's, until the visitor makes their own)
  const own = ownColours();
  body.querySelectorAll('[data-own]').forEach(i => { if (document.activeElement !== i) i.value = own[i.dataset.own]; });
}

/* -------- Sending and the draft -------- */

async function submit() {
  const hp = body.querySelector('.bx__hp')?.value || '';
  S.step = 5;
  render();
  const steps = [`Tekster til ${esc(fagLabel().toLowerCase())} i ${esc(S.svar.by.trim())}`, 'Farver og design', 'Forside, ydelser, om os og kontakt', 'Klar til mobil og Google'];
  body.innerHTML = `<div class="bx__step"><div class="bx__k">Et øjeblik</div><h2 class="bx__h" id="bx-h" tabindex="-1">Vi laver din skitse …</h2><ul class="bx__build">${steps.map(s => `<li><i></i>${s}</li>`).join('')}</ul></div>`;
  const items = [...body.querySelectorAll('.bx__build li')];
  const anim = (async () => { for (const li of items) { li.classList.add('is-busy'); await wait(620); li.classList.replace('is-busy', 'is-done'); } })();
  const meta = metaLeadFields();
  track('bestil_submit', { seconds_total: secs(tOpen), fag: DETAILS[0]().fag, design: DESIGN_NAMES[S.svar.s] });
  try {
    const r = await fetch('/api/bestil', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ svar: answers(), kontakt: S.kontakt, _gotcha: hp, ...meta })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    S.result = data.link || draftLink();
    S.mailed = !!data.kvittering;
  } catch (x) {
    track('form_error', { form_name: 'bestil', error_message: String(x.message || x).slice(0, 100) });
    track('bestil_error', { error_message: String(x.message || x).slice(0, 100) });
    S.error = 'Det lykkedes ikke at sende. Prøv igen, eller skriv til <a href="mailto:hej@webleads.dk">hej@webleads.dk</a>.';
    S.step = 4; render(-1);
    return;
  }
  track('generate_lead', { selected: 'Bestil: ' + fagLabel(), form_name: 'bestil', fag: DETAILS[0]().fag, value: 3000, currency: 'DKK', receipt: S.mailed ? 'ja' : 'nej' });
  metaTrack('Lead', { content_name: 'Bestil: ' + fagLabel(), value: 3000, currency: 'DKK' }, { id: meta.meta_event_id, mirror: false });
  await anim;
  await wait(250);
  showResult();
  track('bestil_udkast_vist', { fag: DETAILS[0]().fag, design: DESIGN_NAMES[S.svar.s], theme: tema(), view: device === 'mobile' ? 'mobil' : 'computer', receipt: S.mailed ? 'ja' : 'nej', seconds_total: secs(tOpen) });
  try { sessionStorage.removeItem(KEY); } catch (x) { /* fine */ }
}

// How and when we get in touch, in the words the visitor chose
const KONTAKT = {
  ring: ['Vi ringer dig op', 'ringer vi dig op'], sms: ['Vi sender en sms', 'sender vi dig en sms'],
  mail: ['Vi skriver til dig', 'skriver vi til dig'], '': ['Vi kontakter dig', 'kontakter vi dig']
};
const TID_TEKST = { formiddag: 'om formiddagen', eftermiddag: 'om eftermiddagen', aften: 'om aftenen' };
const contactWhen = () => `Inden for få timer på hverdage.${TID_TEKST[S.kontakt.tid] ? ` Du har bedt om at blive kontaktet ${TID_TEKST[S.kontakt.tid]}.` : ''}`;

// The suggestions shown so far: each is a design, colours and a headline
const snap = () => ({ s: S.svar.s, t: tema(), c: S.svar.c, ac: S.svar.ac, g: S.svar.g, o: S.svar.o || 0 });
const keep = () => { S.forslag[S.fi] = snap(); };
const same = (x, y) => ['s', 't', 'g', 'o'].every(k => (x[k] || '') === (y[k] || '')) && (x.t !== 'eget' || (x.c === y.c && x.ac === y.ac));
const pick = a => a[Math.floor(Math.random() * a.length)];
const tagged = tag => TEMA_IDS.filter(id => THEMES[id].tags.includes(tag));

function newSuggestion(dir) {
  const cur = snap();
  let f = null;
  if (dir === 'anden-tekst') f = { ...cur, o: (cur.o + 1) % 3 };
  else {
    for (let i = 0; i < 30; i++) {
      // Mostly the trade's own themes; "Mere …" steers the design, the colours and the background
      f = dir === 'mere-farve' ? { s: pick([4, 1, 4]), t: pick(tagged('farverig')), g: 'tonet' }
        : dir === 'mere-enkel' ? { s: 5, t: pick(tagged('rolig')), g: 'lys' }
        : dir === 'mere-moderne' ? { s: pick([4, 5]), t: pick(tagged('moderne')), g: '' }
        : dir === 'mere-klassisk' ? { s: 1, t: pick(tagged('klassisk')), g: '' }
        : { s: pick([1, 4, 5]), t: pick(Math.random() < 0.65 ? rec() : TEMA_IDS), g: '', o: pick([0, 1, 2]) };
      f = { c: '', ac: '', o: cur.o, ...f };
      if (!S.forslag.some(x => same(x, f))) break;
    }
  }
  if (dir !== 'knap' && !S.valg.includes(dir)) S.valg.push(dir);
  S.forslag.push(f);
  S.fi = S.forslag.length - 1;
  Object.assign(S.svar, f);
  track('bestil_forslag', { trigger: dir, number: S.fi + 1, design: DESIGN_NAMES[f.s], theme: f.t });
  refreshDraft();
}

const miniSwatches = () => {
  const ids = [...new Set([...rec(), tema()])];
  return ids.map(id => `<button type="button" class="bx__mini${tema() === id ? ' is-on' : ''}" data-act="rtema" data-v="${id}" style="${swatchStyle(id)}" aria-label="Farver: ${esc(temaNavn(id))}" aria-pressed="${tema() === id}" title="${esc(temaNavn(id))}"></button>`).join('');
};

let device = 'desktop';
function showResult() {
  const kort = S.svar.n.trim().replace(/\s+(ApS|A\/S|IVS|I\/S|K\/S|P\/S)\.?$/i, '');
  const gen = esc(kort) + (/[sxz]$/i.test(kort) ? '\'' : 's');
  const [kh, ks] = KONTAKT[S.kontakt.kanal] || KONTAKT[''];
  // On a phone the draft is shown as a phone; the computer version would be too small to read
  device = matchMedia('(max-width: 600px)').matches ? 'mobile' : 'desktop';
  S.forslag = [snap()]; S.fi = 0; S.fav = []; S.valg = [];
  const on = v => (device === v ? ' class="is-on"' : '');
  body.innerHTML = `<div class="bx__step bx__step--res">
    <div class="bx__res-head"><div><div class="bx__k">Din første skitse</div><h2 class="bx__h" id="bx-h" tabindex="-1">Sådan kunne ${gen} hjemmeside se ud.</h2>
      <p class="bx__sub">Det her er et udgangspunkt, ikke det færdige resultat. Prøv andre farver, design og forslag herunder. Inden for få timer på hverdage ${ks}, og så laver vi et færdigt udkast med jeres egne billeder, tekster og ønsker.${S.mailed ? ' Linket til skitsen ligger også i din indbakke.' : ''}</p></div></div>
    <div class="bx__tools">
      <div class="bx__seg bx__seg--device" role="group" aria-label="Visning"><button type="button" data-act="device" data-v="desktop"${on('desktop')}>Computer</button><button type="button" data-act="device" data-v="mobile"${on('mobile')}>Mobil</button></div>
      <div class="bx__seg" role="group" aria-label="Design">${DESIGNS.map(([v, l]) => `<button type="button" data-act="rdesign" data-v="${v}"${S.svar.s === v ? ' class="is-on"' : ''}>${l}</button>`).join('')}</div>
      <div class="bx__minis" data-minis role="group" aria-label="Farver">${miniSwatches()}</div>
      <button type="button" class="bx__more" data-act="rflere" aria-expanded="false" aria-controls="bx-panel">Flere farver</button>
    </div>
    <div class="bx__panel" id="bx-panel" data-panel hidden>${farveVaelger('resultat')}</div>
    <div class="bx__stage${device === 'mobile' ? ' is-mobile' : ''}"><span class="bx__tag">Første skitse</span>
      <div class="bx__frame${device === 'mobile' ? ' is-mobile' : ''}"><div class="bx__chrome"><i></i><i></i><i></i><span data-url></span></div><div class="bx__view"><iframe title="Din skitse" loading="eager"></iframe></div></div>
    </div>
    <div class="bx__forslag">
      <div class="bx__fnav"><button type="button" class="bx__round" data-act="fprev" aria-label="Forrige forslag">←</button><span data-fnum aria-live="polite"></span><button type="button" class="bx__round" data-act="fnext" aria-label="Næste forslag">→</button></div>
      <button type="button" class="bx__btn bx__btn--hot" data-act="nyt" data-v="knap"><span aria-hidden="true">↻</span> Vis et nyt forslag</button>
      <button type="button" class="bx__btn bx__fav" data-act="fav" aria-pressed="false"><span data-heart aria-hidden="true">♡</span> <span data-fav-t>Gem som favorit</span></button>
    </div>
    <div class="bx__nudge"><span class="bx__lbl bx__lbl--sm">Hvad skal være anderledes?</span>
      <div class="bx__chips bx__chips--sm" role="group" aria-label="Hvad skal være anderledes?">${RETNINGER.map(([v, l]) => `<button type="button" class="bx__chip" data-act="nyt" data-v="${v}">${esc(l)}</button>`).join('')}</div>
    </div>
    <div class="bx__links"><a data-open target="_blank" rel="noopener">Åbn i nyt vindue ↗</a><button type="button" data-act="copy">Kopiér link</button></div>
    <section class="bx__wish" aria-labelledby="bx-wish">
      <h3 id="bx-wish">Send dine ønsker til os</h3>
      <p>Vi får det forslag, du ser nu, dine favoritter og det, du skriver her. Så starter vi samtalen det rigtige sted.</p>
      <label class="bx__field"><span>Hvad vil du gerne have anderledes? <em>(valgfri)</em></span><textarea class="bx__in" data-wish rows="3" maxlength="1500" placeholder="Fx vores logo skal med, og vi vil gerne vise flere billeder af vores arbejde"></textarea></label>
      <div class="bx__wish-send"><button type="button" class="bx__btn bx__btn--dark" data-act="send">Send til Webleads →</button><span class="bx__wish-ok" data-wish-ok role="status"></span></div>
    </section>
    <section class="bx__now" aria-labelledby="bx-now">
      <h3 id="bx-now">Hvad sker der nu?</h3>
      <ol>
        <li class="is-done"><b>Din skitse er klar</b><p>Prøv farver, design og forslag, og send os dine ønsker.</p></li>
        <li><b>${kh}</b><p>${esc(contactWhen())}</p></li>
        <li><b>Færdigt udkast</b><p>Med jeres egne billeder, tekster og ønsker.</p></li>
        <li><b>Du er online</b><p>Vi retter til, indtil du er glad. Klar på 7 dage, fra 3.000 kr. og ingen binding.</p></li>
      </ol>
    </section>
    <p class="bx__fine">Spørgsmål? Skriv til <a href="mailto:hej@webleads.dk">hej@webleads.dk</a> eller sms til <a href="sms:+4541826799">41 82 67 99</a>.</p>
  </div>`;
  refreshDraft();
  focusStep();
  body.querySelector('[data-open]').addEventListener('click', () => track('bestil_draft_open', { design: DESIGN_NAMES[S.svar.s] }));
}

function refreshDraft() {
  const link = draftLink();
  const ifr = body.querySelector('iframe');
  if (!ifr) return;
  // replace() so changing design or colours does not add entries to the browser's history
  if (ifr.dataset.loaded) ifr.contentWindow.location.replace(link);
  else { ifr.src = link; ifr.dataset.loaded = '1'; }
  body.querySelector('[data-open]').href = link;
  body.querySelector('[data-url]').textContent = 'webleads.dk' + link;
  body.querySelectorAll('[data-act="rdesign"]').forEach(b => b.classList.toggle('is-on', b.dataset.v === String(S.svar.s)));
  syncFarver();
  // Suggestions: where we are, and whether this one is a favourite
  body.querySelector('[data-fnum]').textContent = `Forslag ${S.fi + 1} af ${S.forslag.length}`;
  body.querySelector('[data-act="fprev"]').disabled = S.fi === 0;
  body.querySelector('[data-act="fnext"]').disabled = S.fi === S.forslag.length - 1;
  const fav = S.fav.includes(S.fi), favBtn = body.querySelector('[data-act="fav"]');
  favBtn.setAttribute('aria-pressed', fav);
  favBtn.querySelector('[data-heart]').textContent = fav ? '♥' : '♡';
  favBtn.querySelector('[data-fav-t]').textContent = fav ? 'Favorit' : 'Gem som favorit';
  fit();
}

// The wishes, the suggestion on screen and the favourites, to us (api/oensker.js)
let sending = false;
async function sendWishes(btn) {
  if (sending) return;
  const text = body.querySelector('[data-wish]').value.trim();
  const ok = body.querySelector('[data-wish-ok]');
  sending = true; btn.disabled = true; ok.textContent = 'Sender …';
  const payload = {
    svar: answers(), favoritter: S.fav.map(i => answers(S.forslag[i])), valg: S.valg, besked: text,
    forslag: S.forslag.length, kontakt: { navn: S.kontakt.navn, email: S.kontakt.email }, _gotcha: body.querySelector('.bx__hp')?.value || ''
  };
  let result = 'sendt';
  try {
    const r = await fetch('/api/oensker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    ok.textContent = 'Tak! Vi har fået dine ønsker og tager dem med, når vi kontakter dig.';
    btn.textContent = 'Send igen →';
  } catch (x) {
    result = 'fejl';
    ok.innerHTML = 'Det lykkedes ikke at sende. Prøv igen, eller skriv til <a href="mailto:hej@webleads.dk">hej@webleads.dk</a>.';
  }
  track('bestil_oensker_sendt', { result, has_text: text ? 'ja' : 'nej', favourites: S.fav.length, suggestions: S.forslag.length, nudges: S.valg.join(',') || 'ingen' });
  sending = false; btn.disabled = false;
}

function setDevice(v) {
  device = v;
  body.querySelector('.bx__frame').classList.toggle('is-mobile', v === 'mobile');
  body.querySelector('.bx__stage').classList.toggle('is-mobile', v === 'mobile');
  body.querySelectorAll('[data-act="device"]').forEach(b => b.classList.toggle('is-on', b.dataset.v === v));
  setTimeout(fit, 420); fit();
}

function fit() {
  const view = body && body.querySelector('.bx__view'), ifr = view && view.querySelector('iframe');
  if (!ifr) return;
  const w = device === 'mobile' ? 390 : 1280;
  const scale = Math.min(1, view.clientWidth / w);
  ifr.style.width = w + 'px';
  ifr.style.height = Math.ceil(view.clientHeight / scale) + 'px';
  ifr.style.transform = `scale(${scale})`;
}

async function copyLink(btn) {
  const url = location.origin + draftLink();
  try { await navigator.clipboard.writeText(url); btn.textContent = 'Kopieret ✓'; track('bestil_link_copy', { result: 'kopieret' }); } catch (x) { track('bestil_link_copy', { result: 'manuelt' }); prompt('Kopiér linket:', url); }
  setTimeout(() => { btn.textContent = 'Kopiér link'; }, 2000);
}

/* -------- Open and close -------- */

export function openBestil({ from = 'link', alone = false } = {}) {
  standalone = alone;
  ensure();
  if (opened) return;
  opened = true;
  if (S.step >= 5) S.step = 4;
  render(0);
  root.classList.add('is-open');
  document.documentElement.style.overflow = 'hidden';
  if (!standalone && location.hash !== '#bestil') history.pushState({ bestil: 1 }, '', '#bestil');
  setTimeout(focusStep, 50);
  tOpen = performance.now();
  track('bestil_open', { from, resumed: S.step > 0 ? 'ja' : 'nej' });
  stepView(0);
}

function close() {
  if (!opened) return;
  // Where people leave: the step (6 = after seeing the draft) and how long they had spent
  track('bestil_close', { step: S.result ? 6 : S.step + 1, step_name: S.result ? 'resultat' : STEPS[Math.min(S.step, 4)].name, finished: S.result ? 'ja' : 'nej', seconds_total: secs(tOpen) });
  if (standalone) { location.href = '/'; return; }
  opened = false;
  root.classList.remove('is-open');
  document.documentElement.style.overflow = '';
  if (S.result) { S = blank(); }
  // Remove #bestil without going back: the draft in the iframe has its own history entries
  if (location.hash === '#bestil') history.replaceState(null, '', location.pathname + location.search);
}

// The browser's back button closes the layer
addEventListener('popstate', () => { if (opened && location.hash !== '#bestil') close(); });

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-bestil]');
  if (!t || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
  e.preventDefault();
  openBestil({ from: t.dataset.bestil || 'knap' });
});
if (location.hash === '#bestil') openBestil({ from: 'link' });
addEventListener('hashchange', () => { if (location.hash === '#bestil') openBestil({ from: 'link' }); });
