// app/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// [FIX] Import api từ lib thay vì dùng axios trực tiếp để đảm bảo BaseURL đúng (3001)
import api from '@/app/lib/api'; 
import { useRouter } from 'next/navigation';

// === TỪ ĐIỂN SONG NGỮ ĐƯỢC NHÚNG TRỰC TIẾP ===
const embeddedTranslations = {
  vn: {
    // ... (Giữ nguyên phần từ điển của bạn)
    common: {
      loading: "Đang tải...",
      viewAll: "Xem tất cả",
      details: "Xem chi tiết",
      search: "Tìm kiếm",
      updating: "Đang cập nhật",
      open: "Mở cửa",
      close: "Đóng cửa",
      distance: "km",
      confirm: "Xác nhận",
      cancel: "Hủy bỏ",
    },
    home: {
      heroTitle: "Khám phá ẩm thực Việt",
      heroSubtitle: "Tìm kiếm hương vị yêu thích của bạn",
      heroSearchPlaceholder: "Tìm kiếm nhà hàng, món ăn...",
      topRatedTitle: "Nhà hàng được yêu thích",
      topRatedSub: "Khám phá những địa điểm được đánh giá cao",
      qualityTitle: "Hương Vị Đỉnh Cao",
      qualitySub: "Top nhà hàng có chất lượng món ăn tốt nhất",
      spaceTitle: "Không Gian Ấn Tượng",
      spaceSub: "Top những quán có view đẹp & không gian chill nhất",
      serviceTitle: "Dịch Vụ Tuyệt Vời",
      serviceSub: "Top quán có chất lượng phục vụ chu đáo nhất",
      priceTitle: "Giá Cả Hợp Lý",
      priceSub: "Top quán có mức giá phù hợp với nhiều đối tượng",
      locationTitle: "Vị Trí Đắc Địa",
      locationSub: "Dễ dàng di chuyển, trung tâm và thuận tiện",
    },
    restaurantPage: {
      filterRating: "Đánh giá chi tiết",
      labels: {
        quality: "Chất lượng",
        service: "Phục vụ",
        space: "Không gian",
        price: "Giá cả",
        location: "Vị trí",
      },
      ratingText: {
        excellent: "Xuất sắc",
        good: "Rất tốt",
        average: "Tốt",
        bad: "Cần cải thiện",
      }
    },
    nav: {
        home: "Trang chủ",
        restaurants: "Nhà hàng",
        nearMe: "Gần tôi",
        foodsDrinks: "Món ăn & Đồ uống",
        aboutUs: "Về chúng tôi",
        loginSignup: "Đăng nhập / Đăng ký",
        logout: "Đăng xuất", 
        langVietnamese: "Tiếng Việt",
        langEnglish: "English",
    },
    auth: {
        loginTitle: "Đăng nhập",
        logoutSuccess: "Đăng xuất thành công!",
        logoutConfirmTitle: "Xác nhận Đăng xuất",
        logoutConfirmMsg: "Bạn có chắc chắn muốn đăng xuất không?",
        logoutYes: "Đăng xuất",
        logoutCancel: "Hủy bỏ",
    },
  },
  en: {
    // ... (Giữ nguyên phần tiếng Anh của bạn)
    common: {
      loading: "Loading...",
      viewAll: "View All",
      details: "View Details",
      search: "Search",
      updating: "Updating",
      open: "Open",
      close: "Closed",
      distance: "km",
      confirm: "Confirm",
      cancel: "Cancel",
    },
    home: {
      heroTitle: "Explore Vietnamese Cuisine",
      heroSubtitle: "Search for your favorite flavors",
      heroSearchPlaceholder: "Search restaurants, dishes...",
      topRatedTitle: "Top Rated Restaurants",
      topRatedSub: "Explore the most highly rated places",
      qualityTitle: "Top Quality Flavor",
      qualitySub: "Top restaurants with the best food quality",
      spaceTitle: "Impressive Ambience",
      spaceSub: "Top places with great views & chill vibes",
      serviceTitle: "Excellent Service",
      serviceSub: "Top restaurants with the most attentive service quality",
      priceTitle: "Affordable Price",
      priceSub: "Top restaurants with reasonable prices for many people",
      locationTitle: "Prime Location",
      locationSub: "Central, convenient and easy to reach",
    },
    restaurantPage: {
      filterRating: "Rating",
      labels: {
        quality: "Quality",
        service: "Service",
        space: "Ambience",
        price: "Price",
        location: "Location",
      },
      ratingText: {
        excellent: "Excellent",
        good: "Very Good",
        average: "Good",
        bad: "Needs Improvement",
      }
    },
    nav: {
        home: "Home",
        restaurants: "Restaurants",
        nearMe: "Near Me",
        foodsDrinks: "Foods and Drinks",
        aboutUs: "About us",
        loginSignup: "Login / Sign Up",
        logout: "Logout", 
        langVietnamese: "Tiếng Việt",
        langEnglish: "English",
    },
    auth: {
        loginTitle: "Login",
        logoutSuccess: "Logout successful!",
        logoutConfirmTitle: "Confirm Logout",
        logoutConfirmMsg: "Are you sure you want to log out?",
        logoutYes: "Yes, Log Out",
        logoutCancel: "Cancel",
    },
  },
};
// === KẾT THÚC KHỐI TỪ ĐIỂN ===

interface User {
  id: string;
  email: string;
  username: string;
  picture?: string;
  // [FIX] Thêm các trường mới vào đây để khớp với ProfilePage
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  designation?: string;
  bio?: string;
}

type Lang = 'en' | 'vn';
type Translations = typeof embeddedTranslations.vn;

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  currentLang: Lang; 
  setLang: (lang: Lang) => void;
  T: Translations;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<Lang>('vn');
  const router = useRouter();

  const loadUser = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        setIsLoading(false);
        return;
    }
    
    try {
      // [FIX] Sử dụng 'api' instance thay vì axios trực tiếp.
      // [FIX] Đổi endpoint từ '/users/profile' thành '/auth/profile'
      // api đã có sẵn header Authorization nhờ interceptor trong lib/api.ts
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Token invalid or expired:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
        setIsLoading(false); 
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('appLang') as Lang;
    if (savedLang && ['vn', 'en'].includes(savedLang)) {
        setCurrentLang(savedLang);
    }
    
    loadUser();
  }, []);

  const setLang = (lang: Lang) => {
    setCurrentLang(lang);
    localStorage.setItem('appLang', lang);
  };
  
  const T = embeddedTranslations[currentLang]; 

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isLoading,
      currentLang, 
      setLang,     
      T            
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};