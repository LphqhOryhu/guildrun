import ScalingBadge from './ScalingBadge.jsx'

export default function HeroDetailModal({ hero, onClose }) {
  if (!hero) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{hero.name}</h2>
        <div className="stars">{'★'.repeat(hero.stars)}{'☆'.repeat(Math.max(0, 6 - hero.stars))}</div>
        <div className="badge-row" style={{ marginTop: '0.5rem' }}>
          {hero.classes.map((c) => (
            <span key={c} className="badge badge-class">{c}</span>
          ))}
          {hero.elements.map((e) => (
            <span key={e} className="badge badge-element">{e}</span>
          ))}
        </div>

        <div className="ability-block">
          <h4>
            <span>{hero.active.name}</span>
            <span className="mana-cost">{hero.active.manaCost} mana</span>
          </h4>
          <p className="ability-text">{hero.active.rawText}</p>
          <div className="badge-row">
            {hero.active.scalings.map((s, i) => (
              <ScalingBadge key={i} scaling={s} />
            ))}
          </div>
        </div>

        {hero.passives.map((passive, i) => (
          <div className="ability-block" key={i}>
            <h4>
              <span>{passive.name}</span>
              {passive.masteryAvailable && <span className="badge badge-mastery">Mastery available</span>}
            </h4>
            <p className="ability-text">{passive.rawText}</p>
            <div className="badge-row">
              {passive.keywords.map((k) => (
                <span key={k} className="badge badge-keyword">{k}</span>
              ))}
              {passive.scalings.map((s, j) => (
                <ScalingBadge key={j} scaling={s} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
