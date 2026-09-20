import React from "react";

/**
 * The star that precedes a rating.
 *
 * Scores are shown on a five-point scale, and a bare number carries no hint of
 * which scale that is — "4.8" could be out of five or out of ten. The star
 * makes the scale legible at a glance without spending the space on "/5".
 *
 * Decorative: the number beside it carries the meaning, so it is hidden from
 * assistive technology.
 */
export default function FiveStar({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      style={{ display: "inline-block", verticalAlign: "-0.1em" }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
