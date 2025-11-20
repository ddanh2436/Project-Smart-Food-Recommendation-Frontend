// components/Header/Header.tsx
"use client";
import React, { useState } from "react"; 
import "./Header.css";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";
import Link from 'next/link';

// === DỮ LIỆU NGÔN NGỮ (ĐÃ CẬP NHẬT HOME) ===
const langData = {
  en: {
    home: "Home", // Mới thêm
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
    logoutConfirmTitle: "Confirm Logout",
    logoutConfirmMessage: "Are you sure you want to log out?",
    logoutYes: "Yes, Log Out",
    logoutCancel: "Cancel",
  },
  vn: {
    home: "Trang chủ", // Mới thêm
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
    logoutConfirmTitle: "Xác nhận Đăng xuất",
    logoutConfirmMessage: "Bạn có chắc chắn muốn đăng xuất không?",
    logoutYes: "Đăng xuất",
    logoutCancel: "Hủy bỏ",
  }
};

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

// === THÊM MỤC HOME VÀO ĐẦU DANH SÁCH ===
const navItems: NavItem[] = [
  { key: "home", href: "/" }, // Link về trang chủ
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
                <button className="btn-confirm-logout" onClick={onConfirm}>{T.logoutYes}</button>
                <button className="btn-cancel-logout" onClick={onCancel}>{T.logoutCancel}</button>
            </div>
        </div>
    </div>
);

const Header: React.FC = () => {
  const router = useRouter();
  const { user, setUser, isLoading, currentLang, setLang } = useAuth();
  
  const T = langData[currentLang]; 

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 

  const handleLangSwitch = (lang: 'en' | 'vn') => {
    setLang(lang);
    setIsDropdownOpen(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false); 
    if (typeof window !== 'undefined') {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }
    setUser(null);
    toast.success(T.logoutSuccess);
    router.push("/");
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true); 
  };

  const handleLoginClick = () => {
    router.push("/auth");
  };

  return (
    <>
      <header className="header-container">
        {/* 1. Logo */}
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
              <div className="user-profile-container">
                <Link href="/profile" className="profile-nav-link">
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt={user.username}
                      width={40} 
                      height={40}
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
                {/* Nút logout được tách ra hoặc để nhỏ bên cạnh */}
              </div>
            ) : (
              <button onClick={handleLoginClick} className="header-auth-button">
                {T.loginSignup}
              </button>
            )}
          </div>
        </div>
      </header>

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