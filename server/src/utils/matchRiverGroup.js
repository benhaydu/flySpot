// server/src/utils/matchRiverGroup.js
//
// Shared name-matching logic for bridging BC government data (fish
// observations, fishing regulations — both keyed by the official BC
// "gazetted" water body name) to this app's `riverGroup` key, which comes
// from OpenStreetMap's `name` tag. The two naming schemes frequently
// disagree (capitalization, "Lower"/"Upper" qualifiers, parenthetical
// notes), so a plain equality match misses most rivers.
// Used by seedFishData.js and parseRegulations.js.

export function normalizeName(name) {
  return name.toLowerCase().replace(/['"]/g, '').replace(/\s+/g, ' ').trim()
}

// riverGroupSet: Set<string> of normalized riverGroup values (from Waterway).
// Returns the matched riverGroup, or null if nothing reasonably matches.
export function matchRiverGroup(rawName, riverGroupSet) {
  const normalized = normalizeName(rawName)
  if (riverGroupSet.has(normalized)) return normalized

  // Strip parenthetical qualifiers: "Adam River (except Eve River)" → "adam river"
  const withoutParens = normalized.replace(/\s*\(.*?\)/g, '').trim()
  if (riverGroupSet.has(withoutParens)) return withoutParens

  // Strip leading directional qualifiers BC names sometimes add
  const stripped = withoutParens.replace(/^(lower|upper|middle|north|south|east|west)\s+/i, '').trim()
  if (riverGroupSet.has(stripped)) return stripped

  // Fall back to a prefix match in either direction
  for (const group of riverGroupSet) {
    if (group.startsWith(withoutParens) || withoutParens.startsWith(group)) return group
  }

  return null
}