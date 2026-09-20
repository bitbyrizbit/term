"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ContractNav({ contractId }: { contractId: string }) {
  const pathname = usePathname();
  
  const links = [
    { name: "Document", path: `/contracts/${contractId}` },
    { name: "Graph", path: `/contracts/${contractId}/graph` },
    { name: "Command Center", path: `/contracts/${contractId}/obligations` },
    { name: "Simulator", path: `/contracts/${contractId}/simulate` },
    { name: "Q&A", path: `/contracts/${contractId}/ask` },
    { name: "Diff", path: `/contracts/${contractId}/diff` },
    { name: "Risk Radar", path: `/contracts/${contractId}/risk` },
  ];

  return (
    <div className="flex flex-wrap gap-4 items-center mb-6 border-b pb-4">
      {links.map(l => (
        <Link 
          key={l.name} 
          href={l.path} 
          className={`text-sm font-semibold hover:underline ${pathname === l.path ? 'text-indigo-600 border-b-2 border-indigo-600 pb-4 -mb-[18px]' : 'text-gray-500'}`}
        >
          {l.name}
        </Link>
      ))}
    </div>
  );
}
