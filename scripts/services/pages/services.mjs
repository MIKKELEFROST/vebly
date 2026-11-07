// /services: every service on one page, three on a line, and nothing else (Mikkel, 7 Nov 2026).
// Build: node scripts/services/build.mjs services
//
// The cards come from data.mjs (services, groups for the order and the label, short is not used here).
// With a chosen segment the order follows segments.order (assets/js/segment.js, data-seg-sort), like
// everywhere else. Styles: assets/css/alle-services.css. The mega menu links here ("Se alle … services").
export default function ({ lib, data }) {
  const { esc, ORG, GICON, V } = lib;
  const { services, groups, SITE } = data;
  const groupOf = Object.fromEntries(groups.flatMap(g => g.slugs.map(slug => [slug, g])));
  const list = groups.flatMap(g => g.slugs).map(slug => services.find(s => s.slug === slug));

  const u = `${SITE}/services`;
  const title = 'Alle services · Webleads';
  const description = `Alle ${services.length} services fra Webleads på én side: hjemmesider, webshops, annoncer, SEO, sociale medier, video, AI og automation.`;

  const cardHtml = (s, i) => {
    const g = groupOf[s.slug];
    return `<a class="alls__c" href="/services/${s.slug}" data-slug="${s.slug}" data-reveal="${i % 3}" data-event="Alle services: ${esc(s.t)}">
          <span class="alls__g"><span class="alls__ic" aria-hidden="true"><svg viewBox="0 0 24 24">${GICON[g.icon]}</svg></span>${esc(g.name)}</span>
          <h2>${esc(s.t)}</h2>
          <p>${esc(s.d)}</p>
          <span class="alls__foot"><b>${esc(s.price)}</b><i>Læs mere <span aria-hidden="true">→</span></i></span>
        </a>`;
  };

  return {
    slug: 'services', path: 'services/index.html',
    p: {
      pageType: 'alle-services', slug: 'services',
      title, description, url: u, og: '/assets/og/forside.png', ogAlt: 'Webleads: alle services på én side.',
      tag: 'Alle services', subject: 'Spørgsmål til Webleads',
      msg: 'Hej, jeg har kigget på jeres services på webleads.dk og vil gerne høre mere.',
      nav: [['Services', '/services'], ['Hjemmesider', '/services/hjemmesider'], ['Resultater', '/resultater']],
      kontakt: '/#kontakt',
      css: [`/assets/css/alle-services.css?v=${V.css}`],
      ld: {
        '@context': 'https://schema.org',
        '@graph': [
          ORG,
          {
            '@type': 'CollectionPage', '@id': `${u}#side`, url: u, name: title, description, inLanguage: 'da-DK',
            isPartOf: { '@id': `${SITE}/#website` },
            mainEntity: {
              '@type': 'ItemList', numberOfItems: list.length,
              itemListElement: list.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.t, url: `${SITE}/services/${s.slug}` }))
            }
          }
        ]
      }
    },
    main: [
      `<section id="top" class="alls" data-sec="alle-services">
      <div class="wrap">
        <div class="alls__head" data-reveal="0">
          <div class="kicker">Services</div>
          <h1 class="h2">Alle services.<br><span class="dim">${services.length} måder at få flere kunder på.</span></h1>
        </div>
        <div class="alls__grid" data-seg-sort>
        ${list.map(cardHtml).join('\n        ')}
        </div>
      </div>
    </section>`
    ]
  };
}
