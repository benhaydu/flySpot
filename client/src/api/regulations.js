const BASE = '/api'

export async function getRegulationsByRiver(riverName) {
  const res = await fetch(`${BASE}/regulations/${encodeURIComponent(riverName)}`)
  if (!res.ok) throw new Error(`Regulations fetch failed: ${res.status}`)
  return res.json()
}

export async function getClosedToday() {
  const res = await fetch(`${BASE}/regulations/closed-today`)
  if (!res.ok) throw new Error(`Closed-today fetch failed: ${res.status}`)
  return res.json()
}
