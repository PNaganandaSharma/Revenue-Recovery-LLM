import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, ShieldCheck, PhoneCall, Mail, MessageSquare, Repeat, Clock, User, DollarSign, ChevronRight, Sparkles } from 'lucide-react';
import { PipelineExecutionResult, ChannelType } from '../types';

interface LiveExecutionFeedProps {
  results: PipelineExecutionResult[];
  onSelectResult?: (result: PipelineExecutionResult) => void;
  onSettleEvent?: (eventId: string) => void;
}

export const LiveExecutionFeed: React.FC<LiveExecutionFeedProps> = ({
  results,
  onSettleEvent
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number>(0);

  if (!results || results.length === 0) {
    return (
      <div id="live-feed-empty" className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-8 text-center shadow-2xl">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-white">Pipeline Ready</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4">
          Click <strong>"Run Demo Batch"</strong> to execute the full simulation suite or <strong>"Ingest Webhook"</strong> to feed a real risk event.
        </p>
      </div>
    );
  }

  const activeResult = results[selectedIdx] || results[0];

  const getChannelBadge = (channel: ChannelType) => {
    switch (channel) {
      case 'retry':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
            <Repeat className="w-3 h-3" /> Smart Retry
          </span>
        );
      case 'voice_hinglish':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <PhoneCall className="w-3 h-3" /> Hinglish Voice AI
          </span>
        );
      case 'sms':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <MessageSquare className="w-3 h-3" /> SMS PayLink
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-950/80 text-blue-300 border border-blue-800/60">
            <Mail className="w-3 h-3" /> Email Chaser
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            None
          </span>
        );
    }
  };

  const getStatusBadge = (res: PipelineExecutionResult) => {
    if (!res.compliance.passed) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-950/80 text-rose-300 border border-rose-800/60">
          <XCircle className="w-3 h-3" /> Compliance Blocked
        </span>
      );
    }
    if (res.recovered) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
          <CheckCircle className="w-3 h-3" /> Recovered Instantly
        </span>
      );
    }
    if (res.action?.status === 'promise_to_pay') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60">
          <Clock className="w-3 h-3" /> Promise to Pay
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
        <ArrowRight className="w-3 h-3" /> Dispatched
      </span>
    );
  };

  return (
    <div id="live-execution-feed" className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Left List of Executed Events */}
      <div className="lg:col-span-5 flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Processed Events ({results.length})</h3>
          <span className="text-[10px] text-zinc-500">Click to view execution trace</span>
        </div>

        <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
          {results.map((res, index) => {
            const isSelected = index === selectedIdx;
            return (
              <div
                key={res.event.event_id + '_' + index}
                id={`event-item-${index}`}
                onClick={() => setSelectedIdx(index)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800/60 border-white/20 shadow-lg'
                    : 'bg-zinc-950/40 border-white/5 hover:bg-zinc-800/40 hover:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-medium text-zinc-200">
                        {res.event.event_id}
                      </span>
                      {getStatusBadge(res)}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1 font-medium">
                      {res.customer.name} <span className="text-zinc-500 font-mono">({res.customer.customer_id})</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[13px] font-semibold text-zinc-100">
                      {res.event.currency === 'INR' ? '₹' : '$'}
                      {res.event.amount.toFixed(2)}
                    </span>
                    <span className="block text-[9px] font-bold text-zinc-500 uppercase">{res.event.currency}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Channel</span>
                    {getChannelBadge(res.diagnosis.channel)}
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isSelected ? 'translate-x-0.5 text-zinc-300' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Step-by-Step Deep Trace */}
      <div className="lg:col-span-7 bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header of selected event */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/10 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono">{activeResult.event.event_id}</h3>
                {getStatusBadge(activeResult)}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 font-medium">
                Type: <span className="text-zinc-300 uppercase font-bold">{activeResult.event.event_type.replace('_', ' ')}</span> &bull; Source: <span className="text-zinc-300">{activeResult.event.metadata?.source || 'API'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-md bg-zinc-950/40 border border-white/10 text-right">
                <span className="text-[9px] font-bold text-zinc-500 uppercase block">At Risk</span>
                <span className="text-[13px] font-bold text-emerald-400">
                  {activeResult.event.currency === 'INR' ? '₹' : '$'}
                  {activeResult.event.amount.toFixed(2)}
                </span>
              </div>
              {!activeResult.recovered && onSettleEvent && (
                <button
                  id="btn-manual-settle"
                  onClick={() => onSettleEvent(activeResult.event.event_id)}
                  className="px-2.5 py-1 text-[11px] font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-md transition-colors"
                  title="Simulate customer paying through link"
                >
                  Mark Paid
                </button>
              )}
            </div>
          </div>

          {/* 4 Phases Timeline Steps */}
          <div className="my-4 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">4-Phase Execution Pipeline Trace</h4>

            <div className="space-y-2.5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
              {activeResult.steps.map((step, idx) => {
                return (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div className={`w-[23px] h-[23px] rounded-full flex items-center justify-center shrink-0 border text-[9px] font-mono font-bold ${
                      step.status === 'blocked' ? 'bg-rose-950/60 text-rose-400 border-rose-800' :
                      step.status === 'success' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' :
                      'bg-zinc-900/60 text-zinc-300 border-white/10'
                    }`}>
                      0{step.phase}
                    </div>
                    <div className="flex-1 bg-zinc-950/40 border border-white/5 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-zinc-200">{step.name}</span>
                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                          step.status === 'blocked' ? 'bg-rose-500/10 text-rose-400' :
                          step.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                          'bg-zinc-800/50 text-zinc-400'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-zinc-400 mt-1 leading-relaxed">{step.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customer State Footer */}
        <div className="bg-zinc-950/40 border border-white/10 rounded-lg p-3 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded border border-white/10 bg-zinc-900/50 flex items-center justify-center text-zinc-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-zinc-200 text-[11px]">{activeResult.customer.name}</span>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5 font-medium">
                <span>Contacts today: <strong className="text-zinc-300">{activeResult.customer.contact_count}/3</strong></span>
                <span className="text-zinc-700">&bull;</span>
                <span>Language: <strong className="text-zinc-300 uppercase">{activeResult.customer.language_preference}</strong></span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] font-bold uppercase text-zinc-500 block">Total Lifetime Recovered</span>
            <span className="font-bold text-emerald-400 text-[11px]">
              ${activeResult.customer.total_paid.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
