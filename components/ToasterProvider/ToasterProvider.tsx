// components/providers/ToasterProvider.tsx
"use client";

import { Toaster } from "react-hot-toast";

const ToasterProvider = () => {
  return (
    <Toaster 
      position="top-center" 
      reverseOrder={false} 
      toastOptions={{
        // Tùy chỉnh style mặc định nếu muốn
        style: {
          background: '#333',
          color: '#fff',
          zIndex: 9999,
        },
        success: {
          iconTheme: {
            primary: '#e9a004', // Màu cam chủ đạo của web bạn
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

export default ToasterProvider;