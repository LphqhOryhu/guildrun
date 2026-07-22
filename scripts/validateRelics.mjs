#!/usr/bin/env node
// Validates data/relics.json: every entry has a name, rarity, and effect
// text, and reports the total found vs. the 322 expected. Duplicate names
// are flagged as informational only - a handful (Decay, Immunity, etc.) are
// legitimate difficulty-tier variants distinguished by rawEffect, not by name.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const relicsFile = join(__dirname, '..', 'data', 'relics.json')
const EXPECTED_COUNT = 322

function main() {
  let relics
  try {
    relics = JSON.parse(readFileSync(relicsFile, 'utf-8'))
  } catch {
    console.error(`No data/relics.json found at ${relicsFile}`)
    process.exit(1)
  }

  let issues = 0
  for (const relic of relics) {
    const problems = []
    if (!relic.name) problems.push('missing name')
    if (!relic.rarity) problems.push('missing rarity')
    if (!relic.rawEffect) problems.push('no effect text')
    if (relic.shopPrice && (typeof relic.shopPrice.amount !== 'number' || relic.shopPrice.amount <= 0)) {
      problems.push('shopPrice.amount looks wrong')
    }
    if (problems.length > 0) {
      console.log(`✗ ${relic.name || '(no name)'}: ${problems.join(', ')}`)
      issues += problems.length
    }
  }

  if (issues === 0) console.log('✓ All relics look structurally complete.')

  const compositeDupes = relics
    .map((r) => `${r.name}::${r.rawEffect}`)
    .filter((k, i, arr) => arr.indexOf(k) !== i)
  if (compositeDupes.length > 0) {
    console.log(`\nExact duplicate entries (same name AND effect - likely a real dupe, not a variant): ${compositeDupes.join(', ')}`)
    issues += compositeDupes.length
  }

  console.log(`\n${relics.length}/${EXPECTED_COUNT} relic(s) present, ${issues} issue(s).`)
  if (relics.length < EXPECTED_COUNT) {
    console.log(`Missing ${EXPECTED_COUNT - relics.length} relic(s) compared to the expected ${EXPECTED_COUNT}.`)
  }
  if (issues > 0) process.exit(1)
}

main()
