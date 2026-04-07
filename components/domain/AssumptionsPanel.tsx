"use client";

import type { Assumption } from "@/lib/domain/types";

export function AssumptionsPanel({ assumptions }: { assumptions: Assumption[] }) {
  if (!assumptions.length) {
    return <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>No assumptions recorded.</p>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Assumption</th>
          <th>Source / Basis</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {assumptions.map((a) => (
          <tr key={a.id}>
            <td>{a.description}</td>
            <td style={{ color: "var(--text-secondary)" }}>{a.source ?? "—"}</td>
            <td style={{ color: "var(--success-text)", fontWeight: 600, fontSize: 11 }}>ACTIVE</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
