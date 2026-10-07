import axios from 'axios';

export const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://sunny-vitality-production-7feb.up.railway.app'
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: BASE_URL,
});

// Otomatis pasang Bearer Token jika user sudah login
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor respon jika token kadaluwarsa (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Don't auto-redirect if already on login or register page
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (imageUrl?: string | null): string => {
  if (!imageUrl) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  let cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  if (!cleanPath.startsWith('/uploads/')) {
    cleanPath = `/uploads${cleanPath}`;
  }
  return `${BASE_URL}${cleanPath}`;
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default api;
