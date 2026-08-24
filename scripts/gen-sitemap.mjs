/**
 * Génère public/sitemap.xml depuis page-map.
 *
 * Deux raisons d'automatiser plutôt que de maintenir le fichier à la main :
 *  - les <lastmod> étaient figés à une date d'écriture et mentaient sur des
 *    pages modifiées depuis ; une date fausse invite Google à ne pas repasser.
 *  - les annotations xhtml:link déclarent les trois versions linguistiques de
 *    chaque page directement dans le sitemap, ce que Google recommande pour un
 *    site multilingue en complément des balises hreflang.
 *
 * Les pages en noindex (mentions légales, confidentialité) sont exclues
 * automatiquement : on les détecte dans le HTML source plutôt que de tenir
 * une liste en double.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { BASE, PAGE_GROUPS, fileForPath } from './page-map.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['fr', 'nl', 'en'];
const HREFLANG = { fr: 'fr-BE', nl: 'nl-BE', en: 'en' };

/** Date du dernier commit touchant le fichier ; repli sur le mtime disque. */
function lastmod(rel) {
  const abs = path.join(ROOT, rel);
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', rel],
                             { cwd: ROOT, encoding: 'utf8' }).trim();
    if (out) return out;
  } catch { /* dépôt absent ou fichier non suivi */ }
  return fs.statSync(abs).mtime.toISOString().slice(0, 10);
}

const isNoIndex = rel => {
  const abs = path.join(ROOT, rel);
  return fs.existsSync(abs) && /name="robots" content="noindex/.test(fs.readFileSync(abs, 'utf8'));
};

const esc = u => u.replace(/&/g, '&amp;');
const urls = [];
let skipped = 0;

for (const group of PAGE_GROUPS) {
  const files = Object.fromEntries(LANGS.map(l => [l, fileForPath(group[l])]));
  if (LANGS.some(l => isNoIndex(files[l]))) { skipped += LANGS.length; continue; }

  // Une seule date pour tout le groupe : les trois versions sont générées
  // ensemble, les dater séparément suggérerait des mises à jour distinctes.
  const date = LANGS.map(l => lastmod(files[l])).sort().pop();

  for (const lang of LANGS) {
    const alts = LANGS
      .map(l => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${esc(BASE + group[l])}" />`)
      .join('\n');
    urls.push(
      `  <url>\n` +
      `    <loc>${esc(BASE + group[lang])}</loc>\n` +
      `    <lastmod>${date}</lastmod>\n` +
      alts + '\n' +
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(BASE + group.fr)}" />\n` +
      `  </url>`
    );
  }
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
  `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  urls.join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'public/sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml : ${urls.length} URL, ${skipped} ignorées (noindex)`);
