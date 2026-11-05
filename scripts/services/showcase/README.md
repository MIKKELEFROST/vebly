# Showcases: an example of the service on each service page

Each service page gets one section that shows the service the way the customer meets it in real life.
The Google Shopping page shows shopping cards, the SEO page shows a business profile, the Meta page shows a
story ad, and so on. It must be recognisable at first glance and built in the Webleads DNA, playful and
polished.

## The rule the owner set: every page is different

- The pinned "Sådan virker det" build demo on `/services/hjemmesider` (a numbered list of steps, 01 02 03…,
  that lights up beside a sticky stage, with the "Prøv med din egen virksomhed" box above it) is the
  signature of that page only. Never use it anywhere else: no numbered step list beside a mockup, no sticky
  or pinned stage, no `.egen` box.
- No two showcases may share a format. Each page has its own (see the table). The pages around the
  showcases also differ from page to page (order and kinds of sections), so the site never feels uniform.

| Page | Format | What the visitor sees |
| --- | --- | --- |
| google-shopping-ads | Live carousel and feed editor | The "Sponsoreret · Shopping" carousel you can drag, your card in it, and a product feed row that rewrites your card |
| google-css | Calculator | The same kind of Shopping card: "Af Google" becomes "Af Webleads Shopping" (Webleads is a CSS), the click price rolls down, a budget slider shows what it means |
| seo | Annotated anatomy | A Google business profile in the middle, labels with thin leader lines pointing at its parts |
| google-ads | Live search loop | A big search field that types local searches; the sponsored text ad on top rewrites itself to each query |
| meta-ads | Stories player | A phone playing a tap-through story ad, next to a panel that shows who sees it |
| geo | Chat with question chips | An AI chat: pick a question, the answer streams in and recommends the example business |
| ai | Night time-lapse | A night scene where a clock runs from evening to morning while a website chatbot answers and books |
| automations | Flow machine | A flow of connected nodes across the width; a pulse runs through it and each node shows its small result |
| email-marketing | Lock screen and inbox | Notifications stack on a phone; tap one to open the e-mail; envelopes show the automatic flow |
| cro | A/B test | Two versions side by side; visitors stream in, counters tick, B wins, a heatmap can be switched on |
| video | Editing timeline | A video editor of our own drawing: a preview playing a short animated example video above a timeline (video, text and music tracks) with a running playhead; tabs switch Reklamevideo / Explainer / Motion graphics, format chips reframe the preview 9:16 · 1:1 · 16:9 |
| app-udvikling | Twin devices | The same example app on an iPhone-like and an Android-like phone side by side (our own drawings); a tap on one plays on both; the app icon installs itself when the section comes into view; booking ends with a push notification |
| interne-systemer | Drag pipeline | A CRM in a browser window: lead cards you drag (or move with buttons) from Ny henvendelse to Tilbud sendt to Vundet; the dashboard tiles above count up as cards land |
| resultater (page) | Case spread | Big metric tiles that count up, the growth line drawing itself, a mini site; then the filterable gallery |

## Facts for Google mockups (checked 4 Nov 2026)

- Every Shopping ad in Denmark ends with a small link line under shop, price, delivery and rating: »Af Google«
  (or »Af <CSS-navn>« when another CSS placed it, for Webleads »Af Webleads Shopping«). Draw it on Shopping cards.
- Never show free listings or a »populære produkter« block, and leave »Shopping« out of mock tab rows
  (use Alle, Billeder, Videoer, Nyheder): both changed in the EEA in September 2026.
- Google CSS: the facts and the exact wording are in the scratchpad file ws/google-css/FAKTA.md.

## Files (one set per service, nothing else)

```
scripts/services/showcase/<slug>.html   the section: <section id="eksempel" class="show show--<slug>" data-sec="eksempel"> … </section>
assets/css/show/<slug>.css              its styles. Every selector starts with .show--<slug>. No global selectors.
assets/js/show/<slug>.js                its behaviour: an ES module that does nothing unless .show--<slug> is on the page
```

`node scripts/services/build.mjs <slug>` puts the section on the page, links the CSS and JS in the page's
`<head>`, and points the hero's second button ("Se et eksempel ↓") to `#eksempel`. Build again after every
change to the HTML. CSS and JS are read straight from disk.

Do not edit shared files: `assets/css/main.css`, `assets/js/main.js`, `assets/js/content.js`,
`assets/js/analytics.js`, `scripts/services/{data,lib,build}.mjs`, `api/*`, other showcases. If a shared
change is really needed, say so in your result.

## The DNA (keep it)

