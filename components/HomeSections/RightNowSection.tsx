"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaDice, FaRedo } from "react-icons/fa";
import {
  getSuggestionsForNow,
  getSurprisePick,
  type NowSuggestions,
  type Restaurant,
  type SurprisePick,
} from "@/app/lib/api";
import { formatRating, formatReviewCount } from "@/app/lib/rating";
import { cuisineTags, parseTags } from "@/app/lib/restaurant";
import { useGeolocation } from "@/app/hooks/useGeolocation";
import { useTranslation } from "@/app/hooks/useTranslation";
import "./RightNowSection.css";

/**
 * "What should I eat right now."
 *
 * A block of its own rather than a tilt applied to the main ranking. Quietly
 * reordering every search by the time of day would mean the same query gave
 * different answers at 08:00 and 22:00 with nothing on screen to say why,
 * which reads as a broken site. Here the rule is the heading.
 *
 * It answers the question two ways, because people arrive with it in two
 * moods: a shortlist to browse, and a single pick for when browsing is the
 * problem. Both are filtered the same way — open now, well reviewed, near you
 * if you have said where that is.
 */
export default function RightNowSection() {
  const { t, lang } = useTranslation();
  const { coords } = useGeolocation();

  const [suggestions, setSuggestions] = useState<NowSuggestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [pick, setPick] = useState<SurprisePick | null>(null);
  const [picking, setPicking] = useState(false);

  // Re-runs when the position arrives, so the block starts city-wide and
  // tightens to what is actually near once permission is granted.
  useEffect(() => {
    let cancelled = false;
    getSuggestionsForNow(coords, 8)
      .then((result) => {
        if (!cancelled) setSuggestions(result);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [coords]);

  const roll = async () => {
    setPicking(true);
    try {
      setPick(await getSurprisePick(coords));
    } finally {
      setPicking(false);
    }
  };

  // Nothing open and nothing to say: better no section than an empty one.
  if (!loading && (!suggestions || suggestions.data.length === 0)) return null;

  const mealLabel = suggestions
    ? t.rightNow.meals[suggestions.meal]
    : "";

  return (
    <section className="right-now-section">
      <div className="container">
        <div className="rn-head">
          <div>
            <span className="rn-kicker">{mealLabel}</span>
            <h2 className="rn-title">{t.rightNow.title}</h2>
            <p className="rn-sub">
              {coords ? t.rightNow.subNearby : t.rightNow.subCity}
            </p>
          </div>

          <button type="button" className="rn-dice" onClick={roll} disabled={picking}>
            {pick ? <FaRedo /> : <FaDice />}
            {pick ? t.rightNow.again : t.rightNow.dice}
          </button>
        </div>

        {/* The single pick, when asked for. It sits above the shortlist rather
            than replacing it, so the answer is a suggestion and not a wall. */}
        {pick?.data && (
          <PickCard pick={pick} t={t} />
        )}
        {pick && !pick.data && (
          <p className="rn-empty">{t.rightNow.noPick}</p>
        )}

        <ul className="rn-grid">
          {loading
            ? [0, 1, 2, 3].map((index) => (
                <li key={index} className="rn-skeleton" />
              ))
            : suggestions?.data.map((place) => (
                <RestaurantCard key={place._id} place={place} lang={lang} />
              ))}
        </ul>
      </div>
    </section>
  );
}

function PickCard({
  pick,
  t,
}: {
  pick: SurprisePick;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  const place = pick.data as Restaurant;
  const reasons = pick.reasons;

  // Only facts that are actually known go into the sentence. A distance is
  // omitted rather than guessed when no position was given.
  const parts: string[] = [t.rightNow.becauseOpen];
  if (reasons?.distanceKm !== null && reasons?.distanceKm !== undefined) {
    parts.push(`${t.rightNow.becauseNear} ${reasons.distanceKm} km`);
  }
  if (reasons?.rawScore) {
    parts.push(`${t.rightNow.becauseScore} ${formatRating(reasons.rawScore)}/10`);
  }

  return (
    <div className="rn-pick">
      <Link href={`/restaurants/${place._id}`} className="rn-pick-link">
        <img
          className="rn-pick-img"
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
        <div className="rn-pick-body">
          <span className="rn-pick-badge">{t.rightNow.pickBadge}</span>
          <h3 className="rn-pick-name">{place.tenQuan}</h3>
          <p className="rn-pick-why">{parts.join(" · ")}</p>
          <p className="rn-pick-address">{place.diaChi}</p>
        </div>
      </Link>
      <p className="rn-pick-pool">
        {t.rightNow.pickedFrom} {pick.poolSize} {t.rightNow.places}
      </p>
    </div>
  );
}

function RestaurantCard({
  place,
  lang,
}: {
  place: Restaurant;
  lang: "vi" | "en";
}) {
  const tags = parseTags(place.tags);
  const caption = [cuisineTags(tags)[0], tags[1]].filter(Boolean).join(" • ");
  const reviews = formatReviewCount(place.reviewCount, lang);

  return (
    <li className="rn-card">
      <Link href={`/restaurants/${place._id}`} className="rn-card-link">
        <div className="rn-card-media">
          <img
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
          <span className="rn-card-score">
            {formatRating(place.diemTrungBinh)}
          </span>
        </div>
        <div className="rn-card-body">
          <h3 className="rn-card-name">{place.tenQuan}</h3>
          <p className="rn-card-caption">{caption || place.diaChi}</p>
          <p className="rn-card-meta">
            {place.gioMoCua}
            {reviews ? ` · ${reviews}` : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}
