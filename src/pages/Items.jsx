import { useMemo, useState } from 'react'
import { items } from '../data/items.js'
import { rarityClass } from '../utils/rarityColor.js'
import { trRarity, trStat } from '../data/frLabels.js'

const allRarities = [...new Set(items.map((i) => i.rarity))].sort(
  (a, b) => items.filter((i) => i.rarity === b).length - items.filter((i) => i.rarity === a).length
)

export default function Items() {
  const [search, setSearch] = useState('')
  const [rarityFilter, setRarityFilter] = useState(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return items.filter((item) => {
      if (rarityFilter && item.rarity !== rarityFilter) return false
      if (q && !item.name.toLowerCase().includes(q) && !item.rawEffect.toLowerCase().includes(q)) return false
      return true
    })
  }, [search, rarityFilter])

  return (
    <div>
      <h2 className="section-title">Objets ({items.length})</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un objet..."
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
        <p className="empty-state">Aucun objet ne correspond à ces filtres.</p>
      ) : (
        <div className="item-grid">
          {filtered.map((item) => (
            <div className="item-card" key={item.name}>
              <div className="item-card-head">
                <h3>{item.name}</h3>
                <span className={`badge badge-rarity ${rarityClass(item.rarity)}`}>{trRarity(item.rarity)}</span>
              </div>
              {item.stats.length > 0 && (
                <div className="badge-row">
                  {item.stats.map((s, i) => (
                    <span key={i} className="badge badge-keyword">
                      {s.amount != null ? `+${s.amount} ${trStat(s.stat)}` : s.raw}
                    </span>
                  ))}
                </div>
              )}
              {item.rawEffect && <p className="ability-text">{item.rawEffect}</p>}
              <div className="item-card-foot">
                {item.shopPrice ? (
                  <span className="badge badge-mastery">{item.shopPrice.amount} éclats</span>
                ) : (
                  <span className="badge">Non vendu</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
