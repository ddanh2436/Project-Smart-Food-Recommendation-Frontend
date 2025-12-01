"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getRestaurantById, getReviewsByUrl } from "@/app/lib/api";
import "./RestaurantDetail.css";

// --- ICONS ---
const MapIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MoneyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const GlobeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const LinkIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;
const StarIcon = ({ filled }: { filled?: boolean }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#f97316" : "none"} stroke={filled ? "#f97316" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

// Icon người dùng ẩn danh
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
  </svg>
);

interface RestaurantDetail {
  _id: string;
  tenQuan: string;
  diaChi: string;
  gioMoCua: string;
  giaCa: string;
  diemTrungBinh: number;
  avatarUrl: string;
  urlGoc: string;
  lat: number;
  lon: number;
  diemKhongGian: number;
  diemViTri: number;
  diemChatLuong: number;
  diemPhucVu: number;
  diemGiaCa: number;
}

interface Review {
  _id: string;
  tenQuan: string;
  urlGoc: string;
  diemReview: number;
  noiDung: string;
}

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [res, setRes] = useState<RestaurantDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const restaurantData = await getRestaurantById(id as string);
        setRes(restaurantData);

        if (restaurantData && restaurantData.urlGoc) {
          const reviewsData = await getReviewsByUrl(restaurantData.urlGoc);
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="loading-screen">Đang tải dữ liệu nhà hàng...</div>;
  if (!res) return <div className="loading-screen">Không tìm thấy nhà hàng này.</div>;

  return (
    <div className="detail-page-wrapper">
      <div className="container">
        
        {/* --- HERO SECTION --- */}
        <div className="detail-hero">
          <Image 
            src={res.avatarUrl || "/assets/image/pho.png"} 
            alt={res.tenQuan || "Restaurant Image"} 
            width={1200} height={600} 
            className="detail-hero-img"
            unoptimized={true}
          />
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>{res.tenQuan}</h1>
              <div className="hero-rating">
                <div className="hero-score">
                  {res.diemTrungBinh ? res.diemTrungBinh.toFixed(1) : "N/A"}
                </div>
                <div className="hero-address">
                  <MapIcon /> {res.diaChi}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN INFO GRID --- */}
        <div className="detail-content">
          <div className="left-col">
            <div className="info-box">
              <h3 className="section-heading">Thông tin chung</h3>
              <div className="info-row">
                <div className="info-icon"><MoneyIcon /></div>
                <div>
                  <span className="info-label">Mức giá:</span>
                  <span>{res.giaCa || "Đang cập nhật"}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon"><ClockIcon /></div>
                <div>
                  <span className="info-label">Giờ mở cửa:</span>
                  <span>{res.gioMoCua || "Đang cập nhật"}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-icon"><GlobeIcon /></div>
                <div>
                  <span className="info-label">Tọa độ GPS:</span>
                  <span>{res.lat && res.lon ? `${res.lat}, ${res.lon}` : "Chưa có tọa độ"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="right-col">
            <div className="rating-box">
              <h3>Chi tiết đánh giá</h3>
              <RatingBar label="Chất lượng" score={res.diemChatLuong} />
              <RatingBar label="Vị trí" score={res.diemViTri} />
              <RatingBar label="Không gian" score={res.diemKhongGian} />
              <RatingBar label="Phục vụ" score={res.diemPhucVu} />
              <RatingBar label="Giá cả" score={res.diemGiaCa} />

              {res.urlGoc && (
                <a href={res.urlGoc} target="_blank" rel="noopener noreferrer" className="btn-foody">
                   Xem trên Foody <LinkIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* --- REVIEW SECTION --- */}
        <div className="reviews-container">
          <h3 className="section-heading">
            Đánh giá từ cộng đồng ({reviews.length})
          </h3>

          <div className="reviews-list">
            {reviews.length > 0 ? (
              // [UPDATE] Sử dụng ReviewItem thay vì render trực tiếp
              reviews.map((review, index) => (
                <ReviewItem key={index} review={review} />
              ))
            ) : (
              <div className="no-reviews">
                <p>Chưa có bình luận nào được thu thập cho nhà hàng này.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

const RatingBar = ({ label, score }: { label: string, score: number }) => (
  <div className="rating-bar-item">
    <div className="rating-bar-header">
      <span className="r-label">{label}</span>
      <span className="r-score">
        {(score !== undefined && score !== null) ? score.toFixed(1) : "-"}
      </span>
    </div>
    <div className="progress-bg">
      <div className="progress-fill" style={{ width: `${(score || 0) * 10}%` }}></div>
    </div>
  </div>
);

// [MỚI] Component xử lý việc Xem thêm / Thu gọn
const ReviewItem = ({ review }: { review: Review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Ngưỡng ký tự để cắt bớt. Ví dụ: dài hơn 150 ký tự thì cắt.
  const CHARACTER_LIMIT = 150;
  const isLongText = review.noiDung && review.noiDung.length > CHARACTER_LIMIT;

  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-avatar">
          <UserIcon />
        </div>
        <div className="review-meta">
          <span className="review-author">Thực khách Foody</span>
          <div className="review-score-badge">
            <span>{review.diemReview}</span> <StarIcon filled />
          </div>
        </div>
      </div>
      <div className="review-body">
        {/* Logic hiển thị text */}
        <p className={!isExpanded && isLongText ? "review-text-truncated" : "review-text-full"}>
          "{review.noiDung}"
        </p>
        
        {/* Nút Xem thêm / Thu gọn */}
        {isLongText && (
          <button 
            className="btn-read-more" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>
    </div>
  );
};