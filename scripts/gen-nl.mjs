/**
 * Génère les pages NL de l'accueil et du portfolio à partir des pages FR.
 *
 *   node scripts/gen-nl.mjs
 *
 * Source de vérité = index.html / portfolio.html + la table NL de src/js/i18n.js.
 * À relancer après toute modification de ces pages, puis commiter le résultat.
 *
 * Une URL = une langue : le HTML NL est rendu en dur pour que Google l'indexe,
 * et le sélecteur de langue navigue au lieu de basculer sur place.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { translations } = await import(pathToFileURL(path.join(ROOT, 'src/js/i18n.js')).href);
const NL = translations.nl;

/** Chemins FR -> NL, appliqués aux href="..." internes. */
const LINKS = {
  '/': '/nl/',
  '/portfolio': '/nl/portfolio',
  '/ferronnier-bruxelles': '/nl/smid-vlaams-brabant',
  '/portail-fer-forge': '/nl/smeedijzeren-poort',
  '/garde-corps-fer-forge': '/nl/smeedijzeren-balustrade',
  '/verriere-sur-mesure': '/nl/serre-veranda-op-maat',
  '/restauration-balustrade-fonte': '/nl/restauratie-gietijzeren-balustrade',
  '/mentions-legales': '/nl/juridische-vermeldingen',
  '/confidentialite': '/nl/privacybeleid',
};

/** Chaînes en dur (alt, aria-label, JSON-LD) : pas de clé i18n, traduites ici.
 *  Une entrée non trouvée dans la page est signalée, pour ne pas laisser
 *  filer du français après une refonte du HTML source. */
const LITERALS = {
  // alt d'images
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
  // aria-label
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
  // JSON-LD
  'Artisan ferronnier spécialisé en création sur mesure : portails, garde-corps, clôtures, serres, marquises en fer forgé.':
    'Ambachtelijke smid gespecialiseerd in maatwerk: smeedijzeren poorten, balustrades, omheiningen, serres en luifels.',
  'LRMJ Project | Artisan ferronnier': 'LRMJ Project | Ambachtelijke smid',
};

