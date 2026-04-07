/**
 * Context builder – assembles structured PricingContext from domain data.
 * In production: populates the LLM context window with project history,
 * comparable COs, and cost codes from connected ERP/estimating systems.
 */

import type { ChangeOrder, Project, PricingContext } from "@/lib/domain/types";

export interface ContextBuildInput {
  changeOrder: ChangeOrder;
  project?: Project | null;
  historicalComparables?: string[];
}

/**
 * Builds a structured PricingContext from a ChangeOrder + related data.
 * This is the single entry point for feeding data into the AI layer.
 */
export function buildPricingContext(input: ContextBuildInput): PricingContext {
  const { changeOrder, project, historicalComparables } = input;
  return {
    changeOrderId: changeOrder.id,
    projectId: changeOrder.projectId,
    projectNumber: project?.projectNumber,
    laborHours: changeOrder.laborHours,
    materialTotal: changeOrder.materialTotal,
    equipmentTotal: changeOrder.equipmentTotal,
    subcontractorTotal: changeOrder.subcontractorTotal,
    scopeSummary: changeOrder.description,
    costCode: changeOrder.costCode,
    historicalComparables: historicalComparables ?? [],
  };
}

/**
 * Derives default historical comparables from the project record.
 * In production: query the estimating system or ERP for similar jobs.
 */
export function resolveHistoricalComparables(
  projectId: string,
  costCode?: string
): string[] {
  // Mock: return fixed references; production would query comparable job DB
  const refs = ["CO-2024-012"];
  if (costCode?.startsWith("26")) refs.push("CO-2023-041");
  return refs;
}
