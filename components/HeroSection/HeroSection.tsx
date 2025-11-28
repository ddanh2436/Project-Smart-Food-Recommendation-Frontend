// components/HeroSection/HeroSection.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import "./HeroSection.css";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";

// === DỮ LIỆU NGÔN NGỮ ===
const langData = {
  en: {
    line1: "Start your flavor journey with",
    line2: "Vietnamese Cuisine",
    subText: "Explore the hidden gems and authentic tastes around you.",
    placeholder: "What are you craving today?",
    discoverBtn: "Discover Collections",
    or: "Or",
    headers: ["Top Dishes", "Must-Try Drinks", "Best Restaurants"],
    trendingLabel: "🔥 Trending:",
    panelTitle: "Customize your search:", // [MỚI]
    categories: { // [MỚI]
      region: "Region",
      dish: "Dish Type",
      space: "Ambience"
    }
  },
  vn: {
    line1: "Khởi đầu hành trình vị giác với",
    line2: "Tinh hoa Ẩm thực Việt",
    subText: "Khám phá những quán ăn và hương vị chuẩn vị ngay quanh bạn.",
    placeholder: "Hôm nay bạn muốn ăn gì...",
    discoverBtn: "Tìm kiếm theo Bộ sưu tập",
    or: "Hoặc",
    headers: ["Món ngon nổi bật", "Thức uống phải thử", "Nhà hàng tiêu biểu"],
    trendingLabel: "🔥 Xu hướng:",
    panelTitle: "Tùy chọn tìm kiếm:", // [MỚI]
    categories: { // [MỚI]
      region: "Vùng miền",
      dish: "Loại món",
      space: "Không gian"
    }
  }
};

// --- DỮ LIỆU MOCK ---
const topFoods = ["Phở Bò Tái Nạm", "Bánh Mì Huỳnh Hoa", "Bún Chả Hương Liên", "Cơm Tấm Ba Ghiền", "Bánh Xèo Bà Dưỡng"];
const topDrinks = ["Cà Phê Trứng", "Trà Sen Vàng", "Nước Mía Sầu Riêng", "Bạc Xỉu Đá", "Dừa Tắc"];
const topRestaurants = ["Phở Thìn Lò Đúc", "Bếp Của Ngoại", "Cục Gạch Quán", "Pizza 4P's", "The Deck Saigon"];
const TRENDING_KEYWORDS = ["Phở", "Bún đậu", "Bún bò", "Hủ tiếu", "Bánh mì"];

// --- [MỚI] DỮ LIỆU CHO PANEL KHÁM PHÁ ---
const DISCOVER_OPTIONS = {
  region: ["Miền Bắc", "Miền Trung", "Miền Nam"],
  dish: ["Bún Bò", "Phở", "Cơm Tấm", "Hủ Tiếu", "Lẩu"],
  space: ["Sang trọng", "Vỉa hè", "Sân vườn", "Ấm cúng", "View đẹp"]
};

