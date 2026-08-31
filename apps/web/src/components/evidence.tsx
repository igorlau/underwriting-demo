import type { EvidenceRef } from '@uw/types';
import { FileSpreadsheet, FileText, FolderOpen, Scale } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const ICON_BY_TYPE = {
  model: FileSpreadsheet,
  financials: FileSpreadsheet,
  contract: Scale,
  report: FileText,
  memo: FileText,
  'data-room': FolderOpen,
} as const;

/**
 * A citation back to the underlying artifact. Every generated or synthesised
 * claim in the product carries one, so nothing reads as an unsupported
 * assertion.
 */
export function EvidenceChip({ source, className }: { source: EvidenceRef; className?: string }) {
  const Icon = ICON_BY_TYPE[source.documentType];
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-sm border border-border bg-surface-sunken px-1.5 py-1 text-[11px] leading-tight text-muted-foreground',
        className,
      )}
      title={`${source.documentName}, ${source.locator} — dated ${formatDate(source.asOf)}`}
    >
      <Icon className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="truncate text-foreground/85">{source.documentName}</span>
      <span className="shrink-0 border-l border-border pl-1.5 tnum">{source.locator}</span>
    </span>
  );
}

export function EvidenceList({
  sources,
  label = 'Evidence',
  className,
}: {
  sources: EvidenceRef[];
  label?: string;
  className?: string;
}) {
  if (sources.length === 0) return null;
  return (
    <div className={className}>
      <div className="label-micro mb-1.5">{label}</div>
      <ul className="flex flex-wrap gap-1.5">
        {sources.map((source) => (
          <li key={source.id} className="min-w-0">
            <EvidenceChip source={source} />
          </li>
        ))}
      </ul>
    </div>
  );
}
