// app/(main)/about-us/page.tsx

"use client";
import React, { useEffect, useRef, useState } from "react"; 
import { useAuth } from "@/app/contexts/AuthContext";
import Image from "next/image";
import "./AboutUsPage.css";

// === DỮ LIỆU NGÔN NGỮ ===
const langData = {
  en: {
    heroTitle: "The Essence of Vietnamese Cuisine",
    heroDesc: "Connecting passion, sharing flavors. Discover the stories behind every dish with VietNomNom.",
    heroBtn: "DISCOVER OUR STORY",
    discover: "Discover",
    meet: "Meet", 
    meetTeam: "Meet the Team", 
    storyTitle: "Our Story",
    storyContent:
      "In a world where everything is digital, sharing a meal is one of the last true acts of connection. It’s where deals are made, friendships are forged, and love stories begin. But a bad meal can ruin a good moment. At VietNomNom, our mission is simple: to ensure every gathering is accompanied by great food. We don't just recommend restaurants; we recommend memories. Let us take care of the menu, so you can focus on the people sitting across from you.",
    storyCta: "Read More",
    menuTitle: "Our Members",
    menuContent:
      "Crafted with love by our members - believers that a good meal can turn a bad day around. Thank you for letting our passion be part of your dining experience.",
    appetizerTitle: "Duy Anh",
    appetizerContent:
      "The Head Chef of Operations. Blending dry code, raw data, and spicy designs into a perfect recipe. Main job: Making sure the team doesn't burn the deadline (or the office) and keeping cool when the servers heat up.",
    appetizerDish: "Signature Dish: Black Coffee – Fuel for carrying the team.",
    sideDishTitle: "Ho Phuc Kien",
    sideDishContent:
      "Making sure the UI looks as tasty as the food. Believes that good design is like good plating – it makes everything better.",
    sideDishDish: "Signature Dish: Wagyu Beef – Because presentation is everything.",
    dessertTitle: "Quoc Khánh",
    dessertContent:
      "The Digital Sommelier. Teaching computers to understand cravings. He knows you want pizza before you even realize it yourself.",
    dessertDish: "Signature Dish: Omakase – Loves the surprise element, just like AI predictions.",
    eventsTitle: "Manh Dat",
    eventsContent:
      "The Data Hunter. Scouring the internet for hidden menus and reviews while you sleep, so you never have to wonder 'what’s good here?' again.",
    eventsDish: "Signature Dish: Instant Noodles at 2 AM – The fuel of data hunters.",
    
    // --- [UPDATED] MASTERPIECE SECTION (English) ---
    masterpieceSubtitle: "Masterpieces",
    masterpieceTitle: "Vietnamese Cuisine",
    masterpieceContent: "Vietnamese cuisine holds a magical allure, not only for those born and raised in this S-shaped land but also for travelers eager to conquer the world's mysteries. The essence and heritage of our culinary traditions are preserved and continue to reach the world, fueled by the passion and enthusiasm within every Vietnamese person.",
    
    mpItem1: "Pho",
    mpItem2: "Banh mi",
    mpItem3: "Coffee",

    // Ingredients Translations
    ingredientsTitle: "The Best Vietnamese Ingredients",
    ingredientsContent:
      "We take great pride in our ingredients and use only the best. We can truly achieve this level of excellence by putting extra care into our menu items, something hard to find at other restaurants.",
    ingredient1: "Herbs",
    ingredient2: "Fish Sauce",
    ingredient3: "Rice",
    ingredient4: "Broth",
  },
  vn: {
    heroTitle: "Tinh hoa Ẩm thực Việt",
    heroDesc: "Kết nối đam mê, chia sẻ hương vị. Khám phá câu chuyện đằng sau mỗi món ăn cùng VietNomNom.",
    heroBtn: "KHÁM PHÁ CÂU CHUYỆN CỦA CHÚNG TÔI",
    discover: "Khám phá",
    meet: "Gặp gỡ", 
    meetTeam: "Giới thiệu thành viên", 
    storyTitle: "Câu chuyện",
    storyContent:
      "Trong một thế giới mà mọi thứ đều được số hóa, việc cùng nhau chia sẻ một bữa ăn là một trong những sợi dây kết nối thực tế cuối cùng còn sót lại. Đó là nơi những hợp đồng được ký kết, tình bạn được thắt chặt và những chuyện tình bắt đầu. Nhưng một bữa ăn tệ có thể phá hỏng khoảnh khắc đẹp đẽ đó. Tại VietNomNom, sứ mệnh của chúng tôi rất đơn giản: đảm bảo mọi cuộc gặp gỡ đều đi kèm với những món ăn tuyệt vời. Chúng tôi không chỉ gợi ý nhà hàng, chúng tôi gợi ý những kỷ niệm. Hãy để chúng tôi lo phần thực đơn, để bạn toàn tâm toàn ý dành thời gian cho những người ngồi đối diện.",
    storyCta: "Xem chi tiết",
    menuTitle: "Thành viên của chúng tôi",
    menuContent:
      "Được tạo nên bởi cảm hứng của những người tin rằng một bữa ăn ngon có thể thay đổi cả một ngày dài. Cảm ơn bạn đã để tâm huyết của chúng tôi trở thành một phần trong trải nghiệm của bạn.",
    appetizerTitle: "Duy Anh",
    appetizerContent:
      "Bếp trưởng điều hành. Người có nhiệm vụ 'trộn' các thuật toán AI khô khan và giao diện bay bổng thành một món ăn hoàn chỉnh. Sở trường: Giữ cho team không 'cháy' deadline như kho thịt cháy và giữ cái đầu lạnh khi server nóng.",
    appetizerDish: "Món tủ: Cà phê đen – Nguồn năng lượng để vận hành cả team.",
    sideDishTitle: "Hồ Phúc Kiên",
    sideDishContent:
      "Người chịu trách nhiệm làm cho website trông 'ngon mắt' như chính món ăn vậy. Tin rằng một giao diện đẹp cũng quan trọng như cách bày biện (plating) trên đĩa.",
    sideDishDish: "Món tủ: Bò Wagyu – Vì hình thức cũng quan trọng như hương vị.",
    dessertTitle: "Quốc Khánh",
    dessertContent:
      "Nhà tâm lý học ẩm thực. Dạy máy tính cách 'đọc vị' cái bụng đói của bạn, thậm chí biết bạn thèm bún bò trước cả khi bạn nhận ra.",
    dessertDish: "Món tủ: Omakase – Thích sự bất ngờ, giống như cách AI hoạt động.",
    eventsTitle: "Mạnh Đạt",
    eventsContent:
      "Thợ săn dữ liệu. Trong khi bạn ngủ, anh ấy đang 'quét' sạch menu của cả thành phố để bạn không bao giờ phải hỏi 'quán này bán gì?'.",
    eventsDish: "Món tủ: Mì tôm chanh lúc 2 giờ sáng – Nhiên liệu của thợ săn dữ liệu.",
    
    // --- [UPDATED] MASTERPIECE SECTION (Vietnamese) ---
    masterpieceSubtitle: "Tuyệt tác",
    masterpieceTitle: "Ẩm thực Việt Nam",
    masterpieceContent: "Ẩm thực Việt Nam là một sự quyến rũ kì diệu không chỉ với những người sinh ra và lớn lên ở mảnh đất hình chữ S, mà còn với cả những du khách sẵn sàng chinh phục những điều bí ẩn trên thế giới này. Những tinh hoa và di sản của ẩm thực Việt Nam đã và đang tiếp tục được gìn giữ, và không ngừng vươn xa ra thế giới bởi chính niềm đam mê và sự nhiệt huyết có trong mỗi người Việt Nam.",
    
    mpItem1: "Phở",
    mpItem2: "Bánh mì",
    mpItem3: "Cà phê",

    // Ingredients Translations
    ingredientsTitle: "Nguyên liệu tốt nhất",
    ingredientsContent:
      "Chúng tôi vô cùng tự hào về nguồn nguyên liệu và chỉ sử dụng những gì tốt nhất. Chúng tôi thực sự có thể đạt được mức độ xuất sắc này bằng cách chăm chút thêm cho các món trong thực đơn, điều khó tìm thấy ở các nhà hàng khác.",
    ingredient1: "Rau Thơm",
    ingredient2: "Nước Mắm",
    ingredient3: "Gạo Tẻ",
    ingredient4: "Nước Dùng",
  },
};

