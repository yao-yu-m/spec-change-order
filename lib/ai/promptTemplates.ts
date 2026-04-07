/**
 * Pricing prompt templates and calculation rules.
 * In production: these become system prompts / few-shot examples for an LLM.
 * Here they are deterministic rules that produce the same output as a real model would be asked to.
 */

export const PRICING_RULES = {
  /** Standard labor rate ($/hr) from contract labor rate table */
  laborRatePerHour: 85,

  /** Equipment markup multiplier (15% overhead) */
  equipmentMarkupFactor: 1.15,

  /** Project margin applied to subtotal */
  defaultMarginPercent: 12,

  /** Threshold for high-labor-hours warning */
  highLaborHoursThreshold: 80,

  /** Material threshold above which subcontractor absence is flagged */
  subcontractorCheckMaterialThreshold: 5000,
} as const;

/**
 * Basis of estimate narrative template.
 * In production: this becomes the system prompt instructing the LLM to produce structured output.
 */
export function buildRationaleTemplate(
  laborHours: number,
  laborRate: number,
  marginPercent: number
): string {
  return (
    `Basis of estimate: labor (${laborHours} hrs @ $${laborRate}/hr from contract rate table), ` +
    `material and equipment from intake; ${marginPercent}% project margin applied. ` +
    `Comparable historical change orders referenced for validation.`
  );
}

/**
 * Assumption templates keyed by source.
 * In production: the LLM would generate these based on context.
 */
export const ASSUMPTION_TEMPLATES = {
  laborRate: (rate: number) => ({
    description: `Labor at $${rate}/hr (standard rate).`,
    source: "Contract labor rate table",
  }),
  equipmentMarkup: () => ({
    description: "Equipment at 15% markup over quoted cost.",
    source: "Company standard",
  }),
  margin: (pct: number) => ({
    description: `Project margin applied at ${pct}%.`,
    source: "Project margin policy",
  }),
  subcontractorQuote: () => ({
    description: "Subcontractor amount from quote on file.",
    source: "Subcontractor quote",
  }),
} as const;
