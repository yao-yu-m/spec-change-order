"use client";

export function TopBar() {
  return (
    <div
      style={{
        flexShrink: 0,
        height: 34,
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--nav-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left: identity + menu */}
      <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
        {/* Product name */}
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            background: "var(--nav-bg-dark)",
            borderRight: "1px solid var(--nav-border)",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#93C5FD" }}>
            CORESTONE
          </span>
          <span style={{ fontSize: 10, color: "var(--nav-text-muted)", marginTop: 1 }}>
            Systems Inc.
          </span>
        </div>

        {/* Module label */}
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            borderRight: "1px solid var(--nav-border)",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--nav-text)" }}>
            Corestone CMS — Change Order Pricing
          </span>
          <span style={{ fontSize: 10, color: "var(--nav-text-muted)", marginLeft: 8 }}>
            v3.2.1
          </span>
        </div>

        {/* Menu buttons */}
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 6px",
            borderRight: "1px solid var(--nav-border)",
            gap: 2,
          }}
        >
          {["File", "Edit", "View", "Tools", "Reports", "Help"].map((label) => (
            <button
              key={label}
              style={{
                background: "transparent",
                border: "1px solid transparent",
                color: "var(--nav-text)",
                fontSize: 11,
                padding: "2px 8px",
                cursor: "pointer",
                borderRadius: 2,
                lineHeight: 1.5,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.background = "var(--nav-hover-bg)";
                (e.target as HTMLButtonElement).style.borderColor = "var(--nav-border)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.background = "transparent";
                (e.target as HTMLButtonElement).style.borderColor = "transparent";
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: system info */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 12px" }}>
        <span style={{ fontSize: 10, color: "var(--nav-text-muted)" }}>ENV: PROD-US-EAST</span>
        <span style={{ fontSize: 10, color: "var(--nav-text-muted)" }}>DB: TRIMBLE-SQL-02</span>
        <span style={{ fontSize: 11, color: "var(--nav-text)" }}>zara.hall@contractor.corestone.com</span>
        <div
          title="Connected"
          style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", border: "1px solid #16A34A" }}
        />
      </div>
    </div>
  );
}
