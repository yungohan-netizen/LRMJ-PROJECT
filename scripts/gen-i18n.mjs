/**
 * Génère les pages NL et EN de l'accueil et du portfolio à partir des pages FR.
 *
 *   node scripts/gen-i18n.mjs
 *
 * Source de vérité = index.html / portfolio.html + les tables NL/EN de
 * src/js/i18n.js + la carte des URLs de scripts/page-map.mjs.
 * À relancer après toute modification de ces deux pages, puis commiter
 * le résultat (npm run build le fait automatiquement).
 *
 * Une URL = une langue : le HTML est rendu en dur dans chaque langue pour
 * que Google indexe les trois séparément, et les sélecteurs de langue
 * naviguent au lieu de basculer sur place.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BASE, PAGE_GROUPS, fileForPath } from './page-map.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { translations } = await import(pathToFileURL(path.join(ROOT, 'src/js/i18n.js')).href);

const LANG_NAME = { fr: 'FR', nl: 'NL', en: 'EN' };
const LOCALE    = { fr: 'fr_BE', nl: 'nl_BE', en: 'en_US' };
const HREFLANG  = { fr: 'fr-BE', nl: 'nl-BE', en: 'en' };

/** Chaînes en dur (alt, aria-label, JSON-LD) : pas de clé i18n, traduites ici.
 *  Une entrée non trouvée dans la page est signalée, pour ne pas laisser
 *  filer du français après une refonte du HTML source. */
