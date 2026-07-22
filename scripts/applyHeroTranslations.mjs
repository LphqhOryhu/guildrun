#!/usr/bin/env node
// One-time merge of hand-written French translations into data/heroes/*.json.
// Adds *Fr sibling fields (titleFr, quoteFr, nameFr, rawTextFr, etc.) next to
// the English source fields - the English rawText stays untouched since
// scalings extraction and any future re-scrape/diff depend on it.
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const heroesDir = join(__dirname, '..', 'data', 'heroes')

const T = {
  Aria: {
    titleFr: 'Le Requiem',
    quoteFr: 'Je les ai amenés avec moi.',
    activeNameFr: 'Rafale du Requiem',
    activeTextFr:
      "Canalise un rayon d'énergie pendant 2,5 secondes. Toutes les demi-secondes, inflige 15 (+100% Magie) dégâts, inflige 1 Givre par 15 Magie et 1 Brûlure par 10 Magie à tous les ennemis à l'intérieur du rayon.",
    specs: [
      {
        nameFr: 'Le Crescendo',
        textFr:
          "Au déclenchement d'Attente, gagne 3 Magie de façon permanente. Après Attente (20, Attente 40 et Attente 60), gagne +50% Magie et augmente la durée de Rafale du Requiem d'1 seconde.",
      },
      {
        nameFr: 'Le Resplendissant',
        textFr:
          "Les Mages infligent 20% (+10% par rang) d'Altérations en plus. Réserve. Aria inflige 50% d'Altérations supplémentaires en plus.",
      },
      {
        nameFr: "L'Harmonie",
        textFr: 'Rafale du Requiem accorde des Boucliers aux Héros égaux à 50% Magie + 500% Régén. Mana.',
      },
    ],
  },
  Dragomir: {
    titleFr: 'Le Cadre',
    quoteFr: "Tu voudras m'avoir ici. Fais-moi confiance.",
    activeNameFr: 'Dévorer',
    activeTextFr:
      'Gagne 1 (+10% Critique) Vol de vie, puis inflige 250 (+200% Magie, +1000% Vol de vie) dégâts. Sur élimination, gagne 2 (+2 par rang) Éclats.',
    specs: [
      {
        nameFr: "L'Avide",
        textFr:
          'Dévorer génère 2 (+1 par rang) Éclats de plus sur élimination. Au lancement, consomme 2 Éclats pour gagner 1 (+1 par rang) Vol de vie et 1 (+1 par rang) Critique de façon permanente.',
      },
      {
        nameFr: 'Le Sanguin',
        textFr:
          "Au lancement, gagne 4 (+4 par rang) Vol de vie et se téléporte derrière l'ennemi avec le moins de PV. Sur élimination via Dévorer, gagne 70 Mana et Invisibilité pendant 4 secondes.",
      },
      {
        nameFr: 'Le Parrain',
        textFr:
          'Pour Charge (8), les Assassins et Avant-gardes gagnent 1 Vol de vie et 1 Critique par Éclat généré cette partie. Réserve.',
      },
    ],
    loreGuildFr:
      "Aegis Global - « La certitude dans un monde incertain. » Le profit, c'est le pouvoir. L'argent appelle l'argent, et tout ce qui se met en travers subira des altérations.",
    loreWorkFr:
      "L'Éveil de Dragomir a failli le tuer. À y regarder de plus près, on pourrait dire qu'il y est en partie resté. Pourtant, chaque année depuis, il semble un peu plus éclatant, un peu plus vivant ; ses médecins ont depuis longtemps renoncé à trouver une explication. Il est éloquent, avec une courtoisie d'un autre temps qui met les gens à l'aise et dissuade quiconque d'enquêter de trop près sur son état.",
    loreMotivFr:
      "Aegis commence à se poser des questions. Une nouvelle guilde signifie de nouveaux visages, et des réponses qu'il n'aura pas à donner avant des années.",
  },
  Fiona: {
    titleFr: 'La Créatrice',
    quoteFr: "J'ai tout ce qu'il nous faut avec moi.",
    activeNameFr: 'Étincelle du Coffre',
    activeTextFr:
      'Active un coffre protecteur. Applique 250 (+250% Magie) Boucliers aux 1 (+1 par 12 Régén. Mana) Héros ayant le moins de % PV actuels.',
    specs: [
      {
        nameFr: 'Le Bras Droit',
        textFr: 'Tous les 5 lancers, crée un item aléatoire et gagne 2 (+1 par rang) Éclats.',
      },
      {
        nameFr: "L'Éclatante",
        textFr:
          "Au lancement, gagne des Boucliers égaux à 33% PV Max. Chaque fois qu'un ennemi endommage un Héros protégé par un Bouclier, inflige 0 (+1 par rang) Brûlure à cet ennemi par 20 points de Bouclier retirés. Réserve.",
      },
      {
        nameFr: 'Le Magnat',
        textFr:
          'Tous les 5 lancers, gagne une charge de Magnat. Au début du combat, les Héros gagnent 75 (+4 par point de Régén. Mana) PV Max par charge de Magnat. Réserve.',
      },
    ],
  },
  Funke: {
    titleFr: "L'Enchaîné",
    quoteFr: 'Laisse-moi faire les choses à ma façon.',
    activeNameFr: 'Feu Sauvage',
    activeTextFr:
      "Projette une boule de feu sur tous les ennemis à portée de Funke, infligeant 175 (+200% Magie) dégâts et 15 (+66% Magie) Brûlure.",
    specs: [
      {
        nameFr: "L'Attisé",
        textFr:
          "Les Mages gagnent 1 (+1 par rang) Magie chaque fois qu'un ennemi à leur portée subit des dégâts de Brûlure. Réserve. Funke gagne 1 Mana chaque fois qu'un ennemi à sa portée subit des dégâts de Brûlure.",
      },
      {
        nameFr: "L'Enfer",
        textFr:
          'Gagne 2 Portée d’attaque. Au début du combat et après Attente (20), inflige 25 (+1 par 4 Magie) Brûlure à tous les ennemis à portée.',
      },
      {
        nameFr: 'Le Détonateur',
        textFr: 'Au lancement, tous les ennemis à portée subissent 10 (+10 par rang) ticks de dégâts de Brûlure.',
      },
    ],
  },
  Grace: {
    titleFr: 'La Sainte',
    quoteFr: 'Moi ? Vraiment ? Je... je ferai de mon mieux.',
    activeNameFr: 'Salut',
    activeTextFr:
      'Bénit le Héros avec le moins de % PV, lui appliquant 125+125|250|500|750% Magie en Boucliers pendant 5 (+25% Régén. Mana) secondes et le soigne pour la moitié de ce montant. Après Attente (20), cette abilité peut cibler et ressusciter les Héros morts.',
    specs: [
      {
        nameFr: "L'Altruiste",
        textFr:
          'Après Attente (10), Salut cible tous les Héros. Réserve uniquement : après Attente (20 et Attente 40), applique 333 (+333 par rang) Boucliers à tous les Héros et les soigne pour la moitié de ce montant.',
      },
      {
        nameFr: 'La Bienveillante',
        textFr:
          "Au lancement après Attente (20), donne de façon permanente à la cible les statistiques primaires de chacune de ses classes. Cette abilité ne se déclenche qu'1 (+1 par rang) fois par combat.",
      },
      {
        nameFr: 'La Radieuse',
        textFr:
          "Chaque fois qu'un Mystique accorde un Bouclier à un Héros, ce Héros gagne 6 (+4 par rang) Attaque et Magie. Réserve.",
      },
    ],
    loreGuildFr:
      'Première Ligne - « Plus fort à chaque pause. » Faites chauffer les muscles ! Ça vous donnera une progression permanente !',
    loreWorkFr:
      "L'intello d'une famille d'athlètes, Grace ne s'attendait pas à finir dans une faille. Puis ses pouvoirs éveillés ont révélé une rare affinité de soin, et le Département des Affaires de Guilde l'a envoyée sur le terrain avant même qu'elle ait décidé si elle le voulait. Effrayée avant chaque combat, effrayée après chacun d'eux, et pourtant toujours prête pour le suivant. C'est exactement l'histoire que les campagnes de développement personnel de Première Ligne sont conçues pour raconter.",
    loreMotivFr:
      "Donnez-lui la confiance qui lui manque. Croyez en elle, et elle deviendra l'épine dorsale de votre équipe.",
  },
  Gustav: {
    titleFr: "L'Analyste",
    quoteFr: "J'avais envie de tester un scénario comme celui-ci.",
    activeNameFr: 'Blizzard',
    activeTextFr:
      'Crée un Blizzard pendant 5 secondes. Chaque seconde, inflige 1 (+1 par 8 Régén. Mana) Givre et 10 (+50% Magie) dégâts aux ennemis à l’intérieur du Blizzard. Accorde des Boucliers de 10 (+100% Magie) aux Héros à l’intérieur.',
    specs: [
      {
        nameFr: "L'Investisseur",
        textFr:
          "Au début du combat, dépense 4 Éclats pour donner à Gustav un Investissement. Tous les Héros gagnent 2 Régén. Mana par Investissement. Réserve. Tous les 5 Investissements, gagne 30 Éclats.",
      },
      {
        nameFr: 'Le Glacier',
        textFr:
          'Blizzard applique 100% Défense de Boucliers en plus et cible toujours Gustav. Après Attente (25 et Attente 50), gagne 2 (+2 par rang) Défense de façon permanente.',
      },
      {
        nameFr: "L'Avalanche",
        textFr: 'Au lancement, gagne 1 Éclat. Lors de la génération d’Éclats, gagne 1 Régén. Mana et 5 Magie.',
      },
    ],
  },
  Hoyoung: {
    titleFr: 'Le Nouveau',
    quoteFr: "Tout s'aligne parfaitement.",
    activeNameFr: 'Tir Fatal',
    activeTextFr:
      "Tire une flèche sur l'ennemi le plus éloigné. Elle inflige 250 (+250% Attaque, +250% Magie) dégâts et gagne 25 (+100% Critique) Critique supplémentaire.",
    specs: [
      {
        nameFr: 'Le Conduit',
        textFr:
          "Sur élimination, gagne 2 Régén. Mana de façon permanente et Invisibilité pendant 4 secondes. Au début du combat, les autres Assassins et Mystiques gagnent toute la Régén. Mana obtenue par cette abilité. Réserve.",
      },
      {
        nameFr: 'Le Chasseur',
        textFr:
          "Tir Fatal gagne 50 (+50 par rang) Critique lors du/des 1 (+1 par rang) premier(s) lancer(s) de chaque combat. Sur élimination, gagne 1 Éclat par hexagone de distance avec l'ennemi.",
      },
      {
        nameFr: "Le Tireur d'Élite",
        textFr:
          "Cible toujours l'ennemi le plus éloigné. Les attaques automatiques gagnent 10 (+10 par rang) Attaque et 3 (+3 par rang) Critique par hexagone de distance avec l'ennemi.",
      },
    ],
  },
  Irini: {
    titleFr: 'Second Souffle',
    quoteFr: 'Ils disaient que je ne referais plus jamais ça.',
    activeNameFr: 'Sans Limites',
    activeTextFr:
      "À chaque attaque automatique, gagne 1 Vitesse d'attaque. Après Attente (15), les attaques automatiques infligent 100% Vitesse d'attaque en dégâts bonus.",
    specs: [
      {
        nameFr: "L'Électrique (Tempête Grandissante)",
        textFr:
          "Invoque la foudre, infligeant 10 (+20% Vitesse d'attaque, +10% Attaque, +10% Magie) dégâts par déclenchement d'Attente et de Charge cette partie.",
      },
      {
        nameFr: 'La Puissante',
        textFr:
          "Chaque fois qu'un Duelliste attaque automatiquement, il gagne 0 (+1 par rang) Vitesse d'attaque et 0 (+1 par rang) Attaque. Réserve.",
      },
      {
        nameFr: "L'Olympique",
        textFr: 'Obtient l’item de quête unique Foudre de Zeus.',
      },
    ],
  },
  Kai: {
    titleFr: 'Le Meneur',
    quoteFr: "Ne t'amuse pas trop sans moi.",
    activeNameFr: 'Frappe Résolue',
    activeTextFr:
      'Charge une puissante attaque, gagnant 300 (+400% Attaque, +250% Magie) Boucliers. Après 2 secondes, inflige 100 (+100% Attaque) dégâts plus des dégâts bonus égaux aux Boucliers restants de Kai aux ennemis alentour.',
    specs: [
      {
        nameFr: "L'Inarrêtable",
        textFr:
          'Gagne 60 (+25% Attaque)% de Boucliers en plus, toutes sources confondues. Chaque fois que Kai gagne des Boucliers, il gagne aussi 9 (+6 par rang) Attaque.',
      },
      {
        nameFr: "L'Audacieux",
        textFr:
          'Frappe Résolue frappe 1 seconde plus tôt et affecte une zone plus large. Au lancement, gagne 250 (+500% Défense) Boucliers durables.',
      },
      {
        nameFr: "L'Intrépide",
        textFr:
          "Pour Charge (8), gagne 100% Critique. Chaque fois qu'un Guerrier inflige un coup Critique, réduit la Défense de sa cible de 2 (+1 par rang). Réserve.",
      },
    ],
  },
  Karsu: {
    titleFr: 'La Finisseuse',
    quoteFr: "Je ne suis pas là pour parler.",
    activeNameFr: 'Perce-Neige',
    activeTextFr:
      "Décoche une volée de 5 flèches sur les ennemis proches. Chaque flèche inflige 25 (+100% Attaque, +100% Magie) dégâts et 4 (+1 par 15 Vitesse d'attaque) Givre.",
    specs: [
      {
        nameFr: 'La Neige Tombante',
        textFr:
          'Perce-Neige tire 5 flèches supplémentaires. Après Attente (20), les flèches de Perce-Neige gagnent 25 (+25 par rang) Critique.',
      },
      {
        nameFr: 'La Troupe',
        textFr:
          "Au lancement, gagne 1 Critique, 2 Attaque et 3 Vitesse d'attaque de façon permanente. Au début du combat, les autres Duellistes gagnent toutes les statistiques obtenues par cette abilité. Réserve.",
      },
      {
        nameFr: 'La Gelure',
        textFr:
          "À chaque attaque automatique, tire une flèche supplémentaire qui inflige 1 (+1 par 100 Vitesse d'attaque) Givre et 1 (+10% Attaque)% des dégâts d'attaque automatique normaux.",
      },
    ],
  },
  Logan: {
    titleFr: 'Le Bourreau',
    quoteFr: "Je ne me bats pas pour le sport. Je me bats pour en finir.",
    activeNameFr: 'Exécution',
    activeTextFr:
      'Assène un coup de hache écrasant infligeant 150+100|200|400|600% Attaque +200% Magie en dégâts. Logan gagne en puissance en infligeant des dégâts avec cette abilité.',
    specs: [
      {
        nameFr: 'Le Fer',
        textFr:
          'Pour Charge (8), les Guerriers gagnent 0 (+2 par rang) Attaque et 0 (+2 par rang) Défense par déclenchement de Charge cette partie. Réserve.',
      },
      {
        nameFr: 'Le Colosse',
        textFr:
          'Chaque fois que Logan inflige des dégâts avec Exécution, il gagne des Boucliers durables égaux à 75% (+50% par rang) des dégâts infligés.',
      },
      {
        nameFr: 'Le Décisif',
        textFr: 'Sur élimination, gagne 40 Mana et gagne 15 Attaque et 5 Critique de façon permanente.',
      },
    ],
  },
  Ming: {
    titleFr: 'La Vagabonde',
    quoteFr: "Alors c'est là que le monde m'envoie maintenant.",
    activeNameFr: 'Flamme Intérieure',
    activeTextFr:
      'Chaque seconde, inflige 1 Brûlure par 650 PV Max aux ennemis adjacents. Pour Charge (5), double la Brûlure.',
    specs: [
      {
        nameFr: 'La Brûlante (Mantra Brûlant)',
        textFr:
          'Canalise des flammes pour infliger 100 (+25% PV Max, +100% Magie) dégâts, inflige 5 Brûlure par Charge déclenchée cette partie, et Étourdit tous les ennemis alentour pendant 3 secondes.',
      },
      {
        nameFr: 'La Trempée',
        textFr: 'Pour Charge (15), les Avant-gardes gagnent 25 (+25 par rang)% PV Max. Réserve.',
      },
      {
        nameFr: "L'Éclairée",
        textFr:
          'Augmente la durée des abilités de Charge de 1 (+1 par rang) seconde(s). Pour Charge (0), Ming est immunisée aux dégâts.',
      },
    ],
  },
  Niklas: {
    titleFr: 'Le Négociant',
    quoteFr: 'On dirait que tu sais reconnaître une bonne affaire.',
    activeNameFr: 'Offres Explosives',
    activeTextFr:
      "Quand Niklas survit à un combat, consomme l'item dans son emplacement le plus à gauche. Gagne 100% de ses statistiques de façon permanente et gagne des Éclats égaux à 80% de sa valeur. Pour Charge (14), les attaques automatiques infligent 1 (+1 par 500 PV Max) Brûlure par item équipé.",
    specs: [
      {
        nameFr: 'Le Négociant (Marchandage)',
        textFr:
          'Assène un coup de masse infligeant 175 (+25% PV Max, +200% Attaque, +150% Magie) dégâts et Étourdit pendant 3 secondes. Cette abilité a 25% de chances de créer un item aléatoire.',
      },
      {
        nameFr: 'Le Cadre',
        textFr: 'Gagne deux emplacements d’item. Pour Charge (15), gagne 33% PV Max en Boucliers par item équipé.',
      },
      {
        nameFr: "L'Accapareur",
        textFr:
          "Chaque fois qu'une Avant-garde ou un Tank subit une attaque automatique, il inflige 1 dégât à l'attaquant par Éclat généré cette partie. Réserve.",
      },
    ],
  },
  Nyx: {
    titleFr: "L'Égarée",
    quoteFr: 'Ouais. Je sais que je suis petite. Fais avec.',
    activeNameFr: 'Sauvagerie',
    activeTextFr:
      "Pour Charge (5), gagne 5 (+25% Vitesse d'attaque) Vitesse d'attaque et 5 (+25% Attaque) Attaque pour chaque déclenchement de cette abilité ce combat. Toutes les 12 attaques automatiques, réinitialise toutes les abilités de Charge de Nyx.",
    specs: [
      {
        nameFr: "L'Œil Vif",
        textFr:
          'Les Assassins et Duellistes tuent instantanément tout ennemi dont ils réduisent les PV sous 20 (+5 par rang)% PV Max. Réserve.',
      },
      {
        nameFr: 'La Sauvage (Rafale Sauvage)',
        textFr:
          "Exécute un combo de 5 coups. Chaque coup compte comme une attaque automatique infligeant 100 (+33% Vitesse d'attaque, +25% Magie, +25% Attaque)% dégâts. Si l'ennemi meurt pendant le combo, Nyx bondit vers l'ennemi le plus proche et relance cette abilité.",
      },
      {
        nameFr: "L'Étincelle",
        textFr:
          "Après Attente (10), chaque attaque automatique inflige 2 (+1 par 30 Vitesse d'attaque) Brûlure. Après Attente (20), chaque attaque automatique inflige 1 (+1 par 40 Vitesse d'attaque) Givre. Après Attente (30), chaque attaque automatique inflige 1 Poison par 50 Vitesse d'attaque.",
      },
    ],
    loreGuildFr:
      "La Chasse - « Quand l'appel retentit, nous chassons. » On amène la rue dans les Failles. Charge ou Attente, comme il vous faut.",
    loreWorkFr:
      "Nyx s'est faufilée à travers trois confinements de faille avant que La Chasse abandonne l'idée de la traquer et la recrute à la place. Aujourd'hui la plus jeune briseuse de n'importe quel effectif : trop rapide pour être attrapée, trop féroce pour être ignorée. Nyx n'a aucune famille répertoriée, aucune adresse, aucun foyer. Elle ne fait pas assez confiance à La Chasse pour dormir dans leur maison de guilde. Mais à chaque combat, la gamine est toujours déjà là.",
    loreMotivFr:
      "Nyx ne suit pas les guildes, mais les gens dignes de confiance - et elle n'en a pas encore trouvé. Sois le premier, et la gamine cessera d'être une égarée.",
  },
  Pimenta: {
    titleFr: 'La Chevalière des Roses',
    quoteFr: 'S’ils te veulent, ils devront me passer dessus.',
    activeNameFr: 'Gaz Poivré',
    activeTextFr:
      'Crée un nuage de poison autour de Pimenta pendant 4 secondes. Chaque seconde, inflige 5 (+50% Magie, +50% Défense) dégâts et 2 (+1 par 25 Défense) Poison aux ennemis dans le nuage. Chaque seconde après Attente (15), gagne 3 (+2 par rang) PV/s par ennemi dans le nuage.',
    specs: [
      {
        nameFr: "L'Épicée",
        textFr:
          "À chaque attaque automatique, pour chaque type d'Altération sur la cible, inflige 2 (+1 par rang) de plus de cette Altération et inflige 10 (+75% Vitesse d'attaque) dégâts bonus.",
      },
      {
        nameFr: "L'Expérimentée",
        textFr:
          'Gaz Poivré s’agrandit et dure 1 seconde de plus. Après Attente (15), les Tanks et Mages gagnent 20 (+20 par rang) Défense. Réserve.',
      },
      {
        nameFr: "L'Amoureuse",
        textFr:
          "Au début du combat, les Héros directement derrière Pimenta gagnent 15 Vitesse d'attaque de façon permanente. Sal en gagne 15 de plus.",
      },
    ],
  },
  Pollen: {
    titleFr: "L'Éclosion",
    quoteFr: 'Ohh... tu sens ça ? Cette faille est vivante.',
    activeNameFr: "Sanctuaire de l'Éclosion",
    activeTextFr:
      "Crée un champ de fleurs pendant 5 secondes. Chaque seconde, inflige 1 (+1 par 8 Régén. Mana) Poison aux ennemis et applique 10 (+100% Magie) Boucliers aux Héros à l'intérieur du champ de fleurs. Chaque seconde après Attente (15), soigne les Héros à l'intérieur du champ de fleurs de 10 (+50% Magie).",
    specs: [
      {
        nameFr: 'La Florissante',
        textFr:
          "Après Attente (15), double les soins et Boucliers de Sanctuaire de l'Éclosion. Il dure 1 seconde de plus.",
      },
      {
        nameFr: 'Le Baiser de la Fée',
        textFr:
          "Après Attente (20), Sanctuaire de l'Éclosion inflige 100% de Poison en plus. Après Attente (40), augmente la quantité d'Altérations sur tous les ennemis de 33 (+33 par rang)%. Réserve.",
      },
      {
        nameFr: 'L’Enfant de la Terre',
        textFr:
          "Après Attente (20), Sanctuaire de l'Éclosion inflige aussi 1 Givre par 33 Magie et 1 Brûlure par 25 Magie chaque seconde.",
      },
    ],
  },
  Ratna: {
    titleFr: 'La Matriarche',
    quoteFr: 'Tu es sûr que ta guilde peut se permettre de m’engager ?',
    activeNameFr: "Pluie d'Étoiles",
    activeTextFr:
      '190+150|250|450|750% Magie en dégâts par invocation de magie céleste. Sur élimination, gagne 10 (+10 par rang) Magie de façon permanente. Sur coup Critique, Étourdit tous les ennemis pendant 0,5 (+0,5 par rang) seconde.',
    specs: [
      {
        nameFr: "L'Élégante",
        textFr:
          'Gagne un emplacement d’item. Au début du combat, gagne 45 Magie, 4 Régén. Mana et 8 PV/s par niveau de rareté de chaque item équipé.',
      },
      {
        nameFr: "L'Ostentatoire",
        textFr:
          'Au lancement, les autres Héros gagnent 20% Magie en Magie et 25% Régén. Mana en Régén. Mana. Réserve uniquement : au début du combat, les Mages et Mystiques gagnent 20% Magie en Magie et 25% Régén. Mana en Régén. Mana.',
      },
      {
        nameFr: 'La Magnanime',
        textFr:
          "Pluie d'Étoiles touche aussi l'ennemi avec le moins de PV lors des 2 (+1 par rang) premiers lancers de chaque combat. Sur élimination, gagne Invisibilité pendant 4 secondes et gagne 3 (+3 par rang) Critique de façon permanente.",
      },
    ],
  },
  Reyna: {
    titleFr: 'La Prétendante',
    quoteFr: "Si je suis de la partie, on s'entraîne dur. Au travail.",
    activeNameFr: 'Triple Menace',
    activeTextFr:
      'Déchaîne un combo de 3 coups de poing. Chaque coup compte comme une attaque automatique infligeant 100 (+100% Attaque, +50% Magie)% dégâts (Max : 500%) et accorde à Reyna des Boucliers durables égaux à 33% des dégâts infligés.',
    specs: [
      {
        nameFr: 'La Championne',
        textFr:
          'Gagne 2 Attaque par Charge déclenchée cette partie. Pour Charge (5), les Guerriers gagnent 1 Critique et 1 Vol de vie par Charge déclenchée cette partie. Réserve.',
      },
      {
        nameFr: 'La Bagarreuse',
        textFr:
          'Triple Menace applique 33% de Boucliers en plus. Gagne 1 Attaque par 12 points de Bouclier, jusqu’à 33% PV Max en Attaque.',
      },
      {
        nameFr: 'La Boxeuse',
        textFr:
          "Toutes les 3 attaques automatiques, inflige 150 (+150% Attaque) dégâts bonus et 3 (+1 par 5 Vitesse d'attaque) Brûlure.",
      },
    ],
  },
  Rip: {
    titleFr: 'Le Boucher',
    quoteFr: 'Ouaf ouaf, pas besoin d’avoir peur. Je ne mords pas.',
    activeNameFr: 'Assoiffé de Sang',
    activeTextFr:
      "Pour Charge (10), gagne 5% PV Max en Attaque. Chaque fois que Rip ou un ennemi adjacent à lui passe pour la première fois sous 50% PV Max, réinitialise toutes ses abilités de Charge et gagne 2% PV Max en Vitesse d'attaque.",
    specs: [
      {
        nameFr: 'Le Glouton',
        textFr:
          'Au déclenchement de Charge, gagne 33 PV Max de façon permanente. Réserve. Réserve uniquement : au début du combat, les Avant-gardes gagnent tous les PV Max obtenus par cette abilité.',
      },
      {
        nameFr: 'L’Enragé (Furie)',
        textFr:
          'Entre en rage, gagnant 10% PV Max + 250% Magie en PV Max, 5 (+5 par rang) Vitesse d’attaque et 2 (+2 par rang) Vol de vie. Cette abilité se cumule.',
      },
      {
        nameFr: 'La Brute',
        textFr: 'Sur coup Critique, vole 50% Critique en PV à la cible.',
      },
    ],
    loreGuildFr:
      'Un Temple - « Ni dieux. Ni maîtres. » L’anarchie dans les Failles ! Charge et altérations sur tout ce qui se trouve sur leur chemin.',
    loreWorkFr:
      "C'est un combattant de première ligne réputé pour arracher le cœur de tout ce qu'il tue, une habitude héritée de son ancien travail dans une équipe de nettoyage chargée de transporter des carcasses de monstres. Il s'est Éveillé en plein service ; Un Temple fut la seule guilde à venir le recruter. Sous le masque, il est parfaitement sain d'esprit. La plupart de ses coéquipiers ont besoin de temps pour s'en rendre compte.",
    loreMotivFr:
      'Montrez-lui de la viande fraîche et il rejoindra votre abattoir avec plaisir. Votre recruteur a environ trente secondes pour le faire.',
  },
  Rowan: {
    titleFr: "L'Ancre",
    quoteFr: 'Tu es en sécurité avec moi.',
    activeNameFr: 'Robuste',
    activeTextFr: 'Après Attente (10), gagne 2 (+1 par 100 PV Max, +1 par 15 Défense) PV/s.',
    specs: [
      {
        nameFr: 'Le Tectonique (Ligne de Faille)',
        textFr:
          'Gagne 33% PV Max en Boucliers, puis inflige 50 (+25% PV Max, +200% Défense, +100% Magie) dégâts et Étourdit les ennemis devant Rowan pendant 4 secondes.',
      },
      {
        nameFr: 'Le Protecteur',
        textFr:
          'À chaque attaque automatique, gagne 3% PV Max en Boucliers, puis inflige des dégâts bonus égaux à 75 (+25 par rang)% des Boucliers actuels (Dégâts Max : 1000% PV Max).',
      },
      {
        nameFr: "L'Ami",
        textFr:
          'Au déclenchement d’Attente, gagne 20 PV Max et 4 Défense de façon permanente. Réserve. Réserve uniquement : au début du combat, les Tanks et Avant-gardes gagnent toute la Défense et les PV Max obtenus par cette abilité.',
      },
    ],
  },
  Sal: {
    titleFr: 'La Gardienne',
    quoteFr: 'Tu vois ? On est toujours là.',
    activeNameFr: 'Permafrost',
    activeTextFr:
      "Sal renforce ses attaques, les faisant aussi toucher l'ennemi le plus proche de sa cible, infligeant 10 (+50% Magie) dégâts bonus et 1 (+1 par rang) Givre. Cette abilité se cumule.",
    specs: [
      {
        nameFr: 'La Légère',
        textFr:
          "Chaque fois qu'un Mage ou Duelliste inflige une Altération, il gagne 0 (+1 par rang) Vitesse d'attaque et 1 (+1 par rang) Magie. Réserve.",
      },
      {
        nameFr: "L'Amoureuse",
        textFr:
          'Au début du combat, les Héros directement devant Sal gagnent 20 Défense de façon permanente. Pimenta en gagne 20 de plus.',
      },
      {
        nameFr: 'La Vive',
        textFr:
          'Les dégâts bonus de Permafrost peuvent infliger un coup Critique. Sur coup Critique, inflige 1 (+1 par rang) Givre. Au lancement, Sal gagne 33% Attaque + 33% Magie en Critique.',
      },
    ],
  },
  Skorn: {
    titleFr: 'Le Rempart',
    quoteFr: 'Qu’ils essaient. Je prendrai ça avec plaisir.',
    activeNameFr: 'Rétribution',
    activeTextFr:
      "Quand il subit une attaque automatique après Attente (10), inflige 2 (+100% Magie) dégâts et 1 Poison par 50 Défense à l'attaquant.",
    specs: [
      {
        nameFr: 'Le Hautain (Viens Donc !)',
        textFr:
          'Provoque tous les ennemis et gagne 10 (+10% Défense, +10% Magie) Boucliers par Attente déclenchée cette partie. Après 5 secondes, inflige aux ennemis ciblant Skorn des dégâts égaux à 50% de son Bouclier restant.',
      },
      {
        nameFr: "La Morsure de l'Hiver",
        textFr:
          'Chaque fois que Skorn inflige du Poison, il inflige une quantité égale de Givre. Chaque fois que Skorn inflige du Givre, il gagne 0 (+10 par rang) Boucliers.',
      },
      {
        nameFr: 'Le Garde Hérissé',
        textFr:
          'Au début du combat, pour chaque Tank en combat, inflige 5 (+10 par rang) Poison à tous les ennemis et accorde 5 (+10 par rang) Défense à tous les Héros. Réserve.',
      },
    ],
  },
  Tilly: {
    titleFr: "L'Héritière",
    quoteFr: 'Oh... je pourrais bien être douée pour ça.',
    activeNameFr: 'Luxueuse',
    activeTextFr:
      "Gagne 25% Attaque en Vitesse d'attaque et 25% Vitesse d'attaque en Attaque. Toutes les 25 attaques automatiques, gagne 2 (+2 par rang) Éclats.",
    specs: [
      {
        nameFr: 'La Stylée',
        textFr: 'Gagne un emplacement d’item. À chaque attaque automatique, inflige des dégâts bonus par Éclat généré cette partie.',
      },
      {
        nameFr: "L'Affûtée",
        textFr:
          "Pour Charge (10), les Guerriers gagnent 8 (+8 par rang)% Attaque et 4 (+4 par rang)% Critique. Réserve. Après Attente (20), les Duellistes gagnent 8 (+8 par rang)% Vitesse d'attaque et 4 (+4 par rang)% Critique. Réserve.",
      },
      {
        nameFr: "L'Élégante (Pirouette)",
        textFr:
          "Gagne 4 (+4 par rang) Critique et 4 (+4 par rang) Vol de vie, puis inflige 75 (+150% Attaque, +150% Vitesse d'attaque, +150% Magie) dégâts à tous les ennemis à portée de Tilly.",
      },
    ],
  },
  Yuuna: {
    titleFr: 'La Professionnelle',
    quoteFr: 'Je ne laisserai pas tomber notre guilde.',
    activeNameFr: "Frappe de l'Ombre au Shuriken",
    activeTextFr:
      "Bondit dans les airs et lance 1 (+1 par 50 Critique) shuriken(s) sur l'ennemi avec le moins de PV, infligeant chacun 150 (+150% Attaque, +150% Magie) dégâts. Shurikens Max : 8",
    specs: [
      {
        nameFr: "L'Ombre",
        textFr:
          'Quand Yuuna passe sous 75% PV Max, elle gagne Invisibilité pendant 4 secondes. Se déclenche une fois par combat. Chaque fois que Yuuna gagne Invisibilité, elle gagne 30 Mana et gagne 5 (+5 par rang) Critique de façon permanente.',
      },
      {
        nameFr: 'La Collectionneuse',
        textFr:
          "Frappe de l'Ombre au Shuriken tire un shuriken supplémentaire. Sur élimination, gagne 5 Éclats puis augmente de façon permanente de 1 les Éclats générés par cette abilité. Se déclenche une fois par combat.",
      },
      {
        nameFr: 'La Belladone',
        textFr:
          "Frappe de l'Ombre au Shuriken gagne +150% Critique contre les ennemis empoisonnés. Chaque fois qu'un Assassin inflige un coup Critique, il inflige 4 (+4 par rang) Poison. Réserve.",
      },
    ],
  },
  Zuri: {
    titleFr: 'La Gorgone',
    quoteFr: 'C’est bon. Tu peux jeter un œil.',
    activeNameFr: 'Peau de Pierre',
    activeTextFr:
      'Sur coup Critique, gagne 1 Défense et 1 Magie de façon permanente. Se déclenche 2 (+1 par 20 Critique, +1 par 60 Défense) fois par combat.',
    specs: [
      {
        nameFr: 'La Cruelle (Pétrification)',
        textFr:
          'Pétrifie tous les ennemis ciblant Zuri, infligeant 150 (+250% Magie) dégâts, 1 Poison par déclenchement de Peau de Pierre cette partie, et Étourdit pendant 4 secondes.',
      },
      {
        nameFr: 'Le Baiser du Serpent',
        textFr:
          "Quand elle subit une attaque automatique, inflige 1 (+1 par 60 Défense, +1 par 50 Magie) Poison à l'attaquant et gagne 0 (+1 par rang) PV/s.",
      },
      {
        nameFr: 'La Danseuse des Lames',
        textFr:
          'Pour Charge (10), les attaques automatiques infligent 5 (+100% Critique, +50% Magie) dégâts bonus et soignent de 5 (+100% Critique, +50% Magie). Après Attente (20), les attaques automatiques infligent 5 (+100% Critique, +50% Défense) dégâts bonus et soignent de 5 (+100% Critique, +50% Défense).',
      },
    ],
  },
}

