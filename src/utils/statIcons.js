// Maps the (probable) icon colors from the game's UI to stat names, per the
// legend in data/_uncertain.md. Used to color scaling badges consistently.
export const STAT_COLORS = {
  Magic: '#b083f0',
  Attack: '#e08a4f',
  HP: '#5fae6c',
  Shield: '#5fae6c',
  Mana: '#5b9bd5',
  unknown: '#8a8a8a',
}

export function statColor(stat) {
  return STAT_COLORS[stat] ?? STAT_COLORS.unknown
}
