"use client";

import React, { useEffect, useState } from "react";
import {
  FaDirections,
  FaRegHeart,
  FaHeart,
  FaShareAlt,
  FaExternalLinkAlt,
  FaCheck,
} from "react-icons/fa";
import type { Restaurant } from "@/app/lib/api";
import { isSaved, toggleSaved } from "@/app/lib/api";
import { useTranslation } from "@/app/hooks/useTranslation";
import {
  describeOpenStatus,
  directionsUrl,
  distanceKm,
  formatDistance,
  getOpenStatus,
  groupAmenities,
  travelMinutes,
  type OpenStatus,
} from "@/app/lib/restaurant";

// ---------------------------------------------------------------------------
// Open status
// ---------------------------------------------------------------------------

/**
 * Live open/closing/closed badge.
 *
 * A static "10:00 - 23:00" makes the reader do the arithmetic; the reason to
 * open this page at 22:40 is to find out the kitchen shuts in twenty minutes.
 *
 * The status is computed on the client after mount rather than during render,
 * because it depends on the current time — deriving it on the server would
 * produce HTML that disagrees with the browser as soon as it hydrates.
 */
export function OpenStatusBadge({ hours }: { hours?: string }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus(hours));
    update();
    // Re-check every minute so "closing soon" appears without a reload.
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [hours]);

  if (!status || status.state === "unknown") {
    return hours ? <span className="hours-plain">{hours}</span> : null;
  }

  const { label, detail } = describeOpenStatus(status, t);

  return (
    <span className={`open-badge ${status.state}`}>
      <span className="open-dot" aria-hidden="true" />
      <span className="open-label">{label}</span>
      {detail && <span className="open-detail">· {detail}</span>}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Quick actions
// ---------------------------------------------------------------------------

interface QuickActionsProps {
  restaurant: Restaurant;
  coords: { lat: number; lon: number } | null;
  onShowMap: () => void;
}

/**
 * The row of things a diner wants to do immediately.
 *
 * The header previously offered only a long address string. There is
 * deliberately no "call" button: the collection has no phone number, and a
 * button that cannot dial anything is worse than no button.
 */
export function QuickActions({
  restaurant,
  coords,
  onShowMap,
}: QuickActionsProps) {
  const { t } = useTranslation();
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  // Read after mount: localStorage does not exist during server rendering, so
  // seeding the initial state from it would make the first client render
  // disagree with the server HTML. Deferred to a microtask because setting
  // state synchronously in an effect body causes a cascading render.
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setSaved(isSaved(restaurant._id));
    });
    return () => {
      cancelled = true;
    };
  }, [restaurant._id]);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const payload = {
      title: restaurant.tenQuan,
      text: `${restaurant.tenQuan} — ${restaurant.diaChi}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // The user dismissed the share sheet, or the clipboard is blocked.
    }
  };

  return (
    <div className="quick-actions">
      <a
        className="qa-btn qa-primary"
        href={directionsUrl(restaurant, coords)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaDirections /> {t.detail.directions}
      </a>

      <button
        type="button"
        className={`qa-btn ${saved ? "qa-saved" : ""}`}
        onClick={() => setSaved(toggleSaved(restaurant._id))}
        aria-pressed={saved}
      >
        {saved ? <FaHeart /> : <FaRegHeart />}
        {saved ? t.detail.saved : t.detail.save}
      </button>

      <button type="button" className="qa-btn" onClick={handleShare}>
        {shared ? <FaCheck /> : <FaShareAlt />}
        {shared ? t.detail.shared : t.detail.share}
      </button>

      <button type="button" className="qa-btn" onClick={onShowMap}>
        <FaDirections /> {t.detail.viewMap}
      </button>

      {restaurant.urlGoc && (
        <a
          className="qa-btn"
          href={restaurant.urlGoc}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaExternalLinkAlt /> {t.detail.source}
        </a>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Distance
// ---------------------------------------------------------------------------

/**
 * "Cách bạn 3.2 km · khoảng 12 phút đi xe".
 *
 * Renders nothing without a position, rather than showing a distance measured
 * from a guessed location.
 */
export function DistanceLine({
  restaurant,
  coords,
}: {
  restaurant: Restaurant;
  coords: { lat: number; lon: number } | null;
}) {
  const { t } = useTranslation();
  const km = distanceKm(coords, restaurant);
  if (km === null || km > 500) return null;

  return (
    <p className="distance-line">
      📍 {t.detail.distancePrefix} <strong>{formatDistance(km)}</strong> ·{" "}
      <strong>
        {travelMinutes(km)} {t.common.minutes}
      </strong>{" "}
      {t.detail.travelSuffix}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Amenities
// ---------------------------------------------------------------------------

/**
 * Attributes grouped from the restaurant's own tags.
 *
 * The "general information" panel used to hold only price and opening hours
 * while the document carried a dozen usable attributes — air conditioning,
 * who the place suits, which meals it serves — that were never surfaced.
 */
export function AmenityTags({ tags }: { tags: string[] }) {
  const { t, lang } = useTranslation();
  const groups = groupAmenities(tags, t, lang);
  if (groups.length === 0) return null;

  return (
    <div className="amenity-groups">
      {groups.map((group) => (
        <div key={group.key} className="amenity-group">
          <h4 className="amenity-label">{group.label}</h4>
          <ul className="amenity-list">
            {group.items.map((item) => (
              <li key={item.tag} className="amenity-chip">
                <span aria-hidden="true">{item.icon}</span> {item.tag}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
