import { useEffect, useRef, useState } from 'react'
import { STORAGE_KEYS, loadJSON, saveJSON, uid } from '../utils/storage.js'

const DIFFICULTIES = Array.from({ length: 8 }, (_, i) => i + 1)

export default function Journal() {
  const [builds] = useState(() => loadJSON(STORAGE_KEYS.BUILDS, []))
  const [runs, setRuns] = useState(() => loadJSON(STORAGE_KEYS.RUNS, []))
  const fileInputRef = useRef(null)

  const [buildId, setBuildId] = useState('')
  const [difficulty, setDifficulty] = useState(1)
  const [waveReached, setWaveReached] = useState('')
  const [result, setResult] = useState('victory')
  const [endlessScore, setEndlessScore] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    saveJSON(STORAGE_KEYS.RUNS, runs)
  }, [runs])

  function addRun(e) {
    e.preventDefault()
    if (!buildId) return
    const run = {
      id: uid(),
      timestamp: new Date().toISOString(),
      buildId,
      difficulty: Number(difficulty),
      waveReached: Number(waveReached) || 0,
      result,
      endlessScore: endlessScore ? Number(endlessScore) : null,
      notes: notes.trim(),
    }
    setRuns([run, ...runs])
    setWaveReached('')
    setEndlessScore('')
    setNotes('')
  }

  function deleteRun(id) {
    setRuns(runs.filter((r) => r.id !== id))
  }

  function exportRuns() {
    const blob = new Blob([JSON.stringify(runs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guildrun-journal-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importRuns(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result)
        if (Array.isArray(imported)) {
          setRuns(imported)
        }
      } catch {
        alert("Fichier JSON invalide, l'import a été annulé.")
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function buildName(id) {
    return builds.find((b) => b.id === id)?.name ?? 'Build supprimé'
  }

  return (
    <div>
      <h2 className="section-title">Journal de runs</h2>

      {builds.length === 0 ? (
        <p className="empty-state">Crée d'abord un build dans l'onglet Builder pour pouvoir logger une run.</p>
      ) : (
        <form className="panel" onSubmit={addRun}>
          <div className="form-grid">
            <div className="field">
              <label>Build</label>
              <select value={buildId} onChange={(e) => setBuildId(e.target.value)} required>
                <option value="" disabled>Choisir un build</option>
                {builds.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Difficulté</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Vague atteinte</label>
              <input type="number" min="0" value={waveReached} onChange={(e) => setWaveReached(e.target.value)} />
            </div>
            <div className="field">
              <label>Résultat</label>
              <select value={result} onChange={(e) => setResult(e.target.value)}>
                <option value="victory">Victoire</option>
                <option value="defeat">Défaite</option>
              </select>
            </div>
            <div className="field">
              <label>Score endless (optionnel)</label>
              <input type="number" min="0" value={endlessScore} onChange={(e) => setEndlessScore(e.target.value)} />
            </div>
          </div>
          <div className="field" style={{ marginTop: '0.8rem' }}>
            <label>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <button className="btn" type="submit" style={{ marginTop: '0.8rem' }}>Ajouter la run</button>
        </form>
      )}

      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
          <h3 style={{ margin: 0 }}>Historique ({runs.length})</h3>
          <div>
            <button className="btn-ghost" onClick={exportRuns} disabled={runs.length === 0}>Exporter JSON</button>
            <button className="btn-ghost" onClick={() => fileInputRef.current?.click()} style={{ marginLeft: '0.5rem' }}>
              Importer JSON
            </button>
            <input type="file" accept="application/json" ref={fileInputRef} onChange={importRuns} style={{ display: 'none' }} />
          </div>
        </div>

        {runs.length === 0 ? (
          <p className="empty-state">Aucune run enregistrée.</p>
        ) : (
          <table className="runs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Build</th>
                <th>Difficulté</th>
                <th>Vague</th>
                <th>Résultat</th>
                <th>Score</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id}>
                  <td>{new Date(run.timestamp).toLocaleDateString()}</td>
                  <td>{buildName(run.buildId)}</td>
                  <td>{run.difficulty}</td>
                  <td>{run.waveReached}</td>
                  <td className={run.result === 'victory' ? 'result-victory' : 'result-defeat'}>
                    {run.result === 'victory' ? 'Victoire' : 'Défaite'}
                  </td>
                  <td>{run.endlessScore ?? '—'}</td>
                  <td>{run.notes || '—'}</td>
                  <td>
                    <button className="btn-ghost btn-danger" onClick={() => deleteRun(run.id)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
