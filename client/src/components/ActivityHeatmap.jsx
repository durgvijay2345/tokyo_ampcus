import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getColor(value, max, isDark) {
  if (value === 0) return isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)';
  
  const intensity = Math.min(value / Math.max(max, 1), 1);
  
  if (isDark) { 
    if (intensity < 0.25) return 'rgba(6, 182, 212, 0.3)';
    if (intensity < 0.5) return 'rgba(6, 182, 212, 0.5)';
    if (intensity < 0.75) return 'rgba(6, 182, 212, 0.8)';
    return 'rgba(6, 182, 212, 1)';
  } else { 
    if (intensity < 0.25) return 'rgba(99, 102, 241, 0.3)';
    if (intensity < 0.5) return 'rgba(99, 102, 241, 0.5)';
    if (intensity < 0.75) return 'rgba(99, 102, 241, 0.8)';
    return 'rgba(99, 102, 241, 1)';
  }
}

export default function ActivityHeatmap({ contributors }) {
  const [selectedDev, setSelectedDev] = useState('all');

  const heatmapData = new Array(7).fill(null).map(() => new Array(24).fill(0));
  let maxVal = 0;

  const targetContributors = selectedDev === 'all'
    ? contributors
    : contributors.filter(c => c.login === selectedDev);

  for (const c of targetContributors) {
    for (const dateStr of c.commitDates || []) {
      const d = new Date(dateStr);
      const day = d.getUTCDay();
      const hour = d.getUTCHours();
      heatmapData[day][hour]++;
      if (heatmapData[day][hour] > maxVal) maxVal = heatmapData[day][hour];
    }
  }

  const cellSize = 30;
  const labelWidth = 40;
  const svgWidth = labelWidth + HOURS.length * (cellSize + 4) + 20;
  const svgHeight = 40 + DAYS.length * (cellSize + 4) + 10;

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="glass-card p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div className="inline-block bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 shadow-sm relative z-10 w-max">
          Activity Heatmap (UTC)
        </div>
        <select
          value={selectedDev}
          onChange={(e) => setSelectedDev(e.target.value)}
          className="relative z-10 glass-panel px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 rounded-lg cursor-pointer appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[length:1em] pr-8"
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")' }}
        >
          <option value="all" className="bg-white dark:bg-slate-800">All Contributors</option>
          {contributors.map(c => (
            <option key={c.login} value={c.login} className="bg-white dark:bg-slate-800">{c.login}</option>
          ))}
        </select>
      </div>
      
      <div className="overflow-x-auto py-2 relative z-10 slim-scrollbar">
        <svg width={svgWidth} height={svgHeight} className="mx-auto block">
          {/* Hour labels */}
          {HOURS.filter((_, i) => i % 2 === 0).map(h => (
            <text
              key={`h-${h}`}
              x={labelWidth + h * (cellSize + 4) + cellSize / 2}
              y={20}
              textAnchor="middle"
              className="text-[0.65rem] font-semibold font-mono fill-slate-500 dark:fill-slate-400"
            >
              {h.toString().padStart(2, '0')}:00
            </text>
          ))}
          {/* Day labels + cells */}
          {DAYS.map((day, di) => (
            <g key={day}>
              <text
                x={labelWidth - 8}
                y={40 + di * (cellSize + 4) + cellSize / 2 + 4}
                textAnchor="end"
                className="text-xs font-semibold fill-slate-600 dark:fill-slate-300 uppercase tracking-widest"
              >
                {day}
              </text>
              {HOURS.map(h => (
                <rect
                  key={`${di}-${h}`}
                  x={labelWidth + h * (cellSize + 4)}
                  y={40 + di * (cellSize + 4)}
                  width={cellSize}
                  height={cellSize}
                  rx={6} /* smooth rounded rectangles */
                  fill={getColor(heatmapData[di][h], maxVal, isDark)}
                  className="transition-all duration-300 hover:opacity-80 stroke-white/50 dark:stroke-black/20 stroke-1 cursor-crosshair"
                >
                  <title>{`${day} ${h}:00 — ${heatmapData[di][h]} commits`}</title>
                </rect>
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}