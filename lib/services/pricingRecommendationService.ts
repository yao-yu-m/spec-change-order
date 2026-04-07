/**
 * PricingRecommendationService – orchestrates AI pricing and stores results.
 * Delegates AI logic to the orchestration layer; delegates persistence to PricingRepository.
 */

import type {
  PricingRecommendation,
  GeneratePricingRequestDto,
  GeneratePricingResponseDto,
} from "@/lib/domain/types";
import { generatePricingRecommendation } from "@/lib/ai/pricingOrchestrator";
import { PricingRepository } from "@/lib/repositories/pricingRepository";
import { AuditRepository } from "@/lib/repositories/auditRepository";
import { EventBus } from "@/lib/events/eventBus";
import type { PricingGeneratedPayload } from "@/lib/events/eventTypes";
import { setCurrentRecommendation } from "./changeOrderService";

export const PricingRecommendationService = {
  getRecommendationById(id: string): PricingRecommendation | undefined {
    return PricingRepository.findById(id);
  },

  getRecommendationsByChangeOrderId(changeOrderId: string): PricingRecommendation[] {
    return PricingRepository.findByChangeOrderId(changeOrderId);
  },

  getCurrentRecommendation(changeOrderId: string): PricingRecommendation | undefined {
    return PricingRepository.findLatestByChangeOrderId(changeOrderId);
  },

  generateAndStoreRecommendation(
    request: GeneratePricingRequestDto
  ): GeneratePricingResponseDto {
    const { recommendation, warnings } = generatePricingRecommendation(request);

    PricingRepository.insert(recommendation);
    setCurrentRecommendation(request.changeOrderId, recommendation.id);

    AuditRepository.append(
      request.changeOrderId,
      "PricingGenerated",
      `Pricing recommendation generated (confidence: ${recommendation.confidence})`,
      { userName: request.requestedBy }
    );

    EventBus.publish<PricingGeneratedPayload>(
      "PricingGenerated",
      request.changeOrderId,
      "ChangeOrder",
      {
        changeOrderId: request.changeOrderId,
        recommendationId: recommendation.id,
        recommendedTotal: recommendation.recommendedTotal,
        confidence: recommendation.confidence,
      },
      request.requestedBy
    );

    return { recommendation, warnings };
  },
};

// ─── Free function aliases for backward compatibility ──────────────────────

export function getRecommendationById(id: string): PricingRecommendation | undefined {
  return PricingRecommendationService.getRecommendationById(id);
}
export function getRecommendationsByChangeOrderId(changeOrderId: string): PricingRecommendation[] {
  return PricingRecommendationService.getRecommendationsByChangeOrderId(changeOrderId);
}
export function getCurrentRecommendation(changeOrderId: string): PricingRecommendation | undefined {
  return PricingRecommendationService.getCurrentRecommendation(changeOrderId);
}
export function generateAndStoreRecommendation(
  request: GeneratePricingRequestDto
): GeneratePricingResponseDto {
  return PricingRecommendationService.generateAndStoreRecommendation(request);
}
