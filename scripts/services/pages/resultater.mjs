// /resultater: cases, numbers and reviews, with the same head, menu, intro, hero, contact and footer as the
// other pages (lib.mjs). Build: node scripts/services/build.mjs resultater
//
// The cases and quotes live in scripts/services/resultater-data.mjs, the customers on the wall in
// scripts/services/partnere.mjs. The only real numbers are the review scores in the hero badges (TRUST in
// lib.mjs); this page reads them from there, so they are only written in one place.
// While any case or quote is an example, the page is not indexed and shows a note at the top (p.robots and
// p.bar), and the wall shows the example customers. With only real cases left, both go away by themselves.
//
// The sections: the review scores, the featured case as a magazine spread (the case with historie), the
// cases with a filter by service, the customer wall and "Skal du være den næste?".
// Styles: assets/css/show/resultater.css. Behaviour: assets/js/show/resultater.js.
import { cases, quotes } from '../resultater-data.mjs';
import { partnerWall } from '../front/partnere.mjs';
import { partnere, eksempler } from '../partnere.mjs';

export default function ({ lib, data, showcase }) {
  const { esc, hero, contact, ORG } = lib;
  const TAG = '<span class="tag-eks">Eksempel</span>';
  const demo = cases.some(c => c.eksempel) || quotes.some(q => q.eksempel);
  const svcName = Object.fromEntries(data.services.map(s => [s.slug, s.t]));
  const quoteOf = c => quotes.find(q => q.case === c.id);
  const ini = n => ([...n][0] || '').toLocaleUpperCase('da-DK');
  // "Hansen VVS" → hansen-vvs.dk, "Brink Tømrer" → brink-toemrer.dk
  const domain = n => n.toLocaleLowerCase('da-DK').replace(/&/g, ' og ').replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.dk';
  const at = by => /^(frederiksberg|amager|nørrebro|østerbro|vesterbro|bornholm|fanø|mors|als|ærø|samsø|langeland|lolland|falster|møn|fyn|sjælland)$/i.test(by) ? 'på' : 'i';
  const photo = (b, sizes) => b.startsWith('/') ? `src="${esc(b)}"` : `src="/udkast/_faelles/billeder/${esc(b)}-480.webp" srcset="/udkast/_faelles/billeder/${esc(b)}-480.webp 480w, /udkast/_faelles/billeder/${esc(b)}.webp 896w" sizes="${sizes}"`;
  const vars = c => `--c:${esc(c.farve || '#111')};--s:${esc(c.lys || '#ecebe7')}`;
  const svcList = (c, ev) => `<ul class="rs-svc" aria-label="Services">${c.services.map(s => `<li><a href="/services/${esc(s)}" data-event="${ev}: ${esc(svcName[s] || s)}">${esc(svcName[s] || s)}</a></li>`).join('')}</ul>`;
  // "6,8 sek." → 6.8, "1.240" → 1240, "+62 %" → 62. NaN when it does not start with a number
  const val = s => { const m = String(s).trim().match(/^[+−×-]?(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d+))?/); return m ? parseFloat(m[1].replace(/\./g, '') + '.' + (m[2] || '0')) : NaN; };

  /* ---------------- The drawing of a customer's site, in their colours ---------------- */
  // Sized in container units, so the same drawing works in a card, on the spread and in the fan
  const page = (c, big = null) => `<div class="rs-mini__page">
              <div class="rs-mini__nav"><b class="rs-mini__logo"><i>${esc(ini(c.navn))}</i>${esc(c.navn)}</b>${big ? '<span class="rs-mini__menu"><i>Ydelser</i><i>Priser</i><i>Om os</i></span>' : ''}<span class="rs-mini__cta">${esc(c.knap)}</span></div>
              <div class="rs-mini__hero">
                <div class="rs-mini__copy"><small>${esc(c.fag)} ${at(c.by)} ${esc(c.by)}</small><strong>${esc(c.overskrift)}</strong><em></em><em></em><span class="rs-mini__btns"><span>${esc(c.knap)} →</span><span></span></span></div>
                <span class="rs-mini__ph"><img ${photo(c.billede || '', big ? '(max-width: 699px) 50vw, 260px' : '(max-width: 699px) 40vw, 180px')} width="480" height="600" alt="" loading="lazy" decoding="async"></span>
              </div>${big && big.length ? `
              <div class="rs-mini__cards">${big.slice(0, 3).map(([t, d]) => `<span><b>${esc(t)}</b><i>${esc(d)}</i></span>`).join('')}</div>` : ''}
            </div>`;
  const bar = c => `<div class="rs-mini__bar"><span class="rs-dots"><i></i><i></i><i></i></span><span class="rs-mini__url">🔒 ${esc(domain(c.navn))}</span></div>`;
  const mini = (c, cls = '', big = null) => c.billede && c.billede.startsWith('/')
    ? `<div class="rs-mini rs-mini--shot ${cls}">${bar(c)}<img class="rs-mini__shot" src="${esc(c.billede)}" alt="" loading="lazy" decoding="async"></div>`
    : `<div class="rs-mini ${cls}">${bar(c)}
            ${page(c, big)}
          </div>`;

  /* ---------------- The real review scores (from the hero badges) ---------------- */
  const badge = (cls, navn) => {
    const tag = (lib.TRUST.match(new RegExp(`<a class="trust__item trust__item--${cls}"[^>]*>`)) || [''])[0];
    const a = k => (tag.match(new RegExp(`\\s${k}="([^"]*)"`)) || [])[1] || '';
    const r = parseFloat(a('data-rating').replace(',', '.')), n = parseInt(a('data-reviews'), 10) || 0;
    return r > 0 && r <= 5 ? { cls, navn, r, n, href: /^https?:\/\//.test(a('href')) ? a('href') : '' } : null;
  };
  const scores = [badge('google', 'Google'), badge('tp', 'Trustpilot')].filter(Boolean);
  const dk1 = r => r.toLocaleString('da-DK', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const anm = n => n === 1 ? 'anmeldelse' : 'anmeldelser';
  const stars = r => [0, 1, 2, 3, 4].map(i => `<i style="--f:${Math.round(Math.max(0, Math.min(1, r - i)) * 100) / 100};--n:${i}"></i>`).join('');
  const score = s => {
    const tagName = s.href ? 'a' : 'div';
    const link = s.href ? ` href="${esc(s.href)}" target="_blank" rel="noopener" data-event="Resultater: ${esc(s.navn)}-anmeldelser"` : '';
    return `<${tagName} class="rs-sc"${link}>
          <span class="rs-sc__src">${esc(s.navn)}${s.href ? '<span class="rs-sc__go" aria-hidden="true">↗</span>' : ''}</span>
          <span class="rs-sc__big" aria-hidden="true"><span class="rs-sc__n" data-rs-odo>${dk1(s.r)}</span><span class="rs-sc__of">/5</span></span>
          <span class="rs-stars" aria-hidden="true">${stars(s.r)}</span>
          <span class="rs-sc__sub" aria-hidden="true"><b data-rs-cnt>${s.n.toLocaleString('da-DK')}</b> ${anm(s.n)}</span>
          <span class="sr-only">${esc(s.navn)}: ${dk1(s.r)} ud af 5 stjerner fra ${s.n} ${anm(s.n)}.</span>
        </${tagName}>`;
  };
  const reviews = scores.length ? `<section id="anmeldelser" class="show show--resultater rs-rev" data-sec="anmeldelser">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title"><div class="kicker">Anmeldelser</div><h2 class="h2">Rigtige kunder.<br><span class="dim">Rigtige stjerner.</span></h2></div>
        <p class="sec-head__lead">Det skriver kunderne om os på ${scores.map(s => esc(s.navn)).join(' og ')}.${demo ? ' Det er de eneste tal på siden, der ikke er eksempler.' : ''}</p>
      </div>
      <div class="spot rs-rev__box" data-spot data-reveal="1" data-rs-rev>
        ${scores.map(score).join('\n        ')}
      </div>
    </section>` : '';

  /* ---------------- The featured case, laid out as a magazine spread ---------------- */
  const f = cases.find(c => c.historie);
  let spread = '';
  if (f) {
    const h = f.historie, q = quoteOf(f), g = h.gammel || {}, ex = f.eksempel || (q && q.eksempel);
    const tal = (h.tal || []).slice(0, 3);
    // The change on each tile, with an arrow and a colour: green when it went the good way
    const delta = t => {
      const a = val(t.fra), b = val(t.til);
      if (!(a > 0) || !isFinite(b) || a === b) return '';
      const p = Math.round((b - a) / a * 100), good = t.lavere ? p < 0 : p > 0;
      return `<span class="rs-tile__d${good ? '' : ' is-bad'}"><i>${p > 0 ? '↑' : '↓'}</i>${Math.abs(p)} %</span>`;
    };
    const tile = (t, i) => `<div class="rs-tile" data-rs-tile style="--i:${i}">
            <span class="rs-tile__l">${esc(t.l)}</span>
            <b class="rs-tile__v" data-fra="${esc(t.fra)}">${esc(t.til)}</b>
            <span class="rs-tile__s">${esc(t.s || '')}</span>
            <span class="rs-tile__f"><span>før <s>${esc(t.fra)}</s></span>${delta(t)}</span>
          </div>`;
    const old = `<div class="rs-old">
              <div class="rs-old__head"><b>${esc(f.navn)} ApS</b><span><i>Forside</i><i>Om os</i><i>Ydelser</i><i>Kontakt</i></span></div>
              <div class="rs-old__hero"><b>${esc(g.titel || 'Velkommen')}</b><span>${esc(g.under || '')}</span><i>Læs mere</i></div>
              <div class="rs-old__body"><span></span><span></span><span></span><span></span></div>
            </div>`;
    spread = `<section id="case" class="show show--resultater rs-case" data-sec="case" style="${vars(f)}">
      <div class="rs-spread" data-rs-spread>
        <article class="rs-pg rs-pg--l" aria-labelledby="rs-case-h">
          <div class="rs-run" aria-hidden="true"><span>Webleads · Cases</span><i></i></div>
          <div class="kicker rs-kick">Case · ${esc(f.fag)} ${at(f.by)} ${esc(f.by)}${ex ? ' ' + TAG : ''}</div>
          <h2 class="h2 rs-h" id="rs-case-h"><span class="rs-ln"><span>${esc(h.h2[0])}</span></span> <span class="rs-ln"><span class="dim">${esc(h.h2[1])}</span></span></h2>
          <p class="rs-txt">${esc(h.tekst)}</p>${q ? `
          <figure class="rs-pq">
            <blockquote><p>${esc(q.tekst)}</p></blockquote>
            <figcaption><i aria-hidden="true">${esc(ini(q.navn))}</i><span><b>${esc(q.navn)}</b>${esc(q.rolle)}, ${esc(f.navn)}</span></figcaption>
          </figure>` : ''}
        </article>
        <div class="rs-pg rs-pg--r">
          <div class="rs-run" aria-hidden="true"><i></i><span>${esc(f.navn)} · ${esc(f.by)}</span></div>
          <div class="rs-shots" aria-hidden="true">${g.aar ? `
            <div class="rs-print"><div class="rs-print__in">${old}</div><span class="rs-print__cap">Før · ${esc(g.aar)}</span></div>` : ''}
            <div class="rs-site">${mini(f, 'rs-mini--big', h.ydelser || [])}</div>
          </div>
          <div class="spot rs-big" data-spot aria-hidden="true">
            <div class="rs-big__t"><span class="rs-big__k">Resultatet</span><b class="rs-big__n" data-rs-big>${esc(h.resultat.v)}</b><span class="rs-big__l">${esc(h.resultat.l)}</span></div>
            <svg class="rs-big__w" viewBox="4 12 56 40" aria-hidden="true"><path class="rs-big__g" d="M4 18H60M4 31.5H60M4 45H60"/><path class="rs-w" pathLength="1" d="M12 24L20.5 45L31 29L41.5 45L51 18"/><path class="rs-w rs-w--h" pathLength="1" d="M42.2 24.4L51 18L53.5 28.6"/></svg>
          </div>${h.billedtekst ? `
          <p class="rs-cap"><i aria-hidden="true">↑</i>${esc(h.billedtekst)}</p>` : ''}
          <div class="rs-did"><span>Det lavede vi</span>${svcList(f, 'Case')}</div>
        </div>
        <div class="rs-tiles" aria-hidden="true">
          ${tal.map(tile).join('\n          ')}
        </div>
        <p class="sr-only">${ex ? 'Eksempel: ' : ''}${esc(f.navn)} i ${esc(f.by)}. ${tal.map(t => `${esc(t.l)}: fra ${esc(t.fra)} til ${esc(t.til)}${t.s ? ' ' + esc(t.s) : ''}`).join('. ')}. Resultatet: ${esc(h.resultat.v)} ${esc(h.resultat.l)}.</p>
      </div>
      <div class="rs-after">
        <a href="#cases" class="rs-after__more" data-event="Case: Se alle cases">Se alle cases ↓</a>
        <span class="rs-after__end">
          <button type="button" class="rs-replay" data-rs-replay hidden>Se den igen <span aria-hidden="true">↻</span></button>
          <a href="#kontakt" class="btn btn--dark rs-after__cta" data-magnet data-burst data-event="Case: Få en fast pris">Få en fast pris →</a>
        </span>
      </div>
    </section>`;
  }

  /* ---------------- The cases, with a filter by service ---------------- */
  // A button for each service some of the cases use (one that every case uses would filter nothing)
  const used = data.services.map(s => [s.slug, s.t, cases.filter(c => c.services.includes(s.slug)).length]).filter(([, , n]) => n && n < cases.length);
  const res = r => `<div class="rs-res1"><b data-rs-n${r.fra ? ` data-fra="${esc(r.fra)}"` : ''}>${esc(r.v)}</b><span>${esc(r.l)}</span></div>`;
  const card = (c, i) => {
    const q = quoteOf(c);
    return `<article class="rs-card" data-rs-card data-s="${esc(c.services.join(' '))}" style="${vars(c)};--d:${i % 3}">
          <div class="rs-card__shot" aria-hidden="true">${c.eksempel ? `<span class="rs-card__tag">${TAG}</span>` : ''}
            ${mini(c)}
          </div>
          <div class="rs-card__body">
            <span class="rs-card__meta">${esc(c.fag)} · ${esc(c.by)}${c === f ? '<a href="#case" data-event="Cases: Læs casen">Læs casen ↑</a>' : ''}</span>
            <h3 class="rs-card__name">${esc(c.navn)}</h3>
            <div class="rs-card__res">${c.resultater.slice(0, 2).map(res).join('')}</div>
            ${q ? `<blockquote class="rs-card__q"><p>${esc(q.tekst)}</p><footer>${esc(q.navn)}, ${esc(q.rolle)}</footer></blockquote>` : `<p class="rs-card__q rs-card__q--txt">${esc(c.tekst)}</p>`}
            ${svcList(c, 'Cases')}
          </div>
        </article>`;
  };
  const gallery = cases.length ? `<section id="cases" class="show show--resultater rs-gal" data-sec="cases">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title"><div class="kicker">Cases</div><h2 class="h2">Udvalgte kunder.<br><span class="dim">Og hvad de fik ud af det.</span></h2></div>
        <p class="sec-head__lead">Vælg en service, og se, hvad den har gjort for andre.</p>
      </div>${used.length ? `
      <div class="rs-filter" role="group" aria-label="Vis cases med" data-reveal="1">
        <button type="button" class="rs-chip is-on" data-rs-f="" aria-pressed="true">Alle<span aria-hidden="true">${cases.length}</span></button>
        ${used.map(([s, t, n]) => `<button type="button" class="rs-chip" data-rs-f="${esc(s)}" data-label="${esc(t)}" aria-pressed="false">${esc(t)}<span aria-hidden="true">${n}</span></button>`).join('\n        ')}
      </div>
      <p class="sr-only" aria-live="polite" data-rs-live></p>` : ''}
      <div class="rs-grid" data-rs-grid>
        ${cases.map(card).join('\n        ')}
      </div>
      <div class="rs-meter" aria-hidden="true"><span data-rs-mn>01</span><i><b data-rs-mb></b></i><span data-rs-mt>${String(cases.length).padStart(2, '0')}</span></div>
    </section>` : '';

  /* ---------------- The customers: real ones, or the examples while the page is a demo ---------------- */
  const list = partnere.length ? partnere : demo ? eksempler : [];
  const wallHtml = partnerWall({ list, eksempel: !partnere.length });
  const wall = wallHtml ? `<section id="kunder" class="show show--resultater rs-wall" data-sec="kunder">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title"><div class="kicker">Kunder</div><h2 class="h2">Dem har vi hjulpet.<br><span class="dim">${partnere.length ? 'Webshops og lokale virksomheder.' : 'Lokale virksomheder.'}</span></h2></div>
        <p class="sec-head__lead">${partnere.length ? 'Tryk på et navn for at se deres side.' : 'Håndværkere, klinikker, frisører og webshops. Fra hele landet.'}</p>
      </div>
      ${wallHtml}
    </section>` : '';

  /* ---------------- Skal du være den næste? ---------------- */
  const fan = cases.filter(c => c !== f).slice(0, 3);
  const next = `<section id="naeste" class="show show--resultater rs-next" data-sec="naeste">
      <div class="rs-next__box" data-reveal="0" data-rs-next>
        <div class="rs-next__txt">
          <h2 class="rs-next__h">Skal du være<br>den næste?</h2>
          <p>Fortæl os, hvad du laver, og hvad du vil have flere af. Så får du en fast pris inden for 24 timer.</p>
          <div class="rs-next__btns">
            <a href="#kontakt" class="btn rs-next__btn" data-magnet data-burst data-event="Næste: Få en fast pris">Få en fast pris →</a>
            <a href="/bestil" class="rs-next__link" data-bestil="resultater" data-event="Næste: Se et gratis udkast">Se et gratis udkast</a>
          </div>
        </div>
        <div class="rs-fan" data-rs-fan aria-hidden="true">
          ${fan.map((c, i) => `<div class="rs-fan__c" style="${vars(c)};--i:${i - fan.length / 2};--j:${Math.abs(i - fan.length / 2)}">${mini(c)}</div>`).join('\n          ')}
          <div class="rs-fan__c rs-fan__you" style="--i:${fan.length / 2};--j:${fan.length / 2}"><span class="rs-fan__plus">+</span><b data-rs-you="navn">Din virksomhed</b><span data-rs-you="sted">Dit fag · Din by</span><em>Din side her?</em></div>
          ${fan.some(c => c.eksempel) ? `<span class="rs-fan__tag">${TAG}</span>` : ''}
        </div>
      </div>
    </section>`;

  /* ---------------- The page ---------------- */
  const SITE = data.SITE, u = `${SITE}/resultater`;
  // Without cases the page is about the customers and the reviews, and promises no numbers
  const real = cases.length > 0;
  const title = real ? 'Resultater · Cases og anmeldelser · Webleads' : 'Resultater · Kunder og anmeldelser · Webleads';
  const description = real ? 'Se hvad vi har lavet for håndværkere, klinikker, frisører og webshops, og hvad det har givet. Med rigtige anmeldelser fra Google og Trustpilot.'
    : 'Se nogle af de webshops og lokale virksomheder, vi har hjulpet, og hvad kunderne skriver om os på Google og Trustpilot.';
  const pt = showcase('partnere'), me = showcase('resultater');
  const nav = [['Services', '/#services'], reviews && ['Anmeldelser', '#anmeldelser'], gallery && ['Cases', '#cases'], wall && ['Kunder', '#kunder']].filter(Boolean);
  const p = {
    pageType: 'resultater', slug: 'resultater', title, description, url: u,
    og: '/assets/og/forside.png', ogAlt: 'Webleads: cases, resultater og anmeldelser.',
    ...(demo ? { robots: 'noindex, nofollow', bar: 'Demo: kunderne, tallene og citaterne er eksempler, indtil de rigtige er på plads.' } : {}),
    tag: 'Resultater', subject: 'Møde med Webleads',
    msg: 'Hej, jeg har set jeres cases på webleads.dk og vil gerne høre mere. Kan vi opsætte et møde?',
    nav, css: [...(wall ? pt.css : []), ...me.css], js: [...(wall ? pt.js : []), ...me.js],
    ld: {
      '@context': 'https://schema.org',
      '@graph': [
        ORG,
        { '@type': 'WebPage', '@id': `${u}#side`, url: u, name: title, description, isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': ORG['@id'] }, breadcrumb: { '@id': `${u}#sti` }, inLanguage: 'da-DK' },
        { '@type': 'BreadcrumbList', '@id': `${u}#sti`, itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Forside', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Resultater', item: u }
        ] }
      ]
    }
  };

  return {
    slug: 'resultater', path: 'resultater/index.html', p,
    main: [
      real ? hero({
        badge: 'Cases · til', words: ['servicevirksomheder', 'håndværkere', 'klinikker', 'frisører', 'lokale virksomheder'],
        h1: { a: ['Det', 'har', 'vi'], hot: 'lavet.', dim: 'Og det', mark: 'virker.' },
        lead: 'Hjemmesider, annoncer og SEO til håndværkere, klinikker, frisører og alle de andre. Se hvad vi har lavet, og hvad det har givet.',
        floats: ['Før → efter', 'Ingen binding', 'Fast pris ↗'], ring: 'CASES • TAL • ANMELDELSER • RESULTATER • ',
        cta: 'Få en fast pris', more: f ? ['Se en case', '#case'] : ['Se cases', '#cases']
      }) : hero({
        badge: 'Kunder · fra', words: ['webshops', 'håndværkere', 'lokale virksomheder'],
        h1: { a: ['Dem', 'har', 'vi'], hot: 'hjulpet.', dim: 'Bliv den', mark: 'næste.' },
        lead: `Webshops, håndværkere og lokale virksomheder, som vi har hjulpet.${scores.length ? ` Se hvem de er, og hvad kunderne skriver om os på ${scores.map(s => esc(s.navn)).join(' og ')}.` : ''}`,
        floats: ['Rigtige kunder', 'Rigtige anmeldelser', 'Fast pris ↗'], ring: 'KUNDER • ANMELDELSER • WEBLEADS • ',
        cta: 'Få en fast pris', more: wall ? ['Se kunderne', '#kunder'] : ['Se anmeldelserne', '#anmeldelser']
      }),
      reviews,
      spread,
      gallery,
      wall,
      next,
      contact({ lead: 'Fortæl os om din virksomhed, og hvad du vil have flere af. Vi svarer inden for 24 timer med en fast pris.', base: '', value: 0, placeholder: 'Hvad laver din virksomhed, og hvad vil du have flere af?' })
    ]
  };
}
