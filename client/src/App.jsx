import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import AnalysisHistory from './components/AnalysisHistory';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://tokyo-ks9y.onrender.com/api';

function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const analyzeRepo = async () => {
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);
    setLoadingMessage('INITIALIZING ANALYSIS ENGINE...');

    try {
      const timer = setTimeout(() => setLoadingMessage('FETCHING COMMITS & CONTRIBUTORS...'), 2000);
      const timer2 = setTimeout(() => setLoadingMessage('RUNNING AI CLASSIFIER...'), 5000);
      const timer3 = setTimeout(() => setLoadingMessage('COMPUTING IMPACT SCORES...'), 9000);

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim(), token: token.trim() || undefined })
      });

      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHistoricAnalysis = async (id) => {
    setLoading(true);
    setLoadingMessage('LOADING STORED ANALYSIS...');
    try {
      const response = await fetch(`${API_URL}/analysis/${id}`);
      if (!response.ok) throw new Error('Failed to load analysis');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') analyzeRepo();
  };

  const resetApp = () => {
    setData(null);
    setError(null);
    setRepoUrl('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-900 dark:text-white relative overflow-hidden">
        {/* Glowing background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] z-0 animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[80px] z-0 animate-pulse-slow delay-700"></div>
        
        <div className="z-10 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-cyan-400 animate-spin"></div>
             <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-fuchsia-500 animate-spin reverse"></div>
             <div className="text-xl font-bold font-sans bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">TP</div>
          </div>
          <div className="text-xl font-bold font-sans tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-slate-200 to-white">{loadingMessage}</div>
          <div className="text-sm font-mono text-slate-400 mt-2">PROCESSING METADATA...</div>
        </div>
      </div>
    );
  }

  if (data) {
    return (
      <div className="min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-opacity duration-500 ease-in-out">
        <button 
          className="fixed bottom-6 right-6 z-50 glass-card px-4 py-3 font-semibold text-sm rounded-full cursor-pointer hover:shadow-glow-cyan hover:scale-105 transition-all text-slate-700 dark:text-slate-300 flex items-center gap-2" 
          onClick={toggleTheme}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <Dashboard data={data} onReset={resetApp} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-cyan-400/10 dark:bg-cyan-600/10 blur-[100px] mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-fuchsia-400/10 dark:bg-fuchsia-600/10 blur-[100px] mix-blend-screen pointer-events-none"></div>

      <button 
        className="absolute top-6 right-6 glass-panel px-4 py-2 font-medium text-sm rounded-full shadow-sm hover:shadow-glow-cyan cursor-pointer transition-all flex items-center gap-2 active:scale-95" 
        onClick={toggleTheme}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      <div className="text-center max-w-2xl w-full z-10 animate-fade-in relative mt-12 md:mt-0">
        
        <div className="w-20 h-20 mx-auto mb-6 glass-card rounded-2xl flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 border-t border-l border-white/40 dark:border-white/10 shadow-lg rotate-3 hover:rotate-0 transition-all duration-300">
          <span className="bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-fuchsia-500 tracking-tighter">TP</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-sans font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
          Tokyo Pulse
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed font-sans max-w-xl mx-auto">
          Delivering premium engineering intelligence. Enter any public repository to generate a stunning performance snapshot.
        </p>

        <div className="glass-card p-2 rounded-2xl md:rounded-full flex flex-col md:flex-row gap-2 mb-6 max-w-xl mx-auto">
          <input
            id="repo-url-input"
            type="text"
            className="flex-1 bg-transparent border-none px-6 py-4 outline-none font-mono text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 md:text-lg focus:ring-0"
            placeholder="https://github.com/owner/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            onKeyDown={handleKeyPress}
            autoFocus
          />
          <button
            className="px-8 py-4 rounded-xl md:rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold tracking-wide cursor-pointer transition-all shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            onClick={analyzeRepo}
            disabled={!repoUrl.trim()}
          >
            ANALYZE
          </button>
        </div>

        {error && (
          <div className="glass-panel border-red-500/30 dark:border-red-400/30 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 flex justify-between items-center animate-fade-in shadow-lg shadow-red-500/10">
            <div className="text-sm font-semibold">{error}</div>
            <button className="text-xs font-bold px-3 py-1 bg-white/20 dark:bg-black/20 rounded hover:bg-white/40 transition-colors" onClick={() => setError(null)}>Dismis</button>
          </div>
        )}

        <div className="mt-8 relative z-20">
          <button 
            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer" 
            onClick={() => setShowToken(!showToken)}
          >
            {showToken ? 'Hide Authentication Token 🔼' : 'Use Optional GitHub Token 🔐'}
          </button>
          {showToken && (
            <div className="mt-4 max-w-xl mx-auto animate-fade-in">
              <input
                id="token-input"
                className="w-full px-6 py-4 glass-panel outline-none font-mono text-sm text-center focus:border-cyan-500/50 focus:shadow-glow-cyan transition-all"
                type="password"
                placeholder="ghp_XXXXXXXXXXXXXXXXXXXXXX"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
          )}
        </div>

        <AnalysisHistory onSelect={loadHistoricAnalysis} currentRepo={data?.repository?.name} />
      </div>
    </div>
  );
}

export default App;
