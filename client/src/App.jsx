/**
 * App.jsx — Root Component
 *
 * This is the top of the React component tree. Every piece of UI on screen
 * either lives here or is a child of something rendered here.
 *
 * RESPONSIBILITY:
 *  - Owns all "global" state (waterway data, selected river, loading status)
 *  - Fetches OSM data once on first render via the Overpass API
 *  - Passes data and callbacks down to child components as props
 *
 * DATA FLOW (one-way, top-down):
 *
 *   App  ──waterways──────────────▶  MapView
 *        ──selectedIds────────────▶  MapView
 *        ◀─onSelectFeature────────   MapView   (user clicks a river)
 *
 *   App  ──feature, group─────────▶  RiverPanel
 *        ◀─onClose────────────────   RiverPanel
 *
 * STATE:
 *  waterways      — the full GeoJSON FeatureCollection from OSM (set once)
 *  selectedFeature — { representative: Feature, group: Feature[] } | null
 *  stats          — counts shown in the top bar chips
 *  loadingMsg     — string shown in the loading overlay, or null
 *  error          — error string shown in the error bar, or null
 */

import React, { useState, useEffect, useCallback } from 'react'
import MapView    from './components/MapView.jsx'
import RiverPanel from './components/RiverPanel.jsx'
import Pokedex    from './components/Pokedex.jsx'
import LogCatch   from './components/LogCatch.jsx'
import { fetchVancouverIslandWaterways } from './api/overpass.js'
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/AuthPage';

