#!/usr/bin/env node
// Reads every filled-in template from data/intake/heroes/*.txt, parses it into
// the structured hero schema, and writes the result to data/scraped/heroes/.
// data/scraped/ is a staging area - nothing here is ever written into
// data/heroes/ directly, so hand-corrected files are never at risk. Run
// `npm run intake:merge` afterwards to promote new heroes into data/heroes/.
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseHeroDump, looksLikeDumpFormat, KNOWN_CLASSES } from './lib/parseHeroDump.mjs'
import { HERO_IDS } from './lib/heroIds.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const intakeDir = join(__dirname, '..', 'data', 'intake', 'heroes')
const scrapedDir = join(__dirname, '..', 'data', 'scraped', 'heroes')
const rankModifiersOut = join(__dirname, '..', 'data', 'scraped', 'rank-modifiers.json')
const uncertainReport = join(__dirname, '..', 'data', 'intake', '_uncertain-scalings.md')

const KNOWN_STATS = ['Magic', 'Attack', 'HP', 'Defense', 'Resistance', 'Speed', 'Mana', 'Shield', 'Crit Chance', 'Crit Damage', 'Attack Speed']

function normalizeStat(raw) {
  const cleaned = raw.trim().replace(/\s+/g, ' ')
  const match = KNOWN_STATS.find((s) => s.toLowerCase() === cleaned.toLowerCase())
  return match ?? 'unknown'
}

// Best-effort extraction of stat scalings out of verbatim ability/passive text.
// Handles "15 (+100% Magic)" and "50% Magic Burn" style phrasing. Anything it
// can't confidently map to a known stat is still captured with stat:"unknown"
// and logged to data/intake/_uncertain-scalings.md for manual review.
function extractScalings(text, context, uncertainSink) {
  if (!text) return []
  const scalings = []
  const consumed = [] // [start, end) ranges already claimed by a match

  function overlapsConsumed(start, end) {
    return consumed.some(([s, e]) => start < e && end > s)
  }

  const withBase = /(\d+(?:\.\d+)?)\s*\(\+(\d+(?:\.\d+)?)%\s*([A-Za-z ]+?)\)/g
  for (const m of text.matchAll(withBase)) {
    const start = m.index
    const end = start + m[0].length
    if (overlapsConsumed(start, end)) continue
    consumed.push([start, end])
    const stat = normalizeStat(m[3])
    scalings.push({ raw: m[0], base: Number(m[1]), stat, percent: Number(m[2]) })
    if (stat === 'unknown') uncertainSink.push(`- **${context}**: "${m[0]}" — raw stat token: "${m[3].trim()}"`)
  }

  const percentOnly = /(\d+(?:\.\d+)?)%\s*([A-Za-z][A-Za-z ]*?)(?=[\s,.)]|$)/g
  for (const m of text.matchAll(percentOnly)) {
    const start = m.index
    const end = start + m[0].length
    if (overlapsConsumed(start, end)) continue
    consumed.push([start, end])
    const stat = normalizeStat(m[2])
    scalings.push({ raw: m[0], base: 0, stat, percent: Number(m[1]) })
    if (stat === 'unknown') uncertainSink.push(`- **${context}**: "${m[0]}" — raw stat token: "${m[2].trim()}"`)
  }

  return scalings
}

function splitList(value) {
  if (!value) return []
  return value.split(',').map((s) => s.trim()).filter(Boolean)
}

function stripComments(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('#'))
    .join('\n')
    .trim()
}

// Only these tags are treated as real blocks. Without this allowlist, any
// stray "[X]...[/X]" text elsewhere in the file (e.g. inside instructional
// comments) would be picked up as block content.
const KNOWN_BLOCKS = new Set([
  'BASE_STATS_RANK_C',
  'RANK_UP_GAINS_B',
  'RANK_UP_GAINS_A',
  'RANK_UP_GAINS_S',
  'ACTIVE_DESCRIPTION',
  'SPEC_1_DESCRIPTION',
  'SPEC_2_DESCRIPTION',
  'SPEC_3_DESCRIPTION',
  'LORE_GUILD',
  'LORE_CURRENT_WORK',
  'LORE_MOTIVATION',
])

function parseIntakeFile(raw) {
  const blocks = {}
  const blockRe = /\[([A-Z0-9_]+)\]([\s\S]*?)\[\/\1\]/g
  let strippedText = raw
  for (const m of raw.matchAll(blockRe)) {
    if (!KNOWN_BLOCKS.has(m[1])) continue
    blocks[m[1]] = stripComments(m[2])
    strippedText = strippedText.replace(m[0], '')
  }

  const fields = {}
  const lineRe = /^([A-Z][A-Z0-9_]*):[ \t]*(.*)$/gm
  for (const m of strippedText.matchAll(lineRe)) {
    fields[m[1]] = m[2].trim()
  }

  return { fields, blocks }
}

