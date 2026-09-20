"use client";

import { useState } from "react";
import { computeVersionDiff } from "../../../../lib/api";
import ContractNav from "../../../../components/ContractNav";
import ContractNav from "../../../components/ContractNav";
import Link from "next/link";
import { Upload, ArrowRight, ShieldAlert, FileText } from "lucide-react";

export default function DiffPage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDiff = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await computeVersionDiff(params.id, file);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to compare versions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Version Diff & Impact</h1>
          <p className="text-sm text-gray-500">Upload a revised PDF to trace how changes affect the graph.</p>
        </div>
        <ContractNav contractId={params.id} />
      </div>

      {!result && (
        <div className="mb-12 border-2 border-dashed border-gray-300 p-12 text-center rounded bg-gray-50">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold mb-2">Upload Version 2</h3>
          <input 
            type="file" 
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 mx-auto max-w-sm mb-4"
          />
          <button 
            onClick={handleDiff}
            disabled={!file || loading}
            className="bg-indigo-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Analyzing Impact..." : "Compare Versions"}
          </button>
          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>
      )}

      {result && result.diff && (
        <div className="space-y-8">
          {result.diff.map((change: any, i: number) => {
            if (change.change_type === "identical") return null;
            const isMaterial = change.is_material;
            
            return (
              <div key={i} className={`border rounded-lg overflow-hidden shadow-sm ${isMaterial ? 'border-amber-300' : 'border-gray-200'}`}>
                <div className={`p-4 flex items-center justify-between ${isMaterial ? 'bg-amber-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-3">
                    {isMaterial ? <ShieldAlert className="text-amber-600" /> : <FileText className="text-gray-400" />}
                    <h3 className="font-semibold text-gray-900">
                      {change.change_type.toUpperCase()} - {change.new_ref || change.old_ref}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    {change.affected_teams?.map((team: str) => (
                      <span key={team} className="px-2 py-1 bg-white border rounded text-xs font-bold text-gray-600">{team}</span>
                    ))}
                  </div>
                </div>
                
                <div className="flex divide-x">
                  <div className="w-1/2 p-4 bg-red-50/30 line-through text-gray-500 font-serif text-sm">
                    {change.old_text || "None"}
                  </div>
                  <div className="w-1/2 p-4 bg-green-50/30 text-gray-900 font-serif text-sm">
                    {change.new_text || "None"}
                  </div>
                </div>
                
                {isMaterial && (
                  <div className="p-4 bg-white border-t border-amber-100">
                    <p className="text-sm font-semibold text-amber-800 mb-3">Reasoning: {change.reasoning}</p>
                    
                    {change.impact && change.impact.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Downstream Impact</h4>
                        <div className="space-y-2">
                          {change.impact.map((imp: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded border">
                              <ArrowRight size={14} className="text-indigo-500" />
                              <span className="font-semibold text-gray-700">[{imp.owner}]</span>
                              <span className="text-gray-900">{imp.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
