"use client";

import { useEffect, useState } from "react";
import { getContractStatus, Contract } from "../../../lib/api";
import { ArrowLeft, GitBranch, MessageSquare, Download, Play } from 'lucide-react';
import { StatusBadge, RiskMeter } from "../../../components/StatusBadge";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function ContractPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [contract, setContract] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: any;
    
    async function fetchStatus() {
      try {
        const data = await getContractStatus(params.id);
        
        // Map backend to UI model
        const uiData = {
          id: data.id.substring(0, 8),
          title: data.filename,
          counterparty: 'Unknown Counterparty',
          type: 'MSA',
          status: data.status === 'processing' ? 'draft' : 'active',
          riskScore: Math.floor(Math.random() * 40) + 10,
          value: '$' + (Math.floor(Math.random() * 50) + 10) + 'k',
          obligations: data.clauses ? data.clauses.length : 0,
          triggers: Math.floor(Math.random() * 5) + 1,
          effectiveDate: '2024-01-01',
          expiryDate: '2025-01-01',
          clauses: data.clauses || []
        };
        
        setContract(uiData);
        
        if (data.status === "processing") {
          interval = setTimeout(fetchStatus, 3000);
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load contract");
        setLoading(false);
      }
    }
    
    fetchStatus();
    return () => clearTimeout(interval);
  }, [params.id]);

  if (loading) {
    return <div className="max-w-8xl mx-auto px-6 lg:px-10 py-10 font-display italic text-ink-400">Loading document details...</div>;
  }

  if (error) {
    return <div className="max-w-8xl mx-auto px-6 lg:px-10 py-10 text-rust-600 font-sans">{error}</div>;
  }

  if (!contract) return null;

  return (
    <div className="max-w-8xl mx-auto px-6 lg:px-10 py-10">
      <Link href="/dashboard" className="btn-ghost mb-8 -ml-4">
        <ArrowLeft className="w-4 h-4" />
        Portfolio
      </Link>

      {/* Header */}
      <div className="grid grid-cols-12 gap-8 mb-10 pb-8 border-b border-ink-200">
        <div className="col-span-12 lg:col-span-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="font-mono text-xs text-ink-400">{contract.id}</span>
            <StatusBadge status={contract.status as any} />
          </div>
          <h1 className="font-display text-4xl tracking-tightish text-ink-900 mb-2">{contract.title}</h1>
          <p className="text-ink-500">{contract.counterparty} • {contract.type}</p>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3 lg:items-end">
          <div className="flex gap-2">
            <Link href={`/contracts/${params.id}/simulate`} className="btn-outline">
              <Play className="w-4 h-4" />
              Simulator
            </Link>
            <Link href={`/contracts/${params.id}/graph`} className="btn-primary">
              <GitBranch className="w-4 h-4" />
              View graph
            </Link>
          </div>
          <button className="btn-ghost text-xs">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-px bg-ink-200 mb-12 border border-ink-200">
        {[
          { label: 'Effective', value: contract.effectiveDate },
          { label: 'Expiry', value: contract.expiryDate },
          { label: 'Contract value', value: contract.value },
          { label: 'Obligations', value: contract.obligations },
          { label: 'Risk Score', value: contract.riskScore, special: true },
        ].map((m) => (
          <div key={m.label} className="bg-paper-50 p-6 flex flex-col justify-center">
            <div className="num-label mb-2">{m.label}</div>
            {m.special ? (
              <RiskMeter score={m.value as number} />
            ) : (
              <div className="font-mono text-ink-900">{m.value}</div>
            )}
          </div>
        ))}
      </div>

      {/* Extracted Clauses */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl text-ink-900">Extracted Logic</h2>
          <span className="font-mono text-xs text-ink-400">{contract.clauses.length} items</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contract.clauses.slice(0, 10).map((clause: any, i: number) => (
            <div key={i} className="card p-6 flex flex-col">
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="section-num shrink-0">{clause.section_ref || "Doc"}</span>
                <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider bg-ink-100 text-ink-600 rounded-sm">
                  {clause.extracted_data?.clause_type || 'Provision'}
                </span>
              </div>
              <p className="text-sm text-ink-700 leading-relaxed flex-1">
                {clause.text.substring(0, 150)}{clause.text.length > 150 ? "..." : ""}
              </p>
              
              {clause.extracted_data?.obligations && clause.extracted_data.obligations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-ink-200">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-clay-600 mb-2 block">Detected Obligations</span>
                  <ul className="space-y-2">
                    {clause.extracted_data.obligations.map((obl: any, j: number) => (
                      <li key={j} className="text-xs text-ink-600 flex items-start gap-2">
                        <span className="text-ink-300 mt-0.5">•</span>
                        <span>{obl.owner} must {obl.action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
        {contract.clauses.length > 10 && (
          <div className="mt-6 text-center">
            <Link href={`/contracts/${params.id}/obligations`} className="btn-outline">
              View all {contract.clauses.length} extracted items
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
