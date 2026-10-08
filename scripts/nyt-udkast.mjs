// Builds a customer draft from a trade template plus a small customer file.
//
//   node scripts/nyt-udkast.mjs scripts/udkast-kunder/holms-maler-aps.json [--overskriv]
//
// 1. scripts/udkast-brancher/<branche>.json holds everything that is the same for a trade
//    (services, prices, FAQ, steps, opening hours, wording of buttons).
// 2. The customer file holds what is unique: name, town, nearby areas, phone, colour, and
//    any field from the trade file it wants to override (e.g. its own list of services).
// Text in both files may use {{KORT}}, {{NAVN}}, {{BY}}, {{AAR}}, {{ERFARING}} and {{OMRAADER}}.
//
// Writes udkast/<slug>/{forside,ydelser,om-os,kontakt}.html, served at
// webleads.dk/<slug>-forside, -ydelser, -om-os and -kontakt (vercel.json rewrites).
// The pages are plain HTML and can be edited by hand afterwards.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(join(root, f), 'utf8');
const tpl = f => read(`scripts/udkast-skabelon/${f}`);
const [file, flag] = process.argv.slice(2);
if (!file) {
  const b = readdirSync(join(root, 'scripts/udkast-brancher')).map(f => f.replace('.json', '')).join(', ');
  console.error(`Brug: node scripts/nyt-udkast.mjs <kunde.json> [--overskriv]\nBrancher: ${b}`); process.exit(1);
}
const kunde = JSON.parse(readFileSync(file, 'utf8'));
const branche = JSON.parse(read(`scripts/udkast-brancher/${kunde.branche}.json`));
const k = { ...branche, ...kunde };

if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(k.slug)) throw new Error('slug må kun have små bogstaver, tal og bindestreger (fx holms-maler-aps)');
const out = join(root, 'udkast', k.slug);
if (existsSync(out) && flag !== '--overskriv') { console.error(`${out} findes allerede. Tilføj --overskriv for at erstatte det.`); process.exit(1); }