- Colours: use the variables from `main.css` `:root`: `--bg` #fbfaf8, `--ink` #111, `--accent` #e0552b,
  `--muted` #6b6760, `--faint` #b3aea6, `--line` #ecebe7, `--line-strong` #d9d5ce, `--green` #2f9e5b,
  `--red` #d93025, `--yellow` #f2c14e, `--cream` #f2ede4, `--dark-line` #2a2a2a, `--dark-muted` #a9a39a.
  Inside a mockup of another product (a search page, a feed, an inbox) that product's own neutral greys,
  link blue (#1f45b0 as used in `.serp*`) and greens are fine; the frame around it is Webleads.
- Type: `var(--display)` (Bricolage Grotesque 800, letter-spacing about −0.04em, line-height ~1) for
  headlines and big numbers; `var(--body)` (DM Sans 400/500/700) for everything else.
- Section head, like the other sections (the words and layout of the head may vary):
  ```html
  <div class="sec-head" data-reveal="0">
    <div class="sec-head__title"><div class="kicker">…</div><h2 class="h2">Første linje.<br><span class="dim">Anden linje.</span></h2></div>
    <p class="sec-head__lead">…</p>
  </div>
  ```
- Layout: `max-width: 1200px; margin: 0 auto; padding: 40px 24px 100px` like `.ba-sec`; on phones 20–24px sides.
  A showcase may also be full-bleed when its format asks for it.
- Surfaces: white cards with a 1px `var(--line)` border and 18–32px radius; dark boxes with
  `class="spot" data-spot` (dark background with an orange spotlight that follows the mouse); soft shadows
  like `0 40px 80px -30px rgba(17,17,17,.18)`; pills with radius 999px; the orange used sparingly.
- Motion: physical and playful, started when the section comes into view (IntersectionObserver) or by the
  visitor (typing, dragging, tapping, toggling), with requestAnimationFrame, transform and opacity only.
  Never pin the section and never tie a step list to the scroll position. `html.motion` is set when motion
  is allowed. Without it (reduced motion): the finished state, static, everything readable.
- Do not use the attribute `data-card` inside a showcase: `main.js` gives every `[data-card]` on a page a
  scroll effect that shrinks and darkens it. Use your own name (the CRM showcase uses `data-lead`).
- Free effects from `main.js`: `data-reveal="n"` (fades up when scrolled to; n is the delay step),
  `data-tilt` with a child `data-glare`, `data-magnet`, `data-burst` (confetti on click), `data-spot`,
  `data-roll` (only on links with plain text).
- Global classes you may reuse: `.kicker`, `.h2` (+ `.dim`, `.hot`), `.sec-head*`, `.btn .btn--dark`,
  `.btn .btn--accent`, `.check`, `.seg` (segmented control, `.is-on`), `.browser*` and `.dots3` (browser
  chrome), `.serp*` (search page parts), `.sr-only`. Not `.egen*`.
- Copy: Danish, short and concrete, "du". Like the rest of the site: "Klar på 7 dage." not "Revolutionér
  din forretning".

## Truth rules (never break these)

- Everything inside the mockup is an example. Mark it visibly with the shared tag
  `<span class="tag-eks">Eksempel</span>` (yellow pill from `main.css`; use it as is, do not restyle it).
- Fictional businesses only (default: Nordvik, a carpenter in København; other made-up local names are
  fine). Never real businesses, people, products or reviews.
- No third-party logos, wordmarks or icons (no Google, Meta, Facebook, Instagram, ChatGPT, Gemini, Shopify
  marks). The layout may echo the real thing so it is recognisable, but it is our own drawing, not a copy.
  Neutral UI words like "Sponsoreret", "Annonce", "Shopping", "Kort" are fine, and our own copy may name the
  platform ("Sådan ser din annonce ud på Google").
- Stars, numbers, prices and results inside the mockup are examples. When the visitor puts in their own
  business, show no stars, review counts or results for their business.
- No network requests to other sites: no CDNs, fonts or images from outside. Draw with CSS and inline SVG,
  or use the example photos in `/udkast/_faelles/billeder/<fag>/` (`hero-1`, `hero-2`, `om-1`, `om-2`,
  `projekt-1`…`projekt-3`, as `.webp` 896 × 1120 and `-480.webp` 480 × 600; fag: elektriker, frisoer,
  fysioterapeut, klinik, maler, personlig-traener, rengoering, revisor, toemrer, vvs). Lazy-load them.

## Personalising (where it fits)

Build it into the mockup itself (type in the mockup's own search field, edit the card in place), never as
the `.egen` box. The box on `/services/hjemmesider` saves `{ fag, by, navn }` in `sessionStorage['wl-egen']`
(JSON); you may read it to prefill your example. Defaults: Tømrer, København, Nordvik. Never send what is
typed anywhere.

## Analytics

`import { track } from '/assets/js/analytics.js';` and only:
`track('showcase_step', { showcase: '<slug>', step: n })` once per stage of the animation reached, and
`track('showcase_interact', { showcase: '<slug>', action: 'short-id' })` for clicks. No typed text.

## Quality bar

- Recognisable in one second, beautiful at 1440 × 900 and at 390 × 844 (iPhone 13), no horizontal scroll.
- No console errors, no failed requests. JS and CSS each under ~15 KB.
- Decorative mockups `aria-hidden="true"` with a short `.sr-only` description; real buttons for controls.
- Test: start from the page, scroll through the section, look at the screenshots, fix, repeat.
