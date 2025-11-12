// app/(main)/about-us/page.tsx

'use client'; 
import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

// === DỮ LIỆU NGÔN NGỮ ĐÃ SỬA LỖI CÚ PHÁP ===
const langData = {
  en: {
    title: "About Us Page",
    content: "This is where you can customize your About Us content. The header above now dynamically changes language based on your selection."
  },
  vn: {
    title: "Trang Giới Thiệu (About Us)",
    content: "Đây là nơi bạn có thể tự chỉnh nội dung trang Giới Thiệu. Thanh tiêu đề phía trên giờ đây đã tự động thay đổi ngôn ngữ theo lựa chọn của bạn."
  }
};
// ===================================

const AboutUsPage: React.FC = () => {
  const { currentLang } = useAuth();
  const T = langData[currentLang]; 

  return (
    <div style={{ 
      minHeight: '150vh', 
      backgroundColor: 'white', 
      padding: '2rem',
      paddingTop: '100px' 
    }}>
      
      <h1>{T.title}</h1>
      <p>{T.content}</p>

    </div>
  );
};

export default AboutUsPage;