# Upgrade Visuel V2 — Plan d'implémentation LRMJ Project

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Passer le site de "Awwwards-tier polish" à "expérience cinématique signature" : hero éditorial animé, transitions de thème et de pages en View Transitions, titres char-split, parallax scroll-driven, strip métier, draw-on des icônes process.

**Architecture:** Tout est progressive enhancement sur le stack existant (Vite vanilla, CSS modulaire, IntersectionObserver, Lenis). Chaque feature dégrade proprement : `@supports` pour les API récentes, `html.js` pour le no-JS, `prefers-reduced-motion` partout. Aucune librairie ajoutée, AUCUN GSAP.

**Tech Stack:** Vite 5 vanilla JS, CSS custom properties, View Transitions API (same-document + cross-document), CSS scroll-driven animations (`animation-timeline: view()`), WAAPI minimal.

---

## ÉTAT INITIAL REQUIS

- Branche : `claude/determined-williams-ba1ea5`, propre, à jour avec `origin/main` (commit `49a29d3` mergé en prod).
- `npm run build` passe en ~0.5s avant de commencer. Si le build échoue AVANT toute modification, STOP et signale-le.
- Worktree : `C:\Users\robin\OneDrive\Bureau\L\Claude\LRMJ PROJECT\.claude\worktrees\determined-williams-ba1ea5` (chemin avec espaces : toujours le mettre entre guillemets).

## GARDE-FOUS GLOBAUX (s'appliquent à CHAQUE tâche)

1. **NE PAS TOUCHER** : le système marquee de `masonry.css` (animations `marquee-scroll`), `src/js/lenis.js`, `src/js/cloudinary.js`, `src/js/form.js`, `functions/`, la logique de `src/js/masonry.js`.
2. **i18n** : toute nouvelle chaîne visible = attribut `data-i18n` dans le HTML + clé FR **ET** NL dans `src/js/i18n.js`. Jamais de texte visible FR-only.
3. **Pas d'em-dash** (—) dans le texte visible. Commentaires de code : autorisé.
4. **Animations** : uniquement `transform` et `opacity` (+ `clip-path`/`stroke-dashoffset` pour les cas prévus ici). `will-change` seulement là où le plan le spécifie.
5. **Reduced-motion** : chaque feature animée a son fallback statique (les blocs CSS du plan les incluent déjà : ne pas les omettre).
6. **Light + dark** : vérifier les deux thèmes à chaque tâche (toggle = bouton lune/soleil dans la nav).
7. **Polices** : Clash Display + DM Sans uniquement. Pas d'italique (utiliser `<em>` = poids 500 + rouge).
8. Un commit par tâche, message fourni. Ne jamais amender un commit existant.

## CONNAISSANCES DE SESSION (pièges connus de cet environnement)

- **Hook cassé** : chaque Edit/Write affiche `PostToolUse hook blocking error ... check-sql-files.py ... No such file or directory`. C'est un plugin SQL mal installé, **sans rapport avec ce projet**. Les écritures réussissent quand même. IGNORER ce message.
- **PowerShell 5.1** : pas de `&&` (utiliser `;`), pas de messages de commit multilignes via `-m` (les parenthèses cassent le quoting). Pour les messages d'une ligne sans caractères spéciaux, `git commit -m "..."` fonctionne. Sinon : écrire le message dans `.git-commit-msg.txt`, `git commit -F .git-commit-msg.txt`, puis supprimer le fichier.
- **Dev local sans Cloudinary** : le proxy `/api/cloudinary` renvoie 500 (pas de `.env` dans le worktree). Les galeries/images affichent des skeletons : c'est le fallback prévu, PAS un bug à corriger.
- **Preview** : config `lrmj-dev` existe dans `.claude/launch.json` (port 5173). Après un `preview_resize`, le screenshot peut montrer l'ancien cadrage (letterbox crème à droite) : artefact de capture, se fier aux mesures `preview_eval` (`innerWidth`, `offsetWidth`...). Lenis avale les `scrollTo` programmatiques : utiliser `document.documentElement.scrollTop = y` dans un eval, puis relire la position dans un second eval.
- **Push** : `git push` sur la branche est autorisé. Le push vers `main` est bloqué par le classifier de permissions : NE PAS tenter. Fin de plan = push branche + demander à l'utilisateur pour le merge.

## DÉCISIONS DESIGN (déjà arbitrées, à respecter)

- **Texte hero (Tâche 3)** : la vidéo hero reste la star ; le bloc texte est ancré en bas à gauche, compact. Wording retenu : FR "Portails, garde-corps, verrières. / Forgés pour durer." NL "Poorten, leuningen, serres. / Gesmeed om te duren." Si l'utilisateur a exprimé un autre wording dans la conversation, le sien gagne.
- **Tâches 9 (curseur) et 10 (veil)** : OPTIONNELLES. Ne les exécuter que si l'utilisateur dit explicitement oui. Par défaut : sauter et passer à la Tâche 11.

---

### Tâche 0 : Baseline

**Files:** aucun (lecture seule)

- [ ] **Step 0.1 : Vérifier l'état git**

Run: `git status --short` puis `git log --oneline -1`
Expected: arbre propre, HEAD = `49a29d3` (ou plus récent si des tâches de ce plan sont déjà commitées : reprendre à la première tâche non commitée, les messages de commit du plan servent de marqueurs).

- [ ] **Step 0.2 : Build baseline**

Run: `npm run build`
Expected: `✓ built in ~500ms`, 6 fichiers dans `dist/`.

---

### Tâche 1 : Transition de thème circulaire (View Transitions API)

Le clic sur le toggle thème révèle le nouveau thème par un cercle qui s'étend depuis le bouton. Fallback : bascule instantanée actuelle (Firefox, reduced-motion).

