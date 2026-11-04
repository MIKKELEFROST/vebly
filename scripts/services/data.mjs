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
  { slug: 'google-ads', t: 'Google Ads', price: '8.000 kr./md.', value: 8000, d: 'Vær øverst på Google, når kunderne søger lige nu.', ex: ['Søgeord og kampagner', 'Lokal målretning', 'Månedlig rapport', 'Ekstra kanal: 5.000 kr./md.'] },
  { slug: 'meta-ads', t: 'Meta Ads', price: '8.000 kr./md.', value: 8000, d: 'Annoncer på Facebook og Instagram, der rammer de rigtige.', ex: ['Tekst og grafik', 'Målretning og retargeting', 'Månedlig rapport', 'Ekstra kanal: 5.000 kr./md.'] },
  { slug: 'google-shopping-ads', t: 'Google Shopping Ads', price: '8.000 kr./md.', value: 8000, d: 'Dine produkter med billede og pris øverst på Google.', ex: ['Produktfeed og Merchant Center', 'Shopping og Performance Max', 'Sporing af salg', 'Ekstra kanal: 5.000 kr./md.'] },
  { slug: 'google-css', t: 'Google CSS', price: 'Fast pris efter en snak', value: 0, d: 'Op til 20% billigere klik på dine Google Shopping-annoncer.', ex: ['Skift til en CSS-partner', 'Samme annoncer som i dag', 'Shopping og Performance Max'] },
  { slug: 'seo', t: 'SEO', price: '995 kr./time', value: 995, d: 'Bliv fundet først, når kunderne søger.', ex: ['Lokal SEO og Google-profil', 'Tekster og søgeord', 'Teknisk optimering'] },
  { slug: 'geo', t: 'GEO', price: 'Fast pris efter en snak', value: 0, d: 'Bliv nævnt, når kunderne spørger ChatGPT og Googles AI om råd.', ex: ['Tjek af din synlighed i AI', 'Indhold, AI kan citere', 'Struktureret data'] },
  { slug: 'ai', t: 'AI', price: 'Fast pris efter en snak', value: 0, d: 'Chatbots, AI-annoncer og assistenter, der sparer dig tid.', ex: ['AI-chatbot døgnet rundt', 'AI-annoncering', 'AI-assistenter til rutinerne'] },
  { slug: 'automations', t: 'Automations', price: 'fra 4.999 kr.', value: 4999, d: 'Lad rutinerne klare sig selv.', ex: ['Automatiske mails og sms', 'Fakturaer og opfølgning', 'Kobling mellem dine systemer'] },
  { slug: 'email-marketing', t: 'E-mail marketing', price: 'Fast pris efter en snak', value: 0, d: 'Nyhedsbreve og mailflows, der får kunderne til at komme igen.', ex: ['Nyhedsbreve', 'Automatiske mailflows', 'Tilmelding efter reglerne'] },
  { slug: 'cro', t: 'CRO', price: 'Fast pris efter en snak', value: 0, d: 'Flere kunder fra de besøgende, du allerede har.', ex: ['Analyse og heatmaps', 'A/B-test', 'Kortere vej til kontakt'] }
];

// Default words in the hero badge: "Til <word>"
const SERVICEFAG = ['servicevirksomheder', 'håndværkere', 'klinikker', 'frisører', 'lokale virksomheder'];

