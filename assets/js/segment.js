// What the visitor sells: the tabs above the menu ("Ydelser | Produkter online").
// Settings and copy: scripts/services/data.mjs → segments. Only the visitor's own choice in the tabs sets the
// segment: no links and no guessing. The script in <head> (lib.SEG_HEAD) has already set html[data-seg] from
// an earlier choice, so the page is drawn right. This file:
//   · marks the active tab, and swaps what differs: the badge words on the front page (data-words-<segment>)
//     and the order of the services in every list with data-seg-sort (copy in data-seg-only is CSS only)
//   · keeps a choice in the tabs (localStorage 'wl-seg', the same key the <head> script reads)
//   · tells GA4: segment_choice (segment, previous). Every other event
//     carries the segment too (analytics.js), so all of GA4 can be split by it.
import { track } from './analytics.js';

const KEY = 'wl-seg';
const root = document.documentElement;
const bar = document.querySelector('[data-seg-bar]');
const ORDER = bar ? { ydelser: (bar.dataset.orderYdelser || '').split(','), webshop: (bar.dataset.orderWebshop || '').split(',') } : {};
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

function apply(seg) {
  if (seg) root.dataset.seg = seg; else delete root.dataset.seg;
  document.querySelectorAll('[data-seg-set]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.segSet === seg)));

  // The badge words, only where the page has words per segment (the front page)
  const flip = document.querySelector('[data-flip][data-words-ydelser], [data-flip][data-words-webshop]');
  if (flip) {
    if (flip.dataset.wordsNeutral === undefined) flip.dataset.wordsNeutral = flip.dataset.words || '';
    const w = (seg && flip.dataset['words' + cap(seg)]) || flip.dataset.wordsNeutral;
    if (w && w !== flip.dataset.words) { flip.dataset.words = w; flip.textContent = w.split('|')[0]; }
  }

  // The services in the order that fits, numbered again (01, 02 …)
  document.querySelectorAll('[data-seg-sort]').forEach(list => {
    const kids = [...list.children].filter(k => k.dataset.slug);
    if (list.dataset.orderNeutral === undefined) list.dataset.orderNeutral = kids.map(k => k.dataset.slug).join(',');
    const order = (seg && ORDER[seg] && ORDER[seg].length > 1 ? ORDER[seg] : list.dataset.orderNeutral.split(','));
    const rank = k => { const i = order.indexOf(k.dataset.slug); return i < 0 ? 999 : i; };
    kids.sort((a, b) => rank(a) - rank(b)).forEach(k => list.appendChild(k));
    list.querySelectorAll('.addon__n').forEach((n, i) => { n.textContent = String(i + 1).padStart(2, '0'); });
  });
}

apply(root.dataset.seg || '');

document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-seg-set]');
  if (!b) return;
  const seg = b.dataset.segSet, prev = root.dataset.seg || 'ukendt';
  if (seg === prev) return;
  try { localStorage.setItem(KEY, JSON.stringify({ seg, src: 'faner' })); } catch (x) { /* private mode: it lasts for this page */ }
  apply(seg);
  track('segment_choice', { segment: seg, previous: prev });
});
