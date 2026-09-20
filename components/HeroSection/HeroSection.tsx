// components/HeroSection/HeroSection.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import "./HeroSection.css";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { searchRestaurantsByImage } from "@/app/lib/api"; 
import { ScoreBadge } from "@/components/Score/Score";
import FeaturedTicker from "./FeaturedTicker";
import toast from "react-hot-toast";
import { FaMapMarkerAlt, FaStore, FaTimes, FaUtensils } from "react-icons/fa";

// Copy lives in app/lib/i18n.ts. This component used to hold its own
// dictionary, which is how strings added later (the panel's search button, the
// image-search modal, the history tooltip) ended up Vietnamese-only.
// The mock lists that used to live here (topFoods / topDrinks /
// topRestaurants) are gone with the carousel that showed them: they were
// invented names, present in no record, rendered with `cursor: pointer` and no
// click handler. FeaturedTicker shows real restaurants instead.
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

  const { t: T } = useTranslation();
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
        toast.error(T.hero.imageFailed);
      }
    } catch (err) {
      console.error(err);
      toast.error(T.hero.imageError);
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
            <span className="hero-overline">{T.home.heroOverline}</span>
            <h1 className="hero-title">{T.home.heroTitle}</h1>
            <p className="hero-subtitle">{T.home.heroSubtitle}</p>
          </div>

          {/* Wrapper cho Search và Panel */}
          <div className="hero-search-wrapper" ref={panelRef}>
            <div className="hero-search-container">
              <div className="search-input-group">
                <SearchIcon />
                <input
                  type="text"
                  placeholder={T.home.heroSearchPlaceholder}
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
                  title={T.hero.imageSearch}
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
                <div className="history-header">{T.hero.historyTitle}</div>
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
                        title={T.hero.historyRemove}
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
                  <span className="panel-title">{T.hero.panelTitle}</span>
                  <button className="panel-close-btn" onClick={() => setIsPanelOpen(false)}><CloseIcon /></button>
                </div>
                
                <div className="panel-body">
                  <div className="panel-category-group">
                    <span className="category-label">{T.hero.categories.region}</span>
                    <div className="category-tags">
                      {DISCOVER_OPTIONS.region.map((tag, index) => (
                        <button 
                          key={tag} 
                          className={`choice-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {T.hero.regions[index] ?? tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="panel-category-group">
                    <span className="category-label">{T.hero.categories.dish}</span>
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
                    <span className="category-label">{T.hero.categories.space}</span>
                    <div className="category-tags">
                      {DISCOVER_OPTIONS.space.map((tag, index) => (
                        <button 
                          key={tag} 
                          className={`choice-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag)}
                        >
                          {T.hero.spaces[index] ?? tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button className="panel-search-btn" onClick={() => handleSearch()}>
                  {T.hero.searchNow} ({selectedTags.length})
                </button>
              </div>
            )}

            {!isPanelOpen && !showHistory && (
                <div className="hero-trending">
                <span className="trending-label">{T.hero.trendingLabel}</span>
                {TRENDING_KEYWORDS.map((keyword, index) => (
                    <span key={index} className="trending-tag" onClick={() => handleSearch(keyword)}>
                    {keyword}
                    </span>
                ))}
                </div>
            )}
          </div>

          <div className="hero-actions">
            <span className="hero-divider">{T.hero.or}</span>
            <button 
                className={`btn-discover-glow ${isPanelOpen ? 'active' : ''}`} 
                onClick={handleDiscoverClick}
            >
              {isPanelOpen ? T.hero.discoverClose : T.hero.discoverBtn}
              {!isPanelOpen && <ArrowRightIcon />}
            </button>
          </div>
        </div>

        <div className="hero-featured-right">
          <FeaturedTicker />
        </div>

      </div>

      {/* MODAL KẾT QUẢ TÌM KIẾM ẢNH */}
      {imageResult && (
        <div className="image-search-overlay">
          <div className="image-search-modal">
            
            {/* Header Modal */}
            <div className="modal-header-modern">
              <div className="modal-title-wrapper">
                <span className="detect-label">{T.hero.detected}</span>
                <h3 className="detected-dish-name">{imageResult.detectedFood}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setImageResult(null)}>
                <FaTimes />
              </button>
            </div>

            {/* Body Modal */}
            <div className="modal-body-modern">
              {imageResult.data.length === 0 ? (
                 <div className="empty-state">
                    <div className="empty-icon">🍽️</div>
                    <p>{T.hero.imageEmpty}</p>
                 </div>
              ) : (
                <div className="result-grid">
                  {imageResult.data.map((res: any) => (
                    <div 
                      key={res._id} 
                      className="result-card-modern" 
                      onClick={() => router.push(`/restaurants/${res._id}`)}
                    >
                      {/* Hình ảnh Card */}
                      <div className="card-image-wrapper">
                        <img 
                          src={res.avatarUrl || "/assets/image/pho.png"} 
                          alt={res.tenQuan}
                          className="card-img"
                          referrerPolicy="no-referrer" // Quan trọng để load ảnh Foody
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/assets/image/pho.png";
                          }}
                        />
                        <div className="card-rating-badge">
                          <ScoreBadge score={res.diemTrungBinh} withScale />
                        </div>
                      </div>

                      {/* Thông tin Card */}
                      <div className="card-info-content">
                        <h4 className="card-res-name">{res.tenQuan}</h4>
                        
                        <div className="card-row">
                          <FaMapMarkerAlt className="icon-orange" />
                          <span className="card-address">{res.diaChi}</span>
                        </div>

                        <div className="card-footer">
                          <span className="price-tag">
                            <FaUtensils className="icon-small" /> 
                            {res.giaCa || T.common.updating}
                          </span>
                          <span className="view-btn">
                            {T.hero.viewPlace} <FaStore />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default HeroSection;