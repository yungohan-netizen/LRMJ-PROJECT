import { TAGS, fetchByTag, parseResource } from './cloudinary.js';

/** Replace static svc-card images with first asset from category tag. */
export async function initServices() {
  const mapping = [
    { selector: '.svc-card[data-svc="portails"]',    tag: TAGS.portails    },
    { selector: '.svc-card[data-svc="gardecorps"]',  tag: TAGS.gardecorps  },
    { selector: '.svc-card[data-svc="baies"]',      tag: TAGS.baies      },
    { selector: '.svc-card[data-svc="marquises"]',   tag: TAGS.marquises   },
  ];

  await Promise.all(mapping.map(async ({ selector, tag }) => {
    const card = document.querySelector(selector);
    if (!card) return;
    const img = card.querySelector('img.svc-img');
    if (!img) return;
    const resources = await fetchByTag(tag);
    if (!resources.length) return;

    // Prefer featured tag if exists, else first by date
    const featured = resources.find(r => (r.tags || []).includes(TAGS.featured)) || resources[0];
    const p = parseResource(featured, { extra: 'c_fill,g_auto', w: 1200, wHd: 1600 });

    img.src = p.src;
    img.srcset = p.srcset;
    img.sizes = '(max-width: 900px) 100vw, 33vw';
    img.alt = p.title;
  }));
}

/** Replace about-img with first asset from atelier tag. */
export async function initAboutImage() {
  const img = document.querySelector('.about-img img');
  if (!img) return;
  const resources = await fetchByTag(TAGS.atelier);
  if (!resources.length) return;
  const featured = resources.find(r => (r.tags || []).includes(TAGS.featured)) || resources[0];
  const p = parseResource(featured, { extra: 'c_fill,g_auto,ar_4:5', w: 800, wHd: 1200 });
  img.src = p.src;
  img.srcset = p.srcset;
  img.sizes = '(max-width: 820px) 100vw, 40vw';
  img.alt = p.title;
}
