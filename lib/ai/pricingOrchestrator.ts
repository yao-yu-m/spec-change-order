/**
 * Pricing orchestrator – main entry point for AI-assisted pricing.
 * Follows ERP-Agents-style orchestration pattern:
 *   1. Build structured context from domain data (contextBuilder)
 *   2. Apply rules / call AI model (rules engine mock; swap for LLM call)
 *   3. Parse and validate output (outputParser)
 *   4. Return typed PricingRecommendation
 *
 * In production: step 2 becomes an async call to Databricks / OpenAI / Azure AI.
 */

import type {
  PricingContext,
  PricingConfidence,
  CostBreakdown,
  GeneratePricingRequestDto,
  GeneratePricingResponseDto,
} from "@/lib/domain/types";
import {
  PRICING_RULES,
  buildRationaleTemplate,
  ASSUMPTION_TEMPLATES,
} from "./promptTemplates";
import type { RawPricingOutput } from "./outputParser";
import { parseRecommendationOutput } from "./outputParser";

// ─── Internal costing engine (rules-based mock) ────────────────────────────

function calculateCostBreakdown(
  laborHours: number,
  materialTotal: number,
  equipmentTotal: number,
  subcontractorTotal: number
): CostBreakdown {
  const laborTotal = laborHours * PRICING_RULES.laborRatePerHour;
  const equipmentWithMarkup = equipmentTotal * PRICING_RULES.equipmentMarkupFactor;
  const subtotal = laborTotal + materialTotal + equipmentWithMarkup + subcontractorTotal;
  const total =
    Math.round(subtotal * (1 + PRICING_RULES.defaultMarginPercent / 100) * 100) / 100;
  return {
    laborHours,
    laborRate: PRICING_RULES.laborRatePerHour,
    laborTotal: Math.round(laborTotal * 100) / 100,
    materialTotal,
    equipmentTotal: Math.round(equipmentWithMarkup * 100) / 100,
    subcontractorTotal,
    total,
    marginPercent: PRICING_RULES.defaultMarginPercent,
  };
}

function deriveConfidence(context: PricingContext): PricingConfidence {
  const filledInputs = [
    context.laborHours > 0,
    context.materialTotal > 0,
    context.equipmentTotal > 0,
    context.subcontractorTotal > 0,
  ].filter(Boolean).length;
  if (filledInputs >= 3) return "High";
  if (filledInputs >= 2) return "Medium";
  return "Low";
}

function buildWarnings(context: PricingContext): string[] {
  const warnings: string[] = [];
  if (
    context.laborHours <= 0 &&
    context.materialTotal <= 0 &&
    context.equipmentTotal <= 0
  ) {
    warnings.push("No cost inputs provided; recommendation is a placeholder only.");
  }
  if (context.laborHours > PRICING_RULES.highLaborHoursThreshold) {
    warnings.push(
      `Labor hours (${context.laborHours}) exceed ${PRICING_RULES.highLaborHoursThreshold}; verify with field supervisor.`
    );
  }
  if (!context.scopeSummary || context.scopeSummary.length < 20) {
    warnings.push("Scope description is brief; add detail for audit trail integrity.");
  }
  return warnings;
}

function buildMissingInfoFlags(context: PricingContext): string[] {
  const flags: string[] = [];
  if (!context.costCode) flags.push("Cost code not assigned – required for ERP sync.");
  if (
    context.subcontractorTotal === 0 &&
    context.materialTotal > PRICING_RULES.subcontractorCheckMaterialThreshold
  ) {
    flags.push(
      "No subcontractor amount; verify whether work is self-performed or requires sub-quote."
    );
  }
  return flags;
}

/**
 * Runs the mock rules engine against the pricing context.
 * In production: replace this function body with an async LLM / AI API call.
 * The RawPricingOutput contract is what the LLM would be instructed to return as JSON.
 */
function runPricingEngine(context: PricingContext): RawPricingOutput {
  const breakdown = calculateCostBreakdown(
    context.laborHours,
    context.materialTotal,
    context.equipmentTotal,
    context.subcontractorTotal
  );

  const assumptions = [
    ASSUMPTION_TEMPLATES.laborRate(PRICING_RULES.laborRatePerHour),
    ASSUMPTION_TEMPLATES.equipmentMarkup(),
    ASSUMPTION_TEMPLATES.margin(PRICING_RULES.defaultMarginPercent),
  ];
  if (context.subcontractorTotal > 0) {
    assumptions.push(ASSUMPTION_TEMPLATES.subcontractorQuote());
  }

  const evidenceReferences = [
    {
      type: "Historical" as const,
      reference: context.historicalComparables?.[0] ?? "CO-2024-012",
      value: breakdown.total * 0.92,
    },
    {
      type: "Estimate" as const,
      reference: "Preliminary takeoff",
      value: breakdown.total,
    },
  ];

  return {
    recommendedTotal: breakdown.total,
    breakdown,
    confidence: deriveConfidence(context),
    rationale: buildRationaleTemplate(
      context.laborHours,
      PRICING_RULES.laborRatePerHour,
      PRICING_RULES.defaultMarginPercent
    ),
    budgetImpact: breakdown.total,
    revenueImpact: breakdown.total,
    scheduleImpactDays:
      context.laborHours > 40
        ? Math.ceil(context.laborHours / 8)
        : undefined,
    assumptions,
    evidenceReferences,
    warnings: buildWarnings(context),
    missingInfoFlags: buildMissingInfoFlags(context),
  };
}

// ─── Public orchestration entry point ─────────────────────────────────────

/**
 * generatePricingRecommendation – main orchestration method.
 * Accepts a GeneratePricingRequestDto, returns GeneratePricingResponseDto.
 * Backward-compatible with the old recommendationOrchestrator signature.
 */
export function generatePricingRecommendation(
  request: GeneratePricingRequestDto
): GeneratePricingResponseDto {
  const context: PricingContext = {
    changeOrderId: request.changeOrderId,
    projectId: request.projectId,
    laborHours: request.laborHours,
    materialTotal: request.materialTotal,
    equipmentTotal: request.equipmentTotal,
    subcontractorTotal: request.subcontractorTotal ?? 0,
    scopeSummary: request.scopeSummary ?? "",
    costCode: request.costCode,
  };

  const rawOutput = runPricingEngine(context);
  const recommendation = parseRecommendationOutput(
    request.changeOrderId,
    rawOutput,
    request.requestedBy ?? "System"
  );

  return {
    recommendation,
    warnings: recommendation.warnings,
  };
}
