import { useState, useEffect } from 'react';
import { getAllSpecies } from '../api/fish';
import { getMyCatches, getCatchStats } from '../api/catches';
import FishSprite from './FishSprite.jsx';
import ActivityHeatmap from './ActivityHeatmap.jsx';

export default function Pokedex({ onClose }) {
  const [tab, setTab]           = useState('species'); // 'species' | 'stats'
  const [species, setSpecies]   = useState([]);
  const [caught, setCaught]     = useState(new Set());
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    Promise.all([getAllSpecies(), getMyCatches(), getCatchStats()])
      .then(([allSpecies, myCatches, catchStats]) => {
        setSpecies(allSpecies);
        setCaught(new Set(myCatches.map(c => c.speciesCode)));
        setStats(catchStats);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load Pokédex data.');
        setLoading(false);
      });
  }, []);

  const caughtCount = species.filter(s => caught.has(s.code)).length;

  return (
    <div style={s.overlay}>
      <div style={s.panel}>

        <div style={s.header}>
          <div style={s.title}>▶ POKÉDEX</div>
          <div style={s.subtitle}>VANCOUVER ISLAND</div>
          <div style={s.count}>
            {caughtCount}/{species.length} CAUGHT
          </div>
          <button onClick={onClose} style={s.closeBtn}>✕ CLOSE</button>
        </div>

        <div style={s.tabs}>
          <button
            style={{ ...s.tabBtn, ...(tab === 'species' ? s.tabBtnActive : {}) }}
            onClick={() => setTab('species')}
          >
            SPECIES
          </button>
          <button
            style={{ ...s.tabBtn, ...(tab === 'stats' ? s.tabBtnActive : {}) }}
            onClick={() => setTab('stats')}
          >
            STATS
          </button>
        </div>

        {loading ? (
          <div style={s.loading}>LOADING...</div>
        ) : error ? (
          <div style={s.loading}>{error}</div>
        ) : tab === 'species' ? (
          <div style={s.grid}>
            {species.map(sp => {
              const isCaught = caught.has(sp.code);
              return (
                <div key={sp.code} style={{ ...s.card, ...(isCaught ? s.cardCaught : s.cardLocked) }}>
                  <FishSprite code={sp.code} size={70} locked={!isCaught} />
                  <div style={s.code}>{sp.code}</div>
                  <div style={s.name}>{isCaught ? sp.name : '???'}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={s.statsPane}>
            <div style={s.statsGrid}>
              <StatBlock label="TOTAL CATCHES" value={stats.totalCatches} />
              <StatBlock label="SPECIES CAUGHT" value={`${stats.uniqueSpecies}/${species.length}`} />
              <StatBlock
                label="LONGEST CATCH"
                value={stats.longest ? `${stats.longest.length}cm` : '—'}
                sub={stats.longest?.speciesName}
              />
              <StatBlock
                label="HEAVIEST CATCH"
                value={stats.heaviest ? `${stats.heaviest.weight}kg` : '—'}
                sub={stats.heaviest?.speciesName}
              />
              <StatBlock
                label="TOP RIVER"
                value={stats.topRiver ? titleCase(stats.topRiver.riverGroup) : '—'}
                sub={stats.topRiver ? `${stats.topRiver.count} catches` : null}
              />
            </div>

            <div style={s.heatmapSection}>
              <div style={s.heatmapLabel}>▶ LAST 12 WEEKS</div>
              <ActivityHeatmap activity={stats.activity} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

function StatBlock({ label, value, sub }) {
  return (
    <div style={s.statBlock}>
      <div style={s.statBlockLabel}>{label}</div>
      <div style={s.statBlockValue}>{value}</div>
      {sub && <div style={s.statBlockSub}>{sub}</div>}
    </div>
  );
}

const pixelBorder = {
  border: '4px solid #f4f4f4',
  boxShadow: 'inset 0 0 0 4px #1a1c2c, 0 0 0 4px #1a1c2c',
};

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 50,
    background: 'rgba(26,28,44,0.95)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panel: {
    ...pixelBorder,
    background: 'var(--surface)',
    width: '90%', maxWidth: '700px',
    maxHeight: '85vh',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '4px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'var(--font-pixel)', fontSize: '12px',
    color: 'var(--river-selected)',
  },
  subtitle: {
    fontFamily: 'var(--font-pixel)', fontSize: '7px',
    color: 'var(--text-muted)',
  },
  count: {
    fontFamily: 'var(--font-pixel)', fontSize: '7px',
    color: 'var(--accent-green)', marginLeft: 'auto',
  },
  closeBtn: {
    ...pixelBorder,
    background: 'var(--surface2)',
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-pixel)', fontSize: '6px',
    border: '4px solid #f4f4f4',
    padding: '6px 10px', cursor: 'pointer',
  },
  tabs: {
    display: 'flex', gap: '2px',
    padding: '10px 20px 0', borderBottom: '4px solid var(--border)',
  },
  tabBtn: {
    background: 'var(--surface2)', color: 'var(--text-muted)',
    fontFamily: 'var(--font-pixel)', fontSize: '7px',
    border: 'none', padding: '10px 16px', cursor: 'pointer',
  },
  tabBtnActive: {
    background: 'var(--surface)', color: 'var(--river-selected)',
  },
  loading: {
    fontFamily: 'var(--font-pixel)', fontSize: '8px',
    color: 'var(--text-muted)', padding: '40px',
    textAlign: 'center', animation: 'blink 1s steps(1) infinite',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '8px', padding: '16px',
    overflowY: 'auto',
  },
  card: {
    ...pixelBorder,
    padding: '12px 8px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '6px', textAlign: 'center',
    cursor: 'default',
  },
  cardCaught: {
    background: 'var(--surface2)',
  },
  cardLocked: {
    background: '#0a0c1a',
  },
  code: {
    fontFamily: 'var(--font-pixel)', fontSize: '6px',
    color: 'var(--text-muted)',
  },
  name: {
    fontFamily: 'var(--font-pixel)', fontSize: '6px',
    color: 'var(--text-primary)', lineHeight: 1.6,
  },
  statsPane: {
    padding: '20px', overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: '24px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '10px',
  },
  statBlock: {
    ...pixelBorder, background: 'var(--surface2)',
    padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px',
  },
  statBlockLabel: {
    fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-muted)', letterSpacing: '1px',
  },
  statBlockValue: {
    fontFamily: 'var(--font-pixel)', fontSize: '11px', color: 'var(--river-selected)',
  },
  statBlockSub: {
    fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-secondary)',
  },
  heatmapSection: {
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  heatmapLabel: {
    fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--river-selected)', letterSpacing: '1px',
  },
};