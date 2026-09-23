"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getTopRestaurants, type Restaurant } from "@/app/lib/api";
import { formatRating, formatReviewCount } from "@/app/lib/rating";
import { cuisineTags, parseTags, placeLabel, tagLabel } from "@/app/lib/restaurant";
import { useTranslation } from "@/app/hooks/useTranslation";
import "./FeaturedStrip.css";

const COUNT = 12;
/** Seconds per card, so a longer list does not scroll faster. */
const SECONDS_PER_CARD = 4;
const FALLBACK_IMAGE = "/assets/image/pho.png";

/**
 * Featured restaurants, as a strip under the hero.
 *
 * This used to be a vertical ticker beside the search bar, which split the
 * first screen between two things to look at. Down here it has the width to
 * show photos, and the hero is left to the search.
 *
 * On a pointer device the strip drifts sideways and stops under the cursor or
 * keyboard focus; on touch it is an ordinary swipeable row, since a moving
 * target under a thumb is hard to tap. Every card is a real record.
 */
export default function FeaturedStrip() {
  const { t, lang } = useTranslation();
  const [places, setPlaces] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTopRestaurants("diemTrungBinh", COUNT)
      .then((data) => {
        if (!cancelled) setPlaces(data);
      })
      .catch(() => {
        /* the page works without it */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && places.length === 0) return null;

  return (
    <section className="fstrip" aria-labelledby="fstrip-title">
      <div className="fstrip__head">
        <div>
          <h2 className="fstrip__title" id="fstrip-title">
            <span aria-hidden="true">🔥</span> {t.hero.featuredTitle}
          </h2>
          <p className="fstrip__sub">{t.hero.featuredSub}</p>
        </div>
        <Link href="/restaurants" className="fstrip__all">
          {t.common.viewAll} →
        </Link>
      </div>

      <div className="fstrip__viewport">
        {loading ? (
          <ul className="fstrip__list">
            {Array.from({ length: 5 }, (_, index) => (
              <li key={index} className="fstrip__skeleton" />
            ))}
          </ul>
        ) : (
          // Two copies side by side; the track slides left by exactly one
          // copy's width, so the loop has no visible seam.
          <div
            className="fstrip__track"
            style={{ animationDuration: `${places.length * SECONDS_PER_CARD}s` }}
          >
            <CardList places={places} lang={lang} t={t} />
            <CardList places={places} lang={lang} t={t} duplicate />
          </div>
        )}
      </div>
    </section>
  );
}

function CardList({
  places,
  lang,
  t,
  duplicate = false,
}: {
  places: Restaurant[];
  lang: "vi" | "en";
  t: ReturnType<typeof useTranslation>["t"];
  duplicate?: boolean;
}) {
  return (
    <ul className="fstrip__list" aria-hidden={duplicate || undefined}>
      {places.map((place) => {
        const tags = parseTags(place.tags);
        const dish = cuisineTags(tags)[0];
        const caption = [dish && tagLabel(dish, lang), tags[1] && placeLabel(tags[1], lang)]
          .filter(Boolean)
          .join(" • ");
        const reviews = formatReviewCount(place.reviewCount, lang);
        return (
          <li key={`${duplicate ? "d-" : ""}${place._id}`} className="fcard">
            <Link
              href={`/restaurants/${place._id}`}
              className="fcard__link"
              tabIndex={duplicate ? -1 : undefined}
            >
              <div className="fcard__media">
                <img
                  src={place.avatarUrl || FALLBACK_IMAGE}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (!target.src.endsWith(FALLBACK_IMAGE)) target.src = FALLBACK_IMAGE;
                  }}
                />
                <span className="fcard__score" title={t.home.cardOverall}>
                  {formatRating(place.diemTrungBinh)}
                </span>
              </div>
              <div className="fcard__body">
                <h3 className="fcard__name">{place.tenQuan}</h3>
                <p className="fcard__caption">{caption || place.diaChi}</p>
                {reviews && <p className="fcard__reviews">{reviews}</p>}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
