// UGC showcase (/services/ugc): a wall of our own videos and photos (scripts/services/showcase/ugc.html).
// Filters the wall (Alt / Video / Billeder), plays a video without sound while it is on screen (with reduced
// motion only on a tap), and a tap turns the sound on. The "på vej" note goes when no placeholder is left.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--ugc');
if (root) {
  const motion = document.documentElement.classList.contains('motion');
  const tiles = [...root.querySelectorAll('.ug__tile')];
  const note = root.querySelector('[data-ug-note]');
  if (note && !root.querySelector('.ug__tile[data-ph]')) note.hidden = true;

  // Filter
  root.querySelectorAll('[data-ug-show]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.ugShow;
    root.querySelectorAll('[data-ug-show]').forEach(x => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    tiles.forEach(t => { t.hidden = k !== 'alt' && t.dataset.kind !== k; });
    track('showcase_interact', { showcase: 'ugc', action: 'filter_' + k });
  }));

  // Videos: play without sound while on screen, a tap turns the sound on (and off again)
  const videos = [...root.querySelectorAll('.ug__media > video')];
  videos.forEach(v => { v.muted = true; v.playsInline = true; v.loop = true; });
  if (motion && videos.length) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) { if (v.preload === 'none') v.preload = 'metadata'; v.play().catch(() => {}); }
      else v.pause();
    }), { threshold: 0.6 });
    videos.forEach(v => io.observe(v));
  }
  // Enter or Space on a focused video does the same as a tap
  videos.forEach(v => v.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); v.click(); } }));
  videos.forEach(v => v.addEventListener('click', () => {
    const media = v.parentElement;
    if (v.paused) v.play().catch(() => {});
    v.muted = !v.muted;
    let badge = media.querySelector('.ug__sound');
    if (!v.muted) {
      videos.forEach(o => { if (o !== v) { o.muted = true; const b = o.parentElement.querySelector('.ug__sound'); if (b) b.remove(); } });
      if (!badge) { badge = document.createElement('span'); badge.className = 'ug__sound'; badge.textContent = '🔊 Lyd'; media.append(badge); }
      track('showcase_interact', { showcase: 'ugc', action: 'lyd' });
    } else if (badge) badge.remove();
  }));
}
