// app/(main)/about-us/page.tsx

'use client';
import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Image from 'next/image';
import './AboutUsPage.css'; // Import file CSS

// === DỮ LIỆU NGÔN NGỮ ĐÃ MỞ RỘNG ===
const langData = {
  en: {
    // Section 1
    discover: "Discover",
    storyTitle: "Our Story",
    storyContent: "Get the best steakhouse experience... Whether you're joining us for a romantic dinner, a business meeting, a private party or just a drink in the bar, our modern steakhouse will deliver superior service and an unforgettable dining experience.",
    storyCta: "Show More About Us",
    
    // Section 2
    menuTitle: "Our Menu",
    menuContent: "Few things come close to the joy of steak and chips - cooked simply with tender, loving care. Rest assured that our chefs treat our Irish beef with the respect it deserves. The open kitchen in many of our steakhouses are testimony to that.",

    // Section 3
    appetizerTitle: "Appetizer",
    appetizerContent: "Start with our fresh baked bread with an egg and basil on top.",

    // Section 4
    sideDishTitle: "Side Dish",
    sideDishContent: "Have a healthy salad mixed with light diced meat to complement your meal.",

    // Section 5
    dessertTitle: "Dessert",
    dessertContent: "Finish your kitchen experience with a cake to cleanse your mouth.",

    // Section 6
    eventsTitle: "Upcoming Events",
    eventsContent: "Not only can you get the best steak in town, we can follow up with your old friends while enjoying the food we provide.",
    event1: "Barbecue Party",
    event2: "December 26 | Lunch Time | Casual",

    // Section 7
    ingredientsTitle: "The Best Ingredients",
    ingredientsContent: "We put an enormous amount of pride in sourcing our ingredients and only use the finest available. We're truly able to achieve this level of excellence by putting an extra level of care into our menu items that is difficult to find at other restaurants.",
  },
  vn: {
    // Section 1
    discover: "Khám phá",
    storyTitle: "Câu chuyện",
    storyContent: "Trải nghiệm nhà hàng bít tết tuyệt vời nhất... Dù bạn đến dùng bữa tối lãng mạn, gặp gỡ đối tác, tổ chức tiệc riêng tư hay chỉ đơn giản là thưởng thức đồ uống tại quầy bar, nhà hàng của chúng tôi sẽ mang đến dịch vụ cao cấp và một trải nghiệm khó quên.",
    storyCta: "Xem thêm về chúng tôi",

    // Section 2
    menuTitle: "Thực đơn",
    menuContent: "Khó có gì sánh bằng niềm vui thưởng thức bít tết và khoai tây chiên - được chế biến đơn giản với sự chăm sóc dịu dàng. Các đầu bếp của chúng tôi luôn trân trọng thịt bò Ailen. Bếp mở ở nhiều nhà hàng của chúng tôi là minh chứng cho điều đó.",
    
    // Section 3
    appetizerTitle: "Khai vị",
    appetizerContent: "Bắt đầu với bánh mì nướng tươi của chúng tôi cùng một quả trứng và húng quế.",

    // Section 4
    sideDishTitle: "Món phụ",
    sideDishContent: "Thưởng thức món salad lành mạnh trộn với thịt thái hạt lựu để bổ sung cho bữa ăn của bạn.",

    // Section 5
    dessertTitle: "Tráng miệng",
    dessertContent: "Kết thúc trải nghiệm ẩm thực của bạn với một chiếc bánh ngọt để tráng miệng.",

    // Section 6
    eventsTitle: "Sự kiện sắp tới",
    eventsContent: "Bạn không chỉ có được món bít tết ngon nhất thị trấn mà còn có thể quây quần cùng bạn bè cũ trong khi thưởng thức các món ăn chúng tôi cung cấp.",
    event1: "Tiệc BBQ",
    event2: "26 tháng 12 | Giờ ăn trưa | Thân mật",

    // Section 7
    ingredientsTitle: "Nguyên liệu tốt nhất",
    ingredientsContent: "Chúng tôi vô cùng tự hào về nguồn nguyên liệu và chỉ sử dụng những gì tốt nhất. Chúng tôi thực sự có thể đạt được mức độ xuất sắc này bằng cách chăm chút thêm cho các món trong thực đơn, điều khó tìm thấy ở các nhà hàng khác.",
  }
};
// ===================================

