// app/(main)/layout.tsx
"use client";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import ChatWidget from "@/components/ChatWidget/ChatWidget";
import "@/components/Header/Header.css";
import { usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 1. Xác định các trang cần ẩn giao diện chung
  const isProfilePage = pathname.startsWith('/profile');
  const isChatbotPage = pathname.startsWith('/chatbot');
  
  // [MỚI] Xác định trang nhà hàng để ẩn riêng Footer
  const isRestaurantPage = pathname.startsWith('/restaurants');

  // 2. Gom điều kiện: Ẩn Header/Footer/Widget nếu là Profile HOẶC Chatbot
  const shouldHideUI = isProfilePage || isChatbotPage;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Chỉ hiện Header nếu KHÔNG phải trang Profile và KHÔNG phải Chatbot */}
      {!shouldHideUI && <Header />}
      
      <main className="flex-1">
        {children}
      </main>

      {/* [QUAN TRỌNG] Chỉ hiện Footer nếu KHÔNG phải Profile, Chatbot VÀ Nhà hàng */}
      {!shouldHideUI && !isRestaurantPage && <Footer />}
      
      {/* Chỉ hiện nút Chat nổi nếu KHÔNG phải trang Profile và KHÔNG phải Chatbot */}
      {!shouldHideUI && <ChatWidget />}
    </div>
  );
}