# Guildrun — Codex & Builder

Site communautaire (React + Vite, 100% local) pour Guildrun : codex des héros,
builder d'équipe, journal de runs et tier list perso calculée depuis le journal.

## Lancer le projet

```bash
npm install
npm run dev
```

## Structure des données

Les héros sont des fichiers JSON à la main dans `data/heroes/*.json`, chargés
automatiquement par `src/data/heroes.js` (aucune liste d'import à maintenir).

Schéma par héros :

```json
{
  "name": "Nom",
  "stars": 4,
  "classes": ["Mage"],
  "elements": ["Burn"],
  "keywords": ["Rush", "Backup"],
  "active": {
    "name": "Nom de l'abilité",
    "manaCost": 40,
    "rawText": "Texte brut tel qu'affiché dans le jeu.",
    "scalings": [
      { "raw": "15 (+100% Magic)", "base": 15, "stat": "Magic", "percent": 100 }
    ]
  },
  "passives": [
    {
      "name": "Nom de la passive",
      "rawText": "Texte brut.",
      "keywords": ["Rush"],
      "masteryAvailable": true,
      "scalings": []
    }
  ]
}
```

Le `rawText` verbatim est toujours conservé en plus des champs structurés,
pour ne jamais perdre d'information lors de l'extraction depuis un screenshot.

### Icônes de scaling (à confirmer)

- violet → `Magic`
- orange / rouge → `Attack`
- vert → `HP` ou `Shield` (à désambiguïser selon le texte)
- bleu → `Mana`

Si une icône est ambiguë sur un screenshot, mets `"stat": "unknown"` dans le
JSON et note le cas dans [`data/_uncertain.md`](data/_uncertain.md).

### Workflow d'extraction (screenshots → JSON)

1. Dépose les screenshots de fiches de héros dans `./screenshots/` (dossier
   ignoré par git — ne pas committer les images du jeu).
2. Les nouvelles extractions vont dans `data/extracted/`, jamais directement
   dans `data/heroes/`, pour ne jamais écraser une correction manuelle déjà
   faite sur un héros existant.
3. `npm run merge:extracted` copie dans `data/heroes/` uniquement les fichiers
   qui n'y existent pas encore.
4. `npm run validate` liste les héros incomplets ou les champs manquants.

## Scripts

- `npm run dev` — serveur de développement Vite
- `npm run build` — build de production
- `npm run preview` — prévisualise le build
- `npm run validate` — vérifie que chaque fichier `data/heroes/*.json` respecte le schéma
- `npm run merge:extracted` — fusionne `data/extracted/` dans `data/heroes/` sans écraser l'existant

## Sections du site

1. **Roster** — grille des héros, filtres (classe / élément / mot-clé Rush-Stall-Backup) + recherche, fiche détaillée au clic.
2. **Builder** — sélection de 3 à 6 héros + une passive chacun, analyse (classes, timings Rush/Stall, éléments, couverture Backup), sauvegarde de builds nommés (localStorage).
3. **Journal** — log de runs (build, difficulté 1-8, vague atteinte, victoire/défaite, score endless, notes), localStorage, export/import JSON.
4. **Tier list perso** — calculée depuis le journal (winrate, progression moyenne, difficulté max) par héros et par build, avec override manuel.

Les données de `data/heroes/` fournies par défaut sont des héros d'exemple
(placeholder) pour peupler l'interface tant qu'aucun screenshot n'a été
traité — remplace-les librement une fois les vraies fiches extraites.
