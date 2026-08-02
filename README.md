# GPT Exporter

Extension Chrome (Manifest V3) pour exporter vos conversations ChatGPT en **Markdown**, **HTML**, **JSON**, **TXT** ou **PDF**, avec une interface intégrée au design natif de ChatGPT (thème OLED inclus).

![icon](public/icons/icon-128.png)

## Fonctionnalités

- Bouton **« Exporter le chat »** dans l'en-tête de la conversation (à gauche du bouton Adobe Acrobat quand il est présent).
- Bouton **« Exporter le chat »** dans la barre d'actions sous chaque réponse.
- Modale d'export fidèle au design ChatGPT : cartes de format, interrupteurs, pills, spinner et états de progression, animations spring.
- Récupération des données via l'API interne de chatgpt.com (`/backend-api/conversation/{id}`) : export complet et fiable, indépendant du scroll et du DOM.
- Options : messages utilisateur / réponses, raisonnement, sorties d'outils, sources, horodatage, en-tête détaillé, intégration des images, nombre de messages (tous ou N derniers).
- Interface bilingue français / anglais (détection automatique de la langue de ChatGPT).
- Thèmes clair et sombre/OLED suivant le thème de la page.

## Installation (développement)

```bash
npm install
npm run build
```

Puis dans Chrome :

1. Ouvrir `chrome://extensions`
2. Activer le **Mode développeur**
3. **Charger l'extension non empaquetée** → sélectionner le dossier `dist/`
4. Ouvrir [chatgpt.com](https://chatgpt.com), entrer dans une conversation.

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Build de développement avec rechargement (CRXJS) |
| `npm run build` | Typecheck + build de production dans `dist/` |
| `npm run typecheck` | Vérification TypeScript seule |
| `npm run zip` | Empaquette `dist/` en `release/gpt-exporter.zip` |
| `node scripts/generate-icons.mjs` | Régénère les icônes PNG |

## Architecture

```
src/
├── manifest.config.ts        Manifest MV3 (CRXJS)
├── shared/                   Constantes, logger
├── i18n/                     Dictionnaires FR/EN + détection de langue
├── core/
│   ├── model/                Types API ChatGPT, modèle normalisé, options d'export
│   ├── api/                  Session (accessToken), client authentifié, conversation, fichiers
│   ├── tree/                 Parcours de l'arbre mapping + normalisation en blocs
│   └── export/               Filtres, assets, nom de fichier, téléchargement/impression
│       ├── markdown/  html/  json/  text/  pdf/
│       └── registry.ts  run-export.ts
├── content/
│   ├── router.ts             Suivi des navigations SPA (/c/{uuid})
│   ├── dom/                  Sélecteurs, MutationObserver, thème
│   ├── inject/               Bouton d'en-tête + boutons de barre d'actions
│   ├── ui/                   Modale Shadow DOM, styles, icônes
│   └── options-store.ts      Persistance chrome.storage
├── background/               Service worker
└── popup/                    Popup d'action (statut + export rapide)
```

## Notes techniques

- La lecture d'une conversation est un simple `GET` same-origin authentifié par le cookie de session + `Authorization: Bearer` (token de `/api/auth/session`) : aucun mécanisme anti-bot n'est impliqué.
- La branche active est reconstruite en remontant `current_node → parent` jusqu'à la racine.
- Les images (`file-service://…`) sont résolues via `/backend-api/files/{id}/download` et intégrées en data-URL si demandé.
- L'export PDF passe par la boîte d'impression du navigateur (iframe caché, styles print dédiés).
- L'UI injectée vit dans un Shadow DOM isolé ; les tokens de design ont été relevés sur chatgpt.com (voir [docs/DESIGN.md](docs/DESIGN.md)).
