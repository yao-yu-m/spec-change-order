/**
 * Approval API service – Angular-module-style client for approval endpoints.
 */

import type { ChangeOrder, ApprovalStep } from "@/lib/domain/types";

const BASE = "/api/change-orders";

export const ApprovalApiService = {
  async getApprovalSteps(changeOrderId: string): Promise<ApprovalStep[]> {
    const res = await fetch(`${BASE}/${changeOrderId}/approval-steps`);
    if (!res.ok) throw new Error("Failed to load approval steps");
    return res.json();
  },

  async approve(
    changeOrderId: string,
    approvedBy: string,
    finalTotal: number,
    comment?: string
  ): Promise<ChangeOrder> {
    const res = await fetch(`${BASE}/${changeOrderId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedBy, finalTotal, comment }),
    });
    if (!res.ok) throw new Error("Approval failed");
    return res.json();
  },
};
