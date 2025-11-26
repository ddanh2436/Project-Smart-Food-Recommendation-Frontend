"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { getTopSpaceRestaurants } from "@/app/lib/api"; // Import hàm API mới
import "./TopRatingSection.css"; // Tái sử dụng CSS của Top Rated
import { useAuth } from "@/app/contexts/AuthContext";

// Giữ nguyên các Icon SVG như cũ
const ChevronLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevronRight = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
const ClockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MoneyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

interface Restaurant {
  _id: string;
  tenQuan: string;
  diaChi: string;
  gioMoCua: string;
  giaCa: string;
  diemTrungBinh: number;
  avatarUrl: string;
  diemKhongGian: number; // Trường quan trọng cho section này
  diemViTri: number;
  diemChatLuong: number;
  diemPhucVu: number;
  diemGiaCa: number;
}

const TopSpaceSection = () => {
  const { T } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRes, setSelectedRes] = useState<Restaurant | null>(null);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  // === THAY ĐỔI 1: Gọi API getTopSpaceRestaurants ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTopSpaceRestaurants(10);
        setRestaurants(data);
      } catch (error) {
        console.error("Failed to fetch top space:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Logic Rating Label (Có thể tái sử dụng hoặc import từ utils)
  const getRatingLabel = (score: number) => {
    if (!score && score !== 0) return "N/A";
    if (score >= 9.0) return "Xuất sắc";
    if (score >= 8.0) return "Rất tốt";
    if (score >= 7.0) return "Tốt";
    if (score >= 6.0) return "Khá";
    if (score >= 5.0) return "Trung bình";
    return "Cần cải thiện";
  };

  const handleScrollButton = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 340;
      direction === 'left' ? sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' }) : sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Drag logic (Giữ nguyên)
  const onMouseDown = (e: React.MouseEvent) => { if (!sliderRef.current) return; isDown.current = true; isDragging.current = false; sliderRef.current.classList.add('active'); startX.current = e.pageX - sliderRef.current.offsetLeft; scrollLeft.current = sliderRef.current.scrollLeft; };
  const onMouseLeave = () => { if (!sliderRef.current) return; isDown.current = false; sliderRef.current.classList.remove('active'); };
  const onMouseUp = () => { if (!sliderRef.current) return; isDown.current = false; sliderRef.current.classList.remove('active'); setTimeout(() => { isDragging.current = false; }, 0); };
  const onMouseMove = (e: React.MouseEvent) => { if (!isDown.current || !sliderRef.current) return; e.preventDefault(); const x = e.pageX - sliderRef.current.offsetLeft; const walk = (x - startX.current) * 2; sliderRef.current.scrollLeft = scrollLeft.current - walk; if (Math.abs(walk) > 5) isDragging.current = true; };

  const handleCardClick = (res: Restaurant) => { if (!isDragging.current) openModal(res); };
  const openModal = (res: Restaurant) => { setSelectedRes(res); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { setSelectedRes(null); document.body.style.overflow = 'unset'; };

  return (
    <section className="top-rating-section">
      <div className="container">
        {/* === TIÊU ĐỀ RIÊNG BIỆT: Space === */}
        <div className="section-header-row">
          <div>
            <h2 className="section-title">{T.home.spaceTitle}</h2>
            <p className="section-subtitle">{T.home.spaceSub}</p>
          </div>
          <Link href="/restaurants" className="link-view-all">{T.common.viewAll} &rarr;</Link>
        </div>

        <div className="slider-wrapper">
          <button className="nav-btn prev-btn" onClick={() => handleScrollButton('left')}><ChevronLeft /></button>
          <div 
            className="rating-slider" 
            ref={sliderRef}
            onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} onMouseUp={onMouseUp} onMouseMove={onMouseMove}
          >
            {loading ? (
               [...Array(5)].map((_, i) => <div key={i} className="skeleton-card"></div>)
            ) : (
              restaurants.map((res) => (
                <div key={res._id} className="rating-card clickable" onClick={() => handleCardClick(res)}>
                  <div className="card-image-wrapper">
                    <Image
                      src={res.avatarUrl || "/assets/image/pho.png"} 
                      alt={res.tenQuan}
                      width={400} height={300}
                      className="card-image"
                      unoptimized={true}
                      draggable={false}
                    />
                    {/* === THAY ĐỔI 3: Hiển thị điểm KHÔNG GIAN lên Badge (Màu khác nếu muốn) === */}
                    <div className="rating-badge" style={{backgroundColor: '#00b894'}}>
                        {res.diemKhongGian ? res.diemKhongGian.toFixed(1) : "N/A"}
                    </div>
                  </div>
                  <div className="card-content">
                    <h3 className="restaurant-name">{res.tenQuan}</h3>
                    <p className="restaurant-address"><MapPinIcon /> {res.diaChi}</p>
                    <div className="card-meta-row">
                        <div className="meta-item price"><MoneyIcon /><span>{res.giaCa || "Đang cập nhật"}</span></div>
                        <div className="meta-item hours"><ClockIcon /><span>{res.gioMoCua || "Đang cập nhật"}</span></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="nav-btn next-btn" onClick={() => handleScrollButton('right')}><ChevronRight /></button>
        </div>

        {/* === MODAL PANEL (Giữ nguyên cấu trúc, chỉ highlight điểm không gian) === */}
        {selectedRes && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal}><XIcon /></button>
              
              <div className="modal-layout">
                <div className="modal-image-col">
                  <Image 
                    src={selectedRes.avatarUrl || "/assets/image/pho.png"} 
                    alt={selectedRes.tenQuan} 
                    width={900} height={700} 
                    className="modal-main-img"
                    unoptimized={true}
                  />
                  
                  {/* Hiển thị điểm Không gian chính trong Modal */}
                  <div className="modal-rating-overlay" style={{background: 'rgba(0, 184, 148, 0.9)'}}>
                    <span className="big-score">
                        {selectedRes.diemKhongGian ? selectedRes.diemKhongGian.toFixed(1) : "N/A"}
                    </span>
                    <span className="score-label">Không gian</span>
                  </div>
                </div>

                <div className="modal-info-col">
                  <h2 className="modal-title">{selectedRes.tenQuan}</h2>
                  <p className="modal-address"><MapPinIcon /> {selectedRes.diaChi}</p>
                  
                  <div className="modal-meta-grid">
                    <div className="modal-meta-item"><ClockIcon /> {selectedRes.gioMoCua || "Đang cập nhật"}</div>
                    <div className="modal-meta-item highlight"><MoneyIcon /> {selectedRes.giaCa || "Đang cập nhật"}</div>
                  </div>

                  <hr className="modal-divider" />

                  <h4 className="detail-rating-heading">Đánh giá chi tiết</h4>
                  <div className="rating-bars">
                    {/* Highlight dòng Không gian */}
                    <RatingRow label="Không gian" score={selectedRes.diemKhongGian} highlight={true} />
                    <RatingRow label="Chất lượng" score={selectedRes.diemChatLuong} />
                    <RatingRow label="Vị trí" score={selectedRes.diemViTri} />
                    <RatingRow label="Phục vụ" score={selectedRes.diemPhucVu} />
                    <RatingRow label="Giá cả" score={selectedRes.diemGiaCa} />
                  </div>

                  <Link 
                    href={`/restaurants/${selectedRes._id}`} 
                    className="btn-go-detail"
                    onClick={(e) => { e.stopPropagation(); document.body.style.overflow = 'unset'; }}
                  >
                    Xem chi tiết đầy đủ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Cập nhật Component con RatingRow để hỗ trợ highlight
const RatingRow = ({ label, score, highlight = false }: { label: string, score: number, highlight?: boolean }) => (
  <div className="rating-row">
    <span className={`rating-label ${highlight ? 'font-bold text-green-600' : ''}`}>{label}</span>
    <div className="rating-bar-bg">
        <div 
            className="rating-bar-fill" 
            style={{ 
                width: `${(score || 0) * 10}%`,
                backgroundColor: highlight ? '#00b894' : undefined 
            }}
        ></div>
    </div>
    <span className="rating-value">{score ? score.toFixed(1) : "-"}</span>
  </div>
);

export default TopSpaceSection;