import React, { useState, useEffect } from 'react'
import { calcLengthKm } from '../api/overpass.js'
import { getCatchesByRiver } from '../api/catches.js'
import { getSpeciesByRiver } from '../api/fish.js'
import { getRegulationsByRiver } from '../api/regulations.js'
import FishSprite from './FishSprite.jsx'

// Maps open-meteo weather codes to readable labels
const weatherLabel = (code) => {
  if (code === 0)   return 'CLEAR'
  if (code <= 3)    return 'PARTLY CLOUDY'
  if (code <= 48)   return 'FOGGY'
  if (code <= 67)   return 'RAIN'
  if (code <= 77)   return 'SNOW'
  if (code <= 82)   return 'SHOWERS'
  if (code <= 99)   return 'STORM'
  return 'UNKNOWN'
}

// OSM waterway tag → display label
const WATERWAY_LABELS = {
  river:         'River',
  stream:        'Stream',
  creek:         'Creek',
  tidal_channel: 'Tidal Channel',
}

export default function RiverPanel({ feature, group, onClose, onLogCatch }) {
  const [catches, setCatches]                   = useState([])
  const [availableSpecies, setAvailableSpecies] = useState([])
  const [weather, setWeather]                   = useState(null)
  const [regulations, setRegulations]           = useState(undefined)
  const [error, setError]                       = useState(null)

  // Fetch catches and available species when the selected river changes
  useEffect(() => {
    if (!feature?.properties?.name) return
    const name = feature.properties.name
    Promise.all([
      getCatchesByRiver(name),
      getSpeciesByRiver(name),
    ]).then(([riverCatches, riverSpecies]) => {
      setCatches(riverCatches)
      setAvailableSpecies(riverSpecies.speciesList || [])
    })
  }, [feature])

  // Fetch live weather from open-meteo using the midpoint of the river segment
  useEffect(() => {
    if (!feature) return
    const coords = feature.geometry.coordinates
    const [lon, lat] = coords[Math.floor(coords.length / 2)]
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m,weather_code`
        )
        const data = await res.json()
        setWeather(data.current)
      } catch (err) {
        setError('Failed to load weather')
      }
    }
    fetchWeather()
  }, [feature])

  // Fetch BC fishing regulations for this river
  useEffect(() => {
    if (!feature?.properties?.name) { setRegulations(null); return }
    setRegulations(undefined)
    getRegulationsByRiver(feature.properties.name.toLowerCase())
      .then(setRegulations)
      .catch(() => setRegulations(null))
  }, [feature])

  if (!feature) return null

  const { name, waterway, intermittent, width } = feature.properties
  const label       = WATERWAY_LABELS[waterway] || 'Waterway'
  const displayName = name || `Unnamed ${label}`

  // A river in OSM is often split into many way segments — sum them all for true length
  const segments      = group?.length > 0 ? group : [feature]
  const totalLengthKm = segments
    .reduce((sum, f) => sum + calcLengthKm(f.geometry.coordinates), 0)
    .toFixed(1)
  const segmentCount = segments.length

  // Midpoint of clicked segment used for map links and coordinate display
  const coords           = feature.geometry.coordinates
  const [midLon, midLat] = coords[Math.floor(coords.length / 2)]
  const googleMapsUrl    = `https://www.google.com/maps?q=${midLat},${midLon}`
  const osmUrl           = `https://www.openstreetmap.org/way/${feature.properties.id}`

  return (
    <div style={styles.panel}>

      {/* Fixed header — stays visible while content below scrolls */}
      <div style={styles.header}>
        <div style={styles.typeTag}>★ {label.toUpperCase()} ★</div>
        <div style={styles.titleRow}>
          <h2 style={styles.title}>{displayName}</h2>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">Back</button>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Scrollable content below the header */}
      <div style={styles.scrollContent}>

        {/* River stats — length pulled from OSM geometry, others from tags */}
        <div style={styles.statsBlock}>
          <StatRow label="LENGTH"   value={`${totalLengthKm} km`} />
          <StatRow label="TYPE"     value={label.toUpperCase()} color="var(--river)" />
          {segmentCount > 1 && <StatRow label="SEGMENTS" value={segmentCount} />}
          {intermittent && <StatRow label="FLOW" value="SEASONAL" color="var(--accent-amber)" />}
          {width && <StatRow label="WIDTH" value={`${width}m`} />}
        </div>

        <div style={styles.divider} />

        {/* Live weather from open-meteo */}
        <div style={styles.statsBlock}>
          <div style={styles.catchesTitle}>▶ WEATHER</div>
          {weather ? (
            <>
              <StatRow label="TEMP"   value={`${weather.temperature_2m}°C`} color="var(--river-selected)" />
              <StatRow label="WIND"   value={`${weather.wind_speed_10m} km/h`} />
              <StatRow label="RAIN"   value={`${weather.precipitation} mm`} color="var(--river)" />
              <StatRow label="COND"   value={weatherLabel(weather.weather_code)} />
            </>
          ) : (
            <div style={styles.noCatches}>LOADING WEATHER...</div>
          )}
        </div>

        <div style={styles.divider} />

        {/* BC fishing regulations — undefined = loading, null = none found */}
        <div style={styles.statsBlock}>
          <div style={styles.catchesTitle}>▶ REGULATIONS</div>
          {regulations === undefined && <div style={styles.noCatches}>LOADING...</div>}
          {regulations === null && <div style={styles.noCatches}>NO SPECIAL REGULATIONS</div>}
          {regulations?.rules?.length > 0 && (
            <>
              <div style={styles.mgmtUnit}>MGMT UNIT {regulations.mgmtUnit}</div>
              {regulations.rules.map((rule, i) => (
                <div key={i} style={styles.ruleRow}>▸ {rule}</div>
              ))}
            </>
          )}
        </div>

        <div style={styles.divider} />

        {/* Log a new catch for this river */}
        <div style={styles.logSection}>
          <button onClick={onLogCatch} style={styles.logBtn}>+ LOG A CATCH</button>
        </div>

        <div style={styles.divider} />

        {/* Species known to live in this river — locked sprite if not yet caught */}
        {availableSpecies.length > 0 && (
          <>
            <div style={styles.catchesSection}>
              <div style={styles.catchesTitle}>▶ FISH IN THIS RIVER</div>
              <div style={styles.speciesGrid}>
                {availableSpecies.map(sp => {
                  const isCaught = catches.some(c => c.speciesCode === sp.code)
                  return (
                    <div key={sp.code} style={styles.speciesCard}>
                      <FishSprite code={sp.code} size={48} locked={!isCaught} />
                      <div style={{ ...styles.catchDate, color: isCaught ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                        {sp.name}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={styles.divider} />
          </>
        )}

        {/* User's logged catches for this river */}
        <div style={styles.catchesSection}>
          <div style={styles.catchesTitle}>▶ MY CATCHES</div>
          {catches.length === 0 ? (
            <div style={styles.noCatches}>NO CATCHES LOGGED YET</div>
          ) : (
            <div style={styles.catchList}>
              {catches.map(c => (
                <div key={c._id} style={styles.catchCard}>
                  <FishSprite code={c.speciesCode} size={48} locked={false} />
                  <div style={styles.catchInfo}>
                    <div style={styles.catchName}>{c.speciesName}</div>
                    <div style={styles.catchMeta}>
                      {c.weight ? `${c.weight}kg` : ''}
                      {c.weight && c.length ? ' · ' : ''}
                      {c.length ? `${c.length}cm` : ''}
                    </div>
                    <div style={styles.catchDate}>
                      {new Date(c.caughtAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.divider} />

        {/* External map links centred on this river */}
        <div style={styles.links}>
          <a href={googleMapsUrl} target="_blank" rel="noreferrer" style={styles.link}>► GOOGLE MAPS</a>
          <a href={osmUrl}        target="_blank" rel="noreferrer" style={styles.link}>► OPENSTREETMAP</a>
        </div>

        <div style={styles.coords}>
          {midLat.toFixed(4)}°N {Math.abs(midLon).toFixed(4)}°W
        </div>

      </div>
    </div>
  )
}

// Label + value row used in stats and weather blocks
function StatRow({ label, value, color }) {
  return (
    <div style={styles.statRow}>
      <span style={styles.statLabel}>{label}</span>
      <span style={{ ...styles.statValue, color: color || 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

const styles = {
  panel: {
    position: 'absolute', top: 0, right: 0,
    width: '300px', height: '100%',
    background: 'var(--surface)',
    borderLeft: '6px solid #f4f4f4',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', zIndex: 10,
    animation: 'slideIn 0.15s steps(4) forwards',
  },
  scrollContent: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  header:   { background: 'var(--river)', padding: '14px 16px 12px' },
  typeTag:  { fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--bg)', letterSpacing: '0.1em', marginBottom: '8px' },
  titleRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' },
  title:    { fontFamily: 'var(--font-pixel)', fontSize: '11px', lineHeight: 1.6, color: '#fff', wordBreak: 'break-word', flex: 1 },
  closeBtn: {
    background: 'var(--bg)', border: '3px solid #fff', color: '#fff',
    cursor: 'pointer', fontSize: '8px', fontFamily: 'var(--font-pixel)',
    width: '43px', height: '30px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  divider:    { height: '4px', background: 'var(--bg)', boxShadow: 'inset 0 2px 0 #f4f4f4' },
  statsBlock: { padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  statRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px dashed var(--border)', paddingBottom: '8px' },
  statLabel:  { fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-muted)' },
  statValue:  { fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--text-primary)' },
  logSection: { padding: '12px 16px' },
  logBtn: {
    width: '100%', padding: '12px',
    background: 'var(--accent-green)', color: '#0a0c1a',
    fontFamily: 'var(--font-pixel)', fontSize: '8px',
    border: '4px solid #f4f4f4',
    boxShadow: 'inset 0 0 0 3px #0a0c1a',
    cursor: 'pointer',
  },
  catchesSection: { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  catchesTitle:   { fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--river-selected)', letterSpacing: '1px' },
  noCatches:      { fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', animation: 'blink 1.5s steps(1) infinite' },
  speciesGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' },
  speciesCard:    { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'var(--surface2)', border: '2px solid var(--border)', padding: '8px 4px' },
  catchList:      { display: 'flex', flexDirection: 'column', gap: '8px' },
  catchCard:      { display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface2)', border: '2px solid var(--border)', padding: '8px' },
  catchInfo:      { display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 },
  catchName:      { fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-primary)', lineHeight: 1.4 },
  catchMeta:      { fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--river)' },
  catchDate:      { fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-muted)' },
  mgmtUnit:       { fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--accent-amber)', letterSpacing: '1px' },
  ruleRow:        { fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-secondary)', lineHeight: 1.8, borderBottom: '1px dashed var(--border)', paddingBottom: '6px' },
  links:          { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  link:           { fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--river)', textDecoration: 'none' },
  coords:         { fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-muted)', padding: '0 16px 14px', marginTop: 'auto' },
}
