"use client";

import { useCallback, useEffect, useState } from "react";

export interface Coords {
  lat: number;
  lon: number;
}

export type GeoStatus =
  | "idle"
  | "prompting"
  | "granted"
  | "denied"
  | "unavailable";

const STORAGE_KEY = "vnn:last-known-location";

/**
 * The user's location, asked for once and remembered.
 *
 * Deliberately starts as `null` rather than defaulting to a hardcoded point.
 * Several pages previously initialised state to a fixed Saigon coordinate, so
 * before the browser granted permission — and permanently if it was denied —
 * every "distance from you" shown was measured from a random street in District
 * 1 and presented as fact. A null location means the UI can honestly omit
 * distances instead.
 */
export function useGeolocation(options: { auto?: boolean } = {}) {
  const { auto = true } = options;
  const [coords, setCoords] = useState<Coords | null>(null);
  const [status, setStatus] = useState<GeoStatus>("idle");

  // Reuse the previous fix so a reload does not re-prompt and distances appear
  // immediately. Cached separately from the live result so the UI can tell them
  // apart if it wants to.
  useEffect(() => {
    try {
      const cached = window.sessionStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as Coords;
        if (
          typeof parsed?.lat === "number" &&
          typeof parsed?.lon === "number"
        ) {
          setCoords(parsed);
        }
      }
    } catch {
      /* private mode or blocked storage: just ask again */
    }
  }, []);

  const request = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }

    setStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        setCoords(next);
        setStatus("granted");
        try {
          window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* non-fatal */
        }
      },
      (error) => {
        // PERMISSION_DENIED is 1; anything else is a transient failure.
        setStatus(error.code === error.PERMISSION_DENIED ? "denied" : "unavailable");
      },
      {
        enableHighAccuracy: false, // a city-block fix is plenty and much faster
        timeout: 10_000,
        maximumAge: 300_000, // a 5-minute-old fix is fine for finding food
      }
    );
  }, []);

  useEffect(() => {
    if (!auto) return;
    // Only prompt when the user has already granted permission, so a first-time
    // visitor is not hit with a location dialog before doing anything.
    if (typeof navigator === "undefined" || !navigator.permissions?.query) {
      request();
      return;
    }
    let cancelled = false;
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((result) => {
        if (cancelled) return;
        if (result.state === "granted") request();
        else if (result.state === "denied") setStatus("denied");
      })
      .catch(() => request());
    return () => {
      cancelled = true;
    };
  }, [auto, request]);

  return { coords, status, request, hasLocation: coords !== null };
}
