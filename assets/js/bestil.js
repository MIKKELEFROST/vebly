// "Bestil en hjemmeside": five short steps, then a free draft of the visitor's own website.
// Opens as a full-screen layer from any [data-bestil] link (and on #bestil), and on its own at /bestil.
// The answers go to /api/bestil, which e-mails them to us and returns the link to the draft
// (/mit-udkast?d=…, rendered by api/udkast.js from the same templates as hand-made drafts).
import { track } from './analytics.js';
import { metaTrack, metaLeadFields } from './meta-pixel.js';

// [template in api/_lib/udkast/brancher, label, default colour]
const FAG = [
  ['frisoer', 'Frisør', '#9c3d5a'], ['toemrer', 'Tømrer', '#6b4a2f'], ['maler', 'Maler', '#1d4e89'],
  ['elektriker', 'Elektriker', '#a87c00'], ['vvs', 'VVS', '#0f6d7a'], ['rengoering', 'Rengøring', '#2f7d8c'],
  ['klinik', 'Klinik og massage', '#7a5a8c'], ['fysioterapeut', 'Fysioterapeut', '#2b4c7e'],
  ['personlig-traener', 'Personlig træner', '#5b3fd0'], ['revisor', 'Revisor', '#1f2a44'], ['generisk', 'Andet', '#1d4e89']
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
const ALT = ['#1d4e89', '#1f5f4a', '#b5532f', '#2b2b2b', '#7a3fd0', '#9c3d5a'];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KEY = 'wl-bestil';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));
const blank = () => ({ step: 0, svar: { b: '', f: '', n: '', by: '', a: '', m: '', x: [], s: 1, c: '' }, kontakt: { navn: '', email: '', tlf: '', besked: '', side: '', url: '' } });

let S = blank();
try { const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (saved && saved.svar) S = { ...blank(), ...saved, result: null }; } catch (x) { /* start fresh */ }
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ step: S.step, svar: S.svar, kontakt: S.kontakt })); } catch (x) { /* fine */ } };

const fagRow = () => FAG.find(f => f[0] === S.svar.b);
const fagLabel = () => (S.svar.b === 'generisk' ? S.svar.f.trim() : (fagRow() || [])[1]) || '';
const colours = () => { const own = (fagRow() || [, , '#1d4e89'])[2]; return [own, ...ALT.filter(c => c !== own)].slice(0, 6); };
const b64url = o => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const draftLink = () => '/mit-udkast?d=' + b64url({ ...S.svar, f: S.svar.b === 'generisk' ? S.svar.f.trim() : '', c: S.svar.c || colours()[0] });

const STEPS = [
  { name: 'fag', ok: () => S.svar.b && (S.svar.b !== 'generisk' || S.svar.f.trim().length > 1) },
  { name: 'virksomhed', ok: () => S.svar.n.trim() && S.svar.by.trim() && (!S.svar.a || /^(19[5-9]\d|20[0-2]\d)$/.test(S.svar.a)) },
  { name: 'behov', ok: () => true },
  { name: 'stil', ok: () => true },
  { name: 'kontakt', ok: () => S.kontakt.navn.trim() && EMAIL.test(S.kontakt.email.trim()) }
];

/* -------- Steps -------- */

const chip = (val, label, on, act, extra = '') => `<button type="button" class="bx__chip${on ? ' is-on' : ''}" data-act="${act}" data-v="${esc(val)}" aria-pressed="${on}"${extra}>${esc(label)}</button>`;
const field = (key, label, attrs = '', opt = false, area = false) => {
  const [grp, k] = key.split('.');
  const v = esc(S[grp][k]);
  const input = area ? `<textarea class="bx__in" data-f="${key}" ${attrs}>${v}</textarea>` : `<input class="bx__in" data-f="${key}" value="${v}" enterkeyhint="next" ${attrs}>`;
  return `<label class="bx__field"><span>${label}${opt ? ' <em>(valgfri)</em>' : ''}</span>${input}</label>`;
};
const head = (n, h, sub) => `<div class="bx__k">Trin ${n} af 5</div><h2 class="bx__h" id="bx-h" tabindex="-1">${h}</h2><p class="bx__sub">${sub}</p>`;

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

  () => head(4, 'Vælg et udtryk.', 'Du kan altid ændre det bagefter.')
    + `<div class="bx__designs" role="group" aria-label="Design">${DESIGNS.map(([v, l, d]) => { const on = S.svar.s === v; return `<button type="button" class="bx__design${on ? ' is-on' : ''}" data-act="design" data-v="${v}" aria-pressed="${on}"><img src="/assets/bestil/design-${v}.jpg" alt="" width="640" height="400" loading="lazy"><b>${l}</b><span>${d}</span></button>`; }).join('')}</div>`
    + `<span class="bx__lbl">Vælg en farve</span><div class="bx__colors" role="group" aria-label="Farve">${colours().map((c, i) => { const on = (S.svar.c || colours()[0]) === c; return `<button type="button" class="bx__sw${on ? ' is-on' : ''}" style="background:${c}" data-act="farve" data-v="${c}" aria-label="Farve ${i + 1}" aria-pressed="${on}"></button>`; }).join('')}</div>`,

  () => head(5, 'Hvor skal vi sende dit udkast?', 'Du ser udkastet med det samme, og vi kontakter dig for at gøre det færdigt.')
    + `<div class="bx__row">${field('kontakt.navn', 'Dit navn', 'maxlength="100" autocomplete="name" autocapitalize="words"')}${field('kontakt.email', 'Din e-mail', 'type="email" maxlength="200" autocomplete="email" inputmode="email" autocapitalize="off" spellcheck="false"')}</div>`
    + field('kontakt.tlf', 'Telefon', 'type="tel" maxlength="30" autocomplete="tel"', true)
    + field('kontakt.besked', 'Noget, vi skal vide?', 'rows="3" maxlength="2000" placeholder="Fx hvad du særligt gerne vil have med"', true, true)
    + `<input class="bx__hp" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">`
    + `<p class="bx__note">Udkastet er gratis og uforpligtende. Vi bruger dine oplysninger til at lave udkastet og kontakte dig. Læs vores <a href="/privatliv" target="_blank">privatlivspolitik</a>.</p>`
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
  b.textContent = last ? 'Lav mit gratis udkast →' : 'Næste →';
  b.classList.toggle('bx__next--hot', last);
  root.querySelectorAll('.bx__prog i').forEach((el, i) => el.classList.toggle('is-done', i < S.step || (i === S.step && STEPS[i].ok())));
}

