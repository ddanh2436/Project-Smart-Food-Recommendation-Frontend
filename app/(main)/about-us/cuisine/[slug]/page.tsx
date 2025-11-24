// app/(main)/about-us/cuisine/[slug]/page.tsx
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import "./CuisineDetail.css";

// Dữ liệu chi tiết (Đã thêm đầy đủ Lịch sử & Công thức cho cả 3 món)
const cuisineDetails: any = {
  "pho": {
    img: "/assets/image/about-us/aboutUs-slug/Pho-slug.png",
    historyImg: "/assets/image/about-us/aboutUs-slug/Pho-history.png",
    en: {
      title: "Pho",
      subtitle: "The Soul of Vietnam",
      desc: "Pho is more than just a noodle soup; it is the essence of Vietnamese culinary heritage. A clear, aromatic broth simmered for hours with beef bones, star anise, and cinnamon, poured over soft rice noodles and tender meat.",
      features: ["Bone Broth", "Rice Noodles", "Herbs", "Rare Beef"],
      
      historyTitle: "History of Pho",
      historyContent: "Pho is believed to have originated in the early 20th century in Northern Vietnam. It began as a simple street food sold by vendors carrying heavy yokes (gánh phở) through the narrow streets of Hanoi. Over decades, Pho journeyed south, evolving with local flavors.",
      historyCaption: "Traditional Pho vendor in Hanoi (Early 20th Century)",

      recipeTitle: "Traditional Recipe",
      ingredientsTitle: "Ingredients",
      ingredientsList: [
        "Beef bones (marrow, oxtail) & Beef cuts",
        "Pho rice noodles (fresh or dry)",
        "Ginger, shallots, yellow onion",
        "Spices: Star anise, cinnamon, cardamom, cloves",
        "Fish sauce, rock sugar, salt",
        "Garnishes: Scallions, cilantro, basil, lime, chili"
      ],
      stepsTitle: "Instructions",
      stepsList: [
        "Bone Prep: Clean bones and parboil for 10 mins to remove impurities.",
        "Simmer Broth: Place bones in cold water, simmer on low heat for 6-8 hours. Skim foam regularly.",
        "Char Aromatics: Grill ginger, shallots, and onion until fragrant. Lightly toast the spices.",
        "Seasoning: Add aromatics & spices to the pot (1 hour before finishing). Season with fish sauce, salt, and rock sugar.",
        "Assemble: Blanch noodles, arrange sliced beef on top, and pour boiling broth over.",
        "Serve: Garnish with fresh herbs, squeeze lime, and enjoy hot."
      ]
    },
    vn: {
      title: "Phở",
      subtitle: "Quốc hồn Quốc túy",
      desc: "Phở không chỉ là một món súp; đó là tinh hoa của di sản ẩm thực Việt Nam. Nước dùng trong vắt, thơm lừng được ninh hàng giờ từ xương bò, hoa hồi và quế, chan lên bánh phở mềm và những lát thịt bò tươi ngon.",
      features: ["Nước dùng xương", "Bánh phở", "Rau thơm", "Bò tái"],

      historyTitle: "Lịch sử của Phở",
      historyContent: "Phở được cho là ra đời vào đầu thế kỷ 20 tại miền Bắc Việt Nam. Khởi nguồn từ món quà sáng bình dân trên đôi quang gánh của những người bán hàng rong len lỏi khắp phố phường Hà Nội. Qua nhiều thập kỷ, Phở theo chân người Việt di cư vào Nam, biến tấu thêm hương vị đặc trưng.",
      historyCaption: "Gánh phở truyền thống tại Hà Nội (Đầu thế kỷ 20)",

      recipeTitle: "Cách Nấu Phở Bò",
      ingredientsTitle: "Nguyên liệu chuẩn bị",
      ingredientsList: [
        "Xương bò (ống, đuôi) & Thịt bò (nạm, gầu, tái)",
        "Bánh phở (tươi hoặc khô)",
        "Gừng, hành tím, hành tây",
        "Gia vị hương: Hồi, quế, thảo quả, đinh hương, hạt mùi",
        "Gia vị nêm: Nước mắm ngon, đường phèn, muối",
        "Rau ăn kèm: Hành lá, ngò rí, húng quế, chanh, ớt tươi"
      ],
      stepsTitle: "Các bước thực hiện",
      stepsList: [
        "Sơ chế xương: Rửa sạch xương, chần qua nước sôi khoảng 10 phút để loại bỏ bọt bẩn và mùi hôi.",
        "Ninh nước dùng: Cho xương vào nồi nước lạnh, ninh lửa nhỏ từ 6-8 tiếng. Thường xuyên vớt bọt để nước trong.",
        "Nướng gia vị: Nướng gừng, hành tím, hành tây cho thơm rồi cạo sạch vỏ đen. Rang sơ hoa hồi, quế, thảo quả.",
        "Nấu nước dùng: Cho các gia vị đã nướng vào túi vải, thả vào nồi nước dùng (trước khi tắt bếp 1 tiếng). Nêm nếm nước mắm, muối, đường phèn vừa ăn.",
        "Hoàn thiện: Chần bánh phở qua nước sôi, xếp thịt bò thái lát lên trên, chan nước dùng thật sôi vào bát.",
        "Thưởng thức: Rắc thêm hành ngò, ăn kèm rau sống, chanh và tương ớt."
      ]
    }
  },

  "banh-mi": {
    img: "/assets/image/about-us/Banh_mi.png",
    historyImg: "/assets/image/about-us/Banh_mi.png",
    en: {
      title: "Banh Mi",
      subtitle: "The World's Best Sandwich",
      desc: "A perfect symphony of textures and flavors. The crispy baguette, influenced by French colonialism, is filled with savory meats, rich pate, pickled vegetables, fresh cilantro, and spicy chili.",
      features: ["Crispy Baguette", "Pate", "Pickles", "Cilantro"],
      
      historyTitle: "History of Banh Mi",
      historyContent: "The Banh Mi is a product of cultural fusion, emerging during the French colonial period in the late 19th century. Originally just bread with butter and ham, the Vietnamese adapted it in the 1950s by adding local ingredients like pickles, cilantro, and chili sauce, creating the iconic street food.",
      historyCaption: "A classic Banh Mi stall in Saigon",

      recipeTitle: "Classic Banh Mi Recipe",
      ingredientsTitle: "Ingredients",
      ingredientsList: [
        "Vietnamese Baguette (crispy thin crust)",
        "Liver Pate, Mayonnaise, Butter",
        "Cold cuts: Ham, Pork roll (Chả lụa), Char siu",
        "Pickled Carrots & Daikon",
        "Cucumber strips, Cilantro, Chili",
        "Seasoning: Soy sauce (Maggi), Pepper"
      ],
      stepsTitle: "Instructions",
      stepsList: [
        "Crisp the Bread: Toast the baguette lightly until warm and crispy.",
        "Base Layer: Slice the bread open. Spread a generous layer of mayonnaise and pate inside.",
        "Fillings: Layer the cold cuts, ham, or grilled pork evenly.",
        "Vegetables: Add cucumber strips, pickled carrots/daikon, and fresh cilantro for crunch and balance.",
        "Seasoning: Add chili slices (optional), drizzle with soy sauce, and sprinkle a pinch of black pepper.",
        "Serve: Close the sandwich and enjoy immediately for the best texture."
      ]
    },
    vn: {
      title: "Bánh Mì",
      subtitle: "Ổ bánh mì ngon nhất thế giới",
      desc: "Một bản giao hưởng hoàn hảo của kết cấu và hương vị. Ổ bánh mì giòn rụm, chịu ảnh hưởng của ẩm thực Pháp, kết hợp cùng thịt nguội, pate béo ngậy, đồ chua giòn tan, rau mùi thơm và ớt cay nồng.",
      features: ["Vỏ giòn", "Pate gan", "Đồ chua", "Ngò rí"],

      historyTitle: "Lịch sử Bánh Mì",
      historyContent: "Bánh mì là sản phẩm của sự giao thoa văn hóa, xuất hiện trong thời kỳ Pháp thuộc vào cuối thế kỷ 19. Ban đầu chỉ là bánh mì với bơ và thịt nguội, người Việt đã biến tấu nó vào những năm 1950 bằng cách thêm các nguyên liệu địa phương như đồ chua, ngò rí và tương ớt.",
      historyCaption: "Một xe bánh mì cổ điển tại Sài Gòn",

      recipeTitle: "Cách Làm Bánh Mì Truyền Thống",
      ingredientsTitle: "Nguyên liệu chuẩn bị",
      ingredientsList: [
        "Bánh mì Việt Nam (vỏ mỏng, ruột xốp)",
        "Pate gan, Sốt bơ trứng (Mayonnaise)",
        "Thịt nguội: Chả lụa, Thịt xá xíu, Dăm bông",
        "Đồ chua (Cà rốt & Củ cải ngâm giấm đường)",
        "Dưa leo thái dọc, Ngò rí, Ớt sừng",
        "Nước tương (Xì dầu), Tiêu xay"
      ],
      stepsTitle: "Các bước thực hiện",
      stepsList: [
        "Làm nóng: Nướng sơ lại bánh mì trong lò khoảng 1-2 phút để vỏ thật giòn.",
        "Lớp nền: Xẻ dọc ổ bánh, phết đều bơ và pate vào hai mặt ruột bánh.",
        "Nhân thịt: Xếp lần lượt các loại chả lụa, thịt nguội hoặc thịt nướng vào giữa.",
        "Rau củ: Thêm dưa leo, đồ chua và ngò rí để tạo độ giòn và cân bằng vị béo.",
        "Gia vị: Thêm vài lát ớt (tùy khẩu vị), chan một thìa nước tương và rắc chút tiêu.",
        "Thưởng thức: Kẹp bánh lại và thưởng thức ngay khi còn nóng giòn."
      ]
    }
  },

  "coffee": {
    img: "/assets/image/about-us/coffee.png",
    historyImg: "/assets/image/about-us/coffee.png",
    en: {
      title: "Vietnamese Coffee",
      subtitle: "Strong & Bold",
      desc: "Vietnamese coffee is famous for its strong drip brewing method using a 'phin'. Whether it's the intense black coffee or the sweet and creamy 'Ca phe sua da' with condensed milk, it wakes up your senses immediately.",
      features: ["Robusta Beans", "Phin Filter", "Condensed Milk", "Ice"],
      
      historyTitle: "Coffee Culture",
      historyContent: "Coffee was introduced to Vietnam by the French in 1857. Vietnam quickly became a coffee powerhouse, primarily growing Robusta beans known for their high caffeine content and bold taste. The unique 'phin' filter creates a slow-drip ritual encouraging conversation.",
      historyCaption: "Morning coffee ritual with the Phin filter",

      recipeTitle: "Phin Coffee Brew Guide",
      ingredientsTitle: "Ingredients",
      ingredientsList: [
        "Robusta Coffee (Medium-coarse grind)",
        "Sweetened Condensed Milk",
        "Boiling water (approx. 95°C)",
        "Ice cubes (optional)",
        "Phin filter (Aluminum or Stainless steel)"
      ],
      stepsTitle: "Instructions",
      stepsList: [
        "Prep: Rinse the Phin filter with boiling water to warm it up.",
        "Milk Base: Pour 2-3 tablespoons of condensed milk into the glass.",
        "Add Coffee: Add 3 teaspoons of coffee grounds into the Phin. Shake gently to level it, then place the press disc on top.",
        "Bloom: Pour a small amount (20ml) of hot water into the Phin. Wait 1-2 mins for the coffee to bloom.",
        "Brew: Fill the Phin with hot water (approx. 60-80ml), cover with the lid, and let it drip slowly (3-5 mins).",
        "Enjoy: Stir well to mix the milk and coffee. Add ice for 'Ca phe sua da'."
      ]
    },
    vn: {
      title: "Cà Phê Việt",
      subtitle: "Đậm đà bản sắc",
      desc: "Cà phê Việt Nam nổi tiếng với phương pháp pha phin độc đáo. Dù là ly cà phê đen đá đậm đặc hay ly bạc xỉu ngọt ngào béo ngậy với sữa đặc, nó sẽ đánh thức mọi giác quan của bạn ngay lập tức.",
      features: ["Hạt Robusta", "Pha Phin", "Sữa đặc", "Đá viên"],

      historyTitle: "Văn hóa Cà phê",
      historyContent: "Cà phê được người Pháp đưa vào Việt Nam năm 1857. Việt Nam nhanh chóng trở thành cường quốc cà phê, chủ yếu trồng hạt Robusta với hàm lượng caffeine cao và vị đậm đà. Chiếc phin cà phê độc đáo tạo nên một nghi thức 'nhỏ giọt' chậm rãi.",
      historyCaption: "Nghi thức cà phê sáng với phin truyền thống",

      recipeTitle: "Cách Pha Cà Phê Phin",
      ingredientsTitle: "Nguyên liệu chuẩn bị",
      ingredientsList: [
        "Bột cà phê Robusta (xay thô vừa phải)",
        "Sữa đặc có đường (Ông Thọ hoặc Ngôi Sao)",
        "Nước sôi (khoảng 90-95 độ C)",
        "Đá viên (cho cà phê sữa đá)",
        "Phin pha cà phê (nhôm giữ nhiệt tốt hơn)"
      ],
      stepsTitle: "Các bước thực hiện",
      stepsList: [
        "Tráng phin: Dùng nước sôi tráng qua phin và ly để làm nóng và vệ sinh dụng cụ.",
        "Chuẩn bị sữa: Cho 2-3 thìa sữa đặc vào đáy ly (gia giảm tùy độ ngọt mong muốn).",
        "Nén cà phê: Cho 3 thìa bột cà phê vào phin, lắc nhẹ để mặt phẳng, dùng gài nén nhẹ tay (không nén quá chặt).",
        "Ủ cà phê: Rót khoảng 20ml nước sôi vào phin, chờ 1-2 phút để cà phê nở đều (giai đoạn ủ).",
        "Nhỏ giọt: Rót tiếp nước sôi gần đầy phin (60-80ml), đậy nắp và chờ cà phê nhỏ giọt từ từ.",
        "Thưởng thức: Khuấy đều sữa và cà phê để hòa quyện. Thêm đá viên nếu muốn uống lạnh sảng khoái."
      ]
    }
  }
};

