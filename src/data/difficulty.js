// The 8 difficulties from World / Systems > Difficulty. They stack (each
// pick keeps every effect below it and adds one more); Endless score bonus
// is +2 per step except Red Rift, which is a separate leaderboard/contract
// and doesn't feed Endless at all.
export const DIFFICULTIES = [
  { label: 'Base', endlessBonus: 0 },
  { label: 'C', endlessBonus: 2 },
  { label: 'B', endlessBonus: 4 },
  { label: 'A', endlessBonus: 6 },
  { label: 'S', endlessBonus: 8 },
  { label: 'SS', endlessBonus: 10 },
  { label: 'SSS', endlessBonus: 12 },
  { label: 'Red Rift', endlessBonus: null },
]

export function difficultyIndex(label) {
  const i = DIFFICULTIES.findIndex((d) => d.label === label)
  return i === -1 ? 0 : i
}
