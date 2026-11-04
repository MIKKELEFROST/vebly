// Partnere: the businesses Webleads has helped. Shown as a band right under the hero on the front page
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
//         for a PNG). It is shown in grey and turns to colour on hover. A white or very pale logo disappears
//         on the light page: use a dark version. An SVG needs a viewBox. Without a logo the name is set as a
//         wordmark in our own type, with its first letter as a small mark.
//
// The front page shows the band as soon as there is one customer here: node scripts/services/build.mjs forside
//   1–4 customers   a calm row that stands still
//   5 or more       drifts sideways inside the page width; visitors can grab it and throw it. It only moves
//                   when the list is wider than the band, so nobody is on screen twice (on a wide screen a
//                   short list stands still). From 10, two rows the other way round, when both rows are
//                   still wider than the band.
//   Reduced motion: a grid, and on phones a row you swipe.
// The customers Mikkel listed on 4 Nov 2026. Their sites could not be opened from the build machine, so the
// names are their domains and fag/by are only set where they were checked (public company listings).
// Add logo: '/assets/partnere/<file>' when we have their logos.
export const partnere = [
  { navn: 'nuttetbaby.dk', url: 'https://nuttetbaby.dk' },
  { navn: 'byminella.dk', url: 'https://byminella.dk' },
  { navn: 'iwao.dk', url: 'https://iwao.dk' },
  { navn: 'recoverym8.dk', url: 'https://recoverym8.dk' },
  { navn: 'carelaxdanmark.dk', fag: 'Massagestole', by: 'Glostrup', url: 'https://carelaxdanmark.dk' },
  { navn: 'gladteknik.dk', fag: 'IT og elektronik', by: 'Hvidovre', url: 'https://gladteknik.dk' },
  { navn: 'uniqvvs.dk', fag: 'VVS', url: 'https://uniqvvs.dk' },
  { navn: 'holmsmaler.dk', fag: 'Maler', url: 'https://holmsmaler.dk' },
  { navn: 'mikkelbranth.dk', url: 'https://mikkelbranth.dk' },
  { navn: 'raadvadkro.dk', fag: 'Kro og restaurant', by: 'Kongens Lyngby', url: 'https://raadvadkro.dk' },
  { navn: 'fastelavnskostumer.dk', fag: 'Kostumer', url: 'https://fastelavnskostumer.dk' },
  { navn: 'halloweenkostumer.dk', fag: 'Kostumer', url: 'https://halloweenkostumer.dk' },
  { navn: '3match.dk', url: 'https://3match.dk' }
];

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
