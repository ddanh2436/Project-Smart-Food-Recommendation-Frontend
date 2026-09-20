/**
 * Rating presentation.
 *
 * Scores are stored on a 0–10 scale because that is what the source site
 * publishes, but a 10-point scale reads as invented in a restaurant context —
 * a badge showing "10.0" looks like placeholder data rather than a real
 * verdict. Diners are used to five stars, so everything user-facing is
 * converted at the edge while the stored value and all ranking stay on 0–10.
 *
 * Conversion is a straight halving, so the ordering is identical and no
 * information is lost.
 */

/** Convert a stored 0–10 score to the 0–5 scale shown to users. */
export function toFiveScale(score?: number | null): number | null {
  if (score === undefined || score === null) return null;
  if (!Number.isFinite(score) || score <= 0) return null;
  return Math.min(score, 10) / 2;
}

/**
 * Format a stored 0–10 score as a five-point rating, e.g. `9.6` → `"4.8"`.
 * Returns an em dash for a missing score so a card never prints "N/A".
 */
export function formatRating(score?: number | null, fallback = "—"): string {
  const five = toFiveScale(score);
  return five === null ? fallback : five.toFixed(1);
}

/** `"4.8/5"`, for places that need the scale spelled out. */
export function formatRatingOutOfFive(
  score?: number | null,
  fallback = "Chưa có đánh giá"
): string {
  const five = toFiveScale(score);
  return five === null ? fallback : `${five.toFixed(1)}/5`;
}

/** Percentage fill for a progress bar, still driven by the 0–10 value. */
export function ratingPercent(score?: number | null): number {
  if (score === undefined || score === null || !Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, score * 10));
}

/**
 * How many reviews a score rests on, phrased for display.
 *
 * Listings are ordered by a review-count-adjusted score, so the count is what
 * makes the ordering legible: 4.8 from thirty reviews is a different claim
 * from 5.0 from one.
 */
export function formatReviewCount(
  count?: number | null,
  lang: "vi" | "en" = "vi"
): string | null {
  if (!count || count <= 0) return null;
  return lang === "en"
    ? `${count} review${count === 1 ? "" : "s"}`
    : `${count} đánh giá`;
}
