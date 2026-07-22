#!/usr/bin/env node
// Parses data/intake/items-raw.txt (the full guildrun.wiki/items/ page,
// copy-pasted as plain text - the table has everything, no per-item pages
// needed) into data/scraped/items.json.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rawFile = join(__dirname, '..', 'data', 'intake', 'items-raw.txt')
const outFile = join(__dirname, '..', 'data', 'scraped', 'items.json')

function parseStat(token) {
  const m = token.trim().match(/^\+(\d+(?:\.\d+)?)\s+(.+)$/)
  if (!m) return { raw: token.trim(), amount: null, stat: token.trim() }
  return { raw: token.trim(), amount: Number(m[1]), stat: m[2].trim() }
}

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
  const statsOrEffectField = firstParts[2] ?? ''
  let notSold = firstParts[3] === 'Not sold'

  const rest = block.slice(1)
  let effectLines = []
  let price = null

  if (!notSold) {
    const last = rest[rest.length - 1] ?? ''
    const secondLast = rest[rest.length - 2] ?? ''
    if (rest.length >= 2 && last === 'shards' && /^\d+$/.test(secondLast)) {
      price = Number(secondLast)
      effectLines = rest.slice(0, rest.length - 2)
    } else if (last.includes('\t')) {
      const [textPart, tail] = last.split('\t')
      if (tail === 'Not sold') {
        notSold = true
        effectLines = [...rest.slice(0, rest.length - 1), textPart]
      } else {
        effectLines = rest
      }
    } else {
      effectLines = rest
    }
  } else {
    effectLines = rest
  }

  let stats = []
  let effectParts = effectLines.filter((l) => l.length > 0)

  if (/^\+/.test(statsOrEffectField)) {
    stats = statsOrEffectField.split(',').map(parseStat)
  } else if (statsOrEffectField) {
    effectParts = [statsOrEffectField, ...effectParts]
  }

  const rawEffect = effectParts.join(' ').trim()
  const { quest, reward } = splitQuestReward(rawEffect)

  return {
    name,
    rarity,
    stats,
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
    console.error(`No ${rawFile} found. Paste the guildrun.wiki/items/ page text there first.`)
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

  const items = blocks.map(parseBlock).sort((a, b) => a.name.localeCompare(b.name))

  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, JSON.stringify(items, null, 2), 'utf-8')

  const incomplete = items.filter((it) => !it.name || !it.rarity || (!it.rawEffect && it.stats.length === 0))
  console.log(`${items.length} item(s) parsed -> data/scraped/items.json`)
  if (incomplete.length > 0) {
    console.log(`\n${incomplete.length} item(s) look incomplete:`)
    incomplete.forEach((it) => console.log(`  - ${it.name || '(no name)'}`))
  }
  console.log(`\n${items.length}/162 expected.`)
}

main()
