// Receives Meta events from assets/js/meta-pixel.js and passes them on to Meta with the
// Conversions API (api/_meta.js). The page only sends here after the visitor said yes.
// Each event carries the same event_id as the browser pixel, so Meta counts it once.

import { sendToMeta, userData } from './_meta.js';

const EVENTS = new Set(['PageView', 'ViewContent', 'CustomizeProduct', 'Contact', 'Scroll', 'CTAClick', 'RemoveAddon', 'SectionView', 'FormStart', 'FormError', 'EngagedVisit']);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime/i;
const SITE = 'https://webleads.dk/';

const pageUrl = v => (typeof v === 'string' && /^https:\/\/(www\.)?webleads\.dk\//.test(v) ? v.slice(0, 500) : SITE);
const clean = p => {
  const out = {};
  if (!p || typeof p !== 'object') return out;
  for (const [k, v] of Object.entries(p).slice(0, 10)) {
    if (!/^[a-z][a-z0-9_]{0,39}$/.test(k)) continue;
    if (typeof v === 'number' && Number.isFinite(v)) out[k] = v;
    else if (typeof v === 'string') out[k] = v.slice(0, 100);
  }
  return out;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  if (!process.env.META_CAPI_TOKEN || BOT.test(String(req.headers['user-agent'] || ''))) return res.status(204).end();

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const now = Math.floor(Date.now() / 1000);
  const user = userData(req);
  const events = (Array.isArray(body.events) ? body.events : []).slice(0, 20)
    .filter(e => e && EVENTS.has(e.event_name) && typeof e.event_id === 'string')
    .map(e => ({
      event_name: e.event_name,
      event_time: now,
      event_id: e.event_id.slice(0, 64),
      action_source: 'website',
      event_source_url: pageUrl(e.url),
      user_data: user,
      custom_data: clean(e.custom_data)
    }));
  await sendToMeta(events);
  return res.status(204).end();
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
