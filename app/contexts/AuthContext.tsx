// app/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/app/lib/api'; // (Đảm bảo đường dẫn này đúng)

// Định nghĩa kiểu User (đơn giản)
interface User {
  _id: string; // Hoặc id
  username: string;
  email: string;
  picture?: string; // Avatar URL
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean; // Thêm isLoading để tránh "chớp"
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true, // Bắt đầu với loading = true
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Khi app tải lần đầu, thử lấy thông tin user
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // api.ts đã tự động đính kèm token rồi
          const response = await api.get('/auth/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Token không hợp lệ, đăng xuất', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []); // Mảng rỗng [] nghĩa là chỉ chạy 1 lần

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để dễ sử dụng
export const useAuth = () => useContext(AuthContext);