// Fill {{…}} tokens inside the trade/customer text
const list = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' og ' + a[a.length - 1] : a.join('');
const omraader = [k.by, ...(k.omraader || [])];
const tokens = { KORT: k.kort || k.navn, NAVN: k.navn, BY: k.by, AAR: k.aar, ERFARING: String(2026 - Number(k.aar)), OMRAADER: list(omraader) };
const deep = v => typeof v === 'string' ? v.replace(/\{\{([A-Z]+)\}\}/g, (m, t) => tokens[t] ?? m) : Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, deep(b)])) : v;
Object.assign(k, deep(k));

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hex = h => h.replace('#', '').match(/../g).map(x => parseInt(x, 16));
const mix = (h, w) => '#' + hex(h).map(v => Math.round(v + (255 - v) * w).toString(16).padStart(2, '0')).join('');
const lum = h => { const [r, g, b] = hex(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const tel = k.tlf.replace(/[^\d+]/g, '');
// Three colours the customer can try in the draft bar: their own plus two alternatives
const ALT = ['#1f5f4a', '#b5532f', '#2b2b2b', '#1d4e89', '#7a3fd0'];
const farver = (k.farver && k.farver.length ? k.farver : [k.farve, ...ALT.filter(c => c.toLowerCase() !== k.farve.toLowerCase())]).slice(0, 3);
const ink = c => (lum(c) > 0.4 ? '#14140f' : '#ffffff');
const book = k.headerKnap === 'book';
// Design 1 = Klassisk, 2 = Kraftig (dark, bold), 3 = Blød (light, serif)
const design = String(k.design || 1);
const DESIGNS = {
  1: '',
  2: '\n<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="/udkast/_faelles/design-2.css">',
  3: '\n<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="/udkast/_faelles/design-3.css">'
};
if (!(design in DESIGNS)) throw new Error('design skal være 1, 2 eller 3');

const vars = {
  NAVN: k.navn, KORT: tokens.KORT, BOGSTAV: tokens.KORT[0], SLUG: k.slug, FAG: k.fag, BY: k.by,
  TLF: k.tlf, TLF_LINK: tel, EMAIL: k.email, ADRESSE: k.adresse, CVR: k.cvr, AAR: k.aar,
  OPGAVER: k.opgaver, OPGAVER_TEKST: k.opgaverTekst, ANSATTE: k.ansatte, ANSATTE_TEKST: k.ansatteTekst,
  FARVE: k.farve, FARVE_LYS: k.farveLys || mix(k.farve, 0.86), FARVE_TEKST: ink(k.farve),
  OVERSKRIFT: k.overskrift, INTRO: k.intro, CTA: k.cta, CTA_KORT: k.ctaKort,
  BADGE_TITEL: k.badge[0], BADGE_TEKST: k.badge[1], TRIN_OVERSKRIFT: k.trinOverskrift,
  BAND_OVERSKRIFT: k.band[0], BAND_TEKST: k.band[1],
  YDELSER_FORSIDE: k.ydelserForside, YDELSER_OVERSKRIFT: k.ydelserOverskrift, YDELSER_INTRO: k.ydelserIntro,
  OM_OVERSKRIFT: k.omOverskrift, OM_KORT: k.omKort, OM_LANG: k.omLang,
  KONTAKT_OVERSKRIFT: k.kontaktOverskrift, KONTAKT_TEKST: k.kontaktTekst,
  FORM_VALG: k.formValg, FORM_BESKED: k.formBesked, FORM_KNAP: k.formKnap,
  OMRAADER_TEKST: tokens.OMRAADER + '.',
  HEADER_KNAP: book ? 'Book tid' : `Ring ${k.tlf}`
};
const raw = {
  FARVER: farver.map((c, i) => `<button type="button" class="swatch${i === 0 ? ' is-on' : ''}" style="background:${c}" data-c="${c}" data-soft="${mix(c, 0.86)}" data-ink="${ink(c)}" aria-label="Farve ${i + 1}" aria-pressed="${i === 0}"></button>`).join(''),
  DESIGN_KLASSE: 'd' + design, DESIGN_LINKS: DESIGNS[design],
  HEADER_LINK: book ? `/${k.slug}-kontakt` : `tel:${tel}`,
  FARVE_URL: encodeURIComponent(k.farve), KORT_URL: encodeURIComponent(tokens.KORT),
  TRUST: k.trust.map(t => `<div><i>✓</i>${esc(t)}</div>`).join(''),
  TRIN: k.trin.map(([t, p]) => `<div class="step"><h3 class="h3">${esc(t)}</h3><p>${esc(p)}</p></div>`).join(''),
  VAERDIER: k.vaerdier.map(([t, p], i) => `<div class="card"><div class="card__ic">${i + 1}</div><h3 class="h3">${esc(t)}</h3><p>${esc(p)}</p></div>`).join(''),
  YDELSER_KORT: k.ydelser.slice(0, 3).map((y, i) => `<a href="/${k.slug}-ydelser" class="card"><div class="card__ic">${i + 1}</div><h3 class="h3">${esc(y.titel)}</h3><p>${esc(y.tekst)}</p><span class="card__more">Læs mere →</span></a>`).join(''),
  YDELSER_LISTE: k.ydelser.map((y, i) => `<div class="card"><div class="card__ic">${i + 1}</div><h3 class="h3">${esc(y.titel)}</h3><p>${esc(y.tekst)}</p>${y.pris ? `<div class="card__price">${esc(y.pris)}</div>` : ''}</div>`).join(''),
  YDELSER_VALG: k.ydelser.map(y => `<option>${esc(y.titel)}</option>`).join(''),
  FORDELE: k.fordele.map(f => `<li>${esc(f)}</li>`).join(''),
  FAQ: k.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join(''),
  ANMELDELSER: k.anmeldelser.map(([t, n, s]) => `<figure class="review"><b class="stars" aria-label="5 ud af 5 stjerner">★★★★★</b><blockquote>${esc(t)}</blockquote><figcaption><strong>${esc(n)}</strong>${esc(s)}</figcaption></figure>`).join(''),
  TIDER_TABEL: k.tider.map(([d, t]) => `<tr><td>${esc(d)}</td><td>${esc(t)}</td></tr>`).join(''),
  TIDER_FOOT: k.tider.map(([d, t]) => `<p>${esc(d)}: ${esc(t)}</p>`).join('')
};
const titles = { forside: `${k.fag} i ${k.by}`, ydelser: 'Ydelser', 'om-os': 'Om os', kontakt: 'Kontakt' };

const fill = (s, page) => s
  .replace('{{HEAD}}', tpl('_head.html')).replace('{{FOOT}}', tpl('_foot.html'))
  .replace(/\{\{AKTIV_([a-z-]+)\}\}/g, (_, p) => (p === page ? ' aria-current="page"' : ''))
  .replace(/\{\{TITEL\}\}/g, esc(titles[page]))
  .replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => {
    if (key in raw) return raw[key];
    if (vars[key] === undefined) throw new Error(`Mangler feltet for ${key} i branche- eller kundefilen`);
    return esc(vars[key]);
  });

mkdirSync(out, { recursive: true });
for (const page of Object.keys(titles)) writeFileSync(join(out, `${page}.html`), fill(tpl(`${page}.html`), page));
console.log(`Udkast klar (${k.branche}, design ${design}):`);
for (const page of Object.keys(titles)) console.log(`  https://webleads.dk/${k.slug}-${page}`);
