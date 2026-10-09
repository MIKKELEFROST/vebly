// First-party analytics. Events are batched and sent to our own /api/collect, which forwards
// them to GA4 with the Measurement Protocol. Nothing is stored in the browser: no cookies, no
// localStorage. The events listed in meta-pixel.js also go to Meta, but only after a yes there.
//
// Tracked here, on every page that loads this file (the full list is in README.md → Tracking):
//   page_view with page type and device context · every click, sorted into cta_click, nav_click,
//   outbound_click, contact_click and ui_click (udkast_click on customer drafts) · rage_click and
//   dead_click · scroll at 10/25/50/75/90/100 % · section_view and section_time · time_on_page
//   (active seconds) · user_engagement · tab_return · exit_intent · text_copy · forms with
//   data-form: which fields are used, never what is typed · js_error, resource_error · web_vitals.
// Other scripts add their own events with track(), or with a 'wl:track' DOM event.
//
// Debug: add ?wl_debug=1 to the address. Every event is then logged in the console and shows up
// in GA4 → Admin → DebugView.

import { fromAnalytics } from './meta-pixel.js';

const ENDPOINT = '/api/collect';
// Visitors who ask not to be tracked (Global Privacy Control or Do Not Track) send nothing
const optOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
const debug = /[?&]wl_debug=1\b/.test(location.search);
const framed = window.self !== window.top; // the draft preview inside "Bestil en hjemmeside"
const born = performance.now();
const since = () => Math.round((performance.now() - born) / 1000);
const mq = q => matchMedia(q).matches;
const clip = (v, n = 100) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const onHide = []; // run when the visitor leaves or switches tab, just before the last send

const PATHS = { '/': 'forside', '/bestil': 'bestil', '/privatliv': 'privatliv', '/referencer': 'referencer' };
export const pageType = document.documentElement.dataset.page
  || (document.querySelector('[data-draft]') ? (framed ? 'udkast_preview' : 'udkast') : PATHS[location.pathname.replace(/\/+$/, '') || '/'] || 'andet');
export const DESIGN_NAMES = { 1: 'klassisk', 4: 'mosaik', 5: 'minimal' };

/* -------- Sending -------- */

let queue = [];
let timer = null;
let leadSent = false;

// Engagement time: visible milliseconds since the last event (GA4 sums these)
let activeSince = document.visibilityState === 'visible' ? performance.now() : null;
let banked = 0;
const takeEngagement = () => {
  const now = performance.now();
  const ms = banked + (activeSince !== null ? now - activeSince : 0);
  banked = 0;
  if (activeSince !== null) activeSince = now;
  return Math.max(1, Math.round(ms));
};

const page = () => {
  const url = new URL(location.href);
  url.hash = '';
  // A draft's link carries the visitor's answers: they stay out of GA4
  if (url.searchParams.has('d')) url.searchParams.set('d', '-');
  return { location: url.href, title: document.title, referrer: document.referrer || '' };
};

