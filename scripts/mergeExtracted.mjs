#!/usr/bin/env node
// Copies newly-extracted hero JSON files from data/extracted/ into data/heroes/,
// but only for heroes that don't already exist there. This protects manual
// corrections already made in data/heroes/ from being overwritten by a re-run
// of the screenshot extraction step.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const extractedDir = join(__dirname, '..', 'data', 'extracted')
const heroesDir = join(__dirname, '..', 'data', 'heroes')

function main() {
  let files
  try {
    files = readdirSync(extractedDir).filter((f) => f.endsWith('.json'))
  } catch {
    console.log(`No data/extracted/ directory found at ${extractedDir}. Nothing to merge.`)
    return
  }

  if (files.length === 0) {
    console.log('No extracted hero files to merge.')
    return
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
    const content = readFileSync(join(extractedDir, file), 'utf-8')
    writeFileSync(target, content)
    console.log(`merge ${file} -> data/heroes/`)
    merged += 1
  }

  console.log(`\n${merged} file(s) merged, ${skipped} file(s) skipped (already present).`)
}

main()
