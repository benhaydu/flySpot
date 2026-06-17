/**
 * MapView.jsx — Interactive MapLibre GL Map
 *
 * Renders the full-screen map and all waterway layers on top of it.
 * This component is purely visual — it receives data as props and fires
 * callbacks upward; it does not own any application state itself.
 *
 * PROPS:
 *  waterways      — GeoJSON FeatureCollection (rivers + streams)
 *  onSelectFeature — called with { representative, group } on click, or null on deselect
 *  selectedIds    — number[] of OSM way IDs to highlight in gold
 *  onMapReady     — optional callback fired when the map finishes loading
 *
 * MAP LAYERS (rendered in order, bottom → top):
 *  1. riversCasing  — soft glow blur behind rivers
 *  2. streams       — thin blue lines for streams/creeks
 *  3. rivers        — thicker bright-blue lines for rivers
 *  4. hover         — cyan highlight over whichever river the cursor is on
 *  5. selected      — gold highlight over the selected river
 *
 * HOW SELECTION WORKS:
 *  Each OSM waterway way has a `riverGroup` property (the river's name,
 *  lowercased). When the user clicks or hovers a segment, ALL segments
 *  with the same riverGroup are highlighted together, so the entire river
 *  lights up rather than just the one clicked segment.
 *
 * REFS (used instead of state to avoid re-renders):
 *  mapRef        — the MapLibre Map instance
 *  hoveredKeyRef — current hovered riverGroup key (avoids redundant filter updates)
 *  waterwaysRef  — mirror of the waterways prop (readable inside event callbacks
 *                  without needing them in the dependency array)
 */

