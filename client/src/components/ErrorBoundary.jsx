import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={s.overlay}>
          <div style={s.card}>
            <div style={s.title}> SOMETHING BROKE</div>
            <div style={s.text}>An unexpected error occurred. Reloading should fix it.</div>
            <button style={s.btn} onClick={() => window.location.reload()}>
              ▶ RELOAD
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  card: {
    border: '4px solid #f4f4f4',
    boxShadow: 'inset 0 0 0 4px #1a1c2c, 0 0 0 4px #1a1c2c',
    background: 'var(--surface)',
    padding: '32px', maxWidth: '360px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center',
  },
  title: {
    fontFamily: 'var(--font-pixel)', fontSize: '11px', color: '#ff6060',
  },
  text: {
    fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--text-secondary)', lineHeight: 1.8,
  },
  btn: {
    border: '4px solid #f4f4f4',
    boxShadow: 'inset 0 0 0 4px #1a1c2c, 0 0 0 4px #1a1c2c',
    background: 'var(--surface2)', color: 'var(--river-selected)',
    fontFamily: 'var(--font-pixel)', fontSize: '8px',
    padding: '12px 20px', cursor: 'pointer',
  },
};