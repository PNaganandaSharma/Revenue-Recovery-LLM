import React from 'react';
import { ShieldCheck, Play, RefreshCw, Send, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  onRunSimulation: () => void;
  onOpenWebhookModal: () => void;
  onReset: () => void;
  isSimulating: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onRunSimulation,
  onOpenWebhookModal,
  onReset,
  isSimulating,
  activeTab,
  setActiveTab
}) => {
  return (
    <header id="main-header" className="border-b border-white/10 bg-zinc-900/30 backdrop-blur-2xl sticky top-0 z-30 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Branding & Agent Status */}
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* The Agent Orb Background */}
            <motion.div
              animate={{
                scale: isSimulating ? [1, 1.2, 1] : [1, 1.05, 1],
                rotate: isSimulating ? 360 : 0,
                opacity: isSimulating ? 1 : 0.6,
              }}
              transition={{
                duration: isSimulating ? 2 : 4,
                repeat: Infinity,
                ease: "linear",
              }}
              className={`absolute inset-0 rounded-full blur-md ${
                isSimulating ? 'bg-cyan-500/50' : 'bg-emerald-500/30'
              }`}
            />
            {/* Inner Core */}
            <motion.div
              animate={{
                scale: isSimulating ? [0.9, 1.1, 0.9] : 1,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`relative z-10 w-9 h-9 rounded-full border flex items-center justify-center shadow-sm shadow-emerald-950 ${
                isSimulating
                  ? 'bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border-cyan-400/50 text-cyan-300'
                  : 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {isSimulating ? <Sparkles className="w-4 h-4" /> : <ShieldCheck className="w-5 h-5" />}
            </motion.div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-white tracking-tight">Revenue Recovery LLM</h1>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border transition-colors ${
                isSimulating ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                <span className={`w-1 h-1 rounded-full animate-pulse ${
                  isSimulating ? 'bg-cyan-400' : 'bg-emerald-400'
                }`} />
                {isSimulating ? 'Processing' : 'Active Guard'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">Autonomous Detection, Diagnosis, Execution & Compliance</p>
          </div>
        </div>

        {/* Center: Navigation Tabs */}
        <div className="flex items-center bg-zinc-950/40 p-1 rounded-lg border border-white/5 text-xs font-medium">
          <button
            id="tab-pipeline-btn"
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'pipeline'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Live Pipeline
          </button>
          <button
            id="tab-audit-btn"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'audit'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Audit Trail
          </button>
          <button
            id="tab-customers-btn"
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === 'customers'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            Customer Guard
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-webhook-ingest"
            onClick={onOpenWebhookModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700 rounded-md transition-colors"
            title="Send a custom or templated payment webhook"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ingest Webhook</span>
          </button>

          <button
            id="btn-run-simulation"
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            {isSimulating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Demo Batch</span>
          </button>

          <button
            id="btn-reset-data"
            onClick={onReset}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
            title="Reset Agent State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
