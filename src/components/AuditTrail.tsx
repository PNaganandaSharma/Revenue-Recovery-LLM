import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Repeat, PhoneCall, Mail, MessageSquare, AlertCircle, CheckCircle, Clock, XCircle, FileText, Download } from 'lucide-react';
import { ActionLog, ChannelType } from '../types';

interface AuditTrailProps {
  logs: ActionLog[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.event_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesChannel = selectedChannel === 'all' || log.channel === selectedChannel;
    const matchesStatus = selectedStatus === 'all' || log.status === selectedStatus;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const getChannelBadge = (channel: ChannelType) => {
    switch (channel) {
      case 'retry':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
            <Repeat className="w-3 h-3" /> Smart Retry
          </span>
        );
      case 'voice_hinglish':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <PhoneCall className="w-3 h-3" /> Hinglish Voice AI
          </span>
        );
      case 'sms':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <MessageSquare className="w-3 h-3" /> SMS PayLink
          </span>
        );
      case 'email':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-950/80 text-blue-300 border border-blue-800/60">
            <Mail className="w-3 h-3" /> Email Chaser
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            None
          </span>
        );
    }
  };

  const getStatusBadge = (status: ActionLog['status']) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
            <CheckCircle className="w-3 h-3" /> Recovered (Success)
          </span>
        );
      case 'promise_to_pay':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <Clock className="w-3 h-3" /> Promise to Pay
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            <CheckCircle className="w-3 h-3" /> Dispatched
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-950/80 text-rose-300 border border-rose-800/60">
            <XCircle className="w-3 h-3" /> Compliance Blocked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Action ID', 'Timestamp', 'Event ID', 'Customer ID', 'Channel', 'Status', 'Amount', 'Currency', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.action_id,
        log.timestamp,
        log.event_id,
        log.customer_id,
        log.channel,
        log.status,
        log.amount || '',
        log.currency || '',
        `"${(log.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `audit_logs_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="audit-trail-view" className="bg-zinc-900/30 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Phase 4: Compliance & Immutable Audit Trail</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950/50 text-zinc-300 border border-white/10 uppercase font-bold tracking-wider">
              {logs.length} Actions
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-medium">
            Cryptographically bounded record of all automated revenue interventions, compliance gates, and recovery outcomes.
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1 bg-zinc-950/40 hover:bg-white/5 border border-white/10 rounded-md text-[11px] font-medium text-zinc-300 transition-colors flex items-center gap-1.5"
            title="Export full audit log to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1.5 text-zinc-500" />
            <input
              id="audit-search-input"
              type="text"
              placeholder="Search action, customer, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-zinc-950/40 border border-white/10 rounded-md text-[11px] font-medium text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/30 w-48 sm:w-56"
            />
          </div>

          <select
            id="audit-channel-filter"
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-2 py-1 bg-zinc-950/40 border border-white/10 rounded-md text-[11px] font-medium text-zinc-300 focus:outline-none focus:border-white/30"
          >
            <option value="all">All Channels</option>
            <option value="retry">Smart Retry</option>
            <option value="voice_hinglish">Hinglish Voice</option>
            <option value="sms">SMS</option>
            <option value="email">Email</option>
          </select>

          <select
            id="audit-status-filter"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2 py-1 bg-zinc-950/40 border border-white/10 rounded-md text-[11px] font-medium text-zinc-300 focus:outline-none focus:border-white/30"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="sent">Sent</option>
            <option value="promise_to_pay">Promise to Pay</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-[11px] font-medium">
          <thead className="bg-zinc-950/40 text-zinc-400 uppercase tracking-wider border-b border-white/10 text-[10px]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Action ID</th>
              <th className="py-2.5 px-3 font-semibold">Timestamp</th>
              <th className="py-2.5 px-3 font-semibold">Event ID</th>
              <th className="py-2.5 px-3 font-semibold">Customer</th>
              <th className="py-2.5 px-3 font-semibold">Channel</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold">Amount</th>
              <th className="py-2.5 px-3 font-semibold">Notes & Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-zinc-500">
                  No audit logs found matching current filter.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.action_id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[10px] text-emerald-400 whitespace-nowrap">
                    {log.action_id}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-300 whitespace-nowrap">
                    {log.event_id}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-200 whitespace-nowrap">
                    {log.customer_id}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getChannelBadge(log.channel)}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-zinc-200 whitespace-nowrap">
                    {log.currency === 'INR' ? '₹' : '$'}{(log.amount || 0).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-zinc-400 max-w-xs truncate" title={log.notes}>
                    {log.notes || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
