// Shared behaviour for customer drafts.
// Importing analytics sends a page_view, so GA4 shows when a customer opens their draft
// (Rapporter → Sider, filter on the draft's address).
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
});

// Colour picker in the draft bar. The choice follows the customer to the other pages
// and is sent to GA4 (cta_click, button "Udkast farve: #…") so we can see what they liked.
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
swatches.forEach(sw => sw.addEventListener('click', () => { applyColour(sw, true); track('cta_click', { button: 'Udkast farve: ' + sw.dataset.c }); }));

// Webleads draft bar (can be hidden for this visit)
const bar = document.querySelector('[data-draft]');
if (bar) {
  let hidden = false;
  try { hidden = sessionStorage.getItem('udkast-bar') === '0'; } catch (x) {}
  bar.hidden = hidden;
  bar.querySelector('[data-draft-close]').addEventListener('click', () => { bar.hidden = true; try { sessionStorage.setItem('udkast-bar', '0'); } catch (x) {} });
}