**Files:**
- Modify: `src/js/theme.js`
- Modify: `src/styles/base.css`

- [ ] **Step 1.1 : Réécrire le handler du toggle dans `src/js/theme.js`**

ANCRE (texte exact à remplacer) :
```js
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    if (next === 'dark') html.setAttribute('data-theme', 'dark');
    else html.removeAttribute('data-theme');
    try { localStorage.setItem('lrmj-theme', next); } catch (_) {}
    applyThemeAssets(next);
  });
```

REMPLACEMENT :
```js
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    const apply = () => {
      if (next === 'dark') html.setAttribute('data-theme', 'dark');
      else html.removeAttribute('data-theme');
      applyThemeAssets(next);
    };
    try { localStorage.setItem('lrmj-theme', next); } catch (_) {}

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduced) { apply(); return; }

    // Révélation circulaire depuis le centre du bouton
    const r = toggle.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const maxR = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));

    html.classList.add('vt-theme');
    const vt = document.startViewTransition(apply);
    vt.ready.then(() => {
      html.animate(
        { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${maxR}px at ${cx}px ${cy}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
    vt.finished.finally(() => html.classList.remove('vt-theme'));
  });
```

- [ ] **Step 1.2 : Ajouter le CSS de neutralisation dans `src/styles/base.css`**

ANCRE (texte exact, fin du fichier juste avant le bloc `/* ── PRINT STYLESHEET ── */`) :
```css
/* ── PRINT STYLESHEET ── */
```

REMPLACEMENT :
```css
/* ── VIEW TRANSITION : toggle de thème (cercle depuis le bouton) ──
   Scopé via html.vt-theme pour ne pas écraser les transitions de pages (Tâche 2). */
html.vt-theme::view-transition-old(root),
html.vt-theme::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
html.vt-theme::view-transition-new(root) { z-index: 1; }
html.vt-theme::view-transition-old(root) { z-index: 0; }

/* ── PRINT STYLESHEET ── */
```

- [ ] **Step 1.3 : Vérifier**

Run: `npm run build` → Expected: `✓ built`.
Preview (Chromium) : démarrer `lrmj-dev`, cliquer `#themeToggle` via `preview_click`, screenshot : le thème a basculé, aucune erreur console (`preview_console_logs` level error → vide). Cliquer 4 fois de suite rapidement : pas d'erreur non plus.

- [ ] **Step 1.4 : Commit**

```bash
git add src/js/theme.js src/styles/base.css
git commit -m "feat: circular view-transition on theme toggle"
```

---

### Tâche 2 : Transitions inter-pages index ↔ portfolio

Navigation entre `/` et `/portfolio.html` avec fondu + glissement (cross-document View Transitions, Chromium/Safari récents ; ailleurs : navigation normale).

**Files:**
- Modify: `src/styles/base.css`

- [ ] **Step 2.1 : Ajouter le bloc CSS**

ANCRE (le bloc ajouté en Tâche 1) :
```css
html.vt-theme::view-transition-new(root) { z-index: 1; }
html.vt-theme::view-transition-old(root) { z-index: 0; }
```

REMPLACEMENT :
```css
html.vt-theme::view-transition-new(root) { z-index: 1; }
html.vt-theme::view-transition-old(root) { z-index: 0; }

/* ── VIEW TRANSITION : navigation entre pages (index ↔ portfolio) ── */
@view-transition { navigation: auto; }
@media (prefers-reduced-motion: no-preference) {
  ::view-transition-old(root) { animation: vt-page-out .4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  ::view-transition-new(root) { animation: vt-page-in .55s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
}
@keyframes vt-page-out { to { opacity: 0; transform: translateY(-18px); } }
@keyframes vt-page-in { from { opacity: 0; transform: translateY(14px); } }
```

- [ ] **Step 2.2 : Vérifier**

Run: `npm run build` → `✓ built`.
Preview : naviguer `location.href='/portfolio.html'` puis revenir. Aucune erreur console. (L'effet visuel n'est pas capturable en screenshot ; la non-régression suffit.) Vérifier ensuite que le toggle de thème (Tâche 1) marche toujours sur les DEUX pages.

- [ ] **Step 2.3 : Commit**

```bash
git add src/styles/base.css
git commit -m "feat: cross-document view transitions between pages"
```

---

### Tâche 3 : Hero éditorial (headline + CTAs + entrance)

Le hero gagne un bloc texte ancré bas-gauche : eyebrow, titre 2 lignes (h1 visible, remplace le h1 sr-only), 2 CTAs. Entrée chorégraphiée au chargement (fade-up + blur séquencés).

**Files:**
- Modify: `index.html`
- Modify: `src/styles/components/hero.css`
- Modify: `src/js/i18n.js`

- [ ] **Step 3.1 : Remplacer le h1 sr-only par le bloc visible dans `index.html`**

ANCRE :
```html
  <section class="hero" aria-label="LRMJ Project | Ferronnerie artisanale">
    <h1 class="sr-only">LRMJ Project | Artisan Ferronnier Belgique</h1>
```

REMPLACEMENT :
```html
  <section class="hero" aria-label="LRMJ Project | Ferronnerie artisanale">
    <div class="hero__content">
      <span class="hero__eyebrow" data-i18n="hero.eyebrow">Atelier de ferronnerie · Bruxelles &amp; Brabant flamand</span>
      <h1 class="hero__title" data-i18n="hero.title" data-i18n-html>Portails, garde-corps, verrières.<br><em>Forgés pour durer.</em></h1>
      <div class="hero__ctas">
        <a href="#contact" class="btn btn--red"><span data-i18n="nav.cta">Devis Gratuit</span><span class="btn__ico" aria-hidden="true">↗</span></a>
        <a href="#realisations" class="btn btn--ghost hero__btn-alt"><span data-i18n="hero.cta2">Voir les réalisations</span><span class="btn__ico" aria-hidden="true">↗</span></a>
      </div>
    </div>
```

