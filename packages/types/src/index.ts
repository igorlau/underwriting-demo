/**
 * Shared domain contracts for the underwriting workspace.
 *
 * These types are the boundary between the UI and whatever serves the data.
 * Today that is a local deterministic mock; later it is expected to be a
 * NestJS API in `apps/api`. Nothing in here may depend on React or on the
 * mock implementation.
 *
 * Convention: monetary values are absolute USD (not millions), rates are
 * decimal fractions (0.06 === 6.00%), and multiples are plain numbers
 * (5.0 === 5.0x). Formatting is strictly a UI concern.
 */

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export type Severity = 'low' | 'medium' | 'high';

export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * A pointer back to the underwriting artifact a claim came from. Every risk
 * and every diligence finding carries one so that nothing shown in the product
 * reads as an unsourced assertion.
 */
export interface EvidenceRef {
  id: string;
  /** e.g. "Financial Model — Debt Schedule" */
  documentName: string;
  /** e.g. "p. 14", "Tab: Covenants", "Section 4.2" */
  locator: string;
  documentType: 'model' | 'financials' | 'contract' | 'report' | 'memo' | 'data-room';
  /** ISO date the source artifact is dated. */
  asOf: string;
}

// ---------------------------------------------------------------------------
// Deal
// ---------------------------------------------------------------------------

export type DealStage = 'deal' | 'securities' | 'diligence' | 'ic-memo';

/** Canonical left-to-right order of the underwriting process. */
export const DEAL_STAGES: readonly DealStage[] = ['deal', 'securities', 'diligence', 'ic-memo'];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  deal: 'Deal',
  securities: 'Securities',
  diligence: 'Due Diligence',
  'ic-memo': 'IC Memo',
};

/** Abbreviated forms for the compact pipeline rail, where width is scarce. */
export const DEAL_STAGE_SHORT_LABELS: Record<DealStage, string> = {
  deal: 'Deal',
  securities: 'Securities',
  diligence: 'Diligence',
  'ic-memo': 'IC memo',
};

export type TransactionType =
  | 'Senior Secured Term Loan'
  | 'Unitranche'
  | 'Senior Secured Loan'
  | 'Second Lien Term Loan';

/** Row-level shape used by the pipeline. Cheap to list, safe to page. */
export interface Deal {
  id: string;
  borrowerName: string;
  transactionType: TransactionType;
  /** Proposed facility size, absolute USD. */
  amount: number;
  stage: DealStage;
  riskLevel: RiskLevel;
  sector: string;
  sponsor: string;
  /** Deal lead / originator initials shown in the pipeline. */
  leadInitials: string;
  /** ISO date of the last material update. */
  updatedAt: string;
  /** Short operator-facing reason this deal may need attention. */
  attentionFlag?: string;
}

/** Everything the deal workspace needs, fetched per-deal. */
export interface DealDetail extends Deal {
  transaction: TransactionSummary;
  borrower: BorrowerProfile;
  financials: FinancialMetrics;
  risks: Risk[];
  diligenceSummary: DiligenceCategorySummary[];
}

export interface TransactionSummary {
  borrowerName: string;
  facilityAmount: number;
  instrument: TransactionType;
  /** Maturity expressed in years from close. */
  maturityYears: number;
  useOfProceeds: string;
  closeTargetDate: string;
}

export interface BorrowerProfile {
  legalName: string;
  description: string;
  headquarters: string;
  founded: number;
  employees: number;
  sector: string;
  sponsor: string;
}

// ---------------------------------------------------------------------------
// Financials
// ---------------------------------------------------------------------------

export interface FinancialMetrics {
  /** ISO date the figures are stated as of (e.g. LTM close). */
  asOf: string;
  periodLabel: string;
  revenue: number;
  ebitda: number;
  netDebt: number;
  /** Net debt / EBITDA. */
  netLeverage: number;
  /** EBITDA / cash interest expense. */
  interestCoverage: number;
  ebitdaMargin: number;
  /** Prior-period comparatives, used for trend indicators. */
  priorYear?: {
    revenue: number;
    ebitda: number;
    netLeverage: number;
  };
}

// ---------------------------------------------------------------------------
// Security / structure
// ---------------------------------------------------------------------------

export type LienPosition = 'First lien' | 'Second lien' | 'Unsecured';

