import raw from '../../data/rank-modifiers.json'

export const rankModifiers = raw

export function getModifiersForClass(className) {
  return rankModifiers.filter((m) => m.class === className)
}
