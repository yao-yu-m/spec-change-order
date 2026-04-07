export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChangeOrderService } from "@/lib/services/changeOrderService";
import { ProjectService } from "@/lib/services/projectService";
import { StatusBadge } from "@/components/domain/StatusBadge";

export default function ChangeOrderRegisterPage() {
  const projects = ProjectService.listProjects();
  const changeOrders = ChangeOrderService.listChangeOrders();
  const drafts = changeOrders.filter((c) => c.status === "Draft").length;
  const unpricedCount = changeOrders.filter((c) => c.recommendedTotal === 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <div className="toolbar-strip">
        <span className="toolbar-label">CHANGE ORDER REGISTER</span>
        <span className="toolbar-sep">|</span>
        <Link href="/intake" className="btn-primary" style={{ textDecoration: "none" }}>+ New CO</Link>
        <button className="btn-toolbar">Filter</button>
        <button className="btn-toolbar">Sort</button>
        <button className="btn-toolbar">Export CSV</button>
        <button className="btn-toolbar">Print</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
          {changeOrders.length} records · {drafts} draft(s) · {unpricedCount} unpriced
        </span>
      </div>

      {/* Warning banner */}
      {(drafts > 0 || unpricedCount > 0) && (
        <div className="notice-warn" style={{ margin: "6px 10px 0" }}>
          <strong>REGISTER NOTICES: </strong>
          {drafts > 0 && <span>{drafts} record(s) in DRAFT — not yet submitted for review. </span>}
          {unpricedCount > 0 && <span>{unpricedCount} record(s) have no AI pricing estimate — manual pricing required. </span>}
          <span>ERP sync incomplete — Pending approval records not yet posted. </span>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "6px 10px 10px" }}>
        <div className="panel">
          <div className="panel-header" style={{ justifyContent: "flex-start", gap: 12 }}>
            <span>CHANGE ORDERS</span>
            <span style={{ fontSize: 10, color: "var(--text-secondary)", fontWeight: 400, textTransform: "none", letterSpacing: "normal" }}>
              Filter: ALL STATUS · ALL PROJECTS · Current Period
            </span>
          </div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>CO Number</th>
                  <th>Project</th>
                  <th>Cost Code</th>
                  <th>Title</th>
                  <th>Requester</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Labor (hrs)</th>
                  <th style={{ textAlign: "right" }}>Material ($)</th>
                  <th style={{ textAlign: "right" }}>Equip. ($)</th>
                  <th style={{ textAlign: "right" }}>Sub ($)</th>
                  <th style={{ textAlign: "right" }}>Est. Value ($)</th>
                  <th style={{ textAlign: "right" }}>Final ($)</th>
                  <th>Submitted</th>
                  <th>ERP Sync</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {changeOrders.map((co, idx) => {
                  const proj = projects.find((p) => p.id === co.projectId);
                  const bd = co.currentRecommendationId ? null : null;
                  void bd;
                  return (
                    <tr key={co.id}>
                      <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                      <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        <Link href={`/change-orders/${co.id}`} style={{ color: "var(--blue)", textDecoration: "underline" }}>
                          {co.changeOrderNumber}
                        </Link>
                      </td>
                      <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{proj?.projectNumber ?? "—"}</td>
                      <td className={!co.costCode ? "warn-cell" : ""} style={{ fontSize: 11 }}>
                        {co.costCode ?? "MISSING"}
                      </td>
                      <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{co.title}</td>
                      <td>{co.requester ?? "—"}</td>
                      <td><StatusBadge status={co.status} /></td>
                      <td style={{ textAlign: "right" }}>—</td>
                      <td style={{ textAlign: "right" }}>—</td>
                      <td style={{ textAlign: "right" }}>—</td>
                      <td style={{ textAlign: "right" }}>—</td>
                      <td
                        style={{ textAlign: "right", fontWeight: 600 }}
                        className={co.recommendedTotal === 0 ? "warn-cell" : ""}
                      >
                        {co.recommendedTotal > 0 ? co.recommendedTotal.toFixed(2) : "NOT PRICED"}
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>
                        {co.finalTotal > 0 ? co.finalTotal.toFixed(2) : "—"}
                      </td>
                      <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                        {co.dateSubmitted ? new Date(co.dateSubmitted).toLocaleDateString() : "—"}
                      </td>
                      <td
                        style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}
                        className={co.status === "Approved" ? "warn-cell" : ""}
                      >
                        {co.status === "Approved" ? "PENDING" : "—"}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {co.status === "Pending Approval" ? (
                          <Link
                            href={`/change-orders/${co.id}/approval`}
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#fff",
                              background: "var(--blue)",
                              padding: "2px 8px",
                              textDecoration: "none",
                              display: "inline-block",
                            }}
                          >
                            Review &amp; Approve →
                          </Link>
                        ) : co.status === "Draft" || co.status === "In Review" ? (
                          <Link
                            href={`/change-orders/${co.id}`}
                            style={{ fontSize: 11, color: "var(--blue)", textDecoration: "underline" }}
                          >
                            Continue →
                          </Link>
                        ) : (
                          <Link
                            href={`/change-orders/${co.id}`}
                            style={{ fontSize: 11, color: "var(--text-secondary)", textDecoration: "underline" }}
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>{changeOrders.length} total records</span>
        <span>{drafts} Draft</span>
        <span>{unpricedCount} Unpriced</span>
        <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>ERP Sync: PENDING</span>
      </div>
    </div>
  );
}
