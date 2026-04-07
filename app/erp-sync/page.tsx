import { ChangeOrderService } from "@/lib/services/changeOrderService";

export default function ErpSyncPage() {
  const changeOrders = ChangeOrderService.listChangeOrders();
  const pendingSync = changeOrders.filter((c) => c.status === "Approved");
  const syncedRecords = changeOrders.filter((c) => c.status === "Synced");

  const syncLog = [
    { ts: "2024-02-10 06:00 UTC", action: "Scheduled Sync",         records: 3,  status: "COMPLETED", duration: "4.2s",  note: "3 approved COs posted to JDE" },
    { ts: "2024-02-09 18:00 UTC", action: "Scheduled Sync",         records: 0,  status: "COMPLETED", duration: "1.1s",  note: "No pending records" },
    { ts: "2024-02-09 06:00 UTC", action: "Scheduled Sync",         records: 1,  status: "COMPLETED", duration: "2.8s",  note: "CO-1001 posted" },
    { ts: "2024-02-08 14:22 UTC", action: "Manual Trigger",         records: 2,  status: "COMPLETED", duration: "3.5s",  note: "Manual sync by zara.hall" },
    { ts: "2024-02-08 06:00 UTC", action: "Scheduled Sync",         records: 0,  status: "FAILED",    duration: "—",     note: "Connection timeout — JDE unreachable" },
    { ts: "2024-02-07 18:00 UTC", action: "Scheduled Sync",         records: 1,  status: "COMPLETED", duration: "2.1s",  note: "" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="toolbar-strip">
        <span className="toolbar-label">ERP SYNC STATUS — Oracle JDE</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-primary">Trigger Manual Sync</button>
        <button className="btn-toolbar">View Error Log</button>
        <button className="btn-toolbar">Configure Schedule</button>
        <button className="btn-toolbar">Export Log</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: pendingSync.length > 0 ? "var(--warning-text)" : "var(--success-text)", fontWeight: 600 }}>
          {pendingSync.length > 0
            ? `⚠ ${pendingSync.length} record(s) pending sync`
            : "✓ All records synced"}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {/* Status overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 10 }}>
          {[
            { label: "Pending Sync",     value: pendingSync.length,  warn: pendingSync.length > 0 },
            { label: "Synced (Total)",   value: syncedRecords.length, warn: false },
            { label: "Last Sync",        value: "06:00 UTC",         warn: false },
            { label: "Next Scheduled",   value: "18:00 UTC",         warn: false },
          ].map((k) => (
            <div key={k.label} style={{
              background: k.warn ? "var(--warning-bg)" : "var(--bg-panel)",
              border: `1px solid ${k.warn ? "var(--warning-border)" : "var(--border)"}`,
              padding: "6px 10px",
            }}>
              <div style={{ fontSize: 10, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{k.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "monospace", color: k.warn ? "var(--warning-text)" : "var(--text-primary)" }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        {pendingSync.length > 0 && (
          <div className="notice-warn" style={{ marginBottom: 10 }}>
            <strong>ACTION REQUIRED: </strong>
            {pendingSync.length} approved change order(s) have not been posted to Oracle JDE.
            Run a manual sync or wait for the next scheduled window (18:00 UTC).
            Records will not appear in financial reporting until posted.
          </div>
        )}

        {/* Pending records */}
        <div className="panel">
          <div className="panel-header">PENDING SYNC — Approved Records Not Yet Posted</div>
          <div style={{ padding: 0 }}>
            {pendingSync.length === 0 ? (
              <div style={{ padding: 8, fontSize: 12, color: "var(--success-text)", fontWeight: 600 }}>
                ✓ All approved records have been posted to ERP.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>CO Number</th>
                    <th>Title</th>
                    <th style={{ textAlign: "right" }}>Final Approved ($)</th>
                    <th>Date Approved</th>
                    <th>Sync Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSync.map((co) => (
                    <tr key={co.id}>
                      <td style={{ fontWeight: 600, color: "var(--blue)" }}>{co.changeOrderNumber}</td>
                      <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{co.title}</td>
                      <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "monospace" }}>${co.finalTotal.toFixed(2)}</td>
                      <td style={{ color: "var(--text-secondary)" }}>
                        {co.dateSubmitted ? new Date(co.dateSubmitted).toLocaleDateString() : "—"}
                      </td>
                      <td className="warn-cell" style={{ fontWeight: 700, fontSize: 11 }}>PENDING</td>
                      <td>
                        <button className="btn-toolbar">Force Sync</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sync log */}
        <div className="panel">
          <div className="panel-header">SYNC LOG — Recent Activity</div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th style={{ textAlign: "right" }}>Records Processed</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {syncLog.map((entry, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--text-secondary)", fontSize: 11, whiteSpace: "nowrap" }}>{entry.ts}</td>
                    <td>{entry.action}</td>
                    <td style={{ textAlign: "right" }}>{entry.records}</td>
                    <td
                      className={entry.status === "FAILED" ? "error-cell" : "success-cell"}
                      style={{ fontWeight: 700, fontSize: 11 }}
                    >
                      {entry.status}
                    </td>
                    <td style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>{entry.duration}</td>
                    <td style={{ fontSize: 11, color: entry.status === "FAILED" ? "var(--error-text)" : "var(--text-secondary)" }}>
                      {entry.note || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>ERP: Oracle JDE · PROD-ERP-01</span>
        <span style={{ color: "var(--success-text)", fontWeight: 600 }}>Connection: ONLINE</span>
        <span>Next sync: 18:00 UTC</span>
        {pendingSync.length > 0 && (
          <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>
            ⚠ {pendingSync.length} pending
          </span>
        )}
        <span style={{ marginLeft: "auto" }}>ERP Sync Module · Corestone CMS</span>
      </div>
    </div>
  );
}
