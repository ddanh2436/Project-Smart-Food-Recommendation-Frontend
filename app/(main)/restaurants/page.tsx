"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllRestaurants } from "@/app/lib/api";
import "./RestaurantsPage.css";
import dynamic from "next/dynamic";

// Import component bản đồ (Dynamic để tránh lỗi SSR)
const RoutingMap = dynamic(() => import("@/components/RoutingMap/RoutingMap"), {
  ssr: false,
  loading: () => <div style={{ padding: '20px', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>Đang tải bản đồ chỉ đường...</div>,
});

// Các Icons
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

const getRatingLabel = (score: number) => {
  if (!score && score !== 0) return "N/A";
  if (score >= 9.0) return "Xuất sắc";
  if (score >= 8.0) return "Rất tốt";
  if (score >= 7.0) return "Tốt";
  if (score >= 6.0) return "Khá";
  if (score >= 5.0) return "Trung bình";
  return "Cần cải thiện";
};

const SORT_OPTIONS = [
  { id: 'default', label: 'Mới nhất' },
  { id: 'distance', label: 'Gần tôi nhất' },
  { id: 'quality', label: 'Chất lượng món ăn' },
  { id: 'space', label: 'Không gian đẹp' },
  { id: 'location', label: 'Vị trí thuận lợi' },
  { id: 'service', label: 'Phục vụ tốt' },
  { id: 'price', label: 'Giá cả hợp lý' },
];

const RATING_RANGES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'gte9', label: 'Xuất sắc (> 9.0)' },
  { id: '8to9', label: 'Rất tốt (8.0 - 9.0)' },
  { id: '7to8', label: 'Tốt (7.0 - 8.0)' },
  { id: '6to7', label: 'Khá (6.0 - 7.0)' },
  { id: 'lt6', label: 'Bình dân (< 6.0)' },
];

const ORDER_OPTIONS = [
  { id: 'desc', label: 'Cao đến Thấp (Giảm dần)', icon: <SortDescIcon /> },
  { id: 'asc', label: 'Thấp đến Cao (Tăng dần)', icon: <SortAscIcon /> },
];

const RatingRow = ({ label, score }: { label: string, score: number }) => (
  <div className="rating-row">
    <span className="rating-label">{label}</span>
    <div className="rating-bar-bg"><div className="rating-bar-fill" style={{ width: `${(score || 0) * 10}%` }}></div></div>
    <span className="rating-value">{score ? score.toFixed(1) : "-"}</span>
  </div>
);

function RestaurantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const [selectedRes, setSelectedRes] = useState<Restaurant | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showMap, setShowMap] = useState(false); 

  // --- CẬP NHẬT: LOGIC LẤY GPS NGƯỜI DÙNG ---
  // Khởi tạo mặc định (ví dụ: trung tâm TP.HCM)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>({
    lat: 10.748017595600404, 
    lon: 106.6767808260947
  });

  // useEffect để xin quyền và lấy vị trí thực tế
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
          // Giữ nguyên vị trí mặc định nếu không lấy được
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, []); // Chạy 1 lần khi component mount
  // ------------------------------------------------

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

    if (!order) {
      if (sort === 'distance' || sort === 'price') order = 'asc';
      else order = 'desc';
    }

    setCurrentPage(page);
    setActiveSort(sort);
    setActiveRating(rating);
    setActiveOrder(order);
    setActiveOpenNow(open);
    
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
          page, LIMIT, dbSortBy, order!, rating, String(open), latStr, lonStr, search
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
  }, [searchParams, userLocation]); // userLocation thay đổi sẽ trigger fetch lại

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
  const getOrderLabelText = (id: string) => id === 'asc' ? 'Tăng dần' : 'Giảm dần';

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

  return (
    <div className="restaurants-page-wrapper">
      <div className="container">
        
        <div className="page-header">
          <h1 className="page-title">Khám phá Nhà hàng</h1>
          <p className="page-subtitle">Bộ sưu tập những địa điểm ẩm thực tốt nhất</p>
        </div>

        {/* Toggle Button */}
        <button 
          className={`filter-toggle-btn ${isFilterOpen ? 'active' : ''}`}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <FilterIcon /> 
          <span>Bộ lọc nâng cao</span>
          <ChevronDownIcon />
        </button>

        {/* Active Indicators */}
        {(activeSort !== 'default' || activeRating !== 'all' || activeOrder !== 'desc' || activeOpenNow) && (
          <div className="active-filters-bar">
            <span className="active-filters-label">Đang lọc theo:</span>
            
            {activeSort !== 'default' && <div className="active-tag">Sắp xếp: {getSortLabel(activeSort)}</div>}
            {activeOrder !== 'desc' && <div className="active-tag">Thứ tự: {getOrderLabelText(activeOrder)}</div>}
            {activeRating !== 'all' && <div className="active-tag">Điểm số: {getRatingLabelText(activeRating)}</div>}
            {activeOpenNow && <div className="active-tag"><ClockIcon /> Đang mở cửa</div>}

            <button className="btn-clear-all" onClick={handleResetFilter}>Xóa bộ lọc</button>
          </div>
        )}

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="advanced-filter-panel">
            <div className="filter-row">
              <div className="filter-label">Tiêu chí:</div>
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
              <div className="filter-label">Thứ tự:</div>
              <div className="filter-options order-options">
                {ORDER_OPTIONS.map((opt) => (
                  <button key={opt.id} className={`filter-chip order-chip ${selectedOrder === opt.id ? 'active' : ''}`} onClick={() => setSelectedOrder(opt.id)}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-label">Điểm số:</div>
              <div className="filter-options">
                {RATING_RANGES.map((opt) => (
                  <button key={opt.id} className={`filter-chip ${selectedRating === opt.id ? 'active' : ''}`} onClick={() => setSelectedRating(opt.id)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-row">
              <div className="filter-label">Trạng thái:</div>
              <div className="filter-options">
                <button className={`filter-chip ${isOpenNow ? 'active' : ''}`} onClick={() => setIsOpenNow(!isOpenNow)}>
                  <ClockIcon /> Đang mở cửa
                </button>
              </div>
            </div>
            <div className="filter-actions">
              <button className="btn-apply-filter" onClick={handleApplyFilter}>Lọc kết quả <CheckIcon /></button>
              <button className="btn-reset-filter" onClick={handleResetFilter}>Reset</button>
              <button className="btn-close-filter" onClick={() => setIsFilterOpen(false)}>Đóng</button>
            </div>
          </div>
        )}

        {/* Grid Content */}
        {loading ? (
          <div className="loading-container"><div className="spinner"></div> Đang tải dữ liệu trang {currentPage}...</div>
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
                            <div className="meta-item price"><MoneyIcon /><span>{res.giaCa || "Đang cập nhật"}</span></div>
                            <div className="meta-item hours"><ClockIcon /><span>{res.gioMoCua || "Đang cập nhật"}</span></div>
                              <button 
                                className="btn-quick-route-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(res, true);
                                }}
                                data-tooltip="Chỉ đường tới quán"
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
                <h3 className="empty-state-title">Không tìm thấy kết quả</h3>
                <p className="empty-state-desc">Rất tiếc, chúng tôi không tìm thấy nhà hàng nào phù hợp.</p>
                <button className="btn-empty-reset" onClick={handleResetFilter}><RefreshIcon /> Xóa bộ lọc & Thử lại</button>
              </div>
              )}
            </div>
            {restaurants.length > 0 && totalPages > 1 && (
              <div className="pagination-wrapper">
                <button className="page-btn prev" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>&larr; Trước</button>
                <div className="page-numbers"><span>Trang {currentPage} / {totalPages}</span></div>
                <button className="page-btn next" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Sau &rarr;</button>
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
                      <div className="modal-meta-item"><ClockIcon /> {selectedRes.gioMoCua || "Đang cập nhật"}</div>
                      <div className="modal-meta-item highlight"><MoneyIcon /> {selectedRes.giaCa || "Đang cập nhật"}</div>
                   </div>

                   {/* --- KHU VỰC BẢN ĐỒ --- */}
                   <div className="map-section" style={{ marginTop: '20px', marginBottom: '15px' }}>
                     <button 
                        className="btn-show-map"
                        onClick={() => setShowMap(!showMap)}
                     >
                        <MapPinIcon /> {showMap ? "Ẩn bản đồ chỉ đường" : "Xem đường đi đến quán"}
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
                            Rất tiếc, quán này chưa có dữ liệu tọa độ để chỉ đường.
                        </p>
                     )}
                   </div>
                   {/* ---------------------------------- */}

                   <hr className="modal-divider" />
                   <h4 className="detail-rating-heading">Đánh giá chi tiết</h4>
                   <div className="rating-bars">
                      <RatingRow label="Chất lượng" score={selectedRes.diemChatLuong} />
                      <RatingRow label="Vị trí" score={selectedRes.diemViTri} />
                      <RatingRow label="Không gian" score={selectedRes.diemKhongGian} />
                      <RatingRow label="Phục vụ" score={selectedRes.diemPhucVu} />
                      <RatingRow label="Giá cả" score={selectedRes.diemGiaCa} />
                   </div>
                  <Link href={`/restaurants/${selectedRes._id}`} className="btn-go-detail" onClick={(e) => { e.stopPropagation(); document.body.style.overflow = 'unset'; }}>Xem chi tiết đầy đủ</Link>
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
        <div className="spinner"></div> Đang tải...
      </div>
    }>
      <RestaurantsContent />
    </Suspense>
  );
}