"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaMapMarkerAlt } from "react-icons/fa";
import { getSimilarRestaurants, type Restaurant } from "@/app/lib/api";
import { formatReviewCount } from "@/app/lib/rating";
import { ScoreBadge } from "@/components/Score/Score";
import { useTranslation } from "@/app/hooks/useTranslation";
import { tagLabel } from "@/app/lib/restaurant";

/**
 * "Other places like this one", at the end of a detail page.
 *
 * Ranked server-side by shared tags, preferring the same district and ordered
 * by the review-count-adjusted score, so the suggestions are both comparable
 * and actually good. If this restaurant is not the right fit, the page should
 * not be a dead end.
 */
export default function SimilarPlaces({
  restaurantId,
  district,
}: {
  restaurantId: string;
  district?: string;
}) {
  const { t, lang } = useTranslation();
  const [places, setPlaces] = useState<Restaurant[]>([]);
  const [basedOn, setBasedOn] = useState<string[]>([]);
  // Starts true, so the effect never has to set it synchronously on mount;
  // it is only reset when the id changes, inside the async continuation.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getSimilarRestaurants(restaurantId, 8)
      .then((result) => {
        if (cancelled) return;
        setPlaces(result.data ?? []);
        setBasedOn(result.basedOn ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  if (loading) {
    return (
      <section className="similar-section" aria-busy="true">
        <h3 className="section-heading">{t.detail.similarHeading}</h3>
        <div className="similar-rail">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="similar-skeleton" />
          ))}
        </div>
      </section>
    );
  }

  if (places.length === 0) return null;

  // The heading names the shared attribute the server ranked on, so the reader
  // can see why these places are grouped together rather than trusting a label.
  const subject = basedOn[0] ? tagLabel(basedOn[0], lang) : null;
  const heading = subject
    ? `${subject} — ${t.detail.similarHeading}`
    : t.detail.similarHeading;
  const where = district ? ` ${t.detail.similarIn} ${district}` : "";

  return (
    <section className="similar-section">
      <h3 className="section-heading">
        {heading}
        {where}
      </h3>
      <p className="similar-sub">
        {t.detail.similarBasedOn}{" "}
        {basedOn.slice(0, 3).map((tag) => tagLabel(tag, lang)).join(" · ")}
      </p>

      {/* A horizontal rail rather than a grid: this is a secondary suggestion
          at the end of the page and should not add another full screen. */}
      <ul className="similar-rail">
        {places.map((place) => {
          const reviews = formatReviewCount(place.reviewCount, lang);
          return (
            <li key={place._id} className="similar-card">
              <Link href={`/restaurants/${place._id}`} className="similar-link">
                <div className="similar-image">
                  <img
                    src={place.avatarUrl || "/assets/image/pho.png"}
                    alt=""
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(event) => {
                      const target = event.target as HTMLImageElement;
                      if (!target.src.includes("/assets/image/pho.png")) {
                        target.src = "/assets/image/pho.png";
                      }
                    }}
                  />
                  <span className="similar-score">
                    <ScoreBadge score={place.diemTrungBinh} />
                  </span>
                </div>

                <div className="similar-info">
                  <h4 className="similar-name">{place.tenQuan}</h4>
                  <p className="similar-address">
                    <FaMapMarkerAlt size={10} /> {place.diaChi}
                  </p>
                  <div className="similar-meta">
                    <span className="similar-price">
                      {place.giaCa || t.common.updating}
                    </span>
                    {reviews && (
                      <span className="similar-reviews">{reviews}</span>
                    )}
                  </div>
                </div>
              </Link>

              {/* Outside the Link, not inside it: a button nested in an anchor
                  is invalid and the browser picks one of them at random. This
                  is the natural moment to compare — you are looking at one
                  place and weighing an alternative. */}
              <Link
                href={`/restaurants/compare?ids=${restaurantId},${place._id}`}
                className="similar-compare"
              >
                {t.compare.compareAction}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
