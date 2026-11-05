// A small local stand-in for Vercel: static files with clean URLs, the /mit-udkast rewrites and the /api
// functions (loaded fresh on every request). For quick checks without `vercel dev`:
//   node scripts/dev/server.mjs [port]        → http://127.0.0.1:8790
// Redirects and headers from vercel.json are not applied here.
process.on('uncaughtException', e => console.error('ignored', e.code || e.message));
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..'), port = +process.argv[2] || 8790;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml' };
const helpers = res => { res.status = c => { res.statusCode = c; return res; }; res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); return res; }; res.send = b => { res.end(b); return res; }; return res; };
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  let path = decodeURIComponent(url.pathname);
  const query = Object.fromEntries(url.searchParams);
  let m;
  if (path === '/mit-udkast') path = '/api/udkast';
  else if ((m = path.match(/^\/mit-udkast\/(ydelser|om-os|kontakt)$/))) { path = '/api/udkast'; query.side = m[1]; }
  if (path.includes('..')) { res.statusCode = 400; return res.end('bad path'); }
  if (path.startsWith('/api/')) {
    const file = join(root, path + '.js');
    if (!existsSync(file)) { res.statusCode = 404; return res.end('no fn'); }
    const mod = await import(file + '?t=' + statSync(file).mtimeMs);
    let body = '';
    for await (const ch of req) body += ch;
    let parsed = body;
    if ((req.headers['content-type'] || '').includes('application/json')) { try { parsed = JSON.parse(body); } catch { parsed = {}; } }
    return mod.default({ method: req.method, headers: req.headers, query, body: parsed, socket: req.socket }, helpers(res));
  }
  let f = join(root, path);
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  else if (!existsSync(f) && existsSync(f + '.html')) f = f + '.html';
  if (!existsSync(f)) { res.statusCode = 404; return res.end('404'); }
  res.setHeader('Content-Type', types[extname(f)] || 'application/octet-stream');
  res.end(readFileSync(f));
}).listen(port, '127.0.0.1', () => console.log(`dev on http://127.0.0.1:${port}`));