function flush() {
  clearTimeout(timer); timer = null;
  if (optOut) { queue = []; return; }
  if (!queue.length) return;
  const body = JSON.stringify({
    page: page(),
    device: { screen: `${screen.width}x${screen.height}`, language: navigator.language || '' },
    events: queue.splice(0, 20)
  });
  const sent = navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
  if (!sent) fetch(ENDPOINT, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  if (queue.length) flush();
}

export function track(name, params = {}) {
  try {
    if (name === 'generate_lead') leadSent = true;
    fromAnalytics(name, params);
    const p = { ...params, page_type: pageType, engagement_time_msec: takeEngagement() };
    if (debug) { p.debug_mode = 1; console.info('[wl]', name, p); }
    queue.push({ name, params: p });
    if (!timer) timer = setTimeout(flush, 1500);
  } catch (x) { /* analytics must never break the page */ }
}
// For scripts that should not import this file: document.dispatchEvent(new CustomEvent('wl:track', { detail: { name, params } }))
document.addEventListener('wl:track', e => { if (e.detail && e.detail.name) track(e.detail.name, e.detail.params || {}); });

/* -------- What and where -------- */

// A short, readable name for an element (never the contents of a form field)
export function labelOf(el) {
  if (!el || !el.getAttribute) return '';
  return clip(el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.getAttribute('alt') || '', 60) || el.tagName.toLowerCase();
}

// The part of the page an element sits in: data-sec, else the section's id or label
export function sectionOf(el) {
  const s = el && el.closest && el.closest('[data-sec], section, header, nav, footer, .bx, .draft, .cc, [data-modal-root]');
  if (!s) return 'andet';
  if (s.dataset.sec) return s.dataset.sec;
  if (s.matches('.bx')) return 'bestil';
  if (s.matches('.draft')) return 'udkast-bjaelke';
  if (s.matches('.cc')) return 'cookie-boks';
  if (s.matches('[data-modal-root]')) return 'popup';
  if (s.id) return s.id;
  const by = s.getAttribute('aria-labelledby');
  if (by) return by.replace(/^h-/, '');
  if (s.tagName === 'HEADER' || s.tagName === 'NAV') return 'menu';
  if (s.tagName === 'FOOTER') return 'footer';
  return clip(s.getAttribute('aria-label') || String(s.className).split(' ')[0] || s.tagName.toLowerCase(), 40);
}

const typeOf = el => (el.tagName === 'A' ? 'link' : el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' ? 'knap' : el.tagName.toLowerCase());

/* -------- Page view -------- */

function draftContext() {
  const out = { draft_kind: location.pathname.startsWith('/mit-udkast') ? 'bestilt' : 'haandlavet' };
  const m = document.documentElement.className.match(/\bd(\d)\b/);
  out.design = DESIGN_NAMES[m ? m[1] : 1] || 'klassisk';
  out.draft_page = (location.pathname.match(/(ydelser|om-os|kontakt|priser|galleri|booking|faq|tilbud)(\.html)?$/) || [, 'forside'])[1];
  // The trade from the draft's link (the rest of the answers, like the name, stays out)
  try {
    const d = new URLSearchParams(location.search).get('d');
    const a = d && JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(d.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))));
    if (a && a.b) out.fag = clip(a.b, 30);
  } catch (x) { /* a hand-made draft or an odd link */ }
  return out;
}

{
  const q = new URLSearchParams(location.search);
  const utm = { source: q.get('utm_source'), medium: q.get('utm_medium'), campaign: q.get('utm_campaign'), term: q.get('utm_term'), content: q.get('utm_content') };
  Object.keys(utm).forEach(k => utm[k] == null && delete utm[k]);
  if (Object.keys(utm).length) track('campaign_details', utm);

  let consent = 'ikke-valgt';
  try { const c = localStorage.getItem('wl-meta-consent'); if (c) consent = c === 'granted' ? 'ja' : 'nej'; } catch (x) { /* blocked storage */ }
  const ctx = {
    viewport: `${innerWidth}x${innerHeight}`,
    orientation: innerWidth > innerHeight ? 'liggende' : 'staaende',
    input: mq('(pointer: coarse)') ? 'touch' : 'mus',
    color_scheme: mq('(prefers-color-scheme: dark)') ? 'moerk' : 'lys',
    reduced_motion: mq('(prefers-reduced-motion: reduce)') ? 'ja' : 'nej',
    connection: (navigator.connection && navigator.connection.effectiveType) || 'ukendt',
    ad_click: q.has('gclid') || q.has('gbraid') || q.has('wbraid') ? 'google' : q.has('fbclid') ? 'meta' : 'nej',
    entry_hash: location.hash ? clip(location.hash, 40) : 'ingen',
    meta_consent: consent
  };
  if (pageType.startsWith('udkast')) Object.assign(ctx, draftContext());
  // The preview inside "Bestil en hjemmeside" is not a page view of its own
  track(framed ? 'preview_view' : 'page_view', ctx);
  if (pageType === '404') track('page_not_found', { link_url: clip(location.pathname, 100) });
}

