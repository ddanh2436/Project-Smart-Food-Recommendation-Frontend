"use client";
import React, { useState, useEffect } from "react";
import "./Header.css";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";
import Link from 'next/link'; // Bạn đã import sẵn

// (Component DropdownArrow và NavItem interface/data giữ nguyên...)
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
  label: string;
  href: string;
  hasDropdown?: boolean;
}
const navItems: NavItem[] = [
  { label: "Restaurants", href: "/restaurants", hasDropdown: true },
  { label: "Near Me", href: "/near-me" },
  { label: "Foods and Drinks", href: "/foods-and-drinks"  },
  { label: "About us", href: "/about-us" }, // Link này sẽ trỏ đến trang chúng ta sắp tạo
];


const Header: React.FC = () => {
  const router = useRouter();
  const { user, setUser, isLoading } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);

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

  // (Các hàm handleLogoutClick và handleLoginClick giữ nguyên...)
  const handleLogoutClick = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    toast.success("Đăng xuất thành công!");
    router.push("/");
  };

  const handleLoginClick = () => {
    router.push("/auth");
  };


  return (
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

      {/* 2. Khối bên phải (Giữ nguyên) */}
      <div className="header-right-side">
        
        {/* === THAY ĐỔI DUY NHẤT Ở ĐÂY === */}
        <nav className="header-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                {/* Thay thế <a> bằng <Link> */}
                <Link href={item.href}>
                  {item.label}
                  {item.hasDropdown && <DropdownArrow />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {/* === KẾT THÚC THAY ĐỔI === */}


        {/* 2b. Đăng nhập/Profile (Giữ nguyên) */}
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
                    width={32}
                    height={32}
                    className="user-avatar"
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
              <button onClick={handleLogoutClick} className="header-auth-button">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={handleLoginClick} className="header-auth-button">
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;