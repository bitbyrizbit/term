"use client";

import { useEffect, useState } from "react";
import { getAllContracts } from "../../lib/api";
import Link from "next/link";
import { FileText, Plus, Activity, CalendarClock, ShieldAlert } from "lucide-react";

export default function Dashboard() {
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllContracts()
      .then(setContracts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Portfolio Overview</h1>
          <p className="text-sm text-gray-500">Monitor obligations, renewals, and risks across all active contracts.</p>
        </div>
        <Link 
          href="/upload"
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700 text-sm font-semibold"
        >
          <Plus size={18} /> New Contract
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-12">
        <div className="bg-white border rounded p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Activity size={24} /></div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{contracts.length}</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Documents</p>
          </div>
        </div>
        <div className="bg-white border rounded p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><CalendarClock size={24} /></div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">3</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Upcoming Renewals</p>
          </div>
        </div>
        <div className="bg-white border rounded p-6 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><ShieldAlert size={24} /></div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">2</h3>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Flagged Risks</p>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded shadow-sm">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-700">Contract Repository</h2>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-serif italic">Loading portfolio...</div>
          ) : contracts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No contracts uploaded yet.</div>
          ) : (
            contracts.map(c => (
              <Link key={c.id} href={`/contracts/${c.id}`} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded text-gray-500">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{c.title}</h3>
                    <p className="text-sm text-gray-500 font-mono mt-1 text-xs">ID: {c.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {c.status.toUpperCase()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
