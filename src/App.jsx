import { useState } from 'react'
import Roster from './pages/Roster.jsx'
import Items from './pages/Items.jsx'
import Relics from './pages/Relics.jsx'
import Builder from './pages/Builder.jsx'
import Journal from './pages/Journal.jsx'
import TierList from './pages/TierList.jsx'

const TABS = [
  { id: 'roster', label: 'Roster', Component: Roster },
  { id: 'items', label: 'Items', Component: Items },
  { id: 'relics', label: 'Relics', Component: Relics },
  { id: 'builder', label: 'Builder', Component: Builder },
  { id: 'journal', label: 'Journal', Component: Journal },
  { id: 'tierlist', label: 'Tier List', Component: TierList },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('roster')
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component ?? Roster

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">
          Guildrun
          <span>Codex & Builder</span>
        </h1>
        <nav className="app-nav">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="app-main">
        <ActiveComponent />
      </main>
      <footer className="app-footer">
        Données : <a href="https://guildrun.wiki/" target="_blank" rel="noreferrer">guildrun.wiki</a> (référence non-officielle) — non affilié à Leyline.
      </footer>
    </div>
  )
}
