export const dynamic = "force-dynamic";

import Link from "next/link";
import { PricingRecommendationService } from "@/lib/services/pricingRecommendationService";
import { ProjectService } from "@/lib/services/projectService";
import { CostBreakdownTable } from "@/components/domain/CostBreakdownTable";
import { ConfidenceBadge } from "@/components/domain/ConfidenceBadge";
import { ChangeOrderDetailLayout } from "../ChangeOrderDetailLayout";
import { PricingActions } from "./PricingActions";
import { getCoOrFallback } from "@/lib/helpers/cookieSync";

export default async function PricingPage({ params }: { params: { id: string } }) {
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
      {/* Toolbar */}
      <div className="toolbar-strip" style={{ marginBottom: 8 }}>
        <span className="toolbar-label">PRICING</span>
        <span className="toolbar-sep">|</span>
        <PricingActions changeOrderId={params.id} hasRecommendation={!!rec} />
        <span className="toolbar-sep">|</span>
        <button className="btn-toolbar">Recalculate</button>
        <button className="btn-toolbar">Override Values</button>
        <button className="btn-toolbar">Export Estimate</button>
        {rec && (
          <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)" }}>
            Generated: {new Date(rec.createdAt).toLocaleString()} ·{" "}
            <ConfidenceBadge confidence={rec.confidence} />
          </span>
        )}
      </div>

      {!rec ? (
        <>
          {/* No AI estimate — manual notice */}
          <div className="panel" style={{ borderColor: "var(--warning-border)" }}>
            <div className="panel-header" style={{ background: "var(--warning-bg)", color: "var(--warning-text)", borderBottomColor: "var(--warning-border)" }}>
              ⚠ NO AI PRICING ESTIMATE ON RECORD — MANUAL ENTRY REQUIRED
            </div>
            <div className="panel-body">
              <p style={{ fontSize: 12, color: "var(--warning-text)", margin: "0 0 8px 0" }}>
                No AI-assisted pricing estimate has been generated. Estimating MEP is offline — cost data cannot be pulled automatically.
                Click <strong>&quot;Generate Pricing&quot;</strong> to run the pricing engine once scope is complete,
                or proceed to <strong>Approval</strong> and enter the agreed value manually.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: "28px" }}>
                  → Pricing is optional. Approver can record a final value directly on the Approval tab.
                </span>
              </div>
            </div>
          </div>

          {/* Manual cost summary from CO fields */}
          <div className="panel">
            <div className="panel-header">MANUAL COST INPUTS — From Record Header (Unverified)</div>
            <div style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Value</th>
                    <th>Source</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Labor Hours</td>
                    <td style={{ textAlign: "right" }}>{co.laborHours} hrs @ est. $95/hr</td>
                    <td className="warn-cell" style={{ fontSize: 11 }}>Manual entry</td>
                    <td className="warn-cell" style={{ fontWeight: 700, fontSize: 11 }}>UNVERIFIED</td>
                  </tr>
                  <tr>
                    <td>Material</td>
                    <td style={{ textAlign: "right" }}>${co.materialTotal.toFixed(2)}</td>
                    <td className="warn-cell" style={{ fontSize: 11 }}>Manual entry</td>
                    <td className="warn-cell" style={{ fontWeight: 700, fontSize: 11 }}>UNVERIFIED</td>
                  </tr>
                  <tr>
                    <td>Equipment</td>
                    <td style={{ textAlign: "right" }}>${co.equipmentTotal.toFixed(2)}</td>
                    <td className="warn-cell" style={{ fontSize: 11 }}>Manual entry</td>
                    <td className="warn-cell" style={{ fontWeight: 700, fontSize: 11 }}>UNVERIFIED</td>
                  </tr>
                  <tr>
                    <td>Subcontractor</td>
                    <td style={{ textAlign: "right" }}>${co.subcontractorTotal.toFixed(2)}</td>
                    <td className="warn-cell" style={{ fontSize: 11 }}>Manual entry</td>
                    <td className="warn-cell" style={{ fontWeight: 700, fontSize: 11 }}>UNVERIFIED</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ background: "var(--nav-bg)" }}>
                    <td colSpan={1} style={{ fontWeight: 700, color: "white", border: "1px solid var(--nav-border)", fontSize: 11, letterSpacing: "0.03em" }}>
                      MANUAL SUBTOTAL (NO MARGIN APPLIED)
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700, color: "white", fontFamily: "monospace", fontSize: 13, border: "1px solid var(--nav-border)" }}>
                      ${(co.laborHours * 95 + co.materialTotal + co.equipmentTotal + co.subcontractorTotal).toFixed(2)}
                    </td>
                    <td colSpan={2} style={{ border: "1px solid var(--nav-border)", color: "#FCD34D", fontSize: 11 }}>
                      ⚠ No markup applied · No confidence rating · No historical validation
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Estimate summary */}
          <div className="panel">
            <div className="panel-header">ESTIMATE SUMMARY</div>
            <div style={{ padding: 0 }}>
              <table>
                <tbody>
                  <tr>
                    <th style={{ width: 180 }}>Total Estimated Value</th>
                    <td style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 16 }}>
                      ${rec.recommendedTotal.toFixed(2)}
                    </td>
                    <th style={{ width: 180 }}>Confidence Level</th>
                    <td><ConfidenceBadge confidence={rec.confidence} /></td>
                  </tr>
                  <tr>
                    <th>Budget Impact</th>
                    <td className={rec.budgetImpact > 0 ? "warn-cell" : ""}>
                      {rec.budgetImpact > 0 ? `+$${rec.budgetImpact.toFixed(2)}` : "—"}
                    </td>
                    <th>Revenue Impact</th>
                    <td>{rec.revenueImpact > 0 ? `+$${rec.revenueImpact.toFixed(2)}` : "—"}</td>
                  </tr>
                  <tr>
                    <th>Schedule Impact</th>
                    <td>{rec.scheduleImpactDays != null ? `${rec.scheduleImpactDays} days` : "Not assessed"}</td>
                    <th>Generated At</th>
                    <td style={{ color: "var(--text-secondary)" }}>{new Date(rec.createdAt).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <th>Rationale</th>
                    <td colSpan={3} style={{ color: "var(--text-secondary)", fontSize: 12 }}>{rec.rationale}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost breakdown */}
          <div className="panel">
            <div className="panel-header">COST BREAKDOWN — By Category</div>
            <div style={{ padding: 0 }}>
              <CostBreakdownTable breakdown={rec.costBreakdown} />
            </div>
          </div>

          {/* Warnings / missing info */}
          {(rec.warnings.length > 0 || rec.missingInfoFlags.length > 0) && (
            <div className="panel" style={{ borderColor: "var(--warning-border)" }}>
              <div className="panel-header" style={{ background: "var(--warning-bg)", color: "var(--warning-text)", borderBottomColor: "var(--warning-border)" }}>
                WARNINGS &amp; MISSING DATA FLAGS
              </div>
              <div style={{ padding: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.warnings.map((w, i) => (
                      <tr key={i}>
                        <td className="warn-cell" style={{ fontWeight: 700, fontSize: 11 }}>WARNING</td>
                        <td>{w}</td>
                      </tr>
                    ))}
                    {rec.missingInfoFlags.map((f, i) => (
                      <tr key={`f-${i}`}>
                        <td className="error-cell" style={{ fontWeight: 700, fontSize: 11 }}>MISSING DATA</td>
                        <td>{f}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </ChangeOrderDetailLayout>
  );
}
