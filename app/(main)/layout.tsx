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
      
      {}
      <main style={{ paddingTop: '81px' }}> 
        {children}
      </main>
    </>
  );
}