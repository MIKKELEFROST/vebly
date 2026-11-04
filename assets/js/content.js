// All copy for lists and pop-ups. Ported verbatim from Hjemmeside v8.

export const trades = ['Frisør', 'Tømrer', 'Rengøring', 'Fysioterapeut', 'Elektriker', 'Revisor', 'Klinik', 'VVS', 'Personlig træner', 'Maler'];

export const flipWords = ['servicevirksomheder', 'frisører', 'håndværkere', 'klinikker', 'revisorer', 'fysioterapeuter', 'alle servicefag'];

export const included = [
  ['Responsivt design', 'Tilpasser sig automatisk mobil, tablet og computer.', ['Designet til mobilen først', 'Store knapper, der er nemme at trykke på', 'Skarp på alt fra telefon til storskærm']],
  ['Google-optimeret', 'Sat op til SEO, så kunderne kan finde dig.', ['Titler og beskrivelser på hver side', 'Ren og hurtig kode, som Google kan lide', 'Tilmeldt Google Search Console']],
  ['Lynhurtig', 'Optimeret til hurtig indlæsning.', ['Komprimerede billeder', 'Moderne, hurtig hosting', 'Ingen tunge plugins']],
  ['SSL-sikkerhed', 'Sikker forbindelse med hængelås i browseren.', ['Gratis certifikat inkluderet', 'Ingen advarsler i browseren', 'Beskytter dine kunders data']],
  ['Kontaktformular', 'Kunderne kan skrive direkte fra siden.', ['Beskeder direkte i din indbakke', 'Spamfilter inkluderet', 'Tilpasset dine spørgsmål']],
  ['Kort og åbningstider', 'Google Maps, adresse og åbningstider.', ['Kort med din adresse', 'Rutevejledning med ét klik', 'Åbningstider, der er nemme at opdatere']],
  ['Sociale medier', 'Links til Facebook, Instagram og LinkedIn.', ['Links til dine profiler', 'Pæn visning, når siden deles', 'Dit Instagram-feed på siden, hvis du vil']],
  ['GDPR og cookies', 'Cookie-banner og privatlivspolitik.', ['Cookie-banner, der følger reglerne', 'Privatlivspolitik', 'Sikker håndtering af formulardata']],
  ['Google-profil', 'Vi opretter eller opdaterer din virksomhedsprofil.', ['Oprettelse eller opdatering', 'Billeder, åbningstider og ydelser', 'Klar til at få anmeldelser']],
  ['Domæne og opsætning', 'Vi klarer det tekniske for dig.', ['Hjælp til at vælge domæne', 'Mail på dit eget domæne', 'Vi flytter din gamle side, hvis du har en']],
  ['Rettelser inkluderet', 'Vi retter til, indtil du er tilfreds.', ['Du ser siden, før den går live', 'Rettelser, indtil du er glad', 'Små ændringer efter lancering']],
  ['Du ejer siden', 'Ingen binding og intet abonnement på selve siden.', ['Ingen binding', 'Intet abonnement på selve siden', 'Siden og indholdet er dit']]
];

export const addons = [
  { t: 'SEO', id: 'seo', price: '995 kr./time', d: 'Bliv fundet først, når kunderne søger.', ex: ['Lokal SEO og Google-profil', 'Tekster og søgeord', 'Teknisk optimering'], band: ['#e0552b', '#fff'] },
  { t: 'Google Ads', id: 'google-ads', price: '8.000 kr./md.', d: 'Vær øverst på Google, når kunderne søger lige nu.', ex: ['Søgeord og kampagner', 'Lokal målretning', 'Google Shopping med i prisen', 'Ekstra kanal: 5.000 kr./md.'], band: ['#111', '#fff'] },
  { t: 'Meta Ads', id: 'meta-ads', price: '8.000 kr./md.', d: 'Annoncer på Facebook og Instagram, der rammer de rigtige.', ex: ['Tekst og grafik', 'Målretning og retargeting', 'Månedlig rapport', 'Ekstra kanal: 5.000 kr./md.'], band: ['#2f9e5b', '#fff'] },
  { t: 'Interne systemer', id: 'systemer', price: 'fra 14.999 kr.', d: 'Skræddersyede værktøjer til din drift.', ex: ['Kunde- og bookingsystemer', 'Dashboards og overblik', 'Portaler til medarbejdere'], band: ['#f2c14e', '#111'] },
  { t: 'Automations', id: 'automations', price: 'fra 4.999 kr.', d: 'Lad rutinerne klare sig selv.', ex: ['Automatiske mails og sms', 'Fakturaer og opfølgning', 'Kobling mellem dine systemer'], band: ['#f2ede4', '#111'] }
];