/* -------- Clicks -------- */

const INTERACTIVE = 'a[href], button, [role="button"], summary, [data-event], [data-modal], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"]';
const FIELDS = 'input, textarea, select, option, label';
// Where clicking outside a button is part of the design: dragging, the intro, a pop-up's backdrop
const PLAY = '[data-pit], [data-ba], [data-loader], [data-modal-root], canvas, iframe, .cc, .bx';

function clickEvent(el) {
  const href = el.tagName === 'A' ? el.getAttribute('href') || '' : '';
  const p = { link_text: labelOf(el), element_type: typeOf(el), section: sectionOf(el) };
  if (el.dataset.event) p.button = el.dataset.event;
  let name = 'ui_click';
  if (/^(tel|sms|mailto):/i.test(href)) {
    name = 'contact_click';
    p.method = /^tel/i.test(href) ? 'telefon' : /^sms/i.test(href) ? 'sms' : 'mail';
  } else if (href && !/^(#|javascript:)/i.test(href)) {
    const u = new URL(href, location.href);
    if (u.origin !== location.origin) { name = 'outbound_click'; p.link_domain = u.hostname; p.link_url = clip(u.origin + u.pathname, 100); p.outbound = 'true'; }
    else { name = 'nav_click'; p.link_url = clip(u.pathname + u.hash, 100); }
  } else if (href) {
    name = 'nav_click'; p.link_url = clip(href, 100);
  }
  // Buttons we named ourselves (data-event) keep their own event
  if (el.dataset.event && name !== 'contact_click' && name !== 'outbound_click') name = 'cta_click';
  if (pageType.startsWith('udkast')) { p.click_type = name.replace('_click', ''); name = 'udkast_click'; }
  track(name, p);
}

let rages = 0;
let deads = 0;
let recent = [];
const rage = (e, t) => {
  recent = recent.filter(c => e.timeStamp - c.t < 800);
  recent.push({ t: e.timeStamp, x: e.clientX, y: e.clientY });
  if (rages < 5 && recent.filter(c => Math.hypot(c.x - e.clientX, c.y - e.clientY) < 40).length >= 3) {
    rages++; recent = [];
    track('rage_click', { link_text: labelOf(t).slice(0, 40), element_type: t.tagName.toLowerCase(), section: sectionOf(t) });
  }
};

// Capture phase: we read the element before the page's own handlers change it
document.addEventListener('click', e => {
  const t = e.target instanceof Element ? e.target : e.target && e.target.parentElement;
  if (!t || !e.isTrusted || t === document.documentElement || t === document.body) return;
  rage(e, t);
  if (t.closest(FIELDS)) return;
  const el = t.closest(INTERACTIVE);
  if (el) return clickEvent(el);
  // A click on something that is not a button or a link: something people expected to work
  if (deads < 10 && !t.closest(PLAY) && !String(getSelection()).trim()) {
    deads++;
    track('dead_click', { link_text: labelOf(t).slice(0, 40), element_type: t.tagName.toLowerCase(), section: sectionOf(t) });
  }
}, true);

/* -------- Scroll depth -------- */

let maxScroll = 0;
{
  const marks = [10, 25, 50, 75, 90, 100];
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? Math.min(100, (scrollY / max) * 100) : 100;
    maxScroll = Math.max(maxScroll, Math.round(pct));
    while (marks.length && pct >= marks[0] - 0.5) track('scroll', { percent_scrolled: marks.shift(), seconds: since() });
    if (!marks.length) removeEventListener('scroll', onScroll);
  };
  addEventListener('scroll', onScroll, { passive: true });
}

/* -------- Sections: seen, and time spent in each -------- */

