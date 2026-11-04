// Builds the front page (index.html) and the service pages (services/<slug>/index.html) from data.mjs,
// with the same sections, classes and scripts as /services/hjemmesider (the old front page).
// It also refreshes the list of services at the bottom of /services/hjemmesider.
//
//   node scripts/services/build.mjs
//
// Edit the copy in data.mjs, never the generated HTML: it is overwritten on the next build.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, services, pages, front } from './data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const V = { css: '20261104a', js: '20261104a' };
const GENERATED = '<!-- Genereret af scripts/services/build.mjs ud fra scripts/services/data.mjs. Ret der, ikke her. -->';

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ld = o => JSON.stringify(o, null, 2).replace(/</g, '\\u003c');
const pad = n => String(n).padStart(2, '0');
const url = slug => slug ? `${SITE}/services/${slug}` : `${SITE}/`;

/* ------------------------------------------------------------------ */
/* Shared pieces (copied 1:1 from the old front page)                  */
/* ------------------------------------------------------------------ */

const LOADER_WORD = `<div class="loader__word"><span class="loader__icon"><img src="/assets/logo-icon-inverse.svg" alt="" width="64" height="64"></span>${'webleads.'.split('').map((c, i) => `<span style="transition-delay:${((i + 1) * 0.06).toFixed(2)}s">${c}</span>`).join('')}</div>`;

const TRUST = `<!-- Review badges. Fill in the real score, count and profile link; a badge without a score stays hidden. -->
        <div class="trust" data-reveal="5" data-trust hidden>
          <a class="trust__item trust__item--google" data-review data-rating="4.9" data-reviews="29" href="" target="_blank" rel="noopener" data-event="Hero: Google-anmeldelser" hidden>
            <svg class="trust__logo" width="28" height="28" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            <span class="trust__txt"><span class="trust__top"><b data-score></b><span class="trust__stars trust__stars--google" data-stars aria-hidden="true"></span></span><span class="trust__sub">Google · <span data-num></span> anmeldelser</span></span>
          </a>
          <a class="trust__item trust__item--tp" data-review data-rating="4.5" data-reviews="10" href="" target="_blank" rel="noopener" data-event="Hero: Trustpilot-anmeldelser" hidden>
            <svg class="trust__logo" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true"><path fill="#00b67a" d="M12 1.5l2.68 8.25h8.67l-7.01 5.1 2.68 8.25L12 18l-7.02 5.1 2.68-8.25-7.01-5.1h8.67z"/><path fill="#005128" d="M16.1 14.7l-.6-1.86L12 18z"/></svg>
            <span class="trust__txt"><span class="trust__top"><b class="trust__tpname">Trustpilot</b><span class="trust__stars trust__stars--tp" data-stars aria-hidden="true"></span></span><span class="trust__sub">TrustScore <b data-score></b> · <span data-num></span> anmeldelser</span></span>
          </a>
        </div>`;

const TEAM = `<section id="teamet" class="team" data-sec="teamet">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title">
          <div class="kicker">Teamet</div>
          <h2 class="h2">Dem, du taler med.<br><span class="dim">Er dem, der laver det.</span></h2>
        </div>
        <p class="sec-head__lead">Ingen mellemled. Du har direkte kontakt til den, der bygger din side eller kører dine annoncer.</p>
      </div>
      <div class="team__grid">
        <button type="button" class="member" data-reveal="0" data-modal="team-0">
          <span class="member__photo" data-tilt><span class="ph"><span class="ph__glyph">A</span><span class="ph__tag">Kommer snart</span></span></span>
          <span class="member__info"><span class="member__role">Hjemmesider</span><span class="member__name">Alexander</span><span class="member__desc">Designer og bygger din hjemmeside.</span></span>
        </button>
        <button type="button" class="member" data-reveal="1" data-modal="team-1">
          <span class="member__photo" data-tilt><span class="ph"><span class="ph__glyph">M</span><span class="ph__tag">Kommer snart</span></span></span>
          <span class="member__info"><span class="member__role">Google Ads</span><span class="member__name">Malthe</span><span class="member__desc">Skaffer dig kunder fra Google med annoncer og SEO.</span></span>
        </button>
        <button type="button" class="member" data-reveal="2" data-modal="team-2">
          <span class="member__photo" data-tilt><span class="ph"><span class="ph__glyph">A</span><span class="ph__tag">Kommer snart</span></span></span>
          <span class="member__info"><span class="member__role">Meta Ads</span><span class="member__name">Anna</span><span class="member__desc">Skaffer dig kunder fra Facebook og Instagram.</span></span>
        </button>
        <button type="button" class="member" data-reveal="3" data-modal="team-3">
          <span class="member__photo" data-tilt><span class="ph"><span class="ph__glyph">M</span><span class="ph__tag">Kommer snart</span></span></span>
          <span class="member__info"><span class="member__role">IT-udvikling</span><span class="member__name">Mikkel</span><span class="member__desc">Bygger interne systemer og automations.</span></span>
        </button>
      </div>
    </section>`;

