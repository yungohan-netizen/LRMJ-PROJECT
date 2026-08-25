/**
 * Ajoute datePublished / dateModified aux noeuds Article du site construit.
 *
 * Les moteurs de réponse (AI Overviews, Perplexity, ChatGPT) privilégient
 * l'information datée : sans ces champs, un guide n'a aucun signal de
 * fraîcheur.
 *
 * Les dates viennent de src/data/page-dates.json, produit par
 * `npm run snapshot:dates` depuis l'historique git. On ne lit PAS git ici :
 * Cloudflare Pages clone sans historique, et retomber sur un mtime daterait
 * tous les articles de l'heure du build. En l'absence de date connue on
 * n'écrit rien — pas de date vaut mieux qu'une date fausse.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

let dates = {};
try {
  dates = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/data/page-dates.json'), 'utf8'));
} catch {
  console.warn('  page-dates.json absent : articles non datés.');
}

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : (e.name.endsWith('.html') ? [p] : []);
});

let stamped = 0, skipped = 0;
for (const abs of walk(DIST)) {
  const rel = path.relative(DIST, abs).split(path.sep).join('/');
  let html = fs.readFileSync(abs, 'utf8');
  if (!html.includes('"@type": "Article"') || html.includes('"dateModified"')) continue;

  const d = dates[rel];
  if (!d) { skipped++; continue; }

  const out = html.replace(
    /"@type":\s*"Article",/,
    `"@type": "Article",\n        "datePublished": "${d.published}",\n        "dateModified": "${d.modified}",`);
  if (out !== html) { fs.writeFileSync(abs, out, 'utf8'); stamped++; }
}
console.log(`dates : ${stamped} article(s) horodaté(s)` + (skipped ? `, ${skipped} sans date connue` : ''));
