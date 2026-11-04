// Builds the front page (index.html) and the service pages (services/<slug>/index.html) from data.mjs,
// with the same sections, classes and scripts as /services/hjemmesider (the old front page).
// It also builds the extra pages in pages/*.mjs and refreshes the list of services at the bottom of
// /services/hjemmesider.
//
//   node scripts/services/build.mjs            everything
//   node scripts/services/build.mjs <slug>     one page: forside, a service slug or an extra page's slug
//
// Each service page can have a showcase (an example of the service, right under the hero):
//   scripts/services/showcase/<slug>.html   the section (id="eksempel")
//   assets/css/show/<slug>.css              its styles (all selectors start with .show--<slug>)
//   assets/js/show/<slug>.js                its behaviour (an ES module)
// The front page gets the partner scroll when scripts/services/partnere.mjs lists real customers
// (PARTNERE_EKSEMPEL=1 shows the example list, for a local look only: never build the live page with it).
//
// Edit the copy in data.mjs, never the generated HTML: it is overwritten on the next build.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as lib from './lib.mjs';
import * as data from './data.mjs';

const { ROOT, V, esc, url, page, hero, track, cards, price, faq, contact, frontLd, serviceLd, sitemap, TRADES, PIT, TEAM } = lib;
const { services, pages, front } = data;
const only = process.argv[2] || '';
const want = slug => !only || only === slug;

const exists = rel => existsSync(join(ROOT, rel));
const read = rel => readFileSync(join(ROOT, rel), 'utf8');
const out = (rel, html) => { const f = join(ROOT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); console.log('skrev', rel); };

// The files of one showcase (or of the partner scroll), when they are there
const showcase = name => ({
  html: exists(`scripts/services/showcase/${name}.html`) ? read(`scripts/services/showcase/${name}.html`).trim() : '',
  css: exists(`assets/css/show/${name}.css`) ? [`/assets/css/show/${name}.css?v=${V.css}`] : [],
  js: exists(`assets/js/show/${name}.js`) ? [`/assets/js/show/${name}.js?v=${V.js}`] : []
});

/* ------------------------------------------------------------------ */
/* Front page                                                           */
/* ------------------------------------------------------------------ */

if (want('forside')) {
  // Partner scroll: only with real customers (see partnere.mjs)
  let partner = { html: '', css: [], js: [] };
  if (exists('scripts/services/front/partnere.mjs') && exists('scripts/services/partnere.mjs')) {
    const { partnerSection } = await import('./front/partnere.mjs');
    const { partnere = [], eksempler = [] } = await import('./partnere.mjs');
    const demo = process.env.PARTNERE_EKSEMPEL === '1';
    const list = demo ? eksempler : partnere;
    if (list.length) partner = { ...showcase('partnere'), html: partnerSection({ list, eksempel: demo }) };
    if (demo) console.log('OBS: forsiden er bygget med eksempel-partnere (PARTNERE_EKSEMPEL=1). Byg igen uden, før den sendes live.');
  }
  out('index.html', page({
    pageType: 'forside', redirect: true, home: true, slug: '',
    title: front.title, description: front.description, url: url(), og: '/assets/og/forside.png', ogAlt: front.ogAlt, ld: frontLd(),
    tag: 'Flere kunder online', subject: 'Møde med Webleads',
    msg: 'Hej, jeg var lige inde på webleads.dk og jeg vil gerne høre mere. Kan vi opsætte et møde?',
    nav: [['Services', '#services'], ['Hjemmesider', '/services/hjemmesider'], ['Teamet', '#teamet'], ['Spørgsmål', '#faq']],
    css: partner.css, js: partner.js
  }, [
    hero({ ...front, badge: 'Til', cta: 'Få en fast pris', more: ['Se alle services', '#services'] }),
    partner.html,
    track({ id: 'services', kicker: 'Services', h2: 'Det, vi kan.<br><span class="dim">Vælg det, du har brug for.</span>', lead: 'Tilføj det, du er interesseret i, så giver vi dig en fast pris. Eller læs mere om hver enkelt.', list: services }),
    cards({ sec: 'loefte', kicker: 'Vores løfte', h2: 'Fire ting.<br><span class="dim">Hver eneste gang.</span>', list: front.promises }),
    TRADES,
    PIT,
    TEAM,
    faq(front.faqs),
    contact({ lead: 'Skriv til os, og fortæl hvad du har brug for. Vi svarer inden for 24 timer med en fast pris.', base: '', value: 0, placeholder: 'Hvad laver din virksomhed, og hvad kan vi hjælpe med?' })
  ].filter(Boolean)));
}