const LITERALS = {
  nl: {
    'Verrière et baie vitrée': 'Stalen raam en glaswand',
    'Portail en fer forgé': 'Smeedijzeren poort',
    'Garde-corps en fer forgé': 'Smeedijzeren balustrade',
    'Marquise en fer forgé': 'Smeedijzeren luifel',
    'Escalier en acier et bois': 'Trap in staal en hout',
    'Meuble déco en fer forgé': 'Decoratief meubel in smeedijzer',
    'Artisan ferronnier au travail': 'Ambachtelijke smid aan het werk',
    'Balustrade en fonte ancienne encrassée et oxydée, déposée avant restauration':
      'Oude gietijzeren balustrade, vervuild en geroest, gedemonteerd vóór restauratie',
    'La même balustrade en fonte restaurée, traitée anticorrosion et reposée en façade':
      'Dezelfde gietijzeren balustrade, gerestaureerd, roestwerend behandeld en teruggeplaatst in de gevel',
    'Deux garde-corps de balcon en fer forgé à volutes sur une façade en brique à Bruxelles':
      'Twee smeedijzeren balkonleuningen met krullen op een bakstenen gevel in Brussel',
    'Garde-corps de balcon en fer forgé à volutes restauré, vu depuis le balcon':
      'Gerestaureerde smeedijzeren balkonleuning met krullen, gezien vanaf het balkon',
    'Ville de Bruxelles': 'Stad Brussel',
    'geo.placename" content="Bruxelles"': 'geo.placename" content="Brussel"',
    // Adresse structuree et zones desservies : noms localises, sinon la page NL
    // declare une adresse et un pays en francais.
    '"addressLocality": "Schaerbeek"': '"addressLocality": "Schaarbeek"',
    '"addressRegion": "Bruxelles-Capitale"': '"addressRegion": "Brussels Hoofdstedelijk Gewest"',
    '{ "@type": "City", "name": "Bruxelles" }': '{ "@type": "City", "name": "Brussel" }',
    '{ "@type": "Country", "name": "Belgique" }': '{ "@type": "Country", "name": "België" }',
    'LRMJ Project | Accueil': 'LRMJ Project | Home',
    'LRMJ Project | Ferronnerie artisanale': 'LRMJ Project | Ambachtelijke smederij',
    'Basculer entre mode clair et sombre': 'Wisselen tussen lichte en donkere modus',
    'Galerie des réalisations': 'Galerij van realisaties',
    'Aperçu de la réalisation': 'Voorbeeld van de realisatie',
    'Ouvrir l’aperçu': 'Voorbeeld openen',
    'Appeler': 'Bellen',
    'Fermer': 'Sluiten',
    'Précédent': 'Vorige',
    'Suivant': 'Volgende',
    'Menu': 'Menu',
    '5 étoiles': '5 sterren',
    'Langue / Taal': 'Taal / Langue',
    'Artisan ferronnier spécialisé en création sur mesure : portails, garde-corps, clôtures, serres, marquises en fer forgé.':
      'Ambachtelijke smid gespecialiseerd in maatwerk: smeedijzeren poorten, balustrades, omheiningen, serres en luifels.',
    'LRMJ Project | Artisan ferronnier': 'LRMJ Project | Ambachtelijke smid',
  },
  en: {
    'Verrière et baie vitrée': 'Glass partition and window',
    'Portail en fer forgé': 'Wrought-iron gate',
    'Garde-corps en fer forgé': 'Wrought-iron railing',
    'Marquise en fer forgé': 'Wrought-iron canopy',
    'Escalier en acier et bois': 'Steel and wood staircase',
    'Meuble déco en fer forgé': 'Decorative wrought-iron furniture piece',
    'Artisan ferronnier au travail': 'Blacksmith at work',
    'Balustrade en fonte ancienne encrassée et oxydée, déposée avant restauration':
      'Antique cast-iron balustrade, grimy and rusted, removed before restoration',
    'La même balustrade en fonte restaurée, traitée anticorrosion et reposée en façade':
      'The same cast-iron balustrade, restored, rust-treated and reinstalled on the façade',
    'Deux garde-corps de balcon en fer forgé à volutes sur une façade en brique à Bruxelles':
      'Two scrolled wrought-iron balcony railings on a brick façade in Brussels',
    'Garde-corps de balcon en fer forgé à volutes restauré, vu depuis le balcon':
      'Restored scrolled wrought-iron balcony railing, seen from the balcony',
    'Ville de Bruxelles': 'City of Brussels',
    'geo.placename" content="Bruxelles"': 'geo.placename" content="Brussels"',
    // Adresse structuree et zones desservies : noms localises, sinon la page EN
    // declare une adresse et un pays en francais.
    '"addressRegion": "Bruxelles-Capitale"': '"addressRegion": "Brussels-Capital"',
    '{ "@type": "City", "name": "Bruxelles" }': '{ "@type": "City", "name": "Brussels" }',
    '{ "@type": "Country", "name": "Belgique" }': '{ "@type": "Country", "name": "Belgium" }',
    'LRMJ Project | Accueil': 'LRMJ Project | Home',
    'LRMJ Project | Ferronnerie artisanale': 'LRMJ Project | Artisan Ironwork',
    'Basculer entre mode clair et sombre': 'Toggle light and dark mode',
    'Galerie des réalisations': 'Project gallery',
    'Aperçu de la réalisation': 'Project preview',
    'Ouvrir l’aperçu': 'Open preview',
    'Appeler': 'Call',
    'Fermer': 'Close',
    'Précédent': 'Previous',
    'Suivant': 'Next',
    'Menu': 'Menu',
    '5 étoiles': '5 stars',
    'Langue / Taal': 'Language',
    'Artisan ferronnier spécialisé en création sur mesure : portails, garde-corps, clôtures, serres, marquises en fer forgé.':
      'Blacksmith specialised in custom ironwork: gates, railings, fencing, glass partitions and canopies.',
    'LRMJ Project | Artisan ferronnier': 'LRMJ Project | Blacksmith',
  },
};

/** Métadonnées propres à chaque page traduite (title/desc calibrés SEO, OG). */
const META = {
  nl: {
    home: {
      title: 'Smeedijzer op maat | Poorten &amp; leuningen | LRMJ Project',
      desc: 'Ambachtelijke smederij in Brussel: smeedijzeren poorten, balustrades, stalen ramen en luifels op maat. Gratis offerte binnen 48 uur.',
      ogTitle: 'LRMJ Project | Smeedwerk op maat',
      ogDesc: 'Poorten, balustrades, serres, luifels. Atelier in België.',
    },
    portfolio: {
      title: 'Realisaties in smeedijzer | Portfolio | LRMJ Project',
      desc: 'Onze realisaties in smeedijzer: poorten, balustrades, stalen ramen, luifels en trappen. Ontworpen en geplaatst door ons atelier.',
      ogTitle: 'Realisaties in smeedijzer | LRMJ Project',
      ogDesc: 'Poorten, balustrades, stalen ramen, luifels, trappen. Elk stuk ontworpen en gemaakt in ons atelier.',
    },
  },
  en: {
    home: {
      title: 'Custom Ironwork | Gates &amp; Railings Brussels | LRMJ Project',
      desc: 'Artisan blacksmith serving Brussels: custom wrought-iron gates, railings, steel windows and canopies. Free quote within 48 hours.',
      ogTitle: 'LRMJ Project | Custom Ironwork, Brussels',
      ogDesc: 'Gates, railings, glass partitions, canopies. Workshop based in Belgium.',
    },
    portfolio: {
      title: 'Wrought-Iron Projects | Portfolio | LRMJ Project',
      desc: 'Our wrought-iron projects: gates, railings, steel windows, canopies and staircases. Designed and installed by our own workshop.',
      ogTitle: 'Wrought-Iron Projects | LRMJ Project',
      ogDesc: 'Gates, railings, steel windows, canopies, staircases. Every piece designed and made in our workshop.',
    },
  },
};