// Website packages (/services/hjemmesider). The calculator starts on the first one.
export const pakker = [
  { id: 'simpel', t: 'Simpel one page', price: 2995, d: 'Én side med alt det vigtige. Til dig, der skal findes og kontaktes.', ex: ['Én side: hvem du er, hvad du laver, og hvordan man kontakter dig', 'Kontaktformular, kort og åbningstider', 'Klar på 7 dage'] },
  { id: 'normal', t: 'Normal hjemmeside', price: 9995, d: 'En hjemmeside med undersider, så der er plads til alle dine ydelser.', ex: ['Forside og undersider, fx ydelser, om os, priser og kontakt', 'En side pr. ydelse', 'Galleri, FAQ eller booking, hvis du vil'] },
  { id: 'seo', t: 'SEO hjemmeside', price: 29995, d: 'Bygget til at blive fundet på Google, også uden for din egen by.', ex: ['Søgeordsanalyse, før vi bygger', 'En side pr. ydelse og pr. område', 'Tekster skrevet til Google og dine kunder', 'Teknisk SEO og struktureret data'] }
];

// Advertising: the first channel costs `first` a month, every extra channel `extra`. Channels in the same group
// count as one: Google Ads and Google Shopping Ads together are one Google channel (Mikkel, 4 Nov 2026).
export const KANAL = { first: 8000, extra: 5000 };
// The price of each channel picked, in the order picked, from their groups: ['google', 'google', 'meta'] →
// [8000, 0, 5000]. And what one more channel of group g adds a month (0 when its group is already there).
export const kanalPriser = groups => { const seen = new Set(); return groups.map(g => seen.has(g) ? 0 : (seen.add(g), seen.size > 1 ? KANAL.extra : KANAL.first)); };
export const kanalPlus = (groups, g) => groups.includes(g) ? 0 : groups.length ? KANAL.extra : KANAL.first;

// SEO hours a month in the calculator: where it starts, and the range
export const SEO_TIMER = { start: 4, min: 1, max: 40 };

// What each thing costs, by the name used on the cards and in the form.
// once = one-off, md = a month, kanal = an advertising channel and its group (priced with KANAL), fra = a "from" price
export const priser = {
  'Simpel one page': { once: 2995 },
  'Normal hjemmeside': { once: 9995 },
  'SEO hjemmeside': { once: 29995 },
  'Hjemmeside': { once: 2995, fra: true },
  'Hjemmesider': { once: 2995, fra: true },
  'Google Ads': { kanal: 'google' },
  'Meta Ads': { kanal: 'meta' },
  'Google Shopping Ads': { kanal: 'google' },
  'Google CSS': { md: 49 },
  'Webshop': { once: 12995, fra: true },
  // SEO is sold by the hour; the calculator lets the visitor choose hours a month (SEO_TIMER)
  'SEO': { time: 995 },
  'Automations': { once: 4999, md: 499, fra: true },
  'Interne systemer': { once: 14999, fra: true },
  'Interne systemer og CRM': { once: 14999, fra: true }
};

