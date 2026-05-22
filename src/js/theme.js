/** Theme toggle light/dark. Initial state set by inline script in <head> (anti-FOUC). */

/** Swap toutes les images theme-aware (data-src-dark / data-src-light). */
function applyThemeAssets(theme) {
  document.querySelectorAll('[data-src-dark][data-src-light]').forEach(el => {
    const src = theme === 'dark' ? el.dataset.srcDark : el.dataset.srcLight;
    if (src && el.src !== src) el.src = src;
  });
  // Favicon
  const favicon = document.getElementById('faviconEl');
  if (favicon) {
    const base = 'https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_64/';
    const id = theme === 'dark' ? 'LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t' : 'LRMJ_EMBLEM_FLAT_LIGHT_MODE_tlr9tp';
    favicon.href = `${base}${id}.png`;
  }
}

export function initTheme() {
  const html = document.documentElement;
  const toggle = document.getElementById('themeToggle');

  // Applique les assets au chargement (thème déjà résolu par anti-FOUC)
  const initial = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyThemeAssets(initial);

  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
    try { localStorage.setItem('lrmj-theme', next); } catch (_) {}
    applyThemeAssets(next);
  });
}
