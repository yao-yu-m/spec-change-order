/**
 * POST /api/change-orders/{id}/generate-pricing
 * Triggers AI pricing orchestration for a change order.
 * Returns a fully typed PricingRecommendation.
 */

import { NextRequest, NextResponse } from "next/server";
import { ChangeOrderService } from "@/lib/services/changeOrderService";
import { PricingRecommendationService } from "@/lib/services/pricingRecommendationService";
import { restoreCOFromCookie, attachCOCookie } from "@/lib/helpers/cookieSync";
import type { GeneratePricingRequestDto } from "@/lib/domain/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  restoreCOFromCookie(req, id);
  const co = ChangeOrderService.getChangeOrderById(id);
  if (!co) {
    return NextResponse.json({ error: "Change order not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const requestedBy: string | undefined = body.requestedBy;

  const request: GeneratePricingRequestDto = {
    changeOrderId: id,
    projectId: co.projectId,
    laborHours: co.laborHours,
    materialTotal: co.materialTotal,
    equipmentTotal: co.equipmentTotal,
    subcontractorTotal: co.subcontractorTotal,
    scopeSummary: co.description,
    costCode: co.costCode,
    requestedBy,
  };

  const { recommendation, warnings } = PricingRecommendationService.generateAndStoreRecommendation(request);
  const updated = ChangeOrderService.getChangeOrderById(id);
  const res = NextResponse.json({ recommendation, warnings, changeOrder: updated });
  if (updated) attachCOCookie(res, updated);
  return res;
}
