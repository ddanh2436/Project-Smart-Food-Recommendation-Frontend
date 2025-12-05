// components/HeroSection/HeroSection.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import "./HeroSection.css";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { searchRestaurantsByImage } from "@/app/lib/api"; 
import Image from "next/image"; 

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
    panelTitle: "Customize your search:", 
    categories: { 
      region: "Region",
      dish: "Dish Type",
      space: "Ambience"
    },
    historyTitle: "Recent Searches"
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
    panelTitle: "Tùy chọn tìm kiếm:", 
    categories: { 
      region: "Vùng miền",
      dish: "Loại món",
      space: "Không gian"
    },
    historyTitle: "Lịch sử tìm kiếm"
  }
};

// --- DỮ LIỆU MOCK ---
const topFoods = ["Phở Bò Tái Nạm", "Bánh Mì Huỳnh Hoa", "Bún Chả Hương Liên", "Cơm Tấm Ba Ghiền", "Bánh Xèo Bà Dưỡng"];
const topDrinks = ["Cà Phê Trứng", "Trà Sen Vàng", "Nước Mía Sầu Riêng", "Bạc Xỉu Đá", "Dừa Tắc"];
const topRestaurants = ["Phở Thìn Lò Đúc", "Bếp Của Ngoại", "Cục Gạch Quán", "Pizza 4P's", "The Deck Saigon"];
const TRENDING_KEYWORDS = ["Phở", "Bún đậu", "Bún bò", "Hủ tiếu", "Bánh mì"];

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
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
const CameraIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
);
// Icon đồng hồ cho lịch sử
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
);
// Icon xóa lịch sử
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const HeroSection: React.FC = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // State cho tìm kiếm hình ảnh
  const [isUploading, setIsUploading] = useState(false);
  const [imageResult, setImageResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE LỊCH SỬ TÌM KIẾM ---
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const { currentLang } = useAuth();
  const T = langData[currentLang]; 
  const router = useRouter(); 
  const panelRef = useRef<HTMLDivElement>(null); // Ref bao quanh khu vực search

  // --- LOGIC LỊCH SỬ ---
  // 1. Load lịch sử từ sessionStorage khi component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("searchHistory");
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    }
  }, []);

  // 2. Lưu từ khóa vào lịch sử
  const addToHistory = (keyword: string) => {
    if (!keyword.trim()) return;
    const newHistory = [keyword, ...searchHistory.filter(item => item !== keyword)].slice(0, 6); // Giữ tối đa 6 mục
    setSearchHistory(newHistory);
    sessionStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  // 3. Xóa một mục lịch sử
  const removeHistoryItem = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation();
    const newHistory = searchHistory.filter(item => item !== keyword);
    setSearchHistory(newHistory);
    sessionStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  // --- LOGIC SEARCH & TAGS ---
  useEffect(() => {
    if (selectedTags.length > 0) {
      setSearchValue(selectedTags.join(", "));
    }
  }, [selectedTags]);

  const handleSearch = (term?: string) => {
    const query = term || searchValue;
    if (query.trim()) {
      addToHistory(query.trim()); // Lưu vào lịch sử khi tìm
      setShowHistory(false);
      router.push(`/restaurants?search=${encodeURIComponent(query)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Click vào item lịch sử -> Tìm luôn
  const handleHistoryClick = (keyword: string) => {
    setSearchValue(keyword);
    addToHistory(keyword);
    setShowHistory(false);
    router.push(`/restaurants?search=${encodeURIComponent(keyword)}`);
  };

  const handleDiscoverClick = () => {
    setIsPanelOpen(!isPanelOpen);
    setShowHistory(false); // Đóng lịch sử nếu mở panel
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag); 
      } else {
        return [...prev, tag]; 
      }
    });
  };

  // Xử lý khi chọn file ảnh
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await searchRestaurantsByImage(file);
      if (data && data.data) {
        setImageResult(data); 
      } else {
        alert("Không nhận diện được món ăn hoặc không tìm thấy quán!");
      }
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi xử lý ảnh.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Click outside để đóng Panel và History
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsPanelOpen(false); // Đóng Discover Panel
        setShowHistory(false); // Đóng History
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <section className="hero-section">
      <div className="hero-bg-ken-burns"></div>
      <div className="hero-overlay-gradient"></div>

      {/* Lớp mờ (Backdrop) khi Modal hiện ra */}
      {imageResult && <div className="hero-blur-backdrop" onClick={() => setImageResult(null)}></div>}

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
                    if(selectedTags.length > 0 && e.target.value !== selectedTags.join(", ")) {
                        setSelectedTags([]);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if(searchHistory.length > 0) setShowHistory(true);
                    setIsPanelOpen(false); // Đóng panel nếu đang mở
                  }}
                />
                
                <button 
                  className="camera-btn camera-ai-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Tìm kiếm bằng hình ảnh (AI)"
                >
                  {isUploading ? "..." : <CameraIcon />}
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            {/* --- PANEL LỊCH SỬ TÌM KIẾM --- */}
            {showHistory && searchHistory.length > 0 && !isPanelOpen && (
              <div className="search-history-dropdown">
                <div className="history-header">{T.historyTitle}</div>
                <ul className="history-list">
                  {searchHistory.map((item, index) => (
                    <li key={index} className="history-item" onClick={() => handleHistoryClick(item)}>
                      <div className="history-content">
                        <ClockIcon />
                        <span className="history-text">{item}</span>
                      </div>
                      <button 
                        className="btn-remove-history" 
                        onClick={(e) => removeHistoryItem(e, item)}
                        title="Xóa"
                      >
                        <XIcon />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* --- PANEL BỘ SƯU TẬP (DISCOVER) --- */}
            {isPanelOpen && (
              <div className="discovery-panel">
                <div className="panel-header">
                  <span className="panel-title">{T.panelTitle}</span>
                  <button className="panel-close-btn" onClick={() => setIsPanelOpen(false)}><CloseIcon /></button>
                </div>
                
                <div className="panel-body">
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
                
                <button className="panel-search-btn" onClick={() => handleSearch()}>
                  Tìm kiếm ngay ({selectedTags.length})
                </button>
              </div>
            )}

            {!isPanelOpen && !showHistory && (
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

      {/* MODAL KẾT QUẢ TÌM KIẾM ẢNH */}
      {imageResult && (
        <div className="image-result-modal">
          <div className="modal-header">
            <h3>Món ăn nhận diện: <span style={{color: '#e9a004'}}>{imageResult.detectedFood}</span></h3>
            <button className="close-btn" onClick={() => setImageResult(null)}>✕</button>
          </div>

          <div className="modal-body">
            {imageResult.data.length === 0 ? (
               <p style={{textAlign: 'center', color: '#666', marginTop: 20}}>Không tìm thấy quán nào bán món này.</p>
            ) : (
              imageResult.data.map((res: any) => (
                <div key={res._id} className="mini-res-card" onClick={() => router.push(`/restaurants/${res._id}`)}>
                  <div className="res-img-box">
                    <Image 
                      src={res.avatarUrl || "/assets/image/pho.png"} 
                      alt={res.tenQuan}
                      width={60} height={60}
                      unoptimized={true}
                    />
                  </div>
                  <div className="res-info">
                    <h4>{res.tenQuan}</h4>
                    <p>⭐ {res.diemTrungBinh} • {res.giaCa}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </section>
  );
};

export default HeroSection;