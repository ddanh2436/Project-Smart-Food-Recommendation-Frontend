// components/Header/Header.tsx
"use client";
import React, { useState, useRef, useEffect } from "react"; 
import "./Header.css";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext"; 
import Image from "next/image";
import Link from 'next/link';

// --- Icons ---
const DropdownArrow = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);
const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

const USFlag = () => (
    <Image src="/assets/image/flags/us.png" alt="US Flag" width={20} height={20} className="flag-icon" />
);
const VNFlag = () => (
    <Image src="/assets/image/flags/vn.png" alt="VN Flag" width={20} height={20} className="flag-icon" />
);

const LogoutModalIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
    <line x1="9" y1="9" x2="9.01" y2="9"></line>
    <line x1="15" y1="9" x2="15.01" y2="9"></line>
  </svg>
);

const LogoutModal: React.FC<any> = ({ T, onConfirm, onCancel }) => (
    <div className="modal-overlay" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper">
                <LogoutModalIcon />
            </div>
            <h2 className="modal-title">{T.auth.logoutConfirmTitle}</h2>
            <p className="modal-message">{T.auth.logoutConfirmMsg}</p>
            
            <div className="modal-actions">
                <button className="btn-cancel-logout" onClick={onCancel}>
                    {T.auth.logoutCancel}
                </button>
                <button className="btn-confirm-logout" onClick={onConfirm}>
                    {T.auth.logoutYes}
                </button>
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

const Header: React.FC = () => {
  const router = useRouter();
  const { user, setUser, isLoading, currentLang, setLang, T } = useAuth(); 
  
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // State cho User Dropdown
  const [showLogoutModal, setShowLogoutModal] = useState(false); 

  // Ref để xử lý click outside (click ra ngoài thì đóng menu)
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLangSwitch = (lang: 'en' | 'vn') => {
    setLang(lang);
    setIsLangDropdownOpen(false);
    toast.success(lang === 'en' ? "Language switched to English" : "Đã chuyển sang Tiếng Việt");
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false); 
    setIsUserDropdownOpen(false);
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
          <div className="language-selector-wrapper" ref={langDropdownRef}>
            <button 
              className="language-toggle-button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            >
              {currentLang === 'en' ? <USFlag /> : <VNFlag />}
              <DropdownArrow />
            </button>

            {isLangDropdownOpen && (
              <div className="dropdown-menu">
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

          {/* 2b. User Profile / Login Button */}
          <div className="header-login">
            {isLoading ? (
              <div className="loading-skeleton" style={{width: 100, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.2)'}}></div>
            ) : user ? (
              // === USER DROPDOWN SECTION ===
              <div className="user-dropdown-wrapper" ref={userDropdownRef}>
                <button 
                  className="user-toggle-button" 
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                >
                  {user.picture ? (
                    <Image
                      src={user.picture}
                      alt={user.username || 'User'}
                      width={32} 
                      height={32}
                      className="user-avatar"
                      unoptimized={user.picture?.includes('googleusercontent.com')}
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="user-name">
                    {user.username?.split(' ')[0] || 'Profile'}
                  </span>
                  <DropdownArrow />
                </button>

                {isUserDropdownOpen && (
                  <div className="dropdown-menu user-menu">
                    <Link href="/profile" className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                      <UserIcon />
                      Hồ sơ của tôi
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout-item" onClick={() => setShowLogoutModal(true)}>
                      <LogoutIcon />
                      {T.nav.logout}
                    </button>
                  </div>
                )}
              </div>
              // === END USER DROPDOWN ===
            ) : (
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