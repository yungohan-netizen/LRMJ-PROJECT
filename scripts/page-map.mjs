/**
 * Table de correspondance des URLs par langue, une entrée par "groupe de page"
 * (même contenu, trois langues). Source de vérité unique pour :
 *   - le générateur de pages NL/EN (gen-i18n.mjs)
 *   - la mise à jour des sélecteurs de langue sur les pages FR/NL existantes
 *     (update-toggles.mjs)
 *   - la génération du sitemap
 */
export const BASE = 'https://lrmj-project.be';

export const PAGE_GROUPS = [
  { key: 'home',        fr: '/',                                 nl: '/nl/',                                     en: '/en/' },
  { key: 'portfolio',   fr: '/portfolio',                         nl: '/nl/portfolio',                           en: '/en/portfolio' },
  { key: 'ferronnier',  fr: '/ferronnier-bruxelles',               nl: '/nl/smid-brussel',                 en: '/en/blacksmith-brussels' },
  { key: 'portail',     fr: '/portail-fer-forge',                  nl: '/nl/smeedijzeren-poort',                  en: '/en/wrought-iron-gate' },
  { key: 'gardecorps',  fr: '/garde-corps-fer-forge',               nl: '/nl/smeedijzeren-balustrade',             en: '/en/wrought-iron-railing' },
  { key: 'verriere',    fr: '/verriere-sur-mesure',                 nl: '/nl/serre-veranda-op-maat',               en: '/en/steel-windows-brussels' },
  { key: 'restauration',fr: '/restauration-balustrade-fonte',       nl: '/nl/restauratie-gietijzeren-balustrade',  en: '/en/cast-iron-balustrade-restoration' },
  { key: 'prix',        fr: '/prix-portail-fer-forge',            nl: '/nl/prijs-smeedijzeren-poort',     en: '/en/wrought-iron-gate-cost' },
  { key: 'prime',       fr: '/prime-facade-bruxelles',              nl: '/nl/gevelpremie-brussel',                 en: '/en/brussels-facade-grant' },
  { key: 'mentions',    fr: '/mentions-legales',                    nl: '/nl/juridische-vermeldingen',             en: '/en/legal-notice' },
  { key: 'confidentialite', fr: '/confidentialite',                 nl: '/nl/privacybeleid',                       en: '/en/privacy-policy' },
];

/** Chemin -> groupe, pour retrouver rapidement les 3 variantes d'une page. */
export const BY_PATH = new Map();
for (const g of PAGE_GROUPS) {
  BY_PATH.set(g.fr, g);
  BY_PATH.set(g.nl, g);
  BY_PATH.set(g.en, g);
}

/** Fichier disque relatif à la racine du projet, pour un chemin donné. */
export function fileForPath(p) {
  if (p === '/') return 'index.html';
  if (p === '/nl/') return 'nl/index.html';
  if (p === '/en/') return 'en/index.html';
  return p.replace(/^\//, '') + '.html';
}
