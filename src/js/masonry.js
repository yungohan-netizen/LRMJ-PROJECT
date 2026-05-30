import { fetchGallery, parseResource, isFeatured, isMasonryPinned } from './cloudinary.js';

/** Nombre de rangées du marquee. */
const ROWS = 3;
/** Plafond d'items affichés (perf : DOM nodes = CAP × 2 pour le loop). */
const CAP = 60;

/** Peuple #masonryGrid en 3 rangées défilantes (marquee).
 *  Chaque rangée = items originaux + clone (loop translateX -50%).
 *  Garde fallback skeleton si Cloudinary vide / injoignable. */
export async function initMasonry() {
  const grid = document.getElementById('masonryGrid');
  if (!grid) return;

  const resources = await fetchGallery();
  if (!resources.length) return; // garde skeleton HTML

  // Tri 3 niveaux : Masonry pin > Featured > date desc
  resources.sort((a, b) => {
    const am = isMasonryPinned(a) ? 0 : 1;
    const bm = isMasonryPinned(b) ? 0 : 1;
    if (am !== bm) return am - bm;
    const af = isFeatured(a) ? 0 : 1;
    const bf = isFeatured(b) ? 0 : 1;
    if (af !== bf) return af - bf;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  // c_limit : préserve le ratio natif (vertical / horizontal / carré).
  // La hauteur est fixée en CSS, la largeur suit le ratio → agencement varié.
  const items = resources.slice(0, CAP).map(r => parseResource(r, {
    extra: 'c_limit',
    w: 700,
    wHd: 2000,
  }));

  // Répartit en ROWS rangées (round-robin pour mélanger les catégories)
  const rows = Array.from({ length: ROWS }, () => []);
  items.forEach((p, i) => rows[i % ROWS].push(p));

  const tile = (p, clone = false) => `<div
      class="masonry-item${clone ? ' is-clone' : ''}"
      role="listitem"${clone ? ' aria-hidden="true"' : ''}
      data-img-hd="${escapeAttr(p.srcHd)}">
      <img src="${escapeAttr(p.src)}"
           alt="${escapeAttr(p.title)}"
           width="${p.width || 800}" height="${p.height || 800}"
           loading="lazy" decoding="async"/>
      <div class="masonry-item__label">${escapeHtml(p.title)}</div>
    </div>`;

  // Original + clone dans chaque track → loop sans couture (-50%)
  const rowHtml = (rowItems) => {
    const set = rowItems.map(p => tile(p, false)).join('');
    const cloneSet = rowItems.map(p => tile(p, true)).join('');
    return `<div class="marquee__row"><div class="marquee__track">${set}${cloneSet}</div></div>`;
  };

  grid.innerHTML = rows.map(rowHtml).join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
const escapeAttr = escapeHtml;
