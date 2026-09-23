/**
 * English for the cuisine and dish tags, and for place names.
 *
 * Like the attribute tags in restaurant.ts, these are a closed vocabulary the
 * crawler produced: about 170 tags cover 98% of every tag in the collection,
 * so this is a lookup rather than machine translation. Dishes a visitor is
 * likely to have met already keep their Vietnamese name, without diacritics,
 * with a short gloss; the rest are described. A tag not listed here is shown
 * as stored.
 */
export const DISH_EN: Record<string, string> = {
  // Regional cooking
  "Món Bắc": "Northern Vietnamese",
  "Món Miền Trung": "Central Vietnamese",
  "Món miền Trung": "Central Vietnamese",
  "Món Miền Nam": "Southern Vietnamese",
  "Món Miền Tây": "Mekong Delta cooking",
  "Món Huế": "Hue cooking",
  "Món Quảng Nam": "Quang Nam cooking",
  "Món Hội An": "Hoi An cooking",
  "Món Tây Bắc": "Northwest highland cooking",
  "Món Bình Định": "Binh Dinh cooking",
  "Món Việt": "Vietnamese",
  "Món Hoa/Việt": "Chinese-Vietnamese",
  "Đặc sản": "Local specialities",

  // Kinds of place and meal
  "Nhậu": "Drinks & bar snacks",
  "Món Nhậu": "Bar snacks",
  "Món nhậu": "Bar snacks",
  "Món nướng": "Grilled dishes",
  "Hải sản": "Seafood",
  "Lẩu": "Hot pot",
  "Lẩu mắm": "Fermented-fish hot pot",
  "Ốc": "Snails & shellfish",
  "Ốc hút": "Sucking snails",
  "Ăn vặt": "Snacks",
  "Món Ăn Vặt": "Snacks",
  "Món ăn vặt": "Snacks",
  "Ăn nhanh": "Quick bites",
  "Tiện lợi": "Grab and go",
  "Đồ chay": "Vegetarian",
  "Healthy": "Healthy",
  "Tráng miệng": "Desserts",
  "Kem": "Ice cream",
  "Chè": "Che (sweet soup)",
  "Tào phớ": "Tofu pudding",

  // Drinks
  "Cà phê": "Coffee",
  "Coffee": "Coffee",
  "Thức uống": "Drinks",
  "Giải khát": "Refreshments",
  "Trà sữa": "Bubble tea",
  "Trà": "Tea",
  "Sinh tố": "Smoothies",
  "Nước ép": "Fresh juice",
  "Nước ép - Sinh tố": "Juice & smoothies",
  "Dừa": "Coconut",

  // Noodle soups
  "Phở": "Pho (noodle soup)",
  "Phở Bắc": "Northern-style pho",
  "Phở bò": "Beef pho",
  "Phở gà": "Chicken pho",
  "Phở cuốn": "Pho rolls",
  "Bún": "Rice vermicelli",
  "Bún bò Huế": "Bun bo Hue (spicy beef noodle soup)",
  "Bún đậu mắm tôm": "Bun dau (tofu, noodles & shrimp paste)",
  "Bún chả": "Bun cha (grilled pork & noodles)",
  "Bún chả cá": "Fish cake noodle soup",
  "Bún cá": "Fish noodle soup",
  "Bún mắm": "Fermented-fish noodle soup",
  "Bún riêu": "Crab noodle soup",
  "Bún thịt nướng": "Grilled pork vermicelli",
  "Bún ốc": "Snail noodle soup",
  "Bún thang": "Bun thang (Hanoi chicken & egg noodle soup)",
  "Bún mọc": "Pork meatball noodle soup",
  "Bún nước lèo": "Khmer fish noodle soup",
  "Bún dọc mùng": "Noodle soup with taro stems",
  "Mì Quảng": "Mi Quang (turmeric noodles)",
  "Mì": "Egg noodles",
  "Mì trộn": "Dry mixed noodles",
  "Miến": "Glass noodles",
  "Miến lươn": "Eel glass-noodle soup",
  "Miến trộn": "Dry glass noodles",
  "Hủ tiếu": "Hu tieu (clear noodle soup)",
  "Hủ tiếu Nam Vang": "Phnom Penh-style noodle soup",
  "Hủ tiếu Mỹ Tho": "My Tho-style noodle soup",
  "Bánh canh": "Banh canh (thick noodle soup)",
  "Bánh canh cá lóc": "Snakehead fish thick noodle soup",
  "Bánh canh chả cá": "Fish cake thick noodle soup",
  "Bánh đa": "Flat rice noodles",
  "Bánh đa cua": "Crab flat-noodle soup",
  "Cao lầu": "Cao lau (Hoi An noodles)",
  "Súp": "Soup",

  // Rice and porridge
  "Cơm": "Rice dishes",
  "Cơm tấm": "Com tam (broken rice)",
  "Cơm tấm Long Xuyên": "Long Xuyen broken rice",
  "Cơm gà": "Chicken rice",
  "Cơm gà Hội An": "Hoi An chicken rice",
  "Cơm gà xối mỡ": "Crispy fried chicken rice",
  "Cơm niêu": "Clay-pot rice",
  "Cơm chiên": "Fried rice",
  "Cơm hến": "Hue clam rice",
  "Xôi": "Sticky rice",
  "Cháo": "Rice porridge",
  "Cháo lòng": "Pork offal porridge",
  "Cháo vịt": "Duck porridge",
  "Cháo lươn": "Eel porridge",

  // Breads, cakes and rolls
  "Bánh mì": "Banh mi (sandwich)",
  "Bánh bao": "Steamed buns",
  "Bánh xèo": "Banh xeo (sizzling pancake)",
  "Bánh xèo tôm nhảy": "Shrimp sizzling pancake",
  "Bánh khọt": "Mini shrimp pancakes",
  "Bánh căn": "Banh can (mini rice cakes)",
  "Bánh cuốn": "Banh cuon (steamed rice rolls)",
  "Bánh ướt": "Steamed rice sheets",
  "Bánh bèo": "Steamed rice cakes",
  "Bánh bột lọc": "Tapioca dumplings",
  "Bánh lọc": "Tapioca dumplings",
  "Bánh nậm": "Flat rice dumplings",
  "Bánh Huế": "Hue rice cakes",
  "Bánh hỏi": "Woven rice noodles",
  "Bánh hỏi cháo lòng": "Woven rice noodles & offal porridge",
  "Bánh đúc": "Rice cake",
  "Bánh tằm": "Silkworm-shaped rice noodles",
  "Bánh tráng": "Rice paper",
  "Bánh tráng trộn": "Rice paper salad",
  "Bánh tráng nướng": "Grilled rice paper",
  "Bánh tráng kẹp": "Folded grilled rice paper",
  "Bánh tráng thịt heo": "Pork & rice paper rolls",
  "Bột chiên": "Fried rice-flour cake",
  "Gỏi cuốn": "Fresh spring rolls",
  "Gỏi": "Vietnamese salad",
  "Gỏi khô bò": "Dried beef salad",
  "Ram": "Crispy rolls",

  // Meat, fish and the rest
  "Chả": "Pork sausage",
  "Chả cá": "Fish cake",
  "Chả lụi": "Grilled skewers",
  "Nem": "Nem (spring rolls)",
  "Nem nướng": "Grilled pork sausage",
  "Nem nướng Nha Trang": "Nha Trang grilled pork rolls",
  "Nem chua rán": "Fried fermented pork",
  "Nem lụi": "Lemongrass pork skewers",
  "Nem cua": "Crab spring rolls",
  "Gà": "Chicken",
  "Vịt": "Duck",
  "Dê": "Goat",
  "Bò": "Beef",
  "Bò kho": "Beef stew",
  "Bò lá lốt": "Beef in betel leaves",
  "Bò né": "Sizzling beef & eggs",
  "Lươn": "Eel",
  "Lòng": "Offal",
  "Thịt quay": "Roast pork",
  "Chân gà": "Chicken feet",
  "Chân/Cánh gà": "Chicken feet & wings",
  "Cá viên chiên": "Fried fish balls",
};

/** Place names: "Quận 1" → "District 1", "Thành phố Biên Hòa" → "Biên Hòa City". */
export function placeEn(name: string): string {
  const rules: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^Quận\s+(\d+)$/i, (m) => `District ${m[1]}`],
    [/^Quận\s+(.+)$/i, (m) => `${m[1]} District`],
    [/^Huyện\s+(.+)$/i, (m) => `${m[1]} District`],
    [/^(?:Thành phố|Tp\.?)\s+(.+)$/i, (m) => `${m[1]} City`],
    [/^Thị xã\s+(.+)$/i, (m) => `${m[1]} Town`],
  ];
  const fixed: Record<string, string> = {
    "Hồ Chí Minh": "Ho Chi Minh City",
    "TP. HCM": "Ho Chi Minh City",
    "Hà Nội": "Hanoi",
    "Đà Nẵng": "Da Nang",
  };
  const trimmed = name.trim();
  if (fixed[trimmed]) return fixed[trimmed];
  for (const [pattern, render] of rules) {
    const match = trimmed.match(pattern);
    if (match) return render(match);
  }
  return trimmed;
}
