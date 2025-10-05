import axios from 'axios';
import { API_BASE_URL } from '../constants/apiConstants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  validateStatus: (status) => status < 500 // Không throw error cho 4xx, chỉ throw cho 5xx
});

apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('access_token') : null;

    console.log("🟢 Interceptor chạy!"); // Kiểm tra xem interceptor có được kích hoạt không
    console.log("Token lấy từ localStorage:", token); // Xem token có tồn tại không
    console.log("Trước khi thêm header:", config.headers); // Xem header trước khi thêm

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Sau khi thêm header Authorization:", config.headers);
    }

    return config;
  },
  (error) => {
    console.error("❌ Lỗi trong request interceptor:", error);
    return Promise.reject(error);
  }
);





