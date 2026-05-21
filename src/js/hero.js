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
}
