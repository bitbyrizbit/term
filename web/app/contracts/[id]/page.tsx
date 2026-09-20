"use client";

import { useEffect, useState } from "react";
import { getContractStatus, Contract } from "../../../lib/api";
import ContractNav from "../../../components/ContractNav";
import Link from "next/link";

export default function ContractPage({ params }: { params: { id: string } }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const data = await getContractStatus(params.id);
        setContract(data);
        
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
        }
      } catch (err) {
        setError("Failed to fetch contract status.");
        clearInterval(interval);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 2000);

    return () => clearInterval(interval);
  }, [params.id]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!contract) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-12 p-4">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">{contract.filename}</h1>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-sm text-gray-500">ID: {contract.id}</span>
            <span className={`px-2 py-1 text-xs rounded-full uppercase tracking-wider font-semibold 
              ${contract.status === 'completed' ? 'bg-green-100 text-green-800' : 
                contract.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'}`}>
              {contract.status}
            </span>
          </div>
        </div>
        <ContractNav contractId={params.id} />
      </div>

      {contract.status === "processing" && (
        <div className="p-12 text-center text-gray-500">
          <div className="animate-pulse">Extracting graph structure and obligations...</div>
        </div>
      )}

      {contract.status === "completed" && contract.clauses && (
        <div className="space-y-8">
          {contract.clauses.map((clause) => (
            <div key={clause.id} id={`clause-${clause.id}`} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm scroll-mt-24">
              <div className="flex justify-between items-start mb-4">
                <span className="font-mono text-sm text-indigo-600 font-bold">
                  {clause.section_ref}
                </span>
                <span className="text-xs text-gray-400 font-mono uppercase tracking-widest">
                  {clause.extracted_data?.clause_type}
                </span>
              </div>
              
              <p className="text-gray-800 text-sm mb-6 leading-relaxed bg-gray-50 p-4 rounded border border-gray-100">
                {clause.text}
              </p>

              {clause.extracted_data?.obligations && clause.extracted_data.obligations.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Extracted Obligations</h4>
                  <div className="space-y-3">
                    {clause.extracted_data.obligations.map((ob, idx) => (
                      <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-blue-900 text-sm">{ob.owner}</span>
                          <span className="text-gray-500 text-sm">must</span>
                          <span className="font-medium text-gray-900 text-sm">{ob.action}</span>
                        </div>
                        
                        {(ob.condition_or_event || ob.implicit_time_rule_or_null || ob.explicit_deadline_or_null) && (
                          <div className="mt-2 text-xs grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-600">
                            {ob.condition_or_event && (
                              <div><span className="font-semibold text-gray-700">Trigger:</span> {ob.condition_or_event}</div>
                            )}
                            {ob.explicit_deadline_or_null && (
                              <div><span className="font-semibold text-gray-700">Deadline:</span> {ob.explicit_deadline_or_null}</div>
                            )}
                            {ob.implicit_time_rule_or_null && (
                              <div><span className="font-semibold text-blue-700">Time Rule:</span> {ob.implicit_time_rule_or_null}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
