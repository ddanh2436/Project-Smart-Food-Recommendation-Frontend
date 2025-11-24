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

// [CẬP NHẬT] Thêm openNow
export const getAllRestaurants = async (
  page: number = 1, 
  limit: number = 32,
  sortBy: string = 'diemTrungBinh',
  order: string = 'desc',
  rating: string = 'all',
  openNow: string = 'false',
  userLat: string = '', 
  userLon: string = ''
) => {
  try {
    const res = await api.get(`/restaurants?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&rating=${rating}&openNow=${openNow}&userLat=${userLat}&userLon=${userLon}`);
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

export default api;