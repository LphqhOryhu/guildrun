// Parses a hero page copy-pasted verbatim (plain visible text, e.g. via
// select-all in the browser) from guildrun.wiki's hero pages. This is a
// different, richer format than the LABEL:/[TAG] template in
// generateHeroIntake.mjs - it's whatever the page's rendered text looks like,
// so parsing anchors on fixed strings from the site's own template rather
// than on markers we control.
//
// Returns { hero, classPoolRefs, classPoolModifiers } where classPoolModifiers
// is a flat list of { class, name, rawText, keywords, sharedWith } entries
// found in this hero's Rank A/S section - these belong to the class, not the
// hero, and the caller is expected to merge them into a single global pool
// deduped by (class, name) across every hero processed.

export const KNOWN_CLASSES = ['Warrior', 'Vanguard', 'Tank', 'Mystic', 'Mage', 'Duelist', 'Assassin']
const KEYWORD_VOCAB = ['Rush', 'Stall', 'Backup']

const BOILERPLATE_LINES = new Set([
  'Rank',
  'The base statline above. Starts with the active ability equipped.',
  'The base statline above. Starts with the passive ability equipped.',
  'Your first rank-up also picks a specialization that can add a class and change your kit. They are always the same 3 for every hero.',
  'Ranks A and S draw from the same set.',
])

export function looksLikeDumpFormat(raw) {
  return raw.includes('Automatic stat gain | every rank-up')
}

function toLines(raw) {
  return raw.split(/\r?\n/).map((l) => l.trim())
}

function findIndexOfPair(lines, first, second, fromIndex = 0) {
  for (let i = fromIndex; i < lines.length - 1; i++) {
    if (lines[i] === first && lines[i + 1] === second) return i
  }
  return -1
}

function extractKeywords(text) {
  if (!text) return []
  return KEYWORD_VOCAB.filter((kw) => new RegExp(`\\b${kw}\\b`).test(text))
}

// Best-effort scaling extraction - same patterns as the LABEL-format parser.
// Kept local (rather than shared) since this module has no other dependency
// on parseHeroIntake.mjs and is small enough to duplicate cheaply.
function normalizeStat(raw, knownStats) {
  const cleaned = raw.trim().replace(/\s+/g, ' ')
  const match = knownStats.find((s) => s.toLowerCase() === cleaned.toLowerCase())
  return match ?? 'unknown'
}

const KNOWN_STATS = ['Magic', 'Attack', 'HP', 'Defense', 'Resistance', 'Speed', 'Mana', 'Mana Regen', 'Shield', 'Crit', 'Attack Speed', 'Omnivamp']

function extractScalings(text) {
  if (!text) return []
  const scalings = []
  const consumed = []
  const overlaps = (start, end) => consumed.some(([s, e]) => start < e && end > s)

  const withBase = /(\d+(?:\.\d+)?)\s*\(\+(\d+(?:\.\d+)?)%\s*([A-Za-z ]+?)\)/g
  for (const m of text.matchAll(withBase)) {
    const start = m.index
    const end = start + m[0].length
    if (overlaps(start, end)) continue
    consumed.push([start, end])
    scalings.push({ raw: m[0], base: Number(m[1]), stat: normalizeStat(m[3], KNOWN_STATS), percent: Number(m[2]) })
  }

  const percentOnly = /(\d+(?:\.\d+)?)%\s*([A-Za-z][A-Za-z ]*?)(?=[\s,.)]|$)/g
  for (const m of text.matchAll(percentOnly)) {
    const start = m.index
    const end = start + m[0].length
    if (overlaps(start, end)) continue
    consumed.push([start, end])
    scalings.push({ raw: m[0], base: 0, stat: normalizeStat(m[2], KNOWN_STATS), percent: Number(m[1]) })
  }

  return scalings
}

function cleanTokens(sectionLines) {
  return sectionLines
    .filter((l) => l.length > 0 && l !== '#')
    .filter((l) => !BOILERPLATE_LINES.has(l))
    .filter((l) => !l.startsWith('Offered '))
}

function parseLabelValuePairs(tokens) {
  const result = {}
  for (let i = 0; i + 1 < tokens.length; i += 2) {
    result[tokens[i]] = tokens[i + 1]
  }
  return result
}

