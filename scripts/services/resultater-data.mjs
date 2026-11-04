// The cases and quotes on /resultater (scripts/services/pages/resultater.mjs). Build after a change:
//   node scripts/services/build.mjs resultater
//
// EKSEMPEL: every case and quote below is made up (the same made-up businesses as on /referencer), to show
// how the page will look. While any of them has eksempel: true, the page is not indexed, it shows a note at
// the top, and everything made up is marked "Eksempel". Replace them with real customers (with their
// permission) and remove eksempel: true: the note and the noindex go away by themselves.
//
// A case:
//   id               short, unique and lowercase: 'hansen-vvs'. A quote points to its case with it.
//   navn, fag, by    the name, the trade and the town: 'Hansen VVS', 'VVS', 'Vejle'.
//   farve, lys       the customer's own colour and a light tint of it, for the drawing of their site.
//   overskrift, knap the headline and the button on their site: 'Hurtig hjælp. Fast pris.', 'Ring nu'.
//   billede          for an example: a photo '<fag>/<photo>' from /udkast/_faelles/billeder/ ('vvs/hero-2').
//                    For a real customer: a screenshot of their site, starting with '/', about 16:10
//                    ('/assets/cases/hansen-vvs.webp'). It is shown in the browser frame instead of the drawing.
//   tekst            one line about what we did (shown when the case has no quote).
//   services         the services used, as in /services/<slug>: 'hjemmesider', 'google-ads', 'meta-ads',
//                    'google-shopping-ads', 'seo', 'geo', 'ai', 'automations', 'email-marketing', 'cro'.
//                    The filter on the page has a button for each service that is used.
//   resultater       two results: { v: '+62 %', l: 'flere opkald fra siden' }. With fra, the number counts
//                    from that value instead of from 0: { v: '0,9 sek.', fra: '6,8', l: '…' }.
//   historie         on one case only: the scroll story near the top of the page (see Hansen VVS).
//   eksempel         true while it is made up.
export const cases = [
  {
    id: 'hansen-vvs', navn: 'Hansen VVS', fag: 'VVS', by: 'Vejle', farve: '#1f5f4a', lys: '#e2efe9',
    overskrift: 'Hurtig hjælp. Fast pris.', knap: 'Ring nu', billede: 'vvs/hero-2',
    tekst: 'Fra en side fra 2012 til en, der faktisk giver opkald.',
    services: ['hjemmesider', 'google-ads'],
    resultater: [{ v: '+62 %', l: 'flere opkald fra siden' }, { v: '0,9 sek.', fra: '6,8', l: 'at åbne siden, før 6,8 sek.' }],
    // The story: four steps. The three numbers change in step 2, 3 and 4, and the result comes in step 4.
    historie: {
      h2: ['Fra en side fra 2012.', 'Til en, der giver opkald.'],
      lead: 'Et VVS-firma i Vejle fik ny hjemmeside og Google Ads. Scroll, og se hvad der skete.',
      gammel: { aar: '2012', titel: 'Velkommen til Hansen VVS ApS', under: 'VVS-arbejde i Vejle og omegn siden 1998' },
      // Three boxes on the new site in the drawing
      ydelser: [['Akut hjælp', 'Samme dag'], ['Badeværelse', 'Fast pris'], ['Varmepumpe', 'Service hele året']],
      trin: [
        ['Udgangspunktet', 'En side fra 2012. Langsom, svær at bruge på mobilen, og telefonen ringede sjældent.'],
        ['Ny hjemmeside', 'Hurtig, skarp på mobilen og med »Ring nu« øverst. Kunden ringer med ét tryk.'],
        ['Google Ads', 'Annoncer på akutopgaver i Vejle og omegn. De vises, når nogen søger efter en VVS’er.'],
        ['Resultatet', 'Efter tre måneder ringer telefonen oftere. Og det er kunder fra lokalområdet.']
      ],
      tal: [
        { l: 'At åbne siden', fra: '6,8 sek.', til: '0,9 sek.' },
        { l: 'Besøg fra Google', fra: '140', til: '520', s: 'om måneden' },
        { l: 'Opkald fra siden', fra: '21', til: '34', s: 'om måneden' }
      ],
      // Step 3 on the drawing: the ad (label '' for a normal search result, fx for SEO)
      annonce: { label: 'Annonce', titel: 'VVS i Vejle | Hurtig hjælp, fast pris', tekst: 'Akut hjælp samme dag. Du får prisen, før vi går i gang.' },
      resultat: { v: '+62 %', l: 'flere opkald fra siden på tre måneder' }
    },
    eksempel: true
  },
  {
    id: 'klinik-fryd', navn: 'Klinik Fryd', fag: 'Fysioterapeut', by: 'Aarhus', farve: '#2b4c7e', lys: '#e3eaf5',
    overskrift: 'Fri for smerter. Hurtigere.', knap: 'Book tid', billede: 'fysioterapeut/hero-1',
    tekst: 'Online booking direkte på siden og side 1 på Google lokalt.',
    services: ['hjemmesider', 'seo', 'automations'],
    resultater: [{ v: '71 %', l: 'af bookingerne kommer online' }, { v: 'Side 1', l: 'på Google i Aarhus' }],
    eksempel: true
  },
  {
    id: 'salon-lys', navn: 'Salon Lys', fag: 'Frisør', by: 'Odense', farve: '#b0476b', lys: '#f6e4ea',
    overskrift: 'Hår, der holder hele ugen.', knap: 'Book nu', billede: 'frisoer/hero-1',
    tekst: 'Instagram-annoncer og en side, der sender folk direkte til booking.',
    services: ['hjemmesider', 'meta-ads'],
    resultater: [{ v: '+38', l: 'nye kunder om måneden' }, { v: '41 kr.', l: 'pr. booking fra annoncerne' }],
    eksempel: true
  },
  {
    id: 'kofoed-maler', navn: 'Kofoed Maler', fag: 'Maler', by: 'Roskilde', farve: '#c2702a', lys: '#f8ead9',
    overskrift: 'Malet ordentligt. Første gang.', knap: 'Få tilbud', billede: 'maler/hero-2',
    tekst: 'Tilbudsformular med billeder, så de kan give pris uden at køre ud.',
    services: ['hjemmesider', 'automations'],
    resultater: [{ v: '×3', l: 'flere forespørgsler på tilbud' }, { v: '1 time', l: 'fra forespørgsel til svar' }],
    eksempel: true
  },
  {
    id: 'ren-hverdag', navn: 'Ren Hverdag', fag: 'Rengøring', by: 'Aalborg', farve: '#2f7d8c', lys: '#e0f0f2',
    overskrift: 'Rent hjem. Hver anden uge.', knap: 'Beregn pris', billede: 'rengoering/hero-1',
    tekst: 'Prisberegner på siden og automatiske påmindelser til kunderne.',
    services: ['hjemmesider', 'automations'],
    resultater: [{ v: '+54', l: 'nye faste kunder' }, { v: '−80 %', l: 'færre aflyste besøg' }],
    eksempel: true
  },
  {
    id: 'brink-toemrer', navn: 'Brink Tømrer', fag: 'Tømrer', by: 'Silkeborg', farve: '#5b4636', lys: '#efe7df',
    overskrift: 'Tag, terrasse og tilbygning.', knap: 'Ring nu', billede: 'toemrer/hero-1',
    tekst: 'Galleri med egne projekter og Google-profil sat helt op.',
    services: ['hjemmesider', 'seo'],
    resultater: [{ v: '+210 %', l: 'flere visninger på Google' }, { v: '47', fra: '12', l: 'anmeldelser, før 12' }],
    eksempel: true
  },
  {
    id: 'lund-el', navn: 'Lund El', fag: 'Elektriker', by: 'Kolding', farve: '#a87c00', lys: '#fbf1cf',
    overskrift: 'Strøm på. Samme dag.', knap: 'Ring nu', billede: 'elektriker/hero-1',
    tekst: 'Google Ads på akutopgaver og en side, der virker med én hånd på mobilen.',
    services: ['hjemmesider', 'google-ads'],
    resultater: [{ v: '+44', l: 'akutopkald om måneden' }, { v: '68 kr.', l: 'pr. opkald fra annoncerne' }],
    eksempel: true
  },
  {
    id: 'revisorhuset-nord', navn: 'Revisorhuset Nord', fag: 'Revisor', by: 'Hjørring', farve: '#111111', lys: '#ecebe7',
    overskrift: 'Styr på tallene. Hele året.', knap: 'Book møde', billede: 'revisor/hero-2',
    tekst: 'Rolig, troværdig side og et kundeportal-login til dokumenter.',
    services: ['hjemmesider', 'automations'],
    resultater: [{ v: '−65 %', l: 'færre mails om dokumenter' }, { v: '+9', l: 'nye kunder på tre måneder' }],
    eksempel: true
  },
  {
    id: 'studio-puls', navn: 'Studio Puls', fag: 'Personlig træner', by: 'København', farve: '#7a3fd0', lys: '#ece3fa',
    overskrift: 'Stærkere på 12 uger.', knap: 'Start nu', billede: 'personlig-traener/hero-1',
    tekst: 'Landingsside til forløb og Meta-annoncer, der fylder holdene.',
    services: ['hjemmesider', 'meta-ads', 'automations'],
    resultater: [{ v: '9 af 10', l: 'hold er fyldt op' }, { v: '+120', l: 'henvendelser om måneden' }],
    eksempel: true
  }
];