- [ ] **Step 3.2 : Ajouter les clés i18n dans `src/js/i18n.js`**

ANCRE (bloc FR) :
```js
    /* Hero */
    'hero.h1':          'LRMJ Project | Artisan Ferronnier Belgique',
    'hero.scroll':      'Découvrir',
```

REMPLACEMENT :
```js
    /* Hero */
    'hero.eyebrow':     'Atelier de ferronnerie · Bruxelles & Brabant flamand',
    'hero.title':       'Portails, garde-corps, verrières.<br><em>Forgés pour durer.</em>',
    'hero.cta2':        'Voir les réalisations',
    'hero.scroll':      'Découvrir',
```

ANCRE (bloc NL) :
```js
    /* Hero */
    'hero.h1':          'LRMJ Project | Smid & Schrijnwerker België',
    'hero.scroll':      'Ontdekken',
```

REMPLACEMENT :
```js
    /* Hero */
    'hero.eyebrow':     'Smeedatelier · Brussel & Vlaams-Brabant',
    'hero.title':       'Poorten, leuningen, serres.<br><em>Gesmeed om te duren.</em>',
    'hero.cta2':        'Bekijk de realisaties',
    'hero.scroll':      'Ontdekken',
```

- [ ] **Step 3.3 : Styler le bloc dans `src/styles/components/hero.css`**

ANCRE :
```css
/* scroll hint */
```

REMPLACEMENT :
```css
/* ── Contenu éditorial : eyebrow + titre + CTAs, ancré bas-gauche ── */
.hero__content {
  position: absolute;
  left: clamp(1.5rem, 5vw, 4rem);
  right: clamp(1.5rem, 5vw, 4rem);
  bottom: clamp(11vh, 14vh, 17vh);
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.1rem;
  max-width: 1280px;
  margin-inline: auto;
  pointer-events: none;
}
.hero__content > * { pointer-events: auto; }
.hero__eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: .64rem; font-weight: 600;
  letter-spacing: .24em; text-transform: uppercase;
  color: rgba(245, 243, 238, .82);
  text-shadow: 0 1px 12px rgba(0, 0, 0, .35);
}
.hero__eyebrow::before {
  content: ''; display: block;
  width: 22px; height: 1px;
  background: var(--red);
}
.hero__title {
  font-family: var(--f-display);
  font-size: clamp(2.1rem, 4.6vw, 4.2rem);
  font-weight: 300;
  line-height: 1.05;
  letter-spacing: -.02em;
  color: #f3f1ea;
  text-shadow: 0 2px 28px rgba(0, 0, 0, .45);
  margin: 0;
}
.hero__title em { font-style: normal; font-weight: 500; color: #e0573f; }
.hero__ctas { display: flex; gap: .75rem; flex-wrap: wrap; margin-top: .4rem; }
.hero__btn-alt { color: rgba(245, 243, 238, .85); border-color: rgba(245, 243, 238, .32); }
.hero__btn-alt:hover { color: #fff; border-color: rgba(245, 243, 238, .55); }
.hero__btn-alt .btn__ico { background: rgba(255, 255, 255, .14); }

/* Entrée chorégraphiée (JS présent uniquement) */
html.js .hero__eyebrow,
html.js .hero__title,
html.js .hero__ctas {
  opacity: 0;
  transform: translateY(26px);
  filter: blur(6px);
  animation: hero-rise .95s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
html.js .hero__eyebrow { animation-delay: .3s; }
html.js .hero__title   { animation-delay: .45s; }
html.js .hero__ctas    { animation-delay: .65s; }
@keyframes hero-rise {
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}
@media (prefers-reduced-motion: reduce) {
  html.js .hero__eyebrow, html.js .hero__title, html.js .hero__ctas {
    opacity: 1; transform: none; filter: none; animation: none;
  }
}
@media (max-width: 640px) {
  .hero__content { bottom: 13vh; gap: .9rem; }
  .hero__title { font-size: clamp(1.9rem, 8.5vw, 2.4rem); }
  .hero__ctas .btn { padding: 12px 22px; }
}

/* scroll hint */
```

- [ ] **Step 3.4 : Vérifier**

Run: `npm run build` → `✓ built`.
Preview desktop (1280) : le bloc apparaît en bas-gauche au-dessus de la vidéo, entrée séquencée au reload. Le hint "Découvrir" (centré bas) ne chevauche PAS les CTAs : si chevauchement à 1280x800, augmenter `bottom` de `.hero__content` à `18vh` et re-vérifier. Mobile 375 : titre 2 lignes lisible, CTAs côte à côte ou wrap propre. Toggle NL : titre devient "Poorten, leuningen, serres. / Gesmeed om te duren." Light ET dark : texte lisible sur la vidéo dans les deux cas.

- [ ] **Step 3.5 : Commit**

```bash
git add index.html src/styles/components/hero.css src/js/i18n.js
git commit -m "feat: hero editorial headline with staggered entrance"
```

---

### Tâche 4 : Parallax de sortie du hero au scroll

En scrollant, la vidéo glisse doucement vers le bas (reste "derrière") et le bloc texte remonte et s'estompe. Remplace l'ancien zoom Ken Burns 18s (qui entrerait en conflit : une animation CSS sur `transform` écraserait le style inline du parallax).

**Files:**
- Modify: `src/styles/components/hero.css`
- Modify: `src/js/hero.js`

- [ ] **Step 4.1 : Retirer le Ken Burns CSS et poser la base statique**

