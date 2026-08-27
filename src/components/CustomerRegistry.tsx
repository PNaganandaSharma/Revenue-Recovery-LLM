import React, { useState } from 'react';
import { User, ShieldAlert, ShieldCheck, ToggleLeft, ToggleRight, Phone, Mail, Globe, DollarSign, Plus, Download } from 'lucide-react';
import { CustomerProfile } from '../types';

interface CustomerRegistryProps {
  customers: CustomerProfile[];
  onUpdateCustomer: (customerId: string, patch: Partial<CustomerProfile>) => void;
}

export const CustomerRegistry: React.FC<CustomerRegistryProps> = ({
  customers,
  onUpdateCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['Customer ID', 'Name', 'Email', 'Phone', 'Language', 'Contact Count', 'Opted Out', 'Total Paid'];
    const csvContent = [
      headers.join(','),
      ...customers.map(c => [
        c.customer_id,
        `"${(c.name || '').replace(/"/g, '""')}"`,
        c.email || '',
        c.phone || '',
        c.language_preference || '',
        c.contact_count,
        c.opted_out ? 'Yes' : 'No',
        c.total_paid
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `customers_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="customer-registry-view" className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <span>Customer Compliance & Fatigue Guard</span>
            <span className="text-[10px] px-1.5 py-0.5 uppercase tracking-wider font-bold rounded bg-zinc-950/50 text-zinc-300 border border-white/10">
              {customers.length} Profiles
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Enforce stopping rules, track anti-fatigue daily contact limits (max 3/day), and manage customer opt-outs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1 bg-zinc-950/40 hover:bg-white/5 border border-white/10 rounded-md text-[11px] font-medium text-zinc-300 transition-colors flex items-center gap-1.5"
            title="Export customer registry to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <input
            id="customer-search-input"
            type="text"
            placeholder="Search customers or IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 bg-zinc-950/40 border border-white/10 rounded-md text-[11px] font-medium text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/30 w-full sm:w-56"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((customer) => {
          const isFatigued = customer.contact_count >= 3;
          return (
            <div
              key={customer.customer_id}
              id={`customer-card-${customer.customer_id}`}
              className={`p-3 rounded-lg border transition-all ${
                customer.opted_out
                  ? 'bg-rose-950/30 border-rose-900/40'
                  : isFatigued
                  ? 'bg-amber-950/30 border-amber-900/40'
                  : 'bg-zinc-950/40 border-white/5'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">{customer.name}</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{customer.customer_id}</span>
                </div>
                {customer.opted_out ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    Opted Out
                  </span>
                ) : isFatigued ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Max Contacts (3)
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Eligible
                  </span>
                )}
              </div>

              <div className="my-2.5 space-y-1 text-[11px] font-medium text-zinc-400 border-y border-white/5 py-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-600" />
                  <span className="truncate">{customer.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{customer.phone || 'No phone provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Preference: <strong className="text-zinc-300 uppercase">{customer.language_preference}</strong></span>
                </div>
              </div>

              {/* Contact Counter and Opt Out Switch */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Contacts Today</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-bold text-zinc-200">{customer.contact_count}/3</span>
                    <button
                      id={`btn-increment-contact-${customer.customer_id}`}
                      onClick={() => onUpdateCustomer(customer.customer_id, { contact_count: Math.min(5, customer.contact_count + 1) })}
                      className="px-1.5 py-0.5 text-[9px] font-bold bg-white/10 hover:bg-white/20 text-zinc-300 rounded"
                      title="Simulate adding contact count"
                    >
                      +1
                    </button>
                    {customer.contact_count > 0 && (
                      <button
                        id={`btn-reset-contact-${customer.customer_id}`}
                        onClick={() => onUpdateCustomer(customer.customer_id, { contact_count: 0 })}
                        className="px-1.5 py-0.5 text-[9px] font-bold bg-white/5 hover:bg-white/10 text-zinc-400 rounded"
                        title="Reset daily contact count"
                      >
                        0
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Opt-out Status</span>
                  <button
                    id={`btn-toggle-optout-${customer.customer_id}`}
                    onClick={() => onUpdateCustomer(customer.customer_id, { opted_out: !customer.opted_out })}
                    className="flex items-center gap-1 text-[11px] font-bold mt-0.5 text-zinc-400 hover:text-white"
                  >
                    {customer.opted_out ? (
                      <ToggleRight className="w-4 h-4 text-rose-400" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{customer.opted_out ? 'Blocked' : 'Active'}</span>
                  </button>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500 font-medium">Total Settled Recovery:</span>
                <span className="font-bold text-emerald-400">${customer.total_paid.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
