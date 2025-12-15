"use client";

import React, { useEffect, useState, Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllRestaurants } from "@/app/lib/api";
import "./RestaurantsPage.css";
import dynamic from "next/dynamic";

// Import component bản đồ (Dynamic để tránh lỗi SSR)
const RoutingMap = dynamic(() => import("@/components/RoutingMap/RoutingMap"), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>Đang tải bản đồ...</div>,
});

// Các Icons (Giữ nguyên)
const FilterIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const ChevronDownIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon"><path d="M6 9l6 6 6-6"/></svg>;
const ClockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MoneyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ArrowUpIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
const SortDescIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>; 
const SortAscIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 4h13M3 8h9m-9 4h9m-5 4v-12m0 0l-4 4m4-4l4 4"></path></svg>;
const SadSearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);
const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
);
const DirectionIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
  </svg>
);

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
  urlGoc: string;
  lat?: number;
  lon?: number;
}

const RatingRow = ({ label, score }: { label: string, score: number }) => (
  <div className="rating-row">
    <span className="rating-label">{label}</span>
    <div className="rating-bar-bg"><div className="rating-bar-fill" style={{ width: `${(score || 0) * 10}%` }}></div></div>
    <span className="rating-value">{score ? score.toFixed(1) : "-"}</span>
  </div>
);

// --- TỪ ĐIỂN SONG NGỮ (Giữ nguyên) ---
const DICT = {
    vi: {
        pageTitle: "Khám phá Nhà hàng",
        pageSubtitle: "Bộ sưu tập những địa điểm ẩm thực tốt nhất",
        hanoiTitle: "Ẩm thực Hà Nội",
        hanoiSubtitle: "Đang hiển thị các địa điểm nổi bật tại thủ đô Hà Nội",
        hcmcTitle: "Ẩm thực TP.HCM",
        hcmcSubtitle: "Đang hiển thị các địa điểm nổi bật tại TP. Hồ Chí Minh",
        viewAllAreas: "Xem tất cả khu vực",
        advancedFilter: "Bộ lọc nâng cao",
        filteringBy: "Đang lọc theo:",
        sortBy: "Sắp xếp",
        orderBy: "Thứ tự",
        rating: "Điểm số",
        openNow: "Đang mở cửa",
        clearFilter: "Xóa bộ lọc",
        criteria: "Tiêu chí:",
        order: "Thứ tự:",
        status: "Trạng thái:",
        apply: "Lọc kết quả",
        reset: "Reset",
        close: "Đóng",
        loading: "Đang tải dữ liệu trang",
        noResultTitle: "Không tìm thấy kết quả",
        noResultDesc: "Rất tiếc, chúng tôi không tìm thấy nhà hàng nào phù hợp.",
        clearAndRetry: "Xóa bộ lọc & Thử lại",
        prev: "Trước",
        next: "Sau",
        page: "Trang",
        showMap: "Xem đường đi đến quán",
        hideMap: "Ẩn bản đồ chỉ đường",
        noMapData: "Rất tiếc, quán này chưa có dữ liệu tọa độ để chỉ đường.",
        detailRating: "Đánh giá chi tiết",
        viewDetail: "Xem chi tiết đầy đủ",
        priceUpdate: "Đang cập nhật",
        routeTooltip: "Chỉ đường tới quán",
        
        // Labels
        l_newest: "Mới nhất",
        l_distance: "Gần tôi nhất",
        l_quality: "Chất lượng món ăn",
        l_space: "Không gian đẹp",
        l_location: "Vị trí thuận lợi",
        l_service: "Phục vụ tốt",
        l_price: "Giá cả hợp lý",
        l_all: "Tất cả",
        l_excellent: "Xuất sắc",
        l_verygood: "Rất tốt",
        l_good: "Tốt",
        l_fair: "Khá",
        l_average: "Trung bình",
        l_poor: "Cần cải thiện",
        l_cheap: "Bình dân",
        l_desc: "Cao đến Thấp",
        l_asc: "Thấp đến Cao",
        
        // Modal Criteria
        c_quality: "Chất lượng",
        c_location: "Vị trí",
        c_space: "Không gian",
        c_service: "Phục vụ",
        c_price: "Giá cả"
    },
    en: {
        pageTitle: "Discover Restaurants",
        pageSubtitle: "Collection of the best culinary locations",
        hanoiTitle: "Hanoi Cuisine",
        hanoiSubtitle: "Displaying highlights in Hanoi capital",
        hcmcTitle: "HCMC Cuisine",
        hcmcSubtitle: "Displaying highlights in Ho Chi Minh City",
        viewAllAreas: "View all areas",
        advancedFilter: "Advanced Filters",
        filteringBy: "Filtering by:",
        sortBy: "Sort by",
        orderBy: "Order",
        rating: "Rating",
        openNow: "Open Now",
        clearFilter: "Clear filters",
        criteria: "Criteria:",
        order: "Order:",
        status: "Status:",
        apply: "Apply Filter",
        reset: "Reset",
        close: "Close",
        loading: "Loading data page",
        noResultTitle: "No results found",
        noResultDesc: "Sorry, we couldn't find any suitable restaurants.",
        clearAndRetry: "Clear Filter & Retry",
        prev: "Prev",
        next: "Next",
        page: "Page",
        showMap: "Show directions",
        hideMap: "Hide map",
        noMapData: "Sorry, coordinates are not available for this restaurant.",
        detailRating: "Detailed Reviews",
        viewDetail: "View full details",
        priceUpdate: "Updating",
        routeTooltip: "Get directions",

        // Labels
        l_newest: "Newest",
        l_distance: "Nearest to me",
        l_quality: "Food Quality",
        l_space: "Beautiful Space",
        l_location: "Good Location",
        l_service: "Good Service",
        l_price: "Reasonable Price",
        l_all: "All",
        l_excellent: "Excellent",
        l_verygood: "Very Good",
        l_good: "Good",
        l_fair: "Fair",
        l_average: "Average",
        l_poor: "Need Improvement",
        l_cheap: "Budget",
        l_desc: "High to Low",
        l_asc: "Low to High",

        // Modal Criteria
        c_quality: "Quality",
        c_location: "Location",
        c_space: "Space",
        c_service: "Service",
        c_price: "Price"
    }
};

function RestaurantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- [SỬA ĐỔI] LANGUAGE STATE with EVENT LISTENER ---
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  useEffect(() => {
    // 1. Kiểm tra LocalStorage khi mới vào
    if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('app-language') as 'vi' | 'en';
        if (storedLang) setLang(storedLang);
    }

    // 2. Lắng nghe sự kiện 'language-change' từ Header
    const handleLangChange = (event: Event) => {
        const customEvent = event as CustomEvent;
        if (customEvent.detail) {
            setLang(customEvent.detail as 'vi' | 'en');
        }
    };

    window.addEventListener('language-change', handleLangChange);

    // Cleanup listener khi component unmount
    return () => {
        window.removeEventListener('language-change', handleLangChange);
    };
  }, []);

  const t = DICT[lang]; // Shortcut for translation

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter UI States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState<string>('default');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<string>('desc'); 
  const [isOpenNow, setIsOpenNow] = useState<boolean>(false);

  // Active States
  const [activeSort, setActiveSort] = useState<string>('default');
  const [activeRating, setActiveRating] = useState<string>('all');
  const [activeOrder, setActiveOrder] = useState<string>('desc'); 
  const [activeOpenNow, setActiveOpenNow] = useState<boolean>(false);
  
  // --- State cho City ---
  const [activeCity, setActiveCity] = useState<string>('');

  const [selectedRes, setSelectedRes] = useState<Restaurant | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMap, setShowMap] = useState(false); 

  // --- CẬP NHẬT: LOGIC LẤY GPS NGƯỜI DÙNG ---
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>({
    lat: 10.748017595600404, 
    lon: 106.6767808260947
  });

  // --- DEFINITIONS INSIDE COMPONENT TO USE LANGUAGE ---
  const SORT_OPTIONS = useMemo(() => [
    { id: 'default', label: t.l_newest },
    { id: 'distance', label: t.l_distance },
    { id: 'quality', label: t.l_quality },
    { id: 'space', label: t.l_space },
    { id: 'location', label: t.l_location },
    { id: 'service', label: t.l_service },
    { id: 'price', label: t.l_price },
  ], [lang, t]);

  const RATING_RANGES = useMemo(() => [
    { id: 'all', label: t.l_all },
    { id: 'gte9', label: `${t.l_excellent} (> 9.0)` },
    { id: '8to9', label: `${t.l_verygood} (8.0 - 9.0)` },
    { id: '7to8', label: `${t.l_good} (7.0 - 8.0)` },
    { id: '6to7', label: `${t.l_fair} (6.0 - 7.0)` },
    { id: 'lt6', label: `${t.l_cheap} (< 6.0)` },
  ], [lang, t]);

  const ORDER_OPTIONS = useMemo(() => [
    { id: 'desc', label: t.l_desc, icon: <SortDescIcon /> },
    { id: 'asc', label: t.l_asc, icon: <SortAscIcon /> },
  ], [lang, t]);

  const getRatingLabel = (score: number) => {
    if (!score && score !== 0) return "N/A";
    if (score >= 9.0) return t.l_excellent;
    if (score >= 8.0) return t.l_verygood;
    if (score >= 7.0) return t.l_good;
    if (score >= 6.0) return t.l_fair;
    if (score >= 5.0) return t.l_average;
    return t.l_poor;
  };
  // ------------------------------------------------

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Lỗi lấy vị trí hoặc người dùng từ chối:", error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []); 

  const LIMIT = 32; 

  const getDisplayScore = (res: Restaurant) => {
    switch (activeSort) {
      case 'quality': return res.diemChatLuong; 
      case 'space': return res.diemKhongGian;   
      case 'location': return res.diemViTri;    
      case 'service': return res.diemPhucVu;    
      case 'price': return res.diemGiaCa;       
      default: return res.diemTrungBinh;        
    }
  };

  const getCategoryClass = () => {
    switch (activeSort) {
      case 'quality': return 'quality';   
      case 'space': return 'space';       
      case 'location': return 'location'; 
      case 'service': return 'service';   
      case 'price': return 'price';       
      default: return 'default';          
    }
  };

  const handleSelectSort = (sortId: string) => {
    setSelectedSort(sortId);
    if (sortId === 'distance' || sortId === 'price') {
      setSelectedOrder('asc'); 
    } else {
      setSelectedOrder('desc');
    }
  };

  // --- MAIN DATA FETCHING ---
  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    const sort = searchParams.get('sort') || 'default';
    const rating = searchParams.get('rating') || 'all';
    let order = searchParams.get('order'); 
    const open = searchParams.get('openNow') === 'true'; 
    const search = searchParams.get('search') || ''; 
    const city = searchParams.get('city') || ''; 

    if (!order) {
      if (sort === 'distance' || sort === 'price') order = 'asc';
      else order = 'desc';
    }

    setCurrentPage(page);
    setActiveSort(sort);
    setActiveRating(rating);
    setActiveOrder(order);
    setActiveOpenNow(open);
    setActiveCity(city); 
    
    setSelectedSort(sort);
    setSelectedRating(rating);
    setSelectedOrder(order);
    setIsOpenNow(open);

    const fetchData = async () => {
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      let dbSortBy = 'diemTrungBinh';
      switch (sort) {
        case 'distance': dbSortBy = 'distance'; break;
        case 'space': dbSortBy = 'diemKhongGian'; break;
        case 'location': dbSortBy = 'diemViTri'; break;
        case 'service': dbSortBy = 'diemPhucVu'; break;
        case 'quality': dbSortBy = 'diemChatLuong'; break;
        case 'price': dbSortBy = 'diemGiaCa'; break;
        default: dbSortBy = 'diemTrungBinh';
      }

      let latStr = '';
      let lonStr = '';
      if (userLocation) {
        latStr = String(userLocation.lat);
        lonStr = String(userLocation.lon);
      }

      try {
        const response = await getAllRestaurants(
          page, LIMIT, dbSortBy, order!, rating, String(open), latStr, lonStr, search, city
        );
        
        setRestaurants(response.data || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams, userLocation]); 

  const updateURL = (newParams: any) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== 'false') { 
            params.set(key, value as string);
        } else {
            params.delete(key);
        }
    });
    router.push(`/restaurants?${params.toString()}`);
  };

  const handleApplyFilter = () => {
    updateURL({
        page: '1',
        sort: selectedSort,
        rating: selectedRating,
        order: selectedOrder,
        openNow: String(isOpenNow)
    });
    setIsFilterOpen(false); 
  };

  const handleResetFilter = () => {
    router.push('/restaurants');
  };

  const handlePageChange = (page: number) => { 
    if (page >= 1 && page <= totalPages) {
        updateURL({ page: String(page) });
    }
  };

  const getSortLabel = (id: string) => SORT_OPTIONS.find(opt => opt.id === id)?.label;
  const getRatingLabelText = (id: string) => RATING_RANGES.find(opt => opt.id === id)?.label;
  const getOrderLabelText = (id: string) => id === 'asc' ? t.l_asc : t.l_desc;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setShowBackToTop(true); else setShowBackToTop(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  
  const openModal = (res: Restaurant, autoShowMap: boolean = false) => { 
    setSelectedRes(res); 
    setShowMap(autoShowMap); 
    document.body.style.overflow = 'hidden'; 
  };
  const closeModal = () => { setSelectedRes(null); document.body.style.overflow = 'unset'; };

  // --- Logic hiển thị tiêu đề động ---
  let pageTitle = t.pageTitle;
  let pageSubtitle = t.pageSubtitle;

  if (activeCity === 'hanoi') {
    pageTitle = t.hanoiTitle;
    pageSubtitle = t.hanoiSubtitle;
  } else if (activeCity === 'hcmc') {
    pageTitle = t.hcmcTitle;
    pageSubtitle = t.hcmcSubtitle;
  }
  // ----------------------------------

  return (
    <div className="restaurants-page-wrapper">
      <div className="container">
        
        {/* [ĐÃ XÓA] Nút chuyển ngữ nổi ở đây vì đã có trên Header */}

        <div className="page-header">
          <h1 className="page-title">{pageTitle}</h1>
          <p className="page-subtitle">{pageSubtitle}</p>
          
          {activeCity && (
             <div style={{ marginTop: '10px' }}>
                <button 
                    onClick={() => router.push('/restaurants')}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#d32f2f',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}
                >
                    &larr; {t.viewAllAreas}
                </button>
             </div>
          )}
        </div>

        {/* Toggle Button */}
        <button 
          className={`filter-toggle-btn ${isFilterOpen ? 'active' : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FilterIcon /> 
          <span>{t.advancedFilter}</span>
          <ChevronDownIcon />
        </button>

        {/* Active Indicators */}
        {(activeSort !== 'default' || activeRating !== 'all' || activeOrder !== 'desc' || activeOpenNow) && (
          <div className="active-filters-bar">
            <span className="active-filters-label">{t.filteringBy}</span>
            
            {activeSort !== 'default' && <div className="active-tag">{t.sortBy}: {getSortLabel(activeSort)}</div>}
            {activeOrder !== 'desc' && <div className="active-tag">{t.orderBy}: {getOrderLabelText(activeOrder)}</div>}
            {activeRating !== 'all' && <div className="active-tag">{t.rating}: {getRatingLabelText(activeRating)}</div>}
            {activeOpenNow && <div className="active-tag"><ClockIcon /> {t.openNow}</div>}

            <button className="btn-clear-all" onClick={handleResetFilter}>{t.clearFilter}</button>
          </div>
        )}

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="advanced-filter-panel">
            <div className="filter-row">
              <div className="filter-label">{t.criteria}</div>
              <div className="filter-options">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    className={`filter-chip ${selectedSort === opt.id ? 'active' : ''}`}
                    onClick={() => handleSelectSort(opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-label">{t.order}</div>
              <div className="filter-options order-options">
                {ORDER_OPTIONS.map((opt) => (
                  <button key={opt.id} className={`filter-chip order-chip ${selectedOrder === opt.id ? 'active' : ''}`} onClick={() => setSelectedOrder(opt.id)}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-label">{t.rating}:</div>
              <div className="filter-options">
                {RATING_RANGES.map((opt) => (
                  <button key={opt.id} className={`filter-chip ${selectedRating === opt.id ? 'active' : ''}`} onClick={() => setSelectedRating(opt.id)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-label">{t.status}</div>
              <div className="filter-options">
                <button className={`filter-chip ${isOpenNow ? 'active' : ''}`} onClick={() => setIsOpenNow(!isOpenNow)}>
                  <ClockIcon /> {t.openNow}
                </button>
              </div>
            </div>
            <div className="filter-actions">
              <button className="btn-apply-filter" onClick={handleApplyFilter}>{t.apply} <CheckIcon /></button>
              <button className="btn-reset-filter" onClick={handleResetFilter}>{t.reset}</button>
              <button className="btn-close-filter" onClick={() => setIsFilterOpen(false)}>{t.close}</button>
            </div>
          </div>
        )}

        {/* Grid Content */}
        {loading ? (
          <div className="loading-container"><div className="spinner"></div> {t.loading} {currentPage}...</div>
        ) : (
          <>
            <div className="restaurants-grid">
              {restaurants.length > 0 ? (
                restaurants.map((res) => {
                  const displayScore = getDisplayScore(res);
                  const categoryClass = getCategoryClass();
                  return (
                    <div key={res._id} className="rating-card clickable" onClick={() => openModal(res)}>
                      <div className="card-image-wrapper">
                        <Image src={res.avatarUrl || "/assets/image/pho.png"} alt={res.tenQuan} width={400} height={300} className="card-image" unoptimized={true} />
                        
                        <div className={`rating-badge ${categoryClass}`}>
                          {displayScore ? displayScore.toFixed(1) : "N/A"}
                          </div>
                      </div>
                      <div className="card-content">
                        <h3 className="restaurant-name">{res.tenQuan}</h3>
                        <p className="restaurant-address"><MapPinIcon /> {res.diaChi}</p>
                        <div className="card-meta-row">
                            <div className="meta-item price"><MoneyIcon /><span>{res.giaCa || t.priceUpdate}</span></div>
                            <div className="meta-item hours"><ClockIcon /><span>{res.gioMoCua || t.priceUpdate}</span></div>
                              <button 
                                className="btn-quick-route-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(res, true);
                                }}
                                data-tooltip={t.routeTooltip}
                              >
                                <DirectionIcon /> 
                              </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state-container">
                <div className="empty-state-icon"><SadSearchIcon /></div>
                <h3 className="empty-state-title">{t.noResultTitle}</h3>
                <p className="empty-state-desc">{t.noResultDesc}</p>
                <button className="btn-empty-reset" onClick={handleResetFilter}><RefreshIcon /> {t.clearAndRetry}</button>
              </div>
              )}
            </div>
            {restaurants.length > 0 && totalPages > 1 && (
              <div className="pagination-wrapper">
                <button className="page-btn prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&larr; {t.prev}</button>
                <div className="page-numbers"><span>{t.page} {currentPage} / {totalPages}</span></div>
                <button className="page-btn next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>{t.next} &rarr;</button>
              </div>
            )}
          </>
        )}

        {/* MODAL CHI TIẾT */}
        {selectedRes && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal}><XIcon /></button>
              <div className="modal-layout">
                <div className="modal-image-col">
                  <Image src={selectedRes.avatarUrl || "/assets/image/pho.png"} alt={selectedRes.tenQuan} width={900} height={700} className="modal-main-img" unoptimized={true} />
                  <div className="modal-rating-overlay">
                    <span className="big-score">{selectedRes.diemTrungBinh ? selectedRes.diemTrungBinh.toFixed(1) : "N/A"}</span>
                    <span className="score-label">{getRatingLabel(selectedRes.diemTrungBinh)}</span>
                  </div>
                </div>
                
                <div className="modal-info-col">
                  <h2 className="modal-title">{selectedRes.tenQuan}</h2>
                  <div className="modal-address">
                    <MapPinIcon />
                    <span>{selectedRes.diaChi}</span>
                  </div>
                   <div className="modal-meta-grid">
                      <div className="modal-meta-item"><ClockIcon /> {selectedRes.gioMoCua || t.priceUpdate}</div>
                      <div className="modal-meta-item highlight"><MoneyIcon /> {selectedRes.giaCa || t.priceUpdate}</div>
                   </div>

                   {/* --- KHU VỰC BẢN ĐỒ --- */}
                   <div className="map-section" style={{ marginTop: '20px', marginBottom: '15px' }}>
                     <button 
                        className="btn-show-map"
                        onClick={() => setShowMap(!showMap)}
                     >
                        <MapPinIcon /> {showMap ? t.hideMap : t.showMap}
                     </button>

                     {showMap && selectedRes.lat && selectedRes.lon && (
                        <div style={{ height: '350px', width: '100%', marginTop: '15px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ddd' }}>
                            <RoutingMap 
                                userLocation={userLocation} 
                                restaurantLocation={{ lat: selectedRes.lat, lon: selectedRes.lon }} 
                            />
                        </div>
                     )}
                     
                     {showMap && (!selectedRes.lat || !selectedRes.lon) && (
                        <p style={{color: '#d32f2f', fontSize: '14px', marginTop: '10px', textAlign: 'center'}}>
                            {t.noMapData}
                        </p>
                     )}
                   </div>
                   {/* ---------------------------------- */}

                   <hr className="modal-divider" />
                   <h4 className="detail-rating-heading">{t.detailRating}</h4>
                   <div className="rating-bars">
                      <RatingRow label={t.c_quality} score={selectedRes.diemChatLuong} />
                      <RatingRow label={t.c_location} score={selectedRes.diemViTri} />
                      <RatingRow label={t.c_space} score={selectedRes.diemKhongGian} />
                      <RatingRow label={t.c_service} score={selectedRes.diemPhucVu} />
                      <RatingRow label={t.c_price} score={selectedRes.diemGiaCa} />
                   </div>
                  <Link href={`/restaurants/${selectedRes._id}`} className="btn-go-detail" onClick={(e) => { e.stopPropagation(); document.body.style.overflow = 'unset'; }}>{t.viewDetail}</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <button className={`back-to-top ${showBackToTop ? 'visible' : ''}`} onClick={scrollToTop} aria-label="Back to Top"><ArrowUpIcon /></button>
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={
      <div className="loading-container">
        <div className="spinner"></div> Loading...
      </div>
    }>
      <RestaurantsContent />
    </Suspense>
  );
}