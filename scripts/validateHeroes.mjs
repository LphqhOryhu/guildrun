#!/usr/bin/env node
// Validates every JSON file in data/heroes/ against the hero schema and
// reports incomplete heroes or missing fields. Exit code 1 if any issues.
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const heroesDir = join(__dirname, '..', 'data', 'heroes')

const REQUIRED_HERO_FIELDS = ['name', 'stars', 'classes', 'elements', 'keywords', 'active', 'passives']
const REQUIRED_ACTIVE_FIELDS = ['name', 'manaCost', 'rawText', 'scalings']
const REQUIRED_PASSIVE_FIELDS = ['name', 'rawText', 'keywords', 'masteryAvailable', 'scalings']
const REQUIRED_SCALING_FIELDS = ['raw', 'base', 'stat', 'percent']
const KNOWN_STATS = ['Magic', 'Attack', 'HP', 'Shield', 'Mana', 'unknown']

function validateScaling(scaling, path, issues) {
  for (const field of REQUIRED_SCALING_FIELDS) {
    if (!(field in scaling)) issues.push(`${path}: scaling missing field "${field}"`)
  }
  if (scaling.stat && !KNOWN_STATS.includes(scaling.stat)) {
    issues.push(`${path}: scaling has unrecognized stat "${scaling.stat}" (use "unknown" and log it in data/_uncertain.md)`)
  }
}

function validateHero(hero, file) {
  const issues = []

  for (const field of REQUIRED_HERO_FIELDS) {
    if (!(field in hero)) issues.push(`${file}: missing top-level field "${field}"`)
  }

  if (hero.active) {
    for (const field of REQUIRED_ACTIVE_FIELDS) {
      if (!(field in hero.active)) issues.push(`${file}: active ability missing field "${field}"`)
    }
    ;(hero.active.scalings || []).forEach((s, i) => validateScaling(s, `${file}: active.scalings[${i}]`, issues))
  }

  if (Array.isArray(hero.passives)) {
    if (hero.passives.length !== 3) {
      issues.push(`${file}: expected exactly 3 passives, found ${hero.passives.length}`)
    }
    hero.passives.forEach((passive, i) => {
      for (const field of REQUIRED_PASSIVE_FIELDS) {
        if (!(field in passive)) issues.push(`${file}: passives[${i}] missing field "${field}"`)
      }
      ;(passive.scalings || []).forEach((s, j) => validateScaling(s, `${file}: passives[${i}].scalings[${j}]`, issues))
    })
  }

  if (Array.isArray(hero.classes) && hero.classes.length === 0) {
    issues.push(`${file}: classes[] is empty`)
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
  for (const file of files) {
    const raw = readFileSync(join(heroesDir, file), 'utf-8')
    let hero
    try {
      hero = JSON.parse(raw)
    } catch (err) {
      console.log(`✗ ${file}: invalid JSON (${err.message})`)
      totalIssues += 1
      continue
    }
    const issues = validateHero(hero, file)
    if (issues.length === 0) {
      console.log(`✓ ${file}`)
    } else {
      console.log(`✗ ${file} (${issues.length} issue${issues.length > 1 ? 's' : ''})`)
      issues.forEach((issue) => console.log(`    - ${issue}`))
      totalIssues += issues.length
    }
  }

  console.log(`\n${files.length} hero file(s) checked, ${totalIssues} issue(s) found.`)
  if (totalIssues > 0) process.exit(1)
}

main()
