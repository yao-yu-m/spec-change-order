export default function LaborRateTablePage() {
  const trades = [
    { code: "LAB-GEN",  trade: "General Laborer",          union: "Laborers Local 731",       rate: 68.40,  burden: 28.50,  total: 96.90,  status: "Active",   expiry: "2024-12-31" },
    { code: "LAB-CARP", trade: "Carpenter – Rough",         union: "Carpenters Local 157",     rate: 82.15,  burden: 34.20,  total: 116.35, status: "Active",   expiry: "2024-12-31" },
    { code: "LAB-CARP2",trade: "Carpenter – Finish",        union: "Carpenters Local 157",     rate: 87.50,  burden: 36.40,  total: 123.90, status: "Active",   expiry: "2024-12-31" },
    { code: "LAB-IRON", trade: "Ironworker – Structural",   union: "Ironworkers Local 40",     rate: 94.20,  burden: 39.20,  total: 133.40, status: "Active",   expiry: "2024-06-30" },
    { code: "LAB-ELEC", trade: "Electrician – Journeyman",  union: "IBEW Local 3",             rate: 105.80, burden: 44.00,  total: 149.80, status: "Active",   expiry: "2025-03-31" },
    { code: "LAB-PLMB", trade: "Plumber – Journeyman",      union: "Plumbers Local 1",         rate: 99.60,  burden: 41.40,  total: 141.00, status: "Active",   expiry: "2024-12-31" },
    { code: "LAB-OPER", trade: "Operating Engineer",        union: "IUOE Local 14-14B",        rate: 112.00, burden: 46.60,  total: 158.60, status: "Active",   expiry: "2025-06-30" },
    { code: "LAB-CONC", trade: "Concrete Finisher",         union: "Laborers Local 731",       rate: 74.80,  burden: 31.10,  total: 105.90, status: "Active",   expiry: "2024-12-31" },
    { code: "LAB-WELD", trade: "Welder – Certified",        union: "Non-union",                rate: 88.00,  burden: 22.00,  total: 110.00, status: "Active",   expiry: "N/A" },
    { code: "LAB-SUP",  trade: "Field Superintendent",      union: "Non-union / Salaried",     rate: 125.00, burden: 31.25,  total: 156.25, status: "Active",   expiry: "N/A" },
    { code: "LAB-PM",   trade: "Project Manager",           union: "Non-union / Salaried",     rate: 145.00, burden: 36.25,  total: 181.25, status: "Active",   expiry: "N/A" },
    { code: "LAB-EST",  trade: "Estimator",                 union: "Non-union / Salaried",     rate: 110.00, burden: 27.50,  total: 137.50, status: "Inactive", expiry: "N/A" },
  ];

  const activeRates = trades.filter((t) => t.status === "Active");
  const expiringSoon = trades.filter((t) => {
    if (t.expiry === "N/A") return false;
    const exp = new Date(t.expiry);
    const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff < 120;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="toolbar-strip">
        <span className="toolbar-label">LABOR RATE TABLE</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-primary">+ Add Rate</button>
        <button className="btn-toolbar">Import Union Agreement</button>
        <button className="btn-toolbar">Export CSV</button>
        <button className="btn-toolbar">Validate Against ERP</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {activeRates.length} active rates · {expiringSoon.length > 0 && (
            <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>
              {expiringSoon.length} expiring within 120 days
            </span>
          )}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {expiringSoon.length > 0 && (
          <div className="notice-warn" style={{ marginBottom: 10 }}>
            <strong>RATE EXPIRY WARNING: </strong>
            {expiringSoon.length} labor rate agreement(s) are expiring within 120 days.
            Rates: {expiringSoon.map((t) => t.trade).join(", ")}.
            Contact procurement to renew before period close.
          </div>
        )}

        <div className="panel">
          <div className="panel-header">
            LABOR RATES — All Trades
            <span style={{ fontSize: 10, fontWeight: 400, color: "var(--text-secondary)", textTransform: "none", letterSpacing: "normal" }}>
              Rates include base wage only. Burden = payroll taxes + benefits + insurance.
            </span>
          </div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Rate Code</th>
                  <th>Trade / Classification</th>
                  <th>Union / Agreement</th>
                  <th style={{ textAlign: "right" }}>Base Rate ($/hr)</th>
                  <th style={{ textAlign: "right" }}>Burden ($/hr)</th>
                  <th style={{ textAlign: "right" }}>All-In Rate ($/hr)</th>
                  <th>Status</th>
                  <th>Agreement Expiry</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const expiring = t.expiry !== "N/A" && (() => {
                    const exp = new Date(t.expiry);
                    return (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24) < 120;
                  })();
                  return (
                    <tr key={t.code}>
                      <td style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--blue)" }}>{t.code}</td>
                      <td style={{ fontWeight: 500 }}>{t.trade}</td>
                      <td style={{ fontSize: 11, color: "var(--text-secondary)" }}>{t.union}</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>{t.rate.toFixed(2)}</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", color: "var(--text-secondary)" }}>{t.burden.toFixed(2)}</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{t.total.toFixed(2)}</td>
                      <td>
                        <span
                          className="status-tag"
                          style={{
                            backgroundColor: t.status === "Active" ? "var(--success-bg)" : "var(--bg-header)",
                            color: t.status === "Active" ? "var(--success-text)" : "var(--text-muted)",
                            borderColor: t.status === "Active" ? "var(--success-border)" : "var(--border)",
                          }}
                        >
                          {t.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={expiring ? "warn-cell" : ""} style={{ fontSize: 11 }}>
                        {t.expiry}
                        {expiring && <span style={{ fontWeight: 700 }}> ⚠</span>}
                      </td>
                      <td><button className="btn-toolbar">Edit</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>{activeRates.length} active rates</span>
        {expiringSoon.length > 0 && (
          <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>
            ⚠ {expiringSoon.length} expiring soon
          </span>
        )}
        <span style={{ marginLeft: "auto" }}>Labor Rate Table · Corestone CMS</span>
      </div>
    </div>
  );
}
