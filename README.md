# VietNomNom — Frontend

Giao diện Next.js của VietNomNom, web gợi ý quán ăn dựa trên đánh giá thật: tìm quán bằng câu nói tự nhiên, chatbot,
hỏi đáp về từng quán, tóm tắt review theo khía cạnh, tìm bằng ảnh món ăn, chỉ đường, lưu và so sánh quán.

- Chạy thật: <https://project-smart-food-recommendation-f.vercel.app> (Vercel)
- Backend: [Project-Smart-Food-Recommendation-Backend](https://github.com/ddanh2436/Project-Smart-Food-Recommendation-Backend)
- AI service: [Project-Smart-Food-Recommendation-AI](https://github.com/ddanh2436/Project-Smart-Food-Recommendation-AI)
- Triển khai: [DEPLOY.md](./DEPLOY.md)

## Công nghệ

- Next.js 16 (App Router) + React 19, TypeScript strict
- CSS riêng cho từng component; Tailwind v4 cho phần chat
- Leaflet + leaflet-routing-machine để chỉ đường (bản đồ OpenStreetMap / ArcGIS, định tuyến OSRM)
- axios, gom vào một client duy nhất trong `app/lib/api.ts`

## Cấu trúc

```text
app/
  (main)/                có header + footer
    page.tsx             trang chủ: hero, "ăn gì bây giờ", điểm đến Hà Nội / TP.HCM, các mục top theo tiêu chí
    restaurants/         danh sách + bộ lọc, trang chi tiết quán, so sánh quán
    chatbot/             chatbot toàn trang
    about-us/            giới thiệu và bách khoa món ăn
    profile/             tài khoản, khẩu vị, review đã viết
  (user)/auth/           đăng nhập / đăng ký, callback Google
  not-found.tsx          trang 404
  contexts/AuthContext   phiên đăng nhập và ngôn ngữ
  hooks/                 useChatSession, useGeolocation, useTranslation
  lib/                   api.ts (client API), i18n.ts (chuỗi vi/en), rating.ts, restaurant.ts (giờ mở cửa, tag)
components/
  HomeSections/          các mục trang chủ (TopScoreSection dùng chung cho 5 tiêu chí)
  RestaurantDetail/      hỏi đáp về quán, review, quán tương tự
  ReviewAspects/         tóm tắt review theo 6 khía cạnh
  ChatWidget/            chatbot nổi ở mọi trang
  RoutingMap/            bản đồ chỉ đường
```

## Cấu hình

```bash
cp .env.example .env.local
```

| Biến | Mục đích |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | địa chỉ Backend, không có `/` ở cuối |
| `NEXT_PUBLIC_SITE_URL` | địa chỉ của chính web, dùng cho metadata SEO |

Mọi biến bắt đầu bằng `NEXT_PUBLIC_` đều nằm trong bundle gửi xuống trình duyệt, nên không bao giờ đặt secret vào đó.

## Những điểm cần biết

- **Một client API.** `app/lib/api.ts` là nơi duy nhất gọi Backend. Gặp 401 thì client đổi refresh token một lần rồi
  gửi lại request; nhiều request 401 cùng lúc dùng chung một lần refresh.
- **Một nguồn điểm.** Interceptor trong `api.ts` thay mọi điểm bằng điểm đã hiệu chỉnh (`...Adj`) và giữ điểm gốc ở
  `rawScores`. Nhờ vậy thẻ quán, trang chi tiết và chatbot hiện cùng một con số.
- **Trang chủ không lặp quán.** `getHomeRails()` tải mỗi loại điểm một lần rồi chia quán theo thứ tự các mục trên
  trang, bỏ quán đã hiện ở mục trước. Khi biết vị trí thì lọc theo thành phố gần nhất (`nearestCity`).
- **Vị trí thật.** `useGeolocation` chỉ tự lấy vị trí khi người dùng đã cho phép từ trước; còn lại thì chờ người dùng
  bấm nút. Chưa có vị trí thì giao diện ẩn khoảng cách, không đoán.
- **Song ngữ.** Mọi chuỗi nằm trong `app/lib/i18n.ts` và được đọc qua `useTranslation()`. Ngôn ngữ lưu ở
  `localStorage` (`vnn:lang`).
- **Hydration.** Component render ở server không được dùng `Math.random()`, `Date.now()` hay `localStorage` trong lần
  render đầu, nếu không sẽ gặp lỗi React #418. Đọc những giá trị này trong `useEffect`.
- **Header bảo mật** (`next.config.ts`): Content-Security-Policy (script chỉ từ chính web, chỉ được gọi tới API và
  dịch vụ định tuyến, ảnh chỉ từ host ảnh quán và bản đồ), `X-Frame-Options`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`. Thêm host ảnh mới thì sửa cả `images.remotePatterns` lẫn `imageHosts` của CSP.

## Phát triển

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npx tsc --noEmit
npm run lint
```
