"use client";

import React from "react";
import { useTranslation } from "@/app/hooks/useTranslation";

interface SentimentBadgeProps {
  /** LABEL_0 / LABEL_1 / LABEL_2, or NEG / NEU / POS. */
  label: string;
  /** Model confidence, currently not shown. */
  score?: number;
}

const SentimentBadge: React.FC<SentimentBadgeProps> = ({ label }) => {
  const { t } = useTranslation();

  // No label means the row predates the sentiment pass; render nothing rather
  // than claiming it is neutral.
  if (!label) return null;

  let config = {
    text: t.reviews.sentiment.neutral,
    color: "#6c757d",
    bgColor: "#e2e3e5",
    icon: "😐",
  };

  if (label === "LABEL_2" || label === "POS") {
    config = {
      text: t.reviews.sentiment.positive,
      color: "#155724",
      bgColor: "#d4edda",
      icon: "😊",
    };
  } else if (label === "LABEL_0" || label === "NEG") {
    config = {
      text: t.reviews.sentiment.negative,
      color: "#721c24",
      bgColor: "#f8d7da",
      icon: "😞",
    };
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "12px",
        backgroundColor: config.bgColor,
        color: config.color,
        fontSize: "12px",
        fontWeight: 600,
        marginLeft: "10px",
        border: `1px solid ${config.color}20`,
      }}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
};

export default SentimentBadge;
