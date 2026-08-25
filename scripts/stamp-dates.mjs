/**
 * Ajoute datePublished / dateModified aux noeuds Article du site construit.
 *
 * Les moteurs de réponse (AI Overviews, Perplexity, ChatGPT) privilégient
 * l'information datée et récente : sans ces champs, un guide n'a aucun signal
 * de fraîcheur. Les écrire à la main dans les sources garantirait qu'ils
 * mentent au premier oubli — on les dérive donc de git, à chaque build.
 *
 * S'exécute sur dist/ après vite build : les sources restent déclaratives.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/** Premier et dernier commit touchant le fichier source (ISO court). */
function gitDates(rel) {
  try {
    const out = execFileSync('git', ['log', '--format=%cI', '--', rel],
                             { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    if (out.length) return { published: out[out.length - 1], modified: out[0] };
  } catch { /* historique indisponible (clone superficiel) */ }
  const st = fs.statSync(path.join(ROOT, rel));
  const iso = st.mtime.toISOString();
  return { published: iso, modified: iso };
}

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : (e.name.endsWith('.html') ? [p] : []);
});

let stamped = 0;
for (const abs of walk(DIST)) {
  const rel = path.relative(DIST, abs).split(path.sep).join('/');
  let html = fs.readFileSync(abs, 'utf8');
  if (!html.includes('"@type": "Article"')) continue;
  if (html.includes('"dateModified"')) continue;

  // Le fichier source porte le même chemin relatif que sa sortie.
  const src = fs.existsSync(path.join(ROOT, rel)) ? rel : null;
  if (!src) { console.warn(`  source introuvable pour ${rel}`); continue; }

  const { published, modified } = gitDates(src);
  const before = html;
  html = html.replace(
    /"@type":\s*"Article",/,
    `"@type": "Article",\n        "datePublished": "${published}",\n        "dateModified": "${modified}",`);
  if (html !== before) {
    fs.writeFileSync(abs, html, 'utf8');
    stamped++;
  }
}
console.log(`dates : ${stamped} article(s) horodaté(s)`);
