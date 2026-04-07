/**
 * ChangeOrderService – workflow and business logic for change orders.
 * Delegates data access to ChangeOrderRepository.
 * Emits domain events via EventBus on state transitions.
 */

import type {
  ChangeOrder,
  ChangeOrderCreateDto,
  ChangeOrderUpdateDto,
  ChangeOrderLineItem,
  ApprovalStatus,
} from "@/lib/domain/types";
import { ChangeOrderRepository } from "@/lib/repositories/changeOrderRepository";
import { AuditRepository } from "@/lib/repositories/auditRepository";
import { EventBus } from "@/lib/events/eventBus";
import type { ChangeOrderCreatedPayload } from "@/lib/events/eventTypes";

export const ChangeOrderService = {
  listChangeOrders(projectId?: string): ChangeOrder[] {
    return ChangeOrderRepository.findAll(projectId);
  },

  getChangeOrderById(id: string): ChangeOrder | undefined {
    return ChangeOrderRepository.findById(id);
  },

  getChangeOrdersByStatus(status: ApprovalStatus): ChangeOrder[] {
    return ChangeOrderRepository.findByStatus(status);
  },

  createChangeOrder(
    dto: ChangeOrderCreateDto,
    lineItems: ChangeOrderLineItem[],
    recommendedTotal: number
  ): ChangeOrder {
    const nextSeq = ChangeOrderRepository.findAll().length + 12;
    const co = ChangeOrderRepository.insert({
      projectId: dto.projectId,
      changeOrderNumber: `CO-2024-${String(nextSeq).padStart(3, "0")}`,
      title: dto.title,
      description: dto.description,
      status: "Draft",
      requester: dto.requester,
      costCode: dto.costCode,
      laborHours: dto.laborHours,
      materialTotal: dto.materialTotal,
      equipmentTotal: dto.equipmentTotal,
      subcontractorTotal: dto.subcontractorTotal ?? 0,
      recommendedTotal,
      finalTotal: recommendedTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: dto.createdBy,
    });

    // Assign FK on line items after CO is created
    lineItems.forEach((item) => { item.changeOrderId = co.id; });

    AuditRepository.append(co.id, "Created", "Change order created", {
      userName: dto.requester,
    });

    EventBus.publish<ChangeOrderCreatedPayload>(
      "ChangeOrderCreated",
      co.id,
      "ChangeOrder",
      {
        changeOrderId: co.id,
        projectId: co.projectId,
        changeOrderNumber: co.changeOrderNumber,
        requester: dto.requester,
      },
      dto.createdBy
    );

    return co;
  },

  updateChangeOrder(
    id: string,
    dto: ChangeOrderUpdateDto
  ): ChangeOrder | undefined {
    const patch: Partial<ChangeOrder> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.description !== undefined) patch.description = dto.description;
    if (dto.finalTotal !== undefined) patch.finalTotal = dto.finalTotal;
    if (dto.status !== undefined) patch.status = dto.status;
    if (dto.modifiedBy !== undefined) patch.modifiedBy = dto.modifiedBy;

    const updated = ChangeOrderRepository.update(id, patch);
    if (updated) {
      AuditRepository.append(id, "ScopeUpdated", "Change order updated", {
        userName: dto.modifiedBy,
      });
      EventBus.publish(
        "ChangeOrderUpdated",
        id,
        "ChangeOrder",
        { updates: dto },
        dto.modifiedBy
      );
    }
    return updated;
  },

  setCurrentRecommendation(changeOrderId: string, recommendationId: string): void {
    ChangeOrderRepository.update(changeOrderId, {
      currentRecommendationId: recommendationId,
      status: "Priced",
    });
  },
};

// ─── Free function aliases for backward compatibility ──────────────────────

export function listChangeOrders(projectId?: string): ChangeOrder[] {
  return ChangeOrderService.listChangeOrders(projectId);
}
export function getChangeOrderById(id: string): ChangeOrder | undefined {
  return ChangeOrderService.getChangeOrderById(id);
}
export function getChangeOrdersByStatus(status: ApprovalStatus): ChangeOrder[] {
  return ChangeOrderService.getChangeOrdersByStatus(status);
}
export function createChangeOrder(
  dto: ChangeOrderCreateDto,
  lineItems: ChangeOrderLineItem[],
  recommendedTotal: number
): ChangeOrder {
  return ChangeOrderService.createChangeOrder(dto, lineItems, recommendedTotal);
}
export function updateChangeOrder(
  id: string,
  dto: ChangeOrderUpdateDto
): ChangeOrder | undefined {
  return ChangeOrderService.updateChangeOrder(id, dto);
}
export function setCurrentRecommendation(
  changeOrderId: string,
  recommendationId: string
): void {
  ChangeOrderService.setCurrentRecommendation(changeOrderId, recommendationId);
}
