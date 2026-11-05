// /tak/<side>: counts the lead (scripts/services/pages/tak.mjs).
// The contact form (main.js) leaves a note in sessionStorage ('wl-lead') and sends the visitor here.
// The note is read once and removed, so only the visit right after a real submit counts as a lead:
// generate_lead to GA4 and Lead to Meta (with the event id /api/contact used for the same Lead on the
// server, so Meta counts it once). A reload or a direct visit is only a page view.
// Every lead is counted on a /tak/… address, so "URL contains /tak/meta-ads" works in GA4, Meta and Google Ads.
import { track } from '/assets/js/analytics.js';
import { metaTrack } from '/assets/js/meta-pixel.js';

const KEY = 'wl-lead';
let lead = null;
try {
  lead = JSON.parse(sessionStorage.getItem(KEY) || 'null');
  sessionStorage.removeItem(KEY);
} catch (x) { lead = null; }

// Only a fresh note (the form sends the visitor straight here)
if (lead && typeof lead === 'object' && Date.now() - (+lead.t || 0) < 10 * 60 * 1000) {
  const side = String(lead.side || '').slice(0, 40);
  const selected = String(lead.selected || 'Generel henvendelse').slice(0, 100);
  const value = Math.max(0, +lead.value || 0);
  track('generate_lead', {
    selected, form_name: 'kontakt', form_page: side, addons_total: +lead.addons || 0,
    value, currency: 'DKK', receipt: lead.receipt ? 'ja' : 'nej'
  });
  if (lead.id) metaTrack('Lead', { content_name: selected, value, currency: 'DKK' }, { id: String(lead.id).slice(0, 64), mirror: false });
  const mail = document.querySelector('[data-tak-mail]');
  if (mail && lead.receipt) mail.hidden = false;
}
