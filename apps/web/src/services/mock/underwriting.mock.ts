import type {
  Deal,
  DealDetail,
  DiligenceItem,
  ICMemo,
  MemoInputSummary,
  Risk,
  Security,
} from '@uw/types';
import { DEAL_DETAILS, DEALS } from '@/data/deals';
import { DILIGENCE } from '@/data/diligence';
import { buildICMemo, buildMemoInputs } from '@/data/memos';
import { RISKS } from '@/data/risks';
import { SECURITIES } from '@/data/securities';
import {
  type GenerateMemoOptions,
  NotFoundError,
  OutOfPrototypeScopeError,
  type UnderwritingService,
} from '../underwriting';

/** Latency budgets, tuned so screens feel fetched rather than instantaneous. */
const LATENCY = { list: 180, detail: 220 };

/** The composition steps surfaced while a memo is drafted. */
const MEMO_STEPS = [
  'Reading deal structure and security terms',
  'Consolidating LTM financials and covenant headroom',
  'Synthesising diligence findings across four workstreams',
  'Assessing key risks against proposed mitigants',
  'Drafting memorandum sections',
] as const;

const STEP_DURATION_MS = 520;

/**
 * Deterministic local implementation. Generated memos are held in memory for
 * the session so that navigating away from the memo and back preserves it —
 * the same behaviour a persisted backend would give.
 */
export function createMockUnderwritingService(): UnderwritingService {
  const memoStore = new Map<string, ICMemo>();

  function requireDetail(dealId: string) {
    const detail = DEAL_DETAILS[dealId];
    if (!detail) throw new NotFoundError('Deal', dealId);
    return detail;
  }

  async function composeMemo(
    dealId: string,
    version: number,
    generatedAt: string,
  ): Promise<ICMemo> {
    const base = requireDetail(dealId);
    const security = SECURITIES[dealId];
    const diligence = DILIGENCE[dealId];
    if (!security || !diligence) throw new OutOfPrototypeScopeError(dealId);
    const risks = RISKS[dealId] ?? [];
    return buildICMemo({
      deal: { ...base, risks },
      security,
      diligence,
      risks,
      version,
      generatedAt,
    });
  }

  return {
    async getDeals(): Promise<Deal[]> {
      await delay(LATENCY.list);
      return structuredClone(DEALS);
    },

    async getDeal(dealId): Promise<DealDetail> {
      await delay(LATENCY.detail);
      const detail = requireDetail(dealId);
      return structuredClone({ ...detail, risks: RISKS[dealId] ?? [] });
    },

    async getSecurity(dealId): Promise<Security | null> {
      await delay(LATENCY.detail);
      requireDetail(dealId);
      return structuredClone(SECURITIES[dealId] ?? null);
    },

    async getDiligence(dealId): Promise<DiligenceItem[]> {
      await delay(LATENCY.detail);
      requireDetail(dealId);
      return structuredClone(DILIGENCE[dealId] ?? []);
    },

    async getRisks(dealId): Promise<Risk[]> {
      await delay(LATENCY.list);
      requireDetail(dealId);
      return structuredClone(RISKS[dealId] ?? []);
    },

    async getMemo(dealId): Promise<ICMemo | null> {
      await delay(LATENCY.detail);
      requireDetail(dealId);
      return structuredClone(memoStore.get(dealId) ?? null);
    },

    async getMemoInputs(dealId): Promise<MemoInputSummary[] | null> {
      await delay(LATENCY.list);
      const base = requireDetail(dealId);
      const security = SECURITIES[dealId];
      const diligence = DILIGENCE[dealId];
      if (!security || !diligence) return null;
      const risks = RISKS[dealId] ?? [];
      return buildMemoInputs({ deal: { ...base, risks }, security, diligence, risks });
    },

    async generateMemo(dealId, options: GenerateMemoOptions = {}): Promise<ICMemo> {
      const { onProgress, signal } = options;
      const nextVersion = (memoStore.get(dealId)?.version ?? 0) + 1;

      for (const [index, label] of MEMO_STEPS.entries()) {
        if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
        onProgress?.({ index, total: MEMO_STEPS.length, label });
        await delay(STEP_DURATION_MS);
      }
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

      const memo = await composeMemo(dealId, nextVersion, new Date().toISOString());
      memoStore.set(dealId, memo);
      return structuredClone(memo);
    },
  };
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
