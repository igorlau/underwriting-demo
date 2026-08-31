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
 * A citation back to the underlying artifact. Every synthesised claim in the
 * product carries one, so nothing reads as an unsupported assertion.
 */
export function EvidenceChip({ source, className }: { source: EvidenceRef; className?: string }) {
  const Icon = ICON_BY_TYPE[source.documentType];
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface-2 py-1 pr-3 pl-2.5 text-[13px] text-ink-2',
        className,
      )}
      title={`${source.documentName}, ${source.locator} — dated ${formatDate(source.asOf)}`}
    >
      <Icon className="size-3.5 shrink-0 text-ink-3" aria-hidden="true" />
      <span className="truncate text-ink">{source.documentName}</span>
      <span className="tnum shrink-0 text-ink-3">{source.locator}</span>
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
      <div className="label mb-2">{label}</div>
      <ul className="flex flex-wrap gap-2">
        {sources.map((source) => (
          <li key={source.id} className="min-w-0">
            <EvidenceChip source={source} />
          </li>
        ))}
      </ul>
    </div>
  );
}
