// The customers from scripts/services/partnere.mjs, in two forms:
//   partnerSection({ list, eksempel })  the band right under the hero on the front page (build.mjs, 'forside')
//   partnerWall({ list, eksempel })     the same customers as a grid, for the results page; that page links
//                                       /assets/css/show/partnere.css and puts the wall in its own section
// Both return '' for an empty list. eksempel: true marks everything with the shared "Eksempel" tag.
// Styles: assets/css/show/partnere.css. Motion: assets/js/show/partnere.js (the band's own loop).
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, esc } from '../lib.mjs';

const warn = msg => console.warn('OBS (partnere.mjs): ' + msg);

// The width and height of a logo file, so the page keeps its place before the image has loaded
function logoSize(rel) {
  try {
    const buf = readFileSync(join(ROOT, rel));
    if (/\.png$/i.test(rel)) return buf.toString('ascii', 12, 16) === 'IHDR' ? { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) } : null;
    const tag = (buf.toString('utf8', 0, 6000).match(/<svg\b[^>]*>/i) || [''])[0];
    const vb = tag.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (vb) return { w: +vb[1], h: +vb[2] };
    // Without a viewBox only absolute sizes say anything about the shape (not width="100%")
    const w = tag.match(/\swidth\s*=\s*["']\s*([\d.]+)\s*(px)?\s*["']/i), h = tag.match(/\sheight\s*=\s*["']\s*([\d.]+)\s*(px)?\s*["']/i);
    return w && h ? { w: +w[1], h: +h[1] } : null;
  } catch (x) { return null; }
}

// Checks each customer: a name is required, a link must be http(s), a logo must be a file under /assets/partnere/
function clean(list) {
  return (Array.isArray(list) ? list : []).map(p => {
    const navn = String((p && p.navn) || '').trim();
    if (!navn) { warn('en kunde uden navn er sprunget over'); return null; }
    const url = String(p.url || '').trim(), logo = String(p.logo || '').trim();
    const okUrl = /^https?:\/\/[^\s"'<>]+$/i.test(url);
    if (url && !okUrl) warn(`${navn}: url skal være en hel adresse, der starter med https:// (vist uden link)`);
    let okLogo = /^\/assets\/partnere\/[\w-][\w./-]*\.(svg|png)$/i.test(logo) && !logo.includes('..');
    if (logo && !okLogo) warn(`${navn}: logo skal være en .svg eller .png under /assets/partnere/ (vist som navn)`);
    else if (okLogo && !existsSync(join(ROOT, logo))) { warn(`${navn}: ${logo} findes ikke (vist som navn)`); okLogo = false; }
    else if (okLogo && !logoSize(logo)) warn(`${navn}: ${logo} har ingen viewBox eller faste mål, så formen kan blive forkert (giv SVG'en en viewBox)`);
    return { navn, fag: String(p.fag || '').trim(), by: String(p.by || '').trim(), url: okUrl ? url : '', logo: okLogo ? logo : '' };
  }).filter(Boolean);
}

const initial = n => ([...n][0] || '').toLocaleUpperCase('da-DK');

// One customer: a wordmark (initial + name) or the logo, with trade and town under it.
// On the wall the initial is one big letter in the corner of the card instead of the small mark.
function item(p, wall = false) {
  // Trade · town; narrow layouts stack the two instead of breaking the line after the dot
  const meta = [p.fag, p.by].filter(Boolean).map(t => `<span>${esc(t)}</span>`).join('<span class="pt__sep" aria-hidden="true"> · </span>');
  let brand = `<b class="pt__name" style="--len:${[...p.navn].length}">${esc(p.navn)}</b>`;
  if (p.logo) {
    // Every logo gets about the same area, so a square one is not tiny next to a wide one
    const s = logoSize(p.logo), r = s && s.w > 0 && s.h > 0 ? s.w / s.h : 0;
    const dim = r ? ` width="${Math.round(100 * r)}" height="100" style="--lh:${Math.round(Math.min(40, Math.max(22, Math.sqrt(3000 / r))))}px"` : '';
    brand = `<img class="pt__logo" src="${esc(p.logo)}" alt="${esc(p.navn)}"${dim} loading="lazy" decoding="async" draggable="false">`;
  }
  const body = (p.logo || wall ? '' : `<span class="pt__mark" aria-hidden="true">${esc(initial(p.navn))}</span>`)
    + `<span class="pt__txt">${brand}${meta ? `<span class="pt__meta">${meta}</span>` : ''}</span>`
    + (wall && !p.logo ? `<span class="pw__glyph" aria-hidden="true">${esc(initial(p.navn))}</span>` : '');
  const cls = `pt__item${p.logo ? ' pt__item--logo' : ''}`;
  return p.url
    ? `<a class="${cls}" href="${esc(p.url)}" target="_blank" rel="noopener" draggable="false" data-event="Partnere: ${esc(p.navn)}">${body}<span class="pt__go" aria-hidden="true">↗</span><span class="sr-only"> (åbner i et nyt vindue)</span></a>`
    : `<span class="${cls}">${body}</span>`;
}

const TAG = '<span class="tag-eks">Eksempel</span>';
const NOTE = '<p class="sr-only">Virksomhederne er opdigtede eksempler.</p>';

// The band under the hero: one list of every customer. Without motion it stands still: a tidy grid,
// and on phones a row you swipe (two rows from 10 customers, data-pt-rows). With motion, partnere.js
// lets the list drift inside the page width, in two rows the other way round when there are many.
// 1–4 customers always stand still (data-pt-still).
export function partnerSection({ list, eksempel = false } = {}) {
  const items = clean(list);
  if (!items.length) return '';
  const n = items.length;
  return `<section class="show show--partnere pt" data-sec="partnere" aria-labelledby="pt-h">
      <div class="pt__head" data-reveal="0"><h2 class="kicker pt__kicker" id="pt-h">Dem har vi hjulpet${eksempel ? ' ' + TAG : ''}</h2></div>
      <div class="pt__band" data-pt${n <= 4 ? ' data-pt-still' : n >= 10 ? ' data-pt-rows="2"' : ''}>
        <div class="pt__row"><div class="pt__track" data-pt-track="-1"><ul class="pt__set">
          ${items.map(p => `<li>${item(p)}</li>`).join('\n          ')}
        </ul></div></div>
      </div>${eksempel ? `
      ${NOTE}` : ''}
    </section>`;
}

// The wall: a tidy grid of the same customers, each on its own card
export function partnerWall({ list, eksempel = false } = {}) {
  const items = clean(list);
  if (!items.length) return '';
  return `<div class="show--partnere pw">${eksempel ? `
        <div class="pw__head">${TAG}</div>
        ${NOTE}` : ''}
        <ul class="pw__grid">
          ${items.map((p, i) => `<li class="pw__cell" data-reveal="${i % 4}">${item(p, true)}</li>`).join('\n          ')}
        </ul>
      </div>`;
}
