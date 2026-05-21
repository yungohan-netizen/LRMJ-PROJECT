import { TAGS, fetchByTag, parseResource } from './cloudinary.js';
import { revealNewFi } from './reveal.js';

/** Populate masonry-grid from Cloudinary tag VITE_CLD_TAG_GALLERY.
 *  If empty / unreachable → keep static fallback markup. */
export async function initMasonry() {
  const grid = document.getElementById('masonryGrid');
  if (!grid) return;

  const resources = await fetchByTag(TAGS.gallery);
  if (!resources.length) return; // fallback HTML conservé

  const featured = new Set(resources
    .filter(r => (r.tags || []).includes(TAGS.featured))
    .map(r => r.public_id));

  // Featured d'abord, sinon order Cloudinary (date desc)
  resources.sort((a, b) => {
    const af = featured.has(a.public_id) ? 0 : 1;
    const bf = featured.has(b.public_id) ? 0 : 1;
    if (af !== bf) return af - bf;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const items = resources.map(r => parseResource(r, {
    extra: 'c_fill,g_auto',
    w: 800,
    wHd: 2000,
  }));

  const cardHtml = (p, i) => {
    const cls = i >= 8 ? 'masonry-item hidden' : 'masonry-item fi';
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
function escapeAttr(s) {
  return escapeHtml(s);
}
