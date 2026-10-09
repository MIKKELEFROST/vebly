// Instant website drafts from "Bestil en hjemmeside".
// webleads.dk/mit-udkast?d=… and /mit-udkast/<ydelser|om-os|kontakt>?d=… (vercel.json rewrites)
// The answers are in the link (api/_lib/udkast/bestilling.js), so nothing is stored. The pages
// use the same templates as the hand-made drafts (api/_lib/udkast/render.js) and are never indexed.

import { PAGES, renderDraft } from './_lib/udkast/render.js';
import { decode, encode, draftData, draftOptions } from './_lib/udkast/bestilling.js';

export default function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const side = PAGES.includes(req.query.side) ? req.query.side : 'forside';
  const a = decode(String(req.query.d || ''));
  if (!a || !a.n || !a.by) {
    res.setHeader('Location', '/#bestil');
    return res.status(302).end();
  }
  try {
    const html = renderDraft(draftData(a), side, draftOptions(a, encode(a)));
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=86400');
    return res.status(200).send(html);
  } catch (x) {
    console.error('udkast: could not render', x.message);
    res.setHeader('Location', '/#bestil');
    return res.status(302).end();
  }
}
