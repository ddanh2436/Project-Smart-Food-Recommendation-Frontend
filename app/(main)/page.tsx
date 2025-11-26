// app/(main)/page.tsx
import HeroSection from "@/components/HeroSection/HeroSection";
import TopRatingSection from "@/components/HomeSections/TopRatingSection";
import TopSpaceSection from "@/components/HomeSections/TopSpaceSection";
import TopQualitySection from "@/components/HomeSections/TopQualitySection";
import TopServiceSection from "@/components/HomeSections/TopServiceSection";
import TopPriceSection from "@/components/HomeSections/TopPriceSection";
import TopLocationSection from "@/components/HomeSections/TopLocationSection";

export default function Home() {
  return (
    <main>
      {/* Header đã được file layout.tsx xử lý,
          không cần gọi ở đây nữa */}
      <HeroSection />
      <TopRatingSection />
      <TopSpaceSection />
      <TopQualitySection />
      <TopServiceSection />
      <TopPriceSection />
      <TopLocationSection />
      {/* ... các section khác ... */}
    </main>
  );
}