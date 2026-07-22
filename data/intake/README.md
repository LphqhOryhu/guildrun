# Intake manuel des héros

Ce dossier contient des gabarits texte à remplir à la main, un par héros.
Aucun accès automatisé à une source externe n'est fait par ces scripts —
c'est toi qui copies-colles le contenu depuis où tu veux (site, jeu, notes).

## Workflow

1. `npm run intake:generate` crée `data/intake/heroes/<slug>.txt` pour
   chaque héros listé dans `scripts/generateHeroIntake.mjs` (les 25 de la
   démo). Ne recrée jamais un fichier déjà présent.
2. Ouvre un fichier, remplis les champs entre les balises `[TAG]`/`[/TAG]`
   ou après les `LABEL:` avec ce que tu as copié. Laisse vide ce que tu ne
   trouves pas — ne supprime pas les balises, le parseur les cherche par nom.
3. `npm run intake:parse` lit tous les `.txt`, construit le JSON structuré
   et l'écrit dans `data/scraped/heroes/<slug>.json`. Il :
   - saute les fichiers encore totalement vides,
   - signale les fichiers "partiels" avec la liste des champs manquants,
   - tente d'extraire automatiquement les scalings (ex: "15 (+100% Magic)",
     "50% Magic") depuis les textes verbatim des actives/spés, et journalise
     dans `data/intake/_uncertain-scalings.md` celles dont le nom de stat
     n'est pas reconnu.
4. `npm run merge:extracted` copie `data/scraped/heroes/*.json` (et
   `data/extracted/*.json` s'il y en a) vers `data/heroes/`, **seulement**
   pour les fichiers qui n'y existent pas déjà — aucune correction manuelle
   dans `data/heroes/` n'est jamais écrasée.

## Format d'un fichier d'intake

- `LABEL: valeur` — champ court sur une seule ligne.
- `[TAG]` ... `[/TAG]` — texte libre / multi-lignes (descriptions verbatim,
  stats de base, lore).
- Listes (`CLASSES`, `ELEMENTS`, `MECHANICS`, `SPEC_n_KEYWORDS`) : valeurs
  séparées par des virgules sur une seule ligne.

Une fois quelques héros remplis et parsés, montre-moi le JSON obtenu
(`data/scraped/heroes/*.json`) avant de faire tout le lot — le schéma sera
probablement ajusté une fois qu'on voit de vraies données.
