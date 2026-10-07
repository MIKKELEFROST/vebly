// The Siteleads front page calls window.__build(p) with the scroll progress (0–1) of
// "Sådan virker det". Pieces fly in with a dashed orange outline, then the page
// scrolls itself to the bottom while the rest assembles.
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const absTop = el => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };
  const els = Array.from(document.querySelectorAll('[data-b]'));

  window.__build = p => {
    const vh = innerHeight, de = document.documentElement;
    const max = de.scrollHeight - vh;
    const sp = clamp((p - 0.3) / 0.62), spe = sp < 0.5 ? 2 * sp * sp : 1 - Math.pow(-2 * sp + 2, 2) / 2;
    window.scrollTo({ top: Math.max(0, max) * spe, behavior: 'instant' });
    const sy = window.scrollY;
    let j = 0;
    els.forEach((el, i) => {
      const top = absTop(el);
      let k;
      if (top < vh * 0.85) { k = ease(clamp((p - 0.02 - j * 0.028) / 0.09)); j++; }
      else k = ease(clamp((sy + vh * 0.95 - top) / (vh * 0.4)));
      k = Math.max(k, ease(clamp((p - 0.84) / 0.06)));
      const dir = i % 2 ? 1 : -1;
      if (k >= 1) { el.style.transform = ''; el.style.opacity = ''; el.style.filter = ''; el.style.outline = ''; return; }
      el.style.transform = `translate(${dir * 180 * (1 - k)}px,${(70 + (i % 3) * 40) * (1 - k)}px) rotate(${dir * 7 * (1 - k)}deg) scale(${0.9 + 0.1 * k})`;
      el.style.opacity = 0.05 + 0.95 * k;
      el.style.filter = `blur(${(1 - k) * 8}px)`;
      el.style.outline = `2px dashed rgba(224,85,43,${(1 - k) * 0.9})`;
      el.style.outlineOffset = '6px';
    });
    if (sp >= 1) window.scrollTo({ top: Math.max(0, de.scrollHeight - vh), behavior: 'instant' });
  };
})();
