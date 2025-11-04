'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './ProfilePage.css'; // File CSS của bạn
import api from '@/app/lib/api'; // Import API client
import { toast } from 'react-hot-toast'; // Import toast
import Link from 'next/link';

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
  const { user, setUser, isLoading } = useAuth(); // Lấy setUser từ context
  const router = useRouter();

  // State cho tab
  const [activeTab, setActiveTab] = useState('account');
  
  // --- LOGIC FORM (MỚI) ---
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
  }, [user]); // Chạy lại khi 'user' thay đổi

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
    // Reset form về dữ liệu gốc từ context
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        company: user.company || '',
        designation: user.designation || '',
        bio: user.bio || '',
      });
      toast.error('Đã hủy thay đổi');
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
      
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- LOGIC LOADING VÀ REDIRECT ---
  if (isLoading) {
    return <div className="profile-loading"><h1>Đang tải hồ sơ...</h1></div>;
  }
  if (!user) {
    router.replace('/auth');
    return null;
  }

  // Lấy email (không thể thay đổi) và tên (để hiển thị)
  const email = user.email;
  const fullName = user.firstName ? `${user.firstName} ${user.lastName}` : user.username;

  return (
    <div className="profile-page-background">
      <Link href="/" className="global-back-button" aria-label="Quay lại trang chủ">
        <ArrowLeftIcon />
      </Link>
      <div className="profile-grid-container">
        {/* === CỘT BÊN TRÁI (NAV) === */}
        <div className="profile-nav-left">
          <div className="profile-user-summary">
            <div className="profile-avatar-large">
              {user.picture ? (
                <Image src={user.picture} alt={fullName} width={90} height={90} />
              ) : (
                <div className="profile-avatar-placeholder-large">
                  {formData.firstName.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="profile-user-name">
              {formData.firstName || formData.lastName 
                ? `${formData.firstName} ${formData.lastName}`
                : user.username
              }
            </h2>
          </div>
          <ul className="profile-nav-menu">
            {/* (Menu tabs giữ nguyên...) */}
            <li className={activeTab === 'account' ? 'active' : ''} onClick={() => setActiveTab('account')}>Account</li>
          </ul>
        </div>

        {/* === CỘT BÊN PHẢI (FORM) === */}
        <div className="profile-form-right">
          <h1>Account Settings</h1>

          
          {/* 5. Gắn hàm handleSubmit vào <form> */}
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* First Name */}
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} // Thêm onChange
                  disabled={isUpdating} // Disable khi đang update
                />
              </div>
              
              {/* Last Name */}
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
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
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  value={email} // Lấy từ user (không đổi)
                  readOnly 
                  className="read-only-field"
                />
              </div>
              
              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">Phone number</label>
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
                <label htmlFor="company">Company</label>
                <input 
                  type="text" 
                  id="company" 
                  placeholder="Your company" 
                  value={formData.company} 
                  onChange={handleChange}
                  disabled={isUpdating}
                />
              </div>

              {/* Designation */}
              <div className="form-group">
                <label htmlFor="designation">Designation</label>
                <input 
                  type="text" 
                  id="designation" 
                  placeholder="Your role" 
                  value={formData.designation} 
                  onChange={handleChange}
                  disabled={isUpdating}
                />
              </div>

              {/* Bio */}
              <div className="form-group full-width">
                <label htmlFor="bio">Bio</label>
                <textarea 
                  id="bio" 
                  rows={4} 
                  placeholder="Tell us about yourself..."
                  value={formData.bio} 
                  onChange={handleChange}
                  disabled={isUpdating}
                ></textarea>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-update" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
              <button type="button" className="btn btn-cancel" onClick={handleCancel} disabled={isUpdating}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}