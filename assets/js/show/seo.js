// SEO showcase (/services/seo): an example business profile on Google for Nordvik, a carpenter in
// København, that builds itself while you scroll, on a pinned stage like "Sådan virker det":
// 01 the profile, 02 photos and hours, 03 reviews, 04 up in the local search. The visitor's own trade,
// town and name go into it (sessionStorage wl-egen, never sent anywhere), and their business gets no
// stars, review counts or address. Elements with data-k="from to" (and data-s) get --k (--s) from 0 to 1
// over that part of the scroll; seo.css turns that into opacity and transforms.
import { track } from '/assets/js/analytics.js';

const root = document.querySelector('.show--seo');
if (root) init(root);

function init(root) {
  const $ = s => root.querySelector(s), $$ = s => [...root.querySelectorAll(s)];
  const motion = document.documentElement.classList.contains('motion');
  const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const eo = t => 1 - (1 - t) ** 3;
  const eb = t => t <= 0 ? 0 : t >= 1 ? 1 : 1 + 2.7 * (t - 1) ** 3 + 1.7 * (t - 1) ** 2;
  const lc = s => s.toLocaleLowerCase('da-DK');
  const cap = s => s.charAt(0).toLocaleUpperCase('da-DK') + s.slice(1);
  const ev = action => track('showcase_interact', { showcase: 'seo', action });

  /* ---------------- Personalising ---------------- */
  // Photo folder → [books online, closes at, big photo, side photo, three services with their photos]
  const TRADE = {
    toemrer: [0, '16.00', 'hero-1', 'om-2', 'Terrasse:projekt-1,Tilbygning:projekt-2,Carport:projekt-4'],
    elektriker: [0, '16.00', 'hero-2', 'om-2', 'Ladestander:projekt-1,El-tavle:projekt-2,Belysning:projekt-6'],
    vvs: [0, '16.00', 'hero-2', 'om-2', 'Badeværelse:projekt-1,Varmepumpe:projekt-2,Køkken:projekt-3'],
    maler: [0, '16.00', 'hero-2', 'projekt-1', 'Indvendig:projekt-2,Trapper:projekt-3,Træværk:projekt-4'],
    frisoer: [1, '18.00', 'hero-1', 'om-1', 'Dameklip:projekt-1,Herreklip:projekt-2,Opsætning:projekt-3'],
    klinik: [1, '18.00', 'hero-2', 'om-1', 'Massage:projekt-2,Ansigtsbehandling:projekt-1,Behandlingsrum:projekt-3'],
    fysioterapeut: [1, '19.00', 'hero-2', 'om-1', 'Behandling:projekt-2,Genoptræning:projekt-1,Træningssal:projekt-3'],
    'personlig-traener': [1, '20.00', 'hero-1', 'om-1', 'Styrketræning:projekt-1,Hold:projekt-2,Løbetræning:projekt-3'],
    rengoering: [0, '17.00', 'hero-2', 'om-2', 'Fast rengøring:projekt-1,Flytterengøring:projekt-2,Erhverv:projekt-3'],
    revisor: [1, '16.00', 'hero-2', 'om-1', 'Årsregnskab:projekt-1,Bogføring:projekt-2,Rådgivning:projekt-3']
  };
  // What people type → the nearest photo folder. Anything else keeps neutral tiles instead of wrong photos
  const WHICH = [[/tømr|snedker|murer|bygge|tagdæk|carport|gulv/, 'toemrer'], [/elektr|^el\b|el-/, 'elektriker'], [/vvs|blikken|rør|varme/, 'vvs'], [/maler|tapet/, 'maler'], [/fris|barber|hår/, 'frisoer'], [/fysio|kiropr|osteo/, 'fysioterapeut'], [/klinik|massage|kosmet|negl|spa\b|skønhed|vipper/, 'klinik'], [/træn|fitness|yoga|pilates|^pt\b/, 'personlig-traener'], [/rengør|vinduespud/, 'rengoering'], [/revis|bogf|bogholder|regnskab/, 'revisor']];
  // "på Frederiksberg", "på Bornholm", but "i Aarhus"
  const PAA = /^(frederiksberg|amager|nørrebro|østerbro|vesterbro|christianshavn|islands brygge|bornholm|fanø|mors|als|ærø|samsø|langeland|lolland|falster|møn|fyn|sjælland|djursland|læsø)$/;
  const i = by => PAA.test(lc(by).replace(/\s+(c|k|n|s|v|ø|nv|nø|sv|sø)$/, '')) ? 'på' : 'i';
  const KEY = 'wl-egen', DEF = { fag: 'Tømrer', by: 'København', navn: 'Nordvik' };
  const box = $('[data-gp-egen]'), inputs = Object.fromEntries($$('[data-gp-in]').map(el => [el.dataset.gpIn, el]));
  try { const v = JSON.parse(sessionStorage.getItem(KEY) || 'null'); if (v) for (const k in inputs) if (typeof v[k] === 'string') inputs[k].value = v[k].slice(0, 60); } catch (e) { /* fine */ }
  const clean = k => inputs[k].value.replace(/\s+/g, ' ').trim();
  const values = () => {
    const raw = { fag: clean('fag'), by: clean('by'), navn: clean('navn') };
    const fag = cap(raw.fag || DEF.fag), by = cap(raw.by || DEF.by), l = lc(fag);
    const id = raw.fag ? ((WHICH.find(([re]) => re.test(l)) || [])[1] || '') : 'toemrer';
    return { raw, fag, by, navn: raw.navn || DEF.navn, id, own: !!(raw.fag || raw.by || raw.navn), q: `${/^klinik/.test(l) ? 'massage' : l} ${lc(by)}` };
  };
  const nameEl = $('[data-gp-name]'), qEl = $('[data-gp-q]');
  let name = DEF.navn, q = 'tømrer københavn', redraw = () => {};
  const put = (k, t) => $$(`[data-gp-t="${k}"]`).forEach(el => { if (el.textContent !== t) el.textContent = t; });
  const apply = () => {
    const v = values(), t = TRADE[v.id];
    name = v.navn; q = v.q;
    root.classList.toggle('is-own', v.own);
    root.classList.toggle('is-book', !!(t && t[0]));
    root.classList.toggle('is-nofoto', !t);
    box.classList.toggle('is-filled', v.own);
    put('navn', v.navn); put('ini', v.navn.charAt(0).toLocaleUpperCase('da-DK'));
    put('kat', `${v.fag} ${i(v.by)} ${v.by}`); put('fag', v.fag); put('q', v.q);
    put('luk', t ? t[1] : '16.00'); put('cta', t && t[0] ? 'Book online' : 'Få et tilbud');
    // The visitor's business: their area instead of an address we would have to make up
    put('adrl', v.own ? 'Område:' : 'Adresse:'); put('adr', v.own ? `${v.by} og omegn` : 'Havnegade 14, 1058 København K');
    put('tlf', v.own ? 'Dit nummer' : '12 34 56 78');
    if (t) {
      const dir = `/udkast/_faelles/billeder/${v.id}/`, ys = t[4].split(',').map(x => x.split(':'));
      const src = { big: t[2], side: t[3], y0: ys[0][1], y1: ys[1][1], y2: ys[2][1] };
      $$('[data-gp-img]').forEach(img => {
        const f = dir + src[img.dataset.gpImg];
        if (img.dataset.f === f) return;
        img.dataset.f = f;
        if (img.srcset) img.srcset = `${f}-480.webp 480w, ${f}.webp 896w`;
        img.src = `${f}-480.webp`;
      });
      ys.forEach(([n], j) => put('y' + j, n));
    }
    if (!motion) { nameEl.textContent = name; qEl.textContent = q; }
    redraw();
  };
  let tm = 0;
  box.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { apply(); try { sessionStorage.setItem(KEY, JSON.stringify(values().raw)); } catch (e) { /* fine */ } }, 120); });
  // Which fields are used (once each), never what is typed
  const told = new Set();
  box.addEventListener('change', e => { const k = e.target.dataset.gpIn; if (k && !told.has(k) && clean(k)) { told.add(k); ev('egen-' + k); } });
  // Enter moves on to the next field, and closes the keyboard after the last one
  box.addEventListener('keydown', e => {
    const k = e.target.dataset.gpIn; if (e.key !== 'Enter' || !k) return;
    e.preventDefault();
    const next = inputs[{ fag: 'by', by: 'navn' }[k]];
    if (next) next.focus(); else e.target.blur();
  });
  $('[data-gp-cta]').addEventListener('click', () => ev('cta'));
  apply();

  if (!motion) {
    // Nothing to step through: the numbers are just numbers
    $$('.gp-step__n').forEach(n => { n.tabIndex = -1; n.setAttribute('aria-hidden', 'true'); });
    return;
  }

  /* ---------------- The scroll story ---------------- */
  const pin = $('[data-gp]'), sticky = $('[data-gp-sticky]'), fit = $('[data-gp-fit]'), main = $('[data-gp-main]');
  const dev = $('[data-gp-dev]'), card = $('[data-gp-card]'), srch = $('[data-gp-srch]'), scr = $('[data-gp-scroll]');
  const steps = $$('[data-gp-step]'), rows = $$('[data-gp-row]'), you = rows.find(r => r.dataset.gpRow === 'you');
  const nums = $$('[data-gp-n]'), stars = $$('[data-gp-st] i'), ydl = $('[data-gp-ydl]'), rev = $('[data-gp-rev]'), info = $('.gp-info');
  const mk = (el, n) => { const [a, b] = el.dataset[n].split(' ').map(Number); return { el, a, b, n: '--' + n, e: n === 'k' && el.dataset.e === 'b' ? eb : eo, v: -1 }; };
  const anim = [...$$('[data-k]').map(el => mk(el, 'k')), ...$$('[data-s]').map(el => mk(el, 's'))];
  const offTop = el => { let y = 0; for (; el && el !== sticky; el = el.offsetParent) y += el.offsetTop; return y; };
  // Style writes only when the value changes
  const sv = (el, k, v) => { const m = el.gpv || (el.gpv = {}); if (m[k] === v) return; m[k] = v; if (k[0] === '-') el.style.setProperty(k, v); else el.style[k] = v; };
  let L = null, cur = -1, last = -1, step = -1, best = 0, raf = 0, near = false, start = null;

  // Sizes that the story depends on: re-measured on resize and after the profile changes
  const measure = () => {
    const phone = innerWidth < 700;
    for (const el of [fit, box, main]) { el.gpv = null; el.style.transform = el.style.opacity = el.style.visibility = ''; }
    if (!phone) {
      const cs = getComputedStyle(sticky), room = sticky.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      const s = Math.min(1, room / fit.offsetHeight);
      if (s < 1) fit.style.transform = `scale(${s.toFixed(3)})`;
    }
    const shift = phone ? main.offsetTop - box.offsetTop : 0;
    // How much of the profile is in view: all of the card, or on a phone the part above the bottom edge
    const view = phone ? Math.min(card.clientHeight, sticky.clientHeight - offTop(card) + shift - 8) : card.clientHeight;
    const max = Math.max(0, scr.offsetHeight - view), until = ydl.offsetHeight ? ydl : info;
    const s2 = clamp(until.offsetTop + until.offsetHeight + 14 - view, 0, max);
    L = { phone, shift, s2, s3: clamp(rev.offsetTop - 12, s2, max), W: dev.offsetWidth, w: card.offsetWidth, h: card.offsetHeight, rh: you.offsetHeight };
    last = -1;
  };
  const type = (el, full, k, show) => {
    const t = full.slice(0, Math.round(full.length * k));
    if (el.textContent !== t) el.textContent = t;
    el.parentElement.classList.toggle('is-typing', show && k < 1);
  };
  const draw = p => {
    const st = p < .235 ? 0 : p < .475 ? 1 : p < .715 ? 2 : 3;
    if (st !== step) { step = st; steps.forEach((s, j) => s.classList.toggle('is-on', j === st)); }
    // Each step once, when the visitor has scrolled into it
    const reached = p > .003 ? st + 1 : 0;
    while (best < reached) track('showcase_step', { showcase: 'seo', step: ++best });
    for (const a of anim) sv(a.el, a.n, String(Math.round(a.e(seg(p, a.a, a.b)) * 1000) / 1000));
    type(nameEl, name, seg(p, .004, .07), p > .002);
    type(qEl, q, seg(p, .755, .8), p > .73);
    // 03: the example's rating and count go up (the visitor's own business shows none)
    const r = 4.9 * eo(seg(p, .53, .62));
    nums.forEach(n => { const t = n.dataset.gpN === 'r' ? r.toFixed(1).replace('.', ',') : String(Math.round(128 * r / 4.9)); if (n.textContent !== t) n.textContent = t; });
    stars.forEach((s, j) => sv(s, '--f', String(Math.round(clamp(r - j % 5) * 100) / 100)));
    // The profile scrolls on inside the card: to the services (02), then to the reviews (03)
    // and back to the top when it steps back in 04, so its photos and name peek out
    const y = (L.s2 * eo(seg(p, .335, .375)) + (L.s3 - L.s2) * eo(seg(p, .485, .545))) * (1 - eo(seg(p, .72, .78)));
    sv(scr, 'transform', y ? `translateY(${-y.toFixed(1)}px)` : '');
    // 04: the profile steps back and the local search comes forward
    const k = eo(seg(p, .72, .785));
    if (L.phone) {
      sv(card, 'transform', k ? `translateY(${(k * 104).toFixed(2)}%)` : '');
      sv(srch, 'transform', `scale(${(.94 + .06 * k).toFixed(4)})`);
    } else {
      const s = 1 - .14 * k, dx = (L.W - L.w * s) / 2 * k, dy = -(L.h - L.h * s) / 2;
      sv(card, 'transform', k ? `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${s.toFixed(4)}) rotate(${(2.5 * k).toFixed(2)}deg)` : '');
      sv(srch, 'opacity', k.toFixed(3));
      sv(srch, 'transform', `translate(${(-22 * (1 - k)).toFixed(1)}px,${(26 * (1 - k)).toFixed(1)}px) scale(${(.95 + .05 * k).toFixed(4)})`);
    }
    // …and the profile climbs from the bottom of the list to the top
    const c = eb(seg(p, .845, .905));
    rows.forEach(rw => sv(rw, '--y', ((rw === you ? 2 : -1) * L.rh * (1 - c)).toFixed(1) + 'px'));
    // Phones: the box tucks away once the build starts, so the phone gets the room
    if (L.phone) {
      const e = eo(seg(p, .004, .035)), ty = e ? `translateY(${(-e * L.shift).toFixed(1)}px)` : '';
      sv(box, 'transform', ty); sv(main, 'transform', ty); sv(box, 'opacity', (1 - e).toFixed(3));
      sv(box, 'visibility', e > .98 ? 'hidden' : '');
    }
    const atStart = p < .02;
    if (atStart !== start) { start = atStart; box.classList.toggle('is-start', atStart); }
  };
  const frame = () => {
    raf = 0;
    const r = pin.getBoundingClientRect(), span = r.height - innerHeight;
    const target = span > 0 ? clamp(-r.top / span) : 0;
    // A little inertia, so wheel steps glide instead of jump
    cur = cur < 0 ? target : cur + (target - cur) * .2;
    if (Math.abs(target - cur) < .0003) cur = target;
    if (cur !== last) { last = cur; draw(cur); }
    if (near || cur !== target) raf = requestAnimationFrame(frame);
  };
  const go = () => { if (!raf) raf = requestAnimationFrame(frame); };
  redraw = () => { if (L) { measure(); go(); } };
  new IntersectionObserver(([e]) => { near = e.isIntersecting; if (near) go(); }, { rootMargin: '300px 0px' }).observe(pin);
  addEventListener('resize', redraw);
  new ResizeObserver(redraw).observe(sticky);
  if (document.fonts) document.fonts.ready.then(redraw);
  measure();

  // The numbers jump to their step
  const AT = [.2, .455, .7, .96];
  steps.forEach((s, j) => s.addEventListener('click', e => {
    if (e.target.closest('a')) return;
    const r = pin.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top + (r.height - innerHeight) * AT[j], behavior: 'smooth' });
    ev('trin-' + (j + 1));
  }));
}
