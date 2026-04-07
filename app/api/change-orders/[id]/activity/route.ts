import { NextResponse } from "next/server";
import { ChangeOrderService } from "@/lib/services/changeOrderService";
import { AuditService } from "@/lib/services/auditService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const co = ChangeOrderService.getChangeOrderById(id);
  if (!co) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const records = AuditService.getAuditTrail(id);
  return NextResponse.json(records);
}
