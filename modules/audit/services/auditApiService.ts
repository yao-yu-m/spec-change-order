/**
 * Audit API service – Angular-module-style client for audit/activity endpoints.
 */

import type { AuditRecord } from "@/lib/domain/types";

const BASE = "/api/change-orders";

export const AuditApiService = {
  async getAuditTrail(changeOrderId: string): Promise<AuditRecord[]> {
    const res = await fetch(`${BASE}/${changeOrderId}/activity`);
    if (!res.ok) throw new Error("Failed to load audit trail");
    return res.json();
  },
};
