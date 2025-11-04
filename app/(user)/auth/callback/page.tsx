'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import api from '@/app/lib/api';

export default function AuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuth(); // Lấy hàm setUser

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Lấy profile ngay lập tức
      const fetchProfile = async () => {
        try {
          const profileResponse = await api.get('/auth/profile');
          setUser(profileResponse.data); // Cập nhật Global State
          router.push('/'); // Chuyển về trang chủ
        } catch (e) {
          router.push('/auth');
        }
      };
      fetchProfile();
      
    } else {
      router.push('/auth'); // Lỗi thì về trang auth
    }
  }, [searchParams, router, setUser]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>Đang đăng nhập, vui lòng chờ...</h1>
    </div>
  );
}