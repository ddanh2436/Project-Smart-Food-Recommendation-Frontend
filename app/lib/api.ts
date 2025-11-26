// app/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
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
    const res = await api.get(`/restaurants?page=1&limit=${limit}&sortBy=diemTrungBinh&order=desc`);
    return res.data?.data || []; 
  } catch (error) {
    console.error("Error fetching top restaurants:", error);
    return [];
  }
};

// [CẬP NHẬT QUAN TRỌNG] Thêm tham số search vào cuối cùng
export const getAllRestaurants = async (
  page: number = 1, 
  limit: number = 32,
  sortBy: string = 'diemTrungBinh',
  order: string = 'desc',
  rating: string = 'all',
  openNow: string = 'false',
  userLat: string = '', 
  userLon: string = '',
  search: string = '' // <--- Thêm tham số này để AI hoạt động
) => {
  try {
    const res = await api.get(`/restaurants?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&rating=${rating}&openNow=${openNow}&userLat=${userLat}&userLon=${userLon}&search=${encodeURIComponent(search)}`);
    return res.data; 
  } catch (error) {
    console.error("Error fetching all restaurants:", error);
    return { data: [], totalPages: 0 };
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

// Thêm hàm này vào file api.ts
export const getTopSpaceRestaurants = async (limit: number = 10) => {
  try {
    // Gọi API với tham số sortBy=diemKhongGian
    const response = await api.get(`/restaurants?limit=${limit}&sortBy=diemKhongGian&order=desc`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top space restaurants:", error);
    return [];
  }
};

// Thêm vào cuối file
export const getTopQualityRestaurants = async (limit: number = 10) => {
  try {
    // sortBy=diemChatLuong: Sắp xếp theo điểm chất lượng món ăn
    const response = await api.get(`/restaurants?limit=${limit}&sortBy=diemChatLuong&order=desc`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top quality restaurants:", error);
    return [];
  }
};

// Thêm vào cuối file
export const getTopServiceRestaurants = async (limit: number = 10) => {
  try {
    // sortBy=diemPhucVu: Sắp xếp theo điểm phục vụ
    const response = await api.get(`/restaurants?limit=${limit}&sortBy=diemPhucVu&order=desc`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top service restaurants:", error);
    return [];
  }
};

// Thêm vào cuối file
export const getTopPriceRestaurants = async (limit: number = 10) => {
  try {
    // sortBy=diemGiaCa: Sắp xếp theo điểm giá cả hợp lý
    const response = await api.get(`/restaurants?limit=${limit}&sortBy=diemGiaCa&order=desc`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top price restaurants:", error);
    return [];
  }
};

// Thêm vào cuối file
export const getTopLocationRestaurants = async (limit: number = 10) => {
  try {
    // sortBy=diemViTri: Sắp xếp theo điểm vị trí
    const response = await api.get(`/restaurants?limit=${limit}&sortBy=diemViTri&order=desc`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching top location restaurants:", error);
    return [];
  }
};
export default api;