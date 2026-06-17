const BASE = 'http://localhost:3001/api'

export async function getRegulationsByRiver(riverName) {
  const res = await fetch(`${BASE}/regulations/${encodeURIComponent(riverName)}`)
  if (!res.ok) throw new Error(`Regulations fetch failed: ${res.status}`)
  return res.json()
}
