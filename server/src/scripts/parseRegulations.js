import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import mongoose from 'mongoose'
import { connectDB } from '../db.js'
import Regulation from '../models/Regulation.js'
import RiverSpecies from '../models/RiverSpecies.js'

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

// ── Match PDF water body name to a DB river name ──────────────────────────────
function matchToDb(pdfName, dbSet) {
  const normalized = pdfName
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (dbSet.has(normalized)) return normalized

  // Strip parenthetical qualifiers: "ADAM RIVER (except Eve River)" → "adam river"
  const withoutParens = normalized.replace(/\s*\(.*?\)/g, '').trim()
  if (dbSet.has(withoutParens)) return withoutParens

  // Strip leading "LOWER " / "UPPER " / "(LOWER) "
  const stripped = withoutParens.replace(/^(lower|upper|middle|north|south|east|west)\s+/i, '').trim()
  if (dbSet.has(stripped)) return stripped

  // Try prefix match: DB name starts with our normalized name
  for (const dbName of dbSet) {
    if (dbName.startsWith(withoutParens) || withoutParens.startsWith(dbName)) return dbName
  }

  return null
}

async function main() {
  // ── Step 1: Extract PDF text ───────────────────────────────────────────────
  console.log('Reading PDF...')
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at: ${PDF_PATH}`)
    process.exit(1)
  }

  const buffer   = fs.readFileSync(PDF_PATH)
  const { text } = await pdfParse(buffer)

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
  await connectDB()
  const riverDocs = await RiverSpecies.find({}, 'riverName')
  const dbSet     = new Set(riverDocs.map(r => r.riverName))
  console.log(`Loaded ${dbSet.size} rivers from DB`)

  // ── Step 4: Match and save ─────────────────────────────────────────────────
  const matched   = []
  const unmatched = []

  for (const entry of entries) {
    const riverName = matchToDb(entry.pdfName, dbSet)
    if (riverName) {
      matched.push({ ...entry, riverName })
    } else {
      unmatched.push(entry.pdfName)
    }
  }

  console.log(`Matched: ${matched.length} / ${entries.length}`)
  console.log(`Unmatched: ${unmatched.length}`)
  if (unmatched.length) {
    console.log('--- Unmatched water bodies (not in your river DB) ---')
    unmatched.forEach(n => console.log('  ·', n))
  }

  // ── Step 5: Wipe old and save new ─────────────────────────────────────────
  await Regulation.deleteMany({})
  for (const { riverName, pdfName, mgmtUnit, rules } of matched) {
    await Regulation.create({ riverName, pdfName, mgmtUnit, rules, year: new Date().getFullYear() })
  }

  console.log('Done! Regulations seeded.')
  mongoose.disconnect()
}

main().catch(err => { console.error(err); mongoose.disconnect() })
