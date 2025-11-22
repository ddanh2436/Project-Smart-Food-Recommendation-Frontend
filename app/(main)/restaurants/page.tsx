// app/(main)/restaurants/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getAllRestaurants } from "@/app/lib/api";
import "./RestaurantsPage.css";

// Icons
const ClockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MoneyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

interface Restaurant {
  _id: string;
  tenQuan: string;
  diaChi: string;
  gioMoCua: string;
  giaCa: string;
  diemTrungBinh: number;
  avatarUrl: string;
  diemKhongGian: number;
  diemViTri: number;
  diemChatLuong: number;
  diemPhucVu: number;
  diemGiaCa: number;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRes, setSelectedRes] = useState<Restaurant | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllRestaurants();
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Modal Handlers
  const openModal = (res: Restaurant) => {
    setSelectedRes(res);
    document.body.style.overflow = 'hidden';
  };
  const closeModal = () => {
    setSelectedRes(null);
    document.body.style.overflow = 'unset';
  };

  return (
    <div className="restaurants-page-wrapper">
      <div className="container">
        
        <div className="page-header">
          <h1 className="page-title">Khám phá Nhà hàng</h1>
          <p className="page-subtitle">Bộ sưu tập những địa điểm ẩm thực tốt nhất</p>
        </div>

        {loading ? (
          <div className="loading-container">Đang tải dữ liệu...</div>
        ) : (
          <div className="restaurants-grid">
            {restaurants.map((res) => (
              <div 
                key={res._id} 
                className="rating-card"
                onClick={() => openModal(res)}
              >
                <div className="card-image-wrapper">
                  <Image
                    src={res.avatarUrl || "/assets/image/pho.png"} 
                    alt={res.tenQuan}
                    width={400}
                    height={300}
                    className="card-image"
                    unoptimized={true} 
                  />
                  <div className="rating-badge">
                    {res.diemTrungBinh ? res.diemTrungBinh.toFixed(1) : "N/A"}
                  </div>
                </div>

                <div className="card-content">
                  <h3 className="restaurant-name">{res.tenQuan}</h3>
                  <p className="restaurant-address">
                     <MapPinIcon /> {res.diaChi}
                  </p>
                  <div className="card-meta-row">
                      <div className="meta-item price">
                          <MoneyIcon />
                          <span>{res.giaCa || "Đang cập nhật"}</span>
                      </div>
                      <div className="meta-item hours">
                          <ClockIcon />
                          <span>{res.gioMoCua || "Đang cập nhật"}</span>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === MODAL PANEL === */}
        {selectedRes && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal}><XIcon /></button>
              
              <div className="modal-layout">
                <div className="modal-image-col">
                  <Image 
                    src={selectedRes.avatarUrl || "/assets/image/pho.png"} 
                    alt={selectedRes.tenQuan} 
                    width={900} height={700} 
                    className="modal-main-img"
                    unoptimized={true}
                  />
                  <div className="modal-rating-overlay">
                    <span className="big-score">{selectedRes.diemTrungBinh.toFixed(1)}</span>
                    <span className="score-label">Rất tốt</span>
                  </div>
                </div>

                <div className="modal-info-col">
                  <h2 className="modal-title">{selectedRes.tenQuan}</h2>
                  <p className="modal-address"><MapPinIcon /> {selectedRes.diaChi}</p>
                  
                  <div className="modal-meta-grid">
                    <div className="modal-meta-item">
                      <ClockIcon /> {selectedRes.gioMoCua || "Đang cập nhật"}
                    </div>
                    <div className="modal-meta-item highlight">
                      <MoneyIcon /> {selectedRes.giaCa || "Đang cập nhật"}
                    </div>
                  </div>

                  <hr className="modal-divider" />

                  <h4 className="detail-rating-heading">Đánh giá chi tiết</h4>
                  <div className="rating-bars">
                    <RatingRow label="Chất lượng" score={selectedRes.diemChatLuong} />
                    <RatingRow label="Vị trí" score={selectedRes.diemViTri} />
                    <RatingRow label="Không gian" score={selectedRes.diemKhongGian} />
                    <RatingRow label="Phục vụ" score={selectedRes.diemPhucVu} />
                    <RatingRow label="Giá cả" score={selectedRes.diemGiaCa} />
                  </div>

                  <a href={`/restaurants/${selectedRes._id}`} className="btn-go-detail">
                    Xem chi tiết đầy đủ
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const RatingRow = ({ label, score }: { label: string, score: number }) => (
  <div className="rating-row">
    <span className="rating-label">{label}</span>
    <div className="rating-bar-bg">
      <div className="rating-bar-fill" style={{ width: `${(score || 0) * 10}%` }}></div>
    </div>
    <span className="rating-value">{score ? score.toFixed(1) : "-"}</span>
  </div>
);