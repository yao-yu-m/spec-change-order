/**
 * Pricing view models – maps PricingRecommendation to UI-ready shapes.
 */

import type { PricingRecommendation, CostBreakdown } from "@/lib/domain/types";

export interface PricingBreakdownRowViewModel {
  category: string;
  amount: string;
  detail?: string;
}

export function toPricingBreakdownRows(
  breakdown: CostBreakdown
): PricingBreakdownRowViewModel[] {
  const rows: PricingBreakdownRowViewModel[] = [];

  if (breakdown.laborTotal > 0 || breakdown.laborHours > 0) {
    rows.push({
      category: "Labor",
      amount: formatCurrency(breakdown.laborTotal),
      detail: `${breakdown.laborHours} hrs @ $${breakdown.laborRate}/hr`,
    });
  }
  if (breakdown.materialTotal > 0) {
    rows.push({ category: "Material", amount: formatCurrency(breakdown.materialTotal) });
  }
  if (breakdown.equipmentTotal > 0) {
    rows.push({ category: "Equipment", amount: formatCurrency(breakdown.equipmentTotal) });
  }
  if (breakdown.subcontractorTotal > 0) {
    rows.push({
      category: "Subcontractor",
      amount: formatCurrency(breakdown.subcontractorTotal),
    });
  }
  if (breakdown.marginPercent != null) {
    const subtotal =
      breakdown.laborTotal +
      breakdown.materialTotal +
      breakdown.equipmentTotal +
      breakdown.subcontractorTotal;
    const marginAmount = breakdown.total - subtotal;
    rows.push({
      category: `Margin (${breakdown.marginPercent}%)`,
      amount: formatCurrency(marginAmount),
    });
  }

  return rows;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}
