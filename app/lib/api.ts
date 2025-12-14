// app/lib/api.ts
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    if (config.url === "/auth/login" || config.url === "/auth/register") {
      return config;
    }
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getTopRatedRestaurants = async (limit: number = 10) => {
  try {
    const res = await api.get(
      `/restaurants?page=1&limit=${limit}&sortBy=diemTrungBinh&order=desc`
    );
    return res.data?.data || [];
  } catch (error) {
    console.error("Error fetching top restaurants:", error);
    return [];
  }
};

// [MỚI] Hàm upload ảnh
export const searchRestaurantsByImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post("/restaurants/search-by-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error searching by image:", error);
    return null;
  }
};

// --- [CẬP NHẬT QUAN TRỌNG] HÀM NÀY ĐÃ ĐƯỢC THÊM THAM SỐ CITY ---
export const getAllRestaurants = async (
  page: number = 1,
  limit: number = 32,
  sortBy: string = "diemTrungBinh",
  order: string = "desc",
  rating: string = "all",
  openNow: string = "false",
  userLat: string = "",
  userLon: string = "",
  search: string = "",
  city: string = "" // 👈 [THÊM MỚI] Nhận tham số city
) => {
  try {
    // 👇 Thêm &city=${city} vào cuối URL
    const res = await api.get(
      `/restaurants?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&rating=${rating}&openNow=${openNow}&userLat=${userLat}&userLon=${userLon}&search=${encodeURIComponent(
        search
      )}&city=${city}`
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching all restaurants:", error);
    return { data: [], totalPages: 0 };
  }
};
// -------------------------------------------------------------

export const getTopSpaceRestaurants = async (limit: number = 10) => {
  try {
    const response = await api.get(
      `/restaurants?limit=${limit}&sortBy=diemKhongGian&order=desc`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top space restaurants:", error);
    return [];
  }
};

export const getTopQualityRestaurants = async (limit: number = 10) => {
  try {
    const response = await api.get(
      `/restaurants?limit=${limit}&sortBy=diemChatLuong&order=desc`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top quality restaurants:", error);
    return [];
  }
};

export const getTopServiceRestaurants = async (limit: number = 10) => {
  try {
    const response = await api.get(
      `/restaurants?limit=${limit}&sortBy=diemPhucVu&order=desc`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top service restaurants:", error);
    return [];
  }
};

export const getTopPriceRestaurants = async (limit: number = 10) => {
  try {
    const response = await api.get(
      `/restaurants?limit=${limit}&sortBy=diemGiaCa&order=desc`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top price restaurants:", error);
    return [];
  }
};

export const getTopLocationRestaurants = async (limit: number = 10) => {
  try {
    const response = await api.get(
      `/restaurants?limit=${limit}&sortBy=diemViTri&order=desc`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top location restaurants:", error);
    return [];
  }
};

export async function getRestaurantById(id: string) {
  const res = await fetch(`${API_URL}/restaurants/${id}`, {
    cache: "no-store", // Đảm bảo luôn lấy dữ liệu mới nhất
  });
  if (!res.ok) {
    throw new Error("Failed to fetch restaurant");
  }
  return res.json();
}

// [MỚI] Hàm lấy review theo URL gốc của nhà hàng
export async function getReviewsByUrl(urlGoc: string) {
  // Cần encode URL vì nó chứa các ký tự đặc biệt (://, /)
  const encodedUrl = encodeURIComponent(urlGoc);
  const res = await fetch(`${API_URL}/reviews?url=${encodedUrl}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    // Nếu API chưa sẵn sàng hoặc lỗi, trả về mảng rỗng để không làm sập trang
    console.error("Failed to fetch reviews");
    return [];
  }
  return res.json();
}

export const createNewReview = async (reviewData: {
  tenQuan: string;
  urlGoc: string;
  diemReview: number;
  noiDung: string;
}) => {
  try {
    const res = await api.post("/reviews", reviewData);
    return res.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

export const chatWithBot = async (message: string, userLat: string = "", userLon: string = "") => {
  try {
    const res = await api.post("/restaurants/chat", {
      message,
      userLat,
      userLon
    });
    return res.data; // { reply_text: string, data: [] }
  } catch (error) {
    console.error("Error chatting with bot:", error);
    return null;
  }
};
export default api;