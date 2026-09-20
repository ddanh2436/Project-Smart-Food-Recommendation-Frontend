// app/lib/api.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "http://localhost:3001";

/** Endpoints that must never carry an Authorization header. */
const PUBLIC_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// ---------------------------------------------------------------------------
// Token storage
//
// Every access goes through these helpers, wrapped in try/catch and guarded by
// a `window` check. Reading localStorage directly at module scope — as the old
// interceptor did — throws during server-side rendering and in a browser with
// site data blocked.
// ---------------------------------------------------------------------------
export const tokenStore = {
  get access(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  get refresh(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  save(accessToken: string, refreshToken?: string) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      if (refreshToken) {
        window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch {
      /* storage unavailable: the session just will not survive a reload */
    }
  },
  clear() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      /* nothing to do */
    }
  },
};

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 60_000, // a cold-starting free Hugging Face Space can take ~50s
});

api.interceptors.request.use(
  (config) => {
    const url = config.url ?? "";
    if (PUBLIC_ENDPOINTS.some((endpoint) => url.startsWith(endpoint))) {
      return config;
    }
    const token = tokenStore.access;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// Automatic token refresh on 401
//
// The access token lives for 15 minutes and there was previously no refresh
// handling at all, so a user was silently signed out mid-session. On a 401 we
// now exchange the refresh token once and replay the original request.
//
// `refreshPromise` de-duplicates: if five requests 401 at the same moment they
// all await the same refresh instead of racing five rotations, where four would
// be rejected because each rotation invalidates the previous token.
// ---------------------------------------------------------------------------
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

let refreshPromise: Promise<string | null> | null = null;
const authFailureListeners = new Set<() => void>();

/** Called when the session cannot be recovered, so the UI can react. */
export function onAuthFailure(listener: () => void): () => void {
  authFailureListeners.add(listener);
  return () => authFailureListeners.delete(listener);
}

function notifyAuthFailure() {
  tokenStore.clear();
  authFailureListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      /* a listener must not break the others */
    }
  });
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStore.refresh;
  if (!refreshToken) return null;

  try {
    // A bare axios call, not `api`, so this request cannot itself be
    // intercepted and start an infinite refresh loop.
    const response = await axios.post<{
      accessToken: string;
      refreshToken: string;
    }>(`${API_URL}/auth/refresh`, { refreshToken }, { timeout: 20_000 });

    tokenStore.save(response.data.accessToken, response.data.refreshToken);
    return response.data.accessToken;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !config || config._retried) {
      return Promise.reject(error);
    }
    // Never try to refresh a failure that came from the auth endpoints.
    if (PUBLIC_ENDPOINTS.some((endpoint) => (config.url ?? "").startsWith(endpoint))) {
      return Promise.reject(error);
    }

    config._retried = true;

    refreshPromise = refreshPromise ?? refreshAccessToken();
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (!newToken) {
      notifyAuthFailure();
      return Promise.reject(error);
    }

    config.headers.Authorization = `Bearer ${newToken}`;
    return api(config);
  }
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface Restaurant {
  _id: string;
  tenQuan: string;
  diaChi: string;
  gioMoCua?: string;
  giaCa?: string;
  diemTrungBinh: number;
  avatarUrl?: string;
  diemKhongGian?: number;
  diemViTri?: number;
  diemChatLuong?: number;
  diemPhucVu?: number;
  diemGiaCa?: number;
  urlGoc?: string;
  lat?: number;
  lon?: number;
  distance?: number;

  /**
   * How many reviews back this restaurant's scores, and the review-count
   * adjusted scores the API orders by.
   *
   * Populated by the backend's rating-stats backfill. Listings are ordered by
   * the adjusted score while the card displays the raw one, so surfacing the
   * count is what makes the ordering legible: without it a 10.0 from a single
   * review looks mis-ranked next to a 9.0 from thirty.
   */
  reviewCount?: number;
  diemTrungBinhAdj?: number;
  diemKhongGianAdj?: number;
  diemViTriAdj?: number;
  diemChatLuongAdj?: number;
  diemPhucVuAdj?: number;
  diemGiaCaAdj?: number;
}

export interface RestaurantPage {
  data: Restaurant[];
  total: number;
  currentPage: number;
  totalPages: number;
  sortBy?: string;
  order?: string;
}

export interface Review {
  _id: string;
  tenQuan: string;
  urlGoc: string;
  diemReview: number;
  noiDung: string;
  aiSentimentLabel?: string;
  aiSentimentScore?: number;
  authorName?: string;
  createdAt?: string;
}

export interface ReviewAspect {
  key: string;
  label: string;
  icon: string;
  mentions: number;
  positive: number;
  neutral: number;
  negative: number;
  positive_ratio: number;
  verdict: "positive" | "negative" | "mixed";
  quotes: string[];
}

export interface ReviewInsights {
  available: boolean;
  review_count: number;
  average_rating: number | null;
  overall: { positive: number; neutral: number; negative: number };
  aspects: ReviewAspect[];
  summary: string | null;
  message?: string;
}

export interface ChatTurn {
  role: "user" | "bot";
  text: string;
}

export interface ChatReply {
  reply: string;
  results: Restaurant[];
  kind: string;
  intent?: Record<string, unknown>;
  totalMatches?: number;
  relaxedFilters?: string[];
}

export interface RestaurantQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
  rating?: string;
  openNow?: boolean;
  userLat?: number | string;
  userLon?: number | string;
  search?: string;
  city?: string;
}

