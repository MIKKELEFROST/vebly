// Partner band right under the front page hero (scripts/services/front/partnere.mjs).
// An infinity scroll: the customers drift calmly in one endless row across the whole width of the screen.
// The row can be grabbed and thrown: it follows the mouse or the finger and glides back to its own pace.
// It rolls in from the side as the band comes into view. Hovering,
// a touch, keyboard focus or the pause button brings them to a soft stop.
// The list only moves when it is wider than the band, so no customer is ever on screen twice. With
// reduced motion, without JS, with 1–4 customers (data-pt-still) or a list that fits, it stands still.
import { track } from '/assets/js/analytics.js';

const sec = document.querySelector('.show--partnere.pt');
const band = sec && sec.querySelector('[data-pt]');
if (band && !band.hasAttribute('data-pt-still')) document.documentElement.classList.contains('motion') ? run() : still();

// Without motion a phone shows a row you swipe: when nothing in it can take focus, the row itself can,
// so the keyboard can scroll it too
function still() {
  const row = band.querySelector('.pt__row');
  const fit = () => {
    const scrolls = row.scrollWidth > row.clientWidth + 1 && !row.querySelector('a');
    if (scrolls === row.hasAttribute('tabindex')) return;
    if (scrolls) { row.tabIndex = 0; row.setAttribute('role', 'group'); row.setAttribute('aria-label', 'Kunderne, rul sidelæns'); }
    else ['tabindex', 'role', 'aria-label'].forEach(a => row.removeAttribute(a));
  };
  new ResizeObserver(fit).observe(row);
}

