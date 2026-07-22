export const STORAGE_KEYS = {
  BUILDS: 'guildrun.builds',
  RUNS: 'guildrun.runs',
  TIER_OVERRIDES: 'guildrun.tierOverrides',
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}