function main() {
  let updated = 0
  for (const [heroName, tr] of Object.entries(T)) {
    const slug = heroName.toLowerCase()
    const file = join(heroesDir, `${slug}.json`)
    const hero = JSON.parse(readFileSync(file, 'utf-8'))

    hero.titleFr = tr.titleFr
    hero.quoteFr = tr.quoteFr
    hero.startingAbility.nameFr = tr.activeNameFr
    hero.startingAbility.rawTextFr = tr.activeTextFr
    hero.rankBSpecializations.forEach((spec, i) => {
      spec.nameFr = tr.specs[i].nameFr
      // Any distinct ability name (e.g. "The Cruel (Petrification)") is
      // folded directly into nameFr as one translated string, so the French
      // ability name always matches the French spec name - no separate
      // "— translated ability name" suffix needed.
      spec.abilityNameFr = tr.specs[i].nameFr
      spec.rawTextFr = tr.specs[i].textFr
    })
    if (tr.loreGuildFr) hero.lore.guildFr = tr.loreGuildFr
    if (tr.loreWorkFr) hero.lore.currentWorkFr = tr.loreWorkFr
    if (tr.loreMotivFr) hero.lore.motivationFr = tr.loreMotivFr

    writeFileSync(file, JSON.stringify(hero, null, 2), 'utf-8')
    updated += 1
  }
  console.log(`${updated} hero file(s) updated with French translations.`)
}

main()
