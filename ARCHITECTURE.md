# Architecture

AI-assisted change order pricing for construction software. This document covers folder structure, domain models, services, and mock implementations.

---

## Folder structure

```
app/
  layout.tsx                    # Root layout with AppShell
  page.tsx                      # Dashboard (work queue + summary)
  globals.css
  intake/
    page.tsx                    # Change Order Intake form
  change-orders/
    page.tsx                    # Change orders list
    [id]/
      layout.tsx                # CO context + tabbed workspace
      ChangeOrderDetailLayout.tsx
      page.tsx                  # Tab: Overview
      scope/page.tsx            # Tab: Scope review
      pricing/
        page.tsx                # Tab: Pricing recommendation
        PricingActions.tsx
      assumptions/page.tsx      # Tab: Assumptions & evidence
      approval/
        page.tsx                # Tab: Approval workflow
        ApprovalForm.tsx
      audit/page.tsx            # Tab: Audit history
  finance/page.tsx              # Finance summary (approved, billable)
  settings/page.tsx             # Settings / Integrations placeholder
  api/
    projects/route.ts, [id]/route.ts
    change-orders/route.ts, [id]/route.ts, [id]/recommendation/route.ts,
    [id]/submit/route.ts, [id]/approve/route.ts, [id]/activity/route.ts,
    [id]/approval-steps/route.ts
    integrations/route.ts
  new/, [id]/, pm/, pm/[id]/   # Legacy redirects → intake / change-orders

components/
  layout/
    AppShell.tsx
    LeftNav.tsx
    Header.tsx
    TabbedWorkspace.tsx
  domain/
    StatusBadge.tsx
    CostBreakdownTable.tsx
    AssumptionsPanel.tsx
    ActivityFeed.tsx
    DataPanel.tsx
    ConfidenceBadge.tsx

lib/
  domain/
    types.ts                    # Entities, statuses, DTOs
    index.ts
  ai/
    recommendationOrchestrator.ts  # Structured in/out; mock fallback
    index.ts
  data/
    store.ts                    # In-memory persistence
    mockData.ts                 # Realistic construction records
    index.ts
  services/
    projectService.ts
    changeOrderService.ts
    pricingRecommendationService.ts
    approvalWorkflowService.ts
    auditService.ts
    integrationService.ts
    index.ts

modules/
  approvals/
  audit/
  change-orders/
  pricing/
  projects/
```

---

## Domain models

| Entity | Key fields |
|---|---|
| **Project** | id, projectNumber, name, owner, contractValue, linkedProjectRecordId |
| **ChangeOrder** | id, projectId, changeOrderNumber, title, description, status, requester, dateSubmitted, costCode, scopeItems, laborHours, materialTotal, equipmentTotal, subcontractorTotal, recommendedTotal, finalTotal, currentRecommendationId |
| **ScopeItem** | id, changeOrderId, description, quantity, unit, costCode, category (Labor / Material / Equipment / Subcontractor) |
| **PricingRecommendation** | id, changeOrderId, recommendedTotal, costBreakdown, assumptions, evidence, confidence, rationale, budgetImpact, revenueImpact, scheduleImpactDays, warnings, missingInfoFlags, createdAt, createdBy |
| **CostBreakdown** | laborHours, laborRate, laborTotal, materialTotal, equipmentTotal, subcontractorTotal, total, marginPercent |
| **Assumption** | id, recommendationId, description, source |
| **EvidenceItem** | id, recommendationId, type, reference, value |
| **ApprovalStep** | id, changeOrderId, sequence, status, approvedBy, approvedAt, comment |
| **ActivityEvent** | id, changeOrderId, type, timestamp, userId, userName, description, payload |
| **IntegrationConnection** | id, system, displayName, connected, lastSync |

**Statuses:** Draft → In Review → Priced → Needs Revision → Pending Approval → Approved / Rejected → Synced.

---

## Services

| Service | Responsibilities |
|---|---|
| **ProjectService** | list, getById |
| **ChangeOrderService** | list, getById, getByStatus, create, update, setCurrentRecommendation |
| **PricingRecommendationService** | getById, getByChangeOrderId, getCurrentRecommendation, generateAndStoreRecommendation |
| **ApprovalWorkflowService** | getApprovalSteps, submitForApproval, approve, reject |
| **AuditService** | getActivityByChangeOrderId, recordActivity |
| **IntegrationService** | listConnections, getConnectionBySystem |

---

## API routes

| Method | Route | Description |
|---|---|---|
| GET/POST | `/api/projects` | List / create projects |
| GET | `/api/projects/[id]` | Get project by id |
| GET/POST | `/api/change-orders` | List / create change orders |
| GET/PATCH | `/api/change-orders/[id]` | Get / update change order |
| POST | `/api/change-orders/[id]/recommendation` | Generate pricing recommendation |
| POST | `/api/change-orders/[id]/submit` | Submit for approval |
| POST | `/api/change-orders/[id]/approve` | Approve |
| POST | `/api/change-orders/[id]/reject` | Reject |
| GET | `/api/change-orders/[id]/activity` | Activity feed |
| GET | `/api/change-orders/[id]/approval-steps` | Approval history |
| GET | `/api/integrations` | Integration connection statuses |

---

## AI layer

`lib/ai/recommendationOrchestrator.ts` — takes a structured pricing request and returns a recommendation with:
- Recommended total and cost breakdown (labor, material, equipment, subcontractor)
- Budget and revenue impact
- Confidence level (High / Medium / Low) derived from input completeness
- Rationale, assumptions, evidence references
- Warnings and missing-information flags

The implementation is a deterministic rules-based mock (labor rate × hours + margin). It is designed to be swapped for a real LLM or pricing service by replacing the orchestrator while keeping the same input/output contract.

---

## Persistence

In-memory arrays in `lib/data/store.ts`, seeded on first use from `lib/data/mockData.ts`. Includes realistic construction projects, change orders, approval steps, activity events, and integration connection records. No database or environment variables required.

---

## Integrations

Placeholder connections in `lib/data/mockData.ts` for:
- **ERP** — job cost and financial sync
- **Project Management** — project record and schedule
- **Estimating** — historical cost data
- **Document Control** — linked attachments
- **Event Bus** — async event publishing

All mock; structure is ready for real .NET/SQL/event-driven backends.

---

## Legacy routes

| Old path | Redirects to |
|---|---|
| `/new` | `/intake` |
| `/[id]` | `/change-orders/[id]` |
| `/pm` | `/change-orders` |
| `/pm/[id]` | `/change-orders/[id]` |
