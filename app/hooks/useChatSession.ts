"use client";

import { useCallback, useRef, useState } from "react";
import {
  chatWithBot,
  searchRestaurantsByImage,
  type ChatChip,
  type ChatTurn,
  type ImageSearchResult,
  type Restaurant,
} from "@/app/lib/api";
import { useGeolocation, type Coords } from "@/app/hooks/useGeolocation";
import { useTranslation } from "@/app/hooks/useTranslation";
import type { Dict } from "@/app/lib/i18n";

export interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  results?: Restaurant[];
  imageUrl?: string;
  /** Reply category from the API: results | need_location | not_found | ... */
  kind?: string;
  /** Set on a bot message whose request failed, so the turn can be retried. */
  failedQuery?: string;
  /**
   * Quick replies that narrow the search, composed by the assistant from what
   * the question left unset. Each carries a complete follow-up query, so
   * tapping "Phở" after "quán ở Quận 1" asks for "Phở ở Quận 1".
   */
  chips?: ChatChip[];
}

/**
 * Starter prompts, in the language showing.
 *
 * They double as documentation: price caps, areas and exclusions are all
 * supported but were invisible behind a placeholder that only said
 * "Nhập tên món...". The English set keeps the Vietnamese dish names
 * transliterated rather than translated, because they are what the assistant
 * searches for.
 */
/**
 * Suggested questions, led by the user's own tastes when they set some on
 * their profile: "Phở ngon ở Hà Nội" rather than the generic list. The
 * favourite tags are real tags in the data, so these are questions the
 * assistant can answer.
 */
export function chatSuggestions(
  t: Dict,
  prefs?: { favoriteTags?: string[]; homeCity?: string } | null,
): string[] {
  const tags = prefs?.favoriteTags ?? [];
  if (tags.length === 0) return t.chat.suggestions;
  const city = prefs?.homeCity ? t.profile.cities[prefs.homeCity] : undefined;
  const personal = tags
    .slice(0, 3)
    .map((tag) => (city ? `${tag} ${t.chat.inCity} ${city}` : `${tag} ${t.chat.nearMe}`));
  return [...personal, ...t.chat.suggestions].slice(0, 5);
}

function makeGreeting(t: Dict): ChatMessage[] {
  const greetings = t.chat.greetings;
  return [
    {
      id: 1,
      sender: "bot",
      text: greetings[Math.floor(Math.random() * greetings.length)],
      kind: "greeting",
    },
  ];
}

/**
 * Word a photo recognition according to how much the model actually knows.
 *
 * The model recognises five dishes, so most photos of Vietnamese food fall
 * short of a confident answer. Every one of those used to get the same dead
 * end — "could not identify the dish", no results, nothing to do next — which
 * left the user unable to tell a bad photo from an unsupported dish. Now the
 * reply matches the tier, and every tier below `confident` offers dishes to
 * tap, so there is always a way forward.
 */
function describeImageResult(
  result: ImageSearchResult | null,
  t: Dict
): Pick<ChatMessage, "text" | "results" | "kind" | "chips"> {
  const chips = (result?.suggestions ?? []).map((dish) => ({
    label: dish,
    query: dish,
  }));

  if (!result || result.tier === "none" || (!result.detectedFood && !result.tier)) {
    return { text: t.chat.imageUnclear, kind: "not_found", chips };
  }

  if (result.tier === "group") {
    const text =
      result.group === "dry" ? t.chat.imageGroupDry : t.chat.imageGroupSoup;
    return { text, kind: "not_found", chips };
  }

  if (result.tier === "uncertain" && result.detectedFood) {
    return {
      text: `${t.chat.imageMaybe} **${result.detectedFood}** ${t.chat.imageMaybeSuffix}`,
      results: result.data,
      kind: "results",
      chips,
    };
  }

  if (result.detectedFood) {
    return {
      text: `${t.chat.detectedPrefix} **${result.detectedFood}** ${t.chat.detectedSuffix}`,
      results: result.data,
      kind: "results",
    };
  }

  return { text: t.chat.imageUnclear, kind: "not_found", chips };
}

/**
 * Conversation state shared by the floating widget and the full chat page.
 *
 * The two surfaces each had their own copy of this logic — greetings, history
 * assembly, image upload, error handling — which is exactly how the two
 * language systems drifted apart earlier in this codebase. One implementation
 * means a fix lands in both places.
 */
export function useChatSession() {
  // The language is the app's, not a per-surface constant. Both chat surfaces
  // used to hardcode "vi", so the assistant answered in Vietnamese even with
  // the interface in English — although the API and the AI service have
  // accepted `lang` from the start.
  const { lang, t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>(() => makeGreeting(t));
  const [loading, setLoading] = useState(false);
  const { coords, status: geoStatus, request: requestLocation } =
    useGeolocation();

  // Read through a ref so `send` does not need `messages` as a dependency,
  // which would rebuild the callback on every single message.
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const append = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const send = useCallback(
    async (rawText: string, overrideCoords?: Coords | null) => {
      const text = rawText.trim();
      if (!text) return;

      append({ id: Date.now(), sender: "user", text });
      setLoading(true);

      // Only real conversational turns become history; image placeholders
      // would just be noise to the assistant.
      const history: ChatTurn[] = messagesRef.current
        .filter((m) => m.text && !m.imageUrl)
        .map((m) => ({ role: m.sender, text: m.text }));

      const reply = await chatWithBot(text, {
        history,
        coords: overrideCoords !== undefined ? overrideCoords : coords,
        lang,
      });
      setLoading(false);

      append(
        reply
          ? {
              id: Date.now() + 1,
              sender: "bot",
              text: reply.reply,
              results: reply.results,
              kind: reply.kind,
              chips: reply.chips,
            }
          : {
              id: Date.now() + 1,
              sender: "bot",
              text: t.chat.offline,
              kind: "error",
              failedQuery: text,
            }
      );
    },
    [append, coords, lang, t]
  );

  const sendImage = useCallback(
    async (file: File) => {
      const previewUrl = URL.createObjectURL(file);
      append({
        id: Date.now(),
        sender: "user",
        text: t.chat.sentPhoto,
        imageUrl: previewUrl,
      });
      setLoading(true);

      try {
        const result = await searchRestaurantsByImage(file, coords ?? undefined);
        append({ id: Date.now() + 1, sender: "bot", ...describeImageResult(result, t) });
      } catch {
        append({
          id: Date.now() + 1,
          sender: "bot",
          text: t.chat.imageError,
          kind: "error",
        });
      } finally {
        setLoading(false);
        URL.revokeObjectURL(previewUrl);
      }
    },
    [append, coords, t]
  );

  /**
   * Grant location, then re-run the question that needed it.
   *
   * The coordinates are passed straight into `send` rather than read from
   * state, because `requestLocation` resolves asynchronously and the hook's
   * `coords` would still be null on the next render.
   */
  const enableLocationAndRetry = useCallback(() => {
    requestLocation();
    const lastUser = [...messagesRef.current]
      .reverse()
      .find((m) => m.sender === "user");
    if (!lastUser) return;

    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) =>
        void send(lastUser.text, {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        }),
      // Denied or unavailable: re-asking without coordinates would just repeat
      // the same "I need your location" answer, so leave the conversation be.
      () => undefined,
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 }
    );
  }, [requestLocation, send]);

  const reset = useCallback(() => setMessages(makeGreeting(t)), [t]);

  return {
    lang,
    t,
    messages,
    loading,
    coords,
    geoStatus,
    send,
    sendImage,
    enableLocationAndRetry,
    reset,
  };
}
