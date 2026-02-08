import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateDetails: (data) => API.put('/auth/update-details', data),
  updatePassword: (data) => API.put('/auth/update-password', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
};

// Income endpoints
export const incomeAPI = {
  getAll: () => API.get('/income'),
  getOne: (id) => API.get(`/income/${id}`),
  create: (data) => API.post('/income', data),
  update: (id, data) => API.put(`/income/${id}`, data),
  delete: (id) => API.delete(`/income/${id}`),
  getNextPayday: () => API.get('/income/next-payday'),
};

// Expense endpoints
export const expenseAPI = {
  getAll: (params) => API.get('/expenses', { params }),
  getOne: (id) => API.get(`/expenses/${id}`),
  create: (data) => API.post('/expenses', data),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
  getDaily: (date) => API.get(`/expenses/daily/${date}`),
  getMonthly: (year, month) => API.get(`/expenses/monthly/${year}/${month}`),
  getStats: () => API.get('/expenses/stats'),
};

export default API;
