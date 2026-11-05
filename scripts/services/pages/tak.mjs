// /tak/<side>: the thank-you page after the contact form. Build: node scripts/services/build.mjs tak
//
// The form on every page sends the visitor here when the message has gone through (assets/js/main.js),
// to /tak/<the page the form was on>: /tak/forside, /tak/resultater or /tak/<service slug>, for instance
// /tak/meta-ads. So every lead has a URL that says where it came from, and a tool can count leads by URL:
// "contains /tak" is every lead, "contains /tak/meta-ads" the ones from the Meta Ads page.
// There is one page, tak/index.html: vercel.json serves it for every /tak/<side> and keeps the address, so
// a new page with the form gets its own thank-you address by itself. assets/js/show/tak.js puts the name
// of the service in (from the list in data-tak-sider) and counts the lead (generate_lead to GA4, Lead to
// Meta), only right after a real submit: a reload or a direct visit is only a page view.
// Not indexed (robots meta here and X-Robots-Tag in vercel.json), not in the sitemap.
import { partnerSection } from '../front/partnere.mjs';
import { partnere } from '../partnere.mjs';

export default function ({ lib, data, showcase }) {
  const { esc, hero, cards, ORG } = lib;
  const band = partnere.length ? { ...showcase('partnere'), html: partnerSection({ list: partnere }) } : { html: '', css: [], js: [] };
  const own = showcase('tak');

  // What the visitor wrote to us about, by the end of the address (/tak/meta-ads → Meta Ads)
  const names = Object.fromEntries(data.services.map(s => [s.slug, s.t]));

  const u = `${data.SITE}/tak`;
  const title = 'Tak for din besked · Webleads';
  const description = 'Vi har fået din besked og vender tilbage inden for 24 timer.';
  // Step 1 says "receipt on its way" only when /api/contact really sent one (tak.js shows it)
  const steps = cards({
    id: 'naeste', sec: 'naeste', kicker: 'Det sker nu',
    h2: 'Tre trin.<br><span class="dim">Så er vi i gang.</span>',
    list: [
      ['Din besked er sendt.', 'Den er kommet frem til os.', '✓'],
      ['Svar inden for 24 timer.', 'Vi læser din besked og vender tilbage til dig.', '24'],
      ['Fast pris.', 'Du kender prisen, før vi går i gang. Ingen overraskelser.', 'kr']
    ]
  }).replace('<p>Den er kommet frem til os.</p>', '<p>Den er kommet frem til os.<span data-tak-mail hidden> Du har også fået en kvittering på mail.</span></p>');

  return {
    slug: 'tak', path: 'tak/index.html',
    p: {
      pageType: 'tak', slug: '', robots: 'noindex, nofollow',
      title, description, url: u, og: '/assets/og/forside.png', ogAlt: 'Webleads: tak for din besked.',
      tag: 'Tak for din besked', subject: 'Min besked til Webleads',
      msg: 'Hej, jeg har lige skrevet til jer via webleads.dk.',
      nav: [['Services', '/#services'], ['Resultater', '/resultater']],
      css: [...band.css, ...own.css], js: [...band.js, ...own.js],
      ld: { '@context': 'https://schema.org', '@graph': [ORG, { '@type': 'WebPage', '@id': `${u}#side`, url: u, name: title, inLanguage: 'da-DK' }] }
    },
    main: [
      hero({
        badge: 'Din besked er', words: ['modtaget'],
        h1: { a: ['Tak', 'for', 'din'], hot: 'besked.', dim: 'Vi vender', mark: 'tilbage.' },
        lead: 'Vi har fået din besked og vender tilbage inden for 24 timer.',
        floats: ['Modtaget ✓', 'Svar inden for 24 timer', 'Fast pris ↗'], ring: 'TAK • VI VENDER TILBAGE • WEBLEADS • ',
        cta: 'Haster det?', more: ['Det sker nu', '#naeste']
      }),
      `<script type="application/json" data-tak-sider>${JSON.stringify(names).replace(/</g, '\\u003c')}</script>`,
      steps,
      band.html,
      `<section id="kontakt" class="contact-sec tak-kontakt" data-sec="kontakt">
    <div class="spot contact" data-reveal="0" data-spot>
      <div class="contact__info">
        <h2>Haster det?</h2>
        <p class="contact__lead">Ring eller skriv en sms, så tager vi den derfra. Eller send en mail, hvis du har glemt at fortælle os noget.</p>
        <div class="contact__links">
          <a href="tel:+4541826799" data-event="Tak: Ring">41 82 67 99</a>
          <a href="mailto:hej@webleads.dk" data-event="Tak: E-mail">hej@webleads.dk</a>
          <a href="/resultater" data-event="Tak: Resultater">Se hvem vi har hjulpet →</a>
        </div>
      </div>
    </div>
  </section>`
    ]
  };
}
