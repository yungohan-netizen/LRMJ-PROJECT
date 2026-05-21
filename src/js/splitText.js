/** Split H2.h-large into word spans for reveal animation. Preserve <em>, <br>, &nbsp;. */
export function initSplitText() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const splitInto = (el) => {
    if (el.dataset.split === '1') return;
    el.dataset.split = '1';

    const out = document.createDocumentFragment();
    const visit = (node, parent) => {
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const tokens = child.nodeValue.split(/(\s+)/);
          tokens.forEach(tok => {
            if (tok === '') return;
            if (/^\s+$/.test(tok)) {
              parent.appendChild(document.createTextNode(tok));
            } else {
              const wrap = document.createElement('span');
              wrap.className = 'word';
              const inner = document.createElement('span');
              inner.textContent = tok;
              wrap.appendChild(inner);
              parent.appendChild(wrap);
            }
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
    visit(el, out);
    el.innerHTML = '';
    el.appendChild(out);

    el.querySelectorAll('.word > span').forEach((sp, i) => {
      sp.style.transitionDelay = (i * 0.07).toFixed(2) + 's';
    });
  };

  document.querySelectorAll('.h-large').forEach(splitInto);
}
