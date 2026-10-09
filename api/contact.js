// Vercel serverless function for the contact form.
// Sends the message by email through Resend (https://resend.com).
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  required
//   CONTACT_TO      where leads go            (default: hej@webleads.dk)
//   CONTACT_FROM    verified sender in Resend (default: Webleads <onboarding@resend.dev>)
//   META_CAPI_TOKEN optional, sends the Lead to Meta too (see api/_meta.js)

import { sendToMeta, userData } from './_meta.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const navn = String(body.navn || '').trim().slice(0, 200);
  const email = String(body.email || '').trim().slice(0, 200);
  const besked = String(body.besked || '').trim().slice(0, 5000);
  const valgt = String(body.valgt || 'Hjemmeside').trim().slice(0, 300);

  // Honeypot: bots fill the hidden field. Pretend success.
  if (body._gotcha) return res.status(200).json({ ok: true });

  if (!navn || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Navn og en gyldig e-mail er påkrævet.' });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error('contact: RESEND_API_KEY is not set');
    return res.status(503).json({ error: 'Formularen er ikke sat op endnu.' });
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'Webleads <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO || 'hej@webleads.dk'],
      reply_to: email,
      subject: `Ny henvendelse fra ${navn}`,
      text: `Navn: ${navn}\nE-mail: ${email}\nValgt: ${valgt}\n\n${besked}`,
      html: `<p><b>Navn:</b> ${esc(navn)}<br><b>E-mail:</b> ${esc(email)}<br><b>Valgt:</b> ${esc(valgt)}</p><p style="white-space:pre-wrap">${esc(besked)}</p>`
    })
  });

  if (!r.ok) {
    console.error('contact: Resend error', r.status, await r.text());
    return res.status(502).json({ error: 'Beskeden kunne ikke sendes.' });
  }

  // Meta Conversions API: the same Lead as the browser pixel (same event id), with e-mail and
  // name hashed so Meta can match it to an ad. Only when the visitor said yes to Meta Pixel.
  // The message itself is never sent to Meta.
  if (body.meta_consent === 'yes' && typeof body.meta_event_id === 'string') {
    await sendToMeta([{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.meta_event_id.slice(0, 64),
      action_source: 'website',
      event_source_url: 'https://webleads.dk/',
      user_data: userData(req, { email, name: navn }),
      custom_data: { content_name: valgt.slice(0, 100), value: Math.min(Math.max(Number(body.meta_value) || 0, 0), 100000), currency: 'DKK' }
    }]);
  }
  return res.status(200).json({ ok: true });
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
