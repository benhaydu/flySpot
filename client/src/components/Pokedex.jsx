import { useState, useEffect } from 'react';
import { getAllSpecies } from '../api/fish';
import { getMyCatches } from '../api/catches';
import FishSprite from './FishSprite.jsx';

export default function Pokedex({ onClose }) {
  const [species, setSpecies]   = useState([]);
  const [caught, setCaught]     = useState(new Set());
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getAllSpecies(), getMyCatches()])
      .then(([allSpecies, myCatches]) => {
        setSpecies(allSpecies);
        setCaught(new Set(myCatches.map(c => c.speciesCode)));
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

        {loading ? (
          <div style={s.loading}>LOADING...</div>
        ) : (
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
        )}

      </div>
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
};