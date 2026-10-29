"use client";

import React from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import "./ReviewOverview.css";

interface Review {
  aiSentimentLabel?: string;
}

interface Props {
  reviews: Review[];
}

const PRAISED_PERCENT = 70;
const CRITICISED_PERCENT = 30;
// Below this, the reviews that are not praise are mostly neutral rather than
// complaints: 60% positive and 40% neutral is not "split down the middle".
const FEW_COMPLAINTS_PERCENT = 20;

const ReviewOverview: React.FC<Props> = ({ reviews }) => {
  const { t } = useTranslation();

  if (!reviews || reviews.length === 0) return null;

  const total = reviews.length;
  const posCount = reviews.filter(
    (r) => r.aiSentimentLabel === "LABEL_2" || r.aiSentimentLabel === "POS"
  ).length;
  const negCount = reviews.filter(
    (r) => r.aiSentimentLabel === "LABEL_0" || r.aiSentimentLabel === "NEG"
  ).length;
  const neuCount = reviews.filter(
    (r) => r.aiSentimentLabel === "LABEL_1" || r.aiSentimentLabel === "NEU"
  ).length;
  const mixCount = reviews.filter((r) => r.aiSentimentLabel === "MIX").length;

  const posPercent = Math.round((posCount / total) * 100);
  const negPercent = Math.round((negCount / total) * 100);
  const neuPercent = Math.round((neuCount / total) * 100);
  const mixPercent = Math.round((mixCount / total) * 100);

  /*
    The summary sentence used to be wrapped in quotation marks, which made a
    line the site had generated look like something a diner had written. It is
    a statement about the chart beside it, so it is presented as one.
  */
  let dominantEmoji = "🤔";
  let dominantText = t.reviews.dominantNeutral;
  let dominantClass = "neu";
  let summaryText = t.reviews.summaryNeutral;

  /*
    The same bar as the per-aspect verdicts (review_insights.verdict in the AI
    service). The badge used to go to whichever share was largest, ties to
    positive, so five positive and five negative reviews read "😍 Rất hài lòng"
    over "Phần lớn đánh giá nghiêng về hướng tích cực".
  */
  if (posPercent >= PRAISED_PERCENT) {
    dominantEmoji = "😍";
    dominantText = t.reviews.dominantPositive;
    dominantClass = "pos";
    summaryText = t.reviews.summaryPositive;
  } else if (posPercent <= CRITICISED_PERCENT && negCount > posCount) {
    dominantEmoji = "😤";
    dominantText = t.reviews.dominantNegative;
    dominantClass = "neg";
    summaryText = t.reviews.summaryNegative;
  } else if (negPercent < FEW_COMPLAINTS_PERCENT) {
    dominantEmoji = "🙂";
    dominantText = t.reviews.dominantFewComplaints;
    summaryText = t.reviews.summaryFewComplaints;
  }

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (posPercent / 100) * circumference;

  const bars = [
    { emoji: "😊", label: t.reviews.sentiment.positive, count: posCount, percent: posPercent, cls: "pos" },
    { emoji: "⚖️", label: t.reviews.sentiment.mixed, count: mixCount, percent: mixPercent, cls: "mix" },
    { emoji: "😐", label: t.reviews.sentiment.neutral, count: neuCount, percent: neuPercent, cls: "neu" },
    { emoji: "😡", label: t.reviews.sentiment.negative, count: negCount, percent: negPercent, cls: "neg" },
  ];

  return (
    <div className="review-overview-card">
      <div className="card-bg-glow"></div>

      <div className="overview-header">
        <h3>✨ {t.reviews.overviewTitle}</h3>
        <span className="ai-badge">{t.reviews.overviewLive}</span>
      </div>

      <div className="dashboard-grid">
        {/* Chart */}
        <div className="chart-column">
          <div className="circular-chart">
            <svg viewBox="0 0 100 100" className="circle-svg">
              <circle className="circle-bg" cx="50" cy="50" r={radius} />
              <circle
                className={`circle-progress ${dominantClass}`}
                cx="50"
                cy="50"
                r={radius}
                style={{ strokeDasharray: circumference, strokeDashoffset }}
              />
            </svg>
            <div className="circle-content">
              <span className="big-percent">{posPercent}%</span>
              <span className="label-text">{t.reviews.overviewSatisfied}</span>
            </div>
          </div>

          <div className={`dominant-badge ${dominantClass}`}>
            <span className="emoji">{dominantEmoji}</span>
            <span className="text">{dominantText}</span>
          </div>
        </div>

        {/* Details */}
        <div className="details-column">
          <div className="summary-bubble">
            <p>{summaryText}</p>
          </div>

          <div className="sentiment-bars-compact">
            {bars.map((bar) => (
              <div className="bar-item" key={bar.cls}>
                <div className="bar-header">
                  <span className="b-label">
                    {bar.emoji} {bar.label}
                  </span>
                  <span className={`b-val ${bar.cls}`}>
                    {bar.count} ({bar.percent}%)
                  </span>
                </div>
                <div className="track">
                  <div className={`fill ${bar.cls}`} style={{ width: `${bar.percent}%` }}>
                    <div className="shimmer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOverview;
