/**
 * Fige la liste des photos Cloudinary dans src/data/gallery.json.
 *
 * Pourquoi un instantané plutôt qu'un appel au build : les identifiants
 * Cloudinary ne sont pas disponibles en local, et un build qui dépend d'un
 * appel réseau échoue le jour où l'API est lente. Le fichier est versionné,
 * donc le build reste déterministe et fonctionne hors ligne.
 *
 * À relancer quand des photos sont ajoutées dans la console Cloudinary :
 *   npm run snapshot:gallery
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.GALLERY_SRC || 'https://lrmj-project.be';

const FOLDERS = {
  portails:   'LMRJ PROJECT/Portails et Clotures',
  gardecorps: 'LMRJ PROJECT/Garde-Corps',
  verrieres:  'LMRJ PROJECT/Verrières',
  marquises:  'LMRJ PROJECT/Marquises',
  escaliers:  'LMRJ PROJECT/Escaliers',
  meubles:    'LMRJ PROJECT/Meubles-Déco',
  atelier:    'LMRJ PROJECT/Atelier',
};

const out = {};
let total = 0;

for (const [key, folder] of Object.entries(FOLDERS)) {
  const url = `${SRC}/api/cloudinary/${encodeURIComponent(folder)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    // On ne retient que ce qui sert au rendu : identifiant, ratio, tags.
    out[key] = (json.resources || []).map(r => ({
      id: r.public_id,
      w: r.width,
      h: r.height,
      f: r.format,
      tags: Array.isArray(r.tags) && r.tags.length ? r.tags : undefined,
    }));
    total += out[key].length;
    console.log(`  ${key.padEnd(11)} ${String(out[key].length).padStart(3)} photos`);
  } catch (err) {
    console.error(`  ${key.padEnd(11)} ECHEC : ${err.message}`);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  console.error('\nInstantané non écrit : au moins un dossier a échoué.');
} else {
  fs.writeFileSync(
    path.join(ROOT, 'src/data/gallery.json'),
    JSON.stringify({ generated: new Date().toISOString().slice(0, 10), folders: out }, null, 1) + '\n',
    'utf8');
  console.log(`\ngallery.json : ${total} photos sur ${Object.keys(out).length} dossiers`);
}
