/**
 * ApprovalStep repository – approval workflow state.
 * In production: SQL table with FK to ChangeOrders.
 */

import type { ApprovalStep, ApprovalStatus } from "@/lib/domain/types";
import { approvalStepStore, ensureSeeded, generateId } from "@/lib/data/store";

export const ApprovalRepository = {
  findByChangeOrderId(changeOrderId: string): ApprovalStep[] {
    ensureSeeded();
    return approvalStepStore
      .filter((s) => s.changeOrderId === changeOrderId)
      .sort((a, b) => a.sequence - b.sequence);
  },

  findCurrentStep(changeOrderId: string): ApprovalStep | undefined {
    const steps = ApprovalRepository.findByChangeOrderId(changeOrderId);
    return steps.filter((s) => s.status === "Pending Approval").pop()
      ?? steps[steps.length - 1];
  },

  insert(entity: Omit<ApprovalStep, "id">): ApprovalStep {
    ensureSeeded();
    const record: ApprovalStep = { id: generateId("ap"), ...entity };
    approvalStepStore.push(record);
    return record;
  },

  updateStep(
    id: string,
    patch: Partial<Pick<ApprovalStep, "status" | "approvedBy" | "approvedAt" | "comment">>
  ): ApprovalStep | undefined {
    const idx = approvalStepStore.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    Object.assign(approvalStepStore[idx], patch);
    return approvalStepStore[idx];
  },

  countByChangeOrderId(changeOrderId: string): number {
    ensureSeeded();
    return approvalStepStore.filter((s) => s.changeOrderId === changeOrderId).length;
  },
};
