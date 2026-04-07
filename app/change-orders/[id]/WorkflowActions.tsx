"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ApprovalStatus } from "@/lib/domain/types";

export function WorkflowActions({
  changeOrderId,
  status,
  recommendedTotal,
  hasCostCode,
}: {
  changeOrderId: string;
  status: ApprovalStatus;
  recommendedTotal: number;
  hasCostCode: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function submitForReview() {
    if (!confirm) { setConfirm(true); return; }
    if (!note.trim()) { setError("ERR: Internal routing note is required before submission."); return; }
    setLoading(true);
    setError("");
    try {
      // For Draft → In Review: just patch status via update
      const res = await fetch(`/api/change-orders/${changeOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "In Review" }),
      });
      if (!res.ok) throw new Error("Status update failed");
      // Hard navigate to refresh server component with updated status
      router.push(`/change-orders/${changeOrderId}`);
    } catch {
      setError("ERR-400: Status update failed. Try again or contact system admin.");
    } finally {
      setLoading(false);
    }
  }

  async function submitForApproval() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/change-orders/${changeOrderId}/submit`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Submit failed");
      }
      // Navigate directly to the Approval tab — more reliable than router.refresh()
      router.push(`/change-orders/${changeOrderId}/approval`);
    } catch (e: unknown) {
      setError(`ERR: ${e instanceof Error ? e.message : "Submit failed"}`);
      setLoading(false);
    }
  }

  if (status === "Draft") {
    const blockers = [
      !hasCostCode && "Cost code not assigned",
      !note.trim() && confirm && "Internal routing note required",
    ].filter(Boolean);

    return (
      <div>
        {!confirm ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn-secondary" onClick={() => setConfirm(true)}>
              Submit for Field Review
            </button>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              Moves record to IN REVIEW. Pricing must be completed separately.
            </span>
          </div>
        ) : (
          <div style={{ border: "1px solid var(--border)", background: "var(--bg-panel-alt)", padding: "8px 10px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: "var(--text-label)" }}>
              CONFIRM: Submit CO-{changeOrderId.toUpperCase()} for Field Review
            </div>
            {!hasCostCode && (
              <div className="notice-warn" style={{ marginBottom: 6, fontSize: 11 }}>
                ⚠ Cost code is missing. Record can be submitted but must be updated before approval.
              </div>
            )}
            <div style={{ marginBottom: 6 }}>
              <div className="field-label" style={{ marginBottom: 2 }}>
                Internal Routing Note <span style={{ color: "var(--error-text)" }}>*</span>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter routing note for field review team (required)"
                style={{ width: "100%", fontSize: 11, minHeight: 40, resize: "vertical" }}
              />
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>
                Note will not be sent automatically. You must notify the review team separately.
              </div>
            </div>
            {blockers.length > 0 && error && (
              <div className="notice-error" style={{ marginBottom: 6 }}>{error}</div>
            )}
            {error && <div className="notice-error" style={{ marginBottom: 6 }}>{error}</div>}
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-primary" onClick={submitForReview} disabled={loading}>
                {loading ? "Submitting..." : "Confirm — Submit for Review"}
              </button>
              <button className="btn-secondary" onClick={() => { setConfirm(false); setError(""); setNote(""); }}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === "In Review") {
    return (
      <div>
        <div className="notice-warn" style={{ marginBottom: 8 }}>
          ⚠ Record is IN REVIEW. Pricing estimate is not required to submit for approval — enter the agreed value in the approval form.
          AI-assisted pricing is available on the <strong>Pricing</strong> tab but is optional at this stage.
        </div>
        {error && <div className="notice-error" style={{ marginBottom: 6 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={submitForApproval} disabled={loading}>
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>
          <button className="btn-secondary" onClick={() => router.push(`/change-orders/${changeOrderId}/pricing`)}>
            Generate AI Pricing (optional) →
          </button>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Approver must be notified manually. ERP sync will not trigger automatically.
          </span>
        </div>
      </div>
    );
  }

  if (status === "Priced") {
    return (
      <div>
        <div className="notice-info" style={{ marginBottom: 8 }}>
          Pricing estimate is on record (${recommendedTotal.toFixed(2)}).
          Record must be explicitly submitted for approval — this does not happen automatically.
        </div>
        {error && <div className="notice-error" style={{ marginBottom: 6 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-primary" onClick={submitForApproval} disabled={loading}>
            {loading ? "Submitting..." : "Submit for Approval"}
          </button>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Status will change to PENDING APPROVAL. Approver must be notified manually.
          </span>
        </div>
      </div>
    );
  }

  if (status === "Pending Approval") {
    return (
      <div className="notice-info">
        Record is PENDING APPROVAL. Navigate to the <strong>Approval</strong> tab to record the decision.
        <button
          className="btn-secondary"
          style={{ marginLeft: 10 }}
          onClick={() => router.push(`/change-orders/${changeOrderId}/approval`)}
        >
          Go to Approval Tab →
        </button>
      </div>
    );
  }

  if (status === "Approved") {
    return (
      <div className="notice-info" style={{ color: "var(--success-text)", background: "var(--success-bg)", borderColor: "var(--success-border)" }}>
        ✓ APPROVED. Final total: ${recommendedTotal.toFixed(2)}. ERP sync pending — trigger manually or wait for scheduled sync.
      </div>
    );
  }

  if (status === "Rejected") {
    return (
      <div className="notice-error">
        ✗ REJECTED. Record must be revised and re-submitted. Update scope and pricing, then change status back to Draft.
      </div>
    );
  }

  return null;
}
