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
//   5 or more       an infinity scroll: one endless row across the whole width of the screen; visitors can
//                   grab it and throw it. It only moves when the list is wider than the screen, so nobody is
//                   on screen twice (on a very wide screen a short list stands still).
//   Reduced motion: a grid, and on phones a row you swipe.
// The customers Mikkel listed on 4 Nov 2026. On 5 Nov the logos were taken from each customer's own site
// (assets/partnere/), and navn, fag and by from the same site (the name the site uses, the address by its CVR;
// Holms Maler is in Hvidovre, as Mikkel confirmed, although the CVR address on its site is in Brøndby).
// Holms Maler and Carelax use a white logo on their sites, so the files here are their dark versions: Carelax's
// own dark logo and Holms' wordmark in dark ink. Uniq's logo is a JPG on white; the white around it is made
// transparent. mikkelbranth.dk could not be reached, so it has no logo, fag or by yet.
export const partnere = [
  { navn: 'Nuttet Baby', fag: 'Babytøj og legetøj', by: 'Hvidovre', url: 'https://nuttetbaby.dk', logo: '/assets/partnere/nuttetbaby.png' },
  { navn: 'By Minella', fag: 'Hoftesæder', by: 'Køge', url: 'https://byminella.dk', logo: '/assets/partnere/byminella.png' },
  { navn: 'IWAO', fag: 'Massagestole', by: 'Glostrup', url: 'https://iwao.dk', logo: '/assets/partnere/iwao.svg' },
  { navn: 'RecoveryM8', fag: 'Recovery-udstyr', by: 'Glostrup', url: 'https://recoverym8.dk', logo: '/assets/partnere/recoverym8.png' },
  { navn: 'Carelax Danmark', fag: 'Massagestole', by: 'Glostrup', url: 'https://carelaxdanmark.dk', logo: '/assets/partnere/carelax.svg' },
  { navn: 'GladTeknik', fag: 'IT-support', by: 'Hvidovre', url: 'https://gladteknik.dk', logo: '/assets/partnere/gladteknik.png' },
  { navn: 'Uniq VVS-Teknik', fag: 'VVS', by: 'Stenløse', url: 'https://uniqvvs.dk', logo: '/assets/partnere/uniqvvs.png' },
  { navn: 'Holms Maler Entreprise', fag: 'Maler', by: 'Hvidovre', url: 'https://holmsmaler.dk', logo: '/assets/partnere/holmsmaler.png' },
  { navn: 'mikkelbranth.dk', url: 'https://mikkelbranth.dk' },
  { navn: 'Raadvad Kro', fag: 'Kro og restaurant', by: 'Kongens Lyngby', url: 'https://raadvadkro.dk', logo: '/assets/partnere/raadvadkro.png' },
  { navn: 'Fastelavnskostumer.dk', fag: 'Kostumer', by: 'Hvidovre', url: 'https://fastelavnskostumer.dk', logo: '/assets/partnere/fastelavnskostumer.png' },
  { navn: 'Halloweenkostumer.dk', fag: 'Kostumer', by: 'Hvidovre', url: 'https://halloweenkostumer.dk', logo: '/assets/partnere/halloweenkostumer.png' },
  { navn: '3Match', fag: 'Tilbud fra håndværkere', by: 'Hvidovre', url: 'https://3match.dk', logo: '/assets/partnere/3match.png' }
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
