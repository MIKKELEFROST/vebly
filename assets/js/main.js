import { track } from './analytics.js';
import { metaTrack, metaLeadFields } from './meta-pixel.js';
import './bestil.js';
import { trades, flipWords, included, addons, addonPages, comparisons, team, balls, ballInfo, faqs, palette, bandPalette } from './content.js';

const motion = document.documentElement.classList.contains('motion');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - t, 3);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const state = { addons: [] };

// Analytics (assets/js/analytics.js → /api/collect → GA4)
document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-event]'); if (el) track('cta_click', { button: el.dataset.event }); });

/* ------------------------------------------------------------------ */
/* Render lists                                                         */
/* ------------------------------------------------------------------ */

// Manifest: one span per word, last N words in the accent colour
{
  const p = $('[data-split]');
  const words = p.textContent.trim().split(/\s+/);
  const hot = +p.dataset.accentLast || 0;
  p.innerHTML = words.map((w, i) => `<span data-mw${i >= words.length - hot ? ' class="hot"' : ''}>${esc(w)}</span>`).join(' ');
}

// Trades marquee (two copies so the loop is seamless)
{
  const items = [...trades, ...trades].map(t => `<div class="track__item">${esc(t)}<i></i></div>`).join('');
  $('[data-track]').innerHTML = items;
  $('[data-track2]').innerHTML = items;
}

// Included list
$('[data-incl]').innerHTML = included.map(([t, d]) => `
  <button type="button" class="incl__item" data-modal="inc-${esc(t)}">
    <span class="check" aria-hidden="true">✓</span>
    <span class="incl__txt"><b>${esc(t)}</b><span>${esc(d)}</span></span>
    <span class="incl__plus" aria-hidden="true">+</span>
  </button>`).join('');

// Add-on cards
$('[data-htrack]').innerHTML = addons.map((a, i) => `
  <div class="addon-slot">
    <div class="addon" data-tilt data-addon="${esc(a.t)}">
      <div class="glare" data-glare></div>
      <span class="addon__n">0${i + 1}</span>
      <div class="addon__head"><h3>${esc(a.t)}</h3><p>${esc(a.d)}</p></div>
      <div class="addon__price">${esc(a.price)}</div>
      <ul>${a.ex.map(x => `<li><span class="check" aria-hidden="true">✓</span>${esc(x)}</li>`).join('')}</ul>
      <div class="addon__actions">
        <button type="button" class="addon__toggle" data-toggle="${esc(a.t)}" data-burst aria-pressed="false">+ Tilføj</button>
        <button type="button" class="addon__more" data-modal="addon-${a.id}">Læs mere →</button>
      </div>
    </div>
  </div>`).join('');

// Review badges: only shown when a real score is filled in (data-rating, data-reviews, href)
$$('[data-review]').forEach(el => {
  const r = parseFloat(String(el.dataset.rating).replace(',', '.'));
  if (!(r > 0 && r <= 5)) return;
  const n = +el.dataset.reviews || 0;
  // No profile link yet: show the badge, but not as a link
  if (!el.getAttribute('href')) ['href', 'target', 'rel'].forEach(a => el.removeAttribute(a));
  $('[data-score]', el).textContent = r.toLocaleString('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  $('[data-num]', el).textContent = n.toLocaleString('da-DK');
  $('[data-stars]', el).innerHTML = [0, 1, 2, 3, 4].map(i => `<i style="--f:${Math.round(Math.max(0, Math.min(1, r - i)) * 100)}%"></i>`).join('');
  el.setAttribute('aria-label', `${r.toLocaleString('da-DK')} ud af 5 stjerner, ${n} anmeldelser`);
  el.hidden = false;
  el.closest('[data-trust]').hidden = false;
  // Same badge floating in the hero on desktop
  const fl = $(`[data-float-review="${el.classList.contains('trust__item--google') ? 'google' : 'tp'}"]`);
  if (fl) { fl.append(el.cloneNode(true)); fl.hidden = false; }
  // Same badge under the logo on the intro curtain (not a link there; a click lifts the curtain)
  const lt = $('[data-loader-trust]');
  if (lt) {
    const c = el.cloneNode(true);
    ['href', 'target', 'rel', 'data-event'].forEach(a => c.removeAttribute(a));
    lt.append(c); lt.hidden = false;
  }
});

// FAQ (first one open, as in the design)
$('[data-faq]').innerHTML = faqs.map(([q, a], i) => `
  <div class="faq__item${i === 0 ? ' is-open' : ''}" data-reveal="${i}">
    <button type="button" class="faq__q" aria-expanded="${i === 0}" aria-controls="faq-${i}">${esc(q)}<span class="faq__icon" aria-hidden="true">+</span></button>
    <div class="faq__a" id="faq-${i}"><div><p>${esc(a)}</p></div></div>
  </div>`).join('');

$('[data-faq]').addEventListener('click', e => {
  const btn = e.target.closest('.faq__q'); if (!btn) return;
  const item = btn.parentElement, wasOpen = item.classList.contains('is-open');
  $$('.faq__item').forEach(it => { it.classList.remove('is-open'); $('.faq__q', it).setAttribute('aria-expanded', 'false'); });
  if (!wasOpen) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
});

// Odometer price
const odo = $('[data-odo]');
if (motion) {
  const text = odo.textContent.trim();
  odo.setAttribute('aria-label', text);
  odo.innerHTML = text.split('').map((d, i) => /\d/.test(d)
    ? `<span class="odo__win" aria-hidden="true"><span class="odo__col" data-odo-col data-d="${d}" style="transition-delay:${(i * 0.12).toFixed(2)}s">${Array.from({ length: 30 }, (_, k) => `<span>${k % 10}</span>`).join('')}</span></span>`
    : `<span aria-hidden="true">${d}</span>`).join('');
}

/* ------------------------------------------------------------------ */
/* Add-ons + contact form                                               */
/* ------------------------------------------------------------------ */

const form = $('[data-form]'), thanks = $('[data-thanks]');
const syncAddons = () => {
  $$('[data-addon]').forEach(card => {
    const on = state.addons.includes(card.dataset.addon);
    card.classList.toggle('is-added', on);
    const b = $('[data-toggle]', card);
    b.textContent = on ? '✓ Tilføjet' : '+ Tilføj';
    b.setAttribute('aria-pressed', String(on));
  });
  const chosen = ['Hjemmeside', ...state.addons].join(' + ');
  $('[data-chosen]').hidden = state.addons.length === 0;
  $('[data-chosen-val]').textContent = chosen;
  $('[data-chosen-input]').value = chosen;
  // Changing the selection re-opens the form, like the design
  form.hidden = false; thanks.hidden = true;
};
const toggleAddon = t => { const on = !state.addons.includes(t); state.addons = on ? [...state.addons, t] : state.addons.filter(x => x !== t); syncAddons(); track(on ? 'addon_add' : 'addon_remove', { addon: t }); };
document.addEventListener('click', e => { const b = e.target.closest('[data-toggle]'); if (b) toggleAddon(b.dataset.toggle); });
syncAddons();

form.addEventListener('submit', async e => {
  e.preventDefault();
  const err = $('[data-form-error]');
  err.hidden = true;
  if (!form.reportValidity()) return;
  const btn = $('.form__submit', form);
  btn.disabled = true;
  try {
    // For Meta: the start price of what was chosen (monthly add-ons count one month), and an
    // event id shared with /api/contact, which sends the same Lead with the e-mail hashed
    const chosen = $('[data-chosen-input]').value || 'Hjemmeside';
    const value = 3000 + state.addons.reduce((sum, t) => sum + (+String(addons.find(a => a.t === t)?.price || '').replace(/\D/g, '') || 0), 0);
    const meta = metaLeadFields();
    const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), ...meta, meta_value: value }) });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    track('generate_lead', { selected: chosen });
    metaTrack('Lead', { content_name: chosen, value, currency: 'DKK' }, { id: meta.meta_event_id, mirror: false });
    form.reset(); syncAddons();
    form.hidden = true; thanks.hidden = false;
  } catch (x) {
    track('form_error');
    err.innerHTML = 'Beskeden kunne ikke sendes. Skriv til <a href="mailto:hej@webleads.dk" style="color:#fff;text-decoration:underline">hej@webleads.dk</a>.';
    err.hidden = false;
  } finally { btn.disabled = false; }
});