const GROUP_BY_KEY = Object.fromEntries(PAGE_GROUPS.map(g => [g.key, g]));

const SOURCES = [
  { key: 'home', src: 'index.html' },
  { key: 'portfolio', src: 'portfolio.html' },
];

/** Fin de l'élément ouvert en `openEnd`, en tenant compte des imbrications de même nom. */
function findClose(html, tag, openEnd) {
  const re = new RegExp(`<${tag}(\\s|>|/)|</${tag}>`, 'gi');
  re.lastIndex = openEnd;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    if (m[0].toLowerCase().startsWith(`</${tag}`)) {
      if (--depth === 0) return { start: m.index, end: re.lastIndex };
    } else depth++;
  }
  throw new Error(`Balise </${tag}> introuvable`);
}

const VOID = new Set(['input', 'img', 'br', 'hr', 'meta', 'link', 'source']);

/** Remplace le contenu (ou le placeholder) de chaque [data-i18n] par sa traduction. */
function translate(html, dict, stats) {
  const re = /<([a-zA-Z0-9]+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>/g;
  let out = '', last = 0, m;
  while ((m = re.exec(html))) {
    const [openTag, tag, key] = m;
    const val = dict[key];
    if (val === undefined) { stats.missing.add(key); continue; }
    const text = val.replace('{year}', String(new Date().getFullYear()));

    out += html.slice(last, m.index);

    if (VOID.has(tag.toLowerCase())) {
      out += openTag.replace(/placeholder="[^"]*"/, `placeholder="${text.replace(/"/g, '&quot;')}"`);
      last = m.index + openTag.length;
    } else if (tag.toLowerCase() === 'textarea') {
      const close = findClose(html, tag, m.index + openTag.length);
      out += openTag.replace(/placeholder="[^"]*"/, `placeholder="${text.replace(/"/g, '&quot;')}"`);
      out += html.slice(m.index + openTag.length, close.start) + `</${tag}>`;
      last = close.end;
    } else {
      const close = findClose(html, tag, m.index + openTag.length);
      out += openTag + text + `</${tag}>`;
      last = close.end;
      re.lastIndex = close.end;
    }
    stats.count++;
  }
  return out + html.slice(last);
}

/** aria-label depuis [data-i18n-label]. */
function translateLabels(html, dict, stats) {
  return html.replace(/<([a-zA-Z0-9]+)\b([^>]*\sdata-i18n-label="([^"]+)"[^>]*)>/g, (full, tag, attrs, key) => {
    const val = dict[key];
    if (val === undefined) { stats.missing.add(key); return full; }
    stats.labels++;
    const esc = val.replace(/"/g, '&quot;');
    return attrs.includes('aria-label="')
      ? `<${tag}${attrs.replace(/aria-label="[^"]*"/, `aria-label="${esc}"`)}>`
      : `<${tag}${attrs} aria-label="${esc}">`;
  });
}

/** Bloc sélecteur de langue à 3 entrées, `active` en avant. */
function langToggleBlock(group, active) {
  const others = ['fr', 'nl', 'en'].filter(l => l !== active);
  const btn = (lang) => lang === active
    ? `<a class="lang-toggle__btn is-active" data-lang="${lang}" href="#" aria-current="true">${LANG_NAME[lang]}</a>`
    : `<a class="lang-toggle__btn" data-lang="${lang}" href="${group[lang]}" hreflang="${lang}">${LANG_NAME[lang]}</a>`;
  return ['fr', 'nl', 'en'].map(btn).join('\n        <span class="lang-toggle__sep" aria-hidden="true"></span>\n        ');
}

