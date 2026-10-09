// Builds a customer draft from a trade template plus a small customer file.
//
//   node scripts/nyt-udkast.mjs scripts/udkast-kunder/holms-maler-aps.json [--overskriv]
//
// The trade templates (api/_lib/udkast/brancher/<branche>.json) and page templates
// (api/_lib/udkast/skabelon/) are shared with the instant drafts from "Bestil en hjemmeside"
// (api/udkast.js); the rendering itself lives in api/_lib/udkast/render.js.
// The customer file holds what is unique: name, town, nearby areas, phone, colour, and any
// field from the trade file it wants to override (e.g. its own list of services).
//
// Writes udkast/<slug>/{forside,ydelser,om-os,kontakt}.html, served at
// webleads.dk/<slug>-forside, -ydelser, -om-os and -kontakt (vercel.json rewrites).
// The pages are plain HTML and can be edited by hand afterwards.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDraft, PAGES, BRANCHER } from '../api/_lib/udkast/render.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error(`Brug: node scripts/nyt-udkast.mjs <kunde.json> [--overskriv]\nBrancher: ${BRANCHER.join(', ')}`); process.exit(1);
}
const kunde = JSON.parse(readFileSync(file, 'utf8'));
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(kunde.slug)) throw new Error('slug må kun have små bogstaver, tal og bindestreger (fx holms-maler-aps)');
const out = join(root, 'udkast', kunde.slug);
if (existsSync(out) && flag !== '--overskriv') { console.error(`${out} findes allerede. Tilføj --overskriv for at erstatte det.`); process.exit(1); }

const pages = PAGES.map(page => [page, renderDraft(kunde, page)]);
mkdirSync(out, { recursive: true });
for (const [page, html] of pages) writeFileSync(join(out, `${page}.html`), html);
console.log(`Udkast klar (${kunde.branche}, design ${kunde.design || 1}):`);
for (const page of PAGES) console.log(`  https://webleads.dk/${kunde.slug}-${page}`);
