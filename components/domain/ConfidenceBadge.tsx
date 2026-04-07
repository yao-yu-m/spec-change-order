"use client";

import type { PricingConfidence } from "@/lib/domain/types";

const confConfig: Record<PricingConfidence, { bg: string; text: string; border: string }> = {
  High:   { bg: "#F0FDF4", text: "#15803D", border: "#86EFAC" },
  Medium: { bg: "#FFFBEB", text: "#B45309", border: "#FCD34D" },
  Low:    { bg: "#FEF2F2", text: "#B91C1C", border: "#FCA5A5" },
};

export function ConfidenceBadge({ confidence }: { confidence: PricingConfidence }) {
  const s = confConfig[confidence];
  return (
    <span
      className="status-tag"
      style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
    >
      CONF: {confidence.toUpperCase()}
    </span>
  );
}
