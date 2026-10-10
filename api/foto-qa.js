// TEMPORARY, preview deployments only: returns example photos from Higgsfield as base64 WebP
// (through webleads.dk's image optimisation), so they can be checked and stored in the repo.
// Removed again before the branch is merged.
const OWN = /^https:\/\/d8j0ntlcm91z4\.cloudfront\.net\/user_3EtN08E3UnsnkCqQkeAhEJPV9Lu\/[\w.-]+\.png$/;

export default async function handler(req, res) {
  if (process.env.VERCEL_ENV === 'production') return res.status(404).end();
  const w = [480, 800, 1200].includes(Number(req.query.w)) ? Number(req.query.w) : 480;
  const q = Math.min(90, Math.max(40, Number(req.query.q) || 70));
  const urls = String(req.query.u || '').split('|').filter(u => OWN.test(u)).slice(0, 8);
  const out = [];
  for (const u of urls) {
    try {
      const r = await fetch(`https://webleads.dk/_vercel/image?url=${encodeURIComponent(u)}&w=${w}&q=${q}`, { headers: { Accept: 'image/webp' } });
      const buf = Buffer.from(await r.arrayBuffer());
      out.push({ u, status: r.status, type: r.headers.get('content-type'), bytes: buf.length, b64: r.ok ? buf.toString('base64') : '' });
    } catch (x) {
      out.push({ u, status: 0, error: String(x.message || x) });
    }
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(out);
}
