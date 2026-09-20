"use client";

import React, { useState } from "react";

interface DisplayProps {
  /** Rating on the 0–5 scale. */
  value: number;
  size?: number;
}

/**
 * Read-only five-star display, supporting halves.
 *
 * Halves are drawn with a clipped overlay rather than a separate half-star
 * glyph, so a 4.3 renders as 4.3 rather than being rounded to the nearest half
 * before the eye ever sees it.
 */
export function StarDisplay({ value, size = 16 }: DisplayProps) {
  const clamped = Math.max(0, Math.min(5, value));
  return (
    <span
      className="star-display"
      role="img"
      aria-label={`${clamped.toFixed(1)} trên 5 sao`}
      style={{ fontSize: size }}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        const fill = Math.max(0, Math.min(1, clamped - index));
        return (
          <span key={index} className="star-slot" aria-hidden="true">
            <span className="star-empty">★</span>
            <span className="star-fill" style={{ width: `${fill * 100}%` }}>
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}

interface InputProps {
  /** Current rating on the 0–5 scale. */
  value: number;
  onChange: (value: number) => void;
  /** Allow half-star precision. */
  allowHalf?: boolean;
}

/**
 * Five-star input.
 *
 * Replaces a row of ten stars, which was both unfamiliar — every other
 * platform uses five — and hard to hit accurately on a phone, where ten
 * targets across the width of the screen left each one only a few millimetres
 * wide. Half-star precision keeps the same granularity the ten-star row had.
 *
 * Implemented as a radio group so it is keyboard- and screen-reader-operable,
 * which a row of plain buttons was not.
 */
export function StarInput({ value, onChange, allowHalf = true }: InputProps) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;
  const steps = allowHalf
    ? [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]
    : [1, 2, 3, 4, 5];

  const LABELS: Record<number, string> = {
    1: "Tệ",
    2: "Không hài lòng",
    3: "Bình thường",
    4: "Hài lòng",
    5: "Tuyệt vời",
  };

  return (
    <div className="star-input">
      <div
        className="star-input-row"
        role="radiogroup"
        aria-label="Chấm điểm nhà hàng"
        onMouseLeave={() => setHover(null)}
      >
        {[0, 1, 2, 3, 4].map((index) => {
          const fill = Math.max(0, Math.min(1, shown - index));
          return (
            <span key={index} className="star-slot-interactive">
              <span className="star-empty" aria-hidden="true">
                ★
              </span>
              <span
                className="star-fill"
                style={{ width: `${fill * 100}%` }}
                aria-hidden="true"
              >
                ★
              </span>

              {/* Two hit areas per star when halves are allowed. */}
              {(allowHalf ? [0.5, 1] : [1]).map((half) => {
                const target = index + half;
                return (
                  <button
                    key={half}
                    type="button"
                    role="radio"
                    aria-checked={value === target}
                    aria-label={`${target} sao`}
                    className="star-hit"
                    style={{
                      left: allowHalf && half === 0.5 ? 0 : allowHalf ? "50%" : 0,
                      width: allowHalf ? "50%" : "100%",
                    }}
                    onMouseEnter={() => setHover(target)}
                    onFocus={() => setHover(target)}
                    onBlur={() => setHover(null)}
                    onClick={() => onChange(target)}
                  />
                );
              })}
            </span>
          );
        })}
      </div>

      <span className="star-input-value">
        {shown > 0 ? (
          <>
            <strong>{shown.toFixed(1)}</strong>
            <span className="star-input-label">
              {LABELS[Math.ceil(shown)] ?? ""}
            </span>
          </>
        ) : (
          <span className="star-input-label">Chọn số sao</span>
        )}
      </span>

      {/* Steps are exposed for keyboard users who tab through the group. */}
      <span className="sr-only">
        Các mức điểm: {steps.join(", ")}
      </span>
    </div>
  );
}
