import { useState } from 'react';
import ContributionChart from './ContributionChart';
import CommitTimeline from './CommitTimeline';
import ActivityHeatmap from './ActivityHeatmap';
import ContributorCard from './ContributorCard';
import HealthIndicators from './HealthIndicators';
import InsightsPanel from './InsightsPanel';

function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export default function Dashboard({ data, onReset }) {
  const [contributorFilter, setContributorFilter] = useState('all');
  const [timeView, setTimeView] = useState('weekly');
  const [copied, setCopied] = useState(false);

  const filteredContributors = contributorFilter === 'all'
    ? data.contributors
    : data.contributors.filter(c => {
        if (contributorFilter === 'core') return c.role === 'Core Developer';
        if (contributorFilter === 'regular') return c.role === 'Regular Contributor';
        if (contributorFilter === 'occasional') return c.role === 'Occasional Contributor' || c.role === 'Drive-by Contributor';
        return true;
      });

  const handleShare = async () => {
    const report = `# 📊 TOKYO PULSE: ${data.repository.name}
**Commits:** ${formatNumber(data.summary.totalCommits)} | **Devs:** ${data.summary.totalContributors} | **Bus Factor:** ${data.busFactor.value}
**Health Score:** 💖 ${data.healthScore.overall}/100

**🔍 Top Insights:**
${data.insights.slice(0, 3).map(i => `- ${i.message}`).join('\n')}

_Generated via Tokyo Pulse_`;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch(err) {
      alert("Failed to copy summary");
    }
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans pb-16 relative overflow-hidden">
      {/* Background gradients managed by index.css body rules */}

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap justify-center font-sans">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold bg-gradient-to-br from-cyan-400 to-fuchsia-500 text-white shadow-glow-cyan shadow-sm">
            TP
          </div>
          <span className="text-xl md:text-2xl font-black font-sans tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            {data.repository.name}
          </span>
          {data.cached && (
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-3 py-1 rounded-full text-xs border border-emerald-500/20 shadow-sm flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              CACHED
            </span>
          )}
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <button 
            className="px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm font-semibold hover:bg-white dark:hover:bg-slate-700 hover:shadow-glow-cyan transition-all text-slate-700 dark:text-slate-300 flex border-transparent"
            onClick={handleShare}
          >
            {copied ? 'Copied to Clipboard! ✨' : '🔗 Share Snapshot'}
          </button>
          <button 
            className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-sm font-bold shadow-lg hover:shadow-cyan-500/50 transition-all hover:-translate-y-0.5" 
            onClick={onReset}
          >
            New Analysis →
          </button>
        </div>
      </header>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 p-6 lg:p-8 max-w-[1600px] mx-auto z-10 relative mt-4">
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.02]">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Commits</div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-400 drop-shadow-sm group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all">{formatNumber(data.summary.totalCommits)}</div>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.02]">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Contributors</div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-400 to-pink-500 drop-shadow-sm group-hover:drop-shadow-[0_0_10px_rgba(232,121,249,0.5)] transition-all">{data.summary.totalContributors}</div>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.02]">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pull Requests</div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-indigo-500 drop-shadow-sm group-hover:drop-shadow-[0_0_10px_rgba(167,139,250,0.5)] transition-all">{formatNumber(data.summary.totalPullRequests)}</div>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.02]">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Lines Changed</div>
          <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-500 drop-shadow-sm group-hover:drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all">{formatNumber(data.summary.totalLinesChanged)}</div>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.02]">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Health Score</div>
          <div className={`text-4xl font-black text-transparent bg-clip-text drop-shadow-sm transition-all ${data.healthScore.overall >= 70 ? 'bg-gradient-to-br from-emerald-400 to-teal-400 group-hover:drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : data.healthScore.overall >= 50 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-gradient-to-br from-rose-400 to-red-500'}`}>
            {data.healthScore.overall}/100
          </div>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center group hover:scale-[1.02]">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Bus Factor</div>
          <div className={`text-4xl font-black text-transparent bg-clip-text drop-shadow-sm transition-all ${data.busFactor.value >= 3 ? 'bg-gradient-to-br from-emerald-400 to-teal-400 group-hover:drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]' : data.busFactor.value >= 2 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : 'bg-gradient-to-br from-rose-400 to-red-500'}`}>
            {data.busFactor.value}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 max-w-[1600px] mx-auto space-y-16 z-10 relative">
        {/* ── Contribution Analysis ── */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Contribution Analysis</h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700/50 flex-1"></div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <ContributionChart contributors={data.contributors} type="bar" />
            <div className="lg:w-1/3 min-w-[320px]">
              <ContributionChart contributors={data.contributors} type="pie" classificationData={data.classificationDistribution} />
            </div>
          </div>
        </section>

        {/* ── Commit Intelligence ── */}
        <section>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Commit Intelligence</h2>
              <div className="h-px bg-slate-200 dark:bg-slate-700/50 flex-1"></div>
            </div>
            <div className="flex gap-2 glass-panel p-1 rounded-full">
              <button 
                className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all ${timeView === 'daily' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`} 
                onClick={() => setTimeView('daily')}
              >
                Daily
              </button>
              <button 
                className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all ${timeView === 'weekly' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`} 
                onClick={() => setTimeView('weekly')}
              >
                Weekly
              </button>
            </div>
          </div>
          <CommitTimeline timeline={timeView === 'daily' ? data.timeline.daily : data.timeline.weekly} view={timeView} />
        </section>

        {/* ── Activity Heatmap ── */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Activity Heatmap</h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700/50 flex-1"></div>
          </div>
          <ActivityHeatmap contributors={data.contributors} />
        </section>

        {/* ── Engineering Health ── */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Engineering Health</h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700/50 flex-1"></div>
          </div>
          <HealthIndicators healthScore={data.healthScore} busFactor={data.busFactor} />
        </section>

        {/* ── Engineering Insights ── */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Engineering Insights</h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700/50 flex-1"></div>
          </div>
          <InsightsPanel insights={data.insights} codeChurn={data.codeChurn} />
        </section>

        {/* ── Contributor Profiles ── */}
        <section>
          <div className="mb-6 flex items-center gap-4">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">Contributor Profiles</h2>
            <div className="h-px bg-slate-200 dark:bg-slate-700/50 flex-1 hidden md:block"></div>
          </div>
          <div className="flex gap-2 flex-wrap mb-8 glass-panel p-2 rounded-2xl w-max max-w-full">
            <button className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${contributorFilter === 'all' ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-glow-purple' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`} onClick={() => setContributorFilter('all')}>All ({data.contributors.length})</button>
            <button className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${contributorFilter === 'core' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-glow-cyan' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`} onClick={() => setContributorFilter('core')}>Core Devs</button>
            <button className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${contributorFilter === 'regular' ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`} onClick={() => setContributorFilter('regular')}>Regular</button>
            <button className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all ${contributorFilter === 'occasional' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'}`} onClick={() => setContributorFilter('occasional')}>Occasional</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredContributors.map((c, i) => (
              <ContributorCard key={c.login} contributor={c} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