const EMPTY_PAGE: RestaurantPage = {
  data: [],
  total: 0,
  currentPage: 1,
  totalPages: 0,
};

// ---------------------------------------------------------------------------
// Restaurants
// ---------------------------------------------------------------------------

/**
 * Fetch a page of restaurants.
 *
 * Replaces the previous ten-positional-argument signature, where every caller
 * had to pass `"", "", ""` placeholders in the right order to reach the one
 * argument it cared about, and empty values were sent to the API as literal
 * `userLat=&userLon=` pairs.
 */
export async function getRestaurants(
  query: RestaurantQuery = {}
): Promise<RestaurantPage> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    params.set(key, String(value));
  });

  try {
    const response = await api.get<RestaurantPage>(
      `/restaurants?${params.toString()}`
    );
    return response.data ?? EMPTY_PAGE;
  } catch (error) {
    console.error("Failed to fetch restaurants:", describeError(error));
    return EMPTY_PAGE;
  }
}

/** Top restaurants by one of the score fields, for the home page sections. */
export async function getTopRestaurants(
  sortBy: string,
  limit = 10,
  city?: string
): Promise<Restaurant[]> {
  const page = await getRestaurants({ limit, sortBy, order: "desc", city });
  return page.data;
}

export async function getRestaurantById(id: string): Promise<Restaurant> {
  const response = await api.get<Restaurant>(`/restaurants/${id}`);
  return response.data;
}

export async function getNearbyRestaurants(
  lat: number,
  lon: number,
  radiusKm = 5,
  limit = 20
): Promise<Restaurant[]> {
  try {
    const response = await api.get<Restaurant[]>(
      `/restaurants/nearby?lat=${lat}&lon=${lon}&radius=${radiusKm}&limit=${limit}`
    );
    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch nearby restaurants:", describeError(error));
    return [];
  }
}

export interface ImageSearchResult {
  data: Restaurant[];
  detectedFood: string | null;
  confidence?: number;
  detections?: Array<{
    food_name: string;
    original_name: string;
    confidence: number;
  }>;
  total: number;
  message?: string;
}

export async function searchRestaurantsByImage(
  file: File,
  coords?: { lat: number; lon: number }
): Promise<ImageSearchResult | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const query = coords
      ? `?userLat=${coords.lat}&userLon=${coords.lon}`
      : "";

    const response = await api.post<ImageSearchResult>(
      `/restaurants/search-by-image${query}`,
      formData,
      {
        // Recognition plus a search; a cold AI service needs the headroom.
        timeout: 90_000,
        // Content-Type is deliberately not set: the browser must add the
        // multipart boundary itself, and setting it by hand strips it.
      }
    );
    return response.data;
  } catch (error) {
    console.error("Image search failed:", describeError(error));
    return null;
  }
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------
export async function chatWithBot(
  message: string,
  options: {
    history?: ChatTurn[];
    coords?: { lat: number; lon: number } | null;
    lang?: "vi" | "en";
  } = {}
): Promise<ChatReply | null> {
  try {
    const response = await api.post<ChatReply>("/restaurants/chat", {
      message,
      // Sending the recent turns is what lets the assistant resolve follow-ups
      // like "rẻ hơn" or "còn gì khác".
      history: (options.history ?? []).slice(-10),
      userLat: options.coords?.lat,
      userLon: options.coords?.lon,
      lang: options.lang ?? "vi",
    });
    return response.data;
  } catch (error) {
    console.error("Chat failed:", describeError(error));
    return null;
  }
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------
export async function getReviewsByUrl(urlGoc: string): Promise<Review[]> {
  if (!urlGoc) return [];
  try {
    const response = await api.get<Review[]>(
      `/reviews?url=${encodeURIComponent(urlGoc)}`
    );
    return response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch reviews:", describeError(error));
    return [];
  }
}

/** Aspect-level AI digest of a restaurant's reviews. */
export async function getReviewInsights(
  urlGoc: string,
  lang: "vi" | "en" = "vi"
): Promise<ReviewInsights | null> {
  if (!urlGoc) return null;
  try {
    const response = await api.get<ReviewInsights>(
      `/reviews/insights?url=${encodeURIComponent(urlGoc)}&lang=${lang}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch review insights:", describeError(error));
    return null;
  }
}

export async function createReview(reviewData: {
  tenQuan: string;
  urlGoc: string;
  diemReview: number;
  noiDung: string;
}): Promise<Review> {
  const response = await api.post<Review>("/reviews", reviewData);
  return response.data;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string) {
  const response = await api.post<AuthTokens>("/auth/login", {
    email,
    password,
  });
  tokenStore.save(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

export async function register(
  username: string,
  email: string,
  password: string
) {
  const response = await api.post<AuthTokens>("/auth/register", {
    username,
    email,
    password,
  });
  tokenStore.save(response.data.accessToken, response.data.refreshToken);
  return response.data;
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // Even if the server call fails, the local session must still end.
  } finally {
    tokenStore.clear();
  }
}

export async function getProfile() {
  const response = await api.get("/auth/profile");
  return response.data;
}

export async function updateProfile(payload: Record<string, unknown>) {
  const response = await api.patch("/auth/profile", payload);
  return response.data;
}

/**
 * Human-readable message from an API error.
 *
 * Nest validation failures put an array of messages in `message`; showing the
 * raw object gave users "[object Object]".
 */
export function describeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "Máy chủ phản hồi chậm, vui lòng thử lại.";
    }
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    if (!error.response) return "Không thể kết nối tới máy chủ.";
    return error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

export default api;
