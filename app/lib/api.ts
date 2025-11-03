// app/lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Đảm bảo đây là port Backend (BE)
});

// Sử dụng "interceptors" để đính kèm token
api.interceptors.request.use(
  (config) => {
    
    // --- BỔ SUNG LOGIC NÀY ---
    // Nếu là route 'login' hoặc 'register' thì KHÔNG đính kèm token
    if (config.url === '/auth/login' || config.url === '/auth/register') {
      return config; // Gửi request đi mà không có header
    }
    // --- KẾT THÚC BỔ SUNG ---

    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;