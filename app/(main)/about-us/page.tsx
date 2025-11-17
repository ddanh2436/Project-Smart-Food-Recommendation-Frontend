// app/(main)/about-us/page.tsx

"use client";
import React, { useEffect, useRef } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";
import "./AboutUsPage.css";

// === DỮ LIỆU NGÔN NGỮ (Giữ nguyên) ===
const langData = {
  en: {
    // General
    discover: "Discover",
    meet: "Meet",

    // Section 1: Story
    storyTitle: "Our Story",
    storyContent:
      "In a world where everything is digital, sharing a meal is one of the last true acts of connection. It’s where deals are made, friendships are forged, and love stories begin. But a bad meal can ruin a good moment. At VietNomNom, our mission is simple: to ensure every gathering is accompanied by great food. We don't just recommend restaurants; we recommend memories. Let us take care of the menu, so you can focus on the people sitting across from you.",
    storyCta: "Show More About Us",

    // Section 2: Intro Members
    menuTitle: "Our Members",
    menuContent:
      "Crafted with love by our members - believers that a good meal can turn a bad day around. Thank you for letting our passion be part of your dining experience.",

    // Section 3: Duy Anh
    appetizerTitle: "Duy Anh",
    appetizerContent:
      "The Head Chef of Operations. Blending dry code, raw data, and spicy designs into a perfect recipe. Main job: Making sure the team doesn't burn the deadline (or the office) and keeping cool when the servers heat up.",
    appetizerDish: "Signature Dish: Black Coffee – Fuel for carrying the team.",

    // Section 4: Ho Phuc Kien
    sideDishTitle: "Ho Phuc Kien",
    sideDishContent:
      "Making sure the UI looks as tasty as the food. Believes that good design is like good plating – it makes everything better.",
    sideDishDish: "Signature Dish: Wagyu Beef – Because presentation is everything.",

    // Section 5: Quoc Khanh
    dessertTitle: "Quoc Khanh",
    dessertContent:
      "The Digital Sommelier. Teaching computers to understand cravings. He knows you want pizza before you even realize it yourself.",
    dessertDish: "Signature Dish: Omakase – Loves the surprise element, just like AI predictions.",

    // Section 6: Manh Dat
    eventsTitle: "Manh Dat",
    eventsContent:
      "The Data Hunter. Scouring the internet for hidden menus and reviews while you sleep, so you never have to wonder 'what’s good here?' again.",
    eventsDish: "Signature Dish: Instant Noodles at 2 AM – The fuel of data hunters.",

    // Section 7: Ingredients
    ingredientsTitle: "The Best Vietnamese Food",
    ingredientsContent:
      "The 4 most well-known Vietnamese dishes that our members love to recommend: Pho, Banh Mi, Bun Cha, and Goi Cuon. Each dish is a testament to Vietnam's rich culinary heritage and the passion of our community.",
  },
  vn: {
    // General
    discover: "Khám phá",
    meet: "Gặp gỡ",

    // Section 1
    storyTitle: "Câu chuyện",
    storyContent:
      "Trong một thế giới mà mọi thứ đều được số hóa, việc cùng nhau chia sẻ một bữa ăn là một trong những sợi dây kết nối thực tế cuối cùng còn sót lại. Đó là nơi những hợp đồng được ký kết, tình bạn được thắt chặt và những chuyện tình bắt đầu. Nhưng một bữa ăn tệ có thể phá hỏng khoảnh khắc đẹp đẽ đó. Tại VietNomNom, sứ mệnh của chúng tôi rất đơn giản: đảm bảo mọi cuộc gặp gỡ đều đi kèm với những món ăn tuyệt vời. Chúng tôi không chỉ gợi ý nhà hàng, chúng tôi gợi ý những kỷ niệm. Hãy để chúng tôi lo phần thực đơn, để bạn toàn tâm toàn ý dành thời gian cho những người ngồi đối diện.",
    storyCta: "Xem thêm về chúng tôi",

    // Section 2
    menuTitle: "Thành viên của chúng tôi",
    menuContent:
      "Được tạo nên bởi cảm hứng của những người tin rằng một bữa ăn ngon có thể thay đổi cả một ngày dài. Cảm ơn bạn đã để tâm huyết của chúng tôi trở thành một phần trong trải nghiệm của bạn.",

    // Section 3
    appetizerTitle: "Duy Anh",
    appetizerContent:
      "Bếp trưởng điều hành. Người có nhiệm vụ 'trộn' các thuật toán AI khô khan và giao diện bay bổng thành một món ăn hoàn chỉnh. Sở trường: Giữ cho team không 'cháy' deadline như kho thịt cháy và giữ cái đầu lạnh khi server nóng.",
    appetizerDish: "Món tủ: Cà phê đen – Nguồn năng lượng để vận hành cả team.",

    // Section 4
    sideDishTitle: "Hồ Phúc Kiên",
    sideDishContent:
      "Người chịu trách nhiệm làm cho website trông 'ngon mắt' như chính món ăn vậy. Tin rằng một giao diện đẹp cũng quan trọng như cách bày biện (plating) trên đĩa.",
    sideDishDish: "Món tủ: Bò Wagyu – Vì hình thức cũng quan trọng như hương vị.",

    // Section 5
    dessertTitle: "Quốc Khánh",
    dessertContent:
      "Nhà tâm lý học ẩm thực. Dạy máy tính cách 'đọc vị' cái bụng đói của bạn, thậm chí biết bạn thèm bún bò trước cả khi bạn nhận ra.",
    dessertDish: "Món tủ: Omakase – Thích sự bất ngờ, giống như cách AI hoạt động.",

    // Section 6
    eventsTitle: "Mạnh Đạt",
    eventsContent:
      "Thợ săn dữ liệu. Trong khi bạn ngủ, anh ấy đang 'quét' sạch menu của cả thành phố để bạn không bao giờ phải hỏi 'quán này bán gì?'.",
    eventsDish: "Món tủ: Mì tôm chanh lúc 2 giờ sáng – Nhiên liệu của thợ săn dữ liệu.",

    // Section 7
    ingredientsTitle: "Nguyên liệu tốt nhất",
    ingredientsContent:
      "Chúng tôi vô cùng tự hào về nguồn nguyên liệu và chỉ sử dụng những gì tốt nhất. Chúng tôi thực sự có thể đạt được mức độ xuất sắc này bằng cách chăm chút thêm cho các món trong thực đơn, điều khó tìm thấy ở các nhà hàng khác.",
  },
};
// ===================================