/* ------------------------------------------------------------------ */
/* Pop-ups                                                              */
/* ------------------------------------------------------------------ */

const L = arr => arr.map(x => Array.isArray(x) ? { t: x[0], d: x[1] } : { t: x, d: '' });

function modalData(key) {
  const base = { w: 760, band: true, ph: false, stat: null, price: null, list: [], steps: [], sec: 'Luk', secondary: 'close', cta: 'Kontakt os', primary: 'contact', pBg: '#e0552b', color: '#111', fg: '#fff', glyph: '', kicker: '', title: '', lead: '' };
  const i = key.indexOf('-'), type = i < 0 ? key : key.slice(0, i), id = i < 0 ? '' : key.slice(i + 1);
  if (type === 'cmp') {
    const C = comparisons[+id]; if (!C) return null;
    return { ...base, kicker: 'Før og efter', title: C.t, lead: C.lead, stat: { b: C.b, a: C.a }, glyph: C.a, color: '#2f9e5b', list: L(C.l), cta: 'Få en hjemmeside som den' };
  }
  if (type === 'inc') {
    const x = included.find(r => r[0] === id); if (!x) return null;
    return { ...base, kicker: 'Med i prisen', title: id, lead: x[1], glyph: '✓', color: '#111', list: L(x[2]), cta: 'Kom i gang' };
  }
  if (type === 'addon') {
    const idx = addons.findIndex(a => a.id === id), A = addons[idx], t = addonPages[id]; if (!A || !t) return null;
    const on = state.addons.includes(A.t);
    return { ...base, w: 900, kicker: 'Tilvalg · ' + t.label, title: t.h1, lead: t.intro, glyph: '0' + (idx + 1), color: A.band[0], fg: A.band[1], price: { p: t.price, n: t.priceNote }, list: L(t.items), steps: t.steps.map(([tt, d], k) => ({ n: String(k + 1), t: tt, d })), cta: on ? '✓ Tilføjet til din pakke' : '+ Tilføj til min pakke', primary: 'toggle:' + A.t, pBg: on ? '#2f9e5b' : '#e0552b', sec: 'Kontakt os', secondary: 'contact' };
  }
  if (type === 'ball') {
    const x = ballInfo[id]; if (!x) return null;
    const c = bandPalette[Math.max(0, balls.indexOf(id)) % bandPalette.length], rel = x[1];
    return { ...base, kicker: 'Alt under ét tag', title: id, lead: x[0], glyph: id, color: c[0], fg: c[1], sec: rel ? (rel === 'pris' ? 'Se prisen' : 'Læs mere') : null, secondary: rel === 'pris' ? 'pris' : 'open:' + rel };
  }
  if (type === 'team') {
    const T = team[+id]; if (!T) return null;
    return { ...base, band: false, ph: true, glyph: T.g, kicker: T.a, title: T.n, lead: T.lead, list: L(T.l), cta: 'Book et møde med ' + T.n };
  }
  return null;
}

const mRoot = $('[data-modal-root]'), mBox = $('[data-modal-box]'), mScroll = $('[data-modal-scroll]');
let mKey = null, mReturn = null;

