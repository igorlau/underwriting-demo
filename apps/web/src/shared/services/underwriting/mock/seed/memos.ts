import type {
  DealDetail,
  DiligenceItem,
  ICMemo,
  ICMemoSection,
  MemoInputSummary,
  Risk,
  Security,
} from '@uw/types';
import {
  formatDate,
  formatMultiple,
  formatPercent,
  formatUsdCompact,
  formatUsdExact,
} from '@/shared/lib/format';
import { SOURCES } from './evidence';

export interface MemoBuildInput {
  deal: DealDetail;
  security: Security;
  diligence: DiligenceItem[];
  risks: Risk[];
  version: number;
  generatedAt: string;
}

/**
 * Composes the IC memo from the underwriting record rather than returning a
 * static blob: figures, covenant terms and the risk section are all read off
 * the same seed data the rest of the workspace renders. When this is replaced
 * by a real model call, the prompt inputs are exactly the arguments below.
 */
export function buildICMemo({
  deal,
  security,
  diligence,
  risks,
  version,
  generatedAt,
}: MemoBuildInput): ICMemo {
  const { financials: fin, transaction: tx, borrower } = deal;
  const spread = `${security.benchmark} + ${formatPercent(security.spread)}`;
  const leverageCovenant = security.covenants.find((c) => c.id === 'cov-acme-leverage');
  const coverageCovenant = security.covenants.find((c) => c.id === 'cov-acme-coverage');
  const openLegal = diligence.filter((d) => d.status === 'in-review');

  const sections: ICMemoSection[] = [
    {
      id: 'executive-summary',
      title: 'Executive Summary',
      sources: [SOURCES.termSheet, SOURCES.modelDebt, SOURCES.qoeBridge],
      body: [
        `${borrower.legalName} (“${deal.borrowerName}” or the “Company”) is seeking a ${formatUsdCompact(tx.facilityAmount)} ${tx.instrument.toLowerCase()} to refinance existing senior debt, fund a bolt-on acquisition and pay transaction expenses. The facility would price at ${spread}, amortise at ${formatPercent(security.amortization, 0)} per annum and mature ${tx.maturityYears} years from close, secured on a ${security.lien.toLowerCase()} basis over substantially all assets of the Company and its material subsidiaries.`,
        `The Company generated ${formatUsdCompact(fin.revenue)} of revenue and ${formatUsdCompact(fin.ebitda)} of adjusted EBITDA in the ${fin.periodLabel} period, a ${formatPercent(fin.ebitdaMargin, 1)} margin. Opening net leverage of ${formatMultiple(fin.netLeverage)} sits at the upper end of our appetite for the sector, and interest coverage of ${formatMultiple(fin.interestCoverage)} leaves limited capacity to absorb a further rise in base rates. Both metrics improve on the prior year on the back of ${formatPercent((fin.revenue / (fin.priorYear?.revenue ?? fin.revenue) - 1) as number, 1)} revenue growth.`,
        `Financial, commercial and management diligence are complete. ${openLegal.length > 0 ? `Legal diligence remains in review pending resolution of a change-of-control provision in the Company’s largest customer contract, which we have made a condition precedent to funding.` : 'All diligence workstreams are complete.'} On balance we consider the credit bankable at the proposed structure and recommend approval subject to the conditions set out below.`,
      ],
    },
    {
      id: 'transaction-overview',
      title: 'Transaction Overview',
      sources: [SOURCES.termSheet, SOURCES.modelDebt],
      terms: [
        { label: 'Borrower', value: borrower.legalName },
        { label: 'Facility', value: `${formatUsdExact(tx.facilityAmount)} ${tx.instrument}` },
        { label: 'Ranking', value: `${security.lien}, senior secured` },
        { label: 'Pricing', value: spread },
        { label: 'Tenor', value: `${tx.maturityYears} years from close` },
        {
          label: 'Amortisation',
          value: `${formatPercent(security.amortization, 0)} per annum, payable quarterly`,
        },
        { label: 'Target close', value: formatDate(tx.closeTargetDate) },
      ],
      body: [
        `Use of proceeds: ${tx.useOfProceeds} Pro forma for the transaction, total funded debt is ${formatUsdCompact(fin.netDebt)}, equivalent to ${formatMultiple(fin.netLeverage)} net leverage on ${fin.periodLabel} adjusted EBITDA.`,
        `${borrower.sponsor} would retain majority ownership and is contributing no new equity in connection with the financing. The bolt-on acquisition is being funded from facility proceeds at an implied multiple below the Company’s own entry multiple.`,
      ],
    },
    {
      id: 'borrower-overview',
      title: 'Borrower Overview',
      sources: [SOURCES.cddCustomers, SOURCES.orgChart],
      body: [
        `${borrower.description} The Company was founded in ${borrower.founded}, is headquartered in ${borrower.headquarters} and employs approximately ${borrower.employees.toLocaleString('en-US')} people across four manufacturing sites.`,
        `Revenue is split between industrial end-markets and municipal water infrastructure, the latter benefiting from multi-year federal and state funding programmes. The Company competes on engineering specification and lead time rather than price, which supports gross margins in the mid-thirties and has allowed annual price increases to be passed through in each of the last four years.`,
        `${borrower.sponsor} acquired the business in 2022. Management has been stable through the sponsor’s ownership, with the exception of the CFO appointed in Q2 2025.`,
      ],
    },
    {
      id: 'credit-thesis',
      title: 'Credit Thesis',
      sources: [SOURCES.cddCustomers, SOURCES.backlog, SOURCES.qoeBridge],
      body: [
        'We are underwriting a stable, asset-backed industrial cash flow at a defensible attachment point, where the return is compensated for leverage rather than for business model risk.',
      ],
      bullets: [
        `Defensible market position. Products are specified into customer designs and municipal approval lists, producing switching costs that are reflected in average top-ten customer tenure of 11 years and no top-ten losses in five years.`,
        `Visible revenue. Contracted backlog of $148M covers approximately 71% of FY2027 budgeted revenue, up 9% year over year.`,
        `Demonstrated deleveraging. Net leverage has improved from ${formatMultiple(fin.priorYear?.netLeverage ?? fin.netLeverage)} to ${formatMultiple(fin.netLeverage)} over the last twelve months on EBITDA growth rather than debt paydown, and the model supports sub-4.0x by FY2029.`,
        `Hard collateral. The first-lien package covers receivables, inventory and four owned manufacturing sites; orderly liquidation analysis supports coverage of approximately 0.6x of the facility before any going-concern value.`,
        `Margin durability. EBITDA margin of ${formatPercent(fin.ebitdaMargin, 1)} has been maintained through two input cost cycles, with price increases passed through in each of the last four years.`,
      ],
    },
    {
      id: 'key-risks-mitigants',
      title: 'Key Risks & Mitigants',
      sources: risks.flatMap((r) => r.evidence).slice(0, 4),
      body: [
        'The risk register below is drawn from completed diligence workstreams. Each risk is assessed on its impact on debt service capacity rather than on equity value.',
      ],
      riskBlocks: risks.map((risk) => ({
        title: risk.title,
        severity: risk.severity,
        body: risk.explanation,
        mitigant: risk.mitigants.map((m) => m.description).join(' '),
      })),
    },
    {
      id: 'proposed-structure',
      title: 'Proposed Structure',
      sources: [SOURCES.termSheet, SOURCES.modelCovenant],
      body: [
        `The facility is structured as a ${formatUsdCompact(security.principal)} ${security.instrument.toLowerCase()} ranking ${security.lien.toLowerCase()} over substantially all assets of the Company and its material subsidiaries.`,
        leverageCovenant && coverageCovenant
          ? `Two financial covenants are proposed, both tested quarterly. Maximum net leverage is set at ${formatMultiple(leverageCovenant.threshold)} against ${formatMultiple(leverageCovenant.current)} at close — ${formatMultiple(leverageCovenant.headroom)} of headroom, or approximately a 9% cushion to EBITDA — stepping down to 4.75x by FY2030. Minimum interest coverage is set at ${formatMultiple(coverageCovenant.threshold)} against ${formatMultiple(coverageCovenant.current)}. The coverage covenant is the tighter of the two at close and is the metric we expect to be tested first in a rate-driven downside.`
          : '',
        `A 50% excess cash flow sweep stepping to 25% below 4.00x, and mandatory prepayments from asset sales and debt issuance, complete the package. Restricted payments and permitted acquisitions are subject to pro forma leverage tests set 0.25x inside the then-applicable covenant level.`,
      ].filter(Boolean),
    },
    {
      id: 'recommendation',
      title: 'Recommendation',
      sources: [SOURCES.termSheet, SOURCES.legalContracts],
      body: [
        `We recommend the Committee approve a ${formatUsdCompact(tx.facilityAmount)} ${tx.instrument.toLowerCase()} to ${borrower.legalName} on the terms described, subject to the conditions below. The proposed pricing of ${spread} represents an estimated ${formatPercent(0.0925, 2)} all-in yield to a three-year takeout, which we consider adequate compensation for a ${formatMultiple(fin.netLeverage)} first-lien attachment point in this sector.`,
        `The principal reason for conditioning rather than approving outright is the unresolved change-of-control provision affecting 22% of revenue. We would not fund without written confirmation on that point.`,
      ],
      bullets: [
        'Written confirmation that the transaction does not trigger the Customer A change-of-control termination right, or receipt of a waiver, as a condition precedent to funding.',
        'Completion of outstanding lien searches for the two acquired entities with no material encumbrances.',
        'Minimum interest coverage covenant set at 2.00x with no equity cure available in the first four quarters.',
        'Excess cash flow sweep of 50%, stepping to 25% only once net leverage is sustained below 4.00x for two consecutive quarters.',
      ],
    },
  ];

  return {
    id: `memo-${deal.id}-v${version}`,
    dealId: deal.id,
    title: `Investment Committee Memorandum — ${deal.borrowerName}`,
    version,
    generatedAt,
    preparedBy: 'M. Reyes, Private Credit — drafted with AI assistance',
    recommendation: 'approve-with-conditions',
    recommendationSummary: `Approve a ${formatUsdCompact(tx.facilityAmount)} first-lien term loan at ${spread}, subject to four conditions precedent.`,
    conditions: sections.find((s) => s.id === 'recommendation')?.bullets ?? [],
    sections,
    inputs: buildMemoInputs({ deal, security, diligence, risks }),
  };
}

