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






