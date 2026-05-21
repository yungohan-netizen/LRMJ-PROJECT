import { fetchCategory, parseResource } from './cloudinary.js';

/** Replace static svc-card images with first asset from category folder. */
export async function initServices() {
  const mapping = [
    { selector: '.svc-card[data-svc="portails"]',   key: 'portails'   },
    { selector: '.svc-card[data-svc="gardecorps"]', key: 'gardecorps' },
    { selector: '.svc-card[data-svc="baies"]',      key: 'baies'      },
    { selector: '.svc-card[data-svc="marquises"]',  key: 'marquises'  },
  ];

  await Promise.all(mapping.map(async ({ selector, key }) => {
    const card = document.querySelector(selector);
    if (!card) return;
    const img = card.querySelector('img.svc-img');
    if (!img) return;
    const resources = await fetchCategory(key);
    if (!resources.length) return;

    const featured = resources.find(r => (r.tags || []).includes('lrmj-featured')) || resources[0];
    const p = parseResource(featured, { extra: 'c_fill,g_auto', w: 1200, wHd: 1600 });

    img.src = p.src;
    img.srcset = p.srcset;
    img.sizes = '(max-width: 900px) 100vw, 33vw';
    img.alt = p.title;
  }));
}

/** Replace about-img with first asset from atelier folder. */
export async function initAboutImage() {
  const img = document.querySelector('.about-img img');
  if (!img) return;
  const resources = await fetchCategory('atelier');
  if (!resources.length) return;
  const featured = resources.find(r => (r.tags || []).includes('lrmj-featured')) || resources[0];
  const p = parseResource(featured, { extra: 'c_fill,g_auto,ar_4:5', w: 800, wHd: 1200 });
  img.src = p.src;
  img.srcset = p.srcset;
  img.sizes = '(max-width: 820px) 100vw, 40vw';
  img.alt = p.title;
}
