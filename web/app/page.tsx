"use client";

import { ArrowRight, FileText, GitBranch, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-ink-200">
        <div className="max-w-8xl mx-auto px-6 lg:px-10 pt-24 pb-20">
          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 lg:col-span-8">
                            <h1 className="font-display text-[5.5rem] leading-[0.95] tracking-tighter2 text-ink-900 mb-8">
                Between the words<br />
                <span className="italic text-clay-500">and what follows.</span>
              </h1>
              <p className="text-lg text-ink-600 max-w-prose leading-relaxed">
                Contracts are the operating system of business, yet enterprise software treats them
                like dead text. TERM abandons semantic search for deterministic execution. It
                compiles ambiguous legal language into a directed acyclic graph — treating
                obligations, triggers, and consequences as a state machine.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-4">
              <div className="card p-6">
                <div className="num-label mb-4">Live Demo</div>
                <p className="text-sm text-ink-600 mb-5 leading-relaxed">
                  Type a natural-language breach. The engine traverses the graph, computes the
                  temporal logic, and outputs the exact consequence chain with strict citations.
                </p>
                <Link
                  href="/dashboard"
                  className="btn-primary w-full justify-center"
                >
                  Run the engine
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="btn-ghost w-full justify-center mt-2 text-center"
                >
                  View portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-b border-ink-200">
        <div className="max-w-8xl mx-auto px-6 lg:px-10 py-20">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-3">
                            <h2 className="font-display text-3xl tracking-tightish text-ink-900">The Problem</h2>
            </div>
            <div className="col-span-12 lg:col-span-6">
              <p className="text-lg text-ink-700 leading-relaxed mb-6">
                A vendor breaches a critical SLA. In standard environments, discovering the
                consequence requires manual parsing: a lawyer reads Section 4, traces a
                cross-reference to Section 9 for liabilities, checks Section 11 for notice periods,
                and manually projects a 30-day window. By the time the claim is drafted, the service
                credit window has closed.
              </p>
              <p className="text-lg text-ink-700 leading-relaxed">
                TERM collapses this latency to zero. Type <em className="font-display text-clay-600 not-italic">"vendor missed the SLA."</em> The engine traverses the graph, computes the temporal logic, and outputs the exact consequence chain with strict citations.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-3">
              <div className="space-y-4">
                {[
                  { k: 'Manual parse', v: '~4 hrs', sub: 'per breach event' },
                  { k: 'TERM traversal', v: '< 200ms', sub: 'deterministic' },
                  { k: 'Latency reduction', v: '99.99%', sub: 'time-to-consequence' },
                ].map((s) => (
                  <div key={s.k} className="border-l-2 border-clay-300 pl-4">
                    <div className="num-label">{s.k}</div>
                    <div className="font-display text-2xl text-ink-900">{s.v}</div>
                    <div className="text-xs text-ink-400">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-ink-200 bg-paper-50">
        <div className="max-w-8xl mx-auto px-6 lg:px-10 py-20">
                    <h2 className="font-display text-3xl tracking-tightish text-ink-900 mb-12">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-ink-200">
            {[
              {
                icon: FileText,
                step: 'Ingest',
                desc: 'Upload a PDF. TERM parses clauses, extracts obligations, triggers, conditions, and consequences — then compiles them into graph nodes with section anchors.',
              },
              {
                icon: GitBranch,
                step: 'Compile',
                desc: 'Ambiguous legal language becomes a directed acyclic graph. Cross-references resolve to edges. Temporal logic becomes traversable state transitions.',
              },
              {
                icon: Zap,
                step: 'Execute',
                desc: 'Query in plain English. The engine walks the DAG, evaluates conditions, and returns the exact consequence chain — every step cited to a section.',
              },
            ].map((s, i) => (
              <div key={s.step} className="bg-paper-50 p-8">
                <div className="flex items-center justify-between mb-6">
                  <s.icon className="w-6 h-6 text-clay-500" strokeWidth={1.5} />
                  <span className="font-mono text-xs text-ink-400">0{i + 1}</span>
                </div>
                <h3 className="font-display text-2xl text-ink-900 mb-3">{s.step}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-8xl mx-auto px-6 lg:px-10 py-24">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
                            <h2 className="font-display text-5xl tracking-tightish text-ink-900 max-w-xl leading-tight">
                Stop reading contracts.<br />
                Start executing them.
              </h2>
            </div>
            <div className="flex gap-3">
              <Link href="/upload" className="btn-primary">
                Ingest a contract
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/dashboard" className="btn-outline">
                View portfolio
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-200">
        <div className="max-w-8xl mx-auto px-6 lg:px-10 py-8 flex items-center justify-between">
          <span className="font-display text-lg text-ink-900">TERM</span>
          <span className="font-mono text-xs text-ink-400">Between the words and what follows.</span>
        </div>
      </footer>
    </div>
  );
}


