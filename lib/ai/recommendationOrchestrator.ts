/**
 * AI recommendation orchestration layer.
 * Accepts structured project/scope input; returns pricing recommendation with rationale, assumptions, confidence.
 * Deterministic mock/fallback; swappable for real AI service later.
 */

import type {
  PricingRecommendation,
  PricingRecommendationRequest,
  PricingRecommendationResponse,
  CostBreakdown,
  Assumption,
  EvidenceItem,
  PricingConfidence,
} from "@/lib/domain/types";

const LABOR_RATE = 85;
const EQUIPMENT_MARGIN = 1.15;
const DEFAULT_MARGIN_PERCENT = 12;

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function computeCostBreakdown(
  laborHours: number,
  materialTotal: number,
  equipmentTotal: number,
  subcontractorTotal: number
): CostBreakdown {
  const laborTotal = laborHours * LABOR_RATE;
  const equipmentWithMargin = equipmentTotal * EQUIPMENT_MARGIN;
  const subtotal = laborTotal + materialTotal + equipmentWithMargin + subcontractorTotal;
  const total = Math.round(subtotal * (1 + DEFAULT_MARGIN_PERCENT / 100) * 100) / 100;
  return {
    laborHours,
    laborRate: LABOR_RATE,
    laborTotal: Math.round(laborTotal * 100) / 100,
    materialTotal,
    equipmentTotal: Math.round(equipmentWithMargin * 100) / 100,
    subcontractorTotal,
    total,
    marginPercent: DEFAULT_MARGIN_PERCENT,
  };
}

function deriveConfidence(
  laborHours: number,
  materialTotal: number,
  equipmentTotal: number,
  subcontractorTotal: number
): PricingConfidence {
  const hasLabor = laborHours > 0;
  const hasMaterial = materialTotal > 0;
  const hasEquipment = equipmentTotal > 0;
  const hasSub = (subcontractorTotal ?? 0) > 0;
  const filled = [hasLabor, hasMaterial, hasEquipment, hasSub].filter(Boolean).length;
  if (filled >= 3) return "High";
  if (filled >= 2) return "Medium";
  return "Low";
}

function buildAssumptions(req: PricingRecommendationRequest, breakdown: CostBreakdown): Assumption[] {
  const assumptions: Assumption[] = [
    {
      id: generateId("asm"),
      recommendationId: "",
      description: `Labor at $${LABOR_RATE}/hr standard rate.`,
      source: "Contract labor rate table",
    },
    {
      id: generateId("asm"),
      recommendationId: "",
      description: `Equipment at 15% markup.`,
      source: "Company standard",
    },
    {
      id: generateId("asm"),
      recommendationId: "",
      description: `Margin applied at ${DEFAULT_MARGIN_PERCENT}%.`,
      source: "Project margin policy",
    },
  ];
  if ((req.subcontractorTotal ?? 0) > 0) {
    assumptions.push({
      id: generateId("asm"),
      recommendationId: "",
      description: "Subcontractor amount from quote on file.",
      source: "Subcontractor quote",
    });
  }
  return assumptions;
}

function buildEvidence(recommendationId: string, total: number): EvidenceItem[] {
  return [
    {
      id: generateId("ev"),
      recommendationId,
      type: "Historical",
      reference: "Similar scope – CO-2024-012",
      value: total * 0.92,
    },
    {
      id: generateId("ev"),
      recommendationId,
      type: "Estimate",
      reference: "Preliminary takeoff",
      value: total,
    },
  ];
}

function buildWarnings(req: PricingRecommendationRequest): string[] {
  const w: string[] = [];
  if (req.laborHours <= 0 && req.materialTotal <= 0 && req.equipmentTotal <= 0) {
    w.push("No cost inputs provided; recommendation is placeholder.");
  }
  if (req.laborHours > 80) {
    w.push("Labor hours exceed 80; confirm with field.");
  }
  if (!req.scopeSummary || req.scopeSummary.length < 20) {
    w.push("Scope description is brief; consider adding detail for audit.");
  }
  return w;
}

function buildMissingFlags(req: PricingRecommendationRequest): string[] {
  const flags: string[] = [];
  if (!req.costCode) flags.push("Cost code not assigned");
  if ((req.subcontractorTotal ?? 0) === 0 && req.materialTotal > 5000) {
    flags.push("No subcontractor amount; verify if work is self-performed.");
  }
  return flags;
}

export function generatePricingRecommendation(
  request: PricingRecommendationRequest
): PricingRecommendationResponse {
  const subcontractorTotal = request.subcontractorTotal ?? 0;
  const breakdown = computeCostBreakdown(
    request.laborHours,
    request.materialTotal,
    request.equipmentTotal,
    subcontractorTotal
  );

  const recommendationId = generateId("rec");
  const assumptions = buildAssumptions(request, breakdown).map((a) => ({
    ...a,
    recommendationId,
  }));
  const evidence = buildEvidence(recommendationId, breakdown.total);

  const recommendation: PricingRecommendation = {
    id: recommendationId,
    changeOrderId: request.changeOrderId,
    recommendedTotal: breakdown.total,
    costBreakdown: breakdown,
    assumptions,
    evidence,
    confidence: deriveConfidence(
      request.laborHours,
      request.materialTotal,
      request.equipmentTotal,
      subcontractorTotal
    ),
    rationale: `Basis of estimate: labor (${request.laborHours} hrs @ $${LABOR_RATE}/hr), material and equipment from intake; margin ${DEFAULT_MARGIN_PERCENT}%. Comparable historical CO referenced.`,
    budgetImpact: breakdown.total,
    revenueImpact: breakdown.total,
    scheduleImpactDays: request.laborHours > 40 ? Math.ceil(request.laborHours / 8) : undefined,
    warnings: buildWarnings(request),
    missingInfoFlags: buildMissingFlags(request),
    createdAt: new Date().toISOString(),
    createdBy: "System",
  };

  return {
    recommendation,
    warnings: recommendation.warnings,
  };
}
