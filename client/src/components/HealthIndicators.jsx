function GaugeChart({ value, label, size = 140 }) {
  const radius = size * 0.42;
  const strokeWidth = 12;
  const cx = size / 2;
  const cy = size * 0.48;

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

  const largeArcFlag = 0;

  const getColor = (v) => {
    if (v >= 75) return 'url(#gradient-success)';
    if (v >= 50) return 'url(#gradient-warning)';
    if (v >= 30) return 'url(#gradient-alert)';
    return 'url(#gradient-danger)';
  };

  const getStatus = (v) => {
    if (v >= 75) return { text: 'Excellent', cls: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (v >= 50) return { text: 'Good', cls: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' };
    if (v >= 30) return { text: 'Fair', cls: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    return { text: 'Needs Improvement', cls: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
  };

  const status = getStatus(value);

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.02] transition-transform duration-300">
      <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">{label}</div>
      <svg width={size} height={size * 0.55} className="block mx-auto overflow-visible">
        <defs>
          <linearGradient id="gradient-success" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="gradient-warning" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <linearGradient id="gradient-alert" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="gradient-danger" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background Track */}
        <path
          d={`M ${bgArcStart.x} ${bgArcStart.y} A ${radius} ${radius} 0 1 1 ${bgArcEnd.x} ${bgArcEnd.y}`}
          fill="none"
          stroke="rgba(148, 163, 184, 0.15)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        
        {/* Value Arc with Glow */}
        {value > 0 && (
          <path
            d={`M ${bgArcStart.x} ${bgArcStart.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${valueArcEnd.x} ${valueArcEnd.y}`}
            fill="none"
            stroke={getColor(value)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-1000 ease-out"
          />
        )}
        <text 
          x={cx} 
          y={cy + 5} 
          textAnchor="middle" 
          className="fill-slate-800 dark:fill-white text-3xl font-black font-sans drop-shadow-sm"
        >
          {value}
        </text>
      </svg>
      <div className={`mt-3 text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${status.cls}`}>
        {status.text}
      </div>
    </div>
  );
}

export default function HealthIndicators({ healthScore, busFactor }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <GaugeChart value={healthScore.overall} label="Overall Health Score" size={160} />
      <GaugeChart value={healthScore.contributionBalance} label="Contribution Balance" />
      <GaugeChart value={healthScore.commitQuality} label="Commit Quality" />
      <GaugeChart value={healthScore.activityConsistency} label="Activity Consistency" />

      {/* Bus Factor Card */}
      <div className="glass-card p-6 md:col-span-2 lg:col-span-4 flex flex-col lg:flex-row items-center justify-between gap-8 group hover:scale-[1.01] transition-transform duration-300">
        <div className="flex-1">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 mb-6">System Bus Factor</div>
          <div className="flex items-center gap-6">
            <div className={`text-7xl font-black drop-shadow-lg ${busFactor.value >= 3 ? 'text-emerald-500' : busFactor.value >= 2 ? 'text-amber-500' : 'text-rose-500'}`}>
              {busFactor.value}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
              <div className="text-base text-slate-800 dark:text-slate-200 font-semibold mb-1">
                Out of {busFactor.totalContributors} active contributors
              </div>
              <p className="max-w-xs leading-relaxed">
                This is the minimum number of developers whose combined additions account for more than 50% of the project's entire history.
              </p>
            </div>
          </div>
        </div>
        
        {busFactor.critical && busFactor.critical.length > 0 && (
          <div className="flex-1 w-full lg:max-w-md bg-white/40 dark:bg-slate-800/40 p-5 rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-inner">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Critical Developers</div>
            <div className="space-y-3">
              {busFactor.critical.map(d => (
                <div key={d.login} className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-sm hover:shadow-glow-cyan transition-shadow">
                  {d.avatarUrl ? (
                    <img src={d.avatarUrl} alt={d.login} className="w-8 h-8 rounded-full shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                      {d.login.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex-1">{d.login}</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 px-2 py-1 rounded text-sm">{d.commitShare}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
