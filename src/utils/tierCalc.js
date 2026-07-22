// Derives per-hero and per-build performance stats from the run journal,
// then converts them into a tier (S/A/B/C/D) using a simple weighted score.
// Manual overrides (stored separately) always win over the computed tier.

function emptyStat() {
  return { total: 0, wins: 0, waveSum: 0, maxDifficulty: 0, maxDifficultyWin: 0, endlessScores: [] }
}

function accumulate(stat, run) {
  stat.total += 1
  if (run.result === 'victory') stat.wins += 1
  stat.waveSum += Number(run.waveReached) || 0
  stat.maxDifficulty = Math.max(stat.maxDifficulty, Number(run.difficulty) || 0)
  if (run.result === 'victory') {
    stat.maxDifficultyWin = Math.max(stat.maxDifficultyWin, Number(run.difficulty) || 0)
  }
  if (run.endlessScore) stat.endlessScores.push(Number(run.endlessScore) || 0)
}

function finalize(stat) {
  const winrate = stat.total ? stat.wins / stat.total : 0
  const avgWave = stat.total ? stat.waveSum / stat.total : 0
  const bestEndless = stat.endlessScores.length ? Math.max(...stat.endlessScores) : 0
  return {
    totalRuns: stat.total,
    wins: stat.wins,
    winrate,
    avgWave,
    maxDifficulty: stat.maxDifficulty,
    maxDifficultyWin: stat.maxDifficultyWin,
    bestEndless,
    score: scoreFor({ winrate, avgWave, maxDifficultyWin: stat.maxDifficultyWin }),
  }
}

// Weighted composite: winrate matters most, then how deep runs typically go,
// then the hardest difficulty actually cleared. Normalizations are heuristic
// (wave 20 / difficulty 8 treated as "maxed out") since there's no ground
// truth yet for what a "full" run looks like.
function scoreFor({ winrate, avgWave, maxDifficultyWin }) {
  const waveNorm = Math.min(avgWave / 20, 1)
  const difficultyNorm = Math.min(maxDifficultyWin / 8, 1)
  return winrate * 0.5 + waveNorm * 0.3 + difficultyNorm * 0.2
}

export function scoreToTier(score) {
  if (score >= 0.8) return 'S'
  if (score >= 0.6) return 'A'
  if (score >= 0.4) return 'B'
  if (score >= 0.2) return 'C'
  return 'D'
}

export function computeHeroStats(runs, builds) {
  const buildById = new Map(builds.map((b) => [b.id, b]))
  const stats = new Map()

  for (const run of runs) {
    const build = buildById.get(run.buildId)
    if (!build) continue
    for (const entry of build.heroes) {
      if (!stats.has(entry.heroId)) stats.set(entry.heroId, emptyStat())
      accumulate(stats.get(entry.heroId), run)
    }
  }

  const result = {}
  for (const [heroId, stat] of stats.entries()) {
    result[heroId] = finalize(stat)
  }
  return result
}

export function computeBuildStats(runs, builds) {
  const buildById = new Map(builds.map((b) => [b.id, b]))
  const stats = new Map()

  for (const run of runs) {
    if (!buildById.has(run.buildId)) continue
    if (!stats.has(run.buildId)) stats.set(run.buildId, emptyStat())
    accumulate(stats.get(run.buildId), run)
  }

  const result = {}
  for (const [buildId, stat] of stats.entries()) {
    result[buildId] = { ...finalize(stat), buildName: buildById.get(buildId)?.name ?? 'Build supprimé' }
  }
  return result
}
