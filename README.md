# Vebly

One-page website for Vebly: websites for service businesses from 3.000 kr. Built from the Claude Design handoff "Hjemmeside v8".

Plain HTML, CSS and JavaScript, with no build step. Hosted on Vercel.

## Structure

```
index.html            The page
assets/css/main.css   All styles (colours and type as CSS variables at the top)
assets/js/content.js  Copy for the lists and pop-ups (included items, add-ons, FAQ, team …)
assets/js/main.js     Rendering, pop-ups, contact form and all effects
demo/                 The "Nordvik" sample site that builds itself in "Sådan virker det"
api/contact.js        Vercel function that emails contact-form submissions via Resend
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
| `CONTACT_TO`     | no       | `hej@vebly.dk`                 |
| `CONTACT_FROM`   | no       | `Vebly <onboarding@resend.dev>`|

Without a key, the form shows a message asking the visitor to email or call instead. Resend's test sender `onboarding@resend.dev` only delivers to the email address on your Resend account; verify `vebly.dk` in Resend to send to any address.

## Placeholders to replace

- Phone `+45 12 34 56 78` (index.html, error text in main.js)
- Team photos: "Kommer snart" placeholders in the team cards and their pop-ups
- Demo images: empty colour blocks in `demo/index.html` marked with a comment
- "Før og efter" numbers are labelled as a typical example

## Accessibility and motion

Visitors with "reduce motion" switched on get a static page: no intro curtain, the text is fully visible, the demo shows the finished site and the balls are a clickable grid.
