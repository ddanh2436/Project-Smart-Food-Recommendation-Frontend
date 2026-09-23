"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaDice, FaRedo, FaTimes } from "react-icons/fa";
import {
  getSuggestionsForNow,
  getSurprisePick,
  type NowSuggestions,
  type Restaurant,
  type SurprisePick,
} from "@/app/lib/api";
import { formatRating, formatReviewCount } from "@/app/lib/rating";
import { cuisineTags, parseTags, placeLabel, tagLabel } from "@/app/lib/restaurant";
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
  const [dialogOpen, setDialogOpen] = useState(false);
  // Which shortlisted place the "reel" shows while the pick is on its way.
  const [reel, setReel] = useState(0);

  /**
   * The next pick, fetched before it is asked for.
   *
   * The draw itself takes a fraction of a second, but the free API host
   * sleeps when idle and the first request after that waits for it to wake —
   * ten seconds or more. Drawing ahead, as soon as the section has loaded
   * and again after every reveal, means the button answers at once.
   */
  const nextPick = useRef<Promise<SurprisePick | null> | null>(null);
  const prefetch = useCallback(() => {
    nextPick.current = getSurprisePick(coords).catch(() => null);
  }, [coords]);

  useEffect(() => {
    if (!loading && suggestions?.data.length) prefetch();
  }, [loading, suggestions, prefetch]);

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

  /**
   * The pick opens in a dialog, spinning through the shortlist first.
   *
   * It used to be inserted above the shortlist, which pushed the whole list
   * down the moment it arrived. In a dialog nothing on the page moves, and
   * the short spin gives the draw a moment of suspense. The spin lasts at
   * least ~1.2s but never longer than the request itself needs.
   */
  const roll = async () => {
    setDialogOpen(true);
    setPicking(true);
    const places = suggestions?.data ?? [];
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer =
      places.length > 1 && !reduced
        ? window.setInterval(() => setReel((n) => (n + 1) % places.length), 90)
        : undefined;
    try {
      const pending = nextPick.current ?? getSurprisePick(coords);
      nextPick.current = null;
      const [result] = await Promise.all([
        pending,
        new Promise((resolve) => setTimeout(resolve, reduced ? 0 : 900)),
      ]);
      setPick(result);
    } finally {
      if (timer) window.clearInterval(timer);
      setPicking(false);
      prefetch();
    }
  };

  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialogOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogOpen]);

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
            <FaDice />
            {t.rightNow.dice}
          </button>
        </div>

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

      {dialogOpen && (
        <div
          className="rn-dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDialogOpen(false);
          }}
        >
          <div className="rn-dialog" role="dialog" aria-modal="true" aria-label={t.rightNow.pickBadge}>
            <button
              type="button"
              className="rn-dialog-close"
              onClick={() => setDialogOpen(false)}
              aria-label={t.common.closeLabel}
            >
              <FaTimes />
            </button>

            {picking ? (
              <Reel place={suggestions?.data[reel]} t={t} />
            ) : pick?.data ? (
              <div className="rn-reveal">
                <PickCard pick={pick} t={t} />
              </div>
            ) : (
              <p className="rn-empty">{t.rightNow.noPick}</p>
            )}

            <div className="rn-dialog-actions">
              <button type="button" className="rn-dice" onClick={roll} disabled={picking}>
                <FaRedo /> {t.rightNow.again}
              </button>
              {!picking && pick?.data && (
                <Link href={`/restaurants/${pick.data._id}`} className="rn-dialog-go">
                  {t.rightNow.goThere} →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** One frame of the spin: whichever shortlisted place is under the needle. */
function Reel({
  place,
  t,
}: {
  place?: Restaurant;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <div className="rn-reel" role="status" aria-label={t.rightNow.picking}>
      <span className="rn-pick-badge">{t.rightNow.picking}</span>
      {place && (
        <div className="rn-reel-frame">
          <img src={place.avatarUrl || "/assets/image/pho.png"} alt="" referrerPolicy="no-referrer" />
          <span className="rn-reel-name">{place.tenQuan}</span>
        </div>
      )}
    </div>
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
  // The adjusted score, as shown everywhere else on the site.
  const score = reasons?.score ?? reasons?.rawScore;
  if (score) {
    parts.push(`${t.rightNow.becauseScore} ${formatRating(score)}/10`);
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
  const dish = cuisineTags(tags)[0];
  const caption = [dish && tagLabel(dish, lang), tags[1] && placeLabel(tags[1], lang)]
    .filter(Boolean)
    .join(" • ");
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
