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
  { slug: 'branding', t: 'Branding og logo', price: 'Fast pris efter en snak', value: 0, d: 'Logo, farver, skrifttyper og en brandguide, så du ligner dig selv overalt.', ex: ['Logo', 'Farver og skrifttyper', 'Brandguide'] },
  { slug: 'google-ads', t: 'Google Ads', price: '8.000 kr./md.', value: 8000, d: 'Vær øverst på Google, når kunderne søger lige nu.', ex: ['Søgeord og kampagner', 'Lokal målretning', 'Google Shopping med i prisen', 'Ekstra kanal: 5.000 kr./md.'] },
  { slug: 'meta-ads', t: 'Meta Ads', price: '8.000 kr./md.', value: 8000, d: 'Annoncer på Facebook og Instagram, der rammer de rigtige.', ex: ['Tekst og grafik', 'Målretning og retargeting', 'Månedlig rapport', 'Ekstra kanal: 5.000 kr./md.'] },
  { slug: 'linkedin-ads', t: 'LinkedIn Ads', price: 'Fast pris efter en snak', value: 0, d: 'Annoncer til dem, der træffer beslutningen, ud fra stilling og branche.', ex: ['Stilling og branche', 'Leadformularer', 'Retargeting'] },
  { slug: 'tiktok-ads', t: 'TikTok Ads', price: 'Fast pris efter en snak', value: 0, d: 'Korte videoannoncer, der ligner TikTok og fanger i første sekund.', ex: ['Hooks i flere versioner', 'Spark Ads', 'Katalogannoncer'] },
  { slug: 'snapchat-ads', t: 'Snapchat Ads', price: 'Fast pris efter en snak', value: 0, d: 'Annoncer i fuld skærm mellem vennernes stories.', ex: ['Lodret video', 'Lokal målretning', 'Retargeting'] },
  { slug: 'pinterest-ads', t: 'Pinterest Ads', price: 'Fast pris efter en snak', value: 0, d: 'Dine produkter, mens folk planlægger og gemmer idéer.', ex: ['Annonce-pins', 'Produktkatalog', 'Retargeting'] },
  { slug: 'youtube-annoncering', t: 'YouTube-annoncering', price: 'Fast pris efter en snak', value: 0, d: 'Videoannoncer før videoerne og mellem Shorts.', ex: ['Videoannoncer', 'Shorts', 'Bumper-annoncer'] },
  { slug: 'bing-ads', t: 'Bing Ads', price: 'Fast pris efter en snak', value: 0, d: 'Annoncer på Bing for dem, der ikke søger på Google.', ex: ['Søgeannoncer', 'Import fra Google', 'Shopping på Bing'] },
  { slug: 'reddit-ads', t: 'Reddit Ads', price: 'Fast pris efter en snak', value: 0, d: 'Annoncer i de fællesskaber, dine kunder følger.', ex: ['Fællesskaber og emner', 'Kommentarer fulgt', 'Retargeting'] },
  { slug: 'google-shopping-ads', t: 'Google Shopping Ads', price: '8.000 kr./md.', value: 8000, d: 'Dine produkter med billede og pris øverst på Google.', ex: ['Produktfeed og Merchant Center', 'Shopping og Performance Max', 'Google Ads med i prisen', 'Ekstra kanal: 5.000 kr./md.'] },
  { slug: 'google-css', t: 'Google CSS', price: '49 kr./md.', value: 49, d: 'Op til 20% billigere klik på dine Google Shopping-annoncer.', ex: ['Webleads som din CSS', 'Hele buddet tæller i auktionen', 'Shopping og Performance Max'] },
  { slug: 'markedspladser', t: 'Salg på markedspladser', price: 'Fast pris efter en snak', value: 0, d: 'Dine produkter på fx Amazon, Zalando, eBay og CDON, i sync med din webshop.', ex: ['Opsætning og feed', 'Lager og priser i sync', 'Annoncer på markedspladsen'] },
  { slug: 'video', t: 'Video', price: 'Fast pris efter en snak', value: 0, d: 'Reklamevideoer, explainer-videoer og motion graphics, der fanger på sekunder.', ex: ['Reklamevideoer til sociale medier', 'Explainer-videoer', 'Motion graphics og logoanimation'] },
  { slug: 'ugc', t: 'UGC-indhold', price: 'Fast pris efter en snak', value: 0, d: 'Videoer og billeder, der ligner noget fra en kunde. Lavet af os.', ex: ['Lodrette videoer', 'Hooks i flere versioner', 'Ret til brug i annoncer'] },
  { slug: 'influencer-marketing', t: 'Influencer marketing', price: 'Fast pris efter en snak', value: 0, d: 'Skabere, der anbefaler dig til følgere, der ligner dine kunder.', ex: ['Udvælgelse og aftaler', 'Markeret som reklame', 'Rapport pr. samarbejde'] },
  { slug: 'affiliate-marketing', t: 'Affiliate- og partnermarketing', price: 'Fast pris efter en snak', value: 0, d: 'Partnere, der sælger for dig. Du betaler provision, når der kommer et salg.', ex: ['Program og provision', 'Partnere', 'Sporing af hvert salg'] },
  { slug: 'organisk-instagram', t: 'Organisk Instagram', price: 'Fast pris efter en snak', value: 0, d: 'Fast plan, automatisk udgivelse, automatiske svar og organiske kampagner.', ex: ['Opslagsplan', 'Automatiske svar', 'Organiske kampagner'] },
  { slug: 'organisk-facebook', t: 'Organisk Facebook', price: 'Fast pris efter en snak', value: 0, d: 'En side, der poster og svarer af sig selv, også i Messenger.', ex: ['Opslagsplan', 'Messenger-automatik', 'Organiske kampagner'] },
  { slug: 'organisk-tiktok', t: 'Organisk TikTok', price: 'Fast pris efter en snak', value: 0, d: 'Serier og videoer, der bliver set uden annoncekroner.', ex: ['Videoplan', 'Automatisk udgivelse', 'Automatiske svar'] },
  { slug: 'seo', t: 'SEO', price: '995 kr./time', value: 995, d: 'Bliv fundet på Google, når kunderne søger efter det, du sælger.', ex: ['Søgeord og kategorier', 'Produktsider og teknisk SEO', 'Månedlig rapport'] },
  { slug: 'lokal-seo', t: 'Lokal SEO', price: '995 kr./time', value: 995, d: 'Bliv fundet på Google og Google Maps, når de søger i dit område.', ex: ['Google-virksomhedsprofil', 'Anmeldelser', 'Lokale sider'] },
  { slug: 'linkbuilding', t: 'Linkbuilding', price: 'Fast pris efter en snak', value: 0, d: 'Links fra rigtige danske sider, der giver din side tyngde på Google.', ex: ['Relevante danske sider', 'Ingen linkfarme', 'Hvert link i rapporten'] },
  { slug: 'geo', t: 'GEO', price: 'Fast pris efter en snak', value: 0, d: 'Bliv nævnt, når kunderne spørger ChatGPT og Googles AI om råd.', ex: ['Tjek af din synlighed i AI', 'Indhold, AI kan citere', 'Struktureret data'] },
  { slug: 'chatgpt-ads', t: 'ChatGPT Ads', price: 'Fast pris efter en snak', value: 0, d: 'Annoncer under svaret, når kunderne spørger ChatGPT om det, du sælger.', ex: ['Kampagner i ChatGPT', 'Målrettet ud fra samtalen', 'Måling af klik og salg'] },
  { slug: 'ai', t: 'AI', price: 'Fast pris efter en snak', value: 0, d: 'Chatbots, AI-annoncer og assistenter, der sparer dig tid.', ex: ['AI-chatbot døgnet rundt', 'AI-annoncering', 'AI-assistenter til rutinerne'] },
  { slug: 'automations', t: 'Automations', price: 'fra 4.999 kr.', value: 4999, d: 'Lad rutinerne klare sig selv.', ex: ['Automatiske mails og sms', 'Fakturaer og opfølgning', 'Kobling mellem dine systemer'] },
  { slug: 'interne-systemer', t: 'Interne systemer og CRM', price: 'fra 14.999 kr.', value: 14999, d: 'CRM, booking og dashboards, der passer til jeres måde at arbejde på.', ex: ['CRM og salgspipeline', 'Booking og kalender', 'Dashboards og portaler'] },
  { slug: 'app-udvikling', t: 'App-udvikling', price: 'Fast pris efter en snak', value: 0, d: 'Apps til iPhone og Android, bygget til din virksomhed.', ex: ['iPhone og Android', 'Booking, medlemskab og point', 'App Store og Google Play'] },
  { slug: 'email-marketing', t: 'E-mail marketing', price: 'Fast pris efter en snak', value: 0, d: 'Nyhedsbreve og mailflows, der får kunderne til at komme igen.', ex: ['Nyhedsbreve', 'Automatiske mailflows', 'Tilmelding efter reglerne'] },
  { slug: 'cro', t: 'CRO', price: 'Fast pris efter en snak', value: 0, d: 'Flere kunder fra de besøgende, du allerede har.', ex: ['Analyse og heatmaps', 'A/B-test', 'Kortere vej til kontakt'] },
  { slug: 'tracking', t: 'Tracking', price: 'Fast pris efter en snak', value: 0, d: 'Se, hvilke annoncer og sider der giver kunder, med GA4, Meta og server-side tracking.', ex: ['Google Analytics 4 og Tag Manager', 'Meta Conversions API', 'Server-side og samtykke'] }
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
    slug: 'seo', name: 'SEO', short: 'Bliv fundet på Google, når de søger efter det, du sælger',
    description: 'Vi sørger for, at din webshop bliver fundet på Google, når kunderne søger efter det, du sælger: søgeord, kategorisider, produktsider, struktureret data og teknisk SEO. 995 kr. i timen, ingen binding.',
    serviceType: 'Søgemaskineoptimering til webshops',
    words: ['webshops', 'netbutikker', 'Shopify-butikker', 'brands'],
    h1: { a: ['Bliv', 'fundet'], hot: 'først.', dim: 'Uden at betale for', mark: 'klik.' },
    lead: 'Vi sørger for, at din webshop dukker op på Google, når nogen søger efter det, du sælger: med de rigtige søgeord, stærke kategorier og produktsider, og alt det tekniske i orden.',
    floats: ['Kategorisider', 'Teknisk SEO', 'Månedlig rapport ↗'], ring: 'SEO • WEBSHOPS • KATEGORIER • TEKNISK •',
    price: { amount: '995', pre: '', post: 'kr./time', note: 'Timepris · ingen binding · ekskl. moms' },
    priceH2: ['Én timepris.', 'Ingen binding.'],
    priceLead: 'Du bestemmer, hvor mange timer vi bruger om måneden, og hver måned kan du se, hvad vi har lavet.',
    items: [
      ['Søgeord', 'Vi finder de ord, dine kunder faktisk søger på.'],
      ['Kategorisider', 'Tekster og struktur, der får dine kategorier op.'],
      ['Produktsider', 'Titler og tekster, som både Google og kunderne forstår.'],
      ['Struktureret data', 'Pris, lagerstatus og anmeldelser, som Google kan vise i resultaterne.'],
      ['Teknisk SEO', 'Hastighed, struktur, filtre og alt det bag kulisserne.'],
      ['Konkurrenter', 'Vi ser på, hvad dem over dig gør, og gør det bedre.'],
      ['Månedlig rapport', 'Kort og klart overblik over, hvad der virker.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Analyse', 'Vi ser på din webshop, dine konkurrenter og dine søgeord.', 'G'],
      ['Plan', 'Du får en klar plan, og vi aftaler, hvor mange timer der skal bruges.', '✓'],
      ['Løbende arbejde', 'Vi optimerer hver måned og viser dig resultaterne.', '↗']
    ],
    faqs: [
      ['Hvad koster SEO?', '995 kr. i timen ekskl. moms. Du bestemmer, hvor mange timer vi bruger om måneden, og der er ingen binding.'],
      ['Hvor lang tid tager det?', 'SEO er et sejt træk. Det tager typisk nogle måneder, før placeringerne for alvor flytter sig, men du kan følge med i rapporten hver måned.'],
      ['Kan I garantere en førsteplads?', 'Nej, og det kan ingen ærligt love. Google bestemmer rækkefølgen. Vi lover, at vi gør det rigtige arbejde og viser dig, hvad det giver.'],
      ['Hvad med links?', 'Links fra andre sider er en del af SEO, og dem kan vi også hjælpe med.', ['/services/linkbuilding', 'Læs om linkbuilding']],
      ['Jeg er en lokal virksomhed. Er det her noget for mig?', 'Skal du findes i dit område og på Google Maps, har vi en side til netop det.', ['/services/lokal-seo', 'Læs om lokal SEO']]
    ],
    contact: 'Fortæl os, hvad du sælger, og hvad du gerne vil findes på. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger din webshop, og hvad vil du gerne findes på?',
    layout: ['showcase', 'marquee', 'price', 'timeline', 'grid', 'faqSplit'],
    marquee: {
      sec: 'soegninger', icon: 'search', tag: true,
      h2: ['Det søger dine kunder på.', 'Lige før de køber.'],
      lead: 'Vi finder de ord, dine kunder faktisk søger på.',
      words: ['løbesko herre', 'sofabord eg', 'gave til veninde', 'hoftesæde baby', 'massagestol tilbud', 'fastelavnskostume børn', 'kaffemaskine bedst i test', 'sengetøj bomuld', 'hundefoder uden korn', 'lampe til stue', 'vinterjakke dame', 'legetøj 3 år', 'hårkur tørt hår', 'gaming stol']
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
  },
  {
    slug: 'lokal-seo',
    name: 'Lokal SEO og virksomhedsprofil',
    short: 'Bliv fundet på kortet, når de søger lokalt',
    description: 'Vi sørger for, at din virksomhed bliver fundet på Google og Google Maps, når nogen søger efter det, du laver, i dit område: Google-virksomhedsprofil, anmeldelser, lokale sider og søgeord. 995 kr. i timen, ingen binding.',
    serviceType: 'Lokal SEO',
    words: SERVICEFAG,
    h1: { a: ['Med', 'på'], hot: 'kortet.', dim: 'Når de søger', mark: 'lokalt.' },
    lead: 'Når nogen søger efter en tømrer, en frisør eller en klinik i nærheden, viser Google et kort med tre virksomheder. Vi arbejder for, at du er en af dem: med din virksomhedsprofil, dine anmeldelser og siderne om dit område.',
    floats: ['Google-profil', 'Anmeldelser', 'Månedlig rapport ↗'],
    ring: 'LOKAL SEO • GOOGLE MAPS • PROFIL • ANMELDELSER •',
    price: { amount: '995', pre: '', post: 'kr./time', note: 'Timepris · ingen binding · ekskl. moms' },
    priceH2: ['Én timepris.', 'Ingen binding.'],
    priceLead: 'Du bestemmer, hvor mange timer vi bruger om måneden, og hver måned kan du se, hvad vi har lavet.',
    items: [
      ['Virksomhedsprofil', 'Opsætning og pleje af din profil på Google og Google Maps.'],
      ['Anmeldelser', 'Vi hjælper dig med at få flere og med at svare på dem.'],
      ['Billeder og opslag', 'Nye billeder og opslag, så profilen er levende.'],
      ['Lokale sider', 'Sider om dit fag i de byer, du arbejder i.'],
      ['Lokale søgeord', 'Fx “frisør Roskilde” eller “tømrer i nærheden”.'],
      ['Ens oplysninger', 'Navn, adresse og telefon ens overalt på nettet.'],
      ['Månedlig rapport', 'Visninger, opkald og ruteanmodninger fra profilen.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Profiltjek', 'Vi gennemgår din profil, dine anmeldelser og dine konkurrenter på kortet.', '⌖'],
      ['Plan', 'Du får en plan, og vi aftaler, hvor mange timer der skal bruges.', '✓'],
      ['Løbende arbejde', 'Vi plejer profilen hver måned og viser dig, hvad det giver.', '↗']
    ],
    faqs: [
      ['Hvad er en Google-virksomhedsprofil?', 'Det er din virksomhed på Google og Google Maps: åbningstider, telefon, billeder og anmeldelser. Det er tit det første, en kunde ser.'],
      ['Kan I få mig øverst på kortet?', 'Ingen kan ærligt love en bestemt plads, for det er Google, der bestemmer. Vi gør det arbejde, der tæller, og viser dig, hvad det giver.'],
      ['Hvad koster det?', '995 kr. i timen ekskl. moms. Du bestemmer, hvor mange timer vi bruger om måneden, og der er ingen binding.'],
      ['Jeg har en webshop. Er det her noget for mig?', 'Den her side handler om at blive fundet lokalt. Sælger du på nettet, passer vores SEO til webshops bedre.', ['/services/seo', 'Læs om SEO til webshops']]
    ],
    contact: 'Fortæl os hvad du laver, og hvor du holder til. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver din virksomhed, og hvor vil du findes?',
    layout: ['showcase', 'statement', 'price', 'timeline', 'faqSplit', 'track'],
    statement: { kicker: 'Kort sagt', pill: 'search', text: 'Når nogen søger {tømrer i nærheden}, viser Google *tre.* | _Vær en af_ *dem.*', sub: 'Vi arbejder med din profil, dine anmeldelser og dine lokale sider, så Google har grund til at vise dig.' },
    flow: { h2: ['Først et tjek.', 'Så det løbende arbejde.'], lead: 'Du bestemmer, hvor mange timer vi bruger, og hver måned kan du se, hvad vi har lavet.', end: 'Hver måned' }
  },
  {
    slug: 'linkbuilding',
    name: 'Linkbuilding',
    short: 'Links, der giver din side tyngde på Google',
    description: 'Vi skaffer relevante links fra rigtige danske sider, der giver din hjemmeside eller webshop mere tyngde på Google. Ingen linkfarme. Fast pris efter en snak.',
    serviceType: 'Linkbuilding',
    words: ['webshops', 'servicevirksomheder', 'B2B-virksomheder', 'lokale virksomheder'],
    h1: { a: ['Links,', 'der'], hot: 'tæller.', dim: 'Fra sider, folk', mark: 'læser.' },
    lead: 'Google stoler mere på din side, når andre gode sider linker til den. Vi skaffer relevante links fra rigtige danske sider, så du kan stige på de søgninger, der betyder noget.',
    floats: ['Danske sider', 'Ingen linkfarme', 'Fast pris ↗'],
    ring: 'LINKBUILDING • AUTORITET • SEO • PR •',
    price: null,
    priceH2: ['Rigtige links.', 'Til en fast pris.'],
    priceLead: 'Du får en plan for, hvilke sider vi går efter, og hver måned kan du se de links, vi har skaffet.',
    items: [
      ['Linkanalyse', 'Vi ser på dine links i dag, og hvad dine konkurrenter har.'],
      ['Relevante sider', 'Danske sider inden for dit fag og dit område.'],
      ['Gæsteindlæg', 'Artikler med indhold, som læserne faktisk vil have.'],
      ['Digital PR', 'Historier, som medier og blogs har lyst til at linke til.'],
      ['Lokale links', 'Foreninger, samarbejdspartnere og lokale medier.'],
      ['Ingen linkfarme', 'Vi bruger ikke sider, der kun findes for at sælge links.'],
      ['Månedlig rapport', 'Hvert link med adresse, så du kan se det selv.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Analyse', 'Vi ser på dine links, dine konkurrenter og de søgninger, du vil op på.', '?'],
      ['Plan', 'Du får en liste over de sider og emner, vi går efter.', '✓'],
      ['Links hver måned', 'Vi skaffer links og viser dig hvert eneste.', '↗']
    ],
    faqs: [
      ['Hvad er linkbuilding?', 'Det er at få andre hjemmesider til at linke til din. Google ser links fra gode, relevante sider som et tegn på, at din side er værd at vise.'],
      ['Køber I links?', 'Vi bruger ikke linkfarme eller netværk, der kun findes for at sælge links, for det kan skade din side. Koster en artikel på en side penge, siger vi det altid på forhånd.'],
      ['Hvor hurtigt virker det?', 'Links virker over tid. Det tager typisk nogle måneder, før det for alvor kan ses på placeringerne.'],
      ['Hænger det sammen med SEO?', 'Ja. Links er én del af SEO. Teksterne og det tekniske på din side skal også være i orden.', ['/services/seo', 'Læs om SEO']]
    ],
    contact: 'Fortæl os hvilken side det handler om, og hvad du gerne vil findes på. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvilken side skal have flere links, og hvad vil du findes på?',
    layout: ['statement', 'showcase', 'facts', 'band', 'timeline', 'faqSplit', 'grid'],
    statement: { kicker: 'Kort sagt', pill: 'spark', text: 'Et link fra en god side er en {anbefaling} til Google. | _Jo flere gode,_ *jo bedre.*', sub: 'Vi skaffer links fra rigtige danske sider med rigtige læsere. Ingen genveje, der kan skade din side.' },
    facts: { kicker: 'Linkbuilding, kort fortalt', items: [['Kilder', 'Danske sider', 'Relevante for dit fag, dit område eller dine kunder.'], ['Metode', 'Ingen linkfarme', 'Links, der også giver mening for et menneske.'], ['Overblik', 'Hvert link', 'Du får adressen på hvert link, vi skaffer.'], ['Svar', '24 timer', 'Skriv til os, så svarer vi inden for 24 timer.']] },
    band: { chips: ['Relevante sider', 'Gæsteindlæg', 'Digital PR', 'Månedlig rapport'] },
    flow: { h2: ['Først en plan.', 'Så links hver måned.'], lead: 'Du ved hele tiden, hvilke links vi har skaffet, og hvor de står.', end: 'Hver måned' }
  },
  {
    slug: 'linkedin-ads',
    name: 'LinkedIn Ads',
    short: 'Annoncer til dem, der træffer beslutningen',
    description: 'Vi opsætter og styrer dine LinkedIn-annoncer, så du rammer de rigtige virksomheder, brancher og stillinger. Fast pris efter en snak, og annoncebudgettet betaler du direkte til LinkedIn.',
    serviceType: 'LinkedIn-annoncering',
    words: ['B2B-virksomheder', 'konsulenter', 'rådgivere', 'softwarefirmaer', 'produktionsvirksomheder'],
    h1: { a: ['Ram', 'de', 'rigtige'], hot: 'titler.', dim: 'I de rigtige', mark: 'firmaer.' },
    lead: 'På LinkedIn kan du vise dine annoncer til folk ud fra deres stilling, branche og virksomhedens størrelse. Vi bygger kampagnerne, så du rammer dem, der træffer beslutningen.',
    floats: ['Stilling og branche', 'Leadformularer', 'Fast pris ↗'],
    ring: 'LINKEDIN • B2B • LEADS • RETARGETING •',
    price: null,
    priceH2: ['Hele opsætningen.', 'Til en fast pris.'],
    priceLead: 'Annoncebudgettet betaler du direkte til LinkedIn. Vi står for resten og viser dig hver måned, hvad det giver.',
    items: [
      ['Målgrupper', 'Stilling, branche, virksomhedsstørrelse og område.'],
      ['Annoncer', 'Tekst og grafik, der taler til en travl beslutningstager.'],
      ['Leadformularer', 'Kontaktoplysninger direkte fra LinkedIn, uden at de skal forlade appen.'],
      ['Retargeting', 'Vis dig igen for dem, der har besøgt din side.'],
      ['Måling', 'Vi måler henvendelser, ikke bare klik.'],
      ['Månedlig rapport', 'Kort og klart: hvad har det givet?'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Målgruppe', 'Vi finder ud af, hvem der træffer beslutningen hos dine kunder.', '◎'],
      ['Kampagne', 'Annoncer, målgrupper og måling bliver sat op.', '✓'],
      ['Optimering', 'Vi justerer løbende og viser dig, hvad det giver.', '↗']
    ],
    faqs: [
      ['Hvem kan jeg ramme på LinkedIn?', 'Folk ud fra stilling, anciennitet, branche, virksomhedens størrelse og område. Derfor passer LinkedIn godt, når du sælger til andre virksomheder.'],
      ['Er annoncebudgettet med i prisen?', 'Nej. Budgettet betaler du direkte til LinkedIn, så du altid kan se, hvad der bliver brugt.'],
      ['Er LinkedIn dyrere end Facebook?', 'Et klik koster ofte mere på LinkedIn, men du rammer også mere præcist. Vi hjælper dig med at vurdere, om det kan betale sig for dig.'],
      ['Kan I også skrive annoncerne?', 'Ja. Vi skriver teksterne og laver grafikken, og du godkender dem, før de går live.']
    ],
    contact: 'Fortæl os hvem du sælger til, og hvad du vil have flere af. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvem sælger du til, og hvad vil du have flere af?',
    layout: ['facts', 'showcase', 'statement', 'receipt', 'cards', 'faq', 'track'],
    facts: { kicker: 'LinkedIn Ads, kort fortalt', items: [['Målretning', 'Stilling', 'Ram folk ud fra titel, branche og virksomhed.'], ['Budget', 'Dit eget', 'Du betaler annoncerne direkte til LinkedIn.'], ['Måling', 'Henvendelser', 'Vi måler leads, ikke bare klik.'], ['Svar', '24 timer', 'Skriv til os, så svarer vi inden for 24 timer.']] },
    statement: { kicker: 'Kort sagt', pill: 'cursor', text: 'Din næste kunde sidder på et {kontor}. | _Vis dig dér,_ *hvor de er.*', sub: 'På LinkedIn er folk på arbejde. Det er et godt sted at fange dem, der træffer beslutningen.' },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'], notes: ['Annoncebudget betales direkte til LinkedIn'] }
  },
  {
    slug: 'tiktok-ads',
    name: 'TikTok Ads',
    short: 'Annoncer, der ligner TikTok',
    description: 'Vi laver og styrer dine annoncer på TikTok med korte, lodrette videoer, der ligner resten af feedet. Fast pris efter en snak, og annoncebudgettet betaler du direkte til TikTok.',
    serviceType: 'TikTok-annoncering',
    words: ['webshops', 'brands', 'caféer og restauranter', 'events', 'apps'],
    h1: { a: ['Stop'], hot: 'scrollet.', dim: 'I første', mark: 'sekund.' },
    lead: 'På TikTok bliver alt, der ligner en reklame, scrollet væk. Vi laver korte videoer, der fanger i første sekund, og styrer annoncerne, så de rammer dem, der køber.',
    floats: ['Lodret video', 'Spark Ads', 'Fast pris ↗'],
    ring: 'TIKTOK • VIDEO • HOOKS • ANNONCER •',
    price: null,
    priceH2: ['Hele opsætningen.', 'Til en fast pris.'],
    priceLead: 'Annoncebudgettet betaler du direkte til TikTok. Vi står for videoerne, kampagnerne og rapporten.',
    items: [
      ['Hooks', 'De første sekunder, der får folk til at blive hængende.'],
      ['Video til feedet', 'Korte, lodrette videoer, der ligner TikTok.'],
      ['Spark Ads', 'Vi kan bruge dine egne opslag eller en skabers video som annonce.'],
      ['Målgrupper', 'Interesser, alder og målgrupper, der ligner dine kunder.'],
      ['Katalogannoncer', 'Dine produkter direkte i annoncerne, hvis du har en webshop.'],
      ['Måling', 'TikTok-pixel og konverteringer sat op.'],
      ['Månedlig rapport', 'Kort og klart: hvad har det givet?'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Hooks', 'Vi skriver de første sekunder i flere versioner.', '!'],
      ['Video', 'Vi optager eller klipper videoerne i TikToks format.', '▶'],
      ['Test', 'Flere versioner kører, og budgettet flytter derhen, hvor det virker.', '↗']
    ],
    faqs: [
      ['Skal vi selv være på video?', 'Det er ikke et krav. Vi kan bruge skabere, UGC eller dit eget materiale. Men det virker tit godt, når folk kan se, hvem der står bag.', ['/services/ugc', 'Se UGC-indhold']],
      ['Hvad er Spark Ads?', 'Annoncer lavet af rigtige opslag, enten dine egne eller en skabers. De ligner almindelige TikToks, og likes og kommentarer bliver på opslaget.'],
      ['Er annoncebudgettet med i prisen?', 'Nej. Budgettet betaler du direkte til TikTok.'],
      ['Hvad er forskellen på TikTok Ads og organisk TikTok?', 'Med annoncer betaler du for at blive vist. Organisk handler om videoer, der bliver set, uden at du betaler for det. Det ene kan sagtens hjælpe det andet.', ['/services/organisk-tiktok', 'Læs om organisk TikTok']]
    ],
    contact: 'Fortæl os hvad du sælger, og hvem du vil ramme. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og hvem vil du ramme på TikTok?',
    layout: ['showcase', 'marquee', 'statement', 'band', 'cards', 'faqSplit', 'track'],
    marquee: { sec: 'hooks', icon: 'spark', tag: {  }, h2: ['Det første sekund.', 'Det er dér, det afgøres.'], lead: 'Eksempler på hooks, vi tester.', words: ['3 ting, du ikke vidste om …', 'Vi prøvede det, så du ikke skal', 'POV: du har lige fået …', 'Svar på kommentar', 'Unboxing', 'Før og efter', 'Sådan bruger du den', 'Det mest stillede spørgsmål', 'Det, ingen fortæller dig om …', 'Tag din ven, der …', 'Kan man virkelig …?', 'En dag med …'] },
    statement: { kicker: 'Kort sagt', pill: 'spark', text: 'Det, der ligner en {reklame}, bliver scrollet væk. | _Det, der ligner TikTok,_ *bliver set.*', sub: 'Vi laver annoncer, der passer ind i feedet, og tester flere versioner, så pengene går til dem, der virker.' },
    band: { chips: ['Hooks', 'Video til feedet', 'Spark Ads', 'Månedlig rapport'] }
  },
  {
    slug: 'snapchat-ads',
    name: 'Snapchat Ads',
    short: 'Annoncer mellem vennernes stories',
    description: 'Vi laver og styrer dine annoncer på Snapchat, så du rammer unge målgrupper mellem vennernes stories. Fast pris efter en snak, og annoncebudgettet betaler du direkte til Snapchat.',
    serviceType: 'Snapchat-annoncering',
    words: ['webshops', 'caféer og restauranter', 'fitnesscentre', 'frisører', 'events'],
    h1: { a: ['Med', 'i'], hot: 'snappen.', dim: 'Mellem vennernes', mark: 'stories.' },
    lead: 'Snapchat er der, hvor mange unge taler med deres venner hver dag. Vi laver korte annoncer i fuld skærm, der passer ind mellem vennernes stories, og vi kan ramme dem i dit område.',
    floats: ['Lodret video', 'Lokal målretning', 'Fast pris ↗'],
    ring: 'SNAPCHAT • STORIES • SPOTLIGHT • UNGE •',
    price: null,
    priceH2: ['Hele opsætningen.', 'Til en fast pris.'],
    priceLead: 'Annoncebudgettet betaler du direkte til Snapchat. Vi står for annoncerne, kampagnerne og rapporten.',
    items: [
      ['Annoncer i fuld skærm', 'Lodrette videoer og billeder, der passer til Snapchat.'],
      ['Målgrupper', 'Alder, interesser og område.'],
      ['Lokal målretning', 'Ram folk tæt på din butik eller dit område.'],
      ['Retargeting', 'Vis dig igen for dem, der har besøgt din side.'],
      ['Måling', 'Snap-pixel og konverteringer sat op.'],
      ['Månedlig rapport', 'Kort og klart: hvad har det givet?'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Idé', 'Vi finder vinklen, der får en ung til at stoppe op.', '!'],
      ['Produktion', 'Korte, lodrette annoncer i Snapchats format.', '▶'],
      ['Kampagne', 'Vi kører, justerer og viser dig, hvad det giver.', '↗']
    ],
    faqs: [
      ['Hvem kan jeg ramme på Snapchat?', 'Især unge. Du kan målrette efter alder, interesser og område, fx folk tæt på din café eller dit fitnesscenter.'],
      ['Skal jeg selv lave videoerne?', 'Nej. Vi laver annoncerne, eller vi klipper dem af det materiale, du har. Du godkender dem, før de går live.'],
      ['Er annoncebudgettet med i prisen?', 'Nej. Budgettet betaler du direkte til Snapchat.'],
      ['Kan det betale sig for en lille virksomhed?', 'Det kan det, hvis dine kunder er unge. Vi siger det ærligt, hvis vi tror, pengene gør mere gavn et andet sted.']
    ],
    contact: 'Fortæl os hvad du sælger, og hvem dine kunder er. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og hvor gamle er dine kunder?',
    layout: ['statement', 'showcase', 'marquee', 'receipt', 'timeline', 'faq', 'track'],
    statement: { kicker: 'Kort sagt', pill: 'cursor', text: 'Ét {tap}, og de er inde på din side. | _Hvis annoncen_ *fanger.*', sub: 'Vi laver annoncer, der ligner resten af Snapchat, så de bliver set i stedet for sprunget over.' },
    marquee: { sec: 'formater', icon: 'spark', tag: {  }, h2: ['Det kan vi lave.', 'I Snapchats format.'], lead: 'Eksempler på annoncer, der passer ind.', words: ['Story-annonce', 'Tilbud i weekenden', 'Ny menu', 'Åbningsfest', 'Før og efter', 'Kom forbi i dag', 'Ugens produkt', 'Event', 'Rabatkode', 'Bag kulissen', 'Ny kollektion', 'Happy hour'] },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'], notes: ['Annoncebudget betales direkte til Snapchat'] },
    flow: { h2: ['Fra idé.', 'Til snap.'], lead: 'Vi laver annoncerne, kører dem og viser dig, hvad de giver.', end: 'Hver måned' }
  },
  {
    slug: 'pinterest-ads',
    name: 'Pinterest Ads',
    short: 'Annoncer, mens de planlægger og drømmer',
    description: 'Vi opsætter og styrer dine annoncer på Pinterest, så dine produkter bliver vist, når folk planlægger køb til hjemmet, brylluppet, haven eller garderoben. Fast pris efter en snak, og annoncebudgettet betaler du direkte til Pinterest.',
    serviceType: 'Pinterest-annoncering',
    words: ['webshops', 'boligbutikker', 'tøjbutikker', 'bryllupsbranchen', 'havecentre'],
    h1: { a: ['Med', 'på'], hot: 'tavlen.', dim: 'Før de', mark: 'køber.' },
    lead: 'På Pinterest leder folk efter idéer til noget, de vil købe eller lave: et nyt køkken, et bryllup, en gave. Vi viser dine produkter, mens de planlægger, så du er med fra start.',
    floats: ['Pins', 'Produktkatalog', 'Fast pris ↗'],
    ring: 'PINTEREST • IDÉER • PINS • PRODUKTER •',
    price: null,
    priceH2: ['Hele opsætningen.', 'Til en fast pris.'],
    priceLead: 'Annoncebudgettet betaler du direkte til Pinterest. Vi står for pins, kampagner og rapporten.',
    items: [
      ['Annonce-pins', 'Billeder og videoer, der ligner det, folk gemmer.'],
      ['Produktkatalog', 'Dine produkter fra webshoppen direkte i annoncerne.'],
      ['Søgeord og interesser', 'Vis dig for dem, der leder efter idéer inden for dit emne.'],
      ['Retargeting', 'Vis dig igen for dem, der har set dine produkter.'],
      ['Måling', 'Pinterest-tag og konverteringer sat op.'],
      ['Månedlig rapport', 'Kort og klart: hvad har det givet?'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Idéer', 'Vi finder ud af, hvad dine kunder leder efter.', 'P'],
      ['Pins', 'Billeder og videoer i Pinterests format.', '▢'],
      ['Kampagne', 'Vi kører, justerer og viser dig, hvad det giver.', '↗']
    ],
    faqs: [
      ['Hvem passer Pinterest til?', 'Især webshops og butikker med noget visuelt: bolig, mode, bryllup, have, mad og gaver.'],
      ['Kan mine produkter komme direkte fra webshoppen?', 'Ja. Vi kan koble dit produktkatalog til Pinterest, så dine produkter bliver vist med billede og pris.'],
      ['Er annoncebudgettet med i prisen?', 'Nej. Budgettet betaler du direkte til Pinterest.'],
      ['Hvor hurtigt virker det?', 'Folk planlægger tit længe på Pinterest, så det kan tage lidt tid, før det kan ses i salget. Vi måler både salg og hvor mange der gemmer dine pins.']
    ],
    contact: 'Fortæl os hvad du sælger, og hvem dine kunder er. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og hvad leder dine kunder efter?',
    layout: ['showcase', 'facts', 'marquee', 'receipt', 'timeline', 'faqSplit', 'grid'],
    facts: { kicker: 'Pinterest Ads, kort fortalt', items: [['Hvornår', 'Før købet', 'Folk er på Pinterest, når de planlægger.'], ['Produkter', 'Fra webshoppen', 'Dit katalog direkte i annoncerne.'], ['Budget', 'Dit eget', 'Du betaler annoncerne direkte til Pinterest.'], ['Svar', '24 timer', 'Skriv til os, så svarer vi inden for 24 timer.']] },
    marquee: { sec: 'ideer', icon: 'search', tag: {  }, h2: ['Det søger de efter.', 'Når de planlægger.'], lead: 'Eksempler på søgninger på Pinterest.', words: ['nordisk køkken', 'bryllupsborde', 'lille altan', 'gaveidéer til hende', 'efterårsoutfit', 'børneværelse', 'sommerhus indretning', 'julebord pynt', 'have med krukker', 'nemme middage', 'badeværelse inspiration', 'sofa i bouclé'] },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'], notes: ['Annoncebudget betales direkte til Pinterest'] },
    flow: { h2: ['Fra idé.', 'Til kurven.'], lead: 'Vi viser dine produkter, mens folk planlægger, og måler, hvad det giver.', end: 'Hver måned' }
  },
  {
    slug: 'youtube-annoncering',
    name: 'YouTube-annoncering',
    short: 'Videoannoncer, der bliver set',
    description: 'Vi laver og styrer dine videoannoncer på YouTube, både før videoerne og mellem Shorts. Fast pris efter en snak, og annoncebudgettet betaler du direkte til Google.',
    serviceType: 'YouTube-annoncering',
    words: ['servicevirksomheder', 'webshops', 'brands', 'lokale virksomheder'],
    h1: { a: ['Video,', 'der', 'bliver'], hot: 'set.', dim: 'Også efter', mark: 'fem sekunder.' },
    lead: 'På YouTube kan man springe annoncen over efter fem sekunder. Vi laver videoer, der siger det vigtigste med det samme, og styrer kampagnerne, så de bliver vist for dem, der kan blive dine kunder.',
    floats: ['Shorts', 'Før videoen', 'Fast pris ↗'],
    ring: 'YOUTUBE • VIDEO • SHORTS • ANNONCER •',
    price: null,
    priceH2: ['Hele opsætningen.', 'Til en fast pris.'],
    priceLead: 'Annoncebudgettet betaler du direkte til Google. Vi står for videoerne, kampagnerne og rapporten.',
    items: [
      ['Videoannoncer', 'Annoncer før og under videoer.'],
      ['Shorts', 'Lodrette annoncer mellem Shorts.'],
      ['Bumper-annoncer', 'Seks sekunder, der ikke kan springes over.'],
      ['Målgrupper', 'Interesser, søgninger og område.'],
      ['Retargeting', 'Vis dig igen for dem, der har besøgt din side.'],
      ['Måling', 'Visninger, klik og henvendelser i samme rapport.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Manus', 'Vi skriver de første sekunder, så budskabet kommer med det samme.', '✎'],
      ['Video', 'Vi laver videoen eller klipper den af dit materiale.', '▶'],
      ['Kampagne', 'Vi kører, justerer og viser dig, hvad det giver.', '↗']
    ],
    faqs: [
      ['Skal jeg have en video?', 'Nej. Vi kan lave den eller klippe den af det, du har.', ['/services/video', 'Læs om video']],
      ['Betaler jeg, når nogen springer over?', 'Ved de fleste videoannoncer betaler du først, når nogen har set med et stykke tid eller klikker. Vi forklarer valgmulighederne, når vi sætter det op.'],
      ['Er annoncebudgettet med i prisen?', 'Nej. Budgettet betaler du direkte til Google.'],
      ['Hænger det sammen med Google Ads?', 'Ja. YouTube-annoncer laves i Google Ads, så vi kan bruge de samme målgrupper og den samme måling.', ['/services/google-ads', 'Læs om Google Ads']]
    ],
    contact: 'Fortæl os hvad du sælger, og om du allerede har video. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og har du allerede videoer?',
    layout: ['showcase', 'statement', 'compare', 'receipt', 'timeline', 'faq', 'grid'],
    statement: { kicker: 'Kort sagt', pill: 'spark', text: 'Du har {fem sekunder}, før de kan springe over. | _Vi bruger dem_ *rigtigt.*', sub: 'Det vigtigste kommer først: hvem du er, og hvorfor de skal blive hængende.' },
    compare: { kicker: 'Forskellen', h2: ['En video.', 'Og en annonce, der virker.'], lead: 'Det er ikke nok, at videoen er flot. Den skal også bygges til YouTube.', uden: 'Typisk video', med: 'Bygget til YouTube', rows: [['Logoet kommer først, budskabet til sidst.', 'Budskabet kommer i de første sekunder.'], ['Kun lavet i bredformat.', 'Både bredformat og lodret til Shorts.'], ['Vises for alle.', 'Vises for dem, der ser og søger på dit emne.'], ['Ingen ved, hvad den gav.', 'Klik og henvendelser bliver målt.']] },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'], notes: ['Annoncebudget betales direkte til Google'] },
    flow: { h2: ['Fra manus.', 'Til visninger.'], lead: 'Vi skriver, laver og kører annoncerne, og du kan følge med i, hvad de giver.', end: 'Hver måned' }
  },
  {
    slug: 'bing-ads',
    name: 'Bing Ads',
    short: 'Annoncer for dem, der ikke søger på Google',
    description: 'Vi opsætter og styrer dine annoncer på Bing gennem Microsoft Advertising, så du også bliver vist for dem, der ikke søger på Google. Vi kan bygge videre på dine Google-kampagner. Fast pris efter en snak, og annoncebudgettet betaler du direkte til Microsoft.',
    serviceType: 'Microsoft Advertising (Bing)',
    words: ['servicevirksomheder', 'webshops', 'B2B-virksomheder', 'lokale virksomheder'],
    h1: { a: ['Dem,', 'der', 'ikke'], hot: 'googler.', dim: 'Dem tager', mark: 'vi.' },
    lead: 'Ikke alle søger på Google. Bing er søgemaskinen i Microsoft Edge og på mange Windows-computere, og mange søger der uden at tænke over det. Vi viser dine annoncer for dem og bygger gerne videre på dine Google-kampagner.',
    floats: ['Microsoft Advertising', 'Import fra Google', 'Fast pris ↗'],
    ring: 'BING • MICROSOFT • SØGNING • ANNONCER •',
    price: null,
    priceH2: ['Hele opsætningen.', 'Til en fast pris.'],
    priceLead: 'Annoncebudgettet betaler du direkte til Microsoft. Vi står for resten og viser dig hver måned, hvad det giver.',
    items: [
      ['Søgeannoncer', 'Annoncer på Bing, når nogen søger efter det, du laver.'],
      ['Import fra Google', 'Vi kan flytte dine Google-kampagner over og tilpasse dem.'],
      ['Shopping på Bing', 'Dine produkter med billede og pris, hvis du har en webshop.'],
      ['Målretning', 'Område, tidspunkter og enheder.'],
      ['Måling', 'Konverteringer sat rigtigt op med Microsofts tag.'],
      ['Månedlig rapport', 'Kort og klart: hvad har det givet?'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Analyse', 'Vi ser på dine søgeord og dine Google-kampagner, hvis du har dem.', 'B'],
      ['Opsætning', 'Kampagner, annoncer og måling bliver sat op.', '✓'],
      ['Optimering', 'Vi justerer løbende og viser dig, hvad det giver.', '↗']
    ],
    faqs: [
      ['Bruger nogen Bing?', 'Ja. Bing er søgemaskinen i Microsoft Edge og på mange Windows-computere, og mange søger der uden at tænke over det. Det er færre end på Google, men der er også færre annoncører at konkurrere med.'],
      ['Skal jeg vælge mellem Google og Bing?', 'Nej. De fleste bruger Bing som et supplement til Google. Vi kan bygge videre på dine Google-kampagner, så du ikke starter forfra.', ['/services/google-ads', 'Læs om Google Ads']],
      ['Er annoncebudgettet med i prisen?', 'Nej. Budgettet betaler du direkte til Microsoft.'],
      ['Virker det for en webshop?', 'Ja. Med Microsoft Shopping kan dine produkter blive vist med billede og pris på Bing.']
    ],
    contact: 'Fortæl os hvad du laver, og om du allerede annoncerer på Google. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver du, og annoncerer du allerede på Google?',
    layout: ['compare', 'showcase', 'facts', 'band', 'timeline', 'faq', 'grid'],
    compare: { kicker: 'Forskellen', h2: ['Kun Google.', 'Og Google plus Bing.'], lead: 'Det er de samme kunder. Nogle af dem bruger bare en anden søgemaskine.', uden: 'Kun Google', med: 'Med Bing', rows: [['Du er væk, når nogen søger på Bing.', 'Du bliver også vist på Bing.'], ['Alle dine konkurrenter byder mod dig på Google.', 'Færre annoncører om de samme søgeord.'], ['Én kanal at være afhængig af.', 'To kanaler, der bygger på det samme arbejde.'], ['Kampagnerne skal bygges fra bunden.', 'Vi kan importere dine Google-kampagner og tilpasse dem.']] },
    facts: { kicker: 'Bing Ads, kort fortalt', items: [['Hvor', 'Bing og Edge', 'Søgemaskinen i Microsofts browser og på mange Windows-computere.'], ['Opstart', 'Import', 'Vi kan bygge videre på dine Google-kampagner.'], ['Budget', 'Dit eget', 'Du betaler annoncerne direkte til Microsoft.'], ['Svar', '24 timer', 'Skriv til os, så svarer vi inden for 24 timer.']] },
    band: { chips: ['Søgeannoncer', 'Import fra Google', 'Shopping på Bing', 'Månedlig rapport'] },
    flow: { h2: ['Først en analyse.', 'Så kører det.'], lead: 'Vi starter med det, der virker på Google, og tilpasser det til Bing.', end: 'Hver måned' }
  },
  {
    slug: 'reddit-ads',
    name: 'Reddit Ads',
    short: 'Annoncer i de fællesskaber, dine kunder følger',
    description: 'Vi opsætter og styrer dine annoncer på Reddit, så du bliver vist i de fællesskaber og emner, dine kunder følger. Fast pris efter en snak, og annoncebudgettet betaler du direkte til Reddit.',
    serviceType: 'Reddit-annoncering',
    words: ['webshops', 'tech-virksomheder', 'spil og hobby', 'nicheprodukter', 'softwarefirmaer'],
    h1: { a: ['Vær', 'med', 'i'], hot: 'samtalen.', dim: 'Der hvor de', mark: 'nørder.' },
    lead: 'På Reddit samles folk om det, de brænder for: fra løbesko og gaming til software og gør det selv. Vi viser dine annoncer i de fællesskaber, hvor dine kunder allerede snakker om det, du sælger.',
    floats: ['Fællesskaber', 'Emner og interesser', 'Fast pris ↗'],
    ring: 'REDDIT • FÆLLESSKABER • NICHER • ANNONCER •',
    price: null,
    priceH2: ['Hele opsætningen.', 'Til en fast pris.'],
    priceLead: 'Annoncebudgettet betaler du direkte til Reddit. Vi står for resten og viser dig hver måned, hvad det giver.',
    items: [
      ['Fællesskaber', 'De subreddits og emner, dine kunder følger.'],
      ['Annoncer', 'Tekst og billeder, der passer til tonen på Reddit.'],
      ['Kommentarer', 'Vi holder øje med kommentarerne på dine annoncer.'],
      ['Retargeting', 'Vis dig igen for dem, der har besøgt din side.'],
      ['Måling', 'Reddit-pixel og konverteringer sat op.'],
      ['Månedlig rapport', 'Kort og klart: hvad har det givet?'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Research', 'Vi finder de fællesskaber, hvor dine kunder er.', 'r/'],
      ['Kampagne', 'Annoncer, målgrupper og måling bliver sat op.', '✓'],
      ['Optimering', 'Vi justerer løbende og viser dig, hvad det giver.', '↗']
    ],
    faqs: [
      ['Passer Reddit til min virksomhed?', 'Bedst, når du sælger noget, folk interesserer sig meget for: hobby, tech, spil, sport eller nicheprodukter. Vi siger det ærligt, hvis vi tror, pengene gør mere gavn et andet sted.'],
      ['Er Reddit stort i Danmark?', 'Reddit er mindre end Facebook og Instagram i Danmark, men stærkt i nicher, og du kan også ramme kunder i andre lande.'],
      ['Er annoncebudgettet med i prisen?', 'Nej. Budgettet betaler du direkte til Reddit.'],
      ['Hvad med kommentarerne?', 'Folk på Reddit siger deres mening. Vi holder øje med kommentarerne på dine annoncer og hjælper dig med at svare.']
    ],
    contact: 'Fortæl os hvad du sælger, og hvem der er vilde med det. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og hvem er vilde med det?',
    layout: ['showcase', 'compare', 'marquee', 'band', 'cards', 'faqSplit', 'grid'],
    marquee: { sec: 'emner', icon: 'spark', tag: {  }, h2: ['Der hvor de snakker om det.', 'Hver dag.'], lead: 'Eksempler på emner, hvor dine annoncer kan vises.', words: ['løbesko', 'gaming-pc', 'gør det selv', 'kaffe', 'mekaniske tastaturer', 'hjemmebryg', 'fotografering', 'cykling', 'brætspil', 'software', 'madlavning', 'camping', 'strik', 'elbiler'] },
    compare: { kicker: 'Forskellen', h2: ['En bred annonce.', 'Og Reddit.'], lead: 'Det er de samme penge. Forskellen er, hvem der ser annoncen.', uden: 'Bred annonce', med: 'Reddit Ads', rows: [['Vises for alle i en aldersgruppe.', 'Vises i fællesskaber om netop dit emne.'], ['Lyder som reklame.', 'Skrevet i Reddits tone, så den bliver læst.'], ['Ingen holder øje med kommentarerne.', 'Vi følger med i kommentarerne og hjælper dig med at svare.'], ['Svært at se, hvad den gav.', 'Pixel og konverteringer sat op fra start.']] },
    band: { chips: ['Fællesskaber', 'Annoncer', 'Kommentarer', 'Måling'] }
  },
  {
    slug: 'markedspladser',
    name: 'Salg på markedspladser',
    short: 'Dine produkter der, hvor kunderne leder',
    description: 'Vi sætter dine produkter op på online markedspladser som Amazon, Zalando, eBay, Etsy, CDON og Miinto, holder lager og priser i sync med din webshop og styrer annoncerne på markedspladserne. Fast pris efter en snak.',
    serviceType: 'Salg på online markedspladser',
    words: ['webshops', 'brands', 'producenter', 'grossister'],
    h1: { a: ['Sælg', 'der,', 'hvor', 'de'], hot: 'leder.', dim: 'Ikke kun i din egen', mark: 'shop.' },
    lead: 'Mange kunder starter deres søgning på en markedsplads, ikke på Google. Vi sætter dine produkter op på de markedspladser, der passer til dig, og holder lager og priser i sync med din webshop.',
    floats: ['Amazon, Zalando, eBay …', 'Lager i sync', 'Fast pris ↗'],
    ring: 'AMAZON • ZALANDO • EBAY • ETSY • CDON • MIINTO •',
    price: null,
    priceH2: ['Hele opsætningen.', 'Til en fast pris.'],
    priceLead: 'Markedspladsernes egne gebyrer betaler du direkte til dem. Vi gennemgår dem med dig, før vi går i gang.',
    items: [
      ['Valg af markedspladser', 'Vi finder dem, der passer til dine produkter og lande.'],
      ['Opsætning', 'Konto, produkter, billeder og tekster.'],
      ['Produktfeed', 'Dine produkter fra webshoppen sendt til markedspladserne.'],
      ['Lager og priser', 'Holdt i sync, så du ikke sælger noget, du ikke har.'],
      ['Ordrer ét sted', 'Ordrer fra markedspladserne samlet sammen med dine andre.'],
      ['Annoncer på markedspladsen', 'Sponsorerede produkter, fx på Amazon.'],
      ['Månedlig rapport', 'Kort og klart: hvad har det givet?'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Valg', 'Vi finder de markedspladser og lande, der passer.', '◎'],
      ['Opsætning', 'Konti, produkter og feed bliver sat op.', '✓'],
      ['Drift', 'Vi holder øje med salg, lager og annoncer.', '↗']
    ],
    faqs: [
      ['Hvilke markedspladser kan I hjælpe med?', 'Fx Amazon (Tyskland, Sverige, Holland, Polen og flere), Zalando (mode, sko og skønhed i store dele af Europa), Miinto (dansk markedsplads for mode), eBay (næsten alt, i hele verden), Etsy (håndlavet og vintage), CDON (Norden), Fruugo (over 40 lande), Bol.com (Holland og Belgien), Allegro (Polen og flere) og Kaufland (Tyskland og flere). Vi finder dem, der passer til dine produkter, og de lande, du vil sælge i.'],
      ['Hvad med lager og priser?', 'Vi kobler markedspladserne til din webshop, så lager og priser følger med, og du ikke sælger noget, du ikke har.'],
      ['Koster markedspladserne noget?', 'Ja. De tager typisk et gebyr pr. salg og nogle gange et fast beløb om måneden. Vi gennemgår det med dig, før vi går i gang.'],
      ['Kan det køre sammen med min Shopify-webshop?', 'Ja. Vi er Shopify Partner og kan koble mange markedspladser direkte til din Shopify.', ['/services/webshop', 'Læs om webshop']]
    ],
    contact: 'Fortæl os hvad du sælger, og hvilke lande du vil sælge i. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og hvor vil du gerne sælge det?',
    layout: ['facts', 'statement', 'showcase', 'band', 'timeline', 'faqSplit', 'grid'],
    facts: { kicker: 'Markedspladser, kort fortalt', items: [['Hvor', 'Fx Amazon', 'Og Zalando, eBay, Etsy, CDON, Miinto og flere, efter hvad der passer.'], ['Lager', 'I sync', 'Med din webshop, så du ikke oversælger.'], ['Annoncer', 'På stedet', 'Sponsorerede produkter, hvor kunderne søger.'], ['Svar', '24 timer', 'Skriv til os, så svarer vi inden for 24 timer.']] },
    statement: { kicker: 'Kort sagt', pill: 'search', text: 'Mange søger på {Amazon} før Google. | _Vær der,_ *når de gør.*', sub: 'Vi sætter dine produkter op der, hvor dine kunder allerede leder.' },
    band: { chips: ['Valg af markedspladser', 'Produktfeed', 'Lager og priser', 'Annoncer på markedspladsen'] },
    flow: { h2: ['Fra opsætning.', 'Til ordrer.'], lead: 'Vi sætter det op, kobler det til din webshop og holder øje med salget.', end: 'Hver måned' }
  },
  {
    slug: 'ugc',
    name: 'UGC-indhold',
    short: 'Video og billeder, der ligner noget fra en kunde',
    description: 'Vi laver UGC-indhold: korte videoer og billeder i stil med det, rigtige kunder lægger op, til dine annoncer, din webshop og dine sociale medier. Alt på siden har vi selv lavet. Fast pris efter en snak.',
    serviceType: 'UGC-indhold',
    words: ['webshops', 'brands', 'apps', 'caféer og restauranter', 'klinikker'],
    h1: { a: ['Indhold,', 'der', 'ligner'], hot: 'kunder.', dim: 'Og virker som', mark: 'anbefalinger.' },
    lead: 'UGC er video og billeder, der ligner noget, en kunde selv har lagt op: en unboxing, en anmeldelse, en hverdag med produktet. Alt, du ser på den her side, har vi selv lavet.',
    floats: ['Lodret video', 'Til annoncer', 'Fast pris ↗'],
    ring: 'UGC • VIDEO • UNBOXING • ANMELDELSER •',
    price: null,
    priceH2: ['Videoer og billeder.', 'Til en fast pris.'],
    priceLead: 'Du får indholdet klar til annoncer, webshop og sociale medier, og du må bruge det, hvor du vil.',
    items: [
      ['Videoer', 'Korte, lodrette videoer til TikTok, Reels og Shorts.'],
      ['Billeder', 'Billeder fra en rigtig hverdag med dit produkt.'],
      ['Hooks i flere versioner', 'Samme video med forskellige første sekunder, så du kan teste.'],
      ['Tekster og undertekster', 'Klar til at blive set uden lyd.'],
      ['Ret til brug', 'Du må bruge indholdet i dine annoncer og på din side.'],
      ['Alle formater', '9:16, 1:1 og 16:9, så det passer overalt.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Brief', 'Vi finder vinklerne: unboxing, anmeldelse, før og efter.', '✎'],
      ['Optagelse', 'Vi optager med dit produkt i en rigtig hverdag.', '▶'],
      ['Levering', 'Du får videoer og billeder klar til annoncer og sociale medier.', '✓']
    ],
    faqs: [
      ['Hvad er UGC?', 'UGC står for user-generated content: indhold, der ligner noget, en kunde selv har lavet. Det føles mere ægte end en klassisk reklame.'],
      ['Er det jeres eget indhold på siden?', 'Ja. Alt, vi viser på denne side, har vi selv lavet.'],
      ['Må jeg bruge videoerne i annoncer?', 'Ja. Retten til at bruge indholdet i dine annoncer og på din side er med.'],
      ['Kan I også køre annoncerne?', 'Ja. Vi kan bruge videoerne på TikTok, Meta og YouTube.', ['/services/tiktok-ads', 'Læs om TikTok Ads']]
    ],
    contact: 'Fortæl os hvad du sælger, og hvor indholdet skal bruges. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og hvor skal videoerne bruges?',
    layout: ['showcase', 'statement', 'receipt', 'cards', 'faqSplit', 'grid'],
    statement: { kicker: 'Kort sagt', pill: 'spark', text: 'Folk scroller forbi {reklamer}. | _De stopper ved_ *mennesker.*', sub: 'Derfor ligner UGC noget, en rigtig kunde har lagt op.' },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'] }
  },
  {
    slug: 'influencer-marketing',
    name: 'Influencer marketing',
    short: 'Skabere, der anbefaler dig til deres følgere',
    description: 'Vi finder de rigtige skabere, laver aftalerne og styrer samarbejdet, så du bliver anbefalt af nogen, dine kunder allerede følger. Alt bliver markeret som reklame efter reglerne. Fast pris efter en snak.',
    serviceType: 'Influencer marketing',
    words: ['webshops', 'brands', 'caféer og restauranter', 'klinikker', 'events'],
    h1: { a: ['Anbefalet', 'af'], hot: 'nogen,', dim: 'de allerede', mark: 'lytter til.' },
    lead: 'Folk køber det, nogen de stoler på, anbefaler. Vi finder skabere, der passer til dig og dine kunder, laver aftalerne og sørger for, at samarbejdet bliver markeret rigtigt som reklame.',
    floats: ['Skabere, der passer', 'Markeret som reklame', 'Fast pris ↗'],
    ring: 'INFLUENCERE • SKABERE • ANBEFALINGER • REKLAME •',
    price: null,
    priceH2: ['Hele samarbejdet.', 'Til en fast pris.'],
    priceLead: 'Honoraret til skaberne aftaler vi med dig først. Vi står for resten og viser dig, hvad hvert samarbejde gav.',
    items: [
      ['Udvælgelse', 'Skabere, hvis følgere ligner dine kunder.'],
      ['Aftaler', 'Pris, indhold, rettigheder og tidsplan på skrift.'],
      ['Brief', 'Så skaberen ved, hvad der skal med, men stadig lyder som sig selv.'],
      ['Godkendelse', 'Du ser indholdet, før det går ud.'],
      ['Markering', 'Alt bliver markeret som reklame efter reglerne.'],
      ['Brug i annoncer', 'Aftaler, så du også må bruge indholdet i dine annoncer.'],
      ['Rapport', 'Rækkevidde, klik og salg fra hvert samarbejde.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Udvælgelse', 'Vi finder skabere, der passer til dig, og viser dig dem.', '◎'],
      ['Aftale', 'Vi forhandler og laver aftalen på skrift.', '✓'],
      ['Samarbejde', 'Indholdet går ud, og vi måler, hvad det giver.', '↗']
    ],
    faqs: [
      ['Hvad koster en influencer?', 'Det afhænger af skaberen og af, hvad der skal laves. Vi aftaler budgettet med dig først og finder skabere inden for det.'],
      ['Skal det markeres som reklame?', 'Ja. Betalte samarbejder skal tydeligt markeres som reklame, og vi sørger for, at det sker rigtigt.'],
      ['Skal det være store influencere?', 'Nej. Mindre skabere med følgere, der ligner dine kunder, giver tit mere for pengene end de største navne.'],
      ['Må jeg bruge indholdet bagefter?', 'Det skriver vi ind i aftalen, så du fx må bruge videoerne i dine annoncer.', ['/services/ugc', 'Se UGC-indhold']]
    ],
    contact: 'Fortæl os hvad du sælger, og hvem dine kunder er. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og hvem følger dine kunder?',
    layout: ['showcase', 'band', 'statement', 'compare', 'timeline', 'faq', 'track'],
    statement: { kicker: 'Kort sagt', pill: 'spark', text: 'En {anbefaling} vejer tungere end en annonce. | _Når den kommer fra_ *den rigtige.*', sub: 'Vi finder skabere, som dine kunder allerede følger og stoler på.' },
    band: { chips: ['Udvælgelse', 'Aftaler', 'Markering', 'Rapport'] },
    compare: { kicker: 'Forskellen', h2: ['Selv.', 'Og med os.'], lead: 'Det er de samme skabere. Forskellen er arbejdet bag.', uden: 'Selv', med: 'Med Webleads', rows: [['Du skriver til skabere én ad gangen.', 'Vi finder og kontakter dem, der passer.'], ['Aftalen står i en besked.', 'Aftalen er på skrift med rettigheder og pris.'], ['Reklamen bliver ikke markeret rigtigt.', 'Alt bliver markeret efter reglerne.'], ['Ingen ved, hvad det gav.', 'Klik og salg bliver målt for hvert samarbejde.']] },
    flow: { h2: ['Fra udvælgelse.', 'Til samarbejde.'], lead: 'Du godkender skaberne og indholdet. Vi klarer resten.', end: 'Hvert samarbejde' }
  },
  {
    slug: 'affiliate-marketing',
    name: 'Affiliate- og partnermarketing',
    short: 'Partnere, der sælger for dig mod provision',
    description: 'Vi sætter dit affiliate- og partnerprogram op, finder partnere og sørger for, at hvert salg bliver målt rigtigt, så du kun betaler provision, når der kommer et salg. Fast pris efter en snak.',
    serviceType: 'Affiliate- og partnermarketing',
    words: ['webshops', 'brands', 'abonnementer', 'apps', 'B2B-virksomheder'],
    h1: { a: ['Betal,', 'når', 'der'], hot: 'sælges.', dim: 'Ikke før', mark: 'det.' },
    lead: 'Med affiliate og partnere får andre sider, skabere og samarbejdspartnere provision, når de sender dig et salg. Vi sætter programmet op, finder partnerne og måler hvert salg, så du ved, hvad du betaler for.',
    floats: ['Provision pr. salg', 'Sporing', 'Fast pris ↗'],
    ring: 'AFFILIATE • PARTNERE • PROVISION • SPORING •',
    price: null,
    priceH2: ['Hele programmet.', 'Til en fast pris.'],
    priceLead: 'Opsætning og styring er til en fast pris. Provisionen til partnerne betaler du kun, når der kommer et salg.',
    items: [
      ['Programmet', 'Provision, regler og vilkår, der er til at forstå.'],
      ['Netværk', 'Opsætning i et affiliate-netværk eller dit eget system.'],
      ['Partnere', 'Vi finder sider, skabere og samarbejdspartnere, der passer.'],
      ['Sporing', 'Hvert salg bliver målt rigtigt, også med rabatkoder.'],
      ['Materiale', 'Billeder, tekster og links, partnerne kan bruge.'],
      ['Opfølgning', 'Vi holder kontakten til partnerne og øje med snyd.'],
      ['Månedlig rapport', 'Kort og klart: hvad har det givet?'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Opsætning', 'Program, provision og sporing bliver sat op.', '%'],
      ['Partnere', 'Vi finder og kontakter de partnere, der passer.', '◎'],
      ['Opfølgning', 'Vi følger salget og hjælper de bedste partnere med at sælge mere.', '↗']
    ],
    faqs: [
      ['Hvad er affiliate marketing?', 'Andre sider og skabere linker til dig og får provision, når der kommer et salg via deres link eller rabatkode.'],
      ['Hvad koster det?', 'Opsætning og styring er til en fast pris efter en snak. Provisionen til partnerne betaler du kun, når der kommer et salg.'],
      ['Hvordan ved I, hvem der solgte?', 'Med links og rabatkoder, der kan spores til hver partner. Vi sørger for, at det bliver målt rigtigt, før programmet går i gang.'],
      ['Hvad er partnermarketing?', 'Samarbejder med andre virksomheder, der har de samme kunder som dig, fx en tømrer og en maler, der anbefaler hinanden mod provision.']
    ],
    contact: 'Fortæl os hvad du sælger, og om du har partnere i dag. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og har du partnere i dag?',
    layout: ['compare', 'statement', 'showcase', 'receipt', 'timeline', 'faqSplit', 'track'],
    compare: { kicker: 'Forskellen', h2: ['Uden partnere.', 'Og med.'], lead: 'Det er dit salg. Forskellen er, hvor mange der hjælper dig med det.', uden: 'Uden partnere', med: 'Med partnere', rows: [['Kun dine egne kanaler.', 'Partnere, der anbefaler dig til deres følgere.'], ['Du betaler, før du ved, om det sælger.', 'Provision kun, når der kommer et salg.'], ['Ingen ved, hvem der sendte kunden.', 'Hvert salg spores til den partner, der sendte det.'], ['Én kanal, du selv skal holde i gang.', 'Mange partnere, der sælger for dig.']] },
    statement: { kicker: 'Kort sagt', pill: 'spark', text: 'Lad andre {anbefale} dig. | _Og betal kun,_ *når det sælger.*', sub: 'Vi sætter programmet op og sørger for, at hvert salg bliver målt.' },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'], notes: ['Provision til partnerne betales kun ved salg'] },
    flow: { h2: ['Fra opsætning.', 'Til salg.'], lead: 'Først måling og regler. Så partnere, der sælger.', end: 'Hver måned' }
  },
  {
    slug: 'organisk-instagram',
    name: 'Organisk Instagram',
    short: 'Instagram, der kører, også når du ikke har tid',
    description: 'Vi styrer din Instagram med en fast plan, automatisk udgivelse og organiske kampagner, der giver følgere, beskeder og kunder uden annoncekroner. Automatiske svar på kommentarer og beskeder er med. Fast pris efter en snak.',
    serviceType: 'Organisk Instagram-styring',
    words: ['servicevirksomheder', 'webshops', 'klinikker', 'frisører', 'caféer'],
    h1: { a: ['Instagram'], hot: 'kører.', dim: 'Også når du', mark: 'arbejder.' },
    lead: 'Vi lægger en plan, laver opslagene og sætter dem til at gå ud af sig selv. Med organiske kampagner og automatiske svar bliver kommentarer og beskeder til kunder, uden at du sidder med telefonen hele dagen.',
    floats: ['Fast opslagsplan', 'Automatiske svar', 'Fast pris ↗'],
    ring: 'INSTAGRAM • REELS • STORIES • AUTOMATION •',
    price: null,
    priceH2: ['Hele profilen.', 'Til en fast pris.'],
    priceLead: 'Du godkender indholdet. Resten kører af sig selv, og hver måned kan du se, hvad det har givet.',
    items: [
      ['Opslagsplan', 'En fast plan med reels, opslag og stories for hver måned.'],
      ['Automatisk udgivelse', 'Opslagene går ud af sig selv på de rigtige tidspunkter.'],
      ['Organiske kampagner', 'Fx “kommentér GUIDE, så får du linket”: kampagner, der giver beskeder og kunder.'],
      ['Automatiske svar', 'Svar på kommentarer og beskeder med nøgleord, døgnet rundt.'],
      ['Indhold', 'Billeder, reels og tekster, der ligner dig.'],
      ['Bio og highlights', 'Så nye følgere forstår, hvad du laver, med det samme.'],
      ['Månedlig rapport', 'Følgere, rækkevidde og beskeder i ét overblik.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Plan', 'Vi lægger en plan for måneden og de kampagner, der skal køre.', '▦'],
      ['Indhold', 'Vi laver opslagene, og du godkender dem.', '✓'],
      ['Automatik', 'Opslag og svar kører af sig selv, og vi følger med.', '⚙']
    ],
    faqs: [
      ['Hvad er en organisk kampagne?', 'En kampagne uden annoncekroner. Fx et opslag, hvor folk kommenterer et ord og automatisk får et link, en rabatkode eller en guide i en besked. Så bliver en kommentar til en kontakt.'],
      ['Hvad betyder automatiske svar?', 'Når nogen skriver et bestemt ord i en kommentar eller besked, får de et svar med det samme. Vi sætter det op, så svarene lyder som dig, og alt andet sendes videre til dig.'],
      ['Skal jeg selv lave indholdet?', 'Nej. Vi laver det eller bruger billeder og videoer, du sender. Du godkender, før noget går ud.'],
      ['Hvad er forskellen på organisk og annoncer?', 'Organisk er det, du lægger ud på din egen profil, uden at betale for at blive vist. Annoncer betaler du for. De to hjælper hinanden.', ['/services/meta-ads', 'Læs om Meta Ads']]
    ],
    contact: 'Fortæl os hvad du laver, og hvordan din Instagram ser ud i dag. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver du, og hvad er din Instagram?',
    layout: ['compare', 'showcase', 'marquee', 'band', 'timeline', 'faqSplit', 'track'],
    compare: { kicker: 'Forskellen', h2: ['Når du selv når det.', 'Og når det kører.'], lead: 'Det er den samme profil. Forskellen er, om den passer sig selv.', uden: 'Når du når det', med: 'Når det kører', rows: [['Et opslag, når der er tid.', 'En fast plan, der går ud af sig selv.'], ['Kommentarer bliver ikke besvaret.', 'Automatiske svar med det samme.'], ['Følgere, men ingen kunder.', 'Kampagner, der giver beskeder og henvendelser.'], ['Ingen ved, hvad der virker.', 'En rapport hver måned.']] },
    marquee: { sec: 'kampagner', icon: 'spark', tag: {  }, h2: ['Kommentér et ord.', 'Få svar med det samme.'], lead: 'Eksempler på organiske kampagner med automatiske svar.', words: ['Kommentér GUIDE', 'Skriv PRIS i en besked', 'Kommentér TID for at booke', 'Gratis tjekliste', 'Konkurrence', 'Ugens tilbud', 'Spørg om alt', 'Kommentér LINK', 'Før og efter', 'Bag kulissen', 'Kundens spørgsmål', 'Nyt i butikken'] },
    band: { chips: ['Opslagsplan', 'Automatisk udgivelse', 'Organiske kampagner', 'Automatiske svar'] },
    flow: { h2: ['Først en plan.', 'Så kører det selv.'], lead: 'Du godkender indholdet. Resten kører af sig selv, og vi holder øje.', end: 'Hver måned' }
  },
  {
    slug: 'organisk-facebook',
    name: 'Organisk Facebook',
    short: 'En Facebook-side, der svarer og poster af sig selv',
    description: 'Vi styrer din Facebook-side med en fast plan, automatisk udgivelse og organiske kampagner i opslag og Messenger. Automatiske svar på kommentarer og beskeder er med. Fast pris efter en snak.',
    serviceType: 'Organisk Facebook-styring',
    words: ['lokale virksomheder', 'håndværkere', 'klinikker', 'foreninger', 'butikker'],
    h1: { a: ['En', 'side,', 'der'], hot: 'svarer.', dim: 'Også klokken', mark: 'elleve.' },
    lead: 'På Facebook spørger kunderne i kommentarer, beskeder og lokale grupper. Vi lægger en plan, sætter opslagene til at gå ud af sig selv og bygger automatiske svar i Messenger, så ingen henvendelse bliver glemt.',
    floats: ['Messenger-svar', 'Lokale grupper', 'Fast pris ↗'],
    ring: 'FACEBOOK • OPSLAG • MESSENGER • AUTOMATION •',
    price: null,
    priceH2: ['Hele siden.', 'Til en fast pris.'],
    priceLead: 'Du godkender indholdet. Resten kører af sig selv, og hver måned kan du se, hvad det har givet.',
    items: [
      ['Opslagsplan', 'En fast plan for måneden, der passer til din sæson.'],
      ['Automatisk udgivelse', 'Opslagene går ud af sig selv på de rigtige tidspunkter.'],
      ['Messenger-automatik', 'Svar på de spørgsmål, der kommer igen og igen, døgnet rundt.'],
      ['Organiske kampagner', 'Fx “kommentér JA, så sender vi tilbuddet” eller en konkurrence.'],
      ['Lokale grupper', 'Vi hjælper dig med at være synlig i grupperne i dit område.'],
      ['Anmeldelser', 'Vi beder glade kunder om en anbefaling på siden.'],
      ['Månedlig rapport', 'Rækkevidde, beskeder og henvendelser i ét overblik.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Plan', 'Vi lægger en plan for måneden og de kampagner, der skal køre.', '▦'],
      ['Automatik', 'Opslag og svar i Messenger bliver sat op.', '⚙'],
      ['Opfølgning', 'Vi holder øje, svarer på det svære og viser dig, hvad det giver.', '↗']
    ],
    faqs: [
      ['Bruger folk stadig Facebook?', 'Ja, især når de leder efter en lokal virksomhed, spørger i en lokal gruppe eller skriver en besked. Derfor skal din side svare hurtigt og være opdateret.'],
      ['Hvad kan Messenger svare på af sig selv?', 'De spørgsmål, der kommer igen og igen: åbningstider, priser, booking og hvor I ligger. Alt andet sendes videre til dig.'],
      ['Hvad er en organisk kampagne?', 'En kampagne uden annoncekroner. Fx et opslag, hvor folk kommenterer et ord og automatisk får et tilbud eller en guide i Messenger.'],
      ['Kan I også lave annoncer?', 'Ja. Organisk og annoncer hjælper hinanden.', ['/services/meta-ads', 'Læs om Meta Ads']]
    ],
    contact: 'Fortæl os hvad du laver, og hvordan din Facebook-side ser ud i dag. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver du, og hvad hedder din Facebook-side?',
    layout: ['showcase', 'facts', 'compare', 'band', 'cards', 'faqSplit', 'grid'],
    facts: { kicker: 'Organisk Facebook, kort fortalt', items: [['Opslag', 'Af sig selv', 'En fast plan, der går ud automatisk.'], ['Beskeder', 'Døgnet rundt', 'Automatiske svar i Messenger på de faste spørgsmål.'], ['Kampagner', 'Uden annoncer', 'Organiske kampagner, der giver beskeder og kunder.'], ['Svar', '24 timer', 'Skriv til os, så svarer vi inden for 24 timer.']] },
    compare: { kicker: 'Forskellen', h2: ['En side, der står stille.', 'Og en, der arbejder.'], lead: 'Kunderne kigger på din Facebook-side, før de skriver. Den skal svare og være levende.', uden: 'Står stille', med: 'Arbejder', rows: [['Sidste opslag er fra sidste år.', 'Nye opslag hver uge, der går ud af sig selv.'], ['Beskeder bliver besvaret næste dag.', 'Svar med det samme på de faste spørgsmål.'], ['Kommentarer forsvinder i mængden.', 'Kampagner, hvor kommentarer bliver til kontakter.'], ['Ingen anmeldelser.', 'Glade kunder bliver bedt om en anbefaling.']] },
    band: { chips: ['Opslagsplan', 'Automatisk udgivelse', 'Messenger-automatik', 'Organiske kampagner'] }
  },
  {
    slug: 'organisk-tiktok',
    name: 'Organisk TikTok',
    short: 'TikTok, der bliver set uden annoncekroner',
    description: 'Vi styrer din TikTok med en fast plan for videoer, serier og organiske kampagner, og vi sætter automatik op til udgivelse og svar. Fast pris efter en snak.',
    serviceType: 'Organisk TikTok-styring',
    words: ['webshops', 'caféer og restauranter', 'håndværkere', 'frisører', 'brands'],
    h1: { a: ['Bliv'], hot: 'set.', dim: 'Uden at betale for', mark: 'det.' },
    lead: 'På TikTok kan en god video nå langt ud over dine egne følgere. Vi lægger en plan med serier og trends, laver videoerne, sætter dem til at gå ud af sig selv og svarer automatisk, når nogen spørger.',
    floats: ['Serier og trends', 'Automatik', 'Fast pris ↗'],
    ring: 'TIKTOK • SERIER • TRENDS • AUTOMATION •',
    price: null,
    priceH2: ['Hele profilen.', 'Til en fast pris.'],
    priceLead: 'Vi laver videoerne og planen, og hver måned kan du se, hvad det har givet.',
    items: [
      ['Videoplan', 'Serier, trends og faste formater for hver måned.'],
      ['Videoer', 'Vi optager, klipper og skriver teksterne.'],
      ['Automatisk udgivelse', 'Videoerne går ud af sig selv på de rigtige tidspunkter.'],
      ['Organiske kampagner', 'Serier og udfordringer, der får folk til at følge med.'],
      ['Automatiske svar', 'Svar på beskeder med det samme, når nogen spørger om det samme.'],
      ['Kommentarer', 'Vi svarer på kommentarer og bruger dem til nye videoer.'],
      ['Månedlig rapport', 'Visninger, følgere og beskeder i ét overblik.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Format', 'Vi finder de serier og formater, der passer til dig.', '#'],
      ['Optagelse', 'Vi optager mange videoer på én gang.', '▶'],
      ['Udgivelse', 'Videoerne går ud efter planen, og vi følger med.', '↗']
    ],
    faqs: [
      ['Skal jeg selv være på video?', 'Det hjælper tit, men det er ikke et krav. Vi kan lave videoer med dine produkter, dine opgaver eller dine kunder.'],
      ['Hvor ofte skal der komme videoer?', 'Det aftaler vi. Det vigtigste er, at de kommer jævnt, og derfor optager vi mange på én gang og lader dem gå ud af sig selv.'],
      ['Hvad er en organisk kampagne på TikTok?', 'Fx en serie, hvor folk følger med fra video til video, eller en udfordring, hvor de selv er med. Ingen annoncekroner.'],
      ['Kan I også lave annoncer på TikTok?', 'Ja. En video, der virker organisk, kan også blive en god annonce.', ['/services/tiktok-ads', 'Læs om TikTok Ads']]
    ],
    contact: 'Fortæl os hvad du laver, og om du er på TikTok i dag. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver du, og er du på TikTok i dag?',
    layout: ['marquee', 'facts', 'showcase', 'receipt', 'cards', 'faq', 'grid'],
    marquee: { sec: 'formater', icon: 'spark', tag: {  }, h2: ['Serier, de følger med i.', 'Video efter video.'], lead: 'Eksempler på formater, vi kan lave.', words: ['Dagens opgave', 'Spørg håndværkeren', 'Før og efter', 'Pak med mig', 'Svar på kommentar', 'En dag i butikken', 'Myte eller fakta', 'Kundens spørgsmål', 'Bag disken', 'Ugens produkt', 'Sådan gør du', 'Den største fejl …'] },
    facts: { kicker: 'Organisk TikTok, kort fortalt', items: [['Plan', 'Hver måned', 'Serier og formater, der passer til dig.'], ['Optagelse', 'Mange på én gang', 'Så der kommer videoer jævnt.'], ['Udgivelse', 'Af sig selv', 'Videoerne går ud efter planen.'], ['Svar', '24 timer', 'Skriv til os, så svarer vi inden for 24 timer.']] },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'] }
  },
  {
    slug: 'branding',
    name: 'Branding og logo',
    short: 'Et logo og et udtryk, folk kan huske',
    description: 'Vi laver dit logo, dine farver, skrifttyper og en kort brandguide, så du ligner dig selv overalt: på bilen, hjemmesiden, sociale medier og visitkortet. Fast pris efter en snak.',
    serviceType: 'Branding og logodesign',
    words: ['nye virksomheder', 'håndværkere', 'webshops', 'klinikker', 'caféer'],
    h1: { a: ['Et', 'logo,', 'de'], hot: 'husker.', dim: 'Og et udtryk, der er', mark: 'dit.' },
    lead: 'Vi giver din virksomhed et logo, farver og skrifttyper, der passer til dig og dine kunder. Du får det hele i en kort brandguide, så alt fra bilen til hjemmesiden ligner dig.',
    floats: ['Logo', 'Brandguide', 'Fast pris ↗'],
    ring: 'BRANDING • LOGO • FARVER • IDENTITET •',
    price: null,
    priceH2: ['Logo og udtryk.', 'Til en fast pris.'],
    priceLead: 'Du får logoet og brandguiden i alle de formater, du skal bruge, og når det er betalt, er det dit.',
    items: [
      ['Logo', 'Forslag, som vi retter til sammen med dig.'],
      ['Farver', 'En palet, der virker på skærm, tryk og bil.'],
      ['Skrifttyper', 'Til overskrifter og brødtekst.'],
      ['Brandguide', 'En kort guide til, hvordan det hele bruges.'],
      ['Filer til alt', 'Logoet i alle formater, også til print og sociale medier.'],
      ['Sociale medier', 'Profilbilleder og covers, klar til brug.'],
      ['Visitkort og bil', 'Forslag til visitkort, arbejdstøj og bil.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Snak', 'Vi taler om dig, dine kunder og hvad du vil udstråle.', '?'],
      ['Forslag', 'Du får forslag til logo og udtryk, og vi retter til sammen.', '✎'],
      ['Levering', 'Logo, farver og brandguide i alle de formater, du skal bruge.', '✓']
    ],
    faqs: [
      ['Hvad får jeg?', 'Logo, farver, skrifttyper og en kort brandguide, plus logoet i de formater, du skal bruge til skærm, print og sociale medier.'],
      ['Kan I også lave hjemmesiden?', 'Ja. Så bliver logo og hjemmeside lavet med det samme udtryk fra start.', ['/services/hjemmesider', 'Se hjemmesider']],
      ['Hvad hvis jeg ikke kan lide forslagene?', 'Så retter vi til sammen med dig. Vi starter med en god snak, så forslagene rammer rigtigt fra start.'],
      ['Ejer jeg logoet?', 'Ja. Når det er færdigt og betalt, er logoet dit.']
    ],
    contact: 'Fortæl os hvad din virksomhed laver, og hvem dine kunder er. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver din virksomhed, og hvad vil du gerne udstråle?',
    layout: ['showcase', 'statement', 'facts', 'receipt', 'cards', 'faq', 'track'],
    statement: { kicker: 'Kort sagt', pill: 'spark', text: 'Du får kun ét {førstehåndsindtryk}. | _Gør det til_ *dit eget.*', sub: 'Et logo, farver og skrifttyper, der hænger sammen overalt.' },
    facts: { kicker: 'Branding, kort fortalt', items: [['Logo', 'Dit eget', 'Når det er færdigt og betalt, er det dit.'], ['Brug', 'Overalt', 'Filer til skærm, print, bil og sociale medier.'], ['Guide', 'Brandguide', 'Så alle bruger det på samme måde.'], ['Svar', '24 timer', 'Skriv til os, så svarer vi inden for 24 timer.']] },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'] }
  },
  {
    slug: 'chatgpt-ads', name: 'ChatGPT Ads', short: 'Annoncer under svaret i ChatGPT',
    description: 'Vi opsætter og styrer dine annoncer i ChatGPT, så du bliver vist under svaret, når nogen spørger om det, du sælger. Annoncerne kom til Danmark i august 2026. Fast pris efter en snak.',
    serviceType: 'Annoncering i ChatGPT',
    words: ['webshops', 'servicevirksomheder', 'brands', 'B2B'],
    h1: { a: ['Annoncer', 'der,', 'hvor', 'de'], hot: 'spørger.', dim: 'Lige under', mark: 'svaret.' },
    lead: 'Flere spørger ChatGPT, før de køber. Med ChatGPT Ads bliver du vist under svaret, når samtalen handler om det, du sælger. Annoncen er tydeligt markeret, og den ændrer ikke svaret.',
    floats: ['Under svaret', 'Sponsoreret', 'Fast pris ↗'], ring: 'CHATGPT ADS • SPONSORERET • UNDER SVARET •',
    price: null,
    priceH2: ['Fast pris.', 'Efter en snak.'],
    priceLead: 'Annoncebudgettet betaler du direkte til OpenAI. Vi giver dig en fast pris for opsætning og styring inden for 24 timer.',
    items: [
      ['Kampagner i ChatGPT', 'Sat op i ChatGPTs annoncesystem, med mål og budget.'],
      ['Målrettet ud fra samtalen', 'Vi beskriver de samtaler, dit produkt passer til.'],
      ['Annoncetekster', 'Korte, klare tekster, der passer til et svar.'],
      ['Landingsside', 'Siden, de lander på, skal svare på det samme spørgsmål.'],
      ['Måling', 'Klik, henvendelser og salg fra ChatGPT, målt på din side.'],
      ['Løbende styring', 'Vi justerer tekster, målretning og bud hver uge.'],
      ['Månedlig rapport', 'Kort og klart: hvad har det givet?'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Plan', 'Vi finder de spørgsmål, dine kunder stiller ChatGPT.', '?'],
      ['Opsætning', 'Kampagner, tekster og måling bliver sat op.', '✓'],
      ['Styring', 'Vi følger med hver uge og sender en rapport hver måned.', '↗']
    ],
    faqs: [
      ['Hvad er ChatGPT Ads?', 'Annoncer i ChatGPT. De bliver vist under svaret, når samtalen passer til det, du sælger, og de er tydeligt markeret som sponsoreret.'],
      ['Kan man annoncere i ChatGPT i Danmark?', 'Ja. OpenAI åbnede for annoncer i Danmark og en række andre europæiske lande i august 2026. Platformen er ny, så vi følger med i, hvad der ændrer sig.'],
      ['Hvordan bliver annoncen målrettet?', 'Ud fra samtalen. I Europa bliver annoncerne først og fremmest vist ud fra det, samtalen handler om. Annoncører ser ikke brugernes samtaler.'],
      ['Ændrer annoncen ChatGPTs svar?', 'Nej. Ifølge OpenAI påvirker annoncer ikke svaret. Annoncen står for sig selv under svaret.'],
      ['Hvad er forskellen på GEO og ChatGPT Ads?', 'GEO handler om at blive nævnt i selve svaret, uden at betale for det. ChatGPT Ads er betalte annoncer under svaret. De virker godt sammen.', ['/services/geo', 'Læs om GEO']],
      ['Hvad koster det?', 'Du får en fast pris for opsætning og styring efter en kort snak. Annoncebudgettet betaler du direkte til OpenAI.']
    ],
    contact: 'Fortæl os, hvad du sælger, og hvem du gerne vil nå. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad sælger du, og hvad spørger dine kunder om?',
    layout: ['statement', 'compare', 'showcase', 'band', 'timeline', 'faqSplit', 'grid'],
    statement: {
      kicker: 'Kort sagt', pill: 'spark',
      text: 'Når de spørger {ChatGPT}, hvad de skal vælge, | _kan du stå_ *lige under svaret.*',
      sub: 'Annoncen er tydeligt markeret som sponsoreret og ændrer ikke svaret.'
    },
    compare: {
      h2: ['Håbe på at blive nævnt.', 'Eller stå der.'],
      lead: 'GEO får dig nævnt i svaret over tid. Annoncer sætter dig under svaret, når samtalen passer.',
      uden: 'Uden annoncer', med: 'Med ChatGPT Ads',
      rows: [
        ['Du håber på at blive nævnt i svaret.', 'Du kan stå under svaret, når samtalen passer til dig.'],
        ['En konkurrent kan stå der i stedet.', 'Du er der, hvor beslutningen bliver taget.'],
        ['Ingen kan styre, hvad AI svarer.', 'Du bestemmer selv teksten i din annonce.'],
        ['Du ved ikke, hvor mange der så dig.', 'Du kan se visninger, klik og salg.']
      ]
    },
    band: { chips: ['Kampagner i ChatGPT', 'Målrettet ud fra samtalen', 'Måling', 'Månedlig rapport'] },
    flow: { h2: ['Fra første snak.', 'Til annoncen kører.'], lead: 'Vi sætter kampagnerne op, følger med hver uge og sender dig en kort rapport hver måned.', end: 'Rapport hver måned' }
  },
  {
    slug: 'tracking', name: 'Tracking', short: 'Se, hvad din markedsføring giver',
    description: 'Vi sætter tracking op, så du kan se, hvad din hjemmeside og dine annoncer giver: Google Analytics 4, Google Tag Manager, Meta Pixel og Conversions API, server-side tracking og cookiesamtykke. Fast pris efter en snak.',
    serviceType: 'Tracking og webanalyse',
    words: ['webshops', 'servicevirksomheder', 'annoncører', 'brands'],
    h1: { a: ['Se,', 'hvad', 'det'], hot: 'giver.', dim: 'Hver eneste', mark: 'krone.' },
    lead: 'Når tracking er sat rigtigt op, kan du se, hvilke annoncer og sider der giver kunder. Og Google og Meta får de signaler, de skal bruge for at finde flere af dem.',
    floats: ['Google Analytics 4', 'Meta Conversions API', 'Fast pris ↗'], ring: 'TRACKING • GA4 • SERVER-SIDE • SAMTYKKE •',
    price: null,
    priceH2: ['Fast pris.', 'Efter en snak.'],
    priceLead: 'Vi ser på, hvad du måler i dag, og giver dig en fast pris inden for 24 timer.',
    items: [
      ['Tjek af din tracking', 'Vi ser, hvad der bliver målt i dag, og hvad der mangler.'],
      ['Google Analytics 4', 'Sat op med de hændelser, der betyder noget for dig.'],
      ['Google Tag Manager', 'Ét sted til alle tags, så det er nemt at holde styr på.'],
      ['Konverteringer i Google Ads', 'Køb og henvendelser sendt tilbage til Google Ads.'],
      ['Meta Pixel og Conversions API', 'Fra browseren og fra serveren, så færre signaler går tabt.'],
      ['Server-side tracking', 'Data sendt fra din egen server og dit eget domæne.'],
      ['Cookiesamtykke', 'Et samtykke, der virker, og Google Consent Mode.'],
      ['Dashboard', 'De tal, du har brug for, samlet ét sted.']
    ],
    steps: [
      ['Tjek', 'Vi gennemgår, hvad der bliver målt i dag.', '?'],
      ['Opsætning', 'Tags, hændelser og samtykke bliver sat op og testet.', '✓'],
      ['Kontrol', 'Vi tjekker, at tallene passer, og følger op.', '↗']
    ],
    faqs: [
      ['Hvad er tracking?', 'At måle, hvad de besøgende gør på din side, og hvor de kommer fra. Så kan du se, hvilke annoncer og sider der giver kunder.'],
      ['Hvad er server-side tracking?', 'Målingerne bliver sendt fra din egen server og ikke kun fra browseren. Så går færre af dem tabt på grund af adblockere og browsere, der blokerer. Det gælder stadig kun for besøgende, der har givet samtykke, hvor det kræves.'],
      ['Hvad med cookies og samtykke?', 'Vi sætter et cookiebanner op, der virker, så der kun bliver målt det, de besøgende har sagt ja til. Google Consent Mode hjælper Google med at udfylde hullerne med beregnede tal.'],
      ['Gør I det også selv?', 'Ja. webleads.dk måler selv med Google Analytics 4 og Meta Conversions API sendt fra vores egen server.'],
      ['Hvad koster det?', 'Du får en fast pris efter en kort snak om, hvad du vil måle.']
    ],
    contact: 'Fortæl os, hvad du gerne vil kunne måle. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvilke annoncer og systemer bruger du, og hvad vil du gerne kunne se?',
    layout: ['compare', 'facts', 'showcase', 'receipt', 'cards', 'faqSplit', 'track'],
    compare: {
      kicker: 'Før og efter',
      h2: ['Gætværk.', 'Eller tal, du kan stole på.'],
      lead: 'Forskellen på at have en pixel liggende og at have tracking, der er sat ordentligt op.',
      uden: 'Uden ordentlig tracking', med: 'Med Webleads',
      rows: [
        ['Du kan ikke se, hvilke annoncer der giver kunder.', 'Du kan se, hvilken annonce og side hver henvendelse kom fra.'],
        ['Adblockere og browsere taber en del af målingerne.', 'Server-side tracking får flere af dem med.'],
        ['Google og Meta optimerer i blinde.', 'De får signalerne om køb og henvendelser.'],
        ['Cookiebanneret står der, men styrer ingenting.', 'Samtykket styrer, hvad der bliver målt.'],
        ['Tallene ligger spredt i fem systemer.', 'Det vigtige er samlet i ét dashboard.']
      ]
    },
    facts: { kicker: 'Tracking, kort fortalt', items: [['Værktøjer', 'GA4 og GTM', 'Plus Meta Pixel og Conversions API.'], ['Data', 'Server-side', 'Fra din egen server og dit eget domæne.'], ['Samtykke', 'Consent Mode', 'Kun det, de besøgende siger ja til.'], ['Svar', '24 timer', 'Skriv til os, så svarer vi inden for 24 timer.']] },
    receipt: { h2: ['Alt det her.', 'Til én fast pris.'] }
  }
];

// The front page
// The services in groups, for the mega menu (lib.MEGA), /services and the order everywhere else.
// Every service in `services` is in exactly one group. `short` is the line under the name in the menu.
export const groups = [
  { id: 'web', name: 'Hjemmeside og webshop', icon: 'web', slugs: ['hjemmesider', 'webshop', 'branding', 'cro', 'app-udvikling'] },
  { id: 'annoncer', name: 'Annoncering', icon: 'ads', slugs: ['google-ads', 'meta-ads', 'google-shopping-ads', 'google-css', 'tiktok-ads', 'linkedin-ads', 'youtube-annoncering', 'snapchat-ads', 'pinterest-ads', 'bing-ads', 'reddit-ads'] },
  { id: 'synlig', name: 'Synlig på Google og AI', icon: 'search', slugs: ['seo', 'lokal-seo', 'linkbuilding', 'geo', 'chatgpt-ads'] },
  { id: 'some', name: 'Sociale medier og indhold', icon: 'some', slugs: ['organisk-instagram', 'organisk-facebook', 'organisk-tiktok', 'video', 'ugc', 'influencer-marketing'] },
  { id: 'salg', name: 'Mere salg', icon: 'sale', slugs: ['markedspladser', 'email-marketing', 'affiliate-marketing'] },
  { id: 'auto', name: 'Data, AI og automation', icon: 'auto', slugs: ['tracking', 'ai', 'automations', 'interne-systemer'] }
];
// The line under each name in the mega menu: a few words, plain and true
export const short = {
  hjemmesider: 'Tre pakker fra 2.995 kr.', webshop: 'Shopify med betaling og fragt', branding: 'Logo, farver og brandguide',
  cro: 'Flere kunder af de besøgende', 'app-udvikling': 'Til iPhone og Android',
  'google-ads': 'Øverst, når de søger', 'meta-ads': 'Facebook og Instagram', 'google-shopping-ads': 'Produkter med billede og pris',
  'google-css': 'Billigere klik på Shopping', 'tiktok-ads': 'Video, der fanger med det samme', 'linkedin-ads': 'Til dem, der beslutter',
  'youtube-annoncering': 'Før videoer og i Shorts', 'snapchat-ads': 'Fuld skærm mellem stories', 'pinterest-ads': 'Mens de planlægger og gemmer',
  'bing-ads': 'Dem, der ikke bruger Google', 'reddit-ads': 'I de rigtige fællesskaber',
  seo: 'Til webshops og brands', 'lokal-seo': 'Google Maps og dit område', linkbuilding: 'Links fra danske sider', geo: 'Nævnt af ChatGPT og AI',
  'organisk-instagram': 'Plan, opslag og svar', 'organisk-facebook': 'Opslag og svar i Messenger', 'organisk-tiktok': 'Set uden annoncekroner',
  video: 'Reklamer og explainers', ugc: 'Ligner noget fra en kunde', 'influencer-marketing': 'Skabere, der anbefaler dig',
  markedspladser: 'Amazon, Zalando, eBay og flere', 'email-marketing': 'Nyhedsbreve og mailflows', 'affiliate-marketing': 'Provision, når der sælges',
  'chatgpt-ads': 'Annoncer under svaret', tracking: 'GA4, Meta og server-side',
  ai: 'Chatbots og assistenter', automations: 'Rutiner, der klarer sig selv', 'interne-systemer': 'CRM, booking og dashboards'
};

export const front = {
  // The services section: the most important first (without a chosen segment; segments.order sorts it otherwise)
  featured: ['hjemmesider', 'google-ads', 'meta-ads', 'webshop', 'lokal-seo', 'seo'],
  // "Til alle …": the band of words under the services. With a chosen segment its own label and words
  trades: {
    label: 'Til servicefag og webshops',
    words: ['Håndværkere', 'Webshops', 'Klinikker', 'Tøj og mode', 'Frisører', 'Restauranter', 'Brands', 'Fysioterapeuter', 'Babyudstyr', 'Revisorer', 'Caféer', 'Kostumer'],
    ydelser: { label: 'Til alle servicefag', words: ['Tømrer', 'Frisør', 'VVS', 'Fysioterapeut', 'Maler', 'Klinik', 'Elektriker', 'Restaurant', 'Revisor', 'Rengøring', 'Advokat', 'Personlig træner'] },
    webshop: { label: 'Til alle slags webshops', words: ['Tøj og mode', 'Babyudstyr', 'Kostumer', 'Skønhed', 'Kaffe og køkken', 'Sport', 'Kæledyr', 'Møbler', 'Smykker', 'Gaver', 'Elektronik', 'Plakater'] }
  },
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
  // The bubble under the tabs until the visitor has chosen
  nudge: 'Vælg her, så viser vi det, der passer til dig.',
  order: {
    ydelser: ['hjemmesider', 'lokal-seo', 'google-ads', 'meta-ads', 'organisk-facebook', 'organisk-instagram', 'branding', 'linkedin-ads', 'seo', 'linkbuilding', 'geo', 'chatgpt-ads', 'tracking', 'ai', 'automations', 'interne-systemer', 'video', 'youtube-annoncering', 'bing-ads', 'organisk-tiktok', 'tiktok-ads', 'snapchat-ads', 'email-marketing', 'cro', 'influencer-marketing', 'ugc', 'affiliate-marketing', 'app-udvikling', 'reddit-ads', 'pinterest-ads', 'webshop', 'google-shopping-ads', 'google-css', 'markedspladser'],
    webshop: ['webshop', 'google-shopping-ads', 'google-css', 'seo', 'meta-ads', 'tracking', 'tiktok-ads', 'markedspladser', 'chatgpt-ads', 'ugc', 'influencer-marketing', 'affiliate-marketing', 'email-marketing', 'cro', 'pinterest-ads', 'organisk-instagram', 'organisk-tiktok', 'snapchat-ads', 'youtube-annoncering', 'google-ads', 'bing-ads', 'reddit-ads', 'linkbuilding', 'branding', 'geo', 'ai', 'video', 'organisk-facebook', 'automations', 'interne-systemer', 'app-udvikling', 'linkedin-ads', 'lokal-seo', 'hjemmesider']
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
