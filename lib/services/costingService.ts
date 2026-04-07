/**
 * CostingService – calculates cost totals and validates cost inputs.
 * Separated from PricingRecommendationService so costing logic is reusable
 * independent of AI orchestration (e.g. for manual edits and cost code lookups).
 */

import { PRICING_RULES } from "@/lib/ai/promptTemplates";
import type { CostBreakdown, ChangeOrderLineItem } from "@/lib/domain/types";

export interface CostingSummary {
  laborTotal: number;
  materialTotal: number;
  equipmentTotal: number;
  subcontractorTotal: number;
  subtotal: number;
  marginAmount: number;
  total: number;
}

export const CostingService = {
  /**
   * Calculate cost breakdown from raw inputs.
   * Applies standard labor rate and equipment markup.
   */
  calculateCostBreakdown(
    laborHours: number,
    materialTotal: number,
    equipmentTotal: number,
    subcontractorTotal: number,
    marginPercent: number = PRICING_RULES.defaultMarginPercent
  ): CostBreakdown {
    const laborTotal = Math.round(laborHours * PRICING_RULES.laborRatePerHour * 100) / 100;
    const equipmentWithMarkup =
      Math.round(equipmentTotal * PRICING_RULES.equipmentMarkupFactor * 100) / 100;
    const subtotal = laborTotal + materialTotal + equipmentWithMarkup + subcontractorTotal;
    const total = Math.round(subtotal * (1 + marginPercent / 100) * 100) / 100;
    return {
      laborHours,
      laborRate: PRICING_RULES.laborRatePerHour,
      laborTotal,
      materialTotal,
      equipmentTotal: equipmentWithMarkup,
      subcontractorTotal,
      total,
      marginPercent,
    };
  },

  /**
   * Aggregate cost totals from a set of line items.
   * Equivalent to a SQL SUM() grouped by category.
   */
  aggregateLineItems(lineItems: ChangeOrderLineItem[]): CostingSummary {
    let laborHours = 0;
    let materialTotal = 0;
    let equipmentTotal = 0;
    let subcontractorTotal = 0;

    for (const item of lineItems) {
      const cost = item.totalCost ?? 0;
      switch (item.category) {
        case "Labor":
          laborHours += item.quantity ?? 0;
          break;
        case "Material":
          materialTotal += cost;
          break;
        case "Equipment":
          equipmentTotal += cost;
          break;
        case "Subcontractor":
          subcontractorTotal += cost;
          break;
      }
    }

    const laborTotal = Math.round(laborHours * PRICING_RULES.laborRatePerHour * 100) / 100;
    const subtotal = laborTotal + materialTotal + equipmentTotal + subcontractorTotal;
    const marginAmount = Math.round(
      subtotal * (PRICING_RULES.defaultMarginPercent / 100) * 100
    ) / 100;

    return {
      laborTotal,
      materialTotal,
      equipmentTotal,
      subcontractorTotal,
      subtotal,
      marginAmount,
      total: subtotal + marginAmount,
    };
  },
};
