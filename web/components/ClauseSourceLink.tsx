"use client";

import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";

interface ClauseSourceLinkProps {
  contractId: string;
  clauseId: string;
}

export default function ClauseSourceLink({ contractId, clauseId }: ClauseSourceLinkProps) {
  // A simple link that routes back to the main document view with an anchor hash
  return (
    <Link
      href={`/contracts/${contractId}#clause-${clauseId}`}
      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
      title="View Source Clause"
    >
      <LinkIcon size={12} />
      <span>Source</span>
    </Link>
  );
}
