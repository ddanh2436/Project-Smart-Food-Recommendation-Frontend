# Kế hoạch Cào dữ liệu Foody (Python & Selenium)

---

## 1. 📝 Problem Definition (Phân tích bài toán)

* **Mục tiêu:** Xây dựng một script Python có khả năng tự động truy cập vào trang web Foody.vn, tìm kiếm các nhà hàng (theo một khu vực/thể loại nhất định), và trích xuất thông tin chi tiết về chúng.
* **Input (Đầu vào):**
    * Một URL gốc (ví dụ: trang danh sách các quán ăn tại một quận ở TP.HCM).
    * Các CSS Selectors hoặc XPaths để script biết "nhìn" vào đâu lấy dữ liệu.
* **Output (Đầu ra):**
    * Một file dữ liệu có cấu trúc (`foody_data.json` hoặc `foody_data.csv`).

* [cite_start]**Yêu cầu (Trừu tượng hóa dữ liệu):** Dựa trên file PDF của đồ án [cite: 85-90], mỗi nhà hàng/quán ăn trong file output CẦN chứa ít nhất các thông tin sau:
    1.  `name`: Tên nhà hàng.
    2.  `address`: Địa chỉ chi tiết.
    3.  `location_gps`: (Nếu có thể lấy được từ script của Foody, nếu không thì tạm bỏ qua).
    4.  `avg_price`: Giá trung bình (ví dụ: "100.000đ - 250.000đ").
    5.  `tags`: Các thẻ loại hình (ví dụ: "Nhà hàng", "Cà phê", "Bún", "Phở"...).
    6.  `rating`: Điểm đánh giá (ví dụ: 8.5).
    7.  `opening_hours`: Giờ mở cửa (Rất quan trọng cho du lịch!).

---

## 2. 🧩 Decompose (Phân rã nhiệm vụ)

### A. Thiết lập môi trường
* Cài đặt Python.
* Cài đặt `selenium`: `pip install selenium`
* Tải **WebDriver** tương ứng (ví dụ: `chromedriver` cho Google Chrome). Đây là file "cầu nối" để Python điều khiển được trình duyệt.

### B. Tác vụ 1: Điều khiển trình duyệt (Selenium)
* Viết code để khởi chạy một trình duyệt Chrome.
* Điều hướng trình duyệt đến URL gốc (ví dụ: `foody.vn`).

### C. Tác vụ 2: Nhận diện mẫu (Pattern Recognition - Thủ công)

* Bạn cần tìm "khuôn mẫu" (CSS selector) cho 3 thứ:
    1.  **Khuôn mẫu "Scroll":** Foody sử dụng "infinite scroll" (cuộn để tải thêm). Bạn phải tìm cách Selenium tự động cuộn xuống cuối trang nhiều lần để tải tất cả các quán ăn.
    2.  **Khuôn mẫu "Item":** Selector để lấy link (URL) của *từng quán ăn* trong danh sách.
    3.  **Khuôn mẫu "Chi tiết":** Các selector cho Tên, Địa chỉ, Giá, Rating... (như ở mục 1) trên *trang chi tiết* của quán ăn.

### D. Tác vụ 3: Logic Cào dữ liệu (Algorithm)



* **Phần A (Cào danh sách):**
    1.  Mở URL gốc (Tác vụ 1).
    2.  Dùng Selenium thực hiện cuộn trang (scroll) N lần cho đến khi không còn kết quả nào được tải thêm (Tác vụ 2 - Mẫu "Scroll").
    3.  Thu thập *tất cả* các URL chi tiết của quán ăn vào một danh sách (List) (Tác vụ 2 - Mẫu "Item").

* **Phần B (Cào chi tiết):**
    1.  Tạo một danh sách rỗng (ví dụ: `all_restaurants = []`).
    2.  **Lặp (Loop)** qua từng URL trong danh sách vừa thu thập ở Phần A:
        * Mở URL chi tiết đó.
        * Chờ trang tải xong (Selenium có `WebDriverWait` để làm việc này).
        * Trích xuất (extract) Tên, Địa chỉ, Giá, Rating... dựa trên các selector (Tác vụ 2 - Mẫu "Chi tiết").
        * Lưu các thông tin này vào một Dictionary (JSON object).
        * Thêm Dictionary này vào `all_restaurants`.

