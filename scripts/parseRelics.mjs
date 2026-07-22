#!/usr/bin/env node
// Parses data/intake/relics-raw.txt (the full guildrun.wiki/relics/ page,
// copy-pasted as plain text) into data/scraped/relics.json.
//
// Unlike items, relics have no separate "+X Stat" stat line - the whole
// effect field is always prose - and some names are intentionally
// duplicated (e.g. "Decay", "Immunity" appear twice with different
// percentages, presumably difficulty-tier variants), so entries are keyed
// by name+rawEffect rather than name alone when merging.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rawFile = join(__dirname, '..', 'data', 'intake', 'relics-raw.txt')
const outFile = join(__dirname, '..', 'data', 'scraped', 'relics.json')

function splitQuestReward(text) {
  const m = text.match(/^Quest:\s*(.+?)\s*Reward:\s*(.+)$/)
  if (!m) return { quest: null, reward: null }
  return { quest: m[1].trim(), reward: m[2].trim() }
}

function parseBlock(block) {
  const firstLine = block[0].replace(/^\t/, '')
  const firstParts = firstLine.split('\t')
  const name = firstParts[0] ?? ''
  const rarity = firstParts[1] ?? ''
  const firstEffectField = firstParts[2] ?? ''
  let notSold = firstParts[3] === 'Not sold'

  const rest = block.slice(1)
  let effectLines = [firstEffectField]
  let price = null

  if (!notSold) {
    const last = rest[rest.length - 1] ?? ''
    const secondLast = rest[rest.length - 2] ?? ''
    if (rest.length >= 2 && last === 'shards' && /^\d+$/.test(secondLast)) {
      price = Number(secondLast)
      effectLines = effectLines.concat(rest.slice(0, rest.length - 2))
    } else if (last.includes('\t')) {
      const [textPart, tail] = last.split('\t')
      if (tail === 'Not sold') {
        notSold = true
        effectLines = effectLines.concat(rest.slice(0, rest.length - 1), [textPart])
      } else {
        effectLines = effectLines.concat(rest)
      }
    } else {
      effectLines = effectLines.concat(rest)
    }
  } else {
    effectLines = effectLines.concat(rest)
  }

  const rawEffect = effectLines.filter((l) => l.length > 0).join(' ').trim()
  const { quest, reward } = splitQuestReward(rawEffect)

  return {
    name,
    rarity,
    rawEffect,
    quest,
    reward,
    shopPrice: notSold ? null : { amount: price, currency: 'shards' },
  }
}

function main() {
  let raw
  try {
    raw = readFileSync(rawFile, 'utf-8')
  } catch {
    console.error(`No ${rawFile} found. Paste the guildrun.wiki/relics/ page text there first.`)
    process.exit(1)
  }

  const lines = raw.split(/\r?\n/)
  const startIdx = lines.findIndex((l) => l.startsWith('\t'))
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.startsWith('An unofficial Guildrun'))
  const body = lines.slice(startIdx, endIdx === -1 ? undefined : endIdx)

  const blocks = []
  let current = null
  for (const line of body) {
    if (line.startsWith('\t')) {
      if (current) blocks.push(current)
      current = [line]
    } else if (current) {
      current.push(line)
    }
  }
  if (current) blocks.push(current)

  const relics = blocks.map(parseBlock).sort((a, b) => a.name.localeCompare(b.name) || a.rawEffect.localeCompare(b.rawEffect))

  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, JSON.stringify(relics, null, 2), 'utf-8')

  const incomplete = relics.filter((r) => !r.name || !r.rarity || !r.rawEffect)
  const dupeNames = relics.map((r) => r.name).filter((n, i, arr) => arr.indexOf(n) !== i)

  console.log(`${relics.length} relic(s) parsed -> data/scraped/relics.json`)
  if (incomplete.length > 0) {
    console.log(`\n${incomplete.length} relic(s) look incomplete:`)
    incomplete.forEach((r) => console.log(`  - ${r.name || '(no name)'}`))
  }
  if (dupeNames.length > 0) {
    console.log(`\n${[...new Set(dupeNames)].length} name(s) appear more than once (expected for difficulty-tier variants like "Decay"/"Immunity" - verify these are genuinely distinct, not accidental duplicates):`)
    ;[...new Set(dupeNames)].forEach((n) => console.log(`  - ${n}`))
  }
  console.log(`\n${relics.length}/322 expected.`)
}

main()
