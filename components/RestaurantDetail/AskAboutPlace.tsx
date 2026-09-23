"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaRobot, FaSearch } from "react-icons/fa";
import type { Restaurant } from "@/app/lib/api";
import { formatRating } from "@/app/lib/rating";
import { cuisineTags, parseTags, placeLabel, tagLabel } from "@/app/lib/restaurant";
import { useTranslation } from "@/app/hooks/useTranslation";

type Aspect = "food" | "price" | "service" | "space" | "hygiene" | "parking";
type Question = Aspect | "goodFor" | "hours";

/** The criterion score that goes with each reviewed aspect, where there is one. */
const ASPECT_SCORE: Partial<Record<Aspect, keyof Restaurant>> = {
  food: "diemChatLuong",
  price: "diemGiaCa",
  service: "diemPhucVu",
  space: "diemKhongGian",
};

const GOOD_FOR = ["Hẹn hò", "Gia đình", "Trẻ em", "Nhóm hội", "Tụ tập", "Tiếp khách", "Nhậu", "Cơm văn phòng"];

/**
 * Questions about this restaurant, answered from its own record.
 *
 * The chips used to be searches for *other* places ("phở ngon ở Quận 1"),
 * sent to the assistant, which searches the whole collection and cannot
 * answer about one document. A diner on this page wants to know about this
 * place: is the food praised, is there parking, is it good for a date. Each
 * of those has an answer in the data — the aspect verdicts drawn from the
 * reviews, the criterion scores, the tags, the hours and the price — so the
 * answer is shown here at once, and says so when the data does not cover it
 * rather than guessing. Searching for similar places stays, underneath.
 */
export default function AskAboutPlace({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const { t, lang } = useTranslation();
  const A = t.detail.ask;
  const [open, setOpen] = useState<Question | null>(null);

  const tags = parseTags(restaurant.tags);
  const district = tags[1] ?? "";
  const dish = cuisineTags(tags)[0] ?? "";

  const answer = (question: Question): string => {
    if (question === "hours") {
      return restaurant.gioMoCua
        ? `${A.hoursAre} ${restaurant.gioMoCua}.${restaurant.giaCa ? ` ${A.priceIs} ${restaurant.giaCa}.` : ""}`
        : A.noHours;
    }
    if (question === "goodFor") {
      const fits = tags.filter((tag) => GOOD_FOR.includes(tag)).map((tag) => tagLabel(tag, lang));
      return fits.length ? `${A.goodForIs} ${fits.join(", ")}.` : A.noGoodFor;
    }

    const aspectName = t.reviews.aspectLabels[question]?.toLowerCase() ?? question;
    const verdict = restaurant.aspects?.[question];
    const scoreField = ASPECT_SCORE[question];
    const score = scoreField ? (restaurant[scoreField] as number | undefined) : undefined;
    const scoreText = score ? ` ${A.scoreIs} ${formatRating(score)}/10.` : "";

    if (!verdict || verdict.mentions < 3) {
      return `${A.notEnough.replace("{aspect}", aspectName)}${scoreText}`;
    }
    const percent = Math.round(verdict.positive_ratio * 100);
    const lead =
      verdict.verdict === "positive" ? A.praised : verdict.verdict === "negative" ? A.criticised : A.mixed;
    return `${lead.replace("{aspect}", aspectName)} ${A.share
      .replace("{percent}", String(percent))
      .replace("{mentions}", String(verdict.mentions))}${scoreText}`;
  };

  const questions: { key: Question; label: string }[] = [
    { key: "food", label: A.q.food },
    { key: "price", label: A.q.price },
    { key: "service", label: A.q.service },
    { key: "hygiene", label: A.q.hygiene },
    { key: "parking", label: A.q.parking },
    { key: "goodFor", label: A.q.goodFor },
    { key: "hours", label: A.q.hours },
  ];

  /**
   * Searches for other places. The label is in the interface's language; the
   * query stays Vietnamese, because the assistant matches against Vietnamese
   * tags ("Phở", "Quận 1") and an English gloss is a term its data never saw.
   */
  const searches = [
    dish && {
      label: district
        ? `${tagLabel(dish, lang)} · ${placeLabel(district, lang)}`
        : tagLabel(dish, lang),
      query: district ? `${dish} ngon ở ${district}` : `${dish} ngon`,
    },
    dish && { label: `${tagLabel(dish, lang)} ${A.under100k}`, query: `${dish} dưới 100k` },
  ].filter(Boolean) as { label: string; query: string }[];

  return (
    <section className="ask-ai-box">
      <div className="ask-ai-head">
        <span className="ask-ai-icon" aria-hidden="true">
          <FaRobot />
        </span>
        <div>
          <h3 className="ask-ai-title">{A.title}</h3>
          <p className="ask-ai-sub">{A.sub}</p>
        </div>
      </div>

      <div className="ask-ai-chips" role="group" aria-label={A.title}>
        {questions.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`ask-ai-chip ${open === key ? "is-on" : ""}`}
            aria-expanded={open === key}
            onClick={() => setOpen(open === key ? null : key)}
          >
            {label}
          </button>
        ))}
      </div>

      {open && (
        <p className="ask-ai-answer" role="status" key={open}>
          {answer(open)}
        </p>
      )}

      {searches.length > 0 && (
        <div className="ask-ai-more">
          <span className="ask-ai-more-label">
            <FaSearch aria-hidden="true" /> {A.similar}
          </span>
          {searches.map(({ label, query }) => (
            <button
              key={query}
              type="button"
              className="ask-ai-chip ask-ai-chip--search"
              onClick={() => router.push(`/chatbot?q=${encodeURIComponent(query)}`)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
