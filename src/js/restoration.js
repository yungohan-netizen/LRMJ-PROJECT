import { cldUrl } from './cloudinary.js';

/** Public_ids exacts tels que stockés dans Cloudinary (encodeURI gère les espaces).
 *  Grille 2×2, tout en portrait : before/after = la même balustrade (dépose puis
 *  repose), facade/balcony = deux garde-corps restaurés en façade bruxelloise. */
const RESTO_IMGS = [
  { id: 'restoImgBefore',  publicId: 'Restauration Garde-Corps 2' },
  { id: 'restoImgAfter',   publicId: 'Restauration Garde-Corps 3' },
  { id: 'restoImgFacade',  publicId: 'Garde-corps Ballustrade 4'  },
  { id: 'restoImgBalcony', publicId: 'Restauration Garde-Corps'   },
];

const EXTRA = 'c_fill,g_auto,ar_3:4';
const SIZES = '(max-width: 960px) 45vw, 22vw';

export function initRestoImage() {
  RESTO_IMGS.forEach(({ id, publicId }) => {
    const img = document.getElementById(id);
    if (!img) return;

    img.src    = cldUrl(publicId, null, 'jpg', 800, EXTRA);
    img.srcset = [400, 800, 1200]
      .map(w => `${cldUrl(publicId, null, 'jpg', w, EXTRA)} ${w}w`)
      .join(', ');
    img.sizes  = SIZES;

    // Lightbox : photo entière (c_limit), pas le recadrage 3:4 de la grille
    const item = img.closest('[data-lb-group]');
    if (item) item.dataset.imgHd = cldUrl(publicId, null, 'jpg', 1600, 'c_limit');
  });
}
