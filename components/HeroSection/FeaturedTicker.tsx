"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getTopRestaurants, type Restaurant } from "@/app/lib/api";
import { formatRating, formatReviewCount } from "@/app/lib/rating";
import { cuisineTags, parseTags, placeLabel, tagLabel } from "@/app/lib/restaurant";
import { useTranslation } from "@/app/hooks/useTranslation";
import "./FeaturedTicker.css";

/** How many places the ticker cycles through. */
const COUNT = 12;

/** Seconds per row, so the loop slows down as the list grows. */
const SECONDS_PER_ROW = 2.6;

/**
 * The featured-restaurants panel in the hero.
 *
 * It replaces a three-slide carousel of plain text. That panel had two problems
 * beyond how it looked: the lists were hardcoded strings ("Phở Bò Tái Nạm",
 * "Cà Phê Trứng") that existed nowhere in the database, and each row carried
 * `cursor: pointer` while having no click handler at all — so the one part of
 * the hero that invited a click did nothing, with invented content.
 *
 * Every row here is a real record: the photo, the score, the cuisine and the
 * district all come from the document, and the row opens that restaurant.
 */
export default function FeaturedTicker() {
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
        // The hero still works without the panel; an error banner over a
        // decorative list would be louder than the problem.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="featured-panel" aria-labelledby="featured-title">
      <header className="featured-head">
        <h3 className="featured-title" id="featured-title">
          <span aria-hidden="true">🔥</span> {t.hero.featuredTitle}
        </h3>
        <p className="featured-sub">{t.hero.featuredSub}</p>
      </header>

      <div className="featured-viewport">
        {loading ? (
          <ul className="featured-list">
            {[0, 1, 2, 3].map((index) => (
              <li key={index} className="featured-skeleton" />
            ))}
          </ul>
        ) : places.length === 0 ? (
          <p className="featured-empty">{t.common.loading}</p>
        ) : (
          // The track holds the list twice and slides up by exactly half its
          // height, so the second copy is under the cursor at the instant the
          // animation restarts and the loop has no visible seam.
          <div
            className="featured-track"
            style={{ animationDuration: `${places.length * SECONDS_PER_ROW}s` }}
          >
            <TickerList places={places} lang={lang} />
            <TickerList places={places} lang={lang} duplicate />
          </div>
        )}
      </div>
    </aside>
  );
}

function TickerList({
  places,
  lang,
  duplicate = false,
}: {
  places: Restaurant[];
  lang: "vi" | "en";
  duplicate?: boolean;
}) {
  return (
    <ul
      className="featured-list"
      // The second copy exists only so the scroll can loop; announcing every
      // restaurant twice would be noise.
      aria-hidden={duplicate || undefined}
    >
      {places.map((place) => (
        <Row
          key={`${duplicate ? "dup-" : ""}${place._id}`}
          place={place}
          lang={lang}
          focusable={!duplicate}
        />
      ))}
    </ul>
  );
}

function Row({
  place,
  lang,
  focusable,
}: {
  place: Restaurant;
  lang: "vi" | "en";
  focusable: boolean;
}) {
  const tags = parseTags(place.tags);
  // tags[0] is the city and tags[1] the district, by the crawler's convention.
  const district = tags[1] ? placeLabel(tags[1], lang) : "";
  const dish = cuisineTags(tags)[0];
  const cuisine = dish ? tagLabel(dish, lang) : "";
  const caption = [cuisine, district].filter(Boolean).join(" • ");
  const reviews = formatReviewCount(place.reviewCount, lang);

  return (
    <li className="featured-row">
      <Link
        href={`/restaurants/${place._id}`}
        className="featured-link"
        tabIndex={focusable ? undefined : -1}
      >
        <img
          className="featured-thumb"
          src={place.avatarUrl || "/assets/image/pho.png"}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => {
            const target = event.target as HTMLImageElement;
            if (!target.src.includes("/assets/image/pho.png")) {
              target.src = "/assets/image/pho.png";
            }
          }}
        />

        <span className="featured-text">
          <span className="featured-name">{place.tenQuan}</span>
          {/* Falls back to the address rather than printing an empty line: a
              handful of records carry no usable cuisine or district tag. */}
          <span className="featured-caption">{caption || place.diaChi}</span>
        </span>

        {/*
          The score sits above the number of reviews it rests on. The top of
          this list is a wall of 10.0 — twelve of them, because the ordering is
          by the review-count-adjusted score while the number shown is the raw
          one, as everywhere else in the app. Without the count beside it, the
          panel reads as placeholder data; with it, the ordering is checkable.
        */}
        <span className="featured-score-col">
          <span className="featured-score">
            {formatRating(place.diemTrungBinh)}
          </span>
          {reviews && <span className="featured-count">{reviews}</span>}
        </span>

        <span className="featured-arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </li>
  );
}
