// Shared behaviour for customer drafts.
// Importing analytics sends a page_view, so GA4 shows when a customer opens their draft
// (Rapporter → Sider, filter on the draft's address).
import '/assets/js/analytics.js';

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

// Webleads draft bar (can be hidden for this visit)
const bar = document.querySelector('[data-draft]');
if (bar) {
  let hidden = false;
  try { hidden = sessionStorage.getItem('udkast-bar') === '0'; } catch (x) {}
  bar.hidden = hidden;
  bar.querySelector('button').addEventListener('click', () => { bar.hidden = true; try { sessionStorage.setItem('udkast-bar', '0'); } catch (x) {} });
}
