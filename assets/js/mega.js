// The mega menu under "Services" in the menu (markup: scripts/services/lib.mjs → mega, styles: main.css → Mega menu).
// Opens on hover with a mouse, on click or Enter/Space everywhere, and closes on Escape, a click outside,
// leaving it with the mouse, or moving the focus out. On phones it is a sheet under the menu, and the page
// behind does not scroll while it is open.
// GA4: menu_open (via hover/klik). The clicks on the links are nav_click/cta_click by themselves (analytics.js).
import { track } from './analytics.js';

const root = document.querySelector('[data-mega]');
if (root) {
  const btn = root.querySelector('[data-mega-btn]');
  const panel = root.querySelector('[data-mega-panel]');
  const html = document.documentElement;
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');
  let open = false, tOpen = 0, tClose = 0, tHide = 0, logged = false;

  const set = (on, via = '') => {
    clearTimeout(tOpen); clearTimeout(tClose);
    if (on === open) return;
    open = on;
    btn.setAttribute('aria-expanded', String(on));
    html.classList.toggle('mega-open', on);
    clearTimeout(tHide);
    if (on) {
      panel.hidden = false;
      void panel.offsetWidth; // so the opening animates
      panel.classList.add('is-open');
      if (!logged) { logged = true; track('menu_open', { via }); } // once a page
    } else {
      panel.classList.remove('is-open');
      tHide = setTimeout(() => { if (!open) panel.hidden = true; }, 260);
    }
  };

  btn.addEventListener('click', () => set(!open, 'klik'));
  root.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse' || !mouse.matches) return;
    clearTimeout(tClose);
    if (!open) tOpen = setTimeout(() => set(true, 'hover'), 110);
  });
  root.addEventListener('pointerleave', e => {
    if (e.pointerType !== 'mouse' || !mouse.matches) return;
    clearTimeout(tOpen);
    tClose = setTimeout(() => set(false), 280);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) { set(false); btn.focus(); }
  });
  document.addEventListener('click', e => { if (open && !root.contains(e.target)) set(false); });
  root.addEventListener('focusout', e => { if (open && e.relatedTarget && !root.contains(e.relatedTarget)) set(false); });
  // A link to this page (#kontakt) closes the menu, so the page can scroll there
  panel.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
}
