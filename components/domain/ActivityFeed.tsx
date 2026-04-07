"use client";

import type { AuditRecord } from "@/lib/domain/types";

export function ActivityFeed({ events }: { events: AuditRecord[] }) {
  if (events.length === 0) {
    return <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>No audit records found.</p>;
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Event Type</th>
          <th>Description</th>
          <th>User</th>
          <th>User ID</th>
        </tr>
      </thead>
      <tbody>
        {events.map((e) => (
          <tr key={e.id}>
            <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
              {new Date(e.timestamp).toLocaleString()}
            </td>
            <td style={{ fontWeight: 500, whiteSpace: "nowrap" }}>{e.eventType}</td>
            <td>{e.description}</td>
            <td>{e.userName ?? "—"}</td>
            <td style={{ color: "var(--text-muted)", fontSize: 11 }}>{e.userId ?? "SYSTEM"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
