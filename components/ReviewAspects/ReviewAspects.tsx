"use client";

import React from "react";
import type { ReviewInsights } from "@/app/lib/api";
import "./ReviewAspects.css";

interface Props {
  data: ReviewInsights | null;
  loading?: boolean;
}

const VERDICT_LABEL: Record<string, string> = {
  positive: "Được khen",
  negative: "Bị phàn nàn",
  mixed: "Ý kiến trái chiều",
};

/**
 * Per-aspect breakdown of what reviewers actually said.
 *
 * The existing ReviewOverview shows one overall positive/neutral/negative
 * split, which answers "is this place good?" but not "good at what?". This adds
 * the useful part: food, price, service, ambience, hygiene and parking each get
 * their own verdict plus a verbatim quote, so a diner can see that the food is
 * loved and the parking is awful instead of just an averaged 60%.
 *
 * Every quote is extracted from a real review — nothing here is generated.
 */
const ReviewAspects: React.FC<Props> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="aspects-card" aria-busy="true">
        <div className="aspects-header">
          <h3>🧠 AI phân tích chi tiết</h3>
        </div>
        <div className="aspects-skeleton">
          {[0, 1, 2].map((index) => (
            <div key={index} className="skeleton-row" />
          ))}
        </div>
      </div>
    );
  }

  // Nothing to show is not an error state; render nothing at all.
  if (!data || !data.aspects || data.aspects.length === 0) {
    return null;
  }

  return (
    <div className="aspects-card">
      <div className="aspects-header">
        <h3>🧠 AI phân tích chi tiết</h3>
        <span className="aspects-count">
          {data.review_count} đánh giá
        </span>
      </div>

      {data.summary && <p className="aspects-summary">{data.summary}</p>}

      <div className="aspects-grid">
        {data.aspects.map((aspect) => {
          const percent = Math.round(aspect.positive_ratio * 100);
          return (
            <div
              key={aspect.key}
              className={`aspect-item ${aspect.verdict}`}
            >
              <div className="aspect-top">
                <span className="aspect-name">
                  <span aria-hidden="true">{aspect.icon}</span> {aspect.label}
                </span>
                <span className={`aspect-verdict ${aspect.verdict}`}>
                  {VERDICT_LABEL[aspect.verdict] ?? aspect.verdict}
                </span>
              </div>

              <div
                className="aspect-bar"
                role="img"
                aria-label={`${percent}% tích cực trên ${aspect.mentions} lượt nhắc đến`}
              >
                <div
                  className={`aspect-fill ${aspect.verdict}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="aspect-meta">
                <span>{percent}% tích cực</span>
                <span>{aspect.mentions} lượt nhắc</span>
              </div>

              {aspect.quotes.length > 0 && (
                <blockquote className="aspect-quote">
                  “{aspect.quotes[0]}”
                </blockquote>
              )}
            </div>
          );
        })}
      </div>

      {data.available === false && (
        <p className="aspects-note">
          {data.message ??
            "Dịch vụ AI đang khởi động, số liệu có thể chưa đầy đủ."}
        </p>
      )}
    </div>
  );
};

export default ReviewAspects;
