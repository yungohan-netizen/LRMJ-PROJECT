import { cldUrl } from './cloudinary.js';

/** Public_id exact tel que stocké dans Cloudinary (encodeURI gère le é). */
const RESTO_IMG_ID = 'Garde-corps_Balcon_Fer_Forgé_Volutes_15_iac0gz';

export function initRestoImage() {
  const img = document.getElementById('restoImg');
  if (!img) return;

  const extra = 'c_limit';
  img.src    = cldUrl(RESTO_IMG_ID, null, 'jpg', 800, extra);
  img.srcset = [400, 800, 1200]
    .map(w => `${cldUrl(RESTO_IMG_ID, null, 'jpg', w, extra)} ${w}w`)
    .join(', ');
}
