import { useState, useEffect } from 'react';

export default function AnalysisHistory({ onSelect, currentRepo }) {
  const [history, setHistory] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'https://tokyo-ks9y.onrender.com/api';
    fetch(`${API_URL}/history`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistory(data);
        }
      })
      .catch(() => setHistory([]));
  }, [currentRepo]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this historical analysis?')) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://tokyo-ks9y.onrender.com/api';
      const res = await fetch(`${API_URL}/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      } else {
        alert('Failed to delete history item');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server to delete');
    }
  };

  if (history.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-3xl mx-auto pb-12 z-20 relative">
      <button
        className="w-full glass-panel py-3 px-6 text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 hover:text-cyan-500 hover:border-cyan-500/30 transition-all rounded-full"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Hide Past Analysis 🔼' : `View Past Analysis (${history.length}) 🔽`}
      </button>

      {open && (
        <div className="mt-6 flex flex-col gap-3 animate-fade-in">
          {history.map((item, idx) => (
            <div 
              key={item.id} 
              className="glass-card p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 group cursor-pointer hover:-translate-y-1 hover:shadow-cyan-500/10 transition-all duration-300"
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => onSelect(item.id)}
            >
              <div className="flex-1 text-left">
                <div className="font-bold text-lg md:text-xl font-sans text-slate-800 dark:text-slate-100 group-hover:text-cyan-500 transition-colors drop-shadow-sm">
                  {item.repoName}
                </div>
                <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-sans flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{new Date(item.analyzedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span>{item.summary.totalCommits} Commits</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span>{item.summary.totalContributors} Devs</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                  <span className="font-medium text-emerald-500 dark:text-emerald-400 drop-shadow-sm">Score {item.summary.healthScore}/100</span>
                </div>
              </div>
              <button 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-500 hover:text-white hover:shadow-glow-pink flex items-center justify-center transition-all duration-300"
                onClick={(e) => handleDelete(e, item.id)}
                title="Delete Record"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
