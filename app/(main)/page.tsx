import HeroSection from "@/components/HeroSection/HeroSection";
import TopRatingSection from "@/components/HomeSections/TopRatingSection";

export default function Home() {
  return (
    <main>
      {/* Header đã được file layout.tsx xử lý,
          không cần gọi ở đây nữa */}
      <HeroSection />
      <TopRatingSection />
      {/* ... các section khác ... */}
    </main>
  );
}