const TRADES = `<section class="trades" data-trades data-sec="fag">
      <div class="trades__label kicker" data-reveal="0">Til alle servicefag</div>
      <div class="track" data-track aria-hidden="true"></div>
      <div class="track track--outline" data-track2 aria-hidden="true"></div>
      <p class="sr-only">Frisør, tømrer, rengøring, fysioterapeut, elektriker, revisor, klinik, VVS, personlig træner og maler.</p>
    </section>`;

const PIT = `<section class="pit-sec" data-sec="alt-under-et-tag">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title">
          <div class="kicker">Alt under ét tag</div>
          <h2 class="h2">Alt, vi kan hjælpe med.<br><span class="dim">Kast rundt. Klik for at læse mere.</span></h2>
        </div>
        <button type="button" class="shake" data-shake data-burst>Ryst dem ↻</button>
      </div>
      <div class="pit" data-pit></div>
    </section>`;

const WM = `<section class="wm" data-wm aria-hidden="true" data-sec="bund">
      <div class="wm__word">${'webleads.'.split('').map(c => `<span data-wl>${c}</span>`).join('')}</div>
    </section>`;

const FOOTER = `<footer class="footer">
    <span>© 2026 Webleads</span><a href="https://www.instagram.com/webleads.dk/" target="_blank" rel="noopener" data-event="Footer: Instagram">Instagram</a><a href="/privatliv">Privatlivspolitik</a><a href="/privatliv#meta" data-consent-open>Cookies</a><span>CVR 45737632</span>
  </footer>`;

const MODAL = `<div class="modal" data-modal-root hidden role="dialog" aria-modal="true" aria-labelledby="m-title">
  <div class="modal__box" data-modal-box>
    <button type="button" class="modal__close" data-modal-close aria-label="Luk">✕</button>
    <div class="modal__scroll" data-modal-scroll></div>
  </div>
</div>`;

// Every service, above the footer on every page (also on /services/hjemmesider, see the end)
export const sitemap = current => `<!-- sitemap:start (fra scripts/services/build.mjs) -->
  <nav class="sitemap" aria-label="Alle services"><b>Services</b>${services.map(s => `<a href="/services/${s.slug}"${s.slug === current ? ' aria-current="page"' : ''} data-event="Bund: ${esc(s.t)}">${esc(s.t)}</a>`).join('')}</nav>
  <!-- sitemap:end -->`;

/* ------------------------------------------------------------------ */
/* Sections                                                             */
/* ------------------------------------------------------------------ */

