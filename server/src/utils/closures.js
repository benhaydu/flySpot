// server/src/utils/closures.js
//
// Parses "No Fishing ... Dec 1-May 31" style closure windows out of BC
// regulation rule text, and answers "is this closure active on date X".
// Closures are annual (month/day only, no year) since BC fishing closures
// repeat on the same calendar dates every year.

const MONTHS = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
}

const MONTH_PATTERN = 'January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec'
const RANGE_RE = new RegExp(
  `(${MONTH_PATTERN})\\.?\\s+(\\d{1,2})\\s*-\\s*(${MONTH_PATTERN})\\.?\\s+(\\d{1,2})`,
  'gi'
)

const SECTIONAL_RE = /\b(from|between|upstream|downstream|tributary|tributaries|except|above|below)\b/i

// Only rules that actually say "No Fishing" count as closures — other date
// ranges (e.g. "Bait ban, May 1-Nov 30", or "Exempt from ... summer
// closure") are gear restrictions or exemptions, not closures themselves.
export function extractClosures(ruleText) {
  if (!/no fishing/i.test(ruleText)) return []

  const closures = []
  let match
  RANGE_RE.lastIndex = 0
  while ((match = RANGE_RE.exec(ruleText))) {
    // Look at the clause immediately before this date range — from the
    // nearest preceding "No Fishing" up to the match itself — to tell
    // whether this closure covers the whole river or just one stretch of
    // it ("from X to Y", "downstream of", "in tributaries", etc.).
    // Regulations often mix both kinds in the same rule string (Cowichan
    // does exactly this), so it has to be checked per date range.
    const beforeText = ruleText.slice(0, match.index)
    const lastNoFishingIdx = beforeText.toLowerCase().lastIndexOf('no fishing')
    if (lastNoFishingIdx === -1) continue
    const clause = ruleText.slice(lastNoFishingIdx, match.index)
    if (SECTIONAL_RE.test(clause)) continue // partial-river closure — don't flag the whole river

    const [, fromM, fromD, toM, toD] = match
    closures.push({
      fromMonth: MONTHS[fromM.toLowerCase()],
      fromDay: Number(fromD),
      toMonth: MONTHS[toM.toLowerCase()],
      toDay: Number(toD),
      description: ruleText.trim(),
    })
  }
  return closures
}

// Handles windows that wrap the new year (e.g. Dec 1 – May 31).
export function isDateInClosure(date, closure) {
  const val  = (date.getMonth() + 1) * 100 + date.getDate()
  const from = closure.fromMonth * 100 + closure.fromDay
  const to   = closure.toMonth * 100 + closure.toDay
  return from <= to ? (val >= from && val <= to) : (val >= from || val <= to)
}