function renderModal(keepScroll) {
  const m = modalData(mKey); if (!m) return closeModal();
  const top = keepScroll ? mScroll.scrollTop : 0;
  mBox.style.maxWidth = m.w + 'px';
  mScroll.innerHTML = `
    ${m.band ? `<div class="m-band" style="background:${m.color};color:${m.fg}"><span class="m-band__glyph" aria-hidden="true">${esc(m.glyph)}</span><span class="m-band__kicker">${esc(m.kicker)}</span></div>` : ''}
    ${m.ph ? `<div class="m-ph"><div class="ph"><span class="ph__glyph">${esc(m.glyph)}</span><span class="ph__tag">Kommer snart</span></div></div>` : ''}
    <div class="m-body">
      ${m.band ? '' : `<span class="m-kicker">${esc(m.kicker)}</span>`}
      <h2 class="m-title" id="m-title">${esc(m.title)}</h2>
      <p class="m-lead">${esc(m.lead)}</p>
      ${m.stat ? `<div class="m-stat"><div class="m-stat__col"><span class="m-stat__lbl">Typisk før</span><span class="m-stat__b">${esc(m.stat.b)}</span></div><span class="m-stat__arrow" aria-hidden="true">→</span><div class="m-stat__col"><span class="m-stat__lbl">Med Webleads</span><span class="m-stat__a">${esc(m.stat.a)}</span></div></div>` : ''}
      ${m.price ? `<div class="m-price"><b>${esc(m.price.p)}</b><span>${esc(m.price.n)}</span></div>` : ''}
      ${m.list.length ? `<div class="m-list">${m.list.map(it => `<div class="m-list__item"><span class="check" aria-hidden="true">✓</span><div class="m-list__txt"><b>${esc(it.t)}</b>${it.d ? `<span>${esc(it.d)}</span>` : ''}</div></div>`).join('')}</div>` : ''}
      ${m.steps.length ? `<div class="m-steps"><span class="m-steps__lbl">Sådan foregår det</span><div class="m-steps__grid">${m.steps.map(st => `<div class="m-step"><span class="m-step__n">${st.n}</span><b>${esc(st.t)}</b><span>${esc(st.d)}</span></div>`).join('')}</div></div>` : ''}
      <div class="m-actions">
        <button type="button" class="m-primary" data-act="${esc(m.primary)}" data-burst style="background:${m.pBg}">${esc(m.cta)}</button>
        ${m.sec ? `<button type="button" class="m-secondary" data-act="${esc(m.secondary)}">${esc(m.sec)}</button>` : ''}
      </div>
    </div>`;
  mScroll.scrollTop = top;
}

function openModal(key) {
  if (!modalData(key)) return;
  if (!mKey) mReturn = document.activeElement;
  track('popup_open', { popup: key });
  mKey = key;
  document.documentElement.style.overflow = 'hidden';
  mRoot.hidden = false;
  renderModal(false);
  $('[data-modal-close]').focus({ preventScroll: true });
}

function closeModal() {
  mKey = null;
  mRoot.hidden = true;
  document.documentElement.style.overflow = '';
  if (mReturn && mReturn.focus) mReturn.focus({ preventScroll: true });
}

function scrollToId(id) {
  const k = document.getElementById(id);
  if (k) setTimeout(() => window.scrollTo({ top: k.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }), 40);
}

function act(a) {
  if (!a || a === 'close') return closeModal();
  if (a === 'contact' || a === 'pris') { closeModal(); return scrollToId(a === 'pris' ? 'pris' : 'kontakt'); }
  if (a.startsWith('toggle:')) { toggleAddon(a.slice(7)); return renderModal(true); }
  if (a.startsWith('open:')) openModal(a.slice(5));
}