function head(p) {
  return `<!DOCTYPE html>
<html lang="da" data-page="${p.pageType}">
<head>
${GENERATED}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">${p.redirect ? `
<script>
  // Old links to the website offer (/#pris, /#tilvalg …) now live on /services/hjemmesider
  if (/^#(saadan|pris|tilvalg|video)$/.test(location.hash)) location.replace('/services/hjemmesider' + location.search + location.hash);
</script>` : ''}
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.description)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="author" content="Webleads">
<meta name="theme-color" content="#fbfaf8">
<!-- Share links (Facebook, LinkedIn, Messenger, SMS, Slack, X) -->
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="da_DK">
<meta property="og:url" content="${p.url}">
<meta property="og:site_name" content="Webleads">
<meta property="og:image" content="${SITE}${p.og}">
<meta property="og:image:secure_url" content="${SITE}${p.og}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(p.ogAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${SITE}${p.og}">
<meta name="twitter:image:alt" content="${esc(p.ogAlt)}">
<link rel="canonical" href="${p.url}">
<link rel="alternate" hreflang="da-DK" href="${p.url}">
<!-- Icons: browser tab, Google results, iPhone home screen, Android -->
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/assets/logo-icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<!-- Structured data for Google -->
<script type="application/ld+json">
${ld(p.ld)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/main.css?v=${V.css}">
<link rel="stylesheet" href="/assets/css/bestil.css?v=3">
<script>
  // Turn on the motion layer before first paint so revealed content never flashes,
  // and skip the intro curtain when it has already been shown on this visit.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion');
  try { if (sessionStorage.getItem('wl-intro')) document.documentElement.classList.add('intro-seen'); } catch (e) {}
</script>
<script type="module" src="/assets/js/main.js?v=${V.js}"></script>
</head>`;
}

function top(p) {
  return `<div class="loader" data-loader aria-hidden="true">
  ${LOADER_WORD}
  <div class="loader__trust trust" data-loader-trust hidden></div>
  <div class="loader__count" data-lc>000</div>
  <div class="loader__tag">${esc(p.tag)}</div>
</div>
<div class="page">
  <a href="#top" class="totop" data-sec="til-toppen" data-totop aria-label="Til toppen" data-burst>
    <svg viewBox="0 0 60 60" aria-hidden="true"><circle class="totop__track" cx="30" cy="30" r="27"></circle><circle class="totop__ring" data-totop-ring cx="30" cy="30" r="27"></circle></svg>
    <span aria-hidden="true">↑</span>
  </a>
  <!-- Contact button: a pre-filled text message on phones, a pre-filled e-mail elsewhere (href set in main.js) -->
  <a href="mailto:hej@webleads.dk" class="ping" data-sec="flydende-knap" data-ping data-phone="+4541826799" data-email="hej@webleads.dk" data-subject="${esc(p.subject)}" data-msg="${esc(p.msg)}">
    <svg class="ping__mail" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>
    <svg class="ping__sms" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-4.5 3.5V17H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/></svg>
    <span data-ping-label>Skriv til os</span>
  </a>
  <div class="progress" data-bar></div>
  <div class="orb" data-orb aria-hidden="true"></div>

  <header class="nav" data-nav>
    <div class="nav__in">
      <a href="${p.home ? '#top' : '/'}" class="logo" aria-label="${p.home ? 'Webleads, til toppen' : 'Webleads, til forsiden'}"><img class="logo__icon" src="/assets/logo-icon.svg" alt="" width="24" height="24"><span>webleads<span class="logo__dot">.</span></span></a>
      <nav class="nav__links" aria-label="Hovedmenu">
        ${p.nav.map(([t, h]) => `<a href="${h}" data-roll>${esc(t)}</a>`).join('\n        ')}
        <a href="#kontakt" class="nav__cta" data-magnet data-roll data-event="Menu: Kontakt">Kontakt</a>
      </nav>
    </div>
  </header>`;
}

function h1(h) {
  const w = (t, cls = '') => `<span class="w"><span data-word${cls ? ` class="${cls}"` : ''}>${t}</span></span>`;
  return `<h1>
          ${h.a.map(t => w(esc(t))).join('\n          ')}
          ${w(`<span class="hot" data-scramble style="display:inline-block">${esc(h.hot)}</span>`)}
          <br>
          ${h.dim.split(' ').map(t => w(esc(t), 'dim')).join('\n          ')}
          ${w(`<span data-underline>${esc(h.mark)}</span>`, 'hot')}
        </h1>`;
}

function hero(p) {
  const [fa, fb, fc] = p.floats;
  return `<section id="top" class="hero" data-sec="hero">
      <canvas class="hero__dots" data-dots aria-hidden="true"></canvas>
      <div class="float float--a" data-float="1.4" data-rot="7" aria-hidden="true">${esc(fa)}</div>
      <div class="float float--b" data-float="0.8" data-rot="-6" aria-hidden="true"><i></i>${esc(fb)}</div>
      <div class="float float--c" data-float="2" data-rot="-9" aria-hidden="true">${esc(fc)}</div>
      <div class="float float--d" data-float="1.1" data-rot="0" aria-hidden="true">
        <svg data-spin viewBox="0 0 200 200"><defs><path id="vcirc" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"></path></defs><circle cx="100" cy="100" r="99" fill="#fbfaf8" stroke="#111" stroke-width="1.5"></circle><text><textPath href="#vcirc" textLength="486" lengthAdjust="spacing">${esc(p.ring)}</textPath></text><circle cx="100" cy="100" r="22" fill="#e0552b"></circle></svg>
      </div>
      <!-- Review badges floating on desktop; filled from the badges under the buttons -->
      <div class="float float--g" data-float="1.6" data-rot="5" data-float-review="google" hidden></div>
      <div class="float float--t" data-float="0.9" data-rot="-4" data-float-review="tp" hidden></div>
      <div class="hero__in" data-hero>
        <div class="hero__badge" data-reveal="0"><i></i>${p.badge}<span class="hero__flip" data-flip data-words="${esc(p.words.join('|'))}">${esc(p.words[0])}</span></div>
        ${h1(p.h1)}
        <p class="hero__lead" data-reveal="3">${esc(p.lead)}</p>
        <div class="hero__ctas" data-reveal="4">
          <a href="#kontakt" class="btn btn--dark" data-magnet data-burst data-roll data-event="Hero: ${esc(p.cta)}">${esc(p.cta)}</a>
          <a href="${p.more[1]}" class="hero__more" data-event="Hero: ${esc(p.more[0])}">${esc(p.more[0])} <span>↓</span></a>
        </div>
        ${TRUST}
      </div>
    </section>`;
}

function card(s, i) {
  return `<div class="addon-slot">
            <div class="addon" data-tilt data-addon="${esc(s.t)}" data-value="${s.value}">
              <div class="glare" data-glare></div>
              <span class="addon__n">${pad(i + 1)}</span>
              <div class="addon__head"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>
              <div class="addon__price">${esc(s.price)}</div>
              <ul>${s.ex.map(x => `<li><span class="check" aria-hidden="true">✓</span>${esc(x)}</li>`).join('')}</ul>
              <div class="addon__actions">
                <button type="button" class="addon__toggle" data-toggle="${esc(s.t)}" data-burst aria-pressed="false">+ Tilføj</button>
                <a class="addon__more" href="/services/${s.slug}" aria-label="Læs mere om ${esc(s.t)}" data-event="Services: ${esc(s.t)}">Læs mere →</a>
              </div>
            </div>
          </div>`;
}

function track({ id, kicker, h2, lead, list }) {
  return `<section id="${id}" class="addons" data-hs data-sec="${id}">
      <div class="addons__sticky" data-hsticky>
        <div class="wrap sec-head" style="width:100%">
          <div class="sec-head__title">
            <div class="kicker">${esc(kicker)}</div>
            <h2 class="h2">${h2}</h2>
          </div>
          <p class="sec-head__lead">${esc(lead)}</p>
        </div>
        <div class="addons__wrap" data-hwrap>
          <div class="addons__track" data-htrack>
          ${list.map(card).join('\n          ')}
          </div>
        </div>
        <div class="wrap addons__meter" style="width:100%">
          <span data-hnum>01</span>
          <div class="addons__bar"><div data-hbar></div></div>
          <span>${pad(list.length)}</span>
        </div>
      </div>
    </section>`;
}

function cards({ id, sec, kicker, h2, list }) {
  const n = list.length;
  return `<section${id ? ` id="${id}"` : ''} class="promise" data-sec="${sec}">
      <div class="promise__head" data-reveal="0">
        <div class="kicker">${esc(kicker)}</div>
        <h2 class="h2">${h2}</h2>
      </div>
      <div class="promise__list">
        ${list.map(([t, d, g], i) => `<div class="pcard" data-card>
          <div class="pcard__body"><span class="pcard__n">${pad(i + 1)} / ${pad(n)}</span><h3>${esc(/[.!?]$/.test(t) ? t : t + ".")}</h3><p>${esc(d)}</p></div>
          <span class="pcard__g" aria-hidden="true">${esc(g)}</span>
        </div>`).join('\n        ')}
      </div>
    </section>`;
}

function price(p) {
  const a = p.price;
  return `<section id="pris" class="price-sec" data-sec="pris">
      <div class="spot price" data-reveal="0" data-spot>
        <div class="price__main">
          <div class="kicker">${esc(p.name)}</div>
          <h2>${esc(p.priceH2[0])}<br><span>${esc(p.priceH2[1])}</span></h2>
          ${a ? `<div class="price__amount">${a.pre ? `<span>${esc(a.pre)}</span>` : ''}<span class="odo" data-odo>${esc(a.amount)}</span><span>${esc(a.post)}</span></div>
          <div class="price__vat">${esc(a.note)}</div>
          ` : ''}<p class="price__lead">${esc(p.priceLead)}</p>
          <div class="price__cta"><a href="#kontakt" class="btn btn--accent" data-magnet data-burst data-event="Pris: Få en fast pris">Få en fast pris →</a></div>
        </div>
        <div class="incl">
          ${p.items.map(([t, d]) => `<div class="incl__item"><span class="check" aria-hidden="true">✓</span><span class="incl__txt"><b>${esc(t)}</b><span>${esc(d)}</span></span></div>`).join('\n          ')}
        </div>
      </div>
    </section>`;
}

function faq(list) {
  return `<section id="faq" class="faq" data-sec="faq">
      <h2 class="h2" data-reveal="0">Spørgsmål?</h2>
      <div class="faq__list" data-faq>
        ${list.map(([q, a], i) => `<div class="faq__item${i === 0 ? ' is-open' : ''}" data-reveal="${i}">
          <button type="button" class="faq__q" aria-expanded="${i === 0}" aria-controls="faq-${i}">${esc(q)}<span class="faq__icon" aria-hidden="true">+</span></button>
          <div class="faq__a" id="faq-${i}"><div><p>${esc(a)}</p></div></div>
        </div>`).join('\n        ')}
      </div>
    </section>`;
}

function contact({ h2 = 'Klar til flere kunder?', lead, base, value, placeholder }) {
  return `<section id="kontakt" class="contact-sec" data-sec="kontakt">
      <div class="spot contact" data-reveal="0" data-spot>
        <div class="contact__info">
          <h2>${esc(h2)}</h2>
          <p class="contact__lead">${esc(lead)}</p>
          <div class="contact__links">
            <a href="mailto:hej@webleads.dk" data-event="Kontakt: E-mail">hej@webleads.dk</a>
            <a href="/bestil" data-bestil="kontakt" data-event="Kontakt: Bestil udkast">Se et gratis udkast til din hjemmeside →</a>
          </div>
        </div>
        <form class="form" data-form data-base="${esc(base)}" data-value="${value}" novalidate>
          <div class="form__chosen" data-chosen hidden>Du har valgt: <strong data-chosen-val></strong></div>
          <input type="hidden" name="valgt" data-chosen-input>
          <label class="sr-only" for="f-navn">Dit navn</label>
          <input class="field" id="f-navn" name="navn" required placeholder="Dit navn" autocomplete="name">
          <label class="sr-only" for="f-email">Din e-mail</label>
          <input class="field" id="f-email" name="email" required type="email" placeholder="Din e-mail" autocomplete="email">
          <label class="sr-only" for="f-besked">Besked</label>
          <textarea class="field" id="f-besked" name="besked" rows="4" placeholder="${esc(placeholder)}"></textarea>
          <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
          <p class="form__error" data-form-error hidden></p>
          <div style="display:flex"><button type="submit" class="form__submit" data-magnet data-burst>Send besked →</button></div>
          <p class="form__note">Vi bruger dine oplysninger til at svare dig. Har du sagt ja til Meta Pixel, sender vi også din e-mail krypteret til Meta. Læs vores <a href="/privatliv">privatlivspolitik</a>.</p>
        </form>
        <div class="thanks" data-thanks hidden>
          <div class="thanks__h">Tak! 🎉</div>
          <p>Vi kontakter dig inden for 24 timer.</p>
          <p data-thanks-mail hidden>Du har fået en kvittering på mail.</p>
        </div>
      </div>
    </section>`;
}

const page = (p, main) => `${head(p)}
<body>
${top(p)}

  <main>
    ${main.join('\n\n    ')}

    ${WM}
  </main>

  ${sitemap(p.slug)}
  ${FOOTER}
</div>

${MODAL}
</body>
</html>
`;

/* ------------------------------------------------------------------ */
/* Structured data                                                      */
/* ------------------------------------------------------------------ */

const ORG = { '@type': 'ProfessionalService', '@id': `${SITE}/#virksomhed`, name: 'Webleads', url: `${SITE}/` };
const faqLd = (u, list) => ({ '@type': 'FAQPage', '@id': `${u}#faq`, mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const priceSpec = s => {
  if (!s.value) return null;
  if (/time/.test(s.price)) return { '@type': 'UnitPriceSpecification', price: String(s.value), priceCurrency: 'DKK', unitCode: 'HUR', unitText: 'time', valueAddedTaxIncluded: false };
  const monthly = /md\./.test(s.price);
  return monthly
    ? { '@type': 'UnitPriceSpecification', minPrice: String(s.value), priceCurrency: 'DKK', unitText: 'måned', valueAddedTaxIncluded: false }
    : { '@type': 'PriceSpecification', minPrice: String(s.value), priceCurrency: 'DKK', valueAddedTaxIncluded: false };
};

function frontLd() {
  const u = url();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        ...ORG,
        logo: `${SITE}/assets/icon-512.png`,
        image: `${SITE}/assets/og/forside.png`,
        description: front.description,
        email: 'hej@webleads.dk',
        vatID: 'DK45737632',
        taxID: '45737632',
        areaServed: { '@type': 'Country', name: 'Danmark' },
        address: { '@type': 'PostalAddress', addressCountry: 'DK' },
        priceRange: 'Fra 995 kr.',
        sameAs: ['https://www.instagram.com/webleads.dk/'],
        knowsAbout: [...services.map(s => s.t), 'Interne systemer'],
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Services',
          itemListElement: services.map(s => ({
            '@type': 'Offer',
            itemOffered: { '@type': 'Service', name: s.t, description: s.d, url: url(s.slug) },
            ...(priceSpec(s) ? { priceSpecification: priceSpec(s) } : {})
          }))
        }
      },
      { '@type': 'WebSite', '@id': `${SITE}/#website`, url: u, name: 'Webleads', inLanguage: 'da-DK', publisher: { '@id': `${SITE}/#virksomhed` } },
      { '@type': 'WebPage', '@id': `${SITE}/#forside`, url: u, name: front.title, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#virksomhed` }, primaryImageOfPage: `${SITE}/assets/og/forside.png`, inLanguage: 'da-DK' },
      faqLd(u, front.faqs)
    ]
  };
}

