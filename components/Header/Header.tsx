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
    xmlns="http://www.w.org/2000/svg"
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
  { label: "Best Food 2025", href: "/best-food-2025" },
  { label: "Near Me", href: "/near-me" },
  { label: "Destinations", href: "/destinations", hasDropdown: true },
  { label: "Foods", href: "/foods", hasDropdown: true },
  { label: "Recipes", href: "/recipes" },
  { label: "Map", href: "/map" },
  { label: "Quality Labels", href: "/quality-labels" },
  { label: "Quiz", href: "/quiz" },
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
      <div className="header-logo">
        <a href="/">
          <span className="logo-icon">Viet</span>
          <span className="logo-text">NomNom</span>
        </a>
      </div>

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

      {/* Phần Đăng nhập/Profile (Đã cập nhật) */}
      <div className="header-login">
        {isLoading ? (
          <div className="loading-skeleton"></div>
        ) : user ? (
          // Nếu ĐÃ đăng nhập (có user)
          <div className="user-profile-container">
            
            {/* 2. BỌC AVATAR VÀ TÊN BẰNG LINK */}
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
            
            {/* Nút Logout (Để NGUYÊN bên ngoài Link) */}
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
    </header>
  );
};

export default Header;
