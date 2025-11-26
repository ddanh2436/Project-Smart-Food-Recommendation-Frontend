"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { getTopServiceRestaurants } from "@/app/lib/api"; // Import hàm API mới
import "./TopRatingSection.css"; // Tái sử dụng CSS cũ
import { useAuth } from "@/app/contexts/AuthContext";

// Các Icon (Giữ nguyên)
const ChevronLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevronRight = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
const ClockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MoneyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;

const TopServiceSection = () => {
  const { T } = useAuth();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopServiceRestaurants(10);
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch top service:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleScrollButton = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 340;
      direction === 'left' ? sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' }) : sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="top-rating-section">
      <div className="container">
        {/* === TIÊU ĐỀ RIÊNG BIỆT: Service === */}
        <div className="section-header-row">
          <div>
            <h2 className="section-title">{T.home.serviceTitle}</h2>
            <p className="section-subtitle">{T.home.serviceSub}</p>
          </div>
          <Link href="/restaurants" className="link-view-all">{T.common.viewAll} &rarr;</Link>
        </div>

        <div className="slider-wrapper">
          <button className="nav-btn prev-btn" onClick={() => handleScrollButton('left')}><ChevronLeft /></button>
          <div className="rating-slider" ref={sliderRef}>
            {loading ? (
               [...Array(5)].map((_, i) => <div key={i} className="skeleton-card"></div>)
            ) : (
              restaurants.map((res) => (
                <Link href={`/restaurants/${res._id}`} key={res._id} className="rating-card-link">
                  <div className="rating-card">
                    <div className="card-image-wrapper">
                      <Image
                        src={res.avatarUrl || "/assets/image/pho.png"} 
                        alt={res.tenQuan}
                        width={400} height={300}
                        className="card-image"
                        unoptimized={true}
                      />
                      {/* Badge màu Tím cho Phục vụ */}
                      <div className="rating-badge" style={{ backgroundColor: '#6c5ce7' }}>
                        {res.diemPhucVu ? res.diemPhucVu.toFixed(1) : "N/A"}
                      </div>
                      <div style={{
                          position: 'absolute', bottom: 10, left: 10, 
                          background: 'rgba(108, 92, 231, 0.9)', color: 'white', 
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                      }}>
                          Phục vụ
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="restaurant-name">{res.tenQuan}</h3>
                      <p className="restaurant-address"><MapPinIcon /> {res.diaChi}</p>
                      <div className="card-meta-row">
                          <div className="meta-item price"><MoneyIcon /><span>{res.giaCa || "---"}</span></div>
                          <div className="meta-item hours"><ClockIcon /><span>{res.gioMoCua || "---"}</span></div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          <button className="nav-btn next-btn" onClick={() => handleScrollButton('right')}><ChevronRight /></button>
        </div>
      </div>
    </section>
  );
};

export default TopServiceSection;