import HeroSection from "@/components/HeroSection/HeroSection";

export default function Home() {
  return (
    <main>
      {/* Header đã được file layout.tsx xử lý,
          không cần gọi ở đây nữa */}
      <HeroSection />
      {/* ... các section khác ... */}
    </main>
  );
}