export const addonPages = {
  seo: { price: '995 kr./time', priceNote: 'Timepris · du bestemmer antal timer · ingen binding · ekskl. moms', label: 'SEO', h1: 'Bliv fundet først, når kunderne søger.', intro: 'Vi sørger for, at din virksomhed dukker op på Google, når nogen søger efter det, du laver, der hvor du holder til.',
    items: [['Lokal SEO', 'Bliv fundet i dit område, fx “frisør Roskilde”.'], ['Google-profil', 'Opsætning og pleje af din virksomhedsprofil med anmeldelser.'], ['Søgeord', 'Vi finder de ord, dine kunder faktisk søger på.'], ['Tekster', 'Indhold, der både Google og dine kunder forstår.'], ['Teknisk SEO', 'Hastighed, struktur og alt det bag kulisserne.'], ['Månedlig rapport', 'Kort og klart overblik over, hvad der virker.']],
    steps: [['Analyse', 'Vi ser på din side, dine konkurrenter og dine søgeord.'], ['Plan', 'Du får en klar plan, og vi aftaler, hvor mange timer der skal bruges.'], ['Løbende arbejde', 'Vi optimerer hver måned og viser dig resultaterne.']] },
  'google-ads': { price: '8.000 kr./md.', priceNote: 'Pr. kanal · Google Shopping med uden ekstra pris · hver ekstra kanal 5.000 kr./md. · opsætning gratis · annoncebudget betales direkte til Google', label: 'Google Ads', h1: 'Øverst på Google, når kunderne søger.', intro: 'Vi bygger og styrer dine annoncer på Google, så du bliver vist, når nogen søger efter det, du laver, der hvor du holder til. Og vi holder øje med hver krone.',
    items: [['Søgeordsanalyse', 'Vi finder de ord, dine kunder faktisk søger på.'], ['Kampagner og annoncer', 'Vi bygger kampagnerne og skriver annoncerne færdige.'], ['Lokal målretning', 'Vis dig for kunder i dit område.'], ['Sporing', 'Opkald og henvendelser bliver målt.'], ['Løbende optimering', 'Vi justerer bud, søgeord og annoncer hver måned.'], ['Månedlig rapport', 'Kort og klart overblik over, hvad du får for pengene.']],
    steps: [['Mål og budget', 'Vi aftaler, hvad du vil opnå, og hvad det må koste.'], ['Opsætning', 'Vi bygger kampagner, annoncer og sporing.'], ['Optimering', 'Vi justerer løbende og sender en månedlig rapport.']] },
  'meta-ads': { price: '8.000 kr./md.', priceNote: 'Pr. kanal · hver ekstra kanal 5.000 kr./md. · opsætning gratis · annoncebudget betales direkte til Meta', label: 'Meta Ads', h1: 'Kunder fra Facebook og Instagram.', intro: 'Vi laver annoncer, der fanger opmærksomheden i feedet og rammer de rigtige mennesker, og holder øje med hver krone.',
    items: [['Tekst og grafik', 'Vi laver annoncerne færdige, klar til at køre.'], ['Målretning', 'Vis dine annoncer for de rigtige i dit område.'], ['Retargeting', 'Mind dem, der har besøgt din side, om at vende tilbage.'], ['AI-annoncering', 'AI tester mange annoncevarianter og flytter budgettet derhen, hvor det virker.'], ['Meta Pixel og sporing', 'Vi sætter målingen op, så du kan se, hvad annoncerne giver.'], ['Månedlig rapport', 'Kort og klart overblik over, hvad du får for pengene.']],
    steps: [['Mål og budget', 'Vi aftaler, hvad du vil opnå, og hvad det må koste.'], ['Annoncer og målretning', 'Vi laver annoncerne og sætter målretning og sporing op.'], ['Test og optimering', 'Vi tester, justerer og sender en månedlig rapport.']] },
  systemer: { price: 'Fra 14.999 kr.', priceNote: 'Engangsbeløb · større systemer får fast pris efter en snak', label: 'Interne systemer', h1: 'Værktøjer, der passer til din måde at arbejde på.', intro: 'Vi bygger systemer skræddersyet til din virksomhed, så du slipper for regneark, post-its og programmer, der næsten passer.',
    items: [['Kundesystem (CRM)', 'Samlet overblik over kunder, aftaler og historik.'], ['Booking og kalender', 'Styr tider, medarbejdere og lokaler ét sted.'], ['Dashboards', 'Se de vigtigste tal på én skærm.'], ['Medarbejderportal', 'Vagtplaner, dokumenter og beskeder samlet.'], ['Tilbud og ordrer', 'Fra tilbud til faktura uden dobbeltarbejde.'], ['Integrationer', 'Kobles til de systemer, du allerede bruger.']],
    steps: [['Vi lytter', 'Vi ser på, hvordan I arbejder i dag, og hvor det driller.'], ['Vi bygger', 'Du ser systemet undervejs og kan ønske ændringer.'], ['Vi følger op', 'Oplæring, support og videreudvikling, når I vokser.']] },
  automations: { price: 'Fra 4.999 kr.', priceNote: 'Pr. automatisering · drift 499 kr./md.', label: 'Automations', h1: 'Lad rutinerne klare sig selv.', intro: 'Vi automatiserer de opgaver, du gør igen og igen, så du får timer tilbage hver uge og færre fejl.',
    items: [['Mails og sms', 'Automatiske bekræftelser, påmindelser og opfølgning.'], ['Fakturaer og rykkere', 'Sendes af sig selv, når opgaven er færdig.'], ['Leads', 'Nye henvendelser lander direkte i dit system.'], ['Booking', 'Tider, bekræftelser og aflysninger uden manuelt arbejde.'], ['Rapporter', 'Ugens tal i din indbakke hver mandag.'], ['Kobling mellem apps', 'Få dine programmer til at tale sammen.']],
    steps: [['Kortlægning', 'Vi finder de opgaver, der stjæler mest tid.'], ['Opsætning', 'Vi bygger og tester automatiseringerne.'], ['Drift', 'Vi overvåger dem, så de altid kører.']] }
};

