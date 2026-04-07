/**
 * Domain event types – mirrors Kafka/Service Bus message contracts.
 * In production: publish to Kafka topics or Azure Service Bus queues.
 */

export type DomainEventType =
  | "ChangeOrderCreated"
  | "ChangeOrderUpdated"
  | "PricingGenerated"
  | "PricingUpdated"
  | "SubmittedForApproval"
  | "Approved"
  | "Rejected"
  | "SyncedToERP"
  | "SyncedToProjectManagement";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DomainEvent<TPayload = any> {
  eventId: string;
  eventType: DomainEventType;
  aggregateId: string;          // Change order or project ID
  aggregateType: "ChangeOrder" | "Project";
  occurredAt: string;
  raisedBy?: string;
  payload: TPayload;
}

// Typed payloads per event

export interface ChangeOrderCreatedPayload {
  changeOrderId: string;
  projectId: string;
  changeOrderNumber: string;
  requester?: string;
}

export interface PricingGeneratedPayload {
  changeOrderId: string;
  recommendationId: string;
  recommendedTotal: number;
  confidence: string;
}

export interface ApprovalPayload {
  changeOrderId: string;
  approvedBy: string;
  finalTotal: number;
  comment?: string;
}