function run() {
  const BASE = 28;   // px a second on its own
  const ENTER = 110; // px each row rolls in from its side
  const GRAB = 6;    // px a press moves sideways before it becomes a drag (a click stays a click)
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const wrap = (x, w) => ((x % w) - w) % w; // into (-w, 0]

  const first = band.querySelector('.pt__row'), set0 = first.querySelector('.pt__set');
  const items = [...set0.children];
  let rows = [], mode = '', vw = 0;
  let raf = 0, last = 0, k = 1, hover = false, press = false, focused = null, paused = false, drag = null, swallow = false, thrown = false, pt = 0;

  // Copies of a row on both sides make the loop seamless. Only the real list is read out and focusable.
  const copy = set => {
    const c = set.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.querySelectorAll('a').forEach(a => { a.tabIndex = -1; });
    return c;
  };
  const fill = () => {
    const bw = band.clientWidth;
    rows.forEach((r, i) => {
      const w = r.set.offsetWidth;
      if (!w) return;
      if (r.x === null) r.x = -w * (i % 2 ? 0.5 : 0.15); // rows start out of step
      r.w = w;
      if (!r.before) { r.before = copy(r.set); r.track.prepend(r.before); }
      const need = Math.ceil(bw / w) + 1;
      while (r.after.length < need) { const c = copy(r.set); r.track.append(c); r.after.push(c); }
      while (r.after.length > need) r.after.pop().remove();
      if (!focused) r.x = wrap(r.x, w);
    });
  };

  // Still or moving: measured in one line, so it adapts to the screen and not only to the count
  const layout = () => {
    vw = innerWidth;
    rows.forEach(r => { if (r.before) r.before.remove(); r.after.forEach(c => c.remove()); });
    set0.replaceChildren(...items);
    sec.classList.add('is-moving');
    const bw = band.clientWidth, gap = parseFloat(getComputedStyle(set0).columnGap) || 0;
    const width = list => list.reduce((s, li) => s + li.offsetWidth + gap, 0);
    mode = width(items) <= bw + 1 ? 'still' : 'one';
    if (mode === 'still') {
      sec.classList.remove('is-moving'); rows = [];
      first.style.opacity = ''; first.firstElementChild.style.transform = '';
      if (btn) btn.hidden = true;
      return;
    }
    if (btn) btn.hidden = false;
    const old = rows;
    rows = [first].map((row, i) => {
      const track = row.querySelector('[data-pt-track]');
      return { row, track, set: track.querySelector('.pt__set'), dir: +track.dataset.ptTrack < 0 ? -1 : 1, x: old[i] ? old[i].x : null, v: 0, w: 0, before: null, after: [] };
    });
    fill(); paint();
  };

  const paint = () => {
    const vh = innerHeight, top = band.getBoundingClientRect().top;
    const e = ease(clamp((vh - top) / (vh * 0.45), 0, 1)); // 0 below the fold, 1 once well in view
    rows.forEach(r => {
      if (!r.w) return;
      const off = -r.dir * (1 - e) * ENTER;
      r.track.style.transform = `translate3d(${(r.x - r.w + off).toFixed(2)}px,0,0)`;
      r.row.style.opacity = (0.15 + 0.85 * e).toFixed(3);
    });
  };

  const frame = now => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const f = dt * 60;
    k += ((hover || press || focused || paused ? 0 : 1) - k) * (1 - Math.pow(0.9, f)); // eases to a stop and back
    rows.forEach(r => {
      if (!r.w || (drag && drag.row === r)) return;
      r.v += (r.dir * BASE * k - r.v) * (1 - Math.pow(0.955, f)); // a throw glides back to its own pace
      r.x += r.v * dt;
      if (!focused) r.x = wrap(r.x, r.w);
    });
    paint();
  };

  // A pause button at the end of the hairline, for everyone who cannot hover (keyboard, touch)
  const head = sec.querySelector('.pt__head');
  let btn = null;
  if (head) {
    const ICON = { pause: '<rect x="4" y="3" width="3" height="10" rx="1"/><rect x="9" y="3" width="3" height="10" rx="1"/>', play: '<path d="M5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.9 2.7a.6.6 0 0 0-.9.5z"/>' };
    btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'pt__pause';
    btn.setAttribute('aria-label', 'Sæt bevægelsen på pause'); btn.setAttribute('aria-pressed', 'false');
    const draw = () => { btn.innerHTML = `<svg viewBox="0 0 16 16" aria-hidden="true">${paused ? ICON.play : ICON.pause}</svg>`; };
    btn.addEventListener('click', () => { paused = !paused; btn.setAttribute('aria-pressed', String(paused)); draw(); });
    draw(); head.append(btn);
  }

  layout();

  // Only runs while the band is on screen (the last entry is the current one: a quick shift of the page
  // can queue "out" and "in" together)
  new IntersectionObserver(es => {
    const en = es[es.length - 1];
    if (en.isIntersecting && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '160px 0px' }).observe(band);

  // The widths change when the fonts arrive and when the window is resized
  const ro = new ResizeObserver(() => { if (mode !== 'still') { fill(); paint(); } });
  ro.observe(band); items.forEach(li => ro.observe(li));
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (innerWidth !== vw && !drag) layout(); }, 150); });
  if (document.fonts) document.fonts.ready.then(() => { if (!drag) layout(); });

  // Hover stops it softly; a touch that rests on the band does too (a swipe up or down still scrolls the page)
  band.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') hover = true; });
  band.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hover = false; });

  // Grab and throw: a sideways drag moves the row under the pointer, letting go throws it
  band.addEventListener('pointerdown', e => {
    if (mode === 'still' || drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const r = rows.find(x => x.row.contains(e.target));
    if (!r) return;
    drag = { id: e.pointerId, cand: r, row: null, x0: e.clientX, y0: e.clientY, x: e.clientX, t: e.timeStamp, v: 0 };
    if (e.pointerType !== 'mouse') { clearTimeout(pt); pt = setTimeout(() => { press = true; }, 180); }
  });
  band.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.row) {
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (Math.abs(dx) < GRAB || Math.abs(dx) < Math.abs(dy)) return;
      drag.row = drag.cand; drag.row.v = 0;
      drag.x = e.clientX; drag.t = e.timeStamp;
      try { band.setPointerCapture(e.pointerId); } catch (x) {}
      sec.classList.add('is-dragging');
      if (!thrown) { thrown = true; track('showcase_interact', { showcase: 'partnere', action: 'drag' }); }
      return;
    }
    const r = drag.row, dx = e.clientX - drag.x, dt = Math.max(8, e.timeStamp - drag.t) / 1000;
    r.x = wrap(r.x + dx, r.w);
    drag.v = drag.v * 0.5 + (dx / dt) * 0.5;
    drag.x = e.clientX; drag.t = e.timeStamp;
    paint();
  });
  const end = e => {
    if (!drag || e.pointerId !== drag.id) return;
    clearTimeout(pt);
    const r = drag.row;
    if (r) {
      // Thrown, unless the pointer rested before it let go
      r.v = e.type === 'pointerup' && e.timeStamp - drag.t < 80 ? clamp(drag.v, -2400, 2400) : 0;
      sec.classList.remove('is-dragging');
      // The click that ends a drag is not a click on the customer under the pointer
      swallow = e.type === 'pointerup';
      setTimeout(() => { swallow = false; }, 0);
    }
    if (e.pointerType !== 'mouse') {
      if (press && e.type === 'pointerup') pt = setTimeout(() => { press = false; }, 1200);
      else press = false;
    }
    drag = null;
  };
  band.addEventListener('pointerup', end);
  band.addEventListener('pointercancel', end);
  // (a touch starts out captured by the element under the finger, which loses it to the band: not an end)
  band.addEventListener('lostpointercapture', e => { if (e.target === band) end(e); });
  addEventListener('click', e => { if (swallow) { swallow = false; e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  band.addEventListener('dragstart', e => e.preventDefault());

  // Keyboard: the focused customer stops and is moved clear of the soft edges
  // (a mouse press also focuses a link, but that must not stop the band)
  band.addEventListener('focusin', e => {
    const a = e.target.closest('a'), r = a && rows.find(x => x.set.contains(a));
    let key = true;
    try { key = !!a && a.matches(':focus-visible'); } catch (x) { /* older Safari: any focus stops it */ }
    focused = r && key ? a : null;
    if (!focused) return;
    r.v = 0;
    const b = band.getBoundingClientRect(), it = a.getBoundingClientRect(), pad = clamp(b.width * 0.12, 48, 160);
    const d = it.left < b.left + pad ? b.left + pad - it.left : it.right > b.right - pad ? b.right - pad - it.right : 0;
    r.x = clamp(r.x + d, -r.w, r.w);
    paint();
  });
  band.addEventListener('focusout', e => { if (!band.contains(e.relatedTarget)) focused = null; });
  // Browsers without overflow: clip may scroll the band to a focused link; the transform does that job
  band.addEventListener('scroll', () => { band.scrollLeft = 0; });
}
