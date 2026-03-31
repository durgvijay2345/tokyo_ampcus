const INSIGHT_ICONS = {
  critical: '!!',
  warning: '!',
  info: 'i',
  success: '+'
};

const CATEGORY_CLASS = {
  critical: 'cat-critical',
  warning: 'cat-warning',
  info: 'cat-info',
  success: 'cat-success'
};

export default function InsightsPanel({ insights, codeChurn }) {
  return (
    <div>
      {/* Insights List */}
      <div className="insights-list">
        {insights.map((insight, i) => (
          <div key={i} className="insight-item" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="insight-icon">{INSIGHT_ICONS[insight.type] || 'ℹ️'}</div>
            <div className="insight-content">
              <span className={`insight-category ${CATEGORY_CLASS[insight.type] || 'cat-info'}`}>
                {insight.category}
              </span>
              <h4>{insight.title}</h4>
              <p>{insight.description}</p>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="insight-item">
            <div className="insight-icon">--</div>
            <div className="insight-content">
              <h4>No significant issues detected</h4>
              <p>The repository appears to have healthy engineering practices.</p>
            </div>
          </div>
        )}
      </div>

      {/* Code Churn Table */}
      {codeChurn && codeChurn.length > 0 && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <div className="card-title">Code Churn — High-Churn Files</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.82rem'
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th style={{ textAlign: 'left', padding: '0.6rem', color: '#64748b', fontWeight: 600 }}>File</th>
                  <th style={{ textAlign: 'right', padding: '0.6rem', color: '#64748b', fontWeight: 600 }}>Commits</th>
                  <th style={{ textAlign: 'right', padding: '0.6rem', color: '#64748b', fontWeight: 600 }}>Additions</th>
                  <th style={{ textAlign: 'right', padding: '0.6rem', color: '#64748b', fontWeight: 600 }}>Deletions</th>
                  <th style={{ textAlign: 'right', padding: '0.6rem', color: '#64748b', fontWeight: 600 }}>Churn Ratio</th>
                </tr>
              </thead>
              <tbody>
                {codeChurn.map((f, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{
                      padding: '0.5rem 0.6rem',
                      fontFamily: 'var(--font-mono)',
                      color: '#94a3b8',
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {f.filename}
                    </td>
                    <td style={{ textAlign: 'right', padding: '0.5rem 0.6rem', color: '#f1f5f9' }}>{f.commits}</td>
                    <td style={{ textAlign: 'right', padding: '0.5rem 0.6rem', color: '#34d399' }}>+{f.additions}</td>
                    <td style={{ textAlign: 'right', padding: '0.5rem 0.6rem', color: '#fb7185' }}>-{f.deletions}</td>
                    <td style={{ textAlign: 'right', padding: '0.5rem 0.6rem', color: f.churnRatio > 1 ? '#fbbf24' : '#94a3b8' }}>
                      {f.churnRatio}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
