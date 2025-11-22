// app/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001", // Đảm bảo đây là port Backend (BE)
});

// Sử dụng "interceptors" để đính kèm token
api.interceptors.request.use(
  (config) => {
    // --- BỔ SUNG LOGIC NÀY ---
    // Nếu là route 'login' hoặc 'register' thì KHÔNG đính kèm token
    if (config.url === "/auth/login" || config.url === "/auth/register") {
      return config; // Gửi request đi mà không có header
    }
    // --- KẾT THÚC BỔ SUNG ---

    // Lấy token từ localStorage
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getTopRatedRestaurants = async (limit: number = 6) => {
  try {
    // Gọi vào endpoint findAll của bạn, backend đã sort sẵn ở Bước 1
    const res = await api.get(`/restaurants?limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching top restaurants:", error);
    return [];
  }
};

export const getAllRestaurants = async () => {
  try {
    // Gọi API lấy tất cả (backend của bạn là /restaurants)
    const res = await api.get('/restaurants'); 
    return res.data;
  } catch (error) {
    console.error("Error fetching all restaurants:", error);
    return [];
  }
};

export const getRestaurantById = async (id: string) => {
  try {
    const res = await api.get(`/restaurants/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching restaurant detail:", error);
    return null;
  }
};

export default api;
