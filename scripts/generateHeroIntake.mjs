#!/usr/bin/env node
// Generates one plain-text intake template per hero in data/intake/heroes/.
// You fill these in by hand (copy/paste from whatever source you're using),
// then run `npm run intake:parse` to turn them into JSON under data/scraped/heroes/.
//
// Re-running this script never overwrites a file that already exists, so it's
// safe to run again after adding new heroes to HERO_IDS without losing work
// already in progress.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const intakeDir = join(__dirname, '..', 'data', 'intake', 'heroes')

// name -> numeric id used in the source's per-hero URL pattern, if you have one.
const HERO_IDS = {
  Irini: 1,
  Hoyoung: 2,
  Reyna: 3,
  Yuuna: 4,
  Zuri: 5,
  Aria: 6,
  Nyx: 7,
  Pollen: 8,
  Niklas: 9,
  Fiona: 10,
  Rowan: 11,
  Skorn: 12,
  Logan: 13,
  Funke: 14,
  Tilly: 15,
  Gustav: 16,
  Ratna: 17,
  Rip: 18,
  Karsu: 20,
  Ming: 21,
  Pimenta: 22,
  Sal: 23,
  Dragomir: 24,
  Kai: 26,
  Grace: 27,
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function template(name, id) {
  return `==================================================
HERO: ${name}  (id: ${id})
SOURCE:
==================================================
# Fill in the fields below. Leave a field blank if it doesn't apply or you
# can't find it. Don't delete the labels or the [TAG]/[/TAG] markers, even
# for fields you leave empty - the parser looks for them by name.
#
# SOURCE (optional): the URL you copied this hero from, for traceability.
# Single-line fields: "LABEL: value" on one line.
# Multi-line / verbatim text: paste it inside the matching bracket markers below.
# Lists (CLASSES, ELEMENTS, MECHANICS): comma-separated on one line.

TITLE:
GUILD:
GUILD_MOTTO:
CLASSES:
ATTACK_TYPE:
ELEMENTS:
MECHANICS:

[BASE_STATS_RANK_C]
# One stat per line, exactly as labeled on the page, e.g.:
# HP: 1234
# Attack: 210
[/BASE_STATS_RANK_C]

EHP:
EOFF:
SEC_PER_CAST:

[RANK_UP_GAINS_B]
# what this hero automatically gains on ranking up to B (free text, e.g. "+40 HP, +8 Attack")
[/RANK_UP_GAINS_B]
[RANK_UP_GAINS_A]
[/RANK_UP_GAINS_A]
[RANK_UP_GAINS_S]
[/RANK_UP_GAINS_S]

ACTIVE_NAME:
ACTIVE_RESOURCE_COST:
[ACTIVE_DESCRIPTION]
[/ACTIVE_DESCRIPTION]

SPEC_1_NAME:
SPEC_1_ADDS_CLASS:
SPEC_1_KEYWORDS:
[SPEC_1_DESCRIPTION]
[/SPEC_1_DESCRIPTION]

SPEC_2_NAME:
SPEC_2_ADDS_CLASS:
SPEC_2_KEYWORDS:
[SPEC_2_DESCRIPTION]
[/SPEC_2_DESCRIPTION]

SPEC_3_NAME:
SPEC_3_ADDS_CLASS:
SPEC_3_KEYWORDS:
[SPEC_3_DESCRIPTION]
[/SPEC_3_DESCRIPTION]

[LORE_GUILD]
[/LORE_GUILD]
[LORE_CURRENT_WORK]
[/LORE_CURRENT_WORK]
[LORE_MOTIVATION]
[/LORE_MOTIVATION]
LORE_QUOTE:

==================================================
END HERO
==================================================
`
}

function main() {
  mkdirSync(intakeDir, { recursive: true })
  let created = 0
  let skipped = 0

  for (const [name, id] of Object.entries(HERO_IDS)) {
    const file = join(intakeDir, `${slugify(name)}.txt`)
    if (existsSync(file)) {
      console.log(`skip  ${name} (already exists)`)
      skipped += 1
      continue
    }
    writeFileSync(file, template(name, id), 'utf-8')
    console.log(`create ${name} -> data/intake/heroes/${slugify(name)}.txt`)
    created += 1
  }

  console.log(`\n${created} file(s) created, ${skipped} skipped (already existed). ${Object.keys(HERO_IDS).length} heroes total.`)
}

main()
