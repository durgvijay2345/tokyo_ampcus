import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TYPE_COLORS = {
  Feature: '#8b5cf6',    
  'Bug Fix': '#f43f5e',      
  Refactor: '#f59e0b',    
  Documentation: '#0ea5e9', 
  Other: '#10b981'       
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 p-4 font-sans rounded-2xl shadow-xl">
      <div className="font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 mb-3 pb-2">{label}</div>
      <div className="space-y-2">
        {payload.map((entry, i) => (
          <div className="flex items-center justify-between gap-6 text-sm font-semibold" key={i}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></span>
              <span className="text-slate-600 dark:text-slate-300">{entry.name}</span>
            </div>
            <span className="text-slate-800 dark:text-slate-100">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommitTimeline({ timeline, view }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="glass-card p-10 flex items-center justify-center text-slate-500 font-medium">
        No timeline data available
      </div>
    );
  }

  const formattedData = timeline.map(d => ({
    ...d,
    dateLabel: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(view === 'weekly' ? { year: '2-digit' } : {})
    })
  }));

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 / slate-500
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  return (
    <div className="glass-card p-6 md:p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-violet-500/20 transition-all duration-700"></div>
      
      <div className="inline-block bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-8 shadow-sm relative z-10 w-max">
     
      </div>
      
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={380}>
          <AreaChart data={formattedData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <defs>
              {Object.entries(TYPE_COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`gradGlass-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 11, fill: textColor, fontWeight: 500, fontFamily: 'Outfit, sans-serif' }}
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              interval={Math.max(0, Math.floor(formattedData.length / 12))}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: textColor, fontWeight: 500, fontFamily: 'Outfit, sans-serif' }} 
              axisLine={false}
              tickLine={false}
              tickMargin={12}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
            <Legend 
              wrapperStyle={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter', paddingTop: '10px' }} 
              iconType="circle"
              iconSize={8}
            />
            {Object.entries(TYPE_COLORS).map(([key, color]) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={color}
                fill={`url(#gradGlass-${key})`}
                strokeWidth={2}
                activeDot={{ r: 6, strokeWidth: 0, fill: color, style: { filter: 'drop-shadow(0px 0px 4px rgba(255,255,255,0.5))' } }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}