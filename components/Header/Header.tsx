"use client";
import React, { useState, useEffect } from "react"; // Import thêm useState, useEffect
import "./Header.css";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";
import Link from 'next/link';

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
  { label: "About us", href: "/about-us" },
];


const Header: React.FC = () => {
  const router = useRouter();
  const { user, setUser, isLoading } = useAuth();
  
  // === THÊM MỚI: State để theo dõi trạng thái cuộn ===
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Nếu cuộn xuống hơn 10px, đặt isScrolled = true
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Thêm event listener khi component mount
    window.addEventListener("scroll", handleScroll);

    // Xử lý trạng thái ban đầu khi tải trang
    handleScroll();

    // Cleanup: Gỡ bỏ event listener khi component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần

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
    // === THAY ĐỔI: Thêm class động dựa trên state 'isScrolled' ===
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
        {/* 2a. Điều hướng (Giữ nguyên) */}
        <nav className="header-nav">
          <ul>
            {navItems.map((item) => (
              <li key={item.label}>
                <a href={item.href}>
                  {item.label}
                  {item.hasDropdown && <DropdownArrow />}
                </a>
              </li>
            ))}
          </ul>
        </nav>

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