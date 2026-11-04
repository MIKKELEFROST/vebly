// /services/webshop: a DRAFT page for a webshop on Shopify, with a price calculator as its centrepiece.
// Not linked from anywhere and not indexed (p.robots). Build: node scripts/services/build.mjs webshop
//
// Its own structure, like no other page: hero → #beregner (the calculator: drag the products and watch the example
// shop fill up, every choice flies into the cart) → #pris (what the base price includes, as a packing slip) →
// #saadan (a short track-and-trace line, not the step cards) → #faq → #kontakt.
//
// The prices live in one place: PRICES at the top of assets/js/show/webshop.js. This file reads that block, so the
// hero, the packing slip, the questions and the calculator's first view say the same as the calculator.
// The markup is written here (so main.js gives it the spotlight, the magnet and the reveals); assets/js/show/webshop.js
// makes it work, and assets/css/show/webshop.css styles it.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function ({ lib, data, showcase, read }) {
  const { esc, url, hero, faq, contact, ORG, faqLd, ROOT } = lib;
  const { KANAL } = await import(pathToFileURL(join(ROOT, 'assets/js/content.js')).href);
  const block = (read('assets/js/show/webshop.js').match(/\/\/ PRICES:start[^\n]*\n([\s\S]*?)\/\/ PRICES:end/) || [])[1];
  if (!block) throw new Error('webshop.mjs: fandt ikke PRICES:start … PRICES:end i assets/js/show/webshop.js');
  const { PRICES: P, SCALE } = new Function('KANAL', `${block}\nreturn { PRICES, SCALE };`)(KANAL);
  const fmt = n => n.toLocaleString('da-DK'), kr = n => fmt(n) + ' kr.';
  const sc = showcase('webshop');
  const BAG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>';

  /* ---------------- The calculator ---------------- */

  // A choice: a card with a native checkbox inside (keyboard and screen readers for free).
  // s and c: the short names for "Du har valgt" and for the e-mail
  const opt = (name, value, t, d, p, { pk = '', s = '', c = '', cls = '' } = {}) =>
    `<label class="calc__opt${cls}"><input class="ws-in" type="checkbox" name="${name}" value="${value}"${s ? ` data-s="${esc(s)}" data-c="${esc(c || s)}"` : ''}><b>${esc(t)}</b><span>${esc(d)}</span><em${pk ? ` data-ws-p="${pk}"` : ''}>${esc(p)}</em></label>`;
  // Two choices side by side (radio buttons) with a thumb that slides; the caption under it explains the chosen one
  const seg = (name, lbl, items) => `<div class="ws-seg" role="radiogroup" aria-labelledby="${lbl}" data-ws-seg data-on="0">${items.map(([v, t, p, cap], i) =>
    `<label${i ? '' : ' class="is-on"'}><input type="radio" name="${name}" value="${v}" data-cap="${esc(cap)}"${i ? '' : ' checked'}><b>${esc(t)}</b><em data-ws-p="${v}">${esc(p)}</em></label>`).join('')}<i class="ws-seg__thumb" aria-hidden="true"></i></div><p class="ws-cap">${esc(items[0][3])}</p>`;
  const group = (id, title, body) => `<div class="calc__group" role="group" aria-labelledby="ws-l-${id}" data-reveal="0"><span class="calc__lbl" id="ws-l-${id}">${esc(title)}</span>${body}</div>`;
  const row = (items, cls = '') => `<div class="calc__row${cls}">${items.join('')}</div>`;

  const INTEG = [
    ['fragt', 'Fragt og labels', 'Fx Shipmondo. Labels og track & trace.', 'Fragt'],
    ['regnskab', 'Regnskab', 'Fx e-conomic eller Dinero.', 'Regnskab'],
    ['nyhedsbrev', 'Nyhedsbrev', 'Fx Klaviyo. Kunderne kan tilmelde sig.', 'Nyhedsbrev'],
    ['feed', 'Produktfeed', 'Dine varer til Google Shopping og Meta.', 'Feed'],
    ['anmeldelser', 'Anmeldelser', 'Fx Trustpilot.', 'Anmeldelser']
  ];
  const ADS = [['gsa', 'Google Shopping Ads', 'Dine varer med billede og pris på Google.'], ['gads', 'Google Ads', 'Øverst, når kunderne søger.'], ['meta', 'Meta Ads', 'Annoncer på Facebook og Instagram.']];
  const startS = SCALE.find(([, n]) => n === P.included)[0];

  const products = `<div class="calc__group ws-prod" role="group" aria-labelledby="ws-l-prod" data-reveal="1">
          <div class="ws-prod__top"><span class="calc__lbl" id="ws-l-prod">Produkter</span><span class="ws-inc" data-ws-inc>Op til ${P.included} er med i prisen</span></div>
          <figure class="ws-wall" aria-hidden="true">
            <div class="ws-wall__bar"><span class="dots3"><i></i><i></i><i></i></span><span class="ws-wall__url">nordvik.dk/shop</span><span class="tag-eks">Eksempel</span></div>
            <div class="ws-wall__head"><b class="ws-wall__logo">Nordvik</b><span class="ws-wall__n">Alle produkter <b data-ws-wn>${fmt(P.included)}</b></span><span class="ws-wall__lang" data-ws-lang>${['DA', 'EN', 'DE', 'SV'].map((l, i) => `<i${i ? '' : ' class="is-on"'}>${l}</i>`).join('')}</span><span class="ws-wall__cart">${BAG}</span></div>
            <canvas data-ws-wall></canvas>
          </figure>
          <p class="sr-only">Eksempel på en webshop, der fyldes med det antal produkter, du vælger.</p>
          <div class="ws-num"><label class="ws-num__box"><span class="sr-only">Antal produkter, skriv et tal</span><span class="ws-num__m" data-ws-m aria-hidden="true">${fmt(P.included)}</span><input data-ws-n type="text" inputmode="numeric" maxlength="5" value="${fmt(P.included)}" autocomplete="off" enterkeyhint="done"></label><span class="ws-num__u" data-ws-u aria-hidden="true">produkter</span></div>
          <input class="ws-range" data-ws-range type="range" min="0" max="1000" step="1" value="${startS}" aria-label="Antal produkter" aria-valuetext="${P.included} produkter" style="--s:${startS / 1000}">
          <div class="ws-ticks">${SCALE.map(([s, n]) => `<button type="button" data-ws-tick="${n}" style="--x:${s / 10}%" aria-label="${fmt(n)} ${n === 1 ? 'produkt' : 'produkter'}"${n === P.included ? ' class="is-on"' : ''}>${fmt(n)}</button>`).join('')}</div>
          <span class="ws-sub" id="ws-l-metode">Sådan kommer de ind</span>
          ${seg('metode', 'ws-l-metode', [
            ['opret', 'Vi opretter dem', 'Med i prisen', `Vi opretter dem ud fra dine billeder og tekster. ${P.perProduct} kr. pr. produkt over ${P.included}.`],
            ['import', 'Import', '+' + kr(P.import), `Import fra en fil eller din gamle webshop. ${kr(P.import)} samlet, uanset antal.`]
          ])}
          <p class="ws-tip" data-ws-tip hidden><span></span><button type="button" data-ws-pick=""></button></p>
          ${row([
            opt('varianter', 'varianter', 'Varianter', 'Fx størrelser og farver på samme produkt.', '+' + kr(P.variants)),
            opt('tekster', 'tekster', 'Produkttekster', `Vi skriver dem. ${P.texts} kr. pr. produkt.`, '+' + kr(P.included * P.texts), { pk: 'tekster' })
          ], ' ws-2')}
        </div>`;

  const options = `<div class="calc__opts">
        ${products}
        ${group('design', 'Design', seg('design', 'ws-l-design', [
          ['tema', 'Tilpasset tema', 'Med i prisen', 'Et gennemprøvet tema i dine farver, med dit logo og din stil.'],
          ['unikt', 'Unikt design', '+' + kr(P.unique), 'Designet fra bunden til dit brand, så shoppen ligner ingen andre.']
        ]))}
        ${group('sprog', 'Sprog og valuta', `<div class="ws-lang">
            <span class="ws-lang__t"><b>Ekstra sprog og valutaer</b><span>Fx engelsk og euro. ${kr(P.language)} pr. sprog.</span></span>
            <span class="ws-lang__pills" data-ws-lang aria-hidden="true">${['DA', 'EN', 'DE', 'SV'].map((l, i) => `<i${i ? '' : ' class="is-on"'}>${l}</i>`).join('')}</span>
            <span class="calc__step"><button type="button" data-ws-step="-1" aria-label="Et sprog færre" disabled>−</button><b data-ws-sprog aria-live="polite">0</b><button type="button" data-ws-step="1" aria-label="Et sprog mere">+</button></span>
            <em data-ws-p="sprog">Kun dansk</em>
          </div>`)}
        ${group('integ', 'Integrationer', row(INTEG.map(([v, t, d, c]) => opt('integ', v, t, d, '+' + kr(P.integration), { s: t.toLocaleLowerCase('da-DK'), c }))))}
        ${group('fn', 'Funktioner', row([
          opt('fn', 'b2b', 'B2B og forhandlerpriser', 'Egne priser og login til forhandlere.', '+' + kr(P.b2b), { s: 'B2B-priser', c: 'B2B' }),
          opt('fn', 'subscriptions', 'Abonnementer', 'Faste leveringer, fx hver måned.', '+' + kr(P.subscriptions), { s: 'abonnementer', c: 'Abonnementer' }),
          opt('fn', 'migration', 'Flytning', 'Kunder, ordrer og omdirigeringer fra en anden platform.', '+' + kr(P.migration), { s: 'flytning', c: 'Flytning' })
        ]))}
        ${group('md', 'Hver måned, hvis du vil', `${row([
          opt('service', 'service', 'Webshop-service', 'Opdateringer, små rettelser og hjælp, når du har brug for det.', kr(P.service) + '/md.', { cls: ' ws-wide' }),
          ...ADS.map(([v, t, d]) => opt('ads', v, t, d, kr(P.channel.first) + '/md.', { pk: 'ad:' + v }))
        ])}<p class="calc__hint" data-ws-adtip>Første kanal ${kr(P.channel.first)}/md. Hver ekstra kanal kun ${kr(P.channel.extra)}/md.</p>`)}
      </div>`;

  const cart = `<div class="spot calc__sum" data-spot data-ws-sum data-reveal="2">
        <div class="ws-sum__top"><span class="kicker">Din kurv</span><span class="ws-bag">${BAG}<i data-ws-count>2</i></span></div>
        <div class="calc__lines" data-ws-lines><div class="calc__line"><span>Webshop på Shopify</span><span>${kr(P.base)}</span></div><div class="calc__line"><span>${P.included} produkter<small>Op til ${P.included} er med i prisen</small></span><span>Med i prisen</span></div></div>
        <div class="calc__tot"><span>Engangsbeløb</span><b data-ws-once>${kr(P.base)}</b></div>
        <div class="calc__tot calc__tot--md"><span>Pr. måned</span><b data-ws-md>0 kr.</b></div>
        <p class="calc__note">Shopify-abonnementet betaler du direkte til Shopify, og annoncebudgettet direkte til Google eller Meta. Alle priser er ekskl. moms.</p>
        <button type="button" class="btn btn--accent" data-ws-go data-magnet data-burst>Få et tilbud på det her →</button>
        <p class="sr-only" aria-live="polite" data-ws-live></p>
      </div>`;

  // The cart bar on phones and tablets: a shortcut down to the cart (the cart itself is next in the page, so the bar
  // is left out for screen readers and the keyboard)
  const cartBar = `<button type="button" class="ws-bar" data-ws-bar tabindex="-1" aria-hidden="true"><span class="ws-bag">${BAG}<i data-ws-count>2</i></span><span class="ws-bar__t"><small>Din pris</small><b data-ws-b1>${kr(P.base)}</b><span hidden>+ <span data-ws-b2>0 kr./md.</span></span></span><span class="ws-bar__go">Se kurven ↓</span></button>`;

  const beregner = `<section id="beregner" class="calc-sec show--webshop" data-sec="beregner">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title"><div class="kicker">Beregn din pris</div><h2 class="h2">Byg din webshop.<br><span class="dim">Se prisen med det samme.</span></h2></div>
        <p class="sec-head__lead">Træk i antallet af produkter, og vælg det, shoppen skal kunne. Det, du vælger, lander i kurven. Beregneren starter på det billigste.</p>
      </div>
      <div class="calc">
      ${options}
      ${cart}
      </div>
      ${cartBar}
      <div class="ws-flies" data-ws-flies aria-hidden="true"></div>
    </section>`;

  /* ---------------- What the base price includes: a packing slip ---------------- */

  const SLIP = [
    ['1', 'Webshop på Shopify', 'Sat op og klar til at sælge. Vi er Shopify Partner.'],
    ['1', 'Tema i dit brand', 'Et gennemprøvet tema i dine farver, med dit logo og din stil.'],
    [String(P.included), 'Produkter', 'Vi opretter dem ud fra dine billeder og tekster.'],
    ['3', 'Betalingsmetoder', 'Kort, MobilePay og Apple Pay.'],
    ['1', 'Fragt', 'Fragtmetoder og priser, som kunden vælger ved kassen.'],
    ['3', 'Handelsbetingelser, cookies og GDPR', 'Betingelser, cookie-banner og privatlivspolitik.'],
    ['2', 'Google Analytics og Search Console', 'Du kan se, hvor kunderne kommer fra, og hvad de køber.'],
    ['4', 'Sider', 'Forside, om os, kontakt og FAQ.']
  ];
  const pris = `<section id="pris" class="ws-pris show--webshop" data-sec="pris">
      <div class="ws-pris__copy" data-reveal="0">
        <div class="kicker">Det får du</div>
        <h2 class="h2">Alt det her er med.<br><span class="dim">I de ${fmt(P.base)} kr.</span></h2>
        <p class="sec-head__lead">En webshop, der er klar til at sælge fra første dag. Har du flere end ${P.included} produkter eller brug for mere, viser beregneren prisen med det samme.</p>
        <div class="ws-pris__cta"><a href="#kontakt" class="btn btn--dark" data-magnet data-burst data-roll data-event="Pris: Få en fast pris">Få en fast pris</a><a href="#beregner" class="hero__more" data-event="Pris: Beregn din pris">Beregn din pris <span>↑</span></a></div>
      </div>
      <div class="ws-slip" data-reveal="1"><div class="ws-slip__paper">
        <div class="ws-slip__head"><span><b>Følgeseddel</b><small>Webshop på Shopify · Webleads</small></span><span class="ws-stamp" data-reveal="${SLIP.length + 2}" aria-hidden="true">Klar til<br>at sælge</span></div>
        <div class="ws-slip__th" aria-hidden="true"><span>Antal</span><span>Det er med</span></div>
        <ul class="ws-slip__list">
          ${SLIP.map(([q, t, d], i) => `<li data-reveal="${i + 2}" style="--i:${i + 2}"><span class="ws-slip__q">${q}<span class="sr-only"> ×</span></span><span class="ws-slip__t"><b>${esc(t)}</b><small>${esc(d)}</small></span><span class="check" aria-hidden="true">✓</span></li>`).join('\n          ')}
        </ul>
        <div class="ws-slip__sum"><span>I alt<small>Engangsbeløb · ekskl. moms</small></span><b>${kr(P.base)}</b></div>
        <i class="ws-slip__code" aria-hidden="true"></i>
      </div></div>
    </section>`;

  /* ---------------- How it goes: a track-and-trace line ---------------- */

  const STOPS = [
    ['Vi taler sammen', 'Om dine produkter, din stil, og hvad shoppen skal kunne. Du får en fast pris.'],
    ['Vi bygger shoppen', 'Tema, sider, betaling, fragt og dine produkter. Du kan følge med undervejs.'],
    ['Du tester', 'Du prøver at handle i din egen shop, før den går live.'],
    ['Du sælger', 'Shoppen går live på dit eget domæne, og vi viser dig, hvordan du passer den.']
  ];
  // The parcel that travels along the line
  const VAN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5z"/><path d="m4 7.5 8 3.5 8-3.5M12 11v9M8 5.8l8 3.6"/></svg>';
  const saadan = `<section id="saadan" class="ws-tt show--webshop" data-sec="saadan">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title"><div class="kicker">Sådan foregår det</div><h2 class="h2">Fra snak til salg.<br><span class="dim">Følg med hele vejen.</span></h2></div>
        <p class="sec-head__lead">Du får en fast pris og en tidsplan, før vi går i gang.</p>
      </div>
      <div class="ws-tt__line" data-reveal="1">
        <div class="ws-tt__road" aria-hidden="true"><i class="ws-tt__van">${VAN}</i></div>
        <ol>${STOPS.map(([t, d], i) => `<li style="--d:${(0.2 + i * 0.85).toFixed(2)}s">${i < STOPS.length - 1 ? '<i aria-hidden="true"></i>' : ''}<b>${esc(t)}</b><span>${esc(d)}</span></li>`).join('')}</ol>
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
    lead: 'Vi bygger din webshop på Shopify, klar til at sælge med betaling, fragt og alt det juridiske på plads. Træk i beregneren, og se prisen på din egen shop.',
    floats: [`${P.included} produkter med`, 'Kort og MobilePay', 'Shopify Partner ↗'], ring: 'WEBSHOP • SHOPIFY • BETALING • FRAGT •',
    cta: 'Få en fast pris', more: ['Beregn din pris', '#beregner']
  }).replace(`<span data-underline>${esc(mark)}</span>`, `<span data-underline><span data-count>${fmt(P.base)}</span> kr.</span>`);

  return {
    slug: 'webshop', path: 'services/webshop/index.html', p,
    main: [
      top,
      beregner,
      pris,
      saadan,
      faq(faqs),
      contact({ h2: 'Klar til at sælge online?', lead: 'Fortæl os om dine produkter, og hvad shoppen skal kunne. Vi svarer inden for 24 timer med en fast pris.', base: 'Webshop', value: P.base, placeholder: 'Hvad sælger du, og har du en webshop i dag?' })
    ]
  };
}
