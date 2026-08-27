import React from 'react';
import { DollarSign, Activity, ShieldAlert, CheckCircle2, PhoneCall, Mail, MessageSquare, Repeat } from 'lucide-react';
import { RecoveryMetrics } from '../types';

interface MetricsOverviewProps {
  metrics: RecoveryMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Measured Recovered Revenue */}
      <div id="metric-card-recovered" className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Measured Revenue Recovered</span>
          <div className="w-6 h-6 rounded flex items-center justify-center text-emerald-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            ${metrics.total_recovered_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {metrics.total_recovered_inr > 0 && (
            <span className="text-xs text-zinc-500 font-medium">
              (+₹{metrics.total_recovered_inr.toLocaleString('en-IN', { minimumFractionDigits: 0 })})
            </span>
          )}
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">Verified settled recovery via smart retry & promises</p>
      </div>

      {/* 2. Total Recovery Actions */}
      <div id="metric-card-actions" className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Recovery Actions Dispatched</span>
          <div className="w-6 h-6 rounded flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-white tracking-tight">
          {metrics.total_actions}
        </div>
        <div className="flex items-center gap-2.5 mt-1 text-[10px] text-zinc-400 font-medium">
          <span className="flex items-center gap-1"><Repeat className="w-3 h-3 text-indigo-400" /> {metrics.channel_distribution.retry || 0} retry</span>
          <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3 text-amber-400" /> {metrics.channel_distribution.voice_hinglish || 0} voice</span>
          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-blue-400" /> {metrics.channel_distribution.email || 0} email</span>
        </div>
      </div>

      {/* 3. Ingested Risk Events */}
      <div id="metric-card-events" className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Ingested Risk Events</span>
          <div className="w-6 h-6 rounded flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-white tracking-tight">
          {metrics.total_events}
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">Processed across checkout, subs, degradation & B2B</p>
      </div>

      {/* 4. Compliance Blocks */}
      <div id="metric-card-compliance" className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Compliance Blocks</span>
          <div className="w-6 h-6 rounded flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 text-2xl font-bold text-rose-400 tracking-tight">
          {metrics.compliance_blocks}
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">Halted due to fatigue limits, opt-outs, or duplicate recovery</p>
      </div>
    </div>
  );
};
