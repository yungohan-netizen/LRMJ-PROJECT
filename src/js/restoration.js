import { cldUrl } from './cloudinary.js';

/** Public_id exact tel que stocké dans Cloudinary (encodeURI gère les espaces). */
const RESTO_IMG_ID = 'Restauration Garde-Corps 3';

export function initRestoImage() {
  const img = document.getElementById('restoImg');
  if (!img) return;

  const extra = 'c_limit';
  img.src    = cldUrl(RESTO_IMG_ID, null, 'jpg', 800, extra);
  img.srcset = [400, 800, 1200]
    .map(w => `${cldUrl(RESTO_IMG_ID, null, 'jpg', w, extra)} ${w}w`)
    .join(', ');
  img.sizes  = '(max-width: 960px) 100vw, 45vw';
}
