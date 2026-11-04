// /services/webshop: a DRAFT page for a webshop on Shopify, with a price calculator as its centrepiece.
// Not linked from anywhere and not indexed (p.robots). Build: node scripts/services/build.mjs webshop
//
// The prices live in one place: PRICES at the top of assets/js/show/webshop.js. This file reads that block,
// so the hero, the price box, the questions and the calculator's first view say the same as the calculator.
// The calculator's markup is written here (so main.js gives it the spotlight, the magnet and the reveals);
// assets/js/show/webshop.js makes it work, and assets/css/show/webshop.css styles it.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function ({ lib, data, showcase, read }) {
  const { esc, url, hero, price, cards, faq, contact, ORG, faqLd, ROOT } = lib;
  const { KANAL } = await import(pathToFileURL(join(ROOT, 'assets/js/content.js')).href);
  const block = (read('assets/js/show/webshop.js').match(/\/\/ PRICES:start[^\n]*\n([\s\S]*?)\/\/ PRICES:end/) || [])[1];
  if (!block) throw new Error('webshop.mjs: fandt ikke PRICES:start … PRICES:end i assets/js/show/webshop.js');
  const { PRICES: P, SCALE } = new Function('KANAL', `${block}\nreturn { PRICES, SCALE };`)(KANAL);
  const fmt = n => n.toLocaleString('da-DK'), kr = n => fmt(n) + ' kr.';
  const sc = showcase('webshop');

  /* ---------------- The calculator ---------------- */

  // A choice: a label with a native radio or checkbox (keyboard and screen readers for free)
  const opt = ({ type = 'checkbox', name, value, t, d, p, pk = value, on = false, s = '', wide = false }) =>
    `<label class="calc__opt${on ? ' is-on' : ''}${wide ? ' ws-wide' : ''}"><input class="ws-in" type="${type}" name="${name}" value="${value}"${on ? ' checked' : ''}${s ? ` data-s="${esc(s)}"` : ''}><b>${esc(t)}</b><span>${esc(d)}</span><em data-ws-p="${pk}">${esc(p)}</em></label>`;
  const group = (n, title, body, role = 'group') => `<div class="calc__group" role="${role}" aria-labelledby="ws-g${n}"><span class="calc__lbl" id="ws-g${n}">${n} · ${esc(title)}</span>${body}</div>`;
  const row = (items, two) => `<div class="calc__row${two ? ' ws-row2' : ''}">${items.join('')}</div>`;

  const INTEG = [
    ['fragt', 'Fragt og labels', 'Fx Shipmondo. Labels og track & trace.'],
    ['regnskab', 'Regnskab', 'Fx e-conomic eller Dinero.'],
    ['nyhedsbrev', 'Nyhedsbrev', 'Fx Klaviyo. Kunderne kan tilmelde sig.'],
    ['feed', 'Produktfeed', 'Dine varer til Google Shopping og Meta.'],
    ['anmeldelser', 'Anmeldelser', 'Fx Trustpilot.']
  ];
  const ADS = [['gsa', 'Google Shopping Ads', 'Dine varer med billede og pris på Google.'], ['gads', 'Google Ads', 'Øverst, når kunderne søger.'], ['meta', 'Meta Ads', 'Annoncer på Facebook og Instagram.']];
  const startS = SCALE.find(([, n]) => n === P.included)[0];

  const options = `<div class="calc__opts">
        <div class="calc__group" role="group" aria-labelledby="ws-g1">
          <div class="ws-head"><span class="calc__lbl" id="ws-g1">1 · Produkter</span><label class="ws-num"><span class="sr-only">Antal produkter, skriv et tal</span><input data-ws-n type="text" inputmode="numeric" maxlength="5" value="${fmt(P.included)}" autocomplete="off" enterkeyhint="done"><span aria-hidden="true">produkter</span></label></div>
          <input class="ws-range" data-ws-range type="range" min="0" max="1000" step="1" value="${startS}" aria-label="Antal produkter" aria-valuetext="${P.included} produkter" style="--s:${startS / 1000}">
          <div class="ws-ticks">${SCALE.slice(1).map(([s, n]) => `<button type="button" data-ws-tick="${n}" style="--x:${s / 10}%" aria-label="${fmt(n)} produkter"${n === P.included ? ' class="is-on"' : ''}>${fmt(n)}</button>`).join('')}</div>
          <p class="calc__hint">Op til ${P.included} produkter er med i prisen.</p>
          <span class="ws-sub" id="ws-g1b">Sådan kommer de ind</span>
          <div class="calc__row ws-row2" role="radiogroup" aria-labelledby="ws-g1b">${[
            opt({ type: 'radio', name: 'metode', value: 'opret', t: 'Vi opretter dem', d: `Ud fra dine billeder og tekster. ${P.perProduct} kr. pr. produkt over ${P.included}.`, p: 'Med i prisen', on: true }),
            opt({ type: 'radio', name: 'metode', value: 'import', t: 'Import', d: 'Fra en fil eller din gamle webshop. Samme pris uanset antal.', p: '+' + kr(P.import) })
          ].join('')}</div>
          <p class="ws-tip" data-ws-tip hidden><span></span><button type="button" data-ws-pick=""></button></p>
          <span class="ws-sub">Mere om produkterne</span>
          ${row([
            opt({ name: 'varianter', value: 'varianter', t: 'Varianter', d: 'Fx størrelser og farver på samme produkt.', p: '+' + kr(P.variants) }),
            opt({ name: 'tekster', value: 'tekster', t: 'Produkttekster', d: `Vi skriver dem. ${P.texts} kr. pr. produkt.`, p: '+' + kr(P.included * P.texts) })
          ], true)}
        </div>
        ${group(2, 'Design', row([
          opt({ type: 'radio', name: 'design', value: 'tema', t: 'Tilpasset tema', d: 'Et gennemprøvet tema i dine farver, med dit logo og din stil.', p: 'Med i prisen', on: true }),
          opt({ type: 'radio', name: 'design', value: 'unikt', t: 'Unikt design', d: 'Designet fra bunden, så shoppen ligner ingen andre.', p: '+' + kr(P.unique) })
        ], true), 'radiogroup')}
        <div class="calc__group"><span class="calc__lbl" id="ws-g3">3 · Sprog og valuta</span>
          <div class="ws-step" data-ws-stepbox>
            <span class="ws-step__t"><b>Ekstra sprog og valutaer</b><span>Fx engelsk og euro. ${kr(P.language)} pr. sprog.</span><em data-ws-p="sprog">Kun dansk</em></span>
            <span class="ws-step__c" role="group" aria-labelledby="ws-g3">
              <button type="button" data-ws-step="-1" aria-label="Et sprog færre" disabled>−</button><output data-ws-sprog aria-live="polite">0</output><button type="button" data-ws-step="1" aria-label="Et sprog mere">+</button>
            </span>
          </div></div>
        ${group(4, 'Integrationer', row(INTEG.map(([v, t, d]) => opt({ name: 'integ', value: v, t, d, p: '+' + kr(P.integration), pk: 'integ' }))))}
        ${group(5, 'Funktioner', row([
          opt({ name: 'fn', value: 'b2b', t: 'B2B og forhandlerpriser', d: 'Egne priser og login til forhandlere.', p: '+' + kr(P.b2b), s: 'B2B-priser' }),
          opt({ name: 'fn', value: 'subscriptions', t: 'Abonnementer', d: 'Faste leveringer, fx hver måned.', p: '+' + kr(P.subscriptions), s: 'abonnementer' }),
          opt({ name: 'fn', value: 'migration', t: 'Flytning', d: 'Kunder, ordrer og omdirigeringer fra din gamle webshop.', p: '+' + kr(P.migration), s: 'flytning' })
        ]))}
        ${group(6, 'Hver måned, hvis du vil', `${row([
          opt({ name: 'service', value: 'service', t: 'Webshop-service', d: 'Opdateringer, små rettelser og hjælp, når du har brug for det.', p: kr(P.service) + '/md.', wide: true }),
          ...ADS.map(([v, t, d]) => opt({ name: 'ads', value: v, t, d, p: kr(P.channel.first) + '/md.', pk: 'ad:' + v }))
        ])}
          <p class="calc__hint" data-ws-adtip>Første kanal ${kr(P.channel.first)}/md. Hver ekstra kanal kun ${kr(P.channel.extra)}/md.</p>`)}
        <button type="button" class="ws-bar" data-ws-bar tabindex="-1" aria-hidden="true"><span class="ws-bar__t"><small>Din pris</small><span><b data-ws-bar1>${kr(P.base)}</b><span class="ws-bar__md" hidden> + <span data-ws-bar2>0 kr./md.</span></span></span></span><i class="ws-delta" data-ws-d3></i><span class="ws-bar__go">Se pris ↓</span></button>
      </div>`;

  // The example shop: a made-up carpenter's webshop that changes with the choices (aria-hidden, a drawing)
  const TILES = [
    ['a1', '#f1e8da', 'Skærebræt i eg', 'Olieret eg, 40 cm', '349 kr.'],
    ['a2', '#ebe6dc', 'Serveringsbakke', 'Valnød med greb', '449 kr.'],
    ['a3', '#efe4d6', 'Træolie', 'Til bræt og borde', '129 kr.'],
    ['a4', '#e9ece5', 'Lysestage', 'Drejet i ask', '199 kr.'],
    ['a5', '#f2eadf', 'Opbevaringskasse', 'Eg med fingersamlinger', '299 kr.'],
    ['a6', '#ece8e1', 'Knagerække', 'Tre knager i eg', '399 kr.'],
    ['a7', '#f0e6da', 'Skål i valnød', 'Drejet af én blok', '259 kr.'],
    ['a1 ws-w', '#e8ebe5', 'Skærebræt i valnød', 'Olieret valnød, 30 cm', '299 kr.']
  ];
  const shop = `<figure class="ws-shop" data-ws-shop aria-hidden="true">
          <div class="ws-shop__bar"><span class="dots3"><i></i><i></i><i></i></span><span class="ws-shop__url">🔒 nordvik.dk</span><span class="tag-eks">Eksempel</span></div>
          <div class="ws-view">
            <div class="ws-strip" data-wb>Fri fragt over 499 kr.</div>
            <div class="ws-top" data-wb><b class="ws-logo">Nordvik</b><span class="ws-nav"><i>Shop</i><i>Om os</i><i>Kontakt</i><i>FAQ</i></span><span class="ws-b2b">Forhandler</span><span class="ws-langs">${['DA', 'EN', 'DE', 'SV'].map((l, i) => `<i data-ws-lang${i ? ' class="is-off"' : ''}>${l}</i>`).join('')}</span><span class="ws-cart"><svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg><i>2</i></span></div>
            <div class="ws-hero" data-wb><div class="ws-hero__a"><small>Nyt i butikken</small><b>Skærebræt i olieret eg</b><span>Se mere →</span><i class="ws-art ws-a1" style="--t:#e8dcc8"><i></i></i></div><div class="ws-hero__b"><b>Håndlavet<br>i træ.</b><span>Se alle varer</span></div></div>
            <div class="ws-meta" data-wb><span>Alle produkter <b data-ws-shopn>${fmt(P.included)}</b></span><span>Sortér ▾</span></div>
            <div class="ws-grid">${TILES.map(([a, t, name, txt, pr], i) => `<div class="ws-tile" data-ws-tile data-wb><div class="ws-tile__in"><div class="ws-art ws-${a}" style="--t:${t}"><i></i>${i === 2 ? '<span class="ws-abo">Abonnér</span>' : ''}</div><b>${name}</b><small>${txt}</small><span class="ws-tile__p"><span>${pr}</span><span class="ws-dots"><i></i><i></i><i></i></span></span></div></div>`).join('')}</div>
            <div class="ws-toast" data-ws-toast><i></i><span></span></div>
          </div>
        </figure>
        <p class="sr-only">Eksempel på en webshop for den opdigtede virksomhed Nordvik. Den ændrer sig, når du vælger i beregneren.</p>`;

  const summary = `<div class="spot calc__sum" data-spot data-ws-sum>
          <span class="kicker">Din pris</span>
          <div class="calc__lines" data-ws-lines><div class="calc__line"><span>Webshop på Shopify</span><span>${kr(P.base)}</span></div><div class="calc__line"><span>${P.included} produkter</span><span>Med i prisen</span></div></div>
          <div class="calc__tot"><span>Engangsbeløb</span><b data-ws-once>${kr(P.base)}</b><i class="ws-delta" data-ws-d1 aria-hidden="true"></i></div>
          <div class="calc__tot calc__tot--md"><span>Pr. måned</span><b data-ws-md>0 kr.</b><i class="ws-delta" data-ws-d2 aria-hidden="true"></i></div>
          <p class="calc__note">Shopify-abonnementet betaler du direkte til Shopify, og annoncebudgettet direkte til Google eller Meta. Alle priser er ekskl. moms.</p>
          <button type="button" class="btn btn--accent" data-ws-go data-magnet data-burst>Få et tilbud på det her →</button>
          <p class="sr-only" aria-live="polite" data-ws-live></p>
        </div>`;

  const beregner = `<section id="beregner" class="calc-sec show show--webshop" data-sec="beregner">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title"><div class="kicker">Beregn din pris</div><h2 class="h2">Hvad koster din webshop?<br><span class="dim">Se det med det samme.</span></h2></div>
        <p class="sec-head__lead">Træk i antallet af produkter, og vælg det, shoppen skal kunne. Beregneren starter på det billigste.</p>
      </div>
      <div class="calc" data-reveal="1">
      ${options}
      <div class="ws-side" data-ws-side>
        ${shop}
        ${summary}
      </div>
      </div>
    </section>`;

  /* ---------------- The rest of the page ---------------- */

  const faqs = [
    ['Hvorfor bygger I på Shopify?', 'Fordi det er en af de mest brugte platforme til webshops. Den er stabil og sikker, betaling og fragt virker fra start, og du kan selv rette produkter og priser, også fra mobilen. Vi er Shopify Partner.'],
    ['Hvad koster Shopify-abonnementet?', 'Det betaler du direkte til Shopify, så abonnementet står i dit eget navn. Prisen afhænger af den plan, du vælger, og vi hjælper dig med at finde den rigtige. Det er ikke med i vores pris.'],
    ['Hvordan kommer mine produkter ind?', `Op til ${P.included} produkter opretter vi ud fra dine billeder og tekster, og det er med i prisen. Har du flere, opretter vi dem for ${P.perProduct} kr. pr. produkt, eller vi importerer dem fra en fil eller din gamle webshop for ${kr(P.import)} samlet. Beregneren viser, hvad der er billigst for dig.`],
    ['Hvor lang tid tager det?', 'Det afhænger af, hvor mange produkter du har, og hvad shoppen skal kunne. Når vi har talt sammen, får du en tidsplan sammen med prisen. Det, der oftest bestemmer tempoet, er, hvornår billeder og tekster er klar.'],
    ['Ejer jeg selv webshoppen?', 'Ja. Webshoppen og Shopify-kontoen står i dit navn, og produkter, kunder og ordrer er dine. Webshop-service er et valg, ikke et krav.'],
    ['Kan jeg selv rette i shoppen?', 'Ja. Du kan selv lægge nye produkter ind, ændre priser og sende ordrer, også fra mobilen. Vi viser dig, hvordan det virker.']
  ];
  const u = url('webshop');
  const title = `Webshop på Shopify fra ${kr(P.base)} · Beregn din pris · Webleads`;
  const description = `Vi bygger din webshop på Shopify fra ${kr(P.base)} med betaling, fragt, handelsbetingelser og ${P.included} produkter. Beregn prisen på din egen shop ud fra produkter, design, sprog og integrationer.`;
  const mark = `${fmt(P.base)} kr.`;

  const p = {
    pageType: 'service_webshop', slug: 'webshop', title, description, url: u,
    og: '/assets/og/forside.png', ogAlt: `Webleads: webshop på Shopify fra ${kr(P.base)}.`,
    robots: 'noindex, nofollow', bar: 'Udkast: priserne er et forslag og er ikke endelige.',
    tag: `Webshop fra ${kr(P.base)}`, subject: 'Møde om webshop',
    msg: 'Hej, jeg var lige inde på webleads.dk og vil gerne høre mere om en webshop. Kan vi opsætte et møde?',
    nav: [['Services', '/#services'], ['Beregn pris', '#beregner'], ['Det får du', '#pris'], ['Sådan foregår det', '#saadan'], ['Spørgsmål', '#faq']],
    css: sc.css, js: sc.js,
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        ORG,
        { '@type': 'Service', '@id': `${u}#service`, name: 'Webshop på Shopify', serviceType: 'Udvikling af webshops', description, url: u, provider: { '@id': ORG['@id'] }, areaServed: { '@type': 'Country', name: 'Danmark' },
          offers: { '@type': 'Offer', priceSpecification: { '@type': 'PriceSpecification', minPrice: String(P.base), priceCurrency: 'DKK', valueAddedTaxIncluded: false } } },
        { '@type': 'WebPage', '@id': `${u}#side`, url: u, name: title, isPartOf: { '@id': `${data.SITE}/#website` }, about: { '@id': `${u}#service` }, inLanguage: 'da-DK' },
        faqLd(u, faqs)
      ]
    }
  };

  // The hero's price counts up, like "Fra 2.995 kr." on /services/hjemmesider
  const top = hero({
    badge: 'Webshop på Shopify · til', words: ['butikker', 'brands', 'producenter', 'nye webshops'],
    h1: { a: ['Webshop,', 'der'], hot: 'sælger.', dim: 'Fra', mark },
    lead: 'Vi bygger din webshop på Shopify, klar til at sælge med betaling, fragt og alt det juridiske på plads. Træk i beregneren, og se din pris med det samme.',
    floats: [`${P.included} produkter med`, 'Kort og MobilePay', 'Shopify Partner ↗'], ring: 'WEBSHOP • SHOPIFY • BETALING • FRAGT •',
    cta: 'Få en fast pris', more: ['Beregn din pris', '#beregner']
  }).replace(`<span data-underline>${esc(mark)}</span>`, `<span data-underline><span data-count>${fmt(P.base)}</span> kr.</span>`);

  return {
    slug: 'webshop', path: 'services/webshop/index.html', p,
    main: [
      top,
      beregner,
      price({
        name: 'Webshop', priceH2: ['Klar til at sælge.', 'Fra første dag.'],
        price: { amount: fmt(P.base), pre: 'fra', post: 'kr.', note: 'Engangsbeløb · ekskl. moms · Shopify-abonnementet betaler du direkte til Shopify' },
        priceLead: `Alt til højre er med i grundprisen. Har du flere end ${P.included} produkter eller brug for mere, viser beregneren prisen med det samme.`,
        items: [
          ['Webshop på Shopify', 'Sat op og klar til at sælge. Vi er Shopify Partner.'],
          ['Tema i dit brand', 'Et gennemprøvet tema i dine farver, med dit logo og din stil.'],
          [`${P.included} produkter`, 'Vi opretter dem ud fra dine billeder og tekster.'],
          ['Betaling', 'Kort, MobilePay og Apple Pay.'],
          ['Fragt', 'Fragtmetoder og priser, som kunden vælger ved kassen.'],
          ['Handelsbetingelser og GDPR', 'Handelsbetingelser, cookies og privatlivspolitik på plads.'],
          ['Google Analytics og Search Console', 'Du kan se, hvor kunderne kommer fra, og hvad de køber.'],
          ['Alle de vigtige sider', 'Forside, om os, kontakt og FAQ.']
        ]
      }),
      cards({
        id: 'saadan', sec: 'saadan', kicker: 'Sådan foregår det', h2: 'Fire trin.<br><span class="dim">Så sælger du.</span>',
        list: [
          ['Vi taler sammen', 'Om dine produkter, din stil, og hvad shoppen skal kunne. Du får en fast pris.', 'kr'],
          ['Vi bygger shoppen', 'Tema, sider, betaling, fragt og dine produkter. Du kan følge med undervejs.', '#'],
          ['Du tester og godkender', 'Du prøver at handle i din egen shop, før den går live.', '✓'],
          ['Du sælger', 'Shoppen går live på dit eget domæne, og vi viser dig, hvordan du passer den.', '↗']
        ]
      }),
      faq(faqs),
      contact({ h2: 'Klar til at sælge online?', lead: 'Fortæl os om dine produkter, og hvad shoppen skal kunne. Vi svarer inden for 24 timer med en fast pris.', base: 'Webshop', value: P.base, placeholder: 'Hvad sælger du, og har du en webshop i dag?' })
    ]
  };
}
