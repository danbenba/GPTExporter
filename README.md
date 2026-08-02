# GPT Exporter

Extension Chrome (Manifest V3) pour exporter vos conversations **ChatGPT**, **Claude**, **Grok**, **Gemini** et **Perplexity** en **Markdown**, **HTML**, **JSON**, **TXT** ou **PDF**, avec une interface intégrée au design natif de chaque site (thème OLED inclus).

![icon](public/icons/icon-128.png)

## Fonctionnalités

- Bouton **« Exporter le chat »** dans l'en-tête de la conversation (à gauche du bouton Adobe Acrobat quand il est présent) pour exporter toute la discussion.
- Bouton **« Exporter le message »** dans la barre d'actions sous chaque réponse, avec sa propre modale : aperçu du message dans le style ChatGPT, option **Avec mon message**, et sortie au choix (**Télécharger** ou **Copier**).
- Modale fidèle au design ChatGPT : menu déroulant de format avec icônes, options de base puis section **Options avancées** dépliante, interrupteurs, pills, spinner et **toast** de confirmation reprenant les animations natives.
- Récupération des données via l'API interne de chatgpt.com (`/backend-api/conversation/{id}`) : export complet et fiable, indépendant du scroll et du DOM.
- Rendu HTML/PDF au design ChatGPT : bulles utilisateur, blocs de code avec en-tête, bouton copier et coloration syntaxique, cartes de message rédigé.
- Options : réponses et messages utilisateur, raisonnement, sorties d'outils, sources, horodatage, en-tête détaillé, intégration des images, nombre de messages (tous ou N derniers).
- Interface bilingue français / anglais (détection automatique de la langue de ChatGPT).
- Thèmes clair et sombre/OLED suivant le thème de la page.
- Entrée **« Exporter le chat »** dans le menu contextuel de chaque conversation de la barre latérale.
- Chaque export est signé **Exported by GPT Exporter — danbenba.dev**.

### Sites pris en charge

| Site | Récupération | Design appliqué |
|---|---|---|
| chatgpt.com | `/backend-api/conversation/{id}` (arbre `mapping`) | Palette et composants ChatGPT, toast descendant |
| claude.ai `/chat/{uuid}` | `/api/organizations/{org}/chat_conversations/{uuid}?tree=True&rendering_mode=messages&render_all_tools=true` | Palette Anthropic (clay `#d97757`), toast glissant |
| claude.ai `/cowork/{cse_…}` et `/code/{session_…}` | `/v1/code/sessions/{id}` + `/v1/code/sessions/{id}/events` (pagination par curseur) | idem Claude |
| grok.com | `/rest/app-chat/conversations/{id}` + `/responses` + `POST /load-responses` | Palette Grok (`#141414`, bouton blanc), toast latéral |
| gemini.google.com | RPC `hNvQHb` via `batchexecute` (jetons `SNlM0e` / `cfb2h` / `FdrFJe`) | Material 3, bulle 40px, accent `#a8c7fa` |
| perplexity.ai | `/rest/thread/{id}?with_schematized_response=true` (blocs + curseur) | Palette Perplexity, accent teal `#4e99a3` |

Sur Claude, l'extension reconstruit la branche active via `parent_message_uuid`, matérialise les **artifacts** (`create` / `update` / `rewrite`), fusionne `files` et `files_v2`, et conserve les résumés de raisonnement même lorsque le corps est masqué par l'API.

Les sessions **Cowork** et **Claude Code** utilisent un tout autre format (journal d'événements plat au lieu d'un arbre de messages) : l'identifiant est normalisé en `cse_…`, l'organisation passe par l'en-tête `x-organization-uuid`, et les événements sont paginés puis filtrés (les sous-agents, les flux de streaming et les événements de contrôle sont écartés).

Si une conversation refuse de se charger — typiquement celles utilisant la recherche avancée, dont la charge utile peut peser plusieurs dizaines de mégaoctets — l'extension **dégrade progressivement** sa requête (lecture éventuelle → sans `render_all_tools` → sans arbre) avec un délai maximum de 60 s par tentative, puis se rabat sur l'instantané `/latest`.

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
│   ├── dom/                  Sélecteurs, MutationObserver, thème, repérage des tours
│   ├── inject/               Bouton d'en-tête + boutons de barre d'actions
│   ├── ui/                   Modale Shadow DOM, toast, styles, icônes
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
- Les icônes sont redessinées avec les mêmes paramètres géométriques que ChatGPT (viewBox 20×20, trait 1,33, terminaisons arrondies) : aucun asset propriétaire n'est redistribué.

## Licence

[MIT](LICENSE) © [danbenba](https://danbenba.dev)
