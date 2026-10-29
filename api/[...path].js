// Edge Function proxy: the app is served over https, but the emulator only
// speaks plain http — browsers block that as mixed content. Routing API
// calls through this same-origin function (instead of a vercel.json
// "rewrites" entry) avoids a Vercel edge quirk where an external rewrite
// 404s on any request path ending in a trailing slash, which this app's
// list endpoints always do (e.g. `/vendors/?pageSize=...`).
export const config = { runtime: 'edge' };

const BACKEND = 'http://13.201.189.21:3001';

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'content-encoding',
  'content-length',
  'host',
]);

export default async function handler(request) {
  const url = new URL(request.url);
  const suffix = url.pathname.replace(/^\/api/, '') + url.search;
  const target = `${BACKEND}${suffix}`;

  const headers = new Headers(request.headers);
  HOP_BY_HOP.forEach((h) => headers.delete(h));

  const init = { method: request.method, headers };
  if (!['GET', 'HEAD'].includes(request.method)) {
    init.body = request.body;
    init.duplex = 'half';
  }

  let upstream;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    return new Response(
      JSON.stringify({ message: `Could not reach emulator at ${BACKEND}: ${err.message}` }),
      { status: 502, headers: { 'content-type': 'application/json' } },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  HOP_BY_HOP.forEach((h) => responseHeaders.delete(h));

  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}
