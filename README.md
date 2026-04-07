# Change Order Pricing — AI-Assisted Prototype

A working prototype of AI-assisted pricing for construction change orders. Designed to fit into existing project management, ERP, and estimating workflows. Provides explainable recommendations, a structured approval workflow, and a full audit trail.

Built for internal use and brownfield adoption evaluation.

**Contacts:** Zara Hall (zara_hall@mckinsey.com) · Yao Yu (yao_yu@mckinsey.com)

---

## What's included

| Feature | Description |
|---|---|
| **Dashboard** | Work queue with pending, approved, and billable totals |
| **Change order intake** | Create change orders with project, scope, labor/material/equipment/subcontractor cost inputs |
| **Change order detail** | Tabbed workspace: Overview, Scope review, Pricing recommendation, Assumptions & evidence, Approval workflow, Audit history |
| **Pricing recommendation** | AI-generated total with cost breakdown, confidence (High/Medium/Low), rationale, assumptions, evidence, budget/revenue impact, warnings |
| **Approval workflow** | Submit → approve with final total and comment → approval history |
| **Finance summary** | Approved change orders and total billable impact |
| **Settings** | Integration status placeholders (ERP, PM, Estimating, Document Control, Event Bus) |

All data is in-memory and seeded with realistic construction mock data. No database or environment variables required.

---

## Getting started

**Prerequisites:** Node.js v18+ and Git.

```bash
git clone <repo-url>
cd <repo-folder>
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Navigate via the left sidebar: Dashboard → Change Order Intake → Change Orders → Finance → Settings.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Domain | Typed entities and statuses in `lib/domain/types.ts` |
| AI layer | Rules-based mock in `lib/ai/recommendationOrchestrator.ts` — swappable for a real service |
| Services | ChangeOrderService, PricingRecommendationService, ApprovalWorkflowService, AuditService, IntegrationService |
| Persistence | In-memory store + mock data in `lib/data/` |

---

## Key folders

```
app/          Pages and API routes (Next.js App Router)
components/   Shared UI — layout (AppShell, LeftNav, Header) and domain (StatusBadge, CostBreakdownTable, etc.)
lib/          Core logic — domain types, AI orchestration, services, data store
modules/      Feature modules (change-orders, pricing, approvals, audit, projects)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full folder structure, domain models, and API reference.

---

## Extending the prototype

See [ROADMAP.md](./ROADMAP.md) for a list of scoped extension ideas — history-based pricing, client approval view, budget tracking, real AI integration, and more.

---

## Deploying

The app deploys to Vercel with no configuration. No environment variables needed.

```bash
npm install -g vercel
vercel        # preview
vercel --prod # production
```

Or connect the repo to [vercel.com](https://vercel.com) directly via the dashboard.
