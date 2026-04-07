import { NextResponse } from "next/server";
import { ChangeOrderService } from "@/lib/services/changeOrderService";
import { ApprovalWorkflowService } from "@/lib/services/approvalWorkflowService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const co = ChangeOrderService.getChangeOrderById(id);
  if (!co) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const steps = ApprovalWorkflowService.getApprovalSteps(id);
  return NextResponse.json(steps);
}
