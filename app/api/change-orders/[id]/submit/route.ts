import { NextRequest, NextResponse } from "next/server";
import { ChangeOrderService } from "@/lib/services/changeOrderService";
import { ApprovalWorkflowService } from "@/lib/services/approvalWorkflowService";
import { restoreCOFromCookie, attachCOCookie } from "@/lib/helpers/cookieSync";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  restoreCOFromCookie(req, id);
  const co = ChangeOrderService.getChangeOrderById(id);
  if (!co) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Block only fully terminal states — allow re-submission from any active state
  const terminalStatuses = ["Approved", "Synced", "Rejected"];
  if (terminalStatuses.includes(co.status)) {
    return NextResponse.json(
      { error: `Cannot submit — record is already ${co.status}` },
      { status: 400 }
    );
  }

  const ok = ApprovalWorkflowService.submitForApproval(id);
  if (!ok) return NextResponse.json({ error: "Submit failed" }, { status: 500 });

  const updated = ChangeOrderService.getChangeOrderById(id);
  const res = NextResponse.json(updated);
  if (updated) attachCOCookie(res, updated);
  return res;
}
