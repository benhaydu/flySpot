/**
 * overpass.js — OpenStreetMap Data Fetcher
 *
 * Fetches all rivers and streams for Vancouver Island directly from
 * OpenStreetMap using the Overpass API, then converts the raw OSM
 * response into a GeoJSON FeatureCollection that MapLibre can render.
 *
 * WHY OVERPASS (not a database)?
 *  OSM's Overpass API lets us query geographic data without hosting it
 *  ourselves. When MongoDB is wired up, user-generated data (bookmarks,
 *  notes, catches) will be stored there; the base map geometry always
 *  comes from OSM.
 *
 * FLOW:
 *  1. POST an Overpass QL query to the public API
 *  2. If that fails (timeout / rate limit), retry on a mirror server
 *  3. Parse the JSON response (array of OSM "elements")
 *  4. Filter out noise (tiny unnamed streams, ways with too few nodes)
 *  5. Convert each OSM way into a GeoJSON Feature with our custom properties
 *  6. Return a GeoJSON FeatureCollection
 *
 * KEY PROPERTY — riverGroup:
 *  Every Feature gets a `riverGroup` property set to the river's name
 *  (lowercased + trimmed), or "unnamed-{id}" if the river has no name.
 *  This is the grouping key used in MapView to highlight the WHOLE river
 *  when the user clicks or hovers any single segment.
 */

const OVERPASS_URL    = 'https://overpass.kumi.systems/api/interpreter'
const OVERPASS_MIRROR = 'https://overpass-api.de/api/interpreter'

/**
 * Fetches all Vancouver Island waterways and returns a GeoJSON FeatureCollection.
 *
 * @param {function} onProgress  — optional callback(string) for status updates
 * @returns {Promise<GeoJSON.FeatureCollection>}
 */
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('vi-fishing-map', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('cache');
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

async function cacheGet(key) {
  const db = await openDB();
  return new Promise((resolve) => {
    const req = db.transaction('cache').objectStore('cache').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

async function cacheSet(key, value) {
  const db = await openDB();
  return new Promise((resolve) => {
    const req = db.transaction('cache', 'readwrite').objectStore('cache').put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function fetchVancouverIslandWaterways(onProgress) {
  try {
    const cached = await cacheGet('waterways');
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      onProgress?.('Loading from cache…');
      return cached.geojson;
    }
  } catch {}

  const query = `
    [out:json][timeout:60];
    area(3602249770)->.vi;
    (
      way["waterway"="river"](area.vi);
      way["waterway"="stream"]["name"](area.vi);
    );
    out geom;
  `

  onProgress?.('Querying OpenStreetMap…')

  let response
  try {
    response = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  } catch {
    onProgress?.('Trying mirror server…')
    response = await fetch(OVERPASS_MIRROR, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  }

  if (!response.ok) throw new Error(`Overpass error: ${response.status}`)

  onProgress?.('Processing waterway data…')
  const data = await response.json()

  onProgress?.('Filtering waterways…')
  const geojson = osmToGeoJSON(data.elements)

  try {
    await cacheSet('waterways', { timestamp: Date.now(), geojson });
  } catch {}

  return geojson
}

// ── Filtering thresholds ──────────────────────────────────────────────────────

// Ignore unnamed streams shorter than this many coordinate nodes
const MIN_NODES_STREAM = 5
// Ignore unnamed streams shorter than this distance (kills tiny ditches)
const MIN_LENGTH_KM_UNNAMED_STREAM = 1.0

// ── Conversion ────────────────────────────────────────────────────────────────

/**
 * Converts a raw Overpass elements array into a GeoJSON FeatureCollection.
 * Applies noise filters to keep the dataset clean.
 */
function osmToGeoJSON(elements) {
  const features = []

  for (const el of elements) {
    // Skip non-ways and ways with fewer than 2 nodes (can't form a line)
    if (el.type !== 'way' || !el.geometry || el.geometry.length < 2) continue

    // Overpass returns geometry as [{lat, lon}, ...] — flip to GeoJSON [lon, lat]
    const coords   = el.geometry.map(pt => [pt.lon, pt.lat])
    const tags     = el.tags || {}
    const waterway = tags.waterway || 'stream'
    const name     = tags.name || tags['name:en'] || null

    if (waterway === 'river') {
      // Keep all named rivers; skip tiny unnamed river fragments
      if (!name && coords.length < 4) continue
      features.push(makeFeature(el, coords, tags, name, waterway))
      continue
    }

    // Stream filtering: skip very short or very small unnamed streams
    if (coords.length < MIN_NODES_STREAM) continue
    if (!name && calcLengthKm(coords) < MIN_LENGTH_KM_UNNAMED_STREAM) continue

    features.push(makeFeature(el, coords, tags, name, waterway))
  }

  return { type: 'FeatureCollection', features }
}

/**
 * Builds a single GeoJSON Feature from an OSM way element.
 * All properties used by MapView and RiverPanel are set here.
 */
function makeFeature(el, coords, tags, name, waterway) {
  return {
    type: 'Feature',
    id: el.id, // used by MapLibre for feature-state (if needed in future)
    geometry: { type: 'LineString', coordinates: coords },
    properties: {
      id: el.id,           // OSM way ID — links to openstreetmap.org/way/{id}

      // THE GROUPING KEY — all segments of the same named river share this.
      // MapView uses it to highlight the entire river, not just one segment.
      // Format: lowercased name, or "unnamed-{id}" for unnamed waterways.
      riverGroup: name?.trim().toLowerCase() || `unnamed-${el.id}`,

      name,                // Original display name (may be null)
      waterway,            // "river", "stream", "creek", or "tidal_channel"
      width:       tags.width       ? parseFloat(tags.width) : null, // metres
      intermittent: tags.intermittent === 'yes', // true = seasonal/dry-season river
      tunnel:       tags.tunnel      === 'yes',  // true = underground section
      wikipedia:    tags.wikipedia   || null,
      wikidata:     tags.wikidata    || null,
    },
  }
}

// ── Geometry helper ───────────────────────────────────────────────────────────

/**
 * Calculates the total length of a polyline in kilometres using the
 * Haversine formula (accounts for Earth's curvature).
 *
 * @param {[number, number][]} coordinates  — GeoJSON [lon, lat] pairs
 * @returns {number}  length in km
 */
export function calcLengthKm(coordinates) {
  let total = 0
  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1]
    const [lon2, lat2] = coordinates[i]
    const R    = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
    total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }
  return total
}