// === HÀM SMOOTH SCROLL (Giữ nguyên) ===
const smoothScrollTo = (targetId: string, duration: number) => {
  const target = document.getElementById(targetId);
  if (!target) return;

  const start = window.scrollY;
  const targetPosition = target.getBoundingClientRect().top + window.scrollY;
  const distance = targetPosition - start;
  let startTime: number | null = null;

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = (t: number, b: number, c: number, d: number) => {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    };
    const nextScrollY = run(timeElapsed, start, distance, duration);
    window.scrollTo(0, nextScrollY);
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };
  requestAnimationFrame(animation);
};

// === ICON SCROLL (Giữ nguyên) ===
const ScrollDownIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="scroll-down-icon"
  >
    <polyline points="12 5 12 19"></polyline>
    <polyline points="19 12 12 19 5 12"></polyline>
  </svg>
);


const AboutUsPage: React.FC = () => {
  const { currentLang } = useAuth();
  const T = langData[currentLang];

  const [showScrollPrompt, setShowScrollPrompt] = useState(false); 

  const handleScrollToStory = () => {
    smoothScrollTo("our-story", 2000);
  };

  const handleScrollToMembers = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    smoothScrollTo("our-members", 1500);
  };
  
  const handleScrollToDuyAnh = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    smoothScrollTo("member-duyanh", 1500);
  };

  const scrollingDown = useRef(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      scrollingDown.current = currentY > lastScrollY.current;
      lastScrollY.current = currentY;
      
      // Logic dòng chữ cuộn
      const memberStartElement = document.getElementById('member-duyanh');
      const ingredientsStartElement = document.querySelector('.section-ingredients'); 

      if (memberStartElement && ingredientsStartElement) {
        const memberStart = memberStartElement as HTMLElement; 
        const ingredientsStart = ingredientsStartElement as HTMLElement;

        const startY = memberStart.offsetTop; 
        const endYThreshold = ingredientsStart.offsetTop; 
        const windowHeight = window.innerHeight;

        const startThreshold = startY - windowHeight / 3;
        const endThreshold = endYThreshold - windowHeight + 1;

        if (window.scrollY >= startThreshold && window.scrollY < endThreshold) { 
          setShowScrollPrompt(true);
        } else {
          setShowScrollPrompt(false);
        }
      } else {
        setShowScrollPrompt(false);
      }
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
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll(".about-section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div
      className={`about-us-page-wrapper ${
        currentLang === "vn" ? "lang-vn" : ""
      }`}
    >
      <div className="smoky-animation-fullpage"></div>

      {/* HERO SECTION */}
      <div className="about-page-hero">
        <div className="about-hero-content">
          <h1 className="about-hero-title">{T.heroTitle}</h1>
          <p className="about-hero-desc">{T.heroDesc}</p>
          <button onClick={handleScrollToStory} className="btn-hero-gold">
            {T.heroBtn}
          </button>
        </div>
      </div>

      {/* SECTION 1: STORY */}
      <section id="our-story" className="about-section section-story">
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
          <a
            href="#our-members"
            onClick={handleScrollToMembers}
            className="cta-link"
          >
            {T.storyCta}
          </a>
        </div>
      </section>

      {/* SECTION 2: MEMBERS */}
      <section id="our-members" className="about-section section-menu">
        <div className="menu-text-content animate-fadeIn">
          <span className="discover-subtitle">{T.meet}</span> 
          <h2 className="section-title">{T.menuTitle}</h2>
          <p>{T.menuContent}</p>
          
          <a
            href="#member-duyanh"
            onClick={handleScrollToDuyAnh}
            className="cta-link"
          >
            {T.meetTeam} 
          </a>
        </div>
      </section>

      {/* SECTION 3: DUY ANH */}
      <section id="member-duyanh" className="about-section section-food">
        <div className="about-image-col animate-fadeIn stagger-delay-1">
          <div className="image-placeholder">
            <Image
            src="/assets/image/members/Danh.png"
            alt="Duy Anh Profile"
            fill
            style={{ objectFit: "cover" }}
            />
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
            <Image
            src="/assets/image/members/Kien.png"
            alt="Kien's Profile"
            fill
            style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* SECTION 5: QUOC KHANH - ĐÃ KHÔI PHỤC TEXT VÀ DÙNG ẢNH ĐƠN */}
      <section className="about-section section-food">
        {/* IMAGE COLUMN - Left */}
        <div className="about-image-col animate-fadeIn stagger-delay-1">
          <div className="image-placeholder">
            <Image
            src="/assets/image/members/Khanh.png" 
            alt="Khanh's Profile"
            fill
            style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        
        {/* TEXT COLUMN - Right (Đã khôi phục) */}
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

      {/* SECTION 6: MANH DAT - ĐÃ SỬA LẠI THỨ TỰ THƯỜNG (IMAGE LEFT, TEXT RIGHT) HOẶC REVERSE (TEXT LEFT, IMAGE RIGHT) */}
      {/* Do Section 5 đã là IMAGE LEFT, TEXT RIGHT, Section 6 nên dùng REVERSE (TEXT LEFT, IMAGE RIGHT) để luân phiên */}
      <section className="about-section section-food reverse">
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
        <div className="about-image-col animate-fadeIn stagger-delay-1">
          <div className="image-placeholder">
            <Image
            src="/assets/image/members/Dat.png"
            alt="Dat's Profile"
            fill
            style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* === SECTION 7: TUYỆT TÁC ẨM THỰC (MASTERPIECES) === */}
      <section className="about-section section-ingredients">
        <div className="menu-text-content animate-fadeIn">
          <span className="discover-subtitle">{T.masterpieceSubtitle}</span>
          <h2 className="section-title">{T.masterpieceTitle}</h2>
          <p>{T.masterpieceContent}</p>
        </div>

        {/* Grid 3 cột */}
        <div className="ingredients-grid three-cols">
          
          {/* Ảnh 1 */}
          <div className="image-placeholder small animate-fadeIn stagger-delay-1">
            <Image
              src="/assets/image/about-us/pho2.png" 
              alt={T.mpItem1}
              fill
              style={{ objectFit: "cover" }}
            />
            <p>{T.mpItem1}</p>
          </div>

          {/* Ảnh 2 */}
          <div className="image-placeholder small animate-fadeIn stagger-delay-2">
            <Image
              src="/assets/image/about-us/Banh_mi.png" 
              alt={T.mpItem2}
              fill
              style={{ objectFit: "cover" }}
            />
            <p>{T.mpItem2}</p>
          </div>

          {/* Ảnh 3 */}
          <div className="image-placeholder small animate-fadeIn stagger-delay-3">
            <Image
              src="/assets/image/about-us/coffee.png" 
              alt={T.mpItem3}
              fill
              style={{ objectFit: "cover" }}
            />
            <p>{T.mpItem3}</p>
          </div>

        </div>
      </section>

      {/* === SECTION 8: NGUYÊN LIỆU TỐT NHẤT (INGREDIENTS) === */}
      <section className="about-section section-ingredients">
        <div className="menu-text-content animate-fadeIn">
          <span className="discover-subtitle">{T.discover}</span>
          <h2 className="section-title">{T.ingredientsTitle}</h2>
          <p>{T.ingredientsContent}</p>
        </div>
        <div className="ingredients-grid">
          {/* Item 1 */}
          <div className="image-placeholder small animate-fadeIn stagger-delay-1">
            <Image
              src="/assets/image/about-us/Herb.jpg" 
              alt={T.ingredient1}
              fill
              style={{ objectFit: "cover" }}
            />
            <p>{T.ingredient1}</p>
          </div>
          {/* Item 2 */}
          <div className="image-placeholder small animate-fadeIn stagger-delay-2">
            <Image
              src="/assets/image/about-us/Fish_Sauce.jpg" 
              alt={T.ingredient2}
              fill
              style={{ objectFit: "cover" }}
            />
            <p>{T.ingredient2}</p>
          </div>
          {/* Item 3 */}
          <div className="image-placeholder small animate-fadeIn stagger-delay-3">
            <Image
              src="/assets/image/about-us/Rice.jpg" 
              alt={T.ingredient3}
              fill
              style={{ objectFit: "cover" }}
            />
            <p>{T.ingredient3}</p>
          </div>
          {/* Item 4 */}
          <div className="image-placeholder small animate-fadeIn stagger-delay-4">
            <Image
              src="/assets/image/about-us/Broth.jpg" 
              alt={T.ingredient4}
              fill
              style={{ objectFit: "cover" }}
            />
            <p>{T.ingredient4}</p>
          </div>
        </div>
      </section>
      
      {/* DÒNG CHỮ SCROLLING CỐ ĐỊNH Ở ĐÁY */}
      {showScrollPrompt && (
        <div className="scroll-prompt-container">
          <p>{currentLang === 'vn' ? "Lướt xuống dưới để xem tiếp" : "Scroll down to continue"}</p>
          <ScrollDownIcon />
        </div>
      )}
    </div>
  );
};

export default AboutUsPage;