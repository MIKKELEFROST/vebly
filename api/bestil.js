// "Bestil en hjemmeside" (assets/js/bestil.js): receives the answers, e-mails them to us with a
// link to the visitor's free draft, and returns that link. The draft itself is rendered by
// api/udkast.js from the answers in the link, so nothing is stored here.
//
// Environment variables (same as api/contact.js):
//   RESEND_API_KEY  required to get the e-mails; without it the visitor still gets the draft
//   CONTACT_TO      where orders go (default: hej@webleads.dk)
//   CONTACT_FROM    sender (default: Webleads <hej@webleads.dk>, see api/_mail.js)
//   META_CAPI_TOKEN optional, sends the Lead to Meta too (api/_meta.js)
//
// The visitor also gets the link to the draft by e-mail (once webleads.dk is verified in Resend).

import { cleanAnswers, encode, summary } from './_lib/udkast/bestilling.js';
import { sendToMeta, userData } from './_meta.js';
import { sendMail, receipt, esc, TO, SITE } from './_mail.js';

const clip = (v, n) => String(v ?? '').trim().slice(0, n);
// How and when the visitor wants us to get in touch (step 5)
const KANAL = { ring: ['Ring', 'ringer vi dig op', 'vil ringes op'], sms: ['Sms', 'sender vi dig en sms', 'vil have en sms'], mail: ['Mail', 'skriver vi til dig', 'vil have en mail'] };
const TID = { hurtigst: 'hurtigst muligt', formiddag: 'formiddag', eftermiddag: 'eftermiddag', aften: 'aften' };
const pickKey = (map, v) => (typeof v === 'string' && Object.hasOwn(map, v) ? v : '');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = typeof req.body === 'string' ? safeJson(req.body) : (req.body || {});
  const a = cleanAnswers(body.svar);
  const k = body.kontakt || {};
  const navn = clip(k.navn, 100), email = clip(k.email, 200), tlf = clip(k.tlf, 30), besked = clip(k.besked, 2000);
  const harSide = k.side === 'ja' ? `Ja${k.url ? ': ' + clip(k.url, 200) : ''}` : k.side === 'nej' ? 'Nej' : '–';
  const kanal = pickKey(KANAL, k.kanal), tid = pickKey(TID, k.tid);
  const kontaktes = [kanal && KANAL[kanal][0], tid && TID[tid]].filter(Boolean).join(', ') || '–';

  const link = `/mit-udkast?d=${encode(a)}`;
  // Honeypot: bots fill the hidden field. Pretend success.
  if (body._gotcha) return res.status(200).json({ ok: true, link });
  if (!a.n || !a.by || !navn || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Navn, e-mail, virksomhed og by er påkrævet.' });
  }

  const rows = [...summary(a), ['Har en side i dag', harSide], ['Kontakt', navn], ['E-mail', email], ['Telefon', tlf || '–'], ['Vil kontaktes', kontaktes]];
  let sent = false, kvittering = false;
  if (!process.env.RESEND_API_KEY) console.error('bestil: RESEND_API_KEY is not set, the order was not e-mailed');
  else {
    sent = await sendMail({
      to: [TO],
      reply_to: email,
      subject: `Ny bestilling: ${a.n} (${rows[0][1]} i ${a.by})${kanal ? ` · ${KANAL[kanal][2]}` : ''}`,
      text: `${rows.map(([t, v]) => `${t}: ${v}`).join('\n')}\n\nUdkast: ${SITE}${link}\n\n${besked}`,
      html: `<p><b>Ny bestilling via "Bestil en hjemmeside"</b></p><table cellpadding="4">${rows.map(([t, v]) => `<tr><td><b>${esc(t)}</b></td><td>${esc(v)}</td></tr>`).join('')}</table>`
        + `<p><a href="${SITE}${link}">Se udkastet</a></p>${besked ? `<p style="white-space:pre-wrap">${esc(besked)}</p>` : ''}`
    }, { toUs: true, tag: 'bestil' });

    // The link to the sketch for the visitor, so it is easy to find again
    kvittering = await sendMail({
      to: [email],
      reply_to: TO,
      subject: 'Din gratis skitse fra Webleads',
      ...receipt({
        navn,
        paras: [
          'Tak, fordi du bestilte en skitse til din nye hjemmeside. Her er linket til den, så du altid kan finde den igen.',
          `Skitsen er et udgangspunkt, og billeder og anmeldelser i den er eksempler. Inden for få timer på hverdage ${kanal ? KANAL[kanal][1] : 'kontakter vi dig'}, og så laver vi et færdigt udkast med dine egne billeder, tekster og ønsker. Klar på 7 dage, fra 3.000 kr. og ingen binding.`
        ],
        button: { label: 'Se din skitse', href: `${SITE}${link}` }
      })
    }, { tag: 'bestil' });
  }

  // Meta Conversions API: the same Lead as the browser pixel, only with consent
  if (body.meta_consent === 'yes' && typeof body.meta_event_id === 'string') {
    await sendToMeta([{
      event_name: 'Lead', event_time: Math.floor(Date.now() / 1000), event_id: body.meta_event_id.slice(0, 64),
      action_source: 'website', event_source_url: `${SITE}/`,
      user_data: userData(req, { email, name: navn }),
      custom_data: { content_name: `Bestil: ${rows[0][1]}`.slice(0, 100), value: 3000, currency: 'DKK' }
    }]);
  }

  return res.status(200).json({ ok: true, link, sent, kvittering });
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