// --- ICONS ---
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);
const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
);
// Icon đóng panel
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const HeroSection: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  // [MỚI] State quản lý panel và các tag đã chọn
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { currentLang } = useAuth();
  const T = langData[currentLang]; 
  const router = useRouter(); 
  const panelRef = useRef<HTMLDivElement>(null);

  // [MỚI] Sync tags vào searchValue khi selectedTags thay đổi
  useEffect(() => {
    if (selectedTags.length > 0) {
      setSearchValue(selectedTags.join(", "));
    }
  }, [selectedTags]);

  const handleSearch = (term?: string) => {
    const query = term || searchValue;
    if (query.trim()) {
      router.push(`/restaurants?search=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // [MỚI] Xử lý khi click nút "Khám phá" -> Mở Panel
  const handleDiscoverClick = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  // [MỚI] Xử lý chọn/bỏ chọn tag
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag); // Bỏ chọn
      } else {
        return [...prev, tag]; // Chọn thêm
      }
    });
  };

  // [MỚI] Click ra ngoài để đóng panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // Chỉ đóng nếu click ra ngoài panel VÀ không phải click vào các tag/button liên quan
        // (Ở đây ta xử lý đơn giản là click ra ngoài panel thì đóng)
         // setIsPanelOpen(false); // Bạn có thể uncomment dòng này nếu muốn auto đóng
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <section className="hero-section">
      <div className="hero-bg-ken-burns"></div>
      <div className="hero-overlay-gradient"></div>

      <div className="hero-main-wrapper">
        <div className="hero-content-left">
          <div className="hero-text-block">
            <span className="hero-overline">{T.line1}</span>
            <h1 className="hero-title">{T.line2}</h1>
            <p className="hero-subtitle">{T.subText}</p>
          </div>

          {/* Wrapper cho Search và Panel */}
          <div className="hero-search-wrapper" ref={panelRef}>
            <div className="hero-search-container">
              <div className="search-input-group">
                <SearchIcon />
                <input
                  type="text"
                  placeholder={T.placeholder}
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    // Nếu user tự gõ, có thể clear selectedTags để tránh conflict logic (tuỳ chọn)
                    if(selectedTags.length > 0 && e.target.value !== selectedTags.join(", ")) {
                        setSelectedTags([]);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* [MỚI] PANEL KHÁM PHÁ */}
            {isPanelOpen && (
              <div className="discovery-panel">
                <div className="panel-header">
                  <span className="panel-title">{T.panelTitle}</span>
                  <button className="panel-close-btn" onClick={() => setIsPanelOpen(false)}><CloseIcon /></button>
                </div>
                
                <div className="panel-body">
                  {/* Nhóm Vùng miền */}
                  <div className="panel-category-group">
                    <span className="category-label">{T.categories.region}</span>
                    <div className="category-tags">
                      {DISCOVER_OPTIONS.region.map(tag => (
                        <button 
                          key={tag} 
                          className={`choice-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm Món ăn */}
                  <div className="panel-category-group">
                    <span className="category-label">{T.categories.dish}</span>
                    <div className="category-tags">
                      {DISCOVER_OPTIONS.dish.map(tag => (
                        <button 
                          key={tag} 
                          className={`choice-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nhóm Không gian */}
                  <div className="panel-category-group">
                    <span className="category-label">{T.categories.space}</span>
                    <div className="category-tags">
                      {DISCOVER_OPTIONS.space.map(tag => (
                        <button 
                          key={tag} 
                          className={`choice-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Nút tìm kiếm trong panel */}
                <button className="panel-search-btn" onClick={() => handleSearch()}>
                  Tìm kiếm ngay ({selectedTags.length})
                </button>
              </div>
            )}

            {/* Trending Keywords (Giữ nguyên) */}
            {!isPanelOpen && (
                <div className="hero-trending">
                <span className="trending-label">{T.trendingLabel}</span>
                {TRENDING_KEYWORDS.map((keyword, index) => (
                    <span key={index} className="trending-tag" onClick={() => handleSearch(keyword)}>
                    {keyword}
                    </span>
                ))}
                </div>
            )}
          </div>

          {/* Nút Discover - Giờ sẽ mở Panel */}
          <div className="hero-actions">
            <span className="hero-divider">{T.or}</span>
            <button 
                className={`btn-discover-glow ${isPanelOpen ? 'active' : ''}`} 
                onClick={handleDiscoverClick}
            >
              {isPanelOpen ? "Đóng Bộ sưu tập" : T.discoverBtn}
              {!isPanelOpen && <ArrowRightIcon />}
            </button>
          </div>
        </div>

        {/* CỘT PHẢI (Giữ nguyên) */}
        <div className="hero-featured-right">
          <div className="glass-panel">
            <div className="slider-viewport">
              <div className="slider-track">
                <div className="slider-card"><h3>{T.headers[0]}</h3><ul>{topFoods.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                <div className="slider-card"><h3>{T.headers[1]}</h3><ul>{topDrinks.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                <div className="slider-card"><h3>{T.headers[2]}</h3><ul>{topRestaurants.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
                <div className="slider-card"><h3>{T.headers[0]}</h3><ul>{topFoods.map((item, i) => <li key={i}>{item}</li>)}</ul></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;