import type { EvidenceRef } from '@uw/types';

/**
 * Catalogue of underwriting artifacts referenced across the deal. Findings,
 * risks and memo sections all point at entries here so that the same source is
 * cited identically everywhere in the product.
 */
export const SOURCES = {
  qoeNwc: {
    id: 'src-qoe-nwc',
    documentName: 'Quality of Earnings Report — Net Working Capital',
    locator: 'p. 42',
    documentType: 'report',
    asOf: '2026-07-22',
  },
  qoeBridge: {
    id: 'src-qoe-bridge',
    documentName: 'Quality of Earnings Report — EBITDA Bridge',
    locator: 'Exhibit 2, p. 18',
    documentType: 'report',
    asOf: '2026-07-22',
  },
  modelDebt: {
    id: 'src-model-debt',
    documentName: 'Financial Model — Debt Schedule',
    locator: 'p. 14',
    documentType: 'model',
    asOf: '2026-08-21',
  },
  modelCovenant: {
    id: 'src-model-covenant',
    documentName: 'Financial Model — Covenant Compliance',
    locator: 'Tab: Covenants',
    documentType: 'model',
    asOf: '2026-08-21',
  },
  cddCustomers: {
    id: 'src-cdd-customers',
    documentName: 'Commercial DD Report — Customer Revenue Analysis',
    locator: 'p. 27',
    documentType: 'report',
    asOf: '2026-07-30',
  },
  backlog: {
    id: 'src-dataroom-backlog',
    documentName: 'Data Room — Contracted Backlog Schedule',
    locator: 'File 4.2.1',
    documentType: 'data-room',
    asOf: '2026-07-31',
  },
  legalContracts: {
    id: 'src-legal-contracts',
    documentName: 'Legal DD Report — Material Contracts',
    locator: '§4.2',
    documentType: 'report',
    asOf: '2026-08-18',
  },
  legalSearches: {
    id: 'src-legal-searches',
    documentName: 'Legal DD Report — Lien & Litigation Searches',
    locator: '§6.1',
    documentType: 'report',
    asOf: '2026-08-18',
  },
  mgmtRefs: {
    id: 'src-mgmt-refs',
    documentName: 'Management Reference & Background Report',
    locator: 'p. 6',
    documentType: 'report',
    asOf: '2026-08-05',
  },
  orgChart: {
    id: 'src-dataroom-org',
    documentName: 'Data Room — Organisation Chart & Executive Bios',
    locator: 'File 2.1.4',
    documentType: 'data-room',
    asOf: '2026-06-30',
  },
  auditedNote9: {
    id: 'src-audited-note9',
    documentName: 'Audited Financial Statements FY2025 — Note 9, Long-Term Debt',
    locator: 'p. 61',
    documentType: 'financials',
    asOf: '2026-03-14',
  },
  termSheet: {
    id: 'src-term-sheet',
    documentName: 'Indicative Term Sheet — Facilities & Covenants',
    locator: '§2–§4',
    documentType: 'contract',
    asOf: '2026-08-25',
  },
} satisfies Record<string, EvidenceRef>;
