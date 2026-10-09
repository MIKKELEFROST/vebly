// Meta Pixel, only after the visitor says yes.
// Until then nothing is loaded from Meta and no cookies are set. The choice is kept in
// localStorage so we only ask once; any link with data-consent-open opens the question
// again so the choice can be changed. Visitors with Global Privacy Control or Do Not Track
// are not asked, but can still say yes through the link.

const PIXEL_ID = '2323320305173396';
const KEY = 'wl-meta-consent';
const optOut = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';

const read = () => { try { return localStorage.getItem(KEY); } catch (x) { return null; } };
const save = v => { try { localStorage.setItem(KEY, v); } catch (x) { /* private mode: we ask again next time */ } };

let on = false;

function grant() {
  on = true;
  if (window.fbq) { window.fbq('consent', 'grant'); return; }
  // Meta's standard base code
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
}

function revoke() {
  on = false;
  if (window.fbq) window.fbq('consent', 'revoke');
  // Remove the cookies Meta Pixel sets on our own domain
  const host = location.hostname.replace(/^www\./, '');
  for (const name of ['_fbp', '_fbc']) {
    for (const domain of ['', host, '.' + host]) document.cookie = `${name}=; Max-Age=0; path=/${domain ? '; domain=' + domain : ''}`;
  }
}

// Standard Meta events (Lead, Contact …). Sends nothing without consent.
export function metaTrack(event, params = {}) {
  if (!on || !window.fbq) return;
  try { window.fbq('track', event, params); } catch (x) { /* tracking must never break the page */ }
}

const CSS = `
.cc{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:440px;box-sizing:border-box;background:#111;color:#fff;border-radius:22px;padding:20px 20px 18px;box-shadow:0 18px 50px rgba(0,0,0,.28);font:15px/1.5 "DM Sans","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased;opacity:0;transform:translateY(16px);transition:opacity .35s,transform .35s cubic-bezier(.2,.8,.2,1)}
.cc.is-in{opacity:1;transform:none}
.cc__t{margin:0 0 6px;font:800 21px/1.1 "Bricolage Grotesque","Helvetica Neue",Arial,sans-serif;letter-spacing:-.03em}
.cc__p{margin:0;color:rgba(255,255,255,.78)}
.cc__p a{color:#fff;text-decoration:underline;text-underline-offset:2px}
.cc__b{display:flex;gap:10px;margin-top:16px}
.cc__b button{flex:1;-webkit-appearance:none;appearance:none;border:0;border-radius:999px;padding:13px 16px;background:#fff;color:#111;font:700 15px/1 "DM Sans","Helvetica Neue",Arial,sans-serif;cursor:pointer}
.cc__b button:focus-visible,.cc__p a:focus-visible{outline:2px solid #e0552b;outline-offset:3px}
@media (prefers-reduced-motion:reduce){.cc{transition:none}}`;

function ask() {
  if (document.querySelector('.cc')) return;
  if (!document.querySelector('style[data-cc]')) {
    const st = document.createElement('style'); st.dataset.cc = ''; st.textContent = CSS; document.head.appendChild(st);
  }
  const el = document.createElement('div');
  el.className = 'cc';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-labelledby', 'cc-t');
  el.innerHTML = '<p class="cc__t" id="cc-t">Må vi måle vores annoncer?</p>'
    + '<p class="cc__p">Vi vil gerne bruge Meta Pixel til at måle vores annoncer på Facebook og Instagram og vise dem til folk, der har besøgt siden. Den sætter cookies og sender data til Meta. Siden virker lige godt uden. <a href="/privatliv#meta">Læs mere</a></p>'
    + '<div class="cc__b"><button type="button" data-v="denied">Nej tak</button><button type="button" data-v="granted">Ja tak</button></div>';
  el.addEventListener('click', e => {
    const b = e.target.closest('button[data-v]'); if (!b) return;
    save(b.dataset.v);
    if (b.dataset.v === 'granted') grant(); else revoke();
    el.classList.remove('is-in');
    setTimeout(() => el.remove(), 350);
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
}

const choice = read();
if (choice === 'granted') grant();
else if (!choice && !optOut) setTimeout(ask, document.querySelector('[data-loader]') ? 2800 : 600);

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('[data-consent-open]');
  if (t) { e.preventDefault(); ask(); return; }
  // Someone reaching out by text, e-mail or phone
  if (e.target.closest && e.target.closest('[data-ping], a[href^="sms:"], a[href^="mailto:"], a[href^="tel:"]')) metaTrack('Contact');
});
