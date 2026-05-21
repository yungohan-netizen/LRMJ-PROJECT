/**
 * Cloudflare Pages Function — proxies Cloudinary Admin API by_asset_folder.
 * Secret reste server-side dans env vars CF (Settings → Environment variables).
 *
 * Required env vars (set in CF Pages dashboard, Production + Preview):
 *   CLOUDINARY_CLOUD
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */
export async function onRequest(context) {
  const { params, env, request } = context;
  const folder = decodeURIComponent(params.folder || '');

  if (!folder) {
    return new Response(JSON.stringify({ error: 'Missing folder' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { CLOUDINARY_CLOUD, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = env;
  if (!CLOUDINARY_CLOUD || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return new Response(JSON.stringify({ error: 'Cloudinary credentials missing in environment' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const auth = btoa(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`);
  // tags + context + metadata : needed pour detection "featured"
  const apiUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/resources/by_asset_folder?asset_folder=${encodeURIComponent(folder)}&max_results=500&tags=true&context=true&metadata=true`;

  try {
    const r = await fetch(apiUrl, { headers: { Authorization: `Basic ${auth}` } });
    const body = await r.text();
    return new Response(body, {
      status: r.status,
      headers: {
        'Content-Type': 'application/json',
        // 60s CDN cache : compromis entre perf et propagation rapide des changes Cloudinary
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
