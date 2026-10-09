// Meta Conversions API: sends events from our server to Meta, next to the browser pixel.
// Used by api/meta.js (events from the page) and api/contact.js (Lead with hashed e-mail and name).
// Files starting with _ are not deployed as their own endpoint.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   META_CAPI_TOKEN       required, Events Manager → the pixel → Settings → Conversions API → Generate access token
//   META_PIXEL_ID         optional, default 2323320305173396
//   META_TEST_EVENT_CODE  optional, shows the events under "Test events" in Events Manager while testing
//   META_API_VERSION      optional, default v23.0
//
// The page only calls this for visitors who said yes to Meta Pixel.

import crypto from 'node:crypto';

const sha = v => crypto.createHash('sha256').update(v).digest('hex');
// Meta's normalisation: lower case, no spaces or punctuation (letters like æ, ø and å are kept)
const word = v => String(v || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export function cookies(req) {
  const out = {};
  for (const part of String(req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

export function userData(req, { email, name } = {}) {
  const c = cookies(req);
  const u = {
    client_ip_address: String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '',
    client_user_agent: String(req.headers['user-agent'] || '')
  };
  if (c._fbp) u.fbp = c._fbp;
  if (c._fbc) u.fbc = c._fbc;
  if (email) u.em = [sha(String(email).trim().toLowerCase())];
  const parts = String(name || '').trim().split(/\s+/).map(word).filter(Boolean);
  if (parts.length) u.fn = [sha(parts[0])];
  if (parts.length > 1) u.ln = [sha(parts[parts.length - 1])];
  return u;
}

// Never throws and gives up after 3 seconds, so it cannot break a page or the contact form.
export async function sendToMeta(events) {
  const token = process.env.META_CAPI_TOKEN;
  if (!token || !events.length) return false;
  const pixel = process.env.META_PIXEL_ID || '2323320305173396';
  const version = process.env.META_API_VERSION || 'v23.0';
  const body = { data: events };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
  try {
    const r = await fetch(`https://graph.facebook.com/${version}/${pixel}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(3000)
    });
    if (!r.ok) console.error('meta: Conversions API error', r.status, (await r.text()).slice(0, 500));
    return r.ok;
  } catch (x) {
    console.error('meta: Conversions API request failed', x.message);
    return false;
  }
}
