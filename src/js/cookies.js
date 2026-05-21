/** Cookie banner — minimal GDPR, persisted in localStorage. */
const KEY = 'lrmj-cookies';

export function initCookies() {
  const banner = document.getElementById('cookieBanner');
  if (!banner) return;
  let stored;
  try { stored = localStorage.getItem(KEY); } catch (_) { stored = null; }
  if (stored) return;

  banner.hidden = false;
  setTimeout(() => banner.classList.add('visible'), 800);

  const close = (choice) => {
    banner.classList.remove('visible');
    setTimeout(() => { banner.hidden = true; }, 420);
    try { localStorage.setItem(KEY, choice); } catch (_) {}
  };
  document.getElementById('cookieAccept')?.addEventListener('click', () => close('accepted'));
  document.getElementById('cookieDecline')?.addEventListener('click', () => close('declined'));
}
