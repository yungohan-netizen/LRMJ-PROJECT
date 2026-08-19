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

  const showOk = (msg) => {
    if (errEl) errEl.classList.remove('visible');
    if (okEl) {
      if (msg) okEl.textContent = msg;
      okEl.classList.add('visible');
    }
  };
  const showErr = (msg) => {
    if (okEl) okEl.classList.remove('visible');
    if (errEl) {
      if (msg) errEl.textContent = msg;
      errEl.classList.add('visible');
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Envoi…';
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
        showOk('✓ Message bien reçu. Nous vous recontactons sous 24h.');
        form.reset();
      } else {
        showErr(data.error
          ? `${data.error} Vous pouvez aussi appeler le 0475 39 99 09.`
          : "L'envoi a échoué. Réessayez ou appelez le 0475 39 99 09.");
      }
    } catch (_) {
      showErr('Problème réseau. Réessayez ou appelez le 0475 39 99 09.');
    } finally {
      submit.disabled = false;
      submit.textContent = originalLabel;
    }
  });
}
