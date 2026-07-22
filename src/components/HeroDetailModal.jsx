import ScalingBadge from './ScalingBadge.jsx'
import { getModifiersForClass } from '../data/rankModifiers.js'
import { trClass, trMechanic, trKeyword, trAbilityType, trStat } from '../data/frLabels.js'

export default function HeroDetailModal({ hero, onClose }) {
  if (!hero) return null

  const hasLore = hero.lore && (hero.lore.guild || hero.lore.currentWork || hero.lore.motivation)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{hero.name}</h2>
        {hero.title && <div className="hero-title">{hero.titleFr ?? hero.title}</div>}
        <div className="badge-row" style={{ marginTop: '0.5rem' }}>
          {hero.guild && <span className="badge badge-guild">{hero.guild}</span>}
          {hero.attackType && <span className="badge badge-class">{hero.attackType}</span>}
          {hero.classes.map((c) => (
            <span key={c} className="badge badge-class">{trClass(c)}</span>
          ))}
          {hero.mechanics.map((m) => (
            <span key={m} className="badge badge-mechanic">{trMechanic(m)}</span>
          ))}
        </div>
        {hero.quote && <p className="hero-quote">« {hero.quoteFr ?? hero.quote} »</p>}

        <div className="ability-block">
          <h4>Stats de base (rang C)</h4>
          <div className="stat-grid">
            {Object.entries(hero.baseStatsRankC).map(([label, value]) => (
              <div className="stat-cell" key={label}>
                <span className="stat-cell-label">{trStat(label)}</span>
                <span className="stat-cell-value">{value}</span>
              </div>
            ))}
          </div>
          <div className="badge-row" style={{ marginTop: '0.6rem' }}>
            <span className="badge badge-mastery">EHP {hero.derivedComposites.ehp}</span>
            <span className="badge badge-mastery">EOFF {hero.derivedComposites.eoff}</span>
            <span className="badge badge-mastery">Sec/lancer {hero.derivedComposites.secPerCast}</span>
          </div>
        </div>

        {Object.keys(hero.rankUpGainsPerRankUp).length > 0 && (
          <div className="ability-block">
            <h4>Gains automatiques (à chaque rank-up)</h4>
            <div className="badge-row">
              {Object.entries(hero.rankUpGainsPerRankUp).map(([stat, value]) => (
                <span key={stat} className="badge badge-keyword">{trStat(stat)} {value}</span>
              ))}
            </div>
          </div>
        )}

        <div className="ability-block">
          <h4>
            <span>{hero.startingAbility.nameFr ?? hero.startingAbility.name}</span>
            {hero.startingAbility.type && <span className="mana-cost">{trAbilityType(hero.startingAbility.type)}</span>}
          </h4>
          <p className="ability-text">{hero.startingAbility.rawTextFr ?? hero.startingAbility.rawText}</p>
          <div className="badge-row">
            {hero.startingAbility.scalings.map((s, i) => (
              <ScalingBadge key={i} scaling={s} />
            ))}
          </div>
        </div>

        <h4 className="section-subtitle">Spécialisations de rang B (choisis-en une)</h4>
        {hero.rankBSpecializations.map((spec, i) => {
          const displayName = spec.nameFr ?? spec.name
          const displayAbilityName = spec.abilityNameFr ?? spec.abilityName
          return (
            <div className="ability-block" key={i}>
              <h4>
                <span>
                  {displayName}
                  {displayAbilityName && displayAbilityName !== displayName && ` — ${displayAbilityName}`}
                </span>
                {spec.addsClass && <span className="badge badge-adds-class">+ {trClass(spec.addsClass)}</span>}
              </h4>
              <p className="ability-text">{spec.rawTextFr ?? spec.rawText}</p>
              <div className="badge-row">
                {spec.type && <span className="badge badge-mastery">{trAbilityType(spec.type)}</span>}
                {spec.addedAbility && <span className="badge badge-adds-class">Nouvelle abilité</span>}
                {spec.keywords.map((k) => (
                  <span key={k} className="badge badge-keyword">{trKeyword(k)}</span>
                ))}
                {spec.scalings.map((s, j) => (
                  <ScalingBadge key={j} scaling={s} />
                ))}
              </div>
            </div>
          )
        })}

        {hero.rankASClassPools.length > 0 && (
          <div className="ability-block">
            <h4>Pools de modificateurs de rang A/S</h4>
            {hero.rankASClassPools.map((pool) => {
              const count = getModifiersForClass(pool.class).length
              const unlockSpec = hero.rankBSpecializations.find((s) => s.name === pool.unlockedBy)
              const unlockLabel = unlockSpec ? unlockSpec.nameFr ?? unlockSpec.name : pool.unlockedBy
              return (
                <div className="stat-row" key={pool.class}>
                  <span>
                    <span className="badge badge-class">{trClass(pool.class)}</span>{' '}
                    {pool.base ? 'classe de base' : `via ${unlockLabel}`}
                  </span>
                  <span>{count} modificateurs</span>
                </div>
              )
            })}
          </div>
        )}

        {hasLore && (
          <div className="ability-block">
            <h4>Historique</h4>
            {hero.lore.guild && (
              <p className="ability-text"><strong>Guilde :</strong> {hero.lore.guildFr ?? hero.lore.guild}</p>
            )}
            {hero.lore.currentWork && (
              <p className="ability-text"><strong>Occupation :</strong> {hero.lore.currentWorkFr ?? hero.lore.currentWork}</p>
            )}
            {hero.lore.motivation && (
              <p className="ability-text"><strong>Motivation :</strong> {hero.lore.motivationFr ?? hero.lore.motivation}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
