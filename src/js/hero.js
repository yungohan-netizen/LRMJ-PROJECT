/** Hero video : fade-in once playable (P1 fix poster flash).
 *  CSS sets opacity 0 by default. We add .is-ready when video has data + first frame painted. */
export function initHero() {
  const video = document.querySelector('.hero__video');
  if (!video) return;

  const ready = () => {
    if (video.classList.contains('is-ready')) return;
    video.classList.add('is-ready');
  };

  if (video.readyState >= 3) {
    // Already have current frame
    requestAnimationFrame(ready);
  } else {
    video.addEventListener('loadeddata', ready, { once: true });
    video.addEventListener('canplay', ready, { once: true });
    // Safety net : show after 1.5s even if events miss
    setTimeout(ready, 1500);
  }

  // Parallax de sortie : vidéo retenue, contenu qui remonte et fond.
  const hero = document.querySelector('.hero');
  const content = document.querySelector('.hero__content');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hero || reduced) return;

  let ticking = false;
  const update = () => {
    const h = hero.offsetHeight || 1;
    const p = Math.min(Math.max(window.scrollY / h, 0), 1);
    video.style.transform = `translate3d(0, ${(p * 28).toFixed(1)}px, 0) scale(1.05)`;
    if (content) {
      content.style.transform = `translate3d(0, ${(-p * 64).toFixed(1)}px, 0)`;
      content.style.opacity = Math.max(1 - p * 1.7, 0).toFixed(3);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}
