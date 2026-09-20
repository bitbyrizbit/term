export type ContractStatus = 'active' | 'expiring' | 'breached' | 'draft';

const config: Record<ContractStatus, { label: string; dot: string; text: string }> = {
  active: { label: 'Active', dot: 'bg-moss-500', text: 'text-moss-600' },
  expiring: { label: 'Expiring', dot: 'bg-clay-400', text: 'text-clay-600' },
  breached: { label: 'Breached', dot: 'bg-rust-500', text: 'text-rust-600' },
  draft: { label: 'Draft', dot: 'bg-ink-400', text: 'text-ink-500' },
};

export function StatusBadge({ status }: { status: ContractStatus }) {
  const c = config[status] || config.draft;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <span className={`text-xs font-medium ${c.text}`}>{c.label}</span>
    </span>
  );
}

export function RiskMeter({ score }: { score: number }) {
  const color = score >= 60 ? 'bg-rust-500' : score >= 30 ? 'bg-clay-400' : 'bg-moss-500';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1 bg-ink-200 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs text-ink-500 tabular-nums">{score}</span>
    </div>
  );
}
