import type {
  Deal,
  DealDetail,
  DiligenceItem,
  ICMemo,
  MemoInputSummary,
  Risk,
  Security,
} from '@uw/types';
import { createMockUnderwritingService } from './mock/underwriting.mock';

/**
 * The only data boundary the UI is allowed to reach through. Components call
 * these operations; they never import seed data directly.
 *
 * Today the operations resolve against a deterministic in-memory mock. When
 * `apps/api` exists, swap the single assignment at the bottom of this file for
 * an HTTP-backed implementation of the same interface — no component changes.
 */
export interface UnderwritingService {
  getDeals(): Promise<Deal[]>;
  getDeal(dealId: string): Promise<DealDetail>;
  getSecurity(dealId: string): Promise<Security | null>;
  getDiligence(dealId: string): Promise<DiligenceItem[]>;
  getRisks(dealId: string): Promise<Risk[]>;
  /** Null until a memo has been generated for the deal. */
  getMemo(dealId: string): Promise<ICMemo | null>;
  /** What a memo would be composed from. Null where the deal is out of scope. */
  getMemoInputs(dealId: string): Promise<MemoInputSummary[] | null>;
  generateMemo(dealId: string, options?: GenerateMemoOptions): Promise<ICMemo>;
}

/**
 * Progress events emitted while a memo is composed. A real implementation
 * would surface the same shape from a streaming LLM call.
 */
export interface MemoGenerationProgress {
  index: number;
  total: number;
  label: string;
}

export interface GenerateMemoOptions {
  onProgress?: (progress: MemoGenerationProgress) => void;
  signal?: AbortSignal;
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

/** Raised where a deal exists in the pipeline but is not developed in the prototype. */
export class OutOfPrototypeScopeError extends Error {
  constructor(dealId: string) {
    super(`Deal is not developed in this prototype: ${dealId}`);
    this.name = 'OutOfPrototypeScopeError';
  }
}

export const underwritingService: UnderwritingService = createMockUnderwritingService();