function parseHeader(lines, name) {
  const breadcrumbIdx = lines.findIndex((l) => l === `Heroes / ${name}`)
  const statGainIdx = lines.findIndex((l) => l === 'Automatic stat gain | every rank-up (B, A, S)')
  const zone = lines.slice(breadcrumbIdx + 1, statGainIdx).filter((l) => l.length > 0 && l !== '#')
  const rest = zone.slice(1) // drop "<name> splash art"

  let title = ''
  let badges = rest
  if (rest.length >= 2 && rest[rest.length - 2] === name) {
    title = rest[rest.length - 1]
    badges = rest.slice(0, rest.length - 2)
  }

  const guild = badges[0] ?? ''
  const attackType = badges.find((b) => b === 'Melee' || b === 'Ranged') || ''
  const classes = badges.filter((b) => KNOWN_CLASSES.includes(b))
  const mechanicsDetail = badges.filter((b) => /^\w+ Mechanics: /.test(b))
  const mechanics = badges.filter(
    (b, i) => i !== 0 && b !== attackType && !KNOWN_CLASSES.includes(b) && !/^\w+ Mechanics: /.test(b)
  )

  return { title, guild, attackType, classes, mechanics, mechanicsDetail }
}

// “/” = curly double quotes, ‘/’ = curly single quotes -
// spelled out as escapes because literal curly-quote characters typed into
// source tend to get silently normalized to straight quotes by editors/tools,
// which then never match the actual curly quotes in copy-pasted page text.
const QUOTE_CHARS = '"“”\''
const QUOTE_LINE_RE = new RegExp(`^[${QUOTE_CHARS}].*[${QUOTE_CHARS}]$`)
const QUOTE_START_RE = new RegExp(`^[${QUOTE_CHARS}]`)
const QUOTE_END_RE = new RegExp(`[${QUOTE_CHARS}]$`)

function parseRankUpGains(lines) {
  const startIdx = lines.findIndex((l) => l === 'Automatic stat gain | every rank-up (B, A, S)')
  // ends at the quote line (starts+ends with a curly or straight quote mark)
  let endIdx = lines.length
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (QUOTE_LINE_RE.test(lines[i]) && lines[i].length > 2) {
      endIdx = i
      break
    }
  }
  const tokens = cleanTokens(lines.slice(startIdx + 1, endIdx))
  return { gains: parseLabelValuePairs(tokens), quoteLineIdx: endIdx < lines.length ? endIdx : -1 }
}

function parseQuote(lines, quoteLineIdx) {
  if (quoteLineIdx === -1) return ''
  return lines[quoteLineIdx].replace(QUOTE_START_RE, '').replace(QUOTE_END_RE, '')
}

function parseLore(lines, quoteLineIdx) {
  const lore = { guild: '', currentWork: '', motivation: '' }
  if (quoteLineIdx === -1) return lore
  const loreIdx = lines.findIndex((l, i) => i > quoteLineIdx && l === 'Lore')
  if (loreIdx === -1) return lore
  const statsIdx = lines.findIndex((l, i) => i > loreIdx && l === 'Base stats | Rank C (starting)')
  const block = lines.slice(loreIdx + 1, statsIdx === -1 ? undefined : statsIdx).filter((l) => l.length > 0 && l !== '#')
  // Expect: "Guild", <text...>, "Current work", <text...>, "Motivation", <text...>
  const sections = { Guild: 'guild', 'Current work': 'currentWork', Motivation: 'motivation' }
  let current = null
  const buffers = { guild: [], currentWork: [], motivation: [] }
  for (const line of block) {
    if (sections[line]) {
      current = sections[line]
      continue
    }
    if (current) buffers[current].push(line)
  }
  lore.guild = buffers.guild.join(' ')
  lore.currentWork = buffers.currentWork.join(' ')
  lore.motivation = buffers.motivation.join(' ')
  return lore
}

function parseBaseStats(lines) {
  const startIdx = lines.findIndex((l) => l === 'Base stats | Rank C (starting)')
  const endIdx = lines.findIndex((l, i) => i > startIdx && l === 'Derived composites, not shown in-game:')
  const tokens = cleanTokens(lines.slice(startIdx + 1, endIdx === -1 ? undefined : endIdx))
  return parseLabelValuePairs(tokens)
}

function parseDerivedComposites(lines) {
  const startIdx = lines.findIndex((l) => l === 'Derived composites, not shown in-game:')
  const endIdx = lines.findIndex((l, i) => i > startIdx && l.startsWith('EHP = effective survivability'))
  const tokens = cleanTokens(lines.slice(startIdx + 1, endIdx === -1 ? undefined : endIdx))
  const pairs = parseLabelValuePairs(tokens)
  return {
    ehp: pairs.EHP ?? '',
    eoff: pairs.EOFF ?? '',
    secPerCast: pairs['Sec / cast'] ?? '',
  }
}

function findRankSectionTokens(lines, name, letter, nextLetters) {
  const startIdx = findIndexOfPair(lines, name, `Rank ${letter}`)
  if (startIdx === -1) return []
  let endIdx = lines.length
  for (const nl of nextLetters) {
    const idx = findIndexOfPair(lines, name, `Rank ${nl}`, startIdx + 2)
    if (idx !== -1) {
      endIdx = idx
      break
    }
  }
  return cleanTokens(lines.slice(startIdx + 2, endIdx))
}

