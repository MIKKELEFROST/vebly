# Webleads (webleads.dk): notes for Claude

The owner is Mikkel. Write to him in Danish, short and plain. This file holds the standing rules and the
open work; README.md explains how the site is built.

## How work ships

- Static site on Vercel. A merge to `main` deploys production; every branch gets a preview URL.
- Work on a branch, push, open a PR. Mikkel approves merges: ask him to write "merge" (or merge himself).
- After a merge, check the live pages (the cloud container cannot reach webleads.dk with curl; use the Vercel
  MCP `web_fetch_vercel_url`).
- The repo is public: never commit secrets. API keys and tokens go straight into Vercel environment variables;
  never ask for them or print them.
- No destructive git (no force-push to main, no history rewrites on shared branches).

## Copy and design

- Danish, "du", short and concrete ("Klar på 7 dage.", not "Revolutionér din forretning").
- Keep the Webleads DNA: colours and type from `assets/css/main.css` `:root`, Bricolage Grotesque for headlines,
  DM Sans for text, playful but polished motion. Details: `scripts/services/showcase/README.md`.
- Service pages must not look alike: each has its own showcase format and its own `layout` in
  `scripts/services/data.mjs`. The numbered "Sådan virker det" build demo belongs to `/services/hjemmesider` only.
- Customer drafts (`udkast/`): no dark designs by default; share drafts by direct link only.

## Truth rules (never break)

- Never invent customers, reviews, results or numbers. Examples use made-up businesses (one per showcase, not Nordvik everywhere)
  and carry the yellow `Eksempel` tag.
- `/resultater` shows only real cases (`scripts/services/resultater-data.mjs`, `cases`); the made-up ones are kept
  there as `eksempelCases` for the format only. Customers on the front page band and the results wall are the
  real ones in `scripts/services/partnere.mjs`.
- Prices: only the ones Mikkel has set. A service without one says "Fast pris efter en snak" (`price: null`).
- Google CSS: follow `scripts/services/showcase/google-css-fakta.md` word for word ("op til 20%" always with the
  estimate sentence, no "rabat", no "garanteret", no "Ingen binding").

## Prices (ex. VAT; the code is the source)

| What | Price | Where in the code |
| --- | --- | --- |
| Hjemmesider | Simpel one page 2.995, Normal 9.995, SEO hjemmeside 29.995 kr. | `assets/js/content.js` `pakker`, `priser` |
| Rule (Mikkel, 7 Nov 2026) | What is billed by the hour is 995 kr./time; what is billed monthly is 8.000 kr./md. | `data.mjs`, `content.js` `priser` |
| Advertising | First channel 8.000 kr./md., each extra 5.000 kr./md. Google Ads + Google Shopping Ads count as one channel (8.000 together). Channels: Google, Meta, LinkedIn, TikTok, Snapchat, Pinterest, YouTube, Bing, Reddit, ChatGPT | `content.js` `KANAL`, `kanalPriser` |
| Monthly, 8.000 kr./md. | Organic Instagram, Facebook and TikTok, e-mail marketing, markedspladser, affiliate and influencer marketing | `data.mjs`, `content.js` `priser` |
| By the hour, 995 kr. | SEO, Lokal SEO, linkbuilding, GEO, CRO, tracking | `content.js` `SEO_TIMER`, `priser` |
| Google CSS | Free (Mikkel, 9 Nov 2026) through our own CSS, Webleads Shopping (https://shopping.webleads.dk): no subscription, no fee per click | `scripts/services/data.mjs` |
| Webshop (Shopify) | from 12.995 kr. plus options | `assets/js/show/webshop.js` `PRICES` |
| Automations | from 4.999 kr. + 499 kr./md. | `content.js` |
| Interne systemer og CRM | from 14.999 kr. | `content.js`, `data.mjs` |
| Branding, Video, UGC, AI, App-udvikling | Fast pris efter en snak (project work) | `data.mjs` |

## Brand files

- Logo, icons and backgrounds: `brand/` and `assets/`. The e-mail signature generator is
  `brand/mail/signatur.html` (it uses the icons in `brand/mail/` from https://webleads.dk/brand/mail/).
- Social posts, reels and the content calendar: `scripts/social/README.md`.

## Build and check

```
node scripts/services/build.mjs [slug]     # front page, service pages, /resultater, /services/webshop
node scripts/services/og.mjs [slug]        # share images in assets/og/
node scripts/dev/server.mjs 8790           # local server (static + /api), http://127.0.0.1:8790
node scripts/dev/check-pages.mjs --click   # every page × desktop/phone/reduced motion, showcase buttons
node scripts/dev/check-prices.mjs          # price rules in the contact form and the webshop calculator
```

Bump `V` in `scripts/services/lib.mjs` when shared CSS/JS changes. In a showcase, never use the attribute
`data-card` (main.js animates every `[data-card]`).

## Don't

- Don't use Composio. Don't make videos on Higgsfield unless Mikkel asks.
- In the SoMe calendar (Google Sheets), never write column M (rules in `scripts/social/README.md`).
- Don't delete published artifacts unless asked. Don't create Make objects that aren't needed.

## Open items (5 Nov 2026)

- Customer logos for the partner band: the session's network must allow the customers' domains (cloud
  environment → Edit → Network access → Allowed domains). Then take each logo from their site and add
  `logo: '/assets/partnere/<file>'` in `partnere.mjs`. Domains: nuttetbaby.dk, byminella.dk, iwao.dk,
  recoverym8.dk, carelaxdanmark.dk, gladteknik.dk, uniqvvs.dk, holmsmaler.dk, mikkelbranth.dk, raadvadkro.dk,
  fastelavnskostumer.dk, halloweenkostumer.dk, 3match.dk (and their www. versions).
  Also fill in `fag`/`by` for the customers that only show their domain.
- Prices for Video and App-udvikling (now "Fast pris efter en snak").
- Real cases for `/resultater` (numbers and quotes, with the customer's permission).
- shopping.webleads.dk (separate project): the footer still shows the placeholder "[Adresse, postnr. og by]";
  Google wants the address that matches the CVR registration. The site sends `noindex, nofollow`.
- Social: re-render reels story-21 and story-23 (`node scripts/social/render-reel.mjs <html> 9`); the weekly
  content task lacks the Google Sheets connector and the repo; Mikkel updates the Facebook intro by hand.
- The explainer video section on `/services/hjemmesider` is prepared but not switched on (README, Explainer-video).
