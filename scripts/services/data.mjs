// Content for the front page and the service pages under /services/.
// build.mjs turns this into index.html and services/<slug>/index.html (and og.mjs into share images).
// /services/hjemmesider is the old front page and is edited by hand; only its list of services at
// the bottom comes from here.
//
// Prices: only the ones we actually sell at. A service without a price says "Fast pris efter en snak"
// until Mikkel has set one (price: null). Never invent numbers, results or customers here.

export const SITE = 'https://webleads.dk';

// The cards on the front page (and "Andre services" on each service page), in this order.
// value is the start price in kroner, used as the value of a lead for Meta (0 = no fixed price).
export const services = [
  { slug: 'hjemmesider', t: 'Hjemmesider', price: 'fra 2.995 kr.', value: 2995, d: 'Tre pakker, fra en enkel one page til en hjemmeside bygget til Google.', ex: ['Simpel one page: 2.995 kr.', 'Normal hjemmeside: 9.995 kr.', 'SEO hjemmeside: 29.995 kr.'] },
  { slug: 'webshop', t: 'Webshop', price: 'fra 12.995 kr.', value: 12995, d: 'Webshop på Shopify med betaling, fragt og dine produkter. Beregn selv prisen.', ex: ['Shopify Partner', '25 produkter med i prisen', 'Beregn din pris på siden'] },
  { slug: 'google-ads', t: 'Google Ads', price: '8.000 kr./md.', value: 8000, d: 'Vær øverst på Google, når kunderne søger lige nu.', ex: ['Søgeord og kampagner', 'Lokal målretning', 'Google Shopping med i prisen', 'Ekstra kanal: 5.000 kr./md.'] },
  { slug: 'meta-ads', t: 'Meta Ads', price: '8.000 kr./md.', value: 8000, d: 'Annoncer på Facebook og Instagram, der rammer de rigtige.', ex: ['Tekst og grafik', 'Målretning og retargeting', 'Månedlig rapport', 'Ekstra kanal: 5.000 kr./md.'] },
  { slug: 'google-shopping-ads', t: 'Google Shopping Ads', price: '8.000 kr./md.', value: 8000, d: 'Dine produkter med billede og pris øverst på Google.', ex: ['Produktfeed og Merchant Center', 'Shopping og Performance Max', 'Google Ads med i prisen', 'Ekstra kanal: 5.000 kr./md.'] },
  { slug: 'google-css', t: 'Google CSS', price: '49 kr./md.', value: 49, d: 'Op til 20% billigere klik på dine Google Shopping-annoncer.', ex: ['Webleads som din CSS', 'Hele buddet tæller i auktionen', 'Shopping og Performance Max'] },
  { slug: 'video', t: 'Video', price: 'Fast pris efter en snak', value: 0, d: 'Reklamevideoer, explainer-videoer og motion graphics, der fanger på sekunder.', ex: ['Reklamevideoer til sociale medier', 'Explainer-videoer', 'Motion graphics og logoanimation'] },
  { slug: 'seo', t: 'SEO', price: '995 kr./time', value: 995, d: 'Bliv fundet først, når kunderne søger.', ex: ['Lokal SEO og Google-profil', 'Tekster og søgeord', 'Teknisk optimering'] },
  { slug: 'geo', t: 'GEO', price: 'Fast pris efter en snak', value: 0, d: 'Bliv nævnt, når kunderne spørger ChatGPT og Googles AI om råd.', ex: ['Tjek af din synlighed i AI', 'Indhold, AI kan citere', 'Struktureret data'] },
  { slug: 'ai', t: 'AI', price: 'Fast pris efter en snak', value: 0, d: 'Chatbots, AI-annoncer og assistenter, der sparer dig tid.', ex: ['AI-chatbot døgnet rundt', 'AI-annoncering', 'AI-assistenter til rutinerne'] },
  { slug: 'automations', t: 'Automations', price: 'fra 4.999 kr.', value: 4999, d: 'Lad rutinerne klare sig selv.', ex: ['Automatiske mails og sms', 'Fakturaer og opfølgning', 'Kobling mellem dine systemer'] },
  { slug: 'interne-systemer', t: 'Interne systemer og CRM', price: 'fra 14.999 kr.', value: 14999, d: 'CRM, booking og dashboards, der passer til jeres måde at arbejde på.', ex: ['CRM og salgspipeline', 'Booking og kalender', 'Dashboards og portaler'] },
  { slug: 'app-udvikling', t: 'App-udvikling', price: 'Fast pris efter en snak', value: 0, d: 'Apps til iPhone og Android, bygget til din virksomhed.', ex: ['iPhone og Android', 'Booking, medlemskab og point', 'App Store og Google Play'] },
  { slug: 'email-marketing', t: 'E-mail marketing', price: 'Fast pris efter en snak', value: 0, d: 'Nyhedsbreve og mailflows, der får kunderne til at komme igen.', ex: ['Nyhedsbreve', 'Automatiske mailflows', 'Tilmelding efter reglerne'] },
  { slug: 'cro', t: 'CRO', price: 'Fast pris efter en snak', value: 0, d: 'Flere kunder fra de besøgende, du allerede har.', ex: ['Analyse og heatmaps', 'A/B-test', 'Kortere vej til kontakt'] }
];

// Default words in the hero badge: "Til <word>"
const SERVICEFAG = ['servicevirksomheder', 'håndværkere', 'klinikker', 'frisører', 'lokale virksomheder'];

