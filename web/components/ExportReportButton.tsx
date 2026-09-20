"use client";

import { Download } from "lucide-react";

export default function ExportReportButton({ contractId }: { contractId: string }) {
  
  const handleDownload = () => {
    // Triggers standard browser download for the PDF endpoint
    window.open(`http://127.0.0.1:8000/contracts/${contractId}/risk/report`, '_blank');
  };

  return (
    <button 
      onClick={handleDownload}
      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 text-sm font-semibold"
    >
      <Download size={16} />
      Export Risk PDF
    </button>
  );
}
