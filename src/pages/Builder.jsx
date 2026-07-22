import { useMemo, useState, useEffect } from 'react'
import { heroes, getHeroByName } from '../data/heroes.js'
import { getModifiersForClass } from '../data/rankModifiers.js'
import { trClass, trMechanic, trKeyword } from '../data/frLabels.js'
import { STORAGE_KEYS, loadJSON, saveJSON, uid } from '../utils/storage.js'

const MIN_HEROES = 3
const MAX_HEROES = 6
const CLASS_THRESHOLD = 3

export default function Builder() {
  const [selection, setSelection] = useState([]) // [{ heroId, specIndex }]
  const [builds, setBuilds] = useState(() => loadJSON(STORAGE_KEYS.BUILDS, []))
  const [buildName, setBuildName] = useState('')

  useEffect(() => {
    saveJSON(STORAGE_KEYS.BUILDS, builds)
  }, [builds])

  const availableHeroes = heroes.filter((h) => !selection.some((s) => s.heroId === h.name))

  function addHero(heroName) {
    if (selection.length >= MAX_HEROES) return
    setSelection([...selection, { heroId: heroName, specIndex: 0 }])
  }

  function removeHero(heroName) {
    setSelection(selection.filter((s) => s.heroId !== heroName))
  }

  function setSpec(heroName, specIndex) {
    setSelection(selection.map((s) => (s.heroId === heroName ? { ...s, specIndex } : s)))
  }

  const analysis = useMemo(() => analyzeSelection(selection), [selection])

  function saveBuild() {
    if (selection.length < MIN_HEROES || !buildName.trim()) return
    const build = { id: uid(), name: buildName.trim(), createdAt: new Date().toISOString(), heroes: selection }
    setBuilds([...builds, build])
    setBuildName('')
  }

  function loadBuild(build) {
    setSelection(build.heroes)
    setBuildName(build.name)
  }

  function deleteBuild(id) {
    setBuilds(builds.filter((b) => b.id !== id))
  }

  return (
    <div>
      <h2 className="section-title">Constructeur d'équipe</h2>

      <div className="grid-2">
        <div className="panel">
          <h3>Héros disponibles</h3>
          {availableHeroes.length === 0 ? (
            <p className="empty-state">Tous les héros sont sélectionnés ou l'équipe est complète.</p>
          ) : (
            <div className="hero-grid">
              {availableHeroes.map((hero) => (
                <div key={hero.name} className="hero-card" onClick={() => addHero(hero.name)}>
                  <h3>{hero.name}</h3>
                  <div className="badge-row">
                    {hero.classes.map((c) => <span key={c} className="badge badge-class">{trClass(c)}</span>)}
                    {hero.mechanics.map((m) => <span key={m} className="badge badge-mechanic">{trMechanic(m)}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Équipe ({selection.length}/{MAX_HEROES})</h3>
          {selection.length === 0 ? (
            <p className="empty-state">Sélectionne 3 à 6 héros pour composer une équipe.</p>
          ) : (
            selection.map((entry) => {
              const hero = getHeroByName(entry.heroId)
              return (
                <div key={entry.heroId} className="ability-block">
                  <h4>
                    <span>{hero.name}</span>
                    <button className="btn-ghost" onClick={() => removeHero(hero.name)}>Retirer</button>
                  </h4>
                  <div className="form-grid">
                    {hero.rankBSpecializations.map((spec, i) => (
                      <label key={i} className="field" style={{ cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`spec-${hero.name}`}
                          checked={entry.specIndex === i}
                          onChange={() => setSpec(hero.name, i)}
                          style={{ width: 'auto', marginRight: '0.4rem' }}
                        />
                        {spec.nameFr ?? spec.name}
                        {spec.addsClass && (
                          <span className="badge badge-adds-class" style={{ marginLeft: '0.4rem' }}>+ {trClass(spec.addsClass)}</span>
                        )}
                        {spec.keywords.length > 0 && (
                          <span style={{ marginLeft: '0.4rem' }}>
                            {spec.keywords.map((k) => (
                              <span key={k} className="badge badge-keyword" style={{ marginLeft: '0.2rem' }}>{trKeyword(k)}</span>
                            ))}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })
          )}

          <div className="field" style={{ marginTop: '1rem' }}>
            <label>Nom du build</label>
            <input
              type="text"
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              placeholder="ex: Mages Charge x3"
            />
          </div>
          <button
            className="btn"
            disabled={selection.length < MIN_HEROES || !buildName.trim()}
            onClick={saveBuild}
            style={{ marginTop: '0.6rem' }}
          >
            Sauvegarder le build
          </button>
        </div>
      </div>

      <div className="panel">
        <h3>Analyse de l'équipe</h3>
        {selection.length === 0 ? (
          <p className="empty-state">Aucune analyse : compose d'abord une équipe.</p>
        ) : (
          <>
            <div className="stat-row">
              <span>Répartition des classes</span>
              <span>
                {Object.entries(analysis.classCounts).map(([cls, count]) => (
                  <span key={cls} className={`badge badge-class`} style={{ marginLeft: '0.3rem' }}>
                    {trClass(cls)} : {count}{count >= CLASS_THRESHOLD ? ' ✦ seuil atteint' : ''}
                  </span>
                ))}
              </span>
            </div>

            <div className="stat-row">
              <span>Mécaniques couvertes</span>
              <span>
                {analysis.mechanics.length === 0
                  ? '—'
                  : analysis.mechanics.map((m) => (
                      <span key={m} className="badge badge-mechanic" style={{ marginLeft: '0.3rem' }}>{trMechanic(m)}</span>
                    ))}
              </span>
            </div>

            <div className="stat-row">
              <span>Charge vs Attente (spés choisies)</span>
              <span>Charge : {analysis.rushCount} — Attente : {analysis.stallCount}</span>
            </div>

            {analysis.rushCount > 0 && analysis.stallCount > 0 && (
              <div className="warning-box">
                Le build mixe des spécialisations Charge et Attente sans timing dominant clair — vérifie que ta stratégie
                (agressive vs attentiste) reste cohérente.
              </div>
            )}

            <div className="stat-row">
              <span>Couverture Réserve</span>
              <span>{analysis.backupCount} héros avec spécialisation Réserve choisie</span>
            </div>
            {analysis.backupCount === 0 && (
              <div className="warning-box">Aucune spécialisation Réserve active : les héros au banc ne profitent d'aucun bonus.</div>
            )}

            <div className="stat-row">
              <span>Pools de modificateurs rang A/S en jeu</span>
              <span>
                {analysis.classesInPlay.map((cls) => (
                  <span key={cls} className="badge badge-class" style={{ marginLeft: '0.3rem' }}>
                    {trClass(cls)} : {getModifiersForClass(cls).length}
                  </span>
                ))}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="panel">
        <h3>Builds sauvegardés</h3>
        {builds.length === 0 ? (
          <p className="empty-state">Aucun build sauvegardé pour l'instant.</p>
        ) : (
          builds.map((build) => (
            <div className="tier-row" key={build.id}>
              <span className="name">{build.name}</span>
              <span className="metrics">{build.heroes.length} héros</span>
              <button className="btn-ghost" onClick={() => loadBuild(build)}>Charger</button>
              <button className="btn-ghost btn-danger" onClick={() => deleteBuild(build.id)}>Supprimer</button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function analyzeSelection(selection) {
  const classCounts = {}
  const mechanicsSet = new Set()
  const classesInPlay = new Set()
  let rushCount = 0
  let stallCount = 0
  let backupCount = 0

  for (const entry of selection) {
    const hero = getHeroByName(entry.heroId)
    if (!hero) continue
    for (const cls of hero.classes) {
      classCounts[cls] = (classCounts[cls] || 0) + 1
      classesInPlay.add(cls)
    }
    for (const m of hero.mechanics) {
      mechanicsSet.add(m)
    }
    const chosenSpec = hero.rankBSpecializations[entry.specIndex]
    if (chosenSpec) {
      // Picking a class-adding specialization makes this hero count as that
      // class too, which opens its rank A/S modifier pool.
      if (chosenSpec.addsClass) {
        classCounts[chosenSpec.addsClass] = (classCounts[chosenSpec.addsClass] || 0) + 1
        classesInPlay.add(chosenSpec.addsClass)
      }
      if (chosenSpec.keywords.includes('Rush')) rushCount += 1
      if (chosenSpec.keywords.includes('Stall')) stallCount += 1
      if (chosenSpec.keywords.includes('Backup')) backupCount += 1
    }
  }

  return {
    classCounts,
    mechanics: [...mechanicsSet],
    classesInPlay: [...classesInPlay],
    rushCount,
    stallCount,
    backupCount,
  }
}
