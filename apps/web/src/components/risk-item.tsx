import type { Finding, Risk } from '@uw/types';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { useId, useState } from 'react';
import { cn } from '@/lib/utils';
import { EvidenceList } from './evidence';
import { MetaChip, SeverityBadge } from './indicators';

const CATEGORY_LABEL: Record<Risk['category'], string> = {
  financial: 'Financial',
  commercial: 'Commercial',
  legal: 'Legal',
  management: 'Management',
  structural: 'Structural',
};

/**
 * A risk register entry. Collapsed it answers "how bad and what kind"; expanded
 * it gives the reasoning, the sources behind it, and what protects the lender.
 */
export function RiskItem({
  risk,
  findings = [],
  defaultOpen = false,
}: {
  risk: Risk;
  /** Diligence findings that surfaced this risk, if loaded. */
  findings?: Finding[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const linked = findings.filter((f) => risk.linkedFindingIds.includes(f.id));

  return (
    <article className="border-b border-border last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-sunken"
        >
          <ChevronRight
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform',
              open && 'rotate-90',
            )}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1 text-[13px] font-semibold">{risk.title}</span>
          <MetaChip className="hidden sm:inline-flex">{CATEGORY_LABEL[risk.category]}</MetaChip>
          <SeverityBadge severity={risk.severity} label="severity" />
        </button>
      </h3>

      {open ? (
        <div
          id={panelId}
          className="space-y-4 border-t border-border bg-surface-sunken px-4 py-3.5"
        >
          <div>
            <div className="label-micro mb-1.5">Assessment</div>
            <p className="max-w-3xl text-[13px] leading-relaxed text-foreground/90">
              {risk.explanation}
            </p>
          </div>

          <EvidenceList sources={risk.evidence} />

          <div>
            <div className="label-micro mb-1.5">Mitigants</div>
            <ul className="space-y-1.5">
              {risk.mitigants.map((mitigant) => (
                <li key={mitigant.id} className="flex items-start gap-2">
                  <ShieldCheck
                    className="mt-0.5 size-3.5 shrink-0 text-positive"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="text-[13px] leading-relaxed text-foreground/90">
                    {mitigant.description}
                    <span
                      className={cn(
                        'ml-1.5 align-[1px] text-[10px] font-medium uppercase tracking-[0.06em]',
                        mitigant.status === 'in-place' ? 'text-positive' : 'text-muted-foreground',
                      )}
                    >
                      {mitigant.status === 'in-place' ? 'In place' : 'Proposed'}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {linked.length > 0 ? (
            <div>
              <div className="label-micro mb-1.5">Raised by diligence</div>
              <ul className="space-y-1">
                {linked.map((finding) => (
                  <li key={finding.id} className="text-[13px] text-muted-foreground">
                    <span className="text-foreground/80">{CATEGORY_LABEL[finding.category]}</span>
                    <span className="mx-1.5 text-border-strong">/</span>
                    {finding.title}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
