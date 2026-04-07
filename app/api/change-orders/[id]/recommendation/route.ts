import { NextResponse } from "next/server";
import { ChangeOrderService } from "@/lib/services/changeOrderService";
import { PricingRecommendationService } from "@/lib/services/pricingRecommendationService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const co = ChangeOrderService.getChangeOrderById(id);
  if (!co) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let rec = PricingRecommendationService.getCurrentRecommendation(id);
  if (!rec) {
    const result = PricingRecommendationService.generateAndStoreRecommendation({
      changeOrderId: id,
      projectId: co.projectId,
      laborHours: co.laborHours,
      materialTotal: co.materialTotal,
      equipmentTotal: co.equipmentTotal,
      subcontractorTotal: co.subcontractorTotal,
      scopeSummary: co.description,
      costCode: co.costCode,
    });
    rec = result.recommendation;
  }
  return NextResponse.json(rec);
}