/** Summary of what the memo will be — and was — synthesised from. */
export function buildMemoInputs({
  deal,
  security,
  diligence,
  risks,
}: {
  deal: DealDetail;
  security: Security;
  diligence: DiligenceItem[];
  risks: Risk[];
}): MemoInputSummary[] {
  const findingCount = diligence.reduce((n, d) => n + d.findings.length, 0);
  const openItemCount = diligence.reduce((n, d) => n + d.openItems.length, 0);
  const mitigantCount = risks.reduce((n, r) => n + r.mitigants.length, 0);
  const sourceCount = new Set(
    [
      ...risks.flatMap((r) => r.evidence.map((e) => e.id)),
      ...diligence.flatMap((d) => d.findings.map((f) => f.evidence.id)),
    ].values(),
  ).size;

  return [
    {
      id: 'input-structure',
      label: 'Deal structure',
      detail: `${deal.transaction.instrument}, ${deal.transaction.maturityYears}-year tenor, use of proceeds and close timetable`,
      itemCount: 1,
    },
    {
      id: 'input-security',
      label: 'Security terms',
      detail: `${security.lien} package, pricing and ${security.covenants.length} financial covenants`,
      itemCount: security.covenants.length,
    },
    {
      id: 'input-financials',
      label: 'Financial metrics',
      detail: `${deal.financials.periodLabel} financials with prior-year comparatives`,
      itemCount: 6,
    },
    {
      id: 'input-diligence',
      label: 'Diligence findings',
      detail: `${diligence.length} workstreams, ${findingCount} findings, ${openItemCount} open items`,
      itemCount: findingCount,
    },
    {
      id: 'input-risks',
      label: 'Key risks & mitigants',
      detail: `${risks.length} risks with ${mitigantCount} mitigants across ${sourceCount} cited sources`,
      itemCount: risks.length,
    },
  ];
}
