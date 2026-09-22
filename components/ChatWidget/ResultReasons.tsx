"use client";

import React from "react";
import type { ResultReason } from "@/app/lib/api";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { Dict } from "@/app/lib/i18n";

/**
 * The facts behind a recommendation, worded here rather than by the API.
 *
 * The assistant returns {kind:"rating", value:8.6, count:4} and never a
 * sentence, for two reasons: a sentence written server-side would be written
 * in one language and drift from the interface's wording, and a structured
 * fact cannot claim anything the record does not hold. Every chip below is a
 * number that came out of the database.
 */
function word(reason: ResultReason, t: Dict, negative: boolean): string {
  switch (reason.kind) {
    case "dish":
      return `${t.reasons.dish}: ${reason.value}`;
    case "district":
      return `${t.reasons.district}: ${reason.value}`;
    case "price":
      return reason.value ? `${t.reasons.price}: ${reason.value}` : t.reasons.price;
    case "rating":
      return reason.count
        ? `${reason.value} ${t.reasons.rating} ${t.reasons.ratingFrom} ${reason.count} ${t.reasons.reviewsWord}`
        : `${reason.value} ${t.reasons.rating}`;
    case "distance":
      return `${t.reasons.distance} ${reason.value} km`;
    case "aspect": {
      const label = t.reviews.aspectLabels[reason.aspect ?? ""] ?? reason.aspect;
      const verb = negative ? t.reasons.aspectBad : t.reasons.aspectGood;
      return `${verb} ${String(label).toLowerCase()} — ${reason.value}% / ${reason.count} ${t.reasons.mentionsWord}`;
    }
    default:
      return "";
  }
}

export default function ResultReasons({
  reasons,
  cautions,
  compact = false,
}: {
  reasons?: ResultReason[];
  cautions?: ResultReason[];
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const hasReasons = (reasons?.length ?? 0) > 0;
  const hasCautions = (cautions?.length ?? 0) > 0;
  if (!hasReasons && !hasCautions) return null;

  const size = compact ? "text-[10px]" : "text-[11px]";

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {reasons?.map((reason, index) => (
        <span
          key={`r${index}`}
          className={`rounded border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-300 ${size}`}
        >
          {word(reason, t, false)}
        </span>
      ))}
      {/* A recommendation that lists only strengths is an advert. These come
          from the same evidence as the reasons beside them. */}
      {cautions?.map((caution, index) => (
        <span
          key={`c${index}`}
          className={`rounded border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-amber-300 ${size}`}
        >
          ⚠ {word(caution, t, true)}
        </span>
      ))}
    </div>
  );
}
