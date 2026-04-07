"use client";

import { useParams } from "next/navigation";
import { TabbedWorkspace } from "@/components/layout/TabbedWorkspace";
import { StatusBadge } from "@/components/domain/StatusBadge";
import type { ApprovalStatus, ChangeOrder, Project } from "@/lib/domain/types";

const WORKFLOW_STEPS: { status: ApprovalStatus; label: string; step: number }[] = [
  { status: "Draft",            label: "1. Draft",            step: 1 },
  { status: "In Review",        label: "2. Field Review",     step: 2 },
  { status: "Priced",           label: "3. Priced",           step: 3 },
  { status: "Pending Approval", label: "4. Pending Approval", step: 4 },
  { status: "Approved",         label: "5. Approved",         step: 5 },
];

const STATUS_STEP: Record<string, number> = {
  "Draft": 1, "In Review": 2, "Needs Revision": 2,
  "Priced": 3, "Pending Approval": 4, "Approved": 5, "Rejected": 4, "Synced": 5,
};

export function ChangeOrderDetailLayout({
  changeOrder,
  project,
  children,
}: {
  changeOrder: ChangeOrder;
  project: Project | null;
  children: React.ReactNode;
}) {
  const params = useParams();
  const id = params?.id as string;
  const base = `/change-orders/${id}`;
  const tabs = [
    { id: "overview", label: "Overview", href: base },
    { id: "scope", label: "Scope / Line Items", href: `${base}/scope` },
    { id: "pricing", label: "Pricing", href: `${base}/pricing` },
    { id: "assumptions", label: "Assumptions", href: `${base}/assumptions` },
    { id: "approval", label: "Approval", href: `${base}/approval` },
    { id: "audit", label: "Audit Log", href: `${base}/audit` },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Record context bar */}
      <div
        style={{
          flexShrink: 0,
          height: 30,
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--nav-border)",
          display: "flex",
          alignItems: "center",
          padding: "0 10px",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 10, color: "var(--nav-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Record:</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{changeOrder.changeOrderNumber}</span>
        <span style={{ fontSize: 11, color: "var(--nav-text)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {changeOrder.title}
        </span>
        <span style={{ color: "var(--nav-text-muted)", fontSize: 10 }}>|</span>
        {project && (
          <>
            <span style={{ fontSize: 10, color: "var(--nav-text-muted)" }}>Project:</span>
            <span style={{ fontSize: 11, color: "var(--nav-text)" }}>{project.projectNumber}</span>
            <span style={{ color: "var(--nav-text-muted)", fontSize: 10 }}>|</span>
          </>
        )}
        <span style={{ fontSize: 10, color: "var(--nav-text-muted)" }}>Cost Code:</span>
        <span style={{ fontSize: 11, color: changeOrder.costCode ? "var(--nav-text)" : "#B45309" }}>
          {changeOrder.costCode ?? "NOT ASSIGNED"}
        </span>
        <span style={{ color: "var(--nav-text-muted)", fontSize: 10 }}>|</span>
        <StatusBadge status={changeOrder.status} />
      </div>

      {/* Secondary toolbar */}
      <div className="toolbar-strip">
        <button className="btn-toolbar">Save</button>
        <button className="btn-toolbar">Print</button>
        <button className="btn-toolbar">Export CSV</button>
        <span className="toolbar-sep">|</span>
        <button className="btn-toolbar">Attach Document</button>
        <button className="btn-toolbar">Add Note</button>
        <span className="toolbar-sep">|</span>
        <button className="btn-toolbar">Sync to ERP</button>
        <button className="btn-toolbar">Sync to ProjectSight</button>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)" }}>
          Modified: {new Date(changeOrder.updatedAt).toLocaleString()}
          {changeOrder.modifiedBy && ` · ${changeOrder.modifiedBy}`}
        </span>
      </div>

      {/* Workflow pipeline */}
      <div
        style={{
          flexShrink: 0,
          background: "var(--bg-panel-alt)",
          borderBottom: "1px solid var(--border)",
          padding: "4px 10px",
          display: "flex",
          alignItems: "center",
          gap: 0,
          overflowX: "auto",
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 10, whiteSpace: "nowrap" }}>
          Workflow:
        </span>
        {WORKFLOW_STEPS.map((s, i) => {
          const currentStep = STATUS_STEP[changeOrder.status] ?? 1;
          const done = s.step < currentStep;
          const active = s.step === currentStep;
          const isRejected = changeOrder.status === "Rejected" && s.step === 4;
          return (
            <div key={s.status} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && (
                <div style={{ width: 20, height: 1, background: done ? "var(--blue)" : "var(--border)", flexShrink: 0 }} />
              )}
              <div
                style={{
                  padding: "2px 8px",
                  fontSize: 10,
                  fontWeight: active ? 700 : 400,
                  whiteSpace: "nowrap",
                  color: isRejected ? "var(--error-text)"
                    : active ? "var(--blue)"
                    : done ? "var(--success-text)"
                    : "var(--text-muted)",
                  background: isRejected ? "var(--error-bg)"
                    : active ? "var(--info-bg)"
                    : done ? "var(--success-bg)"
                    : "transparent",
                  border: `1px solid ${isRejected ? "var(--error-border)" : active ? "var(--info-border)" : done ? "var(--success-border)" : "var(--border-light)"}`,
                  borderRadius: 2,
                }}
              >
                {isRejected ? "✗ REJECTED" : done ? `✓ ${s.label}` : s.label}
              </div>
            </div>
          );
        })}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", paddingLeft: 16 }}>
          ⚠ Status updates require manual save — this system does not send notifications automatically.
        </span>
      </div>

      <TabbedWorkspace tabs={tabs}>{children}</TabbedWorkspace>
    </div>
  );
}
