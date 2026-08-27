import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { LiveExecutionFeed } from './components/LiveExecutionFeed';
import { CustomerRegistry } from './components/CustomerRegistry';
import { AuditTrail } from './components/AuditTrail';
import { WebhookIngestionModal } from './components/WebhookIngestionModal';
import {
  RecoveryMetrics,
  RiskEvent,
  CustomerProfile,
  ActionLog,
  PipelineExecutionResult
} from './types';

const defaultMetrics: RecoveryMetrics = {
  total_actions: 0,
  total_recovered_usd: 0.0,
  total_recovered_inr: 0.0,
  total_events: 0,
  compliance_blocks: 0,
  active_customers: 0,
  channel_distribution: {
    retry: 0,
    email: 0,
    sms: 0,
    voice_hinglish: 0,
    none: 0
  },
  events_by_type: {
    checkout_abandonment: 0,
    subscription_failed: 0,
    payment_degradation: 0,
    b2b_overdue: 0
  }
};

export function App() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'audit' | 'customers' | 'architecture'>('pipeline');
  const [metrics, setMetrics] = useState<RecoveryMetrics>(defaultMetrics);
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActionLog[]>([]);
  const [pipelineResults, setPipelineResults] = useState<PipelineExecutionResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // Fetch agent data
  const fetchData = async () => {
    try {
      const [mRes, cRes, aRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/customers'),
        fetch('/api/audit-logs')
      ]);

      if (mRes.ok) setMetrics(await mRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
      if (aRes.ok) setAuditLogs(await aRes.json());
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Run the batch simulation matching run_demo.py
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    toast.info('Starting batch simulation...', { id: 'sim' });
    try {
      const res = await fetch('/api/simulate-batch', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPipelineResults(data.results || []);
        if (data.metrics) setMetrics(data.metrics);
        await fetchData();
        setActiveTab('pipeline');
        toast.success('Simulation completed successfully!', { id: 'sim' });
      } else {
        toast.error('Simulation failed', { id: 'sim' });
      }
    } catch (err) {
      console.error('Simulation error:', err);
      toast.error('Simulation error', { id: 'sim' });
    } finally {
      setIsSimulating(false);
    }
  };

  // Ingest single webhook
  const handleIngestWebhook = async (payload: Record<string, any>) => {
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const result: PipelineExecutionResult = await res.json();
        setPipelineResults((prev) => [result, ...prev]);
        await fetchData();
        setActiveTab('pipeline');
        toast.success(`Webhook ingested for event: ${result.event.event_id}`);
      } else {
        toast.error('Failed to ingest webhook');
      }
    } catch (err) {
      console.error('Webhook error:', err);
      toast.error('Failed to ingest webhook');
    }
  };

  // Update customer
  const handleUpdateCustomer = async (customerId: string, patch: Partial<CustomerProfile>) => {
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch)
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Update customer error:', err);
    }
  };

  // Mark event as settled / paid
  const handleSettleEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/resolve-event/${eventId}`, { method: 'POST' });
      if (res.ok) {
        setPipelineResults((prev) =>
          prev.map((r) => (r.event.event_id === eventId ? { ...r, recovered: true } : r))
        );
        await fetchData();
        toast.success(`Event ${eventId} marked as settled`);
      }
    } catch (err) {
      console.error('Settle event error:', err);
      toast.error('Failed to settle event');
    }
  };

  // Reset agent
  const handleReset = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setPipelineResults([]);
      await fetchData();
      toast.info('Agent state has been reset');
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200 relative">
      {/* Ambient Glassy Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-zinc-950">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/30 blur-[120px]" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-600/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[60%] h-[60%] rounded-full bg-emerald-600/20 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-cyan-600/20 blur-[90px]" />
        <div className="absolute inset-0 backdrop-blur-[80px] bg-zinc-950/30" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        {/* Top Header */}
      <Header
        onRunSimulation={handleRunSimulation}
        onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
        onReset={handleReset}
        isSimulating={isSimulating}
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-screen-2xl w-full mx-auto px-4 sm:px-6 py-5">
        <motion.div layout className="space-y-5">
          {/* Top Analytics Metrics */}
          <motion.div layout>
            <MetricsOverview metrics={metrics} />
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'pipeline' && (
              <motion.div
                key="pipeline"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="lg:col-span-2">
                    <AnalyticsCharts metrics={metrics} />
                  </div>
                  <div className="lg:col-span-2">
                    <LiveExecutionFeed
                      results={pipelineResults}
                      onSettleEvent={handleSettleEvent}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'audit' && (
              <motion.div
                key="audit"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <AuditTrail logs={auditLogs} />
              </motion.div>
            )}

            {activeTab === 'customers' && (
              <motion.div
                key="customers"
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <CustomerRegistry
                  customers={customers}
                  onUpdateCustomer={handleUpdateCustomer}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </main>
      
      </div>

      {/* Webhook Modal */}
      <WebhookIngestionModal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        onIngest={handleIngestWebhook}
      />
      <Toaster theme="dark" toastOptions={{ className: 'bg-zinc-950/90 border-white/10 text-white backdrop-blur-xl' }} />
    </div>
  );
}

export default App;
