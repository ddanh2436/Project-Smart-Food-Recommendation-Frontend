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
import { formatRating, ratingPercent, toFiveScale } from "@/app/lib/rating";
import { cuisineTags, parseTags } from "@/app/lib/restaurant";
import { useGeolocation } from "@/app/hooks/useGeolocation";

import ReviewOverview from "@/components/ReviewOverview/ReviewOverview";
import ReviewAspects from "@/components/ReviewAspects/ReviewAspects";
import ReviewList from "@/components/RestaurantDetail/ReviewList";
import SimilarPlaces from "@/components/RestaurantDetail/SimilarPlaces";
import AskAboutPlace from "@/components/RestaurantDetail/AskAboutPlace";
import { StarDisplay, StarInput } from "@/components/RestaurantDetail/StarRating";
import {
  AmenityTags,
  DistanceLine,
  OpenStatusBadge,
  QuickActions,
} from "@/components/RestaurantDetail/InfoPanels";

import "./RestaurantDetail.css";
import "@/components/RestaurantDetail/RestaurantDetail.css";

// Leaflet touches `window` on import, so it must stay out of the server bundle.
const RoutingMap = dynamic(
  () => import("@/components/RoutingMap/RoutingMap"),
  {
    ssr: false,
    loading: () => <div className="map-loading">Đang tải bản đồ...</div>,
  }
);

/** The five detailed criteria, still scored 0–10 in the data. */
const CRITERIA = [
  { key: "diemChatLuong", label: "Chất lượng" },
  { key: "diemViTri", label: "Vị trí" },
  { key: "diemKhongGian", label: "Không gian" },
  { key: "diemPhucVu", label: "Phục vụ" },
  { key: "diemGiaCa", label: "Giá cả" },
] as const;

function RatingBar({ label, score }: { label: string; score?: number }) {
  return (
    <div className="rating-bar-item">
      <div className="rating-bar-header">
        <span className="r-label">{label}</span>
        {/* Shown on the same five-point scale as everything else on the page;
            the bar still fills from the stored 0–10 value. */}
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

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [insights, setInsights] = useState<ReviewInsightsData | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  // Review form. Held on the five-point scale the input uses, and doubled back
  // to the stored 0–10 scale only when submitting.
  const [comment, setComment] = useState("");
  const [stars, setStars] = useState(5);
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
          // whole page on a cold AI service.
          if (fetched.length > 0) {
            setInsightsLoading(true);
            getReviewInsights(data.urlGoc)
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
  }, [id]);

  const handleSubmit = async () => {
    const text = comment.trim();
    if (!text) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }
    if (text.length < 10) {
      toast.error("Đánh giá cần ít nhất 10 ký tự để AI phân tích chính xác.");
      return;
    }
    if (text.length > 3000) {
      toast.error("Đánh giá quá dài (tối đa 3000 ký tự).");
      return;
    }
    if (!restaurant?.urlGoc) {
      toast.error("Thiếu dữ liệu nhà hàng, không thể lưu đánh giá.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await createReview({
        tenQuan: restaurant.tenQuan,
        urlGoc: restaurant.urlGoc,
        // The API stores 0–10; the form collects 0–5.
        diemReview: Math.round(stars * 2),
        noiDung: text,
      });
      setReviews((prev) => [created, ...prev]);
      setComment("");
      setStars(5);
      toast.success("Cảm ơn bạn! Đánh giá đã được ghi nhận.");
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-screen">Đang tải dữ liệu nhà hàng...</div>;
  }
  if (!restaurant) {
    return <div className="loading-screen">Không tìm thấy nhà hàng này.</div>;
  }

  const tags = parseTags(restaurant.tags);
  const dishes = cuisineTags(tags);
  const fiveScore = toFiveScale(restaurant.diemTrungBinh);

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
                {/* One scale across the whole page: header, criteria, reviews
                    and the review form all read out of five. */}
                <span className="hero-score">{formatRating(restaurant.diemTrungBinh)}</span>
                <StarDisplay value={fiveScore ?? 0} size={18} />
                {restaurant.reviewCount ? (
                  <span className="hero-review-count">
                    {restaurant.reviewCount} đánh giá
                  </span>
                ) : null}
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
              <h2 className="section-heading">Thông tin chung</h2>

              <div className="info-row">
                <div className="info-icon">
                  <FaMoneyBillWave />
                </div>
                <div>
                  <span className="info-label">Mức giá</span>
                  <span>{restaurant.giaCa || "Đang cập nhật"}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon">
                  <FaRegClock />
                </div>
                <div>
                  <span className="info-label">Giờ mở cửa</span>
                  <span>{restaurant.gioMoCua || "Đang cập nhật"}</span>
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
              <h2 className="section-heading">Chi tiết đánh giá</h2>
              {CRITERIA.map(({ key, label }) => (
                <RatingBar
                  key={key}
                  label={label}
                  score={restaurant[key] as number | undefined}
                />
              ))}
            </div>
          </aside>
        </div>

        {/* ------------------------------ Map ------------------------------ */}
        <section className="map-section" id="map-section">
          <div className="map-head">
            <h2 className="section-heading">Vị trí &amp; chỉ đường</h2>
            <button
              type="button"
              className="btn-toggle-map"
              onClick={() => setShowMap((open) => !open)}
            >
              {showMap ? "Ẩn bản đồ" : "Hiện bản đồ"}
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
              <p className="map-missing">
                Quán này chưa có toạ độ nên không thể chỉ đường.
              </p>
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
                Nhấn để xem bản đồ và đường đi
              </span>
            </button>
          )}
        </section>

        {/* ---------------------------- Reviews ---------------------------- */}
        <section className="reviews-container">
          <h2 className="section-heading">
            Đánh giá từ cộng đồng ({reviews.length})
          </h2>

          <div className="write-review-box">
            <h3>Viết đánh giá của bạn</h3>
            <div className="rating-select-row">
              <span className="rating-select-label">Chấm điểm:</span>
              {/* Five stars with halves, replacing a row of ten that was hard
                  to hit accurately on a phone. */}
              <StarInput value={stars} onChange={setStars} />
            </div>

            <textarea
              className="review-textarea"
              placeholder="Chia sẻ trải nghiệm của bạn về món ăn, không gian, phục vụ..."
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
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </div>

          <ReviewOverview reviews={reviews} />
          <ReviewAspects data={insights} loading={insightsLoading} />
          <ReviewList reviews={reviews} />
        </section>

        <SimilarPlaces restaurantId={restaurant._id} district={tags[1]} />
      </div>
    </div>
  );
}
