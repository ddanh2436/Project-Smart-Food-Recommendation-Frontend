# README: Dự án Recommendation System AI

Đây là tài liệu mô tả luồng hoạt động (activity flow) và kiến trúc hệ thống cho dự án đề xuất món ăn, sử dụng kiến trúc "Hybrid" kết hợp NestJS, Flask và OpenAI.

## 🚀 1. Triết lý Thiết kế & Phân công Nhiệm vụ

Mục tiêu của chúng ta là xây dựng một hệ thống chính xác, phản ánh đúng ý định của người dùng. Triết lý cốt lõi đã được thống nhất là:

**LỌC (Filter) trước, sau đó XẾP HẠNG (Rank).** 

Ví dụ, với query "bún bò rẻ" và GPS, logic ưu việt là:

1. **LỌC:** Dùng (GPS + Tag "bún bò") để tìm ra 3 quán BÚN BÒ GẦN.
2. **XẾP HẠNG:** Lấy 3 quán đó và xếp hạng chúng theo `price` (vì user nói "rẻ"). 

Để thực hiện điều này, chúng ta phân công nhiệm vụ cho các module AI như sau:

### 🧠 1. OpenAI API (Bộ não Ngữ nghĩa)

Đây là module then chốt, có nhiệm vụ cực kỳ quan trọng là phân tích query thô của người dùng và trả về một JSON cấu trúc với 3 thông tin: 

1.  **`"location"`:** Địa danh (ví dụ: "Thanh Hóa") hoặc `null` (nếu user không nhắc đến địa danh cụ thể). 
2.  **`"tags"`:** Các tag món ăn/đặc điểm (ví dụ: `["bún bò"]`). 
3.  **`"sort_by"`:** Tiêu chí xếp hạng ngầm định mà user mong muốn. 
      * "tôi muốn ăn bún bò **rẻ**" ➔ `sort_by: "price"` 
      * "tôi muốn ăn bún bò **gần đây**" ➔ `sort_by: "distance"` 
      * "tôi muốn ăn bún bò **ngon nhất**" ➔ `sort_by: "rating"` 
      * "tôi muốn ăn bún bò" (không rõ ý) ➔ `sort_by: "taste"` (Mặc định) 

### 🐍 2. Flask (Server AI - Python)

Module này chứa các công cụ tính toán chuyên biệt:

  * [cite\_start]**TfidfVectorizer + cosine\_similarity (Công cụ "Taste"):** [cite: 28]
      * [cite\_start]**Nhiệm vụ:** Tính Điểm Sở thích (Taste Score) dựa trên mô tả, review, v.v. [cite: 29]
      * [cite\_start]**Endpoint:** Được gọi qua `POST /recommend`. [cite: 30]
  * [cite\_start]**5CD-AI (Chuyên gia Phụ trợ):** [cite: 31]
      * [cite\_start]**Nhiệm vụ Mới:** Chúng ta đã xác định module này dư thừa cho việc *xếp hạng*. [cite: 33]
      * [cite\_start]Nó sẽ chỉ được dùng cho endpoint `/sentiment` (Tóm tắt review khi user bấm xem chi tiết). [cite: 34]

### 📦 3. NestJS (Tổng Chỉ huy - Backend Chính)

Đây là "Tổng Chỉ huy"], nơi điều phối toàn bộ logic:

  * Tiếp nhận query từ frontend.
  * [cite\_start]Gọi OpenAI để phân tích ý định (lấy 3 key JSON). [cite: 42]
  * [cite\_start]Dựa trên kết quả từ OpenAI, thực hiện **LỌC** (Filter) bằng cách truy vấn CSDL (theo Tag và GPS/Location). [cite: 48]
  * [cite\_start]Sau khi có danh sách đã lọc, thu thập các điểm số (`s_distance`, `s_rating` từ CSDL, `s_taste` bằng cách gọi Flask). [cite: 54, 55, 56, 57]
  * [cite\_start]Dựa trên key `sort_by` (từ OpenAI), thực hiện **XẾP HẠNG** (Rank) danh sách đã lọc. [cite: 63, 65]
  * [cite\_start]Trả kết quả cuối cùng về cho frontend. [cite: 68]

### 🐼 4. pandas (Công cụ Dữ liệu)

  * **Nhiệm vụ:** Hoạt động như một "CSDL Tạm" trên `api.py` (Flask) để tính toán điểm Taste. [cite: 35, 36]

-----

## 🗺️ 2. Luồng Hoạt động (Chi tiết 3 Kịch bản)

[cite\_start]Đây là 3 kịch bản chính xác minh họa cho luồng hoạt động của hệ thống. [cite: 38]

### [cite\_start]Kịch bản A: "Bún bò rẻ" (Dùng GPS, Rank theo Giá) [cite: 39]

1.  [cite\_start]**User:** Gửi query = `"tôi muốn ăn bún bò rẻ"`, và `$gps=[10.77, 106.69]`. [cite: 41]
2.  [cite\_start]**OpenAI (Phân tích):** NestJS gọi OpenAI. [cite: 42] [cite\_start]OpenAI trả về: [cite: 43]
    ```json
    {
      "tags": ["bún bò"],
      "sort_by": "price",
      "location": null
    }
    ```
    [cite\_start][cite: 45, 46, 47]
