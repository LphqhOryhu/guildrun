export default function HeroCard({ hero, onClick }) {
  return (
    <div className="hero-card" onClick={onClick}>
      <h3>{hero.name}</h3>
      <div className="stars">{'★'.repeat(hero.stars)}{'☆'.repeat(Math.max(0, 6 - hero.stars))}</div>
      <div className="badge-row">
        {hero.classes.map((c) => (
          <span key={c} className="badge badge-class">{c}</span>
        ))}
        {hero.elements.map((e) => (
          <span key={e} className="badge badge-element">{e}</span>
        ))}
      </div>
      {hero.keywords.length > 0 && (
        <div className="badge-row">
          {hero.keywords.map((k) => (
            <span key={k} className="badge badge-keyword">{k}</span>
          ))}
        </div>
      )}
    </div>
  )
}
