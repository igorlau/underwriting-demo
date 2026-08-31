import type { Risk } from '@uw/types';
import { SOURCES } from './evidence';

/** Risk register, keyed by deal. Each risk carries sources and mitigants. */
export const RISKS: Record<string, Risk[]> = {
  'deal-acme': [
    {
      id: 'risk-acme-leverage',
      dealId: 'deal-acme',
      title: 'High leverage',
      severity: 'high',
      category: 'structural',
      explanation:
        'The proposed transaction results in 5.0x net leverage at close, leaving 0.5x of headroom to the 5.5x maximum net leverage covenant. Quality of earnings work disallowed $2.1M of management add-backs, which raises entry leverage roughly 0.3x above the sponsor’s model, and elevated working capital is absorbing cash that would otherwise support deleveraging. On our base case a 9% decline in EBITDA would breach the opening covenant level before the first step-down.',
      evidence: [SOURCES.modelDebt, SOURCES.qoeBridge],
      mitigants: [
        {
          id: 'mit-acme-lev-1',
          description:
            'First-lien security over substantially all assets, with a 100% equity pledge of the borrower and each material subsidiary.',
          status: 'in-place',
        },
        {
          id: 'mit-acme-lev-2',
          description:
            'Quarterly net leverage testing with contractual step-downs to 4.75x by FY2030, tightening as the credit deleverages.',
          status: 'proposed',
        },
        {
          id: 'mit-acme-lev-3',
          description:
            '50% excess cash flow sweep, stepping down to 25% once net leverage is sustained below 4.00x.',
          status: 'proposed',
        },
      ],
      linkedFindingIds: ['find-acme-fin-nwc'],
    },
    {
      id: 'risk-acme-concentration',
      dealId: 'deal-acme',
      title: 'Customer concentration',
      severity: 'medium',
      category: 'commercial',
      explanation:
        'The top three customers represent approximately 47% of LTM revenue, with the largest at 22%. The master supply agreement governing that relationship contains a change-of-control termination right which legal diligence has not yet cleared. Loss of the largest customer would reduce EBITDA by an estimated $8–10M, taking pro forma net leverage above 6.0x.',
      evidence: [SOURCES.cddCustomers, SOURCES.legalContracts],
      mitigants: [
        {
          id: 'mit-acme-conc-1',
          description:
            'Average top-ten customer tenure of 11 years, with no top-ten customer lost in the last five years.',
          status: 'in-place',
        },
        {
          id: 'mit-acme-conc-2',
          description:
            'Contracted backlog of $148M covering approximately 71% of FY2027 budgeted revenue.',
          status: 'in-place',
        },
        {
          id: 'mit-acme-conc-3',
          description:
            'Condition precedent to funding: written confirmation that the transaction does not trigger the Customer A change-of-control right.',
          status: 'proposed',
        },
      ],
      linkedFindingIds: ['find-acme-com-concentration', 'find-acme-leg-coc'],
    },
    {
      id: 'risk-acme-refi',
      dealId: 'deal-acme',
      title: 'Refinancing risk',
      severity: 'medium',
      category: 'financial',
      explanation:
        '$62M of the borrower’s existing senior notes mature in March 2029, approximately two and a half years inside the proposed five-year facility. Addressing that maturity will depend on capital markets conditions and on the credit having deleveraged materially by then; absent that, the borrower faces a maturity wall while our facility remains outstanding.',
      evidence: [SOURCES.modelDebt, SOURCES.auditedNote9],
      mitigants: [
        {
          id: 'mit-acme-refi-1',
          description:
            'Springing maturity 91 days ahead of the 2029 notes, accelerating our facility if that maturity is not addressed.',
          status: 'proposed',
        },
        {
          id: 'mit-acme-refi-2',
          description:
            'Cash flow sweep and covenant step-downs target net leverage below 4.0x by FY2029, supporting a refinancing on ordinary terms.',
          status: 'proposed',
        },
        {
          id: 'mit-acme-refi-3',
          description:
            'Mandatory prepayment from asset sale, insurance and debt issuance proceeds outside a limited basket.',
          status: 'proposed',
        },
      ],
      linkedFindingIds: ['find-acme-fin-nwc'],
    },
  ],

  'deal-falcon': [
    {
      id: 'risk-falcon-reimbursement',
      dealId: 'deal-falcon',
      title: 'Reimbursement rate exposure',
      severity: 'medium',
      category: 'commercial',
      explanation:
        'Approximately 38% of revenue is tied to government reimbursement schedules subject to annual revision. A 200bp adverse rate movement would reduce EBITDA by roughly $2.6M.',
      evidence: [SOURCES.cddCustomers],
      mitigants: [
        {
          id: 'mit-falcon-1',
          description:
            'Commercial payer mix has shifted from 54% to 62% of revenue over three years.',
          status: 'in-place',
        },
      ],
      linkedFindingIds: [],
    },
    {
      id: 'risk-falcon-integration',
      dealId: 'deal-falcon',
      title: 'Acquisition integration',
      severity: 'medium',
      category: 'management',
      explanation:
        'Three clinic acquisitions completed in 2025 remain on separate billing systems, with $1.8M of run-rate synergies not yet realised.',
      evidence: [SOURCES.orgChart],
      mitigants: [
        {
          id: 'mit-falcon-2',
          description: 'Synergies are excluded from covenant EBITDA until realised and certified.',
          status: 'proposed',
        },
      ],
      linkedFindingIds: [],
    },
  ],

  'deal-apollo': [
    {
      id: 'risk-apollo-churn',
      dealId: 'deal-apollo',
      title: 'SMB segment churn',
      severity: 'low',
      category: 'commercial',
      explanation:
        'Gross logo churn in the sub-$25k ARR cohort runs at 14% annually, against 3% in the enterprise cohort. The segment represents 11% of ARR.',
      evidence: [SOURCES.cddCustomers],
      mitigants: [
        {
          id: 'mit-apollo-1',
          description:
            'Net revenue retention of 112% across the enterprise cohort, which is 89% of ARR.',
          status: 'in-place',
        },
      ],
      linkedFindingIds: [],
    },
    {
      id: 'risk-apollo-revrec',
      dealId: 'deal-apollo',
      title: 'Deferred revenue treatment',
      severity: 'low',
      category: 'financial',
      explanation:
        'Multi-year contracts billed annually in advance create a $31M deferred revenue balance; covenant EBITDA is defined on a recognised rather than billed basis.',
      evidence: [SOURCES.qoeBridge],
      mitigants: [
        {
          id: 'mit-apollo-2',
          description:
            'Definition confirmed in the credit agreement with the auditor’s concurrence.',
          status: 'in-place',
        },
      ],
      linkedFindingIds: [],
    },
  ],
};