function serviceLd(p, s) {
  const u = url(p.slug);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      ORG,
      {
        '@type': 'Service',
        '@id': `${u}#service`,
        name: p.name,
        serviceType: p.serviceType,
        description: p.description,
        url: u,
        provider: { '@id': `${SITE}/#virksomhed` },
        areaServed: { '@type': 'Country', name: 'Danmark' },
        ...(priceSpec(s) ? { offers: { '@type': 'Offer', priceSpecification: priceSpec(s) } } : {})
      },
      { '@type': 'WebPage', '@id': `${u}#side`, url: u, name: p.title, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${u}#service` }, breadcrumb: { '@id': `${u}#sti` }, primaryImageOfPage: `${SITE}/assets/og/${p.slug}.png`, inLanguage: 'da-DK' },
      {
        '@type': 'BreadcrumbList',
        '@id': `${u}#sti`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Forside', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE}/#services` },
          { '@type': 'ListItem', position: 3, name: p.name, item: u }
        ]
      },
      faqLd(u, p.faqs)
    ]
  };
}

/* ------------------------------------------------------------------ */
/* Pages                                                                */
/* ------------------------------------------------------------------ */

const out = (rel, html) => { const f = join(ROOT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); console.log('skrev', rel); };

// Front page
out('index.html', page({
  pageType: 'forside', redirect: true, home: true, slug: '',
  title: front.title, description: front.description, url: url(), og: '/assets/og/forside.png', ogAlt: front.ogAlt, ld: frontLd(),
  tag: 'Flere kunder online', subject: 'Møde med Webleads',
  msg: 'Hej, jeg var lige inde på webleads.dk og jeg vil gerne høre mere. Kan vi opsætte et møde?',
  nav: [['Services', '#services'], ['Hjemmesider', '/services/hjemmesider'], ['Teamet', '#teamet'], ['Spørgsmål', '#faq']]
}, [
  hero({ ...front, badge: 'Til', cta: 'Få en fast pris', more: ['Se alle services', '#services'] }),
  track({ id: 'services', kicker: 'Services', h2: 'Det, vi kan.<br><span class="dim">Vælg det, du har brug for.</span>', lead: 'Tilføj det, du er interesseret i, så giver vi dig en fast pris. Eller læs mere om hver enkelt.', list: services }),
  cards({ sec: 'loefte', kicker: 'Vores løfte', h2: 'Fire ting.<br><span class="dim">Hver eneste gang.</span>', list: front.promises }),
  TRADES,
  PIT,
  TEAM,
  faq(front.faqs),
  contact({ lead: 'Skriv til os, og fortæl hvad du har brug for. Vi svarer inden for 24 timer med en fast pris.', base: '', value: 0, placeholder: 'Hvad laver din virksomhed, og hvad kan vi hjælpe med?' })
]));

