/** Split .h-large en .word > .char pour reveal par lettre.
 *  Préserve <em>, <br>, espaces. Re-splitte au changement de langue (l'anim rejoue). */

function splitInto(el) {
  if (el.querySelector('.char')) return; // déjà splitté (et pas encore écrasé par i18n)
  el.dataset.split = '1';

  const frag = document.createDocumentFragment();
  const visit = (node, parent) => {
    node.childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        child.nodeValue.split(/(\s+)/).forEach(tok => {
          if (tok === '') return;
          if (/^\s+$/.test(tok)) { parent.appendChild(document.createTextNode(tok)); return; }
          const word = document.createElement('span');
          word.className = 'word';
          Array.from(tok).forEach(ch => {
            const c = document.createElement('span');
            c.className = 'char';
            c.textContent = ch;
            word.appendChild(c);
          });
          parent.appendChild(word);
        });
      } else if (child.nodeName === 'BR') {
        parent.appendChild(child.cloneNode());
      } else {
        const clone = child.cloneNode(false);
        visit(child, clone);
        parent.appendChild(clone);
      }
    });
  };
  visit(el, frag);
  el.innerHTML = '';
  el.appendChild(frag);

  el.querySelectorAll('.char').forEach((c, i) => {
    c.style.transitionDelay = Math.min(i * 0.022, 0.85).toFixed(3) + 's';
  });
}

/** Rejoue l'anim char d'un titre déjà révélé : repose l'état initial inline,
 *  force un reflow, puis retire l'override → la règle .is-in reprend en transition. */
function replay(el) {
  const chars = el.querySelectorAll('.char');
  chars.forEach(c => { c.style.transform = 'translateY(115%) rotate(5deg)'; });
  void el.offsetWidth; // reflow : fige l'état initial avant de transiter
  requestAnimationFrame(() => {
    chars.forEach(c => { c.style.transform = ''; });
  });
}

export function initSplitText() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  // Init : split simple. Les titres hors-vue restent cachés (base) jusqu'au scroll-in.
  const init = () => document.querySelectorAll('.h-large').forEach(splitInto);
  init();

  // applyLang écrase innerHTML des titres data-i18n-html → on re-splitte.
  // Un titre déjà révélé (.fi.is-in) renaîtrait à l'état final sans transition :
  // on force donc le replay. Un titre pas encore vu garde la base (scroll-in plus tard).
  document.addEventListener('lrmj:lang-changed', () => {
    document.querySelectorAll('.h-large').forEach(el => {
      splitInto(el);
      if (el.closest('.fi.is-in')) replay(el);
    });
  });
}