/* ------------------------------------------------------------------ */
/* Service pages                                                        */
/* ------------------------------------------------------------------ */

for (const p of pages) {
  if (!want(p.slug)) continue;
  const s = services.find(x => x.slug === p.slug);
  if (!s) throw new Error('Mangler kort i services: ' + p.slug);
  const sc = showcase(p.slug);
  out(`services/${p.slug}/index.html`, page({
    pageType: `service_${p.slug}`, slug: p.slug,
    title: `${p.name} · ${p.short} · Webleads`, description: p.description, url: url(p.slug), og: `/assets/og/${p.slug}.png`, ogAlt: `Webleads: ${p.name}. ${p.short}.`, ld: serviceLd(p, s),
    tag: `${p.name}${s.value ? ' ' + s.price : ''}`, subject: `Møde om ${p.name}`,
    msg: `Hej, jeg var lige inde på webleads.dk og vil gerne høre mere om ${p.name}. Kan vi opsætte et møde?`,
    nav: [['Services', '/#services'], ['Det får du', '#pris'], ['Sådan foregår det', '#saadan'], ['Spørgsmål', '#faq']],
    css: sc.css, js: sc.js
  }, [
    hero({ ...p, badge: `${esc(p.name)} · til`, cta: 'Få en fast pris', more: sc.html ? ['Se et eksempel', '#eksempel'] : ['Se hvad du får', '#pris'] }),
    sc.html,
    price(p),
    cards({ id: 'saadan', sec: 'saadan', kicker: 'Sådan foregår det', h2: `${p.steps.length === 3 ? 'Tre' : 'Fire'} trin.<br><span class="dim">Så kører det.</span>`, list: p.steps }),
    track({ id: 'services', kicker: 'Andre services', h2: 'Vil du have mere?<br><span class="dim">Vi kan det hele.</span>', lead: `Tilføj det, du også er interesseret i, så får du én samlet pris sammen med ${p.name}.`, list: services.filter(x => x.slug !== p.slug) }),
    faq(p.faqs),
    contact({ lead: p.contact, base: p.name, value: s.value, placeholder: p.placeholder })
  ].filter(Boolean)));
}

/* ------------------------------------------------------------------ */
/* Extra pages: scripts/services/pages/*.mjs                            */
/* ------------------------------------------------------------------ */
// pages/<slug>.mjs: the default export gets { lib, data, showcase, exists, read } and returns
// { slug, path: '<slug>/index.html', p: { …page settings… }, main: [ …sections… ] }.
// A draft page sets p.robots to 'noindex, nofollow' and p.bar to a short note shown on the page.
// With a slug on the command line only that module is loaded, so a half-done page never stops another.

const extra = join(ROOT, 'scripts/services/pages');
if (existsSync(extra)) {
  for (const f of readdirSync(extra).filter(f => f.endsWith('.mjs') && (!only || f === `${only}.mjs`)).sort()) {
    const mod = await import(pathToFileURL(join(extra, f)).href);
    for (const d of [].concat(await mod.default({ lib, data, showcase, exists, read }))) {
      if (!d || !want(d.slug)) continue;
      out(d.path, page(d.p, d.main.filter(Boolean)));
    }
  }
}

/* ------------------------------------------------------------------ */
/* The list of services at the bottom of /services/hjemmesider          */
/* ------------------------------------------------------------------ */

if (want('hjemmesider')) {
  const f = join(ROOT, 'services/hjemmesider/index.html');
  const html = readFileSync(f, 'utf8');
  const next = html.replace(/<!-- sitemap:start[\s\S]*?<!-- sitemap:end -->/, sitemap('hjemmesider'));
  if (next === html && !html.includes('sitemap:start')) throw new Error('services/hjemmesider/index.html mangler <!-- sitemap:start --> … <!-- sitemap:end -->');
  writeFileSync(f, next);
  console.log('opdaterede services/hjemmesider/index.html (listen over services)');
}
