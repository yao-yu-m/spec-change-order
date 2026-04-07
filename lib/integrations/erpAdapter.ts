/**
 * ERP adapter – maps internal ChangeOrder model to Corestone Financials / Vista / Spectrum format.
 * In production: POST to ERP REST API or trigger Service Bus message.
 */

import type { ChangeOrder, Project } from "@/lib/domain/types";

/** ERP-side ChangeOrder contract (Corestone Financials / Vista format) */
export interface ErpChangeOrderPayload {
  ExternalId: string;               // Our changeOrderNumber
  ProjectCode: string;              // ERP project reference
  Description: string;
  LaborAmount: number;
  MaterialAmount: number;
  EquipmentAmount: number;
  SubcontractorAmount: number;
  TotalApprovedAmount: number;
  CostCode: string;
  Status: "Open" | "Approved" | "Void";
  ApprovedDate?: string;
  SyncedAt: string;
}

export function mapChangeOrderToErpPayload(
  co: ChangeOrder,
  project: Project
): ErpChangeOrderPayload {
  return {
    ExternalId: co.changeOrderNumber,
    ProjectCode: project.linkedProjectRecordId ?? project.projectNumber,
    Description: co.title,
    LaborAmount: co.laborHours * 85,    // standard rate
    MaterialAmount: co.materialTotal,
    EquipmentAmount: co.equipmentTotal,
    SubcontractorAmount: co.subcontractorTotal,
    TotalApprovedAmount: co.finalTotal,
    CostCode: co.costCode ?? "00-0000",
    Status: co.status === "Approved" ? "Approved" : "Open",
    ApprovedDate:
      co.status === "Approved" ? co.updatedAt : undefined,
    SyncedAt: new Date().toISOString(),
  };
}

/** Simulate ERP sync (stub – replace with real HTTP call). */
export async function syncChangeOrderToErp(
  co: ChangeOrder,
  project: Project
): Promise<{ success: boolean; erpRecordId?: string; error?: string }> {
  const payload = mapChangeOrderToErpPayload(co, project);
  // Production: await httpClient.post(`${ERP_BASE_URL}/change-orders`, payload)
  console.info("[ERP Adapter] Sync payload:", JSON.stringify(payload));
  return {
    success: true,
    erpRecordId: `ERP-CO-${co.changeOrderNumber}`,
  };
}
