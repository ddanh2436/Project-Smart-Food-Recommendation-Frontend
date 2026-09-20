/**
 * Helpers for presenting a restaurant.
 *
 * Everything here is derived from fields that actually exist on the crawled
 * document — `tags`, `gioMoCua`, `lat`/`lon`. Nothing is invented: the
 * collection has no menu, no phone number and only one photo per restaurant,
 * so no helper here pretends otherwise.
 */

/**
 * Parse the `tags` field.
 *
 * The crawler stored a Python list's string form, e.g.
 * `"['Hồ Chí Minh', 'Quận 1', 'Phở', 'Máy lạnh']"`, so it needs unpacking
 * before it is anything but an opaque string.
 */
export function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw !== "string" || !raw.trim()) return [];
  return raw
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((part) => part.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean);
}

export interface AmenityGroup {
  key: string;
  label: string;
  items: { tag: string; icon: string }[];
}

/**
 * Attribute vocabulary, taken from the tags that actually occur in the data.
 *
 * Counts from the live collection are in comments so it is clear these are
 * observed values rather than a guess at what a restaurant might have.
 */
const SPACE_TAGS: Record<string, string> = {
  "Máy lạnh": "❄️", //  762
  "Sạch sẽ": "✨", //  620
  "Không gian đẹp": "🖼️", //  620
  "Decor đẹp": "🎨", //  405
  "Thoáng mát": "🌤️", //  325
  "Sang trọng": "💎", //  404
  "Ấm cúng": "🕯️", //  981
  "Lịch sự": "🎩", //  982
  "Thoải mái": "🛋️", // 2692
  "Vỉa hè": "🪑", // 2267
  "Trong hẻm": "🛵", //  128
  "Sân vườn": "🌿",
  "View đẹp": "🌅",
  "Yên tĩnh": "🤫",
};

const AUDIENCE_TAGS: Record<string, string> = {
  "Gia đình": "👨‍👩‍👧", // 2755
  "Trẻ em": "🧒", // 2755
  "Hẹn hò": "💕", //  699
  "Lãng mạn": "🌹", //  542
  Nhậu: "🍻", //  624
  "Tụ tập": "🎉", //  618
  "Nhóm hội": "👥", //  427
  "Tiếp khách": "🤝", //  397
  "Doanh nhân": "💼", //  240
  "Cơm văn phòng": "🏢", //  406
  "Bình dân": "💸", // 3710
};

const MEAL_TAGS: Record<string, string> = {
  "Ăn sáng": "🌅", // 3824
  "Ăn trưa": "☀️", // 4428
  "Bữa trưa": "☀️", //  221
  "Ăn tối": "🌆", // 4901
  "Ăn đêm": "🌙", // 2906
};

/**
 * Group a restaurant's tags into the attributes a diner cares about.
 *
 * The detail page previously showed only price and opening hours, which left
 * the "general information" panel looking empty even though the document
 * carried a dozen usable attributes all along.
 */
export function groupAmenities(tags: string[]): AmenityGroup[] {
  const pick = (source: Record<string, string>) =>
    tags
      .filter((tag) => source[tag])
      .map((tag) => ({ tag, icon: source[tag] }));

  const groups: AmenityGroup[] = [
    { key: "space", label: "Không gian & tiện ích", items: pick(SPACE_TAGS) },
    { key: "audience", label: "Phù hợp với", items: pick(AUDIENCE_TAGS) },
    { key: "meals", label: "Phục vụ các bữa", items: pick(MEAL_TAGS) },
  ];
  return groups.filter((group) => group.items.length > 0);
}

/**
 * Cuisine and dish tags: everything that is not a place, an attribute or a
 * meal time. Used for the "what they serve" line.
 */
export function cuisineTags(tags: string[]): string[] {
  const known = new Set([
    ...Object.keys(SPACE_TAGS),
    ...Object.keys(AUDIENCE_TAGS),
    ...Object.keys(MEAL_TAGS),
  ]);
  // The first two entries are always city and district.
  return tags
    .slice(2)
    .filter((tag) => !known.has(tag))
    .slice(0, 8);
}

// ---------------------------------------------------------------------------
// Opening hours
// ---------------------------------------------------------------------------
export type OpenState = "open" | "closing-soon" | "closed" | "unknown";

