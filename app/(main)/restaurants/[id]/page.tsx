"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaMoneyBillWave, FaRegClock } from "react-icons/fa";

import {
  getRestaurantById,
  getReviewsByUrl,
  getReviewInsights,
  createReview,
  describeError,
  type Restaurant,
  type Review,
  type ReviewInsights as ReviewInsightsData,
} from "@/app/lib/api";
import {
  RATING_MAX,
  formatRating,
  formatReviewCount,
  ratingPercent,
} from "@/app/lib/rating";
import { cuisineTags, parseTags } from "@/app/lib/restaurant";
import { useGeolocation } from "@/app/hooks/useGeolocation";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import axios from "axios";

import ReviewOverview from "@/components/ReviewOverview/ReviewOverview";
import ReviewAspects from "@/components/ReviewAspects/ReviewAspects";
import ReviewList from "@/components/RestaurantDetail/ReviewList";
import SimilarPlaces from "@/components/RestaurantDetail/SimilarPlaces";
import AskAboutPlace from "@/components/RestaurantDetail/AskAboutPlace";
import { ScoreInput } from "@/components/Score/Score";
import {
  AmenityTags,
  DistanceLine,
  OpenStatusBadge,
  QuickActions,
} from "@/components/RestaurantDetail/InfoPanels";

import "./RestaurantDetail.css";
import "@/components/RestaurantDetail/RestaurantDetail.css";

// Leaflet touches `window` on import, so it must stay out of the server bundle.
// The placeholder carries no words: it renders before this component's language
// is known.
const RoutingMap = dynamic(() => import("@/components/RoutingMap/RoutingMap"), {
  ssr: false,
  loading: () => (
    <div className="map-inline-loading" role="status" aria-label="Loading map">
      <span className="map-inline-spinner" />
    </div>
  ),
});

/** The five detailed criteria, all scored 0–10 like every other score here. */
const CRITERIA = [
  { key: "diemChatLuong", labelKey: "quality" },
  { key: "diemViTri", labelKey: "location" },
  { key: "diemKhongGian", labelKey: "space" },
  { key: "diemPhucVu", labelKey: "service" },
  { key: "diemGiaCa", labelKey: "price" },
] as const;

