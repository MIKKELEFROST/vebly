// Referencer: renders the case cards, the trade filter and the scroll reveal.
// DEMO: every case below is an example. Replace with real customers before the page is linked.
import { track } from '/assets/js/analytics.js';

const cases = [
  { name: 'Hansen VVS', trade: 'VVS', city: 'Vejle', group: 'haandvaerk', color: '#1f5f4a', soft: '#e2efe9', h: 'Hurtig hjælp. Fast pris.', cta: 'Ring nu',
    quote: 'Fra en side fra 2012 til en, der faktisk giver opkald.', services: ['Hjemmeside', 'Google Ads'],
    results: [['Opkald fra siden', '+62 %'], ['Indlæsning', '6,8 → 0,9 sek.']] },
  { name: 'Klinik Fryd', trade: 'Fysioterapeut', city: 'Aarhus', group: 'klinik', color: '#2b4c7e', soft: '#e3eaf5', h: 'Fri for smerter. Hurtigere.', cta: 'Book tid',
    quote: 'Online booking direkte på siden og side 1 på Google lokalt.', services: ['Hjemmeside', 'SEO', 'Booking'],
    results: [['Bookinger online', '71 %'], ['Google', 'Side 1 lokalt']] },
  { name: 'Salon Lys', trade: 'Frisør', city: 'Odense', group: 'skoenhed', color: '#b0476b', soft: '#f6e4ea', h: 'Hår, der holder hele ugen.', cta: 'Book nu',
    quote: 'Instagram-annoncer og en side, der sender folk direkte til booking.', services: ['Hjemmeside', 'Meta Ads'],
    results: [['Nye kunder', '+38 / md.'], ['Pris pr. booking', '41 kr.']] },
  { name: 'Kofoed Maler', trade: 'Maler', city: 'Roskilde', group: 'haandvaerk', color: '#c2702a', soft: '#f8ead9', h: 'Malet ordentligt. Første gang.', cta: 'Få tilbud',
    quote: 'Tilbudsformular med billeder, så de kan give pris uden at køre ud.', services: ['Hjemmeside', 'Automations'],
    results: [['Tilbudsforespørgsler', '×3'], ['Svartid', '1 time']] },
  { name: 'Ren Hverdag', trade: 'Rengøring', city: 'Aalborg', group: 'service', color: '#2f7d8c', soft: '#e0f0f2', h: 'Rent hjem. Hver anden uge.', cta: 'Beregn pris',
    quote: 'Prisberegner på siden og automatiske påmindelser til kunderne.', services: ['Hjemmeside', 'Interne systemer'],
    results: [['Faste kunder', '+54'], ['Udeblivelser', '−80 %']] },
  { name: 'Brink Tømrer', trade: 'Tømrer', city: 'Silkeborg', group: 'haandvaerk', color: '#5b4636', soft: '#efe7df', h: 'Tag, terrasse og tilbygning.', cta: 'Ring nu',
    quote: 'Galleri med egne projekter og Google-profil sat helt op.', services: ['Hjemmeside', 'SEO'],
    results: [['Visninger på Google', '+210 %'], ['Anmeldelser', '12 → 47']] },
  { name: 'Lund El', trade: 'Elektriker', city: 'Kolding', group: 'haandvaerk', color: '#a87c00', soft: '#fbf1cf', h: 'Strøm på. Samme dag.', cta: 'Ring nu',
    quote: 'Google Ads på akutopgaver og en side, der virker med én hånd på mobilen.', services: ['Hjemmeside', 'Google Ads'],
    results: [['Akutopkald', '+44 / md.'], ['Pris pr. opkald', '68 kr.']] },
  { name: 'Revisorhuset Nord', trade: 'Revisor', city: 'Hjørring', group: 'service', color: '#111111', soft: '#ecebe7', h: 'Styr på tallene. Hele året.', cta: 'Book møde',
    quote: 'Rolig, troværdig side og et kundeportal-login til dokumenter.', services: ['Hjemmeside', 'Interne systemer'],
    results: [['Mails om dokumenter', '−65 %'], ['Nye kunder', '+9 på 3 md.']] },
  { name: 'Studio Puls', trade: 'Personlig træner', city: 'København', group: 'klinik', color: '#7a3fd0', soft: '#ece3fa', h: 'Stærkere på 12 uger.', cta: 'Start nu',
    quote: 'Landingsside til forløb og Meta-annoncer, der fylder holdene.', services: ['Hjemmeside', 'Meta Ads', 'Automations'],
    results: [['Fyldte hold', '9 af 10'], ['Leads', '+120 / md.']] }
];

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slug = s => s.toLowerCase().replace(/[^a-z0-9æøå]+/g, '-').replace(/^-|-$/g, '').replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa');

const card = c => `
  <article class="case" data-group="${c.group}" data-reveal>
    <div class="case__shot" style="--c:${c.color};--s:${c.soft}" aria-hidden="true">
      <div class="mini">
        <div class="mini__bar"><i></i><i></i><i></i><span>${esc(slug(c.name))}.dk</span></div>
        <div class="mini__nav"><b><i></i>${esc(c.name)}</b><span>${esc(c.cta)}</span></div>
        <div class="mini__hero">
          <div class="mini__copy"><strong>${esc(c.h)}</strong><em></em><em></em><u>${esc(c.cta)} →</u></div>
          <div class="mini__art"></div>
        </div>
      </div>
    </div>
    <div class="case__body">
      <div class="case__meta">${esc(c.trade)} · ${esc(c.city)}</div>
      <h3 class="case__name">${esc(c.name)}</h3>
      <p class="case__txt">${esc(c.quote)}</p>
      <div class="case__results">${c.results.map(([l, v]) => `<div><span>${esc(l)}</span><b>${esc(v)}</b></div>`).join('')}</div>
      <div class="case__tags">${c.services.map(s => `<span>${esc(s)}</span>`).join('')}</div>
    </div>
  </article>`;

const grid = document.querySelector('[data-grid]'), empty = document.querySelector('[data-empty]');
grid.innerHTML = cases.map(card).join('');

// Scroll reveal (skipped when the visitor prefers reduced motion)
const motion = !matchMedia('(prefers-reduced-motion: reduce)').matches;
if (motion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el, i) => { el.style.transitionDelay = `${(i % 2) * 80}ms`; io.observe(el); });
}

// Trade filter
const chips = [...document.querySelectorAll('[data-filter]')];
chips.forEach(ch => ch.addEventListener('click', () => {
  const f = ch.dataset.filter;
  chips.forEach(c => { const on = c === ch; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
  let n = 0;
  grid.querySelectorAll('.case').forEach(el => { const show = f === 'alle' || el.dataset.group === f; el.hidden = !show; if (show) { n++; el.classList.add('is-in'); } });
  empty.hidden = n > 0;
  track('reference_filter', { filter: f, results: n });
}));
// Clicks, scroll and time are tracked by analytics.js
