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
  { t: 'SEO', id: 'seo', price: 'fra 999 kr./md.', d: 'Bliv fundet først, når kunderne søger.', ex: ['Lokal SEO og Google-profil', 'Tekster og søgeord', 'Teknisk optimering'], band: ['#e0552b', '#fff'] },
  { t: 'Annoncering', id: 'annoncering', price: 'fra 999 kr./md.', d: 'Flere kunder fra Google og sociale medier.', ex: ['Google Ads', 'Facebook og Instagram', 'AI-annoncering', 'Månedlig rapport'], band: ['#111', '#fff'] },
  { t: 'Interne systemer', id: 'systemer', price: 'fra 14.999 kr.', d: 'Skræddersyede værktøjer til din drift.', ex: ['Kunde- og bookingsystemer', 'Dashboards og overblik', 'Portaler til medarbejdere'], band: ['#f2c14e', '#111'] },
  { t: 'Automations', id: 'automations', price: 'fra 4.999 kr.', d: 'Lad rutinerne klare sig selv.', ex: ['Automatiske mails og sms', 'Fakturaer og opfølgning', 'Kobling mellem dine systemer'], band: ['#f2ede4', '#111'] }
];

export const addonPages = {
  seo: { price: 'Fra 999 kr./md.', priceNote: 'Ingen binding · ekskl. moms', label: 'SEO', h1: 'Bliv fundet først, når kunderne søger.', intro: 'Vi sørger for, at din virksomhed dukker op på Google, når nogen søger efter det, du laver, der hvor du holder til.',
    items: [['Lokal SEO', 'Bliv fundet i dit område, fx “frisør Roskilde”.'], ['Google-profil', 'Opsætning og pleje af din virksomhedsprofil med anmeldelser.'], ['Søgeord', 'Vi finder de ord, dine kunder faktisk søger på.'], ['Tekster', 'Indhold, der både Google og dine kunder forstår.'], ['Teknisk SEO', 'Hastighed, struktur og alt det bag kulisserne.'], ['Månedlig rapport', 'Kort og klart overblik over, hvad der virker.']],
    steps: [['Analyse', 'Vi ser på din side, dine konkurrenter og dine søgeord.'], ['Plan', 'Du får en klar plan og en fast månedspris.'], ['Løbende arbejde', 'Vi optimerer hver måned og viser dig resultaterne.']] },
  annoncering: { price: 'Fra 999 kr./md.', priceNote: 'Pr. kanal · opsætning gratis · annoncebudget betales direkte til Google/Meta', label: 'Annoncering', h1: 'Flere kunder fra Google og sociale medier.', intro: 'Vi laver annoncer, der rammer de rigtige mennesker, og holder øje med hver krone, så du får mest muligt ud af budgettet.',
    items: [['Google Ads', 'Vær øverst, når kunderne søger lige nu.'], ['Facebook og Instagram', 'Annoncer, der fanger opmærksomheden i feedet.'], ['AI-annoncering', 'AI laver og tester mange annoncevarianter og flytter budgettet derhen, hvor det virker.'], ['LinkedIn', 'Når dine kunder er andre virksomheder.'], ['Tekst og grafik', 'Vi laver annoncerne færdige, klar til at køre.'], ['Målretning', 'Vis dine annoncer for de rigtige, og mind dem om dig.'], ['Sporing og rapport', 'Se præcis, hvad du får for pengene.']],
    steps: [['Mål og budget', 'Vi aftaler, hvad du vil opnå, og hvad det må koste.'], ['Opsætning', 'Vi bygger kampagner, annoncer og sporing.'], ['Optimering', 'Vi justerer løbende og sender en månedlig rapport.']] },
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
  { n: 'Malthe', a: 'Annoncering', g: 'M', lead: 'Malthe står for annoncering og SEO. Han sørger for, at de rigtige kunder finder dig, og at hver krone bliver brugt fornuftigt.', l: [['Google og Meta', 'Annoncer, der rammer de rigtige.'], ['SEO', 'Bliv fundet i dit område.'], ['Rapporter', 'Klart overblik hver måned.']] },
  { n: 'Mikkel', a: 'IT-udvikling', g: 'M', lead: 'Mikkel bygger interne systemer og automations. Han gør de tunge, gentagne opgaver lette, så du får tid til det vigtige.', l: [['Interne systemer', 'Booking, CRM og dashboards.'], ['Automations', 'Mails, fakturaer og opfølgning.'], ['Integrationer', 'Får dine programmer til at tale sammen.']] }
];

