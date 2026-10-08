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
| `GA4_MEASUREMENT_ID`  | yes      | GA4 → Admin → Data streams → your web stream (`G-…`) |
| `GA4_API_SECRET`      | yes      | Same stream → Measurement Protocol API secrets → Create |
| `GA4_DEBUG`           | no       | `1` sends to GA4's validation endpoint and logs the result |

Without the two required variables the endpoint accepts events and drops them. Visitors with Global Privacy Control or Do Not Track switched on send nothing. Keep `privatliv/index.html` in step if you change what is collected.

Events: `page_view`, `campaign_details` (from UTM tags), `scroll` (25/50/75/90 %), `user_engagement`, `cta_click` (`button`), `addon_add` / `addon_remove` (`addon`), `popup_open` (`popup`), `generate_lead` (`selected`) and `form_error`. Mark `generate_lead` as a key event in GA4. Add a CTA to `cta_click` by giving the element `data-event="Section: Label"`.

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
   Set `"design"` to `1` (Klassisk), `2` (Kraftig: white, bold uppercase, edge-to-edge photo) or `3` (Blød: light, serif, centred). Default is 1.
   Set `"farver"` to three hex colours to choose what the colour picker in the draft bar offers.
3. Run `node scripts/nyt-udkast.mjs scripts/udkast-kunder/<slug>.json` and commit `udkast/<slug>/`.

`scripts/` is listed in `.vercelignore`, so the templates and customer files are never published.
The URL pattern lives in `vercel.json` (rewrite plus headers); add a page name there if a draft needs more pages.
