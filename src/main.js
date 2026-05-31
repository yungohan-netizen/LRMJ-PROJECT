import './styles/main.css';

import { initTheme }      from './js/theme.js';
import { initI18n }       from './js/i18n.js';
import { initNav }        from './js/nav.js';
import { initLenis }      from './js/lenis.js';
import { initSplitText }  from './js/splitText.js';
import { initReveal }     from './js/reveal.js';
import { initHero }       from './js/hero.js';
import { initMasonry }    from './js/masonry.js';
import { initServices, initAboutImage } from './js/services.js';
import { initLightbox }   from './js/lightbox.js';
import { initProcess }    from './js/process.js';
import { initCounters }   from './js/counter.js';
import { initForm }       from './js/form.js';
import { initReviews }    from './js/reviews.js';
import { initCookies }    from './js/cookies.js';
import { initModals }     from './js/modals.js';
import { initRestoImage } from './js/restoration.js';

document.addEventListener('DOMContentLoaded', () => {
  // Sync : DOM-ready interactions
  initTheme();
  initI18n();
  initNav();
  initLenis();
  initSplitText();
  initReveal();
  initHero();
  initProcess();
  initCounters();
  initForm();
  initCookies();
  initModals();

  // Footer year
  const yEl = document.getElementById('footYear');
  if (yEl) yEl.textContent = new Date().getFullYear();

  // Async : Cloudinary-dependent. Lightbox d'abord (sur le HTML statique),
  // puis masonry remplace le markup → on rebind via event.
  const lb = initLightbox();
  initMasonry().then(() => {
    document.dispatchEvent(new CustomEvent('lrmj:masonry-updated'));
  });
  initServices();
  initAboutImage();
  initRestoImage();
  initReviews();
});
