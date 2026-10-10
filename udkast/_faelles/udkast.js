// Shared behaviour for customer drafts.
// Importing analytics sends a page_view (page_type udkast, with trade, design and page) and
// tracks clicks (udkast_click), scroll, sections and time, so we can see how a customer reads
// their draft. The events below are the draft's own (README.md → Tracking).
import { track } from '/assets/js/analytics.js';

const hd = document.querySelector('[data-hd]');
const onScroll = () => hd && hd.classList.toggle('is-scrolled', scrollY > 10);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// Mobile menu
const burger = document.querySelector('[data-burger]'), menu = document.querySelector('[data-menu]');
if (burger && menu) burger.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
  burger.textContent = open ? '✕' : '☰';
});

// The contact form in a draft does not send anything yet
const form = document.querySelector('[data-draft-form]');
if (form) form.addEventListener('submit', e => {
  e.preventDefault();
  form.querySelector('[data-ok]').hidden = false;
  track('udkast_form_try');
});

// Colour picker in the draft bar. The choice follows the customer to the other pages
// and is sent to GA4 (udkast_farve) so we can see what they liked.
const swatches = [...document.querySelectorAll('[data-c]')];
// One key per customer: the address without its page name
const colourKey = 'udkast-farve:' + location.pathname.replace(/-(forside|ydelser|om-os|kontakt|priser|galleri|booking|faq|tilbud)$/, '').replace(/\/[a-z-]+(\.html)?$/, '');
const applyColour = (sw, save) => {
  const h = document.documentElement.style;
  h.setProperty('--c', sw.dataset.c); h.setProperty('--c-soft', sw.dataset.soft); h.setProperty('--c-ink', sw.dataset.ink);
  swatches.forEach(s => { const on = s === sw; s.classList.toggle('is-on', on); s.setAttribute('aria-pressed', on); });
  if (save) try { sessionStorage.setItem(colourKey, sw.dataset.c); } catch (x) {}
};
{
  let saved = null;
  try { saved = sessionStorage.getItem(colourKey); } catch (x) {}
  const sw = swatches.find(s => s.dataset.c === saved);
  if (sw) applyColour(sw, false);
}
swatches.forEach(sw => sw.addEventListener('click', () => { applyColour(sw, true); track('udkast_farve', { colour: sw.dataset.c, colour_index: swatches.indexOf(sw) + 1 }); }));
// Instant drafts offer colour themes instead: links to the same page in other colours
const themes = [...document.querySelectorAll('[data-tema]')];
themes.forEach((a, i) => a.addEventListener('click', () => track('udkast_farve', { theme: a.dataset.tema, colour_index: i + 1 })));

// Webleads draft bar (can be hidden for this visit). Not shown when the draft is the preview inside
// "Bestil en hjemmeside", which has its own colour and design choices around it.
const bar = document.querySelector('[data-draft]');
let framed = false;
try { framed = window.top !== window.self; } catch (x) { framed = true; }
if (bar) {
  let hidden = framed;
  try { hidden = hidden || sessionStorage.getItem('udkast-bar') === '0'; } catch (x) {}
  bar.hidden = hidden;
  bar.querySelector('[data-draft-close]').addEventListener('click', () => { bar.hidden = true; track('udkast_bar_close'); try { sessionStorage.setItem('udkast-bar', '0'); } catch (x) {} });
  // The way back to us: "Gør den færdig" (or "Giv feedback" on hand-made drafts)
  const go = bar.querySelector(':scope > a');
  if (go) go.addEventListener('click', () => track('udkast_faerdig_click', { link_text: go.textContent.trim().slice(0, 60) }));
}
