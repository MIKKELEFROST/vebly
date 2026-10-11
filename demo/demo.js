// The Webleads front page calls window.__build(p) with the scroll progress (0–1) of
// "Sådan virker det". Pieces fly in with a dashed orange outline, then the page
// scrolls itself to the bottom while the rest assembles.
(() => {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const absTop = el => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };
  const els = Array.from(document.querySelectorAll('[data-b]'));

  window.__build = p => {
    const vh = innerHeight, de = document.documentElement;
    const max = de.scrollHeight - vh;
    const sp = clamp((p - 0.3) / 0.62), spe = sp < 0.5 ? 2 * sp * sp : 1 - Math.pow(-2 * sp + 2, 2) / 2;
    window.scrollTo({ top: Math.max(0, max) * spe, behavior: 'instant' });
    const sy = window.scrollY;
    let j = 0;
    els.forEach((el, i) => {
      const top = absTop(el);
      let k;
      if (top < vh * 0.85) { k = ease(clamp((p - 0.02 - j * 0.028) / 0.09)); j++; }
      else k = ease(clamp((sy + vh * 0.95 - top) / (vh * 0.4)));
      k = Math.max(k, ease(clamp((p - 0.84) / 0.06)));
      const dir = i % 2 ? 1 : -1;
      if (k >= 1) { el.style.transform = ''; el.style.opacity = ''; el.style.filter = ''; el.style.outline = ''; return; }
      el.style.transform = `translate(${dir * 180 * (1 - k)}px,${(70 + (i % 3) * 40) * (1 - k)}px) rotate(${dir * 7 * (1 - k)}deg) scale(${0.9 + 0.1 * k})`;
      el.style.opacity = 0.05 + 0.95 * k;
      el.style.filter = `blur(${(1 - k) * 8}px)`;
      el.style.outline = `2px dashed rgba(224,85,43,${(1 - k) * 0.9})`;
      el.style.outlineOffset = '6px';
    });
    if (sp >= 1) window.scrollTo({ top: Math.max(0, de.scrollHeight - vh), behavior: 'instant' });
  };

  // The front page calls window.__set({ navn, fag, fagId, by, domain, egen }) with the visitor's own
  // company name, trade and town. The page then becomes their local business: the trade's texts and
  // photos (fag.json, made from the draft templates) and the postal districts around the town
  // (postnumre.json). Both are fetched the first time, not before. Without values it stays Nordvik,
  // a carpenter in Copenhagen. Returns a promise of { areas, adr } for the search on the front page.
  const $$ = s => Array.from(document.querySelectorAll(s));
  const L = Object.fromEntries($$('[data-l]').map(el => [el.dataset.l, el]));
  const fotos = $$('[data-foto]');
  const start = { html: new Map($$('[data-l]').map(el => [el, el.innerHTML])), src: new Map(fotos.map(img => [img, img.getAttribute('src')])) };
  const DEFAULT = { areas: $$('[data-l="areas"] span').map(s => s.textContent), adr: 'Havnegade 14, 1058 København K' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = s => String(s).toLocaleLowerCase('da-DK').replace(/\s+/g, ' ').replace(/\.$/, '').trim();
  // "på Frederiksberg", "på Bornholm", but "i Aarhus"
  const PAA = new Set(['frederiksberg', 'amager', 'nørrebro', 'østerbro', 'vesterbro', 'christianshavn', 'islands brygge', 'bornholm', 'fanø', 'mors', 'als', 'ærø', 'samsø', 'langeland', 'lolland', 'falster', 'møn', 'fyn', 'sjælland', 'djursland', 'læsø', 'anholt', 'tåsinge', 'thurø', 'rømø', 'femø', 'fejø', 'orø', 'omø', 'fur', 'venø', 'endelave', 'tunø', 'manø', 'mandø']);
  const i = by => (PAA.has(norm(by).replace(/\s+(c|k|n|s|v|ø|nv|nø|sv|sø)$/, '')) ? 'på' : 'i');

  let data = null;
  const load = () => data || (data = Promise.all(['/demo/fag.json', '/demo/postnumre.json'].map(u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); })))
    .then(([fag, post]) => ({ fag, post })).catch(() => { data = null; return null; }));

  // The town as a postal district: "aarhus" → 8000 Aarhus C, "Lyngby" → 2800 Kongens Lyngby
  const ALIAS = { 'århus': 'aarhus', 'ålborg': 'aalborg', kbh: 'københavn', cph: 'københavn', 'nørrebro': 'københavn n', 'østerbro': 'københavn ø', vesterbro: 'københavn v', amager: 'københavn s', 'indre by': 'københavn k', christianshavn: 'københavn k', nordvest: 'københavn nv', sydhavnen: 'københavn sv', lyngby: 'kongens lyngby', bornholm: 'rønne' };
  const find = (post, by) => {
    let q = norm(by); q = ALIAS[q] || q;
    if (!q) return null;
    const n = e => norm(e[1]);
    return post.find(e => n(e) === q) || post.find(e => n(e).startsWith(q + ' ')) || post.find(e => (' ' + n(e) + ' ').includes(' ' + q + ' ')) || null;
  };
  // Nearby districts: in the same municipality, nearest postal number first, written without district
  // letters ("Risskov Ø" → Risskov) and without the town's own districts (Aarhus N for Aarhus)
  const plain = s => s.replace(/\s+(C|K|N|S|V|Ø|NV|NØ|SV|SØ|M|J|Sj|Sjælland|Midtsj|Fyn|St|Strand)\.?$/u, '');
  const nearby = (post, pick, max = 6) => {
    const seen = new Set([norm(plain(pick[1]))]), out = [];
    const add = list => {
      for (const e of list.slice().sort((a, b) => Math.abs(a[0] - pick[0]) - Math.abs(b[0] - pick[0]))) {
        if (out.length >= max) return;
        const name = plain(e[1]), key = norm(name);
        if (!seen.has(key)) { seen.add(key); out.push(name); }
      }
    };
    add(post.filter(e => e[2].includes(pick[2][0])));
    if (out.length < 4) add(post);
    return out;
  };

  const put = (k, html) => { if (L[k]) L[k].innerHTML = html; };
  // Straight away, before the trade texts and the districts are here: the town in the obvious places
  const basic = v => {
    const by = `${i(v.by)} ${esc(v.by)}`;
    put('pill', `${esc(v.fag)} ${by} og omegn`);
    put('h1', `Din lokale ${esc(v.fag.toLocaleLowerCase('da-DK'))}`); put('h1by', `${by}.`);
    put('intro', `${esc(v.fag)} ${by} og omegn. Fast pris, klare aftaler og svar samme dag.`);
    put('proof', `fra over 600 kunder ${by}`); put('badge2', esc(v.by)); put('svcby', `Lokalt ${by}.`);
    put('areaslbl', `Kunder fra hele ${esc(v.by)} og omegn`); L.areas.hidden = true;
    put('omh', `Vi er lokale ${by},`); put('stat1', `kunder ${by}`);
    put('kontakt', `Skriv et par linjer, så vender vi tilbage inden for en time.`);
    put('adr', esc(v.by)); put('adr2', esc(v.by));
  };
  const local = (v, d) => {
    const t = d.fag[v.fagId] || d.fag.generisk, ib = i(v.by), by = `${ib} ${esc(v.by)}`;
    const lokal = esc(t.lokal || v.fag.toLocaleLowerCase('da-DK'));
    const pick = find(d.post, v.by), areas = pick ? nearby(d.post, pick) : [], place = areas[0] || v.by;
    const fill = s => esc(s).replace(/\bi \{by\}/g, by).replace(/\{by\}/g, esc(v.by));
    put('pill', `${esc(v.fag)} ${by} og omegn`);
    put('h1', `Din lokale ${lokal}`); put('h1by', `${by}.`);
    put('intro', fill(t.intro));
    put('cta', esc(t.cta)); put('book', esc(t.ctaKort));
    put('proof', `fra over 600 kunder ${by}`);
    put('badge1', t.ud ? 'Vi kører i' : 'Lokal'); put('badge2', t.ud ? `hele ${esc(v.by)}` : by);
    put('aaben', esc(String(t.tider).split(' · ')[0].split(' ').slice(1).join(' ')));
    put('areaslbl', t.ud ? `Vi kører ${by} og omegn` : `Kunder fra hele ${esc(v.by)} og omegn`);
    put('areas', areas.map(a => `<span>${esc(a)}</span>`).join(''));
    L.areas.hidden = !areas.length;
    put('svch', esc(t.ydelserOverskrift)); put('svcby', t.ud ? `I hele ${esc(v.by)}.` : `Lokalt ${by}.`);
    t.ydelser.forEach(([titel, tekst], n) => { put(`s${n}t`, esc(titel)); put(`s${n}p`, fill(tekst)); });
    t.trin.forEach(([titel, tekst], n) => { put(`t${n}t`, esc(titel)); put(`t${n}p`, fill(tekst)); });
    put('omh', `Vi er lokale ${by},`);
    put('stat1', `kunder ${by}`);
    const [qt, qn, qs] = t.anmeldelse;
    put('qtxt', `“${esc(qt)}”`); put('qnavn', esc(qn));
    put('qsted', qs.includes('{by}') ? esc(qs).replace(/\{by\}/g, esc(place)) : `${esc(qs)}, ${esc(place)}`);
    put('kontakt', `Skriv et par linjer, så vender vi tilbage inden for en time. ${t.ud ? `Vi kører ud i hele ${esc(v.by)} og omegn.` : `Du finder os ${by}.`}`);
    const adr = pick ? `${pick[0]} ${pick[1]}` : v.by;
    put('adr', esc(adr)); put('adr2', esc(adr));
    put('tider', esc(t.tider));
    fotos.forEach(img => { const src = t.billeder && t.billeder[img.dataset.foto]; img.hidden = !src; img.parentElement.classList.toggle('has-foto', !!src); if (src && img.getAttribute('src') !== src) img.src = src; });
    return { areas, adr };
  };
  const restore = () => {
    start.html.forEach((html, el) => { el.innerHTML = html; });
    L.areas.hidden = false;
    start.src.forEach((src, img) => { img.hidden = false; img.parentElement.classList.add('has-foto'); if (img.getAttribute('src') !== src) img.src = src; });
  };
  fotos.forEach(img => img.parentElement.classList.add('has-foto'));

  let seq = 0;
  window.__set = v => {
    const egen = !!(v && v.egen), my = ++seq;
    document.documentElement.classList.toggle('is-egen', egen);
    $$('[data-navn]').forEach(el => { el.textContent = (egen && v.navn) || 'Nordvik'; });
    $$('[data-mail]').forEach(el => { const m = `hej@${(egen && v.domain) || 'nordvik.dk'}`; el.textContent = m; el.href = `mailto:${m}`; });
    document.title = egen ? `${v.navn} · ${v.fag} i ${v.by}` : 'Nordvik · Tømrer i København · Eksempel på en Webleads-hjemmeside';
    if (!egen) { restore(); return Promise.resolve(DEFAULT); }
    basic(v);
    return load().then(d => (d && my === seq ? local(v, d) : null));
  };
})();