3.  [cite\_start]**NestJS (LỌC 2 LỚP):** [cite: 48]
      * [cite\_start]Nhận JSON, thấy `location: null` ➔ Quyết định dùng GPS. [cite: 49]
      * **Lọc 1 (Tag):** `SELECT * FROM restaurants WHERE tags LIKE '%bún bò%'`. (Giả sử ra 10 quán)[cite\_start]. [cite: 50, 51]
      * [cite\_start]**Lọc 2 (GPS):** Lọc 10 quán trên, `distance(gps, [10.77...]) < 20km`. [cite: 52]
      * [cite\_start]**Kết quả Lọc:** Còn 3 quán "bún bò" gần [IDs: 1, 53, 76]. [cite: 53]
4.  [cite\_start]**NestJS (Thu thập Điểm):** Thu thập 3 bộ điểm cho 3 quán này: [cite: 54]
      * [cite\_start]`s_distance`: Tự tính. [cite: 55]
      * [cite\_start]`s_rating`: Lấy từ CSDL. [cite: 56]
      * [cite\_start]`s_taste`: Gọi `POST /recommend` (Flask) với `candidate_ids: [1, 53, 76]`. [cite: 57]
5.  [cite\_start]**Flask (Tính Taste):** Server Flask (dùng pandas, TF-IDF) tính và trả về điểm `s_taste` cho 3 quán. [cite: 60, 61, 62]
6.  [cite\_start]**NestJS (Xếp hạng - Rank):** [cite: 63]
      * [cite\_start]NestJS đã có đủ 3 bộ điểm cho 3 quán. [cite: 64]
      * [cite\_start]Nó đọc `sort_by: "price"` (từ OpenAI). [cite: 65]
      * [cite\_start]NestJS `sort()` 3 quán này, ưu tiên `price` (lấy từ CSDL) thấp nhất. [cite: 66]
7.  [cite\_start]**NestJS (Gửi Frontend):** Gửi 3 quán (đã lọc và xếp hạng theo "Giá") cho User. [cite: 67, 68]

### [cite\_start]Kịch bản B: "Bún bò gần đây nhất" (Dùng GPS, Rank theo GPS) [cite: 70]

1.  [cite\_start]**User:** Gửi query = `"tôi muốn ăn bún bò gần đây nhất"`, và `$gps=[...]`. [cite: 71]
2.  [cite\_start]**OpenAI (Phân tích):** Trả về: [cite: 72]
    ```json
    {
      "tags": ["bún bò"],
      "sort_by": "distance",
      "location": null
    }
    ```
    [cite\_start][cite: 74, 75, 76]
3.  [cite\_start]**NestJS (LỌC 2 LỚP):** Giống Kịch bản A, lọc ra 3 quán "bún bò" gần [IDs: 1, 53, 76]. [cite: 77]
4.  [cite\_start]**NestJS (Thu thập Điểm):** Giống Kịch bản A (thu thập `s_distance`, `s_rating`, `s_taste`). [cite: 78]
5.  [cite\_start]**NestJS (Xếp hạng - Rank):** [cite: 79]
      * [cite\_start]Nó đọc `sort_by: "distance"` (từ OpenAI). [cite: 80]
      * [cite\_start]NestJS `sort()` 3 quán này, ưu tiên `s_distance` (gần nhất). [cite: 81]
6.  [cite\_start]**NestJS (Gửi Frontend):** Gửi 3 quán (đã lọc và xếp hạng theo "Khoảng cách"). [cite: 82]

### [cite\_start]Kịch bản C: "Bún bò ngon nhất ở Thanh Hóa" (Bỏ qua GPS) [cite: 83]

1.  [cite\_start]**User:** Gửi query = `"bún bò ngon nhất ở Thanh Hóa"`, (GPS của user lúc này vô dụng). [cite: 86]
2.  [cite\_start]**OpenAI (Phân tích):** Trả về: [cite: 87]
    ```json
    {
      "tags": ["bún bò"],
      "sort_by": "rating",
      "location": "Thanh Hóa"
    }
    ```
    [cite\_start][cite: 89, 90, 91]
3.  [cite\_start]**NestJS (LỌC 2 LỚP):** [cite: 92]
      * [cite\_start]Nhận JSON, thấy `location: "Thanh Hóa"` ➔ **BỎ QUA GPS** của user. [cite: 93]
      * [cite\_start]**Lọc 1 (Tag):** `SELECT * ... WHERE tags LIKE '%bún bò%'`. [cite: 94]
      * [cite\_start]**Lọc 2 (Location):** Lọc tiếp `...AND city = 'Thanh Hóa'`. [cite: 95]
      * [cite\_start]**Kết quả Lọc:** Còn 1 quán "bún bò" ở Thanh Hóa [ID: 80]. [cite: 96]
4.  [cite\_start]**NestJS (Thu thập Điểm):** Thu thập 3 điểm (`distance`, `rating`, `taste`) cho quán [ID: 80]. [cite: 97]
5.  **NestJS (Xếp hạng - Rank):**
      * [cite\_start]Nó đọc `sort_by: "rating"`. [cite: 98]
      * (Chỉ có 1 quán nên quán đó vẫn đứng đầu)[cite\_start]. [cite: 99]
6.  [cite\_start]**NestJS (Gửi Frontend):** Gửi 1 quán (đã lọc) cho User. [cite: 100]

-----

Đây là luồng hoạt động chính xác và tối ưu mà chúng ta sẽ theo đuổi.  Hãy bám sát tài liệu này để đảm bảo chúng ta "dạy" AI trả về đúng ý định.  Chúc team làm việc hiệu quả\!