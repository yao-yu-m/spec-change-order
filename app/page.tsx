export const dynamic = "force-dynamic";

import Link from "next/link";
import { ChangeOrderService } from "@/lib/services/changeOrderService";
import { ProjectService } from "@/lib/services/projectService";
import { StatusBadge } from "@/components/domain/StatusBadge";

export default function DashboardPage() {
  const projects = ProjectService.listProjects();
  const changeOrders = ChangeOrderService.listChangeOrders();
  const pending = changeOrders.filter((c) =>
    ["Draft", "In Review", "Priced", "Pending Approval"].includes(c.status)
  );
  const approved = changeOrders.filter((c) => c.status === "Approved");
  const totalBillable = approved.reduce((s, c) => s + c.finalTotal, 0);
  const unpricedCount = changeOrders.filter((c) => c.recommendedTotal === 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Page toolbar */}
      <div className="toolbar-strip">
        <span className="toolbar-label">DASHBOARD — Work Queue</span>
        <span className="toolbar-sep">|</span>
        <Link href="/intake" className="btn-toolbar" style={{ textDecoration: "none" }}>New Change Order</Link>
        <button className="btn-toolbar">Refresh</button>
        <button className="btn-toolbar">Export Summary</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: "var(--warning-text)", fontWeight: 600 }}>⚠ Estimating MEP offline</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 4px" }}>·</span>
        <span style={{ fontSize: 10, color: "var(--success-text)" }}>ERP: connected</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)" }}>
          Session: zara.hall · {new Date().toLocaleString()}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 10 }}>
          {[
            { label: "Active Projects",       value: projects.length,                                                                      warn: false },
            { label: "Total COs",             value: changeOrders.length,                                                                   warn: false },
            { label: "Pending / In Review",   value: pending.length,                                                                        warn: pending.length > 0 },
            { label: "Unpriced Records",      value: unpricedCount,                                                                         warn: unpricedCount > 0 },
            { label: "Approved Billable ($)", value: `$${totalBillable.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,             warn: false },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                background: kpi.warn ? "var(--warning-bg)" : "var(--bg-panel)",
                border: `1px solid ${kpi.warn ? "var(--warning-border)" : "var(--border)"}`,
                padding: "6px 10px",
              }}
            >
              <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{kpi.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: kpi.warn ? "var(--warning-text)" : "var(--text-primary)" }}>
                {kpi.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── WORKSHOP TASKS ─────────────────────────────────────────── */}
        <div style={{
          border: "2px solid var(--blue)",
          background: "var(--info-bg)",
          marginBottom: 10,
          padding: "10px 14px",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", color: "var(--blue)", marginBottom: 8 }}>
            WORKSHOP EXERCISE — PRIMARY WORKFLOWS
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {/* Task 1 */}
            <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-label)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Task 1 — Submit a Change Order
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
                Open the intake form, fill in scope and cost details, and move the record through to <strong>Pending Approval</strong>. This is the &quot;current state&quot; manual flow.
              </div>
              <Link
                href="/intake"
                style={{
                  display: "inline-block",
                  background: "var(--blue)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  padding: "6px 14px",
                  textDecoration: "none",
                  letterSpacing: "0.03em",
                }}
              >
                → Create New Change Order
              </Link>
            </div>
            {/* Task 2 */}
            <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-label)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Task 2 — Review &amp; Approve a Change Order
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
                Open a record that is <strong>Pending Approval</strong>, review the scope and cost summary, and record an approval decision on the Approval tab.
              </div>
              <Link
                href="/change-orders"
                style={{
                  display: "inline-block",
                  background: "var(--blue)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  padding: "6px 14px",
                  textDecoration: "none",
                  letterSpacing: "0.03em",
                }}
              >
                → Open Change Order Register
              </Link>
            </div>
          </div>
        </div>
        {/* ──────────────────────────────────────────────────────────── */}

        {/* System notices */}
        <div className="notice-warn" style={{ marginBottom: 10 }}>
          <strong>SYSTEM NOTICES: </strong>
          {unpricedCount > 0 && <span>{unpricedCount} record(s) have no pricing estimate. </span>}
          <span>Estimating MEP connection lost — manual entry required for new records. </span>
          {approved.length > 0 && <span>{approved.length} approved CO(s) pending ERP sync. </span>}
          <span style={{ fontSize: 10, color: "var(--warning-text)" }}>
            Last ERP sync: 06:00 UTC · Next scheduled: 18:00 UTC
          </span>
        </div>

        {/* Pending work queue */}
        <div className="panel">
          <div className="panel-header">
            PENDING WORK QUEUE — Action Required
            <span style={{ fontSize: 10, fontWeight: 400, color: "var(--warning-text)", textTransform: "none", letterSpacing: "normal" }}>
              {pending.length} item(s) require attention
            </span>
          </div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>CO Number</th>
                  <th>Project</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Requester</th>
                  <th style={{ textAlign: "right" }}>Est. Value ($)</th>
                  <th>Missing</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)" }}>No pending items.</td></tr>
                ) : (
                  pending.map((co) => {
                    const proj = projects.find((p) => p.id === co.projectId);
                    const missing = [
                      !co.costCode && "Cost code",
                      co.recommendedTotal === 0 && "Pricing",
                    ].filter(Boolean);
                    return (
                      <tr key={co.id}>
                        <td style={{ fontWeight: 600, color: "var(--blue)" }}>{co.changeOrderNumber}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{proj?.projectNumber ?? "—"}</td>
                        <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{co.title}</td>
                        <td><StatusBadge status={co.status} /></td>
                        <td>{co.requester ?? "—"}</td>
                        <td style={{ textAlign: "right" }} className={co.recommendedTotal === 0 ? "warn-cell" : ""}>
                          {co.recommendedTotal > 0 ? co.recommendedTotal.toFixed(2) : "NOT PRICED"}
                        </td>
                        <td className={missing.length > 0 ? "warn-cell" : ""} style={{ fontSize: 11 }}>
                          {missing.length > 0 ? missing.join(", ") : "—"}
                        </td>
                        <td>
                          <Link
                            href={
                              co.status === "Pending Approval"
                                ? `/change-orders/${co.id}/approval`
                                : `/change-orders/${co.id}`
                            }
                            style={{ fontSize: 11, color: "var(--blue)", textDecoration: "underline", fontWeight: 600 }}
                          >
                            {co.status === "Pending Approval" ? "Review & Approve →" : "Open Record →"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Projects */}
        <div className="panel">
          <div className="panel-header">PROJECT REGISTRY — Linked Projects</div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Project Number</th>
                  <th>Name</th>
                  <th>Owner</th>
                  <th style={{ textAlign: "right" }}>Contract Value ($)</th>
                  <th>ERP Record ID</th>
                  <th style={{ textAlign: "right" }}>Open COs</th>
                  <th>ERP Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const openCOs = changeOrders.filter((c) => c.projectId === p.id && !["Approved", "Synced"].includes(c.status)).length;
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: "var(--blue)" }}>{p.projectNumber}</td>
                      <td>{p.name}</td>
                      <td>{p.owner}</td>
                      <td style={{ textAlign: "right" }}>${p.contractValue.toLocaleString()}</td>
                      <td style={{ color: "var(--blue-muted)", fontSize: 11 }}>{p.linkedProjectRecordId ?? "—"}</td>
                      <td style={{ textAlign: "right" }} className={openCOs > 0 ? "warn-cell" : ""}>{openCOs}</td>
                      <td style={{ color: "var(--warning-text)", fontSize: 11, fontWeight: 600 }}>PENDING SYNC</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* All COs compact */}
        <div className="panel">
          <div className="panel-header">
            ALL CHANGE ORDERS — Full Register
            <Link href="/change-orders" style={{ fontSize: 11, color: "var(--blue)", fontWeight: 400, textDecoration: "underline", textTransform: "none", letterSpacing: "normal" }}>
              Open full register →
            </Link>
          </div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>CO Number</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Final ($)</th>
                  <th>Date Submitted</th>
                  <th>ERP Sync</th>
                </tr>
              </thead>
              <tbody>
                {changeOrders.slice(0, 8).map((co) => (
                  <tr key={co.id}>
                    <td>
                      <Link href={`/change-orders/${co.id}`} style={{ color: "var(--blue)", textDecoration: "underline" }}>
                        {co.changeOrderNumber}
                      </Link>
                    </td>
                    <td><StatusBadge status={co.status} /></td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{co.finalTotal.toFixed(2)}</td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {co.dateSubmitted ? new Date(co.dateSubmitted).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ fontSize: 11, color: co.status === "Approved" ? "var(--warning-text)" : "var(--text-muted)", fontWeight: co.status === "Approved" ? 600 : 400 }}>
                      {co.status === "Approved" ? "PENDING" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <span>CO Pricing Module v3.2.1</span>
        <span>Server: CORESTONE-APP-01</span>
        <span>DB: Connected</span>
        <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>Estimating MEP: OFFLINE</span>
        <span style={{ marginLeft: "auto" }}>Session: {new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}