ANCRE (dans `src/styles/components/hero.css`) :
```css
.hero__video {
  position: absolute; inset: 0; z-index: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  pointer-events: none;
  opacity: 0;
  /* mask-image retiré : conflicte avec animation transform → jitter GPU.
     Fade bas géré par .hero__vignette + .hero__merge */
  animation: hero-zoom 18s var(--ease-out) forwards;
  will-change: transform;
  transition: opacity .6s var(--ease);
}
.hero__video.is-ready { opacity: var(--hero-video-opacity); }

@keyframes hero-zoom {
  from { transform: scale(1.06); }
  to   { transform: scale(1); }
}
```

REMPLACEMENT :
```css
.hero__video {
  position: absolute; inset: 0; z-index: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  pointer-events: none;
  opacity: 0;
  /* scale 1.05 = marge de débattement pour le parallax JS (translateY max 28px).
     Le transform est piloté par hero.js ; pas d'animation CSS ici (conflit). */
  transform: scale(1.05);
  will-change: transform;
  transition: opacity .6s var(--ease);
}
.hero__video.is-ready { opacity: var(--hero-video-opacity); }
```

- [ ] **Step 4.2 : Ajouter le parallax dans `src/js/hero.js`**

ANCRE (fin du fichier) :
```js
  if (video.readyState >= 3) {
    // Already have current frame
    requestAnimationFrame(ready);
  } else {
    video.addEventListener('loadeddata', ready, { once: true });
    video.addEventListener('canplay', ready, { once: true });
    // Safety net : show after 1.5s even if events miss
    setTimeout(ready, 1500);
  }
}
```

REMPLACEMENT :
```js
  if (video.readyState >= 3) {
    // Already have current frame
    requestAnimationFrame(ready);
  } else {
    video.addEventListener('loadeddata', ready, { once: true });
    video.addEventListener('canplay', ready, { once: true });
    // Safety net : show after 1.5s even if events miss
    setTimeout(ready, 1500);
  }

  // Parallax de sortie : vidéo retenue, contenu qui remonte et fond.
  const hero = document.querySelector('.hero');
  const content = document.querySelector('.hero__content');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hero || reduced) return;

  let ticking = false;
  const update = () => {
    const h = hero.offsetHeight || 1;
    const p = Math.min(Math.max(window.scrollY / h, 0), 1);
    video.style.transform = `translate3d(0, ${(p * 28).toFixed(1)}px, 0) scale(1.05)`;
    if (content) {
      content.style.transform = `translate3d(0, ${(-p * 64).toFixed(1)}px, 0)`;
      content.style.opacity = Math.max(1 - p * 1.7, 0).toFixed(3);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}
```

- [ ] **Step 4.3 : Vérifier**

Run: `npm run build` → `✓ built`.
Preview : `document.documentElement.scrollTop = 400` via eval, screenshot : la vidéo n'a PAS de bord vide en haut (la marge scale 1.05 couvre le décalage), le bloc texte est partiellement estompé. Revenir en haut (`scrollTop = 0`) : tout revient. Vérifier `preview_console_logs` level error : vide. ATTENTION : l'animation d'entrée de la Tâche 3 anime aussi `transform` sur `.hero__content` ; elle est `forwards` et se termine en ~1.6s : le parallax (style inline) prend le relais après. Si au chargement déjà scrollé le contenu "saute" : acceptable, ne pas corriger.

- [ ] **Step 4.4 : Commit**

```bash
git add src/styles/components/hero.css src/js/hero.js
git commit -m "feat: hero scroll parallax exit replacing ken burns"
```

---

### Tâche 5 : Titres char-split (lettres qui montent) + replay au changement de langue

Les `.h-large` passent d'un reveal par mot à un reveal par lettre (montée + légère rotation, stagger). Le changement de langue FR/NL re-splitte et REJOUE l'animation (les titres déjà révélés rejouent : c'est voulu).

**Files:**
- Modify: `src/js/splitText.js` (réécriture complète)
- Modify: `src/styles/base.css`
- Modify: `src/js/i18n.js`

- [ ] **Step 5.1 : Réécrire `src/js/splitText.js` (remplacer TOUT le fichier par ceci)**

```js
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

export function initSplitText() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const run = () => document.querySelectorAll('.h-large').forEach(splitInto);
  run();

  // applyLang écrase innerHTML des titres data-i18n-html → on re-splitte.
  // Les titres dans une zone .fi.is-in voient leurs chars matcher la règle
  // "is-in" immédiatement → la transition rejoue depuis translateY(115%).
  document.addEventListener('lrmj:lang-changed', run);
}
```

- [ ] **Step 5.2 : Dispatcher l'événement de langue dans `src/js/i18n.js`**

ANCRE :
```js
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
}
```

REMPLACEMENT :
```js
  try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}

  document.dispatchEvent(new CustomEvent('lrmj:lang-changed', { detail: { lang } }));
}
```

- [ ] **Step 5.3 : Remplacer les styles `.word` dans `src/styles/base.css`**

ANCRE :
```css
/* Split-text reveal */
.word {
  display: inline-block;
  overflow: hidden;
  vertical-align: baseline;
  padding-bottom: .12em;
  margin-bottom: -.12em;
}
.word > span {
  display: inline-block;
  transform: translateY(115%);
  transition: transform .9s var(--ease-out);
  will-change: transform;
}
html.js .fi.is-in .word > span { transform: translateY(0); }
@media (prefers-reduced-motion: reduce) {
  html.js .word > span { transform: none !important; }
}
html:not(.js) .word > span { transform: none; }
```

REMPLACEMENT :
```css
/* Split-text reveal : lettre par lettre, montée + micro-rotation */
.word {
  display: inline-block;
  overflow: hidden;
  vertical-align: baseline;
  padding-bottom: .12em;
  margin-bottom: -.12em;
}
.word .char {
  display: inline-block;
  transform: translateY(115%) rotate(5deg);
  transform-origin: left bottom;
  transition: transform .75s var(--ease-out);
}
html.js .fi.is-in .word .char { transform: translateY(0) rotate(0deg); }
@media (prefers-reduced-motion: reduce) {
  html.js .word .char { transform: none !important; transition: none !important; }
}
html:not(.js) .word .char { transform: none; }
```

- [ ] **Step 5.4 : Vérifier**

Run: `npm run build` → `✓ built`.
Preview : reload, scroller jusqu'à "Le Travail Parle Pour Lui-Même" : les lettres montent en cascade, le "Parle Pour Lui-Même" reste rouge (le `<em>` est préservé). Basculer NL : le titre rejoue son animation en néerlandais. Vérifier la page `/portfolio.html` : "Het volledige archief" splitté aussi. Aucune erreur console. Mobile 375 : pas de débordement, les mots wrappent normalement (le split est par mot pour le wrapping, par lettre pour l'anim).

