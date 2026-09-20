"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, ArrowUpRight, Activity, CalendarClock, ShieldAlert, FileText } from 'lucide-react';
import { getAllContracts } from '../../lib/api';
import { StatusBadge, RiskMeter } from '../../components/StatusBadge';
import Link from 'next/link';

export default function Dashboard() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expiring' | 'breached'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const data = await getAllContracts();
        // Map backend data to UI expected format
        const formatted = data.map((c: any) => ({
          id: c.id,
          title: c.filename,
          counterparty: 'Pied Piper',
          type: 'MSA',
          status: c.status === 'processing' ? 'draft' : 'active',
          riskScore: 35,
          value: '$120,000',
          obligations: 0,
          triggers: 0,
        }));
        setContracts(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchContracts();
  }, []);

  const filtered = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.counterparty.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { icon: FileText, label: 'Active Documents', value: contracts.length, accent: 'text-ink-700' },
    { icon: CalendarClock, label: 'Upcoming Renewals', value: contracts.filter((c) => c.status === 'expiring').length, accent: 'text-clay-600' },
    { icon: ShieldAlert, label: 'Flagged Risks', value: contracts.filter((c) => c.status === 'breached').length, accent: 'text-rust-600' },
    { icon: Activity, label: 'Avg. Risk Score', value: contracts.length ? 0 : 0, accent: 'text-ink-700' },
  ];

  return (
    <div className="max-w-8xl mx-auto px-6 lg:px-10 py-10">
      {/* Header */}
      <div className="flex items-end justify-between mb-10 pb-6 border-b border-ink-200">
        <div>
          <div className="num-label mb-2">Portfolio</div>
          <h1 className="font-display text-4xl tracking-tightish text-ink-900">All contracts</h1>
          <p className="text-sm text-ink-500 mt-1">Monitor obligations, renewals, and risks across every active document.</p>
        </div>
        <Link href="/upload" className="btn-primary">
          <Plus className="w-4 h-4" />
          New contract
        </Link>
      </div>

      {/* Stats — editorial row, not cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 mb-12 border-y border-ink-200 divide-x divide-ink-200">
        {stats.map((s) => (
          <div key={s.label} className="py-6 px-6">
            <div className="flex items-center gap-2 mb-3">
              <s.icon className={`w-4 h-4 ${s.accent}`} strokeWidth={1.5} />
              <span className="num-label">{s.label}</span>
            </div>
            <div className="font-display text-4xl text-ink-900 tabular-nums">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {(['all', 'active', 'expiring', 'breached'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm capitalize transition-colors ${
                filter === f ? 'bg-ink-900 text-paper-100' : 'text-ink-500 hover:bg-ink-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, party, ID..."
            className="input-field pl-9"
          />
        </div>
      </div>

      {/* Table — editorial, hairline rules */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-[120px_1fr_1fr_140px_100px_120px_40px] gap-4 px-6 py-3 bg-ink-50 border-b border-ink-200">
          <span className="num-label">ID</span>
          <span className="num-label">Title</span>
          <span className="num-label">Counterparty</span>
          <span className="num-label">Status</span>
          <span className="num-label">Risk</span>
          <span className="num-label text-right">Value</span>
          <span></span>
        </div>
        <div className="divide-y divide-ink-200">
          {loading ? (
            <div className="px-6 py-16 text-center">
              <p className="font-display italic text-ink-400 text-lg">Loading contracts...</p>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((c) => (
              <Link
                key={c.id}
                href={`/contracts/${c.id}`}
                className="w-full grid grid-cols-[120px_1fr_1fr_140px_100px_120px_40px] gap-4 px-6 py-4 items-center text-left hover:bg-paper-200 transition-colors group"
              >
                <span className="font-mono text-xs text-ink-500">{c.id.substring(0, 8)}...</span>
                <div>
                  <div className="text-sm font-medium text-ink-900">{c.title}</div>
                  <div className="text-xs text-ink-400">{c.type} • {c.obligations} obl. • {c.triggers} trig.</div>
                </div>
                <span className="text-sm text-ink-600">{c.counterparty}</span>
                <StatusBadge status={c.status} />
                <RiskMeter score={c.riskScore} />
                <span className="text-sm font-medium text-ink-700 text-right tabular-nums">{c.value}</span>
                <ArrowUpRight className="w-4 h-4 text-ink-300 group-hover:text-clay-500 transition-colors" />
              </Link>
            ))
          ) : (
            <div className="px-6 py-16 text-center">
              <p className="font-display italic text-ink-400 text-lg">No contracts match this filter.</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-xs text-ink-400">
        <span className="font-mono">{filtered.length} of {contracts.length} documents</span>
        <span className="font-mono">Last sync: Just now</span>
      </div>
    </div>
  );
}


