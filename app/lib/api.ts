// app/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // URL backend Nest.js
});

// --- THÊM PHẦN NÀY ---
// Sử dụng "interceptors" để đính kèm token vào MỌI request
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken');
    
    // Nếu có token, đính kèm vào header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Xử lý lỗi
    return Promise.reject(error);
  }
);
// --- KẾT THÚC PHẦN THÊM ---

export default api;