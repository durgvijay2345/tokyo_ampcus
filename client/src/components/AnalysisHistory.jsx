import { useState, useEffect } from 'react';

export default function AnalysisHistory({ onSelect, currentRepo }) {
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/history')
      .then(r => r.json())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [currentRepo]);

  if (history.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem', width: '100%', maxWidth: '700px' }}>
      <button
        className="token-toggle"
        onClick={() => setOpen(!open)}
        style={{ fontSize: '0.9rem' }}
      >
        {open ? 'Hide' : 'Show'} Analysis History ({history.length})
      </button>

      {open && (
        <div style={{
          marginTop: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {history.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#f1f5f9',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.repoName}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                  {new Date(item.analyzedAt).toLocaleString()} · {item.summary.totalCommits} commits · {item.summary.totalContributors} contributors · Health: {item.summary.healthScore}/100
                </div>
              </div>
              <span style={{ color: '#818cf8', fontSize: '0.85rem' }}>→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
