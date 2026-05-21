/** Fade-in observer for .fi elements. Adds .is-in when 12% in view. */
export function initReveal() {
  const items = document.querySelectorAll('.fi');
  if (!items.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  items.forEach(el => io.observe(el));
}

/** Re-scan for new .fi elements (after dynamic content injection). */
export function revealNewFi(root = document) {
  root.querySelectorAll('.fi:not(.is-in)').forEach(el => el.classList.add('is-in'));
}
