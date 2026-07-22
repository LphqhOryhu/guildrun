// Shared EN -> FR glossary for game terms, so the same word is translated the
// same way everywhere (badges, filters, and inside translated ability text).
// The underlying data stays in English (matches guildrun.wiki, keeps filter
// logic simple); these maps are display-only.

export const CLASS_FR = {
  Warrior: 'Guerrier',
  Vanguard: 'Avant-garde',
  Tank: 'Tank',
  Mystic: 'Mystique',
  Mage: 'Mage',
  Duelist: 'Duelliste',
  Assassin: 'Assassin',
}

export const MECHANIC_FR = {
  Burn: 'Brûlure',
  Frost: 'Givre',
  Poison: 'Poison',
  Crit: 'Critique',
  Shields: 'Boucliers',
  Stall: 'Attente',
  Rush: 'Charge',
  Shards: 'Éclats',
  Omnivamp: 'Vol de vie',
  Stealth: 'Invisibilité',
}

export const KEYWORD_FR = {
  Rush: 'Charge',
  Stall: 'Attente',
  Backup: 'Réserve',
}

export const RARITY_FR = {
  Common: 'Commun',
  Rare: 'Rare',
  Epic: 'Épique',
  Legendary: 'Légendaire',
  'Legendary (Quest)': 'Légendaire (Quête)',
  Unique: 'Unique',
  Enemy: 'Ennemi',
  'Act Boss': 'Boss d’acte',
  'Single-Battle Boost': 'Bonus (1 combat)',
  'Team Size': 'Taille d’équipe',
}

export const ABILITY_TYPE_FR = {
  Active: 'Active',
  Passive: 'Passive',
}

export const STAT_FR = {
  'Max HP': 'PV Max',
  HP: 'PV',
  Attack: 'Attaque',
  Magic: 'Magie',
  Defense: 'Défense',
  'Attack Speed': 'Vitesse d’attaque',
  Crit: 'Critique',
  'Mana Regen': 'Régén. Mana',
  Omnivamp: 'Vol de vie',
  'HP/s': 'PV/s',
  'Starting Mana': 'Mana de départ',
  'Max Mana': 'Mana Max',
  'Mana Lock (s)': 'Verrou de Mana (s)',
  'Move Speed': 'Vitesse de déplacement',
  'Projectile Speed': 'Vitesse de projectile',
  'Attack Range': 'Portée',
  'Base Attack Damage': 'Dégâts d’attaque de base',
  'Base Attack Speed': 'Vitesse d’attaque de base',
}

export function trClass(v) {
  return CLASS_FR[v] ?? v
}
export function trMechanic(v) {
  return MECHANIC_FR[v] ?? v
}
export function trKeyword(v) {
  return KEYWORD_FR[v] ?? v
}
export function trRarity(v) {
  return RARITY_FR[v] ?? v
}
export function trAbilityType(v) {
  return ABILITY_TYPE_FR[v] ?? v
}
export function trStat(v) {
  return STAT_FR[v] ?? v
}
