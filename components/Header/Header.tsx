// ddanh2436/project-smart-food-recommendation-frontend/Project-Smart-Food-Recommendation-Frontend-1fc724bd73b2d99b6b7202f40f81236938357594/components/Header/Header.tsx

"use client";
import React, { useState, useEffect } from "react"; 
import "./Header.css";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";
import Link from 'next/link';

// === DỮ LIỆU NGÔN NGỮ (ĐÃ THÊM MODAL TEXTS) ===
const langData = {
  en: {
    restaurants: "Restaurants",
    nearMe: "Near Me",
    foodsDrinks: "Foods and Drinks",
    aboutUs: "About us",
    loginSignup: "Login / Sign Up",
    logout: "Logout", 
    langVietnamese: "Tiếng Việt",
    langEnglish: "English",
    switchSuccess: "Language switched to English",
    logoutSuccess: "Logout successful!",
    // MODAL TEXTS (THÊM MỚI)
    logoutConfirmTitle: "Confirm Logout",
    logoutConfirmMessage: "Are you sure you want to log out?",
    logoutYes: "Yes, Log Out",
    logoutCancel: "Cancel",
  },
  vn: {
    restaurants: "Nhà hàng",
    nearMe: "Gần tôi",
    foodsDrinks: "Món ăn & Đồ uống",
    aboutUs: "Về chúng tôi",
    loginSignup: "Đăng nhập / Đăng ký",
    logout: "Đăng xuất",
    langVietnamese: "Tiếng Việt",
    langEnglish: "English",
    switchSuccess: "Đã chuyển sang Tiếng Việt",
    logoutSuccess: "Đăng xuất thành công!",
    // MODAL TEXTS (THÊM MỚI)
    logoutConfirmTitle: "Xác nhận Đăng xuất",
    logoutConfirmMessage: "Bạn có chắc chắn muốn đăng xuất không?",
    logoutYes: "Đăng xuất",
    logoutCancel: "Hủy bỏ",
  }
};
// ======================================

const DropdownArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
interface NavItem {
  key: keyof typeof langData.en; 
  href: string;
  hasDropdown?: boolean;
}

const navItems: NavItem[] = [
  { key: "restaurants", href: "/restaurants", hasDropdown: true },
  { key: "nearMe", href: "/near-me" },
  { key: "foodsDrinks", href: "/foods-and-drinks"  },
  { key: "aboutUs", href: "/about-us" },
];

const USFlag = () => (
    <Image src="/assets/image/flags/us.png" alt="US Flag" width={20} height={20} className="flag-icon" />
);
const VNFlag = () => (
    <Image src="/assets/image/flags/vn.png" alt="VN Flag" width={20} height={20} className="flag-icon" />
);

// === MODAL COMPONENT (Định nghĩa lại cho Header) ===
interface LogoutModalProps {
    T: typeof langData.vn; 
    onConfirm: () => void;
    onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ T, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{T.logoutConfirmTitle}</h2>
            <p>{T.logoutConfirmMessage}</p>
            <div className="modal-actions">
                <button 
                    className="btn-confirm-logout" 
                    onClick={onConfirm}
                >
                    {T.logoutYes}
                </button>
                <button 
                    className="btn-cancel-logout" 
                    onClick={onCancel}
                >
                    {T.logoutCancel}
                </button>
            </div>
        </div>
    </div>
);
// ===================================================

const Header: React.FC = () => {
  const router = useRouter();
  const { user, setUser, isLoading, currentLang, setLang } = useAuth();
  
  const T = langData[currentLang]; 

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // TRẠNG THÁI MODAL (THÊM MỚI)


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); 

  const handleLangSwitch = (lang: 'en' | 'vn') => {
    setLang(lang);
    setIsDropdownOpen(false);
    toast.success(langData[lang].switchSuccess);
  };

  // === HÀM XÁC NHẬN ĐĂNG XUẤT (THÊM MỚI) ===
  const handleConfirmLogout = () => {
    setShowLogoutModal(false); // Đóng modal
    if (typeof window !== 'undefined') {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }
    setUser(null);
    toast.success(T.logoutSuccess);
    router.push("/");
  };
  // =========================================

  // === HÀM KHI NHẤN NÚT ĐĂNG XUẤT TRÊN HEADER (SỬA ĐỔI) ===
  const handleLogoutClick = () => {
    // Chỉ mở modal, không đăng xuất ngay lập tức
    setShowLogoutModal(true); 
  };
  // =========================================================

  const handleLoginClick = () => {
    router.push("/auth");
  };


  return (
    <>
      <header 
        className={`header-container ${isScrolled ? "header-scrolled" : ""}`}
      >
        {/* 1. Logo (Giữ nguyên) */}
        <div className="header-logo">
          <a href="/">
            <Image 
              src="/assets/image/logo.png"
              alt="Logo" 
              className="logo-image"
              width={131}
              height={46}
            />
          </a>
        </div>

        {/* 2. Khối bên phải */}
        <div className="header-right-side">
          
          {/* Navigation */}
          <nav className="header-nav">
            <ul>
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link href={item.href}>
                    {T[item.key]}
                    {item.hasDropdown && <DropdownArrow />}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language Selector */}
          <div className="language-selector-wrapper">
            <button 
              className="language-toggle-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
            >
              {currentLang === 'en' ? <USFlag /> : <VNFlag />}
              <DropdownArrow />
            </button>

            {isDropdownOpen && (
              <div className="language-dropdown">
                <button 
                  className="dropdown-item" 
                  onClick={() => handleLangSwitch('en')}
                  disabled={currentLang === 'en'}
                >
                  <USFlag /> {T.langEnglish}
                </button>
                <button 
                  className="dropdown-item" 
                  onClick={() => handleLangSwitch('vn')}
                  disabled={currentLang === 'vn'}
                >
                  <VNFlag /> {T.langVietnamese}
                </button>
              </div>
            )}
          </div>

          {/* 2b. Đăng nhập/Profile */}
          <div className="header-login">
            {isLoading ? (
              <div className="loading-skeleton"></div>
            ) : user ? (
              // HIỂN THỊ LINK PROFILE + NÚT LOGOUT
              <div className="user-profile-container">
                <Link href="/profile" className="profile-nav-link">
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt={user.username}
                      width={32}
                      height={32}
                      className="user-avatar"
                      unoptimized={user.picture?.includes('googleusercontent.com')}
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">
                    {user.username
                      .split(' ')
                      .map(name => name.charAt(0).toUpperCase() + name.slice(1))
                      .join(' ')}
                  </span>
                </Link>
                {/* GỌI HÀM MỚI CHỈ MỞ MODAL */}
                <button onClick={handleLogoutClick} className="header-auth-button">
                  {T.logout} 
                </button>
              </div>
            ) : (
              <button onClick={handleLoginClick} className="header-auth-button">
                {T.loginSignup}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* RENDER MODAL TẠI ĐÂY */}
      {showLogoutModal && (
          <LogoutModal 
              T={T}
              onConfirm={handleConfirmLogout} 
              onCancel={() => setShowLogoutModal(false)}
          />
      )}
    </>
  );
};

export default Header;