export interface Security {
  id: string;
  dealId: string;
  name: string;
  instrument: TransactionType;
  principal: number;
  /** Reference rate the spread is quoted over. */
  benchmark: 'SOFR' | 'EURIBOR';
  /** Decimal fraction over the benchmark (0.06 === +6.00%). */
  spread: number;
  maturityYears: number;
  /** Annual amortization as a decimal fraction of principal. */
  amortization: number;
  lien: LienPosition;
  covenants: Covenant[];
}

export type CovenantStatus = 'within-limit' | 'tight' | 'breached';

export type CovenantDirection = 'maximum' | 'minimum';

export interface Covenant {
  id: string;
  name: string;
  /** `maximum` = current must sit below threshold; `minimum` = above. */
  direction: CovenantDirection;
  threshold: number;
  current: number;
  /** Always signed so that positive === favourable headroom. */
  headroom: number;
  unit: 'x' | '%';
  status: CovenantStatus;
  testFrequency: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Due diligence
// ---------------------------------------------------------------------------

export type DiligenceCategory = 'financial' | 'commercial' | 'legal' | 'management';

export type DiligenceStatus = 'complete' | 'in-review' | 'not-started';

export const DILIGENCE_STATUS_LABELS: Record<DiligenceStatus, string> = {
  complete: 'Complete',
  'in-review': 'In Review',
  'not-started': 'Not Started',
};

/** Compact per-category view used on the deal overview. */
export interface DiligenceCategorySummary {
  category: DiligenceCategory;
  label: string;
  status: DiligenceStatus;
  findingCount: number;
  openItemCount: number;
}

export interface DiligenceItem {
  id: string;
  dealId: string;
  category: DiligenceCategory;
  label: string;
  status: DiligenceStatus;
  owner: string;
  provider: string;
  updatedAt: string;
  /** One-line synthesis of the workstream conclusion. */
  summary: string;
  findings: Finding[];
  /** Outstanding requests blocking sign-off, if any. */
  openItems: string[];
}

export interface Finding {
  id: string;
  category: DiligenceCategory;
  title: string;
  detail: string;
  severity: Severity;
  evidence: EvidenceRef;
  /** Risks this finding feeds, linking diligence to the risk register. */
  linkedRiskIds: string[];
}

// ---------------------------------------------------------------------------
// Risk register
// ---------------------------------------------------------------------------

export interface Mitigant {
  id: string;
  description: string;
  /** Whether the protection is already documented or still to be negotiated. */
  status: 'in-place' | 'proposed';
}

export interface Risk {
  id: string;
  dealId: string;
  title: string;
  severity: Severity;
  category: DiligenceCategory | 'structural';
  /** Plain-language explanation of why this is a risk for this credit. */
  explanation: string;
  evidence: EvidenceRef[];
  mitigants: Mitigant[];
  /** Findings that surfaced or corroborate this risk. */
  linkedFindingIds: string[];
}

// ---------------------------------------------------------------------------
// IC memo
// ---------------------------------------------------------------------------

export type ICMemoSectionId =
  | 'executive-summary'
  | 'transaction-overview'
  | 'borrower-overview'
  | 'credit-thesis'
  | 'key-risks-mitigants'
  | 'proposed-structure'
  | 'recommendation';

export interface ICMemoSection {
  id: ICMemoSectionId;
  title: string;
  /** Paragraphs of prose. */
  body: string[];
  /** Optional key-value block rendered as a term table. */
  terms?: { label: string; value: string }[];
  /** Optional bulleted points. */
  bullets?: string[];
  /** Optional risk/mitigant pairs, used by the risks section. */
  riskBlocks?: { title: string; severity: Severity; body: string; mitigant: string }[];
  /** Underwriting artifacts this section was synthesised from. */
  sources: EvidenceRef[];
}

export type ICRecommendation = 'approve' | 'approve-with-conditions' | 'decline';

export interface ICMemo {
  id: string;
  dealId: string;
  title: string;
  version: number;
  generatedAt: string;
  /** Who is accountable for the memo — the AI drafts, a human owns it. */
  preparedBy: string;
  recommendation: ICRecommendation;
  recommendationSummary: string;
  conditions: string[];
  sections: ICMemoSection[];
  /** Inputs the generation drew on, surfaced pre- and post-generation. */
  inputs: MemoInputSummary[];
}

export interface MemoInputSummary {
  id: string;
  label: string;
  detail: string;
  /** Number of underlying records rolled into this input. */
  itemCount: number;
}
