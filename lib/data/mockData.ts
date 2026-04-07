/**
 * Realistic construction mock data for enterprise demo.
 * Structured as SQL-table equivalents (Projects, ChangeOrders, LineItems, etc.)
 */

import type {
  Project,
  ChangeOrder,
  ChangeOrderLineItem,
  PricingRecommendation,
  ApprovalStep,
  AuditRecord,
  IntegrationConnection,
} from "@/lib/domain/types";

// ─── Projects ──────────────────────────────────────────────────────────────

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    projectNumber: "PRJ-2024-1082",
    name: "Riverside Data Center – Phase 2",
    owner: "Northgate Properties",
    contractValue: 4_200_000,
    linkedProjectRecordId: "ERP-PRJ-1082",
    createdAt: "2023-11-01T08:00:00Z",
    createdBy: "admin",
  },
  {
    id: "proj-2",
    projectNumber: "PRJ-2024-1091",
    name: "Westside Medical Office – MEP",
    owner: "HealthCorp",
    contractValue: 1_850_000,
    linkedProjectRecordId: "ERP-PRJ-1091",
    createdAt: "2023-12-15T08:00:00Z",
    createdBy: "admin",
  },
];

// ─── Change order line items (ChangeOrderLineItems table) ──────────────────

function lineItem(
  coId: string,
  id: string,
  sequence: number,
  description: string,
  category: ChangeOrderLineItem["category"],
  quantity?: number,
  unit?: string,
  unitCost?: number,
  costCode?: string
): ChangeOrderLineItem {
  return {
    id,
    changeOrderId: coId,
    sequence,
    description,
    category,
    quantity,
    unit,
    unitCost,
    totalCost: quantity != null && unitCost != null ? quantity * unitCost : undefined,
    costCode,
    createdAt: "2024-01-01T08:00:00Z",
  };
}

// ─── Change orders (ChangeOrders table) ───────────────────────────────────

export const mockChangeOrders: ChangeOrder[] = [
  {
    id: "co-1",
    projectId: "proj-1",
    changeOrderNumber: "CO-2024-012",
    title: "Additional conduit runs – Phase 2 area",
    description:
      'Owner requested additional conduit runs to support future tenant fit-out. Scope: 12 runs, 1" EMT, ~320 LF total.',
    status: "Approved",
    requester: "J. Martinez",
    dateSubmitted: "2024-01-15T10:00:00Z",
    costCode: "26-0500",
    scopeItems: [
      lineItem("co-1", "s1-1", 1, '1" EMT conduit', "Material", 320, "LF", 2.85, "26-0500"),
      lineItem("co-1", "s1-2", 2, "Install conduit", "Labor", 16, "HR", 85, "26-0500"),
    ],
    laborHours: 16,
    materialTotal: 420,
    equipmentTotal: 200,
    subcontractorTotal: 0,
    recommendedTotal: 2200,
    finalTotal: 2200,
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-16T14:00:00Z",
    createdBy: "J. Martinez",
    modifiedBy: "S. Davis",
  },
  {
    id: "co-2",
    projectId: "proj-1",
    changeOrderNumber: "CO-2024-013",
    title: "Concrete pad extension for generator",
    description:
      "Extend equipment pad by 4 ft to accommodate generator per revised mechanical layout.",
    status: "Approved",
    requester: "M. Chen",
    dateSubmitted: "2024-01-18T14:00:00Z",
    costCode: "03-1100",
    scopeItems: [
      lineItem("co-2", "s2-1", 1, "Concrete extension – subcontractor", "Subcontractor", 1, "LS", 1200, "03-1100"),
      lineItem("co-2", "s2-2", 2, "Form & place", "Labor", 24, "HR", 85, "03-1100"),
    ],
    laborHours: 24,
    materialTotal: 680,
    equipmentTotal: 450,
    subcontractorTotal: 0,
    recommendedTotal: 3290,
    finalTotal: 3290,
    createdAt: "2024-01-12T09:00:00Z",
    updatedAt: "2024-01-19T11:00:00Z",
    createdBy: "M. Chen",
    modifiedBy: "S. Davis",
  },
  {
    id: "co-3",
    projectId: "proj-1",
    changeOrderNumber: "CO-2024-018",
    title: "Panel upgrade to 400A",
    description:
      "Upgrade main distribution panel to 400A per owner directive. Includes panel, breakers, and coordination.",
    status: "Priced",
    requester: "J. Martinez",
    dateSubmitted: "2024-02-01T09:00:00Z",
    costCode: "26-4100",
    scopeItems: [
      lineItem("co-3", "s3-1", 1, "400A distribution panel", "Material", 1, "EA", 1100, "26-4100"),
      lineItem("co-3", "s3-2", 2, "Install & terminate panel", "Labor", 12, "HR", 85, "26-4100"),
    ],
    laborHours: 12,
    materialTotal: 1100,
    equipmentTotal: 0,
    subcontractorTotal: 0,
    recommendedTotal: 2120,
    finalTotal: 2120,
    createdAt: "2024-01-28T13:00:00Z",
    updatedAt: "2024-02-01T15:00:00Z",
    createdBy: "J. Martinez",
  },
  {
    id: "co-4",
    projectId: "proj-1",
    changeOrderNumber: "CO-2024-021",
    title: "Additional trenching – rock encounter",
    description:
      "Unforeseen rock in trench path. Additional labor and equipment for excavation and backfill.",
    status: "In Review",
    requester: "R. Torres",
    dateSubmitted: "2024-02-05T11:00:00Z",
    costCode: "31-2300",
    scopeItems: [
      lineItem("co-4", "s4-1", 1, "Rock excavation – additional labor", "Labor", 40, "HR", 85, "31-2300"),
      lineItem("co-4", "s4-2", 2, "Excavator – additional hours", "Equipment", 1, "LS", 800, "31-2300"),
    ],
    laborHours: 40,
    materialTotal: 200,
    equipmentTotal: 800,
    subcontractorTotal: 0,
    recommendedTotal: 4740,
    finalTotal: 4740,
    createdAt: "2024-02-01T07:00:00Z",
    updatedAt: "2024-02-05T12:00:00Z",
    createdBy: "R. Torres",
  },
  {
    id: "co-5",
    projectId: "proj-2",
    changeOrderNumber: "CO-2024-007",
    title: "Exterior lighting – six additional fixtures",
    description:
      "Add six exterior wall-mounted LED fixtures at loading dock per owner request.",
    status: "Draft",
    requester: "K. Lee",
    costCode: "26-5500",
    scopeItems: [
      lineItem("co-5", "s5-1", 1, "LED exterior fixtures", "Material", 6, "EA", 63.33, "26-5500"),
      lineItem("co-5", "s5-2", 2, "Install & wire fixtures", "Labor", 8, "HR", 85, "26-5500"),
      lineItem("co-5", "s5-3", 3, "Lift equipment – half day", "Equipment", 1, "LS", 120, "26-5500"),
    ],
    laborHours: 8,
    materialTotal: 380,
    equipmentTotal: 120,
    subcontractorTotal: 0,
    recommendedTotal: 1296,
    finalTotal: 1296,
    createdAt: "2024-02-08T10:00:00Z",
    updatedAt: "2024-02-08T10:00:00Z",
    createdBy: "K. Lee",
  },
];

