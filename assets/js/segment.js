// What the visitor sells: the tabs above the menu ("Ydelser | Produkter online").
// Settings and copy: scripts/services/data.mjs → segments. Only the visitor's own choice in the tabs sets the
// segment: no links and no guessing. The script in <head> (lib.SEG_HEAD) has already set html[data-seg] from
// an earlier choice, so the page is drawn right. This file:
//   · marks the active tab, and swaps what differs: the badge words on the front page (data-words-<segment>)
//     and the order of the services in every list with data-seg-sort (copy in data-seg-only is CSS only)
//   · keeps a choice in the tabs (localStorage 'wl-seg', the same key the <head> script reads)
//   · until the visitor has chosen: a light sweep over the tabs and a bubble under them that asks for a
//     choice (on at most 3 pages a visit; ✕ stops it for the visit; not on phones), and a floating card at the bottom with the
//     same question. On a computer the card stays after the choice, as a second set of tabs; on phones it goes (✕ for the visit).
//     GA4: segment_nudge (action vist/lukket/skjult, nudge_type boble/bund)
//   · tells GA4: segment_choice (segment, previous, segment_source faner/bund: where the choice was made,
//     nudge ja/nej: the bubble was shown on this page). Every other event carries the segment too
//     (analytics.js), so all of GA4 can be split by it.
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
  // Other parts that follow the choice (the trades band, the cut in the front page services: main.js)
  document.dispatchEvent(new CustomEvent('wl:seg', { detail: seg || '' }));
}

apply(root.dataset.seg || '');

// The nudge: until a choice is made, ask for one. After the intro curtain, on at most 3 pages a visit.
const NUDGE = 'wl-seg-nudge'; // pages with the nudge this visit, or -1 after ✕
const TEXT = (bar && bar.dataset.nudge) || 'Vælg her, så viser vi det, der passer til dig.';
let tip = null, nudged = false, tipTimer = 0;
const hideTip = (action = '') => {
  clearTimeout(tipTimer);
  if (bar) bar.classList.remove('is-nudging');
  if (!tip) return;
  const t = tip; tip = null;
  if (action) track('segment_nudge', { action, nudge_type: 'boble' });
  t.classList.add('is-out');
  setTimeout(() => t.remove(), 320);
};
function nudge() {
  if (!bar || root.dataset.seg) return;
  let n = 0;
  try { n = parseInt(sessionStorage.getItem(NUDGE) || '0', 10) || 0; } catch (x) { /* no storage: every page */ }
  if (n < 0 || n >= 3) return;
  const curtain = document.querySelector('[data-loader]') && !root.classList.contains('intro-seen');
  setTimeout(() => {
    if (root.dataset.seg) return;
    try { sessionStorage.setItem(NUDGE, String(n + 1)); } catch (x) { /* fine */ }
    // On phones the bubble would cover the logo and the menu: the sweep and the card at the bottom ask there
    bar.classList.add('is-nudging');
    nudged = true;
    if (matchMedia('(max-width: 620px)').matches) { tipTimer = setTimeout(() => bar.classList.remove('is-nudging'), 6000); return; }
    const inner = bar.querySelector('.segbar__in'), tabs = bar.querySelector('.segbar__tabs');
    tip = document.createElement('div');
    tip.className = 'segbar__tip';
    tip.setAttribute('role', 'status');
    tip.innerHTML = `<span></span><button type="button" class="segbar__tip-x" aria-label="Luk">✕</button>`;
    tip.firstChild.textContent = TEXT;
    inner.append(tip);
    // The arrow points at the middle of the tabs, and the bubble stays on the screen
    const ib = inner.getBoundingClientRect(), tb = tabs.getBoundingClientRect();
    const left = Math.max(14, Math.min(tb.left - ib.left, innerWidth - ib.left - tip.offsetWidth - 14));
    tip.style.setProperty('--tip-left', left + 'px');
    tip.style.setProperty('--tip-arrow', Math.max(14, tb.left - ib.left - left + tb.width / 2 - 6) + 'px');
    tip.querySelector('button').addEventListener('click', () => { try { sessionStorage.setItem(NUDGE, '-1'); } catch (x) { /* fine */ } hideTip('lukket'); });
    track('segment_nudge', { action: 'vist', nudge_type: 'boble' });
    tipTimer = setTimeout(() => hideTip('skjult'), 10000);
  }, curtain ? 3800 : 1600);
}
nudge();

