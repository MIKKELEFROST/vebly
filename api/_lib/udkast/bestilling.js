// The answers from "Bestil en hjemmeside" (assets/js/bestil.js) and how they become a draft.
// The answers that shape the draft travel in the link (?d=, base64url JSON), so a draft can be
// opened and shared without storing anything. The link never holds personal contact details.
import { BRANCHER, DESIGN_NUMRE, branche } from './render.js';

export const FUNKTIONER = {
  booking: 'Online booking',
  priser: 'Priser på ydelser',
  galleri: 'Billeder af jeres arbejde',
  anmeldelser: 'Anmeldelser',
  webshop: 'Webshop eller gavekort'
};
export const ANSATTE = { '1': '1', '2-5': '2–5', '6-10': '6–10', '11+': '11+' };

const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

// b trade, f own trade name (only for "Andet"), n company name, by town, a year started,
// m number of people, x features, s design, c colour
export function cleanAnswers(a = {}) {
  const b = BRANCHER.includes(a.b) ? a.b : 'generisk';
  return {
    b,
    f: b === 'generisk' ? clip(a.f, 40) : '',
    n: clip(a.n, 60),
    by: clip(a.by, 40),
    a: /^(19[5-9]\d|20[0-2]\d)$/.test(String(a.a || '')) ? String(a.a) : '',
    m: a.m in ANSATTE ? a.m : '',
    x: [...new Set(Array.isArray(a.x) ? a.x : [])].filter(k => k in FUNKTIONER),
    s: DESIGN_NUMRE.includes(Number(a.s)) ? Number(a.s) : 1,
    c: /^#[0-9a-f]{6}$/i.test(a.c || '') ? a.c.toLowerCase() : ''
  };
}
export const encode = a => Buffer.from(JSON.stringify(a)).toString('base64url');
export function decode(d) {
  if (typeof d !== 'string' || !d || d.length > 1500) return null;
  try { return cleanAnswers(JSON.parse(Buffer.from(d, 'base64url').toString('utf8'))); } catch { return null; }
}

const kortNavn = n => n.replace(/\s+(ApS|A\/S|IVS|I\/S|K\/S|P\/S)\.?$/i, '').trim() || n;
const slugify = s => s.toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
  .normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'din-virksomhed';

// The customer data the draft renderer expects. What we do not know gets the same kind of
// obvious placeholder as the hand-made drafts (phone 12 34 56 78, CVR 12345678, address).
export function draftData(a) {
  const navn = a.n || 'Din virksomhed', kort = kortNavn(navn), by = a.by || 'din by';
  const data = {
    branche: a.b, slug: slugify(kort), navn, kort, by, omraader: [],
    tlf: '12 34 56 78', email: `kontakt@${slugify(kort).replace(/-/g, '')}.dk`, adresse: `Jeres adresse, ${by}`,
    cvr: '12345678', aar: a.a || '2020', opgaver: '500+', ansatte: ANSATTE[a.m] || '3', design: a.s
  };
  if (a.f) data.fag = a.f.charAt(0).toUpperCase() + a.f.slice(1);
  if (a.c) data.farve = a.c;
  // When features were chosen, the draft follows them; with no choice it shows everything
  if (a.x.length) {
    if (a.x.includes('booking')) data.headerKnap = 'book';
    if (!a.x.includes('priser')) data.ydelser = branche(a.b).ydelser.map(({ pris, ...y }) => y);
  }
  return data;
}

// Page addresses, the button in the Webleads bar, and sections hidden because they were not chosen
export function draftOptions(a, d) {
  const hide = [];
  if (a.x.length && !a.x.includes('galleri')) hide.push('#projekter');
  if (a.x.length && !a.x.includes('anmeldelser')) hide.push('#anmeldelser');
  return {
    link: p => (p === 'forside' ? `/mit-udkast?d=${d}` : `/mit-udkast/${p}?d=${d}`),
    knap: '<a href="https://webleads.dk/?utm_source=udkast&amp;utm_medium=draft&amp;utm_campaign=bestil#kontakt" target="_top">Gør den færdig →</a>',
    head: hide.length ? `\n<style>${hide.join(',')}{display:none}</style>` : ''
  };
}

// A readable summary of the answers for the e-mail to Webleads
export function summary(a) {
  const b = branche(a.b);
  return [
    ['Fag', a.f || b.fag],
    ['Virksomhed', a.n],
    ['By', a.by],
    ['Startet', a.a || '–'],
    ['Antal', ANSATTE[a.m] || '–'],
    ['Skal kunne', a.x.map(k => FUNKTIONER[k]).join(', ') || '–'],
    ['Design', { 1: 'Klassisk', 4: 'Mosaik', 5: 'Minimal' }[a.s]],
    ['Farve', a.c || b.farve]
  ];
}
