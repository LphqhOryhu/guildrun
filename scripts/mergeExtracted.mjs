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

function main() {
  let totalMerged = 0
  let totalSkipped = 0
  for (const dir of sourceDirs) {
    const { merged, skipped } = mergeFrom(dir)
    totalMerged += merged
    totalSkipped += skipped
  }
  console.log(`\n${totalMerged} file(s) merged, ${totalSkipped} file(s) skipped (already present).`)
}

main()
