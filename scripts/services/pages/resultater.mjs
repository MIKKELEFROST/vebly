// /resultater: cases, numbers and reviews, with the same head, menu, intro, hero, contact and footer as the
// other pages (lib.mjs). Build: node scripts/services/build.mjs resultater
//
// The cases and quotes live in scripts/services/resultater-data.mjs, the customers on the wall in
// scripts/services/partnere.mjs. The only real numbers are the review scores in the hero badges (TRUST in
// lib.mjs); this page reads them from there, so they are only written in one place.
// While any case or quote is an example, the page is not indexed and shows a note at the top (p.robots and
// p.bar), and the wall shows the example customers. With only real cases left, both go away by themselves.
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
  const photo = b => b.startsWith('/') ? `src="${esc(b)}"` : `src="/udkast/_faelles/billeder/${esc(b)}-480.webp" srcset="/udkast/_faelles/billeder/${esc(b)}-480.webp 480w, /udkast/_faelles/billeder/${esc(b)}.webp 896w" sizes="(max-width: 699px) 40vw, 300px"`;
  const vars = c => `--c:${esc(c.farve || '#111')};--s:${esc(c.lys || '#ecebe7')}`;

  /* ---------------- The drawing of a customer's site, in their colours ---------------- */
  // Sized in container units, so the same drawing works in a card, in the story and in the fan
  const page = (c, big = null) => `<div class="rs-mini__page">
              <div class="rs-mini__nav"><b class="rs-mini__logo"><i>${esc(ini(c.navn))}</i>${esc(c.navn)}</b>${big ? '<span class="rs-mini__menu"><i>Ydelser</i><i>Priser</i><i>Om os</i></span>' : ''}<span class="rs-mini__cta">${esc(c.knap)}</span></div>
              <div class="rs-mini__hero">
                <div class="rs-mini__copy"><small>${esc(c.fag)} ${at(c.by)} ${esc(c.by)}</small><strong>${esc(c.overskrift)}</strong><em></em><em></em><span class="rs-mini__btns"><span>${esc(c.knap)} →</span><span></span></span></div>
                <span class="rs-mini__ph"><img ${photo(c.billede || '')} width="480" height="600" alt="" loading="lazy" decoding="async"></span>
              </div>${big && big.length ? `
              <div class="rs-mini__cards">${big.slice(0, 3).map(([t, d]) => `<span><b>${esc(t)}</b><i>${esc(d)}</i></span>`).join('')}</div>` : ''}
            </div>`;
  const bar = c => `<div class="rs-mini__bar"><span class="rs-dots"><i></i><i></i><i></i></span><span class="rs-mini__url">🔒 ${esc(domain(c.navn))}</span></div>`;
  const mini = c => c.billede && c.billede.startsWith('/')
    ? `<div class="rs-mini rs-mini--shot">${bar(c)}<img class="rs-mini__shot" src="${esc(c.billede)}" alt="" loading="lazy" decoding="async"></div>`
    : `<div class="rs-mini">${bar(c)}
            ${page(c)}
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
  const stars = r => [0, 1, 2, 3, 4].map(i => `<i style="--f:${Math.round(Math.max(0, Math.min(1, r - i)) * 100) / 100}"></i>`).join('');
  const score = s => {
    const tagName = s.href ? 'a' : 'div';
    const link = s.href ? ` href="${esc(s.href)}" target="_blank" rel="noopener" data-event="Resultater: ${esc(s.navn)}-anmeldelser"` : '';
    return `<${tagName} class="rs-sc rs-sc--${s.cls}"${link}>
          <span class="rs-sc__src">${esc(s.navn)}${s.href ? '<span class="rs-sc__go" aria-hidden="true">↗</span>' : ''}</span>
          <span class="rs-sc__big" aria-hidden="true"><span class="rs-sc__n" data-rs-odo>${dk1(s.r)}</span><span class="rs-sc__of">/5</span></span>
          <span class="rs-stars" aria-hidden="true">${stars(s.r)}</span>
          <span class="rs-sc__sub" aria-hidden="true"><b data-rs-cnt>${s.n.toLocaleString('da-DK')}</b> ${s.n === 1 ? 'anmeldelse' : 'anmeldelser'}</span>
          <span class="sr-only">${esc(s.navn)}: ${dk1(s.r)} ud af 5 stjerner fra ${s.n} ${s.n === 1 ? 'anmeldelse' : 'anmeldelser'}.</span>
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

  /* ---------------- The featured case, told as a scroll story ---------------- */
  const f = cases.find(c => c.historie);
  let story = '';
  if (f) {
    const h = f.historie, q = quoteOf(f), old = h.gammel || {}, ad = h.annonce, dom = domain(f.navn);
    // The parts of the scroll (0–1) where each number changes: in step 2, 3 and 4
    const K = ['.25 .37', '.5 .63', '.73 .85'];
    story = `<section id="case" class="show show--resultater rs-story" data-sec="case" style="${vars(f)}">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title"><div class="kicker rs-kick">Case · ${esc(f.navn)}, ${esc(f.by)}${f.eksempel ? ' ' + TAG : ''}</div><h2 class="h2">${esc(h.h2[0])}<br><span class="dim">${esc(h.h2[1])}</span></h2></div>
        <p class="sec-head__lead">${esc(h.lead)}</p>
      </div>
      <div class="rs-pin" data-rs-pin>
        <div class="rs-pin__sticky" data-rs-sticky>
          <div class="rs-pin__fit" data-rs-fit>
            <div class="rs-steps">
              <div class="kicker">Sådan gik det</div>
              ${h.trin.map(([t, d], i) => `<div class="rs-step${i ? '' : ' is-on'}" data-rs-step>
                <button type="button" class="rs-step__n" aria-label="Vis trin ${i + 1}">${String(i + 1).padStart(2, '0')}</button>
                <div class="rs-step__b"><h3>${esc(t)}</h3><p>${esc(d)}</p>${i === h.trin.length - 1 ? '\n                  <a href="#kontakt" class="rs-cta" data-rs-cta data-event="Case: Få en fast pris">Få en fast pris →</a>' : ''}</div>
              </div>`).join('\n              ')}
            </div>
            <div class="rs-stage" aria-hidden="true">
              <div class="rs-br" data-rs-br>
                <div class="rs-br__bar"><span class="rs-dots"><i></i><i></i><i></i></span><span class="rs-br__url"><span class="rs-br__warn">⚠ Ikke sikker <i>|</i></span><span class="rs-br__lock">🔒</span>${esc(dom)}</span><span class="rs-br__st"><span class="rs-br__st0">Fra ${esc(old.aar || 'før')}</span><span class="rs-br__st1">● Ny side</span></span></div>
                <div class="rs-br__scr">
                  <div class="rs-old">
                    <span class="rs-old__load" data-k="0 .19"></span>
                    <div class="rs-old__head"><b>${esc(f.navn)} ApS</b><span><i>Forside</i><i>Om os</i><i>Ydelser</i><i>Galleri</i><i>Kontakt</i></span></div>
                    <div class="rs-old__hero"><b>${esc(old.titel || 'Velkommen')}</b><span>${esc(old.under || '')}</span><i>Læs mere</i><span class="rs-old__pg"><i></i><i></i><i></i></span></div>
                    <div class="rs-old__body"><div><b>Om os</b><span>${esc(f.navn)} ApS har i mange år leveret løsninger til både private og erhvervskunder. Vi lægger stor vægt på kvalitet, service og en god dialog med vores kunder.</span></div><div class="rs-old__box"><b>Kontakt</b><span>${esc(f.by)}</span><span>Man–fre 7–16</span></div></div>
                    <div class="rs-old__foot">© ${esc(old.aar || '')} ${esc(f.navn)} ApS</div>
                  </div>
                  <div class="rs-new" data-k=".21 .33"><div class="rs-new__in"><div class="rs-mini rs-mini--big">${page(f, h.ydelser || [])}</div></div></div>
                  <div class="rs-wipe" data-k=".21 .33"><i></i></div>
                </div>
              </div>${ad ? `
              <div class="rs-ad" data-k=".47 .55">
                <span class="rs-ad__top">${ad.label ? `<b>${esc(ad.label)}</b> · ` : ''}${esc(dom)}</span>
                <span class="rs-ad__t">${esc(ad.titel)}</span>
                <span class="rs-ad__d">${esc(ad.tekst)}</span>
                <span class="rs-ad__btns"><span class="is-call">Ring</span><span>Hjemmeside</span></span>
              </div>` : ''}
              <div class="rs-res spot" data-spot data-k=".71 .79">
                <span class="kicker">Resultatet</span>
                <b class="rs-res__n" data-rs-res data-k="${K[2]}">${esc(h.resultat.v)}</b>
                <span class="rs-res__l">${esc(h.resultat.l)}</span>
                <svg class="rs-res__w" viewBox="8 14 50 35" fill="none" stroke-linecap="round" stroke-linejoin="round"><path pathLength="1" data-rs-w data-k=".77 .9" d="M12 24L20.5 45L31 29L41.5 45L51 18"/><path pathLength="1" data-rs-w data-k=".89 .94" d="M42.2 24.4L51 18L53.5 28.6"/></svg>${q ? `
                <span class="rs-res__q" data-k=".88 .95">»${esc(q.tekst.split(/(?<=\.)\s/)[0])}«<b>${esc(q.navn)}, ${esc(q.rolle)}</b></span>` : ''}
              </div>
              <div class="rs-tal">
                ${h.tal.slice(0, 3).map((t, i) => `<div class="rs-tal__i" data-rs-tal data-k="${K[i]}" data-fra="${esc(t.fra)}" data-til="${esc(t.til)}"><span class="rs-tal__l">${esc(t.l)}</span><span class="rs-tal__v"><s>${esc(t.fra)}</s><b>${esc(t.til)}</b></span><span class="rs-tal__s">${esc(t.s || '')}</span></div>`).join('\n                ')}
              </div>
              <span class="rs-stage__tag">${TAG}</span>
            </div>
            <p class="sr-only">Eksempel: ${esc(f.navn)} i ${esc(f.by)}. ${h.tal.map(t => `${t.l}: fra ${t.fra} til ${t.til}${t.s ? ' ' + t.s : ''}`).join('. ')}. Resultatet: ${esc(h.resultat.v)} ${esc(h.resultat.l)}.</p>
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ---------------- The cases, with a filter by service ---------------- */
  const used = data.services.map(s => [s.slug, s.t, cases.filter(c => c.services.includes(s.slug)).length]).filter(([, , n]) => n);
  const res = r => `<div class="rs-res1"><b data-rs-n${r.fra ? ` data-fra="${esc(r.fra)}"` : ''}>${esc(r.v)}</b><span>${esc(r.l)}</span></div>`;
  const card = (c, i) => {
    const q = quoteOf(c);
    return `<article class="rs-card" data-rs-card data-s="${esc(c.services.join(' '))}" style="${vars(c)};--d:${i % 3}">
          <div class="rs-card__shot" aria-hidden="true">${c.eksempel ? `<span class="rs-card__tag">${TAG}</span>` : ''}
            ${mini(c)}
          </div>
          <div class="rs-card__body">
            <span class="rs-card__meta">${esc(c.fag)} · ${esc(c.by)}</span>
            <h3 class="rs-card__name">${esc(c.navn)}</h3>
            <div class="rs-card__res">${c.resultater.slice(0, 2).map(res).join('')}</div>
            ${q ? `<blockquote class="rs-card__q"><p>${esc(q.tekst)}</p><footer>${esc(q.navn)}, ${esc(q.rolle)}</footer></blockquote>` : `<p class="rs-card__q rs-card__q--txt">${esc(c.tekst)}</p>`}
            <ul class="rs-card__svc" aria-label="Services">${c.services.map(s => `<li><a href="/services/${esc(s)}" data-event="Cases: ${esc(svcName[s] || s)}">${esc(svcName[s] || s)}</a></li>`).join('')}</ul>
          </div>
        </article>`;
  };
  const gallery = cases.length ? `<section id="cases" class="show show--resultater rs-gal" data-sec="cases">
      <div class="sec-head" data-reveal="0">
        <div class="sec-head__title"><div class="kicker">Cases</div><h2 class="h2">Udvalgte kunder.<br><span class="dim">Og hvad de fik ud af det.</span></h2></div>
        <p class="sec-head__lead">Vælg en service, og se, hvad den har gjort for andre.</p>
      </div>
      <div class="rs-filter" role="group" aria-label="Vis cases med" data-reveal="1">
        <button type="button" class="rs-chip is-on" data-rs-f="" aria-pressed="true">Alle<span aria-hidden="true">${cases.length}</span></button>
        ${used.map(([s, t, n]) => `<button type="button" class="rs-chip" data-rs-f="${esc(s)}" data-label="${esc(t)}" aria-pressed="false">${esc(t)}<span aria-hidden="true">${n}</span></button>`).join('\n        ')}
      </div>
      <p class="sr-only" aria-live="polite" data-rs-live></p>
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
        <div class="sec-head__title"><div class="kicker">Kunder</div><h2 class="h2">Dem har vi hjulpet.<br><span class="dim">Lokale virksomheder.</span></h2></div>
        <p class="sec-head__lead">Håndværkere, klinikker, frisører og webshops. Fra hele landet.</p>
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
  const title = 'Resultater · Cases og anmeldelser · Webleads';
  const description = 'Se hvad vi har lavet for håndværkere, klinikker, frisører og webshops, og hvad det har givet. Med rigtige anmeldelser fra Google og Trustpilot.';
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
      hero({
        badge: 'Cases · til', words: ['servicevirksomheder', 'håndværkere', 'klinikker', 'frisører', 'lokale virksomheder'],
        h1: { a: ['Det', 'har', 'vi'], hot: 'lavet.', dim: 'Og det', mark: 'virker.' },
        lead: 'Hjemmesider, annoncer og SEO til håndværkere, klinikker, frisører og alle de andre. Se hvad vi har lavet, og hvad det har givet.',
        floats: ['Tal, du kan se', 'Ingen binding', 'Fast pris ↗'], ring: 'CASES • TAL • ANMELDELSER • RESULTATER • ',
        cta: 'Få en fast pris', more: f ? ['Se en case', '#case'] : ['Se cases', '#cases']
      }),
      reviews,
      story,
      gallery,
      wall,
      next,
      contact({ lead: 'Fortæl os om din virksomhed, og hvad du vil have flere af. Vi svarer inden for 24 timer med en fast pris.', base: '', value: 0, placeholder: 'Hvad laver din virksomhed, og hvad vil du have flere af?' })
    ]
  };
}
