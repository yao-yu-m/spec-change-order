/**
 * Enterprise domain model – AI-assisted change order pricing.
 * Construction/project-controls language. Matches Angular/.NET/SQL patterns:
 * PascalCase entities, explicit foreign keys, typed status enums, DTOs at service boundaries.
 */

// ─── Status enums ─────────────────────────────────────────────────────────────

export type ApprovalStatus =
  | "Draft"
  | "In Review"
  | "Priced"
  | "Needs Revision"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Synced";

export type PricingConfidence = "High" | "Medium" | "Low";

export type IntegrationSystemType =
  | "ERP"
  | "ProjectManagement"
  | "Estimating"
  | "DocumentControl"
  | "EventBus";

// ─── Core entities (maps to SQL tables) ───────────────────────────────────────

/** Projects table – linked to ERP/PM system */
export interface Project {
  id: string;
  projectNumber: string;              // e.g. PRJ-2024-1082
  name: string;
  owner: string;
  contractValue: number;
  linkedProjectRecordId?: string;     // FK to ERP/PM system record
  createdAt: string;
  createdBy?: string;
}

/** ChangeOrders table – core workflow entity */
export interface ChangeOrder {
  id: string;
  projectId: string;                  // FK → Projects
  changeOrderNumber: string;          // e.g. CO-2024-012
  title: string;
  description: string;
  status: ApprovalStatus;
  requester?: string;
  dateSubmitted?: string;
  costCode?: string;                  // CSI cost code reference
  laborHours: number;
  materialTotal: number;
  equipmentTotal: number;
  subcontractorTotal: number;
  recommendedTotal: number;
  finalTotal: number;
  currentRecommendationId?: string;   // FK → PricingRecommendations
  /** Denormalized line items – joined from ChangeOrderLineItems table for API convenience. */
  scopeItems?: ChangeOrderLineItem[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  modifiedBy?: string;
}

/**
 * ChangeOrderLineItems table – individual scope/cost line items.
 * Replaces the untyped ScopeItem; normalised as a child table.
 */
export interface ChangeOrderLineItem {
  id: string;
  changeOrderId: string;              // FK → ChangeOrders
  sequence: number;
  description: string;
  category: "Labor" | "Material" | "Equipment" | "Subcontractor";
  quantity?: number;
  unit?: string;
  unitCost?: number;
  totalCost?: number;
  costCode?: string;
  createdAt: string;
}

/** @deprecated Use ChangeOrderLineItem. Retained for backward compatibility. */
export type ScopeItem = ChangeOrderLineItem;

// ─── Pricing entities ─────────────────────────────────────────────────────────

/** Cost breakdown – derived from line items or AI estimate */
export interface CostBreakdown {
  laborHours: number;
  laborRate: number;
  laborTotal: number;
  materialTotal: number;
  equipmentTotal: number;
  subcontractorTotal: number;
  total: number;
  marginPercent?: number;
}

/** Structured input to the AI pricing orchestration layer */
export interface PricingContext {
  changeOrderId: string;
  projectId: string;
  projectNumber?: string;
  laborHours: number;
  materialTotal: number;
  equipmentTotal: number;
  subcontractorTotal: number;
  scopeSummary: string;
  costCode?: string;
  historicalComparables?: string[];   // CO numbers from similar past jobs
}

/** Assumptions table – FK to PricingRecommendations */
export interface Assumption {
  id: string;
  recommendationId: string;
  description: string;
  source?: string;                    // e.g. "Contract labor rate table"
}

/** EvidenceReferences table – comparable jobs, quotes, specs */
export interface EvidenceItem {
  id: string;
  recommendationId: string;
  type: "Historical" | "Quote" | "Estimate" | "Spec";
  reference: string;                  // CO number or document reference
  value?: number;
}

/** PricingRecommendations table – one or more per change order (versioned) */
export interface PricingRecommendation {
  id: string;
  changeOrderId: string;              // FK → ChangeOrders
  recommendedTotal: number;
  costBreakdown: CostBreakdown;
  assumptions: Assumption[];
  evidence: EvidenceItem[];
  confidence: PricingConfidence;
  rationale: string;                  // Basis of estimate narrative
  budgetImpact: number;
  revenueImpact: number;
  scheduleImpactDays?: number;
  warnings: string[];
  missingInfoFlags: string[];
  createdAt: string;
  createdBy?: string;
}

// ─── Approval entities ────────────────────────────────────────────────────────

/** ApprovalSteps table – ordered steps in the approval workflow */
export interface ApprovalStep {
  id: string;
  changeOrderId: string;              // FK → ChangeOrders
  sequence: number;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  comment?: string;
}

// ─── Audit entities ───────────────────────────────────────────────────────────

/** AuditRecords table – immutable audit trail. ActivityEvent alias preserved. */
export interface AuditRecord {
  id: string;
  changeOrderId: string;
  eventType: AuditEventType;
  timestamp: string;
  userId?: string;
  userName?: string;
  description: string;
  payload?: Record<string, unknown>;
}

export type AuditEventType =
  | "Created"
  | "ScopeUpdated"
  | "PricingGenerated"
  | "PricingEdited"
  | "Submitted"
  | "Approved"
  | "Rejected"
  | "Synced"
  | "IntegrationSync";

/** @deprecated Use AuditRecord. Retained for backward compatibility. */
export interface ActivityEvent extends AuditRecord {
  type: AuditEventType;               // alias for eventType
}

// ─── Integration entities ─────────────────────────────────────────────────────

/** IntegrationConnections table – registered external system adapters */
export interface IntegrationConnection {
  id: string;
  system: IntegrationSystemType;
  displayName: string;
  connected: boolean;
  lastSync?: string;
}

/** IntegrationMappings table – field mapping config per system */
export interface IntegrationMapping {
  id: string;
  connectionId: string;               // FK → IntegrationConnections
  internalField: string;
  externalField: string;
  transformRule?: string;
}

// ─── DTOs (service/API contracts) ────────────────────────────────────────────

export interface ChangeOrderCreateDto {
  projectId: string;
  title: string;
  description: string;
  requester?: string;
  laborHours: number;
  materialTotal: number;
  equipmentTotal: number;
  subcontractorTotal?: number;
  costCode?: string;
  createdBy?: string;
}

export interface ChangeOrderUpdateDto {
  title?: string;
  description?: string;
  finalTotal?: number;
  status?: ApprovalStatus;
  modifiedBy?: string;
}

export interface GeneratePricingRequestDto {
  changeOrderId: string;
  projectId: string;
  laborHours: number;
  materialTotal: number;
  equipmentTotal: number;
  subcontractorTotal?: number;
  scopeSummary?: string;
  costCode?: string;
  requestedBy?: string;
}

/** @deprecated Use GeneratePricingRequestDto */
export type PricingRecommendationRequest = GeneratePricingRequestDto;

export interface GeneratePricingResponseDto {
  recommendation: PricingRecommendation;
  warnings: string[];
}

/** @deprecated Use GeneratePricingResponseDto */
export type PricingRecommendationResponse = GeneratePricingResponseDto;

export interface ApprovalSubmitDto {
  changeOrderId: string;
  approvedBy: string;
  comment?: string;
  finalTotal: number;
}