function parseStatBlock(content) {
  const stats = {}
  for (const line of content.split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (key) stats[key] = value
  }
  return stats
}

function buildHero(name, id, fields, blocks, uncertainSink) {
  const spec = (n) => ({
    name: fields[`SPEC_${n}_NAME`] || '',
    addsClass: fields[`SPEC_${n}_ADDS_CLASS`] || null,
    keywords: splitList(fields[`SPEC_${n}_KEYWORDS`]),
    rawText: blocks[`SPEC_${n}_DESCRIPTION`] || '',
    scalings: extractScalings(blocks[`SPEC_${n}_DESCRIPTION`], `${name} / spec ${n}`, uncertainSink),
  })

  return {
    name,
    id,
    sourceUrl: fields.SOURCE || '',
    title: fields.TITLE || '',
    guild: fields.GUILD || '',
    guildMotto: fields.GUILD_MOTTO || '',
    classes: splitList(fields.CLASSES),
    attackType: fields.ATTACK_TYPE || '',
    elements: splitList(fields.ELEMENTS),
    mechanics: splitList(fields.MECHANICS),
    baseStatsRankC: parseStatBlock(blocks.BASE_STATS_RANK_C || ''),
    derivedComposites: {
      ehp: fields.EHP || '',
      eoff: fields.EOFF || '',
      secPerCast: fields.SEC_PER_CAST || '',
    },
    rankUpGains: {
      B: blocks.RANK_UP_GAINS_B || '',
      A: blocks.RANK_UP_GAINS_A || '',
      S: blocks.RANK_UP_GAINS_S || '',
    },
    activeAbility: {
      name: fields.ACTIVE_NAME || '',
      resourceCost: fields.ACTIVE_RESOURCE_COST || '',
      rawText: blocks.ACTIVE_DESCRIPTION || '',
      scalings: extractScalings(blocks.ACTIVE_DESCRIPTION, `${name} / active`, uncertainSink),
    },
    rankBSpecializations: [spec(1), spec(2), spec(3)],
    lore: {
      guild: blocks.LORE_GUILD || '',
      currentWork: blocks.LORE_CURRENT_WORK || '',
      motivation: blocks.LORE_MOTIVATION || '',
      quote: fields.LORE_QUOTE || '',
    },
  }
}

// HERO/SOURCE come from the template's own header line, not from actual hero
// data - ignored here so an untouched template doesn't look "filled in".
const HEADER_ONLY_FIELDS = new Set(['HERO', 'SOURCE'])

function isEmptyTemplate(fields, blocks) {
  const anyField = Object.entries(fields).some(([k, v]) => !HEADER_ONLY_FIELDS.has(k) && v && v.length > 0)
  const anyBlock = Object.values(blocks).some((v) => v && v.length > 0)
  return !anyField && !anyBlock
}

function missingFields(hero) {
  const missing = []
  if (!hero.title) missing.push('TITLE')
  if (!hero.guild) missing.push('GUILD')
  if (hero.classes.length === 0) missing.push('CLASSES')
  if (Object.keys(hero.baseStatsRankC).length === 0) missing.push('BASE_STATS_RANK_C')
  if (!hero.activeAbility.name) missing.push('ACTIVE_NAME')
  if (!hero.activeAbility.rawText) missing.push('ACTIVE_DESCRIPTION')
  hero.rankBSpecializations.forEach((s, i) => {
    if (!s.name) missing.push(`SPEC_${i + 1}_NAME`)
    if (!s.rawText) missing.push(`SPEC_${i + 1}_DESCRIPTION`)
  })
  return missing
}

function missingFieldsDump(hero) {
  const missing = []
  if (!hero.title) missing.push('title')
  if (!hero.guild) missing.push('guild')
  if (!hero.attackType) missing.push('attackType')
  if (hero.classes.length === 0) missing.push('classes')
  if (Object.keys(hero.baseStatsRankC).length === 0) missing.push('baseStatsRankC')
  if (!hero.startingAbility.name) missing.push('startingAbility')
  hero.rankBSpecializations.forEach((s, i) => {
    if (!s.name) missing.push(`rankBSpecializations[${i}].name`)
    if (!s.rawText) missing.push(`rankBSpecializations[${i}].rawText`)
  })
  if (hero.rankASClassPools.length === 0) missing.push('rankASClassPools')
  if (!hero.lore.guild && !hero.lore.currentWork && !hero.lore.motivation) missing.push('lore (collapsed on page - optional)')
  return missing
}

