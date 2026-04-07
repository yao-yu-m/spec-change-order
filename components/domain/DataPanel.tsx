"use client";

export function DataPanel({
  title,
  children,
  className = "",
  actions,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-header">
        <span>{title}</span>
        {actions && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: "normal", textTransform: "none", letterSpacing: "normal" }}>
            {actions}
          </div>
        )}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}
