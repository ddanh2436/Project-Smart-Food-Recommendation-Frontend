"use client";
import React, { useState, useEffect } from "react"; // 1. Import thêm useState, useEffect
import "./Header.css"; // Import file CSS để tạo kiểu
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // 2. Import toast để thông báo

// --- Component UserIcon (Giữ nguyên) ---
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// --- Component DropdownArrow (Giữ nguyên) ---
const DropdownArrow = () => (
  // ... (code svg của bạn)
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

// --- Dữ liệu (Giữ nguyên) ---
interface NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}
const navItems: NavItem[] = [
  // ... (danh sách navItems của bạn)
  { label: "Best Food 2025", href: "/best-food-2025" },
  { label: "Near Me", href: "/near-me" },
  { label: "Destinations", href: "/destinations", hasDropdown: true },
  { label: "Foods", href: "/foods", hasDropdown: true },
  { label: "Recipes", href: "/recipes" },
  { label: "Map", href: "/map" },
  { label: "Quality Labels", href: "/quality-labels" },
  { label: "Quiz", href: "/quiz" },
];

// --- Component Header (Đã cập nhật) ---
const Header: React.FC = () => {
  const router = useRouter();

  // 3. Thêm state để theo dõi trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 4. Dùng useEffect để kiểm tra localStorage (chỉ chạy ở client)
  useEffect(() => {
    // Phải kiểm tra trong useEffect để tránh lỗi Hydration của Next.js
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []); // Mảng rỗng [] đảm bảo nó chỉ chạy 1 lần khi component mount

  // 5. Hàm xử lý Đăng nhập (Giữ nguyên)
  const handleLoginClick = () => {
    router.push("/auth");
  };

  // 6. Hàm xử lý Đăng xuất (MỚI)
  const handleLogoutClick = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Cập nhật state để UI thay đổi
    setIsLoggedIn(false);

    // Thông báo cho người dùng
    toast.success("Đăng xuất thành công!");

    // Tải lại trang để reset hoàn toàn (cách đơn giản nhất)
    // Hoặc điều hướng về trang chủ: router.push('/');
    window.location.reload();
  };

  return (
    <header className="header-container">
      {/* Phần Logo (Giữ nguyên) */}
      <div className="header-logo">
        <a href="/">
          <span className="logo-icon">taste</span>
          <span className="logo-text">atlas</span>
        </a>
      </div>

      {/* Phần điều hướng (Giữ nguyên) */}
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

      {/* 7. Phần Đăng nhập (Đã cập nhật logic) */}
      <div className="header-login">
        {isLoggedIn ? (
          // Nếu ĐÃ đăng nhập -> Hiển thị nút Đăng xuất
          <button onClick={handleLogoutClick} className="header-auth-button">
            Logout
          </button>
        ) : (
          // Nếu CHƯA đăng nhập -> Hiển thị nút "Login / Sign Up"
          <button onClick={handleLoginClick} className="header-auth-button">
            Login / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