// h1: line one is `a` + the scrambled orange word `hot`; line two is the grey `dim` + the underlined `mark`.
// price: { amount, pre, post, note } shows the rolling number; null shows "Fast pris efter en snak".
// steps become the stacked cards (glyph: one or two characters the display font has).
export const pages = [
  {
    slug: 'google-ads', name: 'Google Ads', short: 'Øverst på Google, når kunderne søger',
    description: 'Vi opsætter og styrer dine Google Ads, så du bliver vist øverst, når kunderne søger efter det, du laver. 8.000 kr./md., hver ekstra kanal 5.000 kr./md., opsætning gratis, og annoncebudgettet betaler du direkte til Google.',
    serviceType: 'Google Ads-annoncering',
    words: SERVICEFAG,
    h1: { a: ['Øverst', 'på'], hot: 'Google.', dim: 'Når de', mark: 'søger.' },
    lead: 'Vi bygger og styrer dine annoncer på Google, så du bliver vist, når nogen søger efter det, du laver, der hvor du holder til. Og vi holder øje med hver krone.',
    floats: ['Opsætning gratis', 'Månedlig rapport', 'Søgeord ↗'], ring: 'GOOGLE ADS • SØGNING • LOKAL • RAPPORT •',
    price: { amount: '8.000', pre: '', post: 'kr./md.', note: 'Pr. kanal · hver ekstra kanal 5.000 kr./md. · opsætning gratis · ekskl. moms' },
    priceH2: ['Fast pris.', 'Ingen gætteri.'],
    priceLead: 'Tager du flere kanaler, fx også Meta Ads, koster hver ekstra kun 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Google, så du altid kan se, hvad der bliver brugt.',
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
      ['Hvad koster Google Ads?', 'Vores arbejde koster 8.000 kr. om måneden, og opsætningen er gratis. Tager du flere kanaler, koster hver ekstra kanal 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Google, og det aftaler vi sammen.'],
      ['Hvor hurtigt kan annoncerne køre?', 'Så snart kampagnerne er sat op og godkendt af Google. Derefter justerer vi løbende, så du får mest muligt ud af budgettet.'],
      ['Skal jeg have en ny hjemmeside?', 'Ikke nødvendigvis. Annoncerne kan sende kunderne til den side, du har i dag. Spænder siden ben for resultaterne, siger vi det ærligt.'],
      ['Hvad er forskellen på Google Ads og SEO?', 'Med Google Ads betaler du for at blive vist øverst med det samme. SEO er arbejdet med at blive fundet uden at betale for hvert klik. De to kan sagtens kombineres.']
    ],
    contact: 'Fortæl os, hvad du laver, og hvor dine kunder er. Vi svarer inden for 24 timer med en fast pris.',
    placeholder: 'Hvad laver din virksomhed, og hvor vil du gerne have flere kunder fra?'
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
    priceLead: 'Tager du flere kanaler, fx også Google Ads, koster hver ekstra kun 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Meta, så du altid kan se, hvad der bliver brugt.',
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
    placeholder: 'Hvad laver din virksomhed, og hvem vil du gerne nå?'
  },
  {
    slug: 'google-shopping-ads', name: 'Google Shopping Ads', short: 'Dine produkter med billede og pris på Google',
    description: 'Vi sætter Google Shopping op for din webshop: Merchant Center, produktfeed, kampagner og sporing af salg, så dine produkter bliver vist med billede og pris, når kunderne søger. 8.000 kr./md., hver ekstra kanal 5.000 kr./md.',
    serviceType: 'Google Shopping-annoncering',
    words: ['webshops', 'netbutikker', 'Shopify-butikker', 'butikker med varer'],
    h1: { a: ['Dine', 'varer'], hot: 'øverst.', dim: 'Med billede og', mark: 'pris.' },
    lead: 'Vi sætter Google Shopping op, så dine produkter bliver vist med billede og pris, når kunderne søger efter dem. Vi klarer produktfeed, Merchant Center og kampagner.',
    floats: ['Produktfeed', 'Merchant Center', 'Billede og pris ↗'], ring: 'GOOGLE SHOPPING • PRODUKTER • FEED • SALG •',
    price: { amount: '8.000', pre: '', post: 'kr./md.', note: 'Pr. kanal · hver ekstra kanal 5.000 kr./md. · ekskl. moms' },
    priceH2: ['Fast pris.', 'Ingen gætteri.'],
    priceLead: 'Tager du flere kanaler, fx også Google Ads eller Meta Ads, koster hver ekstra kun 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Google.',
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
      ['Hvad koster Google Shopping Ads?', 'Vores arbejde koster 8.000 kr. om måneden. Tager du flere kanaler, fx også Meta Ads, koster hver ekstra kanal 5.000 kr. om måneden. Annoncebudgettet betaler du direkte til Google.'],
      ['Hvad er et produktfeed?', 'En liste over dine produkter med titel, billede, pris og lagerstatus, som Google bruger til at vise dine annoncer. Vi sætter den op, så den holder sig opdateret af sig selv.'],
      ['Virker det med min webshop?', 'De fleste webshopsystemer kan sende produkter til Google. Bruger du Shopify, er vi Shopify Partner.'],
      ['Hvad er forskellen på Shopping og almindelige Google Ads?', 'Almindelige annoncer er tekst. Shopping-annoncer viser produktet med billede og pris direkte i søgningen, så kunden ved, hvad de klikker på.']
    ],
    contact: 'Fortæl os om din webshop, så svarer vi inden for 24 timer med en fast pris.',
    placeholder: 'Hvilken webshop har du, og hvad sælger du?'
  },
  {
    // Preliminary copy: the facts are being checked (see the research notes); price: null until Mikkel sets one
    slug: 'google-css', name: 'Google CSS', short: 'Op til 20% billigere klik på Google Shopping',
    description: 'Vi kobler dine Google Shopping-annoncer på en CSS-partner, så de samme annoncer kan få op til 20% lavere klikpris. Dine kampagner kører videre. Fast pris efter en kort snak.',
    serviceType: 'CSS (Comparison Shopping Service) til Google Shopping',
    words: ['webshops', 'netbutikker', 'Shopify-butikker', 'butikker med varer'],
    h1: { a: ['Op', 'til'], hot: '20%', dim: 'billigere', mark: 'klik.' },
    lead: 'Med en CSS-partner kører dine Shopping-annoncer videre som i dag, men klikket kan blive op til 20% billigere. Vi klarer skiftet for dig.',
    floats: ['CSS-partner', 'Samme annoncer', 'Op til 20% ↓'], ring: 'GOOGLE CSS • SHOPPING • BILLIGERE KLIK •',
    price: null,
    priceH2: ['Fast pris.', 'Efter en snak.'],
    priceLead: 'Vi ser på din Merchant Center og dine kampagner og giver dig en fast pris inden for 24 timer.',
    items: [
      ['Tjek af din konto', 'Vi ser på din Merchant Center og dine Shopping-kampagner.'],
      ['Skift til en CSS-partner', 'Vi kobler din Merchant Center på en CSS, så dine annoncer bliver vist gennem den.'],
      ['Samme annoncer', 'Dine produkter, kampagner og budget kører videre.'],
      ['Shopping og Performance Max', 'Det gælder dine Shopping-annoncer, også dem i Performance Max.'],
      ['Lavere klikpris', 'Op til 20% billigere klik på de samme placeringer.'],
      ['Måling før og efter', 'Vi følger klikpriserne, så du kan se forskellen.'],
      ['Ingen binding', 'Du kan altid skifte tilbage.'],
      ['Direkte kontakt', 'Du taler med den, der laver arbejdet.']
    ],
    steps: [
      ['Tjek', 'Vi ser, om din webshop kan bruge en CSS, og hvad du kan spare.', '?'],
      ['Skift', 'Vi kobler din Merchant Center på en CSS-partner. Dine kampagner kører videre.', '%'],
      ['Opfølgning', 'Vi måler klikpriserne og sender dig tallene.', '↓']
    ],
    faqs: [
      ['Hvad er en CSS?', 'CSS står for Comparison Shopping Service, på dansk en prissammenligningstjeneste. I EU kan Shopping-annoncer på Google vises gennem forskellige CSS’er. Googles egen hedder Google Shopping.'],
      ['Hvorfor bliver klikket billigere?', 'Google Shopping lægger en margin oven i klikprisen. Viser du dine annoncer gennem en anden CSS, slipper du for den, så det samme klik kan koste op til 20% mindre.'],
      ['Skal jeg lave mine kampagner om?', 'Nej. Dine kampagner, dit budget og dine produkter kører videre. Det er kun den CSS, annoncerne bliver vist gennem, der skifter.'],
      ['Hvad koster det?', 'Du får en fast pris efter en kort snak om din webshop.']
    ],
    contact: 'Fortæl os om din webshop, så svarer vi inden for 24 timer med en fast pris.',
    placeholder: 'Hvilken webshop har du, og hvad bruger du på Google Shopping om måneden?'
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
    placeholder: 'Hvad laver din virksomhed, og hvad vil du gerne findes på?'
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
    placeholder: 'Hvad laver din virksomhed, og hvad vil du gerne anbefales til?'
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
    placeholder: 'Hvilke opgaver vil du gerne have AI til at klare?'
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
    placeholder: 'Hvilke opgaver gør du igen og igen?'
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
    placeholder: 'Hvem er dine kunder, og sender du mails i dag?'
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
    placeholder: 'Hvad er adressen på din side, og hvad skal den gerne give?'
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
    ['Hvad koster det?', 'Det afhænger af, hvad du har brug for. En hjemmeside starter ved 2.995 kr., og SEO koster 995 kr. i timen. Annoncering koster 8.000 kr. om måneden for den første kanal og 5.000 kr. for hver ekstra. Skriv til os, så får du en fast pris inden for 24 timer.'],
    ['Skal jeg købe det hele?', 'Nej. Du vælger kun det, du har brug for. Du kan starte med én ting, fx en hjemmeside eller Google Ads, og bygge på senere.'],
    ['Hvem taler jeg med?', 'Den, der laver arbejdet. Der er ingen mellemled, så du har direkte kontakt til den, der bygger din side eller kører dine annoncer.'],
    ['Er annoncebudgettet med i prisen?', 'Nej. Annoncebudgettet betaler du direkte til Google eller Meta, så du altid kan se, hvad der bliver brugt. Opsætningen af annoncerne er gratis.'],
    ['Kan I hjælpe, selvom jeg allerede har en hjemmeside?', 'Ja. Annoncer, SEO, e-mail og automations kan sagtens køre på den side, du har i dag. Vil du have en ny, flytter vi den gamle over for dig.']
  ]
};
