// app/(main)/restaurants/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { getRestaurantById } from "@/app/lib/api";
import "./RestaurantDetail.css";

// Icons (Giữ nguyên)
const MapIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>;
const ClockIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const MoneyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path></svg>;
const GlobeIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;
const LinkIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>;

interface RestaurantDetail {
  _id: string;
  tenQuan: string;
  diaChi: string;
  gioMoCua: string;
  giaCa: string;
  diemTrungBinh: number;
  avatarUrl: string;
  urlGoc: string;
  lat: number;
  lon: number;
  diemKhongGian: number;
  diemViTri: number;
  diemChatLuong: number;
  diemPhucVu: number;
  diemGiaCa: number;
}

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const [res, setRes] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const data = await getRestaurantById(id as string);
        setRes(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading-screen">Đang tải dữ liệu nhà hàng...</div>;
  if (!res) return <div className="loading-screen">Không tìm thấy nhà hàng này.</div>;

  return (
    <div className="detail-page-wrapper">
      <div className="container">
        
        {/* --- HERO SECTION --- */}
        <div className="detail-hero">
          <Image 
            src={res.avatarUrl || "/assets/image/pho.png"} 
            /* [FIX] Thêm fallback string cho alt để tránh lỗi */
            alt={res.tenQuan || "Restaurant Image"} 
            width={1200} height={600} 
            className="detail-hero-img"
            unoptimized={true}
          />
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>{res.tenQuan}</h1>
              <div className="hero-rating">
                <div className="hero-score">
                  {/* [FIX] Kiểm tra tồn tại trước khi toFixed */}
                  {res.diemTrungBinh ? res.diemTrungBinh.toFixed(1) : "N/A"}
                </div>
                <div className="hero-address">
                  <MapIcon /> {res.diaChi}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MAIN INFO GRID --- */}
        <div className="detail-content">
          
          <div className="left-col">
            <div className="info-box">
              <h3 className="section-heading">Thông tin chung</h3>
              
              <div className="info-row">
                <div className="info-icon"><MoneyIcon /></div>
                <div>
                  <span className="info-label">Mức giá:</span>
                  <span>{res.giaCa || "Đang cập nhật"}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon"><ClockIcon /></div>
                <div>
                  <span className="info-label">Giờ mở cửa:</span>
                  <span>{res.gioMoCua || "Đang cập nhật"}</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-icon"><GlobeIcon /></div>
                <div>
                  <span className="info-label">Tọa độ GPS:</span>
                  <span>{res.lat && res.lon ? `${res.lat}, ${res.lon}` : "Chưa có tọa độ"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="right-col">
            <div className="rating-box">
              <h3>Chi tiết đánh giá</h3>
              
              <RatingBar label="Chất lượng" score={res.diemChatLuong} />
              <RatingBar label="Vị trí" score={res.diemViTri} />
              <RatingBar label="Không gian" score={res.diemKhongGian} />
              <RatingBar label="Phục vụ" score={res.diemPhucVu} />
              <RatingBar label="Giá cả" score={res.diemGiaCa} />

              {res.urlGoc && (
                <a href={res.urlGoc} target="_blank" rel="noopener noreferrer" className="btn-foody">
                  Xem trên Foody <LinkIcon />
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Component thanh điểm
const RatingBar = ({ label, score }: { label: string, score: number }) => (
  <div className="rating-bar-item">
    <div className="rating-bar-header">
      <span className="r-label">{label}</span>
      {/* [FIX] Kiểm tra score trước khi toFixed */}
      <span className="r-score">
        {(score !== undefined && score !== null) ? score.toFixed(1) : "-"}
      </span>
    </div>
    <div className="progress-bg">
      <div className="progress-fill" style={{ width: `${(score || 0) * 10}%` }}></div>
    </div>
  </div>
);