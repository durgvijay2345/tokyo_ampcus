import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getColor(value, max) {
  if (value === 0) return 'rgba(255, 255, 255, 0.03)';
  const intensity = Math.min(value / Math.max(max, 1), 1);
  if (intensity < 0.25) return 'rgba(99, 102, 241, 0.2)';
  if (intensity < 0.5) return 'rgba(99, 102, 241, 0.4)';
  if (intensity < 0.75) return 'rgba(99, 102, 241, 0.65)';
  return 'rgba(129, 140, 248, 0.9)';
}

export default function ActivityHeatmap({ contributors }) {
  const [selectedDev, setSelectedDev] = useState('all');

  // Aggregate heatmap data
  const heatmapData = new Array(7).fill(null).map(() => new Array(24).fill(0));
  let maxVal = 0;

  const targetContributors = selectedDev === 'all'
    ? contributors
    : contributors.filter(c => c.login === selectedDev);

  for (const c of targetContributors) {
    // Build hour×day matrix from commit dates
    for (const dateStr of c.commitDates || []) {
      const d = new Date(dateStr);
      const day = d.getUTCDay();
      const hour = d.getUTCHours();
      heatmapData[day][hour]++;
      if (heatmapData[day][hour] > maxVal) maxVal = heatmapData[day][hour];
    }
  }

  const cellSize = 28;
  const labelWidth = 40;
  const svgWidth = labelWidth + HOURS.length * (cellSize + 2) + 10;
  const svgHeight = 30 + DAYS.length * (cellSize + 2) + 10;

  return (
    <div className="card">
      <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Activity Heatmap (UTC) — Hour × Day</span>
        <select
          value={selectedDev}
          onChange={(e) => setSelectedDev(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px',
            color: '#f1f5f9',
            padding: '0.3rem 0.6rem',
            fontSize: '0.8rem',
            outline: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)'
          }}
        >
          <option value="all">All Contributors</option>
          {contributors.map(c => (
            <option key={c.login} value={c.login}>{c.login}</option>
          ))}
        </select>
      </div>
      <div className="heatmap-container">
        <svg width={svgWidth} height={svgHeight}>
          {/* Hour labels */}
          {HOURS.filter((_, i) => i % 3 === 0).map(h => (
            <text
              key={`h-${h}`}
              x={labelWidth + h * (cellSize + 2) + cellSize / 2}
              y={16}
              textAnchor="middle"
              className="heatmap-label"
            >
              {h.toString().padStart(2, '0')}
            </text>
          ))}
          {/* Day labels + cells */}
          {DAYS.map((day, di) => (
            <g key={day}>
              <text
                x={labelWidth - 8}
                y={30 + di * (cellSize + 2) + cellSize / 2 + 4}
                textAnchor="end"
                className="heatmap-label"
              >
                {day}
              </text>
              {HOURS.map(h => (
                <rect
                  key={`${di}-${h}`}
                  x={labelWidth + h * (cellSize + 2)}
                  y={30 + di * (cellSize + 2)}
                  width={cellSize}
                  height={cellSize}
                  rx={4}
                  fill={getColor(heatmapData[di][h], maxVal)}
                  style={{ transition: 'fill 0.2s ease' }}
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
