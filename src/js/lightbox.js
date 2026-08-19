/** Lightbox — galerie masonry + groupes statiques ([data-lb-group]).
 *  Chaque groupe est indépendant : prev/next ne sort jamais du groupe ouvert. */
export function initLightbox() {
  const grid    = document.getElementById('masonryGrid');
  const loadBtn = document.getElementById('loadMoreBtn');

  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lbImg');
  const lbTitle = document.getElementById('lbTitle');
  const lbNum   = document.getElementById('lbNum');
  const lbClose = document.getElementById('lbClose');
  const lbPrev  = document.getElementById('lbPrev');
  const lbNext  = document.getElementById('lbNext');

  if (!lb) return;

  let items = [];
  let idx = 0;
  let lastFocus = null;
  let group = 'masonry';

  const readItem = (el) => {
    const img = el.querySelector('img');
    const lbl = el.querySelector('.masonry-item__label');
    return {
      src:   img ? img.src : '',
      srcHd: el.getAttribute('data-img-hd') || (img ? img.src : ''),
      title: lbl ? lbl.textContent.trim() : (img ? img.alt : ''),
      el,
    };
  };

  // Masonry : exclut les clones du marquee (.is-clone) pour ne pas dupliquer la liste
  const collectItems = () => {
    const nodes = group === 'masonry'
      ? (grid ? grid.querySelectorAll('.masonry-item:not(.is-clone):not(.hidden)') : [])
      : document.querySelectorAll(`[data-lb-group="${group}"]`);
    items = Array.from(nodes).map(readItem);
  };

  const fillLightbox = (i) => {
    const item = items[i];
    if (!item) return;
    lbImg.classList.add('is-swap');
    const preload = new Image();
    preload.onload = () => {
      lbImg.src = item.srcHd;
      lbImg.alt = item.title;
      requestAnimationFrame(() => lbImg.classList.remove('is-swap'));
    };
    preload.onerror = () => {
      lbImg.src = item.src;
      lbImg.alt = item.title;
      lbImg.classList.remove('is-swap');
    };
    preload.src = item.srcHd;
    lbTitle.textContent = item.title;
    lbNum.textContent = `${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };

  const openLb = (i) => {
    collectItems();
    if (!items.length) return;
    idx = i;
    lastFocus = document.activeElement;
    fillLightbox(idx);
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => lbClose.focus(), 150);
  };
  const closeLb = () => {
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  const next = () => { idx = (idx + 1) % items.length; fillLightbox(idx); };
  const prev = () => { idx = (idx - 1 + items.length) % items.length; fillLightbox(idx); };

  // Trouve l'index dans la liste dédupliquée (clone → matche par data-img-hd)
  const indexOfEl = (it) => {
    const direct = items.findIndex(x => x.el === it);
    if (direct >= 0) return direct;
    const hd = it.getAttribute('data-img-hd');
    return items.findIndex(x => x.srcHd === hd);
  };

  const bindItemClicks = () => {
    if (!grid) return;
    grid.querySelectorAll('.masonry-item').forEach(it => {
      if (it.dataset.bound) return;
      it.dataset.bound = '1';
      const isClone = it.classList.contains('is-clone');
      // Clones non focusables (aria-hidden), mais cliquables
      if (!isClone) {
        it.tabIndex = 0;
        it.setAttribute('role', 'button');
        it.setAttribute('aria-label', 'Ouvrir l\'aperçu');
      }
      const open = () => {
        group = 'masonry';
        collectItems();
        const i = indexOfEl(it);
        if (i >= 0) openLb(i);
      };
      it.addEventListener('click', open);
      if (!isClone) {
        it.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
          }
        });
      }
    });
  };

  /** Groupes statiques : role/tabindex/aria-label viennent du HTML. */
  const bindGroups = () => {
    document.querySelectorAll('[data-lb-group]').forEach(el => {
      if (el.dataset.bound) return;
      el.dataset.bound = '1';
      const name = el.getAttribute('data-lb-group');
      const open = () => {
        group = name;
        collectItems();
        const i = items.findIndex(x => x.el === el);
        if (i >= 0) openLb(i);
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      });
    });
  };

  bindItemClicks();
  bindGroups();
  // Re-bind hook for dynamic injection
  document.addEventListener('lrmj:masonry-updated', bindItemClicks);

  if (loadBtn && grid) {
    loadBtn.addEventListener('click', () => {
      const hidden = [...grid.querySelectorAll('.masonry-item.hidden')].slice(0, 8);
      hidden.forEach((item, i) => {
        item.classList.remove('hidden');
        setTimeout(() => item.classList.add('reveal'), i * 55);
      });
      bindItemClicks();
      if (!grid.querySelector('.masonry-item.hidden')) {
        loadBtn.classList.add('done');
        loadBtn.textContent = 'Toutes les réalisations affichées';
      }
    });
  }

  lbClose.addEventListener('click', closeLb);
  lbNext.addEventListener('click', next);
  lbPrev.addEventListener('click', prev);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (lb.getAttribute('aria-hidden') !== 'false') return;
    if (e.key === 'Escape')          { e.preventDefault(); closeLb(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
  });

  return { bindItemClicks };
}
