/**
 * ChangeOrder repository – raw data access only.
 * In production: replace with EF Core / Dapper calls against SQL Server.
 * No business logic; only CRUD and filtered reads.
 */

import type { ChangeOrder, ApprovalStatus } from "@/lib/domain/types";
import { changeOrderStore, ensureSeeded, generateId } from "@/lib/data/store";

export const ChangeOrderRepository = {
  findAll(projectId?: string): ChangeOrder[] {
    ensureSeeded();
    if (projectId) return changeOrderStore.filter((c) => c.projectId === projectId);
    return [...changeOrderStore];
  },

  findById(id: string): ChangeOrder | undefined {
    ensureSeeded();
    return changeOrderStore.find((c) => c.id === id);
  },

  findByStatus(status: ApprovalStatus): ChangeOrder[] {
    ensureSeeded();
    return changeOrderStore.filter((c) => c.status === status);
  },

  findByProjectId(projectId: string): ChangeOrder[] {
    ensureSeeded();
    return changeOrderStore.filter((c) => c.projectId === projectId);
  },

  insert(entity: Omit<ChangeOrder, "id">): ChangeOrder {
    ensureSeeded();
    const record: ChangeOrder = { id: generateId("co"), ...entity };
    changeOrderStore.push(record);
    return record;
  },

  update(id: string, patch: Partial<ChangeOrder>): ChangeOrder | undefined {
    const idx = changeOrderStore.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    Object.assign(changeOrderStore[idx], patch, { updatedAt: new Date().toISOString() });
    return changeOrderStore[idx];
  },

  exists(id: string): boolean {
    ensureSeeded();
    return changeOrderStore.some((c) => c.id === id);
  },
};
