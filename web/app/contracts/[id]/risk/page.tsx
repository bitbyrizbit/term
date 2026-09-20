"use client";

import { useEffect, useState } from "react";
import { getRiskRadar } from "../../../../lib/api";
import ContractNav from "../../../../components/ContractNav";
import ContractNav from "../../../components/ContractNav";
import Link from "next/link";
import { Shield, AlertCircle, CheckCircle, Clock } from "lucide-react";
import ClauseSourceLink from "../../../../components/ClauseSourceLink";
import ExportReportButton from "../../../../components/ExportReportButton";

export default function RiskRadarPage({ params }: { params: { id: string } }) {
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRiskRadar(params.id)
      .then(res => setRisks(res.risks))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Risk Radar</h1>
          <p className="text-sm text-gray-500">Rubric-based risk evaluation with justified next actions.</p>
        </div>
        <div className="flex items-center gap-6">
          <ContractNav contractId={params.id} />
          <ExportReportButton contractId={params.id} />
        </div>
      </div>

      {loading && <div className="text-center py-20 text-gray-500">Running risk models...</div>}
      {error && <div className="p-4 bg-red-50 text-red-700 rounded border border-red-200">{error}</div>}

      {!loading && risks.length > 0 && (
        <div className="grid gap-6">
          {risks.map((risk, idx) => {
            const isRed = risk.status === 'Red';
            const isYellow = risk.status === 'Yellow';
            const isGreen = risk.status === 'Green';
            
            return (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg shadow-sm flex overflow-hidden">
                <div className={`w-2 ${isRed ? 'bg-red-500' : isYellow ? 'bg-amber-400' : 'bg-green-500'}`} />
                <div className="p-6 flex-grow flex gap-8">
                  <div className="w-1/4">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mb-1">
                      {isRed ? <AlertCircle className="text-red-500" size={20}/> : 
                       isYellow ? <Clock className="text-amber-500" size={20}/> : 
                       <CheckCircle className="text-green-500" size={20}/>}
                      {risk.category}
                    </h3>
                    <span className={`text-sm font-bold uppercase tracking-wider ${isRed ? 'text-red-600' : isYellow ? 'text-amber-600' : 'text-green-600'}`}>
                      {risk.status} RISK
                    </span>
                  </div>
                  
                  <div className="w-1/2">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Justification</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">{risk.justification}</p>
                  </div>
                  
                  <div className="w-1/4 bg-gray-50 rounded p-4 border border-gray-100">
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 font-bold mb-2">Next Action</h4>
                    <p className="text-gray-900 text-sm font-medium mb-4">{risk.next_action}</p>
                    {risk.clause_id && (
                      <ClauseSourceLink contractId={params.id} clauseId={risk.clause_id} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
