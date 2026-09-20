"use client";

import { useState } from "react";
import { askQuestion } from "../../../../lib/api";
import Link from "next/link";
import { Search, AlertTriangle, ShieldCheck } from "lucide-react";
import ClauseSourceLink from "../../../../components/ClauseSourceLink";

export default function QAPanel({ params }: { params: { id: string } }) {
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
      const data = await askQuestion(params.id, query);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Explainable Q&A</h1>
          <p className="text-sm text-gray-500">Ask strictly grounded questions about this contract.</p>
        </div>
        <div className="flex gap-4">
          <Link href={`/contracts/${params.id}`} className="text-sm text-blue-600 hover:underline">Document</Link>
          <Link href={`/contracts/${params.id}/graph`} className="text-sm text-blue-600 hover:underline">Graph</Link>
          <Link href={`/contracts/${params.id}/simulate`} className="text-sm text-blue-600 hover:underline">Simulator</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., What is the penalty for missing an SLA?"
            className="flex-grow p-4 border rounded shadow-sm text-lg font-serif"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-gray-900 text-white px-8 py-4 rounded font-bold shadow hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? "Searching..." : <><Search size={20} /> Ask</>}
          </button>
        </div>
      </form>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>}

      {result && (
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
          {/* Answer Section */}
          <div className="p-6 bg-blue-50/30 border-b border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Answer</h3>
            <p className="text-lg text-gray-900 font-serif leading-relaxed">{result.answer}</p>
          </div>
          
          {/* Reasoning Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Reasoning</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{result.reasoning}</p>
          </div>

          {/* Citations Section */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Cited Clauses</h3>
            <div className="flex flex-wrap gap-2">
              {result.source_links && result.source_links.map((link: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded text-sm border border-gray-200">
                  <span className="font-mono text-indigo-700">{link.section_ref}</span>
                  <ClauseSourceLink contractId={params.id} clauseId={link.clause_id} />
                </div>
              ))}
              {(!result.source_links || result.source_links.length === 0) && (
                <span className="text-sm text-gray-500 italic">No exact clauses cited.</span>
              )}
            </div>
          </div>

          {/* Confidence / Review Section */}
          <div className={`p-4 flex items-center justify-between ${result.human_review_recommended ? 'bg-amber-50' : 'bg-green-50'}`}>
            <div className="flex items-center gap-2">
              {result.human_review_recommended ? (
                <AlertTriangle className="text-amber-600" size={18} />
              ) : (
                <ShieldCheck className="text-green-600" size={18} />
              )}
              <span className={`text-sm font-medium ${result.human_review_recommended ? 'text-amber-800' : 'text-green-800'}`}>
                {result.human_review_recommended ? 'Human Review Recommended' : 'Grounded Answer'}
              </span>
            </div>
            <div className="text-sm font-mono text-gray-600">
              Confidence: {(result.confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
