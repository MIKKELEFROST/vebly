// The building blocks of the generated pages: head, menu, hero, sections, contact and footer, in the
// same markup and classes as /services/hjemmesider (the old front page). Used by build.mjs and by the
// extra pages in scripts/services/pages/*.mjs, so every page keeps the same DNA.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE, services, pages, front, segments } from './data.mjs';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const V = { css: '20261105a', js: '20261105a' };
export const GENERATED = '<!-- Genereret af scripts/services/build.mjs (indhold i scripts/services/). Ret der, ikke her. -->';

/* What the visitor sells: the tabs above the menu (data.mjs → segments, assets/js/segment.js) */
// Runs in <head> before the page is drawn, so the right copy is shown at once: a link (?for=webshop),
// an earlier choice, or a guess from the first page of a visit. window.__wlSeg tells segment.js to log it.
const SEG_GUESS = Object.fromEntries(Object.entries(segments.guess).flatMap(([seg, slugs]) => slugs.map(s => [s, seg])));
export const SEG_HEAD = `<script>
  // What the visitor sells (assets/js/segment.js): a link with ?for=, an earlier choice, or a guess from the first page of a visit
  (function () {
    var K = 'wl-seg', S = { webshop: 'webshop', ydelser: 'ydelser' }, G = ${JSON.stringify(SEG_GUESS)}, s = null, first = false;
    try { s = JSON.parse(localStorage.getItem(K) || 'null'); } catch (e) {}
    try { first = !sessionStorage.getItem('wl-seg-v'); sessionStorage.setItem('wl-seg-v', '1'); } catch (e) {}
    var f = (new URLSearchParams(location.search).get('for') || '').toLowerCase();
    if (S[f]) { if (!s || s.seg !== S[f] || s.src !== 'link') window.__wlSeg = 'link'; s = { seg: S[f], src: 'link' }; }
    else if (first && (!s || s.src === 'side')) {
      var m = location.pathname.toLowerCase().match(/^\\/services\\/([a-z0-9-]+)/), g = m && G[m[1]];
      if (g && (!s || s.seg !== g)) { s = { seg: g, src: 'side' }; window.__wlSeg = 'side'; }
    }
    if (s && S[s.seg]) { document.documentElement.setAttribute('data-seg', s.seg); try { localStorage.setItem(K, JSON.stringify(s)); } catch (e) {} }
  })();
</script>`;
export const SEG_BAR = `<div class="segbar" data-seg-bar data-order-ydelser="${segments.order.ydelser.join(',')}" data-order-webshop="${segments.order.webshop.join(',')}">
      <div class="segbar__in">
        <span class="segbar__q" id="seg-q">${segments.tabs.q.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))}</span>
        <div class="segbar__tabs" role="group" aria-labelledby="seg-q">
          <button type="button" class="segbar__tab" data-seg-set="ydelser" aria-pressed="false">${segments.tabs.ydelser}</button>
          <button type="button" class="segbar__tab" data-seg-set="webshop" aria-pressed="false">${segments.tabs.webshop}</button>
        </div>
      </div>
    </div>`;

export const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const ld = o => JSON.stringify(o, null, 2).replace(/</g, '\\u003c');
export const pad = n => String(n).padStart(2, '0');
export const url = slug => slug ? `${SITE}/services/${slug}` : `${SITE}/`;

/* ------------------------------------------------------------------ */
/* Shared pieces (copied 1:1 from the old front page)                  */
/* ------------------------------------------------------------------ */

export const LOADER_WORD = `<div class="loader__word"><span class="loader__icon"><img src="/assets/logo-icon-inverse.svg" alt="" width="64" height="64"></span>${'webleads.'.split('').map((c, i) => `<span style="transition-delay:${((i + 1) * 0.06).toFixed(2)}s">${c}</span>`).join('')}</div>`;

export const TRUST = `<!-- Review badges. Fill in the real score, count and profile link; a badge without a score stays hidden. -->
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

export const TEAM = `<section id="teamet" class="team" data-sec="teamet">
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

export const TRADES = `<section class="trades" data-trades data-sec="fag">
      <div class="trades__label kicker" data-reveal="0">Til alle servicefag</div>
      <div class="track" data-track aria-hidden="true"></div>
      <div class="track track--outline" data-track2 aria-hidden="true"></div>
      <p class="sr-only">Frisør, tømrer, rengøring, fysioterapeut, elektriker, revisor, klinik, VVS, personlig træner og maler.</p>
    </section>`;

