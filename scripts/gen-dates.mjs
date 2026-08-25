/**
 * Fige les dates de publication/modification des articles dans
 * src/data/page-dates.json, depuis l'historique git.
 *
 *   npm run snapshot:dates
 *
 * Pourquoi un instantané versionné : Cloudflare Pages clone sans historique
 * (shallow), donc `git log` y renvoie vide. Un premier essai retombait alors
 * sur le mtime du checkout, ce qui datait tous les articles de l'heure du
 * build — une date fausse, réécrite à chaque déploiement. Le fichier commité
 * porte la vérité et survit au clone superficiel.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'src/data/page-dates.json');

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
  if (['node_modules', 'dist', '.git'].includes(e.name)) return [];
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : (e.name.endsWith('.html') ? [p] : []);
});

const dates = {};
let missing = 0;

for (const abs of walk(ROOT)) {
  const rel = path.relative(ROOT, abs).split(path.sep).join('/');
  const log = execFileSync('git', ['log', '--format=%cI', '--', rel],
                           { cwd: ROOT, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  if (!log.length) { console.warn(`  ${rel} : aucun commit, ignoré`); missing++; continue; }
  dates[rel] = { published: log[log.length - 1], modified: log[0] };
}

fs.writeFileSync(OUT, JSON.stringify(dates, null, 1) + '\n', 'utf8');
console.log(`page-dates.json : ${Object.keys(dates).length} page(s)` +
            (missing ? `, ${missing} sans historique` : ''));
