# Guildrun — Codex & Builder

Site communautaire (React + Vite, 100% local) pour Guildrun : codex des héros,
builder d'équipe, journal de runs et tier list perso calculée depuis le journal.

## Lancer le projet

```bash
npm install
npm run dev
```

## Structure des données

Les héros sont des fichiers JSON à la main dans `data/heroes/*.json` (25,
un par héros de la démo), sourcés depuis [guildrun.wiki](https://guildrun.wiki/),
une référence non-officielle dont les données viennent des fichiers du jeu.
Les 15 modificateurs de rang A/S de chacune des 7 classes vivent une seule
fois dans `data/rank-modifiers.json` (pas dupliqués par héros — un héros ne
fait que référencer les classes dont il tire ses offres via `rankASClassPools`).

> **Important** : le site consomme encore l'ancien schéma placeholder dans
> `src/data/heroes.js` et les composants Roster/Builder/HeroDetail. Le rebranchement
> sur le schéma réel ci-dessous (Roster, fiche héros, Builder avec choix de
> spé rang B + pools A/S) reste à faire.

Schéma par héros (dérivé des vraies fiches, cf. `data/heroes/reyna.json`) :

```json
{
  "name": "Reyna", "id": 3, "title": "The Contender", "guild": "Frontline",
  "attackType": "Melee", "classes": ["Warrior"], "mechanics": ["Shields"],
  "baseStatsRankC": { "Max HP": "850", "Attack": "25", "...": "..." },
  "derivedComposites": { "ehp": "1015.75", "eoff": "27.2", "secPerCast": "17.5" },
  "rankUpGainsPerRankUp": { "Attack": "+31", "Max HP": "+25%", "...": "..." },
  "startingAbility": { "name": "Triple Threat", "type": "Active", "rawText": "...", "scalings": [] },
  "rankBSpecializations": [
    { "name": "The Champion", "addsClass": null, "keywords": ["Rush", "Backup"], "rawText": "..." },
    { "name": "The Brawler", "addsClass": "Vanguard", "rawText": "..." },
    { "name": "The Boxer", "addsClass": "Duelist", "rawText": "..." }
  ],
  "rankASClassPools": [
    { "class": "Warrior", "base": true, "unlockedBy": null },
    { "class": "Vanguard", "base": false, "unlockedBy": "The Brawler" }
  ],
  "quote": "If I'm in, we train hard. Let's get to work.",
  "lore": { "guild": "", "currentWork": "", "motivation": "" }
}
```

`rawText` verbatim est toujours conservé en plus des champs structurés. Les
`scalings` (ex: `"15 (+100% Magic)"` → `{base:15, stat:"Magic", percent:100}`)
sont extraits au mieux par regex - `rawText` reste la source de vérité si
l'extraction rate un cas exotique (ex: notation `125+125|250|500|750%` par palier de rang).

### Workflow d'intake (guildrun.wiki → JSON)

Le site du wiki bloque `ClaudeBot` dans son `robots.txt` (`Content-Signal:
ai-train=no`), donc pas de scraping automatisé par l'agent : c'est toi qui
navigues et copies le texte des pages, moi qui structure.

1. `npm run intake:generate` crée un gabarit par héros dans `data/intake/heroes/*.txt`
   (non versionnés - contiennent une copie complète des pages du wiki).
2. Ouvre chaque page héros (`guildrun.wiki/heroes/<id>/`), sélectionne tout
   le texte visible et colle-le dans le `.txt` correspondant (écrase le
   gabarit vide - c'est prévu, le parseur détecte le format automatiquement).
3. `npm run intake:parse` lit les `.txt`, structure chaque héros dans
   `data/scraped/heroes/*.json`, agrège les modificateurs de rang A/S
   rencontrés dans `data/scraped/rank-modifiers.json`, et rapporte la
   couverture (objectif 15/15 par classe) et les champs manquants.
4. `npm run merge:extracted` copie `data/scraped/heroes/` vers `data/heroes/`
   et fusionne les nouveaux modificateurs dans `data/rank-modifiers.json` -
   sans jamais écraser un héros ou un modificateur déjà présent (corrections
   manuelles protégées).
5. `npm run validate` liste les héros incomplets et le compte obtenu vs
   attendu (25).

## Scripts

- `npm run dev` — serveur de développement Vite
- `npm run build` — build de production
- `npm run preview` — prévisualise le build
- `npm run validate` — vérifie que chaque fichier `data/heroes/*.json` respecte le schéma, compte obtenu vs 25 attendus
- `npm run intake:generate` — crée les gabarits `data/intake/heroes/*.txt`
- `npm run intake:parse` — structure les `.txt` remplis en JSON (`data/scraped/`)
- `npm run merge:extracted` — fusionne `data/scraped/` (et `data/extracted/` legacy) dans `data/heroes/` et `data/rank-modifiers.json` sans écraser l'existant

## Sections du site

1. **Roster** — grille des héros, filtres (classe / mécanique / mot-clé Rush-Stall-Backup) + recherche, fiche détaillée au clic.
2. **Builder** — sélection de 3 à 6 héros + une spécialisation de rang B chacun, analyse (classes, timings Rush/Stall, mécaniques, couverture Backup), sauvegarde de builds nommés (localStorage).
3. **Journal** — log de runs (build, difficulté 1-8, vague atteinte, victoire/défaite, score endless, notes), localStorage, export/import JSON.
4. **Tier list perso** — calculée depuis le journal (winrate, progression moyenne, difficulté max) par héros et par build, avec override manuel.

Données : [guildrun.wiki](https://guildrun.wiki/) (référence non-officielle,
non affiliée à Leyline) — à créditer dans le footer du site.
