import { fetchCategory, parseResource, isFeatured, cldUrl } from './cloudinary.js';

/** Fallback public_id si le dossier Cloudinary est vide / injoignable. */
const FALLBACK_ID = 'Garde-corps_Balcon_Fer_Forgé_Volutes_15_iac0gz';

/** Charge l'image balustrade : featured du dossier Garde-Corps, sinon 1ère, sinon fallback. */
export async function initRestoImage() {
  const img = document.getElementById('restoImg');
  if (!img) return;

  try {
    const resources = await fetchCategory('gardecorps');
    const images = resources.filter(r =>
      r.resource_type !== 'video' &&
      !['mp4','mov','webm','avi','mkv'].includes((r.format || '').toLowerCase())
    );

    const hero = images.find(isFeatured) || images[0];

    if (hero) {
      const p = parseResource(hero, { extra: 'c_limit', w: 800, wHd: 1600 });
      img.src    = p.src;
      img.srcset = p.srcset;
      img.sizes  = '(max-width: 960px) 100vw, 45vw';
      return;
    }
  } catch (_) { /* fallback below */ }

  // Fallback : ancien public_id hardcodé
  const extra = 'c_limit';
  img.src    = cldUrl(FALLBACK_ID, null, 'jpg', 800, extra);
  img.srcset = [400, 800, 1200]
    .map(w => `${cldUrl(FALLBACK_ID, null, 'jpg', w, extra)} ${w}w`)
    .join(', ');
  img.sizes  = '(max-width: 960px) 100vw, 45vw';
}
