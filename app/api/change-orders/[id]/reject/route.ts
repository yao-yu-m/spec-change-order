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

  const body = await req.json();
  const { rejectedBy, comment } = body;
  if (!rejectedBy?.trim()) {
    return NextResponse.json({ error: "rejectedBy is required" }, { status: 400 });
  }
  if (!comment?.trim()) {
    return NextResponse.json({ error: "Rejection reason (comment) is required" }, { status: 400 });
  }

  const ok = ApprovalWorkflowService.reject(id, rejectedBy.trim(), comment.trim());
  if (!ok) return NextResponse.json({ error: "Reject failed" }, { status: 500 });

  const updated = ChangeOrderService.getChangeOrderById(id);
  const res = NextResponse.json(updated);
  if (updated) attachCOCookie(res, updated);
  return res;
}
