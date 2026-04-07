"use client";

import { useState } from "react";

export function ApprovalForm({
  changeOrderId,
  recommendedTotal,
}: {
  changeOrderId: string;
  recommendedTotal: number;
}) {
  const [action, setAction] = useState<"approve" | "reject" | "revise" | null>(null);
  const [finalTotal, setFinalTotal] = useState(recommendedTotal > 0 ? String(recommendedTotal) : "");
  const [approvedBy, setApprovedBy] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ action: string; message: string } | null>(null);

  const isOverride = recommendedTotal > 0 && parseFloat(finalTotal) !== recommendedTotal;

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const value = parseFloat(finalTotal);
    if (isNaN(value) || value < 0) { setError("ERR: Invalid final total."); return; }
    if (!approvedBy.trim()) { setError("ERR: Approver name / ID is required."); return; }
    if (isOverride && !comment.trim()) {
      setError("ERR: Override justification is required when final amount differs from recommended.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/change-orders/${changeOrderId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedBy: approvedBy.trim(), finalTotal: value, comment: comment.trim() || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Approve failed");
      }
      setDone({ action: "APPROVED", message: `Change order approved by ${approvedBy.trim()}. Final amount: $${value.toFixed(2)}. Status updated to APPROVED.` });
    } catch (e: unknown) {
      setError(`ERR-500: ${e instanceof Error ? e.message : "Approval action failed. Contact system administrator."}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!approvedBy.trim()) { setError("ERR: Rejector name / ID is required."); return; }
    if (!comment.trim()) { setError("ERR: Rejection reason is required — cannot reject without written justification."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/change-orders/${changeOrderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectedBy: approvedBy.trim(), comment: comment.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Reject failed");
      }
      setDone({ action: "REJECTED", message: `Change order rejected by ${approvedBy.trim()}. Reason recorded. Status updated to REJECTED.` });
    } catch (e: unknown) {
      setError(`ERR-500: ${e instanceof Error ? e.message : "Rejection failed."}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevise(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!approvedBy.trim()) { setError("ERR: Requestor name / ID is required."); return; }
    if (!comment.trim()) { setError("ERR: Revision instructions are required."); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/change-orders/${changeOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Needs Revision", modifiedBy: approvedBy.trim() }),
      });
      if (!res.ok) throw new Error("Status update failed");
      setDone({ action: "REVISION REQUESTED", message: `Record sent back for revision by ${approvedBy.trim()}. Submitter must be notified manually. Status updated to NEEDS REVISION.` });
    } catch {
      setError("ERR-500: Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    const isApproved = done.action === "APPROVED";
    const isRejected = done.action === "REJECTED";
    return (
      <div
        style={{
          padding: "10px 14px",
          border: `1px solid ${isApproved ? "var(--success-border)" : isRejected ? "var(--error-border)" : "var(--warning-border)"}`,
          background: isApproved ? "var(--success-bg)" : isRejected ? "var(--error-bg)" : "var(--warning-bg)",
          color: isApproved ? "var(--success-text)" : isRejected ? "var(--error-text)" : "var(--warning-text)",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
          ✓ DECISION RECORDED — {done.action}
        </div>
        <div style={{ fontSize: 12, marginBottom: 10 }}>{done.message}</div>
        <button
          className="btn-primary"
          onClick={() => {
            // Hard reload to bypass Next.js router cache so updated status is visible
            window.location.href = `/change-orders/${changeOrderId}`;
          }}
        >
          View Updated Record →
        </button>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
          Decision written to audit trail. Click above to reload the record and confirm status change.
        </div>
      </div>
    );
  }

  if (!action) {
    return (
      <div>
        <div className="notice-warn" style={{ marginBottom: 10 }}>
          Select an action below. All decisions are recorded to the audit trail and cannot be undone.
          Approver must be notified of outcome separately — this system does not send notifications.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" onClick={() => setAction("approve")}>
            Record Approval
          </button>
          <button className="btn-secondary" onClick={() => setAction("reject")}>
            Record Rejection
          </button>
          <button className="btn-secondary" onClick={() => setAction("revise")}>
            Request Revision
          </button>
        </div>
      </div>
    );
  }

  const isApprove = action === "approve";
  const isReject = action === "reject";

  return (
    <form onSubmit={isApprove ? handleApprove : isReject ? handleReject : handleRevise}>
      {/* Action header */}
      <div
        style={{
          padding: "4px 8px",
          marginBottom: 8,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.03em",
          borderLeft: `3px solid ${isApprove ? "var(--success-text)" : isReject ? "var(--error-text)" : "var(--warning-text)"}`,
          background: isApprove ? "var(--success-bg)" : isReject ? "var(--error-bg)" : "var(--warning-bg)",
          color: isApprove ? "var(--success-text)" : isReject ? "var(--error-text)" : "var(--warning-text)",
        }}
      >
        {isApprove ? "RECORDING APPROVAL" : isReject ? "RECORDING REJECTION" : "REQUESTING REVISION"}
        {" — "}
        {isApprove ? "All fields must be completed. Amount override requires written justification."
          : isReject ? "Rejection reason is mandatory."
          : "Revision instructions will be recorded but NOT sent automatically."}
      </div>

      <table style={{ marginBottom: 8 }}>
        <tbody>
          {isApprove && (
            <tr>
              <td className="field-label" style={{ whiteSpace: "nowrap", paddingRight: 12, paddingBottom: 4 }}>
                Final Approved Amount ($) <span style={{ color: "var(--error-text)" }}>*</span>
              </td>
              <td style={{ paddingBottom: 4 }}>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={finalTotal}
                  onChange={(e) => setFinalTotal(e.target.value)}
                  style={{ width: 120 }}
                  required
                />
              </td>
              <td className={isOverride ? "warn-cell" : ""} style={{ paddingLeft: 10, fontSize: 10, fontWeight: 700 }}>
                {isOverride ? `⚠ OVERRIDE — differs from recommended ($${recommendedTotal.toFixed(2)}). Justification required.` : `Matches recommended ($${recommendedTotal.toFixed(2)})`}
              </td>
            </tr>
          )}
          <tr>
            <td className="field-label" style={{ whiteSpace: "nowrap", paddingRight: 12, paddingBottom: 4 }}>
              {isApprove ? "Approver Name / ID" : isReject ? "Rejected By (Name / ID)" : "Requestor Name / ID"}{" "}
              <span style={{ color: "var(--error-text)" }}>*</span>
            </td>
            <td style={{ paddingBottom: 4 }}>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="Last, First / Employee ID"
                style={{ width: 220 }}
                required
              />
            </td>
            <td style={{ paddingLeft: 10, fontSize: 10, color: "var(--text-muted)" }}>
              Must match name in HR directory exactly
            </td>
          </tr>
          <tr>
            <td className="field-label" style={{ whiteSpace: "nowrap", paddingRight: 12 }}>
              {isApprove ? "Comment / Justification" : isReject ? "Rejection Reason" : "Revision Instructions"}{" "}
              {(!isApprove || isOverride) && <span style={{ color: "var(--error-text)" }}>*</span>}
            </td>
            <td colSpan={2}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                style={{ width: 460 }}
                placeholder={
                  isReject ? "Required — describe reason for rejection"
                  : isOverride ? "Required — justify override amount"
                  : "Optional for standard approval, required if override"
                }
                required={isReject || (isApprove && isOverride)}
              />
            </td>
          </tr>
        </tbody>
      </table>

      {error && <div className="notice-error" style={{ marginBottom: 8 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? "Processing..."
            : isApprove ? "Confirm Approval — Record Decision"
            : isReject ? "Confirm Rejection — Record Decision"
            : "Confirm — Send Back for Revision"}
        </button>
        <button type="button" className="btn-secondary" onClick={() => { setAction(null); setError(""); }}>
          ← Back
        </button>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          Decision will be written to the audit trail and cannot be reversed in this system.
        </span>
      </div>
    </form>
  );
}
