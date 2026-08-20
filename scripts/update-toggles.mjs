/**
 * Met à jour, sur les pages FR/NL déjà écrites à la main (pas générées),
 * le sélecteur de langue (2 -> 3 entrées) et le jeu de hreflang (3 -> 4,
 * avec EN) suite à l'ajout de la version anglaise du site.
 *
 *   node scripts/update-toggles.mjs
 *
 * Ne touche à rien d'autre : ni le contenu, ni les meta, ni le JSON-LD.
 * Idempotent — peut être relancé sans effet si déjà à jour.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, PAGE_GROUPS, fileForPath } from './page-map.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANG_NAME = { fr: 'FR', nl: 'NL', en: 'EN' };
const HREFLANG  = { fr: 'fr-BE', nl: 'nl-BE', en: 'en' };

function langToggleBlock(group, active) {
  const btn = (lang) => lang === active
    ? `<a class="lang-toggle__btn is-active" href="#" aria-current="true">${LANG_NAME[lang]}</a>`
    : `<a class="lang-toggle__btn" href="${group[lang]}" hreflang="${lang}">${LANG_NAME[lang]}</a>`;
  return ['fr', 'nl', 'en'].map(btn).join('\n        <span class="lang-toggle__sep" aria-hidden="true"></span>\n        ');
}

// index.html / portfolio.html (FR) sont hand-authored : à mettre à jour ici.
// Leurs pendants NL/EN sont entièrement générés par gen-i18n.mjs — on ne
// touche pas nl/index.html ni nl/portfolio.html, ils seraient de toute façon
// écrasés au prochain build.
let failed = false;
for (const group of PAGE_GROUPS) {
  const langs = ['home', 'portfolio'].includes(group.key) ? ['fr'] : ['fr', 'nl'];
  for (const lang of langs) {
    const rel = fileForPath(group[lang]);
    const filePath = path.join(ROOT, rel);
    if (!fs.existsSync(filePath)) { console.error(`  ! ${rel} introuvable`); failed = true; continue; }
    let html = fs.readFileSync(filePath, 'utf8');
    const before = html;

    html = html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>/g, '');
    const alts = ['fr', 'nl', 'en']
      .map(l => `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${BASE}${group[l]}" />`)
      .join('\n  ');
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${BASE}${group[lang]}" />\n  ${alts}\n  <link rel="alternate" hreflang="x-default" href="${BASE}${group.fr}" />`
    );

    // Deux conteneurs possibles : la barre de nav (.lang-toggle) et le menu
    // mobile plein écran (.nav__mobile-lang) — les deux à convertir.
    html = html.replace(
      /<div class="(lang-toggle|nav__mobile-lang)"[^>]*>[\s\S]*?<\/div>/g,
      (full, cls) => `<div class="${cls}" role="group" aria-label="Language">\n        ${langToggleBlock(group, lang)}\n      </div>`
    );

    const hrefLangs = (html.match(/rel="alternate" hreflang=/g) || []).length;
    // 3 boutons par sélecteur ; certaines pages (index.html) ont deux
    // sélecteurs — barre de nav + menu mobile plein écran.
    const containers = (html.match(/class="(?:lang-toggle|nav__mobile-lang)"/g) || []).length;
    const btnCount = (html.match(/lang-toggle__btn/g) || []).length;
    if (hrefLangs !== 4 || btnCount !== containers * 3) {
      console.error(`  ! ${rel}: hreflang=${hrefLangs} (4 attendus), boutons=${btnCount} (${containers * 3} attendus pour ${containers} sélecteur(s))`);
      failed = true;
    }

    if (html !== before) {
      fs.writeFileSync(filePath, html);
      console.log(`${rel}: mis à jour`);
    } else {
      console.log(`${rel}: déjà à jour`);
    }
  }
}

if (failed) process.exit(1);
