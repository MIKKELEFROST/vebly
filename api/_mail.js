// E-mail through Resend (https://resend.com), used by api/contact.js and api/bestil.js.
// Files starting with _ are not deployed as their own endpoint.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY  required
//   CONTACT_TO      where leads and orders go (default: hej@webleads.dk)
//   CONTACT_FROM    sender (default: Webleads <hej@webleads.dk>)
//
// Mail is sent from hej@webleads.dk. Until webleads.dk is verified in Resend, Resend refuses that
// sender: mail to us is then sent again from Resend's test sender (which may only mail the
// account's own address), and the receipt to the visitor is skipped. Once the domain is verified,
// both work without any change here.

const API = 'https://api.resend.com/emails';
const TEST_FROM = 'Webleads <onboarding@resend.dev>';
export const FROM = process.env.CONTACT_FROM || 'Webleads <hej@webleads.dk>';
export const TO = process.env.CONTACT_TO || 'hej@webleads.dk';
export const SITE = 'https://webleads.dk';

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const wait = ms => new Promise(r => setTimeout(r, ms));

async function post(key, payload) {
  for (let tries = 0; ; tries++) {
    const r = await fetch(API, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    });
    // Resend allows a few requests per second; wait once if we hit the limit
    if (r.status !== 429 || tries) return r;
    await wait(1100);
  }
}

// Sends one e-mail. `toUs` marks mail to ourselves, which may fall back to the test sender.
// Returns true when Resend accepted it. Never throws.
export async function sendMail(payload, { toUs = false, tag = 'mail' } = {}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.error(`${tag}: RESEND_API_KEY is not set`); return false; }
  try {
    let r = await post(key, { from: FROM, ...payload });
    if (!r.ok && toUs && r.status >= 400 && r.status < 500 && FROM !== TEST_FROM) {
      const why = (await r.text()).slice(0, 200);
      console.error(`${tag}: ${FROM} was refused (${r.status}: ${why}), sending from the test sender instead. Verify webleads.dk in Resend.`);
      r = await post(key, { from: TEST_FROM, ...payload });
    }
    if (!r.ok) {
      const why = (await r.text()).slice(0, 300);
      console.error(`${tag}: Resend error ${r.status}${toUs ? '' : ' (receipt to the visitor; is webleads.dk verified in Resend?)'}: ${why}`);
    }
    return r.ok;
  } catch (x) {
    console.error(`${tag}: Resend failed`, x.message);
    return false;
  }
}

// First name only, for a friendly greeting that cannot carry links or spam: a word of letters
// (and - or '), else no name at all
export const firstName = navn => {
  const w = (String(navn || '').trim().split(/\s+/)[0] || '').replace(/[.,!?]+$/, '');
  return /^\p{L}[\p{L}'-]{0,29}$/u.test(w) ? w[0].toUpperCase() + w.slice(1) : '';
};

// A short receipt in Webleads' style: greeting, paragraphs, one button, signature.
// Only our own text goes in: the visitor's message is never repeated back.
export function receipt({ navn, paras, button }) {
  const hej = firstName(navn) ? `Hej ${firstName(navn)}` : 'Hej';
  const text = [hej, ...paras, button ? `${button.label}: ${button.href}` : '', 'Venlig hilsen\nWebleads', 'hej@webleads.dk · 41 82 67 99 · webleads.dk']
    .filter(Boolean).join('\n\n');
  const p = s => `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#111">${esc(s)}</p>`;
  const html = `<!doctype html><html lang="da"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#fbfaf8">
<div style="max-width:520px;margin:0 auto;padding:36px 24px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#111">
<p style="margin:0 0 28px;font-size:22px;font-weight:800;letter-spacing:-0.5px">webleads<span style="color:#e0552b">.</span></p>
${p(hej)}
${paras.map(p).join('\n')}
${button ? `<p style="margin:24px 0 28px"><a href="${esc(button.href)}" style="display:inline-block;background:#e0552b;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 24px;border-radius:999px">${esc(button.label)} →</a></p>` : ''}
<p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:#111">Venlig hilsen<br>Webleads</p>
<p style="margin:0;padding-top:18px;border-top:1px solid #ecebe7;font-size:13px;line-height:1.6;color:#6b6760">
<a href="mailto:hej@webleads.dk" style="color:#6b6760">hej@webleads.dk</a> · <a href="sms:+4541826799" style="color:#6b6760">41 82 67 99</a> · <a href="${SITE}" style="color:#6b6760">webleads.dk</a><br>Webleads (Frost Digital ApS) · CVR 45737632</p>
</div>
</body></html>`;
  return { html, text };
}
