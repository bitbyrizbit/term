"use client";

import { useEffect, useState } from "react";
import { getContractObligations, getContractStatus } from "../../../../lib/api";
import ClauseSourceLink from "../../../../components/ClauseSourceLink";
import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle, Calendar } from "lucide-react";

export default function ObligationsCommandCenter({ params }: { params: { id: string } }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContractObligations(params.id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="p-8 text-gray-500">Loading obligations...</div>;
  if (!data) return <div className="p-8 text-red-500">Failed to load obligations.</div>;

  const counts = {
    overdue: data.overdue?.length || 0,
    due_this_week: data.due_this_week?.length || 0,
    upcoming: data.upcoming?.length || 0,
    completed: data.completed?.length || 0,
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Command Center</h1>
          <p className="text-sm text-gray-500">Active obligations and deadlines.</p>
        </div>
        <div className="flex gap-4">
          <Link href={`/contracts/${params.id}`} className="text-sm text-blue-600 hover:underline">Document View</Link>
          <Link href={`/contracts/${params.id}/graph`} className="text-sm text-blue-600 hover:underline">Knowledge Graph</Link>
          <Link href={`/contracts/${params.id}/simulate`} className="text-sm text-blue-600 hover:underline">Simulator</Link>
          <Link href={`/contracts/${params.id}/ask`} className="text-sm text-blue-600 hover:underline">Q&A</Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-12">
        <StatCard title="Overdue" count={counts.overdue} icon={<AlertCircle className="text-red-500" />} />
        <StatCard title="Due This Week" count={counts.due_this_week} icon={<Clock className="text-amber-500" />} />
        <StatCard title="Upcoming" count={counts.upcoming} icon={<Calendar className="text-blue-500" />} />
        <StatCard title="Completed" count={counts.completed} icon={<CheckCircle2 className="text-green-500" />} />
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Bucket title="Overdue" items={data.overdue} color="border-red-200 bg-red-50" contractId={params.id} />
        <Bucket title="Due This Week" items={data.due_this_week} color="border-amber-200 bg-amber-50" contractId={params.id} />
        <Bucket title="Upcoming" items={data.upcoming} color="border-blue-200 bg-blue-50" contractId={params.id} />
      </div>
    </div>
  );
}

function StatCard({ title, count, icon }: { title: string; count: number; icon: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{count}</p>
      </div>
      <div>{icon}</div>
    </div>
  );
}

function Bucket({ title, items, color, contractId }: { title: string; items: any[]; color: string; contractId: string }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="space-y-4">
        {items.map((ob: any, i: number) => (
          <div key={i} className={`border rounded p-4 shadow-sm ${color}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-medium px-2 py-1 bg-white rounded border text-gray-700">{ob.owner}</span>
              {ob.clause_id && <ClauseSourceLink contractId={contractId} clauseId={ob.clause_id} />}
            </div>
            <p className="text-sm text-gray-900 font-medium leading-snug mb-2">{ob.action}</p>
            {ob.deadline && (
              <p className="text-xs text-gray-600">
                <span className="font-semibold">Deadline:</span> {new Date(ob.deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
