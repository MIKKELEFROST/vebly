// Builds the data the "Sådan virker det" demo (demo/) uses to become the visitor's own local business:
//   demo/fag.json        trade texts and photos, taken from the draft templates in api/_lib/udkast/brancher
//   demo/postnumre.json  Danish postal districts and the municipalities they lie in (only with a CSV path)
//
// Run it again after changing a draft template:   node scripts/demo/data.mjs
// The postal districts come from PostNord's postal code file, as packaged in the npm package dk-postals
// (postals.csv: AMTS_NR;ADRESSERINGSNAVN;KOMMUNE_NR;ADRESSERINGSNAVN_1;POSTNR;BYNAVN):
//   node scripts/demo/data.mjs path/to/postals.csv
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const dir = new URL('api/_lib/udkast/brancher/', root);

// "Din lokale ___ i Aarhus", and whether the business comes out to the customer (or the customer comes to it)
const LOKAL = {
  toemrer: ['tømrer', true], maler: ['maler', true], elektriker: ['elektriker', true], vvs: ['VVS-installatør', true],
  rengoering: ['rengøringsfirma', true], frisoer: ['frisør', false], klinik: ['klinik', false],
  fysioterapeut: ['fysioterapeut', false], 'personlig-traener': ['personlige træner', false], revisor: ['revisor', false],
  generisk: ['', true]
};
// "{{BY}}" in the templates becomes "{by}"; the demo fills it in
const by = s => String(s).replace(/\{\{BY\}\}/g, '{by}');
const small = src => (src ? src.replace(/\.webp$/, '-480.webp') : '');

const fag = {};
for (const file of readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
  const id = file.replace('.json', ''), t = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
  if (!LOKAL[id]) throw new Error(`No "Din lokale …" word for ${id} in scripts/demo/data.mjs`);
  const b = (t.billeder || [])[0] || {};
  fag[id] = {
    fag: t.fag,
    lokal: LOKAL[id][0],
    ud: LOKAL[id][1],
    intro: by(t.intro),
    cta: t.cta,
    ctaKort: t.ctaKort,
    ydelserOverskrift: t.ydelserOverskrift,
    ydelser: t.ydelser.slice(0, 3).map(y => [y.titel, y.tekst]),
    trin: t.trin.slice(0, 3),
    anmeldelse: t.anmeldelser[0].map(by),
    // "Mandag–torsdag 7–16" → "Man–tor 7–16"
    tider: t.tider.slice(0, 2).map(([d, h]) => `${d.replace(/(man|tirs|ons|tors|fre|lør|søn)dag/gi, m => m.slice(0, 3))} ${h.replace(/^E/, 'e')}`).join(' · '),
    billeder: b.hero ? { hero: small(b.hero), svc: small((b.galleri || [])[0] || b.om), quote: small(b.om) } : null
  };
}
writeFileSync(new URL('demo/fag.json', root), JSON.stringify(fag) + '\n');
console.log('demo/fag.json:', Object.keys(fag).length, 'trades');

const csv = process.argv[2];
if (csv) {
  const rows = readFileSync(csv, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/).slice(1).map(l => l.split(';'));
  // [postnr, name, [municipality numbers]]: the municipality named like the town first ("Køge" → Køge Kommune),
  // because a district can reach into neighbouring municipalities
  const words = s => s.toLocaleLowerCase('da-DK').replace(/ kommune$/, '').replace(/s$/, '').split(/[\s-]+/).filter(w => w.length > 3);
  const byNr = new Map();
  for (const [, , kommune, kommunenavn, postnr, navn] of rows) {
    const nr = Number(postnr);
    if (nr < 1050) continue; // company, sorting and PO box codes, not places
    const e = byNr.get(nr) || [nr, navn.trim(), []];
    const k = Number(kommune), own = words(kommunenavn).some(w => words(navn).includes(w));
    if (!e[2].includes(k)) own ? e[2].unshift(k) : e[2].push(k);
    byNr.set(nr, e);
  }
  const p = [...byNr.values()].sort((a, b) => a[0] - b[0]);
  writeFileSync(new URL('demo/postnumre.json', root), JSON.stringify(p) + '\n');
  console.log('demo/postnumre.json:', p.length, 'postal districts');
}