const sections = [...new Set(document.querySelectorAll('[data-sec]:not(a):not(button), section[id], section[aria-labelledby], section[aria-label]'))];
if ('IntersectionObserver' in window && sections.length) {
  // Seen: when the top of the section reaches the upper half of the screen
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    track('section_view', { section: sectionOf(e.target), section_index: sections.indexOf(e.target) + 1, seconds: since() });
  }), { rootMargin: '0px 0px -50% 0px' });
  sections.forEach(s => io.observe(s));
}

// Every visible second goes to the section in the middle of the screen (or the open overlay)
const TIME_MARKS = [10, 30, 60, 120, 180, 300, 600];
let active = 0;
let current = null;
let inCurrent = 0;
const leave = () => {
  if (current && inCurrent >= 2) track('section_time', { section: sectionOf(current), seconds: inCurrent });
  current = null; inCurrent = 0;
};
setInterval(() => {
  if (document.visibilityState !== 'visible') return;
  active++;
  if (!framed && active >= TIME_MARKS[0]) track('time_on_page', { seconds: TIME_MARKS.shift() });
  const mid = innerHeight / 2;
  const s = document.querySelector('.bx.is-open, [data-modal-root]:not([hidden])')
    || sections.find(x => { const r = x.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; }) || null;
  if (s !== current) { leave(); current = s; }
  if (s) inCurrent++;
}, 1000);

/* -------- Leaving, coming back -------- */

let hiddenAt = 0;
let isHidden = false;
const goneNow = () => {
  if (isHidden) return flush();
  isHidden = true;
  if (activeSince !== null) { banked += performance.now() - activeSince; activeSince = null; }
  leave();
  onHide.forEach(f => { try { f(); } catch (x) { /* keep going */ } });
  track('user_engagement', { seconds: active });
  hiddenAt = performance.now();
  flush();
};
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') return goneNow();
  isHidden = false;
  activeSince = performance.now();
  const away = Math.round((performance.now() - hiddenAt) / 1000);
  if (hiddenAt && away >= 5 && !framed) track('tab_return', { seconds_away: away });
});
// Some browsers leave a page without a visibility change: send what is left anyway
addEventListener('pagehide', goneNow);

// Desktop: the mouse leaves through the top of the window (towards the tabs or the address bar)
if (!framed && mq('(pointer: fine)')) {
  const out = e => {
    if (e.relatedTarget || e.clientY > 0) return;
    document.removeEventListener('mouseout', out);
    track('exit_intent', { seconds: since(), max_scroll: maxScroll });
  };
  document.addEventListener('mouseout', out);
}

/* -------- Copying (what kind of text, never the text) -------- */

{
  let copies = 0;
  document.addEventListener('copy', () => {
    const sel = getSelection();
    const s = String(sel || '').trim();
    if (!s || copies++ >= 10) return;
    const kind = /@/.test(s) ? 'mail' : /\d{2}\s?\d{2}\s?\d{2}\s?\d{2}/.test(s) ? 'telefon' : /\bkr\b|\d\.\d{3}/i.test(s) ? 'pris' : 'tekst';
    const node = sel.anchorNode;
    track('text_copy', { copied_type: kind, chars: s.length, section: sectionOf(node && (node.nodeType === 1 ? node : node.parentElement)) });
  });
}

/* -------- Forms: which fields are used, never what is typed -------- */

