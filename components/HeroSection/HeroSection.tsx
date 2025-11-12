// components/HeroSection/HeroSection.tsx
"use client";
import React, { useState } from "react";
import "./HeroSection.css";
import { useAuth } from "@/app/contexts/AuthContext";

// === DỮ LIỆU NGÔN NGỮ ===
const langData = {
  en: {
    line1: "Begin your journey with",
    line2: "Vietnamese cuisine",
    placeholder: "Search for your favorites",
    discoverBtn: "Discover specialities here",
    or: "Or",
    topDishes: "Top 5 Dishes",
    topDrinks: "Top 5 Drinks",
    topRestaurants: "Top 5 Restaurants",
  },
  vn: {
    line1: "Khởi đầu hành trình của bạn với",
    line2: "ẩm thực Việt Nam",
    placeholder: "Tìm kiếm món ăn yêu thích của bạn",
    discoverBtn: "Khám phá đặc sản tại đây",
    or: "Hoặc",
    topDishes: "Top 5 Món ăn",
    topDrinks: "Top 5 Thức uống",
    topRestaurants: "Top 5 Nhà hàng",
  }
};
// =====================================

// --- DỮ LIỆU MOCK (Giữ nguyên) ---
const topFoods = [
  "Phở Bò Tái Chín",
  "Bánh Mì Thập Cẩm",
  "Bún Chả Hà Nội",
  "Cơm Tấm Sườn Bì",
  "Gỏi Cuốn Tôm Thịt",
];

const topDrinks = [
  "Cà Phê Sữa Đá",
  "Trà Sen Vàng",
  "Nước Mía",
  "Trà Đào Cam Sả",
  "Sinh Tố Bơ",
];

const topRestaurants = [
  "Nhà hàng Phở Thìn",
  "Bếp Của Ngoại",
  "Cục Gạch Quán",
  "Làng Ẩm Thực Cù Lao",
  "The Deck Saigon",
];
// ---------------------------------------------------

// (Các Icon SVG giữ nguyên)
const SearchIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const ClearIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const HeroSection: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const { currentLang } = useAuth();
  const T = langData[currentLang]; 

  const handleClearSearch = () => {
    setSearchValue("");
  };

  return (
    <section className="hero-section">
      <div className="hero-bg-ken-burns"></div>
      <div className="hero-main-wrapper">

        {/* PHẦN BÊN TRÁI (SỬ DỤNG T) */}
        <div className="hero-content">
          <h1 className="hero-title">
            <div className="hero-title-mask">
              <span className="hero-line-1">{T.line1}</span>
            </div>
            <div className="hero-title-mask">
              <span className="hero-line-2">{T.line2}</span>
            </div>
          </h1>
          <div className="search-bar-wrapper">
            <div className="search-icon">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder={T.placeholder} 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            {searchValue && (
              <button className="clear-icon" onClick={handleClearSearch}>
                <ClearIcon />
              </button>
            )}
          </div>
          <span className="hero-or">{T.or}</span> 
          <button className="hero-discover-btn">
            {T.discoverBtn} 
          </button>
        </div>

        {/* PANEL BÊN PHẢI (SỬ DỤNG T) */}
        <div className="hero-featured-panel">
          <div className="featured-slider-wrapper">
            <div className="featured-slider">
            
              {/* Slide 1: Top Món ăn */}
              <div className="featured-list foods-list">
                <h3>{T.topDishes}</h3> 
                <ul>
                  {topFoods.map((food, index) => (
                    <li key={`food1-${index}`}>{food}</li>
                  ))}
                </ul>
              </div>

              {/* Slide 2: Top Đồ uống */}
              <div className="featured-list drinks-list">
                <h3>{T.topDrinks}</h3> 
                <ul>
                  {topDrinks.map((drink, index) => (
                    <li key={`drink-${index}`}>{drink}</li>
                  ))}
                </ul>
              </div>

              {/* Slide 3: Top Nhà hàng */}
              <div className="featured-list restaurants-list">
                <h3>{T.topRestaurants}</h3> 
                <ul>
                  {topRestaurants.map((restaurant, index) => (
                    <li key={`resto-${index}`}>{restaurant}</li>
                  ))}
                </ul>
              </div>

              {/* === SLIDE 4: BẢN SAO CỦA SLIDE 1 === */}
              <div className="featured-list foods-list-copy">
                <h3>{T.topDishes}</h3> 
                <ul>
                  {topFoods.map((food, index) => (
                    <li key={`food2-${index}`}>{food}</li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default HeroSection;