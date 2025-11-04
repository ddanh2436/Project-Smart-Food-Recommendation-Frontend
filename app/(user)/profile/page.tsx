'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './ProfilePage.css'; // Chúng ta sẽ tạo file CSS này

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 1. Xử lý trạng thái Loading
  if (isLoading) {
    return <div className="profile-loading"><h1>Đang tải hồ sơ...</h1></div>;
  }

  // 2. Nếu không loading và không có user, đá về trang đăng nhập
  if (!user) {
    // Dùng replace để người dùng không thể "back" lại trang profile
    router.replace('/auth'); 
    return null; // Không render gì cả
  }

  // 3. Nếu có user, hiển thị thông tin
  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>Hồ sơ của bạn</h1>
        
        {/* Avatar */}
        <div className="profile-avatar">
          {user.picture ? (
            <Image 
              src={user.picture} 
              alt={user.username} 
              width={100} 
              height={100} 
            />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Thông tin */}
        <div className="profile-info">
          <div className="info-item">
            <strong>Tên đăng nhập:</strong>
            <span>{user.username}</span>
          </div>
          <div className="info-item">
            <strong>Email:</strong>
            <span>{user.email}</span>
          </div>
          <div className="info-item">
            <strong>User ID:</strong>
            <span>{user._id}</span>
          </div>
          {/* Bạn có thể thêm các trường khác như firstName, lastName ở đây */}
        </div>
      </div>
    </div>
  );
}