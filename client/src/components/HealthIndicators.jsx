function GaugeChart({ value, label, size = 140 }) {
  const radius = size * 0.42;
  const strokeWidth = 12;
  const cx = size / 2;
  const cy = size * 0.48;

  // Semi-circle arc
  const startAngle = Math.PI;
  const endAngle = 0;
  const angleRange = startAngle - endAngle;
  const valueAngle = startAngle - (value / 100) * angleRange;

  const bgArcStart = {
    x: cx + radius * Math.cos(startAngle),
    y: cy - radius * Math.sin(startAngle)
  };
  const bgArcEnd = {
    x: cx + radius * Math.cos(endAngle),
    y: cy - radius * Math.sin(endAngle)
  };
  const valueArcEnd = {
    x: cx + radius * Math.cos(valueAngle),
    y: cy - radius * Math.sin(valueAngle)
  };

  const largeArcFlag = 0; // Angle is always <= 180 degrees for a semi-circle

  const getColor = (v) => {
    if (v >= 75) return '#34d399';
    if (v >= 50) return '#22d3ee';
    if (v >= 30) return '#fbbf24';
    return '#fb7185';
  };

  const getStatus = (v) => {
    if (v >= 75) return { text: 'Excellent', cls: 'status-excellent' };
    if (v >= 50) return { text: 'Good', cls: 'status-good' };
    if (v >= 30) return { text: 'Fair', cls: 'status-fair' };
    return { text: 'Needs Improvement', cls: 'status-poor' };
  };

  const color = getColor(value);
  const status = getStatus(value);

  return (
    <div className="health-card">
      <div className="health-label">{label}</div>
      <svg width={size} height={size * 0.55} style={{ display: 'block', margin: '0 auto' }}>
        {/* Background arc */}
        <path
          d={`M ${bgArcStart.x} ${bgArcStart.y} A ${radius} ${radius} 0 1 1 ${bgArcEnd.x} ${bgArcEnd.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {value > 0 && (
          <path
            d={`M ${bgArcStart.x} ${bgArcStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${valueArcEnd.x} ${valueArcEnd.y}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              transition: 'all 0.4s ease'
            }}
          />
        )}
        {/* Value text */}
        <text x={cx} y={cy + 4} textAnchor="middle" fill="#f1f5f9" fontSize="1.6rem" fontWeight="800" fontFamily="Inter, sans-serif">
          {value}
        </text>
      </svg>
      <div className={`health-status ${status.cls}`}>{status.text}</div>
    </div>
  );
}

export default function HealthIndicators({ healthScore, busFactor }) {
  return (
    <div className="health-grid">
      <GaugeChart value={healthScore.overall} label="Overall Health Score" size={160} />
      <GaugeChart value={healthScore.contributionBalance} label="Contribution Balance" />
      <GaugeChart value={healthScore.commitQuality} label="Commit Quality" />
      <GaugeChart value={healthScore.activityConsistency} label="Activity Consistency" />

      {/* Bus Factor Card */}
      <div className="health-card" style={{ gridColumn: 'span 1' }}>
        <div className="health-label">Bus Factor</div>
        <div className="bus-factor-display">
          <div className={`bus-factor-number ${busFactor.value >= 3 ? 'status-excellent' : busFactor.value >= 2 ? 'status-fair' : 'status-poor'}`}>
            {busFactor.value}
          </div>
          <div className="bus-factor-details">
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
              of {busFactor.totalContributors} contributors
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Minimum devs covering 50% of commits
            </div>
          </div>
        </div>
        {busFactor.critical && busFactor.critical.length > 0 && (
          <div className="critical-devs">
            {busFactor.critical.map(d => (
              <div key={d.login} className="critical-dev">
                {d.avatarUrl && <img src={d.avatarUrl} alt={d.login} />}
                <span>{d.login}</span>
                <span style={{ color: '#818cf8', fontWeight: 600 }}>{d.commitShare}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