const AboutUsPage: React.FC = () => {
  const { currentLang } = useAuth();
  const T = langData[currentLang];

  return (
    <div className="about-us-page-wrapper">
      {/* Lớp hiệu ứng khói mờ ảo (Toàn trang, cố định) */}
      <div className="smoky-animation-fullpage"></div>

      {/* SECTION 1: OUR STORY (Như cũ, nhưng là 1 phần của trang) */}
      <section className="about-section section-story">
        <div className="about-image-col">
          <Image 
            src="/assets/image/pho.png" // Bạn có thể đổi ảnh này cho phù hợp
            alt="Our Story"
            width={500}
            height={500}
            className="section-image-style"
          />
        </div>
        <div className="about-text-col">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.storyTitle}</h2>
          <p>{T.storyContent}</p>
          <a href="#" className="cta-link">{T.storyCta}</a>
        </div>
      </section>

      {/* SECTION 2: OUR MENU (Chỉ có text) */}
      <section className="about-section section-menu">
        <div className="menu-text-content">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.menuTitle}</h2>
          <p>{T.menuContent}</p>
        </div>
      </section>

      {/* SECTION 3: APPETIZER (Ảnh trái, chữ phải) */}
      <section className="about-section section-food">
        <div className="about-image-col">
           {/*  */}
           <div className="image-placeholder"><p>Appetizer Image</p></div>
        </div>
        <div className="about-text-col">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.appetizerTitle}</h2>
          <p>{T.appetizerContent}</p>
        </div>
      </section>

      {/* SECTION 4: SIDE DISH (Chữ trái, ảnh phải) */}
      <section className="about-section section-food reverse">
        <div className="about-text-col">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.sideDishTitle}</h2>
          <p>{T.sideDishContent}</p>
        </div>
        <div className="about-image-col">
          {/*  */}
          <div className="image-placeholder"><p>Side Dish Image</p></div>
        </div>
      </section>

      {/* SECTION 5: DESSERT (Ảnh trái, chữ phải) */}
      <section className="about-section section-food">
        <div className="about-image-col">
          {/*  */}
          <div className="image-placeholder"><p>Dessert Image</p></div>
        </div>
        <div className="about-text-col">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.dessertTitle}</h2>
          <p>{T.dessertContent}</p>
        </div>
      </section>

      {/* SECTION 6: UPCOMING EVENTS (Ảnh trái, chữ phải) */}
      <section className="about-section section-events">
        <div className="about-image-col">
          {/*  */}
          <div className="image-placeholder"><p>Events Image</p></div>
        </div>
        <div className="about-text-col">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.eventsTitle}</h2>
          <p>{T.eventsContent}</p>
          <div className="event-details">
            <p><strong>{T.event1}</strong></p>
            <p>{T.event2}</p>
          </div>
          <a href="#" className="cta-link">More Events</a>
        </div>
      </section>

      {/* SECTION 7: BEST INGREDIENTS (Text full-width, ảnh bên dưới) */}
      <section className="about-section section-ingredients">
        <div className="menu-text-content">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.ingredientsTitle}</h2>
          <p>{T.ingredientsContent}</p>
        </div>
        <div className="ingredients-grid">
           {/*  */}
           <div className="image-placeholder small"><p>Ingredient 1</p></div>
           {/*  */}
           <div className="image-placeholder small"><p>Ingredient 2</p></div>
           {/*  */}
           <div className="image-placeholder small"><p>Ingredient 3</p></div>
           {/*  */}
           <div className="image-placeholder small"><p>Ingredient 4</p></div>
        </div>
      </section>

    </div>
  );
};

export default AboutUsPage;