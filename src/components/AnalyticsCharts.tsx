import React from 'react';
import { RecoveryMetrics } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AnalyticsCharts: React.FC<{ metrics: RecoveryMetrics }> = ({ metrics }) => {
  // Prepare pie chart data
  const pieData = [
    { name: 'Smart Retry', value: metrics.channel_distribution.retry, color: '#34d399' },
    { name: 'Email Chaser', value: metrics.channel_distribution.email, color: '#60a5fa' },
    { name: 'SMS Link', value: metrics.channel_distribution.sms, color: '#38bdf8' },
    { name: 'Hinglish Voice', value: metrics.channel_distribution.voice_hinglish, color: '#fbbf24' },
    { name: 'Blocked/None', value: metrics.channel_distribution.none, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  // Prepare bar chart data (Risk Events)
  const barData = [
    { name: 'Abandonment', events: metrics.events_by_type.checkout_abandonment },
    { name: 'Sub Failed', events: metrics.events_by_type.subscription_failed },
    { name: 'Degradation', events: metrics.events_by_type.payment_degradation },
    { name: 'B2B Overdue', events: metrics.events_by_type.b2b_overdue }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950/90 border border-white/10 rounded-lg p-3 shadow-2xl backdrop-blur-xl text-xs">
          <p className="font-semibold text-white mb-1">{label || payload[0].name}</p>
          <p className="text-zinc-400">
            Count: <span className="font-bold text-white">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Distribution Pie Chart */}
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Recovery Channel Distribution</h3>
        </div>
        <div className="flex-1 min-h-[200px] w-full mt-2">
          {pieData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500">
              No data available yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 500, color: '#a1a1aa' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Events Bar Chart */}
      <div className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white">Risk Events Ingested by Type</h3>
        </div>
        <div className="flex-1 min-h-[200px] w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar 
                dataKey="events" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.events > 0 ? '#818cf8' : '#3f3f46'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
