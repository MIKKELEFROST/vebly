// Partnere: the businesses Webleads has helped. Shown as a scroll right under the hero on the front page
// and as a wall on the results page (scripts/services/front/partnere.mjs).
//
// Only real customers, and only with their permission. One line per customer, in the order to show them:
//
//   { navn: 'Nordvik', fag: 'Tømrer', by: 'København', url: 'https://nordvik.dk', logo: '/assets/partnere/nordvik.svg' },
//
//   navn  required. The name as the customer writes it.
//   fag   required. The trade, short: 'Tømrer', 'Frisør', 'Fysioterapeut', 'Webshop'.
//   by    required. The town: 'København', 'Aarhus'.
//   url   optional. Their own website, starting with https://. The name becomes a link that opens in a new tab.
//   logo  optional. Their logo as an SVG or PNG under /assets/partnere/, for instance '/assets/partnere/nordvik.svg'.
//         A wide logo in dark colours on a transparent background works best (about 4:1, at least 240 px wide
//         for a PNG). It is shown in grey and turns to colour on hover. Without a logo the name is set as a
//         wordmark in our own type, with its first letter as a small mark.
//
// The front page shows the scroll as soon as there is one customer here: node scripts/services/build.mjs forside
//   1–4 customers   a calm row that stands still
//   5–9             one row that drifts sideways
//   10 or more      two rows that drift in opposite directions
export const partnere = [];

// Made-up businesses, for a local look only: PARTNERE_EKSEMPEL=1 node scripts/services/build.mjs forside
// (the page then marks them "Eksempel"). They are not customers: never build the live page with them.
// The names are the same made-up businesses as on /referencer, plus Nordvik and two more.
export const eksempler = [
  { navn: 'Nordvik', fag: 'Tømrer', by: 'København' },
  { navn: 'Klinik Fryd', fag: 'Fysioterapeut', by: 'Aarhus' },
  { navn: 'Salon Lys', fag: 'Frisør', by: 'Odense' },
  { navn: 'Hansen VVS', fag: 'VVS', by: 'Vejle' },
  { navn: 'Revisorhuset Nord', fag: 'Revisor', by: 'Hjørring' },
  { navn: 'Studio Puls', fag: 'Personlig træner', by: 'København' },
  { navn: 'Lund El', fag: 'Elektriker', by: 'Kolding' },
  { navn: 'Sand & Salt', fag: 'Webshop', by: 'Skagen' },
  { navn: 'Kofoed Maler', fag: 'Maler', by: 'Roskilde' },
  { navn: 'Ren Hverdag', fag: 'Rengøring', by: 'Aalborg' },
  { navn: 'Klinik Ro', fag: 'Massage', by: 'Svendborg' },
  { navn: 'Brink Tømrer', fag: 'Tømrer', by: 'Silkeborg' }
];