// h1: line one is `a` + the scrambled orange word `hot`; line two is the grey `dim` + the underlined `mark`.
// price: { amount, pre, post, note } shows the rolling number; null shows "Fast pris efter en snak".
// steps become the stacked cards or the timeline (glyph: one or two characters the display font has).
//
// layout: the sections after the hero, in order (the contact form always comes last). Every page has its
// own order and mix, so no two pages are built the same way; build.mjs warns when two pages open with
// the same three sections. One of each kind:
//   showcase                     the example of the service (scripts/services/showcase/<slug>.html)
//   price | receipt | band       the price: the dark box, a receipt that prints, or a light band
//   cards | timeline             the steps: stacked cards or a line that draws itself (or leave it out)
//   faq | faqSplit               the questions: a plain list, or with a big heading and a nudge beside them
//   track | grid                 the other services: sideways cards, or a compact grid
//   statement, compare, facts, marquee   extra sections, with their copy on the page:
//     statement: { kicker, text, pill, sub }   text: *orange*, _grey_, {pill}, | = line break on wide screens
//     compare:   { kicker, h2: [line, grey line], lead, uden, med, rows: [[without, with], …] } (4–5 rows)
//     facts:     { kicker, items: [[label, big, text], …] }  only things that are true about the offer
//     marquee:   { h2: [a, b], lead, tag (an example), icon, words }
//   band: { chips } four item titles · receipt: { h2, notes } · flow (timeline): { h2, lead, end }
//   faqSplit: { kicker, h2, nudge } (all optional)
export const pages = [
  {
    slug: 'google-ads', name: 'Google Ads', short: 'Øverst på Google, når kunderne søger',
    description: 'Vi opsætter og styrer dine Google Ads, så du bliver vist øverst, når kunderne søger efter det, du laver. 8.000 kr./md., også med Google Shopping, hver ekstra kanal 5.000 kr./md., opsætning gratis, og annoncebudgettet betaler du direkte til Google.',
    serviceType: 'Google Ads-annoncering',
    words: SERVICEFAG,
    h1: { a: ['Øverst', 'på'], hot: 'Google.', dim: 'Når de', mark: 'søger.' },
    lead: 'Vi bygger og styrer dine annoncer på Google, så du bliver vist, når nogen søger efter det, du laver, der hvor du holder til. Og vi holder øje med hver krone.',
    floats: ['Opsætning gratis', 'Månedlig rapport', 'Søgeord ↗'], ring: 'GOOGLE ADS • SØGNING • LOKAL • RAPPORT •',
    price: { amount: '8.000', pre: '', post: 'kr./md.', note: 'Pr. kanal · Google Shopping med uden ekstra pris · hver ekstra kanal 5.000 kr./md. · opsætning gratis · ekskl. moms' },
    priceH2: ['Fast pris.', 'Ingen gætteri.'],
    priceLead: 'Google Shopping er med i samme pris. Tager du også Meta Ads, koster den kun 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Google, så du altid kan se, hvad der bliver brugt.',
    items: [
      ['Søgeordsanalyse', 'Vi finder de ord, dine kunder faktisk søger på.'],
      ['Kampagner og annoncer', 'Vi bygger kampagnerne og skriver annoncerne færdige.'],
      ['Lokal målretning', 'Vis dig for kunder i dit område, fx “elektriker Odense”.'],
      ['Negative søgeord', 'Du betaler ikke for klik fra folk, der leder efter noget andet.'],
      ['Sporing', 'Opkald, formularer og køb bliver målt, så du kan se, hvad der virker.'],
      ['Løbende optimering', 'Vi justerer bud, søgeord og annoncer hver måned.'],
      ['Månedlig rapport', 'Kort og klart overblik over, hvad du får for pengene.'],
      ['Direkte kontakt', 'Du taler med den, der kører dine annoncer.']
    ],
    steps: [
      ['Mål og budget', 'Vi aftaler, hvad du vil opnå, og hvad det må koste.', 'kr'],
      ['Opsætning', 'Vi bygger kampagner, annoncer og sporing.', 'G'],
      ['Optimering', 'Vi justerer løbende og sender en månedlig rapport.', '↗']
    ],
    faqs: [
      ['Hvad koster Google Ads?', 'Vores arbejde koster 8.000 kr. om måneden, og opsætningen er gratis. Google Shopping er med i samme pris. Tager du flere kanaler, fx Meta Ads, koster hver ekstra kanal 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Google, og det aftaler vi sammen.'],
      ['Hvor hurtigt kan annoncerne køre?', 'Så snart kampagnerne er sat op og godkendt af Google. Derefter justerer vi løbende, så du får mest muligt ud af budgettet.'],
      ['Skal jeg have en ny hjemmeside?', 'Ikke nødvendigvis. Annoncerne kan sende kunderne til den side, du har i dag. Spænder siden ben for resultaterne, siger vi det ærligt.'],
      ['Hvad er forskellen på Google Ads og SEO?', 'Med Google Ads betaler du for at blive vist øverst med det samme. SEO er arbejdet med at blive fundet uden at betale for hvert klik. De to kan sagtens kombineres.']
    ],
    contact: 'Fortæl os, hvad du laver, og hvor dine kunder er. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver din virksomhed, og hvor vil du gerne have flere kunder fra?',
    layout: ['showcase', 'statement', 'band', 'timeline', 'faqSplit', 'grid'],
    statement: {
      kicker: 'Kort sagt', pill: 'search',
      text: 'Når nogen søger {elektriker odense}, skal de finde *dig.* | _Ikke din konkurrent._',
      sub: 'Vi viser dine annoncer for kunder i dit område, og du betaler ikke for klik fra folk, der leder efter noget andet.'
    },
    band: { chips: ['Søgeordsanalyse', 'Kampagner og annoncer', 'Lokal målretning', 'Månedlig rapport'], sticker: 'Opsætning gratis' },
    flow: { h2: ['Fra første snak.', 'Til annoncerne kører.'], lead: 'Opsætningen er gratis. Derefter justerer vi hver måned og sender dig en kort rapport.', end: 'Rapport hver måned' }
  },
  {
    slug: 'meta-ads', name: 'Meta Ads', short: 'Annoncer på Facebook og Instagram',
    description: 'Vi laver og styrer dine annoncer på Facebook og Instagram: tekst, grafik, målretning og månedlig rapport. 8.000 kr./md., hver ekstra kanal 5.000 kr./md., opsætning gratis, og annoncebudgettet betaler du direkte til Meta.',
    serviceType: 'Annoncering på Facebook og Instagram',
    words: SERVICEFAG,
    h1: { a: ['Kunder', 'fra'], hot: 'Facebook.', dim: 'Og', mark: 'Instagram.' },
    lead: 'Vi laver annoncer, der fanger opmærksomheden i feedet og rammer de rigtige mennesker. Du får tekst, grafik, målretning og en månedlig rapport.',
    floats: ['Opsætning gratis', 'Facebook og Instagram', 'Retargeting ↗'], ring: 'META ADS • FACEBOOK • INSTAGRAM • REELS •',
    price: { amount: '8.000', pre: '', post: 'kr./md.', note: 'Pr. kanal · hver ekstra kanal 5.000 kr./md. · opsætning gratis · ekskl. moms' },
    priceH2: ['Fast pris.', 'Ingen gætteri.'],
    priceLead: 'Tager du også Google Ads, koster det kun 5.000 kr. mere om måneden, og Google Shopping er med i den pris. Annoncebudgettet betaler du direkte til Meta, så du altid kan se, hvad der bliver brugt.',
    items: [
      ['Tekst og grafik', 'Vi laver annoncerne færdige, klar til at køre.'],
      ['Målretning', 'Vis dine annoncer for de rigtige i dit område.'],
      ['Retargeting', 'Mind dem, der har besøgt din side, om at vende tilbage.'],
      ['Test af annoncer', 'Vi tester flere varianter og flytter budgettet derhen, hvor det virker.'],
      ['Lead-annoncer', 'Kunderne kan skrive sig op direkte i annoncen.'],
      ['Meta Pixel og sporing', 'Vi sætter målingen op, så du kan se, hvad annoncerne giver.'],
      ['Månedlig rapport', 'Kort og klart overblik over, hvad du får for pengene.'],
      ['Direkte kontakt', 'Du taler med den, der kører dine annoncer.']
    ],
    steps: [
      ['Mål og budget', 'Vi aftaler, hvad du vil opnå, og hvad det må koste.', 'kr'],
      ['Annoncer og målretning', 'Vi laver annoncerne og sætter målretning og sporing op.', 'f'],
      ['Test og optimering', 'Vi tester, justerer og sender en månedlig rapport.', '↗']
    ],
    faqs: [
      ['Hvad koster Meta Ads?', 'Vores arbejde koster 8.000 kr. om måneden, og opsætningen er gratis. Tager du flere kanaler, koster hver ekstra kanal 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Meta, og det aftaler vi sammen.'],
      ['Skal jeg selv lave billeder og tekster?', 'Nej. Vi laver annoncerne færdige. Har du gode billeder fra hverdagen og dine opgaver, bruger vi gerne dem.'],
      ['Virker det for en lokal virksomhed?', 'Ja. Annoncerne kan målrettes et bestemt område, så de kun bliver vist for folk tæt på dig.'],
      ['Hvad er forskellen på Meta Ads og Google Ads?', 'På Google bliver du vist, når folk søger efter det, du laver. På Facebook og Instagram møder du dem, før de søger, fx med et tilbud eller et godt eksempel på dit arbejde.']
    ],
    contact: 'Fortæl os, hvad du laver, og hvem dine kunder er. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver din virksomhed, og hvem vil du gerne nå?',
    layout: ['statement', 'showcase', 'compare', 'price', 'track', 'faq'],
    statement: {
      kicker: 'Kort sagt',
      text: 'Dine næste kunder søger ikke efter dig. | _De scroller._ Mød dem, *før de søger.*',
      sub: 'På Facebook og Instagram møder du dem med et tilbud eller et godt eksempel på dit arbejde.'
    },
    compare: {
      h2: ['Et boostet opslag.', 'Eller en plan.'],
      lead: 'Forskellen på at trykke “Promover” og at have annoncer, der bliver styret.',
      uden: 'Uden en plan', med: 'Med Webleads',
      rows: [
        ['Du promoverer et opslag og håber på det bedste.', 'Annoncer med et mål, lavet færdige til feedet.'],
        ['Annoncen bliver vist for alle mulige.', 'Den bliver vist for de rigtige i dit område.'],
        ['Dem, der kiggede, glemmer dig igen.', 'Retargeting minder dem om at vende tilbage.'],
        ['Den samme annonce kører, til den holder op med at virke.', 'Flere varianter bliver testet, og budgettet flytter derhen, hvor det virker.'],
        ['Du ved ikke, hvad annoncerne giver.', 'Meta Pixel og en månedlig rapport viser det.']
      ]
    }
  },
  {
    slug: 'google-shopping-ads', name: 'Google Shopping Ads', short: 'Dine produkter med billede og pris på Google',
    description: 'Vi sætter Google Shopping op for din webshop: Merchant Center, produktfeed, kampagner og sporing af salg, så dine produkter bliver vist med billede og pris, når kunderne søger. 8.000 kr./md., også med Google Ads, hver ekstra kanal 5.000 kr./md.',
    serviceType: 'Google Shopping-annoncering',
    words: ['webshops', 'netbutikker', 'Shopify-butikker', 'butikker med varer'],
    h1: { a: ['Dine', 'varer'], hot: 'øverst.', dim: 'Med billede og', mark: 'pris.' },
    lead: 'Vi sætter Google Shopping op, så dine produkter bliver vist med billede og pris, når kunderne søger efter dem. Vi klarer produktfeed, Merchant Center og kampagner.',
    floats: ['Produktfeed', 'Merchant Center', 'Billede og pris ↗'], ring: 'GOOGLE SHOPPING • PRODUKTER • FEED • SALG •',
    price: { amount: '8.000', pre: '', post: 'kr./md.', note: 'Pr. kanal · Google Ads med uden ekstra pris · hver ekstra kanal 5.000 kr./md. · ekskl. moms' },
    priceH2: ['Fast pris.', 'Ingen gætteri.'],
    priceLead: 'Google Ads er med i samme pris. Tager du også Meta Ads, koster den kun 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Google.',
    items: [
      ['Merchant Center', 'Vi opretter eller rydder op i din Google Merchant Center-konto.'],
      ['Produktfeed', 'Dine produkter, priser og lagerstatus sendes automatisk til Google.'],
      ['Kobling til din webshop', 'Fx Shopify, hvor vi er Shopify Partner.'],
      ['Titler og billeder', 'Produkttitler med de ord, kunderne faktisk søger på.'],
      ['Kampagner', 'Shopping og Performance Max, delt op efter det, der sælger.'],
      ['Sporing af salg', 'Hvert køb bliver målt, så du kan se, hvad annoncerne sælger for.'],
      ['Løbende optimering', 'Vi flytter budgettet mod de produkter, der sælger.'],
      ['Månedlig rapport', 'Salg, forbrug og afkast forklaret kort.']
    ],
    steps: [
      ['Feed og konto', 'Vi sætter Merchant Center og dit produktfeed op.', '#'],
      ['Kampagner', 'Vi bygger kampagnerne og sætter sporing af salg op.', 'G'],
      ['Optimering', 'Vi flytter budgettet mod det, der sælger, og sender en rapport.', '↗']
    ],
    faqs: [
      ['Hvad koster Google Shopping Ads?', 'Vores arbejde koster 8.000 kr. om måneden, og Google Ads er med i samme pris. Tager du flere kanaler, fx også Meta Ads, koster hver ekstra kanal 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Google.'],
      ['Hvad er et produktfeed?', 'En liste over dine produkter med titel, billede, pris og lagerstatus, som Google bruger til at vise dine annoncer. Vi sætter den op, så den holder sig opdateret af sig selv.'],
      ['Virker det med min webshop?', 'De fleste webshopsystemer kan sende produkter til Google. Bruger du Shopify, er vi Shopify Partner.'],
      ['Hvad er forskellen på Shopping og almindelige Google Ads?', 'Almindelige annoncer er tekst. Shopping-annoncer viser produktet med billede og pris direkte i søgningen, så kunden ved, hvad de klikker på.'],
      ['Kan klikket blive billigere?', 'Ofte, ja. Går dine Shopping-annoncer gennem Webleads som CSS i stedet for Googles egen CSS, tæller hele dit bud i auktionen, og klikket kan blive op til ca. 20% billigere. Google oplyser ikke marginens størrelse; 20% er branchens skøn.', ['/services/google-css', 'Læs om Google CSS']]
    ],
    contact: 'Fortæl os om din webshop, så svarer vi inden for 24 timer med en fast pris.',
    placeholder: 'Hvilken webshop har du, og hvad sælger du?',
    layout: ['showcase', 'facts', 'receipt', 'cards', 'faqSplit', 'track'],
    facts: {
      kicker: 'Kort fortalt',
      items: [
        ['Webshop', 'Shopify Partner', 'De fleste webshops kan sende varer til Google. Bruger du Shopify, er vi Shopify Partner.'],
        ['Produktfeed', 'Af sig selv', 'Produkter, priser og lagerstatus bliver sendt til Google automatisk.'],
        ['Sporing', 'Hvert køb', 'bliver målt, så du kan se, hvad annoncerne sælger for.'],
        ['Svar', '24 timer', 'Fortæl os om din webshop, så har du en fast pris inden for 24 timer.']
      ]
    },
    receipt: { h2: ['Det hele er med.', 'Til én fast pris.'], notes: ['Annoncebudgettet betaler du direkte til Google'] }
  },
  {
    // Checked against Google's help pages and the market (4 Nov 2026). The 20% is the industry's estimate of the
    // margin Google's own CSS takes from the bid: Google does not publish it, so every "20%" needs the estimate
    // sentence on the same page. Never "rabat", "garanteret" or "Ingen binding" (no binding terms are set).
    // Webleads is the CSS (Mikkel, 4 Nov 2026): 49 kr./md., and the ad label reads "Af Webleads".
    slug: 'google-css', name: 'Google CSS', short: 'Op til 20% billigere klik på Google Shopping',
    description: 'Lad dine Google Shopping-annoncer gå gennem Webleads som CSS i stedet for Googles egen. Så tæller hele dit bud, og klikket kan blive op til 20% billigere. 49 kr. om måneden.',
    serviceType: 'CSS (Comparison Shopping Service) til Google Shopping',
    words: ['webshops', 'netbutikker', 'Shopify-butikker', 'butikker med varer'],
    h1: { a: ['Op', 'til'], hot: '20%', dim: 'billigere', mark: 'klik.' },
    lead: 'Lad dine Shopping-annoncer gå gennem Webleads som CSS i stedet for Googles egen. Så tæller hele dit bud i auktionen, og det samme klik kan blive op til 20% billigere. Vi klarer skiftet.',
    floats: ['Af Webleads', 'Hele buddet tæller', '49 kr./md.'], ring: 'GOOGLE CSS • SHOPPING • KLIKPRIS • BUD •',
    price: { amount: '49', pre: '', post: 'kr./md.', note: 'Ekskl. moms · annoncebudgettet betaler du som i dag direkte til Google' },
    priceH2: ['49 kr. om måneden.', 'Hele buddet tæller.'],
    priceLead: 'Du betaler 49 kr. om måneden for at have Webleads som CSS. Vi klarer skiftet, og dit annoncebudget betaler du som i dag direkte til Google.',
    items: [
      ['Tjek af din konto', 'Vi ser på din Merchant Center, dine kampagner og de lande, du sælger til.'],
      ['Lande og placeringer', 'Vi tjekker, at alle de lande, du sælger til, er med, og hvor dine annoncer bliver vist.'],
      ['Vi klarer skiftet', 'Vi sætter skiftet i gang, og du godkender det i din Merchant Center.'],
      ['Som regel samme kampagner', 'Som regel er din Google Ads-konto, dine kampagner og dit produktfeed de samme som i dag.'],
      ['Hele buddet tæller', 'Uden margin fra Googles egen CSS kommer hele dit bud med i auktionen.'],
      ['Shopping og Performance Max', 'Det gælder dine produktannoncer i både Shopping og Performance Max.'],
      ['Bud og mål', 'Vi justerer bud og mål, så fordelen giver lavere klikpris, flere klik eller lidt af begge.'],
      ['Måling før og efter', 'Fordelen står ikke på fakturaen, så vi måler klikpris, klik og salg før og efter.']
    ],
    steps: [
      ['Tjek', 'Vi ser på din konto, dine lande og dit budget og siger ærligt, om det kan betale sig.', '?'],
      ['Skift', 'Vi kobler din Merchant Center på Webleads som CSS, og du godkender skiftet.', '%'],
      ['Opfølgning', 'Vi sammenligner klikpris, klik og salg før og efter og sender dig tallene.', '↓']
    ],
    faqs: [
      ['Hvad er en CSS?', 'CSS står for Comparison Shopping Service, på dansk en prissammenligningstjeneste. Efter EU’s sag mod Google i 2017 bliver Shopping-annoncer i Danmark altid vist gennem en CSS. Har du ikke valgt en anden, er det Googles egen, Google Shopping. Webleads er en CSS, du kan vælge i stedet.'],
      ['Hvorfor bliver klikket billigere?', 'Googles egen CSS, Google Shopping, trækker en fast procentdel fra dit bud, før det kommer med i auktionen. Med Webleads som CSS tæller hele buddet, så det samme klik kan blive billigere, eller du kan få flere klik for samme budget. Google oplyser ikke procentdelen, men branchen anslår den til op til ca. 20%.'],
      ['Skal jeg lave mine kampagner om?', 'Som regel ikke. Vi kobler den Merchant Center-konto, du har i dag, på Webleads som CSS, så din Google Ads-konto, dine kampagner og dit feed er de samme. Kræver det en ny konto, siger vi det, før vi går i gang.'],
      ['Hvilke annoncer gælder det?', 'Dine Shopping-annoncer, også produkterne i Performance Max. Almindelige tekstannoncer påvirkes ikke. Hvor produkterne ellers kan blive vist, fx på YouTube, gennemgår vi med dig før skiftet.'],
      ['Gælder det i alle lande?', 'Det gælder i Danmark og en række andre lande i Europa, fx Sverige, Norge og Tyskland. Uden for de lande giver det ingen fordel. Sælger du til flere lande, tjekker vi, at de alle er med.'],
      ['Hvad koster det?', '49 kr. om måneden, ekskl. moms. Dit annoncebudget betaler du som i dag direkte til Google.']
    ],
    contact: 'Fortæl os om din webshop, så ser vi, om det kan betale sig, og svarer inden for 24 timer.',
    placeholder: 'Hvilken webshop har du, og hvad bruger du på Google Shopping om måneden?',
    layout: ['showcase', 'compare', 'band', 'faq', 'grid'],
    compare: {
      h2: ['Samme annoncer.', 'Billigere klik.'],
      lead: 'Det eneste, der skifter, er den CSS, dine annoncer bliver vist gennem.',
      uden: 'Med Googles egen CSS', med: 'Med Webleads som CSS',
      rows: [
        ['Googles egen CSS trækker en margin fra dit bud, før det kommer med i auktionen.', 'Med Webleads som CSS tæller hele buddet.'],
        ['Marginen er med i hvert eneste klik.', 'Det samme klik kan koste op til 20% mindre. Google oplyser ikke marginens størrelse; 20% er branchens skøn.'],
        ['Et skifte lyder som et stort arbejde.', 'Vi klarer skiftet. Som regel kører dine kampagner videre.'],
        ['Du ved ikke, hvad du kunne spare.', 'Vi måler klikpriserne før og efter.']
      ]
    },
    band: { chips: ['Samme annoncer', 'Shopping og Performance Max', 'Måling før og efter', 'Af Webleads'], sticker: 'Hele buddet tæller' }
  },
  {
    slug: 'seo', name: 'SEO', short: 'Bliv fundet først, når kunderne søger',
    description: 'Vi sørger for, at din virksomhed bliver fundet på Google, når kunderne søger efter det, du laver: lokal SEO, Google-profil, søgeord, tekster og teknisk SEO. 995 kr. i timen, ingen binding.',
    serviceType: 'Søgemaskineoptimering',
    words: SERVICEFAG,
    h1: { a: ['Bliv', 'fundet'], hot: 'først.', dim: 'Uden at betale for', mark: 'klik.' },
    lead: 'Vi sørger for, at din virksomhed dukker op på Google, når nogen søger efter det, du laver, der hvor du holder til.',
    floats: ['Lokal SEO', 'Google-profil', 'Månedlig rapport ↗'], ring: 'SEO • LOKAL • GOOGLE-PROFIL • TEKSTER •',
    price: { amount: '995', pre: '', post: 'kr./time', note: 'Timepris · ingen binding · ekskl. moms' },
    priceH2: ['Én timepris.', 'Ingen binding.'],
    priceLead: 'Du bestemmer, hvor mange timer vi bruger om måneden, og hver måned kan du se, hvad vi har lavet.',
    items: [
      ['Lokal SEO', 'Bliv fundet i dit område, fx “frisør Roskilde”.'],
      ['Google-profil', 'Opsætning og pleje af din virksomhedsprofil med anmeldelser.'],
      ['Søgeord', 'Vi finder de ord, dine kunder faktisk søger på.'],
      ['Tekster', 'Indhold, som både Google og dine kunder forstår.'],
      ['Teknisk SEO', 'Hastighed, struktur og alt det bag kulisserne.'],
      ['Konkurrenter', 'Vi ser på, hvad dem over dig gør, og gør det bedre.'],
      ['Månedlig rapport', 'Kort og klart overblik over, hvad der virker.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Analyse', 'Vi ser på din side, dine konkurrenter og dine søgeord.', 'G'],
      ['Plan', 'Du får en klar plan, og vi aftaler, hvor mange timer der skal bruges.', '✓'],
      ['Løbende arbejde', 'Vi optimerer hver måned og viser dig resultaterne.', '↗']
    ],
    faqs: [
      ['Hvad koster SEO?', '995 kr. i timen ekskl. moms. Du bestemmer, hvor mange timer vi bruger om måneden, og der er ingen binding.'],
      ['Hvor lang tid tager det?', 'SEO er et sejt træk. Det tager typisk nogle måneder, før placeringerne for alvor flytter sig, men du kan følge med i rapporten hver måned.'],
      ['Kan I garantere en førsteplads?', 'Nej, og det kan ingen ærligt love. Google bestemmer rækkefølgen. Vi lover, at vi gør det rigtige arbejde og viser dig, hvad det giver.'],
      ['Hvad er lokal SEO?', 'At blive fundet på dit fag og dit område, fx “frisør Roskilde” eller “tømrer Vejle”. Det handler blandt andet om din Google-profil, dine anmeldelser og teksterne på din side.']
    ],
    contact: 'Fortæl os, hvad du laver, og hvor du holder til. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver din virksomhed, og hvad vil du gerne findes på?',
    layout: ['showcase', 'marquee', 'price', 'timeline', 'grid', 'faqSplit'],
    marquee: {
      sec: 'soegninger', icon: 'search', tag: true,
      h2: ['Det søger dine kunder på.', 'Der, hvor du holder til.'],
      lead: 'Vi finder de ord, dine kunder faktisk søger på.',
      words: ['tømrer københavn', 'frisør i nærheden', 'elektriker odense', 'fysioterapeut aarhus', 'vvs akut', 'maler pris', 'rengøring vejle', 'revisor til lille virksomhed', 'frisør roskilde', 'personlig træner frederiksberg', 'massage åben søndag', 'tømrer vejle', 'elektriker i nærheden', 'klinik aalborg']
    },
    flow: { h2: ['Først en plan.', 'Så det seje træk.'], lead: 'Du bestemmer, hvor mange timer vi bruger, og hver måned kan du se, hvad vi har lavet.', end: 'Hver måned' }
  },
  {
    slug: 'geo', name: 'GEO', short: 'Bliv anbefalet af ChatGPT og Googles AI',
    description: 'GEO (Generative Engine Optimization) gør din virksomhed synlig i ChatGPT, Gemini og Googles AI-svar, så du bliver nævnt, når kunderne spørger om råd. Fast pris efter en kort snak.',
    serviceType: 'Generative Engine Optimization (GEO)',
    words: SERVICEFAG,
    h1: { a: ['Bliv', 'anbefalet', 'af'], hot: 'AI.', dim: 'Når kunderne', mark: 'spørger.' },
    lead: 'Flere og flere spørger ChatGPT, Gemini og Googles AI-svar, før de vælger. GEO handler om at gøre din virksomhed til et af de svar, de får.',
    floats: ['ChatGPT', 'Googles AI-svar', 'Gemini ↗'], ring: 'GEO • CHATGPT • GEMINI • AI-SVAR •',
    price: null,
    priceH2: ['Fast pris.', 'Efter en snak.'],
    priceLead: 'Vi ser på, hvordan AI omtaler dig i dag, og giver dig en fast pris inden for 24 timer.',
    items: [
      ['Tjek af din synlighed', 'Vi tester, hvad ChatGPT, Gemini og Google svarer om dit fag og din by.'],
      ['Indhold, AI kan citere', 'Klare svar på de spørgsmål, kunderne stiller.'],
      ['Struktureret data', 'Vi markerer din side, så maskiner kan læse, hvem du er, og hvad du tilbyder.'],
      ['Omtale andre steder', 'AI lytter til, hvad andre skriver om dig. Vi hjælper dig med at blive nævnt.'],
      ['Google-profil og anmeldelser', 'Grundlaget for at blive anbefalet lokalt.'],
      ['Teknisk adgang', 'Vi sørger for, at AI-tjenesterne kan læse din side.'],
      ['Måling', 'Vi følger med i, hvor og hvordan du bliver nævnt.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Tjek', 'Vi spørger AI som dine kunder og ser, hvem der bliver anbefalet.', '?'],
      ['Indhold og struktur', 'Vi gør din side og din omtale klar til at blive citeret.', 'AI'],
      ['Opfølgning', 'Vi måler igen og forbedrer løbende.', '↗']
    ],
    faqs: [
      ['Hvad er GEO?', 'GEO står for Generative Engine Optimization. Det er SEO til AI-tjenester som ChatGPT, Gemini og Googles AI-svar, så din virksomhed bliver nævnt, når nogen spørger om råd.'],
      ['Er GEO det samme som SEO?', 'De hænger tæt sammen. God SEO er fundamentet, men AI læser og vælger anderledes end en almindelig søgning. Derfor arbejder vi med begge dele i samme plan.'],
      ['Kan I garantere, at ChatGPT nævner mig?', 'Nej. Ingen kan styre, hvad AI svarer. Vi gør din virksomhed til det tydeligste og mest troværdige svar og måler, hvordan det udvikler sig.'],
      ['Hvad koster GEO?', 'Du får en fast pris efter en kort snak om din virksomhed.']
    ],
    contact: 'Fortæl os, hvad du laver, og hvor du holder til. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver din virksomhed, og hvad vil du gerne anbefales til?',
    layout: ['statement', 'showcase', 'receipt', 'cards', 'faq', 'track'],
    statement: {
      kicker: 'Kort sagt', pill: 'spark',
      text: 'Flere spørger {AI} om råd, før de vælger. | _Bliv et af de svar,_ *de får.*',
      sub: 'Ingen kan styre, hvad AI svarer. Vi gør din virksomhed til det tydeligste og mest troværdige svar.'
    },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'] }
  },
  {
    slug: 'ai', name: 'AI', short: 'Chatbots, AI-annoncer og assistenter',
    description: 'Vi bygger AI ind i din virksomhed, hvor det giver mening: en chatbot, der svarer kunderne døgnet rundt, AI-annoncer og assistenter, der klarer rutinerne. Fast pris efter en kort snak.',
    serviceType: 'AI-løsninger til virksomheder',
    words: SERVICEFAG,
    h1: { a: ['AI,', 'der', 'sparer'], hot: 'tid.', dim: 'Hver', mark: 'dag.' },
    lead: 'Vi bygger AI ind, hvor det giver mening: en chatbot, der svarer kunderne døgnet rundt, AI-annoncer, der tester sig frem, og assistenter, der klarer de tunge rutiner.',
    floats: ['Chatbot døgnet rundt', 'AI-annoncer', 'Dine egne data ↗'], ring: 'AI • CHATBOT • ASSISTENTER • ANNONCER •',
    price: null,
    priceH2: ['Fast pris.', 'Efter en snak.'],
    priceLead: 'Vi finder sammen ud af, hvad AI skal løse for dig, og giver dig en fast pris inden for 24 timer.',
    items: [
      ['AI-chatbot', 'Svarer dine kunder døgnet rundt på din hjemmeside.'],
      ['AI-annoncering', 'AI laver og tester mange annoncevarianter og flytter budgettet derhen, hvor det virker.'],
      ['AI-assistenter', 'Skriver udkast til tilbud, svar og opsummeringer, som du godkender.'],
      ['Dine egne data', 'AI, der kender dine priser, ydelser og regler, ikke bare internettet.'],
      ['Kobling til dine systemer', 'AI, der kan slå op i kalender, kundesystem og mail.'],
      ['Mennesket bestemmer', 'Du godkender, hvor det betyder noget.'],
      ['Oplæring', 'Vi viser dig og dine medarbejdere, hvordan I får mest ud af det.'],
      ['Direkte kontakt', 'Du taler med den, der bygger løsningen.']
    ],
    steps: [
      ['Vi finder opgaverne', 'Vi ser på, hvor AI kan spare dig mest tid.', '?'],
      ['Vi bygger og tester', 'Du ser løsningen undervejs og kan ønske ændringer.', 'AI'],
      ['Drift og forbedring', 'Vi holder øje med den og gør den bedre.', '↗']
    ],
    faqs: [
      ['Hvad kan AI konkret gøre for min virksomhed?', 'Typisk svare på kundernes spørgsmål, skrive udkast til tilbud og mails, sortere henvendelser og lave annoncer. Vi starter med de opgaver, der tager mest tid.'],
      ['Laver AI fejl?', 'Ja, det kan den. Derfor sætter vi den op med dine egne oplysninger og regler og lader et menneske godkende, hvor det betyder noget.'],
      ['Hvad med mine data?', 'Vi gennemgår sammen med dig, hvilke data AI må bruge, og vælger løsninger, der kan bruges efter GDPR.'],
      ['Hvad koster det?', 'Du får en fast pris efter en kort snak, når vi ved, hvad AI skal løse for dig.']
    ],
    contact: 'Fortæl os, hvilke opgaver der tager for meget tid. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvilke opgaver vil du gerne have AI til at klare?',
    layout: ['facts', 'showcase', 'compare', 'band', 'track', 'faqSplit'],
    facts: {
      kicker: 'AI, kort fortalt',
      items: [
        ['Pris', 'Fast pris', 'efter en kort snak, når vi ved, hvad AI skal løse for dig.'],
        ['Kontrol', 'Du godkender', 'Et menneske godkender, hvor det betyder noget.'],
        ['Viden', 'Dine egne data', 'AI, der kender dine priser, ydelser og regler, ikke bare internettet.'],
        ['Svar', '24 timer', 'Fortæl os, hvilke opgaver der tager for meget tid, så svarer vi inden for 24 timer.']
      ]
    },
    compare: {
      h2: ['Uden AI.', 'Og med.'],
      lead: 'Det er de samme opgaver. Forskellen er, hvem der bruger tiden på dem.',
      uden: 'Uden AI', med: 'Med AI',
      rows: [
        ['Spørgsmål om aftenen venter til i morgen.', 'Chatbotten svarer med det samme, døgnet rundt.'],
        ['Du skriver hvert tilbud og svar fra bunden.', 'AI skriver udkastet. Du godkender det.'],
        ['Én annonce ad gangen og meget gætteri.', 'Mange varianter bliver testet, og budgettet flytter derhen, hvor det virker.'],
        ['Du slår op i kalender og kundesystem i hånden.', 'AI slår selv op i kalender, kundesystem og mail.']
      ]
    },
    band: { chips: ['AI-chatbot', 'AI-annoncering', 'AI-assistenter', 'Oplæring'] }
  },
  {
    slug: 'automations', name: 'Automations', short: 'Lad rutinerne klare sig selv',
    description: 'Vi automatiserer de opgaver, du gør igen og igen: mails og sms, fakturaer og rykkere, leads, booking og rapporter. Fra 4.999 kr. pr. automatisering, drift 499 kr./md.',
    serviceType: 'Automatisering af arbejdsgange',
    words: SERVICEFAG,
    h1: { a: ['Lad', 'rutinerne'], hot: 'køre.', dim: 'Af sig', mark: 'selv.' },
    lead: 'Vi automatiserer de opgaver, du gør igen og igen, så du får timer tilbage hver uge og færre fejl.',
    floats: ['Timer tilbage', 'Kører døgnet rundt', 'Kobler dine apps ↗'], ring: 'AUTOMATIONS • MAILS • FAKTURAER • LEADS •',
    price: { amount: '4.999', pre: 'fra', post: 'kr.', note: 'Pr. automatisering · drift 499 kr./md. · ekskl. moms' },
    priceH2: ['Fast pris.', 'Ingen gætteri.'],
    priceLead: 'Driften dækker, at vi overvåger automatiseringerne, så de altid kører.',
    items: [
      ['Mails og sms', 'Automatiske bekræftelser, påmindelser og opfølgning.'],
      ['Fakturaer og rykkere', 'Sendes af sig selv, når opgaven er færdig.'],
      ['Leads', 'Nye henvendelser lander direkte i dit system.'],
      ['Booking', 'Tider, bekræftelser og aflysninger uden manuelt arbejde.'],
      ['Rapporter', 'Ugens tal i din indbakke hver mandag.'],
      ['Kobling mellem apps', 'Få dine programmer til at tale sammen.'],
      ['Overvågning', 'Vi holder øje med, at alt kører.'],
      ['Direkte kontakt', 'Du taler med den, der bygger automatiseringerne.']
    ],
    steps: [
      ['Kortlægning', 'Vi finder de opgaver, der stjæler mest tid.', '?'],
      ['Opsætning', 'Vi bygger og tester automatiseringerne.', '✓'],
      ['Drift', 'Vi overvåger dem, så de altid kører.', '24']
    ],
    faqs: [
      ['Hvad koster en automatisering?', 'Fra 4.999 kr. pr. automatisering og 499 kr. om måneden i drift, hvor vi overvåger, at den kører.'],
      ['Hvilke programmer kan I koble sammen?', 'De fleste programmer, der har en åben forbindelse (API), fx mail, kalender, regnskab, kundesystem og webshop. Vi tjekker dine programmer, før du får en pris.'],
      ['Hvad sker der, hvis noget går galt?', 'Vi overvåger automatiseringerne og retter dem, hvis noget går i stå eller ændrer sig.'],
      ['Hvor er et godt sted at starte?', 'Med de opgaver, du gør hver uge på samme måde: bekræftelser, påmindelser, fakturaer og nye henvendelser. Dem finder vi sammen.']
    ],
    contact: 'Fortæl os, hvilke opgaver du gør igen og igen. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvilke opgaver gør du igen og igen?',
    layout: ['compare', 'showcase', 'price', 'cards', 'grid', 'faq'],
    compare: {
      kicker: 'Forskellen',
      h2: ['I hånden.', 'Eller af sig selv.'],
      lead: 'De opgaver, du gør igen og igen på samme måde, kan klare sig selv.',
      uden: 'Uden automations', med: 'Med automations',
      rows: [
        ['Du sender hver bekræftelse og påmindelse selv.', 'Mails og sms sendes af sig selv.'],
        ['Fakturaen bliver sendt, når du når det.', 'Fakturaen sendes, når opgaven er færdig.'],
        ['Nye henvendelser skrives over i hånden.', 'Leads lander direkte i dit system.'],
        ['Dine programmer taler ikke sammen.', 'Dine programmer taler sammen.'],
        ['Ugens tal skal samles i hånden.', 'Ugens tal ligger i din indbakke hver mandag.']
      ]
    }
  },
  {
    // Reklamevideoer, explainer-videoer and motion graphics on one page: the same work and the same team,
    // three formats. /services/reklamevideoer, /explainer-video and /motion-graphics redirect here (vercel.json).
    slug: 'video', name: 'Video', short: 'Reklamevideoer, explainer-videoer og motion graphics',
    description: 'Vi laver reklamevideoer til Facebook, Instagram, TikTok og YouTube, explainer-videoer, der forklarer din ydelse på et minut, og motion graphics. Fast pris efter en kort snak.',
    serviceType: 'Videoproduktion',
    words: ['lokale virksomheder', 'webshops', 'håndværkere', 'klinikker', 'servicevirksomheder'],
    h1: { a: ['Video,', 'der'], hot: 'fanger.', dim: 'På de første', mark: 'sekunder.' },
    lead: 'Vi laver reklamevideoer, explainer-videoer og motion graphics, der får folk til at stoppe op i feedet og forstå, hvad du tilbyder. Fra idé og manus til færdig video i de formater, du skal bruge.',
    floats: ['Reklamevideo', 'Explainer', 'Motion graphics ▶'], ring: 'VIDEO • REKLAME • EXPLAINER • MOTION •',
    price: null,
    priceH2: ['Fast pris.', 'Efter en snak.'],
    priceLead: 'Fortæl os, hvad videoen skal, og hvor den skal vises, så får du en fast pris inden for 24 timer.',
    items: [
      ['Idé og manus', 'Vi finder vinklen og skriver manus, så budskabet sidder på få sekunder.'],
      ['Reklamevideoer', 'Korte videoer til Facebook, Instagram, TikTok og YouTube.'],
      ['Explainer-videoer', 'Din ydelse forklaret enkelt på et minut, til forsiden eller salget.'],
      ['Motion graphics', 'Animeret tekst, ikoner og grafik, og dit logo i bevægelse.'],
      ['Speak og musik', 'Speak og musik, der passer til budskabet.'],
      ['Undertekster', 'Mange ser video uden lyd, så teksten er med.'],
      ['Alle formater', 'Lodret til Reels og Stories, kvadratisk til feedet og bred til YouTube.'],
      ['Klar til annoncer', 'Vi kan sætte videoen i gang som annonce med det samme.']
    ],
    steps: [
      ['Idé og manus', 'Vi aftaler budskab, målgruppe og længde, og du godkender manus.', '✎'],
      ['Produktion', 'Vi laver videoen og sender dig et udkast.', '▶'],
      ['Rettelser og levering', 'Du får dine rettelser med, og videoen bliver leveret i de formater, du skal bruge.', '✓']
    ],
    faqs: [
      ['Hvad koster en video?', 'Det afhænger af længden, og om det er en reklamevideo, en explainer eller motion graphics. Fortæl os, hvad du har brug for, så får du en fast pris inden for 24 timer.'],
      ['Hvad er forskellen på de tre slags?', 'En reklamevideo er kort og skal fange i feedet. En explainer-video forklarer din ydelse eller dit produkt på et minut eller to. Motion graphics er animeret grafik, tekst og ikoner, som kan bruges i dem begge.'],
      ['Skal jeg selv filme?', 'Nej. Vi kan lave videoen med animation og grafik eller ud fra de billeder og klip, du allerede har.'],
      ['Hvilke formater får jeg?', 'Dem, du skal bruge: lodret til Reels, Stories og TikTok, kvadratisk til feedet og bred til YouTube og din hjemmeside.'],
      ['Hvor lang tid tager det?', 'Du får en tidsplan, før vi går i gang. En kort reklamevideo går hurtigere end en explainer.'],
      ['Kan I også køre den som annonce?', 'Ja. Vi kan sætte videoen i gang på Facebook, Instagram og YouTube, så den bliver vist for de rigtige.', ['/services/meta-ads', 'Læs om Meta Ads']]
    ],
    contact: 'Fortæl os, hvad videoen skal, så svarer vi inden for 24 timer med en fast pris.',
    placeholder: 'Hvad skal videoen fortælle, og hvor skal den vises?',
    layout: ['marquee', 'showcase', 'compare', 'band', 'timeline', 'faq', 'grid'],
    marquee: {
      sec: 'ord', icon: 'spark',
      h2: ['Fra reklame.', 'Til explainer.'],
      lead: 'Videoer som de her kan vi lave for dig.',
      words: ['Reklamevideo til Instagram', 'Explainer-video', 'Motion graphics', 'Produktvideo', 'Reels og TikTok', 'YouTube-annonce', 'Logoanimation', 'Video til forsiden', 'Stories', 'Kampagnevideo']
    },
    compare: {
      h2: ['Uden video.', 'Og med.'],
      lead: 'Det er det samme budskab. Forskellen er, om folk stopper op.',
      uden: 'Uden video', med: 'Med video',
      rows: [
        ['Et billede og en tekst, som folk scroller forbi.', 'Bevægelse, der får folk til at stoppe op.'],
        ['Kunderne skal læse sig frem til, hvad du laver.', 'En explainer viser det på et minut.'],
        ['Det samme opslag alle steder.', 'Lodret, kvadratisk og bred, lavet til hvert sted.'],
        ['Uden lyd forsvinder budskabet.', 'Undertekster, så budskabet når frem uden lyd.']
      ]
    },
    band: { chips: ['Idé og manus', 'Reklamevideoer', 'Explainer-videoer', 'Motion graphics'] },
    flow: { h2: ['Fra idé.', 'Til færdig video.'], lead: 'Du godkender manus, før vi går i gang, og får dine rettelser med.', end: 'Klar til at blive vist' }
  },
  {
    slug: 'app-udvikling', name: 'App-udvikling', short: 'Apps til iPhone og Android',
    description: 'Vi bygger apps til iPhone og Android til din virksomhed: booking, bestilling, medlemskab og point. Vi klarer design, udvikling og udgivelse i App Store og Google Play. Fast pris efter en kort snak.',
    serviceType: 'App-udvikling',
    words: ['klinikker', 'fitnesscentre', 'webshops', 'servicevirksomheder', 'lokale virksomheder'],
    h1: { a: ['Din', 'egen'], hot: 'app.', dim: 'I lommen på dine', mark: 'kunder.' },
    lead: 'Vi bygger apps til iPhone og Android, så dine kunder kan booke, bestille og samle point direkte fra telefonen. Vi klarer design, udvikling og udgivelse.',
    floats: ['iPhone og Android', 'Push-beskeder', 'App Store ↗'], ring: 'APP • IPHONE • ANDROID • PUSH •',
    price: null,
    priceH2: ['Fast pris.', 'Efter en snak.'],
    priceLead: 'Fortæl os, hvad appen skal kunne, så får du en fast pris inden for 24 timer.',
    items: [
      ['iPhone og Android', 'Én app, der virker på begge.'],
      ['Design', 'Skærme, der er lette at bruge og passer til dit brand.'],
      ['Booking og bestilling', 'Kunderne booker eller bestiller direkte i appen.'],
      ['Login og medlemskab', 'Kundeprofiler, medlemskaber og klippekort.'],
      ['Push-beskeder', 'Påmindelser og tilbud direkte på telefonen.'],
      ['Kobling til dine systemer', 'Appen taler med din kalender, dit kundesystem eller din webshop.'],
      ['Udgivelse', 'Vi klarer App Store og Google Play.'],
      ['Opdateringer', 'Vi holder appen opdateret, når telefonerne bliver det.']
    ],
    steps: [
      ['Idé og skitser', 'Vi finder ud af, hvad appen skal kunne, og viser dig skitser af skærmene.', '✎'],
      ['Udvikling', 'Vi bygger appen, og du prøver den på din egen telefon undervejs.', '▢'],
      ['Udgivelse', 'Vi lægger appen i App Store og Google Play og holder den opdateret.', '↗']
    ],
    faqs: [
      ['Hvad koster en app?', 'Det afhænger af, hvad den skal kunne. Fortæl os om din idé, så får du en fast pris inden for 24 timer.'],
      ['Virker den på både iPhone og Android?', 'Ja. Vi bygger én app, der virker på begge.'],
      ['Har jeg brug for en app, eller er en hjemmeside nok?', 'Bruger kunderne dig tit, fx til booking, medlemskab eller genbestilling, giver en app mening. Skal de bare finde og kontakte dig, er en hjemmeside nok. Det siger vi ærligt.', ['/services/hjemmesider', 'Se hjemmesider']],
      ['Kan appen tale med mine systemer?', 'Ja. Den kan kobles til fx din kalender, dit kundesystem eller din webshop, så du ikke skal holde styr på det to steder.'],
      ['Hvor lang tid tager det?', 'Du får en tidsplan, før vi går i gang. En enkel app går hurtigere end en med login, betaling og mange skærme.'],
      ['Står appen under mit navn?', 'Ja, det er det mest almindelige: appen bliver udgivet under din virksomheds konto i App Store og Google Play. Vi hjælper dig med at oprette kontiene.']
    ],
    contact: 'Fortæl os om din idé til en app, så svarer vi inden for 24 timer med en fast pris.',
    placeholder: 'Hvad skal din app kunne?',
    layout: ['statement', 'facts', 'showcase', 'price', 'cards', 'faqSplit', 'track'],
    statement: {
      kicker: 'Kort sagt', pill: 'spark',
      text: 'Dine kunder har altid telefonen på sig. | _Giv dem din egen_ {app}',
      sub: 'Vi bygger apps, der gør det let at booke, bestille og komme igen.'
    },
    facts: {
      kicker: 'Kort fortalt',
      items: [
        ['Platforme', 'iPhone og Android', 'Én app, der virker på begge.'],
        ['Udgivelse', 'App Store og Google Play', 'Vi klarer udgivelsen for dig.'],
        ['Test', 'På din telefon', 'Du prøver appen undervejs, ikke først til sidst.'],
        ['Svar', '24 timer', 'Fortæl os om din idé, så svarer vi inden for 24 timer.']
      ]
    }
  },
  {
    // CRM udvikling and interne systemer on one page: a CRM is the most asked-for internal system.
    // /services/crm, /crm-udvikling and /systemer redirect here (vercel.json). The price is the one from the
    // "Interne systemer" pop-up on /services/hjemmesider (content.js addonPages.systemer).
    slug: 'interne-systemer', name: 'Interne systemer og CRM', short: 'CRM, booking og dashboards bygget til jer',
    description: 'Vi bygger interne systemer og CRM skræddersyet til din virksomhed: kundeoverblik, salgspipeline, booking, tilbud og ordrer, dashboards og medarbejderportaler. Fra 14.999 kr. som engangsbeløb.',
    serviceType: 'Udvikling af interne systemer og CRM',
    words: SERVICEFAG,
    h1: { a: ['Slut', 'med'], hot: 'regneark.', dim: 'Ét system til hele', mark: 'butikken.' },
    lead: 'Vi bygger systemer skræddersyet til din virksomhed, så kunder, aftaler, tilbud og tal er samlet ét sted, i stedet for i regneark, post-its og programmer, der næsten passer.',
    floats: ['CRM', 'Booking', 'Dashboards ↗'], ring: 'CRM • BOOKING • DASHBOARDS • PORTALER •',
    price: { amount: '14.999', pre: 'Fra', post: 'kr.', note: 'Engangsbeløb · større systemer får fast pris efter en snak · ekskl. moms' },
    priceH2: ['Dit eget system.', 'Til fast pris.'],
    priceLead: 'Du kender prisen, før vi går i gang. Mindre systemer starter ved 14.999 kr., og større systemer får en fast pris efter en snak.',
    items: [
      ['Kundesystem (CRM)', 'Samlet overblik over kunder, aftaler og historik.'],
      ['Salgspipeline', 'Se hvert lead fra første henvendelse til vundet opgave.'],
      ['Booking og kalender', 'Styr tider, medarbejdere og lokaler ét sted.'],
      ['Tilbud og ordrer', 'Fra tilbud til faktura uden dobbeltarbejde.'],
      ['Dashboards', 'Se de vigtigste tal på én skærm.'],
      ['Medarbejderportal', 'Vagtplaner, dokumenter og beskeder samlet.'],
      ['Integrationer', 'Kobles til de systemer, du allerede bruger.'],
      ['Oplæring og support', 'Vi viser jer, hvordan det virker, og hjælper, når I vokser.']
    ],
    steps: [
      ['Vi lytter', 'Vi ser på, hvordan I arbejder i dag, og hvor det driller.', '?'],
      ['Vi bygger', 'Du ser systemet undervejs og kan ønske ændringer.', '▢'],
      ['Vi følger op', 'Oplæring, support og videreudvikling, når I vokser.', '↗']
    ],
    faqs: [
      ['Hvad koster et system?', 'Mindre systemer starter ved 14.999 kr. som et engangsbeløb. Større systemer får en fast pris efter en snak, så du ved, hvad det koster, før vi går i gang.'],
      ['Hvorfor ikke bare købe et færdigt CRM?', 'Det kan være det rigtige, og så siger vi det. Et system bygget til jer passer til jeres måde at arbejde på, så I slipper for felter, I ikke bruger, og mangler ikke dem, I har brug for.'],
      ['Kan det tale med mine andre programmer?', 'Ja. Vi kobler det til fx din mail, kalender, regnskab eller webshop.', ['/services/automations', 'Læs om automations']],
      ['Kan vi bruge det på telefonen?', 'Ja. Systemet virker i browseren på computer, tablet og telefon.'],
      ['Kan vi bygge videre på det?', 'Ja. Systemet kan vokse med jer, og vi tilføjer nye funktioner, når I får brug for dem.']
    ],
    contact: 'Fortæl os, hvordan I arbejder i dag, og hvad der driller, så svarer vi inden for 24 timer med en fast pris.',
    placeholder: 'Hvad bruger I i dag, og hvad skal systemet kunne?',
    layout: ['facts', 'compare', 'showcase', 'receipt', 'timeline', 'faq', 'track'],
    facts: {
      kicker: 'Kort fortalt',
      items: [
        ['Pris', 'Fra 14.999 kr.', 'som engangsbeløb. Større systemer får fast pris efter en snak.'],
        ['Bygget til jer', 'Jeres måde', 'Felter, trin og rapporter, der passer til jeres arbejde.'],
        ['Overalt', 'Computer og telefon', 'Det virker i browseren, også ude hos kunden.'],
        ['Svar', '24 timer', 'Fortæl os, hvad der driller, så svarer vi inden for 24 timer.']
      ]
    },
    compare: {
      h2: ['Uden system.', 'Og med.'],
      lead: 'Det er det samme arbejde. Forskellen er, hvor meget af det der klarer sig selv.',
      uden: 'I dag', med: 'Med jeres eget system',
      rows: [
        ['Kunderne står i regneark, mails og post-its.', 'Alle kunder og aftaler samlet ét sted.'],
        ['Ingen ved helt, hvor et tilbud er henne.', 'Hvert lead står i pipelinen, fra henvendelse til vundet.'],
        ['Tallene skal samles i hånden hver måned.', 'Dashboardet viser dem, hver gang du kigger.'],
        ['Programmer, der næsten passer.', 'Et system bygget til jeres måde at arbejde på.']
      ]
    },
    receipt: { h2: ['Det hele er med.', 'Til én fast pris.'] },
    flow: { h2: ['Fra regneark.', 'Til ét system.'], lead: 'Du ser systemet undervejs, så det passer, når det er færdigt.', end: 'Klar til brug' }
  },
  {
    slug: 'email-marketing', name: 'E-mail marketing', short: 'Nyhedsbreve og mailflows, der sælger',
    description: 'Vi laver nyhedsbreve og automatiske mailflows, der holder kontakten med dine kunder: velkomstmails, påmindelser, tilbud og opfølgning, med tilmelding efter reglerne. Fast pris efter en kort snak.',
    serviceType: 'E-mail marketing',
    words: ['servicevirksomheder', 'webshops', 'klinikker', 'saloner', 'lokale virksomheder'],
    h1: { a: ['Mails,', 'der', 'bliver'], hot: 'læst.', dim: 'Og', mark: 'sælger.' },
    lead: 'Vi laver nyhedsbreve og automatiske mails, der holder kontakten med dine kunder, så de kommer igen. Fra velkomstmail til påmindelser og tilbud.',
    floats: ['Nyhedsbreve', 'Automatiske flows', 'Velkomstmail ↗'], ring: 'E-MAIL • NYHEDSBREVE • FLOWS • TILBUD •',
    price: null,
    priceH2: ['Fast pris.', 'Efter en snak.'],
    priceLead: 'Vi ser på dine kunder og det mailprogram, du bruger, og giver dig en fast pris inden for 24 timer.',
    items: [
      ['Nyhedsbreve', 'Design og tekst, klar til at sende.'],
      ['Velkomstflow', 'Nye kunder og tilmeldte får en god start automatisk.'],
      ['Påmindelser', 'Mind kunderne om næste tid, service eller en glemt kurv.'],
      ['Opfølgning og anmeldelser', 'En mail efter opgaven, der beder om en anmeldelse.'],
      ['Tilmelding på siden', 'Formularer, der samler tilmeldinger.'],
      ['Segmenter', 'Den rigtige mail til den rigtige kunde.'],
      ['Samtykke og GDPR', 'Tilmelding og afmelding efter reglerne.'],
      ['Rapport', 'Åbninger, klik og salg forklaret kort.']
    ],
    steps: [
      ['Liste og mål', 'Vi ser på dine kunder, og hvad mailene skal give.', '@'],
      ['Flows og skabeloner', 'Vi skriver, designer og sætter de automatiske mails op.', '✓'],
      ['Udsendelse og forbedring', 'Vi sender, måler og gør det bedre hver gang.', '↗']
    ],
    faqs: [
      ['Hvilket mailprogram bruger I?', 'Det, der passer til dig, og gerne det, du allerede har. Har du ikke noget, hjælper vi dig med at vælge.'],
      ['Hvor ofte skal jeg sende nyhedsbreve?', 'Når du har noget at sige. Én gang om måneden er et godt sted at starte, og de automatiske mails kører af sig selv imellem.'],
      ['Må jeg sende mails til mine kunder?', 'Som udgangspunkt kun til dem, der har sagt ja til det. Vi sætter tilmelding og samtykke op efter reglerne.'],
      ['Hvad koster det?', 'Du får en fast pris efter en kort snak om dine kunder og dine mål.']
    ],
    contact: 'Fortæl os om dine kunder, og hvad mailene skal give. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvem er dine kunder, og sender du mails i dag?',
    layout: ['marquee', 'showcase', 'receipt', 'faqSplit', 'grid'],
    marquee: {
      sec: 'mails', icon: 'mail',
      h2: ['Fra velkomstmail.', 'Til tilbud.'],
      lead: 'Mails som de her kan vi skrive og sætte op for dig.',
      words: ['Velkomstmail', 'Nyhedsbrev', 'Påmindelse om næste tid', 'Glemt kurv', 'Tak for i dag', 'Bed om en anmeldelse', 'Tid til service', 'Tilbud til dine kunder', 'Bekræft din tilmelding', 'Månedens nyt']
    },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'] }
  },
  {
    slug: 'cro', name: 'CRO', short: 'Flere kunder fra de besøgende, du har',
    description: 'CRO (konverteringsoptimering) får flere af dine besøgende til at ringe, skrive eller købe: analyse, heatmaps, A/B-test, tydeligere tekster og en kortere vej til kontakt. Fast pris efter en kort snak.',
    serviceType: 'Konverteringsoptimering (CRO)',
    words: ['servicevirksomheder', 'webshops', 'klinikker', 'håndværkere', 'lokale virksomheder'],
    h1: { a: ['Samme'], hot: 'trafik.', dim: 'Flere', mark: 'kunder.' },
    lead: 'CRO betyder konverteringsoptimering. Vi finder ud af, hvor dine besøgende falder fra, og retter det, så flere ringer, skriver eller køber.',
    floats: ['A/B-test', 'Heatmaps', 'Færre klik ↗'], ring: 'CRO • TEST • DATA • FLERE KUNDER •',
    price: null,
    priceH2: ['Fast pris.', 'Efter en snak.'],
    priceLead: 'Vi kigger på din side og dine tal og giver dig en fast pris inden for 24 timer.',
    items: [
      ['Analyse af din side', 'Vi ser på dine tal og finder, hvor de besøgende falder fra.'],
      ['Heatmaps', 'Se, hvor folk klikker, og hvor langt de læser.'],
      ['A/B-test', 'Vi tester to versioner mod hinanden og beholder den, der virker.'],
      ['Tydeligere tekster', 'Overskrifter og knapper, der siger, hvad kunden får.'],
      ['Kortere vej til kontakt', 'Færre felter, færre klik og knapper, der altid er synlige.'],
      ['Hastighed', 'En hurtigere side mister færre besøgende.'],
      ['Tillid', 'Anmeldelser og priser, der er nemme at finde.'],
      ['Rapport', 'Hvad vi har testet, hvad det gav, og hvad der er det næste.']
    ],
    steps: [
      ['Analyse', 'Vi finder de steder, hvor de besøgende falder fra.', '%'],
      ['Test', 'Vi tester forbedringer mod den side, du har i dag.', 'A/B'],
      ['Forbedring', 'Vi beholder det, der virker, og tager det næste.', '↗']
    ],
    faqs: [
      ['Hvad er CRO?', 'Conversion Rate Optimization, på dansk konverteringsoptimering. Det handler om at få flere af dem, der allerede besøger din side, til at blive kunder.'],
      ['Hvornår giver CRO mening?', 'Når du har besøgende, men for få henvendelser eller salg. Især hvis du betaler for trafikken med annoncer, for så giver hver ekstra kunde mere for det samme budget.'],
      ['Skal jeg have en ny hjemmeside?', 'Ikke nødvendigvis. Som regel forbedrer vi den side, du har. Er den for gammel at bygge videre på, siger vi det ærligt, og så kan vi bygge en ny fra 2.995 kr.'],
      ['Hvad koster CRO?', 'Du får en fast pris efter en kort snak om din side og dine mål.']
    ],
    contact: 'Send os din side, så kigger vi på den. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad er adressen på din side, og hvad skal den gerne give?',
    layout: ['statement', 'showcase', 'band', 'timeline', 'faq', 'track'],
    statement: {
      kicker: 'Kort sagt', pill: 'cursor',
      text: 'Du har allerede besøgende. | _Få flere af dem til at trykke_ {Ring nu}',
      sub: 'Vi finder ud af, hvor dine besøgende falder fra, og retter det, så flere ringer, skriver eller køber.'
    },
    band: { chips: ['Analyse af din side', 'Heatmaps', 'A/B-test', 'Rapport'] },
    flow: { h2: ['Vi gætter ikke.', 'Vi tester.'], lead: 'Hver forbedring bliver testet mod den side, du har i dag.', end: 'Klar til næste test' }
  }
];

