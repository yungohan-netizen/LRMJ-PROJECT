/** Cloudinary delivery helpers + folder fetch (via /api/cloudinary proxy). */

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || 'dbugcatig';

/** Mapping logique → vrais dossiers Cloudinary.
 *  Ajuste si tu renommes dossiers Console. */
export const FOLDERS = {
  portails:   'LMRJ PROJECT/Portails et Clotures',
  gardecorps: 'LMRJ PROJECT/Garde-Corps',
  verrieres:  'LMRJ PROJECT/Verrières',
  marquises:  'LMRJ PROJECT/Marquises',
  escaliers:  'LMRJ PROJECT/Escaliers',
  meubles:    'LMRJ PROJECT/Meubles-Déco',
  atelier:    'LMRJ PROJECT/Atelier',
};

/** Liste utilisée pour la galerie masonry = union de toutes catégories métier. */
export const GALLERY_FOLDERS = [
  'portails', 'gardecorps', 'verrieres',
  'marquises', 'escaliers', 'meubles',
];

/** Tag "Masonry" → épingle la photo en tête de galerie masonry, peu importe le dossier.
 *  Utilisation Cloudinary : ajouter le tag "Masonry" (capital M, insensible à la casse). */
export function isMasonryPinned(r) {
  if (Array.isArray(r.tags)) {
    for (const t of r.tags) {
      if (typeof t === 'string' && /^masonry$/i.test(t)) return true;
    }
  }
  return false;
}

/** Detection "featured" cross-mechanism :
 *  - tag classique "featured" ou "lrmj-featured"
 *  - context custom { featured: "true" }
 *  - structured metadata { featured: true } */
export function isFeatured(r) {
  // Tags : case-insensitive ("Featured", "featured", "lrmj-featured"…)
  if (Array.isArray(r.tags)) {
    for (const t of r.tags) {
      if (typeof t === 'string' && /^(lrmj-)?featured$/i.test(t)) return true;
    }
  }
  const ctx = r.context?.custom?.featured ?? r.context?.featured;
  if (ctx === true || ctx === 'true' || ctx === '1') return true;
  const meta = r.metadata?.featured;
  if (meta === true || meta === 'true' || meta === '1') return true;
  return false;
}

export const HERO_VIDEO_ID  = import.meta.env.VITE_HERO_VIDEO_ID  || 'lrmj project hero video';
export const HERO_POSTER_ID = import.meta.env.VITE_HERO_POSTER_ID || '';
export const LOGO_ID        = import.meta.env.VITE_LOGO_ID        || 'LRMJ_PROJECT_LOGO_xzm1yq';

/** Build delivery URL with transformations. */
export function cldUrl(publicId, version, format = 'jpg', w = 1200, extra = 'c_limit') {
  if (!CLOUD) return '';
  const v = version ? `/v${version}` : '';
  const t = `f_auto,q_auto,${extra},w_${w}`;
  const id = encodeURI(publicId);
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${t}${v}/${id}.${format}`;
}

export function cldSrcset(publicId, version, format, extra = 'c_limit') {
  return [400, 800, 1200, 1600, 2000]
    .map(w => `${cldUrl(publicId, version, format, w, extra)} ${w}w`)
    .join(', ');
}

export function titleFromPublicId(publicId) {
  return publicId.split('/').pop()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const cache = new Map();

/** Fetch resources for a Cloudinary asset folder (via /api/cloudinary proxy).
 *  Proxy gère l'auth Admin API server-side (secret jamais expédié au client). */
export async function fetchByFolder(folder) {
  if (!folder) return [];
  if (cache.has(folder)) return cache.get(folder);

  try {
    const res = await fetch(`/api/cloudinary/${encodeURIComponent(folder)}`, { cache: 'default' });
    if (!res.ok) throw new Error(`Folder ${folder}: ${res.status}`);
    const data = await res.json();
    const resources = data.resources || [];
    resources.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    cache.set(folder, resources);
    return resources;
  } catch (err) {
    console.warn(`[LRMJ] Cloudinary folder "${folder}" failed — fallback.`, err);
    cache.set(folder, []);
    return [];
  }
}

/** Fetch one category by logical key. */
export function fetchCategory(key) {
  return fetchByFolder(FOLDERS[key]);
}

/** Aggregate all gallery folders, dedupe by public_id. */
export async function fetchGallery() {
  const arrays = await Promise.all(GALLERY_FOLDERS.map(k => fetchCategory(k)));
  const seen = new Set();
  const merged = [];
  arrays.flat().forEach(r => {
    if (!seen.has(r.public_id)) {
      seen.add(r.public_id);
      merged.push(r);
    }
  });
  // Shuffle légèrement pour variété visuelle : group by category but interleave
  return merged;
}

/** Map a Cloudinary resource to view-model. */
export function parseResource(r, opts = {}) {
  const { extra = 'c_fill,g_auto', w = 800, wHd = 1600 } = opts;
  return {
    publicId: r.public_id,
    tags: r.tags || [],
    title: titleFromPublicId(r.public_id),
    src:    cldUrl(r.public_id, r.version, r.format, w, extra),
    srcHd:  cldUrl(r.public_id, r.version, r.format, wHd, extra),
    srcset: cldSrcset(r.public_id, r.version, r.format, extra),
    width:  r.width,
    height: r.height,
    createdAt: r.created_at,
  };
}
