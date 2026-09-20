"use client";

import { Download } from "lucide-react";
import { API_BASE } from "../lib/api";

export default function ExportReportButton({ contractId, className }: { contractId: string, className?: string }) {
  
  const handleDownload = () => {
    window.open(`${API_BASE}/contracts/${contractId}/risk/report`, '_blank');
  };

  return (
    <button 
      onClick={handleDownload}
      className={className || "btn-primary"}
    >
      <Download className="w-3.5 h-3.5" />
      Export
    </button>
  );
}