function RatingBar({ label, score }: { label: string; score?: number }) {
  return (
    <div className="rating-bar-item">
      <div className="rating-bar-header">
        <span className="r-label">{label}</span>
        <span className="r-score">{formatRating(score)}</span>
      </div>
      <div className="progress-bg">
        <div
          className="progress-fill"
          style={{ width: `${ratingPercent(score)}%` }}
        />
      </div>
    </div>
  );
}

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const { coords } = useGeolocation();
  const { t, lang } = useTranslation();
  const { user, isLoading: authLoading, openAuth } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [insights, setInsights] = useState<ReviewInsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  // Review form. Held on the 0–10 scale the API stores, so nothing is converted
  // on the way in or out.
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(9);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const data = await getRestaurantById(id as string);
        if (cancelled) return;
        setRestaurant(data);

        if (data?.urlGoc) {
          const fetched = await getReviewsByUrl(data.urlGoc);
          if (cancelled) return;
          setReviews(fetched);

          // Loaded after the page is interactive: the digest runs sentiment
          // inference over every review, so awaiting it inline would hold the
          // whole page on a cold AI service. `lang` reaches the AI service, so
          // the aspect labels and the headline come back in the language the
          // rest of the page is in.
          if (fetched.length > 0) {
            setInsightsLoading(true);
            getReviewInsights(data.urlGoc, lang)
              .then((result) => !cancelled && setInsights(result))
              .finally(() => !cancelled && setInsightsLoading(false));
          }
        }
      } catch (error) {
        console.error("Error loading restaurant:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, lang]);

  const handleSubmit = async () => {
    const text = comment.trim();
    if (!text) {
      toast.error(t.reviews.errEmpty);
      return;
    }
    if (text.length < 10) {
      toast.error(t.reviews.errShort);
      return;
    }
    if (text.length > 3000) {
      toast.error(t.reviews.errLong);
      return;
    }
    if (!restaurant?.urlGoc) {
      toast.error(t.reviews.errMissing);
      return;
    }

    setSubmitting(true);
    try {
      const created = await createReview({
        tenQuan: restaurant.tenQuan,
        urlGoc: restaurant.urlGoc,
        diemReview: score,
        noiDung: text,
      });
      setReviews((prev) => [created, ...prev]);
      setComment("");
      setScore(9);
      toast.success(t.reviews.thanks);
    } catch (error) {
      // The server's own wording is English; these two cases are expected
      // outcomes rather than faults, so they get the interface's language.
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status === 409) toast.error(t.reviews.errAlreadyReviewed);
      else if (status === 401) toast.error(t.reviews.loginToReview);
      else toast.error(describeError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">{t.detail.loading}</div>;
  }
  if (!restaurant) {
    return <div className="loading-screen">{t.detail.notFound}</div>;
  }

  const tags = parseTags(restaurant.tags);
  const dishes = cuisineTags(tags);

  return (
    <div className="detail-page-wrapper">
      <div className="container">
        {/* ------------------------------ Hero ----------------------------- */}
        <header className="detail-hero">
          <Image
            src={restaurant.avatarUrl || "/assets/image/pho.png"}
            alt={restaurant.tenQuan}
            width={1600}
            height={700}
            className="detail-hero-img"
            unoptimized
            priority
          />
          <div className="hero-overlay">
            <div className="hero-content">
              {dishes.length > 0 && (
                <p className="hero-kicker">{dishes.slice(0, 3).join(" · ")}</p>
              )}
              <h1>{restaurant.tenQuan}</h1>

              <div className="hero-rating">
                {/* One scale across the whole page — header, criteria, reviews
                    and the review form all read out of ten, which is what the
                    database stores and what the filters on the listing page
                    already asked for. */}
                <span className="hero-score">
                  {formatRating(restaurant.diemTrungBinh)}
                </span>
                <span className="hero-score-scale">/{RATING_MAX}</span>
                {formatReviewCount(restaurant.reviewCount, lang) && (
                  <span className="hero-review-count">
                    {formatReviewCount(restaurant.reviewCount, lang)}
                  </span>
                )}
              </div>

              <p className="hero-address">
                <FaMapMarkerAlt /> {restaurant.diaChi}
              </p>

              <div className="hero-status">
                <OpenStatusBadge hours={restaurant.gioMoCua} />
              </div>

              <DistanceLine restaurant={restaurant} coords={coords} />

              <QuickActions
                restaurant={restaurant}
                coords={coords}
                onShowMap={() => {
                  setShowMap(true);
                  document
                    .getElementById("map-section")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
              />
            </div>
          </div>
        </header>

        {/* --------------------------- Information -------------------------- */}
        {/* No tab bar above this: the page shows both panels side by side, and
            an underlined tab strip over a split layout implied the two were
            alternatives rather than both already visible. */}
        <div className="detail-content">
          <section className="left-col">
            <div className="info-box">
              <h2 className="section-heading">{t.detail.generalInfo}</h2>

              <div className="info-row">
                <div className="info-icon">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <span className="info-label">{t.detail.priceLabel}</span>
                  <span>{restaurant.giaCa || t.common.updating}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon">
                  <FaRegClock />
                </div>
                <div>
                  <span className="info-label">{t.detail.hoursLabel}</span>
                  <span>{restaurant.gioMoCua || t.common.updating}</span>
                </div>
              </div>

              {/* The raw coordinate pair that used to sit here told a diner
                  nothing; the map and the directions button do the job. */}
              <AmenityTags tags={tags} />
            </div>

            <AskAboutPlace restaurant={restaurant} />
          </section>

          <aside className="right-col">
            <div className="rating-box">
              <h2 className="section-heading">
                {t.detail.ratingBreakdown}{" "}
                <span className="section-scale">({t.detail.outOfTen})</span>
              </h2>
              {CRITERIA.map(({ key, labelKey }) => (
                <RatingBar
                  key={key}
                  label={t.restaurantPage.labels[labelKey]}
                  score={restaurant[key] as number | undefined}
                />
              ))}
            </div>
          </aside>
        </div>

        {/* ------------------------------ Map ------------------------------ */}
        <section className="map-section" id="map-section">
          <div className="map-head">
            <h2 className="section-heading">{t.detail.locationHeading}</h2>
            <button
              type="button"
              className="btn-toggle-map"
              onClick={() => setShowMap((open) => !open)}
            >
              {showMap ? t.detail.hideMap : t.detail.showMap}
            </button>
          </div>

          {showMap ? (
            restaurant.lat && restaurant.lon ? (
              <div className="map-frame">
                <RoutingMap
                  userLocation={coords}
                  restaurantLocation={{
                    lat: restaurant.lat,
                    lon: restaurant.lon,
                  }}
                />
              </div>
            ) : (
              <p className="map-missing">{t.detail.mapMissing}</p>
            )
          ) : (
            <button
              type="button"
              className="map-preview"
              onClick={() => setShowMap(true)}
            >
              <span className="map-preview-pin">
                <FaMapMarkerAlt />
              </span>
              <span>
                <strong>{restaurant.diaChi}</strong>
                <br />
                {t.detail.mapPreviewHint}
              </span>
            </button>
          )}
        </section>

        {/* ---------------------------- Reviews ---------------------------- */}
        <section className="reviews-container">
          <h2 className="section-heading">
            {t.reviews.heading} ({reviews.length})
          </h2>

          {/* Reviews need an account now: each one moves the adjusted score
              that orders the listings, so anonymous posting was a lever
              anyone could pull. Signed-out readers get a way in instead. */}
          {!authLoading && !user ? (
            <div className="write-review-box">
              <h3>{t.reviews.writeTitle}</h3>
              <p className="review-login-hint">{t.reviews.loginToReview}</p>
              {/* A dialog, not a link to /auth: the review goes on this page. */}
              <button type="button" className="btn-submit-review" onClick={() => openAuth()}>
                {t.reviews.loginButton}
              </button>
            </div>
          ) : (
          <div className="write-review-box">
            <h3>{t.reviews.writeTitle}</h3>
            <div className="rating-select-row">
              <span className="rating-select-label">{t.reviews.scoreLabel}</span>
              {/* Numbered 1–10, the scale the review is stored on. */}
              <ScoreInput value={score} onChange={setScore} />
            </div>

            <textarea
              className="review-textarea"
              placeholder={t.reviews.placeholder}
              rows={4}
              maxLength={3000}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />

            <div className="review-actions">
              <span className="review-counter">{comment.length}/3000</span>
              <button
                type="button"
                className="btn-submit-review"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? t.reviews.submitting : t.reviews.submit}
              </button>
            </div>
          </div>
          )}

          <ReviewOverview reviews={reviews} />
          <ReviewAspects data={insights} loading={insightsLoading} />
          <ReviewList reviews={reviews} />
        </section>

        <SimilarPlaces restaurantId={restaurant._id} district={tags[1]} />
      </div>
    </div>
  );
}
