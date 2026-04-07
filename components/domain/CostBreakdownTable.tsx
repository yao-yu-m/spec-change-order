"use client";

import type { CostBreakdown } from "@/lib/domain/types";

export function CostBreakdownTable({ breakdown }: { breakdown: CostBreakdown }) {
  const rows = [
    { category: "Labor",        qty: `${breakdown.laborHours} hrs`, unitCost: `$${breakdown.laborRate}/hr`, subtotal: breakdown.laborTotal,        source: "Rate table", override: false },
    { category: "Material",     qty: "1 LS",                        unitCost: "—",                          subtotal: breakdown.materialTotal,     source: "Manual entry", override: true },
    { category: "Equipment",    qty: "1 LS",                        unitCost: "+15% markup",                subtotal: breakdown.equipmentTotal,    source: "Manual entry", override: false },
    ...(breakdown.subcontractorTotal > 0
      ? [{ category: "Subcontractor", qty: "1 LS", unitCost: "—", subtotal: breakdown.subcontractorTotal, source: "Quote on file", override: false }]
      : []),
  ];

  const subtotal = breakdown.laborTotal + breakdown.materialTotal + breakdown.equipmentTotal + breakdown.subcontractorTotal;
  const marginAmt = breakdown.total - subtotal;

  return (
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Quantity</th>
          <th>Unit Cost</th>
          <th style={{ textAlign: "right" }}>Subtotal ($)</th>
          <th>Source</th>
          <th>Override</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.category}>
            <td style={{ fontWeight: 500 }}>{row.category}</td>
            <td style={{ color: "var(--text-secondary)" }}>{row.qty}</td>
            <td style={{ color: "var(--text-secondary)" }}>{row.unitCost}</td>
            <td style={{ textAlign: "right", fontWeight: 600 }}>{row.subtotal.toFixed(2)}</td>
            <td style={{ color: "var(--text-secondary)" }}>{row.source}</td>
            <td>
              {row.override ? (
                <span className="warn-cell" style={{ fontWeight: 700, fontSize: 10 }}>YES</span>
              ) : (
                <span style={{ color: "var(--text-muted)" }}>—</span>
              )}
            </td>
          </tr>
        ))}

        {/* Subtotal */}
        <tr style={{ background: "var(--bg-header)" }}>
          <td colSpan={3} style={{ textAlign: "right", fontWeight: 600, color: "var(--text-secondary)" }}>Subtotal</td>
          <td style={{ textAlign: "right", fontWeight: 600 }}>{subtotal.toFixed(2)}</td>
          <td colSpan={2} />
        </tr>

        {/* Margin */}
        <tr style={{ background: "var(--bg-header)" }}>
          <td colSpan={3} style={{ textAlign: "right", color: "var(--text-secondary)" }}>
            Margin ({breakdown.marginPercent ?? 12}%)
          </td>
          <td style={{ textAlign: "right", color: "var(--text-secondary)" }}>{marginAmt.toFixed(2)}</td>
          <td colSpan={2} />
        </tr>

        {/* Total */}
        <tr style={{ background: "var(--nav-bg)", color: "white" }}>
          <td
            colSpan={3}
            style={{ fontWeight: 700, textAlign: "right", color: "white", border: "1px solid var(--nav-border)", fontSize: 11, letterSpacing: "0.03em" }}
          >
            TOTAL ESTIMATED VALUE
          </td>
          <td
            style={{ textAlign: "right", fontWeight: 700, color: "white", border: "1px solid var(--nav-border)", fontFamily: "monospace", fontSize: 13 }}
          >
            {breakdown.total.toFixed(2)}
          </td>
          <td colSpan={2} style={{ border: "1px solid var(--nav-border)" }} />
        </tr>
      </tbody>
    </table>
  );
}
