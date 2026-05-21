# LRMJ Project — Site Vitrine

Artisan ferronnier Bruxelles / Opwijk. Stack: Vite vanilla + Lenis + Cloudinary delivery.

## Dev

```bash
npm install
npm run dev   # → http://localhost:5173
```

HMR actif sur tous fichiers `src/**` + `index.html`.

## Build

```bash
npm run build     # → dist/
npm run preview   # → http://localhost:4173 (test build local)
```

## Deploy — Cloudflare Pages

1. Push repo sur GitHub/GitLab
2. CF Dashboard → Pages → Create project → Connect repo
3. Build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output**: `dist`
   - **Root directory**: `/`
4. Environment variables (Production + Preview): copier `.env` keys
5. Custom domain: `lrmjproject.be` → CF gère DNS + SSL

## Cloudinary — Setup assets

### Pré-requis (une fois)
Console Cloudinary → ⚙️ Settings → onglet **Security** → section "Restricted media types" → **décocher** "Resource list" → Save.

Sans ça, l'endpoint `image/list/<tag>.json` renvoie 401 et le site fallback sur placeholders.

### Tags à appliquer (Media Library Console)

| Tag | Cible | Folder source |
|---|---|---|
| `lrmj-realisation` | Galerie masonry (toutes images mélangées) | Tous dossiers |
| `lrmj-featured` | Image héros par catégorie | + tag catégorie |
| `lrmj-portails` | svc-card Portails | Portails et Clotures/ |
| `lrmj-gardecorps` | svc-card Garde-corps | Garde-Corps/ |
| `lrmj-baies` | svc-card Serres & baies | Baies Vitrées/ |
| `lrmj-verrieres` | (réservé) | Verrières/ |
| `lrmj-marquises` | svc-card Marquises | Marquises/ |
| `lrmj-escaliers` | (réservé) | Escaliers/ |
| `lrmj-meubles` | (réservé) | Meubles-Déco/ |
| `lrmj-atelier` | about-img | Atelier/ |

**Workflow tag bulk** : Media Library → ouvre dossier → Ctrl+A → menu "..." → Add Tag → entre tag → Save.

**Note** : tag les `signature` images aussi avec `lrmj-featured` (= elle apparaît en haut de la svc-card de sa catégorie).

## Structure

```
.
├── index.html              # Shell HTML (head + sections)
├── src/
│   ├── main.js             # Entry — importe modules
│   ├── styles/
│   │   ├── main.css        # @imports tokens + base + composants
│   │   ├── tokens.css      # CSS variables (light/dark)
│   │   ├── base.css        # Reset, typo, utilities, btns, fade-in
│   │   └── components/     # 1 fichier par section
│   └── js/                 # ES modules par feature
├── public/                 # Statique copie tel-quel dans dist/
│   ├── _headers            # CF Pages headers
│   ├── _redirects
│   ├── robots.txt
│   └── sitemap.xml
├── vite.config.js
├── .env                    # gitignored — valeurs locales
└── .env.example            # template versionne
```

## Intégrations tierces

- **Cloudinary** — assets dynamiques, `image/list/<tag>.json` endpoint public
- **Web3Forms** — formulaire contact, key publique (mode démo si vide)
- **Google Places API** — avis Google Business, key restreinte par referrer
- **Lenis** — smooth scroll

## Reference

Le single-file historique `lrmj-template_3_polished_17.html` reste comme référence. Pas inclus dans le build.