// ─── Pricing recommendations (PricingRecommendations table) ───────────────

export const mockRecommendations: PricingRecommendation[] = [];

// ─── Approval steps (ApprovalSteps table) ─────────────────────────────────

export const mockApprovalSteps: ApprovalStep[] = [
  {
    id: "ap-1",
    changeOrderId: "co-1",
    sequence: 1,
    status: "Approved",
    approvedBy: "S. Davis",
    approvedAt: "2024-01-16T14:00:00Z",
  },
  {
    id: "ap-2",
    changeOrderId: "co-2",
    sequence: 1,
    status: "Approved",
    approvedBy: "S. Davis",
    approvedAt: "2024-01-19T11:00:00Z",
  },
];

// ─── Audit records (AuditRecords table – append-only) ─────────────────────

export const mockActivityEvents: AuditRecord[] = [
  {
    id: "aud-1",
    changeOrderId: "co-1",
    eventType: "Created",
    timestamp: "2024-01-10T08:00:00Z",
    userName: "J. Martinez",
    description: "Change order created",
  },
  {
    id: "aud-2",
    changeOrderId: "co-1",
    eventType: "PricingGenerated",
    timestamp: "2024-01-10T08:05:00Z",
    description: "Pricing recommendation generated",
  },
  {
    id: "aud-3",
    changeOrderId: "co-1",
    eventType: "Submitted",
    timestamp: "2024-01-15T10:00:00Z",
    userName: "J. Martinez",
    description: "Submitted for approval",
  },
  {
    id: "aud-4",
    changeOrderId: "co-1",
    eventType: "Approved",
    timestamp: "2024-01-16T14:00:00Z",
    userName: "S. Davis",
    description: "Approved – final total $2,200.00",
  },
  {
    id: "aud-5",
    changeOrderId: "co-4",
    eventType: "Created",
    timestamp: "2024-02-01T07:00:00Z",
    userName: "R. Torres",
    description: "Change order created",
  },
  {
    id: "aud-6",
    changeOrderId: "co-4",
    eventType: "PricingGenerated",
    timestamp: "2024-02-01T07:10:00Z",
    description: "Pricing recommendation generated (confidence: High)",
  },
];

// ─── Integration connections (IntegrationConnections table) ───────────────

export const mockIntegrations: IntegrationConnection[] = [
  {
    id: "int-1",
    system: "ERP",
    displayName: "Corestone Financials",
    connected: true,
    lastSync: "2024-02-10T06:00:00Z",
  },
  {
    id: "int-2",
    system: "ProjectManagement",
    displayName: "ProjectSight",
    connected: true,
    lastSync: "2024-02-10T06:00:00Z",
  },
  {
    id: "int-3",
    system: "Estimating",
    displayName: "Estimation MEP",
    connected: false,
  },
  {
    id: "int-4",
    system: "DocumentControl",
    displayName: "Document Control",
    connected: false,
  },
  {
    id: "int-5",
    system: "EventBus",
    displayName: "Kafka / Azure Service Bus",
    connected: true,
    lastSync: "2024-02-10T05:55:00Z",
  },
];
