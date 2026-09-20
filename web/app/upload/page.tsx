"use client";

import { useState, useRef, type DragEvent } from 'react';
import { UploadCloud, FileText, Check, ArrowRight, Loader2 } from 'lucide-react';
import { uploadContract } from '../../lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Stage = 'idle' | 'selected' | 'parsing' | 'compiled' | 'error';

export default function Upload() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setStage('selected');
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const startParse = async () => {
    if (!file) return;
    setStage('parsing');
    try {
      const res = await uploadContract(file);
      setContractId(res.id);
      const checkStatus = async () => {
        try {
          const { getContractStatus } = await import('../../lib/api');
          const statusRes = await getContractStatus(res.id);
          if (statusRes.status === 'completed') {
            setStage('compiled');
          } else if (statusRes.status === 'failed') {
            setError('Backend failed to process');
            setStage('error');
          } else {
            setTimeout(checkStatus, 3000);
          }
        } catch (e: any) { setError(e.message); setStage('error'); }
      };
      setTimeout(checkStatus, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to compile contract");
      setStage('error');
    }
  };

  const parseSteps = [
    'Extracting text layer',
    'Identifying clause boundaries',
    'Classifying obligations & triggers',
    'Resolving cross-references',
    'Building DAG edges',
    'Anchoring section citations',
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-10 py-10">
      <div className="mb-10 pb-6 border-b border-ink-200">
        <div className="num-label mb-2">Ingest</div>
        <h1 className="font-display text-4xl tracking-tightish text-ink-900">Upload a contract</h1>
        <p className="text-sm text-ink-500 mt-1">PDF is parsed, compiled into a DAG, and added to your portfolio.</p>
      </div>

      {stage === 'idle' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-sm p-16 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-clay-400 bg-clay-50' : 'border-ink-300 bg-paper-50 hover:border-ink-400 hover:bg-paper-200'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <UploadCloud className="w-10 h-10 text-ink-300 mx-auto mb-4" strokeWidth={1} />
          <p className="font-mono text-sm text-ink-500 mb-1">Drag and drop a PDF, or browse</p>
          <p className="text-xs text-ink-400">.pdf • .docx • .txt — up to 25 MB</p>
        </div>
      )}

      {stage === 'selected' && file && (
        <div className="card p-8 fade-up">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-clay-50 border border-clay-200 rounded-sm flex items-center justify-center">
              <FileText className="w-5 h-5 text-clay-600" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-ink-900">{file.name}</div>
              <div className="text-xs text-ink-400 font-mono">Ready to compile</div>
            </div>
          </div>
          <button onClick={startParse} className="btn-primary w-full justify-center">
            Compile into graph
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {stage === 'parsing' && (
        <div className="card p-8 fade-up">
          <div className="flex items-center gap-3 mb-8">
            <Loader2 className="w-5 h-5 text-clay-500 animate-spin" />
            <span className="font-mono text-sm text-ink-600">Compiling — {file?.name}</span>
          </div>
          <div className="space-y-3">
            {parseSteps.map((step) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-4 h-4 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-moss-500" strokeWidth={2.5} />
                </div>
                <span className="text-sm text-ink-600">{step}</span>
                <span className="font-mono text-xs text-ink-300 ml-auto">pending</span>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-ink-200">
              <Loader2 className="w-4 h-4 text-clay-500 animate-spin" />
              <span className="text-sm text-ink-600">Generating structured logic with gpt-oss-20b...</span>
            </div>
          </div>
        </div>
      )}

      {stage === 'error' && (
        <div className="card p-8 fade-up border-rust-400 bg-rust-400/5">
          <h3 className="font-display text-2xl text-rust-600 mb-2">Compilation Failed</h3>
          <p className="text-sm text-ink-600 mb-6">{error}</p>
          <button onClick={() => setStage('idle')} className="btn-outline">
            Try again
          </button>
        </div>
      )}

      {stage === 'compiled' && (
        <div className="card p-8 fade-up text-center">
          <div className="w-14 h-14 bg-moss-500/10 border border-moss-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-7 h-7 text-moss-600" strokeWidth={2} />
          </div>
          <h3 className="font-display text-2xl text-ink-900 mb-2">Contract compiled</h3>
          <p className="text-sm text-ink-500 mb-8 max-w-md mx-auto">
            {file?.name} has been successfully parsed into a directed acyclic graph.
          </p>
          <div className="flex gap-3 justify-center">
            {contractId && (
              <Link href={`/contracts/${contractId}/graph`} className="btn-primary">
                View the graph
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link href="/dashboard" className="btn-outline">
              Back to portfolio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

