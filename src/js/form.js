/** Contact form — POST JSON vers /api/contact (Pages Function + Resend).
 *  La clé API reste server-side : rien de sensible ne transite ici. */

export function initForm() {
  const form   = document.getElementById('contactForm');
  if (!form) return;
  const submit = form.querySelector('.form-submit');
  const okEl   = document.getElementById('formSuccess');
  const errEl  = document.getElementById('formError');
  if (!submit) return;

  const originalLabel = submit.textContent;
  // Textes déjà localisés par l'i18n (data-i18n) : on les mémorise pour ne
  // jamais afficher de message en dur dans la mauvaise langue.
  const okText  = okEl ? okEl.textContent.trim() : '';
  const errText = errEl ? errEl.textContent.trim() : '';
  const sending = document.documentElement.lang === 'nl' ? 'Versturen…' : 'Envoi…';

  const showOk = () => {
    if (errEl) errEl.classList.remove('visible');
    if (okEl) { okEl.textContent = okText; okEl.classList.add('visible'); }
  };
  const showErr = () => {
    if (okEl) okEl.classList.remove('visible');
    if (errEl) { errEl.textContent = errText; errEl.classList.add('visible'); }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submit.disabled = true;
    submit.textContent = sending;
    if (okEl) okEl.classList.remove('visible');
    if (errEl) errEl.classList.remove('visible');

    const fd = new FormData(form);
    const payload = {
      prenom:  fd.get('prenom')  || '',
      nom:     fd.get('nom')     || '',
      tel:     fd.get('tel')     || '',
      email:   fd.get('email')   || '',
      service: fd.get('service') || '',
      message: fd.get('message') || '',
      botcheck: !!form.querySelector('[name="botcheck"]')?.checked,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        showOk();
        form.reset();
      } else {
        // Le détail serveur n'est pas traduit : il va en console, pas à l'écran.
        if (data.error) console.warn('[contact]', data.error);
        showErr();
      }
    } catch (err) {
      console.warn('[contact]', err);
      showErr();
    } finally {
      submit.disabled = false;
      submit.textContent = originalLabel;
    }
  });
}
