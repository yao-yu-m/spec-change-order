# Roadmap

Potential extensions to the current prototype. Pick one and build it — each is scoped to be completable in a focused session.

---

## Capture

**1. Mobile-friendly intake form**
Make the change order intake form work well on mobile: larger touch targets, responsive layout, optional photo attachment (mock upload to start).
- File: `app/intake/page.tsx`

**2. Photo attachments**
Add a field to attach one or more photos to a change order. Store URLs or base64 in the data model — no real storage backend required.
- File: `app/intake/page.tsx`, `lib/domain/types.ts`

---

## Pricing

**3. History-based pricing suggestions**
Replace the rules-only pricing with a simple "average of similar past change orders" (matched by category or labor band) and surface it as the suggested total.
- File: `lib/ai/recommendationOrchestrator.ts`, `lib/data/mockData.ts`

**4. Confidence range**
Extend the confidence output from High/Medium/Low to include a ±% range based on how much historical data was used. Show it on the pricing tab.
- File: `lib/ai/recommendationOrchestrator.ts`, `components/domain/ConfidenceBadge.tsx`

---

## Approval workflow

**5. Client-facing approval view**
Add a read-only "Client view" page or role: the client sees change orders pending their approval and can approve or reject (mocked auth is fine).
- File: new page under `app/change-orders/[id]/`

**6. Approval audit trail** *(partially built)*
Extend the existing audit trail to include approval decisions with approver, timestamp, and comments. Surface it clearly on the change order detail.
- File: `app/change-orders/[id]/audit/page.tsx`, `lib/services/auditService.ts`

---

## Finance

**7. Change order volume forecasting**
Add a simple forecast view: approved this month vs last month, or a chart of totals over time.
- File: `app/finance/page.tsx`

**8. Budget tracking**
Add a "Budget" concept per project. Set a contract budget and show remaining budget after approved change orders.
- File: `app/finance/page.tsx`, `lib/domain/types.ts`, `lib/data/mockData.ts`

---

## AI layer

**9. AI-generated change order summaries**
Add a one-line AI-generated summary for each change order (template-based or simple rules for now). Show it on the list view and overview tab.
- File: `lib/ai/recommendationOrchestrator.ts`, `app/change-orders/page.tsx`

**10. Risk flags**
Add a `riskFlag` field to the pricing recommendation: e.g. "High labor share", "Above average for category". Show it on the pricing tab and PM review.
- File: `lib/ai/recommendationOrchestrator.ts`, `lib/domain/types.ts`, `components/domain/CostBreakdownTable.tsx`

---

## Infrastructure

**11. Persistent storage**
Replace the in-memory store with a real database (SQLite or Postgres). Requires adding a DB adapter and migration.
- File: `lib/data/store.ts`

**12. Real AI pricing**
Swap `lib/ai/recommendationOrchestrator.ts` for a real LLM or pricing service. The input/output contract is already defined — only the orchestrator implementation needs to change.
- File: `lib/ai/recommendationOrchestrator.ts`
