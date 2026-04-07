/**
 * PricingRecommendation repository – raw data access only.
 * In production: SQL table with versioned rows per change order.
 */

import type { PricingRecommendation } from "@/lib/domain/types";
import { recommendationStore, ensureSeeded } from "@/lib/data/store";

export const PricingRepository = {
  findById(id: string): PricingRecommendation | undefined {
    ensureSeeded();
    return recommendationStore.find((r) => r.id === id);
  },

  findByChangeOrderId(changeOrderId: string): PricingRecommendation[] {
    ensureSeeded();
    return recommendationStore.filter((r) => r.changeOrderId === changeOrderId);
  },

  findLatestByChangeOrderId(changeOrderId: string): PricingRecommendation | undefined {
    ensureSeeded();
    const rows = recommendationStore
      .filter((r) => r.changeOrderId === changeOrderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return rows[0];
  },

  insert(entity: PricingRecommendation): PricingRecommendation {
    ensureSeeded();
    recommendationStore.push(entity);
    return entity;
  },
};
