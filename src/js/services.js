import { fetchCategory, parseResource, isFeatured, cldUrl, cldSrcset } from './cloudinary.js';

/** Pick best image of a category : featured first, fallback first image.
 *  Skips videos (resource_type "video" ou format mp4/mov/webm…). */
function pickHero(resources) {
  const images = resources.filter(r =>
    r.resource_type !== 'video' &&
    !['mp4','mov','webm','avi','mkv'].includes((r.format || '').toLowerCase())
  );
  if (!images.length) return null;
  return images.find(isFeatured) || images[0];
}

/** Fallback static si dossier Cloudinary vide (public_id connu). */
const STATIC_FALLBACKS = {
  marquises: 'Pergola_Terrasse_Acier_Pergola',
};

/** Replace static svc-card images with hero asset from category folder. */
export async function initServices() {
  const mapping = [
    { selector: '.svc-card[data-svc="portails"]',   key: 'portails'   },
    { selector: '.svc-card[data-svc="gardecorps"]', key: 'gardecorps' },
    { selector: '.svc-card[data-svc="verrieres"]',  key: 'verrieres'  },
    { selector: '.svc-card[data-svc="marquises"]',  key: 'marquises'  },
  ];

  await Promise.all(mapping.map(async ({ selector, key }) => {
    const card = document.querySelector(selector);
    if (!card) return;
    const img = card.querySelector('img.svc-img');
    if (!img) return;

    const resources = await fetchCategory(key);
    const hero = pickHero(resources);

    if (hero) {
      const p = parseResource(hero, { extra: 'c_fill,g_auto', w: 1200, wHd: 1600 });
      img.src    = p.src;
      img.srcset = p.srcset;
      img.sizes  = '(max-width: 900px) 100vw, 33vw';
      img.alt    = p.title;
    } else if (STATIC_FALLBACKS[key]) {
      const pid = STATIC_FALLBACKS[key];
      img.src    = cldUrl(pid, null, 'jpg', 1200, 'c_fill,g_auto');
      img.srcset = cldSrcset(pid, null, 'jpg', 'c_fill,g_auto');
      img.sizes  = '(max-width: 900px) 100vw, 33vw';
      img.alt    = pid.replace(/[_-]+/g, ' ');
    } else {
      return; // pas de fallback → garde placeholder
    }

    card.classList.remove('svc-card--loading');
  }));
}

/** Replace about-img with hero asset from atelier folder. */
export async function initAboutImage() {
  const wrap = document.querySelector('.about-img');
  const img = wrap?.querySelector('img');
  if (!img) return;
  const resources = await fetchCategory('atelier');
  const hero = pickHero(resources);
  if (!hero) return;
  const p = parseResource(hero, { extra: 'c_fill,g_auto,ar_4:5', w: 800, wHd: 1200 });
  img.src = p.src;
  img.srcset = p.srcset;
  img.sizes = '(max-width: 820px) 100vw, 40vw';
  img.alt = p.title;
  wrap.classList.remove('about-img--loading');
}
