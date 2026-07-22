// Loads every hand-maintained hero JSON file at build time. Adding a new
// file to data/heroes/ is enough to make it show up in the app — no import
// list to keep in sync.
const modules = import.meta.glob('../../data/heroes/*.json', { eager: true })

export const heroes = Object.entries(modules)
  .map(([path, mod]) => {
    const hero = { ...(mod.default ?? mod), _file: path.split('/').pop() }
    // Rush/Stall/Backup live on each rank B specialization, not the hero
    // itself - a hero "has" a keyword if any of its 3 specs carry it, since
    // the player might pick that one.
    hero.keywords = [...new Set(hero.rankBSpecializations.flatMap((s) => s.keywords))]
    return hero
  })
  .sort((a, b) => a.name.localeCompare(b.name))

export function getHeroByName(name) {
  return heroes.find((h) => h.name === name)
}

export const allClasses = [...new Set(heroes.flatMap((h) => h.classes))].sort()
export const allMechanics = [...new Set(heroes.flatMap((h) => h.mechanics))].sort()
export const allKeywords = ['Rush', 'Stall', 'Backup']