export default function CuisineDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { currentLang } = useAuth();
  
  const dishKey = Array.isArray(slug) ? slug[0] : slug;
  const dishData = cuisineDetails[dishKey || "pho"]; 

  if (!dishData) return <div className="loading">Loading...</div>;

  const content = dishData[currentLang];

  return (
    <div className="cuisine-detail-page">
      <div className="cuisine-container">
        {/* Nút Back */}
        <button onClick={() => router.back()} className="back-btn">
          &larr; {currentLang === 'vn' ? 'Quay lại' : 'Back'}
        </button>

        {/* === PHẦN 1: HERO === */}
        <div className="detail-grid mb-20">
          <div className="detail-image-wrapper animate-pop">
            <Image src={dishData.img} alt={content.title} fill className="detail-img" />
          </div>
          <div className="detail-content animate-slideUp">
            <span className="detail-subtitle">{content.subtitle}</span>
            <h1 className="detail-title">{content.title}</h1>
            <p className="detail-desc">{content.desc}</p>
            <div className="detail-features">
              {content.features.map((item: string, idx: number) => (
                <span key={idx} className="feature-tag">{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* === PHẦN 2: LỊCH SỬ === */}
        <div className="history-section animate-slideUp delay-200">
          <div className="history-grid reverse-layout">
            <div className="history-text">
              <h2 className="history-heading">{content.historyTitle}</h2>
              <p className="history-desc">{content.historyContent}</p>
            </div>
            <div className="history-image-col">
              <div className="history-img-frame">
                <Image src={dishData.historyImg} alt={content.historyTitle} fill className="history-img" />
              </div>
              <p className="history-caption">{content.historyCaption}</p>
            </div>
          </div>
        </div>

        {/* === PHẦN 3: CÔNG THỨC NẤU ĂN (RECIPE) === */}
        {/* Chỉ hiển thị nếu có dữ liệu recipeTitle */}
        {content.recipeTitle && (
          <div className="recipe-section animate-slideUp delay-200">
            <h2 className="recipe-heading">{content.recipeTitle}</h2>
            
            <div className="recipe-container">
              {/* Cột Nguyên liệu */}
              <div className="recipe-col ingredients-col">
                <h3 className="recipe-subheading">{content.ingredientsTitle}</h3>
                <ul className="ingredients-list">
                  {content.ingredientsList.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Cột Các bước thực hiện */}
              <div className="recipe-col steps-col">
                <h3 className="recipe-subheading">{content.stepsTitle}</h3>
                <ol className="steps-list">
                  {content.stepsList.map((step: string, idx: number) => (
                    <li key={idx}>
                      <span className="step-num">{idx + 1}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}