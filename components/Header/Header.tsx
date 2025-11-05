"use client";
import React from "react";
import "./Header.css"; // Giả sử bạn có file CSS này
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/app/contexts/AuthContext"; // Import hook
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
  const { user, setUser, isLoading } = useAuth(); // Lấy user từ Context

  const handleLogoutClick = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null); // Cập nhật Global State
    toast.success("Đăng xuất thành công!");
    router.push("/");
  };

  const handleLoginClick = () => {
    router.push("/auth");
  };

  return (
    <header className="header-container">
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

      {/* === THAY ĐỔI CHÍNH: TẠO KHỐI BAO MỚI === */}
      <div className="header-right-side">

        {/* 2. Điều hướng (Giờ nằm bên trong khối phải) */}
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

        {/* 3. Đăng nhập/Profile (Giờ nằm bên trong khối phải) */}
        <div className="header-login">
          {isLoading ? (
            <div className="loading-skeleton"></div>
          ) : user ? (
            // Nếu ĐÃ đăng nhập (có user)
            <div className="user-profile-container">
              
              <Link href="/profile" className="profile-nav-link">
                {/* Avatar */}
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
                
                {/* Tên */}
                <span className="user-name">
                  {user.username
                    .split(' ')
                    .map(name => name.charAt(0).toUpperCase() + name.slice(1))
                    .join(' ')}
                </span>
              </Link>
              
              {/* Nút Logout */}
              <button onClick={handleLogoutClick} className="header-auth-button">
                Logout
              </button>
            </div>
          ) : (
            // Nếu CHƯA đăng nhập (user là null)
            <button onClick={handleLoginClick} className="header-auth-button">
              Login / Sign Up
            </button>
          )}
        </div>
      
      </div> {/* === KẾT THÚC KHỐI BAO MỚI === */}

    </header>
  );
};

export default Header;