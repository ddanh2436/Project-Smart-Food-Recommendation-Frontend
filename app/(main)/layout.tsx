// app/(main)/layout.tsx

"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer"; // <--- Import Footer
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
      {!hideHeader && <Header />}

      <main style={{ paddingTop: hideHeader ? '0' : '0' }}>
        {children}
      </main>

      {/* Thêm Footer vào đây */}
      <Footer />
    </>
  );
}