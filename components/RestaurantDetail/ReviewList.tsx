"use client";

import React, { useMemo, useState } from "react";
import type { Review } from "@/app/lib/api";
import { ScoreBadge } from "@/components/Score/Score";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { Dict } from "@/app/lib/i18n";

/**
 * Colour for a letter avatar, picked deterministically from the name.
 *
 * Deterministic so the same reviewer keeps the same colour between renders and
 * between pages; a random palette would make the list flicker on every load.
 */
const AVATAR_COLOURS = [
  "#b45309", "#b91c1c", "#0f766e", "#6d28d9",
  "#1d4ed8", "#a16207", "#be185d", "#15803d",
];

function avatarFor(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 100000;
  }
  return {
    letter: name.trim().charAt(0).toUpperCase() || "?",
    colour: AVATAR_COLOURS[hash % AVATAR_COLOURS.length],
  };
}

type FilterKey = "all" | "positive" | "negative" | "high" | "mid" | "low";

/**
 * Filter buckets, on the 0–10 scale the scores are stored in.
 *
 * These were "5★ / 4★ / 3★ and below" while the stored value was 0–10, so the
 * buckets had to be derived from a halved number that appeared nowhere else on
 * the page. Naming the actual thresholds means a reader can check the filter
 * against the score printed on each review.
 */
const FILTERS: { key: FilterKey; label: (t: Dict) => string }[] = [
  { key: "all", label: (t) => t.reviews.filterAll },
  { key: "positive", label: (t) => t.reviews.filterPositive },
  { key: "negative", label: (t) => t.reviews.filterNegative },
  { key: "high", label: (t) => t.reviews.filterHigh },
  { key: "mid", label: (t) => t.reviews.filterMid },
  { key: "low", label: (t) => t.reviews.filterLow },
];

const POSITIVE = new Set(["POS", "LABEL_2"]);
const NEGATIVE = new Set(["NEG", "LABEL_0"]);

const PREVIEW_LENGTH = 260;

function ReviewItem({ review }: { review: Review }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const name = review.authorName?.trim() || t.reviews.diner;
  const { letter, colour } = avatarFor(name);
  const isLong = (review.noiDung?.length ?? 0) > PREVIEW_LENGTH;

  const sentiment = POSITIVE.has(review.aiSentimentLabel ?? "")
    ? { label: t.reviews.sentiment.positive, className: "pos" }
    : NEGATIVE.has(review.aiSentimentLabel ?? "")
      ? { label: t.reviews.sentiment.negative, className: "neg" }
      : { label: t.reviews.sentiment.neutral, className: "neu" };

  return (
    <li className="review-row">
      <div
        className="review-avatar"
        style={{ backgroundColor: colour }}
        aria-hidden="true"
      >
        {letter}
      </div>

      <div className="review-body">
        <div className="review-head">
          <span className="review-author">{name}</span>
          {/* A review written through this site carries an account; a crawled
              one does not, which is a real distinction worth showing. */}
          {review.authorId && (
            <span className="review-verified" title={t.reviews.verifiedTitle}>
              ✓ {t.reviews.verified}
            </span>
          )}
          <span className={`review-sentiment ${sentiment.className}`}>
            {sentiment.label}
          </span>
        </div>

        <div className="review-score">
          <ScoreBadge score={review.diemReview} withScale />
        </div>

        <p className={`review-text ${expanded || !isLong ? "" : "clamped"}`}>
          {review.noiDung}
        </p>

        {isLong && (
          <button
            type="button"
            className="review-more"
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? t.common.showLess : t.common.showMore}
          </button>
        )}
      </div>
    </li>
  );
}

/**
 * Community reviews.
 *
 * A vertical list rather than a card grid: review lengths vary wildly — one
 * says "Có ship không ạ" next to a five-paragraph account — and in a grid the
 * short one left a large hole under it while its neighbours set the row
 * height. A list simply closes up around whatever each review is.
 */
export default function ReviewList({ reviews }: { reviews: Review[] }) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const result: Record<FilterKey, number> = {
      all: reviews.length,
      positive: 0,
      negative: 0,
      high: 0,
      mid: 0,
      low: 0,
    };
    for (const review of reviews) {
      if (POSITIVE.has(review.aiSentimentLabel ?? "")) result.positive += 1;
      if (NEGATIVE.has(review.aiSentimentLabel ?? "")) result.negative += 1;
      const score = review.diemReview;
      if (score >= 8) result.high += 1;
      else if (score >= 6) result.mid += 1;
      else result.low += 1;
    }
    return result;
  }, [reviews]);

  const visible = useMemo(() => {
    switch (filter) {
      case "positive":
        return reviews.filter((r) => POSITIVE.has(r.aiSentimentLabel ?? ""));
      case "negative":
        return reviews.filter((r) => NEGATIVE.has(r.aiSentimentLabel ?? ""));
      case "high":
        return reviews.filter((r) => r.diemReview >= 8);
      case "mid":
        return reviews.filter((r) => r.diemReview >= 6 && r.diemReview < 8);
      case "low":
        return reviews.filter((r) => r.diemReview < 6);
      default:
        return reviews;
    }
  }, [reviews, filter]);

  if (reviews.length === 0) {
    return <p className="no-reviews">{t.reviews.empty}</p>;
  }

  return (
    <div className="review-list-wrap">
      <div className="review-filters" role="tablist" aria-label={t.reviews.filterLabel}>
        {FILTERS.map(({ key, label }) => {
          const count = counts[key];
          // Hide a filter that would produce an empty list.
          if (count === 0 && key !== "all") return null;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              className={`review-filter ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label(t)} <span className="review-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="no-reviews">{t.reviews.emptyFilter}</p>
      ) : (
        <ul className="review-list">
          {visible.map((review, index) => (
            <ReviewItem key={review._id ?? index} review={review} />
          ))}
        </ul>
      )}
    </div>
  );
}
