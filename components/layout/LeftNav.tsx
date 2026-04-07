"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navGroups = [
  {
    group: "WORKSPACE",
    items: [
      { href: "/", label: "Dashboard" },
      { href: "/change-orders", label: "Change Orders" },
      { href: "/intake", label: "New CO – Intake" },
      { href: "/finance", label: "Finance / Billable" },
    ],
  },
  {
    group: "INTEGRATIONS",
    items: [
      { href: "/settings", label: "System Connections" },
      { href: "/erp-sync", label: "ERP Sync Status", warn: true },
      { href: "/settings", label: "Document Control" },
    ],
  },
  {
    group: "CONFIGURATION",
    items: [
      { href: "/cost-codes", label: "Cost Code Table" },
      { href: "/labor-rates", label: "Labor Rate Table" },
      { href: "/projects", label: "Project Registry" },
      { href: "/settings", label: "User Permissions" },
    ],
  },
];

export function LeftNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 188,
        minWidth: 188,
        flexShrink: 0,
        background: "var(--nav-bg)",
        borderRight: "1px solid var(--nav-border)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      {/* Module version chip */}
      <div
        style={{
          padding: "6px 10px",
          background: "var(--nav-bg-dark)",
          borderBottom: "1px solid var(--nav-border)",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "var(--nav-text-muted)", textTransform: "uppercase" }}>
          CO Pricing Module
        </div>
        <div style={{ fontSize: 9, color: "var(--nav-text-muted)", marginTop: 1 }}>
          Build 20240210 · PROD
        </div>
      </div>

      {/* Nav groups */}
      {navGroups.map((group) => (
        <div key={group.group} style={{ borderBottom: "1px solid var(--nav-border)" }}>
          <div
            style={{
              padding: "5px 10px 3px",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--nav-text-muted)",
            }}
          >
            {group.group}
          </div>
          {group.items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "4px 10px 4px 14px",
                  fontSize: 12,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#FFFFFF" : "var(--nav-text)",
                  background: active ? "var(--nav-active-bg)" : "transparent",
                  borderBottom: "1px solid var(--nav-border)",
                  textDecoration: "none",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "var(--nav-hover-bg)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                <span>{item.label}</span>
                {"warn" in item && item.warn && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      background: "#B45309",
                      color: "white",
                      padding: "0 4px",
                      borderRadius: 2,
                    }}
                  >
                    !
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Bottom status */}
      <div style={{ marginTop: "auto", padding: "6px 10px", borderTop: "1px solid var(--nav-border)" }}>
        <div style={{ fontSize: 9, color: "var(--nav-text-muted)" }}>Last sync: 06:00 UTC</div>
        <div style={{ fontSize: 9, color: "#B45309", marginTop: 2 }}>⚠ Estimating: offline</div>
      </div>
    </nav>
  );
}