- [ ] **Step 5.5 : Commit**

```bash
git add src/js/splitText.js src/js/i18n.js src/styles/base.css
git commit -m "feat: char-level split titles with language replay"
```

---

### Tâche 6 : Parallax scroll-driven (accents)

Dérive verticale subtile pilotée par le scroll sur : l'image de la section restauration et les glows radiaux. CSS pur via `animation-timeline: view()`, dans `@supports` (Chromium/Safari récents ; Firefox = comportement actuel, aucun changement).

**Files:**
- Modify: `src/styles/base.css`

- [ ] **Step 6.1 : Ajouter le bloc en fin de `src/styles/base.css`** (après le bloc PRINT, tout en bas du fichier)

Ajouter à la fin du fichier :
```css

/* ── PARALLAX SCROLL-DRIVEN — progressive enhancement, Firefox ignore ──
   Cibles SANS autre transform (pas de .fi, pas de hover transform) :
   - .resto__visual-img (le cadre image restauration ; le hover zoom est sur l'img interne)
   - les pseudo-éléments de glow (aucun transform existant) */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .resto__visual-img {
      animation: plx-block linear both;
      animation-timeline: view();
      animation-range: entry 0% exit 100%;
    }
    .glow-center::before,
    .glow-red-br::after {
      animation: plx-glow linear both;
      animation-timeline: view();
      animation-range: entry 0% exit 100%;
    }
  }
}
@keyframes plx-block {
  from { transform: translateY(clamp(-44px, -3vw, -20px)); }
  to   { transform: translateY(clamp(20px, 3vw, 44px)); }
}
@keyframes plx-glow {
  from { transform: translateY(-5%); }
  to   { transform: translateY(5%); }
}
```

- [ ] **Step 6.2 : Vérifier**

Run: `npm run build` → `✓ built`.
Preview (Chromium supporte `view()`) : eval `CSS.supports('animation-timeline: view()')` → true attendu. Scroller la section restauration : l'image dérive doucement. Vérifier que le hover zoom de l'image restauration marche TOUJOURS (le zoom est sur `img`, le parallax sur le cadre : pas de conflit). Vérifier section témoignages (glow-center) : pas de glitch visuel. IMPORTANT : `.resto__visual` (parent) est `position: sticky` : si le parallax rend le sticky nerveux au scroll, retirer UNIQUEMENT la règle `.resto__visual-img` du bloc et garder les glows, puis re-vérifier.

- [ ] **Step 6.3 : Commit**

```bash
git add src/styles/base.css
git commit -m "feat: scroll-driven parallax accents"
```

---

### Tâche 7 : Strip métier défilant avant le footer

Bandeau typographique lent au-dessus du footer : les 6 métiers en Clash Display ghost (contour), séparés par des points rouges. Réutilise les clés i18n existantes (`pf.cat.*`, `nav.restauration`) : zéro nouvelle clé.

**Files:**
- Create: `src/styles/components/strip.css`
- Modify: `src/styles/main.css`
- Modify: `index.html`

- [ ] **Step 7.1 : Créer `src/styles/components/strip.css`**

```css
/* ── STRIP MÉTIER — défilé typographique lent avant le footer ── */
.strip {
  overflow: hidden;
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: clamp(1.6rem, 3vw, 2.6rem) 0;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
}
.strip__track {
  display: flex;
  width: max-content;
  animation: strip-scroll 70s linear infinite;
  will-change: transform;
}
.strip:hover .strip__track { animation-play-state: paused; }
.strip__seq {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: clamp(1.5rem, 3vw, 2.75rem);
  padding-right: clamp(1.5rem, 3vw, 2.75rem);
}
.strip__seq > span {
  font-family: var(--f-display);
  font-size: clamp(1.9rem, 3.6vw, 3.1rem);
  font-weight: 400;
  letter-spacing: .01em;
  white-space: nowrap;
  color: transparent;
  -webkit-text-stroke: 1px rgba(var(--tx-rgb), .30);
  transition: color .45s var(--ease), -webkit-text-stroke-color .45s var(--ease);
}
.strip__seq > span:hover {
  color: var(--red);
  -webkit-text-stroke-color: var(--red);
}
.strip__seq > i {
  font-style: normal;
  color: var(--red);
  font-size: 1.4rem;
  line-height: 1;
}
@keyframes strip-scroll {
  from { transform: translate3d(0, 0, 0); }
  to   { transform: translate3d(-50%, 0, 0); }
}
@media (prefers-reduced-motion: reduce) {
  .strip__track { animation: none; }
}
```

- [ ] **Step 7.2 : Importer dans `src/styles/main.css`**

ANCRE :
```css
@import './components/footer.css';
```

REMPLACEMENT :
```css
@import './components/strip.css';
@import './components/footer.css';
```

