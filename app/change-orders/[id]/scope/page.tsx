import Link from "next/link";
import { ProjectService } from "@/lib/services/projectService";
import { ChangeOrderDetailLayout } from "../ChangeOrderDetailLayout";
import { getCoOrFallback } from "@/lib/helpers/cookieSync";

export const dynamic = "force-dynamic";

export default async function ScopePage({ params }: { params: { id: string } }) {
  const co = await getCoOrFallback(params.id);
  if (!co) return (
    <div style={{ padding: 24 }}>
      <div className="notice-error" style={{ marginBottom: 12 }}><strong>RECORD NOT FOUND — {params.id}</strong><br />Server may have restarted. Seeded records are always available.</div>
      <Link href="/change-orders" className="btn-primary" style={{ textDecoration: "none" }}>← Back to Register</Link>
    </div>
  );
  const project = ProjectService.getProjectById(co.projectId) ?? null;
  const items = co.scopeItems ?? [];

  return (
    <ChangeOrderDetailLayout changeOrder={co} project={project}>
      {/* Toolbar */}
      <div className="toolbar-strip" style={{ marginBottom: 8 }}>
        <span className="toolbar-label">SCOPE / LINE ITEMS</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-primary">Add Line Item</button>
        <button className="btn-toolbar">Import from Takeoff</button>
        <button className="btn-toolbar">Paste from Estimating</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: "var(--warning-text)", fontWeight: 600 }}>
          ⚠ Estimating MEP offline — manual entry only
        </span>
      </div>

      {/* Cost input summary */}
      <div className="panel">
        <div className="panel-header">COST INPUT SUMMARY — Aggregated by Category</div>
        <div style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: "right" }}>Total ($)</th>
                <th>Source</th>
                <th>Verification</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cat: "Labor",         val: 0,   source: "Rate table (manual)",   status: "warn" },
                { cat: "Material",      val: 0,   source: "Manual entry",          status: "warn" },
                { cat: "Equipment",     val: 0,   source: "Manual entry",          status: "warn" },
                { cat: "Subcontractor", val: 0,   source: "Quote on file",         status: "none" },
              ].map((r) => (
                <tr key={r.cat}>
                  <td style={{ fontWeight: 500 }}>{r.cat}</td>
                  <td style={{ textAlign: "right" }} className={r.val === 0 ? "warn-cell" : ""}>{r.val === 0 ? "NOT ENTERED" : r.val.toFixed(2)}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{r.source}</td>
                  <td className={r.val === 0 ? "warn-cell" : "success-cell"} style={{ fontWeight: 700, fontSize: 11 }}>
                    {r.val === 0 ? "REQUIRES ENTRY" : "VERIFIED"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scope narrative */}
      <div className="panel">
        <div className="panel-header">
          SCOPE NARRATIVE
          <span style={{ fontSize: 10, color: "var(--warning-text)", fontWeight: 400, textTransform: "none", letterSpacing: "normal" }}>
            ⚠ Check against drawing revisions — may not reflect latest RFI
          </span>
        </div>
        <div className="panel-body">
          <textarea
            defaultValue={co.description || "No scope narrative provided. Enter description of work."}
            style={{ width: "100%", minHeight: 60, resize: "vertical", fontSize: 12 }}
          />
        </div>
      </div>

      {/* Line items table */}
      <div className="panel">
        <div className="panel-header">LINE ITEMS — Detail</div>
        <div style={{ padding: 0 }}>
          {items.length === 0 ? (
            <div className="notice-warn" style={{ margin: 8 }}>
              No line items on record. Use "Add Line Item" or "Import from Takeoff" to begin.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Seq.</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Cost Code</th>
                  <th style={{ textAlign: "right" }}>Qty</th>
                  <th>Unit</th>
                  <th style={{ textAlign: "right" }}>Unit Cost ($)</th>
                  <th style={{ textAlign: "right" }}>Total ($)</th>
                  <th>Source</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ color: "var(--text-muted)" }}>{item.sequence}</td>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td className={!item.costCode ? "warn-cell" : ""} style={{ fontSize: 11 }}>
                      {item.costCode ?? "MISSING"}
                    </td>
                    <td style={{ textAlign: "right" }}>{item.quantity ?? "—"}</td>
                    <td>{item.unit ?? "—"}</td>
                    <td style={{ textAlign: "right" }}>{item.unitCost != null ? item.unitCost.toFixed(2) : "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{item.totalCost != null ? item.totalCost.toFixed(2) : "—"}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: 11 }}>Manual entry</td>
                    <td style={{ color: "var(--text-muted)", fontSize: 11 }}>{new Date(item.createdAt).toLocaleDateString()}</td>
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
