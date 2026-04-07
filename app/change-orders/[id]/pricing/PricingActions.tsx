"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PricingActions({
  changeOrderId,
  hasRecommendation,
}: {
  changeOrderId: string;
  hasRecommendation: boolean;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleGeneratePricing() {
    setGenerating(true);
    try {
      await fetch(`/api/change-orders/${changeOrderId}/generate-pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      router.refresh();
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/change-orders/${changeOrderId}/submit`, { method: "POST" });
      if (!res.ok) throw new Error("Submit failed");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleGeneratePricing}
        disabled={generating}
        className="btn-primary"
      >
        {generating ? "Running pricing engine..." : "Generate Pricing"}
      </button>
      {hasRecommendation && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-secondary"
        >
          {submitting ? "Submitting..." : "Submit for Approval"}
        </button>
      )}
    </>
  );
}