// What the customers say. One quote per case (case: its id), shown on the case's card, and the featured
// case's quote at the end of its story. Only real quotes, with permission; eksempel: true while made up.
export const quotes = [
  { case: 'hansen-vvs', tekst: 'Jeg brugte 15 minutter i telefonen, og en uge senere ringede folk fra Google. Det er første gang, en hjemmeside har givet mig kunder.', navn: 'Jesper Hansen', rolle: 'Ejer', eksempel: true },
  { case: 'klinik-fryd', tekst: 'Booking direkte fra siden har sparet os for et hav af opkald. Vi har fået mere tid til patienterne.', navn: 'Mette Lund', rolle: 'Fysioterapeut og ejer', eksempel: true },
  { case: 'salon-lys', tekst: 'Fast pris, ingen binding og en side, jeg selv ejer. Det burde ikke være så sjældent, men det er det.', navn: 'Sara Holm', rolle: 'Frisør og ejer', eksempel: true },
  { case: 'kofoed-maler', tekst: 'Kunderne sender billeder med det samme, så jeg kan give en pris uden at køre ud først.', navn: 'Thomas Kofoed', rolle: 'Malermester', eksempel: true },
  { case: 'ren-hverdag', tekst: 'Kunderne regner selv prisen ud, og påmindelserne sender sig selv. Det har givet ro i kalenderen.', navn: 'Louise Brandt', rolle: 'Ejer', eksempel: true },
  { case: 'brink-toemrer', tekst: 'Folk ringer og siger, at de har set terrassen på siden. Så er halvdelen af salget klaret.', navn: 'Mads Brink', rolle: 'Tømrermester', eksempel: true },
  { case: 'lund-el', tekst: 'Når nogen står uden strøm, ringer de til den første, de finder. Nu er det os.', navn: 'Kasper Lund', rolle: 'Elinstallatør', eksempel: true },
  { case: 'revisorhuset-nord', tekst: 'Kunderne finder selv deres papirer i portalen. Vi bruger tiden på rådgivning i stedet for på mails.', navn: 'Anne Nørgaard', rolle: 'Partner', eksempel: true },
  { case: 'studio-puls', tekst: 'Holdene fylder sig selv nu. Jeg bruger tiden på at træne folk, ikke på at jagte dem.', navn: 'Jonas Friis', rolle: 'Træner og ejer', eksempel: true }
];
