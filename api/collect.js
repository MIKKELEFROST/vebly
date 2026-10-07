// First-party analytics endpoint. Receives events from assets/js/analytics.js
// and forwards them to Google Analytics 4 with the Measurement Protocol.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   GA4_MEASUREMENT_ID  required, e.g. G-ABC123XYZ
//   GA4_API_SECRET      required, GA4 → Admin → Data streams → (stream) → Measurement Protocol API secrets
//   GA4_DEBUG           optional, "1" sends to GA4's validation endpoint and logs the response
//
// Visitors are counted without cookies: the client id is a hash of IP + browser
// + the current day, so it cannot follow anyone across days. The IP itself is
// only passed on for country/city lookup.

import crypto from 'node:crypto';

const EVENTS = new Set(['page_view', 'user_engagement', 'scroll', 'campaign_details', 'cta_click', 'addon_add', 'addon_remove', 'popup_open', 'generate_lead', 'form_error']);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime/i;

const str = (v, max = 100) => (typeof v === 'string' ? v.slice(0, max) : '');
const cleanParams = p => {
  const out = {};
  if (!p || typeof p !== 'object') return out;
  for (const [k, v] of Object.entries(p).slice(0, 25)) {
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(k)) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string') out[k] = v.slice(0, 100);
  }
  return out;
};
const deviceCategory = ua => (/iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const id = process.env.GA4_MEASUREMENT_ID;
  const secret = process.env.GA4_API_SECRET;
  const ua = String(req.headers['user-agent'] || '');
  if (!id || !secret || BOT.test(ua)) return res.status(204).end();

  let body = req.body;
  if (typeof body === 'string' || Buffer.isBuffer(body)) { try { body = JSON.parse(String(body)); } catch { body = null; } }
  if (!body || !Array.isArray(body.events)) return res.status(400).end();

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || '';
  const day = new Date().toISOString().slice(0, 10);
  const h = crypto.createHash('sha256').update(`${secret}|${day}|${ip}|${ua}`).digest();
  const clientId = `${h.readUInt32BE(0)}.${h.readUInt32BE(4)}`;

  const page = body.page || {};
  const common = {
    session_id: str(body.session_id, 20),
    page_location: str(page.location, 1000),
    page_title: str(page.title, 300),
    page_referrer: str(page.referrer, 420)
  };

  const events = body.events
    .filter(e => e && EVENTS.has(e.name))
    .slice(0, 20)
    .map(e => ({ name: e.name, params: { ...common, ...cleanParams(e.params) } }));
  if (!events.length) return res.status(204).end();

  const payload = {
    client_id: clientId,
    ip_override: ip,
    device: {
      category: deviceCategory(ua),
      language: str(body.device?.language, 20),
      screen_resolution: str(body.device?.screen, 20)
    },
    events
  };

  const debug = process.env.GA4_DEBUG === '1';
  const url = `https://www.google-analytics.com/${debug ? 'debug/mp' : 'mp'}/collect?measurement_id=${encodeURIComponent(id)}&api_secret=${encodeURIComponent(secret)}`;
  try {
    const r = await fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    if (debug) console.log('ga4 debug', r.status, await r.text());
  } catch (err) {
    console.error('ga4 forward failed', err);
  }
  return res.status(204).end();
}