export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────

  // The full set of waterway features loaded from OpenStreetMap.
  // null until the fetch completes.
  const [waterways, setWaterways] = useState(null)

  // String shown in the loading overlay while data is being fetched/processed.
  // null when nothing is loading.
  const [loadingMsg, setLoadingMsg] = useState(null)

  // Error message to show in the error bar. null when no error.
  const [error, setError] = useState(null)

  // The currently selected river. Structure:
  //   representative — the single Feature the user clicked
  //   group          — ALL Features that share the same river name (used for
  //                    highlighting the whole river and calculating total length)
  const [selectedFeature, setSelectedFeature] = useState(null)

  // Summary counts shown in the top-bar stat chips.
  const [stats, setStats]             = useState(null)
  const [showPokedex, setShowPokedex]   = useState(false)
  const [showLogCatch, setShowLogCatch] = useState(false)

  const { token, saveToken, logout } = useAuth()

  // ── Data fetching ──────────────────────────────────────────────────────────

  // Runs once when the component first mounts (empty dependency array []).
  // Fetches all rivers and streams for Vancouver Island from OpenStreetMap,
  // converts them to GeoJSON, and stores them in state.
  useEffect(() => {
    if (!token || waterways) return

    setLoadingMsg('Querying OpenStreetMap…')
    setError(null)

    fetchVancouverIslandWaterways((msg) => setLoadingMsg(msg))
      .then((geojson) => {
        setWaterways(geojson)
        setLoadingMsg(null)

        const rivers  = geojson.features.filter(f => f.properties.waterway === 'river').length
        const streams = geojson.features.filter(f => ['stream', 'creek'].includes(f.properties.waterway)).length
        const named   = geojson.features.filter(f => f.properties.name).length
        setStats({ total: geojson.features.length, rivers, streams, named })
      })
      .catch((err) => {
        console.error(err)
        setLoadingMsg(null)
        setError('Failed to load waterway data. Check your connection and try refreshing.')
      })
  }, [token])

  // ── Callbacks ──────────────────────────────────────────────────────────────

  // Called by MapView when the user clicks a river segment.
  // useCallback prevents a new function reference on every render,
  // which would cause MapView to re-run effects unnecessarily.
  const handleSelectFeature = useCallback((feature) => {
    setSelectedFeature(feature)
  }, [])

  if (!token) return <AuthPage onSuccess={saveToken} />

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={styles.root}>

      {/* ── Map ─────────────────────────────────────────────────────────────
          MapView renders the MapLibre GL map and all waterway layers.
          - waterways:    the GeoJSON data to draw
          - selectedIds:  array of OSM way IDs to highlight in gold
          - onSelectFeature: fired when user clicks a river
      ───────────────────────────────────────────────────────────────────── */}
      <MapView
        waterways={waterways}
        onSelectFeature={handleSelectFeature}
        selectedIds={selectedFeature?.group?.map(f => f.properties.id) ?? []}
      />

      {/* ── Top bar ─────────────────────────────────────────────────────────
          Floats above the map. Contains the app logo and stat chips.
          pointerEvents: none so clicks pass through to the map underneath,
          then re-enabled on individual interactive children.
      ───────────────────────────────────────────────────────────────────── */}
      <div style={styles.topBar}>
        <div style={styles.logo}>
          <div style={styles.logoTitle}>▶ TOWN MAP</div>
          <div style={styles.logoSub}>Vancouver Island</div>
          <button onClick={() => setShowPokedex(true)} style={styles.pokedexBtn}>▶ POKÉDEX</button>
          <button onClick={logout} style={styles.logoutBtn}>LOGOUT</button>
        </div>

        {/* Only renders after the waterway data has loaded */}
        {stats && (
          <div style={styles.statsBar}>
            <StatChip label="WAYS"    value={stats.total.toLocaleString()} />
            <StatChip label="RIVERS"  value={stats.rivers.toLocaleString()} />
            <StatChip label="STREAMS" value={stats.streams.toLocaleString()} />
            <StatChip label="NAMED"   value={stats.named.toLocaleString()} />
          </div>
        )}
      </div>

      {/* ── Loading overlay ──────────────────────────────────────────────────
          Covers the entire screen while data is being fetched.
          The spinner uses a stepped animation for the retro pixel feel.
      ───────────────────────────────────────────────────────────────────── */}
      {loadingMsg && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingCard}>
            <div style={styles.loadingSpinner} />
            <span style={styles.loadingText}>{loadingMsg}</span>
          </div>
        </div>
      )}

      {/* ── Error bar ────────────────────────────────────────────────────────
          Shown at the bottom when the Overpass fetch fails.
      ───────────────────────────────────────────────────────────────────── */}
      {error && (
        <div style={styles.errorBar}>
          {error}
          <button style={styles.errorDismiss} onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* ── Hint ─────────────────────────────────────────────────────────────
          Shown only when data is loaded but nothing is selected yet.
          Blinks to draw attention.
      ───────────────────────────────────────────────────────────────────── */}
      {!selectedFeature && !loadingMsg && waterways && (
        <div style={styles.hint}>► PRESS A to select a waterway</div>
      )}

      {/* ── River panel ──────────────────────────────────────────────────────
          Slides in from the right when a river is selected.
          Passes both the clicked feature (for display) and the full group
          (for total length calculation and complete highlighting).
      ───────────────────────────────────────────────────────────────────── */}
      {selectedFeature && (
        <>
          <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
          <RiverPanel
            feature={selectedFeature.representative}
            group={selectedFeature.group}
            onClose={() => setSelectedFeature(null)}
            onLogCatch={() => setShowLogCatch(true)}
          />
        </>
      )}

      {showPokedex && <Pokedex onClose={() => setShowPokedex(false)} />}

      {showLogCatch && (
        <LogCatch
          selectedRiver={selectedFeature?.representative?.properties?.name || ''}
          onClose={() => setShowLogCatch(false)}
          onSuccess={() => setShowLogCatch(false)}
        />
      )}


      {/* ── Legend ───────────────────────────────────────────────────────────
          Fixed to the bottom-left. Explains map line colours.
      ───────────────────────────────────────────────────────────────────── */}
      <div style={styles.legend}>
        <div style={styles.legendTitle}>KEY</div>
        <LegendRow color="var(--river)"          thick label="RIVER" />
        <LegendRow color="#2a6fa8"               thin  label="STREAM" />
        <LegendRow color="var(--river-selected)" thick label="SELECTED" />
      </div>

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

/**
 * StatChip — a single labelled number in the top-bar stats row.
 * e.g.  "1 243"
 *        RIVERS
 */
function StatChip({ label, value }) {
  return (
    <div style={styles.chip}>
      <div style={styles.chipValue}>{value}</div>
      <div style={styles.chipLabel}>{label}</div>
    </div>
  )
}

/**
 * LegendRow — one row in the map legend.
 * Renders a short coloured line followed by a text label.
 */
function LegendRow({ color, thick, label }) {
  return (
    <div style={styles.legendRow}>
      <div style={{ width: 20, height: thick ? 3 : 1.5, background: color, flexShrink: 0 }} />
      <span style={styles.legendLabel}>{label}</span>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

// Reusable pixel-panel border style (used on several UI boxes).
// Creates the layered border: dark → white → dark → content.
const pixelPanel = {
  background: 'var(--surface)',
  border: '4px solid var(--bg)',
  boxShadow: 'inset 0 0 0 3px #f4f4f4, inset 0 0 0 6px var(--bg)',
}

const styles = {
  root: { position: 'fixed', inset: 0, overflow: 'hidden' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5,
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '12px 56px 12px 16px', pointerEvents: 'none', gap: '16px',
  },
  logo:       { ...pixelPanel, padding: '10px 14px', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' },
  pokedexBtn: { fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--river-selected)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: '4px' },
  logoutBtn:  { fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 },
  logCatchBtn: {
    position: 'absolute', bottom: '90px', right: '16px', zIndex: 10,
    background: 'var(--accent-green)', color: '#0a0c1a',
    fontFamily: 'var(--font-pixel)', fontSize: '8px',
    border: '4px solid #f4f4f4',
    boxShadow: 'inset 0 0 0 4px #1a1c2c, 0 0 0 4px #1a1c2c',
    padding: '12px 16px', cursor: 'pointer',
  },
  logoTitle: { fontFamily: 'var(--font-pixel)', fontSize: '11px', color: 'var(--river-selected)', lineHeight: 1.6 },
  logoSub:   { fontFamily: 'var(--font-pixel)', fontSize: '7px',  color: 'var(--text-secondary)', marginTop: '4px' },
  statsBar:  { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' },
  chip:      { ...pixelPanel, padding: '6px 10px', textAlign: 'center', pointerEvents: 'auto' },
  chipValue: { fontFamily: 'var(--font-pixel)', fontSize: '10px', color: 'var(--river)', lineHeight: 1.6 },
  chipLabel: { fontFamily: 'var(--font-pixel)', fontSize: '6px',  color: 'var(--text-muted)', marginTop: '3px' },
  loadingOverlay: {
    position: 'absolute', inset: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 20, background: 'rgba(26,28,44,0.85)',
  },
  loadingCard: {
    ...pixelPanel, padding: '24px 32px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
  },
  loadingSpinner: {
    width: '20px', height: '20px',
    border: '3px solid var(--border)', borderTop: '3px solid var(--river-selected)',
    borderRadius: '0', animation: 'spin 0.6s steps(8) infinite',
  },
  loadingText: {
    fontFamily: 'var(--font-pixel)', fontSize: '8px',
    color: 'var(--text-secondary)', animation: 'blink 1s steps(1) infinite',
  },
  errorBar: {
    position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
    ...pixelPanel, background: '#3a1515', padding: '12px 16px',
    fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#ff6060',
    display: 'flex', alignItems: 'center', gap: '12px', zIndex: 20, whiteSpace: 'nowrap',
  },
  errorDismiss: {
    background: 'transparent', border: 'none',
    color: '#ff6060', cursor: 'pointer', fontSize: '12px', fontFamily: 'var(--font-pixel)',
  },
  hint: {
    position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)',
    ...pixelPanel, padding: '8px 14px',
    fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-secondary)',
    pointerEvents: 'none', whiteSpace: 'nowrap', animation: 'blink 1.2s steps(1) infinite',
  },
  legend: {
    position: 'absolute', bottom: '80px', left: '16px',
    ...pixelPanel, padding: '10px 14px',
    display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 5,
  },
  legendTitle: { fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--river-selected)', letterSpacing: '0.1em', marginBottom: '2px' },
  legendRow:   { display: 'flex', alignItems: 'center', gap: '8px' },
  legendLabel: { fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-secondary)' },
}
