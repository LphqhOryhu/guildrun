import { useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS, loadJSON, saveJSON } from '../utils/storage.js'
import { computeHeroStats, computeBuildStats, scoreToTier } from '../utils/tierCalc.js'

const TIERS = ['S', 'A', 'B', 'C', 'D']

export default function TierList() {
  const [runs] = useState(() => loadJSON(STORAGE_KEYS.RUNS, []))
  const [builds] = useState(() => loadJSON(STORAGE_KEYS.BUILDS, []))
  const [overrides, setOverrides] = useState(() =>
    loadJSON(STORAGE_KEYS.TIER_OVERRIDES, { heroes: {}, builds: {} })
  )

  useEffect(() => {
    saveJSON(STORAGE_KEYS.TIER_OVERRIDES, overrides)
  }, [overrides])

  const heroStats = useMemo(() => computeHeroStats(runs, builds), [runs, builds])
  const buildStats = useMemo(() => computeBuildStats(runs, builds), [runs, builds])

  const heroRows = useMemo(
    () =>
      Object.entries(heroStats)
        .map(([heroId, stat]) => ({ id: heroId, name: heroId, ...stat }))
        .sort((a, b) => b.score - a.score),
    [heroStats]
  )

  const buildRows = useMemo(
    () =>
      Object.entries(buildStats)
        .map(([buildId, stat]) => ({ id: buildId, name: stat.buildName, ...stat }))
        .sort((a, b) => b.score - a.score),
    [buildStats]
  )

  function setOverride(category, id, tier) {
    setOverrides((prev) => {
      const next = { ...prev, [category]: { ...prev[category] } }
      if (tier) next[category][id] = tier
      else delete next[category][id]
      return next
    })
  }

  return (
    <div>
      <h2 className="section-title">Tier list perso</h2>
      <p className="ability-text">
        Calculée à partir du journal de runs (winrate, progression moyenne, difficulté max atteinte en victoire).
        Tu peux forcer un tier manuellement — il sera marqué "manuel" et prime sur le calcul.
      </p>

      <div className="panel">
        <h3>Par héros</h3>
        {heroRows.length === 0 ? (
          <p className="empty-state">Aucune donnée. Logue des runs dans le Journal pour peupler cette liste.</p>
        ) : (
          heroRows.map((row) => (
            <TierRow
              key={row.id}
              row={row}
              overrideTier={overrides.heroes[row.id]}
              onOverride={(tier) => setOverride('heroes', row.id, tier)}
            />
          ))
        )}
      </div>

      <div className="panel">
        <h3>Par build</h3>
        {buildRows.length === 0 ? (
          <p className="empty-state">Aucune donnée. Logue des runs dans le Journal pour peupler cette liste.</p>
        ) : (
          buildRows.map((row) => (
            <TierRow
              key={row.id}
              row={row}
              overrideTier={overrides.builds[row.id]}
              onOverride={(tier) => setOverride('builds', row.id, tier)}
            />
          ))
        )}
      </div>
    </div>
  )
}

function TierRow({ row, overrideTier, onOverride }) {
  const computedTier = scoreToTier(row.score)
  const displayedTier = overrideTier || computedTier

  return (
    <div className="tier-row">
      <div className={`hex-badge tier-${displayedTier}`}>{displayedTier}</div>
      <span className="name">
        {row.name}
        {overrideTier && <span className="badge badge-mastery" style={{ marginLeft: '0.5rem' }}>manuel</span>}
      </span>
      <span className="metrics">
        <span>{row.wins}/{row.totalRuns} victoires ({Math.round(row.winrate * 100)}%)</span>
        <span>vague moy. {row.avgWave.toFixed(1)}</span>
        <span>diff. max (victoire) {row.maxDifficultyWin}</span>
      </span>
      <select
        className="override-select"
        value={overrideTier || ''}
        onChange={(e) => onOverride(e.target.value || null)}
      >
        <option value="">Auto ({computedTier})</option>
        {TIERS.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
    </div>
  )
}
