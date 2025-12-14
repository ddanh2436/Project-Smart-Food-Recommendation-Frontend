import HeroSection from "@/components/HeroSection/HeroSection";
import TopRatingSection from "@/components/HomeSections/TopRatingSection";
import TopSpaceSection from "@/components/HomeSections/TopSpaceSection";
import TopQualitySection from "@/components/HomeSections/TopQualitySection";
import TopServiceSection from "@/components/HomeSections/TopServiceSection";
import TopPriceSection from "@/components/HomeSections/TopPriceSection";
import TopLocationSection from "@/components/HomeSections/TopLocationSection";
// Import component mới
import CitySpotlightSection from "@/components/HomeSections/CitySpotlightSection";

// 1. Định nghĩa kiểu dữ liệu trả về từ Backend (Khớp với Schema NestJS của bạn)
interface BackendRestaurant {
  _id: string;
  tenQuan: string;
  diemTrungBinh: number;
  diaChi: string;
  avatarUrl: string;
  tags?: string; // Dùng tạm làm tên món ăn
}

// 2. Hàm lấy dữ liệu từ API (Server-side Fetching)
async function getCityData(cityKey: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    // 2. Gọi API với URL động
    const res = await fetch(
      `${apiUrl}/restaurants?limit=4&sortBy=diemTrungBinh&order=desc&city=${cityKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error(`Failed to fetch data for ${cityKey}`);
      return [];
    }

    const resJson = await res.json();
    // ... (phần xử lý data giữ nguyên)
    const data: BackendRestaurant[] = resJson.data || [];

    return data.map((item) => ({
      id: item._id,
      name: item.tenQuan,
      rating: item.diemTrungBinh,
      address: item.diaChi,
      image: item.avatarUrl || '/assets/image/pho.png',
      dish: item.tags ? item.tags.split(',')[0] : 'Món ngon',
      dishEn: 'Specialty',
    }));
  } catch (error) {
    console.error(`Error fetching ${cityKey}:`, error);
    return []; // Trả về mảng rỗng để không làm crash trang
  }
}

// 3. Main Component (Chuyển thành async để await dữ liệu)
export default async function Home() {
  // Fetch dữ liệu song song cho nhanh
  const [hanoiRestaurants, hcmRestaurants] = await Promise.all([
    getCityData('hanoi'),
    getCityData('hcmc')
  ]);

  // Thông tin tĩnh cho section Hà Nội
  // Thông tin Hà Nội (Song ngữ)
  const hanoiProps = {
    cityId: 'hanoi',
    title: 'Hà Nội',
    titleEn: 'Hanoi',
    description: 'Thủ đô ngàn năm văn hiến, nơi hội tụ tinh hoa ẩm thực miền Bắc. Từ phở bò Lò Đúc đến bún chả Hàng Mành, mỗi món ăn là một câu chuyện văn hóa.',
    descriptionEn: 'The thousand-year-old capital, the convergence of Northern culinary essence. From Pho Lo Duc to Bun Cha Hang Manh, every dish tells a cultural story.',
    coverImage: '/assets/image/Hanoi.png', 
    restaurants: hanoiRestaurants,
  };

  // Thông tin TP.HCM (Song ngữ)
  const hcmProps = {
    cityId: 'hcmc',
    title: 'Hồ Chí Minh',
    titleEn: 'Ho Chi Minh City',
    description: 'Thành phố không ngủ với nền ẩm thực đường phố sôi động. Nơi giao thoa của văn hóa Đông Tây, nổi tiếng với cơm tấm, bánh mì và vô vàn món ngon khác.',
    descriptionEn: 'The sleepless city with vibrant street food culture. Where East meets West, famous for Broken Rice (Com Tam), Banh Mi, and countless other delicacies.',
    coverImage: '/assets/image/HCMC.png', 
    restaurants: hcmRestaurants,
    reverseLayout: true,
  };  

  return (
    <main>
      <HeroSection />
      
      {/* --- Section Mới: Spotlight Hà Nội --- */}
      {/* Chỉ render nếu có dữ liệu để tránh section trống */}
      {hanoiRestaurants.length > 0 && <CitySpotlightSection {...hanoiProps} />}

      <TopRatingSection />
      
      {/* --- Section Mới: Spotlight TP.HCM --- */}
      {hcmRestaurants.length > 0 && <CitySpotlightSection {...hcmProps} />}

      <TopSpaceSection />
      <TopQualitySection />
      <TopServiceSection />
      <TopPriceSection />
      <TopLocationSection />
    </main>
  );
}