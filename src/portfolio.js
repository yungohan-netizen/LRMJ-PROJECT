import './styles/main.css';

import { initTheme }     from './js/theme.js';
import { initI18n }      from './js/i18n.js';
import { initLenis }     from './js/lenis.js';
import { initSplitText } from './js/splitText.js';
import { initReveal }    from './js/reveal.js';
import { initLightbox }  from './js/lightbox.js';
import { fetchCategory, parseResource, isFeatured, isMasonryPinned } from './js/cloudinary.js';

const CATS = ['portails', 'gardecorps', 'verrieres', 'marquises', 'escaliers', 'meubles'];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

function tileHtml(p) {
  return `<div class="portfolio-item masonry-item" role="listitem" data-img-hd="${escapeHtml(p.srcHd)}">
    <img src="${escapeHtml(p.src)}"
         srcset="${escapeHtml(p.srcset)}"
         sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
         alt="${escapeHtml(p.title)}"
         width="${p.width || 800}" height="${p.height || 1000}"
         loading="lazy" decoding="async"/>
    <div class="masonry-item__label">${escapeHtml(p.title)}</div>
  </div>`;
}

/** Charge une catégorie, rend sa grille, met à jour le count. Cache section si vide. */
async function renderCategory(cat) {
  const section = document.getElementById(cat);
  if (!section) return 0;
  const grid = section.querySelector('[data-grid]');
  const countEl = section.querySelector('[data-count]');

  const resources = await fetchCategory(cat);
  const images = resources.filter(r =>
    r.resource_type !== 'video' &&
    !['mp4','mov','webm','avi','mkv'].includes((r.format || '').toLowerCase())
  );

  if (!images.length) {
    section.hidden = true;
    return 0;
  }

  images.sort((a, b) => {
    const am = isMasonryPinned(a) ? 0 : 1;
    const bm = isMasonryPinned(b) ? 0 : 1;
    if (am !== bm) return am - bm;
    const af = isFeatured(a) ? 0 : 1;
    const bf = isFeatured(b) ? 0 : 1;
    if (af !== bf) return af - bf;
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const items = images.map(r => parseResource(r, { extra: 'c_limit', w: 800, wHd: 2000 }));
  grid.innerHTML = items.map(tileHtml).join('');
  if (countEl) countEl.textContent = images.length;
  return images.length;
}

/** Sticky filter chips : click = scroll vers section, scroll = highlight chip actif. */
function initFilters() {
  const chips = Array.from(document.querySelectorAll('.pf-chip'));
  if (!chips.length) return;

  // Click "Tout" scroll en haut, chip catégorie scroll vers section
  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      const cat = chip.dataset.cat;
      if (cat === 'all') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveChip('all');
      }
      // Sinon : laisse l'ancre + scroll-padding-top faire le travail
    });
  });

  // IntersectionObserver pour highlight le chip de la section visible
  const sections = CATS.map(c => document.getElementById(c)).filter(Boolean);
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    // Pick section avec ratio le plus haut
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) {
      setActiveChip(visible.target.id);
    } else if (window.scrollY < 200) {
      setActiveChip('all');
    }
  }, {
    rootMargin: '-30% 0px -55% 0px',
    threshold: [0, 0.1, 0.3, 0.6, 1],
  });
  sections.forEach(s => io.observe(s));
}

function setActiveChip(cat) {
  document.querySelectorAll('.pf-chip').forEach(chip => {
    const active = chip.dataset.cat === cat;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

/** Init full portfolio page. */
async function initPortfolio() {
  // Charge toutes catégories en parallèle
  await Promise.all(CATS.map(renderCategory));

  // Rebind lightbox sur les nouveaux .masonry-item
  document.dispatchEvent(new CustomEvent('lrmj:masonry-updated'));

  // Active filters après render
  initFilters();
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initI18n();
  initLenis();
  initSplitText();
  initReveal();
  initLightbox();
  initPortfolio();

  // Footer year
  const yEl = document.getElementById('footYear');
  if (yEl) yEl.textContent = new Date().getFullYear();
});
