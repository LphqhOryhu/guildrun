import { useMemo, useState } from 'react'
import { relics } from '../data/relics.js'
import { rarityClass } from '../utils/rarityColor.js'
import { trRarity } from '../data/frLabels.js'

const allRarities = [...new Set(relics.map((r) => r.rarity))].sort(
  (a, b) => relics.filter((r) => r.rarity === b).length - relics.filter((r) => r.rarity === a).length
)

export default function Relics() {
  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return relics.filter((relic) => {
      if (rarityFilter && relic.rarity !== rarityFilter) return false
      if (q && !relic.name.toLowerCase().includes(q) && !relic.rawEffect.toLowerCase().includes(q)) return false
      return true
    })
  }, [search, rarityFilter])

  return (
    <div>
      <h2 className="section-title">Reliques ({relics.length})</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher une relique..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {allRarities.map((r) => (
          <button
            key={r}
            className={`chip ${rarityFilter === r ? 'active' : ''}`}
            onClick={() => setRarityFilter(rarityFilter === r ? null : r)}
          >
            {trRarity(r)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">Aucune relique ne correspond à ces filtres.</p>
      ) : (
        <div className="item-grid">
          {filtered.map((relic, i) => (
            <div className="item-card" key={`${relic.name}-${i}`}>
              <div className="item-card-head">
                <h3>{relic.name}</h3>
                <span className={`badge badge-rarity ${rarityClass(relic.rarity)}`}>{trRarity(relic.rarity)}</span>
              </div>
              {relic.rawEffect && <p className="ability-text">{relic.rawEffect}</p>}
              <div className="item-card-foot">
                {relic.shopPrice ? (
                  <span className="badge badge-mastery">{relic.shopPrice.amount} éclats</span>
                ) : (
                  <span className="badge">Non vendue</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