// Service pages
for (const p of pages) {
  const s = services.find(x => x.slug === p.slug);
  if (!s) throw new Error('Mangler kort i services: ' + p.slug);
  out(`services/${p.slug}/index.html`, page({
    pageType: `service_${p.slug}`, slug: p.slug,
    title: `${p.name} · ${p.short} · Webleads`, description: p.description, url: url(p.slug), og: `/assets/og/${p.slug}.png`, ogAlt: `Webleads: ${p.name}. ${p.short}.`, ld: serviceLd(p, s),
    tag: `${p.name}${s.value ? ' ' + s.price : ''}`, subject: `Møde om ${p.name}`,
    msg: `Hej, jeg var lige inde på webleads.dk og vil gerne høre mere om ${p.name}. Kan vi opsætte et møde?`,
    nav: [['Services', '/#services'], ['Det får du', '#pris'], ['Sådan foregår det', '#saadan'], ['Spørgsmål', '#faq']]
  }, [
    hero({ ...p, badge: `${esc(p.name)} · til`, cta: 'Få en fast pris', more: ['Se hvad du får', '#pris'] }),
    price(p),
    cards({ id: 'saadan', sec: 'saadan', kicker: 'Sådan foregår det', h2: `${p.steps.length === 3 ? 'Tre' : 'Fire'} trin.<br><span class="dim">Så kører det.</span>`, list: p.steps }),
    track({ id: 'services', kicker: 'Andre services', h2: 'Vil du have mere?<br><span class="dim">Vi kan det hele.</span>', lead: `Tilføj det, du også er interesseret i, så får du én samlet pris sammen med ${p.name}.`, list: services.filter(x => x.slug !== p.slug) }),
    faq(p.faqs),
    contact({ lead: p.contact, base: p.name, value: s.value, placeholder: p.placeholder })
  ]));
}

// The list of services at the bottom of /services/hjemmesider
{
  const f = join(ROOT, 'services/hjemmesider/index.html');
  const html = readFileSync(f, 'utf8');
  const next = html.replace(/<!-- sitemap:start[\s\S]*?<!-- sitemap:end -->/, sitemap('hjemmesider'));
  if (next === html && !html.includes('sitemap:start')) throw new Error('services/hjemmesider/index.html mangler <!-- sitemap:start --> … <!-- sitemap:end -->');
  writeFileSync(f, next);
  console.log('opdaterede services/hjemmesider/index.html (listen over services)');
}
