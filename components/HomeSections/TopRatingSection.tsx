// components/HomeSections/TopRatingSection.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTopRatedRestaurants } from "@/app/lib/api";
import "./TopRatingSection.css";

// --- ICONS ---
const ChevronLeft = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
);
const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
const MoneyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

// === CẬP NHẬT INTERFACE KHỚP VỚI SCHEMA CỦA BẠN ===
interface Restaurant {
  _id: string;
  tenQuan: string;
  diaChi: string;
  gioMoCua: string;
  giaCa: string;       // Đã sửa từ mucGia -> giaCa
  diemTrungBinh: number;
  avatarUrl: string;   // Đã sửa từ hinhAnh[] -> avatarUrl (string)
}

const TopRatingSection = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopRatedRestaurants(10);
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch top rating:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 320; 
      if (direction === 'left') {
        sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="top-rating-section">
      <div className="container">
        
        {/* Header */}
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Top Rated Restaurants</h2>
            <p className="section-subtitle">Khám phá những địa điểm được yêu thích nhất</p>
          </div>
          <Link href="/restaurants" className="link-view-all">
            Xem tất cả &rarr;
          </Link>
        </div>

        {/* Slider Wrapper */}
        <div className="slider-wrapper">
          <button className="nav-btn prev-btn" onClick={() => handleScroll('left')}><ChevronLeft /></button>

          <div className="rating-slider" ref={sliderRef}>
            {loading ? (
               [...Array(5)].map((_, i) => <div key={i} className="skeleton-card"></div>)
            ) : (
              restaurants.map((res) => (
                <Link href={`/restaurants/${res._id}`} key={res._id} className="rating-card">
                  
                  {/* --- 1. ẢNH (Dùng avatarUrl) --- */}
                  <div className="card-image-wrapper">
                    <Image
                      /* Nếu avatarUrl rỗng hoặc lỗi, fallback về ảnh mặc định */
                      src={res.avatarUrl ? res.avatarUrl : "/assets/image/pho.png"} 
                      alt={res.tenQuan}
                      width={400}
                      height={300}
                      className="card-image"
                      /* Thêm unoptimized nếu ảnh từ nguồn ngoài (foody, v.v.) để tránh lỗi Next.js Image */
                      unoptimized={true} 
                    />
                    <div className="rating-badge">
                      {res.diemTrungBinh ? res.diemTrungBinh.toFixed(1) : "N/A"}
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="restaurant-name">{res.tenQuan}</h3>
                    
                    {/* Địa chỉ */}
                    <p className="restaurant-address">
                       <MapPinIcon /> {res.diaChi}
                    </p>
                    
                    {/* --- 2. THÔNG TIN: GIÁ (giaCa) & GIỜ --- */}
                    <div className="card-meta-row">
                        <div className="meta-item price">
                            <MoneyIcon />
                            {/* Hiển thị giaCa */}
                            <span>{res.giaCa || "Đang cập nhật"}</span>
                        </div>
                        <div className="meta-item hours">
                            <ClockIcon />
                            <span>{res.gioMoCua || "Đang cập nhật"}</span>
                        </div>
                    </div>

                  </div>
                </Link>
              ))
            )}
          </div>

          <button className="nav-btn next-btn" onClick={() => handleScroll('right')}><ChevronRight /></button>
        </div>
      </div>
    </section>
  );
};

export default TopRatingSection;