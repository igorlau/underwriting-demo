import type { Finding, Risk } from '@uw/types';
import { ChevronDown, ShieldCheck } from 'lucide-react';
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
 * A risk register entry. Collapsed it answers "how bad, and what kind";
 * expanded it gives the reasoning, the sources behind it, and what protects
 * the lender.
 */
export function RiskItem({
  risk,
  findings = [],
  defaultOpen = false,
}: {
  risk: Risk;
  /** Diligence findings that surfaced this risk, where loaded. */
  findings?: Finding[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const linked = findings.filter((f) => risk.linkedFindingIds.includes(f.id));

  return (
    <article className="border-b border-line last:border-b-0">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center gap-3 px-6 py-4 text-left transition-colors hover:bg-surface-2"
        >
          <span className="min-w-0 flex-1 text-[15px] font-semibold">{risk.title}</span>
          <MetaChip className="hidden sm:inline-flex">{CATEGORY_LABEL[risk.category]}</MetaChip>
          <SeverityBadge severity={risk.severity} label="severity" />
          <ChevronDown
            className={cn('size-4 shrink-0 text-ink-3 transition-transform', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
      </h3>

      {open ? (
        <div id={panelId} className="space-y-5 px-6 pb-6">
          <p className="max-w-3xl text-[14.5px] leading-relaxed text-ink-2">{risk.explanation}</p>

          <EvidenceList sources={risk.evidence} />

          <div>
            <div className="label mb-2">Mitigants</div>
            <ul className="space-y-2.5">
              {risk.mitigants.map((mitigant) => (
                <li key={mitigant.id} className="flex items-start gap-2.5">
                  <ShieldCheck
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="text-[14.5px] leading-relaxed">
                    {mitigant.description}{' '}
                    <span
                      className={cn(
                        'text-[13px]',
                        mitigant.status === 'in-place' ? 'text-accent' : 'text-ink-3',
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
              <div className="label mb-2">Raised by diligence</div>
              <ul className="space-y-1.5">
                {linked.map((finding) => (
                  <li key={finding.id} className="text-[14px] text-ink-2">
                    <span className="text-ink">{CATEGORY_LABEL[finding.category]}</span>
                    <span className="mx-2 text-line-strong">/</span>
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