export const PIT = `<section class="pit-sec" data-sec="alt-under-et-tag">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title">
          <div class="kicker">Alt under ét tag</div>
          <h2 class="h2">Alt, vi kan hjælpe med.<br><span class="dim">Kast rundt. Klik for at læse mere.</span></h2>
        </div>
        <button type="button" class="shake" data-shake data-burst>Ryst dem ↻</button>
      </div>
      <div class="pit" data-pit></div>
    </section>`;

export const WM = `<section class="wm" data-wm aria-hidden="true" data-sec="bund">
      <div class="wm__word">${'webleads.'.split('').map(c => `<span data-wl>${c}</span>`).join('')}</div>
    </section>`;

export const FOOTER = `<footer class="footer">
    <span>© 2026 Webleads</span><a href="https://www.instagram.com/webleads.dk/" target="_blank" rel="noopener" data-event="Footer: Instagram">Instagram</a><a href="/privatliv">Privatlivspolitik</a><a href="/privatliv#meta" data-consent-open>Cookies</a><span>CVR 45737632</span>
  </footer>`;

export const MODAL = `<div class="modal" data-modal-root hidden role="dialog" aria-modal="true" aria-labelledby="m-title">
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

export function head(p) {
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
<meta name="robots" content="${p.robots || 'index, follow, max-image-preview:large, max-snippet:-1'}">
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
<link rel="stylesheet" href="/assets/css/bestil.css?v=3">${(p.css || []).map(h => `
<link rel="stylesheet" href="${h}">`).join('')}
<script>
  // Turn on the motion layer before first paint so revealed content never flashes,
  // and skip the intro curtain when it has already been shown on this visit.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion');
  try { if (sessionStorage.getItem('wl-intro')) document.documentElement.classList.add('intro-seen'); } catch (e) {}
</script>
${SEG_HEAD}
<script type="module" src="/assets/js/main.js?v=${V.js}"></script>${(p.js || []).map(s => `
<script type="module" src="${s}"></script>`).join('')}
</head>`;
}

export function top(p) {
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
  <div class="orb" data-orb aria-hidden="true"></div>${p.bar ? `
  <div class="draft-bar" role="note">${esc(p.bar)}</div>` : ''}

  <header class="nav" data-nav>
    ${SEG_BAR}
    <div class="nav__in">
      <a href="${p.home ? '#top' : '/'}" class="logo" aria-label="${p.home ? 'Webleads, til toppen' : 'Webleads, til forsiden'}"><img class="logo__icon" src="/assets/logo-icon.svg" alt="" width="24" height="24"><span>webleads<span class="logo__dot">.</span></span></a>
      <nav class="nav__links" aria-label="Hovedmenu">
        ${p.nav.map(([t, h]) => `<a href="${h}" data-roll>${esc(t)}</a>`).join('\n        ')}
        <a href="#kontakt" class="nav__cta" data-magnet data-roll data-event="Menu: Kontakt">Kontakt</a>
      </nav>
    </div>
  </header>`;
}

export function h1(h) {
  const w = (t, cls = '') => `<span class="w"><span data-word${cls ? ` class="${cls}"` : ''}>${t}</span></span>`;
  return `<h1>
          ${h.a.map(t => w(esc(t))).join('\n          ')}
          ${w(`<span class="hot" data-scramble style="display:inline-block">${esc(h.hot)}</span>`)}
          <br>
          ${h.dim.split(' ').map(t => w(esc(t), 'dim')).join('\n          ')}
          ${w(`<span data-underline>${esc(h.mark)}</span>`, 'hot')}
        </h1>`;
}

export function hero(p) {
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
        <div class="hero__badge" data-reveal="0"><i></i>${p.badge}<span class="hero__flip" data-flip data-words="${esc(p.words.join('|'))}"${p.seg ? Object.entries(p.seg).map(([k, v]) => ` data-words-${k}="${esc(v.words.join('|'))}"`).join('') : ''}>${esc(p.words[0])}</span></div>
        ${h1(p.h1)}
        <p class="hero__lead" data-reveal="3">${p.seg ? `<span data-seg-only="neutral">${esc(p.lead)}</span>${Object.entries(p.seg).map(([k, v]) => `<span data-seg-only="${k}">${esc(v.lead)}</span>`).join('')}` : esc(p.lead)}</p>
        <div class="hero__ctas" data-reveal="4">
          <a href="#kontakt" class="btn btn--dark" data-magnet data-burst data-roll data-event="Hero: ${esc(p.cta)}">${esc(p.cta)}</a>
          <a href="${p.more[1]}" class="hero__more" data-event="Hero: ${esc(p.more[0])}">${esc(p.more[0])} <span>↓</span></a>
        </div>
        ${TRUST}
      </div>
    </section>`;
}

