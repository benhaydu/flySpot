import { useState } from 'react';
import { login, register } from '../api/auth';

export default function AuthPage({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fn = isLogin ? login : register;
    const data = await fn(email, password);
    setLoading(false);
    if (data.error) return setError(data.error);
    onSuccess(data.token);
  };

  return (
    <div style={s.root}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cursor { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {/* background grid */}
      <div style={s.grid} />

      <div style={s.card}>

        {/* title box */}
        <div style={s.titleBox}>
          <div style={s.fish}>~》</div>
          <div style={s.title}>FISHING MAP</div>
          <div style={s.subtitle}>VANCOUVER ISLAND</div>
        </div>

        {/* dialog box */}
        <div style={s.dialog}>
          <div style={s.dialogLabel}>{isLogin ? '▶  TRAINER LOGIN' : '▶  NEW TRAINER'}</div>

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>EMAIL</label>
              <div style={s.inputWrap}>
                <input
                  style={s.input}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={s.field}>
              <label style={s.label}>PASSWORD</label>
              <div style={s.inputWrap}>
                <input
                  style={s.input}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </div>
            </div>

            {error && (
              <div style={s.errorBox}>
                <span style={s.errorArrow}>!</span> {error}
              </div>
            )}

            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? '...' : (isLogin ? '▶  ENTER' : '▶  CREATE')}
            </button>
          </form>
        </div>

        {/* switch mode */}
        <button style={s.switchBtn} type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
          {isLogin ? '[ NEW TRAINER? REGISTER ]' : '[ HAVE ACCOUNT? LOGIN ]'}
        </button>

      </div>
    </div>
  );
}

const pixelBorder = {
  border: '4px solid #f4f4f4',
  boxShadow: 'inset 0 0 0 4px #1a1c2c, 0 0 0 4px #1a1c2c',
};

const s = {
  root: {
    position: 'fixed', inset: 0,
    background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-pixel)',
  },
  grid: {
    position: 'absolute', inset: 0, zIndex: 0,
    backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
    backgroundSize: '32px 32px',
    opacity: 0.2,
  },
  card: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
    width: '100%', maxWidth: '360px', padding: '16px',
    animation: 'fadeIn 0.3s ease',
  },
  titleBox: {
    ...pixelBorder,
    background: 'var(--surface)',
    padding: '20px 32px',
    textAlign: 'center',
    width: '100%',
  },
  fish: {
    fontSize: '18px', marginBottom: '10px',
    color: 'var(--river)', letterSpacing: '2px',
  },
  title: {
    fontSize: '13px', color: 'var(--river-selected)',
    letterSpacing: '2px', lineHeight: 1.8,
  },
  subtitle: {
    fontSize: '7px', color: 'var(--text-muted)',
    marginTop: '6px', letterSpacing: '1px',
  },
  dialog: {
    ...pixelBorder,
    background: 'var(--surface)',
    padding: '20px',
    width: '100%',
  },
  dialogLabel: {
    fontSize: '7px', color: 'var(--river)',
    marginBottom: '16px', letterSpacing: '1px',
  },
  form: {
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  field: {
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  label: {
    fontSize: '6px', color: 'var(--text-muted)', letterSpacing: '1px',
  },
  inputWrap: {
    ...pixelBorder,
    background: '#0a0c1a',
  },
  input: {
    width: '100%',
    background: 'transparent',
    border: 'none', outline: 'none',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-pixel)',
    fontSize: '8px',
    padding: '10px 12px',
  },
  errorBox: {
    background: '#3a1515',
    border: '2px solid var(--accent-red)',
    padding: '8px 10px',
    fontSize: '6px',
    color: '#ff6060',
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  errorArrow: {
    color: 'var(--accent-red)', fontSize: '10px', fontWeight: 'bold',
  },
  btn: {
    ...pixelBorder,
    background: 'var(--surface2)',
    color: 'var(--river-selected)',
    fontFamily: 'var(--font-pixel)',
    fontSize: '8px',
    padding: '12px',
    cursor: 'pointer',
    border: '4px solid #f4f4f4',
    width: '100%',
    marginTop: '4px',
    transition: 'background 0.1s',
  },
  switchBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-pixel)',
    fontSize: '6px',
    cursor: 'pointer',
    animation: 'blink 2s steps(1) infinite',
    letterSpacing: '1px',
  },
};