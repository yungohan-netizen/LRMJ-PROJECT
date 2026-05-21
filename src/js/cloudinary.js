/** Cloudinary delivery helpers + image/list fetch by tag. */

const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD || '';

export const TAGS = {
  gallery:     import.meta.env.VITE_CLD_TAG_GALLERY     || 'lrmj-realisation',
  featured:    import.meta.env.VITE_CLD_TAG_FEATURED    || 'lrmj-featured',
  portails:    import.meta.env.VITE_CLD_TAG_PORTAILS    || 'lrmj-portails',
  gardecorps:  import.meta.env.VITE_CLD_TAG_GARDECORPS  || 'lrmj-gardecorps',
  baies:       import.meta.env.VITE_CLD_TAG_BAIES       || 'lrmj-baies',
  verrieres:   import.meta.env.VITE_CLD_TAG_VERRIERES   || 'lrmj-verrieres',
  marquises:   import.meta.env.VITE_CLD_TAG_MARQUISES   || 'lrmj-marquises',
  escaliers:   import.meta.env.VITE_CLD_TAG_ESCALIERS   || 'lrmj-escaliers',
  meubles:     import.meta.env.VITE_CLD_TAG_MEUBLES     || 'lrmj-meubles',
  atelier:     import.meta.env.VITE_CLD_TAG_ATELIER     || 'lrmj-atelier',
};

export const HERO_VIDEO_ID  = import.meta.env.VITE_HERO_VIDEO_ID  || '';
export const HERO_POSTER_ID = import.meta.env.VITE_HERO_POSTER_ID || '';
export const LOGO_ID        = import.meta.env.VITE_LOGO_ID        || '';

/** Build delivery URL with transformations.
 *  @param {string} publicId  ex "LMRJ PROJECT/Portails et Clotures/portail_xyz"
 *  @param {number} version
 *  @param {string} format    "jpg" | "png" | "webp"
 *  @param {number} w         target width px
 *  @param {string} extra     additional transforms (e.g. "c_fill,g_auto")
 */
export function cldUrl(publicId, version, format = 'jpg', w = 1200, extra = 'c_limit') {
  if (!CLOUD) return '';
  const v = version ? `/v${version}` : '';
  const t = `f_auto,q_auto,${extra},w_${w}`;
  const id = encodeURI(publicId);
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${t}${v}/${id}.${format}`;
}

/** Responsive srcset. */
export function cldSrcset(publicId, version, format, extra = 'c_limit') {
  return [400, 800, 1200, 1600, 2000]
    .map(w => `${cldUrl(publicId, version, format, w, extra)} ${w}w`)
    .join(', ');
}

/** Public ID basename → human title (replace _ - with space). */
export function titleFromPublicId(publicId) {
  return publicId.split('/').pop()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cache for fetched tag lists. */
const cache = new Map();

/** Fetch resources for a Cloudinary tag.
 *  Requires "Resource list" enabled in Cloudinary Console → Security.
 *  Returns array of { public_id, version, format, width, height } or empty array on error. */
export async function fetchByTag(tag) {
  if (!CLOUD || !tag) return [];
  if (cache.has(tag)) return cache.get(tag);

  try {
    const res = await fetch(
      `https://res.cloudinary.com/${CLOUD}/image/list/${encodeURIComponent(tag)}.json`,
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`Cloudinary list ${tag}: ${res.status}`);
    const data = await res.json();
    const resources = data.resources || [];
    resources.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    cache.set(tag, resources);
    return resources;
  } catch (err) {
    console.warn(`[LRMJ] Cloudinary tag "${tag}" indisponible — fallback.`, err);
    cache.set(tag, []);
    return [];
  }
}

/** Map a Cloudinary resource to view-model {title, src, srcHd, srcset}. */
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
  };
}
