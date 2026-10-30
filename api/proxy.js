// Node.js Serverless Function proxy. The app is served over https, but the
// emulator only speaks plain http, so browsers block calling it directly as
// mixed content. Routing API calls through this same-origin function avoids
// that.
//
// This is deliberately NOT a bracket-named catch-all file (e.g.
// `[...path].js`) — on this project that only ever matched a single path
// segment (e.g. `/api/vendors` worked, `/api/vendors/VND011` 404'd before
// even reaching the function). Instead, vercel.json rewrites every
// `/api/:path*` request to this fixed function and injects the real
// sub-path as a `rawpath` query param, which reliably preserves the full
// path (including trailing slashes, e.g. `/vendors/?pageSize=...`) exactly
// as the browser sent it.
const BACKEND = 'http://13.201.189.21:3001';

const DROP_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length']);
const DROP_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
]);

export default async function handler(req, res) {
  const { rawpath, ...rest } = req.query;

  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(rest)) {
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
    else if (value !== undefined) qs.append(key, value);
  }
  const query = qs.toString();
  const path = rawpath ? (Array.isArray(rawpath) ? rawpath.join('/') : rawpath) : '';
  const target = `${BACKEND}/${path}${query ? `?${query}` : ''}`;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (!DROP_REQUEST_HEADERS.has(key.toLowerCase())) headers[key] = value;
  }

  let body;
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });
  }

  let upstream;
  try {
    upstream = await fetch(target, { method: req.method, headers, body });
  } catch (err) {
    res.status(502).json({ message: `Could not reach emulator at ${BACKEND}: ${err.message}` });
    return;
  }

  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    if (!DROP_RESPONSE_HEADERS.has(key.toLowerCase())) res.setHeader(key, value);
  });
  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
}
