// "Send til Webleads" on the first sketch from "Bestil en hjemmeside" (assets/js/bestil.js):
// the visitor's wishes, the suggestion on their screen and their favourites, e-mailed to us,
// so the call starts in the right place. Nothing is stored here.
//
// Environment variables: RESEND_API_KEY and CONTACT_TO, as api/bestil.js (api/_mail.js).

import { cleanAnswers, encode, colours, headline, DESIGN_NAVNE } from './_lib/udkast/bestilling.js';
import { sendMail, esc, TO, SITE } from './_mail.js';

const clip = (v, n) => String(v ?? '').trim().slice(0, n);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// The buttons under "Hvad skal være anderledes?"
const RETNINGER = { 'mere-farve': 'Mere farve', 'mere-enkel': 'Mere enkel', 'mere-moderne': 'Mere moderne', 'mere-klassisk': 'Mere klassisk', 'anden-tekst': 'Anden tekst' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  // Honeypot: bots fill the hidden field. Pretend success.
  if (body._gotcha) return res.status(200).json({ ok: true });

  const k = body.kontakt || {};
  const navn = clip(k.navn, 100), email = clip(k.email, 200), besked = clip(body.besked, 1500);
  const a = cleanAnswers(body.svar);
  if (!a.n || !navn || !EMAIL.test(email)) return res.status(400).json({ error: 'Navn, e-mail og virksomhed mangler.' });
  const favoritter = (Array.isArray(body.favoritter) ? body.favoritter : []).slice(0, 6).map(cleanAnswers).filter(f => f.n);
  const valg = (Array.isArray(body.valg) ? body.valg : []).filter(v => typeof v === 'string' && Object.hasOwn(RETNINGER, v)).slice(0, 5);
  const set = Math.min(99, Math.max(1, Number.parseInt(body.forslag, 10) || 1));

  const beskriv = f => `${DESIGN_NAVNE[f.s]} · ${colours(f)} · "${headline(f)}"`;
  const link = f => `${SITE}/mit-udkast?d=${encode(f)}`;
  const rows = [['Kontakt', navn], ['E-mail', email], ['Virksomhed', a.n], ['Forslag set', String(set)], ['Trykkede på', valg.map(v => RETNINGER[v]).join(', ') || '–']];
  const skitser = [['Forslaget på skærmen', a], ...favoritter.map((f, i) => [`Favorit ${i + 1}`, f])];

  const text = [
    `Ønsker til skitsen fra ${navn} (${a.n})`, '',
    ...rows.map(([t, v]) => `${t}: ${v}`), '',
    besked ? `Kunden skriver:\n${besked}` : 'Kunden skrev ikke noget.', '',
    ...skitser.map(([t, f]) => `${t}: ${beskriv(f)}\n${link(f)}\n`)
  ].join('\n');
  const html = `<p><b>Ønsker til skitsen fra "Bestil en hjemmeside"</b></p>`
    + `<table cellpadding="4">${rows.map(([t, v]) => `<tr><td><b>${esc(t)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`
    + (besked ? `<p><b>Kunden skriver:</b></p><p style="white-space:pre-wrap">${esc(besked)}</p>` : '<p>Kunden skrev ikke noget.</p>')
    + skitser.map(([t, f]) => `<p><b>${esc(t)}:</b> ${esc(beskriv(f))}<br><a href="${link(f)}">Se skitsen</a></p>`).join('');

  const sent = await sendMail({ to: [TO], reply_to: email, subject: `Ønsker til skitsen: ${a.n}`, text, html }, { toUs: true, tag: 'oensker' });
  // The visitor is told when it did not arrive, so the wishes are not lost without anyone knowing
  if (!sent) return res.status(502).json({ error: 'Kunne ikke sende.' });
  return res.status(200).json({ ok: true });
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
