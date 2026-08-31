import type { DiligenceItem } from '@uw/types';
import { SOURCES } from './evidence';

/** Diligence workstreams, keyed by deal. Only ACME is developed in full. */
export const DILIGENCE: Record<string, DiligenceItem[]> = {
  'deal-acme': [
    {
      id: 'dd-acme-financial',
      dealId: 'deal-acme',
      category: 'financial',
      label: 'Financial',
      status: 'complete',
      owner: 'M. Reyes',
      provider: 'Ashford & Vance LLP — Quality of Earnings',
      updatedAt: '2026-07-22',
      summary:
        'Quality of earnings supports a $40.0M adjusted EBITDA after disallowing $2.1M of management add-backs. Working capital is the principal area of focus.',
      openItems: [],
      findings: [
        {
          id: 'find-acme-fin-nwc',
          category: 'financial',
          title: 'Working capital requirements have increased materially over the last three years',
          detail:
            'Net working capital rose from 14.2% to 19.6% of revenue between FY2023 and FY2026, driven by an inventory build ahead of the Midwest facility consolidation. The increase absorbed approximately $11M of cash over the period and reduces free cash flow conversion to 61% of EBITDA.',
          severity: 'medium',
          evidence: SOURCES.qoeNwc,
          linkedRiskIds: ['risk-acme-leverage', 'risk-acme-refi'],
        },
      ],
    },
    {
      id: 'dd-acme-commercial',
      dealId: 'deal-acme',
      category: 'commercial',
      label: 'Commercial',
      status: 'complete',
      owner: 'D. Okafor',
      provider: 'Northline Advisory — Commercial Due Diligence',
      updatedAt: '2026-07-30',
      summary:
        'End-market demand is stable and backlog supports the FY2027 plan. Concentration with three OEM customers is the principal commercial exposure.',
      openItems: [],
      findings: [
        {
          id: 'find-acme-com-concentration',
          category: 'commercial',
          title: 'The top three customers represent approximately 47% of revenue',
          detail:
            'The largest customer accounts for 22% of LTM revenue, with the second and third at 15% and 10%. Relationships average 11 years and no top-ten customer has been lost in five years, but none of the agreements is exclusive and pricing resets annually.',
          severity: 'high',
          evidence: SOURCES.cddCustomers,
          linkedRiskIds: ['risk-acme-concentration'],
        },
      ],
    },
    {
      id: 'dd-acme-legal',
      dealId: 'deal-acme',
      category: 'legal',
      label: 'Legal',
      status: 'in-review',
      owner: 'A. Lindqvist',
      provider: 'Harrow & Bell LLP',
      updatedAt: '2026-08-18',
      summary:
        'No material litigation identified. One customer contract contains a change-of-control provision requiring further review before sign-off.',
      openItems: [
        'Confirm change-of-control treatment under the Customer A master supply agreement',
        'Receive final lien search results for two acquired entities (Illinois, Texas)',
      ],
      findings: [
        {
          id: 'find-acme-leg-coc',
          category: 'legal',
          title: 'One material contract requires additional legal review',
          detail:
            'The master supply agreement with Customer A, representing 22% of revenue, contains a change-of-control termination right exercisable on 90 days’ notice. Counsel is confirming whether the contemplated structure triggers the provision and whether a consent or waiver is required at close.',
          severity: 'high',
          evidence: SOURCES.legalContracts,
          linkedRiskIds: ['risk-acme-concentration'],
        },
      ],
    },
    {
      id: 'dd-acme-management',
      dealId: 'deal-acme',
      category: 'management',
      label: 'Management',
      status: 'complete',
      owner: 'M. Reyes',
      provider: 'Internal — Deal Team',
      updatedAt: '2026-08-05',
      summary:
        'Experienced team with prior sponsor-backed experience and no material concerns identified across the executive group.',
      openItems: [],
      findings: [
        {
          id: 'find-acme-mgmt-team',
          category: 'management',
          title: 'Experienced management team with no material concerns identified',
          detail:
            'The CEO has 14 years at ACME, seven as chief executive, and previously led two sponsor-backed businesses to exit. Background and reference checks returned no adverse findings across the five-person executive team.',
          severity: 'low',
          evidence: SOURCES.mgmtRefs,
          linkedRiskIds: [],
        },
      ],
    },
  ],
};
