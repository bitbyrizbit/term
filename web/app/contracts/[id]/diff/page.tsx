"use client";

import { useState, useEffect } from "react";
import { computeVersionDiff } from "../../../../lib/api";
import Link from "next/link";
import { UploadCloud, ArrowRight, ShieldAlert, FileText, Check, Loader2 } from "lucide-react";

export default function DiffPage({ params }: { params: { id: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          // Slowly increment to simulate work
          return prev + Math.floor(Math.random() * 5) + 1;
        });
      }, 1000);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
      setProgress(100);
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-6 lg:px-10 py-10">
      <div className="mb-10 pb-6 border-b border-ink-200">
        <div className="num-label mb-2">Version Control</div>
        <h1 className="font-display text-4xl tracking-tightish text-ink-900">Version Diff & Impact</h1>
        <p className="text-sm text-ink-500 mt-1">Upload a revised PDF to trace how material changes affect the graph.</p>
      </div>

      {!result && !loading && (
        <div className="max-w-3xl">
          <div className="card p-8 text-center mb-6">
            <UploadCloud className="mx-auto text-clay-400 mb-4" size={32} strokeWidth={1.5} />
            <h3 className="font-display text-2xl text-ink-900 mb-2">Upload Version 2</h3>
            <p className="text-sm text-ink-500 mb-6">
              This process performs deep semantic extraction on the new document and compares it against the existing graph. It may take up to 30 seconds.
            </p>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-ink-500 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-ink-100 file:text-ink-900 hover:file:bg-ink-200 mx-auto mb-6"
            />
            <button 
              onClick={handleDiff}
              disabled={!file}
              className="btn-primary w-full justify-center disabled:opacity-50"
            >
              Compare Versions
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {error && (
            <div className="card p-4 border-rust-400 bg-rust-400/5 text-rust-600 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="max-w-3xl card p-10 fade-up text-center">
          <Loader2 className="w-8 h-8 text-clay-500 animate-spin mx-auto mb-6" />
          <h3 className="font-display text-2xl text-ink-900 mb-2">Analyzing Material Impact...</h3>
          <p className="text-sm text-ink-500 mb-8 max-w-md mx-auto">
            Extracting text layer, re-generating embeddings, and walking the consequence paths. Please wait.
          </p>
          
          <div className="w-full bg-ink-100 rounded-full h-2 overflow-hidden max-w-md mx-auto">
            <div className="bg-clay-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="font-mono text-xs text-ink-400 mt-2 block">{progress}%</span>
        </div>
      )}

      {result && result.diff && (
        <div className="space-y-8 fade-up">
          {result.diff.map((change: any, i: number) => {
            if (change.change_type === "identical") return null;
            const isMaterial = change.is_material;
            
            return (
              <div key={i} className={`card overflow-hidden ${isMaterial ? 'border-clay-300' : 'border-ink-200'}`}>
                <div className={`p-4 flex items-center justify-between border-b ${isMaterial ? 'bg-clay-50 border-clay-200' : 'bg-paper-50 border-ink-200'}`}>
                  <div className="flex items-center gap-3">
                    {isMaterial ? (
                      <ShieldAlert className="text-clay-600" size={20} />
                    ) : (
                      <FileText className="text-ink-400" size={20} />
                    )}
                    <h3 className="font-display text-xl text-ink-900">Section {change.original_section}</h3>
                  </div>
                  <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-sm ${isMaterial ? 'bg-clay-200 text-clay-800' : 'bg-ink-100 text-ink-600'}`}>
                    {isMaterial ? 'Material Risk' : 'Cosmetic Change'}
                  </span>
                </div>
                
                <div className="p-6 grid grid-cols-2 gap-6 bg-paper-100">
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-ink-400 mb-2 tracking-wider">Original text</h4>
                    <p className="text-sm text-ink-600 line-through decoration-rust-500/50">{change.original_text || "None"}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-ink-400 mb-2 tracking-wider">Revised text</h4>
                    <p className="text-sm text-ink-900 bg-moss-500/10 rounded-sm p-1">{change.new_text || "None"}</p>
                  </div>
                </div>

                {isMaterial && change.downstream_impact && change.downstream_impact.length > 0 && (
                  <div className="p-6 border-t border-ink-200 bg-paper-50">
                    <h4 className="text-[10px] font-mono uppercase text-clay-600 mb-3 tracking-wider">Downstream Graph Impact</h4>
                    <ul className="space-y-2">
                      {change.downstream_impact.map((impact: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-ink-700">
                          <ArrowRight className="text-clay-400 mt-0.5 shrink-0" size={16} />
                          {impact}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
          
          <div className="flex gap-4">
             <button onClick={() => {setResult(null); setFile(null);}} className="btn-outline">
                Compare another version
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
