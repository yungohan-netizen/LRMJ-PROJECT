/**
 * Génère public/sitemap.xml depuis page-map.
 *
 * Trois raisons d'automatiser plutôt que de maintenir le fichier à la main :
 *
 *  - les <lastmod> étaient figés à une date d'écriture et mentaient sur des
 *    pages modifiées depuis ; une date fausse n'incite pas Google à repasser.
 *
 *  - les annotations xhtml:link déclarent les trois versions linguistiques de
 *    chaque page, ce que Google recommande pour un site multilingue en
 *    complément des balises hreflang.
 *
 *  - les entrées <image:image> déclarent les photos. Toutes les images du site
 *    sont injectées par JS depuis Cloudinary : le HTML servi ne contient que
 *    des <img src="">. Googlebot exécute le JS, mais en seconde passe et sans
 *    garantie. Le sitemap d'images est le mécanisme prévu pour déclarer des
 *    visuels qu'un crawl HTML ne verrait pas — ce qui compte pour un artisan
 *    dont le travail se juge en photo.
 *
 * Les pages en noindex sont exclues en lisant leur balise robots, plutôt que
 * de tenir une liste en double.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { BASE, PAGE_GROUPS, fileForPath } from './page-map.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['fr', 'nl', 'en'];
const HREFLANG = { fr: 'fr-BE', nl: 'nl-BE', en: 'en' };
const CLOUD = 'dbugcatig';

/* --- Photos ------------------------------------------------------------- */
let gallery = { folders: {} };
try {
  gallery = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/gallery.json'), 'utf8'));
} catch {
  console.warn('  gallery.json absent : sitemap généré sans images.');
}

const imgUrl = a =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,c_limit,w_1600/${encodeURI(a.id)}.${a.f}`;

const CRAFT = ['portails', 'gardecorps', 'verrieres', 'marquises', 'escaliers', 'meubles'];
const pick = (...keys) => keys.flatMap(k => gallery.folders?.[k] || []);

/* Section restauration : identifiants fixes côté JS (src/js/restoration.js),
   pas un dossier Cloudinary. Repris tels quels pour rester synchrone. */
const RESTO = ['Restauration Garde-Corps 2', 'Restauration Garde-Corps 3',
               'Garde-corps Ballustrade 4', 'Restauration Garde-Corps']
  .map(id => ({ id, f: 'jpg' }));

/** Photos pertinentes pour chaque groupe de pages. */
const IMAGES_FOR = {
  home:         () => pick(...CRAFT),
  portfolio:    () => pick(...CRAFT),
  ferronnier:   () => pick(...CRAFT, 'atelier'),
  portail:      () => pick('portails'),
  gardecorps:   () => pick('gardecorps'),
  verriere:     () => pick('verrieres'),
  restauration: () => RESTO,
};

/* --- Dates -------------------------------------------------------------- */
/** Date du dernier commit touchant le fichier ; repli sur le mtime disque. */
function lastmod(rel) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', rel],
                             { cwd: ROOT, encoding: 'utf8' }).trim();
    if (out) return out;
  } catch { /* dépôt absent ou fichier non suivi */ }
  return fs.statSync(path.join(ROOT, rel)).mtime.toISOString().slice(0, 10);
}

const isNoIndex = rel => {
  const abs = path.join(ROOT, rel);
  return fs.existsSync(abs) && /name="robots" content="noindex/.test(fs.readFileSync(abs, 'utf8'));
};

/* --- Génération --------------------------------------------------------- */
const esc = u => u.replace(/&/g, '&amp;');
const urls = [];
let skipped = 0, imgCount = 0;

for (const group of PAGE_GROUPS) {
  const files = Object.fromEntries(LANGS.map(l => [l, fileForPath(group[l])]));
  if (LANGS.some(l => isNoIndex(files[l]))) { skipped += LANGS.length; continue; }

  // Une seule date pour tout le groupe : les trois versions sont générées
  // ensemble, les dater séparément suggérerait des mises à jour distinctes.
  const date = LANGS.map(l => lastmod(files[l])).sort().pop();
  const photos = (IMAGES_FOR[group.key]?.() || []).filter(a => a && a.id && a.f);

  for (const lang of LANGS) {
    const lines = [
      '  <url>',
      `    <loc>${esc(BASE + group[lang])}</loc>`,
      `    <lastmod>${date}</lastmod>`,
      ...LANGS.map(l =>
        `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${esc(BASE + group[l])}" />`),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(BASE + group.fr)}" />`,
      ...photos.map(a => `    <image:image><image:loc>${esc(imgUrl(a))}</image:loc></image:image>`),
      '  </url>',
    ];
    imgCount += photos.length;
    urls.push(lines.join('\n'));
  }
}

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n' +
  '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
  urls.join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'public/sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml : ${urls.length} URL, ${imgCount} déclarations d'images, ${skipped} pages ignorées (noindex)`);