- [ ] **Step 7.3 : Insérer le HTML dans `index.html`**

ANCRE :
```html
<!-- FOOTER -->
<footer class="footer">
```

REMPLACEMENT :
```html
<!-- STRIP MÉTIER -->
<div class="strip" aria-hidden="true">
  <div class="strip__track">
    <span class="strip__seq">
      <span data-i18n="pf.cat.portails">Portails &amp; Clôtures</span><i>·</i>
      <span data-i18n="pf.cat.gardecorps">Garde-Corps &amp; Rampes</span><i>·</i>
      <span data-i18n="pf.cat.verrieres">Verrières &amp; Baies Vitrées</span><i>·</i>
      <span data-i18n="pf.cat.marquises">Marquises &amp; Auvents</span><i>·</i>
      <span data-i18n="pf.cat.escaliers">Escaliers</span><i>·</i>
      <span data-i18n="nav.restauration">Restauration fonte</span><i>·</i>
    </span>
    <span class="strip__seq">
      <span data-i18n="pf.cat.portails">Portails &amp; Clôtures</span><i>·</i>
      <span data-i18n="pf.cat.gardecorps">Garde-Corps &amp; Rampes</span><i>·</i>
      <span data-i18n="pf.cat.verrieres">Verrières &amp; Baies Vitrées</span><i>·</i>
      <span data-i18n="pf.cat.marquises">Marquises &amp; Auvents</span><i>·</i>
      <span data-i18n="pf.cat.escaliers">Escaliers</span><i>·</i>
      <span data-i18n="nav.restauration">Restauration fonte</span><i>·</i>
    </span>
  </div>
</div>

<!-- FOOTER -->
<footer class="footer">
```

