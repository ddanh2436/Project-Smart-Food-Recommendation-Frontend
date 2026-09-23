"use client";

import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { GeoStatus } from "@/app/hooks/useGeolocation";
import { directionsUrl } from "@/app/lib/restaurant";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import L from "leaflet";
import "./RoutingMap.css";

const userIcon = L.divIcon({
  className: "custom-icon-user",
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2979FF" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); width: 32px; height: 32px;"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const restaurantIcon = L.divIcon({
  className: "custom-icon-res",
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFC107" stroke="#3E2723" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); width: 40px; height: 40px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 38],
});

/**
 * Public OSRM servers, tried in order. The first is the project's demo server,
 * which is rate-limited and occasionally down; the second is run by the
 * OpenStreetMap community in Germany. Both are free and need no key.
 */
const ROUTERS = [
  "https://router.project-osrm.org/route/v1",
  "https://routing.openstreetmap.de/routed-car/route/v1",
];

/**
 * Basemaps, tried in order. CARTO's dark tiles, used before, now draw
 * "API KEY REQUIRED" across every tile for sites without a key — which is
 * what the map showed on the deployed site. Esri's dark grey canvas is free
 * with attribution and needs no key; OpenStreetMap's own tiles are the
 * fallback if it stops answering.
 */
const TILE_SOURCES = [
  {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
    maxZoom: 16,
  },
  {
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
];

interface Point {
  lat: number;
  lon: number;
}

interface RouteStep {
  text: string;
  distance: number;
}

interface RouteInfo {
  totalDistance: number;
  totalTime: number;
  steps: RouteStep[];
}

interface RoutingMapProps {
  userLocation: Point | null;
  restaurantLocation: Point;
  /** Where the location request stands, so the map can say what it waits for. */
  locationStatus?: GeoStatus;
  /** Ask the browser for the user's location. */
  onRequestLocation?: () => void;
}

/**
 * Draws the route between two points, falling back to the next server when one
 * fails and reporting the outcome instead of spinning forever.
 *
 * The effect depends on the four numbers rather than on the two objects: the
 * parent passes fresh `{lat, lon}` literals on every render, and depending on
 * those tore the control down and re-requested the route each time the page
 * re-rendered — enough traffic to be throttled by the demo server.
 */
function RoutingControl({
  from,
  to,
  lang,
  onFound,
  onFailed,
}: {
  from: Point;
  to: Point;
  lang: "vi" | "en";
  onFound: (info: RouteInfo) => void;
  onFailed: () => void;
}) {
  const map = useMap();
  const found = useRef(onFound);
  const failed = useRef(onFailed);
  useEffect(() => {
    found.current = onFound;
    failed.current = onFailed;
  });

  useEffect(() => {
    // leaflet-routing-machine attaches itself to L at runtime and ships no
    // types for that, hence the loose handle.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Routing = (L as any).Routing;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let control: any = null;
    let cancelled = false;

    const attempt = (index: number) => {
      if (cancelled) return;
      if (control) {
        try {
          map.removeControl(control);
        } catch {
          /* already gone */
        }
      }
      control = Routing.control({
        waypoints: [L.latLng(from.lat, from.lon), L.latLng(to.lat, to.lon)],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false,
        addWaypoints: false,
        router: Routing.osrmv1({
          serviceUrl: ROUTERS[index],
          profile: "driving",
          language: lang,
        }),
        lineOptions: {
          styles: [{ color: "#FFC107", opacity: 1, weight: 6 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0,
        },
        createMarker: () => null,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      control.on("routesfound", (event: any) => {
        const route = event.routes?.[0];
        if (!route || cancelled) return;
        found.current({
          totalDistance: route.summary.totalDistance,
          totalTime: route.summary.totalTime,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          steps: (route.instructions ?? []).map((step: any) => ({
            text: String(step.text ?? ""),
            distance: Number(step.distance ?? 0),
          })),
        });
      });
      control.on("routingerror", () => {
        if (cancelled) return;
        if (index + 1 < ROUTERS.length) attempt(index + 1);
        else failed.current();
      });

      // The library clears its line on removal and crashes if the map has
      // already been torn down (a fast close of the panel).
      const clearLines = control._clearLines;
      control._clearLines = function (...args: unknown[]) {
        if (!this._map) return;
        return clearLines.apply(this, args);
      };

      try {
        control.addTo(map);
        const container = control.getContainer?.();
        if (container) container.style.display = "none";
      } catch {
        failed.current();
      }
    };

    attempt(0);

    return () => {
      cancelled = true;
      if (control) {
        try {
          map.removeControl(control);
        } catch {
          /* already gone */
        }
      }
    };
  }, [map, from.lat, from.lon, to.lat, to.lon, lang]);

  return null;
}

/** Keep the view on the restaurant when there is no route to fit to. */
function FocusOn({ point }: { point: Point }) {
  const map = useMap();
  useEffect(() => {
    map.setView([point.lat, point.lon], 15);
  }, [map, point.lat, point.lon]);
  return null;
}

export default function RoutingMap({
  userLocation,
  restaurantLocation,
  locationStatus,
  onRequestLocation,
}: RoutingMapProps) {
  const { t, lang } = useTranslation();
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeFailed, setRouteFailed] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [tileSource, setTileSource] = useState(0);
  const tileErrors = useRef(0);
  const asked = useRef(false);

  /**
   * Ask for the location as the map opens.
   *
   * The site only reads a location silently when permission was given before,
   * so a first-time visitor never had one — and the map waited on it forever
   * behind a "finding a route" spinner. Opening the map is a clear enough
   * request to ask, once.
   */
  useEffect(() => {
    if (userLocation || asked.current || !onRequestLocation) return;
    if (locationStatus === "denied" || locationStatus === "unavailable") return;
    asked.current = true;
    onRequestLocation();
  }, [userLocation, locationStatus, onRequestLocation]);

  const destination = restaurantLocation;
  const googleUrl = directionsUrl(destination, userLocation);

  const formatDist = (m: number) =>
    m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
  const formatTime = (s: number) => `${Math.max(1, Math.round(s / 60))} ${t.common.minutes}`;

  /**
   * OSRM's instructions come back in English whatever is asked for, so they
   * are rewritten for Vietnamese and left alone for English.
   */
  const translateInstruction = (text: string) => {
    if (lang === "en") return text;
    return text
      .replace(/^Head /, "Đi về hướng ")
      .replace(/Turn slight left/g, "Chếch trái")
      .replace(/Turn slight right/g, "Chếch phải")
      .replace(/Turn sharp left/g, "Rẽ gắt trái")
      .replace(/Turn sharp right/g, "Rẽ gắt phải")
      .replace(/Turn left/g, "Rẽ trái")
      .replace(/Turn right/g, "Rẽ phải")
      .replace(/Keep left/g, "Đi bên trái")
      .replace(/Keep right/g, "Đi bên phải")
      .replace(/Make a U-turn/g, "Quay đầu")
      .replace(/Enter the traffic circle and take the (\w+) exit/g, "Vào vòng xuyến, ra lối thứ $1")
      .replace(/Continue/g, "Tiếp tục")
      .replace(/ onto /g, " vào ")
      .replace(/ on /g, " trên ")
      .replace(/\bnorth\b/g, "bắc")
      .replace(/\bsouth\b/g, "nam")
      .replace(/\beast\b/g, "đông")
      .replace(/\bwest\b/g, "tây")
      .replace(/You have arrived at your destination/g, "Bạn đã đến nơi")
      .replace(/Destination/g, "Điểm đến");
  };

  let overlay: React.ReactNode;
  if (route) {
    overlay = (
      <div className="rmap-card">
        <div className="rmap-card__row">
          <div className="rmap-stats">
            <div>
              <div className="rmap-stat__label">{t.map.distance}</div>
              <div className="rmap-stat__value rmap-stat__value--accent">
                {formatDist(route.totalDistance)}
              </div>
            </div>
            <div className="rmap-divider" />
            <div>
              <div className="rmap-stat__label">{t.map.duration}</div>
              <div className="rmap-stat__value">{formatTime(route.totalTime)}</div>
            </div>
          </div>
          <div className="rmap-actions">
            <button type="button" className="rmap-btn" onClick={() => setShowSteps((v) => !v)}>
              {showSteps ? `${t.map.hideSteps} ▲` : `${t.map.showSteps} ▼`}
            </button>
            <a className="rmap-btn rmap-btn--ghost" href={googleUrl} target="_blank" rel="noopener noreferrer">
              {t.map.openGoogle} ↗
            </a>
          </div>
        </div>
        {showSteps && (
          <ol className="rmap-steps">
            {route.steps.map((step, index) => (
              <li key={index}>
                {translateInstruction(step.text)}
                <span className="rmap-steps__dist">({formatDist(step.distance)})</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  } else if (!userLocation) {
    // Denied is a browser setting only the user can change; unavailable is a
    // failed fix (no GPS, a timeout) and is worth another try.
    const denied = locationStatus === "denied";
    const failed = locationStatus === "unavailable";
    overlay = (
      <div className="rmap-card rmap-card--notice">
        <p className="rmap-notice">
          {locationStatus === "prompting"
            ? t.map.locating
            : denied
              ? t.map.locationDenied
              : failed
                ? t.map.locationUnavailable
                : t.map.needLocation}
        </p>
        <div className="rmap-actions">
          {!denied && locationStatus !== "prompting" && onRequestLocation && (
            <button type="button" className="rmap-btn rmap-btn--primary" onClick={onRequestLocation}>
              {failed ? t.map.retry : t.map.allowLocation}
            </button>
          )}
          <a className="rmap-btn rmap-btn--ghost" href={googleUrl} target="_blank" rel="noopener noreferrer">
            {t.map.openGoogle} ↗
          </a>
        </div>
      </div>
    );
  } else if (routeFailed) {
    overlay = (
      <div className="rmap-card rmap-card--notice">
        <p className="rmap-notice">{t.map.routeFailed}</p>
        <div className="rmap-actions">
          <a className="rmap-btn rmap-btn--primary" href={googleUrl} target="_blank" rel="noopener noreferrer">
            {t.map.openGoogle} ↗
          </a>
        </div>
      </div>
    );
  } else {
    overlay = (
      <div className="rmap-pill" role="status">
        <span className="rmap-spinner" aria-hidden="true" />
        {t.map.routing}
      </div>
    );
  }

  if (!destination.lat || !destination.lon) {
    return <div className="rmap-empty">{t.detail.mapMissing}</div>;
  }

  return (
    <div className="rmap">
      <MapContainer
        center={[destination.lat, destination.lon]}
        zoom={15}
        maxZoom={TILE_SOURCES[tileSource].maxZoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          key={tileSource}
          url={TILE_SOURCES[tileSource].url}
          attribution={TILE_SOURCES[tileSource].attribution}
          maxZoom={TILE_SOURCES[tileSource].maxZoom}
          eventHandlers={{
            // A few failed tiles switch the whole layer to the next source.
            tileerror: () => {
              tileErrors.current += 1;
              if (tileErrors.current >= 4 && tileSource + 1 < TILE_SOURCES.length) {
                tileErrors.current = 0;
                setTileSource(tileSource + 1);
              }
            },
          }}
        />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon} />
        )}
        <Marker position={[destination.lat, destination.lon]} icon={restaurantIcon} />
        {userLocation ? (
          <RoutingControl
            from={userLocation}
            to={destination}
            lang={lang}
            onFound={(info) => {
              setRouteFailed(false);
              setRoute(info);
            }}
            onFailed={() => setRouteFailed(true)}
          />
        ) : (
          <FocusOn point={destination} />
        )}
      </MapContainer>
      {overlay}
    </div>
  );
}
