"use client";

import { useState } from "react";
import { simulateEvent } from "../../../../lib/api";
import ContractNav from "../../../../components/ContractNav";
import ContractNav from "../../../components/ContractNav";
import Link from "next/link";
import { Play, ArrowRight, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ClauseSourceLink from "../../../../components/ClauseSourceLink";

export default function Simulator({ params }: { params: { id: string } }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await simulateEvent(params.id, query);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to run simulation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Event Simulator</h1>
          <p className="text-sm text-gray-500">Trace the consequences of real-world events.</p>
        </div>
        <ContractNav contractId={params.id} />
      </div>

      <form onSubmit={handleSubmit} className="mb-12">
        <div className="flex gap-4">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., vendor missed the SLA today"
            className="flex-grow p-4 border rounded shadow-sm text-lg"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-4 rounded font-bold shadow hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Simulating..." : <><Play size={20} /> Run Event</>}
          </button>
        </div>
      </form>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}

      {loading && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Tracing Consequences...</h3>
          {[1, 2, 3].map((step) => (
            <motion.div
              key={step}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: step * 0.2 }}
              className="p-6 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-4 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="w-full space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-16 bg-gray-100 rounded w-full mt-4" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {result && result.needs_clarification && (
        <div className="p-8 bg-amber-50 border border-amber-200 rounded text-center">
          <AlertTriangle className="mx-auto text-amber-500 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-amber-800 mb-2">Human Review Required</h2>
          <p className="text-amber-700">{result.message}</p>
        </div>
      )}

      {result && !result.needs_clarification && result.chain && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-6">Consequence Chain</h3>
          <AnimatePresence>
            {result.chain.map((step: any, index: number) => (
              <motion.div
                key={step.node_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.6 }}
                className={`relative p-6 border rounded-lg shadow-sm flex items-start gap-4 ${step.type === 'Conflict' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}
              >
                {/* Visual line connecting steps */}
                {index < result.chain.length - 1 && (
                  <div className="absolute left-[39px] top-16 bottom-[-24px] w-0.5 bg-gray-200 z-0" />
                )}
                
                <div className="z-10 bg-white rounded-full p-2 border-2 border-indigo-200 flex-shrink-0">
                  <ArrowRight className="text-indigo-500" size={20} />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wider rounded ${step.type === 'Conflict' ? 'bg-red-200 text-red-900' : 'bg-blue-100 text-blue-800'}`}>
                      {step.owner}
                    </span>
                    {step.source_ref && (
                      <ClauseSourceLink contractId={params.id} clauseId={step.node_id.replace('clause_', '')} />
                    )}
                  </div>
                  
                  <p className="text-lg font-medium text-gray-900 mb-3">{step.action}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div><strong>Deadline:</strong> {new Date(step.deadline).toLocaleDateString()}</div>
                    <div><strong>Confidence:</strong> {(step.confidence * 100).toFixed(0)}%</div>
                  </div>
                  
                  {step.source_clause && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600 font-serif italic">
                      "{step.source_clause}"
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
