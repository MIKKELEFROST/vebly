// "Bestil en hjemmeside" (assets/js/bestil.js): receives the answers, e-mails them to us with a
// link to the visitor's free draft, and returns that link. The draft itself is rendered by
// api/udkast.js from the answers in the link, so nothing is stored here.
//
// Environment variables (same as api/contact.js):
//   RESEND_API_KEY  required to get the e-mail; without it the visitor still gets the draft
//   CONTACT_TO      where orders go (default: hej@webleads.dk)
//   CONTACT_FROM    verified sender in Resend. When set, the visitor also gets the link by e-mail
//   META_CAPI_TOKEN optional, sends the Lead to Meta too (api/_meta.js)

import { cleanAnswers, encode, summary } from './_lib/udkast/bestilling.js';
import { sendToMeta, userData } from './_meta.js';

const SITE = 'https://webleads.dk';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const a = cleanAnswers(body.svar);
  const k = body.kontakt || {};
  const navn = clip(k.navn, 100), email = clip(k.email, 200), tlf = clip(k.tlf, 30), besked = clip(k.besked, 2000);
  const harSide = k.side === 'ja' ? `Ja${k.url ? ': ' + clip(k.url, 200) : ''}` : k.side === 'nej' ? 'Nej' : '–';

  const link = `/mit-udkast?d=${encode(a)}`;
  // Honeypot: bots fill the hidden field. Pretend success.
  if (body._gotcha) return res.status(200).json({ ok: true, link });
  if (!a.n || !a.by || !navn || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Navn, e-mail, virksomhed og by er påkrævet.' });
  }

  const rows = [...summary(a), ['Har en side i dag', harSide], ['Kontakt', navn], ['E-mail', email], ['Telefon', tlf || '–']];
  const key = process.env.RESEND_API_KEY;
  let sent = false;
  if (!key) console.error('bestil: RESEND_API_KEY is not set, the order was not e-mailed');
  else {
    const from = process.env.CONTACT_FROM || 'Webleads <onboarding@resend.dev>';
    const mail = (payload) => fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, ...payload }),
      signal: AbortSignal.timeout(8000)
    }).then(async r => { if (!r.ok) console.error('bestil: Resend error', r.status, (await r.text()).slice(0, 300)); return r.ok; }).catch(x => { console.error('bestil: Resend failed', x.message); return false; });

    sent = await mail({
      to: [process.env.CONTACT_TO || 'hej@webleads.dk'],
      reply_to: email,
      subject: `Ny bestilling: ${a.n} (${rows[0][1]} i ${a.by})`,
      text: `${rows.map(([t, v]) => `${t}: ${v}`).join('\n')}\n\nUdkast: ${SITE}${link}\n\n${besked}`,
      html: `<p><b>Ny bestilling via "Bestil en hjemmeside"</b></p><table cellpadding="4">${rows.map(([t, v]) => `<tr><td><b>${esc(t)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`
        + `<p><a href="${SITE}${link}">Se udkastet</a></p>${besked ? `<p style="white-space:pre-wrap">${esc(besked)}</p>` : ''}`
    });
    // A copy of the link to the visitor, only with a verified sender (onboarding@resend.dev can only mail us)
    if (process.env.CONTACT_FROM) {
      await mail({
        to: [email],
        reply_to: process.env.CONTACT_TO || 'hej@webleads.dk',
        subject: `Dit gratis udkast til ${a.n}`,
        text: `Hej ${navn}\n\nTak, fordi du bestilte et udkast. Her er det:\n${SITE}${link}\n\nVi kontakter dig hurtigst muligt, så vi kan gøre siden færdig sammen med dig.\n\nVenlig hilsen\nWebleads\nhej@webleads.dk`,
        html: `<p>Hej ${esc(navn)}</p><p>Tak, fordi du bestilte et udkast. Her er det:</p><p><a href="${SITE}${link}"><b>Se dit udkast til ${esc(a.n)}</b></a></p><p>Vi kontakter dig hurtigst muligt, så vi kan gøre siden færdig sammen med dig.</p><p>Venlig hilsen<br>Webleads<br><a href="mailto:hej@webleads.dk">hej@webleads.dk</a></p>`
      });
    }
  }

  // Meta Conversions API: the same Lead as the browser pixel, only with consent
  if (body.meta_consent === 'yes' && typeof body.meta_event_id === 'string') {
    await sendToMeta([{
      event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: body.meta_event_id.slice(0, 64),
      action_source: 'website', event_source_url: `${SITE}/`,
      user_data: userData(req, { email, name: navn }),
      custom_data: { content_name: `Bestil: ${rows[0][1]}`.slice(0, 100), value: 3000, currency: 'DKK' }
    }]);
  }

  return res.status(200).json({ ok: true, link, sent });
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
