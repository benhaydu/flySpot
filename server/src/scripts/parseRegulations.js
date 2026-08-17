import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import mongoose from 'mongoose'
import { connectDB } from '../db.js'
import Regulation from '../models/Regulation.js'
import Waterway from '../models/Waterway.js'
import { matchRiverGroup } from '../utils/matchRiverGroup.js'
import { extractClosures } from '../utils/closures.js'

const require  = createRequire(import.meta.url)
const pdfParse = require('pdf-parse/lib/pdf-parse.js')

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PDF_PATH  = path.join(__dirname, 'regulations.pdf')
const DUMP_PATH = path.join(__dirname, 'regulations_raw.txt')

// Matches a header line where name AND mgmt unit are on the same line:
//   "ADAM RIVER (except Eve River) 1-10Artificial fly only..."
//   "ALICE LAKE1-13Bait ban..."
const SAME_LINE_RE = /^([A-Z"(][A-Z0-9\s"()\-.,'/]+?)\s*(?:CW\s*)?(\d{1,2}-\d{1,3})(.*)/

// Matches a line that is ONLY (or starts with) a mgmt unit code, e.g. "1-15Class II..."
// Used for multi-line entries where the name and unit are on separate lines.
const UNIT_ONLY_RE = /^(?:CW\s*)?(\d{1,2}-\d{1,3})\s*(.*)/

// A line that looks like an all-caps water body name with no unit code
const NAME_ONLY_RE = /^[A-Z"(][A-Z0-9\s"()\-.,'/]{3,}$/

// Lines to skip (table headers, section headers, page numbers)
const SKIP_RE = /^(WATER BODY|MGMT UNIT|EXCEPTIONS|Water-Specific|REGION|Region \d|\d+$)/i

// ── Parse entries from the Water-Specific Regulations section ─────────────────
// Handles two formats:
//   Format A (same line):  "COWICHAN RIVER 1-4No Fishing..."
//   Format B (multi-line): "AHNUHATI RIVER\nCW\n1-15Class II water..."
function parseEntries(sectionText) {
  const lines = sectionText.split('\n').map(l => l.trim())
  const entries  = []
  let current    = null
  let pendingName = null  // name seen on its own line, waiting for unit on next line

  for (const line of lines) {
    if (!line || SKIP_RE.test(line)) continue
    if (line === 'CW') continue  // class-W marker — skip but keep pendingName

    // ── Format A: name + unit on same line ──
    const sameLine = line.match(SAME_LINE_RE)
    if (sameLine) {
      if (current) entries.push(current)
      const [, waterBody, mgmtUnit, rest] = sameLine
      current     = { pdfName: waterBody.trim(), mgmtUnit: mgmtUnit.trim(), rules: rest.trim() ? [rest.trim()] : [] }
      pendingName = null
      continue
    }

    // ── Format B step 2: unit-only line after a pending name ──
    const unitOnly = pendingName && line.match(UNIT_ONLY_RE)
    if (unitOnly) {
      if (current) entries.push(current)
      const [, mgmtUnit, rest] = unitOnly
      current     = { pdfName: pendingName, mgmtUnit: mgmtUnit.trim(), rules: rest.trim() ? [rest.trim()] : [] }
      pendingName = null
      continue
    }

    // ── Format B step 1: name-only line (no unit yet) ──
    if (NAME_ONLY_RE.test(line)) {
      pendingName = line
      continue
    }

    // ── Continuation rule line ──
    pendingName = null
    if (current) current.rules.push(line)
  }

  if (current) entries.push(current)
  return entries
}

async function main() {
  // ── Step 1: Extract PDF text ───────────────────────────────────────────────
  console.log('Reading PDF...')
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at: ${PDF_PATH}`)
    process.exit(1)
  }

  const buffer            = fs.readFileSync(PDF_PATH)
  const { text: rawText } = await pdfParse(buffer)

  // pdf-parse renders one of this PDF's embedded-font glyphs as the Private
  // Use Area codepoint U+F0DC instead of a real character. It's this PDF's
  // "1" glyph, and it's always immediately followed by a duplicate ASCII
  // "1" — so it must be deleted, not replaced, or every "1-N" mgmt unit
  // doubles into "11-N". Left unfixed, any entry whose mgmt unit starts
  // with "1" fails the header regex (`\d` doesn't match a PUA codepoint)
  // and silently gets swallowed as a continuation line of whichever entry
  // came before it — which is why Quinsam River and Craigflower Creek
  // never showed up as their own regulation entries.
  const text = rawText.replace(//g, '')

  fs.writeFileSync(DUMP_PATH, text, 'utf8')
  console.log(`Raw text saved → ${DUMP_PATH}  (${text.length.toLocaleString()} chars)`)

  // ── Step 2: Isolate the Water-Specific Regulations section ────────────────
  const sectionStart = text.indexOf('Water-Specific Regulations')
  if (sectionStart === -1) {
    console.error('Could not find "Water-Specific Regulations" in the PDF.')
    console.error('Open regulations_raw.txt and check what the section header says.')
    process.exit(1)
  }
  console.log(`Found section at char ${sectionStart}`)

  // Strip lowercase parenthetical notes from water body names so the regex
  // can match lines like "COWICHAN RIVER (see map below) 1-4"
  const rawSection  = text.slice(sectionStart)
  const sectionText = rawSection.replace(/\s*\([a-z][^)]*\)/g, '')
  const entries     = parseEntries(sectionText)
  console.log(`Parsed ${entries.length} regulation entries from PDF`)

  if (process.argv.includes('--debug')) {
    console.log('\n--- ALL PARSED ENTRIES ---')
    entries.forEach(e => console.log(`[${e.mgmtUnit}] ${e.pdfName} → ${e.rules.length} rules`))
    console.log('---\n')
  }

  // ── Step 3: Load known river names from DB ────────────────────────────────
 // ── Step 3: Load known river groups from the map data ─────────────────────
  await connectDB()
  const waterwayDocs  = await Waterway.find({}, 'riverGroup')
  const riverGroupSet = new Set(waterwayDocs.map(w => w.riverGroup))
  console.log(`Loaded ${riverGroupSet.size} river groups from Waterway`)

  // ── Step 4: Match and save ─────────────────────────────────────────────────
  const matched   = []
  const unmatched = []

  for (const entry of entries) {
    const riverGroup = matchRiverGroup(entry.pdfName, riverGroupSet)
    if (riverGroup) {
      matched.push({ ...entry, riverGroup })
    } else {
      unmatched.push(entry.pdfName)
    }
  }

  console.log(`Matched: ${matched.length} / ${entries.length}`)
  console.log(`Unmatched: ${unmatched.length}`)
  if (unmatched.length) {
    console.log('--- Unmatched water bodies (not on the map) ---')
    unmatched.forEach(n => console.log('  ·', n))
  }
// ── Step 5: Wipe old and save new ─────────────────────────────────────────
  await Regulation.deleteMany({})
  for (const { riverGroup, pdfName, mgmtUnit, rules } of matched) {
    const closures = rules.flatMap(extractClosures)
    await Regulation.create({ riverGroup, riverName: pdfName.toLowerCase(), pdfName, mgmtUnit, rules, closures, year: new Date().getFullYear() })
  }

  console.log('Done! Regulations seeded.')
  mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exitCode = 1
})
