const BASE = '/api/waterways'

const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('vi-fishing-map', 1)
    req.onupgradeneeded = e => e.target.result.createObjectStore('cache')
    req.onsuccess = e => resolve(e.target.result)
    req.onerror = () => reject(req.error)
  })
}

async function cacheGet(key) {
  const db = await openDB()
  return new Promise((resolve) => {
    const req = db.transaction('cache').objectStore('cache').get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
}

async function cacheSet(key, value) {
  const db = await openDB()
  return new Promise((resolve) => {
    const req = db.transaction('cache', 'readwrite').objectStore('cache').put(value, key)
    req.onsuccess = () => resolve()
    req.onerror = () => resolve()
  })
}

export async function fetchWaterways(onProgress) {
  try {
    const cached = await cacheGet('waterways')
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      onProgress?.('Loading from cache…')
      return cached.geojson
    }
  } catch {}

  onProgress?.('Loading waterways…')

  const res = await fetch(BASE)
  if (!res.ok) throw new Error(`Waterways fetch failed: ${res.status}`)
  const geojson = await res.json()

  try {
    await cacheSet('waterways', { timestamp: Date.now(), geojson })
  } catch {}

  return geojson
}