export interface OpenStatus {
  state: OpenState;
  label: string;
  /** Detail line, e.g. "Đóng cửa lúc 22:00" or "Mở lại lúc 07:00". */
  detail: string | null;
}

/** Minutes past midnight, or null if the string is not a time. */
function toMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

/** How long before closing a restaurant counts as "closing soon". */
const CLOSING_SOON_MINUTES = 45;

/**
 * Turn `"07:00 - 11:00 | 13:30 - 22:00"` into a live status.
 *
 * A static time range makes the reader do the arithmetic; the point of coming
 * to the page at 21:50 is to learn that the kitchen shuts in ten minutes.
 */
export function getOpenStatus(
  hours: string | undefined,
  now: Date = new Date()
): OpenStatus {
  if (!hours || !hours.trim()) {
    return { state: "unknown", label: "Chưa có giờ mở cửa", detail: null };
  }

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const windows: { start: number; end: number }[] = [];

  for (const part of hours.split(/[|,]/)) {
    const [rawStart, rawEnd] = part.split("-").map((piece) => piece.trim());
    const start = rawStart ? toMinutes(rawStart) : null;
    const end = rawEnd ? toMinutes(rawEnd) : null;
    if (start !== null && end !== null) windows.push({ start, end });
  }

  if (windows.length === 0) {
    return { state: "unknown", label: "Chưa có giờ mở cửa", detail: null };
  }

  const format = (minutes: number) => {
    const normalized = ((minutes % 1440) + 1440) % 1440;
    const h = String(Math.floor(normalized / 60)).padStart(2, "0");
    const m = String(normalized % 60).padStart(2, "0");
    return `${h}:${m}`;
  };

  for (const { start, end } of windows) {
    // A window that ends before it starts runs past midnight.
    const crossesMidnight = end < start;
    const isOpen = crossesMidnight
      ? minutesNow >= start || minutesNow <= end
      : minutesNow >= start && minutesNow <= end;

    if (!isOpen) continue;

    const untilClose = crossesMidnight && minutesNow >= start
      ? end + 1440 - minutesNow
      : end - minutesNow;

    if (untilClose <= CLOSING_SOON_MINUTES) {
      return {
        state: "closing-soon",
        label: "Sắp đóng cửa",
        detail: `Đóng cửa lúc ${format(end)} · còn ${untilClose} phút`,
      };
    }
    return {
      state: "open",
      label: "Đang mở cửa",
      detail: `Đóng cửa lúc ${format(end)}`,
    };
  }

  // Closed: report the next opening time.
  const upcoming = windows
    .map((w) => w.start)
    .map((start) => (start >= minutesNow ? start : start + 1440))
    .sort((a, b) => a - b)[0];

  return {
    state: "closed",
    label: "Đã đóng cửa",
    detail: upcoming !== undefined ? `Mở lại lúc ${format(upcoming)}` : null,
  };
}

// ---------------------------------------------------------------------------
// Distance and directions
// ---------------------------------------------------------------------------
const EARTH_RADIUS_KM = 6371;

/** Straight-line distance in km, or null when either point is unusable. */
export function distanceKm(
  from: { lat: number; lon: number } | null | undefined,
  to: { lat?: number; lon?: number } | null | undefined
): number | null {
  if (!from || !to?.lat || !to?.lon) return null;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLon = toRad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLon / 2) ** 2;
  const km = EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number.isFinite(km) ? km : null;
}

/**
 * Rough riding time for a city motorbike trip.
 *
 * Deliberately coarse: this is a straight-line distance, not a route, so the
 * estimate is padded by 30% for the fact that streets are not straight, at an
 * average city speed of about 20km/h. Phrased as "khoảng" so it never reads as
 * a routing engine's answer.
 */
export function travelMinutes(km: number): number {
  const ridingKm = km * 1.3;
  return Math.max(1, Math.round((ridingKm / 20) * 60));
}

export function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/** Google Maps directions for a restaurant, from the user's position if known. */
export function directionsUrl(
  to: { lat?: number; lon?: number; tenQuan?: string; diaChi?: string },
  from?: { lat: number; lon: number } | null
): string {
  const destination =
    to.lat && to.lon
      ? `${to.lat},${to.lon}`
      : encodeURIComponent(`${to.tenQuan ?? ""} ${to.diaChi ?? ""}`.trim());
  const origin = from ? `&origin=${from.lat},${from.lon}` : "";
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}${origin}&travelmode=driving`;
}
