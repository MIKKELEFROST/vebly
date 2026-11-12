// Vercel serverless function for the sign-up form on Webleads Shopping (https://shopping.webleads.dk):
// webshops that want their Shopping ads to run through our own CSS. The form lives on the other site,
// so this function answers CORS for that origin only. It sends the sign-up to us and a short receipt
// to the shop in the language of the page it came from, through Resend (api/_mail.js).
//
// Environment variables: the same as api/contact.js (RESEND_API_KEY, CONTACT_TO, CONTACT_FROM).

import { sendMail, receipt, esc, TO } from './_mail.js';

const SHOPPING = 'https://shopping.webleads.dk';
// Local dev servers may call it too; they can only reach it from the developer's own machine
const allowed = o => o === SHOPPING || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o || '');

const LANDE = { DK: 'Danmark', SE: 'Sverige', NO: 'Norge', FI: 'Finland', NL: 'Holland' };

// The receipt, per page language. Only our own text: the shop's message is never repeated back.
const R = {
  da: {
    path: '/', words: {},
    subject: 'Tak for din henvendelse om Webleads Shopping',
    paras: ['Tak for din henvendelse. Vi har fået den og kigger på din webshop.',
      'Vi skriver til dig hurtigst muligt og hjælper dig med at koble din Google Merchant Center-konto til Webleads Shopping.'],
    button: 'Se Webleads Shopping'
  },
  sv: {
    path: '/se/', words: { lang: 'sv', hello: 'Hej', regards: 'Vänliga hälsningar', phone: '+45 41 82 67 99' },
    subject: 'Tack för ditt intresse för Webleads Shopping',
    paras: ['Tack för ditt meddelande. Vi har fått det och tittar på din webbutik.',
      'Vi hör av oss så snart vi kan och hjälper dig att koppla ditt Google Merchant Center-konto till Webleads Shopping.'],
    button: 'Se Webleads Shopping'
  },
  nb: {
    path: '/no/', words: { lang: 'nb', hello: 'Hei', regards: 'Vennlig hilsen', phone: '+45 41 82 67 99' },
    subject: 'Takk for henvendelsen om Webleads Shopping',
    paras: ['Takk for meldingen. Vi har mottatt den og ser på nettbutikken din.',
      'Vi tar kontakt så snart vi kan og hjelper deg med å koble Google Merchant Center-kontoen din til Webleads Shopping.'],
    button: 'Se Webleads Shopping'
  },
  fi: {
    path: '/fi/', words: { lang: 'fi', hello: 'Hei', regards: 'Ystävällisin terveisin', phone: '+45 41 82 67 99' },
    subject: 'Kiitos yhteydenotostasi: Webleads Shopping',
    paras: ['Kiitos viestistäsi. Olemme saaneet sen ja katsomme verkkokauppaasi.',
      'Otamme sinuun yhteyttä mahdollisimman pian ja autamme yhdistämään Google Merchant Center -tilisi Webleads Shoppingiin.'],
    button: 'Katso Webleads Shopping'
  },
  nl: {
    path: '/nl/', words: { lang: 'nl', hello: 'Hallo', regards: 'Met vriendelijke groet', phone: '+45 41 82 67 99' },
    subject: 'Bedankt voor je aanmelding bij Webleads Shopping',
    paras: ['Bedankt voor je bericht. We hebben het ontvangen en bekijken je webshop.',
      'We nemen zo snel mogelijk contact met je op en helpen je je Google Merchant Center-account aan Webleads Shopping te koppelen.'],
    button: 'Bekijk Webleads Shopping'
  }
};

export default async function handler(req, res) {
  const origin = req.headers?.origin;
  if (allowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.status(allowed(origin) ? 204 : 403).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  // Honeypot: bots fill the hidden field. Pretend success.
  if (body._gotcha) return res.status(200).json({ ok: true });

  const s = (v, n) => String(v ?? '').trim().slice(0, n);
  const navn = s(body.navn, 200);
  const butik = s(body.butik, 200); // the shop's name (the form on /webshops/ asks for it instead of a person)
  const email = s(body.email, 200);
  const webshop = s(body.webshop, 200);
  const telefon = s(body.telefon, 40);
  const merchant = s(body.merchant_id, 40).replace(/[\s-]/g, '');
  const besked = s(body.besked, 5000);
  const lande = (Array.isArray(body.lande) ? body.lande : [body.lande]).map(x => s(x, 2).toUpperCase()).filter(x => LANDE[x]);
  const lang = R[body.lang] ? body.lang : 'da';

  if (!(navn || butik) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i.test(webshop)) {
    return res.status(400).json({ error: 'Navn, e-mail og webshop er påkrævet.' });
  }
  if (merchant && !/^\d{5,15}$/.test(merchant)) {
    return res.status(400).json({ error: 'Merchant Center-ID består kun af tal.' });
  }

  const rows = [
    ...(butik ? [['Butik', butik]] : []), ['Navn', navn || '–'], ['E-mail', email], ['Telefon', telefon || '–'], ['Webshop', webshop],
    ['Merchant Center-ID', merchant || '–'], ['Lande', lande.map(x => LANDE[x]).join(', ') || '–'],
    ['Side', SHOPPING + (s(body.side, 40).match(/^\/[a-z/]*$/) ? s(body.side, 40) : R[lang].path)]
  ];
  const ok = await sendMail({
    to: [TO],
    reply_to: email,
    subject: `CSS-tilmelding: ${webshop} (${navn || butik})`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n') + (besked ? `\n\n${besked}` : ''),
    html: `<p>${rows.map(([k, v]) => `<b>${k}:</b> ${esc(v)}`).join('<br>')}</p>` + (besked ? `<p style="white-space:pre-wrap">${esc(besked)}</p>` : '')
  }, { toUs: true, tag: 'css' });
  if (!ok) return res.status(502).json({ error: 'Beskeden kunne ikke sendes.' });

  // Receipt to the shop. If it fails, the sign-up has still reached us.
  const r = R[lang];
  const kvittering = await sendMail({
    to: [email],
    reply_to: TO,
    subject: r.subject,
    ...receipt({
      navn,
      paras: r.paras,
      button: { label: r.button, href: `${SHOPPING}${r.path}?utm_source=kvittering&utm_medium=email&utm_campaign=css-tilmelding` }
    }, r.words)
  }, { tag: 'css' });

  return res.status(200).json({ ok: true, kvittering });
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}
