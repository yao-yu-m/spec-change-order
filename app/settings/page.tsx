export default function SettingsPage() {
  const integrations = [
    { name: "Oracle ERP / JDE",          status: "ONLINE",   lastSync: "06:00 UTC",   record: "PROD-ERP-01",      note: "Posting enabled" },
    { name: "Corestone ProjectSight",      status: "ONLINE",   lastSync: "06:00 UTC",   record: "PS-TENANT-02",     note: "Read-write" },
    { name: "Estimation MEP",             status: "OFFLINE",  lastSync: "Yesterday",   record: "—",                note: "Connection failed — manual entry required" },
    { name: "Document Control (Newforma)", status: "ONLINE",  lastSync: "05:30 UTC",   record: "NEWFORMA-01",      note: "Read-only" },
    { name: "Kafka / Service Bus",        status: "ONLINE",   lastSync: "—",           record: "sb-prod-eastus",   note: "Event publishing active" },
  ];

  const systemConfig = [
    { key: "Labor Rate (Default)",        value: "$95.00/hr",    source: "Rate table" },
    { key: "Equipment Markup",            value: "15%",          source: "Config table" },
    { key: "Margin (Default)",            value: "12%",          source: "Config table" },
    { key: "Cost Code Format",            value: "XX.XXX.XXX",   source: "Project config" },
    { key: "Currency",                    value: "USD",          source: "System default" },
    { key: "Timezone",                    value: "UTC",          source: "System" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="toolbar-strip">
        <span className="toolbar-label">SYSTEM SETTINGS &amp; INTEGRATIONS</span>
        <span style={{ flexGrow: 1 }} />
        <button className="btn-toolbar">Test All Connections</button>
        <button className="btn-toolbar">Refresh Status</button>
        <button className="btn-toolbar">Export Config</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {/* Integration connections */}
        <div className="panel">
          <div className="panel-header">INTEGRATION CONNECTIONS</div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>System</th>
                  <th>Status</th>
                  <th>Last Sync</th>
                  <th>Record ID / Tenant</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {integrations.map((s) => (
                  <tr key={s.name}>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td
                      className={s.status === "ONLINE" ? "success-cell" : "error-cell"}
                      style={{ fontWeight: 700, fontSize: 11 }}
                    >
                      {s.status}
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{s.lastSync}</td>
                    <td style={{ color: "var(--blue-muted)", fontSize: 11 }}>{s.record}</td>
                    <td
                      style={{ fontSize: 11 }}
                      className={s.status === "OFFLINE" ? "warn-cell" : ""}
                    >
                      {s.note}
                    </td>
                    <td>
                      <button className="btn-toolbar">
                        {s.status === "ONLINE" ? "Test" : "Reconnect"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System config */}
        <div className="panel">
          <div className="panel-header">SYSTEM CONFIGURATION — Pricing Defaults</div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Current Value</th>
                  <th>Source</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {systemConfig.map((c) => (
                  <tr key={c.key}>
                    <td style={{ fontWeight: 500 }}>{c.key}</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 600 }}>{c.value}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 11 }}>{c.source}</td>
                    <td>
                      <button className="btn-toolbar">Override</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Event log notice */}
        <div className="panel">
          <div className="panel-header">EVENT BUS — Recent Activity (Last 10 Events)</div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Payload Summary</th>
                  <th>Target System</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ts: "06:02 UTC", type: "CO_APPROVED",    summary: "CO-1001 approved · $42,350",     target: "ERP, ProjectSight" },
                  { ts: "06:01 UTC", type: "PRICING_GENERATED", summary: "CO-1003 pricing generated",   target: "Audit log" },
                  { ts: "05:58 UTC", type: "CO_SUBMITTED",   summary: "CO-1004 submitted for review",   target: "Audit log" },
                  { ts: "05:30 UTC", type: "SYNC_COMPLETED", summary: "Document sync completed — 12 records", target: "Newforma" },
                ].map((e, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--text-secondary)", fontSize: 11 }}>{e.ts}</td>
                    <td style={{ fontWeight: 600, fontSize: 11, color: "var(--blue)" }}>{e.type}</td>
                    <td>{e.summary}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 11 }}>{e.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>Settings</span>
        <span style={{ color: "var(--success-text)", fontWeight: 600 }}>ERP: ONLINE</span>
        <span style={{ color: "var(--error-text)", fontWeight: 600 }}>Estimating MEP: OFFLINE</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)" }}>
          Last config sync: 06:00 UTC
        </span>
      </div>
    </div>
  );
}
