import React, { useState } from 'react';
import { X, Send, Sparkles, AlertCircle, CheckCircle, Code } from 'lucide-react';

interface WebhookIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIngest: (payload: Record<string, any>) => void;
}

export const WebhookIngestionModal: React.FC<WebhookIngestionModalProps> = ({
  isOpen,
  onClose,
  onIngest
}) => {
  const templates = [
    {
      name: 'Stripe Network Timeout (Smart Retry -> Recovered)',
      desc: 'Subscription failed due to transient gateway timeout',
      payload: {
        id: `evt_stripe_${Date.now().toString().slice(-4)}`,
        customer_id: 'cust_alice',
        status: 'failed_recurring',
        amount: 49.99,
        currency: 'USD',
        error_code: 'network_timeout',
        source: 'Stripe Billing'
      }
    },
    {
      name: 'Shopify India Abandoned Cart (Hinglish Voice AI)',
      desc: 'High friction drop-off in India region triggering Hinglish voice agent',
      payload: {
        id: `evt_cart_${Date.now().toString().slice(-4)}`,
        customer_id: 'cust_bob',
        status: 'abandoned',
        amount: 2499.0,
        currency: 'INR',
        region: 'IN',
        source: 'Shopify UPI'
      }
    },
    {
      name: 'B2B Corporate Net-30 Overdue (Email Chaser)',
      desc: 'High value invoice requiring formal paper trail and one-click pay',
      payload: {
        id: `evt_inv_${Date.now().toString().slice(-4)}`,
        customer_id: 'cust_corp_x',
        status: 'overdue',
        amount: 7500.0,
        currency: 'USD',
        source: 'QuickBooks'
      }
    },
    {
      name: 'Insufficient Funds (SMS PayLink)',
      desc: 'Card balance insufficient, dispatching SMS recharge link',
      payload: {
        id: `evt_sub_${Date.now().toString().slice(-4)}`,
        customer_id: 'cust_alice',
        status: 'failed_recurring',
        amount: 19.99,
        currency: 'USD',
        error_code: 'insufficient_funds',
        source: 'Stripe'
      }
    }
  ];

  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(templates[0].payload, null, 2)
  );
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (templatePayload: Record<string, any>) => {
    // Generate fresh ID
    const cloned = { ...templatePayload, id: `evt_${Date.now().toString().slice(-6)}` };
    setJsonText(JSON.stringify(cloned, null, 2));
    setParseError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonText);
      setParseError(null);
      onIngest(parsed);
      onClose();
    } catch (err: any) {
      setParseError(err.message || 'Invalid JSON syntax');
    }
  };

  return (
    <div id="webhook-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div id="webhook-modal-card" className="bg-zinc-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-zinc-950/40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Ingest Payment Webhook</h3>
              <p className="text-xs text-slate-400">Trigger Phase 1 Detection & run autonomous recovery pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
              Select Quick Template:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTemplate(t.payload)}
                  className="text-left p-2.5 rounded-xl bg-zinc-950/50 border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all text-xs"
                >
                  <span className="font-semibold text-zinc-200 block truncate">{t.name}</span>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Webhook JSON Payload
              </label>
              <span className="text-[11px] font-mono text-zinc-500">application/json</span>
            </div>
            <textarea
              id="webhook-json-textarea"
              rows={8}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setParseError(null);
              }}
              className="w-full bg-zinc-950/50 border border-white/10 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-white/30"
            />
            {parseError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{parseError}</span>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-submit-webhook"
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-sm shadow-emerald-500/20"
            >
              <Send className="w-3.5 h-3.5 fill-current" />
              <span>Ingest & Execute Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
