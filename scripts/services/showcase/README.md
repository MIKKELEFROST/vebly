# Showcases: an example of the service on each service page

Each service page gets one section right under the hero that shows the service the way the customer
will meet it in real life. The Google Shopping page shows shopping cards, the SEO page shows a business
profile, the Meta page shows a sponsored post in a feed, and so on. The section should be recognisable at
first glance and feel like "Sådan virker det" on `/services/hjemmesider`: built in the Webleads DNA,
scroll-driven, playful and polished.

## Files (one set per service, nothing else)

```
scripts/services/showcase/<slug>.html   the section: <section id="eksempel" class="show show--<slug>" data-sec="eksempel"> … </section>
assets/css/show/<slug>.css              its styles. Every selector starts with .show--<slug>. No global selectors.
assets/js/show/<slug>.js                its behaviour: an ES module that does nothing unless .show--<slug> is on the page
```

`node scripts/services/build.mjs <slug>` puts the section under the hero, links the CSS and JS in the
page's `<head>`, and points the hero's second button ("Se et eksempel ↓") to `#eksempel`. Build again
after every change to the HTML. CSS and JS are read straight from disk.

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
- Section head, exactly like the other sections:
  ```html
  <div class="sec-head" data-reveal="0">
    <div class="sec-head__title"><div class="kicker">…</div><h2 class="h2">Første linje.<br><span class="dim">Anden linje.</span></h2></div>
    <p class="sec-head__lead">…</p>
  </div>
  ```
- Layout: `max-width: 1200px; margin: 0 auto; padding: 40px 24px 100px` like `.ba-sec`; on phones 20–24px sides.
- Surfaces: white cards with a 1px `var(--line)` border and 18–32px radius; dark boxes with
  `class="spot" data-spot` (dark background with an orange spotlight that follows the mouse); soft shadows
  like `0 40px 80px -30px rgba(17,17,17,.18)`; pills with radius 999px; the orange used sparingly.
- Motion: scroll-driven and physical, like the pinned build demo (a sticky stage, steps that light up,
  text typed in, numbers that count up, cards that slide in). requestAnimationFrame, transform and opacity
  only. `html.motion` is set when motion is allowed. Without it (reduced motion): the finished state,
  static, everything readable, no pinning.
- Free effects from `main.js`: `data-reveal="n"` (fades up when scrolled to; n is the delay step),
  `data-tilt` with a child `data-glare`, `data-magnet`, `data-burst` (confetti on click), `data-spot`,
  `data-roll` (only on links with plain text).
- Global classes you may reuse: `.kicker`, `.h2` (+ `.dim`, `.hot`), `.sec-head*`, `.btn .btn--dark`,
  `.btn .btn--accent`, `.check`, `.seg` (segmented control, `.is-on`), `.egen*` (the "Prøv med din egen
  virksomhed" box), `.browser*` and `.dots3` (browser chrome), `.serp*` (search page parts), `.sr-only`.
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

The box on `/services/hjemmesider` saves `{ fag, by, navn }` in `sessionStorage['wl-egen']` (JSON).
Read it to prefill your example, and offer the same `.egen` box if typing makes the example better.
Defaults: Tømrer, København, Nordvik. Never send what is typed anywhere.

## Analytics

`import { track } from '/assets/js/analytics.js';` and only:
`track('showcase_step', { showcase: '<slug>', step: n })` once per step reached, and
`track('showcase_interact', { showcase: '<slug>', action: 'short-id' })` for clicks. No typed text.

## Quality bar

- Recognisable in one second, beautiful at 1440 × 900 and at 390 × 844 (iPhone 13), no horizontal scroll.
- No console errors, no failed requests. JS and CSS each under ~15 KB.
- Decorative mockups `aria-hidden="true"` with a short `.sr-only` description; real buttons for controls.
- Test: start from the page, scroll through the section, look at the screenshots, fix, repeat.
