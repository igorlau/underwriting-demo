import type { Security } from '@uw/types';

/** Proposed structures, keyed by deal. Only ACME is developed in full. */
export const SECURITIES: Record<string, Security> = {
  'deal-acme': {
    id: 'sec-acme-tl',
    dealId: 'deal-acme',
    name: 'Senior Secured Term Loan',
    instrument: 'Senior Secured Term Loan',
    principal: 100_000_000,
    benchmark: 'SOFR',
    spread: 0.06,
    floor: 0.01,
    oid: 0.02,
    maturityYears: 5,
    amortization: 0.02,
    lien: 'First lien',
    collateral: [
      'First-priority lien over substantially all assets of the borrower and guarantors',
      '100% equity pledge of the borrower and each material domestic subsidiary',
      'Perfected security over accounts receivable, inventory and intellectual property',
    ],
    guarantors:
      'Parent and all material domestic subsidiaries, representing not less than 95% of consolidated EBITDA',
    callProtection: 'Non-call 1 year, thereafter 102 / 101 / par',
    covenants: [
      {
        id: 'cov-acme-leverage',
        name: 'Maximum Net Leverage',
        direction: 'maximum',
        threshold: 5.5,
        current: 5.0,
        headroom: 0.5,
        unit: 'x',
        status: 'within-limit',
        testFrequency: 'Tested quarterly, commencing 31 Dec 2026',
        description:
          'Consolidated net debt to covenant EBITDA, tested on a trailing twelve-month basis with a 25% cap on acquisition-related add-backs.',
        schedule: [
          { period: 'FY2027', threshold: 5.5 },
          { period: 'FY2028', threshold: 5.25 },
          { period: 'FY2029', threshold: 5.0 },
          { period: 'FY2030', threshold: 4.75 },
        ],
      },
      {
        id: 'cov-acme-coverage',
        name: 'Minimum Interest Coverage',
        direction: 'minimum',
        threshold: 2.0,
        current: 2.1,
        headroom: 0.1,
        unit: 'x',
        status: 'within-limit',
        testFrequency: 'Tested quarterly, commencing 31 Dec 2026',
        description:
          'Covenant EBITDA to consolidated cash interest expense. Headroom is thin at close and is the covenant most exposed to a further rise in base rates.',
      },
      {
        id: 'cov-acme-capex',
        name: 'Maximum Capital Expenditure',
        direction: 'maximum',
        threshold: 12_000_000,
        current: 9_400_000,
        headroom: 2_600_000,
        unit: 'usd',
        status: 'within-limit',
        testFrequency: 'Tested annually',
        description:
          'Annual capital expenditure limit with a 50% carry-forward of unused amounts into the following year.',
      },
    ],
  },
};
