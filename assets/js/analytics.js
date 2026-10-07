// First-party analytics. Events are batched and sent to our own /api/collect,
// which forwards them to GA4 with the Measurement Protocol.
// Nothing is stored in the browser: no cookies, no localStorage.

const ENDPOINT = '/api/collect';
const sessionId = String(Math.floor(Date.now() / 1000)); // GA4 expects a numeric session id
let queue = [];
let timer = null;

// Engagement time: visible milliseconds since the last event (GA4 sums these)
let activeSince = document.visibilityState === 'visible' ? performance.now() : null;
let banked = 0;
const takeEngagement = () => {
  const now = performance.now();
  const ms = banked + (activeSince !== null ? now - activeSince : 0);
  banked = 0;
  if (activeSince !== null) activeSince = now;
  return Math.max(1, Math.round(ms));
};

const page = () => {
  const url = new URL(location.href);
  url.hash = '';
  return { location: url.href, title: document.title, referrer: document.referrer || '' };
};

function flush() {
  clearTimeout(timer); timer = null;
  if (!queue.length) return;
  const body = JSON.stringify({
    session_id: sessionId,
    page: page(),
    device: { screen: `${screen.width}x${screen.height}`, language: navigator.language || '' },
    events: queue.splice(0, 20)
  });
  const sent = navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
  if (!sent) fetch(ENDPOINT, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  if (queue.length) flush();
}

export function track(name, params = {}) {
  try {
    queue.push({ name, params: { ...params, engagement_time_msec: takeEngagement() } });
    if (!timer) timer = setTimeout(flush, 1500);
  } catch (x) { /* analytics must never break the page */ }
}

// Page view, with campaign details when the URL carries UTM tags
{
  const q = new URLSearchParams(location.search);
  const utm = { source: q.get('utm_source'), medium: q.get('utm_medium'), campaign: q.get('utm_campaign'), term: q.get('utm_term'), content: q.get('utm_content') };
  Object.keys(utm).forEach(k => utm[k] == null && delete utm[k]);
  if (Object.keys(utm).length) track('campaign_details', utm);
  track('page_view');
}

// Scroll depth
{
  const marks = [25, 50, 75, 90];
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? (scrollY / max) * 100 : 100;
    while (marks.length && pct >= marks[0]) track('scroll', { percent_scrolled: marks.shift() });
    if (!marks.length) removeEventListener('scroll', onScroll);
  };
  addEventListener('scroll', onScroll, { passive: true });
}

// Send what we have when the visitor leaves or switches tab
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (activeSince !== null) { banked += performance.now() - activeSince; activeSince = null; }
    track('user_engagement');
    flush();
  } else {
    activeSince = performance.now();
  }
});