export const comparisons = [
  { t: 'Virker på mobil', b: 'Nej', a: 'Ja', lead: 'De fleste kunder finder dig på telefonen. Er siden svær at bruge der, går de videre til den næste.', l: [['Mobile-first', 'Designet til telefonen først.'], ['Ring med ét tryk', 'Nummeret er altid lige ved hånden.'], ['Let at læse', 'Ingen grund til at zoome.']] },
  { t: 'Indlæsning', b: '6,8 sek.', a: '0,9 sek.', lead: 'Hvert sekund tæller. En langsom side får folk til at klikke væk, før de har set, hvad du tilbyder.', l: [['Optimerede billeder', 'Skarpe, men lette.'], ['Hurtig hosting', 'Moderne servere tæt på dine kunder.'], ['Let kode', 'Ingen tunge plugins.']] },
  { t: 'Vej til kontakt', b: '4 klik', a: '1 klik', lead: 'Kunderne skal kunne kontakte dig med det samme, ikke lede efter dit nummer.', l: [['Altid synlig knap', 'Ring eller skriv fra alle sider.'], ['Kort formular', 'Kun de spørgsmål, du har brug for.'], ['Booking', 'Kan tilføjes som tilvalg.']] },
  { t: 'Sikker forbindelse', b: 'Nej', a: 'Ja', lead: 'Browsere advarer mod sider uden sikker forbindelse. Det skræmmer kunderne væk og koster placeringer på Google.', l: [['SSL inkluderet', 'Gratis certifikat på din side.'], ['Hængelås i browseren', 'Kunderne kan se, at siden er sikker.'], ['Beskyttede data', 'Formularer sendes krypteret.']] }
];

export const team = [
  { n: 'Alexander', a: 'Hjemmesider', g: 'A', lead: 'Alexander designer og bygger hjemmesiderne. Han sørger for, at din side ser skarp ud og får kunderne til at tage kontakt.', l: [['Design', 'Et udtryk, der passer til din virksomhed.'], ['Opbygning', 'Struktur, tekster og billeder.'], ['Lancering', 'Rettelser, indtil du er tilfreds.']] },
  { n: 'Malthe', a: 'Google Ads', g: 'M', lead: 'Malthe står for Google Ads og SEO. Han sørger for, at du ligger øverst, når kunderne søger, og at hver krone bliver brugt fornuftigt.', l: [['Google Ads', 'Vær øverst, når kunderne søger lige nu.'], ['SEO', 'Bliv fundet i dit område.'], ['Rapporter', 'Klart overblik hver måned.']] },
  { n: 'Anna', a: 'Meta Ads', g: 'A', lead: 'Anna står for annoncer på Facebook og Instagram. Hun laver annoncer, der fanger opmærksomheden i feedet og rammer de rigtige mennesker.', l: [['Facebook og Instagram', 'Annoncer, der fanger opmærksomheden.'], ['Målretning', 'Vis dig for de rigtige, og mind dem om dig.'], ['Rapporter', 'Klart overblik hver måned.']] },
  { n: 'Mikkel', a: 'IT-udvikling', g: 'M', lead: 'Mikkel bygger interne systemer og automations. Han gør de tunge, gentagne opgaver lette, så du får tid til det vigtige.', l: [['Interne systemer', 'Booking, CRM og dashboards.'], ['Automations', 'Mails, fakturaer og opfølgning.'], ['Integrationer', 'Får dine programmer til at tale sammen.']] }
];

// The first 12 are the ones shown on narrow phones
export const balls = ['Hjemmeside', 'SEO', 'Google Ads', 'Meta Ads', 'Automations', 'AI-annoncer', 'GEO', 'Google Shopping', 'CRO', 'Nyhedsbrev', 'Booking', 'CRM', 'Dashboards', 'Google CSS', 'Video', 'App', 'Google-profil', 'Webshop', 'Chatbot', 'Tekster', 'Logo', 'Hosting', 'SSL', 'Mobile-first'];

