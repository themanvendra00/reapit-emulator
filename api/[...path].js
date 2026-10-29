// Node.js Serverless Function proxy (NOT the Edge runtime — Vercel's Edge
// environment refuses outbound fetches to a bare IP address with no
// hostname, which is exactly what the emulator is). The app is served over
// https, but the emulator only speaks plain http, so browsers block calling
// it directly as mixed content. Routing API calls through this same-origin
// function avoids that, and forwards the path/query/body exactly as
// received (a vercel.json "rewrites" entry to an external URL 404s on any
// request path ending in a trailing slash, which this app's list endpoints
// always use, e.g. `/vendors/?pageSize=...`).
const BACKEND = 'http://13.201.189.21:3001';

const DROP_REQUEST_HEADERS = new Set(['host', 'connection', 'content-length']);
const DROP_RESPONSE_HEADERS = new Set([
  'content-encoding',
  'content-length',
  'transfer-encoding',
  'connection',
]);

export default async function handler(req, res) {
  const suffix = req.url.replace(/^\/api/, '');
  const target = `${BACKEND}${suffix}`;

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
