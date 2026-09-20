"use client";

import { useState } from 'react';
import { ArrowRight, Loader2, Check, X, CornerDownRight } from 'lucide-react';
import { simulateEvent } from '../../../../lib/api';
import Link from 'next/link';



export default function Query({ params }: { params: { id: string } }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const runQuery = async (q: string) => {
    setInput(q);
    setLoading(true);
    setResult(null);
    try {
      const data = await simulateEvent(params.id, q);
      // Wait for dramatic effect of traversing
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setResult({ consequence_chain: ["Error executing graph traversal."] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
      <div className="mb-10 pb-6 border-b border-ink-200">
        <div className="num-label mb-2">Simulator</div>
        <h1 className="font-display text-4xl tracking-tightish text-ink-900">Event Simulator</h1>
        <p className="text-sm text-ink-500 mt-1">Natural language in. Deterministic consequence chain out — with strict citations.</p>
      </div>

      {/* Input */}
      <div className="card p-2 mb-6 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && input.trim() && runQuery(input)}
          placeholder="e.g. vendor missed the SLA"
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none font-mono"
        />
        <button
          onClick={() => input.trim() && runQuery(input)}
          disabled={!input.trim() || loading}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          Traverse
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="card p-8 fade-up">
          <div className="flex items-center gap-3 mb-6">
            <Loader2 className="w-5 h-5 text-clay-500 animate-spin" />
            <span className="font-mono text-sm text-ink-600">Traversing DAG...</span>
          </div>
          <div className="space-y-2.5">
            {['Evaluating trigger nodes', 'Walking consequence edges', 'Computing temporal logic', 'Resolving citations'].map((s) => (
              <div key={s} className="flex items-center gap-2 text-sm text-ink-400">
                <CornerDownRight className="w-3.5 h-3.5" />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="fade-up space-y-6">
          {/* Consequence */}
          <div className="card p-8">
            <div className="num-label mb-3">Consequence Chain</div>
            <div className="space-y-4 mb-6">
              {result.consequence_chain?.map((step: string, i: number) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="font-mono text-xs text-ink-300 mt-1">0{i+1}</span>
                  <p className="font-display text-2xl text-ink-900 leading-snug tracking-tightish">
                    {step}
                  </p>
                </div>
              ))}
            </div>
            
            {result.relevant_clauses && result.relevant_clauses.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-ink-200 items-center">
                <span className="num-label mt-1">Citations:</span>
                {result.relevant_clauses.map((c: any, idx: number) => (
                  <span key={idx} className="font-mono text-xs text-clay-600 bg-clay-50 px-2 py-0.5 rounded-sm border border-clay-200">
                    {c.section_ref}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

