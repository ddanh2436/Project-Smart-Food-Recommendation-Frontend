// ddanh2436/project-smart-food-recommendation-frontend/Project-Smart-Food-Recommendation-Frontend-1fc724bd73b2d99b6b7202f40f81236938357594/app/(main)/layout.tsx

"use client"; 

import Header from "@/components/Header/Header";
import "@/components/Header/Header.css"; 
import { usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Ẩn Header nếu đường dẫn bắt đầu bằng /profile
  const hideHeader = pathname.startsWith('/profile'); 
  
  return (
    <>
      {/* Hiển thị Header nếu không phải trang Profile */}
      {!hideHeader && <Header />} 
      
      {/* Điều chỉnh padding top */}
      <main style={{ paddingTop: hideHeader ? '0' : '81px' }}> 
        {children}
      </main>
    </>
  );
}