function focusStep() {
  const first = body.querySelector('input.bx__in, textarea.bx__in');
  if (first && (S.step === 1 || S.step === 4) && matchMedia('(pointer: fine)').matches) first.focus();
  else body.querySelector('#bx-h')?.focus({ preventScroll: true });
}

function go(step, dir) {
  S.step = step; S.error = ''; save(); render(dir); focusStep();
}

function next() {
  if (!STEPS[S.step].ok()) return;
  track('bestil_step', { step: S.step + 1, name: STEPS[S.step].name });
  if (S.step < 4) go(S.step + 1, 1);
  else submit();
}

function onClick(e) {
  const t = e.target.closest('[data-act]');
  if (!t) return;
  const v = t.dataset.v;
  switch (t.dataset.act) {
    case 'close': return close();
    case 'back': return S.step > 0 && go(S.step - 1, -1);
    case 'next': return next();
    case 'fag': {
      S.svar.b = v; S.svar.c = '';
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
    case 'farve': S.svar.c = v; break;
    case 'device': return setDevice(v);
    case 'rdesign': S.svar.s = Number(v); save(); return refreshDraft();
    case 'rfarve': S.svar.c = v; save(); return refreshDraft();
    case 'copy': return copyLink(t);
    case 'restart': S = blank(); save(); return go(0, -1);
    default: return;
  }
  save();
  // Re-render only the pressed group, so the step does not animate again
  const group = t.parentElement;
  group.querySelectorAll('[data-act]').forEach(el => {
    const val = el.dataset.v;
    const a = el.dataset.act;
    const on = a === 'funk' ? S.svar.x.includes(val) : a === 'antal' ? S.svar.m === val : a === 'fag' ? S.svar.b === val : a === 'side' ? S.kontakt.side === val
      : a === 'design' ? String(S.svar.s) === val : a === 'farve' ? (S.svar.c || colours()[0]) === val : false;
    el.classList.toggle('is-on', on); el.setAttribute('aria-pressed', on);
  });
  updateNext();
  if (t.dataset.act === 'fag') {
    if (v === 'generisk') body.querySelector('[data-f="svar.f"]').focus();
    else setTimeout(next, 280);
  }
  if (t.dataset.act === 'side' && v === 'ja') body.querySelector('[data-f="kontakt.url"]').focus();
}

function onInput(e) {
  const f = e.target.dataset.f;
  if (!f) return;
  const [grp, k] = f.split('.');
  S[grp][k] = e.target.value;
  save(); updateNext();
}

/* -------- Sending and the draft -------- */

async function submit() {
  const hp = body.querySelector('.bx__hp')?.value || '';
  S.step = 5;
  render();
  const steps = [`Tekster til ${esc(fagLabel().toLowerCase())} i ${esc(S.svar.by.trim())}`, 'Farver og design', 'Forside, ydelser, om os og kontakt', 'Klar til mobil og Google'];
  body.innerHTML = `<div class="bx__step"><div class="bx__k">Et øjeblik</div><h2 class="bx__h" id="bx-h" tabindex="-1">Vi bygger dit udkast …</h2><ul class="bx__build">${steps.map(s => `<li><i></i>${s}</li>`).join('')}</ul></div>`;
  const items = [...body.querySelectorAll('.bx__build li')];
  const anim = (async () => { for (const li of items) { li.classList.add('is-busy'); await wait(620); li.classList.replace('is-busy', 'is-done'); } })();
  const meta = metaLeadFields();
  try {
    const r = await fetch('/api/bestil', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ svar: { ...S.svar, c: S.svar.c || colours()[0] }, kontakt: S.kontakt, _gotcha: hp, ...meta })
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    S.result = (await r.json()).link || draftLink();
  } catch (x) {
    track('form_error');
    S.error = 'Det lykkedes ikke at sende. Prøv igen, eller skriv til <a href="mailto:hej@webleads.dk">hej@webleads.dk</a>.';
    S.step = 4; render(-1);
    return;
  }
  track('generate_lead', { selected: 'Bestil: ' + fagLabel() });
  metaTrack('Lead', { content_name: 'Bestil: ' + fagLabel(), value: 3000, currency: 'DKK' }, { id: meta.meta_event_id, mirror: false });
  await anim;
  await wait(250);
  showResult();
  try { sessionStorage.removeItem(KEY); } catch (x) { /* fine */ }
}

