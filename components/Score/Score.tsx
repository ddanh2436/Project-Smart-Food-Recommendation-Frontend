"use client";

import React from "react";
import { RATING_MAX, formatRating } from "@/app/lib/rating";
import { useTranslation } from "@/app/hooks/useTranslation";
import "./Score.css";

/**
 * A score, on the 0–10 scale used everywhere in this app.
 *
 * This replaces a five-star widget. Five stars are the familiar shape on most
 * review sites, but they were not the shape of this data: scores arrive 0–10,
 * the filter menu offers "> 9.0", the per-criterion bars are 0–10 and the AI
 * assistant answers "9.6/10 điểm". Halving the number for display left the page
 * contradicting itself, so the number is shown as it is stored.
 *
 * `withScale` prints the denominator. Use it wherever the score appears on its
 * own — a bare "9.6" is ambiguous — and omit it inside a badge on a card, where
 * the layout repeats and the scale only needs establishing once per page.
 */
export function ScoreBadge({
  score,
  withScale = false,
  className = "",
}: {
  score?: number | null;
  withScale?: boolean;
  className?: string;
}) {
  const value = formatRating(score, "");
  const { t } = useTranslation();

  if (value === "") {
    return <span className={`score-badge empty ${className}`}>{t.common.noScore}</span>;
  }

  return (
    <span className={`score-badge ${className}`}>
      <span className="score-value">{value}</span>
      {withScale && <span className="score-scale">/{RATING_MAX}</span>}
    </span>
  );
}

/**
 * Score picker for the review form, 1–10.
 *
 * The form used to offer ten stars, which was hard to hit on a phone; a later
 * pass made it five stars with halves, which was easier to hit but no longer
 * matched the number stored or shown anywhere else. Numbered chips keep the ten
 * steps the data has and say outright which one is selected, so there is nothing
 * to infer from how much of a glyph is filled in.
 *
 * Implemented as a radio group, so it is operable from the keyboard and
 * announced as a single control by a screen reader.
 */
export function ScoreInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const { t } = useTranslation();
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="score-input">
      <div className="score-input-row" role="radiogroup" aria-label={t.reviews.scoreLabel}>
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            role="radio"
            aria-checked={value === step}
            aria-label={`${step}/${RATING_MAX} — ${t.reviews.scoreLevels[step]}`}
            className={`score-step ${value === step ? "selected" : ""} ${
              step <= value ? "filled" : ""
            }`}
            onClick={() => onChange(step)}
          >
            {step}
          </button>
        ))}
      </div>

      <span className="score-input-value">
        {value > 0 ? (
          <>
            <strong>
              {value}/{RATING_MAX}
            </strong>
            <span className="score-input-label">{t.reviews.scoreLevels[value]}</span>
          </>
        ) : (
          <span className="score-input-label">{t.reviews.scorePick}</span>
        )}
      </span>
    </div>
  );
}
