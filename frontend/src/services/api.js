import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getQuote = (ticker) => api.get(`/api/quote/${ticker}`);
export const analyzeStock = (ticker, lang = 'zh') => api.get(`/api/analyze/${ticker}?lang=${lang}`);
export const getWatchlist = () => api.get('/api/watchlist');
export const addToWatchlist = (ticker) => api.post('/api/watchlist', { ticker });
export const removeFromWatchlist = (ticker) => api.delete(`/api/watchlist/${ticker}`);
export const getReports = () => api.get('/api/reports');
export const createCheckout = (productType) => api.post('/api/checkout', { product_type: productType });

export default api;
