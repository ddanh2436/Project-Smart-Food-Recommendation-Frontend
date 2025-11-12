// app/(main)/profile/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './ProfilePage.css'; 
import api from '@/app/lib/api'; 
import { toast } from 'react-hot-toast'; 
import Link from 'next/link';

// === DỮ LIỆU NGÔN NGỮ (ĐÃ SỬA LỖI CÚ PHÁP TS1005) ===
const langData = {
  en: {
    loading: "Loading profile...",
    redirect: "Redirecting to login...",
    tabAccount: "Account",
    settingsTitle: "Account Settings",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    phone: "Phone number",
    company: "Company",
    designation: "Designation",
    bio: "Bio",
    bioPlaceholder: "Tell us about yourself...",
    companyPlaceholder: "Your company",
    update: "Update",
    updating: "Updating...",
    cancel: "Cancel",
    updateSuccess: "Profile updated successfully!",
    updateFailed: "Update failed. Please try again.",
    cancelToast: "Changes canceled"
  },
  vn: {
    loading: "Đang tải hồ sơ...",
    redirect: "Đang chuyển hướng đến đăng nhập...",
    tabAccount: "Tài khoản",
    settingsTitle: "Cài đặt Tài khoản",
    firstName: "Tên",
    lastName: "Họ",
    email: "Email",
    phone: "Số điện thoại",
    company: "Công ty",
    designation: "Chức danh",
    bio: "Tiểu sử",
    bioPlaceholder: "Kể cho chúng tôi về bạn...",
    companyPlaceholder: "Công ty của bạn",
    update: "Cập nhật",
    updating: "Đang cập nhật...",
    cancel: "Hủy",
    updateSuccess: "Cập nhật hồ sơ thành công!",
    updateFailed: "Cập nhật thất bại. Vui lòng thử lại.",
    cancelToast: "Đã hủy thay đổi"
  }
};
// ===================================

const ArrowLeftIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export default function ProfilePage() {
  const { user, setUser, isLoading, currentLang } = useAuth(); 
  const router = useRouter();
  const T = langData[currentLang]; 

  // State cho tab
  const [activeTab, setActiveTab] = useState('account');
  
  // --- LOGIC FORM ---
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    designation: '',
    bio: '',
  });

  // 1. Load data vào form khi user tải xong
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        company: user.company || '',
        designation: user.designation || '',
        bio: user.bio || '',
      });
    }
  }, [user]); 

  // 2. Hàm xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // 3. Hàm xử lý nút "Cancel"
  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        company: user.company || '',
        designation: user.designation || '',
        bio: user.bio || '',
      });
      toast.error(T.cancelToast);
    }
  };

  // 4. Hàm xử lý nút "Update"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Gửi data lên backend
      const response = await api.patch('/auth/profile', formData);
      
      // Cập nhật Global State (AuthContext)
      setUser(response.data); 
      
      toast.success(T.updateSuccess);
    } catch (error) {
      console.error(error);
      toast.error(T.updateFailed);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- LOGIC LOADING VÀ REDIRECT ---
  if (isLoading) {
    return <div className="profile-loading"><h1>{T.loading}</h1></div>;
  }
  if (!user) {
    router.replace('/auth');
    return null;
  }

  // Lấy email (không thể thay đổi) và tên (để hiển thị)
  const email = user.email;
  const displayName = formData.firstName || formData.lastName 
    ? `${formData.firstName} ${formData.lastName}` 
    : user.username;
  const avatarText = formData.firstName 
    ? formData.firstName.charAt(0).toUpperCase()
    : user.username.charAt(0).toUpperCase();

  return (
    <div className="profile-page-background">
      {/* Nút quay lại sử dụng Link */}
      <Link href="/" className="global-back-button" aria-label="Quay lại trang chủ">
        <ArrowLeftIcon />
      </Link>
      <div className="profile-grid-container">
        {/* === CỘT BÊN TRÁI (NAV) === */}
        <div className="profile-nav-left">
          <div className="profile-user-summary">
            <div className="profile-avatar-large">
              {user.picture ? (
                <Image 
                    src={user.picture} 
                    alt={displayName} 
                    width={90} 
                    height={90} 
                    unoptimized={user.picture.includes('googleusercontent.com')}
                />
              ) : (
                <div className="profile-avatar-placeholder-large">
                  {avatarText}
                </div>
              )}
            </div>
            <h2 className="profile-user-name">
              {displayName.trim()}
            </h2>
          </div>
          <ul className="profile-nav-menu">
            {/* Menu tab */}
            <li className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>
              {T.tabAccount}
            </li>
          </ul>
        </div>

        {/* === CỘT BÊN PHẢI (FORM) === */}
        <div className="profile-form-right">
          <h1>{T.settingsTitle}</h1>

          
          {/* 5. Gắn hàm handleSubmit vào <form> */}
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* First Name */}
              <div className="form-group">
                <label htmlFor="firstName">{T.firstName}</label>
                <input 
                  type="text" 
                  id="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange}
                  disabled={isUpdating} 
                />
              </div>
              
              {/* Last Name */}
              <div className="form-group">
                <label htmlFor="lastName">{T.lastName}</label>
                <input 
                  type="text" 
                  id="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange}
                  disabled={isUpdating}
                />
              </div>
              
              {/* Email (Read Only) */}
              <div className="form-group full-width">
                <label htmlFor="email">{T.email}</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email}
                  readOnly 
                  className="read-only-field"
                />
              </div>
              
              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">{T.phone}</label>
                <input 
                  type="text" 
                  id="phone" 
                  placeholder="+84 123 456 789"
                  value={formData.phone} 
                  onChange={handleChange}
                  disabled={isUpdating}
                />
              </div>

              {/* Company */}
              <div className="form-group">
                <label htmlFor="company">{T.company}</label>
                <input 
                  type="text" 
                  id="company" 
                  placeholder={T.companyPlaceholder} 
                  value={formData.company} 
                  onChange={handleChange}
                  disabled={isUpdating}
                />
              </div>

              {/* Designation */}
              <div className="form-group">
                <label htmlFor="designation">{T.designation}</label>
                <input 
                  type="text" 
                  id="designation" 
                  placeholder={T.designation} 
                  value={formData.designation} 
                  onChange={handleChange}
                  disabled={isUpdating}
                />
              </div>

              {/* Bio */}
              <div className="form-group full-width">
                <label htmlFor="bio">{T.bio}</label>
                <textarea 
                  id="bio" 
                  rows={4} 
                  placeholder={T.bioPlaceholder}
                  value={formData.bio} 
                  onChange={handleChange}
                  disabled={isUpdating}
                ></textarea>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-update" disabled={isUpdating}>
                {isUpdating ? T.updating : T.update}
              </button>
              <button type="button" className="btn btn-cancel" onClick={handleCancel} disabled={isUpdating}>
                {T.cancel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}