let failed = false;

for (const { key, src } of SOURCES) {
  const group = GROUP_BY_KEY[key];
  const srcPath = path.join(ROOT, src);
  const rawFr = fs.readFileSync(srcPath, 'utf8');

  for (const lang of ['nl', 'en']) {
    const dict = translations[lang];
    const meta = META[lang][key];
    const outRel = fileForPath(group[lang]);
    const stats = { count: 0, labels: 0, missing: new Set() };

    let html = translate(rawFr, dict, stats);
    html = translateLabels(html, dict, stats);

    html = html.replace(/<html lang="fr">/, `<html lang="${lang}">`);

    // Liens internes FR -> langue cible, via la table centrale
    html = html.replace(/href="(\/[^"#]*)((?:#[^"]*)?)"/g, (full, p1, hash) => {
      const g = PAGE_GROUPS.find(g => g.fr === p1);
      return g ? `href="${g[lang]}${hash}"` : full;
    });

    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`);
    html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${meta.desc}$2`);
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${meta.ogTitle}$2`);
    html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${meta.ogDesc}$2`);
    html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${meta.ogTitle}$2`);
    html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${meta.ogDesc}$2`);
    html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${BASE}${group[lang]}$2`);
    html = html.replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1${LOCALE[lang]}$2`);

    // La page FR porte ses propres hreflang : on les retire avant de réinjecter
    // le jeu à 3 entrées, sinon la page cible en hérite en double.
    html = html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*" \/>/g, '');
    const alts = ['fr', 'nl', 'en']
      .map(l => `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${BASE}${group[l]}" />`)
      .join('\n  ');
    html = html.replace(
      /<link rel="canonical" href="[^"]*" \/>/,
      `<link rel="canonical" href="${BASE}${group[lang]}" />\n  ${alts}\n  <link rel="alternate" hreflang="x-default" href="${BASE}${group.fr}" />`
    );

    // Chaînes en dur (alt, aria-label, JSON-LD) : traduction littérale
    for (const [fr, tr] of Object.entries(LITERALS[lang])) {
      if (html.includes(fr)) html = html.split(fr).join(tr);
    }

    // Sélecteur de langue : 3 entrées, celle de la page active.
    // Deux conteneurs possibles : la barre de nav (.lang-toggle) et le menu
    // mobile plein écran (.nav__mobile-lang) — les deux à convertir.
    html = html.replace(
      /<div class="(lang-toggle|nav__mobile-lang)"[^>]*>[\s\S]*?<\/div>/g,
      (full, cls) => `<div class="${cls}" role="group" aria-label="Language">\n        ${langToggleBlock(group, lang)}\n      </div>`
    );

    // Invariants
    const hrefLangs = (html.match(/rel="alternate" hreflang=/g) || []).length;
    if (hrefLangs !== 4) { console.error(`  ! ${outRel}: ${hrefLangs} hreflang, 4 attendus`); failed = true; }
    const asButton = (html.match(/<button[^>]*lang-toggle__btn/g) || []).length;
    if (asButton) { console.error(`  ! ${outRel}: ${asButton} bouton(s) de langue non converti(s)`); failed = true; }
    const containers = (html.match(/class="(?:lang-toggle|nav__mobile-lang)"/g) || []).length;
    const activeCount = (html.match(/is-active" (?:data-lang="[a-z]+" )?href="#"/g) || []).length;
    if (activeCount !== containers) { console.error(`  ! ${outRel}: ${activeCount} sélecteur(s) actif(s), ${containers} attendu(s)`); failed = true; }

    const outPath = path.join(ROOT, outRel);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);

    const miss = [...stats.missing];
    if (miss.length) { failed = true; console.error(`  ! ${lang} — clés manquantes: ${miss.join(', ')}`); }
    console.log(`${outRel}: ${stats.count} textes, ${stats.labels} aria-label${miss.length ? ' — INCOMPLET' : ''}`);
  }
}

if (failed) process.exit(1);
