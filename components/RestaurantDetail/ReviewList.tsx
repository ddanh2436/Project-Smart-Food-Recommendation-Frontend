"use client";

import React, { useMemo, useState } from "react";
import type { Review } from "@/app/lib/api";
import { StarDisplay } from "./StarRating";

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

type FilterKey = "all" | "positive" | "negative" | "5" | "4" | "3";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "positive", label: "Tích cực" },
  { key: "negative", label: "Tiêu cực" },
  { key: "5", label: "5★" },
  { key: "4", label: "4★" },
  { key: "3", label: "3★ trở xuống" },
];

const POSITIVE = new Set(["POS", "LABEL_2"]);
const NEGATIVE = new Set(["NEG", "LABEL_0"]);

/** Stored scores are 0–10; reviews are shown on the same five-point scale. */
function toFive(score: number): number {
  return Math.max(0, Math.min(5, score / 2));
}

const PREVIEW_LENGTH = 260;

function ReviewItem({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const name = review.authorName?.trim() || "Thực khách";
  const { letter, colour } = avatarFor(name);
  const isLong = (review.noiDung?.length ?? 0) > PREVIEW_LENGTH;
  const five = toFive(review.diemReview);

  const sentiment = POSITIVE.has(review.aiSentimentLabel ?? "")
    ? { label: "Tích cực", className: "pos" }
    : NEGATIVE.has(review.aiSentimentLabel ?? "")
      ? { label: "Tiêu cực", className: "neg" }
      : { label: "Trung tính", className: "neu" };

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
            <span className="review-verified" title="Đánh giá từ tài khoản đã đăng nhập">
              ✓ Đã xác thực
            </span>
          )}
          <span className={`review-sentiment ${sentiment.className}`}>
            {sentiment.label}
          </span>
        </div>

        <div className="review-score">
          <StarDisplay value={five} size={14} />
          <span className="review-score-value">{five.toFixed(1)}</span>
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
            {expanded ? "Thu gọn" : "Xem thêm"}
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
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(() => {
    const result: Record<FilterKey, number> = {
      all: reviews.length,
      positive: 0,
      negative: 0,
      "5": 0,
      "4": 0,
      "3": 0,
    };
    for (const review of reviews) {
      if (POSITIVE.has(review.aiSentimentLabel ?? "")) result.positive += 1;
      if (NEGATIVE.has(review.aiSentimentLabel ?? "")) result.negative += 1;
      const five = toFive(review.diemReview);
      if (five >= 4.5) result["5"] += 1;
      else if (five >= 3.5) result["4"] += 1;
      else result["3"] += 1;
    }
    return result;
  }, [reviews]);

  const visible = useMemo(() => {
    switch (filter) {
      case "positive":
        return reviews.filter((r) => POSITIVE.has(r.aiSentimentLabel ?? ""));
      case "negative":
        return reviews.filter((r) => NEGATIVE.has(r.aiSentimentLabel ?? ""));
      case "5":
        return reviews.filter((r) => toFive(r.diemReview) >= 4.5);
      case "4": {
        return reviews.filter((r) => {
          const five = toFive(r.diemReview);
          return five >= 3.5 && five < 4.5;
        });
      }
      case "3":
        return reviews.filter((r) => toFive(r.diemReview) < 3.5);
      default:
        return reviews;
    }
  }, [reviews, filter]);

  if (reviews.length === 0) {
    return (
      <p className="no-reviews">
        Chưa có đánh giá nào cho nhà hàng này. Hãy là người đầu tiên!
      </p>
    );
  }

  return (
    <div className="review-list-wrap">
      <div className="review-filters" role="tablist" aria-label="Lọc đánh giá">
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
              {label} <span className="review-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="no-reviews">Không có đánh giá nào khớp bộ lọc này.</p>
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
