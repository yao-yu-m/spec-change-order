export const dynamic = "force-dynamic";

import Link from "next/link";
import { AuditService } from "@/lib/services/auditService";
import { ProjectService } from "@/lib/services/projectService";
import { StatusBadge } from "@/components/domain/StatusBadge";
import { ChangeOrderDetailLayout } from "../ChangeOrderDetailLayout";
import { ApprovalForm } from "./ApprovalForm";
import { DataPanel } from "@/components/domain/DataPanel";
import { getCoOrFallback } from "@/lib/helpers/cookieSync";

export default async function ApprovalPage({ params }: { params: { id: string } }) {
  const co = await getCoOrFallback(params.id);
  if (!co) return (
    <div style={{ padding: 24 }}>
      <div className="notice-error" style={{ marginBottom: 12 }}><strong>RECORD NOT FOUND — {params.id}</strong><br />Server may have restarted. Seeded records are always available.</div>
      <Link href="/change-orders" className="btn-primary" style={{ textDecoration: "none" }}>← Back to Register</Link>
    </div>
  );
  const project = ProjectService.getProjectById(co.projectId) ?? null;
  const history = AuditService.getAuditTrail(params.id);
  const approvalHistory = history.filter((e) => e.eventType.toLowerCase().includes("approv") || e.eventType.toLowerCase().includes("reject"));

  return (
    <ChangeOrderDetailLayout changeOrder={co} project={project}>
      <div className="toolbar-strip" style={{ marginBottom: 8 }}>
        <span className="toolbar-label">APPROVAL WORKFLOW</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-toolbar">Print Approval Form</button>
        <button className="btn-toolbar">Export</button>
      </div>

      {/* Current status */}
      <div className="panel">
        <div className="panel-header">CURRENT STATUS</div>
        <div style={{ padding: 0 }}>
          <table>
            <tbody>
              <tr>
                <th style={{ width: 180 }}>Approval Status</th>
                <td><StatusBadge status={co.status} /></td>
                <th style={{ width: 180 }}>Date Submitted</th>
                <td style={{ color: "var(--text-secondary)" }}>
                  {co.dateSubmitted ? new Date(co.dateSubmitted).toLocaleDateString() : "Not submitted"}
                </td>
              </tr>
              <tr>
                <th>Recommended Total</th>
                <td style={{ fontWeight: 600, fontFamily: "monospace" }} className={co.recommendedTotal === 0 ? "warn-cell" : ""}>
                  {co.recommendedTotal > 0 ? `$${co.recommendedTotal.toFixed(2)}` : "NOT PRICED"}
                </td>
                <th>Final Approved Total</th>
                <td style={{ fontWeight: 600, fontFamily: "monospace" }}>
                  {co.finalTotal > 0 ? `$${co.finalTotal.toFixed(2)}` : "—"}
                </td>
              </tr>
              <tr>
                <th>Requester</th>
                <td>{co.requester ?? "—"}</td>
                <th>Date Approved</th>
                <td style={{ color: "var(--text-secondary)" }}>
                  {"—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval form */}
      {!["Approved", "Synced", "Rejected"].includes(co.status) && (
        <DataPanel title="APPROVAL ACTION">
          {co.recommendedTotal === 0 && (
            <div className="notice-warn" style={{ marginBottom: 10 }}>
              <strong>NO PRICING ESTIMATE ON RECORD.</strong> AI-assisted pricing has not been generated.
              Enter the agreed final value manually below. This amount will be posted to ERP on next sync.
            </div>
          )}
          <ApprovalForm changeOrderId={params.id} recommendedTotal={co.recommendedTotal} />
        </DataPanel>
      )}

      {/* Approval history */}
      <div className="panel">
        <div className="panel-header">APPROVAL HISTORY</div>
        <div style={{ padding: 0 }}>
          {approvalHistory.length === 0 ? (
            <div style={{ padding: 8, fontSize: 12, color: "var(--text-secondary)" }}>No approval actions recorded.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Event</th>
                  <th>Approved By</th>
                  <th>Date</th>
                  <th>Comment</th>
                  <th style={{ textAlign: "right" }}>Final vs. Est. ($)</th>
                </tr>
              </thead>
              <tbody>
                {approvalHistory.map((r, i) => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{r.eventType}</td>
                    <td>{r.userName ?? "—"}</td>
                    <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {new Date(r.timestamp).toLocaleDateString()}
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 11 }}>{r.description}</td>
                    <td style={{ textAlign: "right" }}>—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </ChangeOrderDetailLayout>
  );
}
