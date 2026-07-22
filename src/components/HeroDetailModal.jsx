import ScalingBadge from './ScalingBadge.jsx'
import { getModifiersForClass } from '../data/rankModifiers.js'

export default function HeroDetailModal({ hero, onClose }) {
  if (!hero) return null

  const hasLore = hero.lore && (hero.lore.guild || hero.lore.currentWork || hero.lore.motivation)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{hero.name}</h2>
        {hero.title && <div className="hero-title">{hero.title}</div>}
        <div className="badge-row" style={{ marginTop: '0.5rem' }}>
          {hero.guild && <span className="badge badge-guild">{hero.guild}</span>}
          {hero.attackType && <span className="badge badge-class">{hero.attackType}</span>}
          {hero.classes.map((c) => (
            <span key={c} className="badge badge-class">{c}</span>
          ))}
          {hero.mechanics.map((m) => (
            <span key={m} className="badge badge-mechanic">{m}</span>
          ))}
        </div>
        {hero.quote && <p className="hero-quote">"{hero.quote}"</p>}

        <div className="ability-block">
          <h4>Stats de base (rang C)</h4>
          <div className="stat-grid">
            {Object.entries(hero.baseStatsRankC).map(([label, value]) => (
              <div className="stat-cell" key={label}>
                <span className="stat-cell-label">{label}</span>
                <span className="stat-cell-value">{value}</span>
              </div>
            ))}
          </div>
          <div className="badge-row" style={{ marginTop: '0.6rem' }}>
            <span className="badge badge-mastery">EHP {hero.derivedComposites.ehp}</span>
            <span className="badge badge-mastery">EOFF {hero.derivedComposites.eoff}</span>
            <span className="badge badge-mastery">Sec/cast {hero.derivedComposites.secPerCast}</span>
          </div>
        </div>

        {Object.keys(hero.rankUpGainsPerRankUp).length > 0 && (
          <div className="ability-block">
            <h4>Gains automatiques (à chaque rank-up)</h4>
            <div className="badge-row">
              {Object.entries(hero.rankUpGainsPerRankUp).map(([stat, value]) => (
                <span key={stat} className="badge badge-keyword">{stat} {value}</span>
              ))}
            </div>
          </div>
        )}

        <div className="ability-block">
          <h4>
            <span>{hero.startingAbility.name}</span>
            {hero.startingAbility.type && <span className="mana-cost">{hero.startingAbility.type}</span>}
          </h4>
          <p className="ability-text">{hero.startingAbility.rawText}</p>
          <div className="badge-row">
            {hero.startingAbility.scalings.map((s, i) => (
              <ScalingBadge key={i} scaling={s} />
            ))}
          </div>
        </div>

        <h4 className="section-subtitle">Spécialisations de rang B (choisis-en une)</h4>
        {hero.rankBSpecializations.map((spec, i) => (
          <div className="ability-block" key={i}>
            <h4>
              <span>
                {spec.name}
                {spec.abilityName && spec.abilityName !== spec.name && ` — ${spec.abilityName}`}
              </span>
              {spec.addsClass && <span className="badge badge-adds-class">+ {spec.addsClass}</span>}
            </h4>
            <p className="ability-text">{spec.rawText}</p>
            <div className="badge-row">
              {spec.type && <span className="badge badge-mastery">{spec.type}</span>}
              {spec.addedAbility && <span className="badge badge-adds-class">Nouvelle abilité</span>}
              {spec.keywords.map((k) => (
                <span key={k} className="badge badge-keyword">{k}</span>
              ))}
              {spec.scalings.map((s, j) => (
                <ScalingBadge key={j} scaling={s} />
              ))}
            </div>
          </div>
        ))}

        {hero.rankASClassPools.length > 0 && (
          <div className="ability-block">
            <h4>Pools de modificateurs de rang A/S</h4>
            {hero.rankASClassPools.map((pool) => {
              const count = getModifiersForClass(pool.class).length
              return (
                <div className="stat-row" key={pool.class}>
                  <span>
                    <span className="badge badge-class">{pool.class}</span>{' '}
                    {pool.base ? 'classe de base' : `via ${pool.unlockedBy}`}
                  </span>
                  <span>{count} modificateurs</span>
                </div>
              )
            })}
          </div>
        )}

        {hasLore && (
          <div className="ability-block">
            <h4>Lore</h4>
            {hero.lore.guild && <p className="ability-text"><strong>Guilde:</strong> {hero.lore.guild}</p>}
            {hero.lore.currentWork && <p className="ability-text"><strong>Occupation:</strong> {hero.lore.currentWork}</p>}
            {hero.lore.motivation && <p className="ability-text"><strong>Motivation:</strong> {hero.lore.motivation}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
