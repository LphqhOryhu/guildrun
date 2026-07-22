// Loads every hand-maintained hero JSON file at build time. Adding a new
// file to data/heroes/ is enough to make it show up in the app — no import
// list to keep in sync.
const modules = import.meta.glob('../../data/heroes/*.json', { eager: true })

export const heroes = Object.entries(modules)
  .map(([path, mod]) => ({ ...(mod.default ?? mod), _file: path.split('/').pop() }))
  .sort((a, b) => a.name.localeCompare(b.name))

export function getHeroByName(name) {
  return heroes.find((h) => h.name === name)
}

export const allClasses = [...new Set(heroes.flatMap((h) => h.classes))].sort()
export const allElements = [...new Set(heroes.flatMap((h) => h.elements))].sort()
export const allKeywords = ['Rush', 'Stall', 'Backup']
