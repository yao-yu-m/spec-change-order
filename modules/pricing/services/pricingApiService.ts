/**
 * Pricing API service – Angular-module-style client for pricing endpoints.
 */

import type { PricingRecommendation } from "@/lib/domain/types";

const BASE = "/api/change-orders";

export const PricingApiService = {
  /** GET current recommendation for a change order. */
  async getCurrentRecommendation(changeOrderId: string): Promise<PricingRecommendation> {
    const res = await fetch(`${BASE}/${changeOrderId}/recommendation`);
    if (!res.ok) throw new Error("Failed to load pricing recommendation");
    return res.json();
  },

  /** POST to generate (or regenerate) pricing recommendation. */
  async generatePricing(
    changeOrderId: string,
    requestedBy?: string
  ): Promise<{ recommendation: PricingRecommendation; warnings: string[] }> {
    const res = await fetch(`${BASE}/${changeOrderId}/generate-pricing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestedBy }),
    });
    if (!res.ok) throw new Error("Failed to generate pricing");
    return res.json();
  },
};
