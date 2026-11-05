// Checks the price rules in the browser: the contact form's summary on the service pages and the webshop
// calculator's advertising lines. Google Ads and Google Shopping Ads are one channel together (8.000 kr./md.),
// every other channel adds 5.000 kr./md. (content.js: KANAL, kanalPriser).
//
//   node scripts/dev/server.mjs 8790 &
//   node scripts/dev/check-prices.mjs [--base http://127.0.0.1:8790]
import { kanalPriser } from '../../assets/js/content.js';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = arg('--base', 'http://127.0.0.1:8790');
const pw = await import('playwright').catch(() => import('/opt/node22/lib/node_modules/playwright/index.mjs'));
const { chromium } = pw.default || pw;

const fail = [];
const expect = (what, got, want) => { const ok = got.includes(want); console.log(`${ok ? 'ok  ' : 'FEJL'} ${what}: ${got}`); if (!ok) fail.push(what); };

// The rule itself
const sum = g => kanalPriser(g).reduce((a, b) => a + b, 0);
expect('kanalPriser google+google', String(sum(['google', 'google'])), '8000');
expect('kanalPriser google+google+meta', String(sum(['google', 'google', 'meta'])), '13000');

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ status: 204, body: '' }));
await ctx.route(/\/api\//, r => r.fulfill({ status: 204, body: '' }));
const p = await ctx.newPage();
p.on('pageerror', e => fail.push('JS ' + e.message));
const chosen = () => p.$eval('[data-chosen-input]', e => e.value);
const add = async t => { await p.$eval(`main [data-toggle="${t}"]`, e => e.click()); await p.waitForTimeout(200); };

await p.goto(BASE + '/services/google-ads', { waitUntil: 'networkidle' });
await add('Google Shopping Ads'); expect('Google Ads + Shopping', await chosen(), '8.000 kr./md.');
await add('Meta Ads'); expect('Google Ads + Shopping + Meta', await chosen(), '13.000 kr./md.');
await p.goto(BASE + '/services/meta-ads', { waitUntil: 'networkidle' });
await add('Google Ads'); expect('Meta + Google Ads', await chosen(), '13.000 kr./md.');

await p.goto(BASE + '/services/webshop', { waitUntil: 'networkidle' });
const price = v => p.$eval(`[data-ws-p="ad:${v}"]`, e => e.textContent);
await p.$eval('input[name=ads][value=gads]', e => e.click()); await p.waitForTimeout(300);
expect('Webshop: Shopping efter Google Ads', await price('gsa'), 'Uden ekstra pris');
await p.$eval('input[name=ads][value=gsa]', e => e.click()); await p.$eval('input[name=ads][value=meta]', e => e.click()); await p.waitForTimeout(300);
expect('Webshop: tip med alle tre', await p.$eval('[data-ws-adtip]', e => e.textContent), '3.000 kr./md. ved at samle 2 kanaler');

await b.close();
console.log(fail.length ? `\n${fail.length} fejl: ${fail.join(', ')}` : '\nAlle prisregler holder.');
process.exit(fail.length ? 1 : 0);
