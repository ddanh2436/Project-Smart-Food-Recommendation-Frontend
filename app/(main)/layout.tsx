// File: app/(main)/layout.tsx

import Header from "@/components/Header/Header";
import "@/components/Header/Header.css"; // Vẫn import file CSS của Header

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      
      {/* THÊM PADDING VÀO ĐÂY
        Nó sẽ đẩy nội dung trang chính xuống 81px,
        nhưng sẽ không ảnh hưởng gì đến trang Login 
      */}
      <main style={{ paddingTop: '81px' }}> 
        {children}
      </main>
    </>
  );
}