// The front page
export const front = {
  title: 'Webleads · Hjemmesider, Google Ads, Meta Ads, SEO og AI',
  description: 'Webleads hjælper virksomheder med at få flere kunder online: hjemmesider fra 2.995 kr., Google Ads, Meta Ads, Google Shopping, SEO, GEO, AI, automations, e-mail marketing og CRO. Ét team og direkte kontakt.',
  ogAlt: 'Webleads: flere kunder online. Hjemmesider, annoncer, SEO og AI under ét tag.',
  words: ['servicevirksomheder', 'håndværkere', 'klinikker', 'webshops', 'frisører', 'lokale virksomheder'],
  h1: { a: ['Flere'], hot: 'kunder.', dim: 'Ét', mark: 'bureau.' },
  lead: 'Hjemmeside, annoncer, SEO, automations og AI. Vi klarer det hele, så du kan passe din forretning, og du taler direkte med dem, der laver arbejdet.',
  floats: ['Alt under ét tag', 'Direkte kontakt', 'Fast pris ↗'], ring: 'HJEMMESIDER • ANNONCER • SEO • AI • CRO •',
  promises: [
    ['Alt under ét tag.', 'Hjemmeside, annoncer, SEO og automations. Ét sted og ét team.', '1'],
    ['Fast pris.', 'Du kender prisen, før vi går i gang. Ingen overraskelser.', 'kr'],
    ['Direkte kontakt.', 'Du taler med den, der laver arbejdet. Ingen mellemled.', '@'],
    ['Svar inden for 24 timer.', 'Skriv til os, så vender vi tilbage med en fast pris.', '24']
  ],
  faqs: [
    ['Hvad koster det?', 'Det afhænger af, hvad du har brug for. En hjemmeside starter ved 2.995 kr., og SEO koster 995 kr. i timen. Annoncering koster 8.000 kr. om måneden for den første kanal og 5.000 kr. for hver ekstra, og Google Ads og Google Shopping tæller som én. Skriv til os, så får du en fast pris inden for 24 timer.'],
    ['Skal jeg købe det hele?', 'Nej. Du vælger kun det, du har brug for. Du kan starte med én ting, fx en hjemmeside eller Google Ads, og bygge på senere.'],
    ['Hvem taler jeg med?', 'Den, der laver arbejdet. Der er ingen mellemled, så du har direkte kontakt til den, der bygger din side eller kører dine annoncer.'],
    ['Er annoncebudgettet med i prisen?', 'Nej. Annoncebudgettet betaler du direkte til Google eller Meta, så du altid kan se, hvad der bliver brugt. Opsætningen af annoncerne er gratis.'],
    ['Kan I hjælpe, selvom jeg allerede har en hjemmeside?', 'Ja. Annoncer, SEO, e-mail og automations kan sagtens køre på den side, du har i dag. Vil du have en ny, flytter vi den gamle over for dig.']
  ]
};