// [explanation, related: a pop-up key, 'pris', 'link:/a/page' or null]
export const ballInfo = {
  'Hjemmeside': ['Vores hovedprodukt. Tre pakker fra 2.995 kr., hvor alt det vigtige er med.', 'pris'],
  'SEO': ['Bliv fundet først, når kunderne søger efter det, du laver.', 'link:/services/seo'],
  'Google Ads': ['Vær øverst på Google, når kunderne søger lige nu.', 'link:/services/google-ads'],
  'Meta Ads': ['Annoncer på Facebook og Instagram, der rammer de rigtige.', 'link:/services/meta-ads'],
  'Automations': ['Lad mails, fakturaer og opfølgning klare sig selv.', 'link:/services/automations'],
  'AI-annoncer': ['AI laver og tester mange annoncer og flytter budgettet derhen, hvor det virker.', 'link:/services/ai'],
  'GEO': ['Bliv nævnt, når kunderne spørger ChatGPT, Gemini og Googles AI-svar om råd.', 'link:/services/geo'],
  'Google Shopping': ['Vis dine produkter med billede og pris øverst på Google.', 'link:/services/google-shopping-ads'],
  'CRO': ['Få flere af dem, der besøger din side, til at ringe, skrive eller købe.', 'link:/services/cro'],
  'Nyhedsbrev': ['Hold kontakten med dine kunder med nyhedsbreve og mails, der sendes automatisk.', 'link:/services/email-marketing'],
  'Booking': ['Lad kunderne booke tid direkte på siden, døgnet rundt.', 'addon-systemer'],
  'CRM': ['Samlet overblik over dine kunder, aftaler og historik.', 'link:/services/interne-systemer'],
  'Dashboards': ['Se de vigtigste tal for din virksomhed på én skærm.', 'link:/services/interne-systemer'],
  'Google CSS': ['Lad dine Shopping-annoncer gå gennem Webleads som CSS, så hele dit bud tæller. 49 kr. om måneden.', 'link:/services/google-css'],
  'Google-profil': ['Vi opretter eller opdaterer din profil, så du ses på Google Maps.', 'inc-Google-profil'],
  'Webshop': ['Webshop på Shopify fra 12.995 kr. Beregn selv prisen på din shop.', 'link:/services/webshop'],
  'Video': ['Reklamevideoer, explainer-videoer og motion graphics, der fanger på sekunder.', 'link:/services/video'],
  'App': ['Din egen app til iPhone og Android, så kunderne kan booke og bestille fra telefonen.', 'link:/services/app-udvikling'],
  'Chatbot': ['En AI-chatbot, der svarer dine kunder døgnet rundt.', 'link:/services/ai'],
  'Tekster': ['Tekster, der sælger og kan findes på Google.', 'link:/services/seo'],
  'Logo': ['Et enkelt, genkendeligt logo og farver, der passer til dig.', null],
  'Hosting': ['Hurtig og sikker hosting. Typisk 50–100 kr. om måneden.', 'inc-Domæne og opsætning'],
  'SSL': ['Sikker forbindelse med hængelås i browseren. Altid inkluderet.', 'inc-SSL-sikkerhed'],
  'Mobile-first': ['Designet til telefonen først og skarp på alle skærme.', 'inc-Responsivt design']
};

// The questions on /services/hjemmesider. Keep in sync with the FAQPage structured data there.
// The front page and the other service pages have their own (scripts/services/data.mjs).
export const faqs = [
  ['Hvilken pakke skal jeg vælge?', 'Simpel one page er nok, hvis kunderne bare skal kunne finde og kontakte dig. Har du flere ydelser, er Normal hjemmeside det rigtige. Vil du findes på Google på mange ydelser eller i flere byer, så vælg SEO hjemmeside. Er du i tvivl, så skriv til os.'],
  ['Er der en månedlig betaling?', 'Nej, du betaler én gang for hjemmesiden. Hosting og domæne koster typisk 50–100 kr. om måneden, og det sætter vi op for dig.'],
  ['Hvor hurtigt er siden klar?', 'En Simpel one page er klar på 7 dage. En Normal hjemmeside og en SEO hjemmeside tager længere tid, og du får en fast tidsplan, før vi går i gang.'],
  ['Jeg har ikke tid til det. Hvad skal jeg lave?', 'Et opkald på 15 minutter og nogle billeder. Resten klarer vi, også teksterne.'],
  ['Kan kunderne finde mig på Google?', 'Ja. Vi sætter siden op, så du kan findes på dit fag og dit område, fx “frisør Roskilde” eller “tømrer Vejle”, og opretter din Google-profil.'],
  ['Kan jeg selv rette i siden?', 'Ja. Du kan skifte billeder, tekster og priser, også direkte fra mobilen. Vi viser dig hvordan.']
];

// Ball / trail palette [background, text]
export const palette = [['#e0552b', '#fff'], ['#111', '#fff'], ['#fff', '#111'], ['#f2c14e', '#111'], ['#f2ede4', '#111']];
// The pop-up band palette for balls (prototype used cream instead of white for index 2)
export const bandPalette = [['#e0552b', '#fff'], ['#111', '#fff'], ['#f2ede4', '#111'], ['#f2c14e', '#111'], ['#f2ede4', '#111']];
