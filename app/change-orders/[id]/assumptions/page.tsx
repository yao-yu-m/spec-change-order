import Link from "next/link";
import { PricingRecommendationService } from "@/lib/services/pricingRecommendationService";
import { ProjectService } from "@/lib/services/projectService";
import { ChangeOrderDetailLayout } from "../ChangeOrderDetailLayout";
import { getCoOrFallback } from "@/lib/helpers/cookieSync";

export const dynamic = "force-dynamic";

export default async function AssumptionsPage({ params }: { params: { id: string } }) {
  const co = await getCoOrFallback(params.id);
  if (!co) return (
    <div style={{ padding: 24 }}>
      <div className="notice-error" style={{ marginBottom: 12 }}><strong>RECORD NOT FOUND — {params.id}</strong><br />Server may have restarted. Seeded records are always available.</div>
      <Link href="/change-orders" className="btn-primary" style={{ textDecoration: "none" }}>← Back to Register</Link>
    </div>
  );
  const project = ProjectService.getProjectById(co.projectId) ?? null;
  const rec = co.currentRecommendationId
    ? PricingRecommendationService.getRecommendationById(co.currentRecommendationId)
    : null;

  return (
    <ChangeOrderDetailLayout changeOrder={co} project={project}>
      <div className="toolbar-strip" style={{ marginBottom: 8 }}>
        <span className="toolbar-label">ASSUMPTIONS &amp; EVIDENCE</span>
        <span className="toolbar-sep">|</span>
        <button className="btn-toolbar">Export</button>
      </div>

      {!rec ? (
        <div className="notice-warn">No pricing recommendation on record. Generate pricing first.</div>
      ) : (
        <>
          {/* Assumptions */}
          <div className="panel">
            <div className="panel-header">PRICING ASSUMPTIONS</div>
            <div style={{ padding: 0 }}>
              {rec.assumptions.length === 0 ? (
                <div className="notice-warn" style={{ margin: 8 }}>No assumptions recorded.</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Assumption</th>
                      <th>Source / Basis</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.assumptions.map((a, i) => (
                      <tr key={a.id}>
                        <td style={{ color: "var(--text-muted)" }}>{i + 1}</td>
                        <td>{a.description}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{a.source ?? "—"}</td>
                        <td className="success-cell" style={{ fontWeight: 700, fontSize: 11 }}>ACTIVE</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Evidence / comparable records */}
          <div className="panel">
            <div className="panel-header">EVIDENCE — Comparable Records &amp; References</div>
            <div style={{ padding: 0 }}>
              {rec.evidence.length === 0 ? (
                <div style={{ padding: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                  No comparable records found.
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Reference</th>
                      <th style={{ textAlign: "right" }}>Value ($)</th>
                      <th>Delta vs. Estimate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.evidence.map((e) => {
                      const delta = e.value != null ? rec.recommendedTotal - e.value : null;
                      return (
                        <tr key={e.id}>
                          <td style={{ fontWeight: 500 }}>{e.type}</td>
                          <td style={{ color: "var(--blue)" }}>{e.reference}</td>
                          <td style={{ textAlign: "right" }}>
                            {e.value != null ? e.value.toFixed(2) : "—"}
                          </td>
                          <td
                            className={delta != null && Math.abs(delta) > rec.recommendedTotal * 0.2 ? "warn-cell" : ""}
                            style={{ fontWeight: 500 }}
                          >
                            {delta != null
                              ? `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </ChangeOrderDetailLayout>
  );
}
