#!/usr/bin/env node
// Validates every JSON file in data/heroes/ against the real hero schema
// (as derived from guildrun.wiki hero pages, not the old placeholder schema)
// and reports incomplete heroes, missing fields, and the total count found
// vs. the 25 heroes expected in the demo. Exit code 1 if any issues.
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const heroesDir = join(__dirname, '..', 'data', 'heroes')

const EXPECTED_HERO_COUNT = 25
const KNOWN_CLASSES = ['Warrior', 'Vanguard', 'Tank', 'Mystic', 'Mage', 'Duelist', 'Assassin']
const REQUIRED_HERO_FIELDS = [
  'name', 'id', 'title', 'guild', 'attackType', 'classes', 'mechanics',
  'baseStatsRankC', 'derivedComposites', 'rankUpGainsPerRankUp',
  'startingAbility', 'rankBSpecializations', 'rankASClassPools', 'quote', 'lore',
]
const REQUIRED_SCALING_FIELDS = ['raw', 'base', 'stat', 'percent']

function validateScaling(scaling, path, issues) {
  for (const field of REQUIRED_SCALING_FIELDS) {
    if (!(field in scaling)) issues.push(`${path}: scaling missing field "${field}"`)
  }
}

function validateAbility(ability, path, issues) {
  if (!ability.name) issues.push(`${path}: missing name`)
  if (!ability.rawText) issues.push(`${path}: missing rawText`)
  ;(ability.scalings || []).forEach((s, i) => validateScaling(s, `${path}.scalings[${i}]`, issues))
}

function validateHero(hero, file) {
  const issues = []

  for (const field of REQUIRED_HERO_FIELDS) {
    if (!(field in hero)) issues.push(`${file}: missing top-level field "${field}"`)
  }

  if (Array.isArray(hero.classes)) {
    if (hero.classes.length === 0) issues.push(`${file}: classes[] is empty`)
    for (const c of hero.classes) {
      if (!KNOWN_CLASSES.includes(c)) issues.push(`${file}: unrecognized class "${c}"`)
    }
  }

  if (!hero.baseStatsRankC || Object.keys(hero.baseStatsRankC).length === 0) {
    issues.push(`${file}: baseStatsRankC is empty`)
  }

  if (hero.startingAbility) {
    validateAbility(hero.startingAbility, `${file}: startingAbility`, issues)
  }

  if (Array.isArray(hero.rankBSpecializations)) {
    if (hero.rankBSpecializations.length !== 3) {
      issues.push(`${file}: expected exactly 3 rankBSpecializations, found ${hero.rankBSpecializations.length}`)
    }
    hero.rankBSpecializations.forEach((spec, i) => {
      validateAbility(spec, `${file}: rankBSpecializations[${i}]`, issues)
    })
  }

  if (Array.isArray(hero.rankASClassPools)) {
    if (hero.rankASClassPools.length === 0) issues.push(`${file}: rankASClassPools is empty`)
    for (const pool of hero.rankASClassPools) {
      if (!KNOWN_CLASSES.includes(pool.class)) issues.push(`${file}: rankASClassPools references unrecognized class "${pool.class}"`)
    }
  }

  const loreEmpty = hero.lore && !hero.lore.guild && !hero.lore.currentWork && !hero.lore.motivation
  if (loreEmpty) {
    issues.push(`${file}: lore is empty (informational only - often collapsed on the source page, not necessarily an error)`)
  }

  return issues
}

function main() {
  let files
  try {
    files = readdirSync(heroesDir).filter((f) => f.endsWith('.json'))
  } catch {
    console.error(`No data/heroes/ directory found at ${heroesDir}`)
    process.exit(1)
  }

  if (files.length === 0) {
    console.log('No hero files found in data/heroes/. Nothing to validate.')
    return
  }

  let totalIssues = 0
  let blockingIssues = 0
  for (const file of files) {
    const raw = readFileSync(join(heroesDir, file), 'utf-8')
    let hero
    try {
      hero = JSON.parse(raw)
    } catch (err) {
      console.log(`✗ ${file}: invalid JSON (${err.message})`)
      totalIssues += 1
      blockingIssues += 1
      continue
    }
    const issues = validateHero(hero, file)
    const blocking = issues.filter((i) => !i.includes('informational only'))
    if (issues.length === 0) {
      console.log(`✓ ${file}`)
    } else {
      console.log(`${blocking.length ? '✗' : '~'} ${file} (${issues.length} note${issues.length > 1 ? 's' : ''})`)
      issues.forEach((issue) => console.log(`    - ${issue}`))
      totalIssues += issues.length
      blockingIssues += blocking.length
    }
  }

  console.log(`\n${files.length}/${EXPECTED_HERO_COUNT} hero file(s) present, ${totalIssues} note(s) (${blockingIssues} blocking).`)
  if (files.length < EXPECTED_HERO_COUNT) {
    console.log(`Missing ${EXPECTED_HERO_COUNT - files.length} hero(es) compared to the expected ${EXPECTED_HERO_COUNT}.`)
  }
  if (blockingIssues > 0) process.exit(1)
}

main()
