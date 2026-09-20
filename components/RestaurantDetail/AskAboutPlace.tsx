"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaRobot } from "react-icons/fa";
import type { Restaurant } from "@/app/lib/api";
import { cuisineTags, parseTags } from "@/app/lib/restaurant";

/**
 * Quick questions about this specific restaurant.
 *
 * The assistant searches the whole collection rather than answering about one
 * document, so each chip is phrased as a search that is genuinely answerable
 * from the data — "quán chay ở Quận 1", "quán này có máy lạnh không" becomes
 * a search for air-conditioned places nearby. Asking it to invent facts about
 * this restaurant's menu would only produce confident nonsense, since there is
 * no menu in the database.
 */
export default function AskAboutPlace({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  const router = useRouter();
  const tags = parseTags(restaurant.tags);
  const district = tags[1] ?? "";
  const dish = cuisineTags(tags)[0] ?? "";

  const prompts = [
    dish && district
      ? `${dish} ngon ở ${district}`
      : dish
        ? `${dish} ngon`
        : "Quán ngon gần đây",
    district ? `Quán ${district} phù hợp hẹn hò` : "Quán phù hợp hẹn hò",
    dish ? `${dish} rẻ dưới 100k` : "Quán ăn rẻ dưới 100k",
    district ? `Quán ăn gia đình ở ${district}` : "Quán ăn cho gia đình",
  ].filter(Boolean) as string[];

  const ask = (question: string) => {
    // The full chat page accepts an opening question on the query string, so
    // the chip lands the user in a conversation rather than an empty box.
    router.push(`/chatbot?q=${encodeURIComponent(question)}`);
  };

  return (
    <section className="ask-ai-box">
      <div className="ask-ai-head">
        <span className="ask-ai-icon" aria-hidden="true">
          <FaRobot />
        </span>
        <div>
          <h3 className="ask-ai-title">Hỏi NomNom Assistant</h3>
          <p className="ask-ai-sub">
            Tìm quán tương tự, so sánh giá hoặc lọc theo nhu cầu của bạn
          </p>
        </div>
      </div>

      <div className="ask-ai-chips">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            className="ask-ai-chip"
            onClick={() => ask(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}
