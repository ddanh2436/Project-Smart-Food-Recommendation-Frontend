"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import {
  compareRestaurants,
  type Comparison,
  type ComparisonRow,
} from "@/app/lib/api";
import { formatRating, formatReviewCount } from "@/app/lib/rating";
import { useGeolocation } from "@/app/hooks/useGeolocation";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { Dict } from "@/app/lib/i18n";
import "./ComparePage.css";

/** The stored score fields, in the order the comparison returns them. */
const SCORE_LABELS: Record<string, keyof Dict["restaurantPage"]["labels"] | "overall"> = {
  diemTrungBinh: "overall",
  diemKhongGian: "space",
  diemViTri: "location",
  diemChatLuong: "quality",
  diemPhucVu: "service",
  diemGiaCa: "price",
};

function rowLabel(row: ComparisonRow, t: Dict): string {
  if (row.kind === "distance") return t.compare.distance;
  if (row.kind === "aspect") {
    const aspect = t.reviews.aspectLabels[row.key] ?? row.key;
    return `${t.compare.aspectPrefix} ${aspect.toLowerCase()}`;
  }
  const key = SCORE_LABELS[row.key];
  if (key === "overall") return t.home.cardOverall;
  return key ? t.restaurantPage.labels[key] : row.key;
}

/** Scores read /10, aspect ratios read %, distance reads km. */
function formatValue(row: ComparisonRow, value: number | null): string {
  if (value === null) return "—";
  if (row.kind === "aspect") return `${value}%`;
  if (row.kind === "distance") return `${value} km`;
  return formatRating(value);
}

function CompareContent() {
  const { t, lang } = useTranslation();
  const { coords } = useGeolocation();
  const searchParams = useSearchParams();
  const ids = (searchParams.get("ids") ?? "").split(",").filter(Boolean);

  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length < 2) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    compareRestaurants(ids, coords)
      .then((result) => {
        if (!cancelled) setComparison(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, coords]);

  if (ids.length < 2) {
    return <p className="cmp-message">{t.compare.needTwo}</p>;
  }
  if (loading) {
    return <p className="cmp-message">{t.compare.loading}</p>;
  }
  if (!comparison || comparison.places.length < 2) {
    return <p className="cmp-message">{t.compare.failed}</p>;
  }

  const { places, rows, wins } = comparison;
  const decided = rows.filter((row) => row.winner !== null);
  const leader = wins.indexOf(Math.max(...wins));
  const isDraw = decided.length === 0 || wins.every((w) => w === wins[0]);
  const hasAspectRow = rows.some((row) => row.kind === "aspect");

  return (
    <div className="cmp-page">
      <Link href="/restaurants" className="cmp-back">
        <FaArrowLeft /> {t.compare.back}
      </Link>

      <h1 className="cmp-title">{t.compare.title}</h1>

      {/* The verdict first. A table the reader has to add up themselves is
          the thing this page exists to replace. */}
      <p className="cmp-verdict">
        {isDraw ? (
          t.compare.allDraw
        ) : (
          <>
            <strong>{places[leader].tenQuan}</strong> — {wins[leader]}/
            {decided.length} {t.compare.winsSuffix}
          </>
        )}
      </p>

      <div className="cmp-scroll">
        <table className="cmp-table">
          <thead>
            <tr>
              <th scope="col" className="cmp-corner" />
              {places.map((place, index) => (
                <th key={place._id} scope="col">
                  <Link href={`/restaurants/${place._id}`} className="cmp-head-link">
                    <img
                      src={place.avatarUrl || "/assets/image/pho.png"}
                      alt=""
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        const target = event.target as HTMLImageElement;
                        if (!target.src.includes("/assets/image/pho.png")) {
                          target.src = "/assets/image/pho.png";
                        }
                      }}
                    />
                    <span className="cmp-head-name">{place.tenQuan}</span>
                    <span className="cmp-head-meta">
                      {formatReviewCount(place.reviewCount, lang) ?? place.diaChi}
                    </span>
                    {!isDraw && index === leader && (
                      <span className="cmp-head-badge">
                        {wins[index]} {t.compare.winsSuffix}
                      </span>
                    )}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={`${row.kind}-${row.key}`}>
                <th scope="row">{rowLabel(row, t)}</th>
                {row.values.map((value, index) => (
                  <td
                    key={index}
                    className={row.winner === index ? "cmp-win" : ""}
                  >
                    {row.winner === index && (
                      <FaCheck className="cmp-tick" aria-hidden="true" />
                    )}
                    {formatValue(row, value)}
                    {row.winner === null && index === 0 && (
                      <span className="sr-only">{t.compare.draw}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!hasAspectRow && <p className="cmp-note">{t.compare.noAspects}</p>}
      <p className="cmp-note">{t.compare.tieNote}</p>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="cmp-page">
          <p className="cmp-message" role="status" aria-label="Loading" />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