const PAGES = [
  {
    src: 'index.html',
    out: 'nl/index.html',
    frUrl: 'https://lrmj-project.be/',
    nlUrl: 'https://lrmj-project.be/nl/',
    title: 'Smeedijzer op maat | Poorten &amp; leuningen | LRMJ Project',
    desc: 'Ambachtelijke smederij in Opwijk: smeedijzeren poorten, balustrades, stalen ramen en luifels op maat. Gratis offerte binnen 48 uur.',
    ogTitle: 'LRMJ Project | Smeedwerk op maat',
    ogDesc: 'Poorten, balustrades, serres, luifels. Atelier in België.',
  },
  {
    src: 'portfolio.html',
    out: 'nl/portfolio.html',
    frUrl: 'https://lrmj-project.be/portfolio',
    nlUrl: 'https://lrmj-project.be/nl/portfolio',
    title: 'Realisaties in smeedijzer | Portfolio | LRMJ Project',
    desc: 'Onze realisaties in smeedijzer: poorten, balustrades, stalen ramen, luifels en trappen. Ontworpen en geplaatst door ons atelier.',
    ogTitle: 'Realisaties in smeedijzer | LRMJ Project',
    ogDesc: 'Poorten, balustrades, stalen ramen, luifels, trappen. Elk stuk ontworpen en gemaakt in ons atelier.',
  },
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

/** Remplace le contenu (ou le placeholder) de chaque [data-i18n] par sa version NL. */
function translate(html, stats) {
  const re = /<([a-zA-Z0-9]+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>/g;
  let out = '', last = 0, m;
  while ((m = re.exec(html))) {
    const [openTag, tag, key] = m;
    const val = NL[key];
    if (val === undefined) { stats.missing.add(key); continue; }
    const text = val.replace('{year}', String(new Date().getFullYear()));

    out += html.slice(last, m.index);

    if (VOID.has(tag.toLowerCase())) {
      // input/textarea : la traduction alimente le placeholder
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
function translateLabels(html, stats) {
  return html.replace(/<([a-zA-Z0-9]+)\b([^>]*\sdata-i18n-label="([^"]+)"[^>]*)>/g, (full, tag, attrs, key) => {
    const val = NL[key];
    if (val === undefined) { stats.missing.add(key); return full; }
    stats.labels++;
    const esc = val.replace(/"/g, '&quot;');
    return attrs.includes('aria-label="')
      ? `<${tag}${attrs.replace(/aria-label="[^"]*"/, `aria-label="${esc}"`)}>`
      : `<${tag}${attrs} aria-label="${esc}">`;
  });
}

let failed = false;
for (const p of PAGES) {
  const srcPath = path.join(ROOT, p.src);
  let html = fs.readFileSync(srcPath, 'utf8');
  const stats = { count: 0, labels: 0, missing: new Set() };

  html = translate(html, stats);
  html = translateLabels(html, stats);

  // <html lang>
  html = html.replace(/<html lang="fr">/, '<html lang="nl">');

  // Liens internes FR -> NL (href absolus du site uniquement)
  html = html.replace(/href="(\/[^"#]*)((?:#[^"]*)?)"/g, (full, p1, hash) => {
    const mapped = LINKS[p1];
    return mapped ? `href="${mapped}${hash}"` : full;
  });
  // href="#ancre" sur l'accueil reste local : rien à faire.

  // <title> / description
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${p.title}</title>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${p.desc}$2`);

  // Open Graph / Twitter
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${p.ogTitle}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${p.ogDesc}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${p.ogTitle}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${p.ogDesc}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${p.nlUrl}$2`);
  html = html.replace(/(<meta property="og:locale" content=")[^"]*(")/, `$1nl_BE$2`);

  // canonical + hreflang réciproques
  const alts =
    `<link rel="canonical" href="${p.nlUrl}" />\n` +
    `  <link rel="alternate" hreflang="fr-BE" href="${p.frUrl}" />\n` +
    `  <link rel="alternate" hreflang="nl-BE" href="${p.nlUrl}" />\n` +
    `  <link rel="alternate" hreflang="x-default" href="${p.frUrl}" />`;
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, alts);

  // Chemins absolus vers les entrées Vite (la page vit dans /nl/)
  html = html.replace(/src="\/src\//g, 'src="/src/');

  // Chaînes en dur (alt, aria-label, JSON-LD) : traduction littérale
  for (const [fr, nl] of Object.entries(LITERALS)) {
    if (html.includes(fr)) html = html.split(fr).join(nl);
  }

  // Sélecteurs de langue (barre + menu mobile) : navigation, plus de bascule
  // sur place — une URL = une langue.
  // Sur la page FR, FR est actif et NL pointe vers la page NL. On inverse.
  const frPath = new URL(p.frUrl).pathname;
  const before = html;
  html = html.replace(
    /<a class="lang-toggle__btn is-active" data-lang="fr"[^>]*>FR<\/a>/g,
    `<a class="lang-toggle__btn" data-lang="fr" href="${frPath}" hreflang="fr">FR</a>`
  );
  html = html.replace(
    /<a class="lang-toggle__btn" data-lang="nl"[^>]*>NL<\/a>/g,
    '<a class="lang-toggle__btn is-active" data-lang="nl" href="#" aria-current="true">NL</a>'
  );
  if (html === before) {
    console.error(`  ! ${p.out}: aucun sélecteur de langue inversé — le HTML source a changé de forme`);
    failed = true;
  }

  // Invariants : aucun sélecteur ne doit basculer sur place, et le NL doit
  // être marqué actif partout (barre + menu mobile).
  const asButton = (html.match(/<button[^>]*lang-toggle__btn/g) || []).length;
  const nlActive = (html.match(/data-lang="nl" href="#" aria-current="true"/g) || []).length;
  const frLink   = (html.match(new RegExp(`data-lang="fr" href="${frPath.replace(/\//g,'\\/')}"`, 'g')) || []).length;
  if (asButton || nlActive !== frLink || nlActive === 0) {
    console.error(`  ! ${p.out}: sélecteurs incohérents (boutons=${asButton}, NL actif=${nlActive}, lien FR=${frLink})`);
    failed = true;
  }

  const outPath = path.join(ROOT, p.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html);

  const miss = [...stats.missing];
  if (miss.length) { failed = true; console.error(`  ! clés NL manquantes: ${miss.join(', ')}`); }
  console.log(`${p.out}: ${stats.count} textes, ${stats.labels} aria-label${miss.length ? ' — INCOMPLET' : ''}`);
}

if (failed) process.exit(1);
