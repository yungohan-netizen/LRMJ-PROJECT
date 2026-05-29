/** Lightbox for masonry gallery — open, swap, prev/next, keyboard, focus trap. */
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

  if (!grid || !lb) return;

  let items = [];
  let idx = 0;
  let lastFocus = null;

  // Exclut les clones du marquee (.is-clone) pour ne pas dupliquer la liste
  const collectItems = () => {
    items = Array.from(grid.querySelectorAll('.masonry-item:not(.is-clone):not(.hidden)')).map(el => {
      const img = el.querySelector('img');
      const lbl = el.querySelector('.masonry-item__label');
      return {
        src:   img ? img.src : '',
        srcHd: el.getAttribute('data-img-hd') || (img ? img.src : ''),
        title: lbl ? lbl.textContent.trim() : (img ? img.alt : ''),
        el,
      };
    });
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
      it.addEventListener('click', () => {
        collectItems();
        const i = indexOfEl(it);
        if (i >= 0) openLb(i);
      });
      if (!isClone) {
        it.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            collectItems();
            const i = indexOfEl(it);
            if (i >= 0) openLb(i);
          }
        });
      }
    });
  };

  bindItemClicks();
  // Re-bind hook for dynamic injection
  document.addEventListener('lrmj:masonry-updated', bindItemClicks);

  if (loadBtn) {
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