let device = 'desktop';
function showResult() {
  const kort = S.svar.n.trim().replace(/\s+(ApS|A\/S|IVS|I\/S|K\/S|P\/S)\.?$/i, '');
  // On a phone the draft is shown as a phone; the computer version would be too small to read
  device = matchMedia('(max-width: 600px)').matches ? 'mobile' : 'desktop';
  const on = v => (device === v ? ' class="is-on"' : '');
  body.innerHTML = `<div class="bx__step bx__step--res">
    <div class="bx__res-head"><div><div class="bx__k">Dit gratis udkast</div><h2 class="bx__h" id="bx-h" tabindex="-1">Her er ${esc(kort)}${/[sxz]$/i.test(kort) ? '\'' : 's'} nye hjemmeside.</h2>
      <p class="bx__sub">Lavet ud fra dine svar. Billeder og anmeldelser er eksempler, og teksterne gør vi færdige sammen med dig.</p></div></div>
    <div class="bx__tools">
      <div class="bx__seg bx__seg--device" role="group" aria-label="Visning"><button type="button" data-act="device" data-v="desktop"${on('desktop')}>Computer</button><button type="button" data-act="device" data-v="mobile"${on('mobile')}>Mobil</button></div>
      <div class="bx__seg" role="group" aria-label="Design">${DESIGNS.map(([v, l]) => `<button type="button" data-act="rdesign" data-v="${v}"${S.svar.s === v ? ' class="is-on"' : ''}>${l}</button>`).join('')}</div>
      <div class="bx__colors" role="group" aria-label="Farve">${colours().map((c, i) => `<button type="button" class="bx__sw${(S.svar.c || colours()[0]) === c ? ' is-on' : ''}" style="background:${c}" data-act="rfarve" data-v="${c}" aria-label="Farve ${i + 1}"></button>`).join('')}</div>
    </div>
    <div class="bx__frame${device === 'mobile' ? ' is-mobile' : ''}"><div class="bx__chrome"><i></i><i></i><i></i><span data-url></span></div><div class="bx__view"><iframe title="Dit udkast" loading="eager"></iframe></div></div>
    <div class="bx__acts"><a class="bx__btn bx__btn--dark" data-open target="_blank" rel="noopener">Åbn udkastet ↗</a><button type="button" class="bx__btn" data-act="copy">Kopiér link</button></div>
    <div class="bx__next-steps">
      <div><span>01</span><b>Vi ringer dig op</b><p>Vi kigger på dine svar og kontakter dig hurtigst muligt.</p></div>
      <div><span>02</span><b>Vi bygger den</b><p>Med dine egne billeder, tekster og ydelser.</p></div>
      <div><span>03</span><b>Du er online</b><p>Klar på 7 dage. Fra 3.000 kr. og ingen binding.</p></div>
    </div>
    <p class="bx__fine">Spørgsmål? Skriv til <a href="mailto:hej@webleads.dk">hej@webleads.dk</a> eller sms til <a href="sms:+4541826799">41 82 67 99</a>.</p>
  </div>`;
  refreshDraft();
  focusStep();
}

function refreshDraft() {
  const link = draftLink();
  const ifr = body.querySelector('iframe');
  if (!ifr) return;
  // replace() so changing design or colour does not add entries to the browser's history
  if (ifr.dataset.loaded) ifr.contentWindow.location.replace(link);
  else { ifr.src = link; ifr.dataset.loaded = '1'; }
  body.querySelector('[data-open]').href = link;
  body.querySelector('[data-url]').textContent = 'webleads.dk' + link;
  body.querySelectorAll('[data-act="rdesign"]').forEach(b => b.classList.toggle('is-on', b.dataset.v === String(S.svar.s)));
  body.querySelectorAll('[data-act="rfarve"]').forEach(b => b.classList.toggle('is-on', b.dataset.v === (S.svar.c || colours()[0])));
  fit();
}

function setDevice(v) {
  device = v;
  body.querySelector('.bx__frame').classList.toggle('is-mobile', v === 'mobile');
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
  try { await navigator.clipboard.writeText(url); btn.textContent = 'Kopieret ✓'; } catch (x) { prompt('Kopiér linket:', url); }
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
  track('bestil_open', { from });
}

function close() {
  if (!opened) return;
  if (standalone) { location.href = '/'; return; }
  opened = false;
  if (!S.result) track('bestil_close', { step: S.step + 1 });
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
