"use client";

import { useCallback, useRef, useState } from "react";
import {
  chatWithBot,
  searchRestaurantsByImage,
  type ChatTurn,
  type Restaurant,
} from "@/app/lib/api";
import { useGeolocation, type Coords } from "@/app/hooks/useGeolocation";

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
}

export const CHAT_GREETINGS = [
  "Chào bạn! 👋 Hôm nay bạn muốn ăn gì?",
  "VietNomNom xin chào! 🍜 Bạn đang thèm món gì nào?",
  "Hello! 🥘 Mình tìm quán theo món, giá hay khoảng cách đều được.",
];

/**
 * Starter prompts.
 *
 * They double as documentation: price caps, areas and exclusions are all
 * supported but were invisible behind a placeholder that only said
 * "Nhập tên món...".
 */
export const CHAT_SUGGESTIONS = [
  "Phở ngon gần đây",
  "Cơm tấm ở Quận 1",
  "Lẩu dưới 200k",
  "Cà phê yên tĩnh",
  "Hải sản nhưng không cay",
];

export function makeGreeting(): ChatMessage[] {
  return [
    {
      id: 1,
      sender: "bot",
      text: CHAT_GREETINGS[Math.floor(Math.random() * CHAT_GREETINGS.length)],
      kind: "greeting",
    },
  ];
}

/**
 * Conversation state shared by the floating widget and the full chat page.
 *
 * The two surfaces each had their own copy of this logic — greetings, history
 * assembly, image upload, error handling — which is exactly how the two
 * language systems drifted apart earlier in this codebase. One implementation
 * means a fix lands in both places.
 */
export function useChatSession(lang: "vi" | "en" = "vi") {
  const [messages, setMessages] = useState<ChatMessage[]>(makeGreeting);
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
            }
          : {
              id: Date.now() + 1,
              sender: "bot",
              text:
                lang === "en"
                  ? "I couldn't reach the server. Please try again."
                  : "Mình chưa kết nối được tới máy chủ. Bạn thử lại nhé!",
              kind: "error",
              failedQuery: text,
            }
      );
    },
    [append, coords, lang]
  );

  const sendImage = useCallback(
    async (file: File) => {
      const previewUrl = URL.createObjectURL(file);
      append({
        id: Date.now(),
        sender: "user",
        text: lang === "en" ? "Sent a photo" : "Đã gửi một hình ảnh",
        imageUrl: previewUrl,
      });
      setLoading(true);

      try {
        const result = await searchRestaurantsByImage(file, coords ?? undefined);
        append(
          result?.detectedFood
            ? {
                id: Date.now() + 1,
                sender: "bot",
                text:
                  lang === "en"
                    ? `I think this is **${result.detectedFood}** 😋 Here are the best places for it:`
                    : `Mình đoán đây là món **${result.detectedFood}** 😋 Dưới đây là các quán ngon nhất:`,
                results: result.data,
                kind: "results",
              }
            : {
                id: Date.now() + 1,
                sender: "bot",
                text:
                  lang === "en"
                    ? "That photo is hard to read. Try a clearer shot, or type the dish name 🤔"
                    : "Ảnh hơi khó nhận diện. Bạn chụp rõ hơn hoặc gõ tên món giúp mình nhé! 🤔",
                kind: "not_found",
              }
        );
      } catch {
        append({
          id: Date.now() + 1,
          sender: "bot",
          text:
            lang === "en"
              ? "Something went wrong reading that image."
              : "Lỗi khi xử lý ảnh. Bạn thử lại sau nhé!",
          kind: "error",
        });
      } finally {
        setLoading(false);
        URL.revokeObjectURL(previewUrl);
      }
    },
    [append, coords, lang]
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

  const reset = useCallback(() => setMessages(makeGreeting()), []);

  return {
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