// The floating card at the bottom: the same question as the tabs. Until a choice is made it asks on every screen;
// on a computer it then stays, like the tabs in the menu, showing the choice and letting the visitor change it
// (Mikkel, 7 Nov 2026). On phones it goes when the choice is made. It comes after the first scroll or a few
// seconds, waits while the cookie question is open, steps aside at the contact form, and ✕ hides it for the visit.
const FLOAT = 'wl-seg-float';
const desk = matchMedia('(min-width: 900px) and (hover: hover)');
let card = null;
const hideCard = (action = '') => {
  if (!card) return;
  const c = card; card = null;
  if (action && !root.dataset.seg) track('segment_nudge', { action, nudge_type: 'bund' });
  c.classList.add('is-out');
  setTimeout(() => c.remove(), 380);
};
function floatCard() {
  if (!bar) return;
  try { if (sessionStorage.getItem(FLOAT) === '-1') return; } catch (x) { /* fine */ }
  const q = (bar.querySelector('.segbar__q') || {}).textContent || 'Hvad sælger du?';
  const opts = [...bar.querySelectorAll('[data-seg-set]')].map(b => [b.dataset.segSet, b.textContent]);
  let shown = false;
  const show = () => {
    if (shown || (root.dataset.seg && !desk.matches)) return;
    if (document.querySelector('.cc')) { setTimeout(show, 1500); return; } // the cookie question first
    shown = true;
    removeEventListener('scroll', onScroll);
    card = document.createElement('div');
    card.className = 'segfloat' + (root.dataset.seg ? ' is-chosen' : '');
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', q);
    card.innerHTML = `<b class="segfloat__q"></b><div class="segfloat__btns">${opts.map(([s]) => `<button type="button" class="segfloat__btn" data-seg-set="${s}" data-seg-from="bund" aria-pressed="false"></button>`).join('')}</div><button type="button" class="segfloat__x" aria-label="Luk">✕</button>`;
    card.querySelector('.segfloat__q').textContent = q;
    card.querySelectorAll('.segfloat__btn').forEach((b, i) => { b.textContent = opts[i][1]; b.setAttribute('aria-pressed', String(b.dataset.segSet === root.dataset.seg)); });
    card.querySelector('.segfloat__x').addEventListener('click', () => { try { sessionStorage.setItem(FLOAT, '-1'); } catch (x) { /* fine */ } hideCard('lukket'); });
    document.body.append(card);
    if (!root.dataset.seg) track('segment_nudge', { action: 'vist', nudge_type: 'bund' });
    // Out of the way while the contact form is on screen
    const form = document.querySelector('#kontakt');
    if (form && 'IntersectionObserver' in window) {
      const c = card;
      new IntersectionObserver(es => es.forEach(e => c.classList.toggle('is-tucked', e.isIntersecting)), { threshold: 0.15 }).observe(form);
    }
  };
  const onScroll = () => { if (scrollY > 200) show(); };
  addEventListener('scroll', onScroll, { passive: true });
  const curtain = document.querySelector('[data-loader]') && !root.classList.contains('intro-seen');
  setTimeout(show, curtain ? 7000 : 5000);
}
floatCard();

document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-seg-set]');
  if (!b) return;
  const seg = b.dataset.segSet, prev = root.dataset.seg || 'ukendt', from = b.dataset.segFrom || 'faner';
  hideTip();
  // On a computer the card at the bottom stays and shows the choice; on phones it goes
  if (card && desk.matches) card.classList.add('is-chosen'); else hideCard();
  if (seg === prev) return;
  try { localStorage.setItem(KEY, JSON.stringify({ seg, src: 'faner' })); } catch (x) { /* private mode: it lasts for this page */ }
  apply(seg);
  track('segment_choice', { segment: seg, previous: prev, segment_source: from, nudge: nudged ? 'ja' : 'nej' });
});
