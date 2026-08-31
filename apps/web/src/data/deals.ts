import type { Deal, DealDetail } from '@uw/types';

/**
 * Pipeline rows. ACME is developed end-to-end; Falcon and Apollo exist to make
 * the pipeline read realistically and to exercise the stage and risk states.
 */
export const DEALS: Deal[] = [
  {
    id: 'deal-acme',
    borrowerName: 'ACME Inc.',
    transactionType: 'Senior Secured Term Loan',
    amount: 100_000_000,
    stage: 'diligence',
    riskLevel: 'high',
    sector: 'Industrial Manufacturing',
    sponsor: 'Kestrel Capital Partners',
    leadInitials: 'M.R.',
    updatedAt: '2026-08-28',
    attentionFlag: 'Legal diligence open — change-of-control review',
  },
  {
    id: 'deal-falcon',
    borrowerName: 'Falcon Corp.',
    transactionType: 'Unitranche',
    amount: 75_000_000,
    stage: 'securities',
    riskLevel: 'medium',
    sector: 'Healthcare Services',
    sponsor: 'Bridgeport Equity',
    leadInitials: 'J.T.',
    updatedAt: '2026-08-26',
    attentionFlag: 'Awaiting revised sponsor model',
  },
  {
    id: 'deal-apollo',
    borrowerName: 'Apollo LLC',
    transactionType: 'Senior Secured Loan',
    amount: 150_000_000,
    stage: 'ic-memo',
    riskLevel: 'low',
    sector: 'Software & Data',
    sponsor: 'Verity Partners',
    leadInitials: 'S.K.',
    updatedAt: '2026-08-29',
  },
];

const byId = (id: string) => DEALS.find((d) => d.id === id)!;

/** Per-deal workspace payload. Risks are attached by the service layer. */
export const DEAL_DETAILS: Record<string, Omit<DealDetail, 'risks'>> = {
  'deal-acme': {
    ...byId('deal-acme'),
    transaction: {
      borrowerName: 'ACME Inc.',
      facilityAmount: 100_000_000,
      instrument: 'Senior Secured Term Loan',
      maturityYears: 5,
      useOfProceeds:
        'Refinance $82M of existing senior debt, fund the $12M acquisition of a regional distributor, and pay transaction fees and expenses.',
      closeTargetDate: '2026-10-15',
    },
    borrower: {
      legalName: 'ACME Industrial Holdings, Inc.',
      description:
        'Designs and manufactures precision flow-control components for industrial and municipal water infrastructure, sold through a direct sales force and a national distributor network.',
      headquarters: 'Columbus, Ohio',
      founded: 1998,
      employees: 1240,
      sector: 'Industrial Manufacturing',
      sponsor: 'Kestrel Capital Partners',
    },
    financials: {
      asOf: '2026-06-30',
      periodLabel: 'LTM 30 Jun 2026',
      revenue: 200_000_000,
      ebitda: 40_000_000,
      netDebt: 200_000_000,
      netLeverage: 5.0,
      interestCoverage: 2.1,
      ebitdaMargin: 0.2,
      priorYear: {
        revenue: 182_000_000,
        ebitda: 36_400_000,
        netLeverage: 5.4,
      },
    },
    diligenceSummary: [
      {
        category: 'financial',
        label: 'Financial',
        status: 'complete',
        findingCount: 2,
        openItemCount: 0,
      },
      {
        category: 'commercial',
        label: 'Commercial',
        status: 'complete',
        findingCount: 2,
        openItemCount: 0,
      },
      { category: 'legal', label: 'Legal', status: 'in-review', findingCount: 1, openItemCount: 2 },
      {
        category: 'management',
        label: 'Management',
        status: 'complete',
        findingCount: 2,
        openItemCount: 0,
      },
    ],
  },

  'deal-falcon': {
    ...byId('deal-falcon'),
    transaction: {
      borrowerName: 'Falcon Corp.',
      facilityAmount: 75_000_000,
      instrument: 'Unitranche',
      maturityYears: 6,
      useOfProceeds:
        'Fund the acquisition of a four-site outpatient platform and refinance $34M of existing bank debt.',
      closeTargetDate: '2026-11-30',
    },
    borrower: {
      legalName: 'Falcon Health Partners, LLC',
      description:
        'Operates 26 outpatient rehabilitation and occupational health clinics across the Southeast under a single clinical brand.',
      headquarters: 'Charlotte, North Carolina',
      founded: 2009,
      employees: 780,
      sector: 'Healthcare Services',
      sponsor: 'Bridgeport Equity',
    },
    financials: {
      asOf: '2026-06-30',
      periodLabel: 'LTM 30 Jun 2026',
      revenue: 128_000_000,
      ebitda: 22_400_000,
      netDebt: 105_000_000,
      netLeverage: 4.7,
      interestCoverage: 2.4,
      ebitdaMargin: 0.175,
      priorYear: {
        revenue: 112_000_000,
        ebitda: 18_800_000,
        netLeverage: 5.1,
      },
    },
    diligenceSummary: [
      {
        category: 'financial',
        label: 'Financial',
        status: 'in-review',
        findingCount: 0,
        openItemCount: 3,
      },
      {
        category: 'commercial',
        label: 'Commercial',
        status: 'complete',
        findingCount: 0,
        openItemCount: 0,
      },
      {
        category: 'legal',
        label: 'Legal',
        status: 'not-started',
        findingCount: 0,
        openItemCount: 0,
      },
      {
        category: 'management',
        label: 'Management',
        status: 'in-review',
        findingCount: 0,
        openItemCount: 1,
      },
    ],
  },

  'deal-apollo': {
    ...byId('deal-apollo'),
    transaction: {
      borrowerName: 'Apollo LLC',
      facilityAmount: 150_000_000,
      instrument: 'Senior Secured Loan',
      maturityYears: 5,
      useOfProceeds:
        'Support the sponsor’s acquisition of the business alongside $190M of common equity, and fund transaction expenses.',
      closeTargetDate: '2026-09-30',
    },
    borrower: {
      legalName: 'Apollo Data Systems, LLC',
      description:
        'Provides subscription workflow and compliance software to mid-market insurance carriers, with 94% recurring revenue.',
      headquarters: 'Austin, Texas',
      founded: 2012,
      employees: 610,
      sector: 'Software & Data',
      sponsor: 'Verity Partners',
    },
    financials: {
      asOf: '2026-06-30',
      periodLabel: 'LTM 30 Jun 2026',
      revenue: 186_000_000,
      ebitda: 58_000_000,
      netDebt: 150_000_000,
      netLeverage: 2.6,
      interestCoverage: 4.3,
      ebitdaMargin: 0.312,
      priorYear: {
        revenue: 161_000_000,
        ebitda: 47_000_000,
        netLeverage: 3.1,
      },
    },
    diligenceSummary: [
      {
        category: 'financial',
        label: 'Financial',
        status: 'complete',
        findingCount: 0,
        openItemCount: 0,
      },
      {
        category: 'commercial',
        label: 'Commercial',
        status: 'complete',
        findingCount: 0,
        openItemCount: 0,
      },
      { category: 'legal', label: 'Legal', status: 'complete', findingCount: 0, openItemCount: 0 },
      {
        category: 'management',
        label: 'Management',
        status: 'complete',
        findingCount: 0,
        openItemCount: 0,
      },
    ],
  },
};
