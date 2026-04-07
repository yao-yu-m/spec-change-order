/**
 * AuditRecord repository – append-only audit log.
 * In production: INSERT-only SQL table; never UPDATE or DELETE.
 */

import type { AuditRecord, AuditEventType } from "@/lib/domain/types";
import { activityStore, ensureSeeded, generateId } from "@/lib/data/store";

export const AuditRepository = {
  findByChangeOrderId(changeOrderId: string): AuditRecord[] {
    ensureSeeded();
    return activityStore
      .filter((e) => e.changeOrderId === changeOrderId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as AuditRecord[];
  },

  append(
    changeOrderId: string,
    eventType: AuditEventType,
    description: string,
    options?: { userId?: string; userName?: string; payload?: Record<string, unknown> }
  ): AuditRecord {
    ensureSeeded();
    const record: AuditRecord = {
      id: generateId("aud"),
      changeOrderId,
      eventType,
      timestamp: new Date().toISOString(),
      description,
      userId: options?.userId,
      userName: options?.userName,
      payload: options?.payload,
    };
    // Cast: ActivityEvent store is compatible with AuditRecord via the alias
    activityStore.push({ ...record, type: record.eventType } as never);
    return record;
  },
};
