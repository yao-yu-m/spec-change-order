import Link from "next/link";
import { ProjectService } from "@/lib/services/projectService";
import { ChangeOrderService } from "@/lib/services/changeOrderService";

export default function ProjectRegistryPage() {
  const projects = ProjectService.listProjects();
  const changeOrders = ChangeOrderService.listChangeOrders();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="toolbar-strip">
        <span className="toolbar-label">PROJECT REGISTRY</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-primary">+ New Project</button>
        <button className="btn-toolbar">Import from ERP</button>
        <button className="btn-toolbar">Export CSV</button>
        <button className="btn-toolbar">Refresh</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
          {projects.length} project(s) · Last sync: 06:00 UTC
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        <div className="notice-warn" style={{ marginBottom: 10 }}>
          <strong>SYNC NOTICE: </strong>
          Project data is sourced from ERP. Manual edits here will not be reflected in Oracle JDE until next scheduled sync (18:00 UTC).
          Contact system admin to trigger an immediate sync.
        </div>

        <div className="panel">
          <div className="panel-header">
            ALL PROJECTS — Active &amp; Archived
            <span style={{ fontSize: 10, fontWeight: 400, color: "var(--text-secondary)", textTransform: "none", letterSpacing: "normal" }}>
              Source: ERP · Last updated: 06:00 UTC
            </span>
          </div>
          <div style={{ padding: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Project Number</th>
                  <th>Name</th>
                  <th>Owner / Client</th>
                  <th style={{ textAlign: "right" }}>Contract Value ($)</th>
                  <th style={{ textAlign: "right" }}>Open COs</th>
                  <th style={{ textAlign: "right" }}>Approved COs ($)</th>
                  <th>ERP Record ID</th>
                  <th>ERP Sync</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const projectCOs = changeOrders.filter((c) => c.projectId === p.id);
                  const openCOs = projectCOs.filter((c) => !["Approved", "Synced"].includes(c.status));
                  const approvedValue = projectCOs
                    .filter((c) => ["Approved", "Synced"].includes(c.status))
                    .reduce((s, c) => s + c.finalTotal, 0);

                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, color: "var(--blue)" }}>
                        <Link href={`/change-orders?project=${p.id}`} style={{ color: "var(--blue)", textDecoration: "underline" }}>
                          {p.projectNumber}
                        </Link>
                      </td>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.owner}</td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                        ${p.contractValue.toLocaleString()}
                      </td>
                      <td
                        style={{ textAlign: "right" }}
                        className={openCOs.length > 0 ? "warn-cell" : ""}
                      >
                        {openCOs.length}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "monospace" }}>
                        {approvedValue > 0 ? `$${approvedValue.toFixed(2)}` : "—"}
                      </td>
                      <td style={{ fontSize: 11, color: "var(--blue-muted)" }}>
                        {p.linkedProjectRecordId ?? (
                          <span className="warn-cell" style={{ fontWeight: 700, fontSize: 10 }}>NOT LINKED</span>
                        )}
                      </td>
                      <td style={{ fontSize: 11, fontWeight: 600 }} className="warn-cell">
                        PENDING
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button className="btn-toolbar">Edit</button>
                        {" "}
                        <Link
                          href={`/change-orders?project=${p.id}`}
                          style={{ fontSize: 11, color: "var(--blue)", textDecoration: "underline" }}
                        >
                          View COs
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "var(--bg-header)" }}>
                  <td colSpan={3} style={{ fontWeight: 600, textAlign: "right", color: "var(--text-secondary)" }}>
                    TOTALS
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontFamily: "monospace" }}>
                    ${projects.reduce((s, p) => s + p.contractValue, 0).toLocaleString()}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700 }} className="warn-cell">
                    {changeOrders.filter((c) => !["Approved", "Synced"].includes(c.status)).length}
                  </td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="status-bar">
        <span>{projects.length} projects</span>
        <span style={{ color: "var(--warning-text)", fontWeight: 600 }}>ERP sync: PENDING</span>
        <span style={{ marginLeft: "auto" }}>Project Registry · Corestone CMS</span>
      </div>
    </div>
  );
}
