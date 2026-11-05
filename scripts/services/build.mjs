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
const { services, pages, front, segments } = data;
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
    hero({ ...front, seg: segments.front, badge: 'Til', cta: 'Få en fast pris', more: ['Se alle services', '#services'] }),
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

// Each page lists its sections after the hero in p.layout (data.mjs); the contact form always comes
// last. Without a layout a page gets the old order. A page has one section of each kind: one price
// (price, receipt or band), one process (cards or timeline, or none), one FAQ (faq or faqSplit) and
// one list of the other services (track or grid). The kinds give the menu and the analytics names.
const DEFAULT_LAYOUT = ['showcase', 'price', 'cards', 'track', 'faq'];
const KIND = {
  showcase: 'eksempel', statement: 'pointe', compare: 'uden-med', facts: 'fakta', marquee: 'ord',
  price: 'pris', receipt: 'pris', band: 'pris', cards: 'saadan', timeline: 'saadan',
  faq: 'faq', faqSplit: 'faq', track: 'services', grid: 'services'
};
const MENU = { eksempel: ['Eksempel', '#eksempel'], pris: ['Det får du', '#pris'], saadan: ['Sådan foregår det', '#saadan'], faq: ['Spørgsmål', '#faq'] };
// These need assets/css/sections.css and assets/js/sections.js
const NEW = new Set(['statement', 'compare', 'facts', 'marquee', 'receipt', 'band', 'timeline', 'faqSplit', 'grid']);

const layoutOf = p => {
  const L = p.layout || DEFAULT_LAYOUT, kinds = L.map(k => KIND[k]);
  L.forEach(k => { if (!KIND[k]) throw new Error(`${p.slug}: ukendt sektion "${k}" i layout (kan være: ${Object.keys(KIND).join(', ')})`); });
  const twice = kinds.find((k, i) => kinds.indexOf(k) !== i);
  if (twice) throw new Error(`${p.slug}: layout har to sektioner af samme slags (${twice})`);
  if (!kinds.includes('pris') || !kinds.includes('faq')) throw new Error(`${p.slug}: layout skal have en pris og et FAQ`);
  return L;
};

const others = p => services.filter(x => x.slug !== p.slug);
const render = {
  showcase: (p, sc) => sc.html,
  statement: p => lib.statement(p),
  compare: p => lib.compare(p),
  facts: p => lib.facts(p),
  marquee: p => lib.marquee(p),
  price: p => price(p),
  receipt: p => lib.receipt(p),
  band: p => lib.band(p),
  cards: p => cards({ id: 'saadan', sec: 'saadan', kicker: 'Sådan foregår det', h2: `${p.steps.length === 3 ? 'Tre' : 'Fire'} trin.<br><span class="dim">Så kører det.</span>`, list: p.steps }),
  timeline: p => lib.timeline(p),
  track: p => track({ id: 'services', kicker: 'Andre services', h2: 'Vil du have mere?<br><span class="dim">Vi kan det hele.</span>', lead: `Tilføj det, du også er interesseret i, så får du én samlet pris sammen med ${p.name}.`, list: others(p) }),
  grid: p => lib.grid({ id: 'services', kicker: 'Andre services', h2: `Mere end ${esc(p.name)}?<br><span class="dim">Sæt det sammen her.</span>`, lead: `Tilføj det, du også er interesseret i, så får du én samlet pris sammen med ${p.name}.`, list: others(p) }),
  faq: p => faq(p.faqs),
  faqSplit: p => lib.faqSplit(p.faqs, p.faqSplit)
};

// Two pages must not open the same way: warn when the first three sections after the hero repeat
{
  const seen = new Map();
  for (const p of pages) {
    const k = layoutOf(p).slice(0, 3).join(' · ');
    if (seen.has(k)) console.warn(`OBS: ${p.slug} og ${seen.get(k)} starter med de samme tre sektioner (${k})`);
    else seen.set(k, p.slug);
  }
}

for (const p of pages) {
  if (!want(p.slug)) continue;
  const s = services.find(x => x.slug === p.slug);
  if (!s) throw new Error('Mangler kort i services: ' + p.slug);
  const sc = showcase(p.slug);
  const L = layoutOf(p).filter(k => k !== 'showcase' || sc.html);
  const own = L.some(k => NEW.has(k));
  // The menu: the sections this page has, in its own order (the old pages keep their old menu)
  const nav = p.layout
    ? [['Services', '/#services'], ...L.map(k => MENU[KIND[k]]).filter(Boolean)]
    : [['Services', '/#services'], ['Det får du', '#pris'], ['Sådan foregår det', '#saadan'], ['Spørgsmål', '#faq']];
  out(`services/${p.slug}/index.html`, page({
    pageType: `service_${p.slug}`, slug: p.slug,
    title: `${p.name} · ${p.short} · Webleads`, description: p.description, url: url(p.slug), og: `/assets/og/${p.slug}.png`, ogAlt: `Webleads: ${p.name}. ${p.short}.`, ld: serviceLd(p, s),
    tag: `${p.name}${s.value ? ' ' + s.price : ''}`, subject: `Møde om ${p.name}`,
    msg: `Hej, jeg var lige inde på webleads.dk og vil gerne høre mere om ${p.name}. Kan vi opsætte et møde?`,
    nav,
    css: [...(own ? [`/assets/css/sections.css?v=${V.css}`] : []), ...sc.css],
    js: [...(own ? [`/assets/js/sections.js?v=${V.js}`] : []), ...sc.js]
  }, [
    hero({ ...p, badge: `${esc(p.name)} · til`, cta: 'Få en fast pris', more: sc.html ? ['Se et eksempel', '#eksempel'] : ['Se hvad du får', '#pris'] }),
    ...L.map(k => render[k](p, sc)),
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
/* /services/hjemmesider: the parts the build keeps in step              */
/* ------------------------------------------------------------------ */

if (want('hjemmesider')) {
  const f = join(ROOT, 'services/hjemmesider/index.html');
  const html = readFileSync(f, 'utf8');
  for (const m of ['sitemap:start', 'seg-head:start', 'seg-bar:start']) if (!html.includes(m)) throw new Error(`services/hjemmesider/index.html mangler <!-- ${m} --> … (se build.mjs)`);
  // The list of services, the segment tabs (lib.SEG_HEAD, lib.SEG_BAR) and the version of the shared CSS and JS
  const next = html
    .replace(/<!-- sitemap:start[\s\S]*?<!-- sitemap:end -->/, sitemap('hjemmesider'))
    .replace(/(<!-- seg-head:start[^>]*-->)[\s\S]*?(<!-- seg-head:end -->)/, (_, a, b) => `${a}\n${lib.SEG_HEAD}\n${b}`)
    .replace(/(<!-- seg-bar:start[^>]*-->)[\s\S]*?(<!-- seg-bar:end -->)/, (_, a, b) => `${a}\n    ${lib.SEG_BAR}\n    ${b}`)
    .replace(/(\/assets\/css\/main\.css\?v=)\w+/, `$1${V.css}`)
    .replace(/(\/assets\/js\/main\.js\?v=)\w+/, `$1${V.js}`);
  writeFileSync(f, next);
  console.log('opdaterede services/hjemmesider/index.html (listen over services, fanerne og versionen)');
}
