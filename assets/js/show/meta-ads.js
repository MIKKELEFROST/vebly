// Showcase on /services/meta-ads: your ad in a feed on a phone (scripts/services/showcase/meta-ads.html).
// A scroll story on a pinned stage: 01 the feed scrolls, 02 it slows down and stops on your ad (a double-tap
// heart), 03 the customer taps Book nu and sends the form in the ad, 04 your own phone gets the lead.
// The visitor's trade, town and name (sessionStorage 'wl-egen', shared with /services/hjemmesider) go into the
// ad; nothing typed leaves the browser. Without motion: the whole story at once, nothing pinned.
import { track } from '/assets/js/analytics.js';

const sec = document.querySelector('.show--meta-ads');
if (sec) init(sec);

function init(sec) {
  const $ = s => sec.querySelector(s), $$ = s => [...sec.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const io3 = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(2 - 2 * t, 3) / 2;
  // The feed: an even scroll through friends' posts, then a long, soft stop on the ad
  const glide = t => t <= 0 ? 0 : t >= 1 ? 1 : t < .45 ? t * 1.556 : .7 + .3 * (1 - Math.pow(1 - (t - .45) / .55, 3));
  const act = action => track('showcase_interact', { showcase: 'meta-ads', action });

  /* ---------- The ad, in the visitor's own trade, town and name ---------- */
  // Trade: [photo, CTA headline, caption, three answers in the form (the customer picks the first), age]
  const FAG = {
    toemrer: ['projekt-1', 'Få et gratis tilbud', 'Drømmer du om en ny terrasse? Få et tilbud, og se hvad den koster.', 'Terrasse|Tag|Tilbygning', '30–65'],
    frisoer: ['projekt-1', 'Book en tid', 'Klar til en ny frisure? Book din næste tid på under et minut.', 'Klip|Farve|Striber', '18–55'],
    maler: ['projekt-1', 'Få et gratis tilbud', 'Trænger huset til ny maling? Få et tilbud på ude og inde.', 'Facade|Stue|Vinduer', '30–70'],
    elektriker: ['projekt-1', 'Få et gratis tilbud', 'Skal elbilen have sin egen ladestander? Få et tilbud i dag.', 'Ladestander|Eltavle|Lys', '30–65'],
    vvs: ['projekt-1', 'Få et gratis tilbud', 'Drømmer du om et nyt badeværelse? Få et tilbud, og kom i gang.', 'Badeværelse|Varmepumpe|Køkken', '30–70'],
    rengoering: ['hero-2', 'Få et gratis tilbud', 'Kom hjem til et rent hjem. Få et tilbud på fast rengøring.', 'Privat|Erhverv|Flytning', '28–65'],
    klinik: ['hero-2', 'Book en tid', 'Træt i skuldrene? Book en massage, når det passer dig.', 'Massage|Hot stones|Ansigt', '25–65'],
    fysioterapeut: ['hero-1', 'Book en tid', 'Ondt i ryggen eller knæet? Book en tid, når det passer dig.', 'Ryg|Knæ|Skulder', '30–70'],
    'personlig-traener': ['hero-2', 'Book en træning', 'Vil du i form i år? Book din første træning, og kom i gang.', 'Personlig|Hold|Løb', '25–55'],
    revisor: ['hero-2', 'Book et møde', 'Slip for bøvlet med regnskabet. Book et møde, og hør mere.', 'Regnskab|Moms|Løn', '30–65']
  };
  // Any other trade gets a graphic ad with the trade and town instead of a photo from another trade
  const OTHER = ['', 'Få et tilbud', 'Står du og mangler hjælp? Skriv til os, så vender vi hurtigt tilbage.', 'Tilbud|Spørgsmål|Andet', '25–65'];
  const ALIAS = { tømrer: 'toemrer', snedker: 'toemrer', frisør: 'frisoer', frisor: 'frisoer', malermester: 'maler', 'el-installatør': 'elektriker', elinstallatør: 'elektriker', 'vvs-installatør': 'vvs', blikkenslager: 'vvs', rengøring: 'rengoering', rengøringsfirma: 'rengoering', 'klinik og massage': 'klinik', massage: 'klinik', massør: 'klinik', fysioterapi: 'fysioterapeut', fysio: 'fysioterapeut', 'personlig træner': 'personlig-traener', pt: 'personlig-traener', træner: 'personlig-traener', bogholder: 'revisor' };
  const KEY = 'wl-egen', IMG = '/udkast/_faelles/billeder/';
  const box = $('.ma-egen'), photo = $('[data-ma-photo]'), sr = $('[data-ma-sr]');
  const f = Object.fromEntries($$('[data-ma-f]').map(i => [i.dataset.maF, i]));
  try { const v = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (v) for (const k in f) if (typeof v[k] === 'string') f[k].value = v[k].slice(0, 60); } catch (x) { /* fine */ }

  const cap = t => t.charAt(0).toLocaleUpperCase('da-DK') + t.slice(1);
  const clean = k => f[k].value.replace(/\s+/g, ' ').trim();
  // "Jensen & Søn ApS" → jensen-og-soen.dk (as on /services/hjemmesider)
  const domain = n => {
    let d = n.toLocaleLowerCase('da-DK').replace(/\s+(aps|a\/s|ivs|i\/s|k\/s|p\/s|amba|smba)\.?$/i, '').replace(/&/g, ' og ')
      .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (d.length > 30) d = d.slice(0, 30).replace(/-[^-]*$/, '') || d.slice(0, 30);
    return (d || 'nordvik') + '.dk';
  };
  const put = (k, t) => $$(`[data-t="${k}"]`).forEach(e => { if (e.textContent !== t) e.textContent = t; });
  let shown = 'toemrer/projekt-1';
  const apply = () => {
    const raw = { fag: clean('fag'), by: clean('by'), navn: clean('navn') };
    const l = raw.fag.toLocaleLowerCase('da-DK'), id = !raw.fag ? 'toemrer' : ALIAS[l] || (FAG[l] ? l : '');
    const row = FAG[id] || OTHER, navn = raw.navn || 'Nordvik';
    put('navn', navn); put('ini', navn.charAt(0).toLocaleUpperCase('da-DK')); put('by', cap(raw.by || 'København'));
    put('fag', cap(raw.fag || 'Tømrer')); put('domain', domain(navn)); put('cta', row[1]); put('cap', row[2]); put('alder', row[4]);
    row[3].split('|').forEach((c, i) => put('chip' + i, c));
    // Their own business: no like or comment counts (README → Truth rules)
    const egen = !!(raw.fag || raw.by || raw.navn);
    sec.classList.toggle('is-egen', egen); box.classList.toggle('is-filled', egen); sec.classList.toggle('is-gfx', !row[0]);
    const pic = row[0] && `${id}/${row[0]}`;
    if (pic && pic !== shown) { shown = pic; photo.srcset = `${IMG}${pic}-480.webp 480w, ${IMG}${pic}.webp 896w`; photo.src = `${IMG}${pic}-480.webp`; }
    sr.textContent = `Eksempel: En sponsoreret annonce fra ${navn} i et feed på en telefon. Kunden trykker Book nu, sender sit navn og nummer i en formular i annoncen, og ${navn} får med det samme besked om et nyt lead.`;
    return raw;
  };
  let tm = 0;
  const told = new Set();
  box.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { const raw = apply(); try { sessionStorage.setItem(KEY, JSON.stringify(raw)); } catch (x) { /* fine */ } }, 120); });
  // Which fields people use, once each; never what they type
  box.addEventListener('change', e => { const k = e.target.dataset.maF; if (k && !told.has(k) && clean(k)) { told.add(k); act('egen-' + k); } });
  box.addEventListener('keydown', e => {
    const k = e.target.dataset.maF;
    if (e.key !== 'Enter' || !k) return;
    e.preventDefault();
    const order = ['fag', 'by', 'navn'], next = f[order[order.indexOf(k) + 1]];
    if (next) next.focus(); else e.target.blur();
  });
  apply();

  // Today's date on the lock screen
  try { const d = new Date(); $('[data-ma-date]').textContent = `${cap(d.toLocaleDateString('da-DK', { weekday: 'long' }))} ${d.getDate()}. ${d.toLocaleDateString('da-DK', { month: 'long' })}`; } catch (x) { /* fine */ }

  /* ---------- The story ---------- */
  const stage = $('[data-ma-stage]'), feed = $('[data-ma-feed]'), ad = $('[data-ma-ad]'), scr = $('.ma-ph--a .ma-scr');
  const sheet = $('[data-ma-sheet]'), dim = $('[data-ma-dim]'), A = $('.ma-ph--a'), B = $('.ma-ph--b');
  const steps = $$('.ma-step'), bars = $$('.ma-bars b'), pills = $$('.ma-pill');
  const AT = [0, .3, .52, .78, 1]; // where the four steps start and end on the way through the stage
  let stopY = 0;
  const measure = () => { stopY = Math.max(0, ad.offsetTop - 2 * scr.clientWidth / 375); };
  const flags = {};
  const flag = (c, v) => { if (flags[c] !== v) { flags[c] = v; sec.classList.toggle(c, v); } };

  let step = -1, reached = 0;
  const render = s => {
    const n = s < AT[1] ? 0 : s < AT[2] ? 1 : s < AT[3] ? 2 : 3;
    if (n !== step) { step = n; steps.forEach((e, i) => e.classList.toggle('is-on', i === n)); }
    if (s > .002 && n + 1 > reached) { reached = n + 1; track('showcase_step', { showcase: 'meta-ads', step: reached }); }
    bars.forEach((b, i) => { b.style.transform = `scaleX(${clamp((s - AT[i]) / (AT[i + 1] - AT[i])).toFixed(3)})`; });
    // 01–02: the feed scrolls by, slows down and stops on the ad
    feed.style.transform = `translate3d(0,${(-stopY * glide((s - .02) / .38)).toFixed(1)}px,0)`;
    pills.forEach((p, i) => p.classList.toggle('is-on', s > .06 + i * .065));
    flag('is-liked', s > .405); flag('is-cta', s > .455);
    // 03: Book nu, the form slides up already filled in, an answer, Send, thank you
    flag('is-book', s > .53 && s < .6);
    const k = io3(clamp((s - .545) / .06));
    sheet.style.transform = k < 1 ? `translateY(${((1 - k) * 102).toFixed(2)}%)` : 'none';
    dim.style.opacity = (k * .45).toFixed(3);
    flag('is-fill', s > .6); flag('is-chip', s > .645); flag('is-send', s > .69 && s < .75); flag('is-sent', s > .705);
    // 04: the customer's phone steps back, yours comes up, and the lead arrives
    const q = io3(clamp((s - .78) / .075)), wide = innerWidth >= 900;
    A.style.transform = q ? `translateX(${((wide ? -36 : -22) * q).toFixed(2)}%) rotate(${(-5 * q).toFixed(2)}deg) scale(${(1 - .08 * q).toFixed(3)})` : '';
    B.style.visibility = q ? 'visible' : '';
    B.style.transform = q ? `translate(${((wide ? 36 : 22) * q).toFixed(2)}%,${((1 - q) * 125 + (wide ? 4 : -2) * q).toFixed(2)}%) rotate(${(5 * q).toFixed(2)}deg)` : '';
    pills.forEach(p => p.classList.toggle('is-away', q > .05));
    flag('is-lead', s > .87);
  };

  // Taps in the mockup do what they say: Book nu opens the form, Send sends it, the photo gets a heart
  const go = s => scrollTo({ top: Math.round(stage.getBoundingClientRect().top + scrollY + s * (stage.offsetHeight - innerHeight)), behavior: 'smooth' });
  const heart = $('.ma-pop');
  $('[data-ma-like]').addEventListener('click', () => {
    act('like');
    if (!motion) return flag('is-liked', true);
    heart.animate([{ opacity: 0, transform: 'scale(0)' }, { opacity: 1, transform: 'scale(1.22)', offset: .15 }, { transform: 'scale(.94)', offset: .3 }, { opacity: 1, transform: 'scale(1)', offset: .68 }, { opacity: 0, transform: 'translateY(-22%) scale(.7)' }], { duration: 1000, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
  });
  $('[data-ma-book]').addEventListener('click', () => { act('book-nu'); if (motion) go(.63); else flag('is-form', true); });
  $('[data-ma-send]').addEventListener('click', () => { act('send'); if (motion) go(.93); else flag('is-sent', true); });
  dim.addEventListener('click', () => { flag('is-form', false); flag('is-sent', false); });

  if (!motion) {
    // The finished state: the ad as the customer sees it, liked, and the lead on your phone
    const still = () => { measure(); feed.style.transform = `translate3d(0,${-stopY}px,0)`; };
    ['is-liked', 'is-cta', 'is-fill', 'is-chip', 'is-lead'].forEach(c => flag(c, true));
    pills.forEach(p => p.classList.add('is-on'));
    still(); addEventListener('resize', still); if (document.fonts) document.fonts.ready.then(still);
    return;
  }

  let sp = -1, raf = 0, vis = false;
  const frame = () => {
    raf = 0;
    const r = stage.getBoundingClientRect(), span = r.height - innerHeight, p = span > 0 ? clamp(-r.top / span) : 0;
    // A little inertia, so the feed moves like a thumb flicked it
    sp = sp < 0 ? p : sp + (p - sp) * .16;
    if (Math.abs(p - sp) < .0004) sp = p;
    render(sp);
    if (sp !== p) raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && vis) raf = requestAnimationFrame(frame); };
  new IntersectionObserver(([e]) => { vis = e.isIntersecting; kick(); }, { rootMargin: '200px 0px' }).observe(stage);
  addEventListener('scroll', kick, { passive: true });
  const re = () => { measure(); sp = -1; kick(); };
  addEventListener('resize', re); new ResizeObserver(re).observe(scr);
  if (document.fonts) document.fonts.ready.then(re);
  measure(); render(0);

  // The targeting pills drift with the mouse, like the badges in the hero
  const depth = [26, 40, 18];
  sec.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
    pills.forEach((p, i) => { p.style.translate = `${(x * depth[i]).toFixed(1)}px ${(y * depth[i]).toFixed(1)}px`; });
  }, { passive: true });
}
