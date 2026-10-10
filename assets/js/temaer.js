// Colour themes for the drafts. Shared by the browser ("Bestil en hjemmeside", assets/js/bestil.js)
// and the server (api/_lib/udkast/render.js), so a swatch always looks like the draft it gives.
//
// A theme is more than one colour:
//   c     main colour: buttons, logo, the small labels above headings, the colour band
//   a     accent: numbers, icons, check marks and other small highlights
//   g     background tone: lys (the design's own), varm, kolig or tonet (a hint of the main colour)
//   tags  lets "Vis et nyt forslag" steer towards more colour, calmer, more modern or more classic
export const THEMES = {
  nordisk: { navn: 'Nordisk blå', c: '#1d4e89', a: '#e3a33b', g: 'kolig', tags: ['klassisk', 'rolig'] },
  skov: { navn: 'Skov og sand', c: '#1f5f4a', a: '#d4a373', g: 'varm', tags: ['klassisk', 'rolig'] },
  valnod: { navn: 'Valnød og salvie', c: '#6b4a2f', a: '#8fa37a', g: 'varm', tags: ['klassisk'] },
  kul: { navn: 'Kul og messing', c: '#23262b', a: '#b58b4c', g: 'lys', tags: ['klassisk', 'rolig', 'moderne'] },
  terrakotta: { navn: 'Terrakotta', c: '#b5532f', a: '#6f7d4a', g: 'varm', tags: ['farverig'] },
  hav: { navn: 'Hav og koral', c: '#0f5e74', a: '#f07c5a', g: 'kolig', tags: ['farverig', 'moderne'] },
  petrol: { navn: 'Petrol og kobber', c: '#0f6d7a', a: '#c8743c', g: 'lys', tags: ['klassisk'] },
  marine: { navn: 'Marine og himmel', c: '#1f2a44', a: '#5aa6d6', g: 'kolig', tags: ['klassisk', 'rolig'] },
  bordeaux: { navn: 'Bordeaux og rosa', c: '#7a2e3b', a: '#e49aa3', g: 'varm', tags: ['klassisk'] },
  baer: { navn: 'Bær og fersken', c: '#9c3d5a', a: '#f4a582', g: 'tonet', tags: ['farverig'] },
  lavendel: { navn: 'Lavendel', c: '#7a5a8c', a: '#8fb39a', g: 'tonet', tags: ['rolig', 'moderne'] },
  energi: { navn: 'Lilla og orange', c: '#5b3fd0', a: '#ff8a3d', g: 'lys', tags: ['farverig', 'moderne'] },
  grafit: { navn: 'Grafit og gul', c: '#2b2f36', a: '#f2b705', g: 'lys', tags: ['moderne', 'farverig'] },
  okker: { navn: 'Okker og grafit', c: '#94690a', a: '#2b2f36', g: 'varm', tags: ['klassisk'] },
  mint: { navn: 'Blå og mint', c: '#2b4c7e', a: '#4fb3a0', g: 'kolig', tags: ['rolig', 'moderne'] },
  turkis: { navn: 'Turkis og sand', c: '#2f7d8c', a: '#e9c46a', g: 'lys', tags: ['farverig', 'moderne'] },
  sort: { navn: 'Sort og guld', c: '#141414', a: '#c9a227', g: 'lys', tags: ['moderne', 'klassisk'] },
  salvie: { navn: 'Salvie og ler', c: '#4f6f5f', a: '#c27b5b', g: 'tonet', tags: ['rolig'] }
};
export const TEMA_IDS = Object.keys(THEMES);