- [ ] **Step 7.4 : Retirer le border-top du footer (le strip l'apporte déjà)**

ANCRE (dans `src/styles/components/footer.css`) :
```css
.footer { background: var(--bg); border-top: 1px solid var(--border); color: var(--tx-3); padding: clamp(4rem,6vw,6rem) 0 2rem; }
```

REMPLACEMENT :
```css
.footer { background: var(--bg); color: var(--tx-3); padding: clamp(4rem,6vw,6rem) 0 2rem; }
```

- [ ] **Step 7.5 : Vérifier**

Run: `npm run build` → `✓ built`.
Preview : scroller tout en bas. Le strip défile lentement de droite à gauche, boucle SANS saut visible (les deux `.strip__seq` sont identiques : si saut, vérifier qu'aucun caractère ne diffère entre les deux). Hover sur un mot : il se remplit de rouge et le défilé se met en pause. Basculer NL : les libellés changent (les deux copies). Light et dark : contours lisibles. Mobile : taille réduite, défilé fluide. NOTE : `aria-hidden="true"` est volontaire (contenu décoratif, redondant avec le footer).

- [ ] **Step 7.6 : Commit**

```bash
git add src/styles/components/strip.css src/styles/main.css index.html src/styles/components/footer.css
git commit -m "feat: trade strip marquee above footer"
```

---

### Tâche 8 : Draw-on des icônes process

Les icônes SVG de la timeline (enveloppe, devis, forge, maison) se dessinent trait par trait à l'apparition de chaque étape.

**Files:**
- Modify: `src/js/process.js`
- Modify: `src/styles/components/process.css`

- [ ] **Step 8.1 : Normaliser les longueurs de tracé dans `src/js/process.js`**

ANCRE :
```js
  const steps = timeline.querySelectorAll('.proc-step');
```

REMPLACEMENT :
```js
  // pathLength=1 → le CSS peut animer stroke-dashoffset de 1 à 0 (draw-on)
  timeline.querySelectorAll('.proc-icon path, .proc-icon rect, .proc-icon circle:not([fill])')
    .forEach(s => s.setAttribute('pathLength', '1'));

  const steps = timeline.querySelectorAll('.proc-step');
```

NOTE : ce code s'exécute APRÈS le guard reduced-motion existant (qui `return` avant), donc en reduced-motion les attributs ne sont pas posés : voulu.

- [ ] **Step 8.2 : Ajouter le CSS dans `src/styles/components/process.css`** (à la fin du fichier)

```css

/* ── Draw-on des icônes : les traits se dessinent à l'apparition ──
   Ne s'active que si JS a posé pathLength=1 (sinon dasharray:1 = invisible !)
   → on scope sur .proc-step.fi qui n'est PAS encore .is-in uniquement côté html.js,
   et reduced-motion garde les icônes pleines. */
html.js .proc-icon svg :is(path, rect, circle:not([fill])) {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.15s var(--ease-out) .2s;
}
html.js .proc-step.is-in .proc-icon svg :is(path, rect, circle:not([fill])) {
  stroke-dashoffset: 0;
}
@media (prefers-reduced-motion: reduce) {
  html.js .proc-icon svg :is(path, rect, circle) {
    stroke-dasharray: none !important;
    stroke-dashoffset: 0 !important;
    transition: none !important;
  }
}
```

ATTENTION PIÈGE : sans `pathLength=1`, `stroke-dasharray: 1` rend les traits quasi invisibles (1px de trait par période). En reduced-motion, process.js `return` AVANT de poser les attributs, c'est pourquoi le bloc `@media (prefers-reduced-motion: reduce)` ci-dessus force `dasharray: none`. Ne pas supprimer ce bloc.

- [ ] **Step 8.3 : Vérifier**

Run: `npm run build` → `✓ built`.
Preview : scroller jusqu'à "De votre idée à la pose finale" : chaque icône se dessine (~1.2s) quand sa carte apparaît, les petits points (cercles pleins) restent visibles dès le départ. Vérifier les 4 icônes. Aucune icône invisible en fin d'animation. Dark mode : idem.

- [ ] **Step 8.4 : Commit**

```bash
git add src/js/process.js src/styles/components/process.css
git commit -m "feat: process icons draw-on reveal"
```

---

### Tâche 9 (OPTIONNELLE, demander à l'utilisateur) : Curseur accent

Un point rouge + anneau retardé suivent le curseur (desktop pointer fine uniquement). Le curseur natif RESTE visible (le point est un accent, pas un remplacement). S'agrandit sur les éléments interactifs.

**Files:**
- Create: `src/js/cursor.js`
- Create: `src/styles/components/cursor.css`
- Modify: `src/styles/main.css`
- Modify: `src/main.js`

- [ ] **Step 9.1 : Créer `src/js/cursor.js`**

```js
/** Curseur accent : dot direct + ring avec inertie. Desktop pointer:fine, motion OK. */
export function initCursor() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced || window.innerWidth < 1024) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!visible) {
      visible = true;
      dot.classList.add('is-on');
      ring.classList.add('is-on');
    }
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    visible = false;
    dot.classList.remove('is-on');
    ring.classList.remove('is-on');
  });

  const HOT = 'a, button, input, select, textarea, [data-cursor]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(HOT)) ring.classList.add('is-hot');
  }, { passive: true });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(HOT)) ring.classList.remove('is-hot');
  }, { passive: true });

  const loop = () => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
```

- [ ] **Step 9.2 : Créer `src/styles/components/cursor.css`**

```css
/* ── CURSEUR ACCENT — dot + ring, desktop uniquement (créés par cursor.js) ── */
.cursor-dot, .cursor-ring {
  position: fixed;
  top: 0; left: 0;
  pointer-events: none;
  z-index: 9000;
  opacity: 0;
  transition: opacity .3s var(--ease);
}
.cursor-dot.is-on, .cursor-ring.is-on { opacity: 1; }
.cursor-dot {
  width: 5px; height: 5px;
  margin: -2.5px 0 0 -2.5px;
  border-radius: 50%;
  background: var(--red);
}
.cursor-ring {
  width: 34px; height: 34px;
  margin: -17px 0 0 -17px;
  border-radius: 50%;
  border: 1px solid rgba(var(--red-rgb), .45);
}
.cursor-ring.is-hot {
  width: 52px; height: 52px;
  margin: -26px 0 0 -26px;
  border-color: rgba(var(--red-rgb), .7);
  transition: opacity .3s var(--ease), width .3s var(--ease), height .3s var(--ease), margin .3s var(--ease), border-color .3s var(--ease);
}
```

- [ ] **Step 9.3 : Brancher**

Dans `src/styles/main.css`, ANCRE :
```css
@import './components/modals.css';
```
REMPLACEMENT :
```css
@import './components/modals.css';
@import './components/cursor.css';
```

Dans `src/main.js`, ANCRE :
```js
import { initRestoImage } from './js/restoration.js';
```
REMPLACEMENT :
```js
import { initRestoImage } from './js/restoration.js';
import { initCursor }     from './js/cursor.js';
```

Puis ANCRE :
```js
  initCookies();
  initModals();
```
REMPLACEMENT :
```js
  initCookies();
  initModals();
  initCursor();
```

- [ ] **Step 9.4 : Vérifier**

Run: `npm run build` → `✓ built`.
Preview desktop : bouger la souris (preview_eval : `document.dispatchEvent(new MouseEvent('mousemove', {clientX: 400, clientY: 300, bubbles: true}))` puis vérifier `document.querySelector('.cursor-dot').classList.contains('is-on')` → true). Mobile/preset mobile : les éléments `.cursor-dot` ne doivent PAS exister (pointer fine false). Pas d'erreur console.

- [ ] **Step 9.5 : Commit**

```bash
git add src/js/cursor.js src/styles/components/cursor.css src/styles/main.css src/main.js
git commit -m "feat: cursor accent dot and ring on desktop"
```

---

### Tâche 10 (OPTIONNELLE, demander à l'utilisateur) : Veil d'entrée première visite

Voile aux couleurs du thème avec l'emblème, qui se lève en ~0.9s. UNIQUEMENT à la première visite de la session (sessionStorage), jamais en reduced-motion.

**Files:**
- Modify: `index.html` (2 endroits)
- Create: `src/styles/components/veil.css`
- Modify: `src/styles/main.css`
- Modify: `src/main.js`

- [ ] **Step 10.1 : Marquer le skip dans le script anti-FOUC d'`index.html`**

ANCRE :
```js
        if (theme === 'dark') html.setAttribute('data-theme', 'dark');
      } catch (_) {}
```

REMPLACEMENT :
```js
        if (theme === 'dark') html.setAttribute('data-theme', 'dark');
        var seen = sessionStorage.getItem('lrmj-seen');
        var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (seen || rm) html.classList.add('veil-skip');
        sessionStorage.setItem('lrmj-seen', '1');
      } catch (_) {}
```

- [ ] **Step 10.2 : Insérer le voile au début du body d'`index.html`**

ANCRE :
```html
<body>
<a href="#main" class="skip-link" data-i18n="skip">Aller au contenu</a>
```

REMPLACEMENT :
```html
<body>
<div class="veil" id="siteVeil" aria-hidden="true">
  <img class="veil__emblem"
       src="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_120/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png"
       alt="" width="60" height="60"/>
</div>
<a href="#main" class="skip-link" data-i18n="skip">Aller au contenu</a>
```

- [ ] **Step 10.3 : Créer `src/styles/components/veil.css`**

```css
/* ── VEIL D'ENTRÉE — première visite de session uniquement ── */
.veil {
  position: fixed;
  inset: 0;
  z-index: 9500;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0s linear .6s;
}
.veil__emblem {
  width: 60px; height: 60px;
  opacity: 0;
  animation: veil-pulse 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes veil-pulse {
  0%   { opacity: 0; transform: scale(.85); }
  40%  { opacity: 1; transform: scale(1); }
  100% { opacity: 1; transform: scale(1); }
}
.veil.is-done {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
/* Visites suivantes, reduced-motion, ou no-JS : jamais de voile */
html.veil-skip .veil, html:not(.js) .veil { display: none; }
```

- [ ] **Step 10.4 : Brancher**

Dans `src/styles/main.css`, ANCRE (selon que la Tâche 9 a été faite ou non, l'une des deux lignes existe ; utiliser celle présente) :
```css
@import './components/modals.css';
```
REMPLACEMENT :
```css
@import './components/modals.css';
@import './components/veil.css';
```

Dans `src/main.js`, ANCRE :
```js
  // Footer year
  const yEl = document.getElementById('footYear');
  if (yEl) yEl.textContent = new Date().getFullYear();
```
REMPLACEMENT :
```js
  // Footer year
  const yEl = document.getElementById('footYear');
  if (yEl) yEl.textContent = new Date().getFullYear();

  // Veil d'entrée : se lève après le premier paint (et au plus tard à 1.1s)
  const veil = document.getElementById('siteVeil');
  if (veil) {
    const lift = () => veil.classList.add('is-done');
    requestAnimationFrame(() => setTimeout(lift, 900));
    setTimeout(lift, 1100);
  }
```

- [ ] **Step 10.5 : Vérifier**

Run: `npm run build` → `✓ built`.
Preview : eval `sessionStorage.removeItem('lrmj-seen')` puis reload : voile visible ~1s puis se lève, hero entre derrière (les delays de la Tâche 3 enchaînent bien). Reload SANS clear : aucun voile. ATTENTION : si la Tâche 3 est faite, ses animations hero tournent SOUS le voile pendant ~0.9s : si l'enchaînement paraît raté (titre déjà posé quand le voile se lève), augmenter les `animation-delay` de `.hero__eyebrow/.hero__title/.hero__ctas` de +0.5s chacun et re-vérifier les deux cas (avec et sans voile).

- [ ] **Step 10.6 : Commit**

```bash
git add index.html src/styles/components/veil.css src/styles/main.css src/main.js
git commit -m "feat: first-visit entrance veil"
```

---

### Tâche 11 : QA final + push

**Files:** aucun nouveau (corrections éventuelles uniquement)

- [ ] **Step 11.1 : Build final**

Run: `npm run build`
Expected: `✓ built`, ~6 fichiers. Si erreur : corriger, ne pas pousser un build cassé.

- [ ] **Step 11.2 : Grille de QA en preview** (cocher chaque case)

| Check | Comment vérifier | Attendu |
|---|---|---|
| Console propre | `preview_console_logs` level error sur `/` et `/portfolio.html` | vide (les warns Cloudinary 500 sont OK en dev) |
| FR/NL | cliquer `.lang-toggle__btn[data-lang="nl"]`, eval quelques `data-i18n` | hero, strip, pledges, form traduits |
| Light/Dark | cliquer `#themeToggle` | cercle de révélation, aucune zone illisible |
| Mobile 375 | `preview_resize` preset mobile + reload | hero lisible, CTAs accessibles, strip fluide |
| Tablet 768 | `preview_resize` preset tablet + reload | aucun wrap cassé dans la nav ni le hero |
| Scroll complet | `documentElement.scrollTop` par paliers de 1500px + screenshots | aucun élément cassé, parallax discrets |
| Reduced-motion | lecture de code uniquement : chaque bloc ajouté contient son fallback | les 8-10 tâches ont leur `@media (prefers-reduced-motion: reduce)` ou guard JS |

- [ ] **Step 11.3 : Pousser la branche**

```bash
git push
```
Expected: la branche `claude/determined-williams-ba1ea5` est à jour sur origin.

- [ ] **Step 11.4 : Message final à l'utilisateur**

Annoncer : les tâches faites, celles sautées (9/10 si non confirmées), l'URL de preview Cloudflare de la branche, et demander s'il faut merger vers `main` (NE PAS pousser main soi-même : bloqué par le classifier ; attendre une réponse explicite de l'utilisateur, puis utiliser exactement `git push origin HEAD:main` après son accord explicite formulé pour main).

---

## ANNEXE A : récap des clés i18n touchées

| Clé | FR | NL | Tâche |
|---|---|---|---|
| `hero.eyebrow` (nouvelle) | Atelier de ferronnerie · Bruxelles & Brabant flamand | Smeedatelier · Brussel & Vlaams-Brabant | 3 |
| `hero.title` (nouvelle) | Portails, garde-corps, verrières.\<br\>\<em\>Forgés pour durer.\</em\> | Poorten, leuningen, serres.\<br\>\<em\>Gesmeed om te duren.\</em\> | 3 |
| `hero.cta2` (nouvelle) | Voir les réalisations | Bekijk de realisaties | 3 |
| `hero.h1` (SUPPRIMÉE, était morte) | | | 3 |
| Strip : réutilise `pf.cat.portails/gardecorps/verrieres/marquises/escaliers` + `nav.restauration` | existantes | existantes | 7 |

## ANNEXE B : ce que ce plan ne fait PAS (hors scope, ne pas improviser)

- Pas de refonte du marquee photos (système time-based fragile, déjà premium).
- Pas de LQIP/placeholder Cloudinary (les skeletons existants suffisent).
- Pas de GSAP, pas de librairie, pas de framework.
- Pas de modification des modals légaux, du cookie banner, du formulaire (logique), du 404.
- Pas de changement de palette, de fonts, de radius (système V1 verrouillé au commit `49a29d3`).
