export default function CostCodeTablePage() {
  const costCodes = [
    { code: "01.100.100", division: "01 – General Requirements", description: "Project Management",           unit: "LS",  laborRate: 0,      equipRate: 0,    notes: "Admin overhead only" },
    { code: "03.200.100", division: "03 – Concrete",              description: "Concrete Formwork – SFCA",    unit: "SF",  laborRate: 14.50,  equipRate: 3.20, notes: "" },
    { code: "03.300.200", division: "03 – Concrete",              description: "Cast-in-Place Concrete",      unit: "CY",  laborRate: 42.00,  equipRate: 18.00, notes: "Requires pump truck" },
    { code: "05.100.100", division: "05 – Metals",                description: "Structural Steel – Fabricate", unit: "TON", laborRate: 680.00, equipRate: 95.00, notes: "" },
    { code: "05.100.200", division: "05 – Metals",                description: "Structural Steel – Erect",    unit: "TON", laborRate: 420.00, equipRate: 210.00, notes: "Crane required" },
    { code: "07.200.100", division: "07 – Thermal & Moisture",    description: "Building Insulation",         unit: "SF",  laborRate: 1.80,   equipRate: 0,    notes: "" },
    { code: "08.110.100", division: "08 – Openings",              description: "Steel Doors & Frames",        unit: "EA",  laborRate: 185.00, equipRate: 0,    notes: "" },
    { code: "09.200.100", division: "09 – Finishes",              description: "Gypsum Board Assembly",       unit: "SF",  laborRate: 2.40,   equipRate: 0.20, notes: "Fire-rated add +$0.40/SF" },
    { code: "15.400.100", division: "15 – Mechanical",            description: "Plumbing – Rough-in",        unit: "LF",  laborRate: 28.00,  equipRate: 2.50, notes: "" },
    { code: "16.100.100", division: "16 – Electrical",            description: "Conduit & Wire – 120V",       unit: "LF",  laborRate: 12.50,  equipRate: 1.00, notes: "Low voltage separate" },
    { code: "16.200.200", division: "16 – Electrical",            description: "Panel & Switchgear",         unit: "EA",  laborRate: 1200.00, equipRate: 0,   notes: "Requires licensed electrician" },
    { code: "02.300.100", division: "02 – Existing Conditions",   description: "Selective Demolition",       unit: "SF",  laborRate: 3.20,   equipRate: 1.80, notes: "Hazmat survey required" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="toolbar-strip">
        <span className="toolbar-label">COST CODE TABLE — CSI MasterFormat</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-primary">+ Add Code</button>
        <button className="btn-toolbar">Import from ERP</button>
        <button className="btn-toolbar">Export CSV</button>
        <button className="btn-toolbar">Validate All</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {costCodes.length} codes · CSI MasterFormat 2016 · Last updated: 2024-01-15
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        <div className="notice-info" style={{ marginBottom: 10 }}>
          <strong>NOTE: </strong>
          Cost codes are synchronized from Oracle JDE. Changes made here require manual re-sync.
          Labor rates are defaults only — project-specific rates override these values.
        </div>

        <div className="panel">
          <div className="panel-header">COST CODES — All Divisions</div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Cost Code</th>
                  <th>Division</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th style={{ textAlign: "right" }}>Default Labor Rate ($/unit)</th>
                  <th style={{ textAlign: "right" }}>Default Equip. Rate ($/unit)</th>
                  <th>Notes / Qualifications</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {costCodes.map((c) => (
                  <tr key={c.code}>
                    <td style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--blue)" }}>{c.code}</td>
                    <td style={{ fontSize: 11, color: "var(--text-secondary)" }}>{c.division}</td>
                    <td>{c.description}</td>
                    <td style={{ fontFamily: "monospace", color: "var(--text-secondary)" }}>{c.unit}</td>
                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                      {c.laborRate > 0 ? c.laborRate.toFixed(2) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                      {c.equipRate > 0 ? c.equipRate.toFixed(2) : <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </td>
                    <td style={{ fontSize: 11, color: c.notes ? "var(--warning-text)" : "var(--text-muted)" }}>
                      {c.notes || "—"}
                    </td>
                    <td><button className="btn-toolbar">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>{costCodes.length} cost codes</span>
        <span>Format: CSI MasterFormat 2016</span>
        <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>Manual sync required</span>
        <span style={{ marginLeft: "auto" }}>Cost Code Table · Corestone CMS</span>
      </div>
    </div>
  );
}