import React, { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// Internal names for each MapLibre layer. Centralised here so a rename
// only needs to happen in one place.
const LAYER_IDS = {
  rivers:       'waterways-river',
  streams:      'waterways-stream',
  riversCasing: 'waterways-river-casing',
  hover:        'waterways-hover',
  selected:     'waterways-selected',
}

export default function MapView({ waterways, onSelectFeature, selectedIds, onMapReady }) {
  const containerRef  = useRef(null) // the <div> the map is mounted into
  const mapRef        = useRef(null) // MapLibre Map instance
  const hoveredKeyRef = useRef(null) // riverGroup key currently under the cursor
  const waterwaysRef  = useRef(null) // live copy of the waterways prop

  // ── Effect 1: Initialise the map ──────────────────────────────────────────
  // Runs once on mount (empty dependency array).
  // Creates the MapLibre map, adds navigation/scale controls, and stores the
  // instance in mapRef so other effects can access it.
  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      // Free dark tile style from CartoDB — no API key required
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [-125.8, 49.6], // centre of Vancouver Island [lng, lat]
      zoom: 7.2,
      minZoom: 6,
      maxZoom: 16,
      // Restrict panning so users can't wander off the island
      maxBounds: [[-132, 46], [-119, 53]],
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left')

    mapRef.current = map
    map.on('load', () => onMapReady?.(map))

    // Cleanup: remove the map when the component unmounts
    return () => { map.remove(); mapRef.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: Keep waterwaysRef in sync ───────────────────────────────────
  // MapLibre event callbacks (click, mousemove) capture refs, not props.
  // This keeps the ref up to date whenever the prop changes, so callbacks
  // always see the latest data without needing to be recreated.
  useEffect(() => {
    waterwaysRef.current = waterways
  }, [waterways])

  // ── Effect 3: Add / refresh waterway layers ───────────────────────────────
  // Runs whenever the waterways prop changes (i.e. when the fetch completes).
  // Tears down any existing layers/source and rebuilds them from scratch.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !waterways) return

    const addLayers = () => {
      // Remove stale layers and source before re-adding
      Object.values(LAYER_IDS).forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
      if (map.getSource('waterways')) map.removeSource('waterways')

      // Add the GeoJSON source. generateId:false because we set our own `id` property.
      map.addSource('waterways', { type: 'geojson', data: waterways, generateId: false })

      // Layer 1 — Glow behind rivers (wide blurred line, very transparent)
      map.addLayer({
        id: LAYER_IDS.riversCasing, type: 'line', source: 'waterways',
        filter: ['==', ['get', 'waterway'], 'river'],
        paint: {
          'line-color': '#3d9be944', // same blue as rivers but very transparent
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 8, 12, 16],
          'line-blur': 6,
        },
      })

      // Layer 2 — Streams and creeks (thinner, dimmer)
      map.addLayer({
        id: LAYER_IDS.streams, type: 'line', source: 'waterways',
        // Only draw features whose waterway tag is one of these values
        filter: ['in', ['get', 'waterway'], ['literal', ['stream', 'creek', 'tidal_channel']]],
        paint: {
          'line-color': '#2a6fa8',
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.8, 10, 2, 14, 3],
          // Fade in streams as you zoom in (they'd be noisy at low zoom)
          'line-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0.5, 10, 0.9],
        },
      })

      // Layer 3 — Rivers (main visible waterway lines)
      map.addLayer({
        id: LAYER_IDS.rivers, type: 'line', source: 'waterways',
        filter: ['==', ['get', 'waterway'], 'river'],
        paint: {
          'line-color': '#3d9be9', // Pokemon water blue
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 2, 10, 4, 14, 7],
          'line-opacity': 1,
        },
      })

      // Layer 4 — Hover highlight (cyan, updated dynamically on mousemove)
      // Starts with an impossible filter so nothing is highlighted initially
      map.addLayer({
        id: LAYER_IDS.hover, type: 'line', source: 'waterways',
        filter: ['==', ['get', 'id'], -1], // -1 matches nothing
        paint: {
          'line-color': '#63b8ff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 4, 10, 6, 14, 10],
          'line-opacity': 1,
        },
      })

      // Layer 5 — Selected highlight (gold, updated when selectedIds prop changes)
      map.addLayer({
        id: LAYER_IDS.selected, type: 'line', source: 'waterways',
        filter: ['==', ['get', 'id'], -1], // -1 matches nothing
        paint: {
          'line-color': '#f8d030', // Pokemon yellow
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 4, 10, 6, 14, 9],
          'line-opacity': 1,
        },
      })

      // ── Mouse interactions ────────────────────────────────────────────────
      // Both river and stream layers are clickable/hoverable
      const clickableLayers = [LAYER_IDS.rivers, LAYER_IDS.streams]

      // Hover: when the cursor moves over a waterway, highlight ALL segments
      // that share the same riverGroup (i.e. the same named river)
      map.on('mousemove', clickableLayers, (e) => {
        if (!e.features.length) return
        map.getCanvas().style.cursor = 'pointer'

        const groupKey = e.features[0].properties.riverGroup

        // Only update the filter if we've moved to a different river
        if (hoveredKeyRef.current !== groupKey) {
          hoveredKeyRef.current = groupKey

          const ids = (waterwaysRef.current?.features ?? [])
            .filter(f => f.properties.riverGroup === groupKey)
            .map(f => f.properties.id)

          // ['in', ['get', 'id'], ['literal', ids]] — show all matching IDs
          map.setFilter(LAYER_IDS.hover, ['in', ['get', 'id'], ['literal', ids]])
        }
      })

      // Hover end: reset cursor and clear hover highlight
      map.on('mouseleave', clickableLayers, () => {
        map.getCanvas().style.cursor = 'crosshair'
        hoveredKeyRef.current = null
        map.setFilter(LAYER_IDS.hover, ['in', ['get', 'id'], ['literal', []]])
      })

      // Click on a waterway: find every segment in the same river group
      // and fire onSelectFeature so App can update selectedFeature state
      map.on('click', clickableLayers, (e) => {
        if (!e.features.length) return
        const props = e.features[0].properties
        const all   = waterwaysRef.current?.features ?? []
        const group = all.filter(f => f.properties.riverGroup === props.riverGroup)
        onSelectFeature?.({ representative: e.features[0], group })
      })

      // Click on empty map (no waterway under cursor) → deselect
      map.on('click', (e) => {
        const hits = map.queryRenderedFeatures(e.point, { layers: clickableLayers })
        if (!hits.length) onSelectFeature?.(null)
      })
    }

    // The style may already be loaded (e.g. on a hot-reload), or we may need
    // to wait for the 'load' event before adding layers
    if (map.isStyleLoaded()) addLayers()
    else map.once('load', addLayers)
  }, [waterways]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 4: Sync selected highlight ────────────────────────────────────
  // Whenever the parent changes which IDs are selected, update the gold
  // highlight filter. This is kept in its own effect so it runs independently
  // of the (heavier) layer setup above.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.getLayer(LAYER_IDS.selected)) return
    map.setFilter(LAYER_IDS.selected, ['in', ['get', 'id'], ['literal', selectedIds ?? []]])
  }, [selectedIds])

  // ── Render ────────────────────────────────────────────────────────────────
  // The map is mounted into this div via the MapLibre constructor above.
  // position:absolute + inset:0 makes it fill its nearest positioned ancestor
  // (the root div in App.jsx which is position:fixed).
  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, background: '#0d1117' }} />
  )
}
