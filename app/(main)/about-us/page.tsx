import React from 'react';

const AboutUsPage: React.FC = () => {
  return (
    // Tạo một div có nền trắng và chiều cao
    // để bạn có thể thấy nội dung và cuộn thử Header
    <div style={{ 
      minHeight: '150vh', // Cao hơn 100vh để bạn cuộn thử
      backgroundColor: 'white', // Nền trắng để trang không bị đen
      padding: '2rem',
      paddingTop: '100px' // Đẩy nội dung xuống dưới Header (81px + 19px đệm)
    }}>
      
      <h1>Trang Giới Thiệu (About Us)</h1>
      <p>Bây giờ bạn có thể tự chỉnh nội dung ở đây.</p>

    </div>
  );
};

export default AboutUsPage;