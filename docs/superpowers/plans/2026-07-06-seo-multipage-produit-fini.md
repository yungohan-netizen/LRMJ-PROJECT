# SEO & Multi-pages — Plan "Produit Fini" LRMJ Project

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (ou exécution inline tâche par tâche si le plugin superpowers est indisponible — une tentative `Skill` qui échoue avec "Unknown skill" n'est PAS bloquante, continue en suivant ce document). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Transformer le site vitrine en produit fini indexable : fondations SEO propres (hreflang, sitemap, robots, URLs propres), pages légales réelles, 5 landing pages SEO FR à vrai contenu, leurs 5 équivalentes NL + légal NL, analytics sans cookie, et checklist Search Console.

**Architecture:** Compromis bilingue verrouillé : la vitrine `/` et le `/portfolio` GARDENT le toggle JS FR/NL (1 URL chacun, pas de hreflang). Les pages SEO et légales sont de VRAIES pages statiques par langue (`/x` FR, `/nl/x` NL) avec paires hreflang. Aucun framework, aucune dépendance ajoutée : pages HTML Vite multi-input + un entry JS léger partagé (`src/page.js`) + un composant CSS prose (`article.css`) dans le design system existant.

**Tech Stack:** Vite 5 vanilla multi-page, Cloudflare Pages (URLs propres natives + 308 `.html`→extensionless), Cloudinary via proxy existant, Cloudflare Web Analytics (sans cookie).

---

## ÉTAT INITIAL REQUIS

- Branche `claude/determined-williams-ba1ea5`, propre. `origin/main` = `31ac1f8` (fix scrim hero) déjà déployé.
- `npm run build` passe (~0.5s, 6 fichiers dist) AVANT toute modif, sinon STOP.
- Fichiers existants : `index.html`, `portfolio.html`, `public/404.html`, `functions/api/cloudinary/[folder].js`, `src/` (styles + js), `vite.config.js`.

## GARDE-FOUS GLOBAUX

1. **ANTI-DOORWAY (le plus important)** : chaque page SEO est du VRAI contenu : unique, utile, local. Interdiction de dupliquer des paragraphes entre pages (au-delà du nav/footer). Le contenu est fourni ci-dessous : le coller tel quel, ne pas le "compléter" avec du remplissage généré.
2. **ZÉRO FAIT INVENTÉ** : n'utiliser QUE les faits établis : atelier à Opwijk (Broekstraat 26, 1745), fondé 2011, Romeo Lesac, zéro sous-traitance, devis gratuit sous 48h, tél 0475 39 99 09, contact@lrmjproject.be, TVA BE 0839.975.656, prime façade Ville de Bruxelles 40-60% jusqu'à 14 000 €, 9 avis Facebook 100% recommandé, finitions époxy/galvanisation/thermolaquage. INTERDIT : prix chiffrés, délais de fabrication chiffrés, certifications, normes citées avec numéro/valeur, surfaces, effectifs. En cas de doute : formulation qualitative ("confirmé au devis").
3. **Pas d'em-dash (—)** dans le texte visible. Apostrophes françaises normales.
4. Design system intact : tokens existants, Clash Display + DM Sans, patterns .fi / eyebrow / btn / double-bezel. Pas de nouveau système.
5. Light + dark + mobile vérifiés pour chaque nouveau template.
6. Un commit par tâche (messages fournis), push en fin de phase. JAMAIS `git push origin HEAD:main` sans accord explicite de l'utilisateur (bloqué par le classifier sinon).
7. Pièges d'environnement (hérités des sessions précédentes) : hook `check-sql-files.py` cassé → IGNORER ses erreurs, les writes réussissent. PowerShell 5.1 : pas de `&&`, messages de commit d'une ligne sans parenthèses. Cloudinary en dev local = 500 + fallback skeleton (NORMAL). Lenis avale les scrollTo (utiliser `document.documentElement.scrollTop`).

## DÉCISIONS VERROUILLÉES (ne pas rediscuter)

- Vitrine `/` + `/portfolio` : toggle JS conservé, hreflang SUPPRIMÉ (il est cassé aujourd'hui : fr-BE et nl-BE pointent la même URL).
- Pages SEO/légales : monolingues par URL, paires hreflang FR↔NL + x-default=FR (Phase 4).
- Découverte des pages SEO : PAS dans la nav principale ; footer (colonne Services repointée) + sitemap + maillage interne entre elles. C'est le modèle "vitrine + landing pages".
- Analytics : Cloudflare Web Analytics via le toggle du dashboard Pages (zéro code). Pas de GA.
- Pas de schema Service/AggregateRating/FAQPage (choix utilisateur + restrictions Google). Le JSON-LD LocalBusiness existant sur `/` reste tel quel.
- Slugs sans accents, extensionless (Cloudflare Pages sert `x.html` sur `/x` et 308 `/x.html` → `/x`).

## CARTE DES URLS CIBLES (fin de plan)

| Page | FR | NL (Phase 4) |
|---|---|---|
| Vitrine | `/` (toggle) | même URL |
| Portfolio | `/portfolio` (toggle) | même URL |
| Mentions légales | `/mentions-legales` | `/nl/juridische-vermeldingen` |
| Confidentialité | `/confidentialite` | `/nl/privacybeleid` |
| Pilier local | `/ferronnier-bruxelles` | `/nl/smid-vlaams-brabant` |
| Portails | `/portail-fer-forge` | `/nl/smeedijzeren-poort` |
| Garde-corps | `/garde-corps-fer-forge` | `/nl/smeedijzeren-balustrade` |
| Verrières | `/verriere-sur-mesure` | `/nl/serre-veranda-op-maat` |
| Restauration fonte | `/restauration-balustrade-fonte` | `/nl/restauratie-gietijzeren-balustrade` |

---

### Tâche 0 : Baseline

- [ ] **0.1** `git status --short` (propre) + `git log --oneline -1` (= `31ac1f8` ou plus récent : si des commits de CE plan existent déjà, reprendre à la première tâche non commitée).
- [ ] **0.2** `npm run build` → `✓ built`.

---

## PHASE 1 : FONDATIONS SEO (aucune nouvelle page marketing)

### Tâche 1 : Corriger le hreflang cassé + métas portfolio

**Files:** Modify `index.html`, Modify `portfolio.html`

- [ ] **1.1** Dans `index.html`, ANCRE :
```html
  <link rel="canonical" href="https://lrmjproject.be/" />
  <link rel="alternate" hreflang="fr-BE" href="https://lrmjproject.be/" />
  <link rel="alternate" hreflang="nl-BE" href="https://lrmjproject.be/" />
  <link rel="alternate" hreflang="x-default" href="https://lrmjproject.be/" />
```
REMPLACEMENT :
```html
  <link rel="canonical" href="https://lrmjproject.be/" />
```

- [ ] **1.2** Dans `portfolio.html`, ANCRE :
```html
  <link rel="canonical" href="https://lrmjproject.be/portfolio.html" />
  <link rel="alternate" hreflang="fr-BE" href="https://lrmjproject.be/portfolio.html" />
  <link rel="alternate" hreflang="nl-BE" href="https://lrmjproject.be/portfolio.html" />
```
REMPLACEMENT :
```html
  <link rel="canonical" href="https://lrmjproject.be/portfolio" />
```

- [ ] **1.3** Dans `portfolio.html`, ANCRE :
```html
  <title>Archive | LRMJ Project</title>
  <meta name="description" content="Toutes les réalisations LRMJ Project organisées par catégorie : portails, garde-corps, verrières, marquises, escaliers, meubles." />
```
REMPLACEMENT :
```html
  <title>Réalisations en fer forgé | Portails, garde-corps, verrières | LRMJ Project</title>
  <meta name="description" content="Découvrez nos réalisations en fer forgé : portails, garde-corps, verrières, marquises, escaliers et meubles. Conçues et posées par notre atelier, Bruxelles et Brabant flamand." />
  <meta property="og:title" content="Réalisations en fer forgé | LRMJ Project" />
  <meta property="og:description" content="Portails, garde-corps, verrières, marquises, escaliers, meubles. Chaque pièce conçue et fabriquée dans notre atelier." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/portfolio" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```

- [ ] **1.4** Build → ✓. Commit :
```bash
git add index.html portfolio.html
git commit -m "fix: remove broken hreflang and improve portfolio metas"
```

### Tâche 2 : URLs propres (middleware dev + liens internes extensionless)

Cloudflare Pages sert nativement `/portfolio` et redirige `/portfolio.html` en 308. En dev/preview Vite, il faut un middleware pour la parité.

**Files:** Modify `vite.config.js`, Modify `index.html`

- [ ] **2.1** Dans `vite.config.js`, ANCRE :
```js
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
```
REMPLACEMENT :
```js
/** URLs propres en dev/preview : /portfolio → portfolio.html, /nl/x → nl/x.html.
 *  Parité avec Cloudflare Pages qui le fait nativement en prod. */
function cleanUrls() {
  const fs = require('node:fs');
  const path = require('node:path');
  const rewrite = (root) => (req, _res, next) => {
    const url = (req.url || '').split('?')[0];
    if (url !== '/' && !path.extname(url) && fs.existsSync(path.join(root, url + '.html'))) {
      req.url = url + '.html' + ((req.url || '').includes('?') ? '?' + req.url.split('?')[1] : '');
    }
    next();
  };
  return {
    name: 'lrmj-clean-urls',
    configureServer(server) { server.middlewares.use(rewrite(server.config.root)); },
    configurePreviewServer(server) { server.middlewares.use(rewrite(server.config.root)); },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
```
NOTE : `vite.config.js` est en ESM (import en tête). Si `require` échoue au lancement (erreur "require is not defined"), remplacer la ligne `const fs = require('node:fs');` et la suivante par des imports en tête de fichier : `import fs from 'node:fs'; import path from 'node:path';` juste sous la ligne `import { defineConfig, loadEnv } from 'vite';` et supprimer les deux lignes `require`.

- [ ] **2.2** Toujours dans `vite.config.js`, ANCRE :
```js
    plugins: [cloudinaryProxy(env)],
```
REMPLACEMENT :
```js
    plugins: [cloudinaryProxy(env), cleanUrls()],
```

- [ ] **2.3** Dans `index.html`, ANCRE :
```html
      <a href="/portfolio.html" class="btn btn--ghost"><span data-i18n="real.cta">Voir toutes les réalisations</span><span class="btn__ico" aria-hidden="true">↗</span></a>
```
REMPLACEMENT :
```html
      <a href="/portfolio" class="btn btn--ghost"><span data-i18n="real.cta">Voir toutes les réalisations</span><span class="btn__ico" aria-hidden="true">↗</span></a>
```

- [ ] **2.4** Vérifier : `npm run build` → ✓. Lancer la preview `lrmj-dev`, naviguer `location.href='/portfolio'` → la page portfolio charge (titre "Réalisations en fer forgé..."). Retour `/`.
- [ ] **2.5** Commit :
```bash
git add vite.config.js index.html
git commit -m "feat: clean urls middleware and extensionless internal links"
```

### Tâche 3 : robots.txt + sitemap v1

**Files:** Create `public/robots.txt`, Create `public/sitemap.xml`

- [ ] **3.1** Créer `public/robots.txt` :
```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://lrmjproject.be/sitemap.xml
```

- [ ] **3.2** Créer `public/sitemap.xml` (v1, sera réécrit en fin de phases 1F, 3 et 4) :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://lrmjproject.be/</loc></url>
  <url><loc>https://lrmjproject.be/portfolio</loc></url>
</urlset>
```

- [ ] **3.3** Build → ✓ (les fichiers de `public/` sont copiés dans `dist/`). Vérifier `dist/robots.txt` et `dist/sitemap.xml` existent. Commit :
```bash
git add public/robots.txt public/sitemap.xml
git commit -m "feat: robots.txt and sitemap v1"
```

### Tâche 4 : Shell de page article (CSS + JS partagés) 

On le construit AVANT les pages légales pour qu'elles l'utilisent.

**Files:** Create `src/styles/components/article.css`, Modify `src/styles/main.css`, Create `src/page.js`

- [ ] **4.1** Créer `src/styles/components/article.css` :
```css
/* ── PAGES ARTICLE (légal + landing SEO) — prose dans le design system ── */

/* Nav slim : logo + retour + thème + CTA (pas de liens centraux, pas de burger) */
.nav--slim .nav__inner { padding-left: 1rem; }
.nav--slim .nav__back {
  flex: 1;
  display: inline-flex; align-items: center; gap: 8px;
  font-size: .66rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
  color: var(--tx-3); text-decoration: none;
  transition: color .3s var(--ease), transform .3s var(--ease);
}
.nav--slim .nav__back:hover { color: var(--red); transform: translateX(-3px); }
@media (max-width: 860px) {
  .nav--slim .nav__cta-pill { display: inline-flex; }
  .nav--slim .nav__back span { display: none; } /* garde la flèche seule */
}

/* Header de page */
.page-hero {
  padding: clamp(8rem, 14vh, 11rem) 0 clamp(2.5rem, 5vw, 4rem);
  background: var(--bg);
}
.page-hero .lead { margin-top: 1rem; }

/* Corps prose */
.article {
  padding-bottom: clamp(4rem, 8vw, 7rem);
}
.article__body { max-width: 68ch; }
.article__body h2 {
  font-family: var(--f-display);
  font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  font-weight: 400;
  letter-spacing: -.01em;
  color: var(--tx);
  margin: 2.75rem 0 1rem;
  text-wrap: balance;
}
.article__body h2 em { font-style: normal; font-weight: 500; color: var(--red); }
.article__body p {
  font-size: .95rem; line-height: 1.85; color: var(--tx-2);
  margin: 0 0 1.1rem;
  text-wrap: pretty;
}
.article__body strong { color: var(--tx); font-weight: 500; }
.article__body a { color: var(--red); text-decoration: none; border-bottom: 1px solid rgba(var(--red-rgb), .35); transition: border-color .25s var(--ease); }
.article__body a:hover { border-color: var(--red); }
.article__body ul { list-style: none; margin: 0 0 1.25rem; padding: 0; }
.article__body ul li {
  position: relative; padding-left: 1.4rem;
  font-size: .95rem; line-height: 1.8; color: var(--tx-2);
  margin-bottom: .45rem;
}
.article__body ul li::before {
  content: ''; position: absolute; left: 0; top: .78em;
  width: 10px; height: 1px; background: var(--red);
}

/* Galerie photos (remplie par page.js via Cloudinary, fallback = retirée) */
.article__gallery {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: clamp(.5rem, 1vw, .85rem);
  margin: 2rem 0 .5rem;
}
.article__gallery figure { margin: 0; border-radius: var(--r-img); overflow: hidden; background: var(--bg-1); box-shadow: inset 0 1px 0 rgba(255,255,255,.05); }
.article__gallery img { width: 100%; height: 200px; object-fit: cover; display: block; filter: brightness(.94) saturate(.92); }
@media (max-width: 640px) {
  .article__gallery { grid-template-columns: 1fr 1fr; }
  .article__gallery figure:nth-child(3) { display: none; }
}

/* FAQ en details natifs, stylés design system */
.article__faq { margin-top: 1rem; }
.article__faq details {
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  background: var(--surf);
  margin-bottom: .6rem;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
  transition: border-color .35s var(--ease), background-color .35s var(--ease);
}
.article__faq details[open] { border-color: var(--border-2); background: var(--surf-2); }
.article__faq summary {
  cursor: pointer; list-style: none;
  padding: 1.05rem 1.25rem;
  font-family: var(--f-display); font-weight: 400; font-size: 1.02rem; color: var(--tx);
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
}
.article__faq summary::-webkit-details-marker { display: none; }
.article__faq summary::after {
  content: '+'; color: var(--red); font-size: 1.2rem; line-height: 1;
  transition: transform .35s var(--ease);
}
.article__faq details[open] summary::after { transform: rotate(45deg); }
.article__faq details p { padding: 0 1.25rem 1.1rem; margin: 0; font-size: .9rem; }

/* Bande CTA de fin */
.article__cta {
  margin-top: 3rem;
  padding: clamp(1.75rem, 3.5vw, 2.5rem);
  border: 1px solid var(--border-2);
  border-radius: var(--r-lg);
  background: var(--bg-1);
  box-shadow: 0 24px 60px rgba(var(--shadow-rgb), .10), inset 0 1px 0 rgba(255,255,255,.08);
  display: flex; align-items: center; justify-content: space-between;
  gap: 1.5rem; flex-wrap: wrap;
}
.article__cta-txt { max-width: 46ch; }
.article__cta-title { font-family: var(--f-display); font-size: 1.3rem; font-weight: 400; color: var(--tx); margin: 0 0 .35rem; }
.article__cta-sub { font-size: .88rem; color: var(--tx-2); margin: 0; }

/* Maillage bas de page ("Voir aussi") */
.article__related { margin-top: 2.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
.article__related p { font-size: .64rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--tx-3); margin: 0 0 .8rem; }
.article__related ul { display: flex; flex-wrap: wrap; gap: .5rem; margin: 0; }
.article__related li { padding: 0; margin: 0; }
.article__related li::before { display: none; }
.article__related a {
  display: inline-flex; padding: 8px 16px;
  border: 1px solid var(--border); border-radius: 999px;
  font-size: .72rem; font-weight: 500; color: var(--tx-2);
  text-decoration: none; border-bottom-width: 1px;
  transition: color .3s var(--ease), border-color .3s var(--ease), background-color .3s var(--ease);
}
.article__related a:hover { color: var(--red); border-color: var(--red-border); background: rgba(var(--red-rgb), .05); }
```

- [ ] **4.2** Dans `src/styles/main.css`, ANCRE :
```css
@import './components/lightbox.css';
```
REMPLACEMENT :
```css
@import './components/lightbox.css';
@import './components/article.css';
```

- [ ] **4.3** Créer `src/page.js`. AVANT d'écrire ce fichier, LIRE `src/js/cloudinary.js` pour confirmer que `fetchCategory(cat)` et `parseResource(r, opts)` sont bien exportés et que parseResource renvoie des objets avec `.src` et `.title` (c'est l'usage qu'en fait `src/portfolio.js`). Si les noms diffèrent, adapter les imports en conséquence.
```js
import './styles/main.css';

import { initTheme }  from './js/theme.js';
import { initLenis }  from './js/lenis.js';
import { initReveal } from './js/reveal.js';
import { fetchCategory, parseResource } from './js/cloudinary.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}

/** Galerie 3 photos Cloudinary sur les landing pages ([data-seo-gallery="cat"]).
 *  Échec réseau ou catégorie vide → le bloc disparaît proprement. */
async function initSeoGallery() {
  const slot = document.querySelector('[data-seo-gallery]');
  if (!slot) return;
  try {
    const resources = await fetchCategory(slot.dataset.seoGallery);
    const imgs = resources
      .filter(r => r.resource_type !== 'video' && !['mp4','mov','webm','avi','mkv'].includes((r.format || '').toLowerCase()))
      .slice(0, 3)
      .map(r => parseResource(r, { extra: 'c_limit', w: 900, wHd: 900 }));
    if (!imgs.length) { slot.remove(); return; }
    slot.innerHTML = imgs.map(p =>
      `<figure><img src="${esc(p.src)}" alt="${esc(p.title)}" loading="lazy" decoding="async"/></figure>`
    ).join('');
  } catch (_) {
    slot.remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLenis();
  initReveal();
  initSeoGallery();

  const yEl = document.getElementById('footYear');
  if (yEl) yEl.textContent = new Date().getFullYear();
});
```

- [ ] **4.4** Build → ✓ (page.js n'est référencé par aucune page encore : le build ne doit PAS le bundler ni échouer). Commit :
```bash
git add src/styles/components/article.css src/styles/main.css src/page.js
git commit -m "feat: shared article page shell css and js entry"
```

### Tâche 5 : Pages légales réelles + suppression des modals

Le contenu ci-dessous EST le contenu actuel des modals (index.html), restructuré. Ne pas le réécrire.

**Files:** Create `mentions-legales.html`, Create `confidentialite.html`, Modify `vite.config.js`, Modify `index.html`, Modify `src/main.js`, Delete refs modals (`src/js/modals.js`, bloc CSS), Modify `public/sitemap.xml`

- [ ] **5.1** Créer `mentions-legales.html` (fichier complet) :
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>
    (function() {
      var html = document.documentElement;
      html.classList.add('js');
      try {
        var stored = localStorage.getItem('lrmj-theme');
        var theme = (stored === 'dark' || stored === 'light')
          ? stored
          : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (theme === 'dark') html.setAttribute('data-theme', 'dark');
      } catch (_) {}
    })();
  </script>
  <title>Mentions légales | LRMJ Project</title>
  <meta name="description" content="Mentions légales du site lrmjproject.be : éditeur, hébergement, propriété intellectuelle. L.R.M.J Project SRL, Opwijk, Belgique." />
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="https://lrmjproject.be/mentions-legales" />
  <link id="faviconEl" rel="icon" type="image/png"
        href="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_64/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin>
  <link href="https://api.fontshare.com/v2/css?f[]=clash-display@300,400,500,600,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <script type="module" src="/src/page.js"></script>
</head>
<body>

<header class="nav nav--slim" id="siteNav">
  <div class="nav__inner">
    <a href="/" class="nav__logo" aria-label="LRMJ Project | Accueil">
      <img class="nav__logo-img"
           src="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_96/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png"
           data-src-dark="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_96/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png"
           data-src-light="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_96/LRMJ_EMBLEM_FLAT_LIGHT_MODE_tlr9tp.png"
           alt="LRMJ Project" width="48" height="48"/>
    </a>
    <a href="/" class="nav__back">←<span>&nbsp;Retour à l'accueil</span></a>
    <div class="nav__actions">
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Basculer entre mode clair et sombre">
        <svg class="theme-toggle__sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
        <svg class="theme-toggle__moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      </button>
      <a href="/#contact" class="nav__cta-pill">Devis Gratuit</a>
    </div>
  </div>
</header>

<main id="main">
  <section class="page-hero">
    <div class="wrap wrap--sm fi">
      <span class="eyebrow">Légal</span>
      <h1 class="h-large">Mentions <em>légales</em></h1>
    </div>
  </section>

  <section class="article">
    <div class="wrap wrap--sm">
      <div class="article__body fi">
        <h2>Éditeur du site</h2>
        <p>
          <strong>L.R.M.J Project SRL</strong><br>
          Broekstraat 26, 1745 Opwijk, Belgique<br>
          Téléphone : <a href="tel:0475399909">+32 475 39 99 09</a><br>
          Email : <a href="mailto:contact@lrmjproject.be">contact@lrmjproject.be</a>
        </p>
        <p>
          Numéro d'entreprise (BCE) : <strong>BE 0839.975.656</strong><br>
          Numéro de TVA : <strong>BE 0839.975.656</strong><br>
          Forme juridique : Société à responsabilité limitée (SRL)
        </p>

        <h2>Directeur de la publication</h2>
        <p>Romeo Lesac, Administrateur de L.R.M.J Project SRL.</p>

        <h2>Hébergement</h2>
        <p>Le site est hébergé par <strong>Cloudflare Pages</strong> (Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA). Les médias (photos, vidéos) sont distribués via <strong>Cloudinary</strong> (Cloudinary Ltd., Petah Tikva, Israël).</p>

        <h2>Propriété intellectuelle</h2>
        <p>L'ensemble du site (textes, photographies, logo, charte graphique) est la propriété exclusive de LRMJ Project, sauf mention contraire. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite.</p>

        <h2>Limitation de responsabilité</h2>
        <p>Les informations affichées sur ce site sont fournies à titre indicatif. LRMJ Project ne saurait être tenu responsable d'éventuelles erreurs ou omissions. Les visuels et descriptions de réalisations sont propres à chaque projet et ne constituent pas un engagement contractuel.</p>

        <h2>Litiges</h2>
        <p>Le présent site est régi par le droit belge. En cas de litige, les tribunaux belges sont seuls compétents.</p>

        <div class="article__related">
          <p>Voir aussi</p>
          <ul>
            <li><a href="/confidentialite">Politique de confidentialité</a></li>
            <li><a href="/">Retour à l'accueil</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="footer pf-footer">
  <div class="wrap">
    <div class="pf-footer__inner">
      <a href="/" class="pf-footer__brand">
        <img src="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_72/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png"
             data-src-dark="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_72/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png"
             data-src-light="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_72/LRMJ_EMBLEM_FLAT_LIGHT_MODE_tlr9tp.png"
             alt="" aria-hidden="true" width="36" height="36" loading="lazy"/>
        <span>← Retour à l'accueil</span>
      </a>
      <a href="/#contact" class="btn btn--red">
        <span>Devis Gratuit</span>
        <span class="btn__ico" aria-hidden="true">↗</span>
      </a>
    </div>
    <p class="pf-footer__copy">© <span id="footYear">2026</span> LRMJ Project · BE 0839.975.656</p>
  </div>
</footer>

</body>
</html>
```

- [ ] **5.2** Créer `confidentialite.html` : structure IDENTIQUE à `mentions-legales.html` (même head/nav/footer), avec ces différences EXACTES :
  - `<title>Politique de confidentialité | LRMJ Project</title>`
  - `<meta name="description" content="Politique de confidentialité de lrmjproject.be : données collectées via le formulaire de contact, cookies fonctionnels uniquement, vos droits RGPD." />`
  - `<link rel="canonical" href="https://lrmjproject.be/confidentialite" />`
  - `<meta name="robots" content="noindex, follow" />` (identique)
  - `<h1 class="h-large">Politique de <em>confidentialité</em></h1>` (eyebrow "Légal" identique)
  - Le `.article__body` contient (contenu exact du modal actuel) :
```html
        <h2>Données personnelles collectées</h2>
        <p>Seuls les champs que vous remplissez volontairement dans le formulaire de contact (nom, email, téléphone, message, type de projet) sont collectés. Ils servent <strong>uniquement</strong> à vous recontacter au sujet de votre demande.</p>

        <h2>Conservation</h2>
        <p>Vos données sont conservées le temps strictement nécessaire au traitement de votre demande, puis archivées ou supprimées sous 24 mois maximum.</p>

        <h2>Partage avec des tiers</h2>
        <p>Vos données ne sont jamais vendues, louées ni cédées à des tiers à des fins commerciales. Elles sont uniquement traitées par LRMJ Project et son prestataire d'envoi de formulaire.</p>

        <h2>Cookies utilisés</h2>
        <ul>
          <li><strong>Cookies strictement nécessaires</strong> : préférence de thème (clair/sombre), validation du bandeau cookies. Pas de tracking.</li>
          <li><strong>Pas de cookies tiers publicitaires</strong>, pas de pixels Facebook ou Google Ads.</li>
        </ul>
        <p>Le site utilise des statistiques de fréquentation anonymes et sans cookie (Cloudflare Web Analytics) : aucune donnée personnelle, aucun identifiant, aucun traçage entre sites.</p>
        <p>Vous pouvez à tout moment supprimer les données locales (préférences) depuis les paramètres de votre navigateur.</p>

        <h2>Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données, vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité sur vos données. Pour exercer ces droits, contactez-nous à <a href="mailto:contact@lrmjproject.be">contact@lrmjproject.be</a>.</p>

        <h2>Autorité de contrôle</h2>
        <p>En cas de litige non résolu, vous pouvez saisir l'Autorité de protection des données belge : <a href="https://www.autoriteprotectiondonnees.be" rel="noopener">autoriteprotectiondonnees.be</a>.</p>

        <div class="article__related">
          <p>Voir aussi</p>
          <ul>
            <li><a href="/mentions-legales">Mentions légales</a></li>
            <li><a href="/">Retour à l'accueil</a></li>
          </ul>
        </div>
```

- [ ] **5.3** Dans `vite.config.js`, ANCRE :
```js
        input: {
          main: 'index.html',
          portfolio: 'portfolio.html',
        },
```
REMPLACEMENT :
```js
        input: {
          main: 'index.html',
          portfolio: 'portfolio.html',
          mentions: 'mentions-legales.html',
          confidentialite: 'confidentialite.html',
        },
```

- [ ] **5.4** Dans `index.html`, remplacer les boutons modaux du footer. ANCRE :
```html
      <p class="footer-copy">© <span id="footYear">2026</span> LRMJ Project ·
        <button type="button" class="footer-link-btn" data-open-legal="mentions" data-i18n="footer.mentions">Mentions légales</button> ·
        <button type="button" class="footer-link-btn" data-open-legal="privacy" data-i18n="footer.privacy">Confidentialité</button>
      </p>
```
REMPLACEMENT :
```html
      <p class="footer-copy">© <span id="footYear">2026</span> LRMJ Project ·
        <a class="footer-link-btn" href="/mentions-legales" data-i18n="footer.mentions">Mentions légales</a> ·
        <a class="footer-link-btn" href="/confidentialite" data-i18n="footer.privacy">Confidentialité</a>
      </p>
```

- [ ] **5.5** Dans `index.html`, le bouton du bandeau cookies. ANCRE :
```html
    <button type="button" class="footer-link-btn" data-open-legal="privacy" data-i18n="cookie.more">En savoir plus</button>
```
REMPLACEMENT :
```html
    <a class="footer-link-btn" href="/confidentialite" data-i18n="cookie.more">En savoir plus</a>
```

- [ ] **5.6** Dans `index.html`, SUPPRIMER intégralement les deux blocs modaux : depuis la ligne `<!-- MODAL MENTIONS LÉGALES -->` jusqu'à la fermeture `</div>` du bloc `<!-- MODAL CONFIDENTIALITÉ -->` incluse (les deux `<div class="modal-legal" ...>...</div>` entiers, juste avant `</body>`).

- [ ] **5.7** Dans `src/main.js` : supprimer la ligne `import { initModals }     from './js/modals.js';` ET la ligne `  initModals();`. Puis supprimer le fichier :
```powershell
Remove-Item "src\js\modals.js" -Confirm:$false
```

- [ ] **5.8** Dans `src/styles/components/modals.css` : SUPPRIMER tout le bloc depuis la ligne `/* ── MODALS LÉGAUX ── */` jusqu'à la fin du fichier (les styles .modal-legal ne servent plus ; le bandeau cookie du haut du fichier RESTE).

- [ ] **5.9** Réécrire `public/sitemap.xml` (v2) :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://lrmjproject.be/</loc></url>
  <url><loc>https://lrmjproject.be/portfolio</loc></url>
</urlset>
```
NOTE : les pages légales sont en `noindex` (standard, elles n'apportent rien en recherche) : elles ne vont PAS dans le sitemap. Le sitemap v2 est identique au v1, cette étape est là pour le rappeler explicitement : ne pas les ajouter.

- [ ] **5.10** Vérifier : build ✓. Preview : `/mentions-legales` et `/confidentialite` chargent avec nav slim + thème light/dark fonctionnel ; sur `/`, le footer "Mentions légales" est un lien qui navigue ; le bandeau cookies (vider localStorage `lrmj-cookie-consent` si besoin pour le faire réapparaître : lire `src/js/cookies.js` pour la clé exacte) pointe vers `/confidentialite` ; AUCUNE erreur console sur les 3 pages (une erreur `initModals is not defined` = étape 5.7 mal faite).
- [ ] **5.11** Commit + push :
```bash
git add -A
git commit -m "feat: real legal pages replace js modals"
git push
```

### Tâche 6 : Cloudflare Web Analytics (ACTION UTILISATEUR, zéro code)

- [ ] **6.1** Dire à l'utilisateur : Dashboard Cloudflare → Workers & Pages → projet `lrmj-project` → onglet **Settings** (ou **Metrics**) → **Web Analytics** → **Enable**. Cloudflare injecte le beacon automatiquement sur toutes les pages du projet. Aucun commit. (Cohérent avec la promesse du bandeau cookies : sans cookie, sans fingerprinting.)

---

## PHASE 2 : 5 LANDING PAGES SEO FR

### SQUELETTE-SEO (référence pour les Tâches 7 à 11, ne pas créer de fichier ici)

Chaque page FR = ce squelette EXACT avec les deux zones `%%HEAD%%` et `%%CONTENU%%` remplacées par les blocs fournis dans la tâche de la page. Rien d'autre ne change.

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>
    (function() {
      var html = document.documentElement;
      html.classList.add('js');
      try {
        var stored = localStorage.getItem('lrmj-theme');
        var theme = (stored === 'dark' || stored === 'light')
          ? stored
          : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        if (theme === 'dark') html.setAttribute('data-theme', 'dark');
      } catch (_) {}
    })();
  </script>
%%HEAD%%
  <link id="faviconEl" rel="icon" type="image/png"
        href="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_64/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://api.fontshare.com" crossorigin>
  <link rel="preconnect" href="https://res.cloudinary.com" crossorigin>
  <link href="https://api.fontshare.com/v2/css?f[]=clash-display@300,400,500,600,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <script type="module" src="/src/page.js"></script>
</head>
<body>

<header class="nav nav--slim" id="siteNav">
  <div class="nav__inner">
    <a href="/" class="nav__logo" aria-label="LRMJ Project | Accueil">
      <img class="nav__logo-img"
           src="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_96/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png"
           data-src-dark="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_96/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png"
           data-src-light="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_96/LRMJ_EMBLEM_FLAT_LIGHT_MODE_tlr9tp.png"
           alt="LRMJ Project" width="48" height="48"/>
    </a>
    <a href="/" class="nav__back">←<span>&nbsp;Retour à l'accueil</span></a>
    <div class="nav__actions">
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Basculer entre mode clair et sombre">
        <svg class="theme-toggle__sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
        </svg>
        <svg class="theme-toggle__moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      </button>
      <a href="/#contact" class="nav__cta-pill">Devis Gratuit</a>
    </div>
  </div>
</header>

<main id="main">
%%CONTENU%%
</main>

<footer class="footer pf-footer">
  <div class="wrap">
    <div class="pf-footer__inner">
      <a href="/" class="pf-footer__brand">
        <img src="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_72/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png"
             data-src-dark="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_72/LRMJ_EMBLEM_FLAT_DARK_MODE_yhtb4t.png"
             data-src-light="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,w_72/LRMJ_EMBLEM_FLAT_LIGHT_MODE_tlr9tp.png"
             alt="" aria-hidden="true" width="36" height="36" loading="lazy"/>
        <span>← Retour à l'accueil</span>
      </a>
      <a href="/#contact" class="btn btn--red">
        <span>Devis Gratuit</span>
        <span class="btn__ico" aria-hidden="true">↗</span>
      </a>
    </div>
    <p class="pf-footer__copy">© <span id="footYear">2026</span> LRMJ Project · BE 0839.975.656 · <a class="footer-link-btn" href="/mentions-legales">Mentions légales</a></p>
  </div>
</footer>

</body>
</html>
```

Après CHAQUE page créée (Tâches 7-11) : ajouter son entrée dans `rollupOptions.input` de `vite.config.js` (clé = slug sans tirets, valeur = 'slug.html'), `npm run build` → ✓, vérifier en preview que `/slug` charge (nav slim, galerie = skeleton ou photos, FAQ dépliable, light/dark OK), puis committer avec le message fourni.

### Tâche 7 : `/ferronnier-bruxelles` (page pilier)

**Files:** Create `ferronnier-bruxelles.html`, Modify `vite.config.js` (input `ferronnierbruxelles: 'ferronnier-bruxelles.html'`)

- [ ] **7.1** Bloc `%%HEAD%%` :
```html
  <title>Ferronnier à Bruxelles | Fer forgé sur mesure | LRMJ Project</title>
  <meta name="description" content="Artisan ferronnier à Bruxelles et en Brabant flamand. Portails, garde-corps, verrières et restauration de fonte, conçus et posés par notre atelier. Devis gratuit sous 48h." />
  <link rel="canonical" href="https://lrmjproject.be/ferronnier-bruxelles" />
  <meta property="og:title" content="Ferronnier à Bruxelles | LRMJ Project" />
  <meta property="og:description" content="Fer forgé sur mesure : portails, garde-corps, verrières, restauration de fonte. Atelier artisanal, zéro sous-traitance." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/ferronnier-bruxelles" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```

- [ ] **7.2** Bloc `%%CONTENU%%` :
```html
  <section class="page-hero">
    <div class="wrap wrap--sm fi">
      <span class="eyebrow">Ferronnerie d'art · Depuis 2011</span>
      <h1 class="h-large">Ferronnier à <em>Bruxelles</em></h1>
      <p class="lead">Un atelier, un artisan, une parole. LRMJ Project conçoit, forge et pose des ouvrages en fer forgé sur mesure pour les maisons et immeubles de Bruxelles et du Brabant flamand.</p>
    </div>
  </section>

  <section class="article">
    <div class="wrap wrap--sm">
      <div class="article__body fi">
        <h2>Un atelier de ferronnerie aux portes de Bruxelles</h2>
        <p>Fondé en 2011 par Romeo Lesac, LRMJ Project est un atelier de ferronnerie installé à Opwijk, à vingt minutes du centre de Bruxelles. Chaque pièce y est dessinée, forgée et assemblée par nos propres mains, puis posée par la même équipe. <strong>Aucune sous-traitance</strong> : la personne qui prend vos mesures est celle qui forge votre ouvrage et qui le pose.</p>
        <p>Cette façon de travailler, devenue rare, change tout : un seul interlocuteur du premier appel à la réception du chantier, des détails maîtrisés de bout en bout, et une responsabilité claire sur le résultat.</p>

        <div class="article__gallery" data-seo-gallery="portails" aria-label="Exemples de réalisations"></div>

        <h2>Ce que nous <em>forgeons</em></h2>
        <ul>
          <li><a href="/portail-fer-forge">Portails et clôtures en fer forgé</a> : entrées de propriété battantes ou coulissantes, clôtures assorties.</li>
          <li><a href="/garde-corps-fer-forge">Garde-corps et rampes</a> : escaliers, balcons, mezzanines, terrasses.</li>
          <li><a href="/verriere-sur-mesure">Verrières et baies vitrées en acier</a> : cloisons d'atelier, jardins d'hiver, extensions vitrées.</li>
          <li><a href="/restauration-balustrade-fonte">Restauration de balustrades en fonte</a> : une spécialité rare, précieuse pour le patrimoine bruxellois.</li>
          <li>Marquises, auvents, escaliers métalliques et mobilier forgé, présentés sur notre <a href="/portfolio">page réalisations</a>.</li>
        </ul>

        <h2>Notre façon de travailler</h2>
        <p>Tout commence par un échange simple : vous nous appelez ou vous écrivez, on comprend votre projet sans jargon. Nous nous déplaçons ensuite chez vous pour prendre les mesures et discuter des styles, des finitions et des contraintes du lieu. Vous recevez un <strong>devis détaillé et gratuit sous 48 heures</strong>, sans engagement.</p>
        <p>La fabrication se fait entièrement dans notre atelier d'Opwijk. Selon l'usage et l'exposition, les ouvrages reçoivent une finition époxy, une galvanisation ou un thermolaquage, pour une protection durable contre la corrosion. La pose est réalisée par notre équipe, avec les finitions soignées qui font la différence.</p>

        <h2>Bruxelles et Brabant flamand</h2>
        <p>Nous intervenons dans les 19 communes de Bruxelles-Capitale, notamment Uccle, Ixelles, Woluwe-Saint-Pierre, Woluwe-Saint-Lambert, Schaerbeek, Forest et Etterbeek, ainsi que dans tout le Brabant flamand : Opwijk, Asse, Merchtem, Dilbeek, Wemmel, Grimbergen, Vilvorde, Zaventem et leurs environs. Pour un projet situé au-delà, le plus simple est de nous demander.</p>

        <div class="article__faq">
          <h2>Questions fréquentes</h2>
          <details class="fi">
            <summary>Combien coûte un ouvrage en fer forgé sur mesure ?</summary>
            <p>Chaque pièce étant dessinée et forgée pour votre projet, le prix dépend des dimensions, du dessin et de la finition choisie. C'est pour cela que la visite et le devis sont gratuits : vous recevez un chiffrage précis sous 48 heures, sans engagement.</p>
          </details>
          <details class="fi">
            <summary>Travaillez-vous avec des sous-traitants ?</summary>
            <p>Non, jamais. La conception, la fabrication et la pose sont réalisées par notre atelier. C'est notre engagement depuis 2011.</p>
          </details>
          <details class="fi">
            <summary>Le fer forgé demande-t-il beaucoup d'entretien ?</summary>
            <p>Avec une finition adaptée (galvanisation, thermolaquage ou époxy), un ouvrage en fer forgé traverse les décennies. Un simple contrôle visuel régulier et une retouche en cas d'éclat suffisent dans la plupart des cas.</p>
          </details>
          <details class="fi">
            <summary>Intervenez-vous dans ma commune ?</summary>
            <p>Si vous êtes à Bruxelles ou en Brabant flamand, oui. Ailleurs en Belgique, appelez-nous : selon le projet, nous nous déplaçons volontiers.</p>
          </details>
        </div>

        <div class="article__cta fi">
          <div class="article__cta-txt">
            <p class="article__cta-title">Parlons de votre projet</p>
            <p class="article__cta-sub">Visite sur place, prise de mesures et devis détaillé, gratuits et sans engagement. Réponse sous 48h.</p>
          </div>
          <a href="/#contact" class="btn btn--red"><span>Devis Gratuit</span><span class="btn__ico" aria-hidden="true">↗</span></a>
        </div>

        <div class="article__related">
          <p>Voir aussi</p>
          <ul>
            <li><a href="/portail-fer-forge">Portails en fer forgé</a></li>
            <li><a href="/garde-corps-fer-forge">Garde-corps</a></li>
            <li><a href="/verriere-sur-mesure">Verrières</a></li>
            <li><a href="/restauration-balustrade-fonte">Restauration fonte</a></li>
            <li><a href="/portfolio">Nos réalisations</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **7.3** Input Vite + build + preview + commit :
```bash
git add ferronnier-bruxelles.html vite.config.js
git commit -m "feat: seo landing page ferronnier bruxelles"
```

### Tâche 8 : `/portail-fer-forge`

**Files:** Create `portail-fer-forge.html`, Modify `vite.config.js` (input `portail: 'portail-fer-forge.html'`)

- [ ] **8.1** `%%HEAD%%` :
```html
  <title>Portail en fer forgé sur mesure | Bruxelles &amp; Brabant | LRMJ Project</title>
  <meta name="description" content="Portails et clôtures en fer forgé sur mesure, battants ou coulissants. Forgés dans notre atelier, finition galvanisée ou thermolaquée, pose comprise. Devis gratuit sous 48h." />
  <link rel="canonical" href="https://lrmjproject.be/portail-fer-forge" />
  <meta property="og:title" content="Portail en fer forgé sur mesure | LRMJ Project" />
  <meta property="og:description" content="Entrées monumentales ou clôtures élégantes, dessinées et forgées pour votre propriété. Atelier artisanal, Bruxelles et Brabant flamand." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/portail-fer-forge" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```

- [ ] **8.2** `%%CONTENU%%` :
```html
  <section class="page-hero">
    <div class="wrap wrap--sm fi">
      <span class="eyebrow">Signature de l'atelier</span>
      <h1 class="h-large">Portails et clôtures en <em>fer forgé</em></h1>
      <p class="lead">L'entrée donne le ton de toute la propriété. Nous dessinons et forgeons des portails sur mesure qui allient présence, sécurité et durabilité, à Bruxelles et en Brabant flamand.</p>
    </div>
  </section>

  <section class="article">
    <div class="wrap wrap--sm">
      <div class="article__body fi">
        <h2>Un portail dessiné pour votre propriété</h2>
        <p>Un portail en fer forgé n'est jamais un produit de catalogue chez nous. Chaque projet part de votre entrée réelle : la largeur, la pente, le style de la façade, la présence d'un mur ou de pilastres. Nous dessinons ensuite un modèle qui s'y accorde, du plus sobre au plus ouvragé : lignes droites contemporaines, volutes classiques, pointes de lance, monogramme.</p>
        <p>Portail à <strong>deux battants</strong> ou <strong>coulissant</strong> selon la configuration, portillon assorti, clôture au même dessin pour prolonger l'ensemble : tout sort du même atelier, avec la même main.</p>

        <div class="article__gallery" data-seo-gallery="portails" aria-label="Portails réalisés par l'atelier"></div>

        <h2>Forgé pour durer <em>dehors</em></h2>
        <p>Un portail vit dehors toute l'année. C'est pourquoi la finition compte autant que le dessin : selon l'exposition et vos préférences, nous protégeons l'acier par <strong>galvanisation</strong>, <strong>thermolaquage</strong> (teinte RAL au choix) ou peinture époxy. Ces traitements donnent aux ouvrages une résistance à la corrosion qui se compte en décennies, avec un entretien minimal.</p>
        <p>Côté usage, la structure est pensée dès le dessin pour recevoir une motorisation si vous le souhaitez, aujourd'hui ou plus tard.</p>

        <h2>De la visite à la pose</h2>
        <p>Nous venons voir votre entrée, prendre les mesures et comprendre vos contraintes. Vous recevez un <strong>devis gratuit et détaillé sous 48 heures</strong>. La fabrication se fait dans notre atelier d'Opwijk, la pose par notre propre équipe : scellement, alignements, réglages des gonds et finitions. Un seul interlocuteur du début à la fin, <a href="/ferronnier-bruxelles">c'est notre façon de travailler</a>.</p>

        <div class="article__faq">
          <h2>Questions fréquentes</h2>
          <details class="fi">
            <summary>Quel est le prix d'un portail en fer forgé ?</summary>
            <p>Il dépend des dimensions, du dessin (sobre ou très ouvragé), du type d'ouverture et de la finition. Le sur mesure impose un chiffrage au cas par cas : la visite et le devis sont gratuits, et vous avez la réponse sous 48 heures.</p>
          </details>
          <details class="fi">
            <summary>Battant ou coulissant, comment choisir ?</summary>
            <p>Le battant est le grand classique quand l'espace de dégagement le permet. Le coulissant s'impose quand l'allée monte, que le recul manque ou que vous voulez dégager toute l'entrée. On tranche ensemble lors de la visite, en fonction de votre terrain.</p>
          </details>
          <details class="fi">
            <summary>Peut-on motoriser un portail en fer forgé ?</summary>
            <p>Oui. Nous concevons la structure pour qu'elle puisse recevoir une motorisation adaptée à son poids et à son ouverture, que vous l'installiez tout de suite ou plus tard.</p>
          </details>
          <details class="fi">
            <summary>Fabriquez-vous aussi la clôture assortie ?</summary>
            <p>Bien sûr, et c'est même recommandé : clôture, portillon et portail au même dessin donnent une entrée cohérente. Le tout sort du même atelier.</p>
          </details>
        </div>

        <div class="article__cta fi">
          <div class="article__cta-txt">
            <p class="article__cta-title">Votre entrée mérite mieux qu'un catalogue</p>
            <p class="article__cta-sub">Visite, mesures et devis détaillé gratuits. Réponse sous 48h, sans engagement.</p>
          </div>
          <a href="/#contact" class="btn btn--red"><span>Devis Gratuit</span><span class="btn__ico" aria-hidden="true">↗</span></a>
        </div>

        <div class="article__related">
          <p>Voir aussi</p>
          <ul>
            <li><a href="/ferronnier-bruxelles">Ferronnier à Bruxelles</a></li>
            <li><a href="/garde-corps-fer-forge">Garde-corps</a></li>
            <li><a href="/portfolio">Portails réalisés</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **8.3** Input Vite + build + preview + commit :
```bash
git add portail-fer-forge.html vite.config.js
git commit -m "feat: seo landing page portail fer forge"
```

### Tâche 9 : `/garde-corps-fer-forge`

**Files:** Create `garde-corps-fer-forge.html`, Modify `vite.config.js` (input `gardecorps: 'garde-corps-fer-forge.html'`)

- [ ] **9.1** `%%HEAD%%` :
```html
  <title>Garde-corps en fer forgé | Escaliers &amp; balcons | LRMJ Project</title>
  <meta name="description" content="Garde-corps et rampes en fer forgé sur mesure pour escaliers, balcons, mezzanines et terrasses. Sécurité et esthétique, fabrication artisanale à Bruxelles. Devis gratuit 48h." />
  <link rel="canonical" href="https://lrmjproject.be/garde-corps-fer-forge" />
  <meta property="og:title" content="Garde-corps en fer forgé sur mesure | LRMJ Project" />
  <meta property="og:description" content="Escaliers, balcons, mezzanines, terrasses : des garde-corps forgés qui sécurisent sans alourdir. Atelier artisanal, Bruxelles et Brabant flamand." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/garde-corps-fer-forge" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```

- [ ] **9.2** `%%CONTENU%%` :
```html
  <section class="page-hero">
    <div class="wrap wrap--sm fi">
      <span class="eyebrow">Intérieur &amp; extérieur</span>
      <h1 class="h-large">Garde-corps et rampes en <em>fer forgé</em></h1>
      <p class="lead">Un garde-corps doit protéger sans enfermer. Nous forgeons des rampes d'escalier, garde-corps de balcon et de mezzanine qui sécurisent votre espace tout en le mettant en valeur.</p>
    </div>
  </section>

  <section class="article">
    <div class="wrap wrap--sm">
      <div class="article__body fi">
        <h2>Escaliers, balcons, mezzanines, terrasses</h2>
        <p>Le garde-corps est l'ouvrage de ferronnerie qu'on touche tous les jours. Il doit être juste : agréable sous la main, solidement fixé, au bon dessin pour votre intérieur ou votre façade. Nous réalisons des <strong>rampes d'escalier</strong> droites ou débillardées, des <strong>garde-corps de balcon</strong> et de fenêtre, des protections de <strong>mezzanine</strong> et de <strong>terrasse</strong>, en intérieur comme en extérieur.</p>
        <p>Du barreaudage sobre au dessin ouvragé avec volutes et frises, chaque modèle est dessiné pour son emplacement, puis forgé dans notre atelier d'Opwijk.</p>

        <div class="article__gallery" data-seo-gallery="gardecorps" aria-label="Garde-corps réalisés par l'atelier"></div>

        <h2>La sécurité <em>d'abord</em></h2>
        <p>Un garde-corps est avant tout un élément de sécurité : hauteurs de protection, espacements des barreaux et fixations sont dimensionnés selon les règles de l'art et les normes belges en vigueur, en fonction de la configuration de votre bâtiment. C'est un point que nous validons lors de la visite, avant tout dessin.</p>
        <p>En extérieur, la finition fait la longévité : galvanisation, thermolaquage ou époxy selon l'exposition. En intérieur, patines et laquages permettent d'accorder l'ouvrage au style de la maison, du plus classique au plus contemporain.</p>

        <h2>Restauration comprise</h2>
        <p>Votre immeuble bruxellois possède déjà des garde-corps anciens en fonte ou en fer forgé ? Nous les restaurons plutôt que de les remplacer quand c'est possible : redressage, soudure, remplacement de pièces manquantes, traitement anticorrosion. Voyez notre page dédiée à la <a href="/restauration-balustrade-fonte">restauration de balustrades en fonte</a>, une spécialité rare de l'atelier.</p>

        <div class="article__faq">
          <h2>Questions fréquentes</h2>
          <details class="fi">
            <summary>Intérieur ou extérieur, est-ce le même ouvrage ?</summary>
            <p>Le dessin peut être identique, la finition non. Un garde-corps extérieur reçoit une protection anticorrosion renforcée (galvanisation ou thermolaquage), un ouvrage intérieur privilégie les patines et laquages décoratifs.</p>
          </details>
          <details class="fi">
            <summary>Mon escalier est ancien et irrégulier, est-ce un problème ?</summary>
            <p>Non, c'est justement l'intérêt du sur mesure. Nous relevons les cotes réelles sur place, marche par marche si nécessaire, et la rampe est forgée pour épouser votre escalier tel qu'il est.</p>
          </details>
          <details class="fi">
            <summary>Le garde-corps sera-t-il conforme aux normes ?</summary>
            <p>Oui. Hauteurs, espacements et fixations sont établis selon les normes belges en vigueur pour votre configuration, et validés lors de la visite technique.</p>
          </details>
        </div>

        <div class="article__cta fi">
          <div class="article__cta-txt">
            <p class="article__cta-title">Sécurisez sans enlaidir</p>
            <p class="article__cta-sub">Visite technique, mesures et devis détaillé gratuits. Réponse sous 48h.</p>
          </div>
          <a href="/#contact" class="btn btn--red"><span>Devis Gratuit</span><span class="btn__ico" aria-hidden="true">↗</span></a>
        </div>

        <div class="article__related">
          <p>Voir aussi</p>
          <ul>
            <li><a href="/restauration-balustrade-fonte">Restauration de balustrades</a></li>
            <li><a href="/ferronnier-bruxelles">Ferronnier à Bruxelles</a></li>
            <li><a href="/portfolio">Garde-corps réalisés</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **9.3** Input Vite + build + preview + commit :
```bash
git add garde-corps-fer-forge.html vite.config.js
git commit -m "feat: seo landing page garde-corps fer forge"
```

### Tâche 10 : `/verriere-sur-mesure`

**Files:** Create `verriere-sur-mesure.html`, Modify `vite.config.js` (input `verriere: 'verriere-sur-mesure.html'`)

- [ ] **10.1** `%%HEAD%%` :
```html
  <title>Verrière sur mesure | Atelier &amp; baies vitrées acier | LRMJ Project</title>
  <meta name="description" content="Verrières d'atelier, baies vitrées en acier, jardins d'hiver : structures fines forgées sur mesure à Bruxelles et en Brabant flamand. Devis gratuit sous 48h." />
  <link rel="canonical" href="https://lrmjproject.be/verriere-sur-mesure" />
  <meta property="og:title" content="Verrière sur mesure en acier | LRMJ Project" />
  <meta property="og:description" content="Cloisons verrières, baies vitrées, jardins d'hiver : la lumière sans perdre le caractère. Fabrication artisanale, pose comprise." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/verriere-sur-mesure" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```

- [ ] **10.2** `%%CONTENU%%` :
```html
  <section class="page-hero">
    <div class="wrap wrap--sm fi">
      <span class="eyebrow">Jardin &amp; extension</span>
      <h1 class="h-large">Verrières et baies vitrées <em>sur mesure</em></h1>
      <p class="lead">Faire entrer la lumière sans perdre le caractère : c'est tout l'art de la verrière en acier. Cloisons d'atelier, baies vitrées, jardins d'hiver, dessinés et fabriqués pour votre espace.</p>
    </div>
  </section>

  <section class="article">
    <div class="wrap wrap--sm">
      <div class="article__body fi">
        <h2>La finesse de l'acier, la force du sur mesure</h2>
        <p>Ce qui fait le charme d'une verrière d'atelier, c'est la finesse de ses profils : des montants élancés qu'aucune menuiserie standard n'égale, un quadrillage dessiné à votre goût, une impression d'espace immédiate. Nous fabriquons des <strong>cloisons verrières intérieures</strong> (entre cuisine et séjour, autour d'un bureau, en tête d'escalier), des <strong>baies vitrées en acier</strong> et des <strong>jardins d'hiver</strong> qui prolongent la maison vers l'extérieur.</p>
        <p>Chaque verrière part d'un relevé précis de votre ouverture et d'un dessin : proportions des carreaux, soubassement plein ou vitré, porte intégrée, imposte. La structure est ensuite fabriquée dans notre atelier d'Opwijk et posée par notre équipe.</p>

        <div class="article__gallery" data-seo-gallery="verrieres" aria-label="Verrières réalisées par l'atelier"></div>

        <h2>Intérieur ou <em>extérieur</em></h2>
        <p>En intérieur, la verrière cloisonne sans assombrir : elle sépare les fonctions tout en laissant circuler la lumière. En extérieur, baies vitrées et jardins d'hiver reçoivent un vitrage adapté à l'usage (feuilleté ou double vitrage selon le projet) et une finition thermolaquée qui protège l'acier durablement, dans la teinte de votre choix.</p>
        <p>Les structures restent légères visuellement mais robustes : c'est la nature de l'acier forgé, et la raison pour laquelle ces ouvrages traversent les générations.</p>

        <h2>Un projet, un interlocuteur</h2>
        <p>Comme pour tous nos ouvrages, vous traitez avec l'artisan qui fabrique : visite sur place, relevé des cotes, dessin, <strong>devis gratuit sous 48 heures</strong>, fabrication en atelier et pose soignée. Découvrez aussi <a href="/ferronnier-bruxelles">notre atelier et notre façon de travailler</a>.</p>

        <div class="article__faq">
          <h2>Questions fréquentes</h2>
          <details class="fi">
            <summary>Quel est le prix d'une verrière d'atelier ?</summary>
            <p>Il varie selon les dimensions, le nombre de travées, la présence d'une porte et le type de vitrage. Le devis est gratuit, détaillé et fourni sous 48 heures après la visite.</p>
          </details>
          <details class="fi">
            <summary>Quel vitrage utilisez-vous ?</summary>
            <p>Cela dépend de l'usage : vitrage feuilleté pour la sécurité en intérieur, double vitrage pour les ouvrages donnant sur l'extérieur. Nous vous conseillons la solution adaptée lors de la visite.</p>
          </details>
          <details class="fi">
            <summary>Peut-on intégrer une porte dans la verrière ?</summary>
            <p>Oui, battante ou coulissante, avec la même finesse de profils. Elle est dessinée dans la continuité du quadrillage pour que l'ensemble reste cohérent.</p>
          </details>
        </div>

        <div class="article__cta fi">
          <div class="article__cta-txt">
            <p class="article__cta-title">Faites entrer la lumière</p>
            <p class="article__cta-sub">Relevé des cotes, dessin et devis détaillé gratuits. Réponse sous 48h.</p>
          </div>
          <a href="/#contact" class="btn btn--red"><span>Devis Gratuit</span><span class="btn__ico" aria-hidden="true">↗</span></a>
        </div>

        <div class="article__related">
          <p>Voir aussi</p>
          <ul>
            <li><a href="/ferronnier-bruxelles">Ferronnier à Bruxelles</a></li>
            <li><a href="/portail-fer-forge">Portails en fer forgé</a></li>
            <li><a href="/portfolio">Verrières réalisées</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **10.3** Input Vite + build + preview + commit :
```bash
git add verriere-sur-mesure.html vite.config.js
git commit -m "feat: seo landing page verriere sur mesure"
```

### Tâche 11 : `/restauration-balustrade-fonte`

PAS de bloc galerie sur cette page (pas de catégorie Cloudinary dédiée fiable) : le contenu texte + CTA suffit.

**Files:** Create `restauration-balustrade-fonte.html`, Modify `vite.config.js` (input `restauration: 'restauration-balustrade-fonte.html'`)

- [ ] **11.1** `%%HEAD%%` :
```html
  <title>Restauration de balustrades en fonte | Bruxelles | LRMJ Project</title>
  <meta name="description" content="Restauration de balustrades, balcons et garde-corps en fonte ancienne à Bruxelles : décapage, soudure spécialisée, pièces manquantes, anticorrosion. Prime façade jusqu'à 14 000 €." />
  <link rel="canonical" href="https://lrmjproject.be/restauration-balustrade-fonte" />
  <meta property="og:title" content="Restauration de balustrades en fonte | LRMJ Project" />
  <meta property="og:description" content="Une spécialité rare au service du patrimoine bruxellois. La Ville de Bruxelles rembourse 40 à 60% des travaux de restauration de façade." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/restauration-balustrade-fonte" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```

- [ ] **11.2** `%%CONTENU%%` :
```html
  <section class="page-hero">
    <div class="wrap wrap--sm fi">
      <span class="eyebrow">Spécialité rare · Patrimoine</span>
      <h1 class="h-large">Restauration de balustrades en <em>fonte</em></h1>
      <p class="lead">Les balcons bruxellois du dix-neuvième siècle méritent mieux qu'un remplacement. Nous restaurons la fonte ancienne : un savoir-faire que peu d'artisans maîtrisent encore.</p>
    </div>
  </section>

  <section class="article">
    <div class="wrap wrap--sm">
      <div class="article__body fi">
        <h2>Pourquoi restaurer plutôt que remplacer</h2>
        <p>Les balustrades en fonte des façades bruxelloises font partie de l'identité de la ville : motifs moulés, volutes, rosaces, d'une finesse que les fabrications modernes ne reproduisent pas. Quand la corrosion, un choc ou le temps les abîment, le réflexe du remplacement fait perdre ce caractère pour toujours. La restauration le préserve, et redonne à la façade sa valeur d'origine.</p>
        <p>La fonte est un matériau exigeant : cassante, elle ne se soude pas comme l'acier. C'est un travail de spécialiste, et c'est précisément la spécialité de notre atelier.</p>

        <h2>Ce que nous <em>restaurons</em></h2>
        <ul>
          <li>Balustrades et garde-corps de balcon en fonte ou en fer forgé ancien</li>
          <li>Rampes d'escalier d'époque</li>
          <li>Consoles, moulures et éléments décoratifs de façade</li>
        </ul>
        <p>Le travail comprend, selon l'état : nettoyage et décapage complet, <strong>soudure spécialisée de la fonte</strong>, remplacement des pièces manquantes, traitement anticorrosion et finition à l'ancienne, dans le respect du dessin d'origine.</p>

        <h2>La prime de la Ville de Bruxelles</h2>
        <p>Bonne nouvelle pour les propriétaires : la Ville de Bruxelles rembourse <strong>40 à 60 pour cent du coût des travaux</strong> d'embellissement de façade, ce qui couvre les balcons, garde-corps et consoles en fonte, jusqu'à <strong>14 000 euros par dossier</strong> selon la longueur de la façade. D'autres communes bruxelloises ont leur propre programme de primes : renseignez-vous auprès de la vôtre, ou demandez-nous lors de la visite.</p>
        <p>Les conditions officielles sont consultables sur <a href="https://www.bruxelles.be/prime-facades" rel="noopener noreferrer" target="_blank">le site de la Ville de Bruxelles</a>.</p>

        <h2>Comment ça se passe</h2>
        <p>Nous venons examiner l'ouvrage sur place : état de la fonte, pièces manquantes, fixations, ancrages dans la façade. Vous recevez un <strong>devis détaillé et gratuit sous 48 heures</strong>. Selon le chantier, la restauration se fait sur place ou en atelier après dépose soignée, puis l'ouvrage est reposé et protégé pour les décennies à venir.</p>

        <div class="article__faq">
          <h2>Questions fréquentes</h2>
          <details class="fi">
            <summary>Ma balustrade est très abîmée, est-elle encore restaurable ?</summary>
            <p>Dans la grande majorité des cas, oui. Même avec des pièces cassées ou manquantes, nous pouvons souder la fonte et refaire les éléments absents dans le respect du dessin d'origine. Le diagnostic sur place est gratuit.</p>
          </details>
          <details class="fi">
            <summary>Combien coûte une restauration de balustrade ?</summary>
            <p>Tout dépend de l'état, du linéaire et de la complexité des motifs. Le devis est gratuit et détaillé, et la prime de la Ville de Bruxelles peut couvrir 40 à 60 pour cent du montant des travaux éligibles.</p>
          </details>
          <details class="fi">
            <summary>Faut-il démonter la balustrade pour la restaurer ?</summary>
            <p>Pas toujours. Les interventions légères se font sur place. Quand l'état le justifie, nous déposons l'ouvrage avec précaution, le restaurons en atelier et le reposons.</p>
          </details>
          <details class="fi">
            <summary>Intervenez-vous en dehors de Bruxelles ?</summary>
            <p>Oui, dans tout le Brabant flamand et au-delà selon le projet. La prime décrite ici est propre à la Ville de Bruxelles, mais d'autres communes ont des dispositifs comparables.</p>
          </details>
        </div>

        <div class="article__cta fi">
          <div class="article__cta-txt">
            <p class="article__cta-title">Votre façade a du patrimoine, préservons-le</p>
            <p class="article__cta-sub">Diagnostic sur place et devis détaillé gratuits. Réponse sous 48h.</p>
          </div>
          <a href="/#contact" class="btn btn--red"><span>Devis Gratuit</span><span class="btn__ico" aria-hidden="true">↗</span></a>
        </div>

        <div class="article__related">
          <p>Voir aussi</p>
          <ul>
            <li><a href="/garde-corps-fer-forge">Garde-corps neufs en fer forgé</a></li>
            <li><a href="/ferronnier-bruxelles">Ferronnier à Bruxelles</a></li>
            <li><a href="/portfolio">Nos réalisations</a></li>
          </ul>
        </div>
      </div>
    </div>
  </section>
```

- [ ] **11.3** Input Vite + build + preview + commit :
```bash
git add restauration-balustrade-fonte.html vite.config.js
git commit -m "feat: seo landing page restauration balustrade fonte"
```

### Tâche 12 : Maillage depuis la vitrine + sitemap v3

**Files:** Modify `index.html`, Modify `public/sitemap.xml`

- [ ] **12.1** Repointer la colonne Services du footer vers les landing pages. Dans `index.html`, ANCRE :
```html
          <li><a href="#services" data-i18n="footer.s.portails">Portails</a></li>
          <li><a href="#services" data-i18n="footer.s.gardecorps">Garde-corps</a></li>
          <li><a href="#services" data-i18n="footer.s.serres">Serres</a></li>
          <li><a href="#services" data-i18n="footer.s.marquises">Marquises</a></li>
```
REMPLACEMENT :
```html
          <li><a href="/portail-fer-forge" data-i18n="footer.s.portails">Portails</a></li>
          <li><a href="/garde-corps-fer-forge" data-i18n="footer.s.gardecorps">Garde-corps</a></li>
          <li><a href="/verriere-sur-mesure" data-i18n="footer.s.serres">Serres</a></li>
          <li><a href="/restauration-balustrade-fonte" data-i18n="footer.s.marquises">Restauration fonte</a></li>
```
PUIS dans `src/js/i18n.js`, mettre à jour la clé des deux langues : `'footer.s.marquises':  'Marquises',` devient `'footer.s.marquises':  'Restauration fonte',` (bloc FR) et `'footer.s.marquises':  'Luifels',` devient `'footer.s.marquises':  'Restauratie gietijzer',` (bloc NL). (On sacrifie le lien footer "Marquises", qui n'a pas de page dédiée, au profit de la page restauration.)

- [ ] **12.2** Ajouter un lien texte dans la section restauration de la vitrine. Dans `index.html`, ANCRE :
```html
            <a href="https://www.bruxelles.be/prime-facades"
               target="_blank" rel="noopener noreferrer"
               class="resto__prime-link" data-i18n="resto.prime.link">
              Consulter la prime officielle →
            </a>
```
REMPLACEMENT :
```html
            <a href="https://www.bruxelles.be/prime-facades"
               target="_blank" rel="noopener noreferrer"
               class="resto__prime-link" data-i18n="resto.prime.link">
              Consulter la prime officielle →
            </a>
            <a href="/restauration-balustrade-fonte" class="resto__prime-link" data-i18n="resto.more">
              Tout savoir sur la restauration de fonte →
            </a>
```
PUIS ajouter la clé i18n dans les DEUX blocs de `src/js/i18n.js`, à la suite de `'resto.prime.link'` : FR `'resto.more':       'Tout savoir sur la restauration de fonte →',` et NL `'resto.more':       'Alles over restauratie van gietijzer →',`.

- [ ] **12.3** Réécrire `public/sitemap.xml` (v3) :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://lrmjproject.be/</loc></url>
  <url><loc>https://lrmjproject.be/portfolio</loc></url>
  <url><loc>https://lrmjproject.be/ferronnier-bruxelles</loc></url>
  <url><loc>https://lrmjproject.be/portail-fer-forge</loc></url>
  <url><loc>https://lrmjproject.be/garde-corps-fer-forge</loc></url>
  <url><loc>https://lrmjproject.be/verriere-sur-mesure</loc></url>
  <url><loc>https://lrmjproject.be/restauration-balustrade-fonte</loc></url>
</urlset>
```

- [ ] **12.4** Vérifier : build ✓ ; preview : footer de `/` pointe vers les 4 pages, elles chargent toutes ; toggle NL → labels traduits, liens inchangés ; les 5 pages passent le check light/dark. Commit + push :
```bash
git add -A
git commit -m "feat: internal linking from home and sitemap v3"
git push
```

---

## PHASE 3 : VERSIONS NL (/nl/…) + LÉGAL NL + HREFLANG

### Règles de traduction NL (s'appliquent aux Tâches 13 à 17)

Le corps des pages NL = traduction FIDÈLE du corps FR correspondant (mêmes sections, mêmes faits, mêmes liens internes remplacés par les équivalents NL), en utilisant OBLIGATOIREMENT ce vocabulaire :

| FR | NL (à utiliser) |
|---|---|
| portail / clôture / portillon | smeedijzeren poort / hekwerk / poortje |
| battant / coulissant | draaipoort / schuifpoort |
| garde-corps / rampe d'escalier | balustrade (ou borstwering) / trapleuning |
| verrière (d'atelier) / baie vitrée / jardin d'hiver | stalen binnenraam / stalen raam of pui / wintertuin |
| restauration de fonte / balustrade en fonte | restauratie van gietijzer / gietijzeren balustrade |
| galvanisation / thermolaquage / époxy | thermisch verzinken / poederlakken / epoxy |
| sur mesure / atelier / zéro sous-traitance | op maat / atelier / geen uitbesteding |
| devis gratuit sous 48 heures | gratis offerte binnen 48 uur |
| prime façade de la Ville de Bruxelles | gevelpremie van de Stad Brussel |

NL de qualité : phrases naturelles, pas de calque mot à mot. Le NL du site existant (i18n.js) sert de référence de ton. Liens internes des pages NL → versions NL (`/nl/...`) sauf `/portfolio` et `/#contact` (communs). Ancres de la vitrine : utiliser `/#contact` tel quel (la vitrine gère la langue via son toggle).

### SQUELETTE-SEO-NL : identique au SQUELETTE-SEO avec ces différences EXACTES

1. `<html lang="nl">`
2. Nav : `<a href="/" class="nav__back">←<span>&nbsp;Terug naar de startpagina</span></a>` et CTA `<a href="/#contact" class="nav__cta-pill">Gratis Offerte</a>`
3. Footer : `<span>← Terug naar de startpagina</span>`, bouton `<span>Gratis Offerte</span>`, et le lien légal devient `<a class="footer-link-btn" href="/nl/juridische-vermeldingen">Juridische vermeldingen</a>`
4. Les fichiers vivent dans le dossier `nl/` (créer le dossier) : URL `/nl/slug` ← fichier `nl/slug.html`

### Tâche 13 : Sélecteur de langue statique sur les pages SEO/légales

**Files:** Modify `src/styles/components/article.css` + les 7 pages FR existantes (5 SEO + 2 légales)

- [ ] **13.1** Dans `article.css`, ajouter à la fin :
```css
/* Sélecteur de langue statique (liens, pas de JS) sur les pages par-langue */
.nav--slim .lang-toggle__btn { text-decoration: none; }
```

- [ ] **13.2** Dans CHACUNE des 7 pages FR (`ferronnier-bruxelles.html`, `portail-fer-forge.html`, `garde-corps-fer-forge.html`, `verriere-sur-mesure.html`, `restauration-balustrade-fonte.html`, `mentions-legales.html`, `confidentialite.html`), ANCRE :
```html
    <div class="nav__actions">
```
REMPLACEMENT (en adaptant `%%NL-URL%%` selon la table de correspondance de la CARTE DES URLS en tête de plan) :
```html
    <div class="nav__actions">
      <div class="lang-toggle" role="group" aria-label="Langue / Taal">
        <a class="lang-toggle__btn is-active" href="#" aria-current="true">FR</a>
        <span class="lang-toggle__sep" aria-hidden="true"></span>
        <a class="lang-toggle__btn" href="%%NL-URL%%" hreflang="nl">NL</a>
      </div>
```
(Le lien FR actif pointe `#` : on est déjà dessus. Correspondances : ferronnier-bruxelles→/nl/smid-vlaams-brabant, portail-fer-forge→/nl/smeedijzeren-poort, garde-corps-fer-forge→/nl/smeedijzeren-balustrade, verriere-sur-mesure→/nl/serre-veranda-op-maat, restauration-balustrade-fonte→/nl/restauratie-gietijzeren-balustrade, mentions-legales→/nl/juridische-vermeldingen, confidentialite→/nl/privacybeleid.)

- [ ] **13.3** Build ✓ + commit :
```bash
git add -A
git commit -m "feat: static language switcher on per-language pages"
```

### Tâche 14 : Les 5 pages SEO NL

Pour chaque page : SQUELETTE-SEO-NL + `%%HEAD%%` fourni + page-hero fourni + corps = traduction du corps FR (règles ci-dessus) + le sélecteur de langue en miroir (NL actif `#`, FR → page FR). Bloc galerie : mêmes `data-seo-gallery` que la version FR. Ajouter chaque entrée à `rollupOptions.input`, build, vérifier `/nl/slug` en preview, committer.

- [ ] **14.1** `nl/smid-vlaams-brabant.html` (pilier NL, input `nlsmid: 'nl/smid-vlaams-brabant.html'`). HEAD :
```html
  <title>Smid in Vlaams-Brabant &amp; Brussel | Smeedwerk op maat | LRMJ Project</title>
  <meta name="description" content="Ambachtelijke smid in Opwijk, Vlaams-Brabant. Smeedijzeren poorten, balustrades, stalen ramen en restauratie van gietijzer, ontworpen en geplaatst door ons atelier. Gratis offerte binnen 48 uur." />
  <link rel="canonical" href="https://lrmjproject.be/nl/smid-vlaams-brabant" />
  <meta property="og:title" content="Smid in Vlaams-Brabant &amp; Brussel | LRMJ Project" />
  <meta property="og:description" content="Smeedwerk op maat: poorten, balustrades, stalen ramen, restauratie van gietijzer. Eén atelier, geen uitbesteding." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/nl/smid-vlaams-brabant" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```
Page-hero :
```html
      <span class="eyebrow">Siersmederij · Sinds 2011</span>
      <h1 class="h-large">Smid in <em>Vlaams-Brabant</em></h1>
      <p class="lead">Eén atelier, één ambachtsman, één woord. LRMJ Project ontwerpt, smeedt en plaatst smeedwerk op maat, vanuit Opwijk, voor woningen in Vlaams-Brabant en Brussel.</p>
```
Corps : traduire les sections du pilier FR avec CET angle local inversé : l'atelier EST à Opwijk (insister : "ons atelier in Opwijk"), zone = Opwijk, Asse, Merchtem, Dilbeek, Wemmel, Grimbergen, Vilvoorde, Zaventem en omgeving, plus les 19 gemeenten van Brussel. H2 suggérés : "Een smidse in het hart van Vlaams-Brabant" / "Wat wij <em>smeden</em>" (liste → liens NL) / "Onze manier van werken" / "Vlaams-Brabant en Brussel". FAQ : mêmes 4 questions traduites. CTA : "Laten we over uw project praten" / "Plaatsbezoek, opmeting en gedetailleerde offerte, gratis en vrijblijvend. Antwoord binnen 48 uur." Commit :
```bash
git add nl/smid-vlaams-brabant.html vite.config.js
git commit -m "feat: nl landing page smid vlaams-brabant"
```

- [ ] **14.2** `nl/smeedijzeren-poort.html` (input `nlpoort`). HEAD :
```html
  <title>Smeedijzeren poort op maat | Vlaams-Brabant &amp; Brussel | LRMJ Project</title>
  <meta name="description" content="Smeedijzeren poorten en hekwerk op maat, draai- of schuifpoort. Gesmeed in ons atelier, thermisch verzinkt of gepoederlakt, plaatsing inbegrepen. Gratis offerte binnen 48 uur." />
  <link rel="canonical" href="https://lrmjproject.be/nl/smeedijzeren-poort" />
  <meta property="og:title" content="Smeedijzeren poort op maat | LRMJ Project" />
  <meta property="og:description" content="Monumentale toegangen of elegante omheiningen, ontworpen en gesmeed voor uw eigendom. Ambachtelijk atelier in Opwijk." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/nl/smeedijzeren-poort" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```
Page-hero : eyebrow "Handtekening van het atelier", H1 `Smeedijzeren <em>poorten</em> en hekwerk`, lead sur le ton FR. Corps : traduction des 3 sections FR + FAQ (prijs? draai- of schuifpoort? motorisering? bijpassend hekwerk?). Commit `feat: nl landing page smeedijzeren poort`.

- [ ] **14.3** `nl/smeedijzeren-balustrade.html` (input `nlbalustrade`). HEAD :
```html
  <title>Smeedijzeren balustrade &amp; trapleuning | LRMJ Project</title>
  <meta name="description" content="Balustrades en trapleuningen in smeedijzer, op maat voor trappen, balkons, mezzanines en terrassen. Veilig en elegant, ambachtelijk gemaakt. Gratis offerte binnen 48 uur." />
  <link rel="canonical" href="https://lrmjproject.be/nl/smeedijzeren-balustrade" />
  <meta property="og:title" content="Smeedijzeren balustrades op maat | LRMJ Project" />
  <meta property="og:description" content="Trappen, balkons, mezzanines, terrassen: gesmede balustrades die beveiligen zonder te verzwaren." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/nl/smeedijzeren-balustrade" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```
Page-hero : eyebrow "Binnen &amp; buiten", H1 `Balustrades en trapleuningen in <em>smeedijzer</em>`. Corps : traduction FR (sécurité : "volgens de geldende Belgische normen", sans chiffres) + FAQ. Lien restauration → `/nl/restauratie-gietijzeren-balustrade`. Commit `feat: nl landing page smeedijzeren balustrade`.

- [ ] **14.4** `nl/serre-veranda-op-maat.html` (input `nlserre`). HEAD :
```html
  <title>Stalen binnenraam &amp; serre op maat | LRMJ Project</title>
  <meta name="description" content="Stalen binnenramen, glaswanden en wintertuinen op maat: fijne stalen profielen, ambachtelijk gesmeed en geplaatst. Vlaams-Brabant en Brussel. Gratis offerte binnen 48 uur." />
  <link rel="canonical" href="https://lrmjproject.be/nl/serre-veranda-op-maat" />
  <meta property="og:title" content="Stalen binnenramen en serres op maat | LRMJ Project" />
  <meta property="og:description" content="Licht binnenlaten zonder karakter te verliezen: glaswanden, stalen puien en wintertuinen op maat." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/nl/serre-veranda-op-maat" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```
Page-hero : eyebrow "Tuin &amp; uitbreiding", H1 `Stalen binnenramen en serres <em>op maat</em>`. Corps : traduction FR + FAQ (prijs? beglazing? deur integreren?). Commit `feat: nl landing page serre veranda op maat`.

- [ ] **14.5** `nl/restauratie-gietijzeren-balustrade.html` (input `nlrestauratie`, PAS de bloc galerie). HEAD :
```html
  <title>Restauratie gietijzeren balustrades | Brussel | LRMJ Project</title>
  <meta name="description" content="Restauratie van gietijzeren balustrades, balkons en leuningen: ontlakken, gespecialiseerd lassen, ontbrekende onderdelen, roestbehandeling. Gevelpremie tot 14 000 euro in Brussel." />
  <link rel="canonical" href="https://lrmjproject.be/nl/restauratie-gietijzeren-balustrade" />
  <meta property="og:title" content="Restauratie van gietijzeren balustrades | LRMJ Project" />
  <meta property="og:description" content="Een zeldzame specialiteit ten dienste van het Brusselse erfgoed. De Stad Brussel betaalt 40 tot 60% van de gevelwerken terug." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lrmjproject.be/nl/restauratie-gietijzeren-balustrade" />
  <meta property="og:image" content="https://res.cloudinary.com/dbugcatig/image/upload/f_auto,q_auto,c_fill,g_auto,w_1200,h_630/LRMJ_PROJECT_LOGO_xzm1yq.png" />
```
Page-hero : eyebrow "Zeldzame specialiteit · Erfgoed", H1 `Restauratie van gietijzeren <em>balustrades</em>`. Corps : traduction FR (prime : "40 tot 60 procent", "tot 14 000 euro per dossier", lien bruxelles.be identique) + FAQ. Commit `feat: nl landing page restauratie gietijzer`.

### Tâche 15 : Pages légales NL

**Files:** Create `nl/juridische-vermeldingen.html`, Create `nl/privacybeleid.html`, Modify `vite.config.js` (inputs `nljuridisch`, `nlprivacy`)

- [ ] **15.1** `nl/juridische-vermeldingen.html` : SQUELETTE-SEO-NL, HEAD :
```html
  <title>Juridische vermeldingen | LRMJ Project</title>
  <meta name="description" content="Juridische vermeldingen van lrmjproject.be: uitgever, hosting, intellectuele eigendom. L.R.M.J Project SRL, Opwijk, België." />
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="https://lrmjproject.be/nl/juridische-vermeldingen" />
```
Page-hero : eyebrow "Juridisch", H1 `Juridische <em>vermeldingen</em>`. Corps (traduction complète, la fournir telle quelle) :
```html
        <h2>Uitgever van de site</h2>
        <p>
          <strong>L.R.M.J Project SRL</strong><br>
          Broekstraat 26, 1745 Opwijk, België<br>
          Telefoon : <a href="tel:0475399909">+32 475 39 99 09</a><br>
          E-mail : <a href="mailto:contact@lrmjproject.be">contact@lrmjproject.be</a>
        </p>
        <p>
          Ondernemingsnummer (KBO) : <strong>BE 0839.975.656</strong><br>
          Btw-nummer : <strong>BE 0839.975.656</strong><br>
          Rechtsvorm : Besloten vennootschap (BV / SRL)
        </p>
        <h2>Verantwoordelijke uitgever</h2>
        <p>Romeo Lesac, bestuurder van L.R.M.J Project SRL.</p>
        <h2>Hosting</h2>
        <p>De site wordt gehost door <strong>Cloudflare Pages</strong> (Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, VS). De media (foto's, video's) worden verdeeld via <strong>Cloudinary</strong> (Cloudinary Ltd., Petah Tikva, Israël).</p>
        <h2>Intellectuele eigendom</h2>
        <p>De volledige site (teksten, foto's, logo, huisstijl) is de exclusieve eigendom van LRMJ Project, tenzij anders vermeld. Elke reproductie, zelfs gedeeltelijk, zonder voorafgaande schriftelijke toestemming is verboden.</p>
        <h2>Beperking van aansprakelijkheid</h2>
        <p>De informatie op deze site is louter indicatief. LRMJ Project kan niet aansprakelijk worden gesteld voor eventuele fouten of weglatingen. De visuals en beschrijvingen van realisaties zijn eigen aan elk project en vormen geen contractuele verbintenis.</p>
        <h2>Geschillen</h2>
        <p>Deze site valt onder het Belgische recht. Bij geschillen zijn uitsluitend de Belgische rechtbanken bevoegd.</p>
        <div class="article__related">
          <p>Zie ook</p>
          <ul>
            <li><a href="/nl/privacybeleid">Privacybeleid</a></li>
            <li><a href="/">Terug naar de startpagina</a></li>
          </ul>
        </div>
```
Commit `feat: nl legal page juridische vermeldingen`.

- [ ] **15.2** `nl/privacybeleid.html` : HEAD (title "Privacybeleid | LRMJ Project", description "Privacybeleid van lrmjproject.be: verzamelde gegevens via het contactformulier, enkel functionele cookies, uw AVG-rechten.", robots noindex, canonical `/nl/privacybeleid`). Page-hero : eyebrow "Juridisch", H1 `Privacy<em>beleid</em>`. Corps : traduction fidèle de `confidentialite.html` section par section (Verzamelde persoonsgegevens / Bewaring / Delen met derden / Gebruikte cookies (+ la phrase Cloudflare Web Analytics : "anonieme bezoekersstatistieken zonder cookies") / Uw rechten (AVG) / Toezichthoudende autoriteit → <a href="https://www.gegevensbeschermingsautoriteit.be" rel="noopener">gegevensbeschermingsautoriteit.be</a>). Related → juridische vermeldingen + startpagina. Commit `feat: nl legal page privacybeleid`.

- [ ] **15.3** Mettre à jour le lien légal du footer des 5 pages SEO NL si pas déjà fait (SQUELETTE-SEO-NL point 3) et le sélecteur de langue des 2 pages légales FR (Tâche 13 déjà faite : vérifier que les cibles NL existent maintenant).

### Tâche 16 : Paires hreflang sur les 10 pages SEO

Les pages légales sont noindex : PAS de hreflang dessus (inutile). Uniquement les 5 paires SEO.

- [ ] **16.1** Dans chaque page FR, insérer juste APRÈS sa ligne `<link rel="canonical" ...>` :
```html
  <link rel="alternate" hreflang="fr-BE" href="https://lrmjproject.be/%%SLUG-FR%%" />
  <link rel="alternate" hreflang="nl-BE" href="https://lrmjproject.be/nl/%%SLUG-NL%%" />
  <link rel="alternate" hreflang="x-default" href="https://lrmjproject.be/%%SLUG-FR%%" />
```
- [ ] **16.2** Dans chaque page NL, idem avec les MÊMES trois URLs absolues que sa jumelle FR (fr-BE → page FR, nl-BE → page NL elle-même, x-default → page FR). Les 5 paires sont dans la CARTE DES URLS. Vérification : les deux pages d'une paire portent des blocs hreflang IDENTIQUES (c'est le critère de validité).
- [ ] **16.3** Build ✓ + commit :
```bash
git add -A
git commit -m "feat: hreflang pairs on seo landing pages"
```

### Tâche 17 : Sitemap v4 (final) + QA de phase + push

- [ ] **17.1** Réécrire `public/sitemap.xml` :
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://lrmjproject.be/</loc></url>
  <url><loc>https://lrmjproject.be/portfolio</loc></url>
  <url><loc>https://lrmjproject.be/ferronnier-bruxelles</loc></url>
  <url><loc>https://lrmjproject.be/portail-fer-forge</loc></url>
  <url><loc>https://lrmjproject.be/garde-corps-fer-forge</loc></url>
  <url><loc>https://lrmjproject.be/verriere-sur-mesure</loc></url>
  <url><loc>https://lrmjproject.be/restauration-balustrade-fonte</loc></url>
  <url><loc>https://lrmjproject.be/nl/smid-vlaams-brabant</loc></url>
  <url><loc>https://lrmjproject.be/nl/smeedijzeren-poort</loc></url>
  <url><loc>https://lrmjproject.be/nl/smeedijzeren-balustrade</loc></url>
  <url><loc>https://lrmjproject.be/nl/serre-veranda-op-maat</loc></url>
  <url><loc>https://lrmjproject.be/nl/restauratie-gietijzeren-balustrade</loc></url>
</urlset>
```
- [ ] **17.2** QA de phase : build ✓ (compte attendu dans dist : 16 pages HTML). Preview : chaque URL de la carte charge ; sélecteurs de langue croisés FR↔NL fonctionnels dans les deux sens sur les 5 paires + 2 paires légales ; light/dark sur 2 pages NL ; mobile 375 sur le pilier NL ; console sans erreur (warns Cloudinary OK). Grep de contrôle : `—` absent de tous les nouveaux fichiers HTML ; chaque page NL contient "Gratis" et pas "Gratuit" dans nav/footer.
- [ ] **17.3** Commit + push :
```bash
git add -A
git commit -m "feat: sitemap v4 with nl pages"
git push
```

---

## PHASE 4 : MISE EN LIGNE SEO (checklist utilisateur, aucun code)

Pré-requis : le domaine `lrmjproject.be` est actif sur Cloudflare et raccordé au projet Pages (plan DNS séparé). Tout ce qui suit se fait dans un navigateur.

- [ ] **18.1 Search Console** : https://search.google.com/search-console → Ajouter une propriété → type **Domaine** → `lrmjproject.be`. La validation demande un enregistrement TXT DNS : si les nameservers sont chez Cloudflare, ajouter le TXT dans Cloudflare DNS (2 min, propagation quasi immédiate). GSC valide → propriété active.
- [ ] **18.2 Soumettre le sitemap** : GSC → Sitemaps → saisir `sitemap.xml` → Envoyer. Statut "Opération réussie" attendu sous quelques heures.
- [ ] **18.3 Inspection d'URL** : inspecter et « Demander une indexation » pour, dans l'ordre : `https://lrmjproject.be/`, `/ferronnier-bruxelles`, `/nl/smid-vlaams-brabant`, `/restauration-balustrade-fonte`. Les autres suivront via le sitemap.
- [ ] **18.4 Analytics** : vérifier que Cloudflare Web Analytics (Tâche 6) affiche des visites.
- [ ] **18.5 (Optionnel) Bing** : https://www.bing.com/webmasters → « Importer depuis Google Search Console » (2 clics, couvre Bing + Copilot).
- [ ] **18.6 Suivi** : au bout de 7 à 14 jours, GSC → Pages : vérifier que les 12 URLs du sitemap passent en « Indexée ». Les requêtes locales (« ferronnier bruxelles », « smeedijzeren poort ») mettent plusieurs semaines à se positionner : c'est normal.

---

## ANNEXE A : matrice hreflang (référence Tâche 16)

| Paire | fr-BE (= x-default) | nl-BE |
|---|---|---|
| Pilier | /ferronnier-bruxelles | /nl/smid-vlaams-brabant |
| Portails | /portail-fer-forge | /nl/smeedijzeren-poort |
| Garde-corps | /garde-corps-fer-forge | /nl/smeedijzeren-balustrade |
| Verrières | /verriere-sur-mesure | /nl/serre-veranda-op-maat |
| Restauration | /restauration-balustrade-fonte | /nl/restauratie-gietijzeren-balustrade |

Toutes les URLs en absolu `https://lrmjproject.be/...` dans les balises. Pages légales : noindex, pas de hreflang, pas de sitemap.

## ANNEXE B : ce que ce plan ne fait PAS

- Pas de version NL de la vitrine ni du portfolio (compromis verrouillé : toggle JS conservé).
- Pas de schema Service/FAQPage/AggregateRating ; le LocalBusiness existant sur `/` reste inchangé.
- Pas de blog, pas de pages marquises/escaliers/meubles (extension future possible sur le même squelette).
- Pas de refonte du formulaire, ni des sections vitrine.
- Pas de `git push origin HEAD:main` sans accord explicite de l'utilisateur, comme d'habitude.

## HANDOFF

Fin de plan : annoncer les phases faites, l'URL de preview de branche, rappeler que la Phase 4 est manuelle (dashboard), et demander le merge vers `main`. La Phase 4 n'a de sens qu'APRÈS le raccordement du domaine (plan DNS séparé, en cours côté utilisateur).
