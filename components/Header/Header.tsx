// components/Header/Header.tsx
"use client";
import React, { useState } from "react"; 
import "./Header.css";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext"; 
import Image from "next/image";
import Link from 'next/link';

// --- Icons và Components phụ ---
const DropdownArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
const USFlag = () => (
    <Image src="/assets/image/flags/us.png" alt="US Flag" width={20} height={20} className="flag-icon" />
);
const VNFlag = () => (
    <Image src="/assets/image/flags/vn.png" alt="VN Flag" width={20} height={20} className="flag-icon" />
);
const LogoutModal: React.FC<any> = ({ T, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{T.auth.logoutConfirmTitle}</h2>
            <p>{T.auth.logoutConfirmMsg}</p>
            <div className="modal-actions">
                <button className="btn-confirm-logout" onClick={onConfirm}>{T.auth.logoutYes}</button>
                <button className="btn-cancel-logout" onClick={onCancel}>{T.auth.logoutCancel}</button>
            </div>
        </div>
    </div>
);
const navItems = [
    { key: "home", href: "/" },
    { key: "restaurants", href: "/restaurants" },
    { key: "nearMe", href: "/near-me" },
    { key: "foodsDrinks", href: "/foods-and-drinks"  },
    { key: "aboutUs", href: "/about-us" },
];
// --- Hết Components phụ ---


const Header: React.FC = () => {
  const router = useRouter();
  // Lấy T, currentLang, setLang, user từ AuthContext
  const { user, setUser, isLoading, currentLang, setLang, T } = useAuth(); 
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); 

  const handleLangSwitch = (lang: 'en' | 'vn') => {
    setLang(lang);
    setIsDropdownOpen(false);
    toast.success(lang === 'en' ? "Language switched to English" : "Đã chuyển sang Tiếng Việt");
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false); 
    if (typeof window !== 'undefined') {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }
    setUser(null);
    toast.success(T.auth.logoutSuccess);
    router.push("/");
  };

  const handleLoginClick = () => {
    router.push("/auth");
  };

  return (
    <>
      <header className="header-container">
        {/* 1. Logo */}
        <div className="header-logo">
          <Link href="/">
            <Image 
              src="/assets/image/logo.png"
              alt="Logo" 
              className="logo-image"
              width={131}
              height={46}
            />
          </Link>
        </div>

        {/* 2. Khối bên phải */}
        <div className="header-right-side">
          
          {/* Navigation */}
          <nav className="header-nav">
            <ul>
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link href={item.href}>
                    {T.nav[item.key as keyof typeof T.nav]} 
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
                  <USFlag /> {T.nav.langEnglish}
                </button>
                <button 
                  className="dropdown-item" 
                  onClick={() => handleLangSwitch('vn')}
                  disabled={currentLang === 'vn'}
                >
                  <VNFlag /> {T.nav.langVietnamese}
                </button>
              </div>
            )}
          </div>

          {/* 2b. Đăng nhập/Profile (ĐÃ SỬA LỖI HIỂN THỊ) */}
          <div className="header-login">
            {isLoading ? (
              <div className="loading-skeleton"></div>
            ) : user ? (
              <div className="user-profile-container">
                <Link href="/profile" className="profile-nav-link">
                  {/* Logic render Avatar/Placeholder */}
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt={user.username || 'User'} // Thêm fallback alt
                      width={40} 
                      height={40}
                      className="user-avatar"
                      unoptimized={user.picture?.includes('googleusercontent.com')}
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="user-name">
                    {user.username?.split(' ')[0] || 'Profile'} {/* Hiển thị tên đầu tiên */}
                  </span>
                </Link>
                 <button onClick={() => setShowLogoutModal(true)} className="mini-logout-btn" title={T.nav.logout}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            ) : (
              // === NÚT ĐĂNG NHẬP / ĐĂNG KÝ (Đã được khôi phục) ===
              <button onClick={handleLoginClick} className="header-auth-button">
                {T.nav.loginSignup}
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