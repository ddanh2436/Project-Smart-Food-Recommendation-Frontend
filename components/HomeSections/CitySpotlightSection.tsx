// components/HomeSections/CitySpotlightSection.tsx
"use client";

import React from 'react';
import './CitySpotlightSection.css';
import { useTranslation } from '@/app/hooks/useTranslation';
import Image from 'next/image';
import Link from 'next/link';
import { ScoreBadge } from "@/components/Score/Score";

export interface Restaurant {
  id: string;
  name: string;
  dish: string;
  dishEn: string;
  image: string;
  rating: number;
  address: string;
}

export interface CitySpotlightProps {
  cityId: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  coverImage: string;
  restaurants: Restaurant[];
  reverseLayout?: boolean;
}

const CitySpotlightSection: React.FC<CitySpotlightProps> = ({
  cityId,
  title,
  titleEn,
  description,
  descriptionEn,
  coverImage,
  restaurants,
  reverseLayout = false,
}) => {
  // Language from the shared hook instead of a private copy read from its own
  // storage key, which could disagree with the header after a reload.
  const { lang } = useTranslation();

  const t = (vi: string, en: string) => (lang === 'vi' ? vi : en);
  const displayRestaurants = restaurants.slice(0, 3);

  return (
    <section 
      className={`city-spotlight-section ${reverseLayout ? 'reverse' : ''}`} 
      id={`spotlight-${cityId}`}
      // [THAY ĐỔI] Đưa ảnh làm hình nền full section
      style={{ backgroundImage: `url('${coverImage}')` }}
    >
      {/* [THÊM] Lớp phủ tối để chữ dễ đọc hơn trên nền ảnh */}
      <div className="section-overlay"></div>

      <div className="spotlight-container">
        
        {/* --- Cột Thông Tin --- */}
        <div className="spotlight-info">
          <span className="spotlight-badge">
            {t('📍 Điểm Đến Ẩm Thực', '📍 Culinary Destination')}
          </span>
          
          <div className="title-group">
             <h2 className="spotlight-title">
               {t(title, titleEn)}
             </h2>
             <span className="spotlight-subtitle">
               {t(titleEn, title)}
             </span>
          </div>
          
          <p className="spotlight-desc">
            {t(description, descriptionEn || description)}
          </p>
          
          <Link href={`/restaurants?city=${cityId}`} className="spotlight-btn">
            {t('Khám phá ngay', 'Explore now')} <span>&rarr;</span>
          </Link>
        </div>

        {/* --- Cột Cards --- */}
        <div className="spotlight-visuals">
            {/* Đã XÓA phần bg-image-wrapper cũ */}

            <div className="restaurant-cards">
                {displayRestaurants.map((res) => (
                <Link href={`/restaurants/${res.id}`} key={res.id} className="res-card">
                    <div className="res-img-wrapper">
                        <Image 
                            src={res.image || '/assets/image/pho.png'} 
                            alt={res.name} 
                            width={120} height={120} 
                            className="res-img" 
                            // Straight from the CDN, like every other listing:
                            // through the optimiser this host was refused.
                            unoptimized
                        />
                    </div>
                    <div className="res-details">
                        <h4 className="res-name">{res.name}</h4>
                        <div className="res-dish">
                            <span className="dish-icon">🍜</span>
                            <span className="dish-name">{t(res.dish, res.dishEn)}</span>
                        </div>
                        <div className="res-meta-row">
                           <div className="res-rating"><ScoreBadge score={res.rating} withScale /></div>
                           <span className="dot">•</span>
                           <div className="res-address">{res.address}</div>
                        </div>
                    </div>
                </Link>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
};

export default CitySpotlightSection;