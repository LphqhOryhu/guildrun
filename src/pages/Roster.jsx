import { useMemo, useState } from 'react'
import { heroes, allClasses, allElements, allKeywords } from '../data/heroes.js'
import HeroCard from '../components/HeroCard.jsx'
import HeroDetailModal from '../components/HeroDetailModal.jsx'

export default function Roster() {
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState(null)
  const [elementFilter, setElementFilter] = useState(null)
  const [keywordFilter, setKeywordFilter] = useState(null)
  const [selectedHero, setSelectedHero] = useState(null)

  const filtered = useMemo(() => {
    return heroes.filter((hero) => {
      if (search && !hero.name.toLowerCase().includes(search.toLowerCase())) return false
      if (classFilter && !hero.classes.includes(classFilter)) return false
      if (elementFilter && !hero.elements.includes(elementFilter)) return false
      if (keywordFilter && !hero.keywords.includes(keywordFilter)) return false
      return true
    })
  }, [search, classFilter, elementFilter, keywordFilter])

  function toggle(setter, current, value) {
    setter(current === value ? null : value)
  }

  return (
    <div>
      <h2 className="section-title">Roster</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un héros..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {allClasses.map((c) => (
          <button
            key={c}
            className={`chip ${classFilter === c ? 'active' : ''}`}
            onClick={() => toggle(setClassFilter, classFilter, c)}
          >
            {c}
          </button>
        ))}
        {allElements.map((e) => (
          <button
            key={e}
            className={`chip ${elementFilter === e ? 'active' : ''}`}
            onClick={() => toggle(setElementFilter, elementFilter, e)}
          >
            {e}
          </button>
        ))}
        {allKeywords.map((k) => (
          <button
            key={k}
            className={`chip ${keywordFilter === k ? 'active' : ''}`}
            onClick={() => toggle(setKeywordFilter, keywordFilter, k)}
          >
            {k}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">Aucun héros ne correspond à ces filtres.</p>
      ) : (
        <div className="hero-grid">
          {filtered.map((hero) => (
            <HeroCard key={hero.name} hero={hero} onClick={() => setSelectedHero(hero)} />
          ))}
        </div>
      )}

      <HeroDetailModal hero={selectedHero} onClose={() => setSelectedHero(null)} />
    </div>
  )
}