function slugToName(slug) {
  const known = Object.keys(HERO_IDS).find((n) => n.toLowerCase() === slug.toLowerCase())
  return known ?? slug.charAt(0).toUpperCase() + slug.slice(1)
}

function main() {
  mkdirSync(scrapedDir, { recursive: true })

  let files
  try {
    files = readdirSync(intakeDir).filter((f) => f.endsWith('.txt'))
  } catch {
    console.error(`No data/intake/heroes/ directory found. Run "npm run intake:generate" first.`)
    process.exit(1)
  }

  const uncertainSink = []
  const modifierPool = new Map() // "Class::Name" -> modifier entry
  let empty = 0
  let complete = 0
  let partial = 0

  for (const file of files) {
    const raw = readFileSync(join(intakeDir, file), 'utf-8')
    const slug = file.replace('.txt', '')

    if (looksLikeDumpFormat(raw)) {
      const name = slugToName(slug)
      const id = HERO_IDS[name] ?? null
      const { hero, classPoolModifiers } = parseHeroDump(raw, name, id)

      for (const mod of classPoolModifiers) {
        const key = `${mod.class}::${mod.name}`
        const existing = modifierPool.get(key)
        if (!existing) {
          modifierPool.set(key, mod)
        } else {
          // Same modifier seen again via a different hero of the same class -
          // union any sharedWith classes observed across occurrences.
          existing.sharedWith = [...new Set([...existing.sharedWith, ...mod.sharedWith])]
        }
      }

      const missing = missingFieldsDump(hero)
      writeFileSync(join(scrapedDir, `${slug}.json`), JSON.stringify(hero, null, 2), 'utf-8')

      const hardMissing = missing.filter((m) => !m.includes('optional'))
      if (hardMissing.length === 0) {
        console.log(`✓ ${name}: complete -> data/scraped/heroes/${slug}.json${missing.length ? ` (${missing.join(', ')})` : ''}`)
        complete += 1
      } else {
        console.log(`△ ${name}: partial (missing: ${missing.join(', ')}) -> data/scraped/heroes/${slug}.json`)
        partial += 1
      }
      continue
    }

    const headerMatch = raw.match(/HERO:\s*(.+?)\s*\(id:\s*(\d+)\)/)
    const name = headerMatch ? headerMatch[1].trim() : slug
    const id = headerMatch ? Number(headerMatch[2]) : null

    const { fields, blocks } = parseIntakeFile(raw)

    if (isEmptyTemplate(fields, blocks)) {
      console.log(`○ ${name}: empty template, skipped`)
      empty += 1
      continue
    }

    const hero = buildHero(name, id, fields, blocks, uncertainSink)
    const missing = missingFields(hero)
    writeFileSync(join(scrapedDir, `${slug}.json`), JSON.stringify(hero, null, 2), 'utf-8')

    if (missing.length === 0) {
      console.log(`✓ ${name}: complete -> data/scraped/heroes/${slug}.json`)
      complete += 1
    } else {
      console.log(`△ ${name}: partial (missing: ${missing.join(', ')}) -> data/scraped/heroes/${slug}.json`)
      partial += 1
    }
  }

  if (uncertainSink.length > 0) {
    writeFileSync(
      uncertainReport,
      `# Scalings incertains (auto-extraction)\n\nStats non reconnues, à vérifier et corriger à la main dans le JSON généré :\n\n${uncertainSink.join('\n')}\n`,
      'utf-8'
    )
    console.log(`\n${uncertainSink.length} scaling(s) avec stat non reconnue -> data/intake/_uncertain-scalings.md`)
  }

  if (modifierPool.size > 0) {
    const modifiers = [...modifierPool.values()].sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
    writeFileSync(rankModifiersOut, JSON.stringify(modifiers, null, 2), 'utf-8')

    console.log(`\nRank modifiers collectés -> data/scraped/rank-modifiers.json (${modifiers.length} au total)`)
    for (const cls of KNOWN_CLASSES) {
      const count = modifiers.filter((m) => m.class === cls).length
      const marker = count >= 15 ? '✓' : '△'
      console.log(`  ${marker} ${cls}: ${count}/15`)
    }
  }

  console.log(`\n${complete + partial}/${files.length} héros traités (${complete} complets, ${partial} partiels), ${empty} pas encore commencés.`)
}

main()
