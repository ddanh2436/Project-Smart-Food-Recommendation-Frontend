// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/app/contexts/AuthContext";

// [XÓA DÒNG NÀY] import ChatWidget ... -> Vì ta đã nhúng nó trong MainLayout rồi
// [XÓA DÒNG NÀY] import Header.css ... -> Nên để component tự import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "VietNomNom",
  description: "Smart Food Recommendation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Toaster position="top-center" />
          
          {/* [QUAN TRỌNG] Chỉ render children, KHÔNG để ChatWidget ở đây */}
          {children}
          
        </AuthProvider>
      </body>
    </html>
  );
}