document.addEventListener('click', e => {
  const el = e.target.closest && e.target.closest('[data-modal]');
  if (el && !el.closest('[data-modal-root]')) { e.preventDefault(); openModal(el.dataset.modal); }
});
mRoot.addEventListener('click', e => {
  if (e.target === mRoot) return closeModal();
  if (e.target.closest('[data-modal-close]')) return closeModal();
  const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act);
});
document.addEventListener('keydown', e => {
  if (!mKey) return;
  if (e.key === 'Escape') return closeModal();
  if (e.key === 'Tab') { // keep focus inside the pop-up
    const f = $$('button, a[href], input, textarea', mBox).filter(x => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ------------------------------------------------------------------ */
/* Layout helpers that run regardless of motion                         */
/* ------------------------------------------------------------------ */

// Scale the "Sådan virker det" block down on short screens so nothing is cut off
const fitEl = $('[data-fit]');
const fitNow = () => { fitEl.style.transform = ''; const s = Math.min(1, innerHeight / fitEl.scrollHeight); fitEl.style.transform = s < 1 ? `scale(${s})` : ''; };
fitNow();
addEventListener('resize', fitNow); addEventListener('load', fitNow);
new ResizeObserver(fitNow).observe(fitEl);
if (document.fonts) document.fonts.ready.then(fitNow);

// The demo renders at 1280px (390px on phones) and is scaled into the browser frame
const isPhone = () => innerWidth < 700;
const shot = $('[data-shot]'), demo = $('[data-demo]');
let lastW = 0;
const sizeFrame = force => { if (!shot.clientWidth) return; if (!force && shot.clientWidth === lastW) return; lastW = shot.clientWidth; const base = isPhone() ? 390 : 1280; demo.style.width = base + 'px'; const s = shot.clientWidth / base; demo.style.height = (shot.clientHeight / s) + 'px'; demo.style.transform = `scale(${s})`; };
sizeFrame(true);
addEventListener('resize', () => sizeFrame(true));
new ResizeObserver(() => sizeFrame(false)).observe(shot);

// Nav background, progress bar and to-top button
const nav = $('[data-nav]'), bar = $('[data-bar]'), totop = $('[data-totop]'), totopRing = $('[data-totop-ring]');
const onScroll = () => {
  const sy = scrollY, vh = innerHeight, dh = document.documentElement.scrollHeight - vh, k = dh > 0 ? sy / dh : 0;
  nav.classList.toggle('is-scrolled', sy > 30);
  bar.style.transform = `scaleX(${k})`;
  const show = sy > vh * 0.9;
  totop.style.opacity = show ? 1 : 0; totop.style.transform = show ? 'scale(1)' : 'scale(0.6)'; totop.style.pointerEvents = show ? 'auto' : 'none';
  totopRing.style.strokeDashoffset = 169.6 * (1 - k);
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Contact button: phones get a pre-filled text message, everything else a pre-filled e-mail
{
  const ping = $('[data-ping]');
  if (ping) {
    const { phone, email, msg } = ping.dataset;
    // A touch screen whose short side is phone-sized (tablets get the e-mail button)
    const sms = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 700;
    if (sms) {
      // iOS reads the body after "&", Android after "?"
      const sep = /iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?';
      ping.href = `sms:${phone}${sep}body=${encodeURIComponent(msg)}`;
      ping.classList.add('is-sms');
      $('[data-ping-label]', ping).textContent = 'Sms os';
      ping.setAttribute('aria-label', 'Send os en sms');
      ping.dataset.event = 'Flydende knap: SMS';
    } else {
      ping.href = `mailto:${email}?subject=${encodeURIComponent('Møde om hjemmeside')}&body=${encodeURIComponent(msg)}`;
      $('[data-ping-label]', ping).textContent = 'Skriv til os';
      ping.setAttribute('aria-label', 'Send os en e-mail');
      ping.dataset.event = 'Flydende knap: Mail';
    }
    setTimeout(() => ping.classList.add('is-in'), 1800);
  }
}

// Before/after slider
const ba = $('[data-ba]'), baNew = $('[data-ba-new]'), baH = $('[data-ba-h]'), baKnob = $('[data-ba-knob]');
const baOld = $$('[data-ba-old]'), baNewV = $$('[data-ba-newv]'), baGo = $$('[data-ba-go]');
let baPos = 50, baTouched = false, baTarget = null;
const baSet = v => {
  baPos = clamp(v, 0, 100);
  baNew.style.clipPath = `inset(0 0 0 ${baPos}%)`; baH.style.left = baPos + '%';
  const pn = 1 - baPos / 100;
  baNewV.forEach(e => { e.style.opacity = 0.35 + 0.65 * pn; e.style.transform = `scale(${0.92 + 0.12 * pn})`; });
  baOld.forEach(e => { e.style.opacity = 0.35 + 0.65 * (1 - pn); });
  baGo.forEach(b => b.classList.toggle('is-on', Math.abs(+b.dataset.baGo - baPos) < 8));
};
baGo.forEach(b => b.addEventListener('click', () => { baTouched = true; if (motion) baTarget = +b.dataset.baGo; else baSet(+b.dataset.baGo); }));
{
  let drag = false;
  const fromEv = e => { const r = ba.getBoundingClientRect(); baSet((e.clientX - r.left) / r.width * 100); };
  ba.addEventListener('pointerdown', e => { drag = true; baTouched = true; baTarget = null; baKnob.classList.add('is-drag'); try { ba.setPointerCapture(e.pointerId); } catch (x) {} fromEv(e); });
  ba.addEventListener('pointermove', e => { if (drag || (motion && e.pointerType === 'mouse')) { baTouched = true; baTarget = null; fromEv(e); } });
  const up = () => { drag = false; baKnob.classList.remove('is-drag'); };
  ba.addEventListener('pointerup', up); ba.addEventListener('pointercancel', up);
}
baSet(50);

const pit = $('[data-pit]');

/* ------------------------------------------------------------------ */
/* Reduced motion: everything is shown, nothing animates                 */
/* ------------------------------------------------------------------ */

if (!motion) {
  $('[data-url]').textContent = $('[data-url]').dataset.full;
  const st = $('[data-status]'); st.textContent = '● Live'; st.classList.add('is-live');
  pit.classList.add('pit--static');
  pit.innerHTML = balls.map((lab, i) => { const [bg, fg] = palette[i % palette.length]; return `<button type="button" class="ball" data-modal="ball-${esc(lab)}" style="width:120px;height:120px;font-size:16px;background:${bg};color:${fg};border:${bg === '#fff' ? '1.5px solid #111' : 'none'}">${esc(lab)}</button>`; }).join('');
  $('[data-shake]').hidden = true;
} else {
  runEffects();
}

/* ------------------------------------------------------------------ */
/* Effects                                                              */
/* ------------------------------------------------------------------ */

function runEffects() {
  // Intro curtain
  {
    const Ld = $('[data-loader]'), lc = $('[data-lc]'), t0 = performance.now();
    requestAnimationFrame(() => requestAnimationFrame(() => $$('.loader__word span', Ld).forEach(s => s.style.transform = 'none')));
    const lift = () => { Ld.style.clipPath = 'inset(0 0 100% 0)'; setTimeout(() => Ld.remove(), 1100); };
    const lt = n => { const k = Math.min(1, (n - t0) / 1100); lc.textContent = String(Math.round(ease(k) * 100)).padStart(3, '0'); if (k < 1) requestAnimationFrame(lt); else setTimeout(lift, 150); };
    requestAnimationFrame(lt);
    Ld.addEventListener('click', lift);
  }

  // Film grain
  const grain = document.createElement('div');
  {
    const nc = document.createElement('canvas'); nc.width = nc.height = 140; const nx = nc.getContext('2d'); const id = nx.createImageData(140, 140);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    nx.putImageData(id, 0, 0);
    grain.className = 'grain'; grain.style.backgroundImage = `url(${nc.toDataURL()})`;
    document.body.appendChild(grain);
  }

  // Headline words slide up
  $$('[data-word]').forEach((w, i) => {
    requestAnimationFrame(() => requestAnimationFrame(() => { w.style.transition = `transform 1.1s cubic-bezier(.2,.9,.2,1) ${1.55 + i * 0.09}s`; w.classList.add('is-up'); }));
  });

  // Reveal on scroll, count-up and odometer
  const countUp = el => {
    const n = el.firstChild; if (!n || n.nodeType !== 3) return;
    const final = n.nodeValue, target = parseInt(final.replace(/\D/g, ''), 10); if (!target) return;
    const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1600); n.nodeValue = k < 1 ? Math.round(target * ease(k)).toLocaleString('da-DK') : final; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; io.unobserve(el);
    if (el.hasAttribute('data-count')) return el.closest('[data-hero]') ? setTimeout(() => countUp(el), 1600) : countUp(el);
    if (el.hasAttribute('data-odo')) return $$('[data-odo-col]', el).forEach(c => { c.style.transform = `translateY(-${+c.dataset.d + 20}em)`; });
    el.classList.add('is-in');
  }), { threshold: 0.15 });
  $$('[data-reveal]').forEach(el => {
    const d = (+el.dataset.reveal || 0) * 0.1 + (el.closest('[data-hero]') ? 1.5 : 0);
    el.style.transition = `opacity 1s ease ${d}s, transform 1.1s cubic-bezier(.2,.8,.2,1) ${d}s`;
    io.observe(el);
  });
  $$('[data-count]').forEach(el => io.observe(el)); io.observe(odo);

  // 3D tilt with glare
  $$('[data-tilt]').forEach(card => {
    const glare = $('[data-glare]', card);
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.transition = 'transform .15s ease-out, box-shadow .5s';
      card.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateY(-6px)`;
      card.style.boxShadow = '0 40px 70px -30px rgba(17,17,17,0.35)';
      if (glare) { glare.style.opacity = 1; glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.28), rgba(255,255,255,0) 55%)`; }
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .7s cubic-bezier(.2,.8,.2,1), box-shadow .7s';
      card.style.transform = ''; card.style.boxShadow = '';
      if (glare) glare.style.opacity = 0;
    });
  });

  // Magnetic buttons
  let mx = innerWidth / 2, my = innerHeight / 3, ox = mx, oy = my;
  const magnets = $$('[data-magnet]');
  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    magnets.forEach(m => {
      const r = m.getBoundingClientRect(), dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < Math.max(r.width, r.height) * 0.9;
      m.style.transition = 'transform .4s cubic-bezier(.2,.8,.2,1)';
      m.style.transform = near ? `translate(${dx * 0.3}px,${dy * 0.35}px)` : '';
    });
  }, { passive: true });

  // Confetti
  const burst = (x, y) => {
    const cols = ['#e0552b', '#111', '#f2c14e', '#2f9e5b', '#f6b8a2'], ps = [];
    for (let i = 0; i < 28; i++) {
      const d = document.createElement('div'), s = 6 + Math.random() * 7;
      d.style.cssText = `position:fixed;left:0;top:0;width:${s}px;height:${Math.random() < .5 ? s : s * 0.45}px;background:${cols[i % cols.length]};border-radius:${Math.random() < .4 ? '50%' : '2px'};pointer-events:none;z-index:10000`;
      document.body.appendChild(d);
      const an = Math.random() * Math.PI * 2, v = 4 + Math.random() * 8;
      ps.push({ d, x, y, vx: Math.cos(an) * v, vy: Math.sin(an) * v - 5, r: Math.random() * 360, vr: (Math.random() - .5) * 24, life: 0 });
    }
    const step = () => {
      let alive = false;
      ps.forEach(p => { if (!p.d.isConnected) return; p.life++; p.vy += 0.35; p.vx *= 0.98; p.x += p.vx; p.y += p.vy; p.r += p.vr; const o = Math.max(0, 1 - p.life / 70); p.d.style.transform = `translate(${p.x}px,${p.y}px) rotate(${p.r}deg)`; p.d.style.opacity = o; if (o > 0) alive = true; else p.d.remove(); });
      if (alive) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  document.addEventListener('click', e => { const el = e.target.closest && e.target.closest('[data-burst]'); if (el) burst(e.clientX, e.clientY); });

  // Spotlight on dark boxes
  $$('[data-spot]').forEach(el => el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--x', (e.clientX - r.left) + 'px'); el.style.setProperty('--y', (e.clientY - r.top) + 'px'); }));

  // Rolling hover text on nav and hero CTA
  $$('[data-roll]').forEach(el => {
    if (el.children.length) return;
    const txt = el.textContent.trim();
    el.innerHTML = `<span class="roll"><span class="roll__in"><span>${esc(txt)}</span><span aria-hidden="true">${esc(txt)}</span></span></span>`;
    const inner = $('.roll__in', el);
    el.addEventListener('mouseenter', () => inner.style.transform = 'translateY(-50%)');
    el.addEventListener('mouseleave', () => inner.style.transform = '');
  });

  // Scramble "servicefag."
  const scEl = $('[data-scramble]');
  let scrRun = false;
  const scramble = () => {
    if (scrRun) return; scrRun = true;
    const fin = scEl.dataset.text || scEl.textContent; scEl.dataset.text = fin;
    const chars = 'abcdefghijklmnopqrstuvwxyzæøå#%&'; let f = 0;
    const tick = () => { f++; scEl.textContent = fin.split('').map((c, i) => i < f / 2.2 || c === '.' ? c : chars[Math.floor(Math.random() * chars.length)]).join(''); if (f / 2.2 < fin.length) requestAnimationFrame(tick); else { scEl.textContent = fin; scrRun = false; } };
    tick();
  };
  setTimeout(scramble, 2300); scEl.addEventListener('mouseenter', scramble);

  // Rotating word in the badge
  {
    const flip = $('[data-flip]'); let fi = 0;
    setInterval(() => {
      flip.style.transition = 'transform .3s cubic-bezier(.7,0,.3,1),opacity .3s'; flip.style.transform = 'translateY(-70%)'; flip.style.opacity = 0;
      setTimeout(() => { fi = (fi + 1) % flipWords.length; flip.textContent = flipWords[fi]; flip.style.transition = 'none'; flip.style.transform = 'translateY(70%)'; void flip.offsetHeight; flip.style.transition = 'transform .35s cubic-bezier(.2,.9,.3,1),opacity .35s'; flip.style.transform = ''; flip.style.opacity = 1; }, 300);
    }, 2200);
  }

  // Hand-drawn underline under "3.000 kr."
  {
    const wd = $('[data-hero] [data-count]').closest('[data-word]');
    wd.style.position = 'relative';
    const NS = 'http://www.w3.org/2000/svg', sv = document.createElementNS(NS, 'svg');
    sv.setAttribute('viewBox', '0 0 300 30'); sv.setAttribute('preserveAspectRatio', 'none'); sv.setAttribute('aria-hidden', 'true');
    sv.style.cssText = 'position:absolute;left:-2%;width:104%;bottom:-0.02em;height:0.16em;overflow:visible;pointer-events:none';
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', 'M4 20 C 60 6, 120 4, 170 12 S 260 26, 296 8');
    p.style.cssText = 'fill:none;stroke:#111;stroke-width:7;stroke-linecap:round';
    sv.appendChild(p); wd.appendChild(sv);
    const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
    setTimeout(() => { p.style.transition = 'stroke-dashoffset .9s cubic-bezier(.6,0,.2,1)'; p.style.strokeDashoffset = 0; }, 2900);
  }

  // Trade cards that pop up in the mouse's trail over the marquee
  {
    const sec = $('[data-trades]'); let tlx = null, tly = null, ti = 0;
    sec.addEventListener('mousemove', e => {
      if (tlx === null) { tlx = e.clientX; tly = e.clientY; return; }
      if (Math.hypot(e.clientX - tlx, e.clientY - tly) < 80) return;
      tlx = e.clientX; tly = e.clientY;
      const [bg, fg] = palette[ti % palette.length], rot = (Math.random() - .5) * 24;
      const d = document.createElement('div'); d.className = 'trail'; d.textContent = trades[ti % trades.length]; ti++;
      d.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;background:${bg};color:${fg};border:${bg === '#fff' ? '1.5px solid #111' : 'none'};transform:translate(-50%,-50%) rotate(${rot}deg) scale(0.3)`;
      document.body.appendChild(d);
      requestAnimationFrame(() => { d.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(1)`; d.style.opacity = 1; });
      setTimeout(() => { d.style.transition = 'transform .6s ease-in,opacity .6s'; d.style.transform = `translate(-50%,-10%) rotate(${rot * 1.5}deg) scale(0.6)`; d.style.opacity = 0; setTimeout(() => d.remove(), 650); }, 650);
    });
  }

  // Ball pit
  const pitBalls = []; let pitOn = false, grab = null, pmx = -999, pmy = -999, pIn = false;
  const initPit = () => {
    const W = pit.clientWidth, narrow = W < 600, s = narrow ? clamp(W / 800, 0.6, 1) : clamp(W / 1150, 0.7, 1);
    (narrow ? balls.slice(0, 12) : balls).forEach((lab, i) => {
      const r = (46 + ((i * 37) % 34)) * s * (lab.length > 9 ? 1.12 : 1), [bg, fg] = palette[i % palette.length];
      const el = document.createElement('div'); el.className = 'ball'; el.textContent = lab;
      el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', lab + ' – læs mere');
      el.style.cssText = `width:${2 * r}px;height:${2 * r}px;background:${bg};color:${fg};border:${bg === '#fff' ? '1.5px solid #111' : 'none'};font-size:${Math.max(11, r * 0.27)}px`;
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal('ball-' + lab); } });
      pit.appendChild(el);
      pitBalls.push({ el, r, x: r + Math.random() * (W - 2 * r), y: -r - i * 60 * s - Math.random() * 80, vx: (Math.random() - .5) * 4, vy: 0 });
    });
  };
  const pitStep = () => {
    const W = pit.clientWidth, H = pit.clientHeight;
    for (const b of pitBalls) {
      if (b === grab) { b.vx = (pmx - b.x) * 0.35; b.vy = (pmy - b.y) * 0.35; b.x += b.vx; b.y += b.vy; continue; }
      b.vy += 0.55; b.vx *= 0.995; b.vy *= 0.995;
      if (pIn && !grab) { const dx = b.x - pmx, dy = b.y - pmy, d = Math.hypot(dx, dy) || 1; if (d < b.r + 40) { const f = (b.r + 40 - d) * 0.04; b.vx += dx / d * f; b.vy += dy / d * f; } }
      b.x += b.vx; b.y += b.vy;
      if (b.x < b.r) { b.x = b.r; b.vx = -b.vx * 0.5; }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx = -b.vx * 0.5; }
      if (b.y > H - b.r) { b.y = H - b.r; b.vy = -b.vy * 0.35; b.vx *= 0.96; }
    }
    for (let it = 0; it < 4; it++) for (let i = 0; i < pitBalls.length; i++) for (let j = i + 1; j < pitBalls.length; j++) {
      const a = pitBalls[i], c = pitBalls[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 0.01, m = a.r + c.r;
      if (d < m) {
        const nx = dx / d, ny = dy / d, o = m - d;
        const wa = a === grab ? 0 : c === grab ? 1 : 0.5, wc = c === grab ? 0 : a === grab ? 1 : 0.5;
        a.x -= nx * o * wa; a.y -= ny * o * wa; c.x += nx * o * wc; c.y += ny * o * wc;
        const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
        if (rv < 0) { const imp = -1.3 * rv / 2; if (a !== grab) { a.vx -= imp * nx; a.vy -= imp * ny; } if (c !== grab) { c.vx += imp * nx; c.vy += imp * ny; } }
      }
    }
    for (const b of pitBalls) { if (b !== grab && b.y > H - b.r) b.y = H - b.r; b.el.style.transform = `translate(${b.x - b.r}px,${b.y - b.r}px) rotate(${(b.x / b.r) * 20}deg)`; }
  };
  {
    const loc = e => { const r = pit.getBoundingClientRect(); pmx = e.clientX - r.left; pmy = e.clientY - r.top; };
    pit.addEventListener('pointerdown', e => {
      loc(e);
      const hit = pitBalls.slice().reverse().find(b => Math.hypot(b.x - pmx, b.y - pmy) < b.r);
      if (hit) { grab = hit; hit.sx = pmx; hit.sy = pmy; hit.t0 = performance.now(); hit.mv = 0; hit.el.style.zIndex = 2; pit.style.cursor = 'grabbing'; try { pit.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); }
    });
    pit.addEventListener('pointermove', e => { loc(e); pIn = true; if (grab) grab.mv = Math.max(grab.mv || 0, Math.hypot(pmx - grab.sx, pmy - grab.sy)); });
    const rel = () => {
      if (grab) {
        const clk = (grab.mv || 0) < 6 && performance.now() - grab.t0 < 400, lab = grab.el.textContent;
        if (clk) setTimeout(() => openModal('ball-' + lab), 0);
        grab.vx = clamp(grab.vx, -30, 30); grab.vy = clamp(grab.vy, -30, 30); grab.el.style.zIndex = ''; grab = null;
      }
      pit.style.cursor = 'grab';
    };
    pit.addEventListener('pointerup', rel); pit.addEventListener('pointercancel', rel);
    pit.addEventListener('pointerleave', () => { pIn = false; if (!grab) pmx = pmy = -999; });
    $('[data-shake]').addEventListener('click', () => pitBalls.forEach(b => { b.vy -= 10 + Math.random() * 10; b.vx += (Math.random() - .5) * 16; }));
  }

  // Dotted hero background
  const cv = $('[data-dots]'), cx = cv.getContext('2d'), dpr = Math.min(2, devicePixelRatio || 1);
  let cw = 0, ch = 0;
  const sizeCv = () => { cw = cv.clientWidth; ch = cv.clientHeight; cv.width = cw * dpr; cv.height = ch * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  sizeCv(); addEventListener('resize', sizeCv);

  // Demo build-up driven by scroll
  let needBuild = true, lastBuild = -1, lastStep = -1, live = null;
  demo.addEventListener('load', () => { needBuild = true; sizeFrame(true); setTimeout(() => { needBuild = true; }, 600); });

  // Cached elements for the frame loop
  const el = {
    orb: $('[data-orb]'), hero: $('[data-hero]'), h1: $('[data-hero] h1'), build: $('[data-build]'), steps: $$('[data-step]'),
    url: $('[data-url]'), caret: $('[data-caret]'), status: $('[data-status]'), track: $('[data-track]'), track2: $('[data-track2]'),
    floats: $$('[data-float]'), spin: $('[data-spin]'), mf: $('[data-manifest]'), mw: $$('[data-mw]'),
    hs: $('[data-hs]'), hw: $('[data-hwrap]'), ht: $('[data-htrack]'), hbar: $('[data-hbar]'), hnum: $('[data-hnum]'), cards: $$('[data-card]'),
    wm: $('[data-wm]'), wl: $$('[data-wl]')
  };
  let lastY = scrollY, vel = 0, mpos = 0, mpos2 = null, t = 0, spinA = 0;

  const loop = () => {
    t++;
    ox += (mx - ox) * 0.07; oy += (my - oy) * 0.07;
    el.orb.style.transform = `translate(${ox - 300}px,${oy - 300}px)`;
    const sy = scrollY, vh = innerHeight;
    vel += ((sy - lastY) - vel) * 0.12; lastY = sy;

    // Hero parallax + tilt
    const hp = clamp(sy / vh);
    el.hero.style.transform = `translateY(${hp * 140}px) scale(${1 - hp * 0.1})`;
    el.hero.style.opacity = 1 - hp * 1.1;
    if (sy < vh) el.h1.style.transform = `perspective(1000px) rotateX(${(oy / vh - 0.5) * -7}deg) rotateY(${(ox / innerWidth - 0.5) * 9}deg)`;

    // Sådan virker det
    sizeFrame(false);
    {
      const r = el.build.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh));
      if (Math.abs(p - lastBuild) > 0.0005 || needBuild) {
        try { if (demo.contentWindow && demo.contentWindow.__build) { demo.contentWindow.__build(p); lastBuild = p; needBuild = false; } } catch (x) {}
      }
      const active = p < 0.03 ? 0 : p < 0.9 ? 1 : 2;
      if (active !== lastStep) {
        lastStep = active;
        el.steps.forEach((s, i) => { s.classList.toggle('is-on', i === active); s.style.opacity = i === active ? 1 : 0.22; s.style.transform = i === active ? 'translateX(0)' : 'translateX(-8px)'; });
      }
      const full = el.url.dataset.full, uk = clamp((p - 0.9) / 0.07);
      el.url.textContent = full.slice(0, Math.round(full.length * uk));
      el.caret.style.opacity = (t >> 5) % 2 ? 1 : 0;
      const isLive = uk >= 1;
      if (isLive !== live) { live = isLive; el.status.textContent = isLive ? '● Live' : 'Kladde'; el.status.classList.toggle('is-live', isLive); }
    }

    // Marquees (speed and skew follow scroll velocity)
    {
      const half = el.track.scrollWidth / 2;
      mpos -= 0.8 + Math.abs(vel) * 0.5;
      if (half > 0 && mpos <= -half) mpos += half;
      el.track.style.transform = `translateX(${mpos}px) skewX(${clamp(-vel * 0.35, -14, 14)}deg)`;
      const half2 = el.track2.scrollWidth / 2;
      if (mpos2 === null && half2 > 0) mpos2 = -half2;
      if (mpos2 !== null) { mpos2 += 0.8 + Math.abs(vel) * 0.5; if (mpos2 >= 0) mpos2 -= half2; el.track2.style.transform = `translateX(${mpos2}px) skewX(${clamp(vel * 0.35, -14, 14)}deg)`; }
    }

    // Dots
    if (sy < vh * 1.1) {
      const g = 30;
      cx.clearRect(0, 0, cw, ch); cx.fillStyle = 'rgba(17,17,17,0.12)';
      for (let y = g / 2; y < ch; y += g) for (let x = g / 2; x < cw; x += g) {
        const wob = Math.sin(t * 0.03 + x * 0.02 + y * 0.015) * 1.6;
        cx.beginPath(); cx.arc(x, y + wob, 1.3, 0, 6.283); cx.fill();
      }
    }

    // Floating badges
    if (innerWidth >= 1000) el.floats.forEach(f => { const dp = +f.dataset.float, br = +(f.dataset.rot || 0); f.style.transform = `translate(${(ox - innerWidth / 2) * dp * 0.035}px,${(oy - innerHeight / 2) * dp * 0.035 - sy * dp * 0.3}px) rotate(${br + Math.sin(t * 0.02 + dp * 3) * 3}deg)`; });
    spinA += 0.25 + Math.abs(vel) * 0.35; el.spin.style.transform = `rotate(${spinA}deg)`;

    // Manifest words light up
    { const r = el.mf.getBoundingClientRect(); if (r.top < vh && r.bottom > 0) { const pm = clamp((vh * 0.85 - r.top) / (r.height * 0.85)), n = el.mw.length; el.mw.forEach((w, i) => { w.style.opacity = 0.14 + 0.86 * clamp(pm * n * 1.15 - i); }); } }

    // Horizontal add-on scroll
    {
      let ph;
      if (isPhone()) {
        // Phones swipe the cards natively; the meter follows the swipe
        if (el.hs.style.height) el.hs.style.height = '';
        const w = el.hw.scrollWidth - el.hw.clientWidth;
        ph = w > 0 ? clamp(el.hw.scrollLeft / w) : 0;
      } else {
        const dist = Math.max(0, el.ht.scrollWidth - innerWidth), want = Math.round(vh + dist);
        if (Math.abs(el.hs.offsetHeight - want) > 2) el.hs.style.height = want + 'px';
        const r = el.hs.getBoundingClientRect();
        ph = dist ? clamp(-r.top / dist) : 0;
        el.ht.style.transform = `translateX(${-dist * ph}px)`;
      }
      el.hbar.style.transform = `scaleX(${ph})`;
      el.hnum.textContent = '0' + Math.min(4, 1 + Math.floor(ph * 3.999));
    }

    // Before/after autoplay until touched
    {
      const r = ba.getBoundingClientRect(), vis = r.top < vh && r.bottom > 0;
      if (!baTouched && vis) baSet(50 + Math.sin(t * 0.016) * 38);
      else if (baTarget !== null) { baSet(baPos + (baTarget - baPos) * 0.12); if (Math.abs(baTarget - baPos) < 0.2) { baSet(baTarget); baTarget = null; } }
      grain.style.clipPath = vis ? `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${r.left}px ${r.top}px, ${r.right}px ${r.top}px, ${r.right}px ${r.bottom}px, ${r.left}px ${r.bottom}px, ${r.left}px ${r.top}px)` : 'none';
    }

    // Stacked promise cards shrink as the next one covers them
    {
      const rr = el.cards.map(c => c.getBoundingClientRect());
      if (rr[0].top < vh && rr[rr.length - 1].bottom > 0) el.cards.forEach((c, i) => { let s = 0; for (let j = i + 1; j < el.cards.length; j++) s += clamp(1 - (rr[j].top - rr[i].top) / (vh * 0.7)); c.style.transform = `scale(${1 - s * 0.045})`; c.style.filter = s > 0.01 ? `brightness(${1 - s * 0.12})` : ''; });
    }

    // Ball pit
    { const r = pit.getBoundingClientRect(); if (!pitOn && r.top < vh * 0.8 && r.bottom > 0) { pitOn = true; initPit(); } if (pitOn && r.bottom > -100 && r.top < vh + 100) pitStep(); }

    // Wordmark letters lift towards the mouse
    { const r = el.wm.getBoundingClientRect(); if (r.top < vh && r.bottom > 0) el.wl.forEach((l, i) => { const lr = l.getBoundingClientRect(); const d = Math.hypot(mx - (lr.left + lr.width / 2), my - (lr.top + lr.height / 2)); const f = Math.max(0, 1 - d / 320); l.style.transform = `translateY(${-f * 70 + Math.sin(t * 0.04 + i * 0.8) * 6}px) rotate(${f * (i % 2 ? 8 : -8)}deg) scale(${1 + f * 0.06})`; }); }

    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