// The four themes shown first for each trade. The first one is what the draft starts with.
export const FAG_TEMAER = {
  frisoer: ['baer', 'sort', 'bordeaux', 'salvie'],
  toemrer: ['valnod', 'skov', 'kul', 'nordisk'],
  maler: ['nordisk', 'hav', 'kul', 'terrakotta'],
  elektriker: ['okker', 'grafit', 'kul', 'nordisk'],
  vvs: ['petrol', 'hav', 'marine', 'grafit'],
  rengoering: ['turkis', 'mint', 'skov', 'hav'],
  klinik: ['lavendel', 'salvie', 'bordeaux', 'sort'],
  fysioterapeut: ['mint', 'marine', 'skov', 'turkis'],
  'personlig-traener': ['energi', 'sort', 'hav', 'grafit'],
  revisor: ['marine', 'kul', 'skov', 'bordeaux'],
  generisk: ['nordisk', 'skov', 'kul', 'terrakotta']
};
export const temaerFor = fag => FAG_TEMAER[fag] || FAG_TEMAER.generisk;

export const TONER = { lys: 'Lys', varm: 'Varm', kolig: 'Kølig', tonet: 'Tonet' };
// The page background for each tone and design (1 Klassisk, 4 Mosaik, 5 Minimal); "lys" is the design's own
const BAGGRUND = {
  lys: { 1: '#f7f6f2', 4: '#eef0ec', 5: '#ffffff' },
  varm: { 1: '#f6f0e6', 4: '#ebe4d8', 5: '#fcf9f3' },
  kolig: { 1: '#eff3f6', 4: '#e6ebf0', 5: '#f8fafc' }
};

/* -------- Colour maths -------- */

const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const hex = a => '#' + a.map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
// w = how far towards `to` (0 = the colour itself, 1 = `to`)
export const mix = (h, w, to = '#ffffff') => { const a = rgb(h), b = rgb(to); return hex(a.map((v, i) => v + (b[i] - v) * w)); };
const lum = h => { const [r, g, b] = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (x, y) => { const [a, b] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (b + 0.05); };
// Text on a coloured surface: dark or white, whichever reads best
export const ink = c => (contrast(c, '#ffffff') >= contrast(c, '#14140f') ? '#ffffff' : '#14140f');
// The colour darkened just enough to read on all the given backgrounds
export const readable = (c, bgs, min) => {
  let out = c;
  for (let w = 0.05; w <= 1 && bgs.some(b => contrast(out, b) < min); w += 0.05) out = mix(c, w, '#000000');
  return out;
};
export const isHex = v => /^#[0-9a-f]{6}$/i.test(v || '');
export const isTheme = t => typeof t === 'string' && Object.hasOwn(THEMES, t);
export const isTone = g => typeof g === 'string' && Object.hasOwn(TONER, g);

// Everything a draft needs to paint itself. svar: { t, c, ac, g } from the answers;
// fallback: the trade's own colour, used by old links that only have a main colour.
export function palette({ t = '', c = '', ac = '', g = '' } = {}, design = 1, fallback = '#1d4e89') {
  const th = isTheme(t) ? THEMES[t] : null;
  const main = th ? th.c : isHex(c) ? c : fallback;
  // Old links without a theme keep the single colour look: the accent is the main colour
  const accent = th ? th.a : t === 'eget' && isHex(ac) ? ac : main;
  const tone = isTone(g) ? g : th ? th.g : 'lys';
  const bg = tone === 'tonet' ? mix(main, { 4: 0.88, 5: 0.96 }[design] || 0.93) : (BAGGRUND[tone] || BAGGRUND.lys)[design] || BAGGRUND.lys[1];
  const soft = mix(main, 0.86), aSoft = mix(accent, 0.84);
  return {
    c: main, cSoft: soft, cInk: ink(main), cText: readable(main, [bg, '#ffffff'], 4.5),
    a: accent, aSoft, aInk: ink(accent), aText: readable(accent, [bg, '#ffffff', aSoft], 3.2),
    bg, tone, navn: th ? th.navn : t === 'eget' ? 'Egne farver' : ''
  };
}

// How a theme looks on a swatch: main, accent and background tone
export const preview = (t, own = {}) => {
  const p = palette(t === 'eget' ? { t, ...own } : { t, g: own.g });
  return `--tc:${p.c};--ta:${p.a};--tb:${p.bg}`;
};
