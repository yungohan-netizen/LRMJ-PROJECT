/** Process timeline : rail rouge grandit selon nb de steps en vue (data-progress 1→4). */
export function initProcess() {
  const timeline = document.querySelector('.proc-timeline');
  if (!timeline) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    timeline.setAttribute('data-progress', '4');
    return;
  }

  // pathLength=1 → le CSS peut animer stroke-dashoffset de 1 à 0 (draw-on)
  timeline.querySelectorAll('.proc-icon path, .proc-icon rect, .proc-icon circle:not([fill])')
    .forEach(s => s.setAttribute('pathLength', '1'));

  const steps = timeline.querySelectorAll('.proc-step');
  let progress = 0;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        progress++;
        timeline.setAttribute('data-progress', String(progress));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.35, rootMargin: '0px 0px -10% 0px' });
  steps.forEach(s => obs.observe(s));
}
