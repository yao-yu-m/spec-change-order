/**
 * AuditService – append-only audit trail.
 * Delegates to AuditRepository; wraps ActivityEvent alias for backward compat.
 */

import type { ActivityEvent, AuditEventType, AuditRecord } from "@/lib/domain/types";
import { AuditRepository } from "@/lib/repositories/auditRepository";

export const AuditService = {
  getAuditTrail(changeOrderId: string): AuditRecord[] {
    return AuditRepository.findByChangeOrderId(changeOrderId);
  },

  recordEvent(
    changeOrderId: string,
    eventType: AuditEventType,
    description: string,
    options?: { userId?: string; userName?: string; payload?: Record<string, unknown> }
  ): AuditRecord {
    return AuditRepository.append(changeOrderId, eventType, description, options);
  },
};

// ─── Free function aliases for backward compatibility ──────────────────────

export function getActivityByChangeOrderId(changeOrderId: string): ActivityEvent[] {
  return AuditRepository.findByChangeOrderId(changeOrderId).map((r) => ({
    ...r,
    type: r.eventType,
  }));
}

export function recordActivity(
  changeOrderId: string,
  type: AuditEventType,
  description: string,
  userId?: string,
  userName?: string,
  payload?: Record<string, unknown>
): ActivityEvent {
  const record = AuditRepository.append(changeOrderId, type, description, {
    userId,
    userName,
    payload,
  });
  return { ...record, type: record.eventType };
}
