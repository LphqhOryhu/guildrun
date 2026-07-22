#!/usr/bin/env node
// Copies newly-extracted hero JSON files into data/heroes/, but only for
// heroes that don't already exist there. This protects manual corrections
// already made in data/heroes/ from being overwritten by a re-run of either
// extraction pipeline. Two source directories are checked:
//   - data/extracted/        (legacy: manual screenshot extraction)
//   - data/scraped/heroes/   (intake txt -> parseHeroIntake.mjs output)
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const heroesDir = join(__dirname, '..', 'data', 'heroes')
const sourceDirs = [
  join(__dirname, '..', 'data', 'extracted'),
  join(__dirname, '..', 'data', 'scraped', 'heroes'),
]
const scrapedRankModifiers = join(__dirname, '..', 'data', 'scraped', 'rank-modifiers.json')
const rankModifiersOut = join(__dirname, '..', 'data', 'rank-modifiers.json')

function mergeFrom(sourceDir) {
  let files
  try {
    files = readdirSync(sourceDir).filter((f) => f.endsWith('.json'))
  } catch {
    console.log(`(skipping ${sourceDir} - directory doesn't exist)`)
    return { merged: 0, skipped: 0 }
  }

  if (files.length === 0) {
    console.log(`(${sourceDir} has no JSON files)`)
    return { merged: 0, skipped: 0 }
  }

  let merged = 0
  let skipped = 0
  for (const file of files) {
    const target = join(heroesDir, file)
    if (existsSync(target)) {
      console.log(`skip  ${file} (already exists in data/heroes/, keeping manual corrections)`)
      skipped += 1
      continue
    }
    const content = readFileSync(join(sourceDir, file), 'utf-8')
    writeFileSync(target, content)
    console.log(`merge ${file} -> data/heroes/`)
    merged += 1
  }
  return { merged, skipped }
}

// data/rank-modifiers.json is one array, not one-file-per-item, so merging it
// means: add any (class, name) entry that's new, leave existing entries alone
// (a manual correction to a modifier's text should never be overwritten by a
// re-scrape).
function mergeRankModifiers() {
  let scraped
  try {
    scraped = JSON.parse(readFileSync(scrapedRankModifiers, 'utf-8'))
  } catch {
    console.log('(no data/scraped/rank-modifiers.json to merge)')
    return { merged: 0, skipped: 0 }
  }

  const existing = existsSync(rankModifiersOut) ? JSON.parse(readFileSync(rankModifiersOut, 'utf-8')) : []
  const existingKeys = new Set(existing.map((m) => `${m.class}::${m.name}`))

  let merged = 0
  let skipped = 0
  for (const mod of scraped) {
    const key = `${mod.class}::${mod.name}`
    if (existingKeys.has(key)) {
      skipped += 1
      continue
    }
    existing.push(mod)
    existingKeys.add(key)
    merged += 1
  }

  existing.sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
  writeFileSync(rankModifiersOut, JSON.stringify(existing, null, 2), 'utf-8')
  console.log(`rank-modifiers: ${merged} merged, ${skipped} skipped (already present) -> data/rank-modifiers.json`)
  return { merged, skipped }
}

function main() {
  let totalMerged = 0
  let totalSkipped = 0
  for (const dir of sourceDirs) {
    const { merged, skipped } = mergeFrom(dir)
    totalMerged += merged
    totalSkipped += skipped
  }
  const rm = mergeRankModifiers()
  totalMerged += rm.merged
  totalSkipped += rm.skipped
  console.log(`\n${totalMerged} file(s)/entries merged, ${totalSkipped} skipped (already present).`)
}

main()
