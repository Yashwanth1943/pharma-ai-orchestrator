import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

// Map to store pending requests for cancellation and duplicate prevention
const pendingRequests = new Map();

const generateRequestKey = (config) => {
  return `${config.method}:${config.url}`;
};

// Request interceptor to add the auth token and prevent duplicates
api.interceptors.request.use(
  (config) => {
    // Prevent duplicate requests
    const requestKey = generateRequestKey(config);
    if (pendingRequests.has(requestKey)) {
      const controller = pendingRequests.get(requestKey);
      controller.abort(); // Cancel previous identical request
    }
    
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(requestKey, controller);

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
    const requestKey = generateRequestKey(response.config);
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error); // Silently reject cancelled requests
    }

    if (error.config) {
      const requestKey = generateRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

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
