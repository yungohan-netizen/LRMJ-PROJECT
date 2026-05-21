import { fetchGallery, parseResource, isFeatured, isMasonryPinned } from './cloudinary.js';
import { revealNewFi } from './reveal.js';

/** Nombre d'items visibles selon viewport.
 *  desktop ≥ 961 → 21 | tablet 601-960 → 10 | mobile ≤ 600 → 7 */
function initialCount() {
  const w = window.innerWidth;
  if (w <= 600) return 7;
  if (w <= 960) return 10;
  return 21;
}

/** Populate masonry-grid from union of all category folders.
 *  If empty / unreachable → keep static fallback markup. */
export async function initMasonry() {
  const grid = document.getElementById('masonryGrid');
  if (!grid) return;

  const resources = await fetchGallery();
  if (!resources.length) return; // garde fallback HTML

  // Tri 3 niveaux :
  // 1. tag "Masonry" → épinglé en tête (peu importe le dossier)
  // 2. tag "Featured" → couvertures de catégorie
  // 3. date desc (ordre Cloudinary)
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
    extra: 'c_fill,g_auto',
    w: 800,
    wHd: 2000,
  }));

  const limit = initialCount();
  const cardHtml = (p, i) => {
    const cls = i >= limit ? 'masonry-item hidden' : 'masonry-item fi';
    return `<div class="${cls}" role="listitem" data-img-hd="${p.srcHd}">
      <img src="${p.src}"
           srcset="${p.srcset}"
           sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
           alt="${escapeAttr(p.title)}"
           width="${p.width || 1024}" height="${p.height || 1280}"
           loading="lazy" decoding="async"/>
      <div class="masonry-item__label">${escapeHtml(p.title)}</div>
    </div>`;
  };

  grid.innerHTML = items.map(cardHtml).join('');
  revealNewFi(grid);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
const escapeAttr = escapeHtml;
