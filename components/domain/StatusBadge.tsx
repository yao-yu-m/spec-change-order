"use client";

import type { ApprovalStatus } from "@/lib/domain/types";

const statusConfig: Record<ApprovalStatus, { bg: string; text: string; border: string }> = {
  Draft:              { bg: "#F9FAFB",  text: "#374151", border: "#D0D5DD" },
  "In Review":        { bg: "#FFFBEB",  text: "#B45309", border: "#FCD34D" },
  Priced:             { bg: "#EFF6FF",  text: "#1D4ED8", border: "#93C5FD" },
  "Needs Revision":   { bg: "#FFF7ED",  text: "#C2410C", border: "#FDBA74" },
  "Pending Approval": { bg: "#EFF6FF",  text: "#1D4ED8", border: "#93C5FD" },
  Approved:           { bg: "#F0FDF4",  text: "#15803D", border: "#86EFAC" },
  Rejected:           { bg: "#FEF2F2",  text: "#B91C1C", border: "#FCA5A5" },
  Synced:             { bg: "#F8FAFC",  text: "#475569", border: "#CBD5E1" },
};

const statusLabel: Record<ApprovalStatus, string> = {
  Draft:              "DRAFT",
  "In Review":        "IN REVIEW",
  Priced:             "PRICED",
  "Needs Revision":   "NEEDS REVISION",
  "Pending Approval": "PENDING APPR.",
  Approved:           "APPROVED",
  Rejected:           "REJECTED",
  Synced:             "SYNCED",
};

export function StatusBadge({ status }: { status: ApprovalStatus }) {
  const s = statusConfig[status] ?? statusConfig.Draft;
  return (
    <span
      className="status-tag"
      style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
    >
      {statusLabel[status] ?? status.toUpperCase()}
    </span>
  );
}
