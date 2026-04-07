"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export interface TabConfig {
  id: string;
  label: string;
  href: string;
}

export function TabbedWorkspace({
  tabs,
  children,
}: {
  tabs: TabConfig[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Tab bar */}
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          background: "var(--bg-header)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              style={{
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--blue)" : "var(--text-secondary)",
                background: active ? "var(--bg-panel)" : "transparent",
                borderRight: "1px solid var(--border)",
                borderBottom: active ? "2px solid var(--blue)" : "none",
                marginBottom: active ? -1 : 0,
                textDecoration: "none",
                whiteSpace: "nowrap",
                transition: "color 0.1s, background 0.1s",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "var(--bg-app)",
          padding: 10,
        }}
      >
        {children}
      </div>
    </div>
  );
}