export function card(s, i) {
  return `<div class="addon-slot" data-slug="${s.slug}">
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

export function track({ id, kicker, h2, lead, list }) {
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
          <div class="addons__track" data-htrack data-seg-sort>
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

export function cards({ id, sec, kicker, h2, list }) {
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

export function price(p) {
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

// An optional third element on a question, [href, text], adds a link after the answer (not in the structured data)
const faqLink = l => l ? ` <a class="faq__more" href="${esc(l[0])}" data-event="Spørgsmål: ${esc(l[1])}">${esc(l[1])} →</a>` : '';

export function faq(list) {
  return `<section id="faq" class="faq" data-sec="faq">
      <h2 class="h2" data-reveal="0">Spørgsmål?</h2>
      <div class="faq__list" data-faq>
        ${list.map(([q, a, l], i) => `<div class="faq__item${i === 0 ? ' is-open' : ''}" data-reveal="${i}">
          <button type="button" class="faq__q" aria-expanded="${i === 0}" aria-controls="faq-${i}">${esc(q)}<span class="faq__icon" aria-hidden="true">+</span></button>
          <div class="faq__a" id="faq-${i}"><div><p>${esc(a)}${faqLink(l)}</p></div></div>
        </div>`).join('\n        ')}
      </div>
    </section>`;
}

export function contact({ h2 = 'Klar til flere kunder?', lead, base, value, placeholder }) {
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

/* ------------------------------------------------------------------ */
/* More sections, so the service pages are not built the same way       */
/* Each page puts them in its own order (layout in data.mjs). Styles:   */
/* assets/css/sections.css, behaviour: assets/js/sections.js.           */
/* ------------------------------------------------------------------ */

// Small inline icons (our own drawings, stroke or fill in currentColor)
const ICON = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>',
  spark: '<svg viewBox="0 0 24 24" aria-hidden="true" class="is-fill"><path d="M12 2.5c.7 5 2.6 7.1 7.6 7.9-5 .8-6.9 2.9-7.6 7.9-.7-5-2.6-7.1-7.6-7.9 5-.8 6.9-2.9 7.6-7.9z"/><path d="M19 15.5c.3 2 1 2.8 3 3.1-2 .3-2.7 1.1-3 3.1-.3-2-1-2.8-3-3.1 2-.3 2.7-1.1 3-3.1z"/></svg>',
  cursor: '<svg viewBox="0 0 24 24" aria-hidden="true" class="is-fill"><path d="M5.5 3.2 19 10.1l-6 1.7-2.5 5.9z"/></svg>'
};
const UNDERLINE = '<svg class="sx-u__l" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M4 20 C 60 6, 120 4, 170 12 S 260 26, 296 8"/></svg>';
const lead = t => t ? `<p class="sec-head__lead">${esc(t)}</p>` : '';
const h2 = ([a, b], dim = 'dim') => `<h2 class="h2">${esc(a)}<br><span class="${dim}">${esc(b)}</span></h2>`;
const cap = t => t.charAt(0).toLocaleUpperCase('da-DK') + t.slice(1);

// statement: one big sentence. In the text *…* is orange, _…_ is grey, {…} is a small pill
// (the icon in pill: search, spark, cursor or mail) and | breaks the line on wider screens.
// The words light up one by one when the sentence comes into view; the last orange word is underlined.
export function statement(p) {
  const st = p.statement;
  // 1: words with their colour; a pill keeps the punctuation right after it
  let hot = false, dim = false;
  const words = st.text.match(/\{[^}]*\}\S*|\||\S+/g).map(w => {
    if (w === '|') return { br: true };
    if (w.startsWith('{')) { const [, t, rest] = w.match(/^\{([^}]*)\}(.*)$/); return { pill: t, rest }; }
    let t = w;
    if (t.startsWith('*')) { hot = true; t = t.slice(1); }
    if (t.startsWith('_')) { dim = true; t = t.slice(1); }
    const word = { t: t.replace(/[*_]([.,!?]*)$/, '$1'), cls: hot ? 'hot' : dim ? 'dim' : '' };
    if (/\*[.,!?]*$/.test(t)) hot = false;
    if (/_[.,!?]*$/.test(t)) dim = false;
    return word;
  });
  // 2: the last orange word gets the hand-drawn line
  const last = words.map(w => w.cls === 'hot').lastIndexOf(true);
  let i = 0;
  const html = words.map((w, j) => {
    if (w.br) return '<br class="sx-br">';
    if (w.pill !== undefined) {
      const typed = st.pill === 'search';
      return `<span class="sx-w sx-w--pill" style="--i:${i++}"><span class="sx-pill sx-pill--${st.pill || 'plain'}">${ICON[st.pill] || ''}<span class="sx-pill__t"${typed ? ' data-stm-type aria-hidden="true"' : ''}>${esc(w.pill)}</span>${typed ? `<span class="sr-only">${esc(w.pill)}</span><i class="sx-pill__caret" aria-hidden="true"></i>` : ''}</span>${w.rest ? `<b>${esc(w.rest)}</b>` : ''}</span>`;
    }
    const u = j === last;
    return `<span class="sx-w${w.cls ? ' ' + w.cls : ''}${u ? ' sx-u' : ''}" style="--i:${i++}">${esc(w.t)}${u ? UNDERLINE : ''}</span>`;
  }).join(' ').replace(/ <br class="sx-br"> /g, ' <br class="sx-br">');
  return `<section class="sx sx-stm" data-sec="pointe" data-stm style="--n:${i}">
      ${st.kicker ? `<div class="kicker sx-stm__k" data-reveal="0">${esc(st.kicker)}</div>` : ''}
      <h2 class="sx-stm__text">${html}</h2>
      ${st.sub ? `<p class="sx-stm__sub" data-reveal="2">${esc(st.sub)}</p>` : ''}
    </section>`;
}

// compare: "Uden …" and "Med …" side by side, row by row. On a phone a switch shows one at a time.
export function compare(p) {
  const c = p.compare, n = c.rows.length;
  const cell = (side, t, row, i) => `<div class="sx-vs__cell is-${side}" style="grid-row:${row};--i:${i}"><span class="sx-vs__mk" aria-hidden="true">${side === 'med' ? '✓' : '✕'}</span><span><span class="sr-only">${esc(side === 'med' ? c.med : c.uden)}: </span>${esc(t)}</span></div>`;
  return `<section id="forskel" class="sx sx-vs" data-sec="uden-med" data-vs>
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title">
          <div class="kicker">${esc(c.kicker || 'Forskellen')}</div>
          ${h2(c.h2)}
        </div>
        <div class="sx-vs__side">
          ${lead(c.lead)}
          <div class="seg sx-vs__seg" role="group" aria-label="Vis ${esc(c.uden.toLocaleLowerCase('da-DK'))} eller ${esc(c.med.toLocaleLowerCase('da-DK'))}">
            <button type="button" data-vs-go="uden" aria-pressed="false">${esc(c.uden)}</button>
            <button type="button" data-vs-go="med" class="is-on" aria-pressed="true">${esc(c.med)}</button>
          </div>
        </div>
      </div>
      <div class="sx-vs__board" data-vs-board data-show="med" style="grid-template-rows:repeat(${n + 1}, auto)">
        <div class="sx-vs__bg is-uden" aria-hidden="true"></div>
        <div class="sx-vs__bg is-med" aria-hidden="true"></div>
        <div class="sx-vs__head is-uden" style="grid-row:1;--i:0"><span class="sx-vs__mk" aria-hidden="true">✕</span>${esc(c.uden)}</div>
        <div class="sx-vs__head is-med" style="grid-row:1;--i:1"><img src="/assets/logo-icon.svg" alt="" width="28" height="28">${esc(c.med)}</div>
        ${c.rows.map(([u, m], k) => cell('uden', u, k + 2, 2 * k + 2) + '\n        ' + cell('med', m, k + 2, 2 * k + 3)).join('\n        ')}
      </div>
    </section>`;
}

// facts: three or four big, true facts about the offer. A number at the start counts up (main.js).
export function facts(p) {
  const f = p.facts;
  const big = t => esc(t).replace(/^(\d[\d.]*)/, '<span data-count>$1</span>');
  return `<section class="sx sx-facts" data-sec="fakta" data-facts>
      <h2 class="kicker sx-facts__k" data-reveal="0">${esc(f.kicker || 'Kort fortalt')}</h2>
      <dl class="sx-facts__list" style="--n:${f.items.length}">
        ${f.items.map(([l, b, t], i) => `<div class="sx-fact" style="--i:${i}">
          <dt class="sx-fact__lbl">${esc(l)}</dt>
          <dd class="sx-fact__big"><span>${big(b)}</span></dd>
          <dd class="sx-fact__txt">${esc(t)}</dd>
        </div>`).join('\n        ')}
      </dl>
    </section>`;
}

// The price's small print split into lines: "Pr. kanal · hver ekstra kanal … · ekskl. moms"
const noteLines = a => a ? a.note.split(' · ').filter(x => !/moms/.test(x)).map(cap) : [];
const priceCta = (where, cls = 'btn btn--dark') => `<a href="#kontakt" class="${cls}" data-magnet data-burst data-event="${where}: Få en fast pris">Få en fast pris →</a>`;

// receipt: the price drawn as a receipt that prints when it comes into view. Every item is "inkl.",
// the total rolls (data-odo in main.js). Without a price the total says "Fast pris efter en snak".
export function receipt(p) {
  const a = p.price, r = p.receipt || {};
  const unit = !a ? 'Fast pris efter en snak' : /md\./.test(a.post) ? 'Fast pris pr. måned' : /time/.test(a.post) ? 'Timepris' : 'Fast pris';
  const notes = [...noteLines(a), ...(r.notes || [])];
  return `<section id="pris" class="sx sx-rcpt" data-sec="pris" data-rcpt>
      <div class="sx-rcpt__text" data-reveal="0">
        <div class="kicker">${esc(r.kicker || 'Det får du')}</div>
        ${h2(r.h2 || p.priceH2)}
      </div>
      <div class="sx-rcpt__stage">
        <div class="sx-rcpt__slot" aria-hidden="true"></div>
        <div class="sx-rcpt__feed">
          <div class="sx-rcpt__paper">
            <div class="sx-rcpt__brand" aria-hidden="true">webleads<span>.</span></div>
            <div class="sx-rcpt__meta"><b>${esc(p.name)}</b><span>${esc(unit)}</span></div>
            <ul class="sx-rcpt__items">
              ${p.items.map(([t]) => `<li><span>${esc(t)}</span><i aria-hidden="true"></i><b>inkl.</b></li>`).join('\n              ')}
            </ul>
            <div class="sx-rcpt__total">
              <span class="sx-rcpt__lbl">I alt</span>
              ${a ? `<span class="sx-rcpt__sum">${a.pre ? `<small>${esc(a.pre)}</small>` : ''}<span class="odo" data-odo>${esc(a.amount)}</span><small>${esc(a.post)}</small></span>` : '<span class="sx-rcpt__sum sx-rcpt__sum--txt">Fast pris efter en snak</span>'}
            </div>
            <div class="sx-rcpt__vat">${a ? 'Ekskl. moms' : 'Svar inden for 24 timer'}</div>
            ${notes.length ? `<ul class="sx-rcpt__notes">${notes.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
            <div class="sx-rcpt__bar" aria-hidden="true"></div>
            <div class="sx-rcpt__bye" aria-hidden="true">Tak, fordi du kiggede med</div>
          </div>
        </div>
      </div>
      <div class="sx-rcpt__after" data-reveal="1">
        <p class="sx-rcpt__lead">${esc(p.priceLead)}</p>
        ${priceCta('Pris')}
      </div>
    </section>`;
}

// band: a light price band. The big number on the left, four of the included items as chips (the rest
// opens under them), a button.
export function band(p) {
  const a = p.price, b = p.band || {};
  const pick = b.chips ? b.chips.map(t => p.items.find(([x]) => x === t) || [t, '']) : p.items.slice(0, 4);
  const rest = p.items.length - pick.length;
  // Without a number the big text already says "Fast pris efter en snak", so the heading says the rest
  const title = b.h2 || (a ? p.priceH2 : ['Du kender prisen,', 'før vi går i gang.']);
  return `<section id="pris" class="sx sx-band" data-sec="pris" data-band>
      <div class="sx-band__box" data-reveal="0">
        <div class="sx-band__price">
          <div class="kicker">${esc(p.name)}</div>${b.sticker ? `
          <span class="sx-band__sticker">${esc(b.sticker)}</span>` : ''}
          ${a ? `<div class="sx-band__amount">${a.pre ? `<span>${esc(a.pre)}</span>` : ''}<span class="odo" data-odo>${esc(a.amount)}</span><span>${esc(a.post)}</span></div>
          <div class="sx-band__note">${esc(a.note)}</div>` : `<div class="sx-band__amount sx-band__amount--txt">Fast pris<span>efter en snak</span></div>`}
        </div>
        <div class="sx-band__body">
          <h2 class="sx-band__h">${esc(title[0])} <span>${esc(title[1])}</span></h2>
          <p class="sx-band__lead">${esc(p.priceLead)}</p>
          <ul class="sx-band__chips">
            ${pick.map(([t], i) => `<li class="sx-chip" style="--i:${i}"><span class="check" aria-hidden="true">✓</span>${esc(t)}</li>`).join('\n            ')}${rest > 0 ? `
            <li style="--i:${pick.length}"><button type="button" class="sx-chip sx-chip--more" data-band-more aria-expanded="false" aria-controls="sx-band-all">Se alt, der er med <span aria-hidden="true">+</span></button></li>` : ''}
          </ul>
          ${rest > 0 ? `<div class="sx-band__all" id="sx-band-all" data-band-all><div><ul>
            ${p.items.map(([t, d]) => `<li><span class="check" aria-hidden="true">✓</span><span><b>${esc(t)}</b>${esc(d)}</span></li>`).join('\n            ')}
          </ul></div></div>` : ''}
          <div class="sx-band__cta">${priceCta('Pris')}</div>
        </div>
      </div>
    </section>`;
}

// timeline: the steps on a line that draws itself, the nodes light up as it passes (vertical on phones)
export function timeline(p) {
  const f = p.flow || {};
  return `<section id="saadan" class="sx sx-tl" data-sec="saadan" data-tl>
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title">
          <div class="kicker">${esc(f.kicker || 'Sådan foregår det')}</div>
          ${h2(f.h2 || ['Fra første snak.', 'Til det kører.'])}
        </div>
        ${lead(f.lead)}
      </div>
      <div class="sx-tl__track" style="--n:${p.steps.length}">
        <div class="sx-tl__rail" aria-hidden="true"><i data-tl-fill></i></div>
        <ol class="sx-tl__list">
          ${p.steps.map(([t, d, g], i) => `<li class="sx-tl__step" style="--i:${i}"><span class="sx-tl__node" aria-hidden="true"><span>${esc(g)}</span></span><h3>${esc(/[.!?]$/.test(t) ? t : t + '.')}</h3><p>${esc(d)}</p></li>`).join('\n          ')}
        </ol>
        <span class="sx-tl__end" aria-hidden="true"><i></i>${esc(f.end || 'Så kører det')}</span>
      </div>
    </section>`;
}

// marquee: words for the service (searches, kinds of e-mails …) on two bands that move (sections.js)
export function marquee(p) {
  const m = p.marquee, half = Math.ceil(m.words.length / 2);
  const pill = (t, i) => `<span class="sx-q${i % 3 === 1 ? ' is-hot' : ''}">${ICON[m.icon] || ''}${esc(t)}</span>`;
  const row = (list, dir, k) => `<div class="sx-mq__row" data-mq-row data-dir="${dir}"><div class="sx-mq__set">${list.map((t, i) => pill(t, i + k)).join('')}</div></div>`;
  return `<section class="sx-mq" data-sec="${esc(m.sec || 'ord')}" data-mq>
      <div class="sx-mq__head" data-reveal="0">
        <h2 class="sx-mq__h">${esc(m.h2[0])} <span>${esc(m.h2[1])}</span></h2>
        <p class="sx-mq__lead">${m.tag ? '<span class="tag-eks">Eksempel</span>' : ''}${esc(m.lead || '')}</p>
      </div>
      <div class="sx-mq__rows" aria-hidden="true">
        ${row(m.words.slice(0, half), -1, 0)}
        ${row(m.words.slice(half), 1, 1)}
      </div>
      <p class="sr-only">${esc(m.words.join(', '))}.</p>
    </section>`;
}

// faqSplit: the questions on the right; on the left a big heading and a nudge to ask us directly.
// The same data-faq markup as faq(), so main.js opens and closes the answers.
export function faqSplit(list, o = {}) {
  return `<section id="faq" class="sx sx-fq" data-sec="faq">
      <div class="sx-fq__side" data-reveal="0">
        <div class="kicker">${esc(o.kicker || 'Spørgsmål og svar')}</div>
        ${h2(o.h2 || ['Godt spørgsmål.', 'Her er svarene.'])}
        <p class="sx-fq__nudge">${esc(o.nudge || 'Står dit spørgsmål ikke her? Skriv til os, så svarer vi inden for 24 timer.')}</p>
        <a href="#kontakt" class="btn btn--dark sx-fq__cta" data-magnet data-burst data-event="Spørgsmål: Stil dit spørgsmål">Stil dit spørgsmål →</a>
        <span class="sx-fq__glyph" aria-hidden="true">?</span>
      </div>
      <div class="faq__list sx-fq__list" data-faq>
        ${list.map(([q, a, l], i) => `<div class="faq__item${i === 0 ? ' is-open' : ''}" data-reveal="${i}">
          <button type="button" class="faq__q" aria-expanded="${i === 0}" aria-controls="faq-${i}">${esc(q)}<span class="faq__icon" aria-hidden="true">+</span></button>
          <div class="faq__a" id="faq-${i}"><div><p>${esc(a)}${faqLink(l)}</p></div></div>
        </div>`).join('\n        ')}
      </div>
    </section>`;
}

// grid: "Andre services" as small cards in a grid (instead of the sideways track). Same data-addon and
// data-toggle as the track, so main.js adds them to the contact form.
export function grid({ id, kicker, h2: title, lead: text, list }) {
  return `<section id="${id}" class="sx sx-grid" data-sec="${id}" data-grid>
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title">
          <div class="kicker">${esc(kicker)}</div>
          <h2 class="h2">${title}</h2>
        </div>
        <div class="sx-grid__side">
          ${lead(text)}
          <a href="#kontakt" class="sx-grid__sum" data-grid-sum hidden><span>I din forespørgsel</span><b data-grid-sum-txt></b><i aria-hidden="true">→</i></a>
        </div>
      </div>
      <div class="sx-grid__list" data-seg-sort>
        ${list.map((s, i) => `<div class="sx-gc" data-slug="${s.slug}" data-addon="${esc(s.t)}" data-value="${s.value}" data-reveal="${i % 5}">
          <div class="sx-gc__top"><h3>${esc(s.t)}</h3><span class="sx-gc__price">${esc(s.price)}</span></div>
          <p>${esc(s.d)}</p>
          <div class="sx-gc__actions">
            <button type="button" class="sx-gc__add" data-toggle="${esc(s.t)}" data-burst aria-pressed="false">+ Tilføj</button>
            <a class="sx-gc__more" href="/services/${s.slug}" aria-label="Læs mere om ${esc(s.t)}" data-event="Services: ${esc(s.t)}">Læs mere →</a>
          </div>
        </div>`).join('\n        ')}
      </div>
    </section>`;
}

export const page = (p, main) => `${head(p)}
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

export const ORG = { '@type': 'ProfessionalService', '@id': `${SITE}/#virksomhed`, name: 'Webleads', url: `${SITE}/` };
export const faqLd = (u, list) => ({ '@type': 'FAQPage', '@id': `${u}#faq`, mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
export const priceSpec = s => {
  if (!s.value) return null;
  if (/time/.test(s.price)) return { '@type': 'UnitPriceSpecification', price: String(s.value), priceCurrency: 'DKK', unitCode: 'HUR', unitText: 'time', valueAddedTaxIncluded: false };
  const monthly = /md\./.test(s.price);
  return monthly
    ? { '@type': 'UnitPriceSpecification', minPrice: String(s.value), priceCurrency: 'DKK', unitText: 'måned', valueAddedTaxIncluded: false }
    : { '@type': 'PriceSpecification', minPrice: String(s.value), priceCurrency: 'DKK', valueAddedTaxIncluded: false };
};

export function frontLd() {
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

export function serviceLd(p, s) {
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
