# Webleads

One-page website for Webleads: websites for service businesses from 3.000 kr. Built from the Claude Design handoff "Hjemmeside v8".

Plain HTML, CSS and JavaScript, with no build step. Hosted on Vercel.

## Structure

```
index.html            The page
assets/css/main.css   All styles (colours and type as CSS variables at the top)
assets/js/content.js  Copy for the lists and pop-ups (included items, add-ons, FAQ, team …)
assets/js/main.js     Rendering, pop-ups, contact form and all effects
demo/                 The "Nordvik" sample site that builds itself in "Sådan virker det"
api/contact.js        Vercel function that emails contact-form submissions via Resend
api/collect.js        Vercel function that forwards analytics events to GA4
privatliv/            Privacy policy (/privatliv), linked from the form and the footer
robots.txt, sitemap.xml
assets/og.png         Share image (1200 × 630) for Facebook, LinkedIn and messages
```

## Run locally

```
npx http-server . -p 8080      # static only, the contact form shows its error fallback
npx vercel dev                 # includes /api/contact
```

The demo is loaded in an iframe and controlled from the parent page, so open the site over http, not `file://`.

## Contact form

The form posts to `/api/contact`, which sends an email through [Resend](https://resend.com). Set these in Vercel → Project → Settings → Environment Variables:

| Variable         | Required | Default                        |
|------------------|----------|--------------------------------|
| `RESEND_API_KEY` | yes      |                                |
| `CONTACT_TO`     | no       | `hej@webleads.dk`                 |
| `CONTACT_FROM`   | no       | `Webleads <onboarding@resend.dev>`|

Without a key, the form shows a message asking the visitor to email instead. Resend's test sender `onboarding@resend.dev` only delivers to the email address on your Resend account; verify `webleads.dk` in Resend to send to any address.

## Analytics (GA4, first-party)

`assets/js/analytics.js` batches events and posts them to `/api/collect` (`api/collect.js`), which forwards them to Google Analytics 4 with the Measurement Protocol. No Google script runs in the browser, and nothing is stored on the visitor's device: the client id is a hash of IP + user agent + the current day.

Set in Vercel → Settings → Environment Variables, then redeploy:

| Variable              | Required | Where to find it |
|-----------------------|----------|------------------|
| `GA4_MEASUREMENT_ID`  | no       | Defaults to `G-RMB6GL0B9C`, the webleads.dk stream |
| `GA4_API_SECRET`      | yes      | Same stream → Measurement Protocol API secrets → Create |
| `GA4_DEBUG`           | no       | `1` sends to GA4's validation endpoint and logs the result |

Without the API secret the endpoint accepts events and drops them. Visitors with Global Privacy Control or Do Not Track switched on send nothing. Keep `privatliv/index.html` in step if you change what is collected.

Events: `page_view`, `campaign_details` (from UTM tags), `scroll` (25/50/75/90 %), `user_engagement`, `cta_click` (`button`), `addon_add` / `addon_remove` (`addon`), `popup_open` (`popup`), `generate_lead` (`selected`), `form_error`, `section_view` (`section`) and `form_start`. Mark `generate_lead` as a key event in GA4. Add a CTA to `cta_click` by giving the element `data-event="Section: Label"`.

## Meta Pixel and Conversions API (only with consent)

`assets/js/meta-pixel.js` asks the visitor once (a small box, bottom left) whether we may use Meta Pixel `2323320305173396`. Nothing is loaded from Meta and no cookies are set until they say yes. The answer is kept in `localStorage` (`wl-meta-consent`); any element with `data-consent-open` (the "Cookies" link in the footer, the button in the privacy policy) opens the question again, and saying no revokes the pixel and deletes `_fbp`/`_fbc`. Visitors with Global Privacy Control or Do Not Track are not asked.

Every event is sent twice with the same `event_id`, so Meta counts it once: from the browser (`fbq`) and from our server through `/api/meta` (`api/meta.js` → `api/_meta.js`, the Conversions API). The Lead is sent by `/api/contact` instead, with the e-mail and name hashed (SHA-256). The message itself is never sent to Meta.

| Event | When |
|---|---|
| `PageView` | Every page view |
| `ViewContent` | A pop-up opens (`content_name` = pop-up key, e.g. `addon-seo`) |
| `CustomizeProduct` / `RemoveAddon` | An add-on is added to or removed from the package |
| `Lead` | The contact form is sent (`content_name` = chosen package, `value` = start prices, monthly add-ons count one month, `DKK`) |
| `Contact` | The floating sms/mail button, `sms:`, `mailto:` and `tel:` links |
| `SectionView` | A section reaches the upper half of the screen (`section` = its id) |
| `Scroll` | 25, 50, 75 and 90 % of the page |
| `CTAClick` | Any element with `data-event` (`button` = its label) |
| `FormStart` / `FormError` | First focus in the contact form / sending failed |
| `EngagedVisit` | 30 s, 1, 2 and 5 minutes of active time |

The custom events come from `analytics.js` (`fromAnalytics`), so a new GA4 event can be passed on to Meta by adding it to `FROM_GA` in `meta-pixel.js`. Use `metaTrack(event, params)` for anything else. The pixel runs on the front page and `/privatliv`; keep `privatliv/index.html` in step if you change what is sent.

Set in Vercel → Settings → Environment Variables, then redeploy:

| Variable | Required | Where to find it |
|---|---|---|
| `META_CAPI_TOKEN` | for the server copy | Events Manager → the pixel → Settings → Conversions API → Generate access token |
| `META_TEST_EVENT_CODE` | no | Events Manager → Test events; remove it again after testing |
| `META_PIXEL_ID` | no | Defaults to `2323320305173396` |

Without the token the browser pixel still works; only the server copy is skipped.

## Placeholders to replace

- Team photos: "Kommer snart" placeholders in the team cards and their pop-ups
- Demo images: empty colour blocks in `demo/index.html` marked with a comment
- "Før og efter" numbers are labelled as a typical example

## Accessibility and motion

Visitors with "reduce motion" switched on get a static page: no intro curtain, the text is fully visible, the demo shows the finished site and the balls are a clickable grid.

## Customer drafts (udkast)

Drafts of a website made for one prospective customer, shared by direct link only:
`webleads.dk/<slug>-forside`, `-ydelser`, `-om-os` and `-kontakt` (e.g. `/holms-maler-aps-forside`).
They are not linked anywhere, not in the sitemap, and send `noindex` both as a meta tag and as an
`X-Robots-Tag` header. Opening one sends a page view to GA4, so you can see when the customer looked.

The front page is built for trades: hero with trade + town, trust strip, services, about, projects gallery, proof (rating, numbers, memberships, reviews), process, tax deduction, areas, FAQ and a contact form. It is SEO-ready for launch: title and meta description with trade + town, one H1, labelled images, and JSON-LD for the business (trade-specific type such as `HousePainter`, `Plumber`, `Electrician`) and the FAQ. Remove `noindex` and add `"domaene"` to the customer file when the site goes live.

```
scripts/udkast-brancher/<branche>.json   Trade templates: services, prices, FAQ, steps, hours, button wording
scripts/udkast-kunder/<slug>.json        One file per customer: name, town, nearby areas, phone, colour, overrides
scripts/udkast-skabelon/                 The page templates
scripts/nyt-udkast.mjs                   Builds udkast/<slug>/*.html from the two files above
udkast/_faelles/                         Shared CSS and JS for all drafts
udkast/<slug>/                           The generated draft (plain HTML, can be edited by hand)
```

Make a new draft:

1. Copy `scripts/udkast-kunder/holms-maler-aps.json`, set `branche` to one of the files in `scripts/udkast-brancher/` and fill in the customer's details.
2. Any field from the trade file can be overridden in the customer file, e.g. its own `ydelser` or `overskrift`.
   Set `"design"` to `1` (Klassisk), `4` (Mosaik: white tiles on light grey) or `5` (Minimal: thin lines, numbered lists, timeline). Default is 1. All designs are light.
   Set `"farver"` to three hex colours to choose what the colour picker in the draft bar offers.
3. Run `node scripts/nyt-udkast.mjs scripts/udkast-kunder/<slug>.json` and commit `udkast/<slug>/`.

`scripts/` is listed in `.vercelignore`, so the templates and customer files are never published.
The URL pattern lives in `vercel.json` (rewrite plus headers); add a page name there if a draft needs more pages.
