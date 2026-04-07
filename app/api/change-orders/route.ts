import { NextRequest, NextResponse } from "next/server";
import { ChangeOrderService } from "@/lib/services/changeOrderService";
import { PricingRecommendationService } from "@/lib/services/pricingRecommendationService";
import { attachCOCookie } from "@/lib/helpers/cookieSync";
import type { ChangeOrderLineItem } from "@/lib/domain/types";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId") ?? undefined;
  const list = ChangeOrderService.listChangeOrders(projectId);
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      projectId,
      title,
      description,
      requester,
      laborHours,
      materialTotal,
      equipmentTotal,
      subcontractorTotal,
      costCode,
    } = body;

    if (
      !projectId ||
      !title ||
      !description ||
      typeof laborHours !== "number" ||
      typeof materialTotal !== "number" ||
      typeof equipmentTotal !== "number"
    ) {
      return NextResponse.json(
        { error: "Missing or invalid required fields" },
        { status: 400 }
      );
    }

    const lineItems: ChangeOrderLineItem[] = [
      {
        id: `li-${Date.now()}-1`,
        changeOrderId: "",
        sequence: 1,
        description,
        category: "Labor",
        createdAt: new Date().toISOString(),
      },
    ];

    const { recommendation } = PricingRecommendationService.generateAndStoreRecommendation({
      changeOrderId: "",
      projectId,
      laborHours,
      materialTotal,
      equipmentTotal,
      subcontractorTotal: subcontractorTotal ?? 0,
      scopeSummary: description,
      costCode,
      requestedBy: requester,
    });

    const co = ChangeOrderService.createChangeOrder(
      {
        projectId,
        title,
        description,
        requester,
        laborHours,
        materialTotal,
        equipmentTotal,
        subcontractorTotal,
        costCode,
        createdBy: requester,
      },
      lineItems,
      recommendation.recommendedTotal
    );

    // Fix up FK and link the recommendation generated before co.id existed
    co.scopeItems?.forEach((s) => { s.changeOrderId = co.id; });
    co.currentRecommendationId = recommendation.id;

    const res = NextResponse.json(co);
    attachCOCookie(res, co);
    return res;
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to create change order" },
      { status: 500 }
    );
  }
}
