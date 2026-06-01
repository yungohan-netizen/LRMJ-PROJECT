import './styles/main.css';

import { initTheme }    from './js/theme.js';
import { initI18n }     from './js/i18n.js';
import { initLenis }    from './js/lenis.js';
import { initReveal }   from './js/reveal.js';
import { initLightbox } from './js/lightbox.js';
import { fetchGallery, parseResource, isFeatured, isMasonryPinned } from './js/cloudinary.js';

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

/** Render full masonry (CSS columns) — tous items, ratio natif, lazy. */
async function initPortfolio() {
  const grid = document.getElementById('masonryGrid');
  if (!grid) return;

  const resources = await fetchGallery();
  if (!resources.length) return;

  resources.sort((a, b) => {
    const am = isMasonryPinned(a) ? 0 : 1;
    const bm = isMasonryPinned(b) ? 0 : 1;
    if (am !== bm) return am - bm;
    const af = isFeatured(a) ? 0 : 1;
    const bf = isFeatured(b) ? 0 : 1;
    if (af !== bf) return af - bf;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const items = resources.map(r => parseResource(r, {
    extra: 'c_limit',
    w: 800,
    wHd: 2000,
  }));

  const cardHtml = (p) => `<div class="portfolio-item masonry-item" role="listitem" data-img-hd="${escapeHtml(p.srcHd)}">
    <img src="${escapeHtml(p.src)}"
         srcset="${escapeHtml(p.srcset)}"
         sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
         alt="${escapeHtml(p.title)}"
         width="${p.width || 800}" height="${p.height || 1000}"
         loading="lazy" decoding="async"/>
    <div class="masonry-item__label">${escapeHtml(p.title)}</div>
  </div>`;

  grid.innerHTML = items.map(cardHtml).join('');
  document.dispatchEvent(new CustomEvent('lrmj:masonry-updated'));
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initI18n();
  initLenis();
  initReveal();
  initLightbox();
  initPortfolio();
});
