import './styles/main.css';

import { initTheme }  from './js/theme.js';
import { initLenis }  from './js/lenis.js';
import { initReveal } from './js/reveal.js';
import { fetchCategory, parseResource } from './js/cloudinary.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

/** Galerie 3 photos Cloudinary sur les landing pages ([data-seo-gallery="cat"]).
 *  Échec réseau ou catégorie vide → le bloc disparaît proprement. */
async function initSeoGallery() {
  const slot = document.querySelector('[data-seo-gallery]');
  if (!slot) return;
  try {
    const resources = await fetchCategory(slot.dataset.seoGallery);
    const imgs = resources
      .filter(r => r.resource_type !== 'video' && !['mp4','mov','webm','avi','mkv'].includes((r.format || '').toLowerCase()))
      .slice(0, 3)
      .map(r => parseResource(r, { extra: 'c_limit', w: 900, wHd: 900 }));
    if (!imgs.length) { slot.remove(); return; }
    slot.innerHTML = imgs.map(p =>
      `<figure><img src="${esc(p.src)}" alt="${esc(p.title)}" loading="lazy" decoding="async"/></figure>`
    ).join('');
  } catch (_) {
    slot.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLenis();
  initReveal();
  initSeoGallery();

  const yEl = document.getElementById('footYear');
  if (yEl) yEl.textContent = new Date().getFullYear();
});