### E. Tác vụ 4: Xử lý ngoại lệ và Lưu trữ
* **Xử lý lỗi:** Sử dụng `try...except` vì chắc chắn sẽ có quán bị thiếu thông tin (thiếu giá, thiếu giờ mở cửa...). Nếu không có `try...except`, script sẽ bị "văng" (crash) giữa chừng.
* **Lưu file:** Sau khi vòng lặp (Tác vụ 3B) kết thúc, lưu danh sách `all_restaurants` ra file `foody_data.json`.

---

## 3. 🗓️ Timeline (Tiến độ 3 ngày)

Đây là kế hoạch chi tiết cho 3 ngày, bắt đầu từ hôm nay.

* **Hôm nay (Thứ 6 - Tối): Nhiệm vụ 1 & 2**
    * **(1-2 tiếng)** Cài đặt môi trường: Python, Selenium, WebDriver (Tác vụ 1).
    * **(2-3 tiếng) Nghiên cứu (R&D):** Đây là phần quan trọng nhất. Dành thời gian bật F12 trên Foody. Ghi lại *tất cả* các CSS selectors/XPaths cần thiết (Tác vụ 2) vào một file text.
    * **Mục tiêu cuối ngày:** Chạy thành công script mở được trang Foody và có một danh sách các selector.

* **Ngày mai (Thứ 7 - Cả ngày): Nhiệm vụ 3 & 4 (Phần code chính)**
    * **(Sáng):** Code Tác vụ 3A (Cào danh sách). Viết code cuộn trang (scroll) và lấy ra được danh sách các link chi tiết. In (print) danh sách link này ra màn hình để kiểm tra.
    * **(Chiều):** Code Tác vụ 3B và 4 (Cào chi tiết & Xử lý lỗi). Viết code lặp qua các link, vào trang chi tiết, trích xuất dữ liệu. Thêm `try...except`.
    * **(Tối):** Ghép hai phần lại. Chạy thử nghiệm với một lượng dữ liệu nhỏ (ví dụ: chỉ cuộn 3 lần, lấy 10 quán) để kiểm tra lỗi và lưu ra file JSON.
    * **Mục tiêu cuối ngày:** Có một script hoàn chỉnh, chạy thử nghiệm thành công.

* **Ngày kia (Chủ Nhật): Nhiệm vụ 5 (Thực thi và Bàn giao)**
    * **(Sáng): Thực thi (Run).** Cho script chạy thật. Quá trình này có thể mất 1-3 tiếng (hoặc lâu hơn) tùy vào lượng dữ liệu bạn muốn cào.
        * *Lưu ý:* Khi Selenium đang chạy, bạn không nên dùng máy tính để tránh làm gián đoạn.
    * **(Chiều): Làm sạch và Chuyển đổi.** Mở file JSON/CSV đã cào được. Kiểm tra xem dữ liệu có ổn không, có bị `null` nhiều không, có bị sai định dạng không?
    * **(Tối):** Hoàn tất file dữ liệu.

---

## 4. 🛠️ Tools (Công cụ)

Tổng hợp lại các công cụ bạn sẽ dùng cho nhiệm vụ này:

* **Ngôn ngữ:** `Python 3.x`
* **Thư viện chính:**
    * `Selenium`: Dùng để tự động hóa trình duyệt.
    * `WebDriver`: File thực thi làm cầu nối giữa Selenium và trình duyệt.
* **Thư viện hỗ trợ (Khuyến khích):**
    * `BeautifulSoup4 (bs4)`: Sau khi Selenium tải trang, dùng `bs4` để phân tích (parse) cây HTML.
    * `Pandas`: Dùng để lưu dữ liệu ra file CSV/JSON.
* **Công cụ khác:**
    * **Chrome/Firefox DevTools (F12):** Công cụ quan trọng nhất để tìm các "pattern" (selectors/XPaths).

---

## 5. 🚀 Bước tiếp theo (Sau khi có dữ liệu)

Sau khi có file `foody_data.json`, công việc tiếp theo sẽ là **tích hợp vào backend Nest.js**:
