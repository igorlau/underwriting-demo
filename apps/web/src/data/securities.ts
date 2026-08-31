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
    maturityYears: 5,
    amortization: 0.02,
    lien: 'First lien',
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
    ],
  },
};
