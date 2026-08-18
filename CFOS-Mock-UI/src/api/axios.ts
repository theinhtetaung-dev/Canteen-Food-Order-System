import axios from 'axios';

const BASE_URL = 'http://localhost:8081/api';

// Public client — no auth header (for login)
export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Private client — attaches JWT from localStorage automatically
export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cfos_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token expired or invalid — force logout
      localStorage.removeItem('cfos_token');
      localStorage.removeItem('cfos_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
