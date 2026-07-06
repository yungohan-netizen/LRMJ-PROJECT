import { defineConfig, loadEnv } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

/** Cloudinary Admin API proxy — dev only (Vite middleware).
 *  Prod : équivalent dans functions/api/cloudinary/[folder].js (Cloudflare Pages).
 *  Secret jamais expédié au client : vit dans process.env (non-VITE_ prefix). */
function cloudinaryProxy(env) {
  return {
    name: 'lrmj-cloudinary-proxy',
    configureServer(server) {
      server.middlewares.use('/api/cloudinary', async (req, res) => {
        const cloud  = env.CLOUDINARY_CLOUD;
        const key    = env.CLOUDINARY_API_KEY;
        const secret = env.CLOUDINARY_API_SECRET;

        if (!cloud || !key || !secret) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Cloudinary credentials missing in .env' }));
          return;
        }

        const folder = decodeURIComponent((req.url || '').replace(/^\//, '').split('?')[0]);
        if (!folder) {
          res.statusCode = 400;
          res.end('Missing folder');
          return;
        }

        const auth = Buffer.from(`${key}:${secret}`).toString('base64');
        // tags + context + metadata: needed pour detection "featured" (tag ou metadata)
        const apiUrl = `https://api.cloudinary.com/v1_1/${cloud}/resources/by_asset_folder?asset_folder=${encodeURIComponent(folder)}&max_results=500&tags=true&context=true&metadata=true`;

        try {
          const r = await fetch(apiUrl, { headers: { Authorization: `Basic ${auth}` } });
          const body = await r.text();
          res.statusCode = r.status;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'public, max-age=30');
          res.end(body);
        } catch (err) {
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
  };
}

/** URLs propres en dev/preview : /portfolio → portfolio.html, /nl/x → nl/x.html.
 *  Parité avec Cloudflare Pages qui le fait nativement en prod. */
function cleanUrls() {
  const rewrite = (root) => (req, _res, next) => {
    const url = (req.url || '').split('?')[0];
    if (url !== '/' && !path.extname(url) && fs.existsSync(path.join(root, url + '.html'))) {
      req.url = url + '.html' + ((req.url || '').includes('?') ? '?' + req.url.split('?')[1] : '');
    }
    next();
  };
  return {
    name: 'lrmj-clean-urls',
    configureServer(server) { server.middlewares.use(rewrite(server.config.root)); },
    configurePreviewServer(server) { server.middlewares.use(rewrite(server.config.root)); },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    root: '.',
    publicDir: 'public',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      cssCodeSplit: false,
      sourcemap: false,
      rollupOptions: {
        input: {
          main: 'index.html',
          portfolio: 'portfolio.html',
          mentions: 'mentions-legales.html',
          confidentialite: 'confidentialite.html',
        },
      },
    },
    server: {
      port: 5173,
      open: true,
      host: true,
    },
    preview: {
      port: 4173,
    },
    plugins: [cloudinaryProxy(env), cleanUrls()],
  };
});
