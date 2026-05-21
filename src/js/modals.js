/** Legal modals : mentions + privacy. Focus management + ESC. */
export function initModals() {
  const modalById = { mentions: 'modalMentions', privacy: 'modalPrivacy' };
  let lastFocus = null;
  let currentModal = null;

  const open = (modalKey) => {
    const id = modalById[modalKey];
    if (!id) return;
    const modal = document.getElementById(id);
    if (!modal) return;
    lastFocus = document.activeElement;
    currentModal = modal;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => modal.querySelector('.modal-legal__close')?.focus(), 150);
  };
  const close = () => {
    if (!currentModal) return;
    currentModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    currentModal = null;
  };

  document.querySelectorAll('[data-open-legal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      open(btn.dataset.openLegal);
    });
  });
  document.querySelectorAll('[data-close-legal]').forEach(btn => {
    btn.addEventListener('click', close);
  });
  document.querySelectorAll('.modal-legal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentModal) close();
  });
}
