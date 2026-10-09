// Renders a website draft (udkast) from a trade template plus the customer's own details.
// Used by scripts/nyt-udkast.mjs (hand-made drafts, written to udkast/<slug>/) and by
// api/udkast.js (instant drafts from the "Bestil en hjemmeside" flow, rendered on request).
//
// 1. brancher/<branche>.json holds everything that is the same for a trade
//    (services, prices, FAQ, steps, opening hours, wording of buttons).
// 2. The customer data holds what is unique: name, town, nearby areas, phone, colour, and
//    any field from the trade file it wants to override (e.g. its own list of services).
// Text in both may use {{KORT}}, {{NAVN}}, {{BY}}, {{AAR}}, {{ERFARING}} and {{OMRAADER}}.
import { readFileSync, readdirSync } from 'node:fs';

const dir = new URL('./', import.meta.url);
const cache = {};
const tpl = f => (cache[f] ??= readFileSync(new URL(`skabelon/${f}`, dir), 'utf8'));

export const PAGES = ['forside', 'ydelser', 'om-os', 'kontakt'];
export const BRANCHER = readdirSync(new URL('brancher/', dir)).filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
export const branche = name => {
  if (!BRANCHER.includes(name)) throw new Error(`Ukendt branche: ${name}. Brancher: ${BRANCHER.join(', ')}`);
  return (cache['b:' + name] ??= JSON.parse(readFileSync(new URL(`brancher/${name}.json`, dir), 'utf8')));
};

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hex = h => h.replace('#', '').match(/../g).map(x => parseInt(x, 16));
export const mix = (h, w) => '#' + hex(h).map(v => Math.round(v + (255 - v) * w).toString(16).padStart(2, '0')).join('');
const lum = h => { const [r, g, b] = hex(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ink = c => (lum(c) > 0.4 ? '#14140f' : '#ffffff');
// Alternatives offered in the colour picker next to the customer's own colour
export const ALT = ['#1f5f4a', '#b5532f', '#2b2b2b', '#1d4e89', '#7a3fd0'];
// Design 1 = Klassisk, 4 = Mosaik, 5 = Minimal (2 and 3 were retired; the numbers are kept so old links still match)
const DESIGNS = {
  1: '',
  4: '\n<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="/udkast/_faelles/design-4.css">',
  5: '\n<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600&display=swap" rel="stylesheet">\n<link rel="stylesheet" href="/udkast/_faelles/design-5.css">'
};
export const DESIGN_NUMRE = Object.keys(DESIGNS).map(Number);

// data: the customer fields (branche, slug, navn, kort, by, omraader, tlf, email, adresse, cvr, aar,
//       opgaver, ansatte, farve, design, …) plus optional overrides of any trade field.
// opts.link(page): the address of a page in this draft (default /<slug>-<page>)
// opts.knap: HTML for the button in the Webleads bar at the bottom (default: "Giv feedback" by e-mail)
// opts.head: extra HTML at the end of <head> (e.g. a <style> that hides sections)
export function renderDraft(data, page, opts = {}) {
  if (!PAGES.includes(page)) throw new Error(`Ukendt side: ${page}`);
  const k = { ...branche(data.branche), ...data };
  const link = opts.link || (p => `/${k.slug}-${p}`);

  // Fill {{…}} tokens inside the trade/customer text
  const list = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' og ' + a[a.length - 1] : a.join('');
  const omraader = [k.by, ...(k.omraader || [])];
  const tokens = { KORT: k.kort || k.navn, NAVN: k.navn, BY: k.by, AAR: k.aar, ERFARING: String(2026 - Number(k.aar)), OMRAADER: list(omraader) };
  const deep = v => typeof v === 'string' ? v.replace(/\{\{([A-Z]+)\}\}/g, (m, t) => tokens[t] ?? m) : Array.isArray(v) ? v.map(deep) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([a, b]) => [a, deep(b)])) : v;
  Object.assign(k, deep(k));

  const tel = k.tlf.replace(/[^\d+]/g, '');
  const farver = (k.farver && k.farver.length ? k.farver : [k.farve, ...ALT.filter(c => c.toLowerCase() !== k.farve.toLowerCase())]).slice(0, 3);
  const book = k.headerKnap === 'book';
  // Trades with a warranty (maler, tømrer, el, VVS) promise it; the others lead with their first trust point
  const garanti = k.garanti || '';
  const loefte = garanti ? `fast pris og ${garanti}s garanti` : k.trust[0].toLowerCase();
  const design = String(k.design || 1);
  if (!(design in DESIGNS)) throw new Error('design skal være 1, 4 eller 5');

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
    HEADER_KNAP: book ? 'Book tid' : `Ring ${k.tlf}`,
    ANTAL_ANMELDELSER: k.antalAnmeldelser || 48, ERFARING: tokens.ERFARING,
    BEVIS_TAL: garanti || k.ansatte, BEVIS_TEKST: garanti ? 'Garanti på arbejdet' : k.ansatteTekst
  };
  const raw = {
    FARVER: farver.map((c, i) => `<button type="button" class="swatch${i === 0 ? ' is-on' : ''}" style="background:${c}" data-c="${c}" data-soft="${mix(c, 0.86)}" data-ink="${ink(c)}" aria-label="Farve ${i + 1}" aria-pressed="${i === 0}"></button>`).join(''),
    DESIGN_KLASSE: 'd' + design, DESIGN_LINKS: DESIGNS[design],
    HEADER_LINK: book ? esc(link('kontakt')) : `tel:${tel}`,
    FARVE_URL: encodeURIComponent(k.farve), KORT_URL: encodeURIComponent(tokens.KORT),
    EKSTRA_HEAD: opts.head || '',
    UDKAST_KNAP: opts.knap || `<a href="mailto:hej@webleads.dk?subject=Udkast%20til%20${encodeURIComponent(tokens.KORT)}">Giv feedback</a>`,
    TRUST: k.trust.map(t => `<div><i>✓</i>${esc(t)}</div>`).join(''),
    TRIN: k.trin.map(([t, p]) => `<div class="step"><h3 class="h3">${esc(t)}</h3><p>${esc(p)}</p></div>`).join(''),
    VAERDIER: k.vaerdier.map(([t, p], i) => `<div class="card"><div class="card__ic">${i + 1}</div><h3 class="h3">${esc(t)}</h3><p>${esc(p)}</p></div>`).join(''),
    YDELSER_KORT: k.ydelser.slice(0, 3).map((y, i) => `<a href="${esc(link('ydelser'))}" class="card"><div class="card__ic">${i + 1}</div><h3 class="h3">${esc(y.titel)}</h3><p>${esc(y.tekst)}</p><span class="card__more">Læs mere →</span></a>`).join(''),
    YDELSER_LISTE: k.ydelser.map((y, i) => `<div class="card"><div class="card__ic">${i + 1}</div><h3 class="h3">${esc(y.titel)}</h3><p>${esc(y.tekst)}</p>${y.pris ? `<div class="card__price">${esc(y.pris)}</div>` : ''}</div>`).join(''),
    YDELSER_VALG: k.ydelser.map(y => `<option>${esc(y.titel)}</option>`).join(''),
    FORDELE: k.fordele.map(f => `<li>${esc(f)}</li>`).join(''),
    FAQ: k.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join(''),
    ANMELDELSER: k.anmeldelser.map(([t, n, s]) => `<figure class="review"><b class="stars" aria-label="5 ud af 5 stjerner">★★★★★</b><blockquote>${esc(t)}</blockquote><figcaption><strong>${esc(n)}</strong>${esc(s)}</figcaption></figure>`).join(''),
    TIDER_TABEL: k.tider.map(([d, t]) => `<tr><td>${esc(d)}</td><td>${esc(t)}</td></tr>`).join(''),
    PROJEKTER: (k.projekter || [['Projekt', k.by, ''], ['Projekt', k.by, ''], ['Projekt', k.by, '']]).map(([t, sted, x]) => `<figure><div class="ph" role="img" aria-label="${esc(t)} i ${esc(sted)} udført af ${esc(tokens.KORT)}"><span>Billede af opgaven</span></div><figcaption><b>${esc(t)}</b><span>${esc(sted)}${x ? ' · ' + esc(x) : ''}</span></figcaption></figure>`).join(''),
    MEDLEMSKABER: k.medlemskaber && k.medlemskaber.length ? `<div class="members"><span>Medlem af</span>${k.medlemskaber.map(m => `<b>${esc(m)}</b>`).join('')}</div>` : '',
    FRADRAG: k.fradrag ? `<div class="fradrag"><i>Fradrag</i><div><b>${esc(k.fradrag[0])}</b><p>${esc(k.fradrag[1])}</p></div></div>` : '',
    SCHEMA: '',
    TIDER_FOOT: k.tider.map(([d, t]) => `<p>${esc(d)}: ${esc(t)}</p>`).join('')
  };
  const titles = { forside: `${k.fag} i ${k.by}`, ydelser: 'Ydelser', 'om-os': 'Om os', kontakt: 'Kontakt' };
  // SEO: page titles and meta descriptions with trade + town (the draft itself stays noindex)
  const seo = {
    forside: [`${k.fag} i ${k.by} · ${loefte} | ${k.navn}`, `${k.navn} er ${k.fag.toLowerCase()} i ${k.by} og omegn. ${k.ydelser.slice(0, 3).map((y, i) => i ? y.titel.toLowerCase() : y.titel).join(', ')}. ${garanti ? `Fast pris, ${garanti}s garanti og svar samme dag` : k.trust.slice(0, 2).join('. ')}. Ring ${k.tlf}.`],
    ydelser: [`Ydelser og priser · ${k.fag} i ${k.by} | ${tokens.KORT}`, `Se ydelser og vejledende priser fra ${k.navn}: ${k.ydelser.map(y => y.titel.toLowerCase()).join(', ')}.`],
    'om-os': [`Om ${tokens.KORT} · ${k.fag} i ${k.by} siden ${k.aar}`, `Mød ${k.navn}: ${k.fag.toLowerCase()} i ${k.by} siden ${k.aar}. ${k.fordele.slice(0, 2).join('. ')}.`],
    kontakt: [`Kontakt ${tokens.KORT} · ${k.fag} i ${k.by}`, `Kontakt ${k.navn} på ${k.tlf} eller ${k.email}. ${k.adresse}. Vi kommer i ${tokens.OMRAADER}.`]
  };
  // Structured data for Google: the business (with its trade-specific type), and the FAQ
  const [gade, postby = ''] = k.adresse.split(',').map(s => s.trim());
  const [postnr, ...byDel] = postby.split(' ');
  const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
  const schema = ld({
    '@context': 'https://schema.org', '@type': k.schemaType || 'LocalBusiness',
    name: k.navn, description: k.intro, telephone: k.tlf.replace(/\s/g, ''), email: k.email, taxID: k.cvr, foundingDate: k.aar,
    ...(k.domaene ? { url: `https://${k.domaene}/` } : {}),
    address: { '@type': 'PostalAddress', streetAddress: gade, postalCode: postnr, addressLocality: byDel.join(' ') || k.by, addressCountry: 'DK' },
    areaServed: omraader.map(n => ({ '@type': 'City', name: n })),
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: String(k.antalAnmeldelser || 48) },
    makesOffer: k.ydelser.map(y => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: y.titel, description: y.tekst } }))
  }) + '\n' + ld({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: k.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

  return tpl(`${page}.html`)
    .replace('{{HEAD}}', tpl('_head.html')).replace('{{FOOT}}', tpl('_foot.html'))
    .replace(/\{\{AKTIV_([a-z-]+)\}\}/g, (_, p) => (p === page ? ' aria-current="page"' : ''))
    .replace(/\{\{LINK_([a-z-]+)\}\}/g, (_, p) => esc(link(p)))
    .replace(/\{\{TITEL\}\}/g, esc(titles[page]))
    .replace('{{SIDETITEL}}', esc(seo[page][0])).replace('{{SIDETITEL}}', esc(seo[page][0])).replace(/\{\{META\}\}/g, esc(seo[page][1]))
    .replace('{{SCHEMA}}', page === 'forside' ? schema : '')
    .replace(/\{\{([A-Z_]+)\}\}/g, (m, key) => {
      if (key in raw) return raw[key];
      if (vars[key] === undefined) throw new Error(`Mangler feltet for ${key} i branche- eller kundefilen`);
      return esc(vars[key]);
    });
}
