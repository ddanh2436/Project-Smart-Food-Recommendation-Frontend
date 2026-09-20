"use client";

import React from "react";
import type { ReviewInsights } from "@/app/lib/api";
import { useTranslation } from "@/app/hooks/useTranslation";
import "./ReviewAspects.css";

interface Props {
  data: ReviewInsights | null;
  loading?: boolean;
}

const VERDICT_ICON: Record<string, string> = {
  positive: "👍",
  negative: "👎",
  mixed: "🤔",
};

/** Shorten a verbatim quote to a clause that fits on one line of the summary. */
function trimQuote(quote: string, max = 72): string {
  const clean = quote.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean.toLowerCase();
  return clean.slice(0, max).replace(/[\s,.;]+\S*$/, "").toLowerCase() + "…";
}

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
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="aspects-card" aria-busy="true">
        <div className="aspects-header">
          <h3>🧠 {t.reviews.aspectsTitle}</h3>
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

  // Most-discussed first, so the headline points are the ones people actually
  // talked about rather than a passing mention.
  const pros = data.aspects
    .filter((aspect) => aspect.verdict === "positive")
    .slice(0, 3);
  const cons = data.aspects
    .filter((aspect) => aspect.verdict === "negative")
    .slice(0, 3);

  return (
    <div className="aspects-card">
      <div className="aspects-header">
        <h3>🧠 {t.reviews.aspectsTitle}</h3>
        <span className="aspects-count">
          {data.review_count} {t.common.reviewsSuffix}
        </span>
      </div>

      {data.summary && <p className="aspects-summary">{data.summary}</p>}

      {/*
        TL;DR, above the per-aspect detail.
        The chart answers "how positive overall"; these two lists answer the
        question a diner actually arrives with — what is good here, and what
        should I know before going. Both are derived from the aspect verdicts,
        so nothing is asserted that the reviews do not support.
      */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="aspects-tldr">
          {pros.length > 0 && (
            <div className="tldr-block pros">
              <h4 className="tldr-title">👍 {t.reviews.aspectsPros}</h4>
              <ul className="tldr-list">
                {pros.map((aspect) => (
                  <li key={aspect.key}>
                    <strong>{aspect.label}</strong>
                    {aspect.quotes[0] ? ` — ${trimQuote(aspect.quotes[0])}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cons.length > 0 && (
            <div className="tldr-block cons">
              <h4 className="tldr-title">⚠️ {t.reviews.aspectsCons}</h4>
              <ul className="tldr-list">
                {cons.map((aspect) => (
                  <li key={aspect.key}>
                    <strong>{aspect.label}</strong>
                    {aspect.quotes[0] ? ` — ${trimQuote(aspect.quotes[0])}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
                  <span aria-hidden="true">{VERDICT_ICON[aspect.verdict]}</span>
                  {t.reviews.verdict[
                    aspect.verdict as keyof typeof t.reviews.verdict
                  ] ?? aspect.verdict}
                </span>
              </div>

              <div
                className="aspect-bar"
                role="img"
                aria-label={`${percent}% ${t.reviews.aspectsPositiveShare} / ${aspect.mentions} ${t.reviews.aspectsMentions}`}
              >
                <div
                  className={`aspect-fill ${aspect.verdict}`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="aspect-meta">
                <span>
                  {percent}% {t.reviews.aspectsPositiveShare}
                </span>
                <span>
                  {aspect.mentions} {t.reviews.aspectsMentions}
                </span>
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
          {/* The API's own `message` for this state is a fixed English sentence
              ("AI service unavailable, showing basic counts only"), which made
              it the one line on this card that stayed English for a Vietnamese
              reader. `available: false` already identifies the state, so the
              wording belongs to the interface rather than to the response. */}
          {t.reviews.aspectsWarming}
        </p>
      )}
    </div>
  );
};

export default ReviewAspects;
