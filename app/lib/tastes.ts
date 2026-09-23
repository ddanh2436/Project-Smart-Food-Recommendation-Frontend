/**
 * Tastes a profile can list. The same list as TASTE_TAGS on the API
 * (Backend/src/users/dto/update-user.dto.ts): real tags from the data, so a
 * preference can become a search the assistant understands.
 */
export const TASTE_TAGS = [
  "Phở",
  "Bún bò Huế",
  "Bún chả",
  "Bún đậu mắm tôm",
  "Cơm tấm",
  "Bánh mì",
  "Hủ tiếu",
  "Mì Quảng",
  "Bánh xèo",
  "Lẩu",
  "Món nướng",
  "Hải sản",
  "Ốc",
  "Ăn vặt",
  "Chè",
  "Cà phê",
  "Trà sữa",
  "Đồ chay",
  "Món Bắc",
  "Món Miền Trung",
  "Món Miền Nam",
  "Cơm văn phòng",
  "Nhậu",
  "Hẹn hò",
] as const;

export const MAX_TASTES = 12;

/** Diner level from the number of reviews written: 0, 1-2, 3-9, 10+. */
export function dinerLevel(reviewCount: number): number {
  if (reviewCount >= 10) return 3;
  if (reviewCount >= 3) return 2;
  if (reviewCount >= 1) return 1;
  return 0;
}
