import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

// Request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handling
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // Clear token and redirect if unauthorized
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        console.warn('Forbidden: You do not have access to this resource.');
      } else if (status === 404) {
        console.warn('Not found: The requested resource does not exist.');
      } else if (status >= 500) {
        console.error('Server error: Please try again later.');
      }
    } else if (error.request) {
      console.error('Network Error: Please check your internet connection.');
    }
    return Promise.reject(error);
  }
);

export default api;
