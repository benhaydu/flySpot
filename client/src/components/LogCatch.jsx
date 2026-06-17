import { useState, useEffect } from 'react';
import { getAllSpecies } from '../api/fish';
import { logCatch } from '../api/catches';

export default function LogCatch({ selectedRiver, onClose, onSuccess }) {
  const [species, setSpecies]       = useState([]);
  const [search, setSearch]         = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [river, setRiver]           = useState(selectedRiver || '');
  const [weight, setWeight]         = useState('');
  const [length, setLength]         = useState('');
  const [notes, setNotes]           = useState('');
  const [caughtAt, setCaughtAt]     = useState(new Date().toISOString().split('T')[0]);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    getAllSpecies().then(setSpecies);
  }, []);

  const filtered = species.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSpecies) return setError('Please select a species');
    if (!river.trim())    return setError('Please enter a river name');

    setLoading(true);
    const data = await logCatch({
      speciesCode: selectedSpecies.code,
      speciesName: selectedSpecies.name,
      riverName:   river.trim(),
      weight:      weight ? parseFloat(weight) : null,
      length:      length ? parseFloat(length) : null,
      notes,
      caughtAt,
    });
    setLoading(false);

    if (data.error) return setError(data.error);
    onSuccess(data);
  };

  return (
    <div style={s.overlay}>
      <div style={s.panel}>

        <div style={s.header}>
          <div style={s.title}>▶ LOG CATCH</div>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>

          {/* Species selector */}
          <div style={s.field}>
            <label style={s.label}>SPECIES</label>
            {selectedSpecies ? (
              <div style={s.selectedSpecies}>
                <span style={s.selectedName}>{selectedSpecies.name}</span>
                <button type="button" onClick={() => { setSelectedSpecies(null); setSearch(''); }} style={s.clearBtn}>✕</button>
              </div>
            ) : (
              <>
                <div style={s.inputWrap}>
                  <input
                    style={s.input}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search species..."
                  />
                </div>
                {search && (
                  <div style={s.dropdown}>
                    {filtered.slice(0, 8).map(sp => (
                      <div
                        key={sp.code}
                        style={s.dropdownItem}
                        onClick={() => { setSelectedSpecies(sp); setSearch(''); }}
                      >
                        <span style={s.dropdownCode}>{sp.code}</span>
                        <span style={s.dropdownName}>{sp.name}</span>
                      </div>
                    ))}
                    {filtered.length === 0 && (
                      <div style={s.dropdownEmpty}>NO RESULTS</div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* River */}
          <div style={s.field}>
            <label style={s.label}>RIVER</label>
            <div style={s.inputWrap}>
              <input
                style={s.input}
                value={river}
                onChange={e => setRiver(e.target.value)}
                placeholder="e.g. Campbell River"
              />
            </div>
          </div>

          {/* Date */}
          <div style={s.field}>
            <label style={s.label}>DATE</label>
            <div style={s.inputWrap}>
              <input
                style={{ ...s.input, colorScheme: 'dark' }}
                type="date"
                value={caughtAt}
                onChange={e => setCaughtAt(e.target.value)}
              />
            </div>
          </div>

          {/* Weight + Length */}
          <div style={s.row}>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>WEIGHT (kg)</label>
              <div style={s.inputWrap}>
                <input style={s.input} type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="0.0" />
              </div>
            </div>
            <div style={{ ...s.field, flex: 1 }}>
              <label style={s.label}>LENGTH (cm)</label>
              <div style={s.inputWrap}>
                <input style={s.input} type="number" step="0.1" value={length} onChange={e => setLength(e.target.value)} placeholder="0.0" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={s.field}>
            <label style={s.label}>NOTES</label>
            <div style={s.inputWrap}>
              <textarea
                style={{ ...s.input, resize: 'none', height: '60px' }}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any notes..."
              />
            </div>
          </div>

          {error && <div style={s.error}>! {error}</div>}

          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? '...' : '▶ SUBMIT CATCH'}
          </button>

        </form>
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
    position: 'fixed', inset: 0, zIndex: 60,
    background: 'rgba(26,28,44,0.95)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  panel: {
    ...pixelBorder,
    background: 'var(--surface)',
    width: '90%', maxWidth: '420px',
    maxHeight: '90vh', overflowY: 'auto',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '4px solid var(--border)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  title: {
    fontFamily: 'var(--font-pixel)', fontSize: '11px',
    color: 'var(--river-selected)',
  },
  closeBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--text-muted)', cursor: 'pointer',
    fontFamily: 'var(--font-pixel)', fontSize: '10px',
  },
  form: {
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px',
  },
  field: {
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  row: {
    display: 'flex', gap: '12px',
  },
  label: {
    fontFamily: 'var(--font-pixel)', fontSize: '6px',
    color: 'var(--text-muted)', letterSpacing: '1px',
  },
  inputWrap: {
    ...pixelBorder, background: '#0a0c1a',
  },
  input: {
    width: '100%', background: 'transparent',
    border: 'none', outline: 'none',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-pixel)', fontSize: '7px',
    padding: '10px 12px',
  },
  selectedSpecies: {
    ...pixelBorder, background: 'var(--surface2)',
    padding: '10px 12px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  selectedName: {
    fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--river)',
  },
  clearBtn: {
    background: 'transparent', border: 'none',
    color: 'var(--text-muted)', cursor: 'pointer', fontSize: '10px',
  },
  dropdown: {
    ...pixelBorder, background: '#0a0c1a',
    maxHeight: '160px', overflowY: 'auto',
  },
  dropdownItem: {
    padding: '8px 12px', cursor: 'pointer',
    display: 'flex', gap: '10px', alignItems: 'center',
    borderBottom: '1px solid var(--border)',
  },
  dropdownCode: {
    fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-muted)',
    minWidth: '30px',
  },
  dropdownName: {
    fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-primary)',
  },
  dropdownEmpty: {
    fontFamily: 'var(--font-pixel)', fontSize: '6px', color: 'var(--text-muted)',
    padding: '10px 12px',
  },
  error: {
    fontFamily: 'var(--font-pixel)', fontSize: '6px',
    color: '#ff6060', background: '#3a1515',
    border: '2px solid var(--accent-red)', padding: '8px 10px',
  },
  submitBtn: {
    ...pixelBorder,
    background: 'var(--surface2)', color: 'var(--river-selected)',
    fontFamily: 'var(--font-pixel)', fontSize: '8px',
    padding: '12px', cursor: 'pointer',
    border: '4px solid #f4f4f4', width: '100%',
  },
};