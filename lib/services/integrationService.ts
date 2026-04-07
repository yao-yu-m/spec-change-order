/**
 * IntegrationService – manages registered adapters and sync status.
 * Delegates to in-memory integration store; bridges to adapter layer.
 */

import type { IntegrationConnection } from "@/lib/domain/types";
import { integrationStore, ensureSeeded } from "@/lib/data/store";

export const IntegrationService = {
  listConnections(): IntegrationConnection[] {
    ensureSeeded();
    return [...integrationStore];
  },

  getConnectionBySystem(
    system: IntegrationConnection["system"]
  ): IntegrationConnection | undefined {
    ensureSeeded();
    return integrationStore.find((c) => c.system === system);
  },
};

// ─── Free function aliases for backward compatibility ──────────────────────

export function listConnections(): IntegrationConnection[] {
  return IntegrationService.listConnections();
}
export function getConnectionBySystem(
  system: IntegrationConnection["system"]
): IntegrationConnection | undefined {
  return IntegrationService.getConnectionBySystem(system);
}
