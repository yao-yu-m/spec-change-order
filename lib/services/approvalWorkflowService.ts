/**
 * ApprovalWorkflowService – manages approval state transitions.
 * Delegates persistence to ApprovalRepository and ChangeOrderRepository.
 * Emits domain events on approval/rejection.
 */

import type { ApprovalStep, ApprovalSubmitDto } from "@/lib/domain/types";
import { ChangeOrderRepository } from "@/lib/repositories/changeOrderRepository";
import { ApprovalRepository } from "@/lib/repositories/approvalRepository";
import { AuditRepository } from "@/lib/repositories/auditRepository";
import { EventBus } from "@/lib/events/eventBus";
import type { ApprovalPayload } from "@/lib/events/eventTypes";

export const ApprovalWorkflowService = {
  getApprovalSteps(changeOrderId: string): ApprovalStep[] {
    return ApprovalRepository.findByChangeOrderId(changeOrderId);
  },

  submitForApproval(changeOrderId: string): boolean {
    const co = ChangeOrderRepository.findById(changeOrderId);
    if (!co) return false;

    ChangeOrderRepository.update(changeOrderId, {
      status: "Pending Approval",
      dateSubmitted: new Date().toISOString(),
    });

    const nextSeq = ApprovalRepository.countByChangeOrderId(changeOrderId) + 1;
    ApprovalRepository.insert({
      changeOrderId,
      sequence: nextSeq,
      status: "Pending Approval",
    });

    AuditRepository.append(changeOrderId, "Submitted", "Submitted for approval", {
      userName: co.requester,
    });

    EventBus.publish("SubmittedForApproval", changeOrderId, "ChangeOrder", {
      changeOrderId,
    });

    return true;
  },

  approve(dto: ApprovalSubmitDto): boolean {
    const co = ChangeOrderRepository.findById(dto.changeOrderId);
    if (!co) return false;

    ChangeOrderRepository.update(dto.changeOrderId, {
      status: "Approved",
      finalTotal: dto.finalTotal,
    });

    const currentStep = ApprovalRepository.findCurrentStep(dto.changeOrderId);
    if (currentStep) {
      ApprovalRepository.updateStep(currentStep.id, {
        status: "Approved",
        approvedBy: dto.approvedBy,
        approvedAt: new Date().toISOString(),
        comment: dto.comment,
      });
    } else {
      ApprovalRepository.insert({
        changeOrderId: dto.changeOrderId,
        sequence: 1,
        status: "Approved",
        approvedBy: dto.approvedBy,
        approvedAt: new Date().toISOString(),
        comment: dto.comment,
      });
    }

    AuditRepository.append(
      dto.changeOrderId,
      "Approved",
      `Approved by ${dto.approvedBy}`,
      { userName: dto.approvedBy }
    );

    EventBus.publish<ApprovalPayload>("Approved", dto.changeOrderId, "ChangeOrder", {
      changeOrderId: dto.changeOrderId,
      approvedBy: dto.approvedBy,
      finalTotal: dto.finalTotal,
      comment: dto.comment,
    });

    return true;
  },

  reject(changeOrderId: string, rejectedBy: string, comment?: string): boolean {
    if (!ChangeOrderRepository.exists(changeOrderId)) return false;

    ChangeOrderRepository.update(changeOrderId, { status: "Rejected" });

    const currentStep = ApprovalRepository.findCurrentStep(changeOrderId);
    if (currentStep) {
      ApprovalRepository.updateStep(currentStep.id, {
        status: "Rejected",
        approvedBy: rejectedBy,
        approvedAt: new Date().toISOString(),
        comment,
      });
    }

    AuditRepository.append(changeOrderId, "Rejected", `Rejected by ${rejectedBy}`, {
      userName: rejectedBy,
    });

    EventBus.publish("Rejected", changeOrderId, "ChangeOrder", {
      changeOrderId,
      rejectedBy,
      comment,
    });

    return true;
  },
};

// ─── Free function aliases for backward compatibility ──────────────────────

export function getApprovalSteps(changeOrderId: string): ApprovalStep[] {
  return ApprovalWorkflowService.getApprovalSteps(changeOrderId);
}
export function submitForApproval(changeOrderId: string): boolean {
  return ApprovalWorkflowService.submitForApproval(changeOrderId);
}
export function approve(dto: ApprovalSubmitDto): boolean {
  return ApprovalWorkflowService.approve(dto);
}
export function reject(
  changeOrderId: string,
  rejectedBy: string,
  comment?: string
): boolean {
  return ApprovalWorkflowService.reject(changeOrderId, rejectedBy, comment);
}
