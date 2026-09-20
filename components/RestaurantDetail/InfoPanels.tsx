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
import {
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
  const [status, setStatus] = useState<OpenStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getOpenStatus(hours));
    update();
    // Re-check every minute so "sắp đóng cửa" appears without a reload.
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [hours]);

  if (!status || status.state === "unknown") {
    return hours ? <span className="hours-plain">{hours}</span> : null;
  }

  return (
    <span className={`open-badge ${status.state}`}>
      <span className="open-dot" aria-hidden="true" />
      <span className="open-label">{status.label}</span>
      {status.detail && <span className="open-detail">· {status.detail}</span>}
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
        <FaDirections /> Chỉ đường
      </a>

      <button
        type="button"
        className={`qa-btn ${saved ? "qa-saved" : ""}`}
        onClick={() => setSaved(toggleSaved(restaurant._id))}
        aria-pressed={saved}
      >
        {saved ? <FaHeart /> : <FaRegHeart />}
        {saved ? "Đã lưu" : "Lưu quán"}
      </button>

      <button type="button" className="qa-btn" onClick={handleShare}>
        {shared ? <FaCheck /> : <FaShareAlt />}
        {shared ? "Đã sao chép" : "Chia sẻ"}
      </button>

      <button type="button" className="qa-btn" onClick={onShowMap}>
        <FaDirections /> Xem bản đồ
      </button>

      {restaurant.urlGoc && (
        <a
          className="qa-btn"
          href={restaurant.urlGoc}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaExternalLinkAlt /> Nguồn Foody
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
  const km = distanceKm(coords, restaurant);
  if (km === null || km > 500) return null;

  return (
    <p className="distance-line">
      📍 Cách bạn <strong>{formatDistance(km)}</strong> · khoảng{" "}
      <strong>{travelMinutes(km)} phút</strong> đi xe
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
  const groups = groupAmenities(tags);
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
