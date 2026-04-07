/**
 * Change order view models – maps domain entities to UI-ready shapes.
 * Keeps display formatting out of domain models (separation of concerns).
 */

import type { ChangeOrder, ApprovalStatus } from "@/lib/domain/types";

export interface ChangeOrderListRowViewModel {
  id: string;
  changeOrderNumber: string;
  title: string;
  status: ApprovalStatus;
  recommendedTotal: string;   // formatted
  finalTotal: string;         // formatted
  dateSubmitted: string;      // formatted
  requester: string;
}

export function toChangeOrderListRow(co: ChangeOrder): ChangeOrderListRowViewModel {
  return {
    id: co.id,
    changeOrderNumber: co.changeOrderNumber,
    title: co.title,
    status: co.status,
    recommendedTotal: formatCurrency(co.recommendedTotal),
    finalTotal: formatCurrency(co.finalTotal),
    dateSubmitted: co.dateSubmitted
      ? new Date(co.dateSubmitted).toLocaleDateString()
      : "—",
    requester: co.requester ?? "—",
  };
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
