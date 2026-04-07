/**
 * Project management adapter – syncs with ProjectSight / Einstein.
 * In production: Angular/.NET API call to update CO status in the PM system.
 */

import type { ChangeOrder, ApprovalStatus } from "@/lib/domain/types";

/** ProjectSight CO status mapping */
const STATUS_MAP: Partial<Record<ApprovalStatus, string>> = {
  Draft: "DRAFT",
  "In Review": "REVIEW",
  "Pending Approval": "PENDING",
  Approved: "APPROVED",
  Rejected: "REJECTED",
  Synced: "CLOSED",
};

export interface ProjectSightChangeOrderUpdate {
  ChangeOrderId: string;
  ProjectId: string;
  StatusCode: string;
  ApprovedAmount?: number;
  SyncTimestamp: string;
}

export function mapChangeOrderToProjectSightUpdate(
  co: ChangeOrder
): ProjectSightChangeOrderUpdate {
  return {
    ChangeOrderId: co.changeOrderNumber,
    ProjectId: co.projectId,
    StatusCode: STATUS_MAP[co.status] ?? "UNKNOWN",
    ApprovedAmount: co.status === "Approved" ? co.finalTotal : undefined,
    SyncTimestamp: new Date().toISOString(),
  };
}

export async function syncChangeOrderToProjectSight(
  co: ChangeOrder
): Promise<{ success: boolean; error?: string }> {
  const payload = mapChangeOrderToProjectSightUpdate(co);
  // Production: await projectSightClient.patch(`/change-orders/${co.changeOrderNumber}`, payload)
  console.info("[ProjectSight Adapter] Sync payload:", JSON.stringify(payload));
  return { success: true };
}
