// app/(main)/layout.tsx

"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import "@/components/Header/Header.css";
import { usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Kiểm tra nếu đang ở trang profile thì ẩn cả Header và Footer
  const isProfilePage = pathname.startsWith('/profile');

  return (
    <>
      {/* Chỉ hiện Header nếu KHÔNG phải trang profile */}
      {!isProfilePage && <Header />}

      <main style={{ paddingTop: isProfilePage ? '0' : '0' }}>
        {children}
      </main>

      {/* Chỉ hiện Footer nếu KHÔNG phải trang profile */}
      {!isProfilePage && <Footer />}
    </>
  );
}