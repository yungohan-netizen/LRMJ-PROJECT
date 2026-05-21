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

### Approche : Admin API via proxy serveur

Plus de tags à mettre. Le site lit directement les **dossiers Cloudinary**. Auth Admin API gérée côté serveur via :
- **Dev** : middleware Vite (`vite.config.js`) lit `.env`
- **Prod** : Cloudflare Pages Function (`functions/api/cloudinary/[folder].js`) lit env vars CF dashboard

Le secret n'est JAMAIS bundlé côté client.

### Setup local (1 fois)

1. Cloudinary Console → ⚙️ Settings → **API Keys** → garde `API Key` + `API Secret` sous la main
2. Édite `.env` (gitignored) :
   ```
   CLOUDINARY_CLOUD=dbugcatig
   CLOUDINARY_API_KEY=518354472536939
   CLOUDINARY_API_SECRET=<ton_secret>
   ```
3. `npm run dev` → masonry + svc-cards + about-img se peuplent depuis Cloudinary

### Setup CF Pages prod (1 fois au deploy)

Cloudflare Pages → projet → **Settings** → **Environment variables** → ajouter (Production + Preview) :
- `CLOUDINARY_CLOUD` = `dbugcatig`
- `CLOUDINARY_API_KEY` = `518354472536939`
- `CLOUDINARY_API_SECRET` = `<le secret>`

**Important** : ces 3 vars n'ont **pas** le préfixe `VITE_` → CF Pages les passe seulement aux Functions, jamais au bundle client.

### Workflow Romeo (ajout/remove images)

1. Cloudinary Console → Media Library → ouvre le bon dossier (ex `LMRJ PROJECT/Portails et Clotures`)
2. Upload nouvelle image (drag & drop)
3. Rename si besoin (le nom du fichier devient le titre affiché sur le site, ex `Portail_Monogramme` → "Portail Monogramme")
4. Refresh le site → l'image apparaît automatiquement

**Featured image par catégorie** (optionnel, sert pour les svc-cards) :
Tag l'image avec `lrmj-featured` → elle remontera en premier sur la card de sa catégorie.

### Dossiers attendus (Media Library)

```
LMRJ PROJECT/
├── Portails et Clotures/    → svc-card Portails (featured) + galerie
├── Garde-Corps/             → svc-card Garde-corps + galerie
├── Baies Vitrées/           → svc-card Serres & Baies + galerie
├── Verrières/               → galerie
├── Marquises/               → svc-card Marquises + galerie
├── Escaliers/               → galerie
├── Meubles-Déco/            → galerie
└── Atelier/                 → about-img
```

Mapping configurable dans `src/js/cloudinary.js` → `FOLDERS`.

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
