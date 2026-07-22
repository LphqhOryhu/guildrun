// Best-effort color coding for stat scaling badges - purely a visual aid,
// not sourced from any official icon legend for this game.
export const STAT_COLORS = {
  Magic: '#b083f0',
  Attack: '#e08a4f',
  HP: '#5fae6c',
  'Max HP': '#5fae6c',
  Shield: '#5fae6c',
  Mana: '#5b9bd5',
  'Mana Regen': '#5b9bd5',
  Defense: '#6f8fb0',
  'Attack Speed': '#d9c25a',
  Crit: '#d9546a',
  Omnivamp: '#7fcdbb',
  unknown: '#8a8a8a',
}

export function statColor(stat) {
  return STAT_COLORS[stat] ?? STAT_COLORS.unknown
}
