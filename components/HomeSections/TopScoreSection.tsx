"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { getTopRestaurants, type Restaurant } from "@/app/lib/api";
import { formatRating, formatReviewCount, ratingLabel } from "@/app/lib/rating";
import { ScoreBadge } from "@/components/Score/Score";
import "./TopRatingSection.css";
import { useTranslation } from "@/app/hooks/useTranslation";

const ChevronLeft = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const ChevronRight = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
const ClockIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MoneyIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const MapPinIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const XIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

/*
  One home-page rail per criterion. These were five copy-pasted components
  (TopSpace/Quality/Service/Price/LocationSection) that differed only in the
  score field, the colour and the strings, and had drifted in small ways: one
  printed "Đang cập nhật" where the others printed "---".
*/
const CRITERIA = {
  quality: { field: "diemChatLuong", color: "#e17055" },
  space: { field: "diemKhongGian", color: "#00b894" },
  location: { field: "diemViTri", color: "#0984e3" },
  price: { field: "diemGiaCa", color: "#00b894" },
  service: { field: "diemPhucVu", color: "#6c5ce7" },
} as const;

export type Criterion = keyof typeof CRITERIA;

const TopScoreSection = ({ criterion }: { criterion: Criterion }) => {
  const { field, color } = CRITERIA[criterion];
  // 8-digit hex: the colour at 90% opacity, as the overlays used.
  const overlay = `${color}e6`;
  const { lang, t: T } = useTranslation();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRes, setSelectedRes] = useState<Restaurant | null>(null);

  const sliderRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => { return () => { document.body.style.overflow = 'unset'; }; }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setRestaurants(await getTopRestaurants(field, 10));
      } catch (error) {
        console.error(`Failed to fetch top ${criterion}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [field, criterion]);

  const handleScrollButton = (direction: 'left' | 'right') => {
    sliderRef.current?.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
  };

  // Drag Logic
  const onMouseDown = (e: React.MouseEvent) => { if (!sliderRef.current) return; isDown.current = true; isDragging.current = false; sliderRef.current.classList.add('active'); startX.current = e.pageX - sliderRef.current.offsetLeft; scrollLeft.current = sliderRef.current.scrollLeft; };
  const onMouseLeave = () => { if (!sliderRef.current) return; isDown.current = false; sliderRef.current.classList.remove('active'); };
  const onMouseUp = () => { if (!sliderRef.current) return; isDown.current = false; sliderRef.current.classList.remove('active'); setTimeout(() => { isDragging.current = false; }, 0); };
  const onMouseMove = (e: React.MouseEvent) => { if (!isDown.current || !sliderRef.current) return; e.preventDefault(); const x = e.pageX - sliderRef.current.offsetLeft; const walk = (x - startX.current) * 2; sliderRef.current.scrollLeft = scrollLeft.current - walk; if (Math.abs(walk) > 5) isDragging.current = true; };

  const handleCardClick = (res: Restaurant) => { if (!isDragging.current) openModal(res); };
  const openModal = (res: Restaurant) => { setSelectedRes(res); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { setSelectedRes(null); document.body.style.overflow = 'unset'; };

  const labels = T.restaurantPage.labels;
  // The highlighted criterion first, then the rest in a fixed order.
  const rows = [criterion, ...(Object.keys(CRITERIA) as Criterion[]).filter((c) => c !== criterion)];

  return (
    <section className="top-rating-section">
      <div className="container">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">{T.home[`${criterion}Title`]}</h2>
            <p className="section-subtitle">{T.home[`${criterion}Sub`]}</p>
          </div>
          <Link href="/restaurants" className="link-view-all">{T.common.viewAll} &rarr;</Link>
        </div>

        <div className="slider-wrapper">
          <button className="nav-btn prev-btn" onClick={() => handleScrollButton('left')}><ChevronLeft /></button>
          <div className="rating-slider" ref={sliderRef} onMouseDown={onMouseDown} onMouseLeave={onMouseLeave} onMouseUp={onMouseUp} onMouseMove={onMouseMove}>
            {loading ? (
               [...Array(5)].map((_, i) => <div key={i} className="skeleton-card"></div>)
            ) : (
              restaurants.map((res) => (
                <div key={res._id} className="rating-card clickable" onClick={() => handleCardClick(res)}>
                    <div className="card-image-wrapper">
                      <Image src={res.avatarUrl || "/assets/image/pho.png"} alt={res.tenQuan} width={400} height={300} className="card-image" unoptimized={true} draggable={false} />
                      <div className="rating-badge" style={{ backgroundColor: color }}>
                        <ScoreBadge score={res[field]} />
                      </div>
                      {criterion === "price" && (
                        <div style={{
                          position: 'absolute', bottom: 10, left: 10,
                          background: overlay, color: 'white',
                          padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold'
                        }}>
                          {T.home.goodValueBadge}
                        </div>
                      )}
                    </div>
                    <div className="card-content">
                      <h3 className="restaurant-name">{res.tenQuan}</h3>
                      <p className="card-tag-row">
                        <span className="card-category">{labels[criterion]} <strong>{formatRating(res[field])}</strong></span>
                        {formatReviewCount(res.reviewCount, lang) && (
                          <span className="card-review-count">
                            · {formatReviewCount(res.reviewCount, lang)}
                          </span>
                        )}
                      </p>
                      <p className="restaurant-address"><MapPinIcon /> {res.diaChi}</p>
                      <div className="card-meta-row">
                          <div className="meta-item price"><MoneyIcon /><span>{res.giaCa || "---"}</span></div>
                          <div className="meta-item hours"><ClockIcon /><span>{res.gioMoCua || "---"}</span></div>
                      </div>
                    </div>
                  </div>
              ))
            )}
          </div>
          <button className="nav-btn next-btn" onClick={() => handleScrollButton('right')}><ChevronRight /></button>
        </div>

        {selectedRes && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={closeModal}><XIcon /></button>
              <div className="modal-layout">
                <div className="modal-image-col">
                  <Image src={selectedRes.avatarUrl || "/assets/image/pho.png"} alt={selectedRes.tenQuan} width={900} height={700} className="modal-main-img" unoptimized={true} />
                  <div className="modal-rating-overlay" style={{ background: overlay }}>
                    <span className="big-score"><ScoreBadge score={selectedRes[field]} withScale /></span>
                    <span className="score-label">
                      {ratingLabel(selectedRes[field], T)}
                    </span>
                  </div>
                </div>
                <div className="modal-info-col">
                  <h2 className="modal-title">{selectedRes.tenQuan}</h2>
                  <p className="modal-address"><MapPinIcon /> {selectedRes.diaChi}</p>
                  <div className="modal-meta-grid">
                    <div className="modal-meta-item"><ClockIcon /> {selectedRes.gioMoCua || T.common.updating}</div>
                    <div className="modal-meta-item highlight"><MoneyIcon /> {selectedRes.giaCa || T.common.updating}</div>
                  </div>
                  <hr className="modal-divider" />
                  <h4 className="detail-rating-heading">{T.restaurantPage.filterRating}</h4>
                  <div className="rating-bars">
                    {rows.map((c) => (
                      <RatingRow key={c} label={labels[c]} score={selectedRes[CRITERIA[c].field]}
                        highlight={c === criterion} color={color} />
                    ))}
                  </div>
                  <Link href={`/restaurants/${selectedRes._id}`} className="btn-go-detail" onClick={(e) => { e.stopPropagation(); document.body.style.overflow = 'unset'; }}>
                    {T.common.details}
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

const RatingRow = ({ label, score, highlight, color }: { label: string, score?: number, highlight?: boolean, color?: string }) => (
  <div className="rating-row">
    <span className={`rating-label ${highlight ? 'font-bold' : ''}`} style={{color: highlight ? color : ''}}>{label}</span>
    <div className="rating-bar-bg"><div className="rating-bar-fill" style={{ width: `${(score || 0) * 10}%`, backgroundColor: highlight ? color : undefined }}></div></div>
    <span className="rating-value">{score ? score.toFixed(1) : "-"}</span>
  </div>
);

export default TopScoreSection;
