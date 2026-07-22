import { trClass, trMechanic, trKeyword } from '../data/frLabels.js'

export default function HeroCard({ hero, onClick }) {
  return (
    <div className="hero-card" onClick={onClick}>
      <h3>{hero.name}</h3>
      {hero.title && <div className="hero-title">{hero.titleFr ?? hero.title}</div>}
      <div className="badge-row">
        {hero.classes.map((c) => (
          <span key={c} className="badge badge-class">{trClass(c)}</span>
        ))}
        {hero.mechanics.map((m) => (
          <span key={m} className="badge badge-mechanic">{trMechanic(m)}</span>
        ))}
      </div>
      {hero.keywords.length > 0 && (
        <div className="badge-row">
          {hero.keywords.map((k) => (
            <span key={k} className="badge badge-keyword">{trKeyword(k)}</span>
          ))}
        </div>
      )}
    </div>
  )
}
