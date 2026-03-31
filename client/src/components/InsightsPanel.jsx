const INSIGHT_ICONS = {
  critical: '🚨',
  warning: '⚠️',
  info: '💡',
  success: '✅'
};

export default function InsightsPanel({ insights, codeChurn }) {
  const getCategoryStyles = (type) => {
    switch (type) {
      case 'critical': return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20 shadow-glow-pink';
      case 'warning': return 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/10';
      case 'success': return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/10';
      default: return 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/20 shadow-glow-cyan';
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Insights List */}
      <div className="flex flex-col gap-4">
        {insights.map((insight, i) => (
          <div 
            key={i} 
            className="flex flex-col sm:flex-row gap-5 p-6 glass-card items-start transition-transform hover:-translate-y-1 hover:shadow-cyan-500/10 group"
          >
            <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border font-bold text-3xl shadow-md ${getCategoryStyles(insight.type)} transition-transform group-hover:scale-110`}>
              {INSIGHT_ICONS[insight.type] || '💡'}
            </div>
            <div className="flex-1">
              <span className={`text-[0.65rem] px-3 py-1 font-bold uppercase rounded-full border mb-3 inline-block tracking-wider ${getCategoryStyles(insight.type)}`}>
                {insight.category}
              </span>
              <h4 className="text-xl font-bold mb-2 tracking-tight text-slate-800 dark:text-white drop-shadow-sm">{insight.title}</h4>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{insight.description}</p>
            </div>
          </div>
        ))}

        {insights.length === 0 && (
          <div className="flex flex-col sm:flex-row gap-5 p-6 glass-card items-start">
            <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/20 font-bold text-3xl">✅</div>
            <div>
              <h4 className="text-xl font-bold mb-2 tracking-tight text-slate-800 dark:text-white">No significant issues detected</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">The repository appears to have exceptional engineering health and best practices.</p>
            </div>
          </div>
        )}
      </div>

      {/* Code Churn Table */}
      {codeChurn && codeChurn.length > 0 && (
        <div className="glass-card p-6 overflow-hidden relative">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <div className="inline-block bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-6 shadow-sm">
            High-Churn Hotspots (Refactor Candidates)
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="p-4 font-bold">File Path</th>
                  <th className="p-4 font-bold text-right">Commits</th>
                  <th className="p-4 font-bold text-right">Additions</th>
                  <th className="p-4 font-bold text-right">Deletions</th>
                  <th className="p-4 font-bold text-right rounded-tr-xl">Churn Ratio</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[0.85rem]">
                {codeChurn.map((f, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group">
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-medium max-w-[300px] sm:max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                      {f.filename}
                    </td>
                    <td className="p-4 text-right font-semibold text-slate-700 dark:text-slate-200">{f.commits}</td>
                    <td className="p-4 text-right font-bold text-emerald-500 dark:text-emerald-400">+{f.additions}</td>
                    <td className="p-4 text-right font-bold text-rose-500 dark:text-rose-400">-{f.deletions}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-1 rounded border ${f.churnRatio > 1.5 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'}`}>
                        {f.churnRatio}x
                      </span>
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