// The tabs above the menu on every page: what the visitor sells (assets/js/segment.js).
// html[data-seg] is "ydelser" or "webshop", or missing until the visitor has chosen (the neutral page).
// Only the visitor's own choice in the tabs sets it (Mikkel, 5 Nov 2026: no links and no guessing, we must
// be sure). It is set before the page is drawn, kept in localStorage ('wl-seg'), and every event to GA4
// carries it as `segment`.
// Copy that differs: front (the hero on the front page) and order (the order of the services, everywhere
// they are listed). Anything else on a page can be shown for one segment with data-seg-only="ydelser",
// "webshop" or "neutral" (main.css hides the rest).
export const segments = {
  tabs: { q: 'Hvad sælger du?', ydelser: 'Ydelser', webshop: 'Produkter online' },
  order: {
    ydelser: ['hjemmesider', 'google-ads', 'seo', 'meta-ads', 'geo', 'ai', 'automations', 'interne-systemer', 'video', 'email-marketing', 'cro', 'app-udvikling', 'webshop', 'google-shopping-ads', 'google-css'],
    webshop: ['webshop', 'google-shopping-ads', 'google-css', 'meta-ads', 'email-marketing', 'cro', 'google-ads', 'seo', 'geo', 'ai', 'video', 'automations', 'interne-systemer', 'app-udvikling', 'hjemmesider']
  },
  front: {
    ydelser: {
      words: ['servicevirksomheder', 'håndværkere', 'klinikker', 'frisører', 'lokale virksomheder'],
      lead: 'Hjemmeside, Google Ads, SEO og automations, så flere kunder ringer og booker. Vi klarer det hele, og du taler direkte med dem, der laver arbejdet.'
    },
    webshop: {
      words: ['webshops', 'Shopify-butikker', 'netbutikker'],
      lead: 'Webshop på Shopify, Google Shopping, Meta Ads og e-mail marketing, så flere lægger varer i kurven. Vi klarer det hele, og du taler direkte med dem, der laver arbejdet.'
    }
  }
};
