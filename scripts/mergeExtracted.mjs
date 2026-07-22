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
const arrayMerges = [
  { scraped: join(__dirname, '..', 'data', 'scraped', 'rank-modifiers.json'), out: join(__dirname, '..', 'data', 'rank-modifiers.json'), key: (m) => `${m.class}::${m.name}`, sort: (a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name), label: 'rank-modifiers' },
  { scraped: join(__dirname, '..', 'data', 'scraped', 'items.json'), out: join(__dirname, '..', 'data', 'items.json'), key: (m) => m.name, sort: (a, b) => a.name.localeCompare(b.name), label: 'items' },
  { scraped: join(__dirname, '..', 'data', 'scraped', 'relics.json'), out: join(__dirname, '..', 'data', 'relics.json'), key: (m) => m.name, sort: (a, b) => a.name.localeCompare(b.name), label: 'relics' },
]

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

// data/{rank-modifiers,items,relics}.json are each one array, not one-file-
// per-item, so merging means: add any entry whose key is new, leave existing
// entries alone (a manual correction should never be overwritten by a re-scrape).
function mergeArrayFile({ scraped: scrapedPath, out, key, sort, label }) {
  let scraped
  try {
    scraped = JSON.parse(readFileSync(scrapedPath, 'utf-8'))
  } catch {
    console.log(`(no ${scrapedPath} to merge)`)
    return { merged: 0, skipped: 0 }
  }

  const existing = existsSync(out) ? JSON.parse(readFileSync(out, 'utf-8')) : []
  const existingKeys = new Set(existing.map(key))

  let merged = 0
  let skipped = 0
  for (const entry of scraped) {
    const k = key(entry)
    if (existingKeys.has(k)) {
      skipped += 1
      continue
    }
    existing.push(entry)
    existingKeys.add(k)
    merged += 1
  }

  existing.sort(sort)
  writeFileSync(out, JSON.stringify(existing, null, 2), 'utf-8')
  console.log(`${label}: ${merged} merged, ${skipped} skipped (already present) -> ${out.split(/[\\/]/).slice(-2).join('/')}`)
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
  for (const config of arrayMerges) {
    const { merged, skipped } = mergeArrayFile(config)
    totalMerged += merged
    totalSkipped += skipped
  }
  console.log(`\n${totalMerged} file(s)/entries merged, ${totalSkipped} skipped (already present).`)
}

main()
