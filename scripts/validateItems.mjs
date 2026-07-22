#!/usr/bin/env node
// Validates data/items.json: every entry has a name, rarity, and either
// stats or an effect, and reports the total found vs. the 162 expected.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const itemsFile = join(__dirname, '..', 'data', 'items.json')
const EXPECTED_COUNT = 162
const KNOWN_RARITIES = ['Common', 'Rare', 'Epic', 'Unique']

function main() {
  let items
  try {
    items = JSON.parse(readFileSync(itemsFile, 'utf-8'))
  } catch {
    console.error(`No data/items.json found at ${itemsFile}`)
    process.exit(1)
  }

  let issues = 0
  for (const item of items) {
    const problems = []
    if (!item.name) problems.push('missing name')
    if (!KNOWN_RARITIES.includes(item.rarity)) problems.push(`unrecognized rarity "${item.rarity}"`)
    if ((!item.stats || item.stats.length === 0) && !item.rawEffect) problems.push('no stats and no effect')
    if (item.shopPrice && (typeof item.shopPrice.amount !== 'number' || item.shopPrice.amount <= 0)) {
      problems.push('shopPrice.amount looks wrong')
    }
    if (problems.length > 0) {
      console.log(`✗ ${item.name || '(no name)'}: ${problems.join(', ')}`)
      issues += problems.length
    }
  }

  if (issues === 0) console.log('✓ All items look structurally complete.')

  const dupes = items.map((i) => i.name).filter((n, i, arr) => arr.indexOf(n) !== i)
  if (dupes.length > 0) {
    console.log(`\nDuplicate names: ${[...new Set(dupes)].join(', ')}`)
    issues += dupes.length
  }

  console.log(`\n${items.length}/${EXPECTED_COUNT} item(s) present, ${issues} issue(s).`)
  if (items.length < EXPECTED_COUNT) {
    console.log(`Missing ${EXPECTED_COUNT - items.length} item(s) compared to the expected ${EXPECTED_COUNT}.`)
  }
  if (issues > 0) process.exit(1)
}

main()
