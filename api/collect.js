// First-party analytics endpoint. Receives events from assets/js/analytics.js
// and forwards them to Google Analytics 4 with the Measurement Protocol.
//
// Environment variables (Vercel → Project → Settings → Environment Variables):
//   GA4_MEASUREMENT_ID  optional, default G-RMB6GL0B9C (the webleads.dk stream)
//   GA4_API_SECRET      required, GA4 → Admin → Data streams → (stream) → Measurement Protocol API secrets
//   GA4_DEBUG           optional, "1" sends to GA4's validation endpoint and logs the response
//
// Visitors are counted without cookies: the client id is a hash of IP + browser
// + the current day, so it cannot follow anyone across days. The IP itself is
// only passed on for country/city lookup. A session is the same visitor within
// the same clock hour, so the pages of one visit are tied together.
//
// Only the events below are passed on (the list in README.md → Tracking).

import crypto from 'node:crypto';

const EVENTS = new Set([
  // Pages and time
  'page_view', 'preview_view', 'page_not_found', 'campaign_details', 'user_engagement', 'time_on_page', 'tab_return', 'exit_intent',
  'scroll', 'section_view', 'section_time', 'text_copy',
  // Clicks
  'cta_click', 'nav_click', 'outbound_click', 'contact_click', 'ui_click', 'rage_click', 'dead_click',
  // Forms and leads
  'form_start', 'form_field', 'form_field_done', 'form_submit', 'form_invalid', 'form_abandon', 'form_error', 'generate_lead',
  // Quality
  'js_error', 'resource_error', 'web_vitals', 'consent_view', 'consent_choice',
  // Front page
  'addon_add', 'addon_remove', 'addon_view', 'price_view', 'popup_open', 'popup_close', 'popup_action', 'faq_open', 'faq_close',
  'ba_mode', 'ba_drag', 'pit_shake', 'pit_ball_throw', 'intro_skip', 'demo_step', 'demo_live', 'reference_filter',
  // "Bestil en hjemmeside"
  'bestil_open', 'bestil_step_view', 'bestil_step', 'bestil_1_fag', 'bestil_2_virksomhed', 'bestil_3_behov', 'bestil_4_stil', 'bestil_5_kontakt',
  'bestil_choice', 'bestil_field', 'bestil_back', 'bestil_submit', 'bestil_error', 'bestil_udkast_vist', 'bestil_result_change',
  'bestil_draft_open', 'bestil_link_copy', 'bestil_close', 'bestil_forslag', 'bestil_forslag_nav', 'bestil_favorit', 'bestil_oensker_sendt',
  // Customer drafts
  'udkast_click', 'udkast_farve', 'udkast_bar_close', 'udkast_faerdig_click', 'udkast_form_try'
]);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime/i;

const str = (v, max = 100) => (typeof v === 'string' ? v.slice(0, max) : '');
// GA4 takes 25 parameters per event; 5 are ours (session and page), so 20 are left
const cleanParams = p => {
  const out = {};
  if (!p || typeof p !== 'object') return out;
  for (const [k, v] of Object.entries(p).slice(0, 20)) {
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(k)) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string') out[k] = v.slice(0, 100);
    else if (typeof v === 'boolean') out[k] = String(v);
  }
  return out;
};
// A customer draft's link carries the visitor's answers (?d=…): they never go to GA4
const noAnswers = u => u.replace(/([?&]d=)[^&#]*/g, '$1-');
const deviceCategory = ua => (/iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const id = process.env.GA4_MEASUREMENT_ID || 'G-RMB6GL0B9C';
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
    session_id: String(Math.floor(Date.now() / 3600000) * 3600),
    page_location: noAnswers(str(page.location, 1000)),
    page_title: str(page.title, 300),
    page_referrer: noAnswers(str(page.referrer, 420))
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
