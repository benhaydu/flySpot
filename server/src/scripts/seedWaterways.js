import 'dotenv/config'
import '../config/validateEnv.js'

import { simplify } from '@turf/simplify'
import mongoose from 'mongoose'
import { connectDB } from '../db.js'
import Waterway from '../models/Waterway.js'

const OVERPASS_URL    = 'https://overpass.kumi.systems/api/interpreter'
const OVERPASS_MIRROR = 'https://overpass-api.de/api/interpreter'

// Overpass's usage policy asks for a User-Agent identifying the request and,
// ideally, a way to reach the project owner before banning instead of after.
const USER_AGENT = 'flySpot/1.0 (personal project; https://github.com/benhaydu/flySpot)'

const SIMPLIFY_TOLERANCE = 0.0001 // ~11m — trims points without visibly changing the line

// Same filtering thresholds the client used to apply
const MIN_NODES_STREAM = 5
const MIN_LENGTH_KM_UNNAMED_STREAM = 1.0

async function fetchOverpassData() {
  const query = `
    [out:json][timeout:180];
    area(3602249770)->.vi;
    (
      way["waterway"="river"](area.vi);
      way["waterway"="stream"]["name"](area.vi);
    );
    out geom;
  `

  const tryFetch = (url) =>
    fetch(url, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
    })

  // Reads and includes the response body in the error, both for a more useful
  // message (Overpass usually explains *why* in the body) and to avoid a known
  // Node/Windows crash triggered by calling process.exit() after an unconsumed
  // fetch response body.
  const readError = async (response) => {
    const text = await response.text().catch(() => '')
    return new Error(`Overpass error: ${response.status}${text ? ` — ${text}` : ''}`)
  }

  let response
  try {
    response = await tryFetch(OVERPASS_URL)
    if (!response.ok) throw await readError(response)
  } catch (err) {
    console.log(`Primary Overpass failed (${err.message}), trying mirror...`)
    response = await tryFetch(OVERPASS_MIRROR)
  }

  if (!response.ok) throw await readError(response)
  const data = await response.json()
  return data.elements
}

function calcLengthKm(coordinates) {
  let total = 0
  for (let i = 1; i < coordinates.length; i++) {
    const [lon1, lat1] = coordinates[i - 1]
    const [lon2, lat2] = coordinates[i]
    const R = 6371
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

function calcBbox(coordinates) {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity
  for (const [lon, lat] of coordinates) {
    if (lon < minLon) minLon = lon
    if (lon > maxLon) maxLon = lon
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
  }
  return [minLon, minLat, maxLon, maxLat]
}

function elementToWaterwayDoc(el) {
  if (el.type !== 'way' || !el.geometry || el.geometry.length < 2) return null

  const coords   = el.geometry.map(pt => [pt.lon, pt.lat])
  const tags     = el.tags || {}
  const waterway = tags.waterway || 'stream'
  const name     = tags.name || tags['name:en'] || null

  if (waterway === 'river') {
    if (!name && coords.length < 4) return null
  } else {
    if (coords.length < MIN_NODES_STREAM) return null
    if (!name && calcLengthKm(coords) < MIN_LENGTH_KM_UNNAMED_STREAM) return null
  }

  const simplified = simplify(
    { type: 'LineString', coordinates: coords },
    { tolerance: SIMPLIFY_TOLERANCE, highQuality: true }
  )

  const normalizedName = name?.trim().toLowerCase() || null

  return {
    osmId:          el.id,
    name,
    normalizedName,
    riverGroup:     normalizedName || `unnamed-${el.id}`,
    waterway,
    geometry:       simplified,
    bbox:           calcBbox(simplified.coordinates),
    width:          tags.width ? parseFloat(tags.width) : null,
    intermittent:   tags.intermittent === 'yes',
    tunnel:         tags.tunnel === 'yes',
    wikipedia:      tags.wikipedia || null,
    wikidata:       tags.wikidata || null,
  }
}

async function seedWaterways() {
  await connectDB()

  console.log('Querying Overpass for Vancouver Island waterways...')
  const elements = await fetchOverpassData()
  console.log(`Received ${elements.length} raw elements from OSM`)

  const docs = elements.map(elementToWaterwayDoc).filter(Boolean)
  console.log(`${docs.length} waterways passed filtering`)

  let upserted = 0
  for (const doc of docs) {
    await Waterway.findOneAndUpdate(
      { osmId: doc.osmId },
      doc,
      { upsert: true, new: true, runValidators: true }
    )
    upserted++
  }

  console.log(`Done — upserted ${upserted} waterways`)
  await mongoose.disconnect()
}

seedWaterways().catch(async (err) => {
  console.error('Seeding failed:', err)
  await mongoose.disconnect().catch(() => {})
  process.exitCode = 1
})
