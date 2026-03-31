function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function ClassificationBar({ classifications }) {
  const total = Object.values(classifications).reduce((s, v) => s + v, 0);
  if (total === 0) return null;

  const colors = {
    Feature: 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]',
    'Bug Fix': 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.5)]',
    Refactor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]',
    Documentation: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]',
    Other: 'bg-slate-400'
  };

  return (
    <div className="flex rounded-full overflow-hidden h-2 mt-5 bg-slate-200 dark:bg-slate-800">
      {Object.entries(classifications)
        .filter(([, v]) => v > 0)
        .map(([type, count]) => (
          <div
            key={type}
            title={`${type}: ${count}`}
            className={`${colors[type] || 'bg-slate-400'} transition-all`}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
    </div>
  );
}

export default function ContributorCard({ contributor: c }) {
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Core Developer': 
        return 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
      case 'Regular Contributor': 
        return 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Occasional Contributor': 
        return 'bg-gradient-to-r from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
      default: 
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col justify-between hover:scale-[1.02] hover:shadow-xl transition-all duration-300 group">
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-fuchsia-500 rounded-full blur-md opacity-40 group-hover:opacity-100 transition-opacity"></div>
            {c.avatarUrl ? (
              <img src={c.avatarUrl} alt={c.login} className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-800 shadow-md relative z-10" />
            ) : (
              <div className="w-14 h-14 rounded-full border-2 border-white dark:border-slate-800 shadow-md relative z-10 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-2xl text-white">
                {c.login.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white drop-shadow-sm">{c.login}</h3>
            <span className={`text-xs px-2.5 py-1 font-semibold rounded-full border inline-block mt-1 shadow-sm ${getRoleBadge(c.role)}`}>
              {c.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="glass-panel p-3 flex flex-col items-center justify-center text-center">
            <div className="text-xl font-black text-slate-800 dark:text-slate-200">{formatNum(c.commits)}</div>
            <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Commits</div>
          </div>
          <div className="glass-panel p-3 flex flex-col items-center justify-center text-center">
            <div className="text-xl font-black text-emerald-500 dark:text-emerald-400">+{formatNum(c.additions)}</div>
            <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Added</div>
          </div>
          <div className="glass-panel p-3 flex flex-col items-center justify-center text-center">
            <div className="text-xl font-black text-rose-500 dark:text-rose-400">-{formatNum(c.deletions)}</div>
            <div className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-500">Deleted</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-2">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-lg font-bold text-violet-500 dark:text-violet-400">{c.impactScore.toFixed(1)}</div>
            <div className="text-[0.65rem] font-semibold text-slate-500 uppercase tracking-widest">Impact</div>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-l border-r border-slate-200 dark:border-slate-700/50">
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{c.filesChanged}</div>
            <div className="text-[0.65rem] font-semibold text-slate-500 uppercase tracking-widest">Files</div>
          </div>
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300">{c.pullRequests}</div>
            <div className="text-[0.65rem] font-semibold text-slate-500 uppercase tracking-widest">PRs</div>
          </div>
        </div>

        <ClassificationBar classifications={c.classifications} />
      </div>

      {c.topAreas.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-200/50 dark:border-slate-700/50">
          {c.topAreas.slice(0, 3).map(area => (
            <span className="text-[0.7rem] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium border border-slate-200 dark:border-slate-700 shadow-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700" key={area.path}>
              {area.path.split('/').pop()} <span className="opacity-50 ml-1">({area.count})</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
