/** Nav scroll state + progress bar + mobile menu. */
export function initNav() {
  const nav = document.getElementById('siteNav');
  if (!nav) return;
  const progress = nav.querySelector('.nav__progress');

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    nav.classList.toggle('nav--solid', y > 40);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min((y / max) * 100, 100) : 0;
      nav.style.setProperty('--scroll-pct', pct.toFixed(1) + '%');
    }
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });

  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('navMobile');
  if (hamburger && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.hidden = true;
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      mobileMenu.hidden = false;
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    hamburger.addEventListener('click', () => {
      hamburger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !mobileMenu.hidden) closeMenu();
    });
  }
}
