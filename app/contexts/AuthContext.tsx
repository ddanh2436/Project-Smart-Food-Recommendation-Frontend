// app/contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/app/lib/api';

// Định nghĩa kiểu User
interface User {
  _id: string; // Hoặc id
  username: string;
  email: string;
  picture?: string; // Avatar URL
  firstName?: string; 
  lastName?: string;
  phone?: string;     
  company?: string;   
  designation?: string; 
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean; 
  currentLang: 'en' | 'vn'; // Loại ngôn ngữ
  setLang: (lang: 'en' | 'vn') => void; // Hàm đổi ngôn ngữ
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true, 
  currentLang: 'en', 
  setLang: () => {}, 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<'en' | 'vn'>('en'); 

  // Hàm cập nhật ngôn ngữ và lưu vào localStorage
  const setLang = (lang: 'en' | 'vn') => {
    setCurrentLang(lang);
    if (typeof window !== 'undefined') {
        localStorage.setItem('appLang', lang);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
        // Tải ngôn ngữ từ localStorage (mặc định là 'en')
        const savedLang = localStorage.getItem('appLang') as 'en' | 'vn' | null;
        if (savedLang) {
          setCurrentLang(savedLang);
        }
    }
    
    // Logic fetch User
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Token không hợp lệ, đăng xuất', error);
          if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
          }
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []); 

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, currentLang, setLang }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để dễ sử dụng
export const useAuth = () => useContext(AuthContext);