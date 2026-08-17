// client/src/components/RiverSearch.jsx
//
// Client-side river/stream search. All waterway data is already loaded in
// the browser, so this builds a small name index once (in App.jsx) and
// filters it in-memory as the user types — no server round-trip needed.
// See ROADMAP.md Step 3: a server /api/waterways/search endpoint is only
// worth building later if the client ever stops loading the full dataset.

import React, { useState } from 'react'

const MAX_RESULTS = 8

export default function RiverSearch({ riverIndex, onSelect }) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  const q = query.trim().toLowerCase()
  const results = q
    ? riverIndex.filter(r => r.name.toLowerCase().includes(q)).slice(0, MAX_RESULTS)
    : []

  const handlePick = (entry) => {
    onSelect(entry)
    setQuery('')
    setFocused(false)
  }

  return (
    <div style={styles.wrap}>
      <input
        style={styles.input}
        placeholder="SEARCH RIVERS…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)} // let the click register first
      />
      {focused && q && (
        <div style={styles.results}>
          {results.length === 0 && <div style={styles.empty}>NO MATCHES</div>}
          {results.map(entry => (
            <button
              key={entry.riverGroup}
              style={styles.result}
              onMouseDown={() => handlePick(entry)} // fires before the input's onBlur
            >
              {entry.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { position: 'relative', pointerEvents: 'auto' },
  input: {
    fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-primary)',
    background: 'var(--surface)', border: '4px solid var(--bg)',
    boxShadow: 'inset 0 0 0 3px #f4f4f4, inset 0 0 0 6px var(--bg)',
    padding: '10px 12px', width: '180px', outline: 'none',
  },
  results: {
    position: 'absolute', top: 'calc(100% + 4px)', right: 0, width: '220px',
    background: 'var(--surface)', border: '4px solid var(--bg)',
    boxShadow: 'inset 0 0 0 3px #f4f4f4, inset 0 0 0 6px var(--bg)',
    maxHeight: '220px', overflowY: 'auto', zIndex: 30,
  },
  result: {
    display: 'block', width: '100%', textAlign: 'left',
    fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-secondary)',
    background: 'transparent', border: 'none', borderBottom: '2px solid var(--border)',
    padding: '8px 10px', cursor: 'pointer',
  },
  empty: {
    fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-muted)',
    padding: '10px 12px',
  },
}
