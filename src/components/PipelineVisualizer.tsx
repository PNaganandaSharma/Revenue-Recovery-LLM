import React from 'react';
import { Radio, BrainCircuit, Zap, Scale, CheckCircle2, ArrowRight } from 'lucide-react';

export const PipelineVisualizer: React.FC = () => {
  const phases = [
    {
      number: 1,
      name: 'Detection & Ingestion',
      icon: Radio,
      color: 'emerald',
      description: 'Ingests stream webhooks from Stripe, Shopify, Razorpay, or DB listeners. Maps raw payload statuses to standardized RiskEvents.',
      keyLogic: ['Checkout Abandonment', 'Recurring Subscription Failed', 'B2B Invoice Overdue', 'Payment Degradation']
    },
    {
      number: 2,
      name: 'Diagnosis & Strategy',
      icon: BrainCircuit,
      color: 'cyan',
      description: 'Root cause analysis on metadata (network timeout, insufficient funds, 3DS friction). Dynamically assigns the optimal intervention channel.',
      keyLogic: ['Network Timeout -> Smart Retry', 'India Region Drop -> Hinglish Voice AI', 'Insufficient Funds -> SMS Link', 'High Value B2B -> Email Chaser']
    },
    {
      number: 3,
      name: 'Execution & Recovery',
      icon: Zap,
      color: 'amber',
      description: 'Deploys the bounded intervention workflow without human delay. Triggers smart retries, schedules voice agent calls, or dispatches pay links.',
      keyLogic: ['Direct Payment Gateway Retry', 'Voice Agent Promise-to-Pay', 'SMS Instant Payment Link', 'Automated Email Reminders']
    },
    {
      number: 4,
      name: 'Compliance & Measurement',
      icon: Scale,
      color: 'purple',
      description: 'Strict stopping rules guard customer trust. Halts on max daily contacts, opt-outs, or settled debts. Maintains immutable audit log & calculates exact ROI.',
      keyLogic: ['Max 3 Contacts Anti-Fatigue', 'Opt-out & Settlement Blocks', 'Immutable Timestamped Audit Trail', 'Measured Revenue Recovery Pool']
    }
  ];

  return (
    <div id="pipeline-visualizer-container" className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>The 4 Phases of Revenue Recovery</span>
            <span className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-zinc-950/50 text-emerald-400 border border-white/10">Autonomous Workflow</span>
          </h2>
          <p className="text-[11px] text-zinc-400 mt-1 font-medium">End-to-end bounded pipeline architecture moving beyond passive alerts to actual compliance-checked revenue recovery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {phases.map((phase, idx) => {
          const Icon = phase.icon;
          return (
            <div
              key={phase.number}
              id={`phase-card-${phase.number}`}
              className="bg-zinc-950/40 border border-white/5 rounded-lg p-3 flex flex-col justify-between relative group hover:border-white/20 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="w-5 h-5 rounded bg-white/10 text-zinc-300 flex items-center justify-center text-[10px] font-bold font-mono">
                    0{phase.number}
                  </span>
                  <div className={`p-1.5 rounded-md ${
                    phase.number === 1 ? 'bg-emerald-500/10 text-emerald-400' :
                    phase.number === 2 ? 'bg-cyan-500/10 text-cyan-400' :
                    phase.number === 3 ? 'bg-amber-500/10 text-amber-400' :
                    'bg-purple-500/10 text-purple-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-[13px] font-bold text-zinc-100 mb-1">{phase.name}</h3>
                <p className="text-[11px] text-zinc-400 font-medium leading-relaxed mb-3">{phase.description}</p>
              </div>

              <div className="border-t border-white/10 pt-2.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Enforced Rules</span>
                <ul className="space-y-1">
                  {phase.keyLogic.map((logic, i) => (
                    <li key={i} className="text-[10px] font-medium text-zinc-300 flex items-start gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-zinc-600 mt-1 shrink-0" />
                      <span>{logic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
