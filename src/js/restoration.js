import { cldUrl } from './cloudinary.js';

/** Public_ids exacts tels que stockés dans Cloudinary (encodeURI gère les espaces).
 *  before/after = la même balustrade, avant dépose et après repose. */
const RESTO_IMGS = [
  {
    id: 'restoImgBefore',
    publicId: 'Restauration Garde-Corps 2',
    extra: 'c_fill,g_auto,ar_3:4',
    sizes: '(max-width: 960px) 45vw, 22vw',
  },
  {
    id: 'restoImgAfter',
    publicId: 'Restauration Garde-Corps 3',
    extra: 'c_fill,g_auto,ar_3:4',
    sizes: '(max-width: 960px) 45vw, 22vw',
  },
  {
    id: 'restoImg',
    publicId: 'Restauration Garde-Corps',
    extra: 'c_fill,g_auto,ar_3:2',
    sizes: '(max-width: 960px) 100vw, 45vw',
  },
];

export function initRestoImage() {
  RESTO_IMGS.forEach(({ id, publicId, extra, sizes }) => {
    const img = document.getElementById(id);
    if (!img) return;

    img.src    = cldUrl(publicId, null, 'jpg', 800, extra);
    img.srcset = [400, 800, 1200]
      .map(w => `${cldUrl(publicId, null, 'jpg', w, extra)} ${w}w`)
      .join(', ');
    img.sizes  = sizes;
  });
}
