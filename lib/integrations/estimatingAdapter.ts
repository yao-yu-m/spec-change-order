/**
 * Estimating adapter – reads unit costs and assemblies from Estimation MEP / WinEst.
 * In production: query .NET microservice or Mongo-backed estimating API.
 */

import type { ChangeOrderLineItem } from "@/lib/domain/types";

export interface EstimatingLineItem {
  CostCode: string;
  Description: string;
  Unit: string;
  UnitCost: number;
  LaborHoursPerUnit?: number;
}

/** Mock unit cost lookup – production queries the estimating system database. */
const MOCK_UNIT_COSTS: Record<string, EstimatingLineItem> = {
  "26-0500": {
    CostCode: "26-0500",
    Description: '1" EMT Conduit',
    Unit: "LF",
    UnitCost: 2.85,
    LaborHoursPerUnit: 0.05,
  },
  "26-4100": {
    CostCode: "26-4100",
    Description: "Distribution panel",
    Unit: "EA",
    UnitCost: 1100,
    LaborHoursPerUnit: 12,
  },
  "03-1100": {
    CostCode: "03-1100",
    Description: "Cast-in-place concrete",
    Unit: "CY",
    UnitCost: 180,
    LaborHoursPerUnit: 2.5,
  },
};

export async function lookupUnitCost(
  costCode: string
): Promise<EstimatingLineItem | undefined> {
  // Production: await estimatingApiClient.get(`/unit-costs/${costCode}`)
  return MOCK_UNIT_COSTS[costCode];
}

export function enrichLineItemFromEstimating(
  lineItem: ChangeOrderLineItem,
  estimate: EstimatingLineItem
): ChangeOrderLineItem {
  return {
    ...lineItem,
    unitCost: estimate.UnitCost,
    totalCost:
      lineItem.quantity != null ? lineItem.quantity * estimate.UnitCost : undefined,
  };
}
