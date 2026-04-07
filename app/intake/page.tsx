"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COST_CATEGORIES = [
  { key: "labor",         label: "Labor",          unit: "hrs",  rate: 95 },
  { key: "material",      label: "Material",       unit: "LS",   rate: 0  },
  { key: "equipment",     label: "Equipment",      unit: "days", rate: 850 },
  { key: "subcontractor", label: "Subcontractor",  unit: "LS",   rate: 0  },
];

export default function IntakePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [created, setCreated] = useState<{ id: string; number: string; title: string } | null>(null);

  const [form, setForm] = useState({
    title: "",
    projectId: "proj-1",
    costCode: "",
    requester: "",
    changeType: "Change Order",
    priority: "Normal",
    description: "",
  });

  const [costRows, setCostRows] = useState(
    COST_CATEGORIES.map((c) => ({ ...c, quantity: "", rate: String(c.rate), override: false }))
  );

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const calcExtended = (qty: string, rate: string) => {
    const q = parseFloat(qty);
    const r = parseFloat(rate);
    if (isNaN(q) || isNaN(r)) return null;
    return q * r;
  };

  const totalEst = costRows.reduce((s, r) => {
    const ext = calcExtended(r.quantity, r.rate);
    return s + (ext ?? 0);
  }, 0);

  const handleSubmit = async () => {
    const errs: string[] = [];
    if (!form.title.trim()) errs.push("Title is required.");
    if (!form.requester.trim()) errs.push("Requester / Submitted By is required.");
    if (errs.length > 0) { setErrors(errs); return; }
    setErrors([]);
    setSaving(true);
    try {
      // Map cost rows to the fields the API expects
      const laborRow        = costRows.find((r) => r.key === "labor");
      const materialRow     = costRows.find((r) => r.key === "material");
      const equipmentRow    = costRows.find((r) => r.key === "equipment");
      const subRow          = costRows.find((r) => r.key === "subcontractor");

      const laborHours      = parseFloat(laborRow?.quantity     ?? "0") || 0;
      const materialTotal   = parseFloat(materialRow?.quantity  ?? "0") * (parseFloat(materialRow?.rate  ?? "0") || 0) || 0;
      const equipmentTotal  = parseFloat(equipmentRow?.quantity ?? "0") * (parseFloat(equipmentRow?.rate ?? "0") || 0) || 0;
      const subTotal        = parseFloat(subRow?.quantity       ?? "0") * (parseFloat(subRow?.rate       ?? "0") || 0) || 0;

      const res = await fetch("/api/change-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId:           form.projectId,
          title:               form.title,
          description:         form.description || form.title,
          requester:           form.requester,
          costCode:            form.costCode || undefined,
          laborHours,
          materialTotal,
          equipmentTotal,
          subcontractorTotal:  subTotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors([`Server error: ${data.error ?? "Unknown error"}`]);
        setSaving(false);
        return;
      }
      // Show inline success — navigating directly to the CO detail can fail on
      // serverless deployments where the in-memory store resets between requests.
      setCreated({ id: data.id, number: data.changeOrderNumber ?? data.id, title: data.title });
      setSaving(false);
    } catch {
      setErrors(["Failed to create record. Check your network connection and try again."]);
      setSaving(false);
    }
  };

  if (created) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <div className="toolbar-strip">
          <span className="toolbar-label">INTAKE — Record Created</span>
          <span className="toolbar-sep">|</span>
          <button className="btn-secondary" onClick={() => { setCreated(null); setErrors([]); }}>
            Create Another Record
          </button>
          <button className="btn-toolbar" onClick={() => router.push("/change-orders")}>
            Back to Register
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          <div style={{
            border: "2px solid var(--success-border)",
            background: "var(--success-bg)",
            padding: "14px 18px",
            marginBottom: 12,
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "var(--success-text)", marginBottom: 6 }}>
              ✓ RECORD CREATED SUCCESSFULLY
            </div>
            <table style={{ marginBottom: 10 }}>
              <tbody>
                <tr>
                  <td className="field-label" style={{ paddingRight: 20, whiteSpace: "nowrap" }}>CO Number</td>
                  <td style={{ fontWeight: 700, fontFamily: "monospace" }}>{created.number}</td>
                </tr>
                <tr>
                  <td className="field-label" style={{ paddingRight: 20, whiteSpace: "nowrap" }}>Record ID</td>
                  <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>{created.id}</td>
                </tr>
                <tr>
                  <td className="field-label" style={{ paddingRight: 20, whiteSpace: "nowrap" }}>Title</td>
                  <td>{created.title}</td>
                </tr>
                <tr>
                  <td className="field-label" style={{ paddingRight: 20, whiteSpace: "nowrap" }}>Status</td>
                  <td style={{ fontWeight: 700, color: "var(--text-label)" }}>DRAFT</td>
                </tr>
              </tbody>
            </table>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                className="btn-primary"
                onClick={() => router.push(`/change-orders/${created.id}`)}
              >
                Open Record →
              </button>
              <button className="btn-secondary" onClick={() => router.push("/change-orders")}>
                View All Change Orders
              </button>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
              Record is in DRAFT status. Use the Overview tab to submit it for field review, then approval.
              {" "}If running on a deployed server and "Open Record" gives a not-found error, run the app locally (<code>npm run dev</code>) — the in-memory store resets between serverless requests on cloud deployments.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Toolbar */}
      <div className="toolbar-strip">
        <span className="toolbar-label">INTAKE — New Change Order Record</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
          {saving ? "Creating..." : "Create Record"}
        </button>
        <button className="btn-secondary" onClick={() => router.push("/change-orders")}>Cancel</button>
        <button className="btn-toolbar">Save Draft</button>
        <button className="btn-toolbar">Reset Form</button>
        <button className="btn-toolbar">Import from Estimating</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: "var(--warning-text)", fontWeight: 600 }}>
          ⚠ Unsaved changes · Estimating MEP: offline
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {errors.length > 0 && (
          <div className="notice-error">
            <strong>Validation errors: </strong>
            {errors.join(" ")}
          </div>
        )}

        {/* Record header */}
        <div className="panel">
          <div className="panel-header">RECORD HEADER — Change Order Identification</div>
          <div className="panel-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px 16px" }}>
              {[
                { label: "Project", key: "projectId", type: "select", options: [{ value: "proj-1", label: "PRJ-2024-1082 – Riverside Data Center" }, { value: "proj-2", label: "PRJ-2024-1091 – Westside Medical Office" }] },
                { label: "Cost Code", key: "costCode", type: "text", placeholder: "e.g. 03.200.100" },
                { label: "Requester / Submitted By", key: "requester", type: "text", placeholder: "Name or ID" },
                { label: "Record Type", key: "changeType", type: "select", options: ["Change Order", "Variation", "Claim", "PCO", "RFQ"].map((o) => ({ value: o, label: o })) },
                { label: "Priority", key: "priority", type: "select", options: ["Low", "Normal", "High", "Critical"].map((o) => ({ value: o, label: o })) },
              ].map((f) => (
                <div key={f.key}>
                  <div className="field-label" style={{ marginBottom: 2 }}>{f.label}</div>
                  {f.type === "select" ? (
                    <select
                      value={(form as Record<string, string>)[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      style={{ width: "100%" }}
                    >
                      {(f.options as { value: string; label: string }[]).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={(form as Record<string, string>)[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                      placeholder={(f as { placeholder?: string }).placeholder}
                      style={{ width: "100%" }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8 }}>
              <div className="field-label" style={{ marginBottom: 2 }}>Record Title / Short Description</div>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Enter change order title"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        </div>

        {/* Scope narrative */}
        <div className="panel">
          <div className="panel-header">SCOPE NARRATIVE — Description of Work</div>
          <div className="panel-body">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the scope of work. Reference RFI, drawing numbers, or spec sections where applicable."
              style={{ width: "100%", minHeight: 64, resize: "vertical" }}
            />
          </div>
        </div>

        {/* Cost inputs */}
        <div className="panel">
          <div className="panel-header">
            COST INPUTS — Manual Entry Required
            <span style={{ fontSize: 10, color: "var(--warning-text)", fontWeight: 400, textTransform: "none", letterSpacing: "normal" }}>
              ⚠ Values not verified against Estimation MEP (offline)
            </span>
          </div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Cost Category</th>
                  <th>Unit</th>
                  <th style={{ textAlign: "right" }}>Quantity</th>
                  <th style={{ textAlign: "right" }}>Rate ($)</th>
                  <th style={{ textAlign: "right" }}>Extended ($)</th>
                  <th>Source</th>
                  <th>Override</th>
                </tr>
              </thead>
              <tbody>
                {costRows.map((r, i) => {
                  const ext = calcExtended(r.quantity, r.rate);
                  return (
                    <tr key={r.key}>
                      <td style={{ fontWeight: 500 }}>{r.label}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{r.unit}</td>
                      <td style={{ textAlign: "right" }}>
                        <input
                          type="number"
                          value={r.quantity}
                          onChange={(e) => setCostRows((rows) => rows.map((row, j) => j === i ? { ...row, quantity: e.target.value } : row))}
                          placeholder="0"
                          style={{ width: 70, textAlign: "right" }}
                        />
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <input
                          type="number"
                          value={r.rate}
                          onChange={(e) => setCostRows((rows) => rows.map((row, j) => j === i ? { ...row, rate: e.target.value, override: true } : row))}
                          style={{ width: 80, textAlign: "right" }}
                        />
                      </td>
                      <td
                        style={{ textAlign: "right", fontWeight: ext != null ? 600 : 400, fontFamily: "monospace" }}
                        className={ext == null ? "warn-cell" : ""}
                      >
                        {ext != null ? ext.toFixed(2) : "ENTER QTY"}
                      </td>
                      <td className="warn-cell" style={{ fontSize: 11 }}>Manual entry</td>
                      <td>
                        {r.override ? (
                          <span className="warn-cell" style={{ fontWeight: 700, fontSize: 10 }}>YES</span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: 10 }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "var(--nav-bg)" }}>
                  <td colSpan={4} style={{ fontWeight: 700, textAlign: "right", color: "white", border: "1px solid var(--nav-border)", fontSize: 11, letterSpacing: "0.03em" }}>
                    TOTAL ESTIMATED VALUE
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "white", fontFamily: "monospace", fontSize: 13, border: "1px solid var(--nav-border)" }}>
                    {totalEst > 0 ? totalEst.toFixed(2) : "—"}
                  </td>
                  <td colSpan={2} style={{ border: "1px solid var(--nav-border)" }} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action bar */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "4px 0" }}>
          <button className="btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Creating Record..." : "Create Change Order Record"}
          </button>
          <button className="btn-secondary" onClick={() => router.push("/change-orders")}>Cancel</button>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Record will be created in DRAFT status.</span>
        </div>
      </div>

      <div className="status-bar">
        <span>Intake Form</span>
        <span className={form.title ? "success-cell" : "warn-cell"} style={{ fontSize: 10, fontWeight: 600 }}>
          {form.title ? "Title: OK" : "Title: MISSING"}
        </span>
        <span className={form.requester ? "success-cell" : "warn-cell"} style={{ fontSize: 10, fontWeight: 600 }}>
          {form.requester ? "Requester: OK" : "Requester: MISSING"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)" }}>
          Est. Total: {totalEst > 0 ? `$${totalEst.toFixed(2)}` : "Not entered"}
        </span>
      </div>
    </div>
  );
}
