// app/(user)/auth/callback/page.tsx
'use client'; // Bắt buộc phải là Client Component

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// Trang này chỉ là một "cầu nối"
// Nó bắt token từ URL, lưu vào localStorage, rồi chuyển hướng về trang chủ
export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Lấy token từ thanh URL
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // 1. Lưu token vào localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // 2. Chuyển hướng về trang chủ (hoặc /dashboard)
      router.push('/');
    } else {
      // Nếu không có token (lỗi), chuyển về trang đăng nhập
      router.push('/auth');
    }
  }, [searchParams, router]);

  // Hiển thị loading... trong khi chờ chuyển hướng
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1>Đang đăng nhập, vui lòng chờ...</h1>
    </div>
  );
}