function parseStartingAbility(tokens) {
  if (tokens.length < 2) return { name: '', type: '', rawText: '', scalings: [] }
  const [name, type, ...rest] = tokens
  const rawText = rest.join(' ')
  return { name, type, rawText, scalings: extractScalings(rawText) }
}

function parseRankBSpecs(tokens) {
  const specs = []
  let i = 0
  for (let s = 0; s < 3 && i < tokens.length; s++) {
    const specName = tokens[i++]
    let addsClass = null
    if (tokens[i] && tokens[i].startsWith('+ ')) {
      addsClass = tokens[i].slice(2).trim()
      i++
    }
    let abilityName = specName
    let type = tokens[i]
    if (type !== 'Active' && type !== 'Passive') {
      abilityName = type
      i++
      type = tokens[i]
    }
    i++ // consume type token
    // "added" is a literal marker meaning this spec grants an ability type
    // the hero didn't start with at rank C (e.g. a passive-only hero gaining
    // an active) - it's a flag, not the description.
    let addedAbility = false
    if (tokens[i] === 'added') {
      addedAbility = true
      i++
    }
    const rawText = tokens[i] ?? ''
    i++
    specs.push({
      name: specName,
      addsClass,
      abilityName,
      type: type || '',
      addedAbility,
      keywords: extractKeywords(rawText),
      rawText,
      scalings: extractScalings(rawText),
    })
  }
  return specs
}

// A bare "Duelist"/"Tank"/etc. token only starts a real class-pool block when
// immediately followed by one of these two markers. Without this guard, any
// stray reference text elsewhere in the page dump that happens to mention a
// class name (e.g. a "how attack speed math works" footnote) gets misread as
// the start of a whole new pool.
function isPoolHeaderStart(unlockTok) {
  return unlockTok === 'base class' || /^only if you took /.test(unlockTok)
}

function parseClassPools(tokens) {
  const poolRefs = []
  const modifiers = []
  let i = 0
  while (i < tokens.length) {
    if (!KNOWN_CLASSES.includes(tokens[i]) || !isPoolHeaderStart(tokens[i + 1] ?? '')) {
      i++
      continue
    }
    const className = tokens[i++]
    const unlockTok = tokens[i] ?? ''
    const isBase = unlockTok === 'base class'
    const unlockedBy = isBase ? null : (unlockTok.match(/^only if you took (.+)$/) || [])[1] ?? unlockTok
    i++
    if (tokens[i] === 'Show modifiers') i++
    poolRefs.push({ class: className, base: isBase, unlockedBy })

    const browseMarker = `Browse the ${className} modifiers with full effects`
    while (i < tokens.length && tokens[i] !== browseMarker) {
      const modName = tokens[i++]
      const sharedWith = []
      while (i < tokens.length && KNOWN_CLASSES.includes(tokens[i]) && tokens[i] !== browseMarker) {
        sharedWith.push(tokens[i++])
      }
      const description = tokens[i] ?? ''
      if (tokens[i] !== undefined) i++
      if (!modName || !description) break
      modifiers.push({
        class: className,
        name: modName,
        rawText: description,
        keywords: extractKeywords(description),
        sharedWith: sharedWith.filter((c) => c !== className),
      })
    }
    if (tokens[i] === browseMarker) i++
  }
  return { poolRefs, modifiers }
}

export function parseHeroDump(raw, name, id) {
  const lines = toLines(raw)
  const header = parseHeader(lines, name)
  const { gains, quoteLineIdx } = parseRankUpGains(lines)
  const quote = parseQuote(lines, quoteLineIdx)
  const lore = parseLore(lines, quoteLineIdx)
  const baseStatsRankC = parseBaseStats(lines)
  const derivedComposites = parseDerivedComposites(lines)

  const rankCTokens = findRankSectionTokens(lines, name, 'C', ['B', 'A', 'S'])
  const startingAbility = parseStartingAbility(rankCTokens)

  const rankBTokens = findRankSectionTokens(lines, name, 'B', ['A', 'S'])
  const rankBSpecializations = parseRankBSpecs(rankBTokens)

  const rankSTokens = findRankSectionTokens(lines, name, 'S', [])
  const { poolRefs, modifiers } = parseClassPools(rankSTokens)

  const hero = {
    name,
    id,
    title: header.title,
    guild: header.guild,
    attackType: header.attackType,
    classes: header.classes,
    mechanics: header.mechanics,
    mechanicsDetail: header.mechanicsDetail,
    baseStatsRankC,
    derivedComposites,
    rankUpGainsPerRankUp: gains,
    startingAbility,
    rankBSpecializations,
    rankASClassPools: poolRefs,
    quote,
    lore,
  }

  return { hero, classPoolModifiers: modifiers }
}
