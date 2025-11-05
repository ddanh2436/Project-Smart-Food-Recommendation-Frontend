"use client";
import React, { useState } from "react";
import "./HeroSection.css";
// Icon Tìm kiếm (SVG)
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

// Icon X (để xóa)
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

  const handleClearSearch = () => {
    setSearchValue("");
  };

  return (
    <section className="hero-section">
      {/* CẢI TIẾN 1: Lớp nền cho hiệu ứng Ken Burns */}
      <div className="hero-bg-ken-burns"></div>

      {/* Lớp nội dung (phải nằm trên lớp nền) */}
      <div className="hero-content">
        
        {/* CẢI TIẾN 2: Văn bản với hiệu ứng Slide-up-mask */}
        <h1 className="hero-title">
          <div className="hero-title-mask">
            <span className="hero-line-1">Open your journey with</span>
          </div>
          <div className="hero-title-mask">
            <span className="hero-line-2">VietNamese cuisine</span>
          </div>
        </h1>

        {/* 2. Thanh tìm kiếm */}
        <div className="search-bar-wrapper">
          <div className="search-icon">
            <SearchIcon />
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Search for your favorites"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {/* Chỉ hiện nút X khi có chữ */}
          {searchValue && (
            <button className="clear-icon" onClick={handleClearSearch}>
              <ClearIcon />
            </button>
          )}
        </div>

        {/* 3. Chữ "Or" */}
        <span className="hero-or">Or</span>

        {/* 4. Nút bấm */}
        <button className="hero-discover-btn">
          Discover specialities here
        </button>
      </div>
    </section>
  );
};

export default HeroSection;