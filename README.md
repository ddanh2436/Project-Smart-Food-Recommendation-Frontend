# [Tên Dự án: VietNomNom]

Một ứng dụng web thông minh (Web App) sử dụng các nguyên lý của Tư duy Tính toán và AI để cung cấp các gợi ý ẩm thực địa phương, cá nhân hóa và "chuẩn vị" cho du khách tại Việt Nam.

---

## 1. Vấn đề Cốt lõi (The Core Problem)

Bài toán lớn (The Big Problem) mà dự án này giải quyết là:

> **Du khách tại Việt Nam bị "quá tải thông tin" và "thiếu thông tin cá nhân hóa" khi tìm kiếm trải nghiệm ẩm thực.**
>
> Các nền tảng hiện tại (như Google Maps, Foody) cung cấp hàng trăm kết quả chung chung. Du khách không thể biết quán nào phù hợp với khẩu vị cá nhân (ví dụ: "ăn cay", "ăn chay"), ngân sách, hoặc đâu mới là quán "chuẩn vị" (authentic) mà người bản địa hay ăn.
>
> **Mục tiêu** là xây dựng một hệ thống thông minh có khả năng tiếp nhận các nhu cầu phức tạp (ví dụ: "bún bò cay gần đây"), hiểu được sở thích cá nhân, và cung cấp ngay lập tức một **danh sách gợi ý ngắn (3-5), đã được xếp hạng** về các địa điểm phù hợp nhất.

---

## 2. Phân rã Vấn đề (Problem Decomposition)

Để giải quyết bài toán lớn và phức tạp trên, chúng tôi đã áp dụng các phương pháp Tư duy Tính toán để **"phân rã" (decompose)** nó thành các bài toán con nhỏ hơn, dễ quản lý và giải quyết hơn.

Chúng tôi đã chia luồng hoạt động của hệ thống thành **5 bài toán con chính**, tương ứng với 5 bước phát triển cốt lõi:

### 1. Bài toán Xác thực (Authentication)
* **Vấn đề:** Làm sao để xác thực người dùng (du khách) một cách an toàn, nhanh chóng và tiện lợi mà không cần họ tạo tài khoản thủ công?
* **Giải pháp:** Áp dụng **Trừu tượng hóa (Abstraction)** bằng cách sử dụng dịch vụ bên thứ ba (Firebase hoặc Supabase) để xử lý toàn bộ logic đăng nhập qua Google/Facebook. Backend (Nest.js) chỉ cần xác thực `token` và liên kết với người dùng trong MongoDB.

### 2. Bài toán Thu thập Hồ sơ (User Profiling)
* **Vấn đề:** Làm sao để hệ thống "biết" được sở thích nền tảng (khẩu vị, ngân sách, chế độ ăn kiêng) của người dùng để cá nhân hóa gợi ý?
* **Giải pháp:** Xây dựng một `OnboardingModal` (Step 2) bắt buộc sau lần đăng nhập đầu tiên để thu thập thông tin này và lưu vào CSDL (MongoDB), gắn với ID của người dùng.

### 3. Bài toán Hiểu Ý định (Intent Understanding)
* **Vấn đề:** Làm sao để hiểu được nhu cầu *tức thời* và *phức tạp* của người dùng, vốn có thể được thể hiện qua nhiều hình thức khác nhau?
* **Giải pháp (Pattern Recognition):** Nhận dạng ra 3 "mẫu" (pattern) truy vấn chính và cung cấp 3 cơ chế:
    1.  **AI Feature 1 (NLP):** Xử lý câu lệnh ngôn ngữ tự nhiên ("bún chả ngon quận 1").
    2.  **AI Feature 2 (Chatbot):** Đối thoại để làm rõ nhu cầu.
    3.  **Manual Filter:** Bộ lọc thủ công cho người dùng muốn tự chọn.

### 4. Bài toán Xếp hạng (The Ranking Problem)
* **Vấn đề:** Đây là **bài toán cốt lõi**. Sau khi có danh sách các quán ăn phù hợp, làm sao để *sắp xếp* chúng theo thứ tự "phù hợp nhất" với người dùng?
* **Giải pháp (Algorithm Design):** Thiết kế một **Thuật toán Tính điểm Gợi ý (Recommendation Score Algorithm)**.
    * `Final_Score = (w1 * Keyword_Score) + (w2 * Budget_Score) + (w3 * Taste_Score) + (w4 * Distance_Score)`
    * Thuật toán này sẽ tính toán điểm cho từng nhà hàng dựa trên sự "khớp" (matching) giữa nhà hàng và 3 nguồn input: Hồ sơ người dùng (Bài toán 2), Ý định tức thời (Bài toán 3), và Vị trí GPS.

### 5. Bài toán Hiển thị (Data Visualization)
* **Vấn đề:** Làm sao để hiển thị kết quả đã xếp hạng một cách trực quan, dễ hiểu và hữu ích cho du khách đang di chuyển?
* **Giải pháp:** Xây dựng giao diện (Step 4 & 5) cho phép 2 chế độ xem:
    1.  **Dạng Danh sách (List View):** Hiển thị các `ResultCard` (Tên, Ảnh, Giá, Khoảng cách) theo thứ tự `Final_Score`.
    2.  **Dạng Bản đồ (Map View):** Hiển thị các "pin" trên Google Maps.

---

## 3. Các Trụ cột Tư duy Tính toán Khác

Để giải quyết 5 bài toán con trên, chúng tôi cũng áp dụng:

### B. Trừu tượng hóa (Abstraction)
* **Trừu tượng hóa Nhà hàng:** Mọi quán ăn, dù phức tạp, đều được trừu tượng hóa thành một đối tượng trong MongoDB với các **`tags`** (ví dụ: `["phở bò", "cay", "giá rẻ"]`), `price_range` và `location`.
* **Trừu tượng hóa Ý định:** Mọi hình thức input (NLP, Chat, Filter) đều được chuẩn hóa thành một **"Đối tượng Truy vấn" (Query Object)**. Điều này cho phép Thuật toán Xếp hạng (Bài toán 4) chỉ cần xử lý một dạng input duy nhất.

### C. Nhận dạng Mẫu (Pattern Recognition)
* Nhận dạng các "mẫu" chung trong dữ liệu nhà hàng để xây dựng hệ thống `tags`.
* Nhận dạng các "mẫu" chung trong câu truy vấn của người dùng để xây dựng mô hình NLP (Bài toán 3).

### D. Thiết kế Thuật toán (Algorithm Design)
* Thuật toán lõi chính là **Thuật toán Tính điểm & Xếp hạng (Ranking Algorithm)** đã mô tả ở Bài toán 4, vốn là trái tim của toàn bộ dự án.

---

## 4. Ngăn xếp Công nghệ (Tech Stack)

* **Frontend:** Next.js (React)
* **Main Backend:** Nest.js (Node.js)
* **AI Backend:** Python (FastAPI)
* **Database:** MongoDB
* **Authentication:** Supabase / Firebase Auth
