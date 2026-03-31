import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = {
  commits: '#3b82f6',   
  additions: '#10b981',   
  deletions: '#f43f5e',   
  Feature: '#8b5cf6',     
  'Bug Fix': '#f43f5e',
  Refactor: '#f59e0b',    
  Documentation: '#0ea5e9', 
  Other: '#64748b'        
};

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#d946ef', '#64748b'];

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
            <span className="text-slate-800 dark:text-slate-100">{entry.value?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ContributionChart({ contributors, type, classificationData }) {
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  if (type === 'pie' && classificationData) {
    const pieData = Object.entries(classificationData)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));

    return (
      <div className="glass-card p-6 md:p-8 relative overflow-hidden group h-full">
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-cyan-500/20"></div>
        <div className="inline-block bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-6 shadow-sm relative z-10 w-max max-w-full">
          Classification
        </div>
        <div className="relative z-10 h-[300px]">
          <ResponsiveContainer width="100%" height="80%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                dataKey="value"
                paddingAngle={4}
                stroke="none"
                cornerRadius={5}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length]} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4 h-[20%]">
             {pieData.map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[entry.name] || PIE_COLORS[i % PIE_COLORS.length] }}></div>
                   {entry.name}
                </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  const chartData = contributors.slice(0, 15).map(c => ({
    name: c.login.length > 12 ? c.login.substring(0, 10) + '…' : c.login,
    Commits: c.commits,
    'Lines Added': c.additions,
    'Lines Deleted': c.deletions
  }));

  return (
    <div className="glass-card p-6 md:p-8 flex-1 relative overflow-hidden group">
      <div className="absolute top-0 left-[10%] w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700"></div>
      
      <div className="inline-block bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-8 shadow-sm relative z-10 w-max">
        Developer Impact Volumes
      </div>
      
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: textColor, fontWeight: 500, fontFamily: 'Outfit' }} 
              angle={-25} 
              textAnchor="end" 
              height={55}
              axisLine={false}
              tickLine={false}
              tickMargin={10} 
            />
            <YAxis 
              tick={{ fontSize: 11, fill: textColor, fontWeight: 500, fontFamily: 'Outfit' }} 
              axisLine={false}
              tickLine={false}
              tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
            <Legend 
              wrapperStyle={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter', paddingTop: '10px' }}
              iconType="circle"
              iconSize={8}
            />
            <Bar dataKey="Commits" fill={COLORS.commits} radius={[4, 4, 0, 0]} barSize={15} />
            <Bar dataKey="Lines Added" fill={COLORS.additions} radius={[4, 4, 0, 0]} barSize={15} />
            <Bar dataKey="Lines Deleted" fill={COLORS.deletions} radius={[4, 4, 0, 0]} barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}