const AboutUsPage: React.FC = () => {
  const { currentLang } = useAuth();
  const T = langData[currentLang];

  const handleScrollToMembers = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Ngăn chặn hành vi nhảy trang mặc định của thẻ a
    const membersSection = document.getElementById("our-members");
    if (membersSection) {
      membersSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollingDown = useRef(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      scrollingDown.current = currentY > lastScrollY.current;
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const animatedChildren =
            entry.target.querySelectorAll<HTMLElement>(".animate-fadeIn");

          if (entry.isIntersecting) {
            animatedChildren.forEach((child) => {
              if (scrollingDown.current) {
                child.classList.add("from-bottom");
                child.classList.remove("from-top");
              } else {
                child.classList.add("from-top");
                child.classList.remove("from-bottom");
              }
              child.classList.add("is-visible");
            });
          } else {
            animatedChildren.forEach((child) => {
              child.classList.remove("is-visible");
            });
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    const sections = document.querySelectorAll(".about-section");
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (observer) {
          observer.unobserve(section);
        }
      });
    };
  }, []);
  // === KẾT THÚC LOGIC JS ===

  return (
    <div
      className={`about-us-page-wrapper ${
        currentLang === "vn" ? "lang-vn" : ""
      }`}
    >
      <div className="smoky-animation-fullpage"></div>

      {/* SECTION 1: OUR STORY */}
      <section className="about-section section-story">
        <div className="about-image-col animate-fadeIn stagger-delay-1">
          <Image
            src="/assets/image/pho.png"
            alt="Our Story"
            width={500}
            height={500}
            className="section-image-style"
          />
        </div>
        <div className="about-text-col animate-fadeIn">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.storyTitle}</h2>
          <p>{T.storyContent}</p>
          {/* [CẬP NHẬT] Thêm onClick và href để trỏ tới ID */}
          <a
            href="#our-members"
            onClick={handleScrollToMembers}
            className="cta-link"
          >
            {T.storyCta}
          </a>
        </div>
      </section>

      {/* SECTION 2: OUR MENU / INTRO MEMBER */}
      {/* [CẬP NHẬT] Thêm id="our-members" ở đây */}
      <section id="our-members" className="about-section section-menu">
        <div className="menu-text-content animate-fadeIn">
          <span className="discover-subtitle">{T.meet}</span>
          <h2 className="section-title">{T.menuTitle}</h2>
          <p>{T.menuContent}</p>
        </div>
      </section>

      {/* SECTION 3: DUY ANH */}
      <section className="about-section section-food">
        <div className="about-image-col animate-fadeIn stagger-delay-1">
          <div className="image-placeholder">
            <p>Duy Anh's Image</p>
          </div>
        </div>
        <div className="about-text-col animate-fadeIn">
          <span className="discover-subtitle">{T.meet}</span>
          <h2 className="section-title">{T.appetizerTitle}</h2>
          <p>
            {T.appetizerContent}
            <br />
            <br />
            <em style={{ color: "#e9a004" }}>{T.appetizerDish}</em>
          </p>
        </div>
      </section>

      {/* SECTION 4: HO PHUC KIEN */}
      <section className="about-section section-food reverse">
        <div className="about-text-col animate-fadeIn">
          <span className="discover-subtitle">{T.meet}</span>
          <h2 className="section-title">{T.sideDishTitle}</h2>
          <p>
            {T.sideDishContent}
            <br />
            <br />
            <em style={{ color: "#e9a004" }}>{T.sideDishDish}</em>
          </p>
        </div>
        <div className="about-image-col animate-fadeIn stagger-delay-1">
          <div className="image-placeholder">
            <p>Kien's Image</p>
          </div>
        </div>
      </section>

      {/* SECTION 5: QUOC KHANH */}
      <section className="about-section section-food">
        <div className="about-image-col animate-fadeIn stagger-delay-1">
          <div className="dessert-collage-V2">
            <Image
              src="/assets/image/about-us/Dessert_Table.png"
              alt="Bàn"
              fill
              style={{ objectFit: "cover" }}
              className="dessert-table-V2"
            />
            <div className="dessert-wrapper-V2">
              <div className="dessert-item-V2">
                <Image
                  src="/assets/image/about-us/Banh_Troi.png"
                  alt="Bánh trôi"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="dessert-item-V2">
                <Image
                  src="/assets/image/about-us/3_Color_Sweet_Soup.png"
                  alt="Chè ba màu"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="dessert-item-V2">
                <Image
                  src="/assets/image/about-us/Banh_Cam.png"
                  alt="Bánh cam"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="dessert-item-V2">
                <Image
                  src="/assets/image/about-us/Cake.png"
                  alt="Bánh da lợn"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="about-text-col animate-fadeIn">
          <span className="discover-subtitle">{T.meet}</span>
          <h2 className="section-title">{T.dessertTitle}</h2>
          <p>
            {T.dessertContent}
            <br />
            <br />
            <em style={{ color: "#e9a004" }}>{T.dessertDish}</em>
          </p>
        </div>
      </section>
      {/* === KẾT THÚC SECTION 5 === */}


      {/* SECTION 6: MANH DAT */}
      <section className="about-section section-events">
        <div className="about-image-col animate-fadeIn stagger-delay-1">
          <div className="image-placeholder">
            <p>Dat's Image</p>
          </div>
        </div>
        <div className="about-text-col animate-fadeIn">
          <span className="discover-subtitle">{T.meet}</span>
          <h2 className="section-title">{T.eventsTitle}</h2>
          <p>
            {T.eventsContent}
            <br />
            <br />
            <em style={{ color: "#e9a004" }}>{T.eventsDish}</em>
          </p>
          <div className="event-details"></div>
        </div>
      </section>

      {/* SECTION 7: BEST INGREDIENTS */}
      <section className="about-section section-ingredients">
        <div className="menu-text-content animate-fadeIn">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.ingredientsTitle}</h2>
          <p>{T.ingredientsContent}</p>
        </div>
        <div className="ingredients-grid">
          <div className="image-placeholder small animate-fadeIn stagger-delay-1">
            <p>Ingredient 1</p>
          </div>
          <div className="image-placeholder small animate-fadeIn stagger-delay-2">
            <p>Ingredient 2</p>
          </div>
          <div className="image-placeholder small animate-fadeIn stagger-delay-3">
            <p>Ingredient 3</p>
          </div>
          <div className="image-placeholder small animate-fadeIn stagger-delay-4">
            <p>Ingredient 4</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;