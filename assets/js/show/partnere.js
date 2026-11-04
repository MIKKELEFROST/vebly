// Partner scroll right under the front page hero (scripts/services/front/partnere.mjs).
// The rows of customers drift sideways, in opposite directions. Scrolling speeds them up and leans them,
// like the trades marquee further down the page, and they slide in from the sides as the band comes into
// view. Hovering, a long press or keyboard focus brings them to a soft stop.
// Nothing moves with reduced motion or with 1–4 customers (data-pt-still): the CSS shows a still grid.
const band = document.querySelector('.show--partnere [data-pt]');
if (band && document.documentElement.classList.contains('motion') && !band.hasAttribute('data-pt-still') && band.querySelectorAll('.pt__set > li').length > 4) run(band);

function run(band) {
  // The page has one list. Ten or more customers become two rows: every other one moves to a second
  // row, which drifts the other way
  const first = band.querySelector('.pt__set'), lis = [...first.children];
  if (lis.length >= 10) {
    const row = band.querySelector('.pt__row').cloneNode(true), set = row.querySelector('.pt__set');
    row.querySelector('[data-pt-track]').dataset.ptTrack = '1';
    set.replaceChildren(...lis.filter((_, i) => i % 2));
    band.append(row);
  }

  const BASE = 30;   // px a second when nobody scrolls
  const BOOST = 24;  // extra px a second for each px the page scrolls in a frame
  const ENTER = 120; // px each row slides in from its side
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);

  band.closest('.show--partnere').classList.add('is-moving');
  const rows = [...band.querySelectorAll('[data-pt-track]')].map(track => ({
    track, row: track.parentElement, set: track.querySelector('.pt__set'), dir: +track.dataset.ptTrack < 0 ? -1 : 1, x: 0, w: 0, before: null, after: []
  }));

  // Copies of the list on both sides make the loop seamless. Only the first list is read out and focusable.
  const copy = set => {
    const c = set.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.querySelectorAll('a').forEach(a => { a.tabIndex = -1; });
    return c;
  };
  const fill = () => {
    const vw = band.clientWidth;
    rows.forEach((r, i) => {
      const w = r.set.offsetWidth;
      if (!w) return;
      if (!r.w) r.x = -w * (i % 2 ? 0.5 : 0.15); // rows start out of step
      r.w = w;
      if (!r.before) { r.before = copy(r.set); r.track.prepend(r.before); }
      const need = Math.ceil(vw / w) + 1;
      while (r.after.length < need) { const c = copy(r.set); r.track.append(c); r.after.push(c); }
      while (r.after.length > need) r.after.pop().remove();
      if (!focused) r.x = ((r.x % w) - w) % w;
    });
  };

  let raf = 0, last = 0, lastY = scrollY, vel = 0, k = 1, hover = false, press = false, focused = null;

  const paint = () => {
    const vh = innerHeight, top = band.getBoundingClientRect().top;
    const e = ease(clamp((vh - top) / (vh * 0.45), 0, 1)); // 0 below the fold, 1 once well in view
    const skew = clamp(vel * 0.3, -8, 8) * k;
    rows.forEach(r => {
      if (!r.w) return;
      const off = -r.dir * (1 - e) * ENTER;
      r.track.style.transform = `translate3d(${(r.x - r.w + off).toFixed(2)}px,0,0) skewX(${(skew * r.dir).toFixed(2)}deg)`;
      r.row.style.opacity = (0.15 + 0.85 * e).toFixed(3);
    });
  };

  const frame = now => {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    const f = dt * 60, y = scrollY;
    vel += ((y - lastY) / f - vel) * (1 - Math.pow(0.88, f)); // smoothed px per frame, like main.js
    lastY = y;
    k += ((hover || press || focused ? 0 : 1) - k) * (1 - Math.pow(0.9, f)); // eases to a stop and back
    const speed = (BASE + Math.min(Math.abs(vel), 40) * BOOST) * k;
    rows.forEach(r => {
      if (!r.w) return;
      r.x += r.dir * speed * dt;
      if (!focused) { while (r.x <= -r.w) r.x += r.w; while (r.x > 0) r.x -= r.w; }
    });
    paint();
  };

  // Only runs while the band is on screen
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting && !raf) { last = 0; lastY = scrollY; vel = 0; raf = requestAnimationFrame(frame); }
    else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { rootMargin: '160px 0px' }).observe(band);

  // The width changes when the fonts arrive, logos load or the window is resized
  const ro = new ResizeObserver(() => { fill(); paint(); });
  ro.observe(band); rows.forEach(r => ro.observe(r.set));
  fill(); paint();

  // Hover stops it softly; on touch screens a long press does (a swipe still scrolls the page)
  band.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') hover = true; });
  band.addEventListener('pointerleave', () => { hover = false; });
  let pt = 0;
  band.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') { clearTimeout(pt); pt = setTimeout(() => { press = true; }, 220); } });
  band.addEventListener('pointerup', () => { clearTimeout(pt); if (press) pt = setTimeout(() => { press = false; }, 1200); });
  band.addEventListener('pointercancel', () => { clearTimeout(pt); press = false; });

  // Keyboard: the focused customer stops and is moved clear of the soft edges
  band.addEventListener('focusin', e => {
    const a = e.target.closest('a'), r = a && rows.find(x => x.set.contains(a));
    if (!r) return;
    focused = a;
    const b = band.getBoundingClientRect(), it = a.getBoundingClientRect(), pad = clamp(b.width * 0.12, 48, 210);
    const d = it.left < b.left + pad ? b.left + pad - it.left : it.right > b.right - pad ? b.right - pad - it.right : 0;
    r.x = clamp(r.x + d, -r.w, r.w);
    paint();
  });
  band.addEventListener('focusout', e => { if (!band.contains(e.relatedTarget)) focused = null; });
  // Browsers without overflow: clip may scroll the band to a focused link; the transform does that job
  band.addEventListener('scroll', () => { band.scrollLeft = 0; });
}
