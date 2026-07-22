// Best-effort color coding for rarity badges across items and relics -
// relics have a few extra non-standard "rarity" categories (Enemy, Act Boss,
// Single-Battle Boost, Team Size) beyond the usual Common..Unique ladder.
const RARITY_CLASSES = {
  Common: 'rarity-common',
  Rare: 'rarity-rare',
  Epic: 'rarity-epic',
  Legendary: 'rarity-legendary',
  'Legendary (Quest)': 'rarity-legendary',
  Unique: 'rarity-unique',
  Enemy: 'rarity-enemy',
  'Act Boss': 'rarity-enemy',
  'Single-Battle Boost': 'rarity-other',
  'Team Size': 'rarity-other',
}

export function rarityClass(rarity) {
  return RARITY_CLASSES[rarity] ?? 'rarity-other'
}
