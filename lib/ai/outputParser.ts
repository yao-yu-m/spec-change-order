/**
 * Output parser – converts raw AI model output into typed domain models.
 * In production: parses LLM JSON response, validates schema, and maps to
 * PricingRecommendation. Handles malformed output gracefully.
 */

import type {
  PricingRecommendation,
  CostBreakdown,
  Assumption,
  EvidenceItem,
  PricingConfidence,
} from "@/lib/domain/types";
import { generateId } from "@/lib/data/store";

/** Raw output shape from AI model (or rules engine in mock). */
export interface RawPricingOutput {
  recommendedTotal: number;
  breakdown: CostBreakdown;
  confidence: PricingConfidence;
  rationale: string;
  budgetImpact: number;
  revenueImpact: number;
  scheduleImpactDays?: number;
  assumptions: Array<{ description: string; source?: string }>;
  evidenceReferences: Array<{ type: EvidenceItem["type"]; reference: string; value?: number }>;
  warnings: string[];
  missingInfoFlags: string[];
}

/**
 * Parses raw AI output into a fully typed PricingRecommendation.
 * In production: add JSON schema validation (e.g. Zod) before this step.
 */
export function parseRecommendationOutput(
  changeOrderId: string,
  raw: RawPricingOutput,
  createdBy?: string
): PricingRecommendation {
  const recommendationId = generateId("rec");

  const assumptions: Assumption[] = raw.assumptions.map((a) => ({
    id: generateId("asm"),
    recommendationId,
    description: a.description,
    source: a.source,
  }));

  const evidence: EvidenceItem[] = raw.evidenceReferences.map((e) => ({
    id: generateId("ev"),
    recommendationId,
    type: e.type,
    reference: e.reference,
    value: e.value,
  }));

  return {
    id: recommendationId,
    changeOrderId,
    recommendedTotal: raw.recommendedTotal,
    costBreakdown: raw.breakdown,
    assumptions,
    evidence,
    confidence: raw.confidence,
    rationale: raw.rationale,
    budgetImpact: raw.budgetImpact,
    revenueImpact: raw.revenueImpact,
    scheduleImpactDays: raw.scheduleImpactDays,
    warnings: raw.warnings,
    missingInfoFlags: raw.missingInfoFlags,
    createdAt: new Date().toISOString(),
    createdBy: createdBy ?? "System",
  };
}
