/** Contact form — Web3Forms submission with honeypot + UX states. */
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY || '';

export function initForm() {
  const form   = document.getElementById('contactForm');
  if (!form) return;
  const keyInp = document.getElementById('formAccessKey');
  const submit = form.querySelector('.form-submit');
  const okEl   = document.getElementById('formSuccess');
  const errEl  = document.getElementById('formError');
  if (!submit) return;

  if (keyInp) keyInp.value = WEB3FORMS_KEY;
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
    const honeypot = form.querySelector('[name="botcheck"]');
    if (honeypot && honeypot.checked) return;

    submit.disabled = true;
    submit.textContent = 'Envoi…';
    if (okEl) okEl.classList.remove('visible');
    if (errEl) errEl.classList.remove('visible');

    if (!WEB3FORMS_KEY) {
      setTimeout(() => {
        showOk('✓ Mode démo — clé Web3Forms manquante (à renseigner dans .env).');
        form.reset();
        submit.disabled = false;
        submit.textContent = originalLabel;
      }, 700);
      return;
    }

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json();
      if (data.success) {
        showOk('✓ Message bien reçu — nous vous recontactons sous 24h.');
        form.reset();
      } else {
        showErr("L'envoi a échoué. Réessayez ou appelez le 0475 39 99 09.");
      }
    } catch (_) {
      showErr('Problème réseau. Réessayez ou appelez le 0475 39 99 09.');
    } finally {
      submit.disabled = false;
      submit.textContent = originalLabel;
    }
  });
}
