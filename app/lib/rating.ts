/**
 * Rating presentation, on the 0–10 scale the data is actually stored in.
 *
 * An earlier pass halved every score at the edge to show five stars. That made
 * the interface disagree with itself rather than agree: the filter menu still
 * offered "Xuất sắc (> 9.0)", the modal on the home page still printed 9.6, the
 * per-criterion bars were still 0–10 in the database, and the AI assistant's own
 * replies say "9.6/10 điểm". A diner comparing a card badge reading 4.8 with a
 * filter labelled "> 9.0" has no way to tell these describe the same number.
 *
 * So there is one scale everywhere now, and it is the stored one. Nothing is
 * converted, which also means nothing can drift out of step again.
 */

import type { Dict } from "@/app/lib/i18n";

/** The top of the scale. Scores are stored and displayed as 0–10. */
export const RATING_MAX = 10;

/**
 * Format a stored score for display, e.g. `9.55` → `"9.6"`.
 * Returns an em dash for a missing score so a card never prints "N/A".
 */
export function formatRating(score?: number | null, fallback = "—"): string {
  if (score === undefined || score === null) return fallback;
  if (!Number.isFinite(score) || score <= 0) return fallback;
  return Math.min(score, RATING_MAX).toFixed(1);
}

/** Percentage fill for a progress bar. */
export function ratingPercent(score?: number | null): number {
  if (score === undefined || score === null || !Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, (score / RATING_MAX) * 100));
}

/**
 * Word for a score, e.g. 9.2 → "Xuất sắc".
 *
 * Six near-identical copies of this ladder were written inline in the six home
 * page sections, each with slightly different thresholds and its own hardcoded
 * Vietnamese — one of them even shortened "Trung bình" to "T.Bình" to fit. One
 * ladder, translated once.
 */
export function ratingLabel(score: number | undefined | null, t: Dict): string {
  if (score === undefined || score === null || !Number.isFinite(score)) {
    return t.common.noScore;
  }
  const words = t.restaurantPage.ratingText;
  if (score >= 9) return words.excellent;
  if (score >= 8) return words.veryGood;
  if (score >= 7) return words.good;
  if (score >= 6) return words.fair;
  if (score >= 5) return words.average;
  return words.poor;
}

/**
 * How many reviews a score rests on, phrased for display.
 *
 * Listings are ordered by a review-count-adjusted score, so the count is what
 * makes the ordering legible: 9.6 from thirty reviews is a different claim
 * from 10.0 from one.
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
