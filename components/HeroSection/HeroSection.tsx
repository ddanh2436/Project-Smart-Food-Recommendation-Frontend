// components/HeroSection/HeroSection.tsx
"use client";
import React, { useState } from "react";
import "./HeroSection.css";
import { useAuth } from "@/app/contexts/AuthContext";

// === DỮ LIỆU NGÔN NGỮ (Cập nhật text tiếng Anh) ===
const langData = {
  en: {
    line1: "Start your flavor journey with", // Đổi từ "Embark" -> "Start"
    line2: "Vietnamese Cuisine",
    subText: "Explore the hidden gems and authentic tastes around you.",
    placeholder: "What are you craving today?",
    discoverBtn: "Discover Collections",
    or: "Or",
    headers: ["Top Dishes", "Must-Try Drinks", "Best Restaurants"],
  },
  vn: {
    line1: "Khởi đầu hành trình vị giác với",
    line2: "Tinh hoa Ẩm thực Việt",
    subText: "Khám phá những quán ăn và hương vị chuẩn vị ngay quanh bạn.",
    placeholder: "Hôm nay bạn muốn ăn gì...",
    discoverBtn: "Khám phá Bộ sưu tập",
    or: "Hoặc",
    headers: ["Món ngon nổi bật", "Thức uống phải thử", "Nhà hàng tiêu biểu"],
  }
};

// --- DỮ LIỆU MOCK ---
const topFoods = ["Phở Bò Tái Nạm", "Bánh Mì Huỳnh Hoa", "Bún Chả Hương Liên", "Cơm Tấm Ba Ghiền", "Bánh Xèo Bà Dưỡng"];
const topDrinks = ["Cà Phê Trứng", "Trà Sen Vàng", "Nước Mía Sầu Riêng", "Bạc Xỉu Đá", "Dừa Tắc"];
const topRestaurants = ["Phở Thìn Lò Đúc", "Bếp Của Ngoại", "Cục Gạch Quán", "Pizza 4P's", "The Deck Saigon"];

// --- ICONS ---
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const HeroSection: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const { currentLang } = useAuth();
  const T = langData[currentLang]; 

  return (
    <section className="hero-section">
      {/* Background Animation */}
      <div className="hero-bg-ken-burns"></div>
      <div className="hero-overlay-gradient"></div>

      <div className="hero-main-wrapper">
        
        {/* === CỘT TRÁI: NỘI DUNG CHÍNH === */}
        <div className="hero-content-left">
          <div className="hero-text-block">
            <span className="hero-overline">{T.line1}</span>
            <h1 className="hero-title">
              {T.line2}
            </h1>
            <p className="hero-subtitle">{T.subText}</p>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="hero-search-container">
            <div className="search-input-group">
              <SearchIcon />
              <input
                type="text"
                placeholder={T.placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>

          {/* Nút Discover */}
          <div className="hero-actions">
            <span className="hero-divider">{T.or}</span>
            <button className="btn-discover-glow">
              {T.discoverBtn}
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        {/* === CỘT PHẢI: GLASS PANEL (SLIDER) === */}
        <div className="hero-featured-right">
          <div className="glass-panel">
            <div className="slider-viewport">
              <div className="slider-track">
                
                {/* Card 1 */}
                <div className="slider-card">
                  <h3>{T.headers[0]}</h3>
                  <ul>
                    {topFoods.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* Card 2 */}
                <div className="slider-card">
                  <h3>{T.headers[1]}</h3>
                  <ul>
                    {topDrinks.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

                {/* Card 3 */}
                <div className="slider-card">
                  <h3>{T.headers[2]}</h3>
                  <ul>
                    {topRestaurants.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
                
                {/* Clone Card 1 (Để loop mượt) */}
                <div className="slider-card">
                  <h3>{T.headers[0]}</h3>
                  <ul>
                    {topFoods.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;