import Link from "next/link";
import { AuditService } from "@/lib/services/auditService";
import { ProjectService } from "@/lib/services/projectService";
import { ActivityFeed } from "@/components/domain/ActivityFeed";
import { ChangeOrderDetailLayout } from "../ChangeOrderDetailLayout";
import { getCoOrFallback } from "@/lib/helpers/cookieSync";

export const dynamic = "force-dynamic";

export default async function AuditPage({ params }: { params: { id: string } }) {
  const co = await getCoOrFallback(params.id);
  if (!co) return (
    <div style={{ padding: 24 }}>
      <div className="notice-error" style={{ marginBottom: 12 }}><strong>RECORD NOT FOUND — {params.id}</strong><br />Server may have restarted. Seeded records are always available.</div>
      <Link href="/change-orders" className="btn-primary" style={{ textDecoration: "none" }}>← Back to Register</Link>
    </div>
  );
  const project = ProjectService.getProjectById(co.projectId) ?? null;
  const records = AuditService.getAuditTrail(params.id);

  return (
    <ChangeOrderDetailLayout changeOrder={co} project={project}>
      <div className="toolbar-strip" style={{ marginBottom: 8 }}>
        <span className="toolbar-label">AUDIT LOG — Immutable Record</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-toolbar">Export CSV</button>
        <button className="btn-toolbar">Print</button>
        <span className="toolbar-sep">|</span>
        <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
          {records.length} event(s) recorded
        </span>
      </div>

      <div className="panel">
        <div className="panel-header">AUDIT LOG — {co.changeOrderNumber}</div>
        <div style={{ padding: 0 }}>
          <ActivityFeed events={records} />
        </div>
      </div>
    </ChangeOrderDetailLayout>
  );
}
