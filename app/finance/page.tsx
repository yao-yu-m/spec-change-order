import { ChangeOrderService } from "@/lib/services/changeOrderService";
import { ProjectService } from "@/lib/services/projectService";
import { StatusBadge } from "@/components/domain/StatusBadge";

export default function FinancePage() {
  const changeOrders = ChangeOrderService.listChangeOrders();
  const projects = ProjectService.listProjects();
  const approved = changeOrders.filter((c) => ["Approved", "Synced"].includes(c.status));
  const totalBillable = approved.reduce((s, c) => s + c.finalTotal, 0);
  const totalVariance = approved.reduce((s, c) => s + (c.finalTotal - c.recommendedTotal), 0);
  const pendingSync = approved.filter((c) => c.status === "Approved").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <div className="toolbar-strip">
        <span className="toolbar-label">FINANCE — Billable Register</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-toolbar">Export to ERP</button>
        <button className="btn-toolbar">Reconcile</button>
        <button className="btn-toolbar">Export CSV</button>
        <button className="btn-toolbar">Print</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: pendingSync > 0 ? "var(--warning-text)" : "var(--success-text)", fontWeight: 600 }}>
          {pendingSync > 0 ? `⚠ ${pendingSync} record(s) pending ERP sync` : "ERP sync up to date"}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
          {[
            { label: "Approved COs",         value: approved.length.toString(),                                                                       warn: false },
            { label: "Total Billable ($)",    value: `$${totalBillable.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,                       warn: false },
            { label: "Total Variance ($)",    value: `${totalVariance >= 0 ? "+" : ""}$${Math.abs(totalVariance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, warn: Math.abs(totalVariance) > 0 },
            { label: "Pending ERP Sync",      value: pendingSync.toString(),                                                                           warn: pendingSync > 0 },
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

        {/* Pending sync notice */}
        {pendingSync > 0 && (
          <div className="notice-warn">
            <strong>ERP SYNC REQUIRED: </strong>
            {pendingSync} approved record(s) have not been posted to the ERP system.
            Run "Export to ERP" or trigger a manual sync before period close.
          </div>
        )}

        {/* Approved COs table */}
        <div className="panel">
          <div className="panel-header">APPROVED CHANGE ORDERS — Billable Summary</div>
          <div style={{ padding: 0 }}>
            {approved.length === 0 ? (
              <div style={{ padding: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                No approved change orders on record.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>CO Number</th>
                    <th>Project</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Recommended ($)</th>
                    <th style={{ textAlign: "right" }}>Final Approved ($)</th>
                    <th style={{ textAlign: "right" }}>Variance ($)</th>
                    <th>Date Approved</th>
                    <th>ERP Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {approved.map((co) => {
                    const proj = projects.find((p) => p.id === co.projectId);
                    const variance = co.finalTotal - co.recommendedTotal;
                    return (
                      <tr key={co.id}>
                        <td style={{ fontWeight: 600, color: "var(--blue)" }}>{co.changeOrderNumber}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{proj?.projectNumber ?? "—"}</td>
                        <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{co.title}</td>
                        <td><StatusBadge status={co.status} /></td>
                        <td style={{ textAlign: "right" }}>{co.recommendedTotal.toFixed(2)}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{co.finalTotal.toFixed(2)}</td>
                        <td
                          style={{ textAlign: "right" }}
                          className={Math.abs(variance) > 1 ? "warn-cell" : "success-cell"}
                        >
                          {variance >= 0 ? "+" : ""}{variance.toFixed(2)}
                        </td>
                        <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                          {co.dateSubmitted ? new Date(co.dateSubmitted).toLocaleDateString() : "—"}
                        </td>
                        <td
                          style={{ fontSize: 11, fontWeight: 600 }}
                          className={co.status === "Approved" ? "warn-cell" : "success-cell"}
                        >
                          {co.status === "Approved" ? "PENDING" : "SYNCED"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "var(--nav-bg)" }}>
                    <td colSpan={4} style={{ fontWeight: 700, textAlign: "right", color: "white", border: "1px solid var(--nav-border)", fontSize: 11, letterSpacing: "0.03em" }}>
                      TOTAL BILLABLE IMPACT
                    </td>
                    <td style={{ textAlign: "right", color: "white", fontFamily: "monospace", border: "1px solid var(--nav-border)" }}>
                      {approved.reduce((s, c) => s + c.recommendedTotal, 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "white", fontFamily: "monospace", fontSize: 14, border: "1px solid var(--nav-border)" }}>
                      {totalBillable.toFixed(2)}
                    </td>
                    <td
                      style={{ textAlign: "right", fontWeight: 700, fontFamily: "monospace", border: "1px solid var(--nav-border)" }}
                      className={totalVariance !== 0 ? "warn-cell" : "success-cell"}
                    >
                      {totalVariance >= 0 ? "+" : ""}{totalVariance.toFixed(2)}
                    </td>
                    <td colSpan={2} style={{ border: "1px solid var(--nav-border)" }} />
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>{approved.length} approved records</span>
        <span>Total billable: ${totalBillable.toFixed(2)}</span>
        {pendingSync > 0 && (
          <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>
            ⚠ {pendingSync} pending ERP sync
          </span>
        )}
        <span style={{ marginLeft: "auto" }}>Finance module · Period: FY2024</span>
      </div>
    </div>
  );
}