export const balls = ['Hjemmeside', 'SEO', 'Google Ads', 'Booking', 'Automations', 'AI-annoncer', 'CRM', 'Meta Ads', 'Dashboards', 'Google-profil', 'Webshop', 'Chatbot', 'Nyhedsbrev', 'Tekster', 'Logo', 'Hosting', 'SSL', 'Mobile-first'];

// [explanation, related pop-up key or 'pris' or null]
export const ballInfo = {
  'Hjemmeside': ['Vores hovedprodukt. En komplet hjemmeside, hvor alt det vigtige er med.', 'pris'],
  'SEO': ['Bliv fundet først, når kunderne søger efter det, du laver.', 'addon-seo'],
  'Google Ads': ['Vær øverst på Google, når kunderne søger lige nu.', 'addon-annoncering'],
  'Booking': ['Lad kunderne booke tid direkte på siden, døgnet rundt.', 'addon-systemer'],
  'Automations': ['Lad mails, fakturaer og opfølgning klare sig selv.', 'addon-automations'],
  'AI-annoncer': ['AI laver og tester mange annoncer og flytter budgettet derhen, hvor det virker.', 'addon-annoncering'],
  'CRM': ['Samlet overblik over dine kunder, aftaler og historik.', 'addon-systemer'],
  'Meta Ads': ['Annoncer på Facebook og Instagram, der rammer de rigtige.', 'addon-annoncering'],
  'Dashboards': ['Se de vigtigste tal for din virksomhed på én skærm.', 'addon-systemer'],
  'Google-profil': ['Vi opretter eller opdaterer din profil, så du ses på Google Maps.', 'inc-Google-profil'],
  'Webshop': ['Sælg produkter eller gavekort direkte fra din hjemmeside.', null],
  'Chatbot': ['En AI-chatbot, der svarer dine kunder døgnet rundt.', 'addon-automations'],
  'Nyhedsbrev': ['Hold kontakten med dine kunder med nyhedsbreve, der sendes automatisk.', 'addon-automations'],
  'Tekster': ['Tekster, der sælger og kan findes på Google.', 'addon-seo'],
  'Logo': ['Et enkelt, genkendeligt logo og farver, der passer til dig.', null],
  'Hosting': ['Hurtig og sikker hosting. Typisk 50–100 kr. om måneden.', 'inc-Domæne og opsætning'],
  'SSL': ['Sikker forbindelse med hængelås i browseren. Altid inkluderet.', 'inc-SSL-sikkerhed'],
  'Mobile-first': ['Designet til telefonen først og skarp på alle skærme.', 'inc-Responsivt design']
};

export const faqs = [
  ['Er der en månedlig betaling?', 'Nej, du betaler én gang for hjemmesiden. Hosting og domæne koster typisk 50–100 kr. om måneden, og det sætter vi op for dig.'],
  ['Jeg har ikke tid til det. Hvad skal jeg lave?', 'Et opkald på 15 minutter og nogle billeder. Resten klarer vi, også teksterne.'],
  ['Kan kunderne finde mig på Google?', 'Ja. Vi sætter siden op, så du kan findes på dit fag og dit område, fx “frisør Roskilde” eller “tømrer Vejle”, og opretter din Google-profil.'],
  ['Kan jeg selv rette i siden?', 'Ja. Du kan skifte billeder, tekster og priser, også direkte fra mobilen. Vi viser dig hvordan.']
];

// Ball / trail palette [background, text]
export const palette = [['#e0552b', '#fff'], ['#111', '#fff'], ['#fff', '#111'], ['#f2c14e', '#111'], ['#f2ede4', '#111']];
// The pop-up band palette for balls (prototype used cream instead of white for index 2)
export const bandPalette = [['#e0552b', '#fff'], ['#111', '#fff'], ['#f2ede4', '#111'], ['#f2c14e', '#111'], ['#f2ede4', '#111']];