const bucket = n => (n <= 10 ? '1-10' : n <= 50 ? '11-50' : n <= 200 ? '51-200' : '200+');
document.querySelectorAll('form[data-form]').forEach(form => {
  const formName = form.dataset.form || 'kontakt';
  const fname = el => el.name || el.id.replace(/^f-/, '') || 'felt';
  const real = el => el.matches && el.matches('input, textarea, select') && el.type !== 'hidden' && el.tabIndex >= 0 && !el.matches('.hp');
  const used = new Set(), filled = new Set(), bad = new Set();
  let started = 0, last = '', gone = false, badTimer = null;
  form.addEventListener('focusin', e => {
    if (!real(e.target)) return;
    const n = fname(e.target); last = n;
    if (!started) { started = performance.now(); track('form_start', { form_name: formName, field_name: n }); }
    if (!used.has(n)) { used.add(n); track('form_field', { form_name: formName, field_name: n, field_index: used.size }); }
  });
  form.addEventListener('focusout', e => {
    if (!real(e.target) || !e.target.value.trim()) return;
    const n = fname(e.target);
    if (!filled.has(n)) { filled.add(n); track('form_field_done', { form_name: formName, field_name: n, chars: bucket(e.target.value.trim().length) }); }
  });
  form.addEventListener('invalid', e => {
    bad.add(fname(e.target));
    clearTimeout(badTimer);
    badTimer = setTimeout(() => { track('form_invalid', { form_name: formName, field_name: [...bad].join(',') }); bad.clear(); }, 50);
  }, true);
  form.addEventListener('submit', () => track('form_submit', { form_name: formName, fields_filled: filled.size }));
  // Started, but left (or switched tab) without sending
  onHide.push(() => {
    if (!started || leadSent || gone) return;
    gone = true;
    track('form_abandon', { form_name: formName, field_name: last, fields_filled: filled.size, seconds: Math.round((performance.now() - started) / 1000) });
  });
});

/* -------- Errors -------- */

{
  let js = 0, res = 0;
  const file = s => clip(String(s || '').split('#')[0].split('?')[0].split('/').pop(), 80) || 'inline';
  addEventListener('error', e => {
    if (e instanceof ErrorEvent) {
      // Only our own scripts; extensions and other sites are not ours to fix
      if (js >= 5 || !e.filename || !e.filename.startsWith(location.origin)) return;
      js++;
      track('js_error', { error_message: clip(e.message, 100), source: file(e.filename), line: e.lineno || 0 });
    } else if (e.target && e.target !== window && res < 5) {
      const src = e.target.currentSrc || e.target.src || e.target.href;
      if (!src) return;
      res++;
      track('resource_error', { element_type: e.target.tagName.toLowerCase(), source: file(src), link_domain: clip(new URL(src, location.href).hostname, 60) });
    }
  }, true);
  addEventListener('unhandledrejection', e => {
    if (js >= 5) return;
    js++;
    track('js_error', { error_message: clip('Promise: ' + ((e.reason && e.reason.message) || e.reason), 100), source: 'promise', line: 0 });
  });
}

/* -------- Loading speed: Core Web Vitals, measured in the visitor's browser -------- */

{
  const LIMITS = { TTFB: [800, 1800], FCP: [1800, 3000], LCP: [2500, 4000], CLS: [0.1, 0.25], INP: [200, 500] };
  const done = new Set();
  const vital = (n, v) => {
    if (done.has(n) || v == null || !isFinite(v)) return;
    done.add(n);
    const [good, poor] = LIMITS[n];
    track('web_vitals', { metric_name: n, metric_value: n === 'CLS' ? Math.round(v * 1000) / 1000 : Math.round(v), metric_rating: v <= good ? 'god' : v <= poor ? 'forbedres' : 'daarlig' });
  };
  const watch = (type, cb, opts = {}) => { try { new PerformanceObserver(l => l.getEntries().forEach(cb)).observe({ type, buffered: true, ...opts }); } catch (x) { /* not supported */ } };
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (nav && nav.responseStart > 0) vital('TTFB', nav.responseStart);
  let lcp = null, cls = 0, inp = 0;
  watch('paint', e => { if (e.name === 'first-contentful-paint') vital('FCP', e.startTime); });
  watch('largest-contentful-paint', e => { lcp = e.startTime; });
  watch('layout-shift', e => { if (!e.hadRecentInput) cls += e.value; });
  watch('event', e => { if (e.interactionId) inp = Math.max(inp, e.duration); }, { durationThreshold: 40 });
  onHide.push(() => { if (lcp !== null) vital('LCP', lcp); vital('CLS', cls); if (inp) vital('INP', inp); });
}
