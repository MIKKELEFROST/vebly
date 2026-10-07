// Vercel serverless function for the contact form.
// Sends the message by email through Resend (https://resend.com).
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  required
//   CONTACT_TO      where leads go            (default: hej@siteleads.dk)
//   CONTACT_FROM    verified sender in Resend (default: Siteleads <onboarding@resend.dev>)

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
      from: process.env.CONTACT_FROM || 'Siteleads <onboarding@resend.dev>',
      to: [process.env.CONTACT_TO || 'hej@siteleads.dk'],
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
  return res.status(200).